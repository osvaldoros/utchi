define([
	"dojo/_base/declare",
	"dojo/on",
	"app/mixins/StatefulModule",
	"dijit/_WidgetBase", 	
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin", 
	"dojo/text!./templates/Sidebar.html", // this is what includes the html template
	"dojo/_base/lang",
	"dijit/registry",
	"dojo/parser" 
	
	],
	function(declare, on, StatefulModule, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, lang, registry, parser){
	
	return declare("app.workspace.Sidebar", [StatefulModule, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

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
				
			}
			
	});
});
