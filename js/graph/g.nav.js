function NavGraph ( holder ) {
    NavGraph.superclass.constructor.call(this, holder);
    
    this.activeBranch = undefined;
    this.hoverBranch  = undefined;
    this.highlightBranch = undefined;
    
    this.parentBranch = {};
    this.branchesData = [];
    
    this.branchesWeightSumm = 0;
    this.branchesWeightSummCoef = 0;

    this.postCountSumm = 0;
    this.postCountSummCoef = 0;

    this.radius = 10;
    this.subRadius = 10;
    this.centerRadius = 10;
   
}

extend(NavGraph, GraphArea);

NavGraph.prototype = {
    init : function ( ) {
        var canvas = document.getElementById( this.holder );
        var holder = $( "#"+this.holder );
        var navGraph = this;
        
        canvas.width   = holder.width( );
        canvas.height  = holder.height( );
        
        this.width   = canvas.width;
        this.height  = canvas.height;
        
        this.radius = this.width / 10;
        this.subRadius = this.radius * 3.5;
        this.centerRadius = this.radius;
        
        holder.mousemove( function( event ) {
            var offset = $(this).offset( );

            navGraph.setPos( {
                x: event.pageX - offset.left ,
                y: event.pageY - offset.top
            } );
        } );
        
        holder.click( function ( event ) {
            if ( navGraph.hoverBranch != undefined ) {
                navGraph.hoverBranch.click( navGraph.hoverBranch.id );
                navGraph.activeBranch = navGraph.hoverBranch;
            }
        } );

    },
    addData : function ( parentBranch, data ) {
        this.parentBranch = parentBranch;
        this.branchesData = data;
//        console.log(this.parentBranch, this.branchesData);
        
        this.branchesWeightSumm = 0;
        this.postCountSumm = 0;
        
        for ( var i = this.branchesData.length; i--; )
        {
            this.branchesWeightSumm += parseFloat( this.branchesData[i].weight );
            this.postCountSumm += parseFloat( this.branchesData[i].postCount );
        }
        
        this.postCountSummCoef = Math.PI * 2 / ( this.postCountSumm ? this.postCountSumm : 1 );
        
        this.branchesWeightSummCoef = this.radius / ( this.branchesWeightSumm ? this.branchesWeightSumm : 1 ) ;
    },
    draw : function ( ) {
        
        var partsCount = this.branchesData.length;
        
        var deltaR = this.branchesWeightSummCoef;
        var deltaC = this.postCountSummCoef;
        
        var curAngle = 0;
        var curRadius = 0;
        var prevAngle = 0;
        var deltaLit = 0.1;
        
        this.ctx.beginPath( );
        this.ctx.arc(this.width / 2, this.height / 2, this.centerRadius, 0, 2 * Math.PI, false);
        this.ctx.closePath( );
        this.ctx.fillStyle = this.parentBranch.color;
        this.ctx.fill();
        
        if ( this.ctx.isPointInPath( this.cPos.x, this.cPos.y ) ) {
            this.ctx.strokeStyle = "fff";
            this.ctx.lineWidth = 2;this.ctx.stroke( );
            this.hoverBranch = this.parentBranch;
        }
        
        if ( this.activeBranch && this.activeBranch.id == this.parentBranch.id ) {
            this.ctx.strokeStyle = "#000";
            this.ctx.lineWidth = 2; this.ctx.stroke();
        }
        
        if ( this.highlightBranch == this.parentBranch.id ) {
            this.ctx.strokeStyle = "#f00";
            this.ctx.lineWidth = 2; this.ctx.stroke( );
        }
        
        for (var i=this.branchesData.length; i--; )
        {
            curAngle = this.branchesData[i].postCount * deltaC;
            
            curRadius = this.branchesData[i].weight * deltaR;
//            curRadius = this.radius;
            
            this.ctx.beginPath();
            this.ctx.arc(this.width / 2, this.height / 2, this.subRadius + curRadius, prevAngle , prevAngle + curAngle - deltaLit , false);
            this.ctx.arc(this.width / 2, this.height / 2, this.centerRadius + 4 , prevAngle + curAngle - deltaLit , prevAngle , true);
            this.ctx.closePath();
            
            if ( this.branchesData[i].weight > 0) {
                this.ctx.fillStyle   = this.branchesData[i].color;
            }
            else {
                this.ctx.fillStyle   = "#cccccc";
            }
            this.ctx.fill();
            
            if (this.ctx.isPointInPath(this.cPos.x, this.cPos.y))
            {
                this.ctx.strokeStyle = this.ctx.fillStyle;
                this.ctx.lineWidth = 3;this.ctx.stroke();
                
                this.ctx.strokeStyle = "#fff";
                this.ctx.lineWidth = 2;this.ctx.stroke();
                this.hoverBranch = this.branchesData[i];
            }
            
            if (this.activeBranch && this.activeBranch.id == this.branchesData[i].id)
            {
                this.ctx.strokeStyle = "#000";
                this.ctx.lineWidth = 3; this.ctx.stroke();
            }
            if (this.highlightBranch == this.branchesData[i].id)
            {
                this.ctx.strokeStyle = "#f00";
                this.ctx.lineWidth = 2; this.ctx.stroke();
            }
            prevAngle += curAngle;
            
        }
        if (this.activeBranch)
        {
            this.drawTriControl( );
        }
        
    },
    drawTriControl : function ( )
    {
        var width = 30,
            height = 20,
            padding = 10;
        this.ctx.beginPath();
        this.ctx.moveTo((this.width - width)/2 + width/2, this.height - padding);	
        this.ctx.lineTo((this.width - width)/2 - width/2 + width/2, this.height - padding - height);	
        this.ctx.lineTo((this.width - width)/2 + width/2 + width/2, this.height - padding - height);	
        this.ctx.lineTo((this.width - width)/2 + width/2, this.height - padding);	
        this.ctx.closePath();      
        
        this.ctx.fillStyle   = "444ff4"; this.ctx.fill();
        this.ctx.strokeStyle = "#8ff888";
        this.ctx.lineWidth = 2; this.ctx.stroke();        
    },
    startGraph : function ( )
    {
//        this.subscribe('userEvents', this.checkMousePos);
//        this.subscribe('gameLogic',  this.resetTop);
        this.subscribe( 'drawGraph',  this.draw );
    },
    stopGraph : function ( )
    {
//        this.unsubscribe('userEvents', this.checkMousePos);
//        this.unsubscribe('gameLogic',  this.changeOffset);
//        this.unsubscribe('drawGraph',  this.drawPosts);
        
    }
}
