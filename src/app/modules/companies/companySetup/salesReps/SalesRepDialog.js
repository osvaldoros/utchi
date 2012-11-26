define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/text!./templates/SalesRepDialog.html", // this is what includes the html template
	"dojo/_base/lang",
	"dijit/registry",
	"dijit/Dialog",
	"dijit/form/Button",
	
	"dojox/validate",
	"dojox/validate/web",
	"app/form/Manager",
	"app/mixins/FormManager",	
	"dijit/form/NumberSpinner",
	"dijit/form/TextBox",
	"dijit/form/TimeTextBox",
	"dijit/form/DateTextBox",
	"app/form/FilteringSelect",
	"dijit/form/CheckBox",
	"dijit/form/RadioButton",
	"dijit/form/ValidationTextBox",
	"dojox/form/CheckedMultiSelect",
	"dojox/form/BusyButton",
	"app/mixins/StatefulModule"
	
	],
	function(declare, on, template, lang, registry, Dialog, Button, 
			Validate, validateWeb, Manager, DCFormManager, NumberSpinner, TextBox, TimeTextBox, DateTextBox, FilteringSelect, CheckBox, RadioButton, ValidationTextBox, CheckedMultiSelect, BusyButton,
			StatefulModule
	){
		
        return declare([Dialog, StatefulModule, DCFormManager], {
			
			title:'Sales Reps',
 			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
            //templateString: template, // Our template - important!
			content: template,
			
		    constructor: function(args){
		        declare.safeMixin(this,args || {});
		        this.enableMap = {};
		    },			
			
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				
				this.submitSalesRepsButton = this.getWidget('submitSalesRepsButton');
				
				this.primary_sales_rep_box = this.getWidget('primary_sales_rep_box');
				this.secondary_sales_rep_box = this.getWidget('secondary_sales_rep_box');
				
				this.primary_sales_rep = this.getWidget('primary_sales_rep');
				this.primary_commission = this.getWidget('primary_commission');
				this.secondary_sales_rep = this.getWidget('secondary_sales_rep');
				this.secondary_commission = this.getWidget('secondary_commission');
				
				this.primary_sales_rep.set('disabled', true);
				this.primary_commission.set('disabled', true);
				this.secondary_sales_rep.set('disabled', true);
				this.secondary_commission.set('disabled', true);
				
				this.enableMap = {};
				this.enableMap[this.primary_sales_rep_box.id] = [this.primary_sales_rep, this.primary_commission];
				this.enableMap[this.secondary_sales_rep_box.id] = [this.secondary_sales_rep, this.secondary_commission];
				
				
			},
			
			onShow:function(){
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}						
				this.eventHandlers.push( on(this.submitSalesRepsButton, 'click', lang.hitch(this, "onSubmitClicked")) );
				
				this.eventHandlers.push( on(this.primary_sales_rep_box, 'click', lang.hitch(this, "enableRelated")) );
				this.eventHandlers.push( on(this.secondary_sales_rep_box, 'click', lang.hitch(this, "enableRelated")) );
				
			},
			
			enableRelated:function(event){
				var boxId = event.target.id;
				var box = this.getWidget(boxId);
				var relatedWidgets = this.enableMap[boxId];
				for(var i=0,j=relatedWidgets.length; i<j; i++){
					var widget = relatedWidgets[i]
					widget.set('disabled', !box.checked);
				};
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
