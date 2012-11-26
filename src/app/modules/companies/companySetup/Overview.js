define([
	"dojo/_base/declare",
	"dojo/on",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/Overview.html", // this is what includes the html template
	"dojo/_base/lang",
	"dijit/registry",
	"dijit/Dialog",
	"dojo/io/script",
	
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
	"dijit/form/Form",
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
	"app/uicomponents/Map"
	
	
	],
	function(declare, on, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, template, lang, registry, Dialog, script, GridFromHtml, Memory, Observable, Cache, JsonRest, Selection, parser, query, Button,
			Validate, Form, Textarea, TextBox, TimeTextBox, DateTextBox, FilteringSelect, CheckBox, RadioButton, ValidationTextBox, CheckedMultiSelect, BusyButton, Map){
	
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
	
	return declare("app.modules.companies.companySetup.Overview", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule], {

			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template, // Our template - important!
			
			// startup:function(){
				// this.inherited(arguments);
			// },
			
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
    			this.inherited(arguments);				
			}
	});
});
