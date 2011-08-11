/* 
 * Post 
 */
function Post (Application, id, data)
{
    Post.superclass.constructor.call( this );
    
    this.Application     = Application;
  
    this.id              = id;
    this.parentPostId    = data.ParentPostId;
    this.authorId        = data.AuthorId;
  
    this.createTime      =  data.CreateTime;
    this.createTimeF     = formatDate(this.createTime);
    
    this.text            = data.Text;
    
    this.posts           = {};
    
    (this.update = function ( data )
    {
        this.relevantWeight = data.RelevantWeight;
        
    }).call(this, data);
}
extend(Post, Facade);

Post.prototype = {
    openFacade : function ( View )
    {
        this.loadChilds( View );        
    },
    prepareRender : function()
    {
    },
    attachBehavior : function ( View )
    {
        var facade = this;
        /*
        var parentFacade = facade.Application.branches[facade.parentBranchId];
        if (parentFacade && parentFacade.navGraph != undefined)
        {
            View.hover(function( ){
                    parentFacade.navGraph.highlightBranch = facade.id;
                }, function( ){
                    parentFacade.navGraph.highlightBranch = 0;
            });
        }
        */
        
        View.find("header").click(function (){
            facade.openFacade( View );
        });
        
        View.find(".show_reply").click(function(){
           
            var control = $(this);
           
            control.toggleClass("opened");
           
            if (control.hasClass("opened"))
            {
                $.tmpl("reply", {
                    id : facade.id
                }).insertAfter( View.find(".inner") ).show();
               
                View.find("form.replyform").submit(function(){
                    
                    facade.Application.removeReplyForm();
                    
                    View.find(".show_reply").removeClass( "opened" );

                    var data = facade.Application.formArrayToData( $(this).formToArray( ) );
                    
                    facade.Application.ajaxRequest( "/Slice.json", 
                        function ( data ) {
                            
                            // сделать правильное добавление поста в режиме plain
                            
                            var newData = facade.Application.parseResponseData( data );

                            var parentFacade = facade.id;
                            var parentView = View;
                            
                            if ($("[name=mode]:checked").val() == "plain" ) {
                                parentFacade = View.attr("data-parent");
                                parentView = $("article[data-id=" + parentFacade + "]");
                            }
                            
                            for (var i=0; i< newData.posts.length; i++)
                            {
                                var post = facade.Application.posts[newData.posts[i]];
                                //                                var postView = $("article[data-id='" + post.id + "']");
                                post.render({
                                    el     : parentView, 
                                    tmpl   : 'post', 
                                    mode   : 'insertAfter',
                                    parent : parentFacade
                                });
                                
//                                window.location.href="#post-"+post.id;
                            }

                        }, function(){
                            facade.Application.msg("Couldn't post comment");
                        },
                        data
                        );        
                    return false;
                });        

                
            }
            else
            {
                facade.Application.removeReplyForm()
            }
           
            return false;
        });
        
        
    },
    render : function ( params )
    {
  
        this.prepareRender();

        var View = this.renderSelf(params.el, params.tmpl, params.mode, params.parent)
        
        var facade = this;
        
        this.attachBehavior(View);
        
        return View;
    },
    loadChilds : function ( View )
    {
        var facade = this;
        this.Application.ajaxRequest('/Slice.json',
            function ( response ) {
                
                facade.removeAfterPosts ( facade.id );
                
                var newData = this.parseResponseData(response);

                for (var i= newData.posts.length; i--; )
                {
                    if (facade.Application.posts[newData.posts[i]].parentPostId == facade.id)
                    {
                        facade.posts[newData.posts[i]] = facade.Application.posts[newData.posts[i]];
                    }
                }
                // Render
                facade.expandPosts( View );
            },
            function () {

                facade.Application.msg("Count`t get post list for post: " + facade.id);

            },
            {
                parentPostId  : this.id
            }
        );        
    },
    expandPosts : function ( View )
    {
        
        for (i in this.Application.posts)
        {
            // @render key here
            if (this.Application.posts[i].parentPostId == this.id)
            {
                this.Application.posts[i].render({
                    el: View,
                    tmpl: "post",
                    mode: "insertAfter",
                    parent: this.id
                });
            }
        };

    }
};

