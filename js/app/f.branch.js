/* 
 * BraNch
 */

function Branch (Application, id, data) 
{
    
    Branch.superclass.constructor.call( this );

    this.Application = Application;
  
    this.id     = id;
    
    this.postId = data.PostId;
    this.post   = this.Application.posts[this.postId];
    
    this.parentBranchId = data.ParentBranchId;
  
    this.fragment = null;
    
    this.branches = {};
    this.keys     = {};
    this.posts    = {};
    
    this.tags    = {};
    this.authors    = {};
    
    this.navGraph = null;
    
    this.color = this.Application.nextColor();
    
    this.marker = {
        parentPostId: (data.Marker.parentPostId != undefined) ? data.Marker.parentPostId : this.postId,
        query: (data.Marker.query != undefined) ? data.Marker.query : "",
        depth : (data.Marker.depth != undefined) ? data.Marker.depth : 1
    };

    this.View = new BranchView ( this );
    
    this.parseSubBranches = function ( branches )
    { 
        var i = 0;
        
        for ( id in branches )
        {
            if (this.Application.branches[id] == undefined)
            {
                this.Application.branches[id] = new Branch( this.Application, id, branches[id] );
            }
            else
            {
                this.Application.branches[id].update( branches[id] );
            }
            this.branches[id] = this.Application.branches[id];
        }
    };
    
    this.update = function ( data ) {
        var i = 0;
        this.postCount       = data.PostCount;
        this.updateTime      = data.UpdateTime;
        this.updateTimeF     = formatDate(data.UpdateTime);
        this.relevantWeight  = data.RelevantWeight;
        
        this.isBush          = data.IsBush;
        this.bushRelevantWeight = data.BushRelevantWeight;
        
        this.keysCount  = data.KeyPostIds.length;
        this.keyPostIds = data.KeyPostIds;

        this.marker = {
            parentPostId: (data.Marker.parentPostId != undefined) ? data.Marker.parentPostId : this.postId,
            query: (data.Marker.query != undefined) ? data.Marker.query : "",
            depth : (data.Marker.depth != undefined) ? data.Marker.depth : 1
        };
        
        this.keys = {};
        
        for ( i = this.keyPostIds.length; i--; )
        {
            this.keys[this.keyPostIds[i]] = this.Application.posts[this.keyPostIds[i]];
        }
        for ( var tagId in data.Tags )
        {
            if (this.tags[tagId] == undefined)
            {
                this.tags[tagId] = {
                    tag: this.Application.tags[tagId]
                };
            }
            this.tags[tagId].entryRating = data.Tags[tagId].EntryRating;
        }
        
        for ( var authorId in data.Authors )
        {
            if (this.authors[authorId] == undefined)
            {
                this.authors[authorId] = {
                    author: this.Application.users[authorId]
                };
            }
            this.authors[authorId].entryRating = data.Authors[authorId].EntryRating;
        }
        
        this.branches = {};
        this.parseSubBranches ( data.Branches );
    }
    
    this.update(data);
    
//    return this;
}

extend(Branch, Facade);

