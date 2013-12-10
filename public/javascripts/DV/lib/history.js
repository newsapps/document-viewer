DV.History = Backbone.History.extend({
  constructor: function(viewer) {
    this.viewer = viewer;
    Backbone.History.apply(this, arguments);
  },

  register: function(route, callback) {
    this.route(route, callback);
  }
});
