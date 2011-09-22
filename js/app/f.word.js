/* 
 * Word
 */

function Word (data)
{
    Word.superclass.constructor.call( this );
    this.id = data.id;
    
    this.update = function (data)
    {
        this.value = data.value;
        this.socialrating = data.socialrating;
    };

    this.update(data);
    
}

extend(Word, Facade);

Word.prototype = {
};



