
function Fragment ( Application )
{
    this.Application = Application;
    
    var myDate = new Date();
    this.id = 'fragment-' + myDate.getMilliseconds();
    
    this.branch = null;
    this.focusedBranch = null;
    
    this.branchHistory = [];
    
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
        // @todo add history
        
        this.removeFocusedBranch( branch );
        
        this.branch = branch;   
        
        this.redrawFragment( this.branch, true );
        
    },
    addFocusedBranch : function ( branch )
    {
        // @todo add history
        this.focusedBranch = branch;   

        this.redrawFragment( this.focusedBranch, false );
        
        this.navGraph.activeBranch = this.focusedBranch;
        
        this.focusedBranch .View.find("header").click();

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
    changeBranch : function ( branch )
    {
        this.branchHistory.push( this.branch );
        this.cbIndex = this.branchHistory.length - 1;
        this.branch = branch;   
        
        this.redrawFragment( this.branch, true );
    },
    changeFocusedBranch : function ( branchId )
    {
        // указывает navGraph кто будет focused branch
    },
    /*
     * get branch by index or last branches element
     */
    getBranch : function ( index )
    {
        if ( index )
        {
            if (this.branchHistory[index] != undefined)
            {
                return this.branchHistory[index];
            }
            else
            {
                return false;
            }
        }
        else
        {
            return this.branchHistory[ this.branchHistory.length - 1 ];
        }
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
        this.View.find(".current-branch *").remove();
        
        var newView = branch.render ({
            parentView     : this.View.find(".current-branch"), 
            insertMode   : 'appendTo',
            tmpl   : 'branch', 
            parentId : this.id
        });
        
        newView.css( { "border-color": branch.color } )
        
        if ( redrawGraph ) {
            this.branch.drawNavGraph( this.View.find(".navdiag") );
            this.navGraph = this.branch.navGraph;
        }

    }
    
}