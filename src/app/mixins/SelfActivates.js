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
		
    	useShowAndHideToActive:true,
    	_parentChangeHandler:null,    	
    	parentStack:undefined,
    	
		startup:function(){
			this.inherited(arguments);
			this.updateActivationScheme();
		},
		
		updateActivationScheme:function(){
			// if this module was loaded by a ModuleLoader it will activate it, so we shouldn't activate here...
			if(this.usedLoader === false){
				if((typeof(this.parentStack) != 'undefined') ){
					
					if(typeof(this.parentStack) == "string"){
						this.parentStack = dom.byId(this.parentStack);
					}
					
					this.useShowAndHideToActive = false;
					if(!this._parentChangeHandler){
						this._parentChangeHandler = dojo.subscribe(this.parentStack.id + "-selectChild", this, this.onParentSelectionChange);
					}
					
					this._listeningToParentStackChanges = true;
				} 
			}
		},
		
		onShow:function(){
			// if this module was loaded by a ModuleLoader it will activate it, so we shouldn't activate here...
			if(this.usedLoader === false){
				if(this.useShowAndHideToActive){
					this.activate();
				}
			}
		},
		
		
		onHide:function(){
			// if this module was loaded by a ModuleLoader it will activate it, so we shouldn't activate here...
			if(this.usedLoader === false){
				if(this.useShowAndHideToActive){
					this.deactivate();
				}
			}
		},
		
						
		onParentSelectionChange:function(module){
			// if this module was loaded by a ModuleLoader it will activate it, so we shouldn't activate here...
			if(this.usedLoader === false){
				if(module == this){
					this.activate();
				}else{
					this.deactivate();
				}
			}
		},
		
    	destroy:function(){
    		this.inherited(arguments);
    		// if this module was loaded by a ModuleLoader it will activate it, so we shouldn't activate here...
			if(this.usedLoader === false){
				this.deactivate();
	    		
	    		//remove event handlers
				if(this._parentChangeHandler){
					this._parentChangeHandler.remove();
					this._parentChangeHandler = null
				};
				
				this._listeningToParentStackChanges = false;
			}
    	}
		
	});
});
