/* 
 * Post 
 */
function Post (Application, id, data)
{
    Post.superclass.constructor.call( this );
    
    this.Application     = Application;
  
    this.id              = id;
    this.parentPostId    = data.ParentPostId;
    
    this.branchId         = 0;
    this.fragment         = 0;
    this.branchRef        = "";
    
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
        window.location = "#post-"+this.id;
        this.loadChilds( View );        
    },
    prepareRender : function()
    {
        this.branchId = 0;
        for (var id in this.Application.branches)
        {
            if ( this.id == this.Application.branches[id].postId ) {
                this.branchId = id; 
                break;
            } else if ( this.parentPostId == this.Application.branches[id].postId ) {
                this.branchId = id; 
            }
        }
        if ( this.branchId )
        {
            this.branchRef = "#branch-"+id+"#post-"+this.id;
            
            this.fragment = null;
            for (var i = this.Application.fragments.length; i--;)
            {
                if ( this.Application.fragments[i].branch.id == this.branchId )
                {
                    this.fragment = this.Application.fragments[i];
                }
                else
                {
                    for ( var j in this.Application.fragments[i].branch.branches )
                    {
                        if ( this.Application.fragments[i].branch.branches[j].id == this.branchId )
                        {
                            this.fragment = this.Application.fragments[i];
                            break;
                        }
                    }
                }
                if ( this.fragment )
                {
                    break;
                }
            }
        }
    },
    attachBehavior : function ( View )
    {
        var Facade = this;
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
        View.mouseover(function (){
            // послать сингал для navGraph фрагмента чтоб выделил на диаграме нужную ветку
            if ( Facade.fragment && Facade.fragment.navGraph )
            {
                Facade.fragment.navGraph.highlightBranch = Facade.branchId;
            }
            
        });

        View.mouseout(function (){
            // послать сингал для navGraph фрагмента чтоб выделил на диаграме нужную ветку
            if ( Facade.fragment && Facade.fragment.navGraph )
            {
                Facade.fragment.navGraph.highlightBranch = "";
            }
            
        });


        View.find("header").click(function (){
            Facade.openFacade( View );
        });
        
        View.find(".gotobranch").click(function (){
            var go_params = $(this).attr("data-ref").match(/\#[a-z]+\-[a-w0-9_]+/g); 
//            var parent_id = $(this).parents('article').attr("data-parent");
            var branch_id = go_params[0].split("-")[1];
            var post_id = go_params[1].split("-")[1];
            
            Facade.fragment.addFocusedBranch( Facade.Application.branches[ branch_id ] );
            
            return false;
        });
        
        View.find(".show_reply").click(function(){
           
            var control = $(this);
           
            control.toggleClass("opened");
           
            if (control.hasClass("opened"))
            {
                $.tmpl("reply", {
                    id : Facade.id
                }).insertAfter( View.find(".inner") ).show();
               
                View.find("form.replyform").submit(function(){
                    
                    Facade.Application.removeReplyForm();
                    
                    View.find(".show_reply").removeClass( "opened" );

                    var data = Facade.Application.formArrayToData( $(this).formToArray( ) );
                    
                    Facade.Application.ajaxRequest( "/Slice.json", 
                        function ( data ) {
                            
                            // сделать правильное добавление поста в режиме plain
                            
                            var newData = Facade.Application.parseResponseData( data );

                            var parentFacade = Facade.id;
                            var parentView = View;
                            
                            if ($("[name=mode]:checked").val() == "plain" ) {
                                parentFacade = View.attr("data-parent");
                                parentView = $("article[data-id=" + parentFacade + "]");
                            }
                            
                            for (var i=0; i< newData.posts.length; i++)
                            {
                                var post = Facade.Application.posts[newData.posts[i]];
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
                            Facade.Application.msg("Couldn't post comment");
                        },
                        data
                        );        
                    return false;
                });        

                
            }
            else
            {
                Facade.Application.removeReplyForm()
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

