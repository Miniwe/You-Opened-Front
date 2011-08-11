/*
 *  (function($) {
          
    function alignArticles ( )
    {
        var curArticle = null,
        pOffset    = 0,
        gOffset    = 0,
        next       = null,
        nOffset    = 0,
        tmpTop     = 0;
                
        var 
        sT = $(document.body).scrollTop(),
        activeArticle = $("article.active"),
        activeParents = getParentsList(activeArticle.attr("data-id"));
                    
        if ( !activeArticle.length )
        {
            return false;
        }
                    
        // align before
        for ( i = activeParents.list.length; i--; )
        {
            curArticle = $("article[data-id="+ activeParents.list[i] +"]");
                    
            pOffset = getParentsList(activeParents.list[i]).offset;
            gOffset = getPrevHeights(activeParents.list[i]).offset; 
                    
            if (gOffset < sT + pOffset)
            {
                tmpTop = pOffset;
                curArticle
                .addClass("float");
                        
                $(".replacement").remove();
                
                $(curArticle)
                .after('<div class="replacement" \n\
                                        style="height:'+$(curArticle).outerHeight(true)+'px">\n\
                                   </div>'
                    );
            }
            else
            {
                $(curArticle).next(".replacement").remove();
                curArticle
                .removeClass("float");

            }
                    
            next = $(curArticle).nextAll("article[data-parent="+ $(curArticle).attr("data-parent") +"]").first();
            if (!next.length)
            {
                next = $("article[data-id="+ $(curArticle).attr("data-parent") +"]").first();
                next = $(next).nextAll("article[data-parent="+ $(next).attr("data-parent") +"]").first();
            }
                    
            if (next.length > 0)
            {
                nOffset = getPrevHeights(next.attr("data-id")).offset ; 
                if (pOffset + $(curArticle).outerHeight(true) > nOffset-sT)
                {
                    tmpTop = ( nOffset - sT - $(curArticle).outerHeight(true) );
                }
            }
                    
            $(curArticle).css({
                "top": tmpTop + "px"
                });
                    
        }
                
        return true;
    }
            
            
    
            
            function getPrevHeights (id)
            {
                var 
                    el = null,
                    result = {
                    list     : [],
                    offset : 0
                };
                
                    $.each(
                        $("article[data-id=" + id + "]").prevAll("article"),
                        function (i, el) {
                            result.list.push($(el).attr("data-id"));
                            result.offset += $(el).outerHeight(/*true*-/);
                        }
                    );
                    
                
                return result;
            } 
            
            function getParentsList (id)
            {
                var 
                    el = null,
                    result = {
                    list     : [],
                    offset : 0
                };
                
                    result.list.push(id);
                    
                    el = $("article[data-id=" + $("article[data-id=" + id + "]").attr("data-parent") + "]");
                    
                    while ( el.length )
                    {
                        result.list.push($(el).attr("data-id"));
                        
                        result.offset += el.outerHeight(true);
                        
                        el = $("article[data-id=" + el.attr("data-parent") + "]");
                        
                    }
                    
                    return  result;
            } 
             
            
    $(function() {
        $("article header").live("click", function(){
            var 
                sT = $(document.body).scrollTop(),
                curArticle = $(this).parents("article"),
                id = curArticle.attr("data-id");
                   
            $(".replacement").remove();
            
            $("article")
            .css({
                "margin-top": "none", 
                "top": "none"
            })
            .removeClass("active")
            .removeClass("float");
                 
            curArticle.addClass("active");
            
            $(document.body).animate({
                scrollTop: getPrevHeights(id).offset - getParentsList(id).offset
            }, 
            function(){
                alignArticles();
            }
            );

        });
    });
    
    $(window).bind("scroll", function() {
        alignArticles( );
    });
          
})(jQuery);
*/
(function($) {
    
    function alignArticles( sT )
    {
        var 
            curArticle = $("article.active");
                    
        if ( !curArticle.length )
        {
            return false;
        }
        var 
            oT = curArticle.offset().top;
        
        console.log(oT, sT);
        if ( oT < sT)
        {
            console.log('1');
            curArticle.
                    addClass('float');

            if ( curArticle.next(".replacement").length < 1)
            {
                console.log('3');
                curArticle
                    .after('<div class="replacement" \n\
                        style="height:' + curArticle .outerHeight(true) + 'px">\n\
                   </div>');
            }
        }
        else
        {
            console.log('2');
            curArticle.
                    removeClass('float');
            $(".replacement").remove();
        }

    }
    
    $(function() {
        $("article header").live("click", function(){
            var 
                sT = $(document.body).scrollTop(),
                curArticle = $(this).parents("article"),
                id = curArticle.attr("data-id");
                   
            $("article")
                .removeClass("active")
                .removeClass("float")
                .css({ "top": "none" });
                 
            curArticle.addClass("active");
            
            $(document.body).animate({
                scrollTop: curArticle.offset().top
            }, 
            function(){
                alignArticles( sT );
            }
            );

        });
    });
    
    $(window).bind("scroll", function() {
        alignArticles( $(document.body).scrollTop() );
    });
                    
})(jQuery);