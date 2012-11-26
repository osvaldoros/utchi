define([
	"dojo/_base/declare",
	"dojo/on",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/Homebases.html", // this is what includes the html template
	"dojo/_base/lang",
	"dijit/registry",
	"dijit/Dialog",
	"dgrid/GridFromHtml", 
	"dgrid/Selection", 
	"dojo/parser", 
	"dojo/query", 
	"dijit/form/CheckBox",	
	"dijit/form/Button",
	
	"app/form/Manager",
	"app/mixins/FormManager",	
	"app/mixins/GridManager",
	"app/utils/HashManager"	
	
	],
	function(declare, on, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, template, lang, registry, Dialog, GridFromHtml, Selection, parser, query, CheckBox, Button,
			Manager, DCFormManager, GridManager, HashManager){
	
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
	
	return declare("app.modules.companies.companySetup.Homebases", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, DCFormManager, GridManager], {

			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template, // Our template - important!
			hashManager: HashManager.getInstance(),
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * Notice we don't use postCreate because the child widgets haven't been created yet, and we need to wait for the dgrid to attach the store to it
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				
				emanda2.h = this;
				
				this.has_homebases = this.getWidget('has_homebases');
				
				this.companyHomebasesForm = this.getWidget('companyHomebasesForm');
				this.companyHomebasesForm.set('storeUrl', emanda2.urls.COMPANY);
				this.configureForm(this.companyHomebasesForm);
				
				
				var homebases_url = emanda2.urls.HOMEBASE;
				
				var configObject ={
					grid:this.homebasesGrid,
					store:homebases_url,
					editButton: this.editHomebasesBtn,
					deleteButton:this.deleteHomebasesBtn,
					base_query: lang.hitch(this, "getBaseQuery")
				}	
								
				// setup the GridManager mixin
				this.configureGrid(configObject)
				
			},
			
			
			onActivate:function(){
				this.inherited(arguments);
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}						
				this.loadHashEntityInForm(this.companyHomebasesForm);
				this.eventHandlers.push( on(this.has_homebases, 'click', lang.hitch(this, "showOrHideHomebasesList")) );
			},
			
			getBaseQuery:function(){
				return {_top_org: this.hashManager.getEntity()};
			},
			
			storeDataLoaded:function(data){
				/*
				if(this.__store.total > 0){
					this.has_homebases.set('checked', true);
				}
				*/
				
				this.showOrHideHomebasesList();
			},
			
			showOrHideHomebasesList:function(event){
				if(this.has_homebases.checked){
					this.setCurrentState('homebases');
				}else{
					this.setCurrentState('');
				}
			},
			
			// override from FormManager
			viewInForm:function(object, form){
				this.inherited(arguments);
				//this.showOrHideHomebasesList();
			},
			
			// invoked by GridManager mixin
			editEntity:function(homebase){
				//does nothing
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
				this.homebasesGrid.destroy();
				this.inherited(arguments);
			}
	});
});
