/* 
 * Parent Class
 * 
 */

function Facade ()
{
    
    this.renderSelf = function (baseEl, tmpl, mode)
    {
        var View = $(document.body);
        
        switch (mode)
        {
            case "appendTo":
                View = $.tmpl(tmpl, this).appendTo(baseEl);
                break;
            
            case "prependTo":
                View = $.tmpl(tmpl, this).prependTo(baseEl);
                break;
            
            case "insertAfter":
                View = $.tmpl(tmpl, this).css({"opacity":"0"}).insertAfter(baseEl).animate({"opacity":"1"},400, function (){
                    // @todo проверить - почему то стиль не убирается
                    $(this).css({"opacity":""});
                } );
                break;
            
            case "insertBefore":
                View = $.tmpl(tmpl, this).insertBefore(baseEl);
                break;
            
            case "prepend":
                View = $.tmpl(tmpl, this).prepend(baseEl);
                break;
            
            default:
                this.Application.msg("Incorrect render mode (" + mode + ") for " + tmpl);
                this.Application.showMessages( [ {
                        "class" : "error",
                        "name"  : "Facade",
                        "msg"   : "Couldn't render facade"
                } ] );
        }
        
        return View;
    };
    
}
