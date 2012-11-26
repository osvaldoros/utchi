define([
	"dojo/_base/declare",
	"dojo/on",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/Type.html", // this is what includes the html template
	"dojo/_base/lang",
	"dijit/registry",
	"dijit/Dialog",
	"app/form/Manager",
	"app/mixins/FormManager",		
	"dojo/parser", 
	"dojo/query", 
	"dijit/form/CheckBox",	
	"dijit/form/ComboBox",	
	"dijit/form/Button"
	
	],
	function(declare, on, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, template, lang, registry, Dialog, Manager, DCFormManager, parser, query, CheckBox, ComboBox, Button){
	
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
	
	return declare("app.modules.companies.companySetup.Type", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, DCFormManager], {

			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template, // Our template - important!
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * Notice we don't use postCreate because the child widgets haven't been created yet, and we need to wait for the dgrid to attach the store to it
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				
				this.companyTypeForm = this.getWidget('companyTypeForm');
				this.companyTypeForm.set('storeUrl', emanda2.urls.COMPANY);
				this.configureForm(this.companyTypeForm);
				
				this.iol_contractor_box = this.getWidget('iol_contractor_box');
				this.iol_contractor_type = this.getWidget('iol_contractor_type');
				this.iol_sales_associate_box = this.getWidget('iol_sales_associate_box');
				this.iol_sales_associate_type = this.getWidget('iol_sales_associate_type');
				
				this.buttonEnableMap = {};
				this.buttonEnableMap[this.iol_contractor_box.id] = this.iol_contractor_type;				
				this.buttonEnableMap[this.iol_sales_associate_box.id] = this.iol_sales_associate_type;				
			},
			
			onActivate:function(){
				this.inherited(arguments);
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}					
				this.loadHashEntityInForm(this.companyTypeForm);
				this.eventHandlers.push( on(this.iol_contractor_box, 'click', lang.hitch(this, "enableRelatedButton")) );
				this.eventHandlers.push( on(this.iol_sales_associate_box, 'click', lang.hitch(this, "enableRelatedButton")) );
			},
			
			
			enableRelatedButton:function(event){
				var boxId = event.target.id;
				var box = this.getWidget(boxId);
				var button = this.buttonEnableMap[boxId];
				if(box.checked){
					button.set('disabled', false);
				}else{
					button.set('disabled', true);
				}
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
