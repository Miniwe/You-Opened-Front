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
        $("#auth-form").submit(function() {
            var data = app.formArrayToData($(this).formToArray());
            $.cookie("tmpLogin", data.userName);
            $.cookie("tmpPass", data.password);
            app.ajaxRequest("/Auth.json", 
            
                function(data){
                    
                    if (data.SessionKey)
                    {
                        $.cookie("SessionKey", data.SessionKey, {
                            expires: 7,
                            path: '/',
                            domain: '.youopened.com'
                        });
                        app.sessionkey = data.SessionKey;
                        app.msg(data.Result.UserInfo);
                    }
                    else
                    {
                        app.msg("Error in authorization" +  "\n" + data.Result.UserInfo);
                    }
                    
                }, function(){
                    app.msg("Couldn't auth user");
                },
                data
            );        
            
            return false;
        });      
        
        $("#reg-form").submit(function() {
            var data = app.formArrayToData($(this).formToArray());
            app.ajaxRequest("/Auth.json", 
            
                function(data){
                    
                    app.msg(data.Result.UserInfo);
                    
                }, function(){
                    app.msg("Couldn't register user");
                },
                data
            );        
            
            return false;
        });      
        
        
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

