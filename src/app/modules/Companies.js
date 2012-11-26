define([
	"dojo/_base/declare",
	"dojo/on",
	"dijit/_WidgetBase", 	
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/Companies.html", // this is what includes the html template
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
	"dijit/form/Button",
	"app/modules/companies/CompanyList",
	"app/modules/companies/CompanySetup",
	"app/loader/DialogLauncher",
	"app/utils/HashManager"
	],
	function(declare, on, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, 
		template, lang, registry, Dialog, GridFromHtml, Memory, Observable, Cache, JsonRest, Selection, parser, query, Button, CompanyList, CompanySetup, DialogLauncher, HashManager){
	
	return declare("app.modules.Companies", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule], {
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
				this.companyList = this.getWidget('companyList');
				this.companySetup = this.getWidget('companySetup');
			},
			
			onActivate:function(){
				this.inherited(arguments);
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}	
				this.eventHandlers.push( on(this.companyList, 'selectedEntityChange', lang.hitch(this, "onSelectCompany")) );
			},
			
			onSelectCompany:function(event){
				//console.log('Companies > onSelectCompany')
				this.companySetup.set('currentCompany', this.companyList.get('selectedEntity'))
			},
			
			setCurrentState:function(state){
				this.inherited(arguments);
				if(this.getCurrentState() == ''){
					this.hashManager.setState('list');
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
