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
                "fragment",
                "key",
                "post"
            ]
            ,
           sessionkey : $.cookie("yo_sessionkey")?$.cookie("yo_sessionkey"):""
        })
        
        app.run();
    
        // * * * jQuery function process place HERE * * *     
        $("#params-form").submit(function() {
            app.resetApplication();
            app.loadIndexPage(); 
            return false;
        });      
        
        $(".taglist span.tag").live('click', function() {
            $("#query").val($(this).find('tag').html());
            $("#params-form").submit();
            return false;
        });      
        
    });
    
    $(window).bind("scroll", function() {
        app.updateView( $(document.body).scrollTop() );
        
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

