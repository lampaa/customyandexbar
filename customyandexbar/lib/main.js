/**
 * url page: https://addons.mozilla.org/ru/firefox/addon/customyandexbar/
 * author: lampa
 */
const tabs = require("tabs");
const wuntils = require('sdk/window/utils');

const settings = require("./settings");
const makeButton = require("./button").makeButton;
const window = wuntils.getMostRecentBrowserWindow();

const adressbar = require("./adressBar.js");
const translator = require("./translator.js");

exports.main = function (options) {
    /**
     * create button && button func
     */
    makeButton(true);
    /**
     * add click event
     */
    window.gBrowser.mPanelContainer.addEventListener('click', windowEventClick, false);
}

/**
 * unload events
 */
exports.onUnload = function (reason) {
    window.gBrowser.mPanelContainer.removeEventListener('click', windowEventClick, false);
    translator.onUnload();
}

/**
 * other func
 */
function windowEventClick(e) {
   var target = e.target;
   if(target.tagName == 'A' && settings.getter('email')) {
        var mail_to = target.href.match(/^mailto:(.*)/i);
        if(mail_to != null) {
           tabs.open('http://mail.yandex.ru/neo2/#compose/mailto=' + mail_to[1]);
	    }
	}
}