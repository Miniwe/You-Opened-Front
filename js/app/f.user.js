/* 
 * User
 */


function User (Application, data)
{
    User.superclass.constructor.call( this );

    this.Application = Application;
 
    this.id = data.id;
    
    this.pinned = []; 
    
    this.update = function (data)
    {
        this.name = data.name;
        
        this.avataruri = data.avataruri;
        
        this.parsePinnedData (data.actions);
        
        this.messagesCount = this.getActionValue(data.metadata.socialconnections.inputs, "Message", "count") || 0;
    };

    this.parsePinnedData = function ( actions )
    {
        this.pinned = [];
        for (i in actions)
        {
            if (actions[i].type == 'Pin')
            {
                this.pinned.push(actions[i].target.id);
            }
        }
    };

    this.update(data);
    
}

extend(User, Facade);


User.prototype = {
};


