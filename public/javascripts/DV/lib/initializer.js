// Fake out console.log for safety, if it doesn't exist.
window.console || (window.console = {});
console.log    || (console.log = _.identity);

// Sniff for window.location.origin availability in browser (IE hack)
if (!window.location.origin) {
  window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
}

// Create the DV namespaces.
window.DV   = window.DV   || {};

DV.jQuery   = jQuery.noConflict();
DV.viewers  = DV.viewers  || {};
DV.model    = DV.model    || {};
