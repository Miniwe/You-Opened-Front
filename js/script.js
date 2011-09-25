/* Author: Messir
*/
(function($) {
  
    // * * * global functions * * *
    
    // * * * same as $(document).ready(); * * *
    $(function() { 
        $.waypoints.settings.scrollThrottle = 30;
        $('#main-header').waypoint(function(event, direction) {
            $(this).parent().toggleClass('sticky', direction === "down");
            event.stopPropagation();
	}, {
            offset: "0"
        });
        /*
        $(".icon24set.action").live( 'click', function ( ) {
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
        } );
        */
//          
    });
    
    $(window).bind('hashchange', function() {
    });    
	        
    $(window).bind('scroll', function() {
        var scrollTop = $(document.body).scrollTop();
        if (scrollTop > 0)  {
            scrollTop += 110;
        }
        scrollTop += "px";
        $("#side").css({
            "margin-top" : scrollTop
        });
    });    
	        
})(jQuery);