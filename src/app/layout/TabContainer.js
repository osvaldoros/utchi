/**
 * This class extends TabContainer to make it play nice in our activation framework
 * 
 */
define([ 
	'dojo/_base/declare', 
	'dojo/_base/lang',
	'dijit/layout/TabContainer',
	'app/mixins/StatefulModule'
	], 
	function (declare, lang, TabContainer, StatefulModule) {
    return declare('app.layout.TabContainer', [TabContainer, StatefulModule], {
    		
			startup:function(){
				this.inherited(arguments);
				// auto assign this component as the parentStack of the child modules
				var children = this.getChildren();
				for (var i=0; i < children.length; i++) {
					var child = children[i];
					child.parentStack = this;
					child.updateActivationScheme();
				};
			},    	
			
			
			setOnChildren:function(name, value){
				var children = this.getChildren();
				for (var i=0; i < children.length; i++) {
					var child = children[i];
					child.set(name, value);
				};
			},
			
			setOnSelectedChilde:function(name, value){
				if(typeof(this.selectedChildWidget) == "object" && this.selectedChildWidget != null){
					this.selectedChildWidget.set(name, value);
				}
			},
    	
			onActivate:function(){
				//this.inherited(arguments);
				if(typeof(this.selectedChildWidget) == "object" && this.selectedChildWidget != null && typeof(this.selectedChildWidget.activate) == "function"){
					this.selectedChildWidget.activate();
				}
			},
			
			onDeactivate:function(){
				//this.inherited(arguments);
				if(typeof(this.selectedChildWidget) == "object" && this.selectedChildWidget != null && typeof(this.selectedChildWidget.deactivate) == "function"){
					this.selectedChildWidget.deactivate();
				}
			}

	});
});
