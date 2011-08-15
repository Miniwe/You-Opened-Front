/* 
 * Parent Class
 * 
 */

function Facade ()
{
    
    
    this.removeAfterPosts = function ( parentId )
    {
        $("article[data-parent='"+ parentId +"']").remove();
    };
    
    this.removeAfter = function ( parentId )
    {
        
        var facade  = this ;
        $.each($("*[data-parent='" + parentId + "']"), function(i, el){
            facade.removeAfter($(el).attr("data-id"));
            $(el).remove();
        });

    };
    
    this.renderSelf = function (el, tmpl, mode, parentId)
    {
        var View = $(document.body);
        
        this.parentViewId = parentId;
        
        this.zIndex = parseInt($(el)[0].style.zIndex,10) - 10 || 10;
        
        switch (mode)
        {
            case "appendTo":
                View = $.tmpl(tmpl, this).appendTo(el);
                break;
            
            case "prependTo":
                View = $.tmpl(tmpl, this).prependTo(el);
                break;
            
            case "insertAfter":
                View = $.tmpl(tmpl, this).insertAfter(el).slideDown(400);
                break;
            
            case "insertBefore":
                View = $.tmpl(tmpl, this).insertBefore(el).slideDown(400);
                break;
            
            case "prepend":
                View = $.tmpl(tmpl, this).prepend(el).slideDown(400);
                break;
            
            default:
                this.Application.msg("Incorrect render mode for " + tmpl);
        }
        
        View.css({
           "z-index": this.zIndex 
        });
        
        return View;
    };
    
}
