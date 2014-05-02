// This manages events for different states activated through DV interface actions like clicks, mouseovers, etc.
DV.Schema.events = {
  // Change zoom level and causes a reflow and redraw of pages.
  zoom: function(level){
    var viewer = this.viewer;
    var continuation = function() {
      // when we zoom, we want to zoom in on the center of the viewport
      // We have to do some tricky stuff to make this look right
      var doc = viewer.models.document,
          win = viewer.elements.window,
          pages = viewer.models.pages,
          zoomPageIndex = doc.currentPageIndex,
          centerYPct = (
            (win.scrollTop() + (win.height() / 2) - doc.offsets[zoomPageIndex])
            / pages.getPageHeight(zoomPageIndex)),
          centerXPct = viewer.elements.collection.width() > win.width() ? (
            (win.scrollLeft() + (win.width() / 2) - doc.pageWidthPadding)
            / pages.width) : 0.5;

      viewer.pageSet.zoom({ zoomLevel: level });

      // set scroll position so content doesn't appear to jump around
      var scrollTop = (
            (centerYPct * pages.getPageHeight(zoomPageIndex))
            + doc.offsets[zoomPageIndex] - (win.height() / 2)),
          scrollLeft = (
            (centerXPct * pages.width)
            + doc.pageWidthPadding - (win.width() / 2));

      win.scrollTop(scrollTop);
      if (scrollLeft > 0) win.scrollLeft(scrollLeft);

      var ranges = viewer.models.document.ZOOM_RANGES;
      viewer.dragReporter.sensitivity = ranges[ranges.length-1] == level ? 1.5 : 1;
      viewer.notifyChangedState();
      return true;
    };
    viewer.confirmStateChange ? viewer.confirmStateChange(continuation) : continuation();
  },

  // Draw (or redraw) the visible pages on the screen.
  drawPages: function() {
    if (this.viewer.state != 'ViewDocument') return;
    var doc           = this.models.document;
    var win           = this.elements.window[0];
    var offsets       = doc.baseHeightsPortionOffsets;
    var scrollPos     = this.viewer.scrollPosition = win.scrollTop;
    var midpoint      = scrollPos + (this.viewer.$(win).height() / 3);
    var currentPage   = _.sortedIndex(offsets, scrollPos);
    var middlePage    = _.sortedIndex(offsets, midpoint);
    if (offsets[currentPage] == scrollPos) currentPage++ && middlePage++;
    var pageIds       = this.helpers.sortPages(middlePage - 1);
    var total         = doc.totalPages;
    if (doc.currentPage() != currentPage) doc.setPageIndex(currentPage - 1);
    this.drawPageAt(pageIds, middlePage - 1);
  },

  // Draw the page at the given index.
  drawPageAt : function(pageIds, index) {
    var first = index == 0;
    var last  = index == this.models.document.totalPages - 1;
    if (first) index += 1;
    var pages = [
      { label: pageIds[0], index: index - 1 },
      { label: pageIds[1], index: index },
      { label: pageIds[2], index: index + 1 }
    ];
    if (last) pages.pop();
    pages[first ? 0 : pages.length - 1].currentPage = true;
    this.viewer.pageSet.draw(pages);
  },

  check: function(){
    var viewer = this.viewer;
    if(viewer.busy === false){
      viewer.busy = true;
      for(var i = 0; i < this.viewer.observers.length; i++){
        this[viewer.observers[i]].call(this);
      }
      viewer.busy = false;
    }
  },

  loadText: function(pageIndex,afterLoad){

    pageIndex = (!pageIndex) ? this.models.document.currentIndex() : parseInt(pageIndex,10);
    this._previousTextIndex = pageIndex;

    var me = this;

    var processText = function(text) {

      var pageNumber = parseInt(pageIndex,10)+1;
      me.viewer.$('.DV-textContents').replaceWith('<pre class="DV-textContents">' + text + '</pre>');
      me.elements.currentPage.text(pageNumber);
      me.elements.textCurrentPage.text('p. '+(pageNumber));
      me.models.document.setPageIndex(pageIndex);
      me.helpers.setActiveChapter(me.models.chapters.getChapterId(pageIndex));

      if (me.viewer.openEditor == 'editText' &&
          !(pageNumber in me.models.document.originalPageText)) {
        me.models.document.originalPageText[pageNumber] = text;
      }
      if (me.viewer.openEditor == 'editText') {
        me.viewer.$('.DV-textContents').attr('contentEditable', true).addClass('DV-editing');
      }

      if(afterLoad) afterLoad.call(me.helpers);
    };

    if (me.viewer.schema.text[pageIndex]) {
      return processText(me.viewer.schema.text[pageIndex]);
    }

    var handleResponse = DV.jQuery.proxy(function(response) {
      processText(me.viewer.schema.text[pageIndex] = response);
    }, this);

    this.viewer.$('.DV-textContents').text('');

    var textURI = me.viewer.schema.document.resources.page.text.replace('{page}', pageIndex + 1);
    var crossDomain = this.helpers.isCrossDomain(textURI);
    if (crossDomain) textURI += '?callback=?';
    DV.jQuery[crossDomain ? 'getJSON' : 'get'](textURI, {}, handleResponse);
  },

  resetTracker: function(){
    this.viewer.activeAnnotation = null;
    this.trackAnnotation.combined     = null;
    this.trackAnnotation.h            = null;
  },
  trackAnnotation: function(){
    var viewer          = this.viewer;
    var helpers         = this.helpers;
    var scrollPosition  = this.elements.window[0].scrollTop;

    if(viewer.activeAnnotation){
      var annotation      = viewer.activeAnnotation;
      var trackAnnotation = this.trackAnnotation;


      if(trackAnnotation.id != annotation.id){
        trackAnnotation.id = annotation.id;
        helpers.setActiveAnnotationLimits(annotation);
      }
      if(!viewer.activeAnnotation.annotationEl.hasClass('DV-editing') &&
         (scrollPosition > (trackAnnotation.h) || scrollPosition < trackAnnotation.combined)) {
        annotation.hide(true);
        viewer.pageSet.setActiveAnnotation(null);
        viewer.activeAnnotation   = null;
        trackAnnotation.h         = null;
        trackAnnotation.id        = null;
        trackAnnotation.combined  = null;
      }
    }else{
      viewer.pageSet.setActiveAnnotation(null);
      viewer.activeAnnotation   = null;
      trackAnnotation.h         = null;
      trackAnnotation.id        = null;
      trackAnnotation.combined  = null;
      helpers.removeObserver('trackAnnotation');
    }
  }
};
