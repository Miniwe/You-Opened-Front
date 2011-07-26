
var Application = function ( opts )
{
    
    this.globalPath = opts.path || "";
    
    this.frameworkPath = "/framework";
    
    var bTmplCompleted = 0;
    var templates = opts.templates || [];
    
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
                
                var objData = parseGetData(this.data);
        
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
        var Application = this;
        
        Application.ajaxRequest('/slicegetrecenttimelinestatus.json', 
            function( data ){
                
                Application.updateSiteUser(data);

                Application.updateInterfaceByUser();
                
                var newData = Application.parseData(data);
                
                Application.updateMain(newData);
                
                Application.siteUserTimer = setTimeout(function() {
                    Application.userState()
                }, 30000);
                
            },
            function( ){
                message("Couldn't get user timeline");
            }
        );
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
        if (!this.sessionkey || !data.users || data.users.length != 1)
            return false;
        
        if ( this.siteUser )
        {
            this.siteUser.update(data.users[0]);
        }
        else if ( this.sessionkey && data.users && data.users.length == 1)
        {
            this.siteUser = new User(this, data.users[0]);
            this.siteUser.update(data.users[0]);
        }
     };
        
    /*
     * анимация загрузчика
     */        
    this.animateLoader = function ( ) {
        
        var el = $("#loader .progress"); 
        if (this.ajaxCount > 0)
        {
            var color = "hsl(" + Math.round(180 - (180 / 10) * this.ajaxCount) + ", 100%, 50%)";
            el.stop().animate({"opacity":"1"}, "fast");
            el.find(".bar").css({"background-color" : color});
            var f = parseInt(el.css("padding-left"),10);
            if (f > 1)
            {
                $("#loader .progress").css({"padding-left": (f - 1) + "px"});
            }    
            else
            {
                $("#loader .progress").css({"padding-left": 6 +"px"});
            }

            clearTimeout( this.ajaxTimer );
            this.ajaxTimer = setTimeout(function() {
                this.animateLoader.call()
            }, 75);
        }
        else
        {
            el.stop().animate({"opacity": "0"}, "slow");
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
     * Отрисовка дискашенов в незапиненой области 
     */
    this.renderDiscussions = function ()
    {
        for (i in this.discussions)
        {
            this.discussions[i].render("#d-Unpinned", "discussion", "insertAfter", "d-Unpinned");
        }
        
        this.alignRatings( );

    };
    
    /*
     * Подгрузка запиненных дискашенов по пользователю
     * @param User f.user.js
     */
        
    this.loadPinned = function ( User )
    {
        // Move pinned To Top
        this.pinnedToTop ( User );
        
        var Application = this;
        
        // Load All Pinned
        this.ajaxRequest("/slicegetdiscussions.json", 
            function(data){
                var newData = Application.parseData(data);
                
                for (var i=0; i< newData.discussions.length; i++)
                {
                    var Dcs = Application.discussions[newData.discussions[i]];
                    
                    for (var j=0; j< newData.posts.length; j++)
                    {
                        if (Dcs.id == Application.posts[newData.posts[j]].parentDiscussion)
                        {
                            Dcs.posts[j] = Application.posts[newData.posts[j]];
                            Dcs.keys[j] = Dcs.posts[j];
                        }
                    }
                    if ( $("#discussion-" + Dcs.id).length > 0 )
                    {
                        var View = Dcs.render("#d-Pinned", "discussion", "appendTo", "d-Pinned");
                    }
                    else
                    {
                        Dcs.upadteView();
                    }
                }
                
            }, function(){
                Application.msg("Couldn't search");
                this.pinnedToTop ( User ); // перемещение pinned наверх - возможнои overhead 
            });        
        
    };

    /*
     * Перемещение pinned дискашенов наверх 
     * 
     * @param User object f.user.js - текущий пользователь
     * 
     */
    this.pinnedToTop = function ( User )
    {
        return false;
        if (!User) return false; // @todo такого не может быть в нормально ситуации - убрать после проверки
        for (var i=0, l= User.pinned.length; i < l; i++)
        {
            $("#discussion-" + User.pinned[i])
                .attr("data-parent", "d-Pinned")
                .appendTo("#d-Pinned");
        }
        this.getParentsList.cache = {};
        this.getPrevHeights.cache = {};
        // @todo тут сделать чтоб пиненые переносились наверх а непиненные вниз - но только если они уже не там
    };

    /*
     *  Подгрузка самых топовых дискашенов
     */
    this.loadTopDiscussions = function ()
    {
      var Application = this;  
      this.ajaxRequest( "/slicegettopsocialratingdiscussions.json",
      
        function ( data ) {
            
            Application.parseData(data);
            
            Application.renderDiscussions();
            
            Application.loadPinned( Application.siteUser );
            
        },
    
        function () {
            Application.msg("Count`t get base discussion list");
        }
      );
          
    };
    
    
    /*
     * Подсвечивание тегов
     * @param str String - строка для подсвечивания
     * @param hclass String - класс каким надо посвечивать
     */
    this.highlight = function ( str, hclass)
    {
        $('article').removeHighlight( hclass );
        $('article').highlight( str, hclass );
    };
    
    /*
     * Запрос на получение дискашенов и постов по заданным параметрам
     * и вывод их в рабочую область
     * 
     * - Ключи обновляются в результате запроса для дискашенов
     * 
     * - Сначала удаляются все статьи (!) потом добавляются новые 
     * в unpined раздел. Учитаывать что сейчас могут удаляться и pined и unpinned поля
     * 
     * @param url string - строка URL 
     * @param params object - объект с параметрами
     * @param callback funciton - функция которая запускается после выполнения запроса
     */
    this.loadDiscussionsByParams = function ( url, params, callback )
    {
        var Application = this;
        this.ajaxRequest( url , 
            function(data){
                $("#main article.post, #main article.dicsussion, #main article.key")
                    .remove();
                
                var newData = Application.parseData(data);
                for (var i=0; i< newData.discussions.length; i++)
                {
                    var Dcs = Application.discussions[newData.discussions[i]];
                    
                    Dcs.keys = {}; // удаляем существующие ключи
                    
                    for (var j=0; j< newData.posts.length; j++)
                    {
                        if (Dcs.id == Application.posts[newData.posts[j]].parentDiscussion)
                        {
                            Dcs.posts[j] = Application.posts[newData.posts[j]];
                            Dcs.keys[j] = Dcs.posts[j];
                        }
                    }
                    var View = Dcs.render("#d-Unpinned", "discussion", "prependTo", "d-Unpinned");

                    Dcs.renderKeys();
                }
                for (var i=0; i< newData.posts.length; i++)
                {
                    var Post = Application.posts[newData.posts[i]];
                    if (Post.parentDiscussion == 0 )
                    {
                        Post.render("#d-Unpinned", "key", "appendTo", "d-Unpinned");
                    }
                }
                
                Application.pinnedToTop ( Application.siteUser );
                
                if ( callback )
                {
                    callback ();
                }
                
            }, function(){
                Application.msg("Couldn't load by params");
            },
            params);
            return false;
            this.r
    };
    
    /*
     * Точка входа для приложения
     * - Запуск
     * - Обновление состояния экрана в зависимости от пользователя
     */
    this.run = function ()
    {
        
        Application = this;
        
        $.when ( this.cacheTemplates() )
            
            .then(function ( ){
                
                Application.ajaxRequest('/slicegetrecenttimelinestatus.json', 
                    function( data ){
                        
                        Application.updateSiteUser(data);

                        Application.updateInterfaceByUser();

                        Application.siteUserTimer = setTimeout(function() {
                            Application.userState()
                        }, 30000);
                        
                        Application.router();

                    },
                    function( ){
                        Application.msg("Couldn't get start data");
                    }
                );
            });
    };
    
    /*
     * Определение команд в зависимости от изменения строки адреса
     * @param hash String||undefined - возможность задать команду вручную
     */
    this.router = function ( hash ) 
    {
        var hash = hash || document.location.hash;
        
        var result = hash.match(/(discussion|post|user|avatar|tag|loadtopdiscussions|directmessage)(-?([0-9]+))*/);
        result = (!result || result[1] == undefined)?[null,"loadtopdiscussions"]:result;

        switch ( result[1] ) 
        {
            case "discussion":
                this.loadDiscussionsByParams("/slicegetdiscussionbyid.json", {
                    id : result[3]
                });
                break;
            case "post":
                this.loadDiscussionsByParams("/slicegetpostbyid.json", {
                    id : result[3]
                });
                break;
            case "directmessage":
                this.loadDiscussionsByParams("/slicegettopsocialratingfacadeinputsbyactiontype.json", {
                    facadeid   : (Application.siteUser != undefined)
                                    ?Application.siteUser.id:0,
                    actiontype : "Message",
                    count      :  100
                }, function(){
                    $("article.key").tsort("time", {order:"desc",attr:"date-val"});
                });
                break;
            case "user":
            case "avatar":
                this.loadDiscussionsByParams("/slicegetposts.json", {
                    userid : result[3],
                    returndiscussions : "true"
                });
                break;
            case  "tag":
                this.loadDiscussionsByParams("/slicegetposts.json", {
                    tagid : result[3],
                    returndiscussions : "true"
                }, function(){
                    Application.highlight(Application.tags[result[3]].wordString, 
                    "highlight_perma");
                });
                break;
            case "loadtopdiscussions":
                this.loadTopDiscussions();
                break;
            default:
                ;
        }
        
    }
    
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
    
    /*
     * Обновления полосок рейтингов
     */
    this.alignRatings = function ( ) 
    {
        for (i in this.discussions)
        {
            this.maxRating        = Math.max(this.discussions[i].rating, this.maxRating);
            this.maxSocialRating  = Math.max(this.discussions[i].socialrating, 
                                             this.maxSocialRating);
            this.maxBranchesCount = Math.max(this.discussions[i].branchesCount,
                                             this.maxBranchesCount);
            this.maxPostsCount    = Math.max(this.discussions[i].postsCount, this.maxPostsCount);
        }
        
        this.maxRatingCoef        = 30 / this.maxRating;
        this.maxSocialRatingCoef  = 30 / this.maxSocialRating;
        this.maxBranchesCountCoef = 30 / this.maxBranchesCount;
        this.maxPostsCountCoef    = 30 / this.maxPostsCount;
        
        var Application = this;
        
        $.each( $(".socialrating"), function (i, el){
            var nW = parseInt($(el).attr("title"),10) * Application.maxSocialRatingCoef 
                + 3;
            $(el).animate({"width": nW + "px"});
            $(el).css({"visibility":(parseInt($(el).attr("title"),10) == 0)?"hidden":""});
            
        });
        $.each( $(".rating"), function (i, el){
            var nW = parseInt($(el).attr("title"),10) * Application.maxRatingCoef + 3;
            $(el).animate({"width": nW + "px"});
            $(el).css({"visibility":(parseInt($(el).attr("title"),10) == 0)?"hidden":""});
        });
        $.each( $(".posts"), function (i, el){
            var nW = parseInt($(el).attr("title"),10) * Application.maxPostsCountCoef + 3;
            $(el).animate({"width": nW + "px"});
            $(el).css({"visibility":(parseInt($(el).attr("title"),10) == 0)?"hidden":""});
        });
        $.each( $(".branches"), function (i, el){
            var nW = parseInt($(el).attr("title"),10) * Application.maxBranchesCountCoef 
                + 3;
            $(el).animate({"width": nW + "px"});
            $(el).css({"visibility":(parseInt($(el).attr("title"),10) == 0)?"hidden":""});
        });
    };
 
    /*
     * Залогирование пользователя 
     * и запуск обновления интерфейса в зависимости от него
     * 
     * @param data
     */
    this.loginSiteUser = function (data)
    {
        this.siteUser = new User(this, data );
        Application.updateInterfaceByUser();
    };
 
    /*
     * Разлогирование пользователя 
     * и запуск обновления интерфейса в зависимости от него
     * 
     */
    this.logoutSiteUser = function ()
    {
        this.siteUser = null;
        Application.updateInterfaceByUser();
    };
    
    this.updateInterfaceByUser = function()
    {
        if (!this.siteUser)
        {
            $(".reply, .addcomment").hide();
            $("#userdata").html("User: guest!");
            $("#showregistration, #showlogin").show();
            
            $("#logout").hide();
            $("#shownewpost").hide();
            
            $(".auth").addClass("hidden");
            
            return false;
        }
        
        $("#userdata").html("User: " + this.siteUser.name+". Welcome !");
        $("#showregistration, #showlogin").hide();

        $("#logout").show();
        $("#shownewpost").show();
        $(".auth").removeClass("hidden");

        // unpin all
        // pin by user
        $(".pinning").removeClass("pinned");
        for (var i=0, l=this.siteUser.pinned.length; i<l; i++)
        {
            $("article[data-id='" + this.siteUser.pinned[i] + "']")
            .find(".pinning").addClass("pinned");

        }

        if (this.siteUser.messagesCount)
        {
            $("#directmessage")
                .html("Inbox ("+ this.siteUser.messagesCount +")")
                .show();
        }
        else
        {
            $("#directmessage").hide();
        }
        
    }
    
    this.renderAvatar = function( View, size )
    {
        size = size || 64;
        $.each(View.find('.avatar'), function (i, el){
            if ($(el).attr("data-avataruri") != "" && $(el).attr("data-avataruri") 
                != "null")
            {
                var src = $(el).attr("data-avataruri");
//                src = src.replace("_normal", "");
                $(el).html("");
                $("<img />").appendTo(el)
                    .css({"background-image": "url('"+ src +"')",
                          "width" : size + "px",
                          "height": size + "px"
                        })
                    .addClass("avataruri")
            }
            else
            {
                $(el).html( $(el).attr("data-authorid") );
                $(el).identicon5({
                    size: size 
                });
            }    
        });    
        
    }
    
    this.showAddNew = function ( el, sendObj )
    {

        $("header .addcomment, #main .addcomment").slideUp(100, function(){
            $(this).remove();

        })

        $.tmpl("reply", sendObj).insertAfter(el).css({
            "display":"none"
        }).slideDown();

        var View = $("#replyto-" + sendObj.id);
        var Application = this;
        
        $.each(View.find('.avatar'), function (i, el){
            if (!Application.siteUser) return false;
            $(el).attr ("title", Application.siteUser.name );
            $(el).attr ("data-id", Application.siteUser.id);
            $(el).attr ("data-uri", Application.siteUser.avataruri);
        });    
        
        this.renderAvatar ( View );

        View.find(".cancel").click(function(){
            $(this).parents(".addcomment").slideUp(200, function(){
                $(this).remove();
            }); 
        });
        
        $("#directusernames").autocomplete(Application.globalPath + 
            Application.frameworkPath + '/suggest.json', {
                width: $("#directusernames").width(),
                dataType : "jsonp",
                multiple: true,
                matchContains: true,
                selectFirst: true,
                minChars: 1,
                autoFill: true,
                extraParams:  {
                    facadetype : "user"
                },
                parse : function ( data )
                {
                    var parsed = [];
                    for ( i in data) {
                        parsed[parsed.length] = {
                            data: data[i],
                            id: i,
                            value: data[i]+"("+i+")",
                            result: data[i]+"("+i+")"
                        };
                    }
                    return parsed;
                    
                },
                formatItem: function ( row ) {
                    return row;
                }
        });

        View.find("form").submit(function(){

            View.slideUp(200, function(){
                $(this).remove();
            }); 
            
            var data = Application.formArrayToData($(this).formToArray());
            data.directuserids = getIds(data.directusernames);
            data.type = "post";
            
            Application.ajaxRequest("/slicepostmessage.json", 
                function(data){
                    var newData = Application.parseData(data);
                    
                    for (var i=0; i< newData.posts.length; i++)
                    {
                        var post = Application.posts[newData.posts[i]];
                        if (post.parentDiscussion == 0 )
                        {
                            var View = post.render("#d-Unpinned", "key", "prependTo", "d-Unpinned");
                            
                            post.scrollToView(View);
                        }
                    }
                    
                }, function(){
                    message("Couldn't post comment");
                },
                data
                );        
            return false;
        });

    };
    
    this.parseData = function ( data )
    {
        
        var newData = {
            discussions : [],
            posts       : [],
            tagclouds   : [],
            tags        : [],
            users       : [],
            words       : []
        };
        
        if (!data) return newData;
        
        if ( data.users != undefined && data.users.length > 0) 
        {
            for (var i=0, l = data.users.length; i < l; i++)
            {
                var id = data.users[i].id.toString();

                if (this.users[id] == undefined)
                {
                    this.users[id] = new User( this, data.users[i] );
                }
                else
                {
                    this.users[id].update( data.users[i] );
                }

                newData.users.push(id);
            }            
        }
        
        if ( data.posts != undefined && data.posts.length > 0) 
        {
            for (var i=0, l = data.posts.length; i < l; i++)
            {
                var id = data.posts[i].id.toString();

                if (this.posts[id] == undefined)
                {
                    this.posts[id] = new Post( this, data.posts[i] );
                }
                else
                {
                    this.posts[id].update( data.posts[i]);
                }

                this.posts[id].parseTags(data);
                
                newData.posts.push(id);
            }            
        }
        
        if ( data.discussions != undefined && data.discussions.length > 0) 
        {
            for (var i=0, l = data.discussions.length; i < l; i++)
            {
                var id = data.discussions[i].id.toString();

                if (this.discussions[id] == undefined)
                {
                    this.discussions[id] = new Discussion( this, data.discussions[i] );
                }
                else
                {
                    this.discussions[id].update( data.discussions[i]);
                }

                this.discussions[id].parseTags(data);
                
                newData.discussions.push(id);
                
            }            
        }
        
        return newData;
    };
    
    this.alignFloat = function ( )
    {
        var curArticle = null,
            pOffset    = 0,
            gOffset    = 0,
            next       = null,
            nOffset    = 0,
            tmpTop     = 0;

        var 
            sT = $(document.body).scrollTop() 
                /* + $("#container > header").outerHeight(true)*/,
            activeArticle = $("article.active"),
            activeParents = this.getParentsList(activeArticle.attr("data-id"));

        if ( !activeArticle.length )
        {
            return false;
        }

        // align before
        for ( i = activeParents.list.length; i--; )
        {
            curArticle = $("article[data-id="+ activeParents.list[i] +"]");

            pOffset = this.getParentsList(activeParents.list[i]).offset;
            gOffset = this.getPrevHeights(activeParents.list[i]).offset; 

            if (gOffset < sT + pOffset)
            {
                tmpTop = pOffset;
                curArticle
                    .addClass("float");

                $(curArticle).next(".replacement").remove();
                $(curArticle)
                    .after('<div class="replacement" \n\
                                style="height:'+$(curArticle).outerHeight(true)+'px">\n\
                           </div>'
                    );
            }
            else
            {
                $(curArticle).next(".replacement").remove();
                curArticle
                    .removeClass("float");

            }

            next = $(curArticle).nextAll("article[data-parent=" 
                + $(curArticle).attr("data-parent") +"]").first();
            if (!next.length)
            {
                next = $("article[data-id="+ $(curArticle).attr("data-parent") 
                    +"]").first();
                next = $(next).nextAll("article[data-parent="
                    + $(next).attr("data-parent") +"]").first();
            }

            if (next.length > 0)
            {
                nOffset = this.getPrevHeights(next.attr("data-id")).offset ; 
                if (pOffset + $(curArticle).outerHeight(true) > nOffset-sT)
                {
                    tmpTop = ( nOffset - sT - $(curArticle).outerHeight(true) );
                }
            }

//            tmpTop += $("#container > header").outerHeight(true);
            $(curArticle).css({"top": tmpTop + "px"});

        }

        return true;
        
    };
    
    this.updateMain = function ( newData )
    {
        for (var i=0; i< newData.posts.length; i++)
        {
            var Post = Application.posts[newData.posts[i]];
            if ($("#post-"+Post.id).length < 0)
            {
                Post.render("#d-Unpinned", "key", "prependTo", "d-Unpinned");
            }
        }
        
    };
    
    this.getPrevHeights = function (id)
    {
        var 
            el = null,
            result = {
            list     : [],
            offset : 0
        };
        if (this.getPrevHeights.cache[id] == undefined)
        {
            $.each(
                $("article[data-id=" + id + "]").prevAll("article"),
                function (i, el) {
                    result.list.push($(el).attr("data-id"));
                    result.offset += $(el).outerHeight(true);
                }
            );

            this.getPrevHeights.cache[id] = result;
        }

        return this.getPrevHeights.cache[id];
    } 

    this.getPrevHeights.cache = {};

    this.getParentsList = function (id)
    {
        var 
            el = null,
            result = {
            list     : [],
            offset : 0
        };
        if (this.getParentsList.cache[id] == undefined)
        {
            result.list.push(id);

            el = $("article[data-id=" + $("article[data-id=" + id + "]")
                .attr("data-parent") + "]");
            while ( el.length )
            {
                result.list.push($(el).attr("data-id"));
                result.offset += el.outerHeight(true);
                el = $("article[data-id=" + el.attr("data-parent") + "]");
            }

            this.getParentsList.cache[id] = result;
        }

        return this.getParentsList.cache[id];
    } 

    this.getParentsList.cache = {};
    
    return this;
    
};

