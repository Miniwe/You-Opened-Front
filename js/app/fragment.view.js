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
        var FragmentView = this;
        
        this.View.find(".post").find('.text')
            .css({'cursor': 'pointer'})
            .click( function ( ) {
                FragmentView.openRightSide();
            } );
        /*
        var Facade = this.Facade;
        
        this.View.find(".go-back").click( function( ) {
            Facade.branchHistory.process( Facade.branchHistory.prev( ) );
            return false;
        });
        
        this.View.find(".go-forward").click( function( ) {
            Facade.branchHistory.process( Facade.branchHistory.next( ) );
            return false;
        });
        
        this.View.find(".reply-modes .icon16set").live( 'mouseover', function ( ) {
            var parentCont = $(this).parents(".reply-form");
            parentCont.find(".reply-content")
                .html( $(this).attr("title") );
        } );
        */
    },
    openRightSide : function ( )
    {
        this.drawNavigram();
        this.drawTagCloud();
        this.drawAuthorCloud();
        this.View.find(".side").show();
    },
    drawNavigram : function ( ) {
        this.Fragment.branch.drawNavGraph( this.View.find(".navdiag") );
    },
    drawTagCloud : function( ) {
        
    },
    drawAuthorCloud : function ( ) {
        
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
                this.Facade.Application.msg("Incorrect render mode for " + params.tmpl);
        }
        
        return this.View;
    },
    redrawFragment : function ( branch, redrawGraph )
    {
        /*
         * remove all framgments inside
         * 1 remove main branch
         * 2
         * 3 ...
         * draw indide Elements for given branch
         */
        this.View.find("article").remove();
        this.View.find(".replacement").remove();
        
        var newView = branch.render ({
            parentView     : this.View, 
            insertMode   : 'appendTo',
            tmpl   : 'branch', 
            parentId : this.Fragment.id
        });
        
        newView.css( {"outline-color": branch.color} );
        
        if ( redrawGraph ) {
            this.branch.drawNavGraph( this.View.find(".navdiag") );
            this.Fragment.navGraph = this.Fragment.branch.navGraph;
            this.View.find(".navdiag").show();
        }
        /*
         * если во фрагменте есть открытая ветка то показывать элементы - иначе скрывать
         */

    },
    showSide : function ( branch )
    {
        this.redrawTags ( branch );
        this.redrawAuthors ( branch );
    },
    hideSide : function ( )
    {
        this.View.find(".tags").hide();
        this.View.find(".authors").hide();
    },
    redrawTags : function ( branch )
    {
        var tagArea = this.View.find(".tags .inner");
        
        tagArea.find("*").remove();
        
        var counter = 0;
        
        for (var tagId in branch.tags) {
            if ( counter++ > 15 ) break;
            $("<a href='#tag-" + tagId + "'><span class='tag'><tag>" 
                + branch.tags[tagId].tag.asText + "</tag> - " + branch.tags[tagId].entryRating 
                + "</span></a> ").appendTo( tagArea );
        }
        this.View.find(".tags").show();
        
    },
    redrawAuthors : function ( branch )
    {
        var authorsArea = this.View.find(".authors .inner");
        authorsArea.find("*").remove();
        
        var counter = 0;
        for (var authorId in branch.authors) {
            if ( counter++ > 15 ) break;
            $("<a href='#authors-" + authorId + "'>" + branch.authors[authorId].author.name 
                + " - " + branch.authors[authorId].entryRating + "</a> ").appendTo( authorsArea );
        }
        this.View.find(".authors").show();
    }
}

