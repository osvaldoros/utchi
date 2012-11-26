define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/dom",
	"dojo/text!./templates/ConfirmDialog.html", // this is what includes the html template
	"dojo/_base/lang",
	"app/uicomponents/Dialog",
	
	"dijit/form/Button"
	
	],
	function(declare, on, dom, template, lang, Dialog, Button){
		
		return declare("app.uicomponents.ConfirmDialog", Dialog, {
			
			title:'Please confirm',
			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			//templateString: template, // Our template - important!
			content: template,
			confirmCallback:null,
			
			confirmMessage:'Are you sure punk?',
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				
				this.confirmButton = this.getWidget('confirmButton');
				this.cancelButton = this.getWidget('cancelButton');
				this.confirmDialogTitle = this.getWidget('confirmDialogTitle');
				
				
				on(this.confirmButton, 'click', lang.hitch(this, "onConfirmClicked"));
				on(this.cancelButton, 'click', lang.hitch(this, "onCancelClicked"));
				
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
				this.confirmDialogTitle.innerHTML = "<strong>" + this.confirmMessage + "</strong>";
			},
			
			onHide:function(){
				this.confirmCallback = null;
			},
	
			onConfirmClicked: function(event){
				if(this.confirmCallback){
					this.confirmCallback();					
				}
				this.hide();
			},
			
			onCancelClicked: function(event){
				this.hide();
			}

	});
});
