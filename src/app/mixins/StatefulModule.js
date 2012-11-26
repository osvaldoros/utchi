/*
 * 
 * This Bundles the most commonly needed mixins for modules so we can easily inherit at once
 * 
 */
define([
	"dojo/_base/declare", 
	"app/mixins/Activatable", 
	"app/mixins/VisualStates", 
	"app/mixins/VisualPermissions",
	"app/mixins/WidgetMap",
	"app/mixins/CallBacks"
	],
	function(declare, Activatable, VisualStates, VisualPermissions, WidgetMap, CallBacks){
	
	return declare([Activatable, VisualStates, VisualPermissions, WidgetMap, CallBacks], {
		
	});
});
