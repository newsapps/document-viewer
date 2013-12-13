// articles

DV.model.Articles = function(viewer, options) {
  this.viewer = viewer;

  // "Cache" page data after loading
  this.loadedPages = {};

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

    url = url.replace(/\{\s*?id\s*?\}/, this.viewer.api.getId());
    url = url.replace(/\{\s*?page\s*?\}/, page);

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
    var articles = this.aggregateArticleRegions(data);

    var canvas = pageElement.data('canvas');
    var elementPageNum = pageElement.data('page-num');
    if (!canvas) {
      canvas = SVG(pageElement[0]);
      canvas
        .size('100%', '100%')
        .style("z-index", 99999999999);
      pageElement.data('canvas', canvas);
    }

    if (page != elementPageNum) {
      pageElement.data('page-num', page);
      canvas.clear();
      _.each(articles, _.bind(function(article, i) {
        // make sure the page number hasn't changed on us
        if (page != pageElement.data('page-num')) {
          return;
        }

        var data = _.find(this.loadedPages[page].regions, function(r) {
          if (r.id == article.id) return true;
        }).data;

        // If the article has no body text or title, don't draw a region
        if (!data)
          return false;

        var body = data.body;
        if (this.viewer.options.ads)
          body = '<div class="advert" data-ad-type="cube"></div>' + body;

        // Build the modal
        var modal = $(JST.articleModal({
          idx: i,
          id: article.id,
          page: page,
          title: data.title,
          body: body
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
        highlighter.attr('class', 'article-' + article.id);
        _.each(article.regions, _.bind(function(x) {
          var v = {
            x1: 5*Math.ceil((x.x1 * scaleFactor)/5),
            x2: 5*Math.ceil((x.x2 * scaleFactor)/5),
            y1: 5*Math.ceil((x.y1 * scaleFactor)/5),
            y2: 5*Math.ceil((x.y2 * scaleFactor)/5)
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
          if (article.id == this.activeArticleId)
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
          var id = article.id;

          if (this.viewer.history.getFragment() == 'page/' + page + '/article/' + id)
            this.showText(id);
          else {
            this.markRegionActive(id);
            this.viewer.history.navigate(
              'page/' + page + '/article/' + id, {trigger: false});
            this.showText(id);
          }

          return false;
        }, this));

        this.events.trigger('articleJsonLoaded', article.id);

      }, this));
    }

    this.events.pageArticlesLoaded(this.viewer);
  },

  aggregateArticleRegions: function(data) {
    // Get min and max coords to draw an aggregate shape for the article
    // TODO: Refactor this to draw an svg path so we're not stuck with
    // rectangles only
    var articles = [];
    var articlesGrouped = _.groupBy(data.regions, function(x) { return x.id; });
    _.each(articlesGrouped, function(v, i) {

      var min_x = _.min(v, function(x) { return x.x1; });
      var max_x = _.max(v, function(x) { return x.x2; });
      var min_y = _.min(v, function(x) { return x.y1; });
      var max_y = _.max(v, function(x) { return x.y2; });

      articles.push({
        id: i,
        x1: min_x.x1,
        y1: min_y.y1,
        x2: max_x.x2,
        y2: max_y.y2,
        regions: v
      });
    });

    return articles;
  },

  getData: function() {
    var currentPage = this.viewer.api.currentPage();

    // Get data for two pages at a time
    if ( !isNaN(currentPage) )
      this.drawArticlesForPage(currentPage);
    //this.drawArticlesForPage(currentPage + 1);
  },

  drawArticlesForPage: function(page) {
    if (typeof this.loadedPages[page] !== 'undefined')
        return this.render(this.loadedPages[page], page);

    $.getJSON(this.pageUrl(page), _.bind(function(data) {
      this.loadedPages[page] = data;
      this.render(data, page);
    }, this));
  },

  showText: function(articleId) {
    if ($('#modal-' + articleId).length === 0)
      return false;

    $('#modal-' + articleId).modal('show');
    this.markRegionActive(articleId);
  },

  markRegionActive: function(id) {
    // Hide currently active article regions
    $('.article-' + this.activeArticleId).each(function() {
      this.instance.opacity(0);
    });

    // New active article
    this.activeArticleId = id;
    $('.article-' + this.activeArticleId).each(function() {
      this.instance.opacity(0.5);
    });
  },

  init: function() {
    this.viewer.api.onPageChange(_.bind(this.getData, this));
  }

};
