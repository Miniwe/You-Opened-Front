
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  arguments.callee = arguments.callee.caller;  
  if(this.console) console.log( Array.prototype.slice.call(arguments) );
};
// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();)b[a]=b[a]||c})(window.console=window.console||{});


// place any jQuery/helper plugins in here, instead of separate, slower script files.


function parseQueryFormatData(data)
{
    var arData = data.split("&");
    var objData = {};
    var tmp = '';
    for (var i=0; i<arData.length; i++)
    {
        tmp = arData[i].split("=");
        objData[tmp[0]] = tmp[1];
    }
    return objData;
}
  
function extend(Child, Parent) {
    var F = function() { };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
}
  
  
Array.prototype.filterByValue = function(fun /*, thisp*/)
{
    var len = this.length;
    if (typeof fun != "function")
        throw new TypeError();

    var res = new Array();
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
        if (i in this)
        {
            var val = this[i]; // in case fun mutates this
            if (fun.call(thisp, val, i, this, arguments[1]))
                res.push(val);
        }
    }

    return res;
};
  
function getById(element, index, array, sval)
{
    return (element.id == sval);
}
   
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function getIds (str)
{
    
    var result = str.match(/(\(\d+\))+/g);
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

function formatDate (indate)
{
    var outdate = indate;
//    outdate = Math.round(outdate);
    var d = new Date();
    d.setTime(outdate * 1000);
    
    return d.toLocaleString(); // + " - " + outdate;
}

/*
 *  Библиотечканя функция конвертации массива данных HTML-формы в объект
 *  @param formArray @todo describe type
 *  @return object
 */
function formArrayToData ( formArray ) 
{
    var out = {};
    for (i in formArray)
    {
        out[formArray[i].name] = formArray[i].value;
    }

    return out;
};

