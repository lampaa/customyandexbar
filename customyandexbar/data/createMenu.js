const windowUtils = require("window-utils");
const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

exports.Menuitem = function Menuitem(options) {
  new windowUtils.WindowTracker({
    onTrack: function (window) {
      if ("chrome://browser/content/browser.xul" != window.location) return;

      var onCmd = function() {
        options.onCommand && options.onCommand();
      };

      // add the new menuitem to a menu
      var menuitem = window.document.createElementNS(NS_XUL, "menuitem");
      menuitem.setAttribute("id", options.id);
      menuitem.setAttribute("label", options.label);
      if (options.accesskey)
        menuitem.setAttribute("accesskey", options.accesskey);
      if (options.key)
        menuitem.setAttribute("key", options.key);
      if (options.image) {
        menuitem.setAttribute("class", "menuitem-iconic");
        menuitem.style.listStyleImage = "url('" + options.image + "')";
      }
      menuitem.addEventListener("command", onCmd, true);

      if (options.menuid) {
        let ($ = function(id) window.document.getElementById(id)) {
          $(options.menuid).insertBefore(menuitem, $(options.insertbefore));
        }
      }
      

      // add unloader
      require("unload+").unload(function() {
        menuitem.parentNode.removeChild(menuitem);
      }, window);
    }
  });
};