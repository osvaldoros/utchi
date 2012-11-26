define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/text!./templates/ConfigDrugDialog.html", // this is what includes the html template
	"dojo/_base/lang",
	"dijit/registry",
	"app/uicomponents/Dialog",
	"app/mixins/StatefulModule",
	"app/mixins/WizardManager",
	"app/utils/HashManager"		
	],
	function(declare, on, template, lang, registry, Dialog, StatefulModule, WizardManager, HashManager){
		
		return declare([Dialog, StatefulModule, WizardManager], {
			title:'Configure Drug',
			content: template, // Our template - important!
			
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * Notice we don't use postCreate because the child widgets haven't been created yet, and we need to wait for the dgrid to attach the store to it
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				
				this.configDrugTabs = this.getWidget('configDrugTabs');
				this.submitDrugButton = this.getWidget('submitDrugButton');
				this.saveDrugStatus = this.getWidget('saveDrugStatus');
				
				var wizardConfig = {
					tabs:this.configDrugTabs,
					steps : [
						{ title: 'General', moduleURL:'app/modules/companies/companySetup/configServices/configDrug/General'},
						{ title: 'Results', moduleURL:'app/modules/companies/companySetup/configServices/configDrug/Results'},
						{ title: 'Groups', moduleURL:'app/modules/companies/companySetup/configServices/configDrug/Groups'}
					],
					storeUrl: emanda2.urls.COMPANY,
					statusLabel: this.saveDrugStatus,
					saveButton: this.submitDrugButton,
					sequential:false,
					mustCompleteFirstTab:false
				}
				
				this.configureWizard(wizardConfig);
				
			},
			
			onActivate:function(){
				//console.log("ConfigDrug> onActivate 2")
				this.inherited(arguments);
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}					
				var owner = this;
				var res = emanda2.entities.getEntityFromHash(emanda2.urls.COMPANY, function(company){
					//console.log(company);
					owner.reconfigureWizard(company, {sequential:false,	mustCompleteFirstTab:false});
				});
			},
			
			
			onDeactivate:function(){
				
				//remove event handlers
				for (var i=0; i < this.eventHandlers.length; i++) {
					var thisHandler = this.eventHandlers[i];
					if(typeof(thisHandler) != 'undefined'){
						thisHandler.remove();
					}
				};
				
				this.inherited(arguments);
				
				this.eventHandlers = []				
			}
	});
});
