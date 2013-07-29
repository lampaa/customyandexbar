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
                var elem = panelOpn({
                    width: '100%',
                    height: '100%',
                    contentType: 'iframe',
                    content: 'http://mail.yandex.ru/neo2/',
                    left: 0,
                    top: 0,
                    onLoad: function() {
                        var content = this.contentDocument;
                        
                        content.getElementsByTagName('noscript')[0].style.display = 'none';
                        
                        var close_div = elem.document.createElement('div');
                        close_div.setAttribute('style','position: fixed; width: 50px; height: 50px; background: red; top:0;right:0;z-index:1000');
                        

                        elem.panel.appendChild(close_div);
                        
                        //.addEventListener('click', function() {
                        
                        close_div.addEventListener('click', function() {
                            elem.hide();
                            
                           tmr.setTimeout(function() {
                              elem.show();
                           }, 1000); 
                        }, true);
                        
                        /**
                         * add close event
                         */
                        //content.getElementById('Options_Cancel').addEventListener('click', elem.close, true);     
                    }
                });
                
                elem.open();
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