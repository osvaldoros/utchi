define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/dom",
	"dojo/text!./templates/SearchDialog.html", // this is what includes the html template
	"dojo/_base/lang",
	"dijit/form/Button",

	//"dijit/Dialog",
	"app/uicomponents/Dialog",
	//"app/mixins/WidgetMap",
	"app/mixins/GridManager",
	"app/store/StoreManager"
	
	],
	function(declare, on, dom, template, lang, Button,
		Dialog, GridManager, StoreManager){
		
		return declare("app.uicomponents.SearchDialog", [Dialog, GridManager], {
			
			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			//templateString: template, // Our template - important!
			content: template,
			confirmCallback:null,
			title:"Find something",
			_gridHandlersAttached: false,
			storeManager:StoreManager.getInstance(),
			resultColumns:null,
			
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				
				this.searchGrid = this.getWidget('searchGrid');
					
				this.searchFld = this.getWidget('searchFld');
				this.selectButton = this.getWidget('selectButton');
				this.cancelButton = this.getWidget('cancelButton');
				
				var configObject = {
					grid: this.searchGrid,
					editButton: this.selectButton,
					searchFld: this.searchFld
				};
				
				this.configureGrid(configObject);
				
			},
			
			show:function(callBack){
				if(typeof(callBack) == 'function'){
					this.confirmCallback = callBack;
				}else{
					this.confirmCallback = null;
				}
				this.inherited(arguments);
				
			},
			
			onActivate:function(callBack){
				this.inherited(arguments);
				
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}					
				
				if(typeof(this.store) == "undefined" || this.store == null){
					console.warn("Unable to search, store not specified");
				}else{
					var configObject = {
						store: this.store,
						columns: this.resultColumns
					}
					this.setStore(configObject);
				}
				
				this.eventHandlers.push( on(this.cancelButton, 'click', lang.hitch(this, "onCancelClicked")) );
				
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
			
			editEntity:function(entity){
				if(typeof(entity) != "undefined" && entity != null){
					if(this.confirmCallback){
						this.confirmCallback(entity); // pass the selected entity					
					}
					this.hide();
				}
			},
			
			
			onHide:function(){
				this.inherited(arguments);
				this.confirmCallback = null;
			},
	
			onCancelClicked: function(event){
				this.hide();
			}

	});
});
