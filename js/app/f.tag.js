/* 
 * Tag
 */

function Tag (Application, id, data)
{
    
    Tag.superclass.constructor.call( this );
  
    this.Application = Application;
  
    this.id = id;
    
    this.entryRating = 0;
   
    (this.update = function ( data )
    {
        this.asText = data.AsText;
        
    }).call(this, data);
}

extend(Tag, Facade);

Tag.prototype = {
    setEntryRating : function ( EntryRating ) {
        this.EntryRating = EntryRating;
    }
};



