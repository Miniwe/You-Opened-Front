function Fragment ( Application )
{
    this.Application = Application;
    
    var myDate = new Date();
    this.id = 'fragment-' + myDate.getMilliseconds();
    
    this.branch = null;
    this.focusedBranch = null;
    
    this.branchHistory = new History( );
    
    this.View = $(document.body);
    
    this.navGraph = null;
    
    this.cbIndex = 0;
}

Fragment.prototype = {
    /*
     * add branch 
     */
    addMainBranch : function ( branch )
    {
//        
//        this.removeFocusedBranch( branch );
//        this.branch = branch;   
//        this.redrawFragment( this.branch, true );
//       

        var item = branch;
        var Facade = this;

        item.action = function () {
            /*
             * действия для главной ветки
             */
            Facade.removeFocusedBranch( );
            Facade.branch = branch;
            Facade.redrawFragment( Facade.branch, true );
        };

        Facade.branchHistory.addItem( item );
        Facade.branchHistory.process( true );
    },
    addFocusedBranch : function ( branch )
    {
        
        var item = branch;
        var Facade = this;

        item.action = function () {
            /*
             * действия для чилдовой ветки
             */
            Facade.removeFocusedBranch( );
            
            Facade.focusedBranch = branch;   
            
            Facade.branch = Facade.Application.branches[Facade.focusedBranch.parentBranchId];   
            
            if (Facade.branch == undefined)
            {
                Facade.branch = Facade.focusedBranch;
            }
            Facade.redrawFragment( Facade.focusedBranch, true);
            
            Facade.navGraph.activeBranch = Facade.focusedBranch;
            Facade.focusedBranch .View.find("header").click();
            
        };

        Facade.branchHistory.addItem( item );
        Facade.branchHistory.process( true );

    },
    removeFocusedBranch : function ( )
    {
        // @todo add history
        this.focusedBranch = null;   
        if ( this.navGraph )
        {
            this.navGraph.activeBranch = this.focusedBranch;
        }
    },
    
    attachBehavior : function ( )
    {
        var Facade = this;
        
        this.View.find(".go-back").click( function( ) {
            Facade.branchHistory.process( Facade.branchHistory.prev( ) );
            console.log('back - ', Facade.branchHistory.getCurentIndex() );
            return false;
        });
        
        this.View.find(".go-forward").click( function( ) {
            Facade.branchHistory.process( Facade.branchHistory.next( ) );
            console.log('forward - ', Facade.branchHistory.getCurentIndex() );
            return false;
        });
        
    },
    /*
     * @param params Object {
     *  parentView : JQuery object
     *  insertMode : String
     *  tmpl : String template name
     * }
     * 
     * @return FragmentView
     * 
     */
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
                this.Application.msg("Incorrect render mode for " + params.tmpl);
        }
        
        
        this.attachBehavior ( );
        
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
            parentId : this.id
        });
        
        newView.css( {"outline-color": branch.color} )
        
        if ( redrawGraph ) {
            this.branch.drawNavGraph( this.View.find(".navdiag") );
            this.navGraph = this.branch.navGraph;

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
            $("<a href='#tag-" + tagId + "'><span class='tag'><tag>" + branch.tags[tagId].tag.asText + "</tag> - " + branch.tags[tagId].entryRating + "</span></a> ").appendTo( tagArea );
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
            $("<a href='#authors-" + authorId + "'>" + branch.authors[authorId].author.name + " - " + branch.authors[authorId].entryRating + "</a> ").appendTo( authorsArea );
        }
        this.View.find(".authors").show();
    },
    remove : function ()
    {
        this.branch = null;
        this.focusedBranch = null;
        this.navGraph = null;
    }
    
}