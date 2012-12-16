;( function( W ) {
  
  Animate = new Class({
    
    Extends: Fx,
    
    initialize: function( options ) {
      this.parent( options );
    },
    
    set: function( now ) {
      this.fireEvent( "onStep", now );
      return this.parent( now );
    }
  });
  
  W.Animate = Animate;
  
} )( window );