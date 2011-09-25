/*
 */

var FragmentView = function ( Fragment )
{
    this.Fragment = Fragment;
    
    this.View = $(document.body);
        
    return this;
}

FragmentView.prototype = {
    attachBehavior : function ( )
    {
        this.Fragment.branch.View.attachBehavior ( this );
        this.Fragment.branch.post.View.attachBehavior ( this );
    },
    hideFragmentElements : function ( )
    {
        this.View.find('.post-more').hide();
    },
    showFragmentElements : function ( )
    {
        this.View.find('.post-more').show();
    },
    closeContent : function ( )
    {
        this.Fragment.branch.post.View.closeContent( );
        
        this.showFragmentElements();
//        this.closeRightSide();
    },
    closeOtherFragments : function ( )
    {
        this.Fragment.Application.closeAllFragments();
    },
    openContent : function ( )
    {
        this.closeOtherFragments();
        
        this.Fragment.branch.post.View.openContent( this.Fragment.branch.post.View );
        
//        this.View.find(".state").addClass('expanded');
//        this.Fragment.openMainBranch();
        
        this.hideFragmentElements();
//        this.openRightSide();
    },
    drawContent : function ( parentView, content )
    {
        $( content )
//            .css({"opacity":"0"})
            .insertAfter( parentView );
//            .animate({"opacity":"1"}, 400, function (){} );
    },
    closeRightSide : function ( )
    {
        var Fragment = this.Fragment;
        
        this.View.find(".side").css({
            "opacity" : "0",
            "display": 'none'
        });
        Fragment.removeNavGraph();
        Fragment.View.View.find(".side .content *").remove();
        
//        this.View.find(".side")
//            .animate({
//                "opacity":"0"
//            }, 'slow', function () {
//                
//                $(this).css({
//                    "opacity":"0",
//                    "display": 'none'
//                });
//                Fragment.removeNavGraph();
//                Fragment.View.View.find(".side .content *").remove();
//            });
    },
    openRightSide : function ( )
    {
        this.drawNavigram();
        this.drawTagCloud();
        this.drawAuthorCloud();
        this.View.find(".side")
            .css({
                "opacity":"0",
                "display": 'block'
            })
            .animate({
                "opacity":"1"
            }, 'slow');
    },
    render : function ( params )
    {
        switch ( params.insertMode )
        {
            case "appendTo":
                this.View = $.tmpl( params.tmpl, this ).appendTo( params.parentView );
                break;
            
            case "prependTo":
                this.View = $.tmpl(params.tmpl, this).prependTo( params.parentView );
                break;
            
            case "insertAfter":
                this.View = $.tmpl(params.tmpl, this).insertAfter( params.parentView );
                break;
            
            case "insertBefore":
                this.View = $.tmpl(params.tmpl, this).insertBefore( params.parentView );
                break;
            
            case "prepend":
                this.View = $.tmpl(params.tmpl, this).prepend( params.parentView );
                break;
            
            default:
                this.Fragment.Application.msg("Incorrect render mode for " + params.tmpl);
        }
        
        return this.View;
    }

}

