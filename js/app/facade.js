/* 
 * Parent Class
 * 
 */

function Facade ()
{
    
    this.inputs = {};
    
    this.outputs = {};

    this.getAction = function (input, actiontype)
    {
        for (i in input)
        {
            if (input[i].actiontype == actiontype || input[i].type == actiontype)
            {
                return input[i];
            }

        }
        return false;
    };
    
    this.getActionValue = function (input, actiontype, valuename)
    {
        var action = this.getAction(input, actiontype);
      
        for (i in action)
        {
            if (i == valuename)
            {
                return action[valuename];
            }
        }
      
        return false;
      
    };
    this.renderSelf = function (el, tmpl, mode, parent)
    {
        
        var View = $(document.body);
        
        
        this.parentViewId = parent;
        this.zIndex = parseInt($(el)[0].style.zIndex,10) - 10 || 10;
        
        switch (mode)
        {
            case "appendTo":
                View = $.tmpl(tmpl, this).appendTo(el);
                break;
            
            case "prependTo":
                View = $.tmpl(tmpl, this).prependTo(el);
                break;
            
            case "insertAfter":
                View = $.tmpl(tmpl, this).insertAfter(el).slideDown(400);
                break;
            
            case "insertBefore":
                View = $.tmpl(tmpl, this).insertBefore(el).slideDown(400);
                break;
            
            case "prepend":
                View = $.tmpl(tmpl, this).prepend(el).slideDown(400);
                break;
            
            default:
                /*
                if ($.tmpl(tmpl, this)[mode] != undefined)
                {
                    var func = $.tmpl(tmpl, this)[mode];
                    View = func(el).slideDown(400);
                    
                }
                */
                this.Application.msg("Incorrect render mode for " + tmpl);
        }
        return View;
    };
    this.showAddComment = function ( el, sendObj )
    {
        $("header .addcomment, #main .addcomment").slideUp(100, function(){
            $(this).remove();

        })

        var facade = this;
        
        $.tmpl("reply", sendObj).insertAfter(el).css({
            "display":"none"
        }).slideDown();

        var View = $("#replyto-" + sendObj.id);

        $.each(View.find('.avatar'), function (i, el){
            if (!facade.Application.siteUser) return false;
            $(el).attr ("title", Application.siteUser.name );
            $(el).html( $.md5(facade.Application.siteUser.id) );
            $(el).identicon5({
                size: 64 
            });
        });    

        View.find(".cancel").click(function(){
            $(this).parents(".addcomment").slideUp(200, function(){
                $(this).remove();
            }); 
        });

        $("#directusernames").autocomplete(facade.Application.globalPath + 
            facade.Application.frameworkPath + '/suggest.json', {
                width: $("#directusernames").width(),
                dataType : "jsonp",
                multiple: true,
                matchContains: true,
                selectFirst: true,
                minChars: 1,
                autoFill: true,
                extraParams:  {
                    facadetype : "user"
                },
                parse : function ( data )
                {
                    var parsed = [];
                    for ( i in data) {
                        parsed[parsed.length] = {
                            data: data[i],
                            id: i,
                            value: data[i]+"("+i+")",
                            result: data[i]+"("+i+")"
                        };
                    }
                    return parsed;
                    
                },
                formatItem: function ( row ) {
                    return row;
                }
        });
        
        View.find("form").submit(function(){

            View.slideUp(200, function(){
                $(this).remove();
            }); 
            
            var data = facade.Application.formArrayToData($(this).formToArray());
            data.directuserids = getIds(data.directusernames);
            data.type = "post";
            
            facade.Application.ajaxRequest("/slicepostmessage.json", 
                function(data){

                    // тут вставить обработку ошибок
                    var newData = facade.Application.parseData(data);
                    
                    for (var i=0, l = newData.posts.length; i < l; i++)
                    {
                        if (facade instanceof Post
                                && facade.Application.posts[newData.posts[i]].parentPost == facade.id)
                        {
                            facade.posts[newData.posts[i]]
                                = facade.Application.posts[newData.posts[i]];
                        }
                        if (facade instanceof Discussion 
                                && facade.Application.posts[newData.posts[i]].parentDiscussion == facade.id)
                        {
                            facade.posts[newData.posts[i]]
                                = facade.Application.posts[newData.posts[i]];
                        
                            facade.keys[newData.posts[i]] = facade.posts[newData.posts[i]];
                        }
                    }
                    
                    facade.openFacade();

                }, function(){
                    facade.Application.msg("Couldn't post comment !");
                },
                data
                );        
            return false;
        });

    };
    this.parseTags = function ( data )
    {
        this.tags = {};
      
        if (!this.tagcloudid) return false;
      
        var tagClouds = data.tagclouds.filterByValue(getById, this.tagcloudid);
      
        for (tc_i in tagClouds)
        {
            for (t_i in tagClouds[tc_i].tagids)
            {
                var tag = data.tags.filterByValue(getById, tagClouds[tc_i].tagids[t_i]);
              
                if (!tag.length) continue;
              
                var id = tag[0].id.toString();

                if (this.Application.tags[id] == undefined)
                {
                    this.Application.tags[id] = new Tag(this.Application, tag[0]);
                }
                else
                {
                    this.Application.tags[id].update(tag[0]);
                }
              
                this.tags[id] = this.Application.tags[id];
              
                this.tags[id].parseWords( data );
            }
        }
    };
  
    this.scrollToView = function( View ) {
        
        try 
        {
            $(document.body).animate({
                scrollTop: View.offset().top - $("#container > header").outerHeight()
            }, 400, function(){
                // after scroll
            });   
            
        }
        catch (e)
        {
            // @todo Exeption Cannot define View (!)
            console.log(e);
        }
        
    };
    
    this.removeDiscussionChilds = function ( id )
    {
        var facade = this;
        $.each($("#main article[data-parent-discussion='" + id + "']"), function(i, el)
        {
            facade.removePostChilds( $(el).attr("data-id") );
            
            $(el).remove();
            
        });
    };
    
    this.removePostChilds = function ( id )
    {
        var facade = this;
        $.each($("#main article[data-parent-post='" + id + "']"), function(i,el)
        {
            facade.removePostChilds($(el).attr("data-id"));
            
            $(el).remove();
        });
    };
    
    this.updateDiscussionChilds = function ( id )
    {
        var facade = this;
    };
    
    this.updatePostChilds = function ( id )
    {
        var facade = this;
    };
  
    this.getSocialConnections = function (type, actiontype)
    {
        var facade = this;
        facade.Application.ajaxRequest("/slicegetfacadeoutputsbyactiontypeandindexrange.json", 
            function(data){
                
                var newData = facade.Application.parseData(data);
                
                switch (actiontype)
                {
                    case "Message":
                        facade.parseConnectionMessage(newData.users);
                        break;
                    default:
                        
                }
                
            }, function(){
                Application.msg("Couldn't get social connections");
            },
            {
                facadeid   : facade.id,
                actiontype : actiontype,
                index      : 0,
                count      : 10
            
            }
            );
        
    };
    
}
