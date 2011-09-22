/*
 * недоделано закрытие таба
 */

var MarkerView = function ( Marker )
{
    this.Marker = Marker;
        
    this.tabView = null; 
        
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
    },
    addTab : function ()
    {
        var Marker = this.Marker,
            tabWidth = 0;

        var tab = $.tmpl( 'top-tab', {
            name: this. Marker.name
        })
            .css({ "opacity": "0" })
            .insertAfter("#search-tab")
            .animate({ "opacity": "1" });
        
            
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
// open post должен для поста порождать открытие подпостов
// для фрагмента должен порождать открытие фрагмента
        }        
    },
    selectTab : function ()
    {
        $("nav.toolbar .tab-title").removeClass("selected")
        this.tabView.find(".tab-title").addClass("selected")
    }
}

