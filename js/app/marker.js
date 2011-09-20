

var Marker = function ( Application )
{
    
    this.Application = Application;
    
    this.name = 'Marker_' + (new Date()).getTime();
    
    this.params = {};
    this.params = {};
    
    this.action = undefined;
    
    this.fragments = [];
    
    this.View = new MarkerView ( this );
    
    return this;
}

Marker.prototype = {
    setName : function ( name ) {
        this.name = name;
    },
    getName : function ( ) {
        return this.name;
    },
    run : function ( ) {
        this.Application.msg('marker run started');
//        this.makeRequest ();
    },
    fragmentSearch : function ( branchId ) {
        var fragment = false;
            
        for ( var i = this.fragments.length; i--; ) {
            if (this.fragments[i].branch.id == branchId) {
                fragment = this.fragments[i];
                break;
            };
        }
        
        return fragment;
    },
    addFragments : function ( newData ) {
        this.Application.msg('marker add Fragments', 'console');
        
        var fragment,
            issetFragmentId = 0,
            branchId = 0;
            
        for ( var i = newData.branches.length; i--; )
        {
            branchId = newData.branches[i];
            if ( fragment = this.fragmentSearch( branchId ) ) {
                fragment.update( this.Application.branches[branchId] );
            }
            else
            {
                fragment = new Fragment( );
                this.fragments.push( fragment );
            }
            
            fragment.addMainBranch( this.Application.branches[ branchId ] );
        }
        
    },
    makeActive : function ( ) {
        this.View.addTab();
        this.Application.View.clearMain();
        this.View.drawFragments();
        this.View.selectTab();
    },
    makeRequest : function ( ) {
        var marker = this;
        this.Application.ajaxRequest(
            '/Slice.json',
            function ( response ) {
                var newData = marker.Application.parseResponseData(response);
                marker.action( newData );
            },
            function (){
                this.Application.msg('marker result error');
            }, 
            this.params
        );

    },
    setAction : function ( f ) {
        this.action = f;
    },
    getAction : function ( f ) {
        return this.action;
    },
    getParams : function ( ) {
        return this.paramsжы
    },
    addParams : function ( params ) {
       $.extend( this.params, params );  
    },
    addParam : function ( name, value ) {
      this.params[name] = value;    
    }
};