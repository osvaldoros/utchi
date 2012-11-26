define([
	"dojo/_base/declare",
	"dojo/on",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/Results.html", // this is what includes the html template
	"dojo/_base/lang",
	"dijit/form/Button",
	"app/form/Manager",
	"app/mixins/FormManager",	
	
	"dojox/validate",
	"dojox/validate/web",
	"dijit/form/Textarea",
	"dijit/form/TextBox",
	"dijit/form/TimeTextBox",
	"dijit/form/DateTextBox",
	"app/form/FilteringSelect",
	"dijit/form/CheckBox",
	"dijit/form/ComboBox",
	"dijit/form/RadioButton",
	"dijit/form/ValidationTextBox",
	"dojox/form/CheckedMultiSelect",
	"dojox/form/BusyButton",
	
	
	"app/store/UIStores",	
	"app/store/StoreManager"
	
	],
	function(declare, on, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, template, lang, Button, Manager, DCFormManager,
			Validate, validateWeb, Textarea, TextBox, TimeTextBox, DateTextBox, FilteringSelect, CheckBox, ComboBox, RadioButton, ValidationTextBox, CheckedMultiSelect, BusyButton,
			UIStores, StoreManager
	){
		
		return declare("app.modules.companies.companySetup.configServices.configDrug.Results", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, DCFormManager], {
			
			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template,
			storeManager:StoreManager.getInstance(),
			uiStores: UIStores.getInstance(),			
			
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				
				this.labCombo = this.getWidget('default_lab');
				this.mroCombo = this.getWidget('default_mro');
				
				
				this.uiStores.populateCombo(this.labCombo, lang.hitch(this.uiStores, "getLabs"));
				this.uiStores.populateCombo(this.mroCombo, lang.hitch(this.uiStores, "getMROs"));
				
				this.drugResultsForm = this.getWidget('drugResultsForm');
				this.drugResultsForm.set("storeUrl", emanda2.urls.COMPANY);
				this.configureForm(this.drugResultsForm)
				
			},
			
			
			onActivate:function(){
				//console.log('Results > onActivate')
				this.inherited(arguments);
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}					
				var owner = this;
				
				emanda2.entities.getEntityFromHash(emanda2.urls.COMPANY, function(company){
					var arrayPropIndexes = {services:emanda2.entities.getCurrentCompanyService()};
					owner.viewInForm(company, owner.drugResultsForm, arrayPropIndexes)			
				});
				
				
			}
			
			
		});
});
