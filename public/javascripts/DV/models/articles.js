// articles

DV.model.Articles = function(viewer, options) {
  this.viewer = viewer;

  // "Cache" page data after loading
  this.loadedPages = {};
  this.pendingPages = {};

  this.events = _.extend({
    pageArticlesLoaded: function() {
      return this.trigger('pageArticlesLoaded', arguments);
    },
    articleJsonLoaded: function() {
      return this.trigger('articleJsonLoaded', arguments);
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
    var scaleFactor  = currentWidth / data.size.width;
    var articles = data.articles;

    var canvas = pageElement.data('canvas');
    var elementPageNum = pageElement.data('page-num');
    if (!canvas) {
      canvas = SVG(pageElement[0]);
      canvas
        .size('100%', '100%')
        .style("z-index", 99999999999)
        .attr('class', 'PAGECANVASBAM');
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

      var first_region = article.regions[0];

      // Build the modal
      var modal = $(JST.articleModal({
        idx: i,
        id: article.id,
        slug: article.slug,
        page: page,
        title: article.title,
        body: body,
        legible: article.legible,
        image: this.articleImageUrl(page, article.slug, 'large')
      }));

      if (this.viewer.options.ads) {
        modal.on('shown', function() {
          modal.find('.advert').css({
            float: 'right',
            margin: '0 0 10px 10px'
          });
          jQuery(modal.find('.advert')[0]).ad();
        });
      }

      // Append modals to body to work around z-index issue
      if ($('#' + modal.attr('id')).length === 0)
        $('body').append(modal);

      // Build the highlighter region
      var highlighter = canvas.group();
      highlighter.attr('class', 'article-' + article.slug);
      _.each(article.regions, _.bind(function(x) {
        var v = {
          x1: (x.x1 * scaleFactor),
          x2: (x.x2 * scaleFactor),
          y1: (x.y1 * scaleFactor),
          y2: (x.y2 * scaleFactor)
        };
        highlighter.polyline([
          [v.x1, v.y1],
          [v.x2, v.y1],
          [v.x2, v.y2],
          [v.x1, v.y2]
        ]).fill({
          color: 'orange',
          opacity: 0.5
        });
        if (article.slug == this.activeArticleSlug)
          highlighter.opacity(0.5);
        else
          highlighter.opacity(0);
      }, this));

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

      highlighter.on('click', _.bind(function(ev) {
        this.zoomToArticle(page, article.slug);
        return false;
      }, this));

      this.events.trigger('articleJsonLoaded', article.slug);

    }, this));

    this.events.pageArticlesLoaded(this.viewer);
  },

  zoomToArticle: function(page, slug) {
    var pageData = this.loadedPages[page],
        pageElement = $(this.getPageElement(page)),
        zoomRanges = this.viewer.models.document.ZOOM_RANGES,
        currentZoomLevel = this.viewer.models.pages.zoomLevel,
        pages = this.viewer.elements.window,
        scaleFactor;

    var article = _.find(pageData.articles, function(obj) { return obj.slug == slug; });

    var find_min_x = function(v) { return v.x1; },
        find_min_y = function(v) { return v.y1; },
        find_max_x = function(v) { return v.x2; },
        find_max_y = function(v) { return v.y2; },
        min_x, min_y, max_x, max_y, width, height;

    for (var i = zoomRanges.length; i-- > 0; ) {
      scaleFactor = zoomRanges[i] / pageData.size.width;

      min_x = _.min(article.regions, find_min_x);
      min_y = _.min(article.regions, find_min_y);
      max_x = _.max(article.regions, find_max_x);
      max_y = _.max(article.regions, find_min_y);

      width = (max_x.x2 - min_x.x1) * scaleFactor;
      height = (max_y.y2 - min_y.y1) * scaleFactor;

      if (width <= pages.width()) {
        newZoomLevel = zoomRanges[i];
        break;
      }
    }

    this.viewer.pageSet.zoom({ zoomLevel: newZoomLevel });

    console.log(pageElement);
    var leftPadding = ($(window).width() - width) / 2;
    var newLeftScroll = (min_x.x1 * scaleFactor) - leftPadding;
    var newTopScroll  = (min_y.y1 * scaleFactor) + $(pageElement).parent().position().top;

    if (newLeftScroll < 0)
      newLeftScroll = 0;

    pages.scrollLeft(newLeftScroll);
    pages.scrollTop(newTopScroll);

    this.markRegionActive(article.slug);

    if (article.legible)
      this.showOptions(article.slug);

    this.viewer.history.navigate(
      'page/' + page + '/article/' + article.slug, {trigger: false});

    return false;
  },

  showOptions: function(articleSlug) {
    $('.DV-options').remove();

    var options = $(JST.articleOptions({}));

    options.find('.DV-read-full-text').click(_.bind(function() {
      this.showText(articleSlug);
      return false;
    }, this));

    this.viewer.elements.footer.before(options);
    options.fadeIn();
  },

  getData: function() {
    var currentPage = this.viewer.api.currentPage();

    // Get data for two pages at a time
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
          delete(this.pendingPages[key]);
        }
      }, this));
    }

    if (_.keys(this.pendingPages).indexOf(String(page)) == -1) {
      this.pendingPages[page] = $.getJSON(this.pageUrl(page),
        _.bind(function(data) {
          this.loadedPages[page] = data;
          this.render(data, page);
          delete(this.pendingPages[page]);
        }, this));
    }
  },

  showText: function(articleSlug) {
    $('.DV-options').remove();

    if ($('#modal-' + articleSlug).length === 0)
      return false;

    $('#modal-' + articleSlug).modal('show');
    this.markRegionActive(articleSlug);
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

  init: function() {
    this.viewer.api.onPageChange(_.bind(this.getData, this));
  }

};
