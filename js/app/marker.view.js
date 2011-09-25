
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
            .css({ "opacity": "0" })
            .appendTo("#notifications")
            .animate({ "opacity": "1"});
        $('<span class="count"></span>').appendTo(this.iconView.find(".icon24set"));
        this.iconView.find(".count").html( this.Marker.postsCount );
        
        this.iconView.click(function(){
            
            Marker.setAction ( function ( newData ) {
                
                this.addPosts( newData );
                this.View.updateTab();
                this.Application.View.clearMain();
                this.View.drawPosts();
                this.View.drawRightSide( Marker.rigthSideData );
                
            } );

            Marker.makeRequest();

        });
            
    },
    tabExist : function ()
    {
        return this.tabView;
    },
    updateTab : function ()
    {
        if ( this.tabExist() ) {
            // update process
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
            .css({ "opacity": "0" })
            .insertAfter("#search-tab")
            .animate({ "opacity": "1"});
        
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
        
        tab.click(function(){
            Marker.Application.View.clearMain();
            Marker.View.drawFragments();
            
            Marker.View.drawRightSide( Marker.rigthSideData );
            
            Marker.View.selectTab();
            
        });
        
        this.tabView = tab;

    },
    drawRightSide : function ( sideData )
    {
        $("#side").find(".content").html("");
        
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
    drawNavigram : function ( navigram ) {
        if ( !navigram ) { return false; }
        $('<div class="navdiag"></div>').appendTo($("#side .content"));
//        this.Fragment.branch.drawNavGraph( this.View.find(".navdiag") );
    },
    drawTagCloud : function( tagCloud ) {
        if ( tagCloud == {} ) { return false; }
        var tagsArea = $("<div class='tags_list'></div>").appendTo($("#side .content"));
        var generatedTags = this.generateTagList( tagCloud );
        $(generatedTags).appendTo( tagsArea );
    },
    drawAuthorCloud : function ( userCloud ) {
        if ( userCloud == {} ) { return false; }
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
            
            var fragmentView = this.Marker.fragments[id].render({
                parentView : $("#main"),
                insertMode : 'prependTo',
                tmpl : 'fragment'
            });
            
            var branchView = this.Marker.fragments[id].branch.View.render({
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
            
            this.Marker.fragments[id].View.attachBehavior ();
        }        
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
            tmpView = $("<a href='#tag-" + tagId + "' title='" +  + tags[tagId].entryRating+ "'> " 
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
        
    }

};