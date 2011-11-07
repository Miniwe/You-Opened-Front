/**
 * 
 */
var Marker = function ( Application )
{
    
    this.Application = Application;
    
    this.name = 'Marker_' + getRandomInt(0,( new Date() ).getTime() );
    
    this.path = '/Slice.json';
    
    this.params = {
        onlyInBranches: "False"
    };
    
    this.action = undefined;
    
    this.fragments = [];
    this.posts = {};
 
    this.postsCount = 0;
    
    this.viewMode = 'hierarhy';
    
    this.View = new MarkerView ( this );
    
    this.isActive = false;
    
    this.history = new History();
    
    this.rightSideData = {
        navigram  : null,
        tagCloud  : {},
        userCloud : {}
    };
    
    return this;
}

Marker.prototype = {
    saveState : function ( )
    {
        var marker = this;
        var item = {
            name: this.name,
            path: this.path,
            params: this.params,
            marker_action: this.action,
            action: function () {
                
                marker.setPath( this.path );
                marker.setName( this.name );
                
                marker.params = {};
                marker.addParams( this.params );

                marker.setAction = this.marker_action;

                marker.makeRequest();
                
            }
        };
        this.history.addItem( item );
    },
    setPath : function ( path )
    {
        this.path = path;
    },
    getPath : function ( ) {
        return this.path;
    },
    setName : function ( name )
    {
        this.name = name;
    },
    getName : function ( )
    {
        return this.name;
    },
    run : function ( ) {
        this.Application.msg('marker run started');
//        this.makeRequest ();
    },
    fragmentSearch : function ( branchId )
    {
        
        var fragment = false;
        for ( var i = this.fragments.length; i--; ) {
            if (this.fragments[i].branch.id == branchId) {
                fragment = this.fragments[i];
                break;
            };
        }
        return fragment;
    },
    addFragments : function ( newData )
    {
        this.clearRightSideData();
        var fragment,
            issetFragmentId = 0,
            branchId = 0,
            tmpBranch = null;
            
        for ( var i = newData.branches.length; i--; ) {
            branchId = newData.branches[i];
            tmpBranch = this.Application.branches[ branchId ];
            if ( fragment = this.fragmentSearch( branchId ) ) {
                fragment.update( tmpBranch );
            }
            else {
                fragment = new Fragment( this.Application );
                fragment.addParentMarker( this );
                this.fragments.push( fragment );
            }
            fragment.addMainBranch( tmpBranch );
            
            $.extend(this.rightSideData.tagCloud, tmpBranch.tags); 
            $.extend(this.rightSideData.userCloud, tmpBranch.authors); 
            
        }
        
    },
    addPosts: function ( newData )
    {
        this.clearRightSideData();
        var id = 0,
            post,
            issetPostId = 0,
            tmpAuthor = {},
            tmpPost = null;
           
        for ( var i = newData.posts.length; i--; ) {
            id = newData.posts[i];
            tmpPost= this.Application.posts[id];
            
            if ( this.posts[id] != undefined ) {
                this.posts[id].update( tmpPost );
            }
            else {
                this.posts[id] = tmpPost;
                this.postsCount ++;
            }
            
            $.extend(this.rightSideData.tagCloud, tmpPost.tags); 
            tmpAuthor[tmpPost.author.id] = {
                author : tmpPost.author,
                entryRating : 1
            };
            $.extend(this.rightSideData.userCloud, tmpAuthor ); 
        }
        
    },
    makeRequest : function ( )
    {
        this.saveState();
        
        var marker = this;
        this.Application.ajaxRequest(
            this.path,
            function ( response ) {
                var newData = marker.Application.parseResponseData(response);
                marker.action( newData );
            },
            function (){
                marker.Application.msg('marker result error');
            }, 
            this.params
        );

    },
    setAction : function ( f )
    {
        this.action = f;
    },
    getAction : function ( f )
    {
        return this.action;
    },
    getParams : function ( )
    {
        return this.params;
    },
    addParams : function ( params )
    {
       $.extend( this.params, params );  
    },
    addParam : function ( name, value )
    {
      this.params[name] = value;    
    },
    getParam : function ( name )
    {
        return (this.params[name] != undefined) ? this.params[name] : ''
    },
    clearRightSideData : function ( )
    {
        this.rightSideData = {
            navigram  : null,
            tagCloud  : {},
            userCloud : {}
        };
    },
    fillRightSideData : function ( rightSideData )
    {
        this.rightSideData = rightSideData;
    },
    clearMarkerData : function ()
    {
        this.fragments = [];
        this.posts = {};
        this.postsCount = 0;
        this.clearRightSideData();
    },
    hasFragment : function ( fragmentId )
    {
        for (var i = this.fragments.length; i--; ) {
            if ( fragmentId == this.fragments[i].id ) {
                return true;
            }
        }
        return false;
    },
    getFragment : function ( fragmentId )
    {
        for (var i = this.fragments.length; i--; ) {
            if ( fragmentId == this.fragments[i].id ) {
                return this.fragments[i];
            }
        }
        return false;
    },
    appendValue : function ( name, value )
    {
        var tmpValuesArray = [];
        
        if ( this.params[name] == undefined ) {
            this.params[name] = value;
            return true;
        }
        
        tmpValuesArray = this.params[name].split(',');
        
        tmpValuesArray.push( value );
        
        this.params[name] = tmpValuesArray.join(',');
    },
    removeValue : function ( name, value )
    {
        if ( this.params[name] == undefined ) {
            return true;
        }
        
        var tmpValuesArray = this.params[name].split(',');
        
        this.params[name] = [];
        for (var i=tmpValuesArray.length; i--; ) {
            if (tmpValuesArray[i] != value) {
                this.params[name].push(tmpValuesArray[i]);
            }
        }
        this.params[name] = this.params[name].join(',');
    }
    
};