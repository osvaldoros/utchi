/*
 * app.utils.DisplayManager is a singleton, please use the static getInstance method to get a reference to it like this:
 * 
 * var displayManager = app.utils.DisplayManager.getInstance();
 * 
 * 
 * 
 * This class takes a conservative approach which means it will make sure we are not seing things we shouldn't.
 * 
 * If 2 clients of this class try to modify the display of an element hiding will win over showing..
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
 * 
 * See also, VisualPermissions and VisualStates
 * 
 */
define([
	"dojo/_base/declare",
	"dojo/_base/lang"
	],
	function(declare, lang){
	
		var classRef = declare("app.utils.DisplayManager", [], {
		
			//===========================================================
			// Instance members
			//===========================================================
		
			valid: true,
			
			__elementsToHide:[],
			__elementsToShow:[],
			
			includeElements:function(elementSubSet, eligibleElements){
				this.displayElementsBasedOnTag(elementSubSet, eligibleElements, 'include');
			},
			
			excludeElements:function(elementSubSet, eligibleElements){
				this.displayElementsBasedOnTag(elementSubSet, eligibleElements, 'exclude');
			},
			
			/**
			 * 
			 * This method includes or excludes elements that are found in both sets of elements the elegible set and the matched set
			 * 
			 */
			displayElementsBasedOnTag:function(elementSubSet, eligibleElements, mode){
				// this won't hide/show elements until we call validate
				this.valid = false;
				
				var affectThisElement = false;
				for (var k = eligibleElements.length - 1; k >= 0; k--){
					var matchedElement = eligibleElements[k];
					affectThisElement = false;
					for (var l = elementSubSet.length - 1; l >= 0; l--){
						var eligibleElement = elementSubSet[l]
						if(matchedElement == eligibleElement){
							affectThisElement = true;
						}
					}
					
					// if we are on include mode display elements that match and hide others, if we are on exclude mode is the opposite
					if(affectThisElement){
						mode == 'include' ? this.addToShow(matchedElement) : this.addToHide(matchedElement);
					}else{
						mode == 'include' ? this.addToHide(matchedElement) : this.addToShow(matchedElement);
					}
				}
			},
			
			getMatchedElements:function(elementSubSet, eligibleElements){
				var affectThisElement = false;
				var affectedElements = [];
				for (var k = eligibleElements.length - 1; k >= 0; k--){
					var matchedElement = eligibleElements[k];
					affectThisElement = false;
					for (var l = elementSubSet.length - 1; l >= 0; l--){
						var eligibleElement = elementSubSet[l]
						if(matchedElement == eligibleElement){
							affectThisElement = true;
						}
					}
					
					// if we are on include mode display elements that match and hide others, if we are on exclude mode is the opposite
					if(affectThisElement){
						affectedElements.push(matchedElement);
					}
				}
				
				return affectedElements;
			},
			
			addToShow:function(element){
				this.__elementsToShow.push(element);
			},
			
			addToHide:function(element){
				this.__elementsToHide.push(element);
			},
			
			validate:function(){
				
				// show elements in the show array
				for(var i=0; i < this.__elementsToShow.length; i++){
					var showyElement = this.__elementsToShow[i];
					// make sure we are not also trying to hide the element
					var alsoTryingToHide = false;
					for(var ij=0; ij < this.__elementsToHide.length; ij++){
						var showHideElement = this.__elementsToHide[ij];
						if(showyElement == showHideElement){
							alsoTryingToHide = true;
							break;
						}
					}
					
					if(!alsoTryingToHide){
						showyElement.style.display = 'inline';
					}else{
						////console.log('[WARNING] DisplayCSSMatch > validate > is trying to be shown and hidden by conflicting commands, hide wins! ');
						////console.log(showyElement);
					}
				}
				
				// hide elements in the hide array
				for(var j=0; j < this.__elementsToHide.length; j++){
					var hidyElement = this.__elementsToHide[j];
					hidyElement.style.display = 'none';
				}
				
				this.__elementsToHide = [];
				this.__elementsToShow = [];
			
				this.valid = true;
			}
			
		});
	
	
	//===========================================================
	// Static members
	//===========================================================
	lang.mixin(app.utils.DisplayManager, {
		
		getInstance:function(params){
			if(!app.utils.DisplayManager._instance){
				app.utils.DisplayManager._instance = new app.utils.DisplayManager(params);
			}
			
			return app.utils.DisplayManager._instance;
		}
		
	});
	
	return classRef;
	
});
