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
    this.fragment         = 0;
    this.branchRef        = "";
    
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
        if ( this.branchId )
        {
            this.branchRef = "#branch-"+id+"#post-"+this.id;
            this.fragment = null;
            if ( this.branchRef.length > 0 ) {
                for (var i = this.Application.fragments.length; i--;)
                {
                    if ( this.Application.fragments[i].branch && this.Application.fragments[i].branch.id == this.branchId )
                    {
                        this.fragment = this.Application.fragments[i];
                    }
                    else
                    { 
                        if ( this.Application.fragments[i].branch && this.Application.fragments[i].branch.branches) {
                            for ( var j in this.Application.fragments[i].branch.branches )
                            {
                                if ( this.Application.fragments[i].branch.branches[j].id == this.branchId )
                                {
                                    this.fragment = this.Application.fragments[i];
                                    break;
                                }
                            }
                        }
                    }
                    if ( this.fragment )
                    {
                        break;
                    }
                }
            }
        }
    },
    openPostChilds : function ( parenView )
    {
        var Post = this;
        this.loadChilds( {}, function( ) { Post.View.showPostChils ( parenView ) } );
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
    }
  
};

