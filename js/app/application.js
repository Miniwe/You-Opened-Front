var Application = function ( opts )
{
    this.globalPath = opts.path || "";
    
    this.frameworkPath = "/framework";
    
    this.templates_load_completed = 0;
    this.templates = opts.templates || [];
    
    this.sessionkey = "";
    
    this.siteUser         = null;
    
    this.markers     = [];
    this.fragments   = [];
    this.branches    = {};
    this.posts       = {};
    this.tags        = {};  
    this.users       = {};
    this.words       = {};
    
    this.ajaxRequests = [];
    this.ajaxCount = 0;
    this.ajaxTimer = 0;
    
    this.View = new ApplicationView ( this );
    
    /*
     *  Двигаемся по списку цветов для веток,
     *  По достижении конца переходим вначало списка
     */
    this.nextColor = ( function ( )
    {
        var colors = ["#9c00ff", "#0000ff", "#007bff", "#00dbe6", "#00ff00", "#ff23ff", "#4400ff", "#0038ff",
                      "#00fcff", "#00ff83", "#00ff00", "#89d700", "#e700ff", "#00d4ff", "#40ff00", "#fd7a00",
                      "#ff1f00", "#e2fd00", "#00ffcb", "#C0FF80", "#B5F886", "#ABF18D", "#A0EA94", "#96E39B",
                      "#8CDCA2", "#81D5A9", "#77CEB0", "#6CC8B6", "#62C1BD", "#58BAC4", "#4DB3CB", "#43ACD2",
                      "#39A5D9", "#2E9EE0", "#2498E6", "#1991ED", "#0F8AF4", "#0583FB", "#0080FF", "#0A79F6",
                      "#1472EE", "#1E6BE6", "#2864DD", "#325DD5", "#3C56CD", "#464FC5", "#5048BC", "#5A41B4",
                      "#653AAC", "#6F33A4", "#792C9B", "#832693", "#8D1F8B", "#971882", "#A1117A", "#AB0A72"];
        var cnt = 0;
        return function () { 
            if (cnt >= colors.length) {
                cnt = 0;
            }
            var color = colors[cnt];
            cnt ++;
            return color;
        }
    } ) ( );
    
    /*
     * @name Кеширование шаблонов 
     * 
     * Возвращает управление в основную программму когда подгрузка завершена
     * сделано через dereferer 
     */
    this.cacheTemplates = function ( )
    {
        var Application = this,
            dfd = $.Deferred(),
            d = new Date();
            
        Application.templates_load_completed = 0;
        for (var i=0; i < this.templates.length; i++) {
            $.ajax('tmpl/'+ this.templates[i] +".html", {
               url : 'tmpl/'+ this.templates[i] + '.html',
               context: {
                    templateName : this.templates[i] 
                },
               success : function ( templateBody, status, object ) {
                    Application.templates_load_completed ++;

                    $("<script id='tmpl-"+ this.templateName +"' type=\"text/x-jquery-tmpl\">"+ templateBody + "</script>").appendTo('body');

                    $("#tmpl-" + this.templateName).template( this.templateName );
                    
                    (Application.templates_load_completed == Application.templates.length) ?  dfd.resolve({}) : "";
                   
               },
               data : {
                template: this.templates[i],
                t: d.getTime()
               } 
            });
            
            /*
            {
            }, function (templateBody) {

                
            });
            */
        }
        
        return dfd.promise();
    };
    
    this.closeAllFragments = function ( )
    {
       var markerIndex = 0,
           fragmentIndex = 0,
           curMarkerFragments = null;
        for (markerIndex = this.markers.length; markerIndex--; )
        {
            var curMarkerFragments = this.markers[markerIndex].fragments;
            for ( fragmentIndex = curMarkerFragments.length; fragmentIndex--; )
            {
                curMarkerFragments[fragmentIndex].View.closeContent();
            }
        }
    };
    
    /*
     * Оставнока всех ajax запросов
     * @todo 1) надо доделать
     * @todo 2) возможно надо сделать возможность останавливать определенный класс запросов 
     */
    this.ajaxStop = function ( ) 
    {// @todo until dont working
        for (var i=0,l=this.ajaxRequests.length;i<l;i++)
        {
//            if (typeof this.ajaxRequests[i].abort == "function" )
//            {
//                typeof this.ajaxRequests[i].abort();
//            }
        }
        return false;
    };
    
    /*
     *  Глобальная проверка результатов запроса
     *  @param data object
     */
    this.checkResponse = function ( data )
    {
        return true;
    }
    
    /*
     * Глобальная функция отправки запросов на сервер
     * Все остаальные получают данные через нее
     * @param url String
     * @param success funciton 
     * @param error funciton
     * @param data object
     */
    this.ajaxRequest = function ( url, success, error, data ) {
        var data = data || {};
        data.sessionKey = this.sessionkey;
        var Application = this;
        
        var ajaxOpts = {
            type      : /*data.type || */'get',
            url       : this.globalPath + this.frameworkPath + url,
            success   : function (data, textStatus, jqXHR) { 
                
                if ( !Application.checkResponse( data ) ) {
                    Application.msg('Error in response data');
                    return false;
                }
                // [pre actions]
                success.call( Application, data, textStatus, jqXHR );
                // [post actions] 
                
            },
            dataType  : 'jsonp',
            jsonp     : 'jsonp_callback',
            data      : data,
            error     : error,
            timeout   : 30000,
            beforeSend : function () {
                Application.ajaxCount ++;
                Application.ajaxTimer = setTimeout(function() {
                    Application.animateLoader.call()
                }, 25);
            },
            complete : function () {
                Application.ajaxCount --;
                Application.ajaxTimer = setTimeout(function() {
                    Application.animateLoader.call()
                }, 25);
            }
        }; 

        this.ajaxRequests.push( $.ajax( ajaxOpts ) );
    };
    
    /*
     * анимация загрузчика
     */        
    this.animateLoader = function ( ) {
        
        if (this.ajaxCount > 0) {
            /* process show */
            clearTimeout( this.ajaxTimer );
            this.ajaxTimer = setTimeout(function() {
                this.animateLoader.call()
            }, 75);
        }
        else {
            /* stop show */
            clearTimeout( this.ajaxTimer );
        }
        
            
    };
    
    /*
     */
    this.logoutUser = function ( ) {
//        @todo доделать разлогинивание - не работает корректо сейчас
//      чистка всего
//      изменение Экрана

        this.siteUser = null;
        
        this.sessionkey = '';
        
        $.cookie("SessionKey", "", {
            expires: 7,
            path: '/',
            domain: '.youopened.com'
        });
    }
    
    
    /*
     * Вывод сообщения
     */
    this.msg = function (message, mode)
    {
        if ( 'console' == mode ) {
                console.log(message);
        }
        else {
            alert(message);
        }
        
    };
    
    /*
     * 
     */
    this.processAuthResponse = function ( response )
    {
        if ( response.Result.IsSuccess == "True") {
            
            var newData = this.parseResponseData( response );
            
            if ( response.SessionKey != null ) {
                
                // save key to cookies and app
                $.cookie("SessionKey", response.SessionKey, {
                    expires: 7,
                    path: '/',
                    domain: '.youopened.com'
                });
                this.sessionkey = response.SessionKey;
                
                if ( !newData.users.length )
                {
                    this.msg( "Auth result: Error with user data");
                    return false;
                }
                
                // save user data to siteUser
                this.siteUser = this.users[newData.users[0]] ;
                
                // clear userarea
                // show userInfo form
                this.View.fillUserArea( true );
            }
            else {
                // show message
                this.msg( "Auth result: true but no sessionKey", 'console');
                this.View.fillUserArea( false );
            }
            this.msg( "Auth result: " + response.Result.UserInfo, 'console' );

        }
        else {
            this.msg( "Auth error: " + response.Result.UserInfo );
            this.View.fillUserArea( false );
        }
    };
    
    /*
     * 
     */
    this.userState = function ( )
    {
            this.ajaxRequest('/Auth.js',
            function( response ) {
                
                this.processAuthResponse ( response );
            },
            function(){
                var userAuthorized = false;
                this.msg('Auth error', 'console');
                this.View.fillUserArea( userAuthorized );
            },
            {
                procedure: "SignState"
            }
        );
        
        /* 
         * сделать заполнение реальными данными userarea 
         * после авторизации запустить функцию проверки directmessage
         * если что то есть то указывать это како то...
         */
    };

    /*
     * Точка входа для приложения
     * - Запуск
     * - Обновление состояния экрана в зависимости от пользователя
     */
    this.run = function ( ) {
        var Application = this;
        $.when ( this.cacheTemplates() )
            
            .then(function ( ) {
                /* start Application here */
                Application.View.attachBehavior();
                
                Application.userState();
                
                Application.router();
            });
    };
    
    this.branchExist = function ( postId )
    {
        for (var id in this.branches)
        {
            if (this.branches[id].postId == postId)
            {
                return this.branches[id];
            }
        }
        
        return false;
    };

    /*
     * Загрузка страницы по умолчанию 
     */
    this.loadIndexPage = function ( ) {
        var marker = new Marker( this );
        marker.setName('Index:girls');
        marker.addParams( {
            'query' : 'girls'
        } );
        marker.setAction ( function ( newData ) {
          this.addFragments( newData );
          this.makeActive();
        } );

        this.markers.push( marker );
        
        marker.makeRequest();
    }
        
    /*
     * Загрузка страницы ошибки по умолчанию 
     */
    this.loadErrorPage = function ( msg )
    {
        
    }
    
    /*
     * Определение команд в зависимости от изменения строки адреса
     * @param hash String||undefined - возможность задать команду вручную
     */
    this.router = function ( hash ) 
    {
        var hash = hash || document.location.hash;
        
        var result = false/*hash.match(/(post|user)(-?([0-9]+)))*/;
        
        result = (!result || result[1] == undefined)?[null,"index"]:result;
        

        switch ( result[1] ) 
        {
            case "index":
                this.loadIndexPage();
                break;
            default:
                this.loadErrorPage("No action");
        }
        
    }
 
    this.parseResponseData = function ( data )
    {
        
        var newData = {
                users    : [],
                tags    : [],
                branches    : [],
                posts       : []
            }, 
            id // loop counter
            ;
        
        if (!data) return newData;
        
        if ( data.Users != undefined )
        {
            for (var id in data.Users)
            {
                if (this.users[id] == undefined)
                {
                    this.users[id] = new User( this, id, data.Users[id] );
                }
                else
                {
                    this.users[id].update( data.Users[id] );
                }

                newData.users.push(id);
            }
        }
        
        if ( data.Tags != undefined )
        {
            for (var id in data.Tags)
            {
                if (this.tags[id] == undefined)
                {
                    this.tags[id] = new Tag( this, id, data.Tags[id] );
                }
                else
                {
                    this.tags[id].update( data.Tags[id] );
                }

                newData.tags.push(id);
            }
        }
        
        if ( data.Posts != undefined )
        {
            for (var id in data.Posts)
            {
                if (this.posts[id] == undefined)
                {
                    this.posts[id] = new Post( this, id, data.Posts[id] );
                }
                else
                {
                    this.posts[id].update( data.Posts[id] );
                }

                newData.posts.push(id);
            }
        }
        if ( data.Branches != undefined )
        {
            for (var id in data.Branches)
            {
                if (this.branches[id] == undefined)
                {
                    this.branches[id] = new Branch( this, id, data.Branches[id] );
                    this.branches[id].color = this.nextColor();

                }
                else
                {
                    this.branches[id].update( data.Branches[id] );
                }
                
                newData.branches.push(id);
            }
        }
//        console.log( 'Application data', this, this.posts, this.branches, this.tags, this.tags );
        return newData;
    };
    
    /*
     *  Библиотечканя функция конвертации массива данных формы в объект
     *  @param formArray @todo describe type
     *  @return object
     */
    this.formArrayToData = function ( formArray ) 
    {
        var out = {};
        for (i in formArray)
        {
            out[formArray[i].name] = formArray[i].value;
        }
        
        return out;
    };    
    
    
    return this;
};

