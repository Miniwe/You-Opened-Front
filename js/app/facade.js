/* 
 * Parent Class
 * 
 */

function Facade ()
{
    
    this.renderSelf = function (el, tmpl, mode, parent)
    {
        
        var View = $(document.body);
        
        this.parentViewId = parent;
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
        return View;
    };
    
}
