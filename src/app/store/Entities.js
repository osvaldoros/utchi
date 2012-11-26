/**
 * 
 * CurrentEntities
 * 
 * The idea of this component is to avoid passing data objects (entities) around from one component to another sometimes through several levels of hierarchies.
 * 
 * It can become hard to keep track of where the data object came from and who modified it last etc. For this reason we wanted to have a central place where we know we can
 * access the latest, current entitie of a specific type.
 * 
 * The idea is to use this in modal situations, where we know that we are only editing one entity of a specific type at a time. 
 * 
 * 
 * 
 * Usage:
 * 
 * Before you launch the modal dialog:
 * 
 * emanda2.currentEntities.setCurrentCompanyService(companyService) // service was selected from a list or otherwise loaded from a store in another way
 * 
 * In the modal dialog:
 * 
 * companyService = emanda2.entities.getCurrentCompanyService();
 * 
 * 
 * 
 */
define([
	"dojo/_base/declare",
	"app/store/StoreManager",	
	"app/utils/HashManager"	
	],
	function(declare, StoreManager, HashManager){
	
	return declare("app.store.Entities", [], {
		
			storeManager:StoreManager.getInstance(),
			hashManager:HashManager.getInstance(),
			
			_entityMap:{},
			_requestMap:{},
			_entityRequestedInHash:null,
			
			_currentCompanyService:null,
			_currentSiteService:null,
			_currentCompany:null,
			_currentDonor:null,
			_currentUser:null,
			_currentCollector:null,
			_currentContact:null,
			_currentReason:null,
			_currentRandomProgram:null,
			_currentCompanyGroup:null,
      		_currentFeeSchedule:null,
     		 _currentFeeEntry:null,
			_locationParams:null,
			_stories:null,
			_currentStory:null,
			_currentComponent:null,
			
			getStories:function(){
				return this._stories;
			},
			setStories:function(stories){
				this._stories = stories;
			},

			getCurrentStory:function(){
				return this._currentStory;
			},
			setCurrentStory:function(story){
				this._currentStory = story;
			},

			getCurrentComponent:function(){
				return this._currentComponent;
			},
			setCurrentComponent:function(component){
				this._currentComponent = component;
			},	



			getCurrentCompanyService:function(){
				return this._currentCompanyService;
			},
			setCurrentCompanyService:function(companyService){
				this._currentCompanyService = companyService;
			},	

			getCurrentSiteService:function(){
				return this._currentSiteService;
			},
			setCurrentSiteService:function(siteService){
				this._currentSiteService = siteService;
			},
			
			getCurrentLocationParams:function(){
				return this._locationParams;
			},
			setCurrentLocationParams:function(locationParams){
				this._locationParams = locationParams;
			},
			
			getCurrentReason:function(){
				return this._currentReason;
			},
			setCurrentReason:function(reason){
				this._currentReason = reason;
			},
			
			getCurrentCompany:function(){
				return this._currentCompany;
			},
			setCurrentCompany:function(company){
				this._currentCompany = company;
			},
			
			getCurrentDonor:function(){
				return this._currentDonor;
			},
			setCurrentDonor:function(donor){
				this._currentDonor = donor;
			},
			
			getCurrentUser:function(){
				return this._currentUser;
			},
			setCurrentUser:function(user){
				this._currentUser = user;
			},
			
			getCurrentCollector:function(){
				return this._currentCollector;
			},
			setCurrentCollector:function(collector){
				this._currentCollector = collector;
			},
			
			getCurrentContact:function(){
				return this._currentContact;
			},
			setCurrentContact:function(contact){
				this._currentContact = contact;
			},
			
			getCurrentRandomProgram:function(){
				return this._currentRandomProgram;
			},
			setCurrentRandomProgram:function(randomProgram){
				this._currentRandomProgram = randomProgram;
			},
			
			getCurrentCompanyGroup:function(){
				return this._currentCompanyGroup;
			},
			setCurrentCompanyGroup:function(companyGroup){
				this._currentCompanyGroup = companyGroup;
			},
			getCurrentFeeSchedule:function(){
				return this._currentFeeSchedule;
			},
			setCurrentFeeSchedule:function(feeSchedule){
				this._currentFeeSchedule = feeSchedule;
			},
			getCurrentFeeEntry:function(){
				return this._currentFeeEntry;
			},
			setCurrentFeeEntry:function(feeEntry){
				this._currentFeeEntry = feeEntry;
			},
			
			/**
			 * 
			 * getEntityFromHash
			 * 
			 * Grabs the id from the hash and uses withEntity to return the entity regardless if it is async or sync.
			 * 
			 * 
			 */
			getEntityFromHash:function(storeUrl, func, base_query, forceREST){
				return this.withEntity(this.hashManager.getEntity(), storeUrl, func, base_query, forceREST);
			},
			
			/**
			 * updateEntityMap
			 * 
			 * When we make a change to an entity via the server, either saving or creating we get a new entity from the server with an id. Because entities.widthEntity has local cache we need to
			 * update it to make sure we get any changes we made to the entity
			 *  
			 */
			updateEntityMap:function(id, entity){
				console.log("updateEntityMap > for entity id = " + id );
				this._entityMap[id] = entity;
			},
			
			/**
			 * 
			 * withEntity
			 * 
			 * Loads an entity by id from the store and if it needs to wait for the resolve it does otherwise it calls func right away.
			 * In this way this provides a simple way to do something with an entity without dealing with the asynchronous nature of them
			 * 
			 * The entity is returned as a parameter to the callback function specified
			 * 
			 */
			withEntity:function(id, storeUrl, func, base_query, forceREST){
				//console.log('withEntity > storeUrl = ' + storeUrl + " id = " + id);
				if(parseInt(id, 16) >= 0){
					
					// if there is already a request going on for the same storeUrl and id combination don't make another request, simply add the callback to an array of callbacks to be executed upon response
					if(this._requestMap.hasOwnProperty(storeUrl + "_" + id)){
						//console.log("pending request matches storeUrl and id, just add ourselves to the array of callbacks")
						var responseCallBackArray = this._requestMap[storeUrl + "_" + id];
						responseCallBackArray.push(func);
						//console.log("There is now " + responseCallBackArray.length + " callbacks pending for " + storeUrl + " id = " + id)
						this._requestMap[storeUrl + "_" + id] = responseCallBackArray;
						return;
					}
					
					
					if(this._entityRequestedInHash != this.hashManager.getModuleStateAndEntity() || typeof(base_query) != "undefined" || forceREST == true){
						this._entityMap = {}; // bust the map since the hash has changed... OR we passed a base_query which needs to be re-evaluated
 						this._entityRequestedInHash = this.hashManager.getModuleStateAndEntity();
					}
					// check our own map to see if the entity is there first before getting it from the store
					// * This map is tied to the url hash, while the url doesn't change subsequent calls to get the same entity use this map
					// otherwise it gets cleared
					if(this._entityMap.hasOwnProperty(id)){
						var entity = this._entityMap[id];
						this._entity = entity;
						func(entity);
						return true;
					}
					
					var base_query_object = this.storeManager.getBaseQueryObject(base_query);
					var entity;
					if(typeof(base_query_object) == "object" && base_query_object != null && base_query_object != false){
						base_query_object.id = id;
						entity = this.storeManager.getStore(storeUrl).get(base_query_object);
					}else{
						entity = this.storeManager.getStore(storeUrl).get(id);
					}			
					var owner = this;
					
					if(entity.then){
						this._requestMap[storeUrl + "_" + id] = [func]; // if the entity is async, save the func in an array of callbacks, to make it support multiple callbacks for the same id
						entity.then(function(data){
							owner._entity = data;
							owner._entityMap[id] = data; // save the entity in a local map for fast access next time
							//console.log("entity resolved for storeUrl = " + storeUrl + " id = " + id);
							//console.log(data);
							for (var i=0; i < owner._requestMap[storeUrl + "_" + id].length; i++) {
								//console.log("executing callback " + i);
								var callBackFunc = owner._requestMap[storeUrl + "_" + id][i];
								callBackFunc(data);
							};
							delete owner._requestMap[storeUrl + "_" + id]
						})
						return true;
					}else{
						this._entity = entity;
						this._entityMap[id] = entity; // save the entity in a local map for fast access next time
						func(entity);
						return true
					}
				}else{
					this._entity = null;
					return false
				}
			}			
			
	});
});
