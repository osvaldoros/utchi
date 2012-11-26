define([
	"dojo/_base/declare",
	"dojo/on",
	"dijit/layout/ContentPane",
	"dijit/ProgressBar",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/CompletionIndicator.html", // this is what includes the html template
	"dojo/_base/lang"
	],
	function(declare, on, ContentPane, ProgressBar, StatefulModule, template, lang){
	
	return declare("app.uicomponents.CompletionIndicator", [ContentPane, StatefulModule], {

			content: template, // Our template - important!

			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * Notice we don't use postCreate because the child widgets haven't been created yet, and we need to wait for the dgrid to attach the store to it
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
			},
			
			onActivate:function(){
			},
			
			onDeactivate:function(){
			}
			
	});
});
