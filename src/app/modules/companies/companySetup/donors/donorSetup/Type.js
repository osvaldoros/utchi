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
	"app/utils/ChangeTracker",
	"dojo/parser", 
	"dojo/query", 
	"dijit/form/CheckBox",	
	"dijit/form/ComboBox",	
	"dijit/form/Button"
	
	],
	function(declare, on, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, template, lang, registry, Dialog, Manager, DCFormManager, ChangeTracker, parser, query, CheckBox, ComboBox, Button){
	
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
	
	return declare("app.modules.companies.companySetup.donors.donorSetup.Type", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, DCFormManager], {

			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template, // Our template - important!
			changeTracker:ChangeTracker.getInstance(),
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * Notice we don't use postCreate because the child widgets haven't been created yet, and we need to wait for the dgrid to attach the store to it
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				if(typeof(this.govAdminBoxes) == "undefined"){
					this.govAdminBoxes = [];
				}					
				this.loadEntityFromHash = false;
				
				this.govAdminBoxes.push(this.getWidget('faaBox'));
				this.govAdminBoxes.push(this.getWidget('fmcsaBox'));
				this.govAdminBoxes.push(this.getWidget('fraBox'));
				this.govAdminBoxes.push(this.getWidget('ftaBox'));
				this.govAdminBoxes.push(this.getWidget('phmsaBox'));
				this.govAdminBoxes.push(this.getWidget('uscgBox'));
				
				
				
				this.donorTypeForm = this.getWidget('donorTypeForm');
				this.donorTypeForm.set('storeUrl', emanda2.urls.DONOR);
				this.donorTypeForm.set('refreshUI', lang.hitch(this, "refreshFormUI"));
				this.configureForm(this.donorTypeForm);
				
			},
			
			
			refreshFormUI:function(value, name, element, event){
				
				var govAdminArray = [];
				for (var i=0; i < this.govAdminBoxes.length; i++) {
					var box = this.govAdminBoxes[i];
					if(box.checked){
						govAdminArray.push({id:box.value/*, name:box.name*/});
					}
				};
				
				
				this.changeTracker.setChange(emanda2.urls.DONOR, "gov_admins", govAdminArray)
			},
			
			onActivate:function(){
				this.inherited(arguments);
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}					
				this.viewInForm(emanda2.entities.getCurrentDonor(), this.donorTypeForm);
				this.updateGovAdmins(emanda2.entities.getCurrentDonor())
			},
			
			updateGovAdmins:function(donor){
				if(donor != null && typeof(donor.gov_admins) != "undefined"){
					for (var i=0; i < donor.gov_admins.length; i++) {
						var govAdmin = donor.gov_admins[i];
						for (var j=0; j < this.govAdminBoxes.length; j++) {
							var box = this.govAdminBoxes[j];
							////console.log(box);
							if(box.value == govAdmin.id){
								box.set("checked", true)
							}
						}
					}
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
