/**
 * This class extends TabContainer to make it play nice in our activation framework
 * 
 */
define([ 
	'dojo/_base/declare', 
	'dojo/_base/lang',
	'dojox/layout/FloatingPane',
	'app/mixins/WidgetMap'
	], 
	function (declare, lang, FloatingPane, WidgetMap) {
    return declare('app.layout.FloatingPane', [FloatingPane, WidgetMap], {
    	__isShowing:false,

		hide: function(/* Function? */ callback){
			this.inherited(arguments);
			this.__isShowing = false;
			this.deactivateChildren(this.getChildren())
		},
	
		show: function(/* Function? */callback){
			this.inherited(arguments);
			this.__isShowing = true;
			this.activateChildren(this.getChildren())
		},

		activateChildren:function(children){
			for (var i = children.length - 1; i >= 0; i--){
				var domChild = children[i];
				var child = this.getWidget(domChild.id);
				
				if(typeof(child) != 'undefined' && typeof(child.activate) != 'undefined'){
					child.activate();
				}
			};
		},

		deactivateChildren:function(children){
			for (var i = children.length - 1; i >= 0; i--){
				var domChild = children[i];
				var child = this.getWidget(domChild.id);
				if(typeof(child) != 'undefined' && typeof(child.deactivate) != 'undefined'){
					child.deactivate();
				}
			};
		}		

	});
});
