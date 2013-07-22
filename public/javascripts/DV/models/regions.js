// regions

DV.model.Regions = function(viewer, options) {
  this.viewer = viewer;
  this.viewer.regions = this;

  // "Cache" page data after loading
  this.loadedPages = {};
  // "Cache" article data after loading
  this.loadedArticles = {};

  this.events = _.extend({
    pageRegionsLoaded: function() {
      return this.trigger('pageRegionsLoaded', arguments);
    },
    regionJsonLoaded: function() {
      return this.trigger('regionJsonLoaded', arguments);
    }
  }, Backbone.Events);

  if (!viewer.options.regions)
    this.options = null;
  else {
    this.options = viewer.options.regions;
    this.init();
  }
};

DV.model.Regions.prototype = {

  url: function() {
    var url = this.options.page.url;

    url = url.replace(/\{\s*?id\s*?\}/, this.viewer.api.getId());
    url = url.replace(/\{\s*?page\s*?\}/, this.viewer.api.currentPage());

    return url;
  },

  render: function(data) {
    $('.DV-region-modal').remove();
    $('.DV-region-highlight').remove();

    var currentPage = this.viewer.api.currentPage();
    var currentWidth = this.viewer.models.document.zoomLevel;
    var scaleFactor = currentWidth / data.size.width;

    // Get min and max coords to draw an aggregate shape for the region
    // TODO: Refactor this to draw an svg path so we're not stuck with
    // rectangles only
    var regions = [];
    var regionsGrouped = _.groupBy(data.regions, function(x) { return x.id; });
    _.each(regionsGrouped, function(v, i) {

      var min_x = _.min(v, function(x) { return x.x1; });
      var max_x = _.max(v, function(x) { return x.x2; });
      var min_y = _.min(v, function(x) { return x.y1; });
      var max_y = _.max(v, function(x) { return x.y2; });

      regions.push({
        id: i,
        x1: min_x.x1,
        y1: min_y.y1,
        x2: max_x.x2,
        y2: max_y.y2
      });
    });

    _.each(regions, _.bind(function(v, i) {
      if ( typeof this.loadedArticles['article-' + v.id] == 'undefined' ) {
        // TODO: Factor this stuff out into a different view and/or model,
        // make article json url configurable option.
        $.getJSON('issues/' + this.viewer.api.getId() + '/' + v.id+ '.json',
          _.bind(function(data) {
            this.loadedArticles['article-' + v.id] = data;

            if ( !data )
              data = { title: 'No title', body: 'No text' };

            var modal = $(JST.regionModal({
              idx: i,
              id: v.id,
              currentPage: currentPage,
              title: data.title,
              body: data.body
            }));
            $('body').append(modal);

            this.events.trigger('regionJsonLoaded', v.id);
          }, this)
        );
      } else {
        var _data = this.loadedArticles['article-' + v.id];

        if ( !_data )
          _data = { title: 'No title', body: 'No text' };

        var modal = $(JST.regionModal({
          idx: i,
          id: v.id,
          currentPage: currentPage,
          title: _data.title,
          body: _data.body
        }));
        $('body').append(modal);

        this.events.trigger('regionJsonLoaded', v.id);
      }

      var highlighter = $(JST.regionHighlight({
        idx: i, id: v.id, currentPage: currentPage
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

      $(this.viewer.elements.pages[(currentPage - 1) % 3]).append(highlighter);

      this.bindModalOpener(v.id);

    }, this));

    this.events.pageRegionsLoaded(this.viewer);
  },

  getData: function() {
    var currentPage = this.viewer.api.currentPage();
    return this.getDataForPage(currentPage);
  },

  getDataForPage: function(page) {
    if ( typeof this.loadedPages['page-' + page] !== 'undefined' )
      return this.render(this.loadedPages['page-' + page]);

    $.getJSON(this.url(), _.bind(function(data) {
      this.loadedPages['page-' + page] = data;
      this.render(data);
    }, this));
  },

  showText: function(articleId) {
    if ( $('#modal-' + articleId).length === 0 )
        return false;

    $('#modal-' + articleId).modal('show');
  },

  bindModalOpener: function(id) {
    var currentPage = this.viewer.api.currentPage();

    $('#modal-opener-' + id).on('click', _.bind(function() {
      if (window.location.hash == '#page/' + currentPage + '/region/' + id)
        this.showText(id);
      else
        window.location.hash = '#page/' + currentPage + '/region/' + id;

      return false;
    }, this));
  },

  init: function() {
    this.viewer.api.onPageChange(
      _.bind(this.getData, this)
    );
  }
};
