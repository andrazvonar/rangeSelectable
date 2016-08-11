/*!
 * jQuery UI Range Selectable 1.0
 *
 * Depends on:
 * 		jQuery UI Selectable 1.12.0
 *
 * Copyright (c) 2016- Andraz Zvonar
 * Released under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

 var rangeSelectable = $.widget( "az.rangeSelectable", $.ui.mouse, {
 	version: "1.0",
 	options: {
 		appendTo: "body",
 		autoRefresh: true,
 		distance: 0,
 		filter: "*",

 		// Callbacks
 		selected: null,
 		selecting: null,
 		start: null,
 		stop: null,
 		unselected: null,
 		unselecting: null
 	},
 	_create: function() {
 		var that = this;

 		this._addClass( "az-rangeSelectable" );

 		this.dragged = false;

 		// Cache selectee children based on filter
 		this.refresh = function() {
 			that.elementPos = $( that.element[ 0 ] ).offset();
 			that.selectees = $( that.options.filter, that.element[ 0 ] );
 			that._addClass( that.selectees, "ui-selectee" );
 			that.selectees.each( function() {
 				var $this = $( this ),
 					selecteeOffset = $this.offset(),
 					pos = {
 						left: selecteeOffset.left - that.elementPos.left,
 						top: selecteeOffset.top - that.elementPos.top
 					};
 				$.data( this, "selectable-item", {
 					element: this,
 					$element: $this,
 					left: pos.left,
 					top: pos.top,
 					right: pos.left + $this.outerWidth(),
 					bottom: pos.top + $this.outerHeight(),
 					startselected: false,
 					selected: $this.hasClass( "ui-selected" ),
 					selecting: $this.hasClass( "ui-selecting" ),
 					unselecting: $this.hasClass( "ui-unselecting" )
 				} );
 			} );
 		};
 		this.refresh();

 		this._mouseInit();

 		this.helper = $( "<div>" );
 		this._addClass( this.helper, "ui-selectable-helper" );
 	},

 	_destroy: function() {
 		this.selectees.removeData( "selectable-item" );
 		this._mouseDestroy();
 	},

 	_mouseStart: function( event ) {
 		var that = this,
 			options = this.options;

 		this.opos = [ event.pageX, event.pageY ];
 		this.elementPos = $( this.element[ 0 ] ).offset();

 		// Parent element dimensions
 		this.elementHeigth = $( this.element[ 0 ] ).height();
 		this.elementWidth = $( this.element[ 0 ] ).width();


 		if ( this.options.disabled ) {
 			return;
 		}

 		this.selectees = $( options.filter, this.element[ 0 ] );

 		this._trigger( "start", event );

 		$( options.appendTo ).append( this.helper );

 		// position helper (lasso)
 		this.helper.css( {
 			"left": event.pageX,
 			"top": event.pageY,
 			"width": 0,
 			"height": 0
 		} );

 		if ( options.autoRefresh ) {
 			this.refresh();
 		}

 		this.selectees.filter( ".ui-selected" ).each( function() {
 			var selectee = $.data( this, "selectable-item" );
 			this.firstSelectee = selectee;
 			selectee.startselected = true;
 			if ( !event.metaKey && !event.ctrlKey ) {
 				that._removeClass( selectee.$element, "ui-selected" );
 				selectee.selected = false;
 				that._addClass( selectee.$element, "ui-unselecting" );
 				selectee.unselecting = true;

 				// selectable UNSELECTING callback
 				that._trigger( "unselecting", event, {
 					unselecting: selectee.element
 				} );
 			}
 		} );

 		$( event.target ).parents().addBack().each( function() {
 			var doSelect,
 				selectee = $.data( this, "selectable-item" );
 			if ( selectee ) {
 				doSelect = ( !event.metaKey && !event.ctrlKey ) ||
 					!selectee.$element.hasClass( "ui-selected" );
 				that._removeClass( selectee.$element, doSelect ? "ui-unselecting" : "ui-selected" )
 					._addClass( selectee.$element, doSelect ? "ui-selecting" : "ui-unselecting" );
 				selectee.unselecting = !doSelect;
 				selectee.selecting = doSelect;
 				selectee.selected = doSelect;

 				// selectable (UN)SELECTING callback
 				if ( doSelect ) {
 					that._trigger( "selecting", event, {
 						selecting: selectee.element
 					} );
 				} else {
 					that._trigger( "unselecting", event, {
 						unselecting: selectee.element
 					} );
 				}
 				return false;
 			}
 		} );

 	},

 	_mouseDrag: function( event ) {

 		this.dragged = true;

 		if ( this.options.disabled ) {
 			return;
 		}

 		var tmp,
 			that = this,
 			options = this.options,
 			x1 = this.opos[ 0 ],
 			y1 = this.opos[ 1 ],
 			x2 = event.pageX,
 			y2 = event.pageY;

 		this.helper.css( { left: x1, top: y1, width: x2 - x1, height: y2 - y1 } );


 		// Find first element
 		this.selectees.each( function() {
 			var selectee = $.data( this, "selectable-item" );
 			var offset = {}

 			offset.left   = selectee.left   + that.elementPos.left;
 			offset.right  = selectee.right  + that.elementPos.left;
 			offset.top    = selectee.top    + that.elementPos.top;
 			offset.bottom = selectee.bottom + that.elementPos.top;

 			if ( x1 > offset.left && x1 < offset.right &&
 				 	 y1 > offset.top && y1 < offset.bottom ) {
 				 	firstElement = selectee;
 				 	return false;
 				 }


 		})

 		// Find last element
 		this.selectees.each( function() {
 			var selectee = $.data( this, "selectable-item" );
 			var offset = {}

 			offset.left   = selectee.left   + that.elementPos.left;
 			offset.right  = selectee.right  + that.elementPos.left;
 			offset.top    = selectee.top    + that.elementPos.top;
 			offset.bottom = selectee.bottom + that.elementPos.top;

 			if ( x2 > offset.left && x2 < offset.right &&
 				 	 y2 > offset.top && y2 < offset.bottom ) {
 				 	lastElement = selectee;
 				 	return false;
 				 }
 		})


 		this.selectees.each( function() {

 			var selectee = $.data( this, "selectable-item" ),
 				hit = false,
 				offset = {},
 				fstOffset = {};
 				lstOffset = {};

 			// prevent helper from being selected if appendTo: selectable
 			if ( !selectee || selectee.element === that.element[ 0 ] ) {
 				return;
 			}

 			// Selectee offsets
 			offset.left   = selectee.left   + that.elementPos.left;
 			offset.right  = selectee.right  + that.elementPos.left;
 			offset.top    = selectee.top    + that.elementPos.top;
 			offset.bottom = selectee.bottom + that.elementPos.top;

 			// First element offsets
 			fstOffset.left   = firstElement.left   + that.elementPos.left;
 			fstOffset.top    = firstElement.top    + that.elementPos.top;

 			// Last element offsets
 			lstOffset.left   = lastElement.left   + that.elementPos.left;
 			lstOffset.top    = lastElement.top    + that.elementPos.top;


 			// Case 1: First and last element are on the same row
 			if ( firstElement.top == lastElement.top ) {

 				dx = fstOffset.left - lstOffset.left;

 				if ( dx < 0 ) {

 					hit = offset.top == fstOffset.top &&
 						  offset.left <= lstOffset.left &&
 						  offset.left >= fstOffset.left;

 				} else if ( dx > 0 ) {

 					hit = offset.top == fstOffset.top &&
 						  offset.left >= lstOffset.left &&
 						  offset.left <= fstOffset.left;

 				} else if ( dx == 0) {

 					hit = offset.top == fstOffset.top && offset.left == fstOffset.left;

 				}

 			// Case 2: Last element is under first element
 			} else if ( firstElement.top < lastElement.top ) {


 				hit = offset.top == fstOffset.top && offset.left >= fstOffset.left ||
 					  	offset.top == lstOffset.top && offset.left <= lstOffset.left ||
 					  	offset.top < lstOffset.top && offset.top > fstOffset.top;

 			// Case 3: Last element is above fist element
 			} else if ( firstElement.top > lastElement.top ) {

 				hit = offset.top == fstOffset.top && offset.left <= fstOffset.left ||
 					  	offset.top == lstOffset.top && offset.left >= lstOffset.left ||
 					  	offset.top > lstOffset.top && offset.top < fstOffset.top;


 			}


 			if ( hit ) {

 				// SELECT
 				if ( selectee.selected ) {
 					that._removeClass( selectee.$element, "ui-selected" );
 					selectee.selected = false;
 				}
 				if ( selectee.unselecting ) {
 					that._removeClass( selectee.$element, "ui-unselecting" );
 					selectee.unselecting = false;
 				}
 				if ( !selectee.selecting ) {
 					that._addClass( selectee.$element, "ui-selecting" );
 					selectee.selecting = true;

 					// selectable SELECTING callback
 					that._trigger( "selecting", event, {
 						selecting: selectee.element
 					} );
 				}
 			} else {

 				// UNSELECT
 				if ( selectee.selecting ) {
 					if ( ( event.metaKey || event.ctrlKey ) && selectee.startselected ) {
 						that._removeClass( selectee.$element, "ui-selecting" );
 						selectee.selecting = false;
 						that._addClass( selectee.$element, "ui-selected" );
 						selectee.selected = true;
 					} else {
 						that._removeClass( selectee.$element, "ui-selecting" );
 						selectee.selecting = false;
 						if ( selectee.startselected ) {
 							that._addClass( selectee.$element, "ui-unselecting" );
 							selectee.unselecting = true;
 						}

 						// selectable UNSELECTING callback
 						that._trigger( "unselecting", event, {
 							unselecting: selectee.element
 						} );
 					}
 				}
 				if ( selectee.selected ) {
 					if ( !event.metaKey && !event.ctrlKey && !selectee.startselected ) {
 						that._removeClass( selectee.$element, "ui-selected" );
 						selectee.selected = false;

 						that._addClass( selectee.$element, "ui-unselecting" );
 						selectee.unselecting = true;

 						// selectable UNSELECTING callback
 						that._trigger( "unselecting", event, {
 							unselecting: selectee.element
 						} );
 					}
 				}
 			}
 		} );

 		return false;
 	},

 	_mouseStop: function( event ) {
 		var that = this;

 		this.dragged = false;

 		$( ".ui-unselecting", this.element[ 0 ] ).each( function() {
 			var selectee = $.data( this, "selectable-item" );
 			that._removeClass( selectee.$element, "ui-unselecting" );
 			selectee.unselecting = false;
 			selectee.startselected = false;
 			that._trigger( "unselected", event, {
 				unselected: selectee.element
 			} );
 		} );
 		$( ".ui-selecting", this.element[ 0 ] ).each( function() {
 			var selectee = $.data( this, "selectable-item" );
 			that._removeClass( selectee.$element, "ui-selecting" )
 				._addClass( selectee.$element, "ui-selected" );
 			selectee.selecting = false;
 			selectee.selected = true;
 			selectee.startselected = true;
 			that._trigger( "selected", event, {
 				selected: selectee.element
 			} );
 		} );
 		this._trigger( "stop", event );

 		this.helper.remove();

 		return false;
 	}

} );
