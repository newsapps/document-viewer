// regions

DV.model.Regions = function(viewer, options) {
  this.options = options;
  this.viewer = viewer;
  // "Cache" page data after loading
  this.loadedPages = {};
  // "Cache" article data after loading
  this.loadedArticles = {};
  this.init();
};

DV.model.Regions.prototype = {

  url: function() {
    var url = this.options.page.url;

    url = url.replace(/\{\s*?id\s*?\}/, this.viewer.api.getId());
    url = url.replace(/\{\s*?page\s*?\}/, this.viewer.api.currentPage());

    return url;
  },

  render: function() {
    $('.DV-region-modal').remove();
    $('.DV-region-highlight').remove();

    var currentPage = this.viewer.api.currentPage();
    var currentWidth = this.viewer.models.document.zoomLevel;
    var elements = this.viewer.elements;
    var data = this.loadedPages['page-' + currentPage];

    if ( typeof data == 'undefined' )
        return false;

    var scaleFactor = currentWidth / data.size.width;

    _.each(data.regions, _.bind(function(v, i) {
      var highlighter = $(JST.regionHighlight({
        idx: i, id: v.id, currentPage: currentPage
      }));

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
      }

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

      $(elements.pages[(currentPage - 1) % 3]).append(highlighter);

    }, this));
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

  init: function() {
    this.viewer.api.onPageChange(
      _.bind(this.getData, this)
    );
  }
};
