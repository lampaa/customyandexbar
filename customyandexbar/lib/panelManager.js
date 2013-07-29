const wuntils = require('sdk/window/utils');
const window = wuntils.getMostRecentBrowserWindow();
const document = window.document;
const data = require('self').data;
/**
 * main start func
 */
/**
 * options:
 *  width: int
 *  height: int
 *  left: int
 *  top: int
 *  id: str
 *  contentType: iframe|my
 *  content: str|[struct]
 *  onLoad: [function]
 *  
 * 
 * 
 * return
 *  resize: (width: int, height: int),
 *  setPosition: (left: int, top: int),
 *  close: (),
 *  hide: (),
 *  open: (),
 *  show: (),
 *  styles: [array],
 *  position: return [left, top],
 *  content: return [XULobject],
 *  start: return str
 */
exports.main = function(options) {
    /**
     * create xul element
     */
    var width = (options.width == undefined)?100:options.width
    , height = (options.height == undefined)?100:options.height
    , left = (options.left == undefined)?0:options.left
    , top = (options.top == undefined)?0:options.top
    , id = (options.id == undefined)?'mozilla_panel':options.id
    , contentType = (options.contentType == undefined)?'iframe':options.contentType
    , onLoad = (options.onLoad == undefined)?false:options.onLoad
    , onClose = (options.onClose == undefined)?false:options.onClose;
    
    if(~width.toString().indexOf('%')) {
        width = window.gBrowser.clientWidth * parseFloat(width)/100;
    }
    if(~height.toString().indexOf('%')) {
        height = window.gBrowser.clientHeight * parseFloat(height)/100;
    }
    
    
    var panel = window.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 'panel');
    //panel.setAttribute("type", "arrow");
    panel.setAttribute('style','width:'+width+'px;border:0;height:'+height+'px');
    panel.setAttribute('noautohide',true);
    panel.setAttribute('noautofocus',true);
    panel.setAttribute('id', id); 
    //panel.style.overflow = 'hidden';
    
    if(options.contentType == 'iframe') {
        var element = document.createElement('iframe');
        element.setAttribute('flex', '1');
        element.setAttribute('transparent', 'transparent');
        element.setAttribute('src', options.content);
        

        /**
         * add onload event
         */
        if(onLoad != false) {
            element.addEventListener('DOMContentLoaded', onLoad, false);
        }
    }
    else {
        element = options.content;
    }
    
    var close_div = document.createElement('span');
    close_div.setAttribute('style','position: fixed !important; height: 0px !important; important;z-index:1000 !important');
    close_div.innerHTML = "<span style='position: absolute; right:0; display: inline-block; background: red; width: 35px; height: 35px; font-size: 20px;cursor: pointer;text-align: center;color: #fff;'>x</span>";               

    panel.appendChild(close_div);
                        
    
    panel.appendChild(element);
    window.gBrowser.mPanelContainer.appendChild(panel);
    
    
    
    
    return {
        position: [left, top],
        content: element,
        status: 'notstart',
        openEvent:'',
        panel: panel,
        element: element,
        container: window.gBrowser.mPanelContainer,
        onLoad: onLoad,
        onClose: onClose,
        document: document,
        
        
        resize: function(w, h) {
            this.panel.style.width = w+'px';
            this.panel.style.height = h+'px';
        },
        setPosition: function(l, t) {
            this.panel.hidePopup();
            this.panel.setAttribute("type", "arrow");
            this.panel.openPopup(this.container, 'overlap', l, t, false, false);
            this.position = [l, t];
        },
        close: function() {
            this.container.removeEventListener('click', this.openEvent, false);
            
            if(this.panel.parentNode == undefined) return;
            
            if(this.onLoad != false) {
                this.element.removeEventListener('DOMContentLoaded', this.onLoad, false);
            }            
            if(this.onClose != false) {
                this.onClose();
            }
            
            this.panel.parentNode.removeChild(panel);        
        },
        setContent: function(content) {
            this.element.setAttribute('src', content);
        },
        open: function() {
            var _ifClick = false
            , _this = this;
            /**
             * add events
             */
            this.panel.addEventListener('click', function() {
                _ifClick = true;
            }, false);
            
            this.openEvent = function() {
                if(_ifClick) {
                    return _ifClick = !_ifClick;
                }
                _this.close();    
                this.removeEventListener('click', _this.openEvent, false);       
            }
            
            this.closeRedEvent = close_div.addEventListener('click', function() {
                this.removeEventListener('click', _this.closeRedEvent, false); 
                _this.close();
            }, true);
            
            
            this.container.addEventListener('click', this.openEvent, false);
            /**
             * open
             */
            this.panel.openPopup(this.container, 'overlap', left, top, false, false);
            this.status = 'show';
        },
        hide: function() {
            this.panel.hidePopup();
            this.status = 'hide';
        },
        show: function() {
            this.panel.openPopup(this.container, 'overlap', this.position[0], this.position[1], false, false);
            this.status = 'show';
        },
        styles: function(array) {
            array.forEach(function(val, key) {
                this.panel.style[key] = val;
            });
        }
    }
}
