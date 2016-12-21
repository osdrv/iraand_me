;( function( W ) {
  
  var Pic = new Class({
    
    Implements: [ Chain, Events, Options ],
    
    options: {
      R: 80,
      x: 100,
      y: 100,
      pic_url: ""
    },
    
    initialize: function( paper, options ) {
      this.paper = paper;
      this.setOptions( options );
      this.initElement();
      this.is_expanded = false;
      this.setCollapsedPos( { x: this.options.x, y: this.options.y } );
      this.setExpandedPos( { x: this.options.x, y: this.options.y } );
    },
    
    getElement: function() {
      return this.element;
    },
    
    setCollapsedPos: function( pos ) {
      this.collapsed_pos = pos;
      return this;
    },
    
    setExpandedPos: function( pos ) {
      this.expanded_pos = pos;
      return this;
    },
    
    rollDown: function() {
      this.element.stop().animate( { transform: "t0," + ( this.expanded_pos.y - this.collapsed_pos.y ) }, 500, "<>" );
    },
    
    rollUp: function() {
      this.element.stop().animate( { transform: "" }, 500, "<>" );
    },
    
    initElement: function() {
      var o = this.options,
          self = this;
      if ( is_empty( this.paper ) ) {
        throw "You should provide 'paper' option on Pic initialize.";
      }
      var element_exp = new ExPath();
      element_exp
        .moveTo( o.x - o.R, o.y )
        .arc( o.R, o.R, 0, 0, 1, o.x, o.y - o.R )
        .arc( o.R, o.R, 0, 0, 1, o.x + o.R, o.y )
        .arc( o.R, o.R, 0, 0, 1, o.x, o.y + o.R )
        .arc( o.R, o.R, 0, 0, 1, o.x - o.R, o.y )
        .close();
      this.element = this.paper.path( element_exp.getPathDSL() )
        .attr( {
          fill: "url(" + o.pic_url + ")",
          stroke: null
        } )
      if ( !is_empty( this.options.href ) ) {
        this.element.attr( "href", this.options.href );
      }
    }
  });
  
  W.Pic = Pic;
  
} )( window );