/*!
 * jQuery UI rangeSelectable 1.0
 *
 * Depends on:
 * 		jQuery UI Selectable 1.12.0
 *
 * Copyright (c) 2016- Andraz Zvonar
 * Released under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

 var rangeSelectable = $.widget( "az.rangeSelectable", $.ui.selectable, {
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
 	}
} );
