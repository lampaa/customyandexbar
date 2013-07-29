const prefs = require("preferences-service");
const settings = require("./settings");
var agent = "Mozilla/5.0 (Android  Mobile; rv:18.0) Gecko/18.0 Firefox/18.0";
var exitLink = '';
function toggleUserAgent() {
    if (!settings.retrieve("on").this) {
        console.log("should be false, is: " + settings.retrieve("on").this);
        prefs.set("general.useragent.override", agent);
        console.log("set");
        settings.switcher("on");
        return true;
    } else {
        prefs.reset("general.useragent.override");
        console.log("reset");
        settings.switcher("on");
        return false;
    }
}

function showSettings () {
    
}

function setExitLink(ex) {
    exitLink = ex;
}

function getExitLink() {
    return exitLink;
}

exports.setExitLink = setExitLink;
exports.getExitLink = getExitLink;

exports.toggleUserAgent = toggleUserAgent;