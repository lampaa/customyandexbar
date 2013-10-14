const toolbarbutton = require("./toolbarbutton.js");
const data = require("self").data;
const Request = require("sdk/request").Request;
const tabs = require("tabs");
const settings = require("./settings");
const composer = require("./composeMenu.js");
const tmr = require("timer");
const panelOpn = require('./panelManager.js').main;

const stylesheet = require("./addstylesheet.js");
stylesheet.addXULStylesheet(data.url("stylesheet.css"));

var exit_link = '';
var button;

// Start Menu **
function makeMenu() {
    var menu = {
        id: 'yandex-menu',
        position: 'after_start',
        items: [],
        onShow: function() {
            settings.setter('menu_show', true);
        },
        onHide: function() {
            settings.setter('menu_show', false);
        }
    }
    
    return menu;
}
// End Menu **

function createButton() {

    console.log(data.url('panel.html'));


    
    
    return toolbarbutton.ToolbarButton({
        id: "yandex-mail",
        label: "Yandex-mail",
        tooltiptext: "Yandex-mail",
        image: data.url("mail.png"),
        menu: makeMenu(),
        onCommand: function() {
            if(!settings.getter('menu_show')) {
            
                // способ открытия
                if(!settings.getter('opentype')) {
                    
                    var elem = panelOpn({
                        width: '100%',
                        height: '100%',
                        contentType: 'iframe',
                        content: 'http://mail.yandex.ru/neo2/',
                        left: 0,
                        top: 0,
                        onLoad: function() {
                            var content = this.contentDocument;
                            /**
                             * hide first no-script
                             */ 
                            var no_script = content.getElementsByTagName('noscript')[0];
                            
                            if(no_script != undefined) {
                                no_script.style.display = 'none';
                            }
                        }
                    });
                    
                    elem.open();
                }
                else {
                    tabs.open('http://mail.yandex.ru/neo2/');
                }
            }
        }
    });
}



function makeButton(move) {
    button = createButton();
    
    composer.refresh(button, Request, data, tabs, settings);
    
    tmr.setInterval(function() {
        composer.refresh(button, Request, data, tabs, settings);
    }, 1000*60*2);
    
    
    // On install moves button into the toolbar
    button.moveTo({
        toolbarID: "nav-bar",
        forceMove: false
    }); 
}


function reload() {
    button.destroy();
    makeButton();
}


exports.makeButton = makeButton;
exports.reload = reload;