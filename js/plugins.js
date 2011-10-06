
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console) {
    arguments.callee = arguments.callee.caller;
    var newarr = [].slice.call(arguments);
    (typeof console.log === 'object' ? log.apply.call(console.log, console, newarr) : console.log.apply(console, newarr));
  }
};

// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());


// place any jQuery/helper plugins in here, instead of separate, slower script files.


function extend(Child, Parent) {
    var F = function() { };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
}

function formatDate ( indate )
{
    var d = new Date();
    d.setTime(indate * 1000);
    
    return d.format("dd, mmmm yyyy HH:MM");
}


function getIds (str)
{
    
    var result = str.match(/(\(s0_\d+\))+/g);
    if (result)
    {
        for (var i=0; i< result.length; i++)
        {
            result[i] = result[i].substr(1, result[i].length-2);
        }
        return result.join(",");        
    }
    else
    {
        return "";
    }
}



 
function getRandomInt(min, max)
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}