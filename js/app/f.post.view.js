/*
 */

var PostView = function ( Post )
{
    this.Post = Post;
    
    this.View = $(document.body);
        
    return this;
}

PostView.prototype = {
    attachBehavior : function ( ParentView )
    {
        var PostView = this;
        
        this.View.find('.text')
            .css({'cursor': 'pointer'})
            .click( function ( ) {
                ParentView.openContent();
            } );
            
        this.View.find(".state").click( function () {
            $(this).toggleClass('expanded');
            
            if ($(this).hasClass( 'expanded' )) {
                PostView.View.find('.text').click();
            }
            else {
                ParentView.closeContent();
            }
        });
    },
    attachBehaviorOld : function ( )
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
       
        this.View.mouseover(function (){
            // послать сингал для navGraph фрагмента чтоб выделил на диаграме нужную ветку
            if ( Facade.fragment && Facade.fragment.navGraph )
            {
                Facade.fragment.navGraph.highlightBranch = Facade.branchId;
            }
            
        });

        this.View.mouseout( function ( ) {
            // послать сингал для navGraph фрагмента чтоб выделил на диаграме нужную ветку
            if ( Facade.fragment && Facade.fragment.navGraph )
            {
                Facade.fragment.navGraph.highlightBranch = "";
            }
            
        });


        this.View.find("header").click( function (){
            Facade.openFacade( );
        } );
        
        this.View.find(".gotobranch").click(function (){
//            var parent_id = $(this).parents('article').attr("data-parent");
            var go_params = $(this).attr("data-ref").match(/\#[a-z]+\-[a-w0-9_]+/g); 
            var branch_id = go_params[0].split("-")[1];
            var post_id = go_params[1].split("-")[1];
            
            Facade.fragment.addFocusedBranch( Facade.Application.branches[ branch_id ] );
            
            return false;
        });
        
        this.View.find(".show_reply").click( function( ) {
           
           var control = $(this);
           
           control.toggleClass("opened");
           
           if (control.hasClass("opened"))
           {
               $.tmpl("reply", {
                   id : Facade.id
               }).insertAfter( Facade.View.find(".inner") ).show();
               
               Facade.Application.addReplyFormBehavior( Facade, Facade.View );
           }
           else
           {
               Facade.Application.removeReplyForm()
           }
           
           return false;
        });
        
        /*
        View.find(".show_reply").click( function ( ) {
           
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
                } );        
                
            }
            else
            {
                Facade.Application.removeReplyForm()
            }
           
            return false;
        } );
        */
        
    },
    
    closeContent : function ( )
    {
        this.View.find(".state").removeClass('expanded');
        
        this.removePostChilds ( this.Post, false );
    },
    openContent : function ( parentView )
    {
        this.View.find(".state").addClass('expanded');
        
        this.Post.openPostChilds( parentView );
    },
    showPostChils : function ( parentView )
    {
        var content = this.drawChildsList( );
        this.drawContent( parentView, content );
    },
    
    drawListHierarhy: function ( posts_list, color, View)
    {
        var b, id;
        var app_posts = this.Post.Application.posts;
        for ( id in posts_list )
        {
//            b = this.Application.branchExist( id );
            b = false;
            
            if ( b )
            {
                var newView = app_posts[ id ].View.render({
                    parentView: View, 
                    tmpl: "post", 
                    insertMode :"insertAfter",
                    parent: this.id
                });
                
                b.drawListHierarhy( posts_list, b.color, newView );
            }
            else
            {
                var newView = app_posts[ id ].View.render({
                    parentView: View, 
                    tmpl: "post", 
                    insertMode :"insertAfter",
                    parent: this.id
                });
            }
            
            var parentOffset = $(View).css("margin-left") || 0;
            newView.css({"margin-left": (parentOffset + 24) +"px"});
            app_posts[ id ].View.attachBehavior( app_posts[ id ].View );
            
            /*
             * перебирать все посты ветки
             * если пост является корнем другой ветки то его рисовать с другим цветом
             * запускать с этим цветом перебор 
             */
            View.appendChild( newView[0] );
        }
        
    },
    drawChildsList : function ( )
    {
        var content = document.createDocumentFragment();
        
        this.drawListHierarhy ( this.Post.posts, "#ffffff", content );
        
        return content;
        
    },
    drawContent : function ( parentView, content )
    {
        $( content )
//            .css({"opacity":"0"})
            .insertAfter( this.View );
//            .animate({"opacity":"1"}, 400, function (){} );
    },
    render : function ( params )
    {
        this.Post.prepareRender();
        
        var renderObj = this.Post;
        
        switch ( params.insertMode )
        {
            case "appendTo":
                this.View = $.tmpl( params.tmpl, renderObj ).appendTo( params.parentView );
                break;
            
            case "prependTo":
                this.View = $.tmpl(params.tmpl, renderObj ).prependTo( params.parentView );
                break;
            
            case "insertAfter":
                this.View = $.tmpl(params.tmpl, renderObj ).insertAfter( params.parentView );
                break;
            
            case "insertBefore":
                this.View = $.tmpl(params.tmpl, renderObj ).insertBefore( params.parentView );
                break;
            
            case "prepend":
                this.View = $.tmpl(params.tmpl, renderObj ).prepend( params.parentView );
                break;
            
            default:
                this.Post.Application.msg("Incorrect render mode for " + params.tmpl);
        }
        
        this.addReplyForm();
        
        this.renderAvatar( this.View, this.Post.author );
        
        return this.View;
    },
    addReplyForm : function ( )
    {
        var content = document.createDocumentFragment(),
            form = $.tmpl('reply', {
                id : this.Post.id
            });
            
        content.appendChild( form[0] );
        
        $(content).appendTo( this.View.find('.reply-cont') );
        
        var postArea = $("#post-"+this.Post.id);
        

        postArea.find(".icon16set").mouseover( function ( ) {
            var parentCont = $(this).parents(".reply-closed");
            parentCont.find(".reply .content")
                .html( $(this).attr("title") );
        } );
                       
        // form events
        postArea.find('.title').click( function ( ) {
            postArea.find('form').resetForm();
            postArea.find('.inner').slideDown('medium', function(){
                postArea.find('.reply-textarea').focus();
            });
        });
        
        postArea.find('.cancel-reply').click( function ( ) {
            postArea.find('.inner').slideUp();
            return false;
        });
        
        postArea.find('textarea.reply-textarea')
            .css({"height": "18px"})
            .autoResize({ // On resize:
                onResize : function() {
                    $(this).css({opacity:0.8});
                },
                // After resize:
                animateCallback : function() {
                    $(this).css({opacity:1});
                },
                // Quite slow animation:
                animateDuration : 300,
                // More extra space:
                extraSpace : 18
            });
        
    },
    renderAvatar : function ( View, user, size )
    {
        var size = size || 72;
        $.each( View.find( '.avatarHref' ), function ( i, el ) {
            $( el ).html( $.md5( user.name ) );
            $( el ).identicon5( {
                size: size 
            });
        });    
        
    },
    removePostChilds : function ( parentPost, deleteSelf )
    {
        for ( var id in this.Post.Application.posts ) {
            if ( this.Post.Application.posts[id].parentPostId == parentPost.id ) {
                
                
                this.removePostChilds( this.Post.Application.posts[id], true );
                
                $("#post-" + this.Post.Application.posts[id].id)
                    .animate( {"opacity":"0 "}, 200, function () { 
                        $(this).remove();
                    });
            }
        }
        if (deleteSelf) {
            $("#post-" + parentPost.id)
                .animate( {"opacity":"0"}, 200, function () { 
                    $(this).remove();
                });
        }
        
    },
    doNothing : function () {}
}

