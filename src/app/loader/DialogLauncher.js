define([
	"dojo/_base/declare",
	"require",
	"dojo/on",
	"dijit/layout/ContentPane",
	"dojo/_base/lang",
	"app/utils/HashManager",	
	"app/uicomponents/Dialog",
	"app/mixins/StatefulModule",
	"dojo/aspect",
	"dojo/dom-style"
	
	],
	function(declare, require, on, ContentPane,  lang, HashManager, Dialog, StatefulModule, aspect, domStyle){
		
		return declare("app.loader.DialogLauncher", [ContentPane, StatefulModule], {
			
			hashManager: HashManager.getInstance(),
			
			postMixInProperties: function(){
				this.inherited(arguments);
	
				if(typeof(this.module_url) != 'undefined') this.moduleURL = this.module_url;
				if(typeof(this.name) != 'undefined') this.title = this.name;
				
			},
			
			buildRendering:function(){
				this.inherited(arguments);
				var owner = this;
				if(typeof(owner.module) == 'undefined' && typeof(this.moduleURL) !== 'undefined'){
					require([this.moduleURL], function(Module){
						owner.instantiateModule(Module);
					});
				}
			},
			
			instantiateModule:function(Module){
				var initObject = {usedLoader:true}
				if(typeof(this.dialogWidth) != "undefined"){
					initObject.width = this.dialogWidth;
				}
				if(typeof(this.dialogHeight) != "undefined"){
					initObject.height = this.dialogHeight;
				}
				this.module = new Module(initObject);
				this.module.topModule = (typeof(this.topModule) != 'undefined');
				if((typeof(this.hash) != 'undefined')) this.module.hashId = this.hash;
				if((typeof(this.stateHashFunction) != 'undefined')) this.module.stateHashFunction = this.stateHashFunction; // a string corresponding to a function in HashManager such as setState or setEntity
				if((typeof(this.onActivateCallBack) != 'undefined')) this.module.onActivateCallBack = this.onActivateCallBack; // a function to call upon activation
				if((typeof(this.permissions) != 'undefined')) this.module.permissions = this.permissions;
				
				

				this._dialog = new Dialog({
					title: this.title,
					content: this.module
				});
				var owner = this;
				this.module.parentDialog = this._dialog;
				this.module.hide = function(){
					owner._dialog.hide();
				}

				domStyle.set(this._dialog.domNode, {
					"width": this.dialogWidth,
					"height": this.dialogHeight,
					"background-color":"#ffffff"
				})


				var containerNodeStyleObject = null;

				if(typeof(this.dialogPadding) != "undefined"){
					if(containerNodeStyleObject == null) containerNodeStyleObject = {};
					containerNodeStyleObject.padding = this.dialogPadding;
				}

				if(containerNodeStyleObject != null){
					domStyle.set(this._dialog.containerNode, containerNodeStyleObject)
				}
				
				aspect.after(this._dialog, "onHide", lang.hitch(this, "dialogClosed"));
				
				if(typeof this.module.updateState != 'undefined'){
					this.module.set('repositionAfterUpdate', false);
					aspect.after(this.module, "updateState", lang.hitch(this, "repositionDialog"));
				}
			},
			
			setCurrentState:function(value){
				this.inherited(arguments);
				if(this._dialog && typeof(this._dialog.setCurrentState) != 'undefined'){
					this._dialog.setCurrentState(value);
				}
								
			},
			
			repositionDialog:function(){
				if(this._dialog){
					this._dialog.layout();
				}
			},
			
			dialogClosed:function(){
				if(this.updateHash){
					if(typeof(this.closeToHash) == "string"){
						this.hashManager.setHash(this.closeToHash);
					}else{
						this.hashManager.dropHashItemsAfterNumber(0);
					}
					
				}
				//emanda2.spinner.unspin()
				this.updateHash = false;
			},
			
			onActivate:function(){
				this.inherited(arguments);
				if(this._dialog){
					this._dialog.show()
				}
				
				this.updateHash = true;
			},
			
			onDeactivate:function(){
				this.inherited(arguments);
				if(this._dialog){
					this.updateHash = false;
					this._dialog.hide()
				}				
			}
			

	});
});
