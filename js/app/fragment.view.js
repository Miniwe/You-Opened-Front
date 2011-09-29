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
        this.Fragment.branch.post.View.closeContent();
        
        this.showFragmentElements();
        
        this.closeRightSide();
        
        $(this.View).find(".post-content").removeClass("float");
        $(this.View).removeClass("active");
        
    },
    closeOtherFragments : function ( )
    {
        this.Fragment.Application.closeAllFragments();
        
        $(".fragment").not(this.View).removeClass("active");
        
    },
    openContent : function ( )
    {
        this.closeOtherFragments();
        
        this.Fragment.Application.activeFragment = this.Fragment;
        
        this.Fragment.isActive = true;
        
        $(this.View).addClass("active");
        
        this.Fragment.branch.post.View.openContent( this.Fragment.branch.post.View );
        
//        this.View.find(".state").addClass('expanded');
//        this.Fragment.openMainBranch();
        
        this.hideFragmentElements();
        this.openRightSide();
    },
    closeRightSide : function ( )
    {
        this.Fragment.parentMarker.View.drawRightSide();
    },
    openRightSide : function ( )
    {
        this.Fragment.Marker.View.drawRightSide({
            navigram : this.Fragment.branch,
            tagCloud : this.Fragment.branch.tags,
            userCloud : this.Fragment.branch.authors
        });
        $("#fragment-arrow").removeClass("hidden");
    },
    render : function ( params )
    {
        
        switch ( params.insertMode )
        {
            case "appendTo":
                this.View = $.tmpl( params.tmpl, this.Fragment ).appendTo( params.parentView );
                break;
            
            case "prependTo":
                this.View = $.tmpl(params.tmpl, this.Fragment).prependTo( params.parentView );
                break;
            
            case "insertAfter":
                this.View = $.tmpl(params.tmpl, this.Fragment).insertAfter( params.parentView );
                break;
            
            case "insertBefore":
                this.View = $.tmpl(params.tmpl, this.Fragment ).insertBefore( params.parentView );
                break;
            
            case "prepend":
                this.View = $.tmpl(params.tmpl, this.Fragment ).prepend( params.parentView );
                break;
            
            default:
                this.Fragment.Application.msg("Incorrect render mode for " + params.tmpl);
        }
        
        return this.View;
    },
    updateFragment : function ()
    {
        this.closeContent();
        
        this.View.find(".post").html("");
        
        var branchView = this.Fragment.branch.View.render( {
            parentView : this.View.find(".post"),
            insertMode : 'appendTo',
            tmpl : 'post-more',
            parent : this.Fragment.id
        });

        var postView = this.Fragment.branch.post.View.render({
            parentView : this.View.find(".post"),
            insertMode : 'prependTo',
            tmpl : 'post',
            parent : this.Fragment.id
        });

        this.attachBehavior();
        
        postView.find(".state").click();
        // add main
        // add branch data
        // click to open main ...
        
    },
    updateRightSide : function ()
    {
        
    }

}

