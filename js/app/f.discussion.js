/* 
 * Discussion
 */


function Discussion (Application, data) 
{
    Discussion.superclass.constructor.call( this );

    this.Application = Application;
  
    this.id = data.id;
  
    this.title = data.title;
    this.historyGraph = null;
  
    this.keys = {};
    this.posts = {};
    this.users = {};
    this.tmpTags = [];
 
    this.slideTimer = null;
    
    this.update = function (data)
    {
        this.posts = {};
        this.users = {};
    
        this.branchesCount = data.metadata.branchcount;
        //branchesCount заполнить из количесвтва кей постов
        this.postsCount = this.getActionValue(data.metadata.socialconnections.inputs, "DiscussionPost", "count") || 0;
    
        this.rating = data.socialrating;
        this.socialrating = Math.max(data.socialratingsum, 0);
    
        this.tagcloudid = data.tagcloudid;
    
        this.metadata = {
            usersCount : data.metadata.usercount,
            branchCount : data.metadata.branchcount
        };
    
    };
  
    this.update(data);
  
//  return this;
}

extend(Discussion, Facade);

Discussion.prototype = {
    openFacade : function ( View)
    {
        $("article.active").removeClass("active");
        
        View = View || $("#discussion-" + this.id);
        
        View.addClass("active");
        
        // $("#main .key, #main .post").remove(); // todo remove child elements only
        
        this.removeDiscussionChilds(this.id);
        
        this.renderAvatars( View );
        this.renderTagCoud( View );

        // draw TagCloud

        this.expandKeys(); 

        this.scrollToView(View);
    },
    prepareRender : function()
    {
        return true;
        this.ratingCoef = Math.round( this.rating  * 50 / Site.maxRating);
        this.socialratingCoef = Math.round(this.socialrating * 50 / Site.maxSocialrating);  
    
        this.branchesCountCoef = Math.round(this.branchesCount * 50 / Site.maxBranches);
        this.postsCountCoef = Math.round(this.postsCount * 50 / Site.maxPosts);
    
        if (this.branchesCount == 0)
        {
            this.branchesCountCoef = 0;
            this.ratingCoef = 0;
        }
    },
    render : function (el, tmpl, mode)
    {
        this.prepareRender();
    
        this.loadKeys();
        this.loadAvatars(0, 20);
    
        var View = this.renderSelf (el, tmpl, mode);
        var facade = this;

    
        View.find("header").click(function (){
            facade.openFacade( View );
        });
        
        if (facade.Application.siteUser)
        {
            // add event change rating
            View.find(".pinning").click( function() {
                facade.Application.ajaxRequest("/slicepin.json", 
                    function(data){
                        // @todo update here discussion rating
                        facade.Application.pinnedToTop ( facade.Application.siteUser );
                    },
                    function(){
                        message("Couldn't pin");
                    },
                    {
                        facadeid : facade.id
                    }
                    );
                return false;
            }) ;
            // add event change rating
            View.find(".changeRating").click( function() {
                facade.Application.ajaxRequest("/slicevote.json", 
                    function(data){
                        var dicussionData = data.discussions.filterByValue(getById, facade.id);
                        facade.update(dicussionData[0]);
                        facade.updateView();

                    },
                    function(){
                        message("Couldn't change rating on comment");
                    },
                    {
                        facadeid : facade.id,
                        socialrating : $(this).attr("data-delta")
                    }
                    );
                return false;
            }) ;
            View.find(".addComment").click(function (){
                facade.showAddComment(View, {
                    type : "discussion",
                    id   : facade.id,
                    text : 'Text to ' + facade.id + " discussion"
                });
                return false;
            });

        }
    
        return View;
    },
    loadAvatars : function (offset, count)
    {
        var facade = this;
    
        this.Application.ajaxRequest("/slicegetusers.json",
            function (data, status, env) {
          
                var newData = this.Application.parseData(data);
                
                for (var i=0, l = newData.users.length; i < l; i++)
                {
                    facade.users[newData.users[i]] = facade.Application.users[newData.users[i]];
                }
                
                // @todo правильнее сбда будет сделать рендер если дискашен открыт 
                // но пока будем делать отдельно подгрузку одельно показывание
                // will be Render
                
            },
            function () {
        
                message("Count`t get avatars list for discussion: " + facade.id);
      
            },
            {
                discussionid : facade.id,
                count        : count,
                offset       : offset
            }
            );
    },
    renderAvatars : function ( View )
    {
        $(".avalist").hide().html("");
        
        var avaList = View.find(".avalist");
        
        var cnt = 0;
        for (i in this.users)
        {
            cnt++;
            
            $('<a href="#avatar-' + this.users[i].id + 
                '" class="avatar" \n\
                   data-id="' + this.users[i].id + '" \n\
                   data-authorid="'+$.md5(this.users[i].id) + '" \n\
                   data-avataruri="'+ this.users[i].avataruri + '" \n\
                   title="' + this.users[i].name + '"></a>')
                .hover(function(){
                    $("<img src='img/direct.gif' class='direct' />")
                        .prependTo($(this));
                }, function(){
                    $(this).find("img.direct").remove();
                })
                .appendTo(".avalist");

            
            if (cnt % 4 == 0)
            {
                $("<br />").appendTo( avaList);
            }
        }
        
        this.Application.renderAvatar ( View, 48 );
        
        avaList.show();
    },
    loadKeys : function ()
    {
        var discussion = this;
    
        this.Application.ajaxRequest("/slicegettopsocialratingfacadeinputsbyactiontype.json",
            function (data, status, env) {
                if (data == {} || data.posts == undefined) 
                {
                    discussion.Application.msg("Count`t open post list for discussion: " + discussion.id);
                    return false;
                }
        
                var newData = discussion.Application.parseData(data);
        
                for (var i=0, l = newData.posts.length; i < l; i++)
                {
                    discussion.keys[newData.posts[i]]
                    = discussion.posts[newData.posts[i]]
                    = discussion.Application.posts[newData.posts[i]];
                   
                }
        
                // Render
                discussion.renderKeys();
            },
            function () {
        
                discussion.Application.msg("Count`t get post list for discussion: " + discussion.id);
      
            },
            {
                facadeid   : discussion.id,
                actiontype : "DiscussionPost"
            }
            );
    },
    renderTagCoud : function( View )
    {
        var yt = View.find(".yoltags");
        $(".yoltags").hide().find("*").remove().html("");
        
        var min = 0, max = 0;
        for (i in this.tags)
        {
            $("<a data-weight='"+this.tags[i].socialrating+"' \n\
                    title='"+this.tags[i].socialrating+"' \n\
                    href='#tag-"+this.tags[i].id+"'>"+this.tags[i].wordString +"</a>")
                .appendTo(yt);
            min = Math.min(parseInt(this.tags[i].socialrating,10), min);
            max = Math.max(parseInt(this.tags[i].socialrating,10), max);
        }
        
        var d = 1.6 / Math.log(max);
        $.each (yt.find("a"), function (i, el){
            var size =  $(el).attr("data-weight") ;
            
            size = d * Math.log( size ) + 0.4;
            
            $(el).css({"font-size": size.toPrecision(2) + "em"});
        });
        
        
        yt.show(); 
      
    },
    slideKeys : function ( discussion )
    {
        discussion.slideTimer = setTimeout ( function( ) {
            discussion.slideKeys(discussion);
        }, 4000);

        if ($(".discussion:hover").attr("data-id") == discussion.id)
        {
            return false;
        }

        $("#discussion-"+ discussion.id+" ul.keys")
        .find("li:first")
        .appendTo($("#discussion-"+ discussion.id+" ul.keys"));
        $("#discussion-"+ discussion.id+"")
        .find(".bullet")
        .removeClass("active");
            
        var keyid = $("#discussion-"+ discussion.id+" ul.keys").find("li:first").attr("data-id");
        $("#discussion-"+ discussion.id+"")
        .find(".bullet[data-id='" + keyid + "']").addClass("active");
      
    },
    renderKeys : function ()
    {
        var facade = this;
        var View = $("#discussion-"+ this.id+"");
        
        var maxKeyRating = (this.keys[0]) ? this.keys[0].rating: 0;
        for (i in this.keys)
        {
            if (!this.keys[i]) continue; // #todo - проверить почему попадают сюда фукции массива - вроде не должны
            maxKeyRating = Math.max (maxKeyRating, this.keys[i].rating);
            this.keys[i].render(View.find("ul.keys"), "innerkey", "appendTo");
            
            
            $('<div class="bullet_cont"><div class="bullet" data-rating="'+this.keys[i].rating+'" data-id="'+ this.keys[i].id +'" style="zoom: 1"></div></div>')
            .prependTo(View.find(".bullets"));
          
        };
        View.find("ul.keys li").click(function(){
            View.find("header").click();
            facade.scrollToView($("#post-" + $(this).attr("data-id")) );
            
        });
        
        View.find(".bullet_cont").click( function() {
            clearTimeout(facade.slideTimer);
            $("#discussion-"+ facade.id+" ul.keys")
            .find("li[data-id='" + $(this).find(".bullet").attr("data-id") + "']")
            .prependTo(View.find("ul.keys"));
            facade.slideTimer = setTimeout(function (){
                facade.slideKeys(facade);
            }, 4000);

        });
    
        maxKeyRating = Math.max(0.8 / maxKeyRating, 0);
    
        for (i in this.keys)
        {
            if (!this.keys[i]) continue; // #todo - проверить почему попадают сюда фукции массива - вроде не должны
            var zoomCoef = maxKeyRating * this.keys[i].rating + 0.2 || 0.2;
            zoomCoef = zoomCoef.toPrecision(2);
            $(".bullet[data-id='" + this.keys[i].id + "']")
            .animate({
                "zoom": zoomCoef
            });
        
        };
    
        this.slideTimer = this.slideKeys(this);
        return true;
    
    },
    expandKeys : function ()
    {
        this.removeDiscussionChilds( this.id );
        for (i in this.keys)
        {
            if (!this.keys[i]) continue; // #todo - проверить почему попадают сюда фукции массива - вроде не должны
            if ($("#key"+this.keys[i].id).length > 0) continue;  
            this.keys[i].render($("#discussion-" + this.id),"key", "insertAfter");
        };

    },
    expandPosts : function ()
    {
        this.removeDiscussionChilds( this.id );
        for (i in this.posts)
        {
            if ($("#key"+this.keys[i].id).length > 0) continue;  
            this.keys[i].render($("#discussion-" + this.id),"key", "insertAfter");
        };
    
    },
    drawHistoryGraph : function ()
    {
        var diCont = $("#discussion-" + this.id).find(".di");
        diCont.attr("id", "hgCont" + this.id)
        diCont.find("*").remove();
        $("<canvas></canvas>")
        .appendTo(diCont)
        .addClass('historyGraph')
        .attr("id", "hgCanvas"+this.id)
        .css({
            width: diCont.width(),
            height: diCont.height()
        });
        this.historyGraph = new HistoryGraph("hgCanvas" + this.id);
     
        this.historyGraph.init();
        this.historyGraph.addData(this.posts);
        this.historyGraph.startGraph();
     
    },
    updateView : function ()
    {
        var View = $("#discussion-"+ this.id+"");
        this.updateRatingLabel(View);
    },
    updateRatingLabel : function (View)
    {
        var prev = View.find(".ratingLabel").html();
        if (prev < this.rating)
        {
            View.find(".ratingLabel").html(this.rating).removeClass("highlatedRed").addClass("highlatedGreen");
            setTimeout(function(){
                View.find(".ratingLabel").removeClass("highlatedGreen");
            }, 8000);
        }
        else
        {
            View.find(".ratingLabel").html(this.rating).removeClass("highlatedGreen").addClass("highlatedRed");
            setTimeout(function(){
                View.find(".ratingLabel").removeClass("highlatedRed");
            }, 8000);
        }
    },
    parseConnectionMessage : function (data) { }
}

