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
        this.hideInnerKeys(View); 
        
        this.removeAfterBranches ( this.id );
//        this.removeAfter ( this.id );
        
//        this.removeAfter ( this.id );
//        this.expandBranches(View); 
        this.loadChilds( View );
//        this.expandKeys(View); 
    },
    closeFacade : function (View)
    {
        this.showInnerKeys(View); 
        
        this.removeAfterBranches ( this.id );
        this.removeAfter ( this.id );
    },
    prepareRender : function()
    {
        return true;
    },
    render : function ( params )
    {
        this.prepareRender ();
        
        var View = params.el;
        console.log("params.el", params.el);
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
            
        View.hover(function( ){
                parentFacade.navGraph.highlightBranch = facade.id;
            }, function( ){
                parentFacade.navGraph.highlightBranch = 0;
        });
        
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
                    
                    console.log(id, facade.Application.branches, curBranch);
                    console.log("View", View);
                    
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
    expandPosts : function ( View )
    {
        var i, 
            branch = false;
        
        console.log('all posts', this.posts);
        
        for ( i in this.posts )
        {
            branch = this.branchExist(i);
            
            console.log("this.posts[i]", i, this.posts[i], branch);
            if (!branch)
            {
                console.log('post render');
                this.posts[i].render(View, "key", "insertAfter", this.id);            
            }
            else
            {
                console.log('branch render');
                branch.render(View, 'branch', 'insertAfter', this.id).addClass("lighter");
            }
            branch = false;
        };

    },
    loadChilds : function ( View )
    {
        var facade = this;
        this.Application.ajaxRequest( '/Slice.json',
            function ( response ) {
                
                var newData = this.parseResponseData( response );

                /*
                 * убираем не непосредсвенных детей
                 *  ** убирать посты свои смысла нет, новые только добавляются
                 *  ** убирать детей веток надо - значит перебираем ветки
                 * открыаываем посты 
                 * если есть соотвествующий branch то 
                 *  если он открыт то его обновляем, его наследников всех уровней удаляем, ключи показываем
                 *  если нет то рисуем пост без внутренних частей (тут может быть фильтр)
                 */
                
                for ( id in facade.branches )
                {   
                    var facadeView = $("article[data-id='" + facade.branches[id] + "']")
                    facade.branches[id].closeFacade( facadeView );
                }
                
                for ( var i = newData.posts.length; i--; )
                {
                    if ( facade.Application.posts[ newData.posts[ i ] ].parentPostId == facade.postId )
                    {
                        facade.posts[ newData.posts[ i ] ]
                            = facade.Application.posts[ newData.posts[ i ] ];
                    }
                }
//                
//                // Render
                facade.expandPosts( View );
            },
            function () {

                facade.Application.msg( "Count`t get post list for branch: " + facade.id );

            },
            {
                parentPostId  : this.postId
            }
        );        
    },    
    branchExist : function ( postId )
    {
        for (i in this.branches)
        {
            if (this.branches[i].postId == postId)
            {
                return this.branches[i];
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
        for ( id in this.Application.branches )
        {
            if (this.Application.branches[id].parentBranchId == parentId)
            {   
                this.removeAfterBranches( this.Application.branches[id].id );
                this.removeAfter( this.Application.branches[id].id );
                $("article[data-id='"+ this.Application.branches[id].id +"']").remove();
            }
            
        }
    }
}

