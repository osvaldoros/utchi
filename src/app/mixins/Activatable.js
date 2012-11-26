/*
 * 
 * Activatable is a class that defines two methods activate and deactivate. This superseeds the onShow and onHide methods
 * that dijit components are supposed to have, in preliminary testing these didn't work.
 * 
 * It also has the safeguard to make sure that activate and deactivate only get called once.
 * 
 * When building a module extend ContentPane and also extend Acivable if you want to be able to receive onActivate and onDeactivate events
 * 
 */
define([
	"dojo/_base/declare", 
	"dojo/query",
	"app/utils/HashManager"
	],
	function(declare, query, HashManager){
	
	return declare([], {
		
			hashManager: HashManager.getInstance(),
			__module_active:false,
			currentHash:null,
			usedLoader:false,
			
			startup:function(){
				this.inherited(arguments);
			},
			
			isActive:function(){
				return this.__module_active;
			},
						
			activate:function(){
				// if this component is already active then do nothing...
				if(this.__module_active == true) return;
				
				this.loghashId = '';
				if(typeof(this.hashId) != 'undefined'){
					this.loghashId = this.hashId;
				}
				if(typeof(this.parentStack) != 'undefined'){
					if(typeof(this.parentStack.selectedChildWidget) != 'undefined'){
						if(this.parentStack.selectedChildWidget.id == this.id){
							// module id matches directly, we're ok							
						}else{
							// it doesn't match, let's check if we child is a ModuleLoader and it's child matches
							if(typeof(this.parentStack.selectedChildWidget.module) == 'undefined' || this.parentStack.selectedChildWidget.module.id != this.id){
								// it is a module loader but doesn't match, lgtfo 
								return;
							}
						}
					}
				}
				
				this.__module_active = true;
				//console.log("activate > " + this.id);
				
				// if the module implements VisualStates refresh the state
				if(typeof(this.refreshState) != 'undefined'){
					
					var stateRefreshed = null;
					
					// only top modules are driven by hashChanges, it is their responsibility to update the state of their children
					if(this.topModule){
						this.hashChangeHandle = dojo.subscribe("/dojo/hashchange", this, this._onActivatableHashChange);
						stateRefreshed = this.setStateFromHash(this.hashManager.getHash());
					}
					// first attempt to set the state based on the hash, this will call refreshState implicitly
					// if that failed we need to refresh manually
					if(!stateRefreshed){
						
						if(stateRefreshed == null){
							this.refreshState() ;
						}  else if(stateRefreshed == false){
							this.refreshState(true) ; // pass true to the 'clearHash' flag to clear the rest of the hash after the state
						}
						// since the component was not set to any particular state during activation, activate its children manually
						this.activateChildren(this.getActivateEligibleComponents());
					}
				}else{
					// since the component has no states ( which calls activateChildren after setting the state ) we need to call it manually here
					this.activateChildren(this.getActivateEligibleComponents());
					
					
					if(this.topModule && typeof(this.hashId) != 'undefined'){
						if(this.hashManager.getLastModuleURL(this.hashId) != null){
							this.hashManager.setHash( this.hashManager.getLastModuleURL(this.hashId));
						}else{
							this.hashManager.setHash(this.hashId);
						}
					} 
				} 
				
				
				if(typeof(this.onActivate) != 'undefined') this.onActivate();
				if(typeof(this.onActivateCallBack) != 'undefined') this.onActivateCallBack();
				
				
			},
			
			deactivate:function(){
				if(!this.__module_active) return;
				this.__module_active = false;
				
				if(typeof(this.hashChangeHandle) != 'undefined'){
					this.hashChangeHandle.remove();
				}
				
				var children = this.getActivateEligibleComponents();
				this.deactivateChildren(children);
				
				if(typeof(this.onDeactivate) != 'undefined') this.onDeactivate();
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
			
			driveChildrenState:function(children){
				for (var i = children.length - 1; i >= 0; i--){
					var domChild = children[i];
					var child = this.getWidget(domChild.id);
					
					if(typeof(child) != 'undefined' && typeof(child.setCurrentState) != 'undefined'){
						var childState = null;
						// ** There is an edge case here, if the state and the sub-state are named the same, trying to get the sub-sub-state won't work
						//    this is because getNextHashItem will find the first instance not the second one...
						childState = this.hashManager.getNextHashState( this.getCurrentState() );
						if(childState){
							child.setCurrentState(childState);
						}
						
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
			},
			
			getActivateEligibleComponents:function(){
				return typeof this.getStateActivatableComponents != 'undefined' ? this.getStateActivatableComponents() : this.getActivatableComponents();
			},
			
			_onActivatableHashChange:function(hashValue){
				if(this.hashManager.update){
					this.setStateFromHash(hashValue);
				}
			},
			
			
			getActivatableComponents:function(){
				// if this is a ContentPane with the template being assigned to its content, the query can't be directly descendants
				if (this instanceof dijit.layout.ContentPane && this.getChildren().length == 1){
					var childNode = this.getChildren()[0];					
					return query('#' + childNode.domNode.id + ' > .activatable');
				}else{
					return query('#' + this.domNode.id + ' > .activatable');
				}
				
			},
			
			parseHash:function(hashValue){
				hashValue = hashValue.toLowerCase();
				if(hashValue != this.__activatableCurrentHash){
					
					this.hashParams = this.hashManager.parseHash(hashValue);
					
					
					var urlMatchesModule = (this.hashParams.hashPieces[0] == this.hashId)
					this.hashParams.moduleName = this.hashParams.hashPieces[0] = this.hashId; // this module already knows its hashId, so use that instead of relying on the url for it
					
					this.__activatableCurrentHash = hashValue;
					
					return urlMatchesModule;
				}
				
				return false;
				
			},
			
			
			setStateFromHash:function(hashValue){
				if(this.parseHash(hashValue)){
					if(typeof(this.hashParams.stateName) != 'undefined'){
						this.setCurrentState(this.hashParams.stateName);
						return true
					}
				}
				
				return false;
			}
			
	});
});
