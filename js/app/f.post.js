/* 
 * Post 
 */
function Post (Application, id, data)
{
    Post.superclass.constructor.call( this );
    
    this.Application     = Application;
  
    this.id              = id;
    this.parentPostId    = data.ParentPostId;
    this.authorId        = data.AuthorId;
  
    this.createTime      =  data.CreateTime;
    this.createTimeF     = formatDate(data.createTime);
    
    this.text            = data.Text;
    
    this.posts           = {};
    
    (this.update = function ( data )
    {
        this.relevantWeight = data.RelevantWeight;
        
    }).call(this, data);
}
extend(Post, Facade);

Post.prototype = {
    openFacade : function ( View )
    {
        this.loadChilds( View );        
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
    },
    loadChilds : function ( View )
    {
        var facade = this;
        this.Application.ajaxRequest('/Slice.json',
            function ( response ) {
                
                facade.removeAfter ( facade.id );
                
                var newData = this.parseResponseData(response);

                for (var i= newData.posts.length; i--; )
                {
                    if (facade.Application.posts[newData.posts[i]].parentPostId == facade.id)
                    {
                        facade.posts[newData.posts[i]]
                        = facade.Application.posts[newData.posts[i]];

                    }
                }

                // Render
                facade.expandPosts( View );
            },
            function () {

                facade.Application.msg("Count`t get post list for post: " + facade.id);

            },
            {
                parentPostId  : this.id
            }
        );        
    },
    expandPosts : function ( View )
    {
        
        for (i in this.posts)
        {
            // @render key here
            this.posts[i].render(View, "post", "insertAfter", this.id);            
        };

    },
};

