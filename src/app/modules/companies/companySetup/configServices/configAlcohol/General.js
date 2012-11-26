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
	"app/mixins/FormManager"
	
	],
    function(declare, on, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, template, lang, Button, TestTemplates, BillableServices,
			Validate, validateWeb, Textarea, TextBox, TimeTextBox, DateTextBox, FilteringSelect, CheckBox, RadioButton, ValidationTextBox, CheckedMultiSelect, BusyButton,
			Manager, DCFormManager
	){
		
        return declare("app.modules.companies.companySetup.configServices.configAlcohol.General", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, DCFormManager], {
			
 			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
            //templateString: template, // Our template - important!
			templateString: template,
			
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
			},
			
			onActivate:function(){
				this.inherited(arguments);
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}					
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
			
			destroy:function(){
				this.inherited(arguments);
			}
			
			 
        });
});
