
function Fragment ( Application )
{
    this.Application = Application;
    
    var myDate = new Date();
    this.id = 'fragment-' + myDate.getMilliseconds();
    
    this.branch = null;
    this.branchHistory = [];
    this.View = $(document.body);
    
    this.cbIndex = 0;
}

Fragment.prototype = {
    /*
     * add branch 
     */
    changeBranch : function ( branch )
    {
        this.branchHistory.push( this.branch );
        this.cbIndex = this.branchHistory.length - 1;
        this.branch = branch;   
        
        this.redrawFragment( this.branch );
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
    redrawFragment : function ( branch )
    {
        /*
         * remove all framgments inside
         * 1 remove main branch
         * 2
         * 3 ...
         * draw indide Elements for given branch
         */
        this.View.find(".current-branch *").remove();
        
        this.branch.render ({
            parentView     : this.View.find(".current-branch"), 
            insertMode   : 'appendTo',
            tmpl   : 'branch', 
            parentId : this.id
        });
        
        this.branch.drawNavGraph( this.View.find(".navdiag") );


    }
    
}