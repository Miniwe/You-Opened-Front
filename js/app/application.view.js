
var ApplicationView = function ( Application )
{
    this.Application = Application;
};


ApplicationView.prototype = {
    clearMain : function ()
    {
        $("#main").find("*").remove();
    },
    attachBehavior : function ()
    {
        this.searchFormEvents();
    },
    searchFormEvents : function ()
    {
        var Application = this.Application;
        $("#search-form").submit( function ( ) {
            
            var marker = new Marker( Application );
            marker.setName( $("#search-field").val() );
            marker.addParams( {
                'query' : $("#search-field").val()
            } );
            
            marker.setAction ( function ( newData ) {
                this.Application.msg('action of marker', 'console');
                this.addFragments( newData );
                this.makeActive();
            } );

            Application.markers.push( marker );

            marker.makeRequest();
            
            return false;
        } );
    }
}

