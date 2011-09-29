function Fragment ( Application )
{
    this.Application = Application;
    
    var myDate = new Date();
    this.id = getRandomInt(0,myDate.getMilliseconds());
    
    this.branch = null;
    
    this.View = new FragmentView ( this );
    
    this.Marker = new Marker ( this.Application );
    this.parentMarker = null;
    
    this.navGraph = null;
    
    this.isActive = false;
}

Fragment.prototype = {
    clear: function (  )
    {
        this.branch = null;
        this.focusedBranch = null;
        this.navGraph = null;
    },
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
    fillData : function ( newData )
    {
        if (newData.branches)
        {
            this.branch = this.Application.branches[newData.branches[0]] ;
        }
    }
}