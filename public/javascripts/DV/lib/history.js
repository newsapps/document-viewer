DV.History = Backbone.History.extend({
  constructor: function(viewer) {
    this.viewer = viewer;
    Backbone.History.apply(this, arguments);
  },

  register: function(route, callback) {
    this.route(route, callback);
  },

  loadUrl: function(fragmentOverride) {
    var fragment = this.fragment = this.getFragment(fragmentOverride);
    var matched = _.any(this.handlers, function(handler) {
      if (handler.route.test(fragment)) {
        var args = handler.route.exec(fragment);
        handler.callback.apply(null, args.slice(1));
        return true;
      }
    });
    return matched;
  }
});
