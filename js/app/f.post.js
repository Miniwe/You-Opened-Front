/* 
 * Post 
 */
function Post (Application, id, data)
{
    Post.superclass.constructor.call( this );

    this.Application     = Application;
  
    this.id              = id;
    this.parentPostId    = data.ParentPostId;
    
    this.branchId         = 0;
    this.fragment         = null;
    this.branchRef        = "";
    this.branch           = null;
    
    this.authorId        = data.AuthorId;
    this.author          = (this.Application.users[this.authorId] != undefined)?this.Application.users[this.authorId]:null;
  
    this.createTime      =  data.CreateTime;
    this.createTimeF     = formatDate(this.createTime);
    
    this.text            = data.Text;
    
    this.posts           = {};
    
    this.tags           = {};
    
    this.directUsers    = {};
    this.directUsersIds = [];
 
    this.postCount    = 0;
    
    this.opened = false;
    
    this.View = new PostView ( this );
    
    (this.update = function ( data ) {
        this.relevantWeight = data.RelevantWeight;
        
        for ( var tagId in data.Tags ) {
            if (this.tags[tagId] == undefined) {
                this.tags[tagId] = {
                    tag: this.Application.tags[tagId]
                };
            }
            this.tags[tagId].entryRating = data.Tags[tagId].EntryRating;
        }
        
        if (data.DirectUserIds != null) {
            this.directUsersIds = data.DirectUserIds;
            
            for ( var i=this.directUsersIds.length; i--; ) {
                if ( this.Application.users[ this.directUsersIds[ i ] ] != undefined ) {
                    this.directUsers[ this.directUsersIds[ i ] ] = this.Application.users[ this.directUsersIds[ i ] ];
                };
            }
        }
        
                
    } ).call( this, data );
}

extend( Post, Facade );

Post.prototype = {
    prepareRender : function()
    {
        this.branchId = 0;
        for (var id in this.Application.branches)
        {
            if ( this.id == this.Application.branches[id].postId ) {
                this.branchId = id; 
                this.postCount = this.Application.branches[id].postCount;
                break;
            } else if ( this.parentPostId == this.Application.branches[id].postId ) {
                this.branchId = id; 
            }
        }
    },
    openPostChilds : function ( dfd )
    {
        var Post = this;
        this.loadChilds( {}, function( ) { Post.View.showPostChils (); dfd.resolve({}); } );
    },
    addPoststoPost : function ( posts )
    {
        for (var i=posts.length; i--; )
        {
            var curPostId = posts[i];
            if ( this.id == this.Application.posts[ curPostId ].parentPostId )
            {
                this.posts[curPostId] = this.Application.posts[ curPostId ];
                
                
            }
        }
    },
    processPostSubmit : function ( response )
    {
        var curPostId = '',
            newPost = null,
            Post = this;
            
        if ( response.Result.IsSuccess == "True") {
            
            var newData = this.Application.parseResponseData( response );
            
            if ( response.Result.PostMessageId != null ) {
                
                curPostId = response.Result.PostMessageId;
                
                // add post to post array
                this.posts[curPostId] = this.Application.posts[ curPostId ];
                 
                // drawChildsList and focus to newPost
                if ( this.opened ) {
                    // only add post after
                    this.View.drawPost( this.Application.posts[ curPostId ] );
                    
                    // focus post
                    this.View.focusPost( curPostId );
                }
                else {
                    
                    $.when ( this.View.openContent() )

                        .then(function ( ) {
                            // after opened focus post
                            Post.View.focusPost( curPostId );
                        });
                }
                
                
            }
            else {
                // show message
                this.Application.msg( "Post result: " + response.Result.UserInfo );
            }

        }
        else {
            this.Application.msg( "Post Erorr: " + response.Result.UserInfo );
        }
        
    },
    loadChilds : function ( params, callback )
    {
        var Facade = this;
        
        this.Application.ajaxRequest( '/Slice.json',
            function ( response ) {
                var newData = this.parseResponseData( response );
                Facade.addPoststoPost (newData.posts);
                if (typeof(callback) == 'function')
                {
                    callback();
                }

            },
            function () {

                Facade.Application.msg( "Count`t get post list for branch: " + Facade.id );

            },
            $.extend(params, {
                'parentPostId' : this.id
            })
        );        
    },
    getFramentMarker : function ( )
    {
        
    },
    getFragment : function ( fragmentId )
    {
        console.log('in get fragment', fragmentId);
        var marker = null;
        var fragment = false;

        var markers = this.Application.markers;
        for ( var i=markers.length; i--; ) {
            if ( fragment = markers[i].getFragment( fragmentId ) ) {
                console.log('founded', fragment);
                return fragment;
            }
        }
        console.log('not found ');
        return false;
    }
  
};

