/*
 * 
 * This serves as a base for all application Dialogs, its is the same as a regular dijit Dialog excep that it activates on show and deactivates on hide.
 * 
 * The reason we want that is so that we can reuse or Activatable mixin with Dialogs without havig to make it handle onShow events
 * 
 */
define([
	"dojo/_base/declare",
	"dijit/Dialog",
	"app/mixins/StatefulModule",
	"dojo/topic",
	"dojo/_base/lang"
	],
	function(declare, Dialog, StatefulModule, topic, lang){
		
	return declare([Dialog, StatefulModule], {
		
		_hideConfirmed:false,
		
		onShow:function(){
			this.inherited(arguments);
			this._hideConfirmed = false;
			this.activate();
		},
		
		hide:function(){

			var requiresConfirmation = false;
			var childConfirmation = this.childrenRequireConfirmation();
			
			if(childConfirmation == true){
				requiresConfirmation = childConfirmation;
			}else{
				if(typeof(this.requireHideConfirmation) == 'function'){
					requiresConfirmation = this.requireHideConfirmation();
				}
			}
				
			if(this._hideConfirmed || requiresConfirmation == false){
				this.inherited(arguments);
			}else{
				emanda2.confirmDialog.set("confirmMessage", 'Are you sure you want to discard them ?');
				emanda2.confirmDialog.set("title", 'Unsaved changes');
				emanda2.confirmDialog.show(lang.hitch(this, "confirmHide"));
			}
			
		},
		
		
		confirmHide:function(){
			this._hideConfirmed = true;
			this.hide();
		},
		
		onHide:function(){
			this.deactivate();
			this.inherited(arguments);
		},
		
		activate:function(){
			this.inherited(arguments);
			// if it has a single child, and its activatable we've been used to load another component so activate it when we activate
			/*var singleChild = this.getSingleChild();
			if(singleChild && typeof(singleChild.activate) != 'undefined'){
				singleChild.activate();
			}*/
			
			// activate any direct children that are activatable
			// * Note that activatable looks for children that match state but in this Dialog we want to activate any child that can be activated
			this.activateChildren(this.getChildren());
			
		},
		
		set: function(name, value, passDown){
			this.inherited(arguments);
			
			if(passDown === true){
				// call set on all the children of this Dialog
				var children = this.getChildren();
				for (var i=0; i < children.length; i++) {
					var childNode = children[i];
					if(typeof(childNode.set) == 'function'){
						childNode.set(name, value);
					}
				}
			}
			
			
		},		
		
		/*
		getSingleChild:function(){
			if (this.getChildren().length == 1){
				var childNode = this.getChildren()[0];
				if(typeof(childNode) != 'undefined' && childNode != null){
					return childNode;
				}
			}
			
			return null
		},
		*/
		
		childrenRequireConfirmation:function(){
			var children = this.getChildren();
			for (var i=0; i < children.length; i++) {
				var childNode = children[i];
				if(typeof(childNode.requireHideConfirmation) == 'function'){
					var requiresConfirmation = childNode.requireHideConfirmation();
					if(requiresConfirmation == true){
						return true;
					}
				}
			};
			
			return false;
			
		},
		
		deactivate:function(){
			this.inherited(arguments);
			// * Note that activatable looks for children that match state but in this Dialog we want to deactivate any child that can be deactivated
			this.deactivateChildren(this.getChildren());
		},
		
		setCurrentState:function(value){
			this.inherited(arguments);
			// if it has a single child, and it implements visualStates we've been used to load another component so mirror the state on it
			if (this.getChildren().length == 1){
				var childNode = this.getChildren()[0];
				if(typeof(childNode) != 'undefined' && childNode != null){
					if(typeof(childNode.setCurrentState) != 'undefined'){
						childNode.setCurrentState(value);
					}
				}
			}					
			
		}
		
		
		
	});
});
