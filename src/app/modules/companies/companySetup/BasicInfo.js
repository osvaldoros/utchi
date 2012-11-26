define([
	"dojo/_base/declare",
	"dojo/on",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/BasicInfo.html", // this is what includes the html template
	"dojo/_base/lang",
	"dojo/_base/Deferred",
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
	"dijit/form/Button",
	
	"dojox/validate",
	"dojox/validate/web",
	"app/form/Manager",
	"app/mixins/FormManager",
	"dijit/form/Textarea",
	"dijit/form/TextBox",
	"dijit/form/TimeTextBox",
	"dijit/form/DateTextBox",
	"dijit/form/Select",
	"dijit/form/ComboBox",
	"app/form/FilteringSelect",
	"dijit/form/CheckBox",
	"dijit/form/RadioButton",
	"dijit/form/ValidationTextBox",
	
	"dojox/form/CheckedMultiSelect",
	"dojox/form/BusyButton",
	
	"app/store/UIStores",
	"app/uicomponents/Map",
	"app/modules/companies/companySetup/salesReps/SalesRepDialog"
	
	
	],
	function(declare, on, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, template, lang, Deferred, registry, Dialog, GridFromHtml, Memory, Observable, Cache, JsonRest, Selection, parser, query, Button,
			Validate, Validate_web, Manager, DCFormManager, Textarea, TextBox, TimeTextBox, DateTextBox, Select, ComboBox, FilteringSelect, CheckBox, RadioButton, ValidationTextBox, CheckedMultiSelect, BusyButton,
			UIStores, Map, SalesRepDialog){
	
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
	
	return declare("app.modules.companies.companySetup.BasicInfo", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, DCFormManager], {

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
				
				// get a reference to the form and set the storeUrl on it ( the store to which this form would commit data )				
				this.companyBasicInfoForm = this.getWidget('companyBasicInfoForm');
				this.companyBasicInfoForm.set('storeUrl', emanda2.urls.COMPANY);
				this.companyBasicInfoForm.set('refreshUI', lang.hitch(this, "refreshFormUI"));
				
				//configure the formManager
				this.configureForm(this.companyBasicInfoForm);
				

				this.loc = this.getWidget('loc');
				
				this.street1 = this.getWidget('street1');
				this.city = this.getWidget('city');
				this.country = this.getWidget('country');
				
				this.province = this.getWidget('province');
				this.mail_province = this.getWidget('mail_province');
				this.province.set('store', this.uiStores.getStates());
				this.mail_province.set('store', this.uiStores.getStates());
				
				
				this.salesRepButton = this.getWidget('salesRepButton');
				this.salesRepDialog = new SalesRepDialog();
				
			},
			
			onSalesRepClicked:function(){
				this.salesRepDialog.show();
			},
			
			
			refreshFormUI:function(value, name, element, event){
				//console.log('Form needs to be refreshed');
				switch(name){
					case 'street1':
					case 'city':
					case 'province':
					case 'country':
						var address = this.street1.value + " " + this.city.value + " " + this.province.value + " " + this.country.value;
						//console.log("Geocode address = " + address);
						this.loc.set("value", address);
					break;
				}
			},
			
			onActivate:function(){
    			this.inherited(arguments);	
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}		    			
    			this.loadHashEntityInForm(this.companyBasicInfoForm);	
				this.eventHandlers.push( on(this.salesRepButton, 'click', lang.hitch(this, "onSalesRepClicked")) );
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
			},
			
			
			destroy:function(){
    			this.inherited(arguments);	
    			
				this.salesRepDialog.destroyDescendants();
				this.salesRepDialog.destroy();
			}
	});
});
