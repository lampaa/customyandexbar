// updateMails.js - Go-Mobile (copy 3)'s module
// author: Romann
var {Cc, Ci} = require("chrome");
var parser = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);
var settings = require('./settings.js');

const stylesheet = require("./addstylesheet.js");
const data = require("self").data;




function updateMails(Request, callback) {
    stylesheet.addXULStylesheet(data.url("stylesheet_refresh.css"));
    var out = {};
    out.unread = [];
    
    Request({
        url: "http://bar-mail.yandex.ru/barlist",
    	onComplete: function (response) {
            stylesheet.addXULStylesheet(data.url("stylesheet.css"));
            
    		var doc = parser.parseFromString(xmlPrepare (response.text), "application/xml");
            
            if(doc.querySelectorAll("error").length > 0) {
                out = false;
            }
            else {
                var packs = doc.querySelectorAll("item[from]");
            
    		    for(var i=0; i < packs.length; i++) {
    		    	out.unread.push({'from':packs[i].getAttribute('from'), 'subject':packs[i].getAttribute('title'), 'url':packs[i].getAttribute('url')});
    		    }
                out.mails = packs.length;                
            }
            
            callback(out);
    	}
    }).get();

}

function xmlPrepare (str) {
    var xml_delim = new RegExp('<|>', 'g')
	var replace = str.match(/"(.*?)"/g);
	
	for(var i=0; i < replace.length; i++) {
		str = str.replace(new RegExp(replace[i]), replace[i].replace(xml_delim, ''));
	}
	return str;
}


exports.check = updateMails;