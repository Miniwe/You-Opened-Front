/* 
 * HiStory
 */


var History = function ()
{
    var items = [];
    var currentIndex = -1;
          
    this.addItem = function ( item )
    {
        items.push( item );
        currentIndex = items.length - 1; 
        console.log('added', item );
    };
          
    this.getItem = function ( index )
    {
        if ( index != undefined) {
            return (items[index] != undefined) ? items[index] : false;
        }
              
        return items[ this.getCurentIndex() ];
    };
          
    this.getCurentIndex = function ( )
    {
        return currentIndex;
    };
          
    this.prev = function ()
    {
        var old = currentIndex;
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = 0;
        }
        if ( old == currentIndex ) {
            return false;
        }
              
        return true;
    };

    this.next = function ()
    {
        var old = currentIndex;
        currentIndex++;
        if (currentIndex > items.length - 1) {
            currentIndex = items.length - 1;
        }
        if (old == currentIndex) {
            return false;
        }
              
        return true;
    };

    this.process = function ( processFlag )
    {
        console.log( currentIndex, items );
        if ( processFlag ) {
            items[ currentIndex ].action();
        }
    };
};

