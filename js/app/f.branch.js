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

        View.find("header").click(function (){
            facade.openFacade( View );
        });
    
        return View;
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

