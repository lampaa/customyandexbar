/**
 *
 */
const {unload} = require("unload+");
const {listen} = require("listen");

const wuntils = require('sdk/window/utils');
const window = wuntils.getMostRecentBrowserWindow();
const document = window.document;
const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
/**
 *
 */
function xul(type) window.document.createElementNS(NS_XUL, type);
function $(id) window.document.getElementById(id);
/**
 *
 */          
function createMenu(input) {
    var menu = xul("menu");
	var submenu = xul ("menupopup");
	submenu.setAttribute("id",input.id + "-popup");
	menu.setAttribute("contextmenu",submenu.id);
        
	input.items.forEach(function(mitem) {
		let tbmi = xul("menuitem");
    		
		if (mitem) {
			if (mitem.type == "menu"){
				tbmi = xul("menu");
				tbmi.setAttribute ("items", mitem.items);
                    
				if (mitem.onShow) {
					tbmi.addEventListener("popupshowing", mitem.onShow, false);
				}
				if (mitem.onHide) {
					tbmi.addEventListener("popuphidding", mitem.onHide, false);
				}   
				tbmi = createMenu(mitem);
			} 
    			
			if (mitem.id) tbmi.setAttribute("id", mitem.id);
			if (mitem.label) tbmi.setAttribute("label", mitem.label);
			if (mitem.image) {
				tbmi.setAttribute("class", "menuitem-iconic");
				tbmi.setAttribute("image", mitem.image);
				//tbmi.style.listStyleImage = "url('" + mitem.image + "')";
			}
				
			if (mitem.type) tbmi.setAttribute("type", mitem.type);
			if (mitem.checked) tbmi.setAttribute("checked", mitem.checked);
			if (mitem.tooltiptext) tbmi.setAttribute("tooltiptext", mitem.tooltiptext);
    			
			if (mitem.onCommand) tbmi.addEventListener("command", function() {
				if (mitem.onCommand) {
					mitem.onCommand();
				}
			} ,true);
		}
		else {
			tbmi = xul("menuseparator");
		} 
		submenu.appendChild(tbmi);
	});
		
	menu.appendChild(submenu);
	return menu;
}
/**
 *
 */ 
