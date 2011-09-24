

var Marker = function ( Application )
{
    
    this.Application = Application;
    
    this.name = 'Marker_' + (new Date()).getTime();
    
    this.path = '/Slice.json';
    
    this.params = {};
    
    this.action = undefined;
    
    this.fragments = [];
    this.posts = {};
 
    this.postsCount = 0;
    
    this.View = new MarkerView ( this );
    
    this.isActive = false;
    
    return this;
}

Marker.prototype = {
    setPath : function ( path ) {
        this.path = path;
    },
    getPath : function ( ) {
        return this.path;
    },
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
                fragment = new Fragment( this.Application );
                this.fragments.push( fragment );
            }
            fragment.addMainBranch( this.Application.branches[ branchId ] );
        }
        
    },
    addPosts: function ( newData )
    {
        var id = 0,
            post,
            issetPostId = 0;
            
        for ( var i = newData.posts.length; i--; )
        {
            id = newData.posts[i];
            if ( this.posts[id] != undefined ) {
                this.posts[id].update( this.Application.posts[id] );
            }
            else {
                this.posts[id] = this.Application.posts[id];
                this.postsCount ++;
            }
        }
        
    },
    makeRequest : function ( )
    {
        var marker = this;
                
        this.Application.ajaxRequest(
            this.path,
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