
var Application = function ( opts )
{
    
    this.globalPath = opts.path || "";
    
    this.frameworkPath = "/framework";
    
    this.bTmplCompleted = 0;
    this.templates = opts.templates || [];
    
    this.sessionkey = opts.sessionkey;
    
    this.siteUserTimer    = null;
    this.siteUser         = null;
    
    this.branches    = {};
    this.posts       = {};
    this.tags        = {};  
    this.users       = {};
    this.words       = {};
    
    this.ajaxRequests = [];
    this.ajaxCount = 0;
    this.ajaxTimer = 0;
   
    /*
     * @name Кеширование шаблонов 
     * 
     * Возвращает управление в основную программму когда подгрузка завершена
     * сделано через dereferer 
     */
    this.cacheTemplates = function ()
    {
        
        var dfd = $.Deferred();
        for (var i=0; i < this.templates.length; i++)
        {
            var d = new Date();
            
            var Application = this;
            
            $.get('tpl/'+ this.templates[i] +".html?t="+d.getTime(), {
                template: this.templates[i]
            }, function (templateBody) {

                Application.bTmplCompleted ++;
                
                var objData = parseQueryFormatData(this.data);
        
                $("<script id='tmpl-"+ objData.template +"' type=\"text/x-jquery-tmpl\">"+ templateBody + "</script>").appendTo('body');

                $("#tmpl-" + objData.template).template(objData.template);
                
                (Application.bTmplCompleted == Application.templates.length) ? dfd.resolve({}) : "";
                
            });
        }
        
        return dfd.promise();
    };
    
    /*
     * Оставнока всех ajax запросов
     * @todo 1) надо доделать
     * @todo 2) возможно надо сделать возможность останавливать определенный класс запросов 
     */
    this.ajaxStop = function ( ) // @todo until dont working
    {
        this.c
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
     * Обновление данных пользователя и соотвествующего состояния интерфейса 
     */
    this.userState = function ( )
    {
    };
    
    /*
     * Глобальная функция отправки запросов на сервер
     * Все остаальные получают данные через нее
     * @param url String
     * @param success funciton 
     * @param error funciton
     * @param data object
     */
    this.ajaxRequest = function (url, success, error, data)
    {
        var data = data || {};
        data.sessionkey = this.sessionkey;
        var Application = this;
        
        var ajaxOpts = {
            type      : /*data.type || */'get',
            url       : this.globalPath + this.frameworkPath + url,
            success   : function (data, textStatus, jqXHR) { 
                
                // [pre actions]
                success.call(Application, data, textStatus, jqXHR);
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
     * Обновление данных пользователя
     * @param data object of arrays {discussions:[],posts:[],users:[],... ect }
     */
    this.updateSiteUser = function ( data ) {
     };
        
    /*
     * анимация загрузчика
     */        
    this.animateLoader = function ( ) {
        
        if (this.ajaxCount > 0)
        {
            /* process show */
            clearTimeout( this.ajaxTimer );
            this.ajaxTimer = setTimeout(function() {
                this.animateLoader.call()
            }, 75);
        }
        else
        {
            /* stop show */
            clearTimeout( this.ajaxTimer );
        }
        
            
    };
    
    /*
     * Вывод сообщения
     */
    this.msg = function (message, mode)
    {
        if (mode == 'console')
        {
            console.log(message);
        }
        else
        {
            alert(message);
        }
        
    };

    /*
     * Точка входа для приложения
     * - Запуск
     * - Обновление состояния экрана в зависимости от пользователя
     */
    this.run = function ()
    {
        var Application = this;
        
        $.when ( this.cacheTemplates() )
            
            .then(function ( ){
                /* start Application here */
                Application.router();
            });
    };
    
    /* 
     * Отрисовка веток
     *  @param branchesArray - массив веток которые необходимо отрисовать
     *  @param clearFlag - true=запускает предварительно очистку страницы
     */
    this.drawBranches = function ( brAr, clearFlag )
    {
        var i;
        if ( clearFlag )
        {
            this.clearPage();
        }
        
        for ( i = brAr.length; i--; )
        {
            this.branches[brAr[i]].render($("#main-container"), 'branch', 'appendTo', 'main-container');
        }
        
    }
    
    /*
     * Очистка страницы
     */
    this.clearPage = function ()
    {
        $("#main-container").find("*").remove();
    }
    /*
     * Загрузка страницы по умолчанию 
     */
    this.loadIndexPage = function ( )
    {
        var Application = this;
        
        this.ajaxRequest('/Slice.json'
        , function ( response ) {
            var newData = this.parseResponseData(response);
            
            Application.drawBranches(newData.branches, true);
            
        }
        , function (){
            console.log('loadIndexPage', 'request error');
        }
        , {
//            query : "girls"
        });
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
        
        var result = hash.match(/(post|user)(-?([0-9]+))*/);
        
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
                branches    : [],
                posts       : []
            }, 
            i, // loop counter
            pid // parent branch id
            ;
        
        if (!data) return newData;
        
        if ( data.Posts != undefined )
        {
            for ( id in data.Posts)
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
            for ( id in data.Branches)
            {
                if (this.branches[id] == undefined)
                {
                    this.branches[id] = new Branch( this, id, data.Branches[id] );
                }
                else
                {
                    this.branches[id].update( data.Branches[id] );
                }

                newData.branches.push(id);
            }
            
            /* для всех бранчей сдалать указатели на детей */
            for ( id in this.branches)
            {
                var pid = this.branches[id].parentBranchId;
                if (this.branches[pid])
                {
                    this.branches[pid].branches[id] = this.branches[id];
                }
            }
        }
        
        
        return newData;
    };
    
    return this;
    
};
