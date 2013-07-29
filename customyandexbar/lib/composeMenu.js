const updateMails = require("./updateMails.js");

function refresh(button, Request, data, tabs, settingsApp) {
    
    updateMails.check(Request, function(result) {

        
        /**
         * update item
         */
        var updateMails = {
            id: 'update-mail',
    		label: 'Обновить ящик',
    		tooltiptext: 'Обновить ящик',
    		image: data.url('refresh.png'),
    		type: 'button',
    		onCommand: function(evt) {
                settingsApp.setter('menu_show', false);
    			refresh(button, Request, data, tabs, settingsApp);
    		}
    	};
        /**
         * create mail item
         */
        var createMail = {
    		id: "create-mail",
    		label: "Написать письмо",
    		tooltiptext: "Перенаправляет на страницу для создания письма",
    		type: "button",
    		onCommand: function() {
    			// Open tab
    			tabs.open("http://mail.yandex.ru/neo2/#compose/");
                settingsApp.setter('menu_show', false);
    		}
    	};
        /**
         * settings item
         */
        var settings = {
    		id: 'menu-settings',
    		label: 'Настройки',
    		tooltiptext: 'Изменить настройки',
    		image: data.url('settings.png'),
    		type: 'menu',
    		items: [
    		{
    			id: "urlbar-corrector",
    			label: "Корректор адресной строки",
    			type: "checkbox",
    			checked: settingsApp.storage.corrector == undefined ? true : settingsApp.storage.corrector,
                onCommand: function() {
                    settingsApp.setter('menu_show', false);
                    settingsApp.setter('corrector', !settingsApp.getter('corrector'));
                    settingsApp.storage.corrector = settingsApp.getter('corrector');
                }
    		},{
    			id: "event-mailto",
    			label: "Обрабатывать mailto?",
    			type: "checkbox",
    			checked: settingsApp.storage.mailto == undefined ? true : settingsApp.storage.mailto,
                onCommand: function() {
                    settingsApp.setter('menu_show', false);
                    settingsApp.setter('mailto', !settingsApp.getter('mailto'));
                    settingsApp.storage.mailto = settingsApp.getter('mailto');
                }
    		},{
        		id: "event-translate",
    			label: "Переводить текст (EN->RU)",
    			type: "checkbox",
    			checked: settingsApp.storage.translate == undefined ? false : settingsApp.storage.translate,
                onCommand: function() {
                    settingsApp.setter('menu_show', false);
                    settingsApp.setter('translate', !settingsApp.getter('translate'));
                    settingsApp.storage.translate = settingsApp.getter('translate');
                }
    		}]
    	};
        /**
         * exit item
         */
        var exit = {
    		id: 'menu-exit',
    		label: 'Выход',
    		tooltiptext: 'Выйти',
    		image: data.url('auth.png'),
    		onCommand: function() { 
                settingsApp.setter('menu_show', false);
    			tabs.open("https://passport.yandex.ru/passport?mode=logout&target=bar&yu=" + settingsApp.getter('yandexid'));
    		}
    	};
        /**
         * unread item
         */
        var unread = {
    		id: "unread-mail-counter",
    		label: "Непрочитано ("+ result.mails +")",
    		tooltiptext: "Количество непрочитанных сообщений",
    		type: "button",
    		image: result.mails==0?data.url('no_mails.png'):data.url('yes_mails.png'),
    		//checked: (settings.retrieve("site").this),
    		onCommand: function() {
                settingsApp.setter('menu_show', false);
    			tabs.open("http://mail.yandex.ru/neo2/#inbox/extra_cond=only_new");
    		}
    	};
		
        /**
         * unread mail view
         */ 
         
        if(result != false) {
            for(var i=0, array = []; i < result.unread.length; i++) {
                
                ~function(result, i) {
                   array.push({
                    	id: 'unread-mail-item'+i,
            			label: result.unread[i]['subject'],
                	    tooltiptext: result.unread[i]['subject'] + ' - ' + result.unread[i]['from'],
            			type: "button",
                    	onCommand: function() {
                            settingsApp.setter('menu_show', false);
            			    tabs.open(result.unread[i]['url']); //tabs.open
            		    }
            		});
                }(result, i);
       
            };
    		
            var unreadView = {
        		id: "unread-mail",
        		label: "Непрочитанные письма",
        		tooltiptext: "Непрочитанные письма",
        		type: "menu",
        		items: array
        	};            
        }

        
        
    
    
        if(!result) {
             var compose = [
                updateMails,
                null,
                settings
            ];       
        
            button.button().setAttribute('label', 'Войти');
        }
        else {
            var compose = [
                updateMails,
                null,
                unread,
                createMail,
                null,
                unreadView,
                null,
                settings,
                exit
            ];
            
            button.button().setAttribute('label', result.mails);
        }

        
        button.clearMenu();

        // update
        button.newMenu(compose);
    });
}

function urldecode (str) {
  return decodeURIComponent((str + '').replace(/\+/g, '%20').replace(/&amp;/g, '&'));
}

exports.refresh = refresh;
