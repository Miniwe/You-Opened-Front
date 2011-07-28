/* Author: Messir
*/


(function($) {
  
    // * * * global functions * * *
    // * * * same as $(document).ready(); * * *
    $(function() {
        
        Application({
            path : "http://youopened.com",
            templates : [
                "branch",
                "key",
                "post"
            ]
            ,
           sessionkey : $.cookie("yo_sessionkey")?$.cookie("yo_sessionkey"):""
        }).run();
    
        // * * * jQuery function process place HERE * * *     
    });
    
    $(window).bind("scroll", function() {
    });      
  
    $(window).bind("load", function() { 
//        Application.updateInterfaceByUser();
    });
  
    $(window).bind("mousemove", function(event) {
    });
	        
    $(window).bind("resize", function(event) {
    });
    
    $(window).bind('hashchange', function() {
//        Application.router();
    });    
	        
})(jQuery);

