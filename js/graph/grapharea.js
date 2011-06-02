const NORMAL = 0;
const HOVER = 1;
const DRAG  = 2;
const HIGHLIGHT = 3;

/* Graph Area
 */

function GraphArea( holder )
{
    this.holder  = holder;

    if (!document.getElementById(this.holder))
    {
        alert('Holder not found');
        return false;
    }

    var canvas = document.getElementById(this.holder);

    if (Modernizr.canvas)
    {
        this.ctx = canvas.getContext('2d');
    }
    else
    {
        alert('Canvas context not created');
        return false;
    }


    this.width   = $("#"+holder).width();
    this.height  = $("#"+holder).height();

    this.cPos   = {x:-1, y:-1};

    var userEvents  = [];
    var gameLogic  = [];
    var drawGraph  = [];

    this.clear = function () {
//        console.log('clear');
        this.ctx.clearRect(0,0, this.width, this.height);
	this.ctx.beginPath();
    }; // /clear
    
    this.update = function () {
        var _ga = this;
        var scope = this || window;
        if (this.ctx)
        {
            userEvents.forEach(
                function(el) {
                    el.call(scope);
                }
            );
            gameLogic.forEach(
                function(el) {
                    el.call(scope);
                }
            );
            this.clear(); // clear or save state graph area before update
            drawGraph.forEach(
                function(el) {
                    el.call(scope);
                }
            );

        }
        setTimeout(function(){
            _ga.update();
        }, 10);
    }; // /update
    
    this.setPos = function(pos) {
        this.cPos.x = pos.x;
        this.cPos.y = pos.y;
    }; // / setPos
    
    this.subscribe = function(sa, fn) {
        this.unsubscribe(sa, fn);
        if ('userEvents' == sa)
        {
            userEvents.push(fn);
        } else if ('drawGraph' == sa)
        {
            drawGraph.push(fn);
        } else if ('gameLogic' == sa)
        {
            gameLogic.push(fn);
        }
    }; // /subscribe
    
    this.unsubscribe = function(sa, fn) {
        if ('userEvents' == sa)
        {
            userEvents = userEvents.filter(
                function(el) {
                    if ( el !== fn ) {
                        return el;
                    }
                }
            );
        } else if ('drawGraph' == sa)
        {
            drawGraph = drawGraph.filter(
                function(el) {
                    if ( el !== fn ) {
                        return el;
                    }
                }
            );
        } else if ('gameLogic' == sa)
        {
            gameLogic = gameLogic.filter(
                function(el) {
                    if ( el !== fn ) {
                        return el;
                    }
                }
            );
        }
    }; // /unsubscribe

    this.gradient = function (x, y, w, h, steps) {
        var gr = this.ctx.createLinearGradient(x, y, w, h);
        for (key in steps ){
            gr.addColorStop(parseFloat(key), steps[key]);
        };
        return gr;
    }
    
    this.update();

}

/*
 * Library Functions
 */

function inBoundCircle (cPos, tc)
{
    return ( Math.pow(cPos.x-tc.x, 2) + Math.pow(cPos.y - tc.y,2)
            < Math.pow(tc.r, 2) );
}


function extend(Child, Parent) {
	var F = function() { };
	F.prototype = Parent.prototype;
	Child.prototype = new F();
	Child.prototype.constructor = Child;
	Child.superclass = Parent.prototype;
}

/**
 * HSV to RGB color conversion
 *
 * H runs from 0 to 360 degrees
 * S and V run from 0 to 100
 * 
 * Ported from the excellent java algorithm by Eugene Vishnevsky at:
 * http://www.cs.rit.edu/~ncs/color/t_convert.html
 */


function hsvToRgb(h, s, v) {
    var r, g, b;
    var i;
    var f, p, q, t;

    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));

    // We accept saturation and value arguments from 0 to 100 because that's
    // how Photoshop represents those values. Internally, however, the
    // saturation and value are calculated from a range of 0 to 1. We make
    // That conversion here.
    s /= 100;
    v /= 100;

    if(s == 0) {
            // Achromatic (grey)
            r = g = b = v;
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));

    switch(i) {
            case 0:
                    r = v;
                    g = t;
                    b = p;
                    break;

            case 1:
                    r = q;
                    g = v;
                    b = p;
                    break;

            case 2:
                    r = p;
                    g = v;
                    b = t;
                    break;

            case 3:
                    r = p;
                    g = q;
                    b = v;
                    break;

            case 4:
                    r = t;
                    g = p;
                    b = v;
                    break;

            default: // case 5:
                    r = v;
                    g = p;
                    b = q;
    }

    this.color = {r:Math.round(r * 255), g:Math.round(g * 255), b:Math.round(b * 255)};
    
    this.rgb = function ()
    {
        return this.color;
    }
    this.rgba = function (a)
    {
        this.color.a = a;
        return this.color;
    }
    this.rgbStr = function ()
    {
        var str = "rgb(";
        str += this.color.r;
        str += ",";
        str += this.color.g;
        str += ",";
        str += this.color.b;
        str += ")";
        return str; 
    }
    this.rgbaStr = function (a)
    {
        var str = "rgb(";
        str += this.color.r;
        str += ",";
        str += this.color.g;
        str += ",";
        str += this.color.b;
        str += ",";
        str += a;
        str += ")";
        return str;
    }
    
}