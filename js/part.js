;( function( W ) {
  
  var Part = new Class({
    
    Implements: [ Options, Events ],
    
    options: {
      height: 180,
      width: 1024,
      pic: {
        R: 80,
        L: 165,
        x: 100,
        y: 90,
        padding: 20
      },
      header: {
        x: 220,
        y: 80,
        attrs: {
          fill: "#FFF",
          "font-size": 80,
          stroke: "#c9a0dc",
          "stroke-width": 2,
          "text-anchor": "start",
          "font-family": "Georgia",
          "font-style": "italic"
        }
      },
      pics: []
    },
    
    initialize: function( options ) {
      
      var self = this;
      
      this.setOptions( options );
      
      this.initPaper( function() {
        ( function() {
          this.initContent();
          this.initBlocks();
          this.initHeader();
        } ).call( self )
      } );
      
      this.is_expanded = false;
    },
    
    initHeader: function() {
      var self = this;
      this.header = this.paper.text(
        this.options.header.x,
        this.options.header.y,
        this.options.label
      ).attr( this.options.header.attrs )
      .toFront()
      .click( function() {
        self.fireEvent( "click" );
      } );
    },
    
    createContainer: function() {
      var id = Raphael.createUUID(),
          container = new Element( "div", {
            class: "part",
            id: id
          } );
      $( "page" ).grab( container );
      this.container = container;
    },
    
    getContainer: function() {
      if ( is_empty( this.container ) ) {
        this.createContainer();
      }
      
      return this.container;
    },
    
    initPaper: function( cb ) {
      var self = this;
      Raphael(
        this.getContainer().get( "id" ),
        this.options.width,
        this.options.height,
        function() {
          self.paper = this;
          if ( !is_empty( cb ) && typeof( cb ) == "function" ) {
            cb.call( self );
          }
        }
      );
    },
    
    initBlocks: function() {
      var top_block_exp = new ExPath(),
          bottom_block_exp = new ExPath(),
          paper = this.paper,
          pic_opts = this.options.pic;
      
      top_block_exp
        .moveTo( 0, 0 )
        .hLineTo( paper.width )
        .vLineTo( pic_opts.y )
        .hLineTo( pic_opts.x + pic_opts.R )
        .arc( pic_opts.R, pic_opts.R, 0, 0, 0, pic_opts.x, pic_opts.y - pic_opts.R )
        .arc( pic_opts.R, pic_opts.R, 0, 0, 0, pic_opts.x - pic_opts.R, pic_opts.y )
        .hLineTo( 0 )
        .close();
      
      bottom_block_exp
        .moveTo( 0, paper.height )
        .hLineTo( paper.width )
        .vLineTo( pic_opts.y )
        .hLineTo( pic_opts.x + pic_opts.R )
        .arc( pic_opts.R, pic_opts.R, 0, 0, 1, pic_opts.x, pic_opts.y + pic_opts.R )
        .arc( pic_opts.R, pic_opts.R, 0, 0, 1, pic_opts.x - pic_opts.R, pic_opts.y )
        .hLineTo( 0 )
        .close();
      
      this.content_block = this.paper.rect( 0, 0, paper.width, paper.height );
      
      this.content_block.attr( {
        stroke: null,
        fill: "url(img/bg.jpg)"
      } ).toBack();
      
      this.top_block = this.paper.path( top_block_exp.getPathDSL() );
      this.bottom_block = this.paper.path( bottom_block_exp.getPathDSL() );
      
      [ this.top_block, this.bottom_block ].each( function( path ) {
        path.attr( {
          stroke: null,
          fill: "#FFF"
        } );
      } );
    },
    
    initContent: function() {
      
      this.pics = [];
      
      var o = this.options,
          self = this,
          rows = this._getRows(),
          cols = this._getCols(),
          padding = o.pic.padding,
          R = o.pic.R,
          L = o.pic.L,
          pic_count = this._getPicCount(),
          x0 = 0,
          y0 = o.pic.y,
          ix = 0;
      
      for ( var i = 0; i < rows; ++i ) {
        j_start = ( i % 2 ) ? 1 : 0;
        for ( var j = j_start; j < cols; ++j ) {
          x = x0 + padding + R + j * L;
          y = y0 + padding + Math.round( R + i * L * Math.sqrt( 3 ) / 2 );
          if ( i % 2 != 0 ) {
            x -= Math.round( L / 2 );
          }
          if ( ix < pic_count ) {
            this.pics.push( this._createPic( x, y0, x, y, R, this.options.pics[ ix ] ) );
          }
          ix++;
        }
      }

      this.addEvent( "expand", function() {
        this.pics.each( function( pic ) {
          pic.rollDown();
        } );
      } );
      
      this.addEvent( "collapse", function() {
        this.pics.each( function( pic ) {
          pic.rollUp();
        } );
      } );
      
      if ( this.pics.length ) {
        this.pics[ 0 ].getElement().toFront();
      }
    },
    
    _createPic: function( x0, y0, x1, y1, R, pic_url ) {
      return new Pic( this.paper, {
        x: x0,
        y: y0,
        R: R,
        pic_url: pic_url
      } ).setExpandedPos( { x: x1, y: y1 } );
    },
    
    resize: function( from, to ) {
      if ( !is_empty( this.resize_fx ) ) {
        this.resize_fx.stop();
        this.resize_fx = null;
      }
      
      var self = this,
          prev_v;
      
      this.resize_fx = new Animate( {
        transition: Fx.Transitions.Quad.easeInOut,
        onStep: function( v ) {
          if ( is_empty( prev_v ) ) {
            prev_v = v;
          }
          self.paper.setSize( self.paper.width, v );
          self.content_block.attr( { height: v } );
          self.bottom_block.translate( 0, v - prev_v );
          prev_v = v;
        }
      } );
      this.resize_fx.start( from, to );
    },
    
    collapse: function() {
      if ( !this.is_expanded ) {
        return;
      }
      this.is_expanded = false;
      this.resize( this.paper.height, this.options.height );
      this.fireEvent( "collapse" );
    },
    
    expand: function() {
      if ( this.is_expanded ) {
        return;
      }
      this.is_expanded = true;
      this.resize( this.paper.height, this.options.height + this._getContentHeight() );
      this.fireEvent( "expand" );
    },
    
    _getPicCount: function() {
      return this.options.pics.length;
    },
    
    _getCols: function() {
      var o = this.options.pic,
          pics_cnt = this._getPicCount(),
          max_cols = Math.floor( ( this.paper.width - 2 * o.R - 2 * o.padding ) / ( o.L * Math.sqrt( 3 ) / 2 ) );
      return pics_cnt > max_cols ? max_cols : pics_cnt;
    },
    
    _getRows: function() {
      var pic_cnt = this._getPicCount(),
          cols = this._getCols();
      return pic_cnt > cols ? Math.round( pic_cnt / ( cols - 0.5 ) ) : 1;
    },
    
    _getContentHeight: function() {
      var o = this.options.pic;
      return Math.round( 2 * o.R + 2 * o.padding + ( this._getRows() - 1 ) * o.L * Math.sqrt( 3 ) / 2 );
    }
    
  });
  
  W.Part = Part;
  
} )( window );