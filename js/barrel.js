;( function( W ) {
  
  var Barrel = new Class({
    
    Implements: [ Events, Options ],
    
    options: {
      angle: 30,
      sectors: 3
    },
    
    initialize: function( paper, options ) {
      this.paper = paper;
      this.setOptions( Object.merge( {
        x: paper.width / 2,
        y: paper.height / 2,
        R: 2 * paper.height
      }, options ) );
      this.initBarrel();
      this._bindKB();
      this.pointer = 0;
    },
    
    setCenter: function( x, y ) {
      this.options.x = x;
      this.options.y = y;
    },
    
    setRadius: function( R ) {
      this.options.R = R;
    },
    
    initBarrel: function() {
      this.sectors = [];
      var angle0 = this.options.angle,
          angle = 0,
          width = this.paper.height * 0.75,
          height = this.paper.height * 0.75;
      
      this.paper.circle( this.options.x, this.options.y, 10 ).attr( { fill: "#F00" } );
      
      this.sectors = [];
      
      for ( var i = 0; i < this.options.sectors; i++ ) {
        angle = angle0 -1 * this.options.angle * i,
        tx = Math.round( this.options.R * Math.cos( Raphael.rad( 90 + angle ) ) ),
        ty = -1 * Math.round( this.options.R * Math.sin( Raphael.rad( 90 + angle ) ) ),
        sector = this.paper.rect(
          this.options.x - width / 2,
          this.options.y - height / 2,
          width,
          height
        ).attr( {
          stroke: "#000",
          "stroke-width": 2
        } ).transform([
          "r" + 
          -1 * angle + "," +
          this.options.x + "," +
          ( this.options.y + this.options.R )
        ]);
        this.sectors.push( sector );
      }
    },
    
    next: function() {
      if ( !is_empty( this.locked ) && this.locked ) {
        return;
      }
      if ( this.pointer >= this.options.pics.length - 1 ) {
        // FIX ME
        return;
        // END OF FIX ME
      }
      this.pointer++;
      this.rotateOn( -1 * this.options.angle );
    },
    
    prev: function() {
      if ( !is_empty( this.locked ) && this.locked ) {
        return;
      }
      if ( this.pointer <= 0 ) {
        // FIX ME
        return;
        // END OF FIX ME
      }
      this.pointer--;
      this.rotateOn( this.options.angle );
    },
    
    rotateOn: function( angle ) {
      if ( !is_empty( this.locked ) && this.locked ) {
        return;
      }
      this.locked = true
      var self = this;
      this.sectors.each( function( sector, ix ) {
        var tr = sector.attr( "transform" ),
            rotation;
        tr.each( function( transform ) {
          if ( transform[ 0 ] == "r" ) {
            rotation = Array.clone( transform );
          }
        } );
        if ( !is_empty( rotation ) ) {
          var from_end = ( angle > 0 ),
              bound_ix = from_end ? ( self.sectors.length - 1 ) : 0,
              operators = from_end ? [ "unshift", "pop" ] : [ "push", "shift" ],
              cb = ( ix !== bound_ix ) ? function() {} : function() {
                rotation[ 1 ] += -1 * angle * ( self.options.sectors );
                sector.attr( "transform", rotation );
                self.sectors[ operators[ 0 ] ]( self.sectors[ operators[ 1 ] ]() );
                self.locked = false;
              }
          rotation[ 1 ] += angle;
          sector.animate( { transform: rotation }, 500, "<>", cb );
        };
      } );
    },
    
    _bindKB: function() {
      var self = this;
      document.addEvent( 'keydown', function( e ) {
        if ( !is_empty( e.key ) ) {
          if ( e.key == "right" ) {
            self.next.call( self );
          } else if ( e.key == "left" ) {
            self.prev.call( self );
          }
        }
      } );
    },
    
    _preloadPic: function( pic_url ) {
      
    }
    
  });
  
  W.Barrel = Barrel;
  
} )( window );