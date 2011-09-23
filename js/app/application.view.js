
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
        
        $.tmpl("userarea-noauth", {}).appendTo("#user-area");
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
    fillUserArea : function ( userAuthorized )
    {
        $("#user-area").html("");
        
        if ( userAuthorized ) {
            this.fillAuthorizedData();
        }
        else {
            this.fillNonAuthorizedData();
        }
    },
    searchFormEvents : function ()
    {
        var Application = this.Application;
        $("#search-form").submit( function ( ) {
            
            var marker = new Marker( Application );
            marker.setName( $("#search-field").val() );
            marker.addParams( {
                'query' : $("#search-field").val()
            } );
            
            marker.setAction ( function ( newData ) {
                this.Application.msg('action of marker', 'console');
                this.addFragments( newData );
                this.makeActive();
            } );

            Application.markers.push( marker );

            marker.makeRequest();
            
            return false;
        } );
    }
}

