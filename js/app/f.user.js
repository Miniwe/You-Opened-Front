/* 
 * User
 */

function User (Application, id, data)
{
    User.superclass.constructor.call( this );

    this.Application = Application;
 
    this.id = id;
    
    (this.update = function ( data )
    {
        this.name = data.Name;
        
        this.avataruri = data.AvatarUri;
        
    }).call(this, data);
    
}

extend(User, Facade);

User.prototype = {
    /*
     * Обновление данных пользователя и соотвествующего состояния интерфейса 
     */
    userState : function ( )
    {
        
    }
};


