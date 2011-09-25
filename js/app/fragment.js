function Fragment ( Application )
{
    this.Application = Application;
    
    var myDate = new Date();
    this.id = 'fragment-' + myDate.getMilliseconds();
    
    this.branch = null;
    this.focusedBranch = null;
    
    this.branchHistory = new History( );
    
    this.View = new FragmentView ( this );
    
    this.Marker = new Marker ( this.Application );
    this.parentMarker = null;
    
    this.navGraph = null;
    
    this.cbIndex = 0;

}

Fragment.prototype = {
    addParentMarker: function ( marker )
    {
        this.parentMarker = marker;
    },
    addMarkerParams : function ( params )
    {
        this.Marker.addParams( params );
    },
    addMainBranch : function ( branch )
    {
        this.branch = branch;
        
        this.addMarkerParams(this.branch.marker);
        
        var item = branch,
            Facade = this;

        item.action = function () {
            /*
            // действия для главной ветки
            
            Facade.removeFocusedBranch( );
            Facade.branch = branch;
            Facade.redrawFragment( Facade.branch, true );
            */
        };

        this.branchHistory.addItem( item );
        
    },
    addFocusedBranch : function ( branch )
    {
        /*
        var item = branch;
        var Facade = this;

        item.action = function () {
            
            // действия для чилдовой ветки
            
            Facade.removeFocusedBranch( );
            
            Facade.focusedBranch = branch;   
            
            Facade.branch = Facade.Application.branches[Facade.focusedBranch.parentBranchId];   
            
            if (Facade.branch == undefined)
            {
                Facade.branch = Facade.focusedBranch;
            }
            Facade.redrawFragment( Facade.focusedBranch, true);
            
            Facade.navGraph.activeBranch = Facade.focusedBranch;
            
//            Facade.focusedBranch.View.find("header").click();
        };

        Facade.branchHistory.addItem( item );
        Facade.branchHistory.process( true );
            */

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
        var fragmentView = this.View.render(params);
        
        return fragmentView;
        
    },
    remove : function ()
    {
        this.branch = null;
        this.focusedBranch = null;
        this.navGraph = null;
    },
    removeNavGraph : function ()
    {
        this.focusedBranch = null;
        this.navGraph = null;
    }
}