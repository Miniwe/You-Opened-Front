

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
    
    this.rigthSideData = {
        navigram  : null,
        tagCloud  : {},
        userCloud : {}
    };
    
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
        this.clearRightSideData();
        var fragment,
            issetFragmentId = 0,
            branchId = 0,
            tmpBranch = null;
            
        for ( var i = newData.branches.length; i--; )
        {
            branchId = newData.branches[i];
            tmpBranch = this.Application.branches[ branchId ];
            if ( fragment = this.fragmentSearch( branchId ) ) {
                fragment.update( tmpBranch );
            }
            else
            {
                fragment = new Fragment( this.Application );
                this.fragments.push( fragment );
                
            }
            fragment.addMainBranch( tmpBranch );
            
            $.extend(this.rigthSideData.tagCloud, tmpBranch.tags); 
            $.extend(this.rigthSideData.userCloud, tmpBranch.authors); 
            
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
           
        for ( var i = newData.posts.length; i--; )
        {
            id = newData.posts[i];
            tmpPost= this.Application.posts[id];
            
            if ( this.posts[id] != undefined ) {
                this.posts[id].update( tmpPost );
            }
            else {
                this.posts[id] = tmpPost;
                this.postsCount ++;
            }
            
            $.extend(this.rigthSideData.tagCloud, tmpPost.tags); 
            tmpAuthor[tmpPost.author.id] = {
                author : tmpPost.author,
                entryRating : 1
            };
            $.extend(this.rigthSideData.userCloud, tmpAuthor ); 
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
    },
    clearRightSideData : function ( ) {
        this.rigthSideData = {
            navigram  : null,
            tagCloud  : {},
            userCloud : {}
        };
    },
    fillRightSideData : function () {
        
    }
};