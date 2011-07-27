/* 
 * Post 
 */
function Post (Application, id, data)
{
    Post.superclass.constructor.call( this );
    
    this.Application     = Application;
  
    this.id              = id;
    this.parentPostId    = data.parentPostId;
    this.authorId        = data.AuthorId;
  
    this.createTime      =  data.CreateTime;
    this.createTimeF     = formatDate(data.createTime);
    
    this.text            = data.Text;
    
    (this.update = function ( data )
    {
        this.relevantWeight = data.RelevantWeight;
        
    }).call(this, data);
}
extend(Post, Facade);

Post.prototype = {
    openFacade : function ( View )
    {
    },
    prepareRender : function()
    {
    },
    render : function (el, tmpl, mode, parent)
    {
  
        this.prepareRender();

        var View = this.renderSelf(el, tmpl, mode, parent)
        var facade = this;
        
        View.find("header").click(function (){
            facade.openFacade( View );
        });
        
        return View;
    }
};

