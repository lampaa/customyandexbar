// Register onKeyDown and onKeyUp event handlers in each browser window

var wuntils = require('sdk/window/utils');
var document = wuntils.getMostRecentBrowserWindow().document;
var tmr = require('timer');
var settings = require('./settings.js');

var RUS = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЫЭЮЯабвгдеёжзийклмнопрстуфхцчшщъьыэюя\"№;:?,";
var ENG = "F<DULT~:PBQRKVYJGHCNEA{WXIO}MS\">Zf,dult`;pbqrkvyjghcnea[wxio]ms'.z\@#$^&?";

var urlbar = document.getElementById("urlbar");
var KeyDetect = 0;
var lastUrlLength = 0;
var ifKeyDown = false;
var lastType = '';


urlbar.onkeypress = onKeyPress;

// Event handlers
function onKeyPress(event) {
    if(!settings.getter('corrector') || event.ctrlKey) {
        KeyDetect = 0;
        return;
    }

    var selection_start = urlbar.selectionStart;
    
    if(event.keyCode == 8) {
        if(selection_start == urlbar.selectionEnd) {
            return; 
        }
        else {       
            urlbar.value = urlbar.value.slice(0, selection_start) + urlbar.value.slice(urlbar.selectionEnd);   
            setCaretPosition(urlbar, selection_start);
            urlbar.mController.startSearch(urlbar.value);
        
            return true;           
        }
    }


    KeyDetect = detectRus(event);
 
    var code = String.fromCharCode(event.which);
    
    if(KeyDetect == ('ru' || 'RU')) {
        var j = RUS.indexOf(code);
        
        if(j > 0) {
            code = ENG.charAt(j);
        }
        else {
            return;
        }
	}
    else {
        return;
    }

    var i = 0;
    console.log(urlbar.mController);
    for(var gi in urlbar.mController) {
        if(i  > 80) {
            console.log(urlbar.mController[gi]);
        } 
        i++;
    }

    urlbar.value = urlbar.value.slice(0, selection_start) + code + urlbar.value.slice(urlbar.selectionEnd);
    setCaretPosition(urlbar, selection_start+1);
    
    urlbar.mController.startSearch(urlbar.value);
    event.preventDefault();
}



/**
 * get lang
 */
 
function detectRus(e, c){
    var c = (e.charCode == undefined ? e.keyCode : e.charCode);
	var layout =  '';
	if (c >= 97/*a*/  && c <= 122/*z*/ && !e.shiftKey ||
		c >= 65/*A*/  && c <= 90/*Z*/  &&  e.shiftKey ||
		(c == 91/*[*/  && !e.shiftKey ||
		c == 93/*]*/  && !e.shiftKey ||
		c == 123/*{*/ &&  e.shiftKey ||
		c == 125/*}*/ &&  e.shiftKey ||
		c == 96/*`*/  && !e.shiftKey ||
		c == 126/*~*/ &&  e.shiftKey ||
		c == 64/*@*/  &&  e.shiftKey ||
		c == 35/*#*/  &&  e.shiftKey ||
		c == 36/*$*/  &&  e.shiftKey ||
		c == 94/*^*/  &&  e.shiftKey ||
		c == 38/*&*/  &&  e.shiftKey ||
		c == 59/*;*/  && !e.shiftKey ||
		c == 39/*'*/  && !e.shiftKey ||
		c == 44/*,*/  && !e.shiftKey ||
		c == 60/*<*/  &&  e.shiftKey ||
		c == 62/*>*/  &&  e.shiftKey) && layout != 'EN'
	) {
		layout = 'en';
	} 
	else if (c >= 65/*A*/ && c <= 90/*Z*/  && !e.shiftKey || c >= 97/*a*/ && c <= 122/*z*/ &&  e.shiftKey) {
		layout = 'EN';
	} 
	else if (c >= 1072/*а*/ && c <= 1103/*я*/ && !e.shiftKey ||
		c >= 1040/*А*/ && c <= 1071/*Я*/ &&  e.shiftKey ||
		(c == 1105/*ё*/ && !e.shiftKey ||
		c == 1025/*Ё*/ &&  e.shiftKey ||
		c == 8470/*№*/ &&  e.shiftKey ||
		c == 59/*;*/   &&  e.shiftKey ||
    	c == 59/*;*/   && !e.shiftKey ||
		c == 44/*,*/   &&  e.shiftKey) && layout != 'RU'
	) {
		layout = 'ru';
	} else if (c >= 1040/*А*/ && c <= 1071/*Я*/ && !e.shiftKey || c >= 1072/*а*/ && c <= 1103/*я*/ &&  e.shiftKey || (c == 63 && e.shiftKey)  || (c == 44 && e.shiftKey)) {
		layout = 'RU';
	}	
	else if(c == 46 || (c == 58 && e.shiftKey)|| (c == 47 && e.shiftKey)) {
		layout = 'ru';
	}
	
	return !layout?'EN':layout;
}

    	
/**
 * set caret
 */
function setCaretPosition(ctrl, pos) {
    if(ctrl.setSelectionRange) {
		ctrl.focus();
		ctrl.setSelectionRange(pos,pos);
	}
	else if (ctrl.createTextRange) {
		var range = ctrl.createTextRange();
		range.collapse(true);
		range.moveEnd('character', pos);
		range.moveStart('character', pos);
		range.select();
	}
}
