/*
 * 
 * WidgetMap provides means to find a widget within a template of the current widget.
 * It will use a combination of methods until a widget is located, if it can't be located it will return null
 * 
 * The WidgetMap mixin is included in StatefulModule, so all DriverCheck modules should already include widgetMap functionality
 *
 * Usage:
 * 
 * this.childWidget = this.getWidget('childWidget'); 
 * 
 */
define([
	"dojo/_base/declare",
	"dojo/dom"
	],
	function(declare, dom){
	
	return declare([], {
			
			__widgetMap: null,
			
			getWidget:function(attachPoint){
				// first let's check if the widget was added directly to the attach points of the current widget
				// *Note that for this we don't need the widgetMap, so we can save building if all the sub-widgets are attached directly
				if(typeof(this[attachPoint]) != 'undefined'){
					return this[attachPoint];
				}
				
				// if we haven't built the widgetMap for owner widget we need to build it first
				if(this.__widgetMap == null){
					this.__buildWidgetMap();
				}
				
				// Try finding the widget int he widget map ( this means via an attachPoint in its children or its children's children recursively )
				if(typeof(this.__widgetMap[attachPoint]) != 'undefined'){
					return this.__widgetMap[attachPoint];
				}
				
				// last resort try the dijit registry ( this will find dijits regardless if they are local to this widget )
				var dijit_by_id = dijit.byId(attachPoint);
				if(typeof(dijit_by_id) != 'undefined' ){
					return dijit_by_id
				}
				
				// not a widget! but maybe it is a dom element? Q: SHOULD we return DOM elements?
				var dom_by_id = dom.byId(attachPoint);
				if(typeof(dom_by_id) != 'undefined' ){
					return dom_by_id
				}
				
				
				// if after all those options couldn't find a widget return null ( maybe forgot to add a data-dojo-attach-point attribute in the template? )
				return null;
			},
			
			/**
			 * 
			 * __buildWidgetMap
			 * 
			 * Entry point to recursively map widgets that are children of the owner widget
			 * 
			 */
			__buildWidgetMap:function(){
				this.__widgetMap = {};
				this.__mapWidgets(this, this.__widgetMap);
			},
			
			
			/**
			 * __mapWidgets
			 * 
			 * gets the children of a widget, 
			 * adds each child to the map via its dojoAttachPoint property,
			 * recursively map children of each child
			 * 
			 * 
			 * @param {Object} widget
			 * @param {Object} map
			 */
			__mapWidgets:function(widget, map){
				var children = widget.getChildren();
				for (var i=0; i < children.length; i++) {
					var child = children[i];
					map[child.dojoAttachPoint] = child;
					this.__mapWidgets(child, map);
				};
			}
	});
});
