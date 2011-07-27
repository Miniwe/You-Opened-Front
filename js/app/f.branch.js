/* 
 * BraNch
 */

function Branch (Application, id, data) 
{
    
    Branch.superclass.constructor.call( this );

    this.Application = Application;
  
    this.id = id;
    this.postId = data.PostId;
    this.post = this.Application.posts[this.postId];
  
    this.keys = {};
    this.posts = {};
    
    (this.update = function (data) {
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
    openFacade : function ( View)
    {
        this.expandKeys(); 
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
    expandKeys : function ()
    {
        for (i in this.keys)
        {
            if (!this.keys[i]) continue; 
            // @render key here
            
        };

    }
}

