/* Author: Messir
*/


(function($) {
  
    var app;
    // * * * global functions * * *
    // * * * same as $(document).ready(); * * *
    $(function() {
        app = Application({
            path : "http://youopened.com",
            templates : [
                "reply",
                "branch",
                "key",
                "post"
            ]
            ,
           sessionkey : $.cookie("yo_sessionkey")?$.cookie("yo_sessionkey"):""
        })
        
        app.run();
    
        // * * * jQuery function process place HERE * * *     
    });
    
    $(window).bind("scroll", function() {
        app.updateView();
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

