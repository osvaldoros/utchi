define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/dom",
	"dojo/text!./templates/Alert.html", // this is what includes the html template
	"dojo/_base/lang",
	"dijit/Dialog",

	"app/mixins/WidgetMap",
	"dijit/form/Button"
	
	],
	function(declare, on, dom, template, lang, Dialog, WidgetMap, Button){
		
		return declare("app.uicomponents.Alert", [Dialog, WidgetMap], {
			
			title:'Alert',
			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			//templateString: template, // Our template - important!
			content: template,
			confirmCallback:null,
			
			message:'You forgot to set "message" dude',
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				
				this.okButton = this.getWidget('okButton');
				this.alertTitle = this.getWidget('alertTitle');
				
				
				on(this.okButton, 'click', lang.hitch(this, "onConfirmClicked"));
				
			},
			
			show:function(callBack){
				if(typeof(callBack) == 'function'){
					this.confirmCallback = callBack;
				}else{
					this.confirmCallback = null;
				}
				this.inherited(arguments);
				
			},
			
			onShow:function(callBack){
				this.inherited(arguments);
				this.alertTitle.innerHTML = "<strong>" + this.message + "</strong>";
			},
			
			onHide:function(){
				this.confirmCallback = null;
			},
	
			onConfirmClicked: function(event){
				if(this.confirmCallback){
					this.confirmCallback();					
				}
				this.hide();
			}

	});
});
