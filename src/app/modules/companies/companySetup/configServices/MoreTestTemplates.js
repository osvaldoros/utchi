define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/text!./templates/MoreTestTemplates.html", // this is what includes the html template
	"dojo/_base/lang",
	"dijit/registry",
	"app/mixins/StatefulModule",
	"dijit/TooltipDialog"
	],
	function(declare, on, template, lang, registry, StatefulModule, TooltipDialog){
		
		return declare("app.modules.companies.companySetup.configServices.MoreTestTemplates", [TooltipDialog, StatefulModule], {

			title:'More Test Reasons',
 			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
            //templateString: template, // Our template - important!
			content: template,
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * Notice we don't use postCreate because the child widgets haven't been created yet, and we need to wait for the dgrid to attach the store to it
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				
				this.testReasonGrid = this.getWidget('testReasonGrid');
			},
			
			onActivate:function(){
				this.inherited(arguments);
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
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
			},
			
			destroy:function(){
				if(typeof(this.testReasonGrid) != 'undefined' && this.testReasonGrid != null) this.testReasonGrid.destroy();
				this.inherited(arguments);
			}
	});
});