exports.ToolbarButton = function ToolbarButton(options) {
	var unloaders = [],
	toolbarID = "",
	insertbefore = "",
	destroyed = false,
	destroyFuncs = [],
    tbm_val = "";
    
							
        	// Create toolbar button
        	let tbb = xul("toolbarbutton");
        	tbb.setAttribute("id", options.id);
        			
        	if (options.menu) {
        		tbb.setAttribute("type", "menu-button");
        	} else {
        		tbb.setAttribute("type", "button");
        	}
        			
        	if (options.tooltiptext) tbb.setAttribute("tooltiptext", options.tooltiptext);
        	if (options.image) tbb.setAttribute("image", options.image);
        			
        	tbb.setAttribute("class", "toolbarbutton-1 chromeclass-toolbar-additional");
        	tbb.setAttribute("label", options.label);
        		
        					
        	// use this if you need to discriminate left/middle/right click
        	// return true if you want to prevent default behaviour (like the showing of the context-menu on right click)
        	tbb.addEventListener("click", function (evt) {
        		if (options.onClick) {
        			if (options.onClick(evt)) evt.preventDefault(); // evt is a MouseEvent (so you can use evt.button to know which mouse button was pressed)
        				if (options.panel) {
        					options.panel.show(tbb);
        				}
        			}
        		}, 
        	true);
        
            				
        	tbb.addEventListener("command", function() {
        		if (options.onCommand) {
        			options.onCommand(tbb, options);
        		}
        						
        		if (options.panel) {
        			options.panel.show(tbb);
        		}
        	}, true);					
        					
        	// Create toolbar button menu
        	if (options.menu) {
        		let tbmid = options.menu.id;
        		tbb.setAttribute("contextmenu", tbmid);
        						
        		// Create menu popup
        		let tbm = xul("menupopup");
                tbm_val = options.menu.id;
                
        		options.menuEl = tbm;
        		tbm.setAttribute("id", tbmid);
        		tbm.setAttribute("type", "menu");
        				
        		if (options.menu.position) {
        			tbm.setAttribute("position", options.menu.position);
        		} 
        		else {
        			tbm.setAttribute("position", "after_start");
        		}
        		if (options.menu.onShow) {
        			tbm.addEventListener("popupshowing", options.menu.onShow, false);
        		}
        		if (options.menu.onHide) {
        			tbm.addEventListener("popuphidding", options.menu.onHide, false);
        		}
        						
        						
        		options.menu.items.forEach(function(mitem) {
        			let tbmi = xul("menuitem");
        					
        			if (mitem) {
        				if (mitem.type == "menu"){
        					tbmi.setAttribute ("items", mitem.items);
        					tbmi = createMenu(mitem);
        					tbmi.setAttribute ("type","menu");
        					if (mitem.onShow) {
        						tbmi.setAttribute("popupshowing", mitem.onShow);
        					}
        					if (mitem.onHide) {
        						tbmi.setAttribute("popuphideing", mitem.onHide);
        					}
        				} 
        						
        				if (mitem.id) tbmi.setAttribute("id", mitem.id);
        				if (mitem.label) tbmi.setAttribute("label", mitem.label);
        				if (mitem.image) {
        					tbmi.setAttribute("class", "menuitem-iconic");
        					tbmi.setAttribute("image", mitem.image);
        					//tbmi.style.listStyleImage = "url('" + mitem.image + "')";
        				}
        						
        				if (mitem.type) tbmi.setAttribute("type", mitem.type);
        				if (mitem.checked) tbmi.setAttribute("checked", mitem.checked);
        				if (mitem.tooltiptext) tbmi.setAttribute("tooltiptext", mitem.tooltiptext);
        						
        				if (mitem.onCommand) tbmi.addEventListener("command", function() {
        					if (mitem.onCommand) {
        						mitem.onCommand();
        					}
        				}, true);
        			}
        			else {
        				tbmi = xul("menuseparator");
        			} 
        					
        			tbm.appendChild(tbmi);
        		});
        				
        		tbb.appendChild(tbm);
        	}
        					
        	// add toolbarbutton to palette
        	($("navigator-toolbox") || $("mail-toolbox")).palette.appendChild(tbb);
        					
        	// find a toolbar to insert the toolbarbutton into
        	if (toolbarID) {
        		var tb = $(toolbarID);
        	}
        	if (!tb) {
        		var tb = toolbarbuttonExists(document, options.id);
        	}
        					
        	// found a toolbar to use?
        	if (tb) {
        		let b4;
        						
        		// find the toolbarbutton to insert before
        		if (insertbefore) {
        			b4 = $(insertbefore);
        		}
        		if (!b4) {
        			let currentset = tb.getAttribute("currentset").split(",");
        			let i = currentset.indexOf(options.id) + 1;
        							
        			// was the toolbarbutton id found in the curent set?
        			if (i > 0) {
        				let len = currentset.length;
        				// find a toolbarbutton to the right which actually exists
        				for (; i < len; i++) {
        					b4 = $(currentset[i]);
        					if (b4) break;
        				}
        			}
        		}
        						
        		tb.insertItem(options.id, b4, null, false);
        	}
        					
        	var saveTBNodeInfo = function(e) {
        		toolbarID = tbb.parentNode.getAttribute("id") || "";
        		insertbefore = (tbb.nextSibling || "") && tbb.nextSibling.getAttribute("id").replace(/^wrapper-/i, "");
        	};
        					
        	window.addEventListener("aftercustomization", saveTBNodeInfo, false);
        					
        	// add unloader to unload+'s queue
        	var unloadFunc = function() {
        		tbb.parentNode.removeChild(tbb);
        		window.removeEventListener("aftercustomization", saveTBNodeInfo, false);
        	};
        			
        	var index = destroyFuncs.push(unloadFunc) - 1;
            
            listen(window, window, "unload", function() {
                destoryFuncs[index] = null;
            }, false);
        	
        	unloaders.push(unload(unloadFunc, window));


    
		
	return {
		clearMenu: function() {
            var tbm_i = document.getElementsByAttribute("id", tbm_val)[0];
            
            if(tbm_i) {
         		while(tbm_i.hasChildNodes()){
    				tbm_i.removeChild(tbm_i.firstChild);
    			};	               
            }
		},
        newMenu: function(input) {
            input.forEach(function(mitem) {
                let tbmi_new = xul("menuitem");
            	if (mitem) {
            		if (mitem.type == "menu"){
            			tbmi_new.setAttribute ("items", mitem.items);
            			tbmi_new = createMenu(mitem);
            			tbmi_new.setAttribute ("type","menu");
                        
                        if (mitem.onShow) {
                            tbmi_new.addEventListener("popupshowing", mitem.onShow, false);
                        }
                        if (mitem.onHide) {
                            tbmi_new.addEventListener("popuphidding", mitem.onHide, false);
                        }   
            		} 
            			
            		if (mitem.id) tbmi_new.setAttribute("id", mitem.id);
            		if (mitem.label) tbmi_new.setAttribute("label", mitem.label);
            			
            		if (mitem.image) {
            			tbmi_new.setAttribute("class", "menuitem-iconic");
            			tbmi_new.setAttribute("image", mitem.image);
            			//tbmi_new.style.listStyleImage = "url('" + mitem.image + "')";
            		}
            			
            		if (mitem.type) tbmi_new.setAttribute("type", mitem.type);
            		if (mitem.checked) tbmi_new.setAttribute("checked", mitem.checked);
            			
            		if (mitem.tooltiptext) tbmi_new.setAttribute("tooltiptext", mitem.tooltiptext);
            			
            		if (mitem.onCommand) tbmi_new.addEventListener("command", function() {
            			if (mitem.onCommand) {
            				mitem.onCommand();
            			}
            		} ,true);
            	}
            	else {
            		tbmi_new = xul("menuseparator");
            	} 
                
                var tbm_i = document.getElementsByAttribute("id", tbm_val)[0];
            
                tbm_i.appendChild(tbmi_new);
            });
           
        },
		button: function() {
			return document.getElementById(options.id);
		},
		destroy: function() {
			if (destroyed) return;
			destroyed = true;
					
			if (options.panel) options.panel.destroy();
					
			// run unload functions
			destroyFuncs.forEach(function(f) f && f());
			destroyFuncs.length = 0;
					
			// remove unload functions from unload+'s queue
			unloaders.forEach(function(f) f());
			unloaders.length = 0;
		},
		moveTo: function(pos) {
		
			if (destroyed) return;
					
			// record the new position for future windows
			toolbarID = pos.toolbarID;
			insertbefore = pos.insertbefore;
						
			// if the move isn't being forced and it is already in the window, abort
			if (!pos.forceMove && $(options.id)) return;
						
			var tb = $(toolbarID);
			var b4 = $(insertbefore);
							
			// TODO: if b4 dne, but insertbefore is in currentset, then find toolbar to right
			if (tb) tb.insertItem(options.id, b4, null, false);
		}
	};
};
		
function toolbarbuttonExists(document, id) {
	var toolbars = document.getElementsByTagNameNS(NS_XUL, "toolbar");
	
	for (var i = toolbars.length - 1; ~i; i--) {
		if ((new RegExp("(?:^|,)" + id + "(?:,|$)")).test(toolbars[i].getAttribute("currentset"))) return toolbars[i];
	}
	
	return false;
}