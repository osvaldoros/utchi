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
	"dojo/_base/declare", "dojo/query", "dojo/hash", "dojo/_base/array", "app/utils/DisplayManager"
	],
	function(declare, query, hash, baseArray, DisplayManager){
	
	return declare([], {
		
			displayManager: DisplayManager.getInstance(),
		
			refreshPermissions:function(){
				
				if(typeof(this.permissions) != 'undefined'){
					
					var permissionComponents = [];
					
					for(var p = 0; p < this.permissions.length; p++){
						var thisPermission = this.permissions[p];
						var thisPermissionComponents = query('.' + thisPermission.name, this.domNode);
						
						for(var i=0; i < thisPermissionComponents.length; i++){
							if(baseArray.indexOf(permissionComponents, thisPermissionComponents[i]) == -1){
								permissionComponents.push(thisPermissionComponents[i]);
							}	
						}
						
					}
					
					this.displayManager.includeElements(permissionComponents, query('.permissions', this.domNode) );
				}
				
				if(!this.displayManager.valid){
					this.displayManager.validate();
				}
				
			}
			
	});
});
