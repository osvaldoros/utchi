define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/text!./templates/ConfigRandomDialog.html", // this is what includes the html template
	"dojo/_base/lang",
	"dijit/registry",
	"dijit/Dialog",
	"dijit/form/Button",
	
	"dojox/validate",
	"dojox/validate/web",
	"app/form/Manager",
	"app/mixins/FormManager",	
	"dijit/form/Textarea",
	"dijit/form/TextBox",
	"dijit/form/TimeTextBox",
	"dijit/form/DateTextBox",
	"app/form/FilteringSelect",
	"dijit/form/CheckBox",
	"dijit/form/ComboBox",
	"dijit/form/RadioButton",
	"dijit/form/ValidationTextBox",
	
	"dojox/form/CheckedMultiSelect",
	"dojox/form/BusyButton"
	
	
	],
    function(declare, on, template, lang, registry, Dialog, Button, 
			Validate, validate_web, Manager, DCFormManager, Textarea, TextBox, TimeTextBox, DateTextBox, FilteringSelect, CheckBox, ComboBox, RadioButton, ValidationTextBox, CheckedMultiSelect, BusyButton
	){
		
        return declare([Dialog, DCFormManager], {
			
			title:'Configure Random Selection',
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
				
				this.submitRandomButton = this.getWidget('submitRandomButton');
				
			},
			
			onShow:function(){
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}					
				this.eventHandlers.push( on(this.submitRandomButton, 'click', lang.hitch(this, "onSubmitClicked")) );
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
