function NavGraph ( holder ) {
    NavGraph.superclass.constructor.call(this, holder);
    
    this.parentBranch = {};
    this.branchesData = [];
    this.branchesWeightSumm = 0;
    this.branchesWeightSummCoef = 0;

    this.maxRating = 0;
    this.maxRatingCoef = 0;
    
    this.colors = [
        "#FFC600", "#C0A02F", "#A78200", "#FFDD68", "#FFF0BB", "#59FF00", "#62C02F", "#3AA700", "#9CFF68", "#D2FFBB", "#FF0037", "#C02F4E", "#A70024", "#FF6888", "#FFBBC9", "#1700FF", "#3C2FC0", "#0F00A7", "#7568FF", "#C1BBFF"
    ];      
    
    
   
}

extend(NavGraph, GraphArea);

NavGraph.prototype = {
    init : function ()
    {
        var canvas = document.getElementById(this.holder);
        
        canvas.width = $("#"+this.holder).width();
        canvas.height = $("#"+this.holder).height();
        
        this.width   = canvas.width;
        this.height  = canvas.height;

    },
    addData : function ( parentBranch, data ) {
        this.parentBranch = parentBranch;
        this.branchesData = data;
        
        for (i = this.branchesData.length; i--; )
        {
            this.branchesWeightSumm += parseFloat(this.branchesData[i].weight);
        }
        
        this.branchesWeightSummCoef = Math.PI * 2 / this.branchesWeightSumm;
    },
    draw : function ( ) {
        var partsCount = this.branchesData.length;
        
        var delta = this.branchesWeightSummCoef;
        
        var curAngle = 0;
        var prevAngle = 0;
        var deltaLit = 0.1;

        for (var i=this.branchesData.length; i--; )
        {
            curAngle = this.branchesData[i].weight * delta;
            
            this.ctx.beginPath();
            this.ctx.lineWidth   = 1;
            this.ctx.arc(40, 40, 30, prevAngle , prevAngle + curAngle - deltaLit , false);
            this.ctx.arc(40, 40, 15, prevAngle + curAngle - deltaLit , prevAngle , true);
            this.ctx.closePath();
            this.ctx.fillStyle   = this.colors[ i*i ];
            this.ctx.fill();
            
            prevAngle += curAngle;
        }
        
    },
    startGraph : function ()
    {
//        this.subscribe('userEvents', this.checkMousePos);
//        this.subscribe('gameLogic',  this.resetTop);
        this.subscribe('drawGraph',  this.draw);
    },
    stopGraph : function ()
    {
//        this.unsubscribe('userEvents', this.checkMousePos);
//        this.unsubscribe('gameLogic',  this.changeOffset);
//        this.unsubscribe('drawGraph',  this.drawPosts);
        
    }
}
