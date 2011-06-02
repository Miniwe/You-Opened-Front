function HistoryGraph ( holder ) {
    HistoryGraph.superclass.constructor.call(this, holder);
    this.posts = {};
    this.postsCount = 0;
    this.maxRating = 0;
    this.maxSocialrating = 0;
    this.maxRatingHeight = 0;
    this.maxRatingHeightCoef = 1;
}

extend(HistoryGraph, GraphArea);

HistoryGraph.prototype = {
    init : function ()
    {
        var canvas = document.getElementById(this.holder);
        
        canvas.width = $("#"+this.holder).width();
        canvas.height = $("#"+this.holder).height();
        
        this.width   = canvas.width;
        this.height  = canvas.height;

    },
    addData : function ( data ) {
        this.posts = data;
        
        this.postsCount = 0;
        for (i in this.posts)
        {
            this.maxRating = Math.max(this.maxRating, this.posts[i].rating);
            this.maxSocialrating = Math.max(this.maxSocialrating, this.posts[i].socialrating);
            
            this.maxRatingHeight = Math.max(this.maxRatingHeight, this.posts[i].rating + this.posts[i].socialrating);
            this.postsCount++;
        }
        
        this.maxRatingHeightCoef = this.height / this.maxRatingHeight;
    },
    drawGrid : function ( ) {
        var offset = {
            x: this.postsCount,
            y: this.postsCount
        },
            rowHeight = this.height / offset.y,
            colWidth  = this.width / offset.x,
            gridColor = "#222222";
        
        this.ctx.beginPath();
        for (var x = 0; x < this.width; x += colWidth) {
          this.ctx.moveTo(x, 0);
          this.ctx.lineTo(x, this.height);
        }            
        for (var y = 0; y < this.height; y += rowHeight) {
          var y1 = y;  
//          y1 = Math.log(y) * 20
          this.ctx.moveTo(0, y1);
          this.ctx.lineTo(this.width, y1);
        }            
        
        this.ctx.strokeStyle = gridColor;
        this.ctx.stroke();
        
    },
    draw : function ( ) {
        
        var offset = {
            x: this.postsCount,
            y: this.postsCount
        },
            rowHeight = this.height / offset.y,
            colWidth  = this.width / offset.x,
            gridColor = "#222222";

        var cnt = 0;
        
        for (i in this.posts)
        {
            var x1 = cnt * colWidth;
            var x2 = colWidth;
            var height1 = this.posts[i].rating * this.maxRatingHeightCoef;
            var height2 = this.posts[i].socialrating * this.maxRatingHeightCoef;

            this.ctx.fillStyle = "#104968"; 
            this.ctx.fillRect(x1 + 0.5, this.height - height1+0.5, x2 - 1, height1 - 1); 
            
            this.ctx.fillStyle = "#1c86be"; 
            this.ctx.fillRect(x1 + 0.5, this.height - height1 - height2+0.5, x2 - 1, height2 - 1); 
            
            cnt ++;
            
        }
    },
    startGraph : function ()
    {
//        this.subscribe('userEvents', this.checkMousePos);
//        this.subscribe('gameLogic',  this.resetTop);
        this.subscribe('drawGraph',  this.drawGrid);
        this.subscribe('drawGraph',  this.draw);
    },
    stopGraph : function ()
    {
//        this.unsubscribe('userEvents', this.checkMousePos);
//        this.unsubscribe('gameLogic',  this.changeOffset);
//        this.unsubscribe('drawGraph',  this.drawPosts);
        
    }
}
