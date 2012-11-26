define([
	"dojo/_base/declare",
	"dojo/on",
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/WizardManagerBlock.html", // this is what includes the html template
	"dojo/_base/lang",
	
	"dijit/form/Button",
	"app/form/ArrowButton",
	"dijit/layout/TabContainer",
	"dijit/layout/ContentPane",
	
	"app/utils/HashManager",
	"app/mixins/WizardManager",
	"app/layout/FloatingPane",
	"dojo/dom-style",
	"app/uicomponents/Notes"
	],
	function(declare, on, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, template, lang, Button, ArrowButton, TabContainer, ContentPane,   
			HashManager, WizardManager, FloatingPane, domStyle, Notes){
	
	
	return declare("app.uicomponents.blocks.WizardManagerBlock", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, WizardManager], {

			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template, // Our template - important!
			hashManager: HashManager.getInstance(),
			_inheritOnActivate:true,
			_hashManagement: null,
			_entityLabel:undefined,
			_showInstructions:false,
			_showNotes:false,
			_showCancelBtn:false,
			_notesStoreURL:null,
			
			
			// The constructor
		    constructor: function(args){
		        declare.safeMixin(this,args || {});
		        this._hashManagement = {
					setHashFunction: "setEntityState",
					getHashFunction: "getEntityState"
				}
				this._steps = [];
		    },
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * Notice we don't use postCreate because the child widgets haven't been created yet, and we need to wait for the dgrid to attach the store to it
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				this._tabs = this.getWidget("_tabs");
				this._prevBtn = this.getWidget("_prevBtn");
				this._nextBtn = this.getWidget("_nextBtn");
				this._saveBtn = this.getWidget("_saveBtn");
				this._cancelBtn = this.getWidget("_cancelBtn");
				this._modified_label = this.getWidget("_modified_label");
				this._users_active_label = this.getWidget("_users_active_label");
				
				// instructions
				this._instructionsBtn = this.getWidget("_instructionsBtn");
				this._instructions = this.getWidget("_instructions");
				this.instructionsWidget = this.getWidget("instructionsWidget");

				// notes
				this._notesBtn = this.getWidget("_notesBtn");
				this._notes = this.getWidget("_notes");
				this.notesWidget = this.getWidget("notesWidget");

				this.title_div = this.getWidget("title_div");

				if(typeof(this.title_div.id) == "undefined" || this.title_div.id == ""){
					this.title_div.id = this.id + "_title_div";
				}				

				if(typeof(this._entityLabel) == "string"){
					this._cancelBtn.set("label", this._cancelBtn.label + " " + this._entityLabel);
				}
				
				this._instructions.resize({w:400, h:500});
				this._instructions.hide();
				
				this._notes.resize({w:400, h:500});
				this._notes.hide();
				
				
				var wizardConfig = {
					tabs: this._tabs,
					steps: this._steps,
					statusLabel: this._modified_label,
					activeUsersLabel: this._users_active_label,
					storeUrl: this._store,
					previousButton: this._prevBtn,
					nextButton: this._nextBtn,
					saveButton: this._saveBtn
				}
				if(typeof(this._hashManagement) != "undefined" && this._hashManagement != null){
					wizardConfig.hashManagement = this._hashManagement;
				}
				
				this.configureWizard(wizardConfig);
			},
			
			
			entityCreated:function(entity){
				this.reconfigureWizard(entity)
				this.title_node.innerHTML = entity.name;
			},
			
			onActivate:function(){
				
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}
				
				if(typeof(this._instructionsBtn) != 'undefined' && this._instructionsBtn != null) this.eventHandlers.push( on(this._instructionsBtn, 'click', lang.hitch(this, "onInstructionsBtnClicked")) );
				if(typeof(this._notesBtn) != 'undefined' && this._notesBtn != null) this.eventHandlers.push( on(this._notesBtn, 'click', lang.hitch(this, "onNotesBtnClicked")) );
				if(typeof(this._cancelBtn) != 'undefined' && this._cancelBtn != null) this.eventHandlers.push( on(this._cancelBtn, 'click', lang.hitch(this, "onCancelBtnClicked")) );
				
				if(this._inheritOnActivate == true){
					if(typeof(this._hashManagement) != "undefined" && this._hashManagement != null){
						var entityId = this.hashManager.getEntity();
						var owner = this;
						var res = emanda2.entities.withEntity(entityId, this._store, function(entity){
							owner.reconfigureWizard(entity)
							owner.renderWizardTitle(entity);
						});
						
						if(!res){
							this.reconfigureWizard(null);
							this.title_node.innerHTML = "New " + this._entityLabel;
						}
					}
				}
				// this causes WizardManager to build the tabs
				this.inherited(arguments);
			},

			renderWizardTitle:function(entity){
				this.title_node.innerHTML = entity.name;
			},
			
			refreshButtons:function(){
				this.inherited(arguments);
				if(this._showInstructions == true){
					this._instructionsBtn.domNode.style.display = '';
				}else{
					this._instructionsBtn.domNode.style.display = 'none';
				}
				if(this._showNotes == true){
					this._notesBtn.domNode.style.display = '';
				}else{
					this._notesBtn.domNode.style.display = 'none';
				}

				if(this._showCancelBtn == true){
					this._cancelBtn.domNode.style.display = '';
				}else{
					this._cancelBtn.domNode.style.display = 'none';
				}
			},
			
			getBookingInstructions:function(){
				//override me!
			},

			onCancelBtnClicked:function(){
				if(typeof(this._cancelConfirmMessage) != "undefined"){
					emanda2.confirmDialog.set("confirmMessage", this._cancelConfirmMessage);
				}else{
					emanda2.confirmDialog.set("confirmMessage", 'Are you sure you want to cancel this ' + this._entityLabel + ' ?');
				}
				emanda2.confirmDialog.show(lang.hitch(this, "cancelConfirmed"));
			},

			cancelConfirmed:function(){
				//override me!
			},
			
			onInstructionsBtnClicked:function(event){
				this.getBookingInstructions();
				if(this._instructions.__isShowing){
					this._instructions.hide();
				}else{
					this._instructions.show();
				}
			},
			
			onNotesBtnClicked:function(event){
				if(this._notes.__isShowing){
					this._notes.hide();
				}else{
					this._notes.show();
					this._notes.bringToTop();
				}
			},
			
			updateTitle:function(entity){
				if(entity != null){
					this.title_node.innerHTML = entity.name;
				}else{
					this.title_node.innerHTML = "New " + this._entityLabel;
				}
			},
			
			onDeactivate:function(){
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}				
				//remove event handlers
				for (var i=0; i < this.eventHandlers.length; i++) {
					var thisHandler = this.eventHandlers[i];
					if(typeof(thisHandler) != 'undefined'){
						thisHandler.remove();
					}
				};
				
				this.inherited(arguments);
				this.eventHandlers = []				
			}

	});
});
