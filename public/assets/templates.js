(function(){
window.JST = window.JST || {};

window.JST['annotation'] = _.template('<div class="DV-annotation <%= orderClass %> <%= accessClass %> <% if (owns_note) { %>DV-ownsAnnotation<% } %>" style="top:<%= top %>px;" id="DV-annotation-<%= id %>" data-id="<%= id %>">\n\n  <div class="DV-annotationTab" style="top:<%= tabTop %>px;">\n    <div class="DV-annotationClose DV-trigger">\n      <% if (access == \'exclusive\') { %>\n        <div class="DV-annotationDraftDot DV-editHidden"></div>\n      <% } %>\n    </div>\n  </div>\n\n  <div class="DV-annotationRegion" style="margin-left:<%= excerptMarginLeft - 4 %>px; height:<%= excerptHeight %>px; width:<%= excerptWidth - 1 %>px;">\n    <div class="<%= accessClass %>">\n      <div class="DV-annotationEdge DV-annotationEdgeTop"></div>\n      <div class="DV-annotationEdge DV-annotationEdgeRight"></div>\n      <div class="DV-annotationEdge DV-annotationEdgeBottom"></div>\n      <div class="DV-annotationEdge DV-annotationEdgeLeft"></div>\n      <div class="DV-annotationCorner DV-annotationCornerTopLeft"></div>\n      <div class="DV-annotationCorner DV-annotationCornerTopRight"></div>\n      <div class="DV-annotationCorner DV-annotationCornerBottomLeft"></div>\n      <div class="DV-annotationCorner DV-annotationCornerBottomRight"></div>\n    </div>\n    <div class="DV-annotationRegionExclusive"></div>\n  </div>\n\n\n  <div class="DV-annotationContent">\n\n    <div class="DV-annotationHeader DV-clearfix">\n      <div class="DV-pagination DV-editHidden">\n        <span class="DV-trigger DV-annotationPrevious" title="Previous Annotation">Previous</span>\n        <span class="DV-trigger DV-annotationNext" title="Next Annotation">Next</span>\n      </div>\n      <div class="DV-annotationGoto DV-editHidden"><div class="DV-trigger">p. <%= pageNumber %></div></div>\n      <div class="DV-annotationTitle DV-editHidden"><%= title %></div>\n      <input class="DV-annotationTitleInput DV-editVisible" type="text" placeholder="Annotation Title" value="<%= title.replace(/"/g, \'&quot;\') %>" />\n      <% if (access == \'exclusive\') { %>\n        <div class="DV-annotationDraftLabel DV-editHidden DV-interface">Draft</div>\n      <% } else if (access == \'private\') { %>\n        <div class="DV-privateLock DV-editHidden" title="Private note"></div>\n      <% } %>\n      <span class="DV-permalink DV-editHidden" title="Link to this note"></span>\n      <div class="DV-showEdit DV-editHidden <%= accessClass %>"></div>\n    </div>\n\n\n    <div class="DV-annotationExcerpt" style="height:<%= excerptHeight %>px;">\n      <div class="DV-annotationExcerptImageTop" style="height:<%= excerptHeight %>px; width:<%= excerptWidth %>px;left:<%= excerptMarginLeft - 1 %>px;">\n\n        <img class="DV-img" src="<%= image %>" style="left:<%= -(excerptMarginLeft + 1) %>px; top:-<%= imageTop %>px;" width="<%= imageWidth %>" />\n\n      </div>\n      <div class="DV-annotationExcerptImage" style="height:<%= excerptHeight %>px;">\n        <img class="DV-img" src="<%= image %>" style="top:-<%= imageTop %>px;" width="<%= imageWidth %>" />\n      </div>\n    </div>\n\n    <div class="DV-annotationBody DV-editHidden">\n      <%= text %>\n    </div>\n    <textarea class="DV-annotationTextArea DV-editVisible" style="width: <%= bWidth %>px;"><%= text %></textarea>\n\n    <div class="DV-annotationMeta <%= accessClass %>">\n      <% if (author) { %>\n        <div class="DV-annotationAuthor DV-interface DV-editHidden">\n          Annotated by: <%= author %><% if (author_organization) { %>, <i><%= author_organization %></i><% } %>\n        </div>\n      <% } %>\n      <% if (access == \'exclusive\') { %>\n        <div class="DV-annotationWarning DV-interface DV-editHidden">\n          This draft is only visible to you and collaborators.\n        </div>\n      <% } else if (access == \'private\') { %>\n        <div class="DV-annotationWarning DV-interface DV-editHidden">\n          This private note is only visible to you.\n        </div>\n      <% } %>\n      <div class="DV-annotationEditControls DV-editVisible">\n        <div class="DV-clearfix">\n          <div class="minibutton warn DV-deleteAnnotation float_left">Delete</div>\n          <div class="minibutton default DV-saveAnnotation float_right">\n            <% if (access == \'exclusive\') { %>\n              Publish\n            <% } else { %>\n              Save\n            <% } %>\n          </div>\n          <% if (access == \'public\' || access == \'exclusive\') { %>\n            <div class="minibutton DV-saveAnnotationDraft float_right">Save as Draft</div>\n          <% } %>\n          <div class="minibutton DV-cancelEdit float_right">Cancel</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n');
window.JST['annotationNav'] = _.template('<div class="DV-annotationMarker" id="DV-annotationMarker-<%= id %>">\n  <span class="DV-trigger">\n    <span class="DV-navAnnotationTitle"><%= title %></span>&nbsp;<span class="DV-navPageNumber">p.<%= page %></span>\n  </span>\n</div>');
window.JST['articleHighlight'] = _.template('<a class="DV-article-highlight page-<%= page %>" id="modal-opener-<%= id %>-page-<%= page %>" href="#page/<%= page %>/article/<%= id %>"></a>\n');
window.JST['articleModal'] = _.template('<div id="modal-<%= slug%>" class="DV-article-modal modal hide page-<%= page %>" tabindex="-1" role="dialog">\n    <div class="modal-header">\n        <button type="button" class="close" data-dismiss="modal">×</button>\n        <h3 id="article-title"><%= title %></h3>\n    </div>\n    <div class="modal-body">\n      <p><%= body %></p>\n    </div>\n    <div class="modal-footer">\n        <button class="btn" data-dismiss="modal">Close</button>\n    </div>\n</div>\n');
window.JST['chapterNav'] = _.template('<div id="DV-chapter-<%= id %>" class="DV-chapter <%= navigationExpanderClass %>">\n  <div class="DV-first">\n    <%= navigationExpander %>\n    <span class="DV-trigger">\n      <span class="DV-navChapterTitle"><%= title %></span>&nbsp;<span class="DV-navPageNumber">p.&nbsp;<%= pageNumber %></span>\n    </span>\n  </div>\n  <%= noteViews %>\n</div>');
window.JST['descriptionContainer'] = _.template('<% if (description) { %>\n  <div class="DV-description">\n    <div class="DV-descriptionHead">\n      <span class="DV-descriptionToggle DV-showDescription DV-trigger"> Toggle Description</span>\n      Description\n    </div>\n    <div class="DV-descriptionText"><%= description %></div>\n  </div>\n<% } %>\n');
window.JST['embedModal'] = _.template('<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">\n  <div class="modal-dialog">\n    <div class="modal-content">\n      <div class="modal-header">\n        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n        <h4 class="modal-title" id="myModalLabel">Embed code</h4>\n      </div>\n      <div class="modal-body">\n        <p><div class="btn-group embed-size-select">\n          <button class="btn small-embed active">Small</button>\n          <button class="btn medium-embed">Medium</button>\n          <button class="btn large-embed">Large</button>\n        </div></p>\n        <p><textarea style="width:95%;min-height:90px;">&lt;iframe src=&quot;<%= embed_url %>&quot; width=&quot;300&quot; height=&quot;600&quot; scrolling=&quot;no&quot; frameborder=&quot;0&quot;&gt;&lt;/iframe&gt;</textarea></p>\n      </div>\n      <div class="modal-footer">\n        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n      </div>\n    </div>\n  </div>\n</div>\n');
window.JST['footer'] = _.template('<% if (!options.sidebar) { %>\n  <div class="DV-footer">\n    <div class="DV-fullscreenContainer"></div>\n    <div class="DV-navControlsContainer"></div>\n  </div>\n<% } %>');
window.JST['fullscreenControl'] = _.template('<div class="DV-fullscreen" title="View Document in Fullscreen"></div>\n');
window.JST['header'] = _.template('<div class="DV-header">\n  <div class="DV-headerHat" class="DV-clearfix">\n    <div class="DV-branding">\n      <% if (story_url) { %>\n        <span class="DV-storyLink"><%= story_url %></span>\n      <% } %>\n    </div>\n    <div class="DV-title">\n      <%= title %>\n    </div>\n  </div>\n\n  <div class="DV-controls navbar navbar-inverse" style="position: static;">\n    <div class="navbar-inner">\n      <div class="container">\n        <div class="DV-topNavLeft">\n          <a class="DV-back-to-paper" href="/results/"><i class="icon-chevron-left icon-white"></i> Back <span class="hidden-phone">to paper</span></a>\n          <a class="DV-back-to-search" href="/results/"><i class="icon-chevron-left icon-white"></i> <span class="hidden-phone">Back to search</span><span class="visible-phone">Search</span></a>\n        </div>\n        <div class="DV-topNavRight">\n          <a class="DV-read-article" href="#text">Read <span class="hidden-phone">selected article</span> <i class="icon-chevron-right icon-white"></i></a>\n        </div>\n        <div class="center">\n          <span class="hidden-phone"><a href="http://www.chicagotribune.com/" alt="Home" title="chicagotribune.com"><img src="/public/images/ct.png" alt="Chicago Tribune"></a></span>\n          <span class="issue-pub-date"><%= new APDate(DV.viewers[id].schema.document.date).ap() %></span>\n        </div>\n      </div>\n    </div><!-- /navbar-inner -->\n\n    <!--[if lte IE 8]>\n      <div class="ie-alert"><h5 class="center">For full functionality, please <a id="linkhook" href="http://windows.microsoft.com/en-us/internet-explorer/download-ie">upgrade</a> to IE9 or above</h5></div>\n    <![endif]-->\n\n  </div>\n</div>\n\n\n<!-- /DV-header -->\n');
window.JST['message'] = _.template('<div class="DV-message">\n  <div class="center">\n          <h1>Go upgrade to IE 9 or above</h1>\n        </div>\n  </div>\n\n<!-- /DV-message -->\n');
window.JST['navControls'] = _.template('<div class="DV-pageNumberContainer">\n  <span class="hidden-phone">\n    <span class="DV-currentPagePrefix">Page</span>\n    <span class="DV-currentPage">1</span>\n    <span class="DV-currentPageSuffix">of&nbsp;\n      <span class="DV-totalPages"><%= totalPages %></span>\n    </span>\n  </span>\n</div>\n\n<div class="DV-navControls">\n  <div class="center">\n    <span class="DV-jump-to-continuation pull-left">\n      <span class="hidden-phone">\n        <button class="DV-trigger storyJump" data-event-label="Follow story jump"><span class="btn-text">View Story Jump\n          <svg width="20" height="28" viewBox="-704 -384 2048 2048" xmlns="http://www.w3.org/2000/svg"><g transform="scale(1 -1) translate(0 -1280)"><path d="M595 576q0 -13 -10 -23l-466 -466q-10 -10 -23 -10t-23 10l-50 50q-10 10 -10 23t10 23l393 393l-393 393q-10 10 -10 23t10 23l50 50q10 10 23 10t23 -10l466 -466q10 -10 10 -23z" /></g></svg>\n        </span>\n        </button>\n      </span>\n    </span>\n\n    <span class="DV-thumbnailsView">\n        <button class="pagesSVG DV-trigger" data-event-label="View page index">\n          <svg width="30" height="30" viewBox="-192 -384 2048 2048" xmlns="http://www.w3.org/2000/svg"><g transform="scale(1 -1) translate(0 -1280)"><path d="M768 512v-384q0 -52 -38 -90t-90 -38h-512q-52 0 -90 38t-38 90v384q0 52 38 90t90 38h512q52 0 90 -38t38 -90zM768 1280v-384q0 -52 -38 -90t-90 -38h-512q-52 0 -90 38t-38 90v384q0 52 38 90t90 38h512q52 0 90 -38t38 -90zM1664 512v-384q0 -52 -38 -90t-90 -38 h-512q-52 0 -90 38t-38 90v384q0 52 38 90t90 38h512q52 0 90 -38t38 -90zM1664 1280v-384q0 -52 -38 -90t-90 -38h-512q-52 0 -90 38t-38 90v384q0 52 38 90t90 38h512q52 0 90 -38t38 -90z" /></g></svg>\n\n          <span class="hidden-phone btn-text">Pages</span>\n\n        </button>\n    </span>\n\n\n    <span class="DV-zoomControls DV-zoomBox"></span>\n\n      <div class="DV-shareTools btn-group dropup">\n\n        <button class="DV-trigger shareSVG" data-event-label="Open share tools" data-toggle="dropdown">\n\n          <svg width="30" height="30" viewBox="-256 -384 2048 2048" xmlns="http://www.w3.org/2000/svg"><g transform="scale(1 -1) translate(0 -1280)"><path d="M1005 435l352 352q19 19 19 45t-19 45l-352 352q-30 31 -69 14q-40 -17 -40 -59v-160q-119 0 -216 -19.5t-162.5 -51t-114 -79t-76.5 -95.5t-44.5 -109t-21.5 -111.5t-5 -110.5q0 -181 167 -404q10 -12 25 -12q7 0 13 3q22 9 19 33q-44 354 62 473q46 52 130 75.5 t224 23.5v-160q0 -42 40 -59q12 -5 24 -5q26 0 45 19zM1536 1120v-960q0 -119 -84.5 -203.5t-203.5 -84.5h-960q-119 0 -203.5 84.5t-84.5 203.5v960q0 119 84.5 203.5t203.5 84.5h960q119 0 203.5 -84.5t84.5 -203.5z"/></g></svg>\n\n          <span class="hidden-phone btn-text">Share issue</span></span>\n\n        </button>\n        <ul class="dropdown-menu"></ul>\n      </div>\n\n      <div id="DV-selection-shareTools" class="DV-shareTools btn-group dropup">\n\n        <button class="DV-trigger shareSVG" data-event-label="Click share tools" data-toggle="dropdown">\n\n          <svg width="30" height="30" viewBox="-256 -384 2048 2048" xmlns="http://www.w3.org/2000/svg"><g transform="scale(1 -1) translate(0 -1280)"><path d="M1005 435l352 352q19 19 19 45t-19 45l-352 352q-30 31 -69 14q-40 -17 -40 -59v-160q-119 0 -216 -19.5t-162.5 -51t-114 -79t-76.5 -95.5t-44.5 -109t-21.5 -111.5t-5 -110.5q0 -181 167 -404q10 -12 25 -12q7 0 13 3q22 9 19 33q-44 354 62 473q46 52 130 75.5 t224 23.5v-160q0 -42 40 -59q12 -5 24 -5q26 0 45 19zM1536 1120v-960q0 -119 -84.5 -203.5t-203.5 -84.5h-960q-119 0 -203.5 84.5t-84.5 203.5v960q0 119 84.5 203.5t203.5 84.5h960q119 0 203.5 -84.5t84.5 -203.5z"/></g></svg>\n\n          <span class="hidden-phone btn-text">Share <span class="content-type">article</span></span>\n          </span>\n\n        </button>\n        <ul class="dropdown-menu"></ul>\n      </div>\n\n\n  </div>\n</div>\n\n');
window.JST['navigationExpander'] = _.template('<span class="DV-trigger DV-expander">Expand</span>');
window.JST['pageAnnotation'] = _.template('<div class="DV-annotation DV-pageNote <%= orderClass %> <%= accessClass %> <% if (owns_note) { %>DV-ownsAnnotation<% } %>" style="top:<%= top %>px;" id="DV-annotation-<%= id %>" data-id="<%= id %>">\n  <div class="DV-annotationTab">\n    <div class="DV-annotationClose DV-trigger">p. <%= pageNumber %></div>\n  </div>\n\n  <div class="DV-annotationContent">\n    <!-- Header -->\n    <div class="DV-annotationHeader DV-clearfix">\n      <div class="DV-pagination DV-editHidden">\n        <span class="DV-trigger DV-annotationPrevious" title="Previous Annotation">Previous</span>\n        <span class="DV-trigger DV-annotationNext" title="Next Annotation">Next</span>\n      </div>\n      <div class="DV-annotationGoto DV-editHidden"><div class="DV-trigger">p. <%= pageNumber %></div></div>\n      <div class="DV-annotationTitle DV-editHidden"><%= title %></div>\n      <input class="DV-annotationTitleInput DV-editVisible" type="text" placeholder="Annotation Title" value="<%= title.replace(/"/g, \'&quot;\') %>" />\n      <% if (access == \'exclusive\') { %>\n        <div class="DV-annotationDraftLabel DV-editHidden DV-interface">Draft</div>\n      <% } else if (access == \'private\') { %>\n        <div class="DV-privateLock DV-editHidden" title="Private note"></div>\n      <% } %>\n      <span class="DV-permalink DV-editHidden" title="Link to this note"></span>\n      <div class="DV-showEdit DV-editHidden <%= accessClass %>"></div>\n    </div>\n\n    <div class="DV-annotationBody DV-editHidden">\n      <%= text %>\n    </div>\n    <textarea class="DV-annotationTextArea DV-editVisible" style="width: <%= bWidth %>px;"><%= text %></textarea>\n\n    <div class="DV-annotationMeta <%= accessClass %>">\n      <% if (author) { %>\n        <div class="DV-annotationAuthor DV-interface DV-editHidden">\n          Annotated by: <%= author %><% if (author_organization) { %>, <i><%= author_organization %></i><% } %>\n        </div>\n      <% } %>\n      <% if (access == \'exclusive\') { %>\n        <div class="DV-annotationWarning DV-interface DV-editHidden">\n          This draft is only visible to you and collaborators.\n        </div>\n      <% } else if (access == \'private\') { %>\n        <div class="DV-annotationWarning DV-interface DV-editHidden">\n          This private note is only visible to you.\n        </div>\n      <% } %>\n      <div class="DV-annotationEditControls DV-editVisible">\n        <div class="DV-clearfix">\n          <div class="minibutton warn DV-deleteAnnotation float_left">Delete</div>\n          <div class="minibutton default DV-saveAnnotation float_right">\n            <% if (access == \'exclusive\') { %>\n              Publish\n            <% } else { %>\n              Save\n            <% } %>\n          </div>\n          <% if (access == \'public\' || access == \'exclusive\') { %>\n            <div class="minibutton DV-saveAnnotationDraft float_right">Save as Draft</div>\n          <% } %>\n          <div class="minibutton DV-cancelEdit float_right">Cancel</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n');
window.JST['pages'] = _.template('<div class="DV-set p<%= pageIndex %>" data-id="p<%= pageIndex %>" style="top:0;left:0px;height:893px;width:700px;">\n  <div class="DV-overlay"></div>\n  <div class="DV-pageNoteInsert" title="Click to Add a Page Note">\n    <div class="DV-annotationTab">\n      <div class="DV-annotationClose"></div>\n    </div>\n    <div class="DV-annotationDivider"></div>\n  </div>\n  <div class="DV-annotations"></div>\n  <div class="DV-page" style="height:863px;width:700px;">\n\n    <span class="DV-loading-top">Loading</span>\n    <span class="DV-loading-bottom">Loading</span>\n    <div class="DV-cover"></div>\n    <img class="DV-pageImage" <%= pageImageSource ? \'src="\' + pageImageSource + \'"\' : \'\' %> height="863" />\n  </div>\n</div>\n');
window.JST['thumbnails'] = _.template('<% if (section && edition) { %>\n  <div class="DV-edition-section-label"><h3><%= section %> section from <%= edition %> regional edition <a href="/faq"><i class="icon-question-sign"></i></a></h3></div>\n<% } else if (!section && edition) { %>\n  <div class="DV-edition-section-label"><h3>From <%= edition %> regional edition <a href="/faq"><i class="icon-question-sign"></i></a></h3></div>\n<% } else if (page > 1) { %>\n  <div class="DV-edition-section-label"></div>\n<% } %>\n\n<% for (; page <= endPage; page++) { %>\n  <% var url = imageUrl.replace(/\{page\}/, page) ; %>\n  <div class="DV-thumbnail" id="DV-thumbnail-<%= page %>" data-pageNumber="<%= page %>">\n    <div class="DV-overlay">\n      <div class=\'DV-caret\'></div>\n    </div>\n    <div class="DV-thumbnail-page">\n      <div class="DV-thumbnail-select">\n        <div class="DV-thumbnail-shadow"></div>\n        <img class="DV-thumbnail-image" data-src="<%= url %>" />\n      </div>\n      <div class="DV-pageNumber DV-pageMeta"><span class="DV-pageNumberText"><span class="DV-pageNumberTextUnderline">p. <%= page %></span></span></div>\n    </div>\n  </div>\n<% } %>\n');
window.JST['unsupported'] = _.template('<div class="DV-unsupported">\n  <div class="DV-intro">\n    <% if (viewer.schema.document.resources && viewer.schema.document.resources.pdf) { %>\n      <a href="<%= viewer.schema.document.resources.pdf %>">Download this document as a PDF</a>\n    <% } %>\n    <br />\n    <br />\n    To use the Document Viewer you need to<br /> upgrade your browser:\n  </div>\n  <div class="DV-browsers">\n    <div class="DV-browser">\n      <a href="http://www.google.com/chrome">\n        <div class="DV-image DV-chrome"> </div>Chrome\n      </a>\n    </div>\n    <div class="DV-browser">\n      <a href="http://www.apple.com/safari/download/">\n        <div class="DV-image DV-safari"> </div>Safari\n      </a>\n    </div>\n    <div class="DV-browser">\n      <a href="http://www.mozilla.com/en-US/firefox/firefox.html">\n        <div class="DV-image DV-firefox"> </div>Firefox\n      </a>\n    </div>\n    <br style="clear:both;" />\n  </div>\n  <div class="DV-after">\n    Or, if you\'d like to continue using Internet Explorer 6,<br /> you can\n    <a href="http://www.google.com/chromeframe">install Google Chrome Frame</a>.\n  </div>\n</div>\n');
window.JST['viewer'] = _.template('<!--[if lte IE 8]>\n\n\n  <div class="DV-docViewer DV-clearfix DV-viewDocument DV-ie\n  <% if (autoZoom) { %>DV-autoZoom<% } %>\n  <% if (mini) { %>DV-mini<% } %>\n  <% if (!options.sidebar) { %>DV-hideSidebar<% } else { %>DV-hideFooter<% } %>">\n\n<![endif]-->\n\n<!--[if (!IE)|(gte IE 9)]><!--><div class="DV-docViewer DV-clearfix DV-viewDocument <% if (autoZoom) { %>DV-autoZoom<% } %> <% if (mini) { %>DV-mini<% } %> <% if (!options.sidebar) { %>DV-hideSidebar<% } else { %>DV-hideFooter<% } %>"><!-- <![endif]-->\n\n  <div class="DV-docViewerWrapper">\n    <%= header %>\n    <div class="DV-docViewer-Container">\n      <div class="DV-searchBarWrapper">\n        <div class="DV-searchBar">\n          <span class="DV-trigger DV-closeSearch">CLOSE</span>\n          <div class="DV-searchPagination DV-foundResult">\n            <div class="DV-searchResults">\n              <span class="DV-resultPrevious DV-trigger">Previous</span>\n              <span class="DV-currentSearchResult"></span>\n              <span class="DV-totalSearchResult"></span>\n              <span> for &ldquo;<span class="DV-searchQuery"></span>&rdquo;</span>\n              <span class="DV-resultNext DV-trigger">Next</span>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      <div class="DV-pages <% if (!options.sidebar) { %>DV-hide-sidebar<% } %>">\n        <div class="DV-paper">\n          <div class="DV-thumbnails"></div>\n          <div class="DV-pageCollection">\n            <div class="DV-bar" style=""></div>\n            <div class="DV-allAnnotations">\n            </div>\n            <div class="DV-text">\n              <div class="DV-textSearch DV-clearfix">\n\n              </div>\n              <div class="DV-textPage">\n                <span class="DV-textCurrentPage"></span>\n                <pre class="DV-textContents"></pre>\n                <div class="DV-articleTextContents"></div>\n              </div>\n            </div>\n            <%= pages %>\n          </div>\n        </div>\n      </div>\n\n      <div width="265px" class="DV-sidebar <% if (!options.sidebar) { %>DV-hide<% } %>" style="display:none;">\n        <div class="DV-well">\n\n          <div class="DV-sidebarSpacer"></div>\n\n          <% if (options.sidebar) { %>\n            <div class="DV-navControlsContainer">\n            </div>\n          <% } %>\n\n          <div class="DV-navigation">\n            <%= descriptionContainer %>\n            <div class="DV-contentsHeader">Contents</div>\n            <div class="DV-chaptersContainer">\n            </div>\n            <div class="DV-supplemental">\n              <% if (pdf_url) { %>\n                <div class="DV-pdfLink"><%= pdf_url %></div>\n              <% } %>\n              <% if (print_notes_url) { %>\n                <div class="DV-printNotesLink">\n                  <a target="_blank" href="<%= print_notes_url %>">Print Notes &raquo;</a>\n                </div>\n              <% } %>\n              <div class="DV-storyLink" style="<%= story_url ? \'\' : \'display:none\' %>">\n                <a target="_blank" href="<%= story_url %>">Related Article &raquo;</a>\n              </div>\n              <% if (contributors) { %>\n                <div class="DV-contributor">Contributed by: <%= contributors %></div>\n              <% } %>\n            </div>\n            <div class="DV-logo"><a class="DV-logoLink" href="http://www.documentcloud.org"></a></div>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <%= footer %>\n\n  </div>\n\n  <div class="DV-printMessage">\n    To print the document, click the "Original Document" link to open the original\n    PDF. At this time it is not possible to print the document with annotations.\n  </div>\n\n</div>\n');
window.JST['zoomControls'] = _.template('<span>\n  <button class="dec DV-trigger" data-event-label="Zoom out">\n    <svg width="30" height="30" viewBox="-256 -384 2048 2048" xmlns="http://www.w3.org/2000/svg"><g transform="scale(1 -1) translate(0 -1280)"><path d="M1216 576v128q0 26 -19 45t-45 19h-768q-26 0 -45 -19t-19 -45v-128q0 -26 19 -45t45 -19h768q26 0 45 19t19 45zM1536 640q0 -209 -103 -385.5t-279.5 -279.5t-385.5 -103t-385.5 103t-279.5 279.5t-103 385.5t103 385.5t279.5 279.5t385.5 103t385.5 -103t279.5 -279.5 t103 -385.5z" /></g></svg>\n  </button>\n  <button class="resize DV-trigger" data-event-label="Reset zoom">\n    <svg width="30" height="30" viewBox="-128 -384 2048 2048" xmlns="http://www.w3.org/2000/svg"><g transform="scale(1 -1) translate(0 -1280)"><path d="M1792 640q0 -26 -19 -45l-256 -256q-19 -19 -45 -19t-45 19t-19 45v128h-1024v-128q0 -26 -19 -45t-45 -19t-45 19l-256 256q-19 19 -19 45t19 45l256 256q19 19 45 19t45 -19t19 -45v-128h1024v128q0 26 19 45t45 19t45 -19l256 -256q19 -19 19 -45z" /></g></svg>\n  </button>\n  <button class="inc DV-trigger" data-event-label="Zoom in">\n    <svg width="30" height="30" viewBox="-256 -384 2048 2048" xmlns="http://www.w3.org/2000/svg"><g transform="scale(1 -1) translate(0 -1280)"><path d="M1216 576v128q0 26 -19 45t-45 19h-256v256q0 26 -19 45t-45 19h-128q-26 0 -45 -19t-19 -45v-256h-256q-26 0 -45 -19t-19 -45v-128q0 -26 19 -45t45 -19h256v-256q0 -26 19 -45t45 -19h128q26 0 45 19t19 45v256h256q26 0 45 19t19 45zM1536 640q0 -209 -103 -385.5 t-279.5 -279.5t-385.5 -103t-385.5 103t-279.5 279.5t-103 385.5t103 385.5t279.5 279.5t385.5 103t385.5 -103t279.5 -279.5t103 -385.5z" /></g></svg>\n  </button>\n</span>\n');
})();