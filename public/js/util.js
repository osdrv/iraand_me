;( function( W ) {
  
  W.is_empty = function( subj ) {
    return subj === undefined || subj === null;
  }
  
  W.each = function( arr, cb ) {
    for ( var i in arr ) {
      if ( arr.hasOwnProperty( i ) ) {
        ( function( ix ) {
          cb( arr[ ix ], ix );
        } )( i );
      }
    }
  }
  
} )( window );