Branch.prototype = {
    openFacade : function ( callback )
    {
//        this.View.find( ".collapse_control" ).addClass( "opened" );
//        
//        this.hideInnerKeys( this.View ); 
//        
//        this.removeAfterBranchesAndPosts ( );
//        
//        this.loadChilds( callback );
        
    },
    closeFacade : function ( ) {
//        this.View.find( ".collapse_control" ).removeClass( "opened" );
//        
//        this.showInnerKeys( this.View ); 
//        
//        this.removeAfterBranchesAndPosts ( );
//        
//        var fragment = this.getFragment ( this.id );
//        fragment.hideSide ( ) ;
    },
    prepareRender : function() {
//        получить ширину key fileds
        var keysWidth = $('.branch_keys').outerWidth() ;
        keysWidth -= 180; // паддинги ul 
//        отнять от ширины количество * 12 (aka padding) + 4 aka margin 
        keysWidth -=  this.keysCount * 16; // паддинги ul 
        var keysRatingSumm = 0;
//        получить сумму ключей
        for (var id in this.keys)
        {
            keysRatingSumm += this.keys[id].relevantWeight;
        }
//        получить коэфицент уменьшения
        var coef = keysWidth / keysRatingSumm ;
//        для каждого поста установить шириру = значение * коэфицент
        for (var id in this.keys)
        {
             this.keys[id].viewWidth = this.keys[id].relevantWeight * coef;
        }
        
    },
    getFragment : function( branchId )  {
        var fragment = null;
        
        for (var i = this.Application.fragments.length; i--;) {
            
            if ( this.Application.fragments[i].branch.id == branchId ) {
                fragment = this.Application.fragments[i];
            } 
            else {
                for ( var j in this.Application.fragments[i].branch.branches ) {
                    if ( this.Application.fragments[i].branch.branches[j].id == branchId ) {
                        fragment = this.Application.fragments[i];
                        break;
                    }
                }
            }
            if ( this.fragment ) {
                break;
            }
        }
        return fragment;
    },
    loadNavGraphData : function ( )
    {
        var Facade = this,
            id = 0;
        
        this.Application.ajaxRequest( '/Slice.json',
            function ( response ) {
                var newData = this.parseResponseData( response );
                
                /*
                 * идем по постам
                 * собираем в нужный массив
                 * 
                 */
                
            },
            function () {
                Facade.Application.msg( "Count`t get nav graph data for branch: " + Facade.id );
            },
            {
                parentPostId : Facade.postId,
                depth : 2
            }
        );        
    },
    drawNavGraph : function ( holder )
    {
      var Facade = this,
          navGraph = holder;
      
//      navGraph.attr( "id", "navCont" + this.id )
      
      navGraph.find( "*" ).remove( );
      $( "<canvas></canvas>" )
        .appendTo( navGraph )
//        .addClass( 'navGraph' )
        .attr( "id", "navGraphCanvas" + this.id )
        .css({
            width: navGraph.width( ),
            height: navGraph.height( )
        });
     
     this.navGraph = new NavGraph( "navGraphCanvas" + this.id );
     
     this.navGraph.init();
     this.navGraph.addData({
        id     : this.id,
        postCount : this.postCount,
        weight : this.relevantWeight,
        color: this.color,
        click  : function ( id ) {
            var fragment = Facade.getFragment( id ); 
            fragment.addFocusedBranch( Facade.Application.branches[id] );
        },
        makeMainClick  : function ( id ) {
            var fragment = Facade.getFragment( id ); 
            fragment.addMainBranch( Facade.Application.branches[id] );
        }
     }, this.prepareNavGraphData( ));
     
     this.navGraph.startGraph();
        
    },
    prepareNavGraphData : function ( )
    {
        var navData = [],
            Facade = this,
            i;
            
        for (i in this.branches)
        {
            navData.push({
                id     : this.branches[i].id,
                postCount : this.branches[i].postCount,
                weight : this.branches[i].relevantWeight,
                color: this.branches[i].color,
                click  : function( id ) {
                    var fragment = Facade.getFragment( id ); 
                    fragment.addFocusedBranch( Facade.Application.branches[id] );
                },
                makeMainClick  : function ( id ) {
                    var fragment = Facade.getFragment( id ); 
                    fragment.addMainBranch( Facade.Application.branches[id] );
                }
            });
        }
        return navData;
    },
    hideInnerKeys : function ( )
    {
        this.View.find(".branch_keys").hide();
        this.View.find(".keys-nav").hide();
        if (this.keyPostIds.length == 0){ 
            this.View.find(".branch_keys").html("NO KEYS FOR THIS PARAMS").show();
        }
    
    },
    showInnerKeys : function ( )
    {
        this.View.find(".branch_keys").show();
        if (this.keyPostIds.length > 0){ 
            this.View.find(".keys-nav").show();
        }
    },
    expandPost : function ( post )
    {
        var branch = this.Application.branchExist(post.id);
            
        if (!branch)
        {
            post.render({
                el: this.View, 
                tmpl: "key", 
                mode :"insertAfter",
                parent: this.id
            });            
        }
        else
        {
            branch.render({
                el     : this.View, 
                tmpl   : 'branch', 
                mode   : 'insertAfter',
                parent : this.id, 
                conditionChilds : true,
                conditionKeys : false
            }).addClass("lighter");
        }
        branch = false;        
    },
    expandPosts : function ( )
    {
        var id;
            
        for ( id in this.Application.posts )
        {
            if ( this.Application.posts[id].parentPostId != this.postId ) continue;
      
            this.expandPost(this.Application.posts[id], this.View);
            
        };

    },
    addPoststoBranch : function ( posts )
    {
        for (var i=posts.length; i--; )
        {
            var curPostId = posts[i];
            if ( this.post.id == this.Application.posts[ curPostId ].parentPostId )
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
                Facade.addPoststoBranch (newData.posts);
                if (typeof(callback) == 'function')
                {
                    callback();
                }

            },
            function () {

                Facade.Application.msg( "Count`t get post list for branch: " + Facade.id );

            },
            $.extend(params, {
                'parentPostId' : this.post.id
            })
        );        
    },    
    sortList: function ( posts_list, sortField )
    {
        for ( var i = posts_list.length; i--; )
        {
            posts_list[i] = {
                id :  posts_list[i],
                sortField : this.Application.posts[ posts_list[ i ] ][sortField]
            };
        }
        posts_list.sort( function(a,b) { 
            return b.sortField - a.sortField;
        } );
        for ( var i = posts_list.length; i--; )
        {
            posts_list[i] = posts_list[i].id;
        }
        return posts_list;
    },
    drawListHierarhy: function ( posts_list, color, View)
    {
        var b, id;
        
        for ( id in posts_list )
        {
//            b = this.Application.branchExist( id );
            b = false;
            
            if ( b )
            {
                var newView = this.Application.posts[ id ].View.render({
                    parentView: View, 
                    tmpl: "post", 
                    insertMode :"insertAfter",
                    parent: this.id
                });
                
                b.drawListHierarhy( posts_list, b.color, newView );
            }
            else
            {
                var newView = this.Application.posts[ id ].View.render({
                    parentView: View, 
                    tmpl: "post", 
                    insertMode :"insertAfter",
                    parent: this.id
                });
            }
            /*
             * перебирать все посты ветки
             * если пост является корнем другой ветки то его рисовать с другим цветом
             * запускать с этим цветом перебор 
             */
            View.appendChild( newView[0] );
        }
        
    },
    getOpenedBranch : function ( posts_list )
    {
        var content = document.createDocumentFragment();
        
        this.drawListHierarhy ( this.posts, "#ffffff", content );
        
        return content;
    },
    drawList: function ( posts_list )
    {
        var b;
        for ( var i = posts_list.length; i--; )
        {
            if ( this.Application.posts[ posts_list[ i ] ].id == this.postId ) {continue};

            var viewColor = '#eeeeee';
            var pid = this.Application.posts[ posts_list[ i ] ].parentPostId;
            b = this.Application.branchExist(posts_list[ i ]);
            
            var newView = this.Application.posts[ posts_list[ i ] ].render({
                el: this.View, 
                tmpl: "key", 
                mode :"insertAfter",
                parent: this.id
            });
            
            if ( b )
            {                
                newView.css( {"outline-color": b.color} );
            }
        }
    },
    expandBranches: function ( branches )
    {
        for (i in branches)
        {
            // @render subbranch here
            branches[i].render({
                el: this.View, 
                tmpl: "branch", 
                mode :"insertAfter",
                parent: this.id
            }).addClass("lighter");
           
        };

    },
    removeAfterBranchesAndPosts : function ( flag )
    {
        
        var id = 0;
        for ( id in this.Application.branches )
        {
                
            if ( this.Application.branches[id].parentBranchId == this.id )
            {   
                this.Application.branches[id].removeAfterBranchesAndPosts( flag  );
                $("article[data-id='"+ this.Application.branches[id].id +"']").remove();
            }
        }
        for ( id in this.Application.posts )
        {
                
            if ( this.Application.posts[id].parentPostId == this.postId )
            {   
                
                $("article[data-id='"+ this.Application.posts[id].id +"']").remove();
            }
            
        }
        if ( flag )
        $("article[data-id='"+ this.id +"']").remove();
    },
    removeAfterBranches : function ( parentId )
    {
        
        var id = 0;
        
        for ( id in this.Application.branches )
        {
                
            if ( this.Application.branches[id].parentBranchId == parentId )
            {   
                
                this.removeAfterBranches( this.Application.branches[id].id );
                $("article[data-id='"+ this.Application.branches[id].id +"']").remove();
            }
            
        }
    }
}

