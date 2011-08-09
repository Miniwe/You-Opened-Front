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
        
        this.parseSubBranches ( data.Branches );
        
    }
    
    this.update(data);
  
//  return this;
}

extend(Branch, Facade);

Branch.prototype = {
    openFacade : function (View)
    {
        View.find(".collapse_control").addClass("opened");
        this.hideInnerKeys(View); 
        
        if (this.Application.activeBranch) 
        {
            $("article[data-id="+ this.Application.activeBranch.id +"]").find(".graphContainer").removeClass("active");

        }
        
        this.Application.activeBranch = this;
        
        this.removeAfterBranches ( this.id );
        this.loadChilds( View );
    },
    closeFacade : function (View)
    {
        View.find(".collapse_control").removeClass("opened");
        
        this.showInnerKeys(View); 
        
        this.removeAfterBranches ( this.id );
        
        this.removeAfterPosts ( this.id );
        
        
    },
    prepareRender : function()
    {
        return true;
    },
    render : function ( params )
    {
        this.prepareRender ();
        
        var View = params.el;
        if (params.conditionKeys)
        {
            if ( this.keysCount )
            {
                View = this.renderSelf (params.el, params.tmpl, params.mode, params.parent);
                this.drawNavGraph ( View );
                this.attachBehavior ( View );
            }
        }
        else
        {
            View = this.renderSelf (params.el, params.tmpl, params.mode, params.parent);
            this.drawNavGraph ( View );
            this.attachBehavior ( View );
        }

        if ( params.conditionChilds )
        {
            for (id in this.branches)
            {
                this.branches[id].render({
                    el     : View, 
                    tmpl   : 'branch', 
                    mode   : 'insertAfter',
                    parent : this.id, 
                    conditionChilds : params.conditionChilds,
                    conditionKeys : params.conditionKeys
                });
            };
            
            $("article[data-parent='" + this.id + "']").addClass("lighter");
        }
        
        return View;
    },
    attachBehavior : function ( View )
    {
        var facade = this;
        var parentFacade = facade.Application.branches[facade.parentBranchId];
        if (parentFacade && parentFacade.navGraph != undefined)
        {
            View.hover(function( ){
                    parentFacade.navGraph.highlightBranch = facade.id;
                }, function( ){
                    parentFacade.navGraph.highlightBranch = 0;
            });
            
        }
        
        View.find("header").click(function (){
            facade.openFacade( View );
        });
        
        View.find(".collapse_control").click(function(){
           
           var control = $(this);
           
           control.toggleClass("opened");
           
           if (control.hasClass("opened"))
           {
               facade.openFacade( View );
           }
           else
           {
               facade.closeFacade( View );
           }
        });
        
        View.find(".show_reply").click(function(){
           
           var control = $(this);
           
           control.toggleClass("opened");
           
           if (control.hasClass("opened"))
           {
               $.tmpl("reply", {
                   id : facade.postId
               }).insertAfter( View.find(".inner") ).show();
               
               facade.Application.addReplyFormBehavior( facade, View );
           }
           else
           {
               facade.Application.removeReplyForm()
           }
           
           return false;
        });
        
        
    },
    drawNavGraph : function ( View )
    {
      var facade = this;
      var navGraph = View.find(".graphContainer");
      navGraph.attr("id", "navCont" + this.id)
      navGraph.find("*").remove();
      $("<canvas></canvas>")
        .appendTo(navGraph)
        .addClass('navGraph')
        .attr("id", "navGraphCanvas"+this.id)
        .css({
            width: navGraph.width(),
            height: navGraph.height()
        });
     
     this.navGraph = new NavGraph("navGraphCanvas" + this.id);
     
     this.navGraph.init();
     this.navGraph.addData({
        id     : this.id,
        weight : this.relevantWeight,
        click  : function ( id ) {
            View.find("header").click();
        }
     }, this.prepareNavGraphData( View ));
     
     this.navGraph.startGraph();
        
    },
    prepareNavGraphData : function ( View )
    {
        var navData = [],
            facade = this,
            i;
        
        for (i in this.branches)
        {
            if (!this.branches[i].relevantWeight) continue;
            
            navData.push({
                id     : this.branches[i].id,
                weight : this.branches[i].relevantWeight,
                click  : function( id ) {
                    
                    var curBranch = facade.Application.branches[id];
                    
                    facade.hideInnerKeys(View); 
                    facade.removeAfterBranches ( facade.id );
                    
                    
//                    var newView = curBranch.render(View, 'branch', 'insertAfter', facade.id).addClass("lighter");
                    var newView = curBranch.render({
                        el     : View, 
                        tmpl   : 'branch', 
                        mode   : 'insertAfter',
                        parent : facade.id, 
                        conditionChilds : true,
                        conditionKeys : true
                    }).addClass("lighter");
                    
                    newView.find("header").click();
                }
            });
        }
        return navData;
    },
    hideInnerKeys : function ( View )
    {
        View.find(".branch_keys").hide();
    },
    showInnerKeys : function ( View )
    {
        if (View == undefined) return false;
        View.find(".branch_keys").show();
    },
    expandKeys : function ( View )
    {
        var branch = false;
        for (i in this.keys)
        {
            branch = this.branchExist(i);
            if (!branch)
            {
                this.keys[i].render(View, "key", "insertAfter", this.id);            
            }
            else
            {
                branch.render(View, 'branch', 'insertAfter', this.id).addClass("lighter");
            }
            branch = false;
        };

    },
    expandPost : function ( post, View )
    {
        var branch = this.branchExist(post.id);
            
        if (!branch)
        {
            post.render(View, "key", "insertAfter", this.id);            
        }
        else
        {
            branch.render({
                el     : View, 
                tmpl   : 'branch', 
                mode   : 'insertAfter',
                parent : this.id, 
                conditionChilds : true,
                conditionKeys : false
            }).addClass("lighter");
        }
        branch = false;        
    },
    expandPosts : function ( View )
    {
        var id;
            
        for ( id in this.Application.posts )
        {
            if ( this.Application.posts[id].parentPostId != this.postId ) continue;
      
            this.expandPost(this.Application.posts[id], View);
            
        };

    },
    loadChilds : function ( View )
    {
        var facade = this,
            id = 0;
        
        this.Application.ajaxRequest( '/Slice.json',
            function ( response ) {
                
                facade.removeAfterBranches ( facade.id );

                facade.removeAfterPosts ( facade.id );    
                
                var newData = this.parseResponseData( response );

                if ( $("#params-form [name=mode]:checked").val() == "plain" )
                {
                    for ( var i = newData.posts.length; i--; )
                    {
                        if (facade.Application.posts[ newData.posts[ i ] ].id == facade.postId) { continue };
                            
                        facade.Application.posts[ newData.posts[ i ] ].render(View, "key", "insertAfter", facade.id);
                    }
                }
                else {
                    for ( var i = newData.posts.length; i--; )
                    {
                        if ( facade.Application.posts[ newData.posts[ i ] ].parentPostId == facade.postId )
                        {
                            facade.expandPost ( facade.Application.posts[ newData.posts[ i ] ], View );
                        }
                    }
                }

            },
            function () {

                facade.Application.msg( "Count`t get post list for branch: " + facade.id );

            },
            facade.Application.prepareParams( this.postId )
        );        
    },    
    branchExist : function ( postId )
    {
        for (i in this.Application.branches)
        {
            if (this.Application.branches[i].postId == postId)
            {
                return this.Application.branches[i];
            }
        }
        
        return false;
    },
    expandBranches: function ( View, branches )
    {
        for (i in branches)
        {
            // @render subbranch here
            branches[i].render(View, 'branch', 'insertAfter', this.id).addClass("lighter");
            
        };

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
    },
    removeAfterPosts : function ( parentId )
    {
        $("article[data-parent='"+ parentId +"']").remove();
    }
}

