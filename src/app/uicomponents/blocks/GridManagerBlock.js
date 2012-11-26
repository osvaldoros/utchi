define([
	"dojo/_base/declare",
	"dojo/on",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",
	"app/mixins/GridManager",	
	"app/utils/HashManager",
	"dojo/text!./templates/GridManagerBlock.html", // this is what includes the html template
	"dojo/_base/lang",
	"dijit/form/Button",
	"dojo/dom-style"
	],
	function(declare, on, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, GridManager, HashManager, template, lang, Button, domStyle){
	
	return declare("app.uicomponents.blocks.GridManagerBlock", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, GridManager], {
			
			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template, // Our template - important!
			hashManager: HashManager.getInstance(),
			
			_firstActivation:true,
			_store:undefined,
			_columns:undefined,
			_updateStateHash:"dialogsetup",
			_base_query:undefined,
			_entityLabel:undefined,

			_showAddBtn:true,
			_showEditBtn:true,
			_showDeleteBtn:true,
			_requiredPermissions:null,

			startup:function(){
				this.inherited(arguments);
				
				this._grid = this.getWidget("_grid");
				this._searchFld = this.getWidget("_searchFld");
				this._addBtn = this.getWidget("_addBtn");
				this._editBtn = this.getWidget("_editBtn");
				this._deleteBtn = this.getWidget("_deleteBtn");

				this.showOrHideButtons();
				
				if(typeof(this._entityLabel) == "string"){
					this._addBtn.set("label", this._addBtn.label + " " + this._entityLabel);
					this._editBtn.set("label", this._editBtn.label + " " + this._entityLabel);
					this._deleteBtn.set("label", this._deleteBtn.label + " " + this._entityLabel);
				}

				if(typeof(this._addBtnLabel) == "string"){
					this._addBtn.set("label", this._addBtnLabel);
				}				
				if(typeof(this._editBtnLabel) == "string"){
					this._editBtn.set("label", this._editBtnLabel);
				}				
				if(typeof(this._deleteBtnLabel) == "string"){
					this._deleteBtn.set("label", this._deleteBtnLabel);
				}
				
				var configObject ={
					grid:this._grid,
					editButton: this._editBtn,
					deleteButton:this._deleteBtn,
					searchFld: this._searchFld
				}
				
				configObject.gridSelectionChangeCallBack = lang.hitch(this, "gridSelectionChangeCallBackStub");

				if(typeof(this._requiredPermissions) == "object" && this._requiredPermissions != null){
					configObject.requiredPermissions = this._requiredPermissions;
				}				
				if(typeof(this._selectionMode) != "undefined"){
					configObject.selectionMode = this._selectionMode;
				}
				if(typeof(this._store) != "undefined"){
					configObject.store = this._store;
				}
				if(typeof(this._columns) != "undefined"){
					configObject.columns = this._columns;
				}
				if(typeof(this._base_query) != "undefined"){
					configObject.base_query = this._base_query;
				}
				
				if(typeof(this.title) == "string"){
					this.title_node.innerHTML = this.title;
				}
				
				
				if(typeof(this.gridHeight) != "undefined"){
					domStyle.set(this._grid.domNode, {
						"height": this.gridHeight
					})
				}
				
				// setup the GridManager mixin
				this.configureGrid(configObject)
				
			},
			
			onActivate:function(){
				this.inherited(arguments);

				
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}	
				
				this.eventHandlers.push( on(this._addBtn, 'click', lang.hitch(this, "onAddClicked")) );
				// editButton, deleteButton, searchField and Grid events handled by GridManager

				if(!this._firstActivation){
					this.refresh();
				}


				this._firstActivation = false;
			},
			
			_setStoreOptionsAttr:function(value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
				this.setStore(value); // value should be a configObject that can contain a store and columns
			},

			gridSelectionChangeCallBackStub:function(data){
				if(typeof(this.gridSelectionChangeCallBack) == "function"){
					this.gridSelectionChangeCallBack(data);
				}
			},
			
			onDeactivate:function(){
				this.inherited(arguments);
				//remove event handlers
				for (var i=0; i < this.eventHandlers.length; i++) {
					var thisHandler = this.eventHandlers[i];
					if(typeof(thisHandler) != 'undefined'){
						thisHandler.remove();
					}
				};
				
				this.eventHandlers = []				
			},

			showOrHideButtons:function(){

				if(this._showAddBtn == true){
					this._addBtn.domNode.style.display = "";
				}else{
					this._addBtn.domNode.style.display = "none";
				}

				if(this._showEditBtn == true){
					this._editBtn.domNode.style.display = "";
				}else{
					this._editBtn.domNode.style.display = "none";
				}

				if(this._showDeleteBtn == true){
					this._deleteBtn.domNode.style.display = "";
				}else{
					this._deleteBtn.domNode.style.display = "none";
				}

			},
			
			
			onAddClicked: function(event){
				this.hashManager.setHash(this.hashManager.getModule() + '/' + this._updateStateHash + '/new/_step_0');
			},
			
			// invoked by GridManager mixin
			editEntity:function(entity){
				this.hashManager.setHash(this.hashManager.getModule() + '/' + this._updateStateHash + '/' + entity.id + '/_step_0')
			},		
			
			destroy:function(){
				this._grid.destroy();
				this.inherited(arguments);
			},
			
			resize : function(){
				this.inherited(arguments);
				this._grid.resize();
			}
			
	});
});
