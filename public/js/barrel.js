;( function( W ) {
  
  var Barrel = new Class({
    
    Implements: [ Events, Options ],
    
    options: {
      angle: 30,
      sectors: 3,
      visible: true
    },
    
    initialize: function( options ) {
      
      var self = this;
      
      Raphael( 0, document.body.scrollTop, window.innerWidth, 1000, function() {
        self.paper = this;
        ( function() {
          
          this.setOptions( Object.merge( {
            x: this.paper.width / 2,
            y: this.paper.height / 2,
            R: 3 * this.paper.height
          }, options ) );
          
          this.pointer = 0;
          this._initTint();
          this._initBarrel();
          this._bindKB();
          
          this.is_visible = true;
          if ( !this.options.visible ) {
            this.is_visible = false;
            this.hide();
          }
        } ).call( self );
      } );
    },
    
    hide: function() {
      this.is_visible = false;
      this.hideTint();
      this.paper.canvas.style.display = "none";
    },
    
    show: function() {
      this.paper.canvas.style.top = ( document.body.scrollTop ) + "px";
      this.is_visible = true;
      var self = this;
      this.showTint( function() {
        self.paper.canvas.style.display = "block";
      } );
    },
    
    setCenter: function( x, y ) {
      this.options.x = x;
      this.options.y = y;
    },
    
    setRadius: function( R ) {
      this.options.R = R;
    },
    
    _initBarrel: function() {
      this.sectors = [];
      var angle0 = this.options.angle,
          angle = 0,
          width = this.paper.height * 0.8,
          height = this.paper.height * 0.8,
          self = this;
      
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
          stroke: null
        } ).click( function( e ) {
          if ( e.x < self.paper.width / 2 ) {
            self.prev();
          } else {
            self.next();
          }
        } )
        this._setSegmentBG( sector, this._getPicUrl( i ) );
        this.sectors.push( sector );
      }
    },
    
    getPointer: function() {
      return this.pointer;
    },
    
    setPointer: function( pointer ) {
      this.pointer = pointer;
      var self = this,
          ix = 0;
      this.sectors.each( function( sector ) {
        self._setSegmentBG( sector, self._getPicUrl( ix ) );
        ix++;
      } );
    },
    
    _setSegmentBG: function( segment, bg ) {
      if ( bg == "" ) {
        segment.attr( "fill", "#FFF" );
        return;
      }
      segment.attr( "fill", "url(" + bg + ")" );
      var pattern = segment.pattern,
          self = this;
      eve.once( bg + ".loaded", function() {
        if ( !is_empty( pattern ) ) {
          segment.attr( {
            width: pattern.width.baseVal.value,
            height: pattern.height.baseVal.value,
            x: self.paper.width / 2 - pattern.width.baseVal.value / 2
          });
          bbox = segment.getBBox( 1 );
          Raphael.dollar( pattern, { patternTransform: "matrix(1,0,0,1,0,0) translate(" + bbox.x + "," + bbox.y + ")" } );
        }
      } );
    },
    
    _getNonAngle: function() {
      return this.options.angle / 30;
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
      return ( ix >= 0 && !is_empty( this.options.pics ) ) ? ( is_empty( this.options.pics[ ix ] ) ? "" : this.options.pics[ ix ] ) : "";
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
          if ( rotation[ 1 ] == 0 ) {
            self.fireEvent( "select", sector );
          }
        };
      } );
    },
    
    _bindKB: function() {
      var self = this;
      document.addEvent( 'keydown', function( e ) {
        if ( self.is_visible ) {
          if ( !is_empty( e.key ) ) {
            if ( e.key == "right" ) {
              self.next.call( self );
            } else if ( e.key == "left" ) {
              self.prev.call( self );
            }
          }
        }
      } );
    },
    
    _initTint: function() {
      var self = this;
      this.tint = new Element( "div", {
        styles: {
          position: "fixed",
          top: 0,
          left: 0,
          opacity: 0.5,
          width: "100%",
          height: window.innerHeight,
          "background-color": "#000"
        },
        class: "hidden tint"
      } );
      this.close_button = new Element( "div", {
        class: "close-button hidden"
      } ).addEvent( "click", function() {
        self.hide();
      } );
      $("page").grab( this.tint );
      $(document.body).grab( this.close_button );
    },
    
    showTint: function( cb ) {
      each( [ this.close_button, this.tint ], function( el ) {
        el.removeClass( "hidden" ).addClass( "shown" );
      } );
      $("page").addClass( "blured" );
      try {
        window.setTimeout( cb, 500 );
      } catch ( e ) {
        console.log( e );
      }
    },
    
    hideTint: function( cb ) {
      each( [ this.close_button, this.tint ], function( el ) {
        el.removeClass( "shown" ).addClass( "hidden" );
      } );
      $("page").removeClass( "blured" );
      try {
        window.setTimeout( cb, 500 );
      } catch ( e ) {}
    }
    
  });
  
  W.Barrel = Barrel;
  
} )( window );