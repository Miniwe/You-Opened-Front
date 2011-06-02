/* 
 * Post 
 */
function Post (Application, data)
{
    
    Post.superclass.constructor.call( this );
    
    this.Application = Application;
  
    this.id              = data.id;
    this.parentId        = "";
    this.parent          = false;
  
    this.authorid        = data.authorid;
    this.text            = data.text;
    
    this.parentDiscussion = 0;
    this.parentPost       = 0;

        
    this.mUsers = {};
    this.posts  = {};
    this.tags   = {};
  
    this.update = function ( data )
    {
        
        if (this.Application.users[this.authorid] != undefined)
        {
            this.user = this.Application.users[this.authorid];
        }    
        else
        {
            this.user = {
                id        : this.authorid,
                name      : "",
                avataruri : ""
            };
        }
        
        this.messagesCount = this.getActionValue(data.metadata.socialconnections.outputs, "Message", "count") || 0;
        if (this.messagesCount)
        {
            this.getSocialConnections("outputs", "Message");
        }
        
        this.rating = Math.max(data.socialrating, 0);
        this.socialrating = Math.max(data.socialratingsum, 0);

        this.branchesCount = this.getActionValue(data.metadata.socialconnections.inputs, "Comment", "count") || 0;
        this.postsCount = data.subpostcount;

        this.tagcloudid = data.tagcloudid;
        
        this.parentPost = this.getActionValue(data.actions, "Comment", "target").id || 0;
        this.parentDiscussion = this.getActionValue(data.actions, "DiscussionPost", "target").id || 0;
        
    };
  
  
  
    this.update( data );
}
extend(Post, Facade);

