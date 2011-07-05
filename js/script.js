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
        
    $("#showdirectusers").live("click", function(){
        $("#directusernames").slideToggle();
    });
    
    $(".tags a, .yoltags a").live("mouseover", function(){
        $('article').highlight( $(this).html(), "highlight_hover" );
    });

    $(".tags a, .yoltags a").live("mouseout", function(){
        $('article').removeHighlight( "highlight_hover" );
    });

    $("img.direct").live("click", function(){
        
        var reply = $("article.addcomment");
        if (reply.length < 1)
        {
            $("#shownewpost").click();
            reply = $("article.addcomment");
        }
        
        var directusersField = $("article.addcomment").find("#directusernames");
        
        if (! directusersField.is(':visible') )
        {
            $("#showdirectusers").click();
        }
        
        var directusers = directusersField.val();
        directusers = directusers?directusers:"";
        var a = $(this).parent("a");
        
        if (directusers.indexOf(a.attr("data-id")) < 0)
        {
            if (directusers)
            {
                var directusers_ar = directusers.split(",").filter(function(){ return true });
                directusers_ar.push(a.attr("title")+"("+a.attr("data-id")+")");
            }
            else
            {
                var directusers_ar = [a.attr("title")+"("+a.attr("data-id")+")"];
            }
            
            directusersField.val(directusers_ar.join(","));
            
        }
        
        return false;
    });

    $("#loader").click(function(){
        $("#container .inner").slideToggle(); 
        $("#container .inner2").toggleClass("darkLine"); 
    });

    
    $("#searchform").submit(function(){
        // Application.ajaxStop(); // @todo until not working
        
        Application.ajaxRequest("/slicesearchpostsbyuserquery.json", 
            function(data){
                $("#searchform").resetForm();
                $("#main article").remove();
                var newData = Application.parseData(data);
                for (var i=0; i< newData.discussions.length; i++)
                {
                    var Dcs = Application.discussions[newData.discussions[i]];
                    
                    Dcs.keys = {}; // удаляем существующие ключи
                    
                    for (var j=0; j< newData.posts.length; j++)
                    {
                        if (Dcs.id == Application.posts[newData.posts[j]].parentDiscussion)
                        {
                            Dcs.posts[j] = Application.posts[newData.posts[j]];
                            Dcs.keys[j] = Dcs.posts[j];
                        }
                    }
                    var View = Dcs.render("#d-Unpinned", "discussion", "prependTo", "d-Unpinned");

                    Dcs.renderKeys();
                    
                }
                for (var i=0; i< newData.posts.length; i++)
                {
                    var Post = Application.posts[newData.posts[i]];
                    if (Post.parentDiscussion ==0 )
                    {
                        Post.render("#d-Unpinned", "key", "appendTo", "d-Unpinned");
                    }
                }
                Application.pinnedToTop ( Application.siteUser );
                
            }, function(){
                Application.msg("Couldn't search");
            },
            Application.formArrayToData($(this).formToArray())
            );
        return false;
    });        
    
    $("#showregistration").click(function(){
        $("#registration_form").slideToggle();
        $("#login_form, #newpost_form").slideUp();
    }) ;  
        
    $("#showlogin").click(function(){
        $("#login_form").slideToggle();
        $("#registration_form, #newpost_form").slideUp();
    }) ;  
        
    $("#shownewpost").click(function(){
        Application.showAddNew("#newpost_form", {
            type : "",
            id   : "news",
            text : 'New disccussion will be created after'
        });
        $("#newpost_form").slideToggle();
        $("#login_form, #registration_form").slideUp();
    }) ;  
        
    $("#logout").click(function(){
        $("#login_form,#registration_form,#newpost_form").slideUp();
        
        Application.sessionkey = "";
        
        $.cookie('yo_sessionkey', null);
        
        Application.logoutSiteUser();
        
    });  
        
    $("#registration_form").submit(function(){
        
        Application.ajaxRequest("/slicesignup.json", 
            function(data){
                
                $('#registration_form').resetForm();
                $("#showregistration").click();
                
                if (data == {} || data.users == undefined || data.users.length == 0) 
                {
                    Application.msg("Couldn't register user. Get data");
                    return false;
                }
                
                alert("User registed succesfully. Please login...");
                $("#userdata").html("New user \""+data.users[0].name+"\". Need Login");
                $("#registration_form").slideUp();
                
            }, function(){
                Application.msg("Couldn't register user. Process");
            },
            Application.formArrayToData($(this).formToArray())
            );
        return false;
        
    });
    
    $("#login_form").submit(function(){
        var this_form = $(this);
        Application.ajaxRequest("/slicesignin.json?"+$(this).formSerialize(),  function(data) {
                
                $('#login_form').resetForm();
                $("#showlogin").click();
                
                if (data == {} || data.users == undefined || data.users.length != 1) 
                {
                    Application.msg("Couldn't login user. Get data");
                    return false;
                }
                
                Application.sessionkey = data.metadata.sign.session.key;
                Application.loginSiteUser(data.users[0]);
                
                $.cookie("yo_sessionkey", data.metadata.sign.session.key, {
                    expires: 7
                });
            }, function(){
                Application.msg("Couldn't login user");
            });
        return false;
    });
            
      $("article").live("click", function(){
        console.log('in 2');
         var 
           sT = $(document.body).scrollTop();

         $(".replacement").remove();
         $("article")
            .css({"top": ""})
            .removeClass("active")
            .removeClass("float");

         $(this).addClass("active");
         console.log($(this),  Application.getPrevHeights($(this).attr("data-id")), Application.getParentsList($(this).attr("data-id")));
         $(document.body).animate({ scrollTop: Application.getPrevHeights($(this).attr("data-id")).offset 
                                    - Application.getParentsList($(this).attr("data-id")).offset
                                    /*+ $("#container > header").outerHeight(true)*/}, 
            function(){
                Application.alignFloat();
            }
         );

      });

    
    });
  
    $(window).bind("scroll", function() {
        $("body").css({"background-position": "left " + ($(document.body).scrollTop() / 10)+ "px"});
        $(".discussion").css({"background-position": "left " + ($(document.body).scrollTop() / 2)+ "px"});
        Application.alignFloat()
    });      
  
    $(window).bind("load", function() { 
        Application.updateInterfaceByUser();
    });
  
    $(window).bind("mousemove", function(event) {
    });
	        
    $(window).bind("resize", function(event) {
    });
    
    $(window).bind('hashchange', function() {
        Application.router();
    });    
	        
})(jQuery);


/*
 * ПОКАЗЫВАТЬ ПРОЦЕСС ЗАГРУЗКИ БАЗОВЫХ ШАБЛОНОВ И ДАННЫХ
 * а также данных в дальнейшем 
 * 
 */