/*
 * 
 * This mixin provides typical facilities for handling a multi step wizard which is connected to a tabcontainer.
 * 
 * - If buttons for previous and next are passed in it will manage those and connect them to the tabs
 * - If setHashFunction and getHashFunction strings are passed in the hashManagementParams object it will use that function to update the hash
 *     * setHashFunction and getHashFunction must be a function of HashManager such as setState, setEntity etc...
 * 
 * 
 *  IMPORTANT
 * 
 *  This mixin would only work properly with StateFulModule implementors since it depends on Activatable and VisualStates
 * 
 */
define([
	"dojo/_base/declare",
	"dojo/on",	
	"dojo/_base/lang",	
	"dojo/topic",
	"dojo/dom-class",
	"app/utils/ChangeTracker",
	"app/mixins/MultiUser",
	"app/utils/HashManager",
	"app/mixins/Saver",
	"app/mixins/TabManager"
	],
	function(declare, on, lang, topic, domClass, ChangeTracker, MultiUser, HashManager, Saver, TabManager){
	
	return declare([Saver, TabManager, MultiUser], {
		
		changeTracker: ChangeTracker.getInstance(),
		hashManager: HashManager.getInstance(),
		_pendingGoNextStep:false,
		sequential:true,
		mustCompleteFirstTab:true,
		
		/**
		 * 
		 * configureWizard
		 * 
		 * Stores references to the different elements on the widget to use them later
		 * 
		 */
		configureWizard:function(configObject){
			
			
			this.configureSaver(configObject);
			this.configureTabs(configObject);
			this.configureMultiUser(configObject);

			this.__previousButton = configObject.previousButton;
			this.__nextButton = configObject.nextButton;
			
			if(typeof(configObject.sequential) != "undefined") this.sequential = configObject.sequential;
			if(typeof(configObject.mustCompleteFirstTab) != "undefined") this.mustCompleteFirstTab = configObject.mustCompleteFirstTab;
			
		},
		
		/**
		 * 
		 * Overrides the setCurrentState of TabManager, to refresh the buttons to match the state:
		 * 
		 */
		setCurrentState:function(state){
			this.inherited(arguments);
			this.refreshButtons();
		},
		
		
		
		reconfigureWizard:function(entity, configObject){
			
			this.setUpdatingEntity(entity); // wire Saver so it can save the entity
			if(this.updatingEntity){
				this.sequential = false;
				this.mustCompleteFirstTab = false;
			}else{
				this.sequential = true;
				this.mustCompleteFirstTab = true;
			}
			if(typeof(configObject) == 'object'){
				if(typeof(configObject.sequential) != "undefined") this.sequential = configObject.sequential;
				if(typeof(configObject.mustCompleteFirstTab) != "undefined") this.mustCompleteFirstTab = configObject.mustCompleteFirstTab;
			}
			
			this.refreshTabs();
			this.refreshButtons();
			
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
			
			// wire the previous and next buttons if they exist
			if(typeof(this.__previousButton) != 'undefined' && this.__previousButton != null) this.eventHandlers.push( on(this.__previousButton, 'click', lang.hitch(this, "onPreviousClicked")) );
			if(typeof(this.__nextButton) != 'undefined' && this.__nextButton != null) {
				this.eventHandlers.push( on(this.__nextButton, 'click', lang.hitch(this, "onNextClicked")) );
			}
			// onActivate on super classes
			this.inherited(arguments); // this builds the tabs in TabManager and calls refreshButtons on Saver
		},

		
		//===================================================================
		// Saver overrides
		//===================================================================
		
		/**
		 * 
		 * __entitySaved
		 * 
		 * Whenever an entity is saved
		 * 
		 */
		__entitySaved:function(entity){
			this.inherited(arguments);
			this.refreshTabs();
			// if there was a pending instruction to go next, then go next now
			if(this._pendingGoNextStep){
				this.moveToNextStep();
				this._pendingGoNextStep = false;
			}
		},
		
		
		prepareForSave:function(){
			var results = this.callOnChildren("prepareForSave");
			var result = true;
			for (var i=0; i < results.length; i++) {
				result = result && results[i];
			};
			return result;
		},
		

		/**
		 * 
		 * __entityCreated
		 * 
		 * When an entity is created via a POST it will trigger this method here so we can adjust the UI. This method is also implemented by FormManager to repopulate the form
		 * 
		 */
		__entityCreated:function(entity){
			this.inherited(arguments);
			
			if(this.__useHash){
				if(typeof(entity) == "object" && entity != null && entity.hasOwnProperty("id")){
					this.hashManager.setEntity(entity.id);
				}else if(typeof(entity) == "string"){
					this.hashManager.setEntity(entity);
				}
			}
							
		},		
		
		
		//===================================================================
		// UI updates
		//===================================================================
		/**
		 * 
		 * refreshTabs
		 * 
		 * If we are updating show all the tabs, if new entity show only the first one
		 * 
		 */
		refreshTabs:function(childSelected){
			for(var p in this.__tabContainer.tablist.pane2button){
				var button = this.__tabContainer.tablist.pane2button[p];
				if(this.showTabs){
					if(this.mustCompleteFirstTab){
						if(typeof(childSelected) != "undefined" && childSelected != null && childSelected.id != p){
							button.domNode.style.display = 'none';
						}
					}else{
						button.domNode.style.display = '';
					}
				}else{
					button.domNode.style.display = 'none';
				}
			}
		},
		
		
		
		refreshButtons:function(){
			this.inherited(arguments);// check if data is modified to enable/disable save button
			
			// show/hide the entire previous/next navigation
			if(!this.sequential){
				// show saveButton
				if(typeof(this.__saveButton) != 'undefined' && this.__saveButton != null) this.__saveButton.domNode.style.display = '';	
				
				// hide previous/next buttons
				if(typeof(this.__previousButton) != 'undefined' && this.__previousButton != null) this.__previousButton.domNode.style.display = 'none';	
				if(typeof(this.__nextButton) != 'undefined' && this.__nextButton != null) this.__nextButton.domNode.style.display = 'none';	
			}else{
				if(typeof(this.__saveButton) != 'undefined' && this.__saveButton != null) this.__saveButton.domNode.style.display = 'none'	// make sure the saveButton is hidden

				var currentState = this.getCurrentState();
				var firstState = this.getFirstStepName();
				var lastState = this.getLastStepName();
				
				if(typeof(this.__previousButton) != 'undefined' && this.__previousButton != null){
					this.__previousButton.domNode.style.display = ''; // make sure the button is visible
					
					// enable/disable previousButton
					if(firstState == null || currentState.toLowerCase() == firstState.toLowerCase()){
						this.__previousButton.set('disabled', true);
					}else{
						this.__previousButton.set('disabled', false);
					}
				}
				
				if(typeof(this.__nextButton) != 'undefined' && this.__nextButton != null){
					this.__nextButton.domNode.style.display = ''; // make sure the button is visible
					
					// enable/disable nextButton
					// disable when:
					// we are on the last step
					if(currentState == null || lastState == null || currentState.toLowerCase() == lastState.toLowerCase()){
						 // show save button and hide the next button
						if(typeof(this.__saveButton) != 'undefined' && this.__saveButton != null) this.__saveButton.domNode.style.display = ''; 	
						this.__nextButton.domNode.style.display = 'none';
						
					// we are on the first step, but we require the user to enter data and hasn't
					}else if(currentState.toLowerCase() == firstState.toLowerCase() && this.mustCompleteFirstTab && !this.changeTracker.isModified(this.__storeUrl)){
						this.__nextButton.set('disabled', true);
					// In any other situation enable the button
					}else{
						this.__nextButton.set('disabled', false);
					}
				}
				
			}
			
		},
		
		//===================================================================
		// Event handlers
		//===================================================================
		/**
		 * 
		 * onNextClicked
		 * 
		 * Handle the next button click, either via the hash or directly via currentState. Eventually either method ends up calling setCurrentState
		 * which has been overriden above to select the child that matches the state name
		 * 
		 */
		onNextClicked:function(event){
			if(this.changeTracker.isModified(this.__storeUrl)){
				this.prepareForSave();
				this._pendingGoNextStep = true;
				this.changeTracker.commitChanges(this.__storeUrl, this.updatingEntity);
			}else{
				this.moveToNextStep();
			}			
		},
		
		moveToNextStep:function(){
			var index = this.getStepIndex( this.getCurrentState() );
			if(index != -1){
				var stepName = this.getStepName(index + 1);
				if(stepName != null){
					if(this.__useHash){
						this.__setHashFunction(stepName);
					}else{
						this.setCurrentState(stepName);
					}
				}else{
					console.warn("WizardManager > Can't moveToNextStep, stepName is null")
				}
			}
		},
		
		/**
		 * 
		 * onPreviousClicked
		 * 
		 * Handle the previous button click, either via the hash or directly via currentState. Eventually either method ends up calling setCurrentState
		 * which has been overriden above to select the child that matches the state name
		 * 
		 */
		onPreviousClicked:function(event){
			var index = this.getStepIndex( this.getCurrentState() );
			if(index != -1 && index > 0){
				var stepName =  this.getStepName(index - 1)
				if(stepName != null){
					if(this.__useHash){
						this.__setHashFunction(stepName);
					}else{
						this.setCurrentState(stepName);
					}
				}else{
					console.warn("WizardManager > Can't go to previous step, stepName is null")
				}
			}
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
			this.changeTracker.clearChangesObject(this.__storeUrl)
			this.inherited(arguments); // Destroys tabs on TabManager
		}

	});
});
