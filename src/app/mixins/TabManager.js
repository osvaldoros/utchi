/*
 * 
 * 
 */
define([
	"dojo/_base/declare",
	"dojo/on",	
	"dojo/_base/lang",	
	"dojo/_base/array",
	"dojo/topic",
	"dojo/dom-class",
	"app/utils/HashManager",
	"app/loader/ModuleLoader",
	"app/loader/DialogLauncher"
	
	],
	function(declare, on, lang, baseArray, topic, domClass, HashManager, ModuleLoader, DialogLauncher){
	
	return declare([], {
		
		hashManager: HashManager.getInstance(),
		repositionAfterUpdate:true,
		showTabs:true,
		
		/**
		 * 
		 * configureTabs
		 * 
		 * Stores relevant references to build the tabs
		 * 
		 */
		configureTabs:function(configObject){
			
			this.alternateStates = configObject.alternateStates;
			this.__tabContainer = configObject.tabs;
			this.__stepArray = configObject.steps || [];
			
			if(typeof(configObject.showTabs) != "undefined") this.showTabs = configObject.showTabs;
			
			
			if(configObject.hashManagement != null && typeof(configObject.hashManagement) == 'object'){
				this.__useHash = true;
				this.__setHashFunction = lang.hitch(this.hashManager, configObject.hashManagement.setHashFunction);
				this.__getHashFunction = lang.hitch(this.hashManager, configObject.hashManagement.getHashFunction);
			}else{
				this.__useHash = false;
			}

			if(lang.isArray(configObject.alternateStates)){
				var children = this._attachPoints;
				for (var i = children.length - 1; i >= 0; i--) {
					var childName = children[i];
					if(this.hasOwnProperty(childName)){
						var child = this[childName];
						var childMapped = false;
						if(typeof(child.isInstanceOf) == "function" && child.isInstanceOf(DialogLauncher)){
							if(typeof(child.class) == "string" && child.class != "" && child.class.toLowerCase().indexOf("includeinstates") != -1){
								var classArray = child.class.split(" ");

								for (var j = classArray.length - 1; j >= 0; j--) {
									var clazz = classArray[j];
									for (var l = configObject.alternateStates.length - 1; l >= 0; l--) {
										var alternateState = configObject.alternateStates[l];
										if(typeof(alternateState.name) == "string" && alternateState.name.toLowerCase() == clazz.toLowerCase()){
											child.set("closeToHash", this.hashManager.getModule() + "/" + alternateState.mapsTo + "/");
											childMapped = true;
										}
										if(childMapped) break;
									};
									if(childMapped) break;
								};

							}
						}
					}
				};
			}

		},
		
		/**
		 * 
		 * Overrides the setCurrentState of VisualStates, to make sure that:
		 * 
		 *  - We don't land on the base state / are always on a step
		 *  - If the state passed is a number we consider it an index and grab the matching step and set the state to that
		 *  - If the currentState corresponds to a step child select that child in the tabContainer
		 * 
		 * 
		 */
		setCurrentState:function(state){
			
			// if we are setting the state to a number turn it into the correspondant item
			if(state.indexOf("_step_") != -1){
				var originalState = state;
				state = state.split("_step_").join(""); // strip _step_
				if(parseInt(state) >= 0){
					state = this.getStepName(parseInt(state));
				}else{
					state = originalState;
				}
			}
			
			this.inherited(arguments);
			
			// if after we set the state the currentState its still '' then set the state to the first step
			if(this.getCurrentState() == ''){
				var stepName = this.getFirstStepName();
				if(stepName != null){
					if(this.__useHash){
						this.__setHashFunction(stepName);
					}else{
						this.setCurrentState(stepName);
					}
				}
			}else{
				// If the component is active and the currentState matches a tab select that tab
				if(this.isActive()){
					this.selectChildByName(this.getCurrentState())
				}
			}
		},


		selectChildByName:function(name){
			var childInfo = this.getStepInfo( name );
			if(typeof childInfo != 'undefined' && childInfo != null){
				var child = childInfo.tabChild;
				if(typeof child != 'undefined'){
					this.__tabContainer.selectChild( child );
				}
			}
		},
		
		/**
		 * 
		 * getFirstStepName - Gets the name of the first step
		 * 
		 */
		getFirstStepName:function(){
			return this.getStepName(0);
		},
		
		/**
		 * 
		 * getLastStepName - Gets the name of the last step
		 * 
		 */
		getLastStepName:function(){
			return this.getStepName(this.getStepsArray().length - 1);
		},
		
		/**
		 * 
		 * getStepName - Gets the name of a step by its index
		 * 
		 * 
		 */
		getStepName:function(index){
			var step = this.getStepsArray()[index];
			if(typeof(step) != "undefined" && step != null){
				return step.title;
			}else{
				return null
			}
		},
		
		/**
		 * 
		 * getStepInfo
		 * 
		 * Fetches the info object defined in the steps array by title, uses getStepIndex internally
		 * 
		 */
		getStepInfo:function(title){
			var index = this.getStepIndex(title)
			if(index != -1){
				return this.getStepsArray()[index];
			}
			return null;
		},
		
		
		/**
		 * 
		 * getStepIndex
		 * 
		 * Searches the array for an object with the specified title
		 * 
		 */
		getStepIndex:function(title){
			for(var i=0,j=this.getStepsArray().length; i<j; i++){
				var currentStep = this.getStepsArray()[i];
				if(title.toLowerCase() == currentStep.title.toLowerCase()){
					return i;
				}
			};
			
			return -1;
		},
		
		/**
		 * 
		 * getStepsArray
		 * 
		 * Workaround function to get a reference to the preffered steps array. 
		 * 
		 *  - stepArray has the base steps that are always included
		 *  - currentSteps varies depending on whether you are editing an entity or creating a new one etc..
		 * 
		 * TODO there is an edgecase here where you could get one array the first time and then the other because currentSteps only gets its value after activation!
		 * 
		 */
		getStepsArray:function(){
			if(typeof(this._currentSteps) != "undefined" && this._currentSteps != null){
				return this._currentSteps;
			}else if(typeof(this.__stepArray) != "undefined" && this.__stepArray != null){
				return this.__stepArray;
			}
			return [];
		},
		
				
		/*
		 * Override the module's onActivate method in order to create the tabs upon activation.
		 * 
		 * Make sure you call this.inhereted(arguments) if you implement onActivate on your module or this won't get called
		 * 
		 */
		onActivate:function(){
		
			if(typeof(this.eventHandlers) == "undefined"){
				this.eventHandlers = [];
			}
				
			////console.log('WizardManager > onActivate')
			var childToSelect = null;
			var owner = this;
			this._currentSteps = this.__stepArray.slice(0);
			
			if(typeof this.overviewStep != undefined && this.overviewStep != null && this.updatingEntity){
				this._currentSteps.unshift(this.overviewStep);
			}
			
			var firstModule = null;
			// loop through the steps and create a module loader for each
			for(var i=0,j=this._currentSteps.length; i<j; i++){
				var moduleObj = this._currentSteps[i];
				var moduleName = moduleObj.title; 
				// hook an activation callBack, so we can update the state/hash when that tab is clicked 
				moduleObj.onActivateCallBack = function(moduleName){
					return function(){
						owner.updateState(moduleName);
					}	
				}(moduleName); 
				
				
				moduleObj.parentStack = this.__tabContainer;
				var module = new ModuleLoader(moduleObj);
				if(firstModule == null){
					firstModule = module;
				}
				
				var currentState = this.getCurrentState();
				// if the child's title matches the currentState during activation store it and select it after we are done creating all of them 
				if(typeof(moduleName) != "undefined" && typeof(currentState) != "undefined" && moduleName != null && currentState != null && moduleName.toLowerCase() == currentState.toLowerCase()) childToSelect = module; 
				moduleObj.tabChild = module;
				this.__tabContainer.addChild(module);
			}
			
			// If there was a child that matched the currentState select it
			if(childToSelect != null){
				this.__tabContainer.selectChild( childToSelect );
			}
			
			var visibleChild = childToSelect || firstModule;
			this.refreshTabs(visibleChild);
			
			// onActivate on super classes
			this.inherited(arguments);
		},
		
		//===================================================================
		// UI updates
		//===================================================================
		/**
		 * 
		 * updateState
		 * 
		 * Call back from the activate method on each one of the tabs, when a tab is activated we want the hash/the current state to match that so we
		 * use this call back to update those
		 * 
		 */
		updateState:function(moduleName){
			//var moduleName = moduleName.toLowerCase();

			// first figure out wich get/set functions we are using based on whether useHash is enabled
			var getFunction;
			var setFunction;
			if(this.__useHash){
				getFunction = this.__getHashFunction;
				setFunction = this.__setHashFunction;				
			}else{
				getFunction = lang.hitch(this, "getCurrentState");
				setFunction = lang.hitch(this, "setCurrentState");
			}

			// get the name that we are requesting ( this could be from the url/hash or via setCurrentState )
			var requestedName = getFunction();
			// if the module that was activated doesn't match the requested name:
			if(moduleName != requestedName){
				// first try to see if there is an alternate name for that module
				var alternateName = this.getModuleNameByAlternateState(requestedName);
				// if there isn't an alternate name for the module, use the set function to make state/hash match the module name
				if(alternateName == false){
					setFunction(moduleName);
				// if there is an alternate name, we are not going to set state or hash, but we will select the child matching the module we got via its alternate name
				}else{
					if(moduleName != alternateName){
						this.selectChildByName(alternateName);
					}
				}
			}

			if(this.repositionAfterUpdate && typeof(this.layout) != 'undefined'){
				this.layout();
			}
		},
		
		// Override me!
		refreshTabs:function(childSelected){
			
		},

		getModuleNameByAlternateState:function(state){
			if(lang.isArray(this.alternateStates)){
				for (var i = this.alternateStates.length - 1; i >= 0; i--) {
					var alternateObject = this.alternateStates[i];
					if(alternateObject.name.toLowerCase() == state.toLowerCase()){
						return alternateObject.mapsTo;
					}
				};
			}
			return false
		},

		callOnChildren:function(functionName){
			var children = this.__tabContainer.getChildren();
			var results = [];
			for (var i=0; i < children.length; i++) {
				var child = children[i];
				if(typeof(child[functionName]) == "function"){
					var hitchedFunction = lang.hitch(child, functionName);
					results.push(hitchedFunction());
				}
			}
			return results;
		},
			
		
		//===================================================================
		// Cleanup
		//===================================================================
		
		/*
		 * 
		 * onDeactivate
		 * 
		 * Make sure we destroy the tabs when we deactivate this module, they will get created again on the next activation
		 * 
		 */
		onDeactivate:function(){
			if(typeof(this.__tabContainer) != 'undefined'){
				this.__tabContainer.destroyDescendants();
			}
		}

	});
});
