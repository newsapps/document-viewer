// articles

DV.model.Articles = function(viewer, options) {
  this.viewer = viewer;
  this.initialized = false;

  // "Cache" page data after loading
  this.loadedPages = {};
  // "Cache" article data after loading
  this.loadedArticles = {};

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

  articleUrl: function(articleId) {
    var url = this.options.article.url;

    url = url.replace(/\{\s*?id\s*?\}/, this.viewer.api.getId());
    url = url.replace(/\{\s*?article\s*?\}/, articleId);

    return url;
  },

  render: function(data, page) {
    var pageElement  = $(this.viewer.elements.pages[(page - 1) % 3]);
    var currentWidth = this.viewer.models.document.zoomLevel;
    var scaleFactor  = currentWidth / data.size.width;
    var articles = this.aggregateArticleRegions(data);

    // Since DV reuses page elements, check to make sure articles from
    // other pages are not polluting the page we're working on
    $(pageElement)
      .find('.DV-article-highlight')
      .remove();

    _.each(articles, _.bind(function(v, i) {
      if ( typeof this.loadedArticles[v.id] == 'undefined' ) {
        $.getJSON(this.articleUrl(v.id),
          _.bind(function(data) {
            this.loadedArticles[v.id] = data;

            if ( !data )
              data = { title: 'No title', body: 'No text' };

            var modal = $(JST.articleModal({
              idx: i,
              id: v.id,
              page: page,
              title: data.title,
              body: data.body
            }));
            $('body').append(modal);

            this.events.trigger('articleJsonLoaded', v.id);
          }, this));
      } else
        this.events.trigger('articleJsonLoaded', v.id);

      var highlighter = $(JST.articleHighlight({
        idx: i, id: v.id, page: page
      }));

      var width = Math.round((v.x2 - v.x1) * scaleFactor);
      var height = Math.round((v.y2 - v.y1) * scaleFactor);

      var left = Math.round(v.x1 * scaleFactor);
      var top = Math.round(v.y1 * scaleFactor);

      highlighter.css({
        display: 'block',
        width: (width - 2) + 'px',
        height: (height - 2) + 'px',
        position: 'absolute',
        top: top + 'px',
        left: left + 'px',
        border: '1px solid transparent',
        'z-index': 1000
      });

      pageElement.append(highlighter);

      this.bindModalOpener(v.id, page);

    }, this));

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
        y2: max_y.y2
      });
    });

    return articles;
  },

  getData: function() {
    var currentPage = this.viewer.api.currentPage();

    // Get data for two pages at a time
    this.drawArticlesForPage(currentPage);
    this.drawArticlesForPage(currentPage + 1);
  },

  drawArticlesForPage: function(page) {
    if ( typeof this.loadedPages[page] !== 'undefined' )
        return this.render(this.loadedPages[page], page);

    $.getJSON(this.pageUrl(page), _.bind(function(data) {
      this.loadedPages[page] = data;
      this.render(data, page);
    }, this));
  },

  showText: function(articleId) {
    if ( $('#modal-' + articleId).length === 0 )
      return false;

    $('#modal-' + articleId).modal('show');
  },

  bindModalOpener: function(id, page) {
    $('#modal-opener-' + id + '-page-' + page).on('click', _.bind(function() {
      if (window.location.hash == '#page/' + page + '/article/' + id)
        this.showText(id);
      else
        window.location.hash = '#page/' + page + '/article/' + id;

      return false;
    }, this));
  },

  init: function() {
    this.viewer.api.onPageChange(_.bind(this.getData, this));
    this.initialized = true;
  }

};
