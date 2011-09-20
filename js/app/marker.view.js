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
        var Marker = this.Marker;

        var divider = $('<div class="divider"><div class="inner"></div></div>')
            .css({ "display": "inline-block" })
            .insertAfter("#search-tab");
        var tab = $(  '<div class="tab active round-border"><div class="icon24set left-icon move"></div><div class="tab-title">'
            + this. Marker.name
            + '</div><div class="icon24set right-icon action"></div><div class="icon24set right-icon open-params"></div></div>');
        tab
            .css({ "width": "0" })
            .insertAfter(divider)
            .animate({ "width": "154px" });
            
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
            
            var postView = this.Marker.fragments[id].branch.post.render({
                parentView : fragmentView.find(".post"),
                insertMode : 'prependTo',
                tmpl : 'post',
                parent : id
            });
            
            var branchView = this.Marker.fragments[id].branch.render({
                parentView : fragmentView.find(".post"),
                insertMode : 'appendTo',
                tmpl : 'post-more',
                parent : id
            });
            
            this.Marker.fragments[id].View.attachBehavior ( );
                    
        }        
    },
    selectTab : function ()
    {
        $("nav.toolbar .tab-title").removeClass("selected")
        this.tabView.find(".tab-title").addClass("selected")
    }
}

