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
        
        this.Fragment.branch.post.View.openContent( );
        
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
        var Fragment = this.Fragment;
        this.Fragment.Marker.View.drawRightSide({
            navigram : this.Fragment.branch,
            tagCloud : this.Fragment.branch.tags,
            userCloud : this.Fragment.branch.authors
        });
        
        $("#fragment-arrow").removeClass("hidden");
        $("#side .filter").removeClass("hidden");
        $("#side .mode").removeClass("hidden");
        

        $("#side .mode").unbind('click').click(function(){
            var action = 'plain',
                subParams = {
                    depth : 2
                };
            if ( $(this).hasClass('mode-hierarhy') ) {
                action = 'hierarhy';
                subParams = {
                    depth : 0
                };
            }
            
            Fragment.Marker.viewMode = action;
            
            $(this).toggleClass("mode-hierarhy").toggleClass("mode-plain");
            
            Fragment.Marker.addParams(subParams);
            
            Fragment.Marker.setAction( function ( newData ) {
                Fragment.clear();
                Fragment.fillData( newData );
                Fragment.View.updateFragment();
                Fragment.View.updateRightSide();
            } );

            Fragment.Marker.saveState();
            
            Fragment.Marker.makeRequest();
        });
            
        $("#side .move").removeClass("hidden");
        
        $("#side .filter").unbind("click").click( function (){
            // show filter form
            // при update form делать обновление полей
            // и перегружать маркер как при сменене основного поста 

            Fragment.View.showFilterForm();
            
        });
        
    },
    showFilterForm : function ( )
    {
        var fragment = this.Fragment;
        var marker = fragment.Marker;
        
        var filterForm = $.tmpl("filter-form", {
            searchField : "",
            tags : marker.View.prepareParams( marker.getParam('tagIds'), 'tag'),
            users : marker.View.prepareParams( marker.getParam('authorIds'), 'user')
        })
            .css({"opacity": "0"})
            .prependTo("#side .content")
            .animate({"opacity": "1"});
            
        filterForm.find(".closeopts").click(function(){
            filterForm.remove();
        });
        
        marker.View.addAutocomplete( filterForm.find("#filter-tags"), "tag" );
        
        marker.View.addAutocomplete( filterForm.find("#filter-users"), "user" );
        
        filterForm.find("form").submit(function(){
        
            var data = fragment.Application.formArrayToData($(this).formToArray()),
                tagIds = getIds(data.filterTags),
                userIds = getIds(data.filterUsers);
            
            if ( data.filterSearchField != '' ) {
                marker.addParams({'query' : data.filterSearchField});
            }
            if ( tagIds != '') {
                marker.addParams({'tagIds' : tagIds});
            }
            if ( userIds != '' ) {
                marker.addParams({'authorIds' : userIds});
                
            }
                

            marker.setAction( function ( newData ) {
                  fragment.clear();
                  fragment.fillData( newData );
                  fragment.View.updateFragment();
                  fragment.View.updateRightSide();
            } );
            
            marker.saveState();
            
            marker.makeRequest();
            
            return false;
        })
        
    },
    closeFilterForm : function ( )
    {
        $("#side .content").find(".filterForm").remove();
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
        
        postView.css({"border-color": this.Fragment.branch.color});

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

