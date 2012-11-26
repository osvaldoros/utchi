define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/text!./templates/ConfigAlcoholDialog.html", // this is what includes the html template
	"dojo/_base/lang",
	"dijit/registry",
	"app/uicomponents/Dialog",
	"app/mixins/StatefulModule",
	"app/mixins/WizardManager"		
	],
	function(declare, on, template, lang, registry, Dialog, StatefulModule, WizardManager){
		
		return declare([Dialog, StatefulModule, WizardManager], {
			title:'Configure Alcohol',
			content: template, // Our template - important!
			
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * Notice we don't use postCreate because the child widgets haven't been created yet, and we need to wait for the dgrid to attach the store to it
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				
				this.configAlcoholTabs = this.getWidget('configAlcoholTabs');
				this.submitAlcoholButton = this.getWidget('submitAlcoholButton');
				this.saveAlcoholStatus = this.getWidget('saveAlcoholStatus');	

				var wizardConfig = {
					tabs:this.configAlcoholTabs,
					steps : [
						{ title: 'General', moduleURL:'app/modules/companies/companySetup/configServices/configAlcohol/General'},
						{ title: 'Results', moduleURL:'app/modules/companies/companySetup/configServices/configAlcohol/Results'}
					],
					storeUrl: emanda2.urls.COMPANY,
					statusLabel: this.saveAlcoholStatus,
					saveButton: this.submitAlcoholButton,
					sequential:false,
					mustCompleteFirstTab:false
				}
				
				this.configureWizard(wizardConfig);
			},
			
			onActivate:function(){
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
