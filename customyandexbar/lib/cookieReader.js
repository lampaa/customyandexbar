// https://developer.mozilla.org/en-US/docs/Code_snippets/Cookies

const { Cc, Ci } = require('chrome');

var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
var cookieSvc =  Cc["@mozilla.org/cookieService;1"].getService(Ci.nsICookieService);
    
exports.view = function view (site, cookieName){
    try {

		var uri = ios.newURI(site, null, null);
		var cookie = cookieSvc.getCookieString(uri, null);
        
        cookie = readCookie(cookie);
        
        if(cookieName != undefined) {
            return cookie[cookieName];
        }
        return cookie;
	}
	catch (errorInfo) {
		console.log(errorInfo);
	}
}

function readCookie(val) {
    var incCookies = val.split(";");
    var splitCookies;
    var created = {};
    
    for (var c = 0; c < incCookies.length; c++) {
        splitCookies = incCookies[c].split("=");
		created[String.trim(splitCookies[0])] = splitCookies[1];
    }
    
    return created;
}