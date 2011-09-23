/*
 *  
 */

var BranchView = function ( Branch )
{
    this.Branch = Branch;
    
    this.View = $(document.body);
    
    return this;
}

BranchView.prototype = {
    attachBehavior : function ( )
    {
        var BranchView = this.View;
        this.View.find(".keychange").click( function( ) {
           BranchView.find(".keychange").removeClass("active")
           $(this).addClass("active")
           $(this).parents(".post-more").find("ul.branch_keys li").hide();
           $(this).parents(".post-more").find("ul.branch_keys li[data-id=" + $(this).attr("data-id") + "]").show();
           return false;
        });
        
        this.View.find(".icon24set.icon-left").click( function( ) {
            var active = $(this).parents(".post-more").find("ul.branch_keys li:visible").prev("li");
            if (active.length < 1)
            {
                active  = $(this).parents(".post-more").find("ul.branch_keys li:last");
            }
            $(".keychange[data-id=" + active.attr("data-id") + "]").click();
           return false;
        });
        
        this.View.find(".icon24set.icon-right").click( function( ) {
            var active = $(this).parents(".post-more").find("ul.branch_keys li:visible").next("li");
            if (active.length < 1)
            {
                active  = $(this).parents(".post-more").find("ul.branch_keys li:first");
            }
            $(".keychange[data-id=" + active.attr("data-id") + "]").click();
           return false;
        });
        
        /*
var Facade = this;
        
        this.View.find("header").click( function ( ) {
            Facade.openFacade( );
        } );
        
        this.View.find(".collapse_control").click(function( ) {
           
           var control = $(this);
           
           control.toggleClass( "opened" );
           
           if ( control.hasClass( "opened" ) ) {
               Facade.openFacade( );
           }
           else
           {
               Facade.closeFacade( );
           }
        } );
        
        this.View.find(".show_reply").click( function( ) {
           
           var control = $(this);
           
           control.toggleClass("opened");
           
           if (control.hasClass("opened"))
           {
               $.tmpl("reply", {
                   id : Facade.postId
               }).insertAfter( Facade.View.find(".inner") ).show();
               
               Facade.Application.addReplyFormBehavior( Facade, Facade.View );
           }
           else
           {
               Facade.Application.removeReplyForm()
           }
           
           return false;
        });
        
        this.View.find(".keychange").click( function( ) {
           $(".keychange").removeClass("active")
           $(this).addClass("active")
           $(this).parents(".branch").find("ul.branch_keys li").hide();
           $(this).parents(".branch").find("ul.branch_keys li[data-id=" + $(this).attr("data-id") + "]").show();
           return false;
        });
        
        this.View.find(".prevkey").click( function( ) {
            var active = $(this).parents(".branch").find("ul.branch_keys li:visible").prev("li");
            if (active.length < 1)
            {
                active  = $(this).parents(".branch").find("ul.branch_keys li:last");
            }
            $(".keychange[data-id=" + active.attr("data-id") + "]").click();
           return false;
        });
        
        this.View.find(".nextkey").click( function( ) {
            var active = $(this).parents(".branch").find("ul.branch_keys li:visible").next("li");
            if (active.length < 1)
            {
                active  = $(this).parents(".branch").find("ul.branch_keys li:first");
            }
            $(".keychange[data-id=" + active.attr("data-id") + "]").click();
           return false;
        });
        
        this.View.find(".openkey").click( function( ) {
            var postId = $(this).attr("data-id");
            Facade.openFacade( function (){
//                console.log('will be opened', postId, Facade.Application.posts[postId]);
                var View = $("article.key[data-id=" + postId + "]");
                if (View)
                {
                    $(document.body).scrollTop( View.offset().top + Facade.View.outerHeight(true) );
                }
            });
           return false;
        });
        
                  
         */
        
    },
    render : function ( params ) {
        
        this.Branch.prepareRender();
        
        var renderObj = this.Branch;
        
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
                renderObj.Application.msg("Incorrect render mode for " + params.tmpl);
        }
        
        return this.View;
    }
    
}

