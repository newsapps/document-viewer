// articles

DV.model.Articles = function(viewer, options) {
  this.viewer = viewer;

  // "Cache" page data after loading
  this.loadedPages = {};
  this.pendingPages = {};

  this.events = _.extend({
    pageArticlesLoaded: function(page) {
      return this.trigger('pageArticlesLoaded', page);
    }
  }, Backbone.Events);

  if (!viewer.options.articles)
    this.options = null;
  else {
    this.options = viewer.options.articles;
    this.init();
  }
};

DV.model.Articles.prototype = {

  pageUrl: function(page) {
    var url = this.options.page.url;

    url = url.replace(/\{\s*?page\s*?\}/, page);

    return url;
  },

  articleImageUrl: function(page, slug, size) {
    var url = this.options.image.url;

    url = url.replace(/\{\s*?page\s*?\}/, page);
    url = url.replace(/\{\s*?slug\s*?\}/, slug);
    url = url.replace(/\{\s*?size\s*?\}/, size);

    return url;
  },

  getPageElement: function(page) {
    if (typeof page == "undefined")
      page = this.viewer.api.currentPage();

    return this.viewer.elements.pages[(page - 1) % 3];
  },

  render: function(data, page) {
    var pageElement  = $(this.getPageElement(page));
    var currentWidth = this.viewer.models.document.zoomLevel;
    var scaleFactor  = 1; //currentWidth / data.size.width;
    var articles = data.articles;
    var isTouch = 'ontouchstart' in window;

    if (SVG.supported) {
      var canvas = pageElement.data('canvas');
      var elementPageNum = pageElement.data('page-num');

      // If we already have a canvas and it's already setup for this page
      // we don't have to draw anything
      if (canvas && elementPageNum == page)
        return;

      if (!canvas) {
        canvas = SVG(pageElement[0]);
        canvas
          .size('100%', '100%')
          .style("z-index", 99999999999)
          .attr('class', 'PAGECANVASBAM')
          .attr('viewBox', '0 0 ' + data.size.width + ' ' + data.size.height);
        pageElement.data('canvas', canvas);
      }

      pageElement.data('page-num', page);
      canvas.clear();
      _.each(articles, _.bind(function(article, i) {
        // make sure the page number hasn't changed on us
        if (page != pageElement.data('page-num')) {
          return;
        }

        var body = article.body;
        if (this.viewer.options.ads)
          body = '<div class="advert" data-ad-type="cube"></div>' + body;

        // Build the highlighter region
        var highlighter = canvas.group();

        highlighter.attr('class', 'article-' + article.slug);

        _.each(article.coords, function(coords) {
          var scaled_coords = [];
          _.each(coords, function(x) {
            scaled_coords.push([x[0] * scaleFactor, x[1] * scaleFactor]);
          })
          highlighter
            .polyline(scaled_coords)
            .fill({
              color: 'orange',
              opacity: 0.5
            });
        });

        if (article.slug == this.activeArticleSlug)
          highlighter.opacity(0.5);
        else
          highlighter.opacity(0);

        // Only setup mouse hover events if we're not a touch device
        if (!isTouch) {
          highlighter.on('mouseover', function() {
            highlighter.opacity(0.2 + highlighter.opacity());
          });

          highlighter.on('mouseout', function() {
            var newOpacity = highlighter.opacity() - 0.2;
            if (newOpacity < 0)
              highlighter.opacity(0);
            else
              highlighter.opacity(newOpacity);
          });
        }

        // here we'll decide which events to use for interaction: touch or mouse
        if (isTouch) {
          var down = 'touchstart',
              move = 'touchmove',
              up   = 'touchend';
        } else {
          var down = 'mousedown',
              move = 'mousemove',
              up   = 'mouseup';
        }

        var drag,
            clickTimeout = 0,
            clickCount = 0;
        highlighter
          .on(down, function() { drag = false; })
          .on(move, function() { drag = true; })
          .on(up, _.bind(function() {
            if (!drag) {
              if (clickCount > 0) {
                this.moveToArticle(page, article.slug, true);
                clearTimeout(clickTimeout);
              } else {
                this.activeArticle = article;
                this.markRegionActive(article.slug);
                this.showOptions(page, article.slug);
                this.triggerAnalytics(article.slug);
                this.viewer.history.navigate(
                  'page/' + article.start_page + '/article/' + article.slug, {trigger: false});
              }
              clickCount += 1;
              clickTimeout = setTimeout(function() {clickCount = 0;}, 500);
            }
          }, this));

      }, this));
    }

    this.events.pageArticlesLoaded(page);
  },

  triggerAnalytics: function(slug) {
      var title = this.viewer.models.articles.activeArticle.title,
          date = this.viewer.schema.document.date,
          value = title + ' (' + date + ')';
      if (this.viewer.options.google_analytics)
        ga('send', 'event', 'Article', 'View', value);

      if (this.viewer.options.omniture)
        console.log('@todo omniture article view event:', value);
  },

  moveToArticle: function(page, slug, zoom) {
    var pageData = this.loadedPages[page];

    if (typeof pageData == 'undefined') // Page data hasn't loaded yet
      return false;

    var pageElement = $(this.getPageElement(page)),
        zoomRanges = this.viewer.models.document.ZOOM_RANGES,
        currentZoomLevel = this.viewer.models.pages.zoomLevel,
        pages = this.viewer.elements.window,
        article = _.find(pageData.articles, function(obj) { return obj.slug == slug; }),
        find_min_x = function(v) { return v[0]; },
        find_min_y = function(v) { return v[1]; },
        find_max_x = function(v) { return v[0]; },
        find_max_y = function(v) { return v[1]; },
        flat_coords = _.flatten(article.coords, true),
        min_x = _.min(flat_coords, find_min_x),
        min_y = _.min(flat_coords, find_min_y),
        max_x = _.max(flat_coords, find_max_x),
        max_y = _.max(flat_coords, find_min_y),
        scaleFactor, width, height;

    this.activeArticle = article;
    this.triggerAnalytics(article.slug);

    if (zoom) {
      for (var i = zoomRanges.length; i-- > 0; ) {
        scaleFactor = zoomRanges[i] / pageData.size.width;

        width = (max_x[0] - min_x[0]) * scaleFactor;
        height = (max_y[1] - min_y[1]) * scaleFactor;

        if (width <= pages.width()) {
          newZoomLevel = zoomRanges[i];
          break;
        }
      }
      this.viewer.pageSet.zoom({ zoomLevel: newZoomLevel });
    } else {
      scaleFactor = currentZoomLevel / pageData.size.width;
      width = (max_x[0] - min_x[0]) * scaleFactor;
      height = (max_y[1] - min_y[1]) * scaleFactor;
    }

    var leftPadding = ($(window).width() - width) / 2;
    var newLeftScroll = (min_x[0] * scaleFactor) - leftPadding;
    var newTopScroll  = (min_y[1] * scaleFactor) + this.viewer.models.document.getOffset(page - 1);

    if (newLeftScroll < 0)
      newLeftScroll = 0;

    pages.scrollLeft(newLeftScroll);
    pages.scrollTop(newTopScroll);

    this.markRegionActive(article.slug);
    this.showOptions(page, article.slug);
    this.viewer.history.navigate(
      'page/' + article.start_page + '/article/' + article.slug, {trigger: false});

    return false;
  },

  showOptions: function(page, articleSlug) {
    this.cleanUp();

    var continuations,
        next = false,
        article = this.getArticle(page, articleSlug);

    if (article.continuations && article.continuations.length > 1) {
      continuations = article.continuations.sort();
      if (continuations[continuations.indexOf(Number(page)) + 1])
        next = continuations[continuations.indexOf(Number(page)) + 1];
      else
        next = continuations[0];
    }

    this.showArticleShareLinks(article);

    if (article.legible)
      this.viewer.$('.DV-read-article')
        .show()
        .click(_.bind(function() {
          this.savePosition();
          this.viewer.open('ViewArticleText', page, articleSlug);
        }, this));

    if (next) {
      this.viewer.$('.DV-jump-to-continuation')
        .css('display', 'inline-block')
        .click(_.bind(function() {
          this.cleanUp();
          this.viewer.helpers.jump(next - 1);
          this.pendingPages[next].done(_.bind(function() {
            this.markRegionActive(articleSlug);
            this.showOptions(next, articleSlug);
          }, this));
        }, this))
        .show();
    }
  },

  showArticleShareLinks: function(article) {
    var type;

    // setup share links
    this.viewer.$('.DV-shareTools').hide();
    this.viewer.$('#DV-selection-shareTools .dropdown-menu').empty();
    this.viewer.helpers.setupShareLinks(
      '#DV-selection-shareTools .dropdown-menu', 'article');

    if (article.type_rollup.match(/image/ig))
      type = 'image';
    else if (article.type_rollup.match(/article/ig))
      type = 'article';
    else if (article.type_rollup.match(/comic/ig))
      type = 'comic';
    else if (article.type_rollup.match(/advertisement/ig))
      type = 'advertisement';
    else
      type = 'content';

    this.viewer.$('#DV-selection-shareTools .content-type').text(type);
    this.viewer.$('#DV-selection-shareTools').css('display', 'inline-block');
  },

  getArticle: function(page, articleSlug) {
    return _.find(this.loadedPages[page].articles, function(x) {
      return x.slug === articleSlug;
    });
  },

  showBackToPaper: function(page, articleSlug) {
    this.cleanUp();

    var article = this.getArticle(page, articleSlug);

    this.viewer.$('.DV-back-to-search').hide();
    this.viewer.$('.DV-read-article').hide();

    // setup share links
    this.showArticleShareLinks(article);

    this.viewer
      .$('.DV-back-to-paper')
      .show()
      .click(_.bind(function(ev) {
        ev.preventDefault();
        this.cleanUp();
        this.viewer.open('ViewDocument');

        var width = Math.round(
          this.viewer.models.pages.baseWidth *
          this.viewer.models.pages.zoomFactor());

        this.viewer.elements.collection.css({
          width : width + this.viewer.models.pages.getPadding() });

        this.restorePosition();
        this.markRegionActive(articleSlug);
        this.showOptions(page, articleSlug);
      }, this));
  },

  getData: function() {
    var currentPage = this.viewer.api.currentPage();

    if ( !isNaN(currentPage) ) {
      this.drawArticlesForPage(currentPage);
      this.drawArticlesForPage(currentPage + 1);
    }
  },

  drawArticlesForPage: function(page) {
    if (typeof this.loadedPages[page] !== 'undefined')
        return this.render(this.loadedPages[page], page);

    if (_.keys(this.pendingPages).length > 0) {
      _.each(_.keys(this.pendingPages), _.bind(function(key) {
        var abortable = key != String(page) && key != String(page + 1) && key != String(page - 1);

        if (abortable) {
          this.pendingPages[key].abort();
        }
      }, this));
    }

    if (_.keys(this.pendingPages).indexOf(String(page)) == -1) {
      this.pendingPages[page] = $.getJSON(this.pageUrl(page),
        _.bind(function(data) {
          this.loadedPages[page] = data;
          this.render(data, page);
        }, this));
    }
  },

  markRegionActive: function(slug) {
    // Hide currently active article regions
    $('.article-' + this.activeArticleSlug).each(function() {
      this.instance.opacity(0);
    });

    // New active article
    this.activeArticleSlug = slug;
    $('.article-' + this.activeArticleSlug).each(function() {
      this.instance.opacity(0.5);
    });
  },

  cleanUp: function() {
    this.viewer.$('.DV-read-article')
      .hide()
      .off();
    this.viewer.$('.DV-shareTools').show();
    this.viewer.$('#DV-selection-shareTools').hide();
    this.viewer.$('.DV-back-to-paper')
      .hide()
      .off();
    this.viewer.$('.DV-jump-to-continuation')
      .hide()
      .off();
    this.viewer.$('.DV-back-to-search').show();
  },

  savePosition: function() {
    this.position = {
      top: $('.DV-pages').scrollTop(),
      left: $('.DV-pages').scrollLeft()
    };
  },

  restorePosition: function() {
    $('.DV-pages').scrollTop(this.position.top);
    $('.DV-pages').scrollLeft(this.position.left);
  },

  init: function() {
    var callback = _.bind(function(page) {
      var currentPage = this.viewer.pageSet.getCurrentPage(),
          el = page.el;

      if ($(currentPage.el).data().id == $(el).data().id) {
        this.getData();
        this.viewer.onPageLoadedCallbacks.splice(
          this.viewer.onPageLoadedCallbacks.indexOf(callback), 1);
      }

      this.viewer.api.onPageChange(_.bind(this.getData, this));
    }, this);

    this.viewer.api.onPageLoaded(callback);
  }
};