Post.prototype = {
    openFacade : function ( View )
    {
        
        $("article.active").removeClass("active");
        
        View = View || $("#post-" + this.id);
        
        View.addClass("active");
        
        //        $("#main > .key, #main > .post").remove(); // todo remove child elements only
        this.removePostChilds( this.id );
        


        // Draw Parent Post
        this.loadParent();

        // Draw Existing Posts
        this.loadChilds();

        // Load New Existing Posts and Draw

        this.scrollToView(View);
        
    },
    prepareRender : function()
    {
        return true;
        this.ratingCoef = Math.round( this.rating  * 50 / Site.maxRating);
        this.socialratingCoef = Math.round(this.socialrating * 50 / Site.maxSocialrating);  
    
        this.branchesCountCoef = Math.round(this.branchesCount * 50 / Site.maxBranches);
        this.postsCountCoef = Math.round(this.postsCount * 50 / Site.maxPosts);
    
        if (this.ratingCoef > 50)
            this.ratingCoef = 50;
    
        if (this.socialratingCoef > 50)
            this.socialratingCoef = 50;
    
        if (this.branchesCountCoef > 50)
            this.branchesCountCoef = 50;
    
        if (this.postsCountCoef > 50)
            this.postsCountCoef = 50;
    
        if (this.branchesCount == 0)
        {
            this.branchesCountCoef = 0;
            this.ratingCoef = 0;
        }
    },
  
    renderDirectUsers : function ( View )
    {
        var dField = View.find(".directusers");
        dField.html("");
        
        for (i in this.mUsers)
        {
            $("<a href='#user-"+this.mUsers[i].id+"'>@"+this.mUsers[i].name+"</a>").appendTo(dField);
        }
    },
    
    render : function (el, tmpl, mode)
    {
  
        this.prepareRender();

        var View = this.renderSelf(el, tmpl, mode)
        var facade = this;
        
        // draw avatar
//        var User = (facade.Application.users[facade.authorid] != undefined)
//            ? facade.Application.users[facade.authorid]
//            : {};
//        
        this.Application.renderAvatar ( View );
        this.renderDirectUsers (View )
        
        View.find("header").click(function (){
            facade.openFacade( View );
        });
        if (facade.Application.siteUser)
        {
            // add event change rating
            View.find(".pinning").click( function() {
                facade.Application.ajaxRequest("/slicepin.json", 
                    function(data){
                        // сделать как отправка поста в пустое место
                        var newData = Application.parseData(data);
                        for (var i=0; i< newData.discussions.length; i++)
                        {
                            var Dcs = Application.discussions[newData.discussions[i]];

                            for (var j=0; j< newData.posts.length; j++)
                            {
                                Dcs.posts[j] = Application.posts[newData.posts[j]];
                                Dcs.keys[j] = Dcs.posts[j];
                            }
                            var View = Dcs.render("#d-Unpinned", "discussion", "prependTo");


                            Dcs.renderKeys();
                            Dcs.expandKeys();
                            Dcs.scrollToView(View);
                        }
                        
                    },
                    function(){
                        facade.Application.msg("Couldn't pin");
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
                        var postData = data.posts.filterByValue(getById, facade.id);
                        facade.update(postData[0]);
                        facade.updateView();

                    },
                    function(){
                        facade.Application.msg("Couldn't change rating on comment");
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
                    type : "parentpostid",
                    id   : facade.id,
                    text : 'Text to ' + facade.id + " discussion"
                });
                return false;
            });
        }
        
        return View;
    },
    loadChilds: function ()
    {
        // load discussion posts
        var post = this;
        ajaxRequest("/slicegettopsocialratingfacadeinputsbyactiontype.json",
            function (data, status, env) {
                var newData = post.Application.parseData(data);
                
                for (var i=0, l = newData.posts.length; i < l; i++)
                {
                    post.posts[newData.posts[i]]
                        = post.Application.posts[newData.posts[i]];
                }
                
                // Render
                post.expandPosts();
            },
            function () {
        
                facade.Application.msg("Count`t get post list for post: " + post.id);
      
            },
            {
                facadeid   : post.id,
                actiontype : "Comment"
            }
            );
    },
    loadParent: function ()
    {
        // load discussion posts
        var facade = this;
        
        ajaxRequest("/slicegetparentpost.json",
            function (data, status, env) {
                
                var newData = facade.Application.parseData(data);
                
                facade.parent = false;
                
                for (var i=0, l = newData.posts.length; i < l; i++)
                {
                    facade.parent
                        = facade.Application.posts[newData.posts[i]];
                }
        
                // Render PARENT
                if  (facade.parent && $(".post[data-id='"+ facade.parent.id+"']").length < 1)
                {
                    facade.parent.render($("#post-" + facade.id), "post", "insertBefore");
                }
            },
            function () {
        
                facade.Application.msg("Count`t get parent post: " + post.id);
      
            },
            {
                childpostid : facade.id
            }
            );
    },
    expandPosts : function ()
    {
        this.removePostChilds( this.id );
        
        for (i in this.posts)
        {
            //      if ($(".post[data-id='"+this.posts[i].id+"']").length > 0) continue;  
            this.posts[i].render($("#post-" + this.id), "post", "insertAfter");
        };
    },
    updateView : function ()
    {
        var view = $("#post-"+ this.id+"");
        this.updateRatingLabel(view);
    },
    updateRatingLabel : function (view)
    {
        var prev = view.find(".ratingLabel").html();
        if (prev < this.rating)
        {
            view.find(".ratingLabel").html(this.rating).removeClass("highlatedRed").addClass("highlatedGreen");
            setTimeout(function(){
                view.find(".ratingLabel").removeClass("highlatedGreen");
            }, 8000);
        }
        else
        {
            view.find(".ratingLabel").html(this.rating).removeClass("highlatedGreen").addClass("highlatedRed");
            setTimeout(function(){
                view.find(".ratingLabel").removeClass("highlatedRed");
            }, 8000);
        }
    },
    /*
     * Parse direct users in message(post)
     * @param data - string array of ids
     */
    parseConnectionMessage : function (data)
    {
        
        var View = $("#post-"+this.id);
        this.mUsers = {};
        
        for (var i=0, l=data.length; i<l; i++)
        {
            this.mUsers[data[i]] = this.Application.users[data[i]];
        }
        
        this.renderDirectUsers (View);
       
        
    }
  
};

