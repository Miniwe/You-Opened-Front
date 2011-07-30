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
        this.expandBranches(View); 
        this.expandKeys(View); 
    },
    prepareRender : function()
    {
        return true;
    },
    render : function (el, tmpl, mode, parent)
    {
        this.prepareRender();
    
        var View = this.renderSelf (el, tmpl, mode, parent);
        var facade = this;
        
        this.drawNavGraph( View );

        View.find("header").click(function (){
            facade.openFacade( View );
        });
    
        return View;
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
        click  : function() {
            View.find("header").click();
        }
     }, this.prepareNavGraphData( View ));
     
     this.navGraph.startGraph();
        
    },
    prepareNavGraphData : function ( View )
    {
        var navData = [],
            facade = this;
        for (i in this.branches)
        {
            var curBranch = this.branches[i];
            navData.push({
                id     : this.branches[i].id,
                weight : this.branches[i].relevantWeight,
                click  : function() {
                    
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
        for (i in this.keys)
        {
            // @render key here
            this.keys[i].render(View, "key", "insertAfter", this.id);            
        };

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

