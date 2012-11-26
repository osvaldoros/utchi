define([
	"dojo/_base/declare",
	"dojo/on",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/ServicesOffered.html", // this is what includes the html template
	"dojo/_base/lang",
	"dijit/registry",
	"dijit/Dialog",
	
	"dgrid/GridFromHtml", 
	"dojo/store/Memory", 
	"dojo/store/Observable", 
	"dojo/store/Cache", 
	"app/store/JsonRest", 
	"dgrid/Selection", 
	"dojo/parser", 
	"dojo/query", 
	"dijit/form/CheckBox",		
	"dijit/form/Button",
	
	"app/form/Manager",
	"app/mixins/FormManager",		
	"app/utils/HashManager",
	"app/utils/ChangeTracker",
	"app/store/UIStores",
	"app/store/StoreManager",
	"app/modules/companies/companySetup/configServices/ConfigDrugDialog",
	"app/modules/companies/companySetup/configServices/ConfigAlcoholDialog",
	"app/modules/companies/companySetup/configServices/ConfigPhysicalExamDialog",
	"app/modules/companies/companySetup/configServices/ConfigBiologicalMonitoringDialog",
	"app/modules/companies/companySetup/configServices/ConfigAudioDialog",
	"app/modules/companies/companySetup/configServices/ConfigEquipmentDialog",
	"app/modules/companies/companySetup/configServices/ConfigSleepDialog",
	"app/modules/companies/companySetup/configServices/ConfigFingerprintDialog",
	"app/modules/companies/companySetup/configServices/ConfigEAPDialog",
	"app/modules/companies/companySetup/configServices/ConfigSAPDialog",
	"app/modules/companies/companySetup/configServices/ConfigSTDialog"
	
	],
	function(declare, on, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, template, lang, registry, Dialog, GridFromHtml, Memory, Observable, Cache, JsonRest, Selection, parser, query, CheckBox, Button,
			Manager, DCFormManager, HashManager, ChangeTracker, UIStores, StoreManager, ConfigDrugDialog, ConfigAlcoholDialog, ConfigPhysicalExamDialog, ConfigBiologicalMonitoringDialog, ConfigAudioDialog, ConfigEquipmentDialog, ConfigSleepDialog, ConfigFingerprintDialog, ConfigEAPDialog, ConfigSAPDialog, ConfigSTDialog){
	
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
	
	return declare("app.modules.companies.companySetup.ServicesOffered", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, DCFormManager], {

			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template, // Our template - important!
			hashManager: HashManager.getInstance(),
			storeManager: StoreManager.getInstance(),
			changeTracker: ChangeTracker.getInstance(),
			uiStores: UIStores.getInstance(),
			
		    constructor: function(args){
		        declare.safeMixin(this,args || {});
		        this.configureButtonsEnableMap = {};
		        this.configureDialogMap = {};
		    },			
			
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * Notice we don't use postCreate because the child widgets haven't been created yet, and we need to wait for the dgrid to attach the store to it
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				var owner = this;
				
				this.companyServicesForm = this.getWidget('companyServicesForm');
				this.companyServicesForm.set('storeUrl', emanda2.urls.COMPANY_SERVICE);
				//this.configureForm(this.companyServicesForm); // this module doesn't deal with an entity it deals with a list of entities
				
				this.configureDrugButton.set('disabled', true);
				this.configureAlcoholButton.set('disabled', true);
				this.configurePhysicalExamButton.set('disabled', true);
				this.configureBiologicalMonitoringButton.set('disabled', true);
				this.configureAudioButton.set('disabled', true);
				this.configureEquipmentButton.set('disabled', true);
				this.configureSleepButton.set('disabled', true);
				this.configureFingerprintButton.set('disabled', true);
				this.configureEAPButton.set('disabled', true);
				this.configureSAPButton.set('disabled', true);
				this.configureSTButton.set('disabled', true);
				
				this.configureButtonsEnableMap = {};
				this.configureButtonsEnableMap[this.drug_box.id] = this.configureDrugButton;
				this.configureButtonsEnableMap[this.alcohol_box.id] = this.configureAlcoholButton;
				this.configureButtonsEnableMap[this.physical_box.id] = this.configurePhysicalExamButton;
				this.configureButtonsEnableMap[this.bio_mon_box.id] = this.configureBiologicalMonitoringButton;
				this.configureButtonsEnableMap[this.audio_box.id] = this.configureAudioButton;
				this.configureButtonsEnableMap[this.equipment_box.id] = this.configureEquipmentButton;
				this.configureButtonsEnableMap[this.sleep_box.id] = this.configureSleepButton;
				this.configureButtonsEnableMap[this.fingerprint_box.id] = this.configureFingerprintButton;
				this.configureButtonsEnableMap[this.eap_box.id] = this.configureEAPButton;
				this.configureButtonsEnableMap[this.sap_box.id] = this.configureSAPButton;
				this.configureButtonsEnableMap[this.supervisor_training_box.id] = this.configureSTButton;
				
				
				this.configureDialogMap = {};
				this.configureDialogMap[this.configureDrugButton.id] = new ConfigDrugDialog();
				this.configureDialogMap[this.configureAlcoholButton.id] = new ConfigAlcoholDialog();
				this.configureDialogMap[this.configurePhysicalExamButton.id] = new ConfigPhysicalExamDialog();
				this.configureDialogMap[this.configureBiologicalMonitoringButton.id] = new ConfigBiologicalMonitoringDialog();
				this.configureDialogMap[this.configureAudioButton.id] = new ConfigAudioDialog();
				this.configureDialogMap[this.configureEquipmentButton.id] = new ConfigEquipmentDialog();
				this.configureDialogMap[this.configureSleepButton.id] = new ConfigSleepDialog();
				this.configureDialogMap[this.configureFingerprintButton.id] = new ConfigFingerprintDialog();
				this.configureDialogMap[this.configureEAPButton.id] = new ConfigEAPDialog();
				this.configureDialogMap[this.configureSAPButton.id] = new ConfigSAPDialog();
				this.configureDialogMap[this.configureSTButton.id] = new ConfigSTDialog();
				
				
			},
			
			onActivate:function(){
				this.inherited(arguments);
				
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}					
				var owner = this;
				// checkboxes events to enable/disable configure buttons
				this.eventHandlers.push( on(this.drug_box, 'click', lang.hitch(this, "enableRelatedButton")) );
				this.eventHandlers.push( on(this.alcohol_box, 'click', lang.hitch(this, "enableRelatedButton")) );
				this.eventHandlers.push( on(this.physical_box, 'click', lang.hitch(this, "enableRelatedButton")) );
				this.eventHandlers.push( on(this.bio_mon_box, 'click', lang.hitch(this, "enableRelatedButton")) );
				this.eventHandlers.push( on(this.audio_box, 'click', lang.hitch(this, "enableRelatedButton")) );
				this.eventHandlers.push( on(this.equipment_box, 'click', lang.hitch(this, "enableRelatedButton")) );
				this.eventHandlers.push( on(this.sleep_box, 'click', lang.hitch(this, "enableRelatedButton")) );
				this.eventHandlers.push( on(this.fingerprint_box, 'click', lang.hitch(this, "enableRelatedButton")) );
				this.eventHandlers.push( on(this.eap_box, 'click', lang.hitch(this, "enableRelatedButton")) );
				this.eventHandlers.push( on(this.sap_box, 'click', lang.hitch(this, "enableRelatedButton")) );
				this.eventHandlers.push( on(this.supervisor_training_box, 'click', lang.hitch(this, "enableRelatedButton")) );
				
				// configure button handlers
				this.eventHandlers.push( on(this.configureDrugButton, 'click', function(event){owner.launchConfigureDialog(owner.configureDrugButton);}) );
				this.eventHandlers.push( on(this.configureAlcoholButton, 'click', function(event){owner.launchConfigureDialog(owner.configureAlcoholButton);}) );
				this.eventHandlers.push( on(this.configurePhysicalExamButton, 'click', function(event){owner.launchConfigureDialog(owner.configurePhysicalExamButton);}) );
				this.eventHandlers.push( on(this.configureBiologicalMonitoringButton, 'click', function(event){owner.launchConfigureDialog(owner.configureBiologicalMonitoringButton);}) );
				this.eventHandlers.push( on(this.configureAudioButton, 'click', function(event){owner.launchConfigureDialog(owner.configureAudioButton);}) );
				this.eventHandlers.push( on(this.configureEquipmentButton, 'click', function(event){owner.launchConfigureDialog(owner.configureEquipmentButton);}) );
				this.eventHandlers.push( on(this.configureSleepButton, 'click', function(event){owner.launchConfigureDialog(owner.configureSleepButton);}) );
				this.eventHandlers.push( on(this.configureFingerprintButton, 'click', function(event){owner.launchConfigureDialog(owner.configureFingerprintButton);}) );
				this.eventHandlers.push( on(this.configureEAPButton, 'click', function(event){owner.launchConfigureDialog(owner.configureEAPButton);}) );
				this.eventHandlers.push( on(this.configureSAPButton, 'click', function(event){owner.launchConfigureDialog(owner.configureSAPButton);}) );
				this.eventHandlers.push( on(this.configureSTButton, 'click', function(event){owner.launchConfigureDialog(owner.configureSTButton);}) );
				
				var services = this.uiStores.getServices();
				if(services.then){
					services.then(function(data){
						owner.createServiceMap(data);
						owner.loadHashEntityServices();
					})
				}else{
					this.createServiceMap(services);
					this.loadHashEntityServices();
				}
				
				
			},
			
			
			/**
			 * 
			 * createServiceMap
			 * 
			 * Creates a map between all the available services and the different checkboxes
			 * 
			 */
			
			createServiceMap:function(services){
				this.serviceMap = {};
				this.availableServices = services;
				for (var i=0; i < services.length; i++) {
					var service = services[i];
					var boxName = service.id.toLowerCase() + "_box";
					this.serviceMap[service.id] = boxName;
				};
				
			},
			
			/**
			 * 
			 * enableRelatedButtonByBoxId
			 * 
			 * Whenever a box is checked or unchecked, and do:
			 *  - enable/disable the config button. 
			 *  - get the service object associated with the Dialog (or create one if none exists).
			 *  - If unchecking box, delete service ( confirm first! )
			 * 
			 */
			enableRelatedButtonByBoxId:function(boxId, launch){
				////console.log(boxId);
				
				if(typeof(launch) == 'undefined'){
					launch = true;
				}
				////console.log(boxId)
				var box = this.getWidget(boxId);
				var button = this.getButtonByBoxId(box.id);
				
				// if the box is checked				
				if(box.checked){
					button.set('disabled', false);
					if(launch) this.launchConfigureDialog(button);
				
				// if unchecking
				}else{
					var companyServiceIndex = this.getCompanyServiceIndex(boxId); // Doesn't create it
					// If a companyServiceIndex exists, delete it. But ask confirmation first
					if(typeof(companyServiceIndex) != "undefined" || companyServiceIndex != null){
						var serviceName = this.getServiceName(boxId); // Doesn't create it
						emanda2.confirmDialog.set("confirmMessage", 'Are you sure you want to delete<br/> ' + serviceName + ' ?');
						emanda2.confirmDialog.set("boxId", boxId);
						emanda2.confirmDialog.show(lang.hitch(this, "deleteService"));
					}
					// make sure we don't uncheck this until we actually delete it
					box.set("checked", true);
				}
			},
			
			/**
			 * getCompanyServiceIndex
			 * 
			 * Only return a companyServiceIndex if it already exist and is associated with a Dialog, otherwise return undefined
			 * 
			 */
			getCompanyServiceIndex:function(boxId){
				var dialog = this.getDialogByBoxId(boxId);
				return dialog._serviceIndex
			},
			
			/**
			 * 
			 * deleteService
			 * 
			 */
			deleteService:function(){
				var owner = this;
				var boxId = emanda2.confirmDialog.get("boxId");
				var box = this.getWidget(boxId);
				var button = this.getButtonByBoxId(box.id);
				var dialog = this.getDialogByBoxId(boxId);
				var serviceIndex = dialog._serviceIndex;
				
				box.set("checked", false)
				button.set('disabled', true);
				
				var res = emanda2.entities.getEntityFromHash(emanda2.urls.COMPANY, function(company){
					var services = lang.isArray(company.services) ? lang.clone(company.services) : [];
					services.splice(serviceIndex, 1);
					owner.changeTracker.setChange(emanda2.urls.COMPANY, "services", services);
					
					owner.changeTracker.commitChanges(emanda2.urls.COMPANY, company); // commit immediately
					dialog.set("_serviceIndex", null);
				});	
				
			},
			
			
			/**
			 * 
			 * prepareForm
			 * 
			 * Map the company_services collection to checkboxes. Link the given companyService object with its related Dialog so we can populate the Dialog when we launch it 
			 * 
			 */
			prepareForm:function(data, form){
				// the object that we'll use to populate the form
				var formObject = {}
				if(data && lang.isArray(data)){
					for (var i=0; i < data.length; i++) {
						var companyService = data[i];
						var service = companyService.service;
						
						if(typeof(service) == "object" && service != null){
							if(this.serviceMap.hasOwnProperty(service.id)){
								formObject[this.serviceMap[service.id]] = true;
								var dialog = this.getDialogByBoxId(this.serviceMap[service.id]);
								////console.log('setting dialog with boxId = ' + this.serviceMap[subService.id] + ", _serviceIndex to " + subService.id);
								dialog.set("_serviceIndex", i);
							}
						}
					}
				}
				
				this.viewInForm(formObject, form)
				
				for(var prop in formObject){
					this.enableRelatedButtonByBoxId(prop, false);
				}
				
			},
			
			/**
			 * 
			 * loadHashEntityServices
			 * 
			 * Grab the companyId from the hash and perform a query to get related services via this.withCompanyId
			 * 
			 */
			loadHashEntityServices:function(){
				var companyId = this.hashManager.getEntity();
				var owner = this;
				
				var res = emanda2.entities.withEntity(companyId, emanda2.urls.COMPANY, function(company){
					////console.log(company)
					owner.prepareForm(company.services, owner.companyServicesForm);
				});
				
				return res;
			},	
			
			/**
			 * 
			 * withCompanyId
			 * 
			 * Similar to withEntity this performs a query instead of a single GET
			 * 
			 */
			/*withCompanyId:function(id, storeUrl, func){
				if(parseInt(id) >= 0){
					var entities = this.storeManager.getStore(storeUrl).query({company_id:id});
					entities.then(function(data){
						func(data);
					})
					return true;
				}else{
					return false
				}
			},*/
			
			//====================================================================================================
			// Convenience Methods
			//====================================================================================================
			launchConfigureDialog:function(button){
				
				var owner = this;
				var res = emanda2.entities.getEntityFromHash(emanda2.urls.COMPANY, function(company){
					
					////console.log(company)
					var boxId = owner.getBoxIdByButton(button);
					var dialog = owner.getDialogByBoxId(boxId);
					
					if(typeof(dialog._serviceIndex) == "undefined" || dialog._serviceIndex == null){
						
						var serviceName = owner.getServiceName(boxId);
						var service = owner.getServiceDefinition(serviceName);
						
						//console.log(serviceDefinition);
						var companyService = {
							test_templates:[],
							service: service
						}
						
						var companyServices = lang.isArray(company.services) ? lang.clone(company.services) : [];
						companyServices.push(companyService);
						company.services = companyServices;
						
						dialog._serviceIndex = (companyServices.length - 1);
						
						owner.changeTracker.setChange(emanda2.urls.COMPANY, "services", companyServices);
						var res = owner.changeTracker.commitChanges(emanda2.urls.COMPANY, company); // commit immediately
						
						res.then(function(result){
							emanda2.entities.setCurrentCompanyService(dialog._serviceIndex)
							dialog.show();
						});
						
						
					}else{
						emanda2.entities.setCurrentCompanyService(dialog._serviceIndex)
						dialog.show();
					}
				});
				
				
			},
			
			getServiceName:function(boxId){
				for (var p in this.serviceMap){
					if(this.serviceMap[p] == boxId) return p;
				}
			},
			
			getServiceDefinition:function(serviceName){
				for (var i=0; i < this.availableServices.length; i++) {
					var serviceDef = this.availableServices[i];
					if(serviceDef.id == serviceName){
						return serviceDef;
					}
				};
				return null;
			},
			
			enableRelatedButton:function(event){
				var boxId = event.target.id;
				this.enableRelatedButtonByBoxId(boxId)
			},
			
			getDialogByBoxId:function(boxId){
				var button = this.getButtonByBoxId(boxId);
				var dialog = this.configureDialogMap[button.id];
				return dialog;
			},
			
			getButtonByBoxId:function(boxId){
				var box = this.getWidget(boxId);
				var button = this.configureButtonsEnableMap[box.id];
				return button;
			},
			
			getBoxIdByButton:function(button){
				for(var p in this.configureButtonsEnableMap){
					if(this.configureButtonsEnableMap[p] == button){
						return p;
					}
				}
				
				return null;
			},
			
			//====================================================================================================
			// Cleanup Methods
			//====================================================================================================
			onDeactivate:function(){
				//remove event handlers
				for (var i=0; i < this.eventHandlers.length; i++) {
					var thisHandler = this.eventHandlers[i];
					if(typeof(thisHandler) != 'undefined'){
						thisHandler.remove();
					}
				};
				
				this.eventHandlers = []				
			},
			
			destroy:function(){
				
				for (var p in this.configureDialogMap){
					var dialog = this.configureDialogMap[p];
					dialog.destroyDescendants();
					dialog.destroy();
				}
				
				
				this.inherited(arguments);
				
			}
	});
});
