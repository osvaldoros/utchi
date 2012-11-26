define([
	"dojo/_base/declare",
	"dojo/on",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/General.html", // this is what includes the html template
	"dojo/_base/lang",
	"dijit/form/Button",
	"app/modules/companies/companySetup/configServices/TestTemplates",
	"app/modules/companies/companySetup/configServices/BillableServices",
	
	"dojox/validate",
	"dojox/validate/web",
	"dijit/form/Form",
	"dijit/form/Textarea",
	"dijit/form/TextBox",
	"dijit/form/TimeTextBox",
	"dijit/form/DateTextBox",
	"app/form/FilteringSelect",
	"dijit/form/CheckBox",
	"dijit/form/RadioButton",
	"dijit/form/ValidationTextBox",
	"dojox/form/CheckedMultiSelect",
	"dojox/form/BusyButton",


	"app/form/Manager",
	"app/mixins/FormManager",	
	"./ConfigRandomDialog"
	
	],
    function(declare, on, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, template, lang, Button, TestTemplates, BillableServices,
			Validate, validateWeb, Form, Textarea, TextBox, TimeTextBox, DateTextBox, FilteringSelect, CheckBox, RadioButton, ValidationTextBox, CheckedMultiSelect, BusyButton,
			Manager, DCFormManager, ConfigRandomDialog
	){
		
        return declare("app.modules.companies.companySetup.configServices.configDrug.General", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, DCFormManager], {
			
 			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
            //templateString: template, // Our template - important!
			templateString: template,
			configureButtonsEnableMap:{},
			configureDialogMap:{},
			
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				
				this.drug_random = this.getWidget('drug_random');
				this.configureDrugRandomButton = this.getWidget('configureDrugRandomButton');
				
				this.otherServicesForm = this.getWidget('otherServicesForm');
				this.configureDrugRandomButton.set('disabled', true);
				
				this.configureButtonsEnableMap = {};
				this.configureButtonsEnableMap[this.drug_random.id] = this.configureDrugRandomButton;
				
				
				this.configureDialogMap = {};
				this.configureDialogMap[this.configureDrugRandomButton.id] = new ConfigRandomDialog();
				
				
			},
			
			onActivate:function(){
				
				this.inherited(arguments);
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}					
				var owner = this;
				// checkboxes events to enable/disable configure buttons
				this.eventHandlers.push( on(this.drug_random, 'click', lang.hitch(this, "enableRelatedButton")) );
				
				// configure button handlers
				this.eventHandlers.push( on(this.configureDrugRandomButton, 'click', function(event){owner.launchConfigureDialog(owner.configureDrugRandomButton);}) );
				
				var res = emanda2.entities.getEntityFromHash(emanda2.urls.COMPANY, function(company){
					owner.viewInForm(company, owner.otherServicesForm)
				});
				
				
			},
			
			onDeactivate:function(){
				this.inherited(arguments);
				//remove event handlers
				for (var i=0; i < this.eventHandlers.length; i++) {
					var thisHandler = this.eventHandlers[i];
					if(typeof(thisHandler) != 'undefined'){
						thisHandler.remove();
					}
				};
				
				this.eventHandlers = []		
			},
			
			
			enableRelatedButton:function(event){
				var boxId = event.target.id;
				var box = this.getWidget(boxId);
				var button = this.configureButtonsEnableMap[boxId];
				if(box.checked){
					button.set('disabled', false);
					this.launchConfigureDialog(button);
				}else{
					button.set('disabled', true);
				}
			},
			
			launchConfigureDialog:function(button){
				var dialog = this.configureDialogMap[button.id];
				dialog.show();
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
