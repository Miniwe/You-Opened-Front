/* Author: Messir
*/


(function($) {
  
    // * * * global functions * * *
    // * * * same as $(document).ready(); * * *
    $(function() {
        
        Application({
            path : "http://youopened.com",
            templates : [
                "discussion",
                "key",
                "post",
                "innerkey",
                "reply"
            ]
            ,
           sessionkey : $.cookie("yo_sessionkey")?$.cookie("yo_sessionkey"):""
        }).run();
    
        // * * * jQuery function process place HERE * * *     
        
    
    $(window).bind("scroll", function() {
//        Application.alignFloat()
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

