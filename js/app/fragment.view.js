/*
 */

var FragmentView = function ( Fragment )
{
    this.Fragment = Fragment;
    
    this.View = $(document.body);
        
    return this;
}

FragmentView.prototype = {
    attachBehavior : function ( )
    {
        this.Fragment.branch.View.attachBehavior ( this );
        this.Fragment.branch.post.View.attachBehavior ( this );
    },
    hideFragmentElements : function ( )
    {
        this.View.find('.post-more').hide();
    },
    showFragmentElements : function ( )
    {
        this.View.find('.post-more').show();
    },
    closeContent : function ( )
    {
        this.Fragment.branch.post.View.closeContent( );
        
        this.showFragmentElements();
        this.closeRightSide();
    },
    closeOtherFragments : function ( )
    {
        this.Fragment.Application.closeAllFragments();
    },
    openContent : function ( )
    {
        this.closeOtherFragments();
        
        this.Fragment.branch.post.View.openContent( this.Fragment.branch.post.View );
        
//        this.View.find(".state").addClass('expanded');
//        this.Fragment.openMainBranch();
        
        this.hideFragmentElements();
        this.openRightSide();
    },
    drawContent : function ( parentView, content )
    {
        $( content )
//            .css({"opacity":"0"})
            .insertAfter( parentView );
//            .animate({"opacity":"1"}, 400, function (){} );
    },
    closeRightSide : function ( )
    {
        var Fragment = this.Fragment;
        
        this.View.find(".side").css({
            "opacity" : "0",
            "display": 'none'
        });
        Fragment.removeNavGraph();
        Fragment.View.View.find(".side .content *").remove();
        
//        this.View.find(".side")
//            .animate({
//                "opacity":"0"
//            }, 'slow', function () {
//                
//                $(this).css({
//                    "opacity":"0",
//                    "display": 'none'
//                });
//                Fragment.removeNavGraph();
//                Fragment.View.View.find(".side .content *").remove();
//            });
    },
    openRightSide : function ( )
    {
        this.drawNavigram();
        this.drawTagCloud();
        this.drawAuthorCloud();
        this.View.find(".side")
            .css({
                "opacity":"0",
                "display": 'block'
            })
            .animate({
                "opacity":"1"
            }, 'slow');
    },
    drawNavigram : function ( ) {
        $('<div class="navdiag"></div>').appendTo(this.View.find(".side .content"));
        this.Fragment.branch.drawNavGraph( this.View.find(".navdiag") );
    },
    drawTagCloud : function( ) {
        $('<div class="hr"></div>').appendTo(this.View.find(".side .content"));
        var tagsArea = $("<div class='tags_list'></div>").appendTo(this.View.find(".side .content"));
        var generatedTags = this.generateTagList();
        $(generatedTags).appendTo( tagsArea );
    },
    drawAuthorCloud : function ( ) {
        $('<div class="hr"></div>').appendTo(this.View.find(".side .content"));
        var authorsArea = $("<div class='authors_list'></div>").appendTo(this.View.find(".side .content"));
        var generatedUsers = this.generateUsersList();
        $(generatedUsers).appendTo( authorsArea );
        this.renderAvatars(authorsArea, 48);
    },
    render : function ( params )
    {
        switch ( params.insertMode )
        {
            case "appendTo":
                this.View = $.tmpl( params.tmpl, this ).appendTo( params.parentView );
                break;
            
            case "prependTo":
                this.View = $.tmpl(params.tmpl, this).prependTo( params.parentView );
                break;
            
            case "insertAfter":
                this.View = $.tmpl(params.tmpl, this).insertAfter( params.parentView );
                break;
            
            case "insertBefore":
                this.View = $.tmpl(params.tmpl, this).insertBefore( params.parentView );
                break;
            
            case "prepend":
                this.View = $.tmpl(params.tmpl, this).prepend( params.parentView );
                break;
            
            default:
                this.Fragment.Application.msg("Incorrect render mode for " + params.tmpl);
        }
        
        return this.View;
    },
    generateTagList : function ( )
    {
        var content = document.createDocumentFragment(),
            tags = this.Fragment.branch.tags,
            tmpView = [];
        
        for (var tagId in tags) {
            tmpView = $("<a href='#tag-" + tagId + "' title='" +  + tags[tagId].entryRating+ "'> " 
                + tags[tagId].tag.asText 
                + " </a>");
            content.appendChild( tmpView[0] );
            
        }
        
        return content;
        
    },
    generateUsersList : function ( )
    {
        var content = document.createDocumentFragment(),
            authors = this.Fragment.branch.authors,
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
            users = this.Fragment.Application.users;
        $.each( parentView.find( '.avatarHref' ), function ( i, el ) {
            var id = $(el).attr("data-id");
            var author = users[id];
            $( el ).html( $.md5( author.name ) );
            $( el ).identicon5( {
                size: size
            });
        });    
        
    },

}

