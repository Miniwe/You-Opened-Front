/* 
 * BraNch
 */

function Branch (Application, id, data) 
{
    
    Branch.superclass.constructor.call( this );

    this.Application = Application;
  
    this.id = id;
    this.postId = data.PostId;
    this.parentBranchId    = data.ParentBranchId;
    this.post = this.Application.posts[this.postId];
  
    this.updateTime      =  data.UpdateTime;
    this.updateTimeF     = formatDate(data.updateTime);
  
    this.branches = {};
    this.keys     = {};
    this.posts    = {};
    
    this.navGraph = null;
    
    (this.update = function (data) {
        this.relevantWeight = data.RelevantWeight;
        
        this.keysCount = data.KeyPostIds.length;
        this.postsCount = data.PostCount;
        
        this.keyPostIds = data.KeyPostIds;
        
        this.keys = {};
        for ( i = this.keyPostIds.length; i--; )
        {
            this.keys[this.keyPostIds[i]] = Application.posts[this.keyPostIds[i]];
        }
        
    }).call(this, data);
  
//  return this;
}

extend(Branch, Facade);

Branch.prototype = {
    openFacade : function (View)
    {
        this.hideInnerKeys(View); 
        this.removeAfter ( this.id );
//        this.expandBranches(View); 
        this.expandKeys(View); 
    },
    prepareRender : function()
    {
        return true;
    },
    render : function (el, tmpl, mode, parent)
    {
        this.prepareRender ( );
    
        var View = this.renderSelf (el, tmpl, mode, parent);
        
        this.drawNavGraph ( View );

        this.attachBehavior ( View );
        
        return View;
    },
    attachBehavior : function ( View )
    {
        var facade = this;
        
        View.find("header").click(function (){
            facade.openFacade( View );
        });
        
        View.find(".collapse_control").click(function(){
           
           var control = $(this);
           control.toggleClass("opened");
           
           if (control.hasClass("opened"))
           {
               View.find("header").click();
           }
           else
           {
                facade.showInnerKeys(View); 
                facade.removeAfter ( facade.id );
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
               
               facade.Application.addReplyFormBehavior( View );
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
            navData.push({
                id     : this.branches[i].id,
                weight : this.branches[i].relevantWeight,
                click  : function( id ) {
                    
                    var curBranch = facade.Application.branches[id];
                    
                    facade.hideInnerKeys(View); 
                    facade.removeAfter ( facade.id );
                    
                    var newView = curBranch.render(View, 'branch', 'insertAfter', facade.id).addClass("lighter");
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
    branchExist : function (postId)
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
    expandBranches: function ( View )
    {
        for (i in this.branches)
        {
            // @render subbranch here
            this.branches[i].render(View, 'branch', 'insertAfter', this.id).addClass("lighter");
            
        };

    }
}

