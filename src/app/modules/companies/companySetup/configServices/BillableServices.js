define([
	"dojo/_base/declare",
	"dojo/on",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/BillableServices.html", // this is what includes the html template
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
	"app/form/Manager",
	"app/mixins/FormManager",
	"dijit/form/CheckBox",		
	"dijit/form/Button",
	
	"app/utils/ChangeTracker"
	
	],
	function(declare, on, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, template, lang, registry, Dialog, 
		GridFromHtml, Memory, Observable, Cache, JsonRest, Selection, parser, query, Manager, DCFormManager, CheckBox, Button,
		ChangeTracker){
	
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
	
	return declare("app.modules.companies.companySetup.configServices.BillableServices", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, DCFormManager], {

			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template, // Our template - important!
			changeTracker: ChangeTracker.getInstance(),
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * Notice we don't use postCreate because the child widgets haven't been created yet, and we need to wait for the dgrid to attach the store to it
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				
				this.collectionBox = this.getWidget('collectionBox');
				this.labBox = this.getWidget('labBox');
				this.courierBox = this.getWidget('courierBox');
				this.mroBox = this.getWidget('mroBox');
				
				this.full_test = this.getWidget('full_test');

				this.billableServicesForm = this.getWidget('billableServicesForm');
				this.billableServicesForm.set('refreshUI', lang.hitch(this, "refreshFormUI"));
				
				this.billableServicesForm.set('storeUrl', emanda2.urls.COMPANY);
				this.configureForm(this.billableServicesForm)
				
			},
			
			refreshFormUI:function(value, name, element, event){
				switch(name){
					case "full_test":
						this.collectionBox.set("checked", value);
						this.changeTracker.setChange( this.storeUrl, "services[" + emanda2.entities.getCurrentCompanyService() + "].collection", value );
						this.labBox.set("checked", value);
						this.changeTracker.setChange( this.storeUrl, "services[" + emanda2.entities.getCurrentCompanyService() + "].lab", value );
						this.courierBox.set("checked", value);
						this.changeTracker.setChange( this.storeUrl, "services[" + emanda2.entities.getCurrentCompanyService() + "].courier", value );
						this.mroBox.set("checked", value);
						this.changeTracker.setChange( this.storeUrl, "services[" + emanda2.entities.getCurrentCompanyService() + "].mro", value );
					break;
					case "collection":
					case "lab":
					case "courier":
					case "mro":
						this.updateFullTestBox();
					break;
				}
				
			},
			
			updateFullTestBox:function(){
				this.full_test.set("checked", this.collectionBox.checked && this.labBox.checked && this.courierBox.checked && this.mroBox.checked);
			},
			
			onActivate:function(){
				this.inherited(arguments);
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}					
				var owner = this;
				var res = emanda2.entities.getEntityFromHash(emanda2.urls.COMPANY, function(company){
					var arrayPropIndexes = {services:emanda2.entities.getCurrentCompanyService()};
					owner.viewInForm(company, owner.__form, arrayPropIndexes)
					owner.updateFullTestBox();
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
				
				this.eventHandlers = []				
			}
	});
});
