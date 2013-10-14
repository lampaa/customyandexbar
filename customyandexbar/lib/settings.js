var settings = {};
var ss = require("simple-storage").storage;

/**
 * functions
 */
function setter(name, val) {
    settings[name] = val;   
}

function getter(name) {
    return settings[name];
}

/**
 * presets
 */
setter('corrector', ss.corrector == undefined ? true : ss.corrector);
setter('translate', ss.translate == undefined ? false : ss.translate);
setter('mailto', ss.mailto == undefined ? true : ss.mailto);
setter('opentype', ss.opentype == undefined ? true : ss.opentype);
setter('yandexid', require('./cookieReader.js').view("http://bar-mail.yandex.ru/barlist", 'yandexuid'));
setter('menu_show', false);

/**
 * exports
 */
exports.setter = setter;
exports.getter = getter;
exports.storage = ss;

