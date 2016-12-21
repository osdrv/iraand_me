;(function( w ) {
  var PLACEHOLDER = "%d";
  
  var ExPath = function() {
    this._initialize();
    var self = this;
  }
  
  ExPath.prototype = {
    _initialize: function() {
      this._path = "";
      this._is_finished = false;
      this._initModifiers();
    },
    _next: function() {
      if ( this._is_finished ) throw "ExPath is finished. Could not continue with modifying.";
      this._path += ( this._path.length ) ? " " : "";
    },
    _initModifiers: function() {
      var self = this;
      for ( var key in this._modifiers ) {
        if ( !this._modifiers.hasOwnProperty( key ) ) {
          continue;
        }
        (function( k ) {
          self[ k ] = function() {
            var v = self._modifiers[ k ];
            if ( v !== undefined ) {
              self._next();
              
              var dsl = ( typeof( v ) == "string" || v instanceof Array ) ? v : v.dsl,
                  cb = ( typeof( v ) == "object" && typeof( v.cb ) == "function" ) ? v.cb : null,
                  params = Array.prototype.slice.call( arguments ),
                  sub_path = "";
              
              if ( typeof( dsl ) == "string" ) {
                sub_path += dsl;
              } else if ( dsl instanceof Array ) {
                sub_path += dsl[ 0 ];
                dsl = dsl.slice( 1 );
              }
              
              while( params.length ) {
                if ( sub_path.search( PLACEHOLDER ) == -1 ) {
                  if ( ( dsl instanceof Array ) && dsl.length ) {
                    sub_path += dsl[ 0 ];
                    dsl = dsl.slice( 1 );
                  }
                }
                sub_path = sub_path.replace( PLACEHOLDER, params[ 0 ] );
                params = params.slice( 1 );
              }
            }
            
            this._path += sub_path;
            
            if ( typeof( cb ) == "function" ) {
              cb.call( self );
            }
            
            return self;
          }
        })( key );
      }
    },
    _modifiers: {
      "moveTo": "M%d,%d",
      "close": { dsl: "Z", cb: function() { this._is_finished = true } },
      "lineTo": "L%d,%d",
      "hLineTo": "H%d",
      "vLineTo": "V%d",
      "curveTo": "C%d,%d %d,%d %d,%d",
      "sCurveTo": "S%d,%d %d,%d",
      "bCurveTo": "Q%d,%d %d,%d",
      "sbCurveTo": "T%d,%d",
      "arc": "A%d,%d %d %d,%d %d,%d",
      "crCurveTo": [ "R%d,%d", " %d,%d" ]
    },

    getPathDSL: function() {
      return this._path;
    },
    isFinished: function() {
      return _is_finished;
    },
    isStarted: function() {
      return !( this._path == "" )
    }
  }
  
  w.ExPath = ExPath;
})(window);


( function( w ) {
  w.ExPath.Util = {
    
    roundabout: function( points ) {
      if ( points.length < 1 ) {
        return null;
      }
      var exp = new ExPath();
      exp.moveTo( points[ 0 ].x, points[ 0 ].y );
      for ( var i = 1, l = points.length; i < l; ++i ) {
        exp.lineTo( points[ i ].x, points[ i ].y );
      }
      
      return exp;
    },
    
    roundaboutMiddle: function( points ) {
      if ( points.length < 2 ) {
        return null;
      }
      
      var ex_p = new ExPath(),
    	    p1, p2, p3, p12, p23,
    	    points_stack = points;
    	
    	points_stack.push( points[ 0 ] );
    	points_stack.push( points[ 1 ] );
    	
    	while( points_stack.length > 2 ) {
    	  var points_set = [];
    	  p1 = { x: Math.round( points_stack[ 0 ].x ), y: Math.round( points_stack[ 0 ].y ) };
    	  p2 = { x: Math.round( points_stack[ 1 ].x ), y: Math.round( points_stack[ 1 ].y ) };
    	  p3 = { x: Math.round( points_stack[ 2 ].x ), y: Math.round( points_stack[ 2 ].y ) };
    	  p12 = { x: Math.round( ( p1.x + p2.x ) / 2 ), y: Math.round( ( p1.y + p2.y ) / 2 ) };
    	  p23 = { x: Math.round( ( p3.x + p2.x ) / 2 ), y: Math.round( ( p3.y + p2.y ) / 2 ) };
    	  
    	  if ( !ex_p.isStarted() ) {
    	    ex_p.moveTo( p12.x, p12.y );
    	  }
    	  ex_p.sCurveTo( p2.x, p2.y, p23.x, p23.y );
    	  
    	  points_stack = points_stack.slice( 1 );
    	}
    	
      ex_p.close();
      
      return ex_p;
    }
    
  }
} )( window );