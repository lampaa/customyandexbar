/**
 * variables
 */
const {Cc, Ci} = require("chrome");

const wuntils = require('sdk/window/utils');
const window = wuntils.getMostRecentBrowserWindow();
const document = window.document;
const {listen} = require("listen");

const tmr = require('timer');
const settings = require('./settings.js');
const panelLib = require('./panelManager.js').main;
const data = require("self").data;
const parser = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);
const Request = require("sdk/request").Request;
const tabs = require("tabs");

var timer, panel, word, last_word='', mouseOutTimer;
/** 
 * events
 */
exports.onUnload = function () {
    window.gBrowser.mPanelContainer.removeEventListener('mousemove', windowEventMove, false);
}

window.gBrowser.mPanelContainer.addEventListener('mousemove', windowEventMove, false);

/**
 * func
 */
function windowEventMove(e) {

    if(!settings.getter('translate')) {
        return;
    }
    
    if(timer != undefined) {
        tmr.clearTimeout(timer);
    }
    
    
    if(e.target != undefined) {
        timer = tmr.setTimeout(function() {
           word = getWordAtPoint (e.target, e.clientX, e.clientY);
           
           if(panel != undefined) {
               panel.close();
           }
           
           console.log(word);
           
           if(word != null && word != last_word) {
               last_word = word;
               
               word = word.replace(/[^a-zа-я]+/gi, '');
               
               Request({
                    url: "http://translate.yandex.net/dicservice.json/lookup?&ui=ru&lang=en-ru&text="+word,
                    onComplete: function (response) {
                        console.log(response.json);
                        
                        var json = response.json;
                        
                        if(json.def.length < 1) return;
                        
                        var html = "<style>html, body {margin:0;padding:3px}#view-translate {font-size: 13px; display: inline-block;}#view-translate span {color: orange}#view-translate h1 {font-size: 15px;font-weight: bold;}</style><div id='view-translate'>";
                        
                        html += "<h1>" + json.def[0].text + "</h1>";
                        
                        var json_1 = json.def;
                        
                        for(var i=0; i < json_1.length; i ++) {
                            var json_2 = json_1[i].tr
                            , html_array = [];
                        	
                        	for(var i2=0; i2 < json_2.length; i2 ++) {
                                html_array.push(json_2[i2].text + ' ' + replaser(json_2[i2].pos));
                        	}
                        	
                        	html += html_array.join(', ') + '<br>';
                        }
                        html += '</div>';

                        var dataURI = "data:text/html,<meta http-equiv='Content-Type' content='text/html; charset=utf-8'>" + encodeURIComponent(html);
                        
                        
                        panel = createPanel(function() {
                            var element = this.contentDocument.getElementById('view-translate');
                            
                            var width = parseInt(getElementComputedStyle(element, 'width'));
                            var height = parseInt(getElementComputedStyle(element, 'height'));
                            
                            
                            panel.resize(width+70, height+20);
                            panel.panel.style.opacity = '1';
                            
                        }, e.clientX, e.clientY, dataURI, function() {
                            last_word = '';
                        });
                        
                        panel.panel.onmouseover = function() {
                            tmr.clearTimeout(mouseOutTimer);
                        }
                        
                        panel.panel.onmouseout = function() {
                            mouseOutTimer = tmr.setTimeout(function() {
                                panel.close();
                            }, 500);
                        }
                    }
               }).get();      
           }
        }, 1200);       
    }
}



function createPanel(onLoad, x, y, content, onClose) {
    var panel = panelLib({
        width: 700,
        height: 700,
        contentType: 'iframe',
        content: content,
        left: x,
        top: y,
        onLoad: onLoad,
        onClose: onClose,
        buttonClose: false
    });   

    panel.panel.style.background = "white";
    panel.panel.style.border = "1px #99CCFF solid";
    panel.open();
    
    return panel;
}

function replaser(str) {
    if(str == 'прилагательное') {
		return '<span>(прил)</span>';
	}
	if(str == 'глагол') {
		return '<span>(гл)</span>';
	}
	if(str == 'существительное') {
		return '<span>(сущ)</span>';
	}
    if(str == 'причастие') {
		return '<span>(прич)</span>';
	}
    if(str == 'местоимение') {
    	return '<span>(мест)</span>';
	}
    
    return str;
}


function getElementComputedStyle(elem, prop) {
    if (typeof elem!="object") elem = document.getElementById(elem);  
	if (document.defaultView && document.defaultView.getComputedStyle) {
		if (prop.match(/[A-Z]/)) prop = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
		return document.defaultView.getComputedStyle(elem, "").getPropertyValue(prop);
	}  
	if (elem.currentStyle) {
		var i;
		while ((i=prop.indexOf("-"))!=-1) prop = prop.substr(0, i) + prop.substr(i+1,1).toUpperCase() + prop.substr(i+2);
		return elem.currentStyle[prop];
	}
		
	return "";
}



function xmlPrepare (str) {
    var xml_delim = new RegExp('<|>', 'g')
    var replace = str.match(/"(.*?)"/g);
	
	for(var i=0; i < replace.length; i++) {
		str = str.replace(new RegExp(replace[i]), replace[i].replace(xml_delim, ''));
	}
	return str;
}

function getWordAtPoint (elem, x, y) {
    if (elem.nodeType == elem.TEXT_NODE) {
		var range = elem.ownerDocument.createRange();
		range.selectNodeContents(elem);
		var currentPos = 0;
		var endPos = range.endOffset;
		// substringing
		var string = range.toString();
		
		while (currentPos + 1 < endPos) {
			range.setStart(elem, currentPos);
			range.setEnd(elem, currentPos + 1);
			
			if (range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right >= x && range.getBoundingClientRect().top <= y && range.getBoundingClientRect().bottom >= y) {
					
				var startString = string.substr(0, currentPos)
				, start = startString.lastIndexOf(' ')
				, end = (string.indexOf(' ', currentPos) > -1) ? (string .indexOf(' ', currentPos)) : (string.length);
					
				range.setStart(elem, start + 1);
				range.setEnd(elem, end);
				var ret = range.toString();
				range.detach();
					
				return ret;
			}
			currentPos += 1;
		}
	} 
	else {
		for (var i = 0; i < elem.childNodes.length; i++) {
			var range = elem.childNodes[i].ownerDocument.createRange();
			range.selectNodeContents(elem.childNodes[i]);
			
			if (range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right >= x && range.getBoundingClientRect().top <= y && range.getBoundingClientRect().bottom >= y) {
				range.detach();
				return getWordAtPoint(elem.childNodes[i], x, y);
			} 
			else {
				range.detach();
			}
		}
	}
	return null;
}