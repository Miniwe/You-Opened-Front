
var Application = function ( opts )
{
    
    this.globalPath = opts.path || "";
    
    this.frameworkPath = "/framework";
    
    this.bTmplCompleted = 0;
    this.templates = opts.templates || [];
    
    this.sessionkey = opts.sessionkey;
    
    this.siteUserTimer    = null;
    this.siteUser         = null;
    
    this.fragments   = [];
    this.branches    = {};
    this.posts       = {};
    this.tags        = {};  
    this.users       = {};
    this.words       = {};
    
    this.ajaxRequests = [];
    this.ajaxCount = 0;
    this.ajaxTimer = 0;
    
    this.activeBranch = 0;
    
   
    this.nextColor = (function ( ) {
        var colors = ["#C0FF80", "#B5F886", "#ABF18D", "#A0EA94", "#96E39B", "#8CDCA2", "#81D5A9", "#77CEB0", "#6CC8B6", "#62C1BD", "#58BAC4", "#4DB3CB", "#43ACD2", "#39A5D9", "#2E9EE0", "#2498E6", "#1991ED", "#0F8AF4", "#0583FB", "#0080FF", "#0A79F6", "#1472EE", "#1E6BE6", "#2864DD", "#325DD5", "#3C56CD", "#464FC5", "#5048BC", "#5A41B4", "#653AAC", "#6F33A4", "#792C9B", "#832693", "#8D1F8B", "#971882", "#A1117A", "#AB0A72"];
        var cnt = 0;
        return function () { 
            if (cnt == colors.length) {
                cnt = 0;
            }
            var color = colors[cnt];
            cnt++;
            return color;
        }
    })();
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
     * Отрисовка стартового набора веток
     *  @param branchesArray - массив веток которые необходимо отрисовать
     *  @param clearFlag - true=запускает предварительно очистку страницы
     */
    this.drawBranches = function ( brAr, clearFlag )
    {
        var View, i;
        if ( clearFlag )
        {
            this.clearPage();
        }
        
        
        for ( i = brAr.length; i--; )
        {
            View = this.branches[brAr[i]].render({
                el     : $("#main-container"), 
                tmpl   : 'branch', 
                mode   : 'appendTo',
                parent : 'main-container',
                conditionChilds : false,
                conditionKeys : false
            });
        }
        
    }
    
    this.drawFragments = function ( brAr )
    {
        var fragment, fragmentView, i;
        
        this.clearPage();
        
        for ( i = brAr.length; i--; )
        {
            fragment = new Fragment( Application );
            fragmentView = fragment.render({
                parentView : $("#main-container"),
                insertMode : 'appendTo',
                tmpl : 'fragment'
            });
            fragment.changeBranch( this.branches[brAr[i]] );
            this.fragments.push( fragment );
        }
        
    }
    
    /*
     * Очистка страницы
     */
    this.clearPage = function ()
    {
        $("#main-container").find("article").remove();
    }
    /*
     * Загрузка страницы по умолчанию 
     */
    this.loadIndexPage = function ( )
    {
        
        var Application = this;
        
        this.ajaxRequest('/Slice.json'
        , function ( response ) {
            $("#params-container").show();
            
            var newData = this.parseResponseData(response);
            
//            Application.drawBranches(newData.branches, true);
            Application.drawFragments( newData.branches );
            
        }
        , function (){
            console.log('loadIndexPage', 'request error');
        }
        , 
            Application.prepareParams( )
        );
    }
    

    /*
     * Сборка параметров для запроса
     */
    this.prepareParams = function ( postId )
    {
        var params = {};

        if (postId != undefined)
        {
            params.parentPostId = postId;
        }
        if ($("#query").val() != "" && $("#params-form [name=filter]:checked").val() == "On" )
        {
            params.query = $("#query").val();
        }
        
        if ($("#depth").val() > 1 && $("#params-form [name=mode]:checked").val() == "plain" )
        {
            params.depth = $("#depth").val();
        }
        
        return params;
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
        }
        
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
    
    this.addReplyFormBehavior = function ( facade, View )
    {   
        var Application = this;

        View.find("form.replyform").submit(function(){

            Application.removeReplyForm();
            View.find(".show_reply").removeClass("opened");
            
            var data = Application.formArrayToData($(this).formToArray());
            
            Application.ajaxRequest("/Slice.json", 
                function(data){
                    var newData = Application.parseResponseData(data);
                    
                    facade.openFacade(View);
                    
                    for (var i=0; i< newData.posts.length; i++)
                    {
                        var post = Application.posts[newData.posts[i]];
                        var postView = $("article[data-id='" + post.id + "']");
                        post.openFacade(postView);
                    }
                    
                }, function(){
                    Application.msg("Couldn't post comment");
                },
                data
                );        
            return false;
        });        
        
    };
    
    this.removeReplyForm  = function () 
    {
       $(".reply").hide().remove();
    };
    
    this.updateView  = function () 
    {
        if (this.activeBranch)
        {
            var tmpView = $("article[data-id="+ this.activeBranch.id +"]");
            
            if (tmpView.offset().top+tmpView.outerHeight(true) < $(document.body).scrollTop())
            {
                tmpView.find(".graphContainer")
//                .css({"margin-left":"0px", "top":"0px" })
                .addClass("active")
//                .animate({"margin-left":"100px", "top":"10px" })
                ;
            }
            else
            {
                tmpView.find(".graphContainer")
//                .css({"margin-left":"0px", "top":"0px" })
                .removeClass("active");
            }
            
            var parent = tmpView.attr("data-parent");
            var nextSiblingView = tmpView.nextAll("[data-parent=" + parent + "]").first();
            if (nextSiblingView.length > 0 && ( nextSiblingView.offset().top < $(document.body).scrollTop() ) )
            {
                tmpView.find(".graphContainer")
//                .css({"margin-left":"0px", "top":"0px" })
                .removeClass("active");
            }
                
                
        }
    };

    this.branchExist = function ( postId )
    {
        for (i in this.Application.branches)
        {
            if (this.Application.branches[i].postId == postId)
            {
                return this.Application.branches[i];
            }
        }
        
        return false;
    };

    return this;
    
};
