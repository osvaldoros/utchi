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
	"dojo/dom",
	"dojo/on",	
	"dojo/_base/lang",	
	"dojo/topic",
	"app/utils/ChangeTracker",
	"app/mixins/CallBacks"
	],
	function(declare, dom, on, lang, topic, ChangeTracker, CallBacks){
	
	return declare([CallBacks], {
		updatingEntity:null,
		changeTracker: ChangeTracker.getInstance(),		
		
		configureSaver:function(configObject){
			this.__saveButton = configObject.saveButton;
			this.__statusLabel = configObject.statusLabel;
			this.__storeUrl = configObject.storeUrl;
		},
		
		
		setUpdatingEntity:function(entity){
			this.updatingEntity = entity;
			if(entity != null){
				emanda2.entities.updateEntityMap(entity.id, entity);
			}
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
							
			this.eventHandlers.push( topic.subscribe(this.__storeUrl + "-modified", lang.hitch(this, "__entityModified")) );
			this.eventHandlers.push( topic.subscribe(this.__storeUrl + "-created", lang.hitch(this, "__entityCreated")) );
			this.eventHandlers.push( topic.subscribe(this.__storeUrl + "-cleared", lang.hitch(this, "__entityCleared")) );
			this.eventHandlers.push( topic.subscribe(this.__storeUrl + "-saved", lang.hitch(this, "__entitySaved")) );
			
			// wire the save button
			if(typeof(this.__saveButton) != 'undefined' && this.__saveButton != null) {
				this.eventHandlers.push( on(this.__saveButton, 'click', lang.hitch(this, "onSaveClicked")) );
			}	
			
			
			this.refreshButtons();
		},
		
		//===================================================================
		// Event handlers
		//===================================================================
		/**
		 * 
		 * onSaveClicked
		 * 
		 * Handle the save button click, by invoking the changeTracker to commit changes on the store
		 * 
		 */
		onSaveClicked:function(){
			if(this.prepareForSave() !== false){
				this.save();
			}
		},
		
		save:function(){
			if(typeof(this.__saveButton) != 'undefined' && this.__saveButton != null){
				this.__saveButton.set('disabled', true);
			}
			this._pendingGoNextStep = false;
			//if(this.updatingEntity == null || typeof(this.updatingEntity) == "undefined"){
				//console.warn("Saver can't save because updatingEntity is undefined");				
			//}else{
			this.changeTracker.commitChanges(this.__storeUrl, this.updatingEntity);
			//}
		},
		
		/**
		 * 
		 * __entityCreated
		 * 
		 * When an entity is created via a POST it will trigger this method here so we can adjust the UI. This method is also implemented by FormManager to repopulate the form
		 * 
		 */
		__entityCreated:function(entity){
			//console.log("__entityCreated > " + entity)
			this.runCallBack("entityCreated", entity);
			this.entityCreated(entity);
			this.__entitySaved(entity)
		},
		
		/**
		 * 
		 * __entityModified
		 * 
		 * Called whenever the changeTracker has recorded some changes on the entity we are monitoring
		 * 
		 */
		__entityModified:function(data){
			this.runCallBack("entityModified", data);
			this.entityModified(data);
			this.refreshButtons();
		},
		
		
		/**
		 * 
		 * __entityCleared
		 * 
		 * Called whenever the changeTracker has been cleared for this entity ( discarded changes )
		 * 
		 */
		__entityCleared:function(data){
			this.runCallBack("entityCleared", data);
			this.refreshButtons();
		},
		
		/**
		 * 
		 * __entitySaved
		 * 
		 * Whenever an entity is saved
		 * 
		 */
		__entitySaved:function(entity){
			//console.log("__EntitySaved > " + entity)
			//var owner = this;
			//var res = emanda2.entities.withEntity(entity, this.__storeUrl, function(entity){
				this.runCallBack("entitySaved", entity);
				this.setUpdatingEntity(entity);
				this.refreshButtons();
			//});
		},	
		
		
		
		//===================================================================
		// UI updates
		//===================================================================
		
		refreshButtons:function(){
			if(typeof(this.__saveButton) != 'undefined' && this.__saveButton != null){
				if(this.changeTracker.isModified(this.__storeUrl)){
					this.__saveButton.set('disabled', false);
				}else{
					this.__saveButton.set('disabled', true);
				}
			}
			
			if(typeof(this.__statusLabel) != 'undefined' && this.__statusLabel != null){
				////console.log(this.__storeUrl)
				if(this.changeTracker.isModified(this.__storeUrl)){
					////console.log("show modified")
					this.__statusLabel.style.display = '';
				}else{
					////console.log("hide modified")
					this.__statusLabel.style.display = 'none';
					//domClass.remove(this.__statusLabel, "data-modified");
				}
			} 
			
		},
		
		//===================================================================
		// Overridable by implementor
		//===================================================================
		/**
		 * prepareForSave
		 * 
		 * Provides an opportunity for developer to adjust the data right before it gets saved. 
		 * 
		 * To save immediately after the prepareForSave you can either
		 * 
		 *   - Return true
		 *   - Don't return anything
		 * 
		 * Explicitly returning false will cause the save() method not to run and you will have to run it manually later ( useful for async stuff )
		 * 
		 */
		prepareForSave:function(){
			return true;
		},
		
		
		/**
		 * 
		 * requireHideConfirmation
		 * 
		 * This method is invoked on Dialogs to figure out if we can close it or we need to popup a confirm dialog
		 * 
		 */
		requireHideConfirmation:function(){
			return this.changeTracker.isModified(this.__storeUrl);
		},
		
		/**
		 * 
		 * entityCreated provides an opportunity for overriding
		 * 
		 */
		entityCreated:function(entity){
			////console.log('Saver > entityCreated')
		},		
		
		/**
		 * 
		 * entityModified provides an opportunity for overriding
		 * 
		 */
		entityModified:function(entity){
			
		}
						
	});
});
