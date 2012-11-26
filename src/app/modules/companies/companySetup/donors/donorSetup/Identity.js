define([
	"dojo/_base/declare",
	"dojo/on",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/Identity.html", // this is what includes the html template
	"dojo/_base/lang",
	"dijit/registry",
	"dijit/Dialog",
	"app/form/Manager",
	"app/mixins/FormManager",	
	"app/store/UIStores",
	"dojo/parser", 
	"dojo/query", 
	
	"dojox/validate",
	"dojox/validate/web",
	"dijit/form/Textarea",
	"dijit/form/TextBox",
	"dijit/form/DateTextBox",
	"app/form/FilteringSelect",
	"dijit/form/ValidationTextBox",
	"dijit/form/Button"
	
	
	],
	function(declare, on, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, template, lang, registry, Dialog, Manager, DCFormManager, UIStores, parser, query,
			Validate, Validate_web, Textarea, TextBox, DateTextBox, FilteringSelect, ValidationTextBox, Button
			){
	
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
	
	return declare("app.modules.companies.companySetup.donors.donorSetup.Identity", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, DCFormManager], {

			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template, // Our template - important!
			uiStores:UIStores.getInstance(),
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * Notice we don't use postCreate because the child widgets haven't been created yet, and we need to wait for the dgrid to attach the store to it
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				
				//this.loadEntityFromHash = false;
				
				// get a reference to the form and set the storeUrl on it ( the store to which this form would commit data )				
				this.donorIdentityInfoForm = this.getWidget('donorIdentityInfoForm');
				this.donorIdentityInfoForm.set('storeUrl', emanda2.urls.DONOR);
				
				//configure the formManager
				this.configureForm(this.donorIdentityInfoForm);
				

				this.license_province = this.getWidget('license_province');
				//this.license_province.set('store', this.uiStores.getStates());
				this.uiStores.populateCombo(this.license_province, lang.hitch(this.uiStores, "getStates"));
			},

			
			
			onActivate:function(){
    			this.inherited(arguments);	
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}	    			
				this.viewInForm(emanda2.entities.getCurrentDonor(), this.donorIdentityInfoForm);
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
