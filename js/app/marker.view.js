
var MarkerView = function ( Marker )
{
    this.Marker = Marker;
        
    this.tabView = null; 
    this.iconView = null; 
        
    return this;
}

MarkerView.prototype = {
    removeTab : function ()
    {
//        if ( $(this).hasClass('newposts') ) {
//            return false;
//        }
        var parentContainer = this.tabView;
        var divider = $(parentContainer).prev(".divider");
        $(divider).remove();
        $(parentContainer)
            .animate({"width": "0"}, function ( ){
                $(this).remove();
                
            });
        this.tabView = null;
    },
    iconExist : function ()
    {
        return this.iconView;
    },
    updateIcon : function ( iconType )
    {
        if ( this.iconExist( ) ) {
            this.iconView.find(".count").html(this.Marker.postsCount);
            if (this.Marker.postsCount > 0) {
                this.iconView.removeClass("hidden");
            } else {
                this.iconView.addClass("hidden");
            }
        }
        else {
            this.addIcon( iconType );
        }
    },
    addIcon : function ( iconType )
    {
        if (this.Marker.postsCount < 1) {
            return false;
        }
        var Marker = this.Marker;
        
        this.iconView = $('<div class="icon-container inline" title="' +
            this.Marker.name + '"><div class="icon24set right-icon ntfn-'+
            iconType +'"></div></div>')
            .css({"opacity": "0"})
            .appendTo("#notifications")
            .animate({"opacity": "1"});
        $('<span class="count"></span>').appendTo(this.iconView.find(".icon24set"));
        this.iconView.find(".count").html( this.Marker.postsCount );
        
        this.iconView.click(function(){
            
            Marker.setAction ( function ( newData ) {
                
                this.addPosts( newData );
                this.View.updateTab();
                this.Application.View.clearMain();
                this.View.drawPosts();
                this.View.drawRightSide( Marker.rightSideData );
                
            } );
            
            Marker.saveState();
            Marker.makeRequest();

        });
            
    },
    tabExist : function ()
    {
        return (this.tabView != null) ? this.tabView : false;
    },
    updateTab : function ()
    {
        if ( this.tabExist() ) {

            // update process
            this.tabView.find('.tab-title').html(this.Marker.name);
        }
        else {

            this.addTab();
        }
    },
    addTab : function ()
    {
        var Marker = this.Marker,
            tabWidth = 0;

        var tab = $.tmpl( 'top-tab', {
            name: this.Marker.name
        })
//            .css({"opacity": "0"})
            .insertAfter("#search-tab");
//            .animate({"opacity": "1"});
        
        // tab events    
        tab.find(".icon24set.action").click(function(){
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
        });
        
        tab.find(".tab-title").click(function(){
            Marker.Application.View.clearMain();
            Marker.View.drawFragments();
            
            Marker.View.drawRightSide( Marker.rightSideData );
            
            Marker.View.selectTab();
            
        });
        
        tab.find(".open-params").click( function() {
            
            // close other tags
            $(".open-params.opened").not(this).click();
            
            
            var opts_left = $("#main").offset().left + 24;
            var opts_width = $("#main").outerWidth(true) - $("#side").outerWidth(true) - 48;
            
            $(this).toggleClass("opened");
            tab.find(".opts-cont")
                .css({
                    "left" : opts_left + "px",
                    "width" : opts_width + "px"
                })
                .toggleClass("opened");
                
            Marker.View.addOptsParams( tab );
        });
        
        this.tabView = tab;

    },
    prepareParams : function ( ids, type )
    {
        var paramStr = '',
            paramArray = ids.split(","),
            Application = this.Marker.Application,
            i = 0;
            
        switch ( type ) 
        {
            case 'tag':
                for (i=paramArray.length; i--;)
                {
                    if (Application.tags[paramArray[i]] != undefined)
                    {
                        paramStr += Application.tags[paramArray[i]].asText;
                        paramStr += '('+paramArray[i]+'),';
                    }
                }
                break;
            case 'user':
                for (i=paramArray.length; i--;)
                {
                    if (Application.users[paramArray[i]] != undefined)
                    {
                        paramStr += Application.users[paramArray[i]].name;
                        paramStr += '('+paramArray[i]+'),';
                    }
                }
                break;
        }
        
        return paramStr;
    },
    addOptsParams : function ( tab )
    {
        var View = this;
        tab.find(".opts-cont").html("");
        var optsParamsCont = $.tmpl( 'opts-params', {
            tabName: this.Marker.name,
            searchField : this.Marker.getParam('query'),
            tags : this.prepareParams( this.Marker.getParam('tagIds'), 'tag'),
            users : this.prepareParams( this.Marker.getParam('authorIds'), 'user')
        })
            .css({"opacity": "0"})
            .appendTo(tab.find(".opts-cont"))
            .animate({"opacity": "1"});
            
        optsParamsCont.find(".closeopts").click(function(){
            tab.find(".open-params").click();
        });
        
        optsParamsCont.find("#opts-form").submit(function ( ) {
            return View.addOptFormBehaviour( this );
        });
        
        this.addAutocomplete( optsParamsCont.find("#opts-tags"), "tag" );
        
        this.addAutocomplete( optsParamsCont.find("#opts-users"), "user" );

    },
    addOptFormBehaviour : function (  form )
    {
        var marker = this.Marker;
        var data = marker.Application.formArrayToData($(form).formToArray());
        
        marker.setName( data.tabName );
        marker.addParams({ 
            'query' : data.optsSearchField,
            'tagIds' : getIds(data.optsTags),
            'authorIds' : getIds(data.optsUsers)
        });
        
        marker.setAction ( function ( newData ) {
            this.Application.msg('action of marker UPDATE', 'console');
            
            this.clearMarkerData();
            this.addFragments( newData );
            this.View.updateTab();
            this.Application.View.clearMain();
            this.View.drawFragments();
            this.View.drawRightSide( this.rightSideData );
            this.View.selectTab();

        } );
        marker.saveState();
        
        marker.makeRequest();
        
        return false;        
    },
    drawRightSide : function ( sideData )
    {
        var Marker = this.Marker;
        
        $("#side .mode").addClass("hidden");
        
        /*
         * set viewMode to marker
         * change mode icon
         * on change ViewMode reload main marker view - main params not change
         */
        
        $("#side .filter").addClass("hidden");
        $("#side .move").addClass("hidden");
        
        $("#fragment-arrow").addClass("hidden");
        
        if (sideData == undefined) {
            sideData = this.Marker.rightSideData;
        }
        
        $("#side").find(".content").html("");
        
        this.drawHistory();
        this.drawNavigram( sideData.navigram );
        this.drawTagCloud( sideData.tagCloud );
        this.drawAuthorCloud( sideData.userCloud );
        
        $("#side")
            .css({
                "opacity":"0",
                "display": 'block'
            })
            .animate({
                "opacity":"1"
            }, 'slow');
        
        
    },
    drawHistory : function ( ) {
        var Marker = this.Marker;
        $('<div class="icon24set icon-left go-back" style="margin-top:12px; float:left;"></div><div class="icon24set icon-right go-next" style="margin-top:12px; float: right;"></div>').appendTo($("#side .content"));
         console.log('add event');
        $("#side").find(".go-back").click( function( ) {
            Marker.history.process( Marker.history.prev( ) );
            return false;
        });
        
        $("#side").find(".go-next").click( function( ) {
            Marker.history.process( Marker.history.next( ) );
            return false;
        });
         
    },
    drawNavigram : function ( navigramBranch ) {
        if ( !navigramBranch ) {return false;}
        $('<div class="navdiag"></div>').appendTo($("#side .content"));
        navigramBranch.drawNavGraph( $("#side .content").find(".navdiag") );
    },
    drawTagCloud : function( tagCloud ) {
        if ( tagCloud == {} ) {return false;}
        var tagsArea = $("<div class='tags_list'></div>").appendTo($("#side .content"));
        var generatedTags = this.generateTagList( tagCloud );
        $(generatedTags).appendTo( tagsArea );
    },
    drawAuthorCloud : function ( userCloud ) {
        if ( userCloud == {} ) {return false;}
        var authorsArea = $("<div class='authors_list'></div>").appendTo($("#side .content"));
        var generatedUsers = this.generateUsersList( userCloud );
        $(generatedUsers).appendTo( authorsArea );
        this.renderAvatars(authorsArea, 48);
    },
    drawPosts : function ()
    {
        for ( var id in this.Marker.posts ) {
            
            var postView = this.Marker.posts[id].View.render({
                parentView : $("#main"),
                insertMode : 'prependTo',
                tmpl : 'post',
                parent : "#main"
            });
        }
    },
    drawFragments : function ()
    {
        for ( var id in this.Marker.fragments ) {
            
            var fragmentView = this.Marker.fragments[id].render( {
                parentView : $("#main"),
                insertMode : 'prependTo',
                tmpl : 'fragment'
            });
            
            var branchView = this.Marker.fragments[id].branch.View.render( {
                parentView : fragmentView.find(".post"),
                insertMode : 'appendTo',
                tmpl : 'post-more',
                parent : id
            });
            
            var postView = this.Marker.fragments[id].branch.post.View.render({
                parentView : fragmentView.find(".post"),
                insertMode : 'prependTo',
                tmpl : 'post',
                parent : id
            });
            
            this.addRootPostBahaviour( postView );
            
            this.Marker.fragments[id].View.attachBehavior ();
        }        
    },
    addRootPostBahaviour : function ( postView )
    {
        postView.addClass('rootPost');
        
//        var gotoBranchView = $('<div class="icon24set left-icon gobranch" title="goto branch (${postCount})"></div>').appendTo(postView.find('.state'));
    },
    selectTab : function ()
    {
        $("nav.toolbar .tab-title").removeClass("selected");
        this.tabView.find(".tab-title").addClass("selected");
    },
    generateTagList : function ( tagCloud )
    {
        var content = document.createDocumentFragment(),
            tags = tagCloud,
            tmpView = [];
        
        for (var tagId in tags) {
            tmpView = $("<a href='#tag-" + tagId + "' title='" + tags[tagId].entryRating+ "'> " 
                + tags[tagId].tag.asText 
                + " </a>");
            content.appendChild( tmpView[0] );
        }
        
        return content;
        
    },
    generateUsersList : function ( userCloud )
    {
        var content = document.createDocumentFragment(),
            authors = userCloud,
            tmpView = [],
            avaContent = '';
        
        for (var id in authors) {
            
//            tmpView = $(" <a href='#authors-" + authorId + "'> " + authors[id].author.name 
//                + " </a>");
            avaContent = '<a href="#avatar-author-'+ id + '" \n\
                data-id="' + id + '" \n\
                title="' + authors[id].postCount + '" \n\
                class="avatarHref" title="'+ authors[id].author.name + '"></a>';
            
            if ((authors[id].avataruri != null))
            {
                avaContent = '<img src="'+ authors[id].author.avataruri + '" \n\
                    alt="'+ authors[id].author.name+ '" title="'+ authors[id].author.name+ '" \n\
                    data-id="' + id + '" \n\
                    class="round-border" />';
            }
            tmpView = $('<div class="avatar">'+ avaContent + '</div>');
            
            content.appendChild( tmpView[0] );
        }
        
        return content;
    },
    renderAvatars : function ( parentView, size )
    {
        var size = size || 72,
            users = this.Marker.Application.users;
        $.each( parentView.find( '.avatarHref' ), function ( i, el ) {
            var id = $(el).attr("data-id");
            var author = users[id];
            $( el ).html( $.md5( author.name ) );
            $( el ).identicon5( {
                size: size
            });
        });    
        
    },
    addAutocomplete : function ( field, facadeType )
    {
        var Application = this.Marker.Application;
        field.autocomplete( Application.globalPath + 
            Application.frameworkPath + '/Suggest.json', {
                width: field.width(),
                dataType : "jsonp",
                multiple: true,
                matchContains: true,
                selectFirst: true,
                minChars: 1,
                autoFill: true,
                extraParams:  {
                    facadeType : facadeType
                },
                parse : function ( data ) {
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
    }
};