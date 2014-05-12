DV.model.Document = function(viewer){
  this.viewer                    = viewer;

  this.currentPageIndex          = 0;
  this.offsets                   = [];
  this.baseHeightsPortion        = [];
  this.baseHeightsPortionOffsets = [];
  this.paddedOffsets             = [];
  this.originalPageText          = {};
  this.totalDocumentHeight       = 0;
  this.totalPages                = 0;
  this.additionalPaddingOnPage   = 0;
  this.ZOOM_RANGES               = [400, 700, 850, 1000, 1200, 1400, 1600, 1800, 2200, 2600];

  var data                       = this.viewer.schema.data;

  this.state                     = data.state;
  this.baseImageURL              = data.baseImageURL;
  this.canonicalURL              = data.canonicalURL;
  this.additionalPaddingOnPage   = data.additionalPaddingOnPage;
  this.pageWidthPadding          = data.pageWidthPadding;
  this.totalPages                = data.totalPages;
  
  this.onPageChangeCallbacks = [];
  this.onComputeOffsetsCallbacks = [];

  var zoom = this.zoomLevel = this.viewer.options.zoom || data.zoomLevel;
  if (zoom == 'auto') this.zoomLevel = data.zoomLevel;

  // The zoom level cannot go over the maximum image width.
  var maxZoom = _.last(this.ZOOM_RANGES);
  if (this.zoomLevel > maxZoom) this.zoomLevel = maxZoom;
};

DV.model.Document.prototype = {

  setPageIndex : function(index) {
    if (this.currentPageIndex !== index)
      this.viewer.elements.sets.find('.DV-page').css('background-image', 'none');

    this.currentPageIndex = index;
    this.viewer.elements.currentPage.text(this.currentPage());
    this.viewer.helpers.setActiveChapter(this.viewer.models.chapters.getChapterId(index));
    _.each(this.onPageChangeCallbacks, function(c) { c(); });
    return index;
  },
  currentPage : function() {
    return this.currentPageIndex + 1;
  },
  currentIndex : function() {
    return this.currentPageIndex;
  },
  nextPage : function() {
    var nextIndex = this.currentIndex() + 1;
    if (nextIndex >= this.totalPages) return this.currentIndex();
    return this.setPageIndex(nextIndex);
  },
  previousPage : function() {
    var previousIndex = this.currentIndex() - 1;
    if (previousIndex < 0) return this.currentIndex();
    return this.setPageIndex(previousIndex);
  },
  zoom: function(zoomLevel,force){
    if(this.zoomLevel != zoomLevel || force === true){
      this.zoomLevel   = zoomLevel;
      this.viewer.models.pages.resize(this.zoomLevel);
      this.viewer.models.annotations.renderAnnotations();
      this.computeOffsets();

      // Make sure the zoom button states are updated
      // We should grey out the buttons if we're zoomed in or out all the way
      if (this.ZOOM_RANGES.indexOf(this.zoomLevel) == 0) {
        // zoomed out all the way, hide zoom out button
        this.viewer.$('.DV-zoomBox .dec').attr('disabled', true);
        this.viewer.$('.DV-zoomBox .inc').attr('disabled', false);
      } else if (this.ZOOM_RANGES.indexOf(this.zoomLevel) >= this.ZOOM_RANGES.length - 1) {
        // zoomed in all the way, hide zoom in button
        this.viewer.$('.DV-zoomBox .inc').attr('disabled', true);
        this.viewer.$('.DV-zoomBox .dec').attr('disabled', false);
      } else {
        // make sure zoom buttons are all active
        this.viewer.$('.DV-zoomBox .inc').attr('disabled', false);
        this.viewer.$('.DV-zoomBox .dec').attr('disabled', false);
      }
    }
  },

  computeOffsets: function() {
    var annotationModel  = this.viewer.models.annotations;
    var totalDocHeight   = 0;
    var adjustedOffset   = 0;
    var len              = this.totalPages;
    var diff             = 0;
    var scrollPos        = this.viewer.elements.window[0].scrollTop;
    var adHeight         = 250;
    var sectionStart     = false;

    for(var i = 0; i < len; i++) {
      if(annotationModel.offsetsAdjustments[i]){
        adjustedOffset   = annotationModel.offsetsAdjustments[i];
      }

      // Adjust the offset if ads are enabled
      if ( this.viewer.options.ads ) {
        if ( i > 0 && i % this.viewer.options.ads.interval === 0 )
          adjustedOffset += adHeight;
      }

      // Adjust the offset if sections are specified
      if (this.viewer.schema.data.sections.length > 0) {
        if (i > 0 && this.viewer.models.pages.isSectionStart(i - 1))
          adjustedOffset += $('.DV-edition-section-label').outerHeight();
      }

      var pageHeight     = this.viewer.models.pages.getPageHeight(i);
      var previousOffset = this.offsets[i] || 0;
      var h              = this.offsets[i] = adjustedOffset + totalDocHeight;

      if((previousOffset !== h) && (h < scrollPos)) {
        var delta = h - previousOffset - diff;
        scrollPos += delta;
        diff += delta;
      }

      this.baseHeightsPortion[i]        = Math.round((pageHeight + this.additionalPaddingOnPage) / 3);
      this.baseHeightsPortionOffsets[i] = (i == 0) ? 0 : h - this.baseHeightsPortion[i];

      totalDocHeight                    += (pageHeight + this.additionalPaddingOnPage);
    }

    // Add the sum of the page note heights to the total document height.
    totalDocHeight += adjustedOffset;

    // artificially set the scrollbar height
    if(totalDocHeight != this.totalDocumentHeight){
      diff = (this.totalDocumentHeight != 0) ? diff : totalDocHeight - this.totalDocumentHeight;
      this.viewer.helpers.setDocHeight(totalDocHeight,diff);
      this.totalDocumentHeight = totalDocHeight;
    }


    _.each(this.onComputeOffsetsCallbacks, function(c) { c(); });
  },

  getOffset: function(_index){
    return this.offsets[_index];
  },

  resetRemovedPages: function() {
    this.viewer.models.removedPages = {};
  },

  addPageToRemovedPages: function(page) {
    this.viewer.models.removedPages[page] = true;
  },

  removePageFromRemovedPages: function(page) {
    this.viewer.models.removedPages[page] = false;
  },

  redrawPages: function() {
    _.each(this.viewer.pageSet.pages, function(page) {
      page.drawRemoveOverlay();
    });
    if (this.viewer.thumbnails) {
      this.viewer.thumbnails.render();
    }
  },

  redrawReorderedPages: function() {
    if (this.viewer.thumbnails) {
      this.viewer.thumbnails.render();
    }
  }

};
