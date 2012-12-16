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
        R: 3 * paper.height
      }, options ) );
      this.pointer = 0;
      this.initBarrel();
      this._bindKB();
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
          width = this.paper.height * 0.8,
          height = this.paper.height * 0.8;
      
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
        ).transform([
          "r" + 
          -1 * angle + "," +
          this.options.x + "," +
          ( this.options.y + this.options.R )
        ]).attr( {
            stroke: "#000",
            "stroke-width": 2
          } );
        this._setSegmentBG( sector, this._getPicUrl( i ) );
        this.sectors.push( sector );
      }
    },
    
    _setSegmentBG: function( segment, bg ) {
      if ( bg == "" ) {
        segment.attr( "fill", "#FFF" );
        return;
      }
      segment.attr( "fill", "url(" + bg + ")" );
      var pattern = segment.pattern,
          bbox = segment.getBBox( 1 );
      Raphael.dollar(pattern, {patternTransform: "matrix(1,0,0,1,0,0) translate(" + bbox.x + "," + bbox.y + ")"});
    },
    
    _getNonAngle: function() {
      return this.options.angle / 15;
    },
    
    next: function() {
      if ( !is_empty( this.locked ) && this.locked ) {
        return;
      }
      if ( this.pointer >= this.options.pics.length - 1 ) {
        var self = this;
        this.rotateOn( -1 * this._getNonAngle(), 100, ">", function() {
          self.rotateOn( self._getNonAngle(), 100, "<>", function() {}, false );
        }, false );
        return;
      }
      this.pointer++;
      this.rotateOn( -1 * this.options.angle );
    },
    
    prev: function() {
      if ( !is_empty( this.locked ) && this.locked ) {
        return;
      }
      if ( this.pointer <= 0 ) {
        var self = this;
        this.rotateOn( this._getNonAngle(), 100, ">", function() {
          self.rotateOn( -1 * self._getNonAngle(), 100, "<>", function() {}, false );
        }, false );
        return;
      }
      this.pointer--;
      this.rotateOn( this.options.angle );
    },
    
    noRotate: function( angle ) {
      if ( !is_empty( this.locked ) && this.locked ) {
        return;
      }
      this.locked = true;
      var self = this;
    },
    
    _getPicUrl: function( index ) {
      var ix = -1 + index + this.pointer;
      return ( ix >= 0 ) ? ( is_empty( this.options.pics[ ix ] ) ? "" : this.options.pics[ ix ] ) : "";
    },
    
    rotateOn: function( angle, duration, easing, cb, is_complete ) {
      if ( !is_empty( this.locked ) && this.locked ) {
        return;
      }
      easing = easing || "<>";
      duration = duration || 500;
      cb = cb || function() {};
      is_complete = is_empty( is_complete ) ? true : is_complete;
      this.locked = true;
      var self = this,
      from_end = ( angle > 0 ),
      bound_ix = from_end ? ( this.sectors.length - 1 ) : 0,
      operators = from_end ? [ "unshift", "pop" ] : [ "push", "shift" ];
      
      this.sectors.each( function( sector, ix ) {
        var tr = sector.attr( "transform" ),
            rotation;
        tr.each( function( transform ) {
          if ( transform[ 0 ] == "r" ) {
            rotation = Array.clone( transform );
          }
        } );
        if ( !is_empty( rotation ) ) {
          var return_cb = ( ix !== bound_ix ) ? function() {} : function() {
                if ( is_complete ) {
                  rotation[ 1 ] += -1 * angle * ( self.options.sectors );
                  try {
                    if ( !is_empty( sector.pattern ) && !is_empty( sector.pattern.parentElement ) ) {
                      sector.pattern.parentElement.removeChild( sector.pattern );
                    }
                  } catch ( e ) {
                    console.log( e.message );
                  }
                  sector.attr( { transform: rotation } );
                  self._setSegmentBG( sector, self._getPicUrl( self.options.sectors - 1 - ix ) );
                  self.sectors[ operators[ 0 ] ]( self.sectors[ operators[ 1 ] ]() );
                }
                self.locked = false;
                cb.call();
              }
          rotation[ 1 ] += angle;
          sector.stop().animate( { transform: rotation }, duration, easing, return_cb );
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