
var ApplicationView = function ( Application )
{
    this.Application = Application;
};


ApplicationView.prototype = {
    clearMain : function ()
    {
        $("#main").find("*").remove();
    },
    attachBehavior : function ()
    {
        this.searchFormEvents();
        this.scrollBehaviour();
        
    },
    scrollBehaviour : function ( )
    {
        var Application = this.Application;
        $(window).bind('scroll', function() {
            var scrollTop = document.body.scrollTop,
            side_left = $("#main").outerWidth(true) 
                + $("#main").offset().left - $("#side").outerWidth(true);
            if (scrollTop > 0) {
                $("#side")
                    .css({
                        "left" : side_left + "px",
                        "top" : (85) + "px"
                    })
                    .addClass('float');
            }
            else {
                $("#side").removeClass('float');
            }
            
            
            return true;
            
            var activeFragmentView = $(".fragment.active"),
                activeFragmentView_top = 0,
                activePostView = 0,
                activePostView_top = 0;
                
            if (activeFragmentView.length < 1) {
                $(".post-content.float").removeClass("float");
                return false;
            }
            
            activeFragmentView_top = $(activeFragmentView).offset().top,
            activePostView = $(".fragment.active").find('.post-content').first(),
            activePostView_top = $(activePostView).offset().top,
            
            activePostView.css({
                "width" : $(activeFragmentView).outerWidth(true)
            })
            
            if ( activeFragmentView_top - scrollTop < 85 ) {

                activePostView.addClass("float");
            }
            else {
                activePostView.removeClass("float");
            }
            
        });    
        
    },
    renderAvatar : function ( View, user, size )
    {
        var size = size || 72;
        $.each( View.find( '.avatarHref' ), function ( i, el ) {
            $( el ).html( $.md5( user.name ) );
            $( el ).identicon5( {
                size: size 
            });
        });    
        
    },
    fillAuthorizedData : function ( )
    {
       var user = this.Application.siteUser,
           View = this;
       
       $.tmpl("userarea-auth", user).appendTo("#user-area");
       
        $("#logout").click(function ( ) {
            // remove cookie
            View.Application.logoutUser ();
            
            View.fillUserArea( false );
            // show non
        });
       
       
       if ( !user )
       {
           return false;
       }
       if ( user.avataruri == null )
       {
           $("#user-area .avatar").html('<a href="#avatar-author-' + user.id 
               + '" class="avatarHref" title="' + user.name + '" style="margin-top: -72px;"></a>' );
           this.renderAvatar( $("#user-area"), user );
       }
       
        
    },
    fillNonAuthorizedData : function ( )
    {
        var Application = this.Application;
        
        $.tmpl("userarea-noauth", {
            userName : $.cookie("userName"),
            password : $.cookie("password"),
            checked : ( ($.cookie("userName") + $.cookie("password") ).length > 0) ? 'checked="checked"' : ""
        }).appendTo("#user-area");
        $("#user-area .auth_new_user").click(function ( ) {
            $("#user-area .auth_new_user, #user-area .auth_existing_user").toggleClass("hidden");
            $("#user-area .non-registred-area, #user-area .registred-area").toggleClass("hidden");
           
            $("#procedure").val("SignUp");
           
            return false;
        });
        $("#user-area .auth_existing_user").click(function ( ) {
            $("#user-area .auth_new_user, #user-area .auth_existing_user").toggleClass("hidden");
            $("#user-area .non-registred-area, #user-area .registred-area").toggleClass("hidden");
           
            $("#procedure").val("SignIn");
           
            return false;
        });
        
        $("#check_password").change(function () {
            if ( $(this).is(':checked') ) {
                $("#password")[0].type = "text";
            } else {
                $("#password")[0].type = "password";
            }
            
        });
        
        $("#auth-form").submit(function(){
            
            var data = Application.formArrayToData($(this).formToArray());
            
            Application.rememberUser(data);
            
            $(this).resetForm();
            Application.ajaxRequest($("#auth-form").attr("action"), 
                function( data ){
                    
                    Application.processAuthResponse( data );

                }, function(){
                    message("Couldn't auth process. Server error");
                },
                data
            );                
            return false;
        });
        
        $("#closeauth").click(function(){
            $("#userarea-noauth").addClass('hidden');
            $("#show-userarea-noauth").removeClass('hidden');
        });
        
        $("#show-userarea-noauth").click(function(){
            $("#userarea-noauth").removeClass('hidden');
            $("#show-userarea-noauth").addClass('hidden');
        });
       
    },
    fillTwitterAuth : function ( )
    {

        $.tmpl("twitter-auth", {
        }).appendTo("#user-area");
        $("#twitter-auth").click(function ( ) {
            window.location.href='http://youopened.com/auth/twitter/';
            return false;
        });    
    },
    fillUserArea : function ( userAuthorized )
    {
        $("#user-area").html("");
        /*
        if ( userAuthorized ) {
            this.fillAuthorizedData();
        }
        else {
            this.fillNonAuthorizedData();
        }
        */
        this.fillTwitterAuth();
    },
    searchFormEvents : function ( )
    {
        var Application = this.Application;
        
        $("#search-form").submit( function ( ) {
            
            Application.View.newTab( $("#search-field").val(), {
                'query' : $("#search-field").val()
            });
            
            return false;
        } );
    },
    newTab : function (name, params)
    {
        var marker = new Marker( this.Application );
        marker.setPath( '/Slice.json' );
        marker.setName( name );
        marker.addParams( params );

        marker.setAction ( function ( newData ) {
            this.addFragments( newData );
            this.View.updateTab();
            this.Application.View.clearMain();
            this.View.drawFragments();
            this.View.drawRightSide( this.rightSideData );
            this.View.selectTab();
        } );

        
        
        this.Application.markers.push( marker );

        marker.makeRequest();
        
    }
}

