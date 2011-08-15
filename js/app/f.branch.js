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
  
    this.branches = {};
    this.keys     = {};
    this.posts    = {};
    
    this.navGraph = null;
    
    this.marker = {
        parentPostId: (data.Marker.parentPostId != undefined) ? data.Marker.parentPostId : this.postId,
        query: (data.Marker.query != undefined) ? data.Marker.query : "",
        depth : (data.Marker.depth != undefined) ? data.Marker.depth : 1
    };

    this.View = $(document.body);
    
    this.parseSubBranches = function ( branches )
    { 
        var i = 0;
        
        for ( id in branches )
        {
            if (this.branches[id] == undefined)
            {
                this.branches[id] = new Branch( this.Application, id, branches[id] );
                this.Application.branches[id] = this.branches[id];
            }
            else
            {
                this.branches[id].update( branches[id] );
            }
            
        }
    };
    
    this.update = function (data) {
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
            this.keys[this.keyPostIds[i]] = Application.posts[this.keyPostIds[i]];
        }
        
        this.branches = {};
        this.parseSubBranches ( data.Branches );
    }
    
    this.update(data);
  
//  return this;
}

extend(Branch, Facade);

Branch.prototype = {
    openFacade : function ( )
    {
        this.View.find( ".collapse_control" ).addClass( "opened" );
        
        this.hideInnerKeys( this.View ); 
        
        this.removeAfterBranches( this.id );
        
        this.loadChilds( );
    },
    closeFacade : function ( )
    {
        this.View.find( ".collapse_control" ).removeClass( "opened" );
        
        this.showInnerKeys( this.View ); 
        
        this.removeAfterBranches ( this.id );
        
        this.removeAfterPosts ( this.id );
    },
    render : function ( params )
    {
        
        this.View = this.renderSelf (params.parentView, params.tmpl, params.insertMode, params.parentId);
        
        this.attachBehavior ( );

        this.drawNavGraph( );

        return this.View;
    },
    attachBehavior : function ( )
    {
        var Facade = this;
        
        this.View.find("header").click( function ( ) {
            Facade.openFacade( );
        } );
        
        this.View.find(".collapse_control").click(function( ) {
           
           var control = $(this);
           
           control.toggleClass( "opened" );
           
           if ( control.hasClass( "opened" ) ) {
               Facade.openFacade( );
           }
           else
           {
               Facade.closeFacade( );
           }
        } );
        
        this.View.find(".show_reply").click( function( ) {
           
           var control = $(this);
           
           control.toggleClass("opened");
           
           if (control.hasClass("opened"))
           {
               $.tmpl("reply", {
                   id : Facade.postId
               }).insertAfter( Facade.View.find(".inner") ).show();
               
               Facade.Application.addReplyFormBehavior( Facade, Facade.View );
           }
           else
           {
               Facade.Application.removeReplyForm()
           }
           
           return false;
        });
        
        
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
    drawNavGraph : function ( )
    {
      var Facade = this;
      var navGraph = this.View.find( ".graphContainer" );
      
      navGraph.attr( "id", "navCont" + this.id )
      
      navGraph.find( "*" ).remove( );
      $( "<canvas></canvas>" )
        .appendTo( navGraph )
        .addClass( 'navGraph' )
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
        click  : function ( id ) {
            Facade.View.find("header").click();
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
            if (!this.branches[i].relevantWeight) continue;
            
            navData.push({
                id     : this.branches[i].id,
                postCount : this.branches[i].postCount,
                weight : this.branches[i].relevantWeight,
                click  : function( id ) {
                    
                    var curBranch = Facade.Application.branches[id];
                    
                    Facade.hideInnerKeys(View); 
                    Facade.removeAfterBranches ( Facade.id );
                    
                    
//                    var newView = curBranch.render(View, 'branch', 'insertAfter', facade.id).addClass("lighter");
                    var newView = curBranch.render({
                        el     : Facade.View, 
                        tmpl   : 'branch', 
                        mode   : 'insertAfter',
                        parent : Facade.id, 
                        conditionChilds : true,
                        conditionKeys : true
                    }).addClass("lighter");
                    
                    newView.find("header").click();
                }
            });
        }
        return navData;
    },
    hideInnerKeys : function ( )
    {
        this.View.find(".branch_keys").hide();
    },
    showInnerKeys : function ( )
    {
        this.View.find(".branch_keys").show();
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
    loadChilds : function ( )
    {
        var Facade = this,
            id = 0;
        this.Application.ajaxRequest( '/Slice.json',
            function ( response ) {
                
                Facade.removeAfterBranchesAndPosts ( false );

                var newData = this.parseResponseData( response );

                if ( $("#params-form [name=mode]:checked").val() == "plain" )
                {
                    Facade.drawPlain( newData.posts );
                }
                else {
                    Facade.drawHierarhy( newData.posts );
                }
                
            },
            function () {

                Facade.Application.msg( "Count`t get post list for branch: " + Facade.id );

            },
            Facade.Application.prepareParams( this.postId )
        );        
    },    
    drawPlain: function ( posts_list )
    {
        for ( var i = posts_list.length; i--; )
        {
            if ( this.Application.posts[ posts_list[ i ] ].id == this.postId ) { continue };

            this.Application.posts[ posts_list[ i ] ].render({
                el: this.View, 
                tmpl: "key", 
                mode :"insertAfter",
                parent: this.id
            }).css({"background-color": this.Application.nextColor()});
        }
    },
    drawHierarhy: function ( list )
    {
        console.log('load H - -');
//                    for ( var i = newData.posts.length; i--; )
//                    {
//                        if ( Facade.Application.posts[ newData.posts[ i ] ].parentPostId == Facade.postId )
//                        {
//                            Facade.expandPost ( Facade.Application.posts[ newData.posts[ i ] ], Facade.View );
//                        }
//                    }
        
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

