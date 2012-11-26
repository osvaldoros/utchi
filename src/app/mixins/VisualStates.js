/*
 * 
 * ValidateStates is a class that provides facilities to include components only in certain states or exclude components from certain states. This
 * is achieved by extending this class and then adding css classes to the template to tag the components that need to be evaluated
 * 
 * 
 * CSS Sintax:
 * 
 *  <node class="includeInStates state1 state2" ></node>
 *  <node class="excludeFromStates state3" ></node>
 * 
 * Notes:
 * 
 *  - Because the system uses css classes as state tags, we must be careful to avoid collision with other css classes!
 *  - It is illegal to have both includeInStates and excludeFromStates tags in the same node ( exclude would prevail )
 * 
 * 
 * See also, VisualRoles a subclass that fixes the state of the component based on the user role.
 * 
 */
define([
	"dojo/_base/declare", 
	"dojo/query", 
	"dojo/_base/array", 
	"app/utils/DisplayManager",
	"app/utils/HashManager"
	],
	function(declare, query, baseArray, DisplayManager, HashManager){
	
	return declare([], {
			
			displayManager: DisplayManager.getInstance(),
			hashManager: HashManager.getInstance(),
						
			_currentState:'',
			
			setCurrentState:function(state){
				var oldState = this._currentState;
				this._currentState = state;
				var stateChanged = oldState != this._currentState;
								
				// if the state changed de-activate any components on the previous state
				if(stateChanged && typeof(this.deactivateChildren) != 'undefined'){
					this.deactivateChildren( this.getStateActivatableComponents(oldState, true) );
				}
				
				// refresh the current state visuals
				this.refreshState();

				// if the state changed activate the components in the new state				
				var activatableComponents = this.getStateActivatableComponents(null, true);
				if(stateChanged && typeof(this.activateChildren) != 'undefined'){
					this.activateChildren(activatableComponents);
				}
				// regardless if the state changed or not drive the sub-state down to active components
				if(typeof this.driveChildrenState != 'undefined'){
					this.driveChildrenState(activatableComponents);
				}
				
			},
			
			getCurrentState:function(){
				return this._currentState;
			},
			
			getStateComponents:function(targetState, onlyImmediateDescendants){
				var stateToUse = (typeof targetState != 'undefined' && targetState != null) ? targetState : this._currentState;
				
				if(onlyImmediateDescendants){
					return stateToUse != '' ? query('#' + this.domNode.id + ' > .' + stateToUse) : [];
				}else{
					return stateToUse != '' ? query('.' + stateToUse, this.domNode) : [];
				}
				
			},
			
			// this method superseeds the getActivatableComponents in Activatable
			getStateActivatableComponents:function(state, stateChangeOnly){
				
				if(typeof stateChangeOnly == 'undefined') stateChangeOnly = false;
				
				// if the component does not have a DOM element then it can't possibly have activatable children ( this happens because deactivate is called on items when they are destroyed and by this time it usually has no more DOM node )
				if(typeof this.domNode == 'undefined' || this.domNode == null) return [];
				
				// return a set of components that is activatable and is not being excluded from the current state either via includeInStates or excludeFromStates
				var allActivatable
				if (this instanceof dijit.layout.ContentPane && this.getChildren().length == 1){
					var childNode = this.getChildren()[0];					
					allActivatable = query('#' + childNode.domNode.id + ' > .activatable');
				}else{
					allActivatable = query('#' + this.domNode.id + ' > .activatable');
				}
				
				var allIncludes = query('#' + this.domNode.id + ' > .includeInStates');
				var allExcludes = query('#' + this.domNode.id + ' > .excludeFromStates');
				
				var stateComponents = this.getStateComponents(state, true);
				
				// remove from activatable if in includes and the current state doesn't match them..
				var currentStateIncludes = this.displayManager.getMatchedElements(stateComponents, allIncludes );
				var currentStateExcludes = this.displayManager.getMatchedElements(stateComponents, allExcludes );
				
				var applicableComponents = [];
				for (var i = allActivatable.length - 1; i >= 0; i--){
					var element = allActivatable[i];
					var addThisElement = false;
					
					var isInIncludes = baseArray.indexOf(allIncludes, element) != -1;
					var isInCurrentIncludes = baseArray.indexOf(currentStateIncludes, element) != -1;
					var isInExcludes = baseArray.indexOf(currentStateExcludes, element) != -1;
					
					//  conditions under which itme is added:
					// stateChangeOnly
					/*
					if(false){
					//             it is a state component that its available in current state
						addThisElement = ( ( isInCurrentIncludes && !isInExcludes ) );
					}else{
					//                      is not a state component         it is a state component that its available in current state
					*/
						addThisElement = ( ( !isInIncludes && !isInExcludes ) || ( isInCurrentIncludes && !isInExcludes ) );
					/*}*/
					
					if(addThisElement){
						applicableComponents.push(element);
					}
					
				};
				
				
				return applicableComponents;
				
			},
			
			refreshState:function(clearHash){
				
				
				var stateComponents = this.getStateComponents();
				
				if(typeof clearHash == 'undefined') clearHash = false;
				
				// display only components that are marked by the css class matching the current state
				
				// DO the include first ( this means exclude will have preference )
				this.displayManager.includeElements(stateComponents, query('.includeInStates', this.domNode));
				this.displayManager.excludeElements(stateComponents, query('.excludeFromStates', this.domNode));
				
				if(typeof this.refreshPermissions != 'undefined'){
					this.refreshPermissions();
				}
				
				if(!this.displayManager.valid){
					this.displayManager.validate();
				}
				
				
				// only modify the hash for topModules ( modules that are created directly by the Workspace )
				if(this.topModule){
					if(clearHash){
						if(this.hashManager.getLastModuleURL(this.hashParams.hashPieces[0]) != null){
							this.hashManager.setHash( this.hashManager.getLastModuleURL(this.hashParams.hashPieces[0]) );
						}else{
							this.hashManager.setHash(this.hashParams.hashPieces[0] + '/' + this._currentState);
						}	
					}else{
						this.hashManager.setState(this._currentState);	
					}
				// unless the component specifically requests to update the hash via the stateInHashIndex
				}else{
					if(typeof this.stateHashFunction != 'undefined'){
						this.hashManager[this.stateHashFunction](this._currentState);	
					}
				}
				
			}
			
	});
});
