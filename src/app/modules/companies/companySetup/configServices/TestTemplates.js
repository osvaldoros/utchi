define([
	"dojo/_base/declare",
	"dojo/on",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/TestTemplates.html", // this is what includes the html template
	"dojo/_base/lang",
	"dojo/store/Memory",
		
	"dgrid/GridFromHtml", 
	"app/store/JsonRest", 
	"dgrid/Selection", 
	"dojo/parser", 
	"dojo/query", 
	"app/form/Manager",
	"dijit/form/CheckBox",		
	"dijit/form/Button",
	"dijit/form/ComboBox",
	"app/form/FilteringSelect",
	"app/store/UIStores",		
	"app/store/StoreManager",		
	"app/utils/ChangeTracker",		
	"app/mixins/GridManager"		
	//"dijit/form/DropDownButton"
	//"app/modules/companies/companySetup/configServices/MoreTestTemplates"
	
	],
	function(declare, on, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, template, lang, Memory, GridFromHtml,JsonRest, Selection, parser, query, DCFormManager, CheckBox, Button, ComboBox, FilteringSelect,
			UIStores, StoreManager, ChangeTracker, GridManager){
	
	/*
	 * 
	 * *IMPORTANT
	 * 
	 * This component doesn't extend ContentPane because of an inconsisten behaviour in the Dojo framework. 
	 * 
	 *  - instances of Dgrid cannot be access via diji.byId('')
	 *  - when using ContentPane the template is assigned to the content property therefore attach-points are inaccesible and the only way to access components is diji.byId()
	 *  - Not extending ContentPane (or similar) means we are not a true dijit widget? (guess) and so layout widgets don't render properly so whenever we use grids we must be careful
	 * 
	 * TODO: 
	 * 
	 *  - find a way to make components that don't extend ContentPane that can render all layout widgets correctly, Then we'll be able to get the best of both worlds.
	 * 
	 */
	
	return declare("app.modules.companies.companySetup.configServices.TestTemplates", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, GridManager], {

			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template, // Our template - important!
			changeTracker: ChangeTracker.getInstance(),
			uiStores: UIStores.getInstance(),
			storeManager: StoreManager.getInstance(),
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * Notice we don't use postCreate because the child widgets haven't been created yet, and we need to wait for the dgrid to attach the store to it
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				var owner = this;
				this.set("_deleteConfirmMessage", "Are you sure you want to delete the selected <br/>order default?")
				this.bookingReasonHelpGrid = this.getWidget('bookingReasonHelpGrid');
				//this.bookingReasonHelpGrid.set("store", this.storeManager.getStore(emanda2.urls.TEST_TEMPLATE ))
				this.deleteTestTemplateBtn = this.getWidget('deleteTestTemplateBtn');
				
				this.addBookingReasonButton = this.getWidget('addBookingReasonButton');
				this.testTemplatesForm = this.getWidget('testTemplatesForm');
				this.testTemplatesForm.set("storeUrl", emanda2.urls.TEST_TEMPLATE);
				
				this.labCombo = this.getWidget('labCombo');
				this.batteryCombo = this.getWidget('batteryCombo');
				this.sampleTypeCombo = this.getWidget('sampleTypeCombo');
				this.reasonCombo = this.getWidget('reasonCombo');
				
				
				this.uiStores.populateCombo(this.labCombo, lang.hitch(this.uiStores, "getLabs"));
				this.uiStores.populateCombo(this.sampleTypeCombo, lang.hitch(this.uiStores, "getSampleTypes"), function(local_service){
					return function(item){
						return owner.filterSampleTypesOnService(item, local_service);
					}
				}(this.service));

				this.uiStores.populateCombo(this.reasonCombo, lang.hitch(this.uiStores, "getReasons"));
				this.uiStores.populateCombo(this.batteryCombo, lang.hitch(this.uiStores, "getBatteries"), function(local_service){
					return function(item){
						return owner.filterBatteriesOnService(item, local_service);
					}
				}(this.service));
				
				
				this.testTemplatesForm.set('refreshUI', lang.hitch(this, "refreshFormUI"));
				
				
				var res = emanda2.entities.getEntityFromHash(emanda2.urls.COMPANY, function(company){
					console.log(company)
					var companyService = company.services[emanda2.entities.getCurrentCompanyService()];
					var oderDefaults = [];
					if(typeof(companyService) != "undefined"){
						oderDefaults = lang.isArray(companyService.test_templates) ? lang.clone(companyService.test_templates) : [];
					}
					
					owner.lastId = 0;
					for (var i=0; i < oderDefaults.length; i++) {
						var orderDef = oderDefaults[i];
						orderDef.id = i;
						owner.lastId = i;
					};
					
					var configObject ={
						grid:owner.bookingReasonHelpGrid,
						store:oderDefaults,
						deleteButton:owner.deleteTestTemplateBtn
					}
					owner.configureGrid(configObject);
				});
				
				
				
				
			},
			
			refreshFormUI:function(value, name, element, event){
				switch(name){
					case "collection_type":
						if(value == "LAB"){
							this.labCombo.set("disabled", false);
						}else{
							this.labCombo.set("disabled", true);
						}
					break;
				}
			},			
			
			onActivate:function(){
				this.inherited(arguments);
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}					
				this.eventHandlers.push( on(this.addBookingReasonButton, "click", lang.hitch(this, "addTestTemplate")) );
			},
			
			addTestTemplate:function(){
				/*
				var entity = this.testTemplatesForm.gatherFormValues()
				entity.company_service_id = emanda2.entities.getCurrentCompanyService().id;
				var store = this.storeManager.getStore( emanda2.urls.TEST_TEMPLATE );
				
				var owner = this;
				var xhrResult =  store.add(entity);
				var res = xhrResult.then(function(data){
					owner.bookingReasonHelpGrid.refresh();
				})
				*/
				
				var testTemplate = this.testTemplatesForm.gatherFormValues();
				
				if(typeof(testTemplate.reason) != "undefined"){
					var reason = {
						"$ref": "reason",
						id: testTemplate.reason
					}
					testTemplate.reason = reason;
				}
				
				if(typeof(testTemplate.sample_type) != "undefined"){
					var sample_type = {
						"$ref": "sample_type",
						id: testTemplate.sample_type
					}
					testTemplate.sample_type = sample_type;
				}
				
				if(typeof(testTemplate.battery) != "undefined"){
					var battery = {
						"$ref": "battery",
						id: testTemplate.battery
					}
					testTemplate.battery = battery;
				}
				
				if(typeof(testTemplate.lab) != "undefined"){
					var lab = {
						"$ref": "lab",
						id: testTemplate.lab
					}
					testTemplate.lab = lab;
				}
					
				if(typeof(testTemplate.collection_type) != "undefined"){
					var collection_type = {
						"$ref": "collection_type",
						id: testTemplate.collection_type
					}
					testTemplate.collection_type = collection_type;		
				}	
				
				testTemplate.id = ++this.lastId;
				this.__store.put(testTemplate);
				
			},

			

			filterBatteriesOnService:function(item, service){
				if( typeof(item) == "object" && item != null && typeof(service) == "string" ){
					var currentService = item.service;
					if(typeof(currentService) == "object" && currentService != null && currentService.id == service){
						return true
					}
				}
				return false;
			},

			filterSampleTypesOnService:function(item, service){
				
				if( typeof(item) == "object" && item != null && typeof(service) == "string"){
					if(lang.isArray(item.services)){
						for (var i = item.services.length - 1; i >= 0; i--) {
							var currentService = item.services[i];
							if(typeof(currentService) == "object" && currentService != null && currentService.id == service){
								return true
							}
						};
					}

				}
				return false;
			},			
			
			/**
			 * 
			 * arrayStoreDataChange
			 * 
			 */
			arrayStoreDataChange:function(object, removedFrom, insertedInto){
				var orderArray = this.__store.data;
				var owner = this;
				
				var res = emanda2.entities.getEntityFromHash(emanda2.urls.COMPANY, function(company){
					var sendableOrders = owner.removeIds(orderArray)
					//console.log(sendableOrders);
					
					//if(serviceIndex != -1) company.services[serviceIndex].test_templates = sendableOrders;
					owner.changeTracker.setChange(emanda2.urls.COMPANY, "services[" + emanda2.entities.getCurrentCompanyService() + "].test_templates", sendableOrders)
					//console.log(owner.changeTracker.getChangesObject(emanda2.urls.COMPANY))
				});
			},
			
			removeIds:function(orderArray){
				var sendableOrders = [];					
				for (var i=0; i < orderArray.length; i++) {
					var orderDef = orderArray[i];
					var newOrder = {}
					for(var p in orderDef){
						if(p != "id"){
							newOrder[p] = orderDef[p];
						}
					}
					sendableOrders.push(newOrder);
				};
				
				return sendableOrders;
			},
			
			onDeactivate:function(){
				//remove event handlers
				for (var i=0; i < this.eventHandlers.length; i++) {
					var thisHandler = this.eventHandlers[i];
					if(typeof(thisHandler) != 'undefined'){
						thisHandler.remove();
					}
				};
				
				this.eventHandlers = []				
			}
	});
});
