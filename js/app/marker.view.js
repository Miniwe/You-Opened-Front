/*
 * недоделано закрытие таба
 */

var MarkerView = function ( Marker )
{
    this.Marker = Marker;
        
    this.tabView = null; 
    this.iconView = null; 
        
    return this;
}

MarkerView.prototype = {
    removeTab : function ()
    {
//        if ( $(this).hasClass('newposts') ) {
//            return false;
//        }
        var parentContainer = this.tabView;
        var divider = $(parentContainer).prev(".divider");
        $(divider).remove();
        $(parentContainer)
            .animate({"width": "0"}, function ( ){
                $(this).remove();
                
            });
        this.tabView = null;
    },
    iconExist : function ()
    {
        return this.iconView;
    },
    updateIcon : function ( iconType )
    {
        if ( this.iconExist( ) ) {
            this.iconView.find(".count").html(this.Marker.postsCount);
            if (this.Marker.postsCount > 0) {
                this.iconView.removeClass("hidden");
            } else {
                this.iconView.addClass("hidden");
            }
        }
        else {
            this.addIcon( iconType );
        }
    },
    addIcon : function ( iconType )
    {
        if (this.Marker.postsCount < 1) {
            return false;
        }
        var Marker = this.Marker;
        
        this.iconView = $('<div class="icon-container inline" title="' +
            this.Marker.name + '"><div class="icon24set right-icon ntfn-'+
            iconType +'"></div></div>')
            .css({ "opacity": "0" })
            .appendTo("#notifications")
            .animate({ "opacity": "1"});
        $('<span class="count"></span>').appendTo(this.iconView.find(".icon24set"));
        this.iconView.find(".count").html( this.Marker.postsCount );
        
        this.iconView.click(function(){
            
            Marker.setAction ( function ( newData ) {
                
                this.addPosts( newData );
                this.View.updateTab();
                this.Application.View.clearMain();
                this.View.drawPosts();
            } );

            Marker.makeRequest();

        });
            
    },
    tabExist : function ()
    {
        return this.tabView;
    },
    updateTab : function ()
    {
        if ( this.tabExist() ) {
            // update process
        }
        else {
            this.addTab();
        }
    },
    addTab : function ()
    {
        var Marker = this.Marker,
            tabWidth = 0;

        var tab = $.tmpl( 'top-tab', {
            name: this.Marker.name
        })
            .css({ "opacity": "0" })
            .insertAfter("#search-tab")
            .animate({ "opacity": "1"});
        
        // tab events    
        tab.find(".icon24set.action").click(function(){
            if ( $(this).hasClass('newposts') ) {
                return false;
            }
            var parentContainer = $(this).parents(".tab");
            var divider = $(parentContainer).prev(".divider");
            $(divider).remove();
            $(parentContainer)
                .animate({"width": "0"}, function ( ){
                    $(this).remove();
                });

            return false;
        });
        
        tab.click(function(){
            Marker.Application.View.clearMain();
            Marker.View.drawFragments();
            Marker.View.selectTab();
        });
        
        this.tabView = tab;

    },
    drawPosts : function ()
    {
        
        for ( var id in this.Marker.posts ) {
            
            var postView = this.Marker.posts[id].View.render({
                parentView : $("#main"),
                insertMode : 'prependTo',
                tmpl : 'post',
                parent : "#main"
            });
        }
    },
    drawFragments : function ()
    {
        for ( var id in this.Marker.fragments ) {
            
            var fragmentView = this.Marker.fragments[id].render({
                parentView : $("#main"),
                insertMode : 'prependTo',
                tmpl : 'fragment'
            });
            
            var branchView = this.Marker.fragments[id].branch.View.render({
                parentView : fragmentView.find(".post"),
                insertMode : 'appendTo',
                tmpl : 'post-more',
                parent : id
            });
            
            var postView = this.Marker.fragments[id].branch.post.View.render({
                parentView : fragmentView.find(".post"),
                insertMode : 'prependTo',
                tmpl : 'post',
                parent : id
            });
            
            this.Marker.fragments[id].View.attachBehavior ();
        }        
    },
    selectTab : function ()
    {
        $("nav.toolbar .tab-title").removeClass("selected");
        this.tabView.find(".tab-title").addClass("selected");
    }
}

