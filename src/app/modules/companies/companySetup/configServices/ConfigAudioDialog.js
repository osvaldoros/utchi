define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/text!./templates/ConfigAudioDialog.html", // this is what includes the html template
	"dojo/_base/lang",
	"dijit/registry",
	"dijit/Dialog",
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
	"dojox/form/BusyButton"
	
	],
    function(declare, on, template, lang, registry, Dialog, Button, 
			Validate, validateWeb, Form, Textarea, TextBox, TimeTextBox, DateTextBox, FilteringSelect, CheckBox, RadioButton, ValidationTextBox, CheckedMultiSelect, BusyButton
	){
		
        return declare(Dialog, {
			
			title:'Configure Audio',
 			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
            //templateString: template, // Our template - important!
			content: template,
			
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				
				this.submitAudioButton = this.getWidget('submitAudioButton');
				
				
			},
			
			onShow:function(){
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}					
				this.eventHandlers.push( on(this.submitAudioButton, 'click', lang.hitch(this, "onSubmitClicked")) );
			},
			
			onHide:function(){
				//remove event handlers
				for (var i=0; i < this.eventHandlers.length; i++) {
					var thisHandler = this.eventHandlers[i];
					if(typeof(thisHandler) != 'undefined'){
						thisHandler.remove();
					}
				};
				
				this.eventHandlers = []		
			},			
			
			onSubmitClicked: function(event){
            	this.hide();
			}
			
			 
        });
});
