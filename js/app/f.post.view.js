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
        ParentView = ( ParentView ) ? ParentView : this.View;
        
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

        this.View.find(".gotobranch").click(function (){
//            var parent_id = $(this).parents('article').attr("data-parent");
            var go_params = $(this).attr("data-ref").match(/\#[a-z]+\-[a-w0-9_]+/g); 
            var branch_id = go_params[0].split("-")[1];
            var post_id = go_params[1].split("-")[1];
            
            Facade.fragment.addFocusedBranch( Facade.Application.branches[ branch_id ] );
            
            return false;
        });
        
    },
    
    closeContent : function ( )
    {
        this.View.find(".state").removeClass('expanded');
        
        this.removePostChilds ( this.Post, false );
        
        this.Post.opened = false;
    },
    openContent : function ()
    {
        var dfd = $.Deferred();
        
        this.View.find(".state").addClass('expanded');
        
        this.Post.openPostChilds( dfd );
        
        this.Post.opened = true;
        
        return dfd.promise();
    },
    showPostChils : function ( )
    {
        var content = this.drawChildsList( );
        this.drawContent( content );
    },
    
    focusPost: function ( postId ) 
    {
//        var offset = $("#post-" + postId).offset(); 
//        offset.top -= $("#main-header").outerHeight(true);
//        $(document.body).scrollTop(offset.top)
    },
    drawPost : function ( post )
    {
         var newView = post.View.render({
            parentView: this.View, 
            tmpl: "post", 
            insertMode :"insertAfter",
            parent: this.Post.id
        });
        
        post.View.attachBehavior( );
        
        return newView;
    },
    drawListHierarhy: function ( posts_list, color, View )
    {
        var b, id;
        var app_posts = this.Post.Application.posts,
            newView = null;
        for ( id in posts_list )
        {
//            b = this.Application.branchExist( id );
            b = false;
            
            newView = this.drawPost( app_posts[ id ] );
            
//            if ( b = this.Application.branchExist( id ) )
//            {
//                b.drawListHierarhy( posts_list, b.color, newView );
//            }
            
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
    drawContent : function ( content )
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
                return false;
        }
        
        this.addReplyForm();
        
        this.renderAvatar( this.View, this.Post.author );
        
        return this.View;
    },
    addAutocomplete : function ( filed, facadeType )
    {
        var Application = this.Post.Application;
        filed.find(".directusernames").autocomplete( Application.globalPath + 
            Application.frameworkPath + '/Suggest.json', {
                width: filed.find(".directusernames").width(),
                dataType : "jsonp",
                multiple: true,
                matchContains: true,
                selectFirst: true,
                minChars: 1,
                autoFill: true,
                extraParams:  {
                    facadeType : facadeType
                },
                parse : function ( data ) {
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
    },
    addReplyForm : function ( )
    {
        var Post = this.Post,
            content = document.createDocumentFragment(),
            form = $.tmpl('reply', {
                id : this.Post.id
            });
            
        content.appendChild( form[0] );
        
        $(content).appendTo( this.View.find('.reply-cont') );
        
        var replyForm = $("#post-"+ Post.id).find(".reply");
        
        replyForm
            .mouseout( function ( ) {
            replyForm
                .find(".content .title")
                .html( replyForm.attr("title") );
        });
        
        replyForm.find(".modes .icon16set")
            .mouseover( function ( ) {
                replyForm.find('.title').html(  );
            } )
            .click( function ( ) {
                var newField = false;
                switch ( $(this).attr('data-type') )
                {
                    case 'dm':
                        if ( replyForm.find('.directusernames').length < 1 ) {
                            newField = $.tmpl("field-direct-users").prependTo( replyForm.find(".additional-fields"));
                            Post.View.addAutocomplete( newField, "user" );
                        }
                        break;
                    case 'invite':
                        if ( replyForm.find('.field.withInvite').length < 1 ) {
                            newField = $.tmpl("field-with-invite").appendTo( replyForm.find(".additional-fields"));
                        }
                        break;
                    default:
                        // no actions
                }
                
                if (newField) {
                    newField.find(".close_small").click(function(){
                        newField.remove();
                    });
                }
                // to close add action to remove
                replyForm.find('.title').click();
                
                if (replyForm.find('.directusernames').length > 0) {
                    replyForm.find('.directusernames').focus();
                }
                // focus to direct users if exist
                
            });
            
        // form events
        replyForm.find('.title').click( function ( ) {
            replyForm.addClass("opened");
            
            replyForm.find('form').resetForm();

            replyForm.find('.inner').slideDown('medium', function(){
                replyForm.find('.reply-textarea').focus();
            });
        });
        
        replyForm.find('.cancel-reply').click( function ( ) {
            replyForm.find('.postform').resetForm();
            replyForm.find('.inner').slideUp("fast",function (){
                replyForm.find('.field').remove();
            });
            return false;
        });
        
        replyForm.find('textarea.reply-textarea')
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
            
        replyForm.find(".postform").submit( function ( ) {
            var data = Post.Application.formArrayToData($(this).formToArray());
            
            if ( data.directusernames != undefined)
            {
                data.directUserIds = getIds(data.directusernames);
            }
            if ( data.inviteinclude != undefined)
            {
                data.text += '<hr /> Link to post <strong>'+ Post.id + '</strong>'
            }
            
            replyForm.find('.cancel-reply').click();
            
            Post.Application.ajaxRequest(replyForm.find(".postform").attr("action"), 
                function( response ){
                    
                    Post.processPostSubmit( response );

                }, function(){
                     Post.Application.msg("Couldn't post message. Server error");
                },
                data
            );                
            return false;
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
