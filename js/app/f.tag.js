/* 
 * Tag
 */

function Tag (Application, data)
{
    
    Tag.superclass.constructor.call( this );
  
    this.Application = Application;
  
    this.id = data.id;
    this.wordids = [];
    this.words = {};
    this.wordString = "";
    this.color = "red";
    
    this.update = function (data)
    {
        this.name = "- no name -";
        this.socialrating = data.socialrating;
        this.defineColor (this.socialrating);
        this.wordids = [];
        this.words = {};
        for (var i=0, l=data.wordids.length; i<l; i++)
        {
            this.wordids.push(data.wordids[i]);
        }
        
    };

    this.update(data);
    
}

extend(Tag, Facade);

Tag.prototype = {
    defineColor: function (rating)
    {
        if (rating % 5 == 0)
        {
            this.color = "red";
        } else 
        if (rating % 4 == 0)
        {
            this.color = "yellow";
        } else 
        if (rating % 3 == 0)
        {
            this.color = "orange";
        } else 
        if (rating % 2 == 0)
        {
            this.color = "green";
        } else 
        if (rating % 1 == 0)
        {
            this.color = "blue";
        } else 
        {
            this.color = "";
        }    
    },
    parseWords : function (data)
    {
        var tmp = [];
        for (var i=0, l=this.wordids.length; i<l; i++)
        {
            var word = data.words.filterByValue(getById, this.wordids[i]);
              
            if (!word.length) continue;
              
            var id = word[0].id.toString();

            if (this.Application.words[id] == undefined)
            {
                this.Application.words[id] = new Word(word[0]);
            }
            else
            {
                this.Application.words[id].update(word[0]);
            }
              
            this.words[id] = this.Application.words[id];
            tmp.push(this.words[id].value);
        }
        
        this.wordString = tmp.join(" ");;
                
    }
};



