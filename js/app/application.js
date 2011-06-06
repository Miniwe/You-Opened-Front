
var Application = function ( opts )
{
    
    this.globalPath = opts.path || "";
    
    this.frameworkPath = "/framework";
    
    this.bTmplCompleted = 0;
    
    this.sessionkey = opts.sessionkey;
    
    this.templates = opts.templates || [];
    
    this.siteUserTimer    = null;
    this.siteUser         = null;
    
    this.discussions = {};
    this.posts       = {};
    this.tags        = {};  
    this.users       = {};
    this.words       = {};
    
    this.maxRating        = 1;
    this.maxSocialRating  = 1;
    this.maxBranchesCount = 1;
    this.maxPostsCount    = 1;
    
    this.maxRatingCoef        = 1;
    this.maxSocialRatingCoef  = 1;
    this.maxBranchesCountCoef = 1;
    this.maxPostsCountCoef    = 1;
    
    this.ajaxRequests = [];
    this.ajaxCount = 0;
    this.ajaxTimer = 0;
    
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
    
    this.ajaxStop = function ( ) // @todo until dont working
    {
        for (var i=0,l=this.ajaxRequests.length;i<l;i++)
        {
//            if (typeof this.ajaxRequests[i].abort == "function" )
//            {
//                typeof this.ajaxRequests[i].abort();
//            }
        }
        return false;
    };
    
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
//                    console.log('+1');
                }, 30000);
                
            },
            function( ){
                message("Couldn't get user timeline");
            }
        );
    };
    
    this.ajaxRequest = function (url, success, error, data)
    {
        var data = data || {};
        data.sessionkey = this.sessionkey;
        var Application = this;
        
        var ajaxOpts = {
            type      : /*data.type || */'get',
            url       : this.globalPath + this.frameworkPath + url,
            success   : function (data, textStatus, jqXHR) { 
                
                // pre actions 
                success.call(Application, data, textStatus, jqXHR);
                // post actions 
                
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
        
//        if (this.globalPath.indexOf(window.location.hostname) < 0)
//        {
//        }
        this.ajaxRequests.push( $.ajax( ajaxOpts ) );
    };
    
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
    
    this.renderDiscussions = function ()
    {
        for (i in this.discussions)
        {
            this.discussions[i].render("#d-Unpinned", "discussion", "appendTo");
            
            this.discussions[i].loadKeys();
            this.discussions[i].loadAvatars(0, 20);
        }
        
        this.alignRatings( );

    };
    
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
                        var View = Dcs.render("#d-Pinned", "discussion", "appendTo");
                        Dcs.renderKeys();

                    }
                    else
                    {
                        Dcs.upadteView();
                    }
                }
                
            }, function(){
                Application.msg("Couldn't search");
            });        
        
        // Mode All Pinned To Top - не нужна так как новые сами вставляются вверх
        // this.pinnedToTop ( User );
    };

    this.pinnedToTop = function ( User )
    {
        if (!User) return false;
        for (var i=0, l= User.pinned.length; i < l; i++)
        {
            $("#discussion-" + User.pinned[i]).appendTo("#d-Pinned");
        }
        // тут сделать чтоб пиненые переносились наверх а непиненные вниз - но только если они уже не там
    };

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
    
    this.highlight = function ( str, hclass)
    {
        $('article').removeHighlight( hclass );
        $('article').highlight( str, hclass );
    };
    
    this.loadDiscussionsByParams = function ( url, params, callback )
    {
        var Application = this;
        this.ajaxRequest( url , 
            function(data){
                $("#main article").remove();
                
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
                    var View = Dcs.render("#d-Unpinned", "discussion", "prependTo");

                    Dcs.renderKeys();
                }
                for (var i=0; i< newData.posts.length; i++)
                {
                    var Post = Application.posts[newData.posts[i]];
                    if (Post.parentDiscussion == 0 )
                    {
                        Post.render("#d-Unpinned", "key", "appendTo");
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
    };
    
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
                    facadeid   : (Application.siteUser != undefined)?Application.siteUser.id:0,
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
                    Application.highlight(Application.tags[result[3]].wordString, "highlight_perma");
                });
                break;
            case "loadtopdiscussions":
                this.loadTopDiscussions();
                break;
            default:
                ;
        }
        
//        console.log("parsed hash", result);
    }
    
    this.formArrayToData = function ( formArray ) 
    {
        var out = {};
        for (i in formArray)
        {
            out[formArray[i].name] = formArray[i].value;
        }
        
        return out;
    };
    
    this.alignRatings = function ( ) 
    {
        for (i in this.discussions)
        {
            this.maxRating        = Math.max(this.discussions[i].rating, this.maxRating);
            this.maxSocialRating  = Math.max(this.discussions[i].socialrating, this.maxSocialRating);
            this.maxBranchesCount = Math.max(this.discussions[i].branchesCount, this.maxBranchesCount);
            this.maxPostsCount    = Math.max(this.discussions[i].postsCount, this.maxPostsCount);
        }
        
        this.maxRatingCoef        = 30 / this.maxRating;
        this.maxSocialRatingCoef  = 30 / this.maxSocialRating;
        this.maxBranchesCountCoef = 30 / this.maxBranchesCount;
        this.maxPostsCountCoef    = 30 / this.maxPostsCount;
        
        var Application = this;
        
        $.each( $(".socialrating"), function (i, el){
            var nW = parseInt($(el).attr("title"),10) * Application.maxSocialRatingCoef + 3;
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
            var nW = parseInt($(el).attr("title"),10) * Application.maxBranchesCountCoef + 3;
            $(el).animate({"width": nW + "px"});
            $(el).css({"visibility":(parseInt($(el).attr("title"),10) == 0)?"hidden":""});
        });
    };
 
    this.loginSiteUser = function (data)
    {
        this.siteUser = new User(this, data );
        Application.updateInterfaceByUser();
    };
 
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
//            console.log(this.siteUser.pinned);
        for (var i=0, l=this.siteUser.pinned.length; i<l; i++)
        {
            $("article[data-id='" + this.siteUser.pinned[i] + "']").find(".pinning").addClass("pinned");
//                console.log("article[data-id='" + this.siteUser.pinned[i] + "']");

        }
//            console.log(this.siteUser);

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
            if ($(el).attr("data-avataruri") != "" && $(el).attr("data-avataruri") != "null")
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
                    /*
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
                        var View = Dcs.render("#d-Unpinned", "discussion", "prependTo");

                        Dcs.renderKeys();

                    }
                    */
                    for (var i=0; i< newData.posts.length; i++)
                    {
                        var post = Application.posts[newData.posts[i]];
                        if (post.parentDiscussion == 0 )
                        {
                            var View = post.render("#d-Unpinned", "key", "prependTo");
                            
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
        
    };
    
    this.updateMain = function ( newData )
    {
        //console.log(newData);
        for (var i=0; i< newData.posts.length; i++)
        {
            var Post = Application.posts[newData.posts[i]];
            if ($("#post-"+Post.id).length < 0)
            {
                Post.render("#d-Unpinned", "key", "prependTo");
            }
        }
        
    };
    
    return this;
    
};

