define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",	
	"dojo/on",
	"dojo/_base/lang",		
	"dojo/text!./templates/Notes.html", // this is what includes the html template
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",

	"app/utils/HashManager",
	"app/utils/ChangeTracker",
	"app/form/Manager",	
	"dijit/form/Button",	
	"app/mixins/FormManager",
	"./Editor"
	],
	function(declare, domClass, domConstruct, domStyle, on, lang, template, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule,
			HashManager, ChangeTracker, Manager, Button, DCFormManager, Editor){
		
		return declare("app.uicomponents.Notes", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, DCFormManager], {
			title:'Notes',
			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template,
			hashManager: HashManager.getInstance(),
			changeTracker: ChangeTracker.getInstance(),


			_newLabel: "New note",
			_saveLabel: "Save",
			
			startup:function(){
				this.inherited(arguments);

				this.notesForm = this.getWidget('notesForm');
				this._actionBtn = this.getWidget('_actionBtn');
				this._cancelBtn = this.getWidget('_cancelBtn');
				this._noteCollection = this.getWidget('_noteCollection');

				this._actionBtn.set("label", this._newLabel);
				this.notesForm.domNode.style.display = "none";
				this._cancelBtn.domNode.style.display = "none";
				this.notesForm.set("storeUrl", emanda2.urls.ACTIVITY);

			},


			onActivate:function(){
				console.log("Notes > onActivate")
				this.inherited(arguments);
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}

				this.eventHandlers.push( on(this._actionBtn, "click", lang.hitch(this, "actionButtonHandler")));
				this.eventHandlers.push( on(this._cancelBtn, "click", lang.hitch(this, "cancelButtonHandler")));
				this.closeForm();
				this.refreshActivity();
			},

			refreshActivity:function(){
				var owner = this;
				var res = emanda2.api.list(
					// url
					emanda2.urls.ACTIVITY, 
					// callback
					function(activities){
						owner.populateNotes(activities);
					},
					// base_query
					{entity_id: this.hashManager.getEntity()}
				);
			},

			actionButtonHandler:function(event){
				switch(this._actionBtn.label){
					case this._newLabel:
						this.openForm();
					break;
					case this._saveLabel:
						this.closeForm();

						//var formValues = this.notesForm.gatherFormValues(); -- doesn't work with textEditors
						var formValues = this.changeTracker.getChangesObject(emanda2.urls.ACTIVITY)
						var req = emanda2.api.post(emanda2.urls.ACTIVITY, {
							details: formValues._notes, 
							entity_id: this.hashManager.getEntity(),
							user: {id: emanda2.user.id}
						});
						var owner = this;
						req.then(function(response){
							owner.refreshActivity();
						})

					break;
				}
			},

			cancelButtonHandler:function(){
				this.closeForm();
			},

			populateNotes:function(activities){

				var notesHtml = "";
				for (var i = activities.length - 1; i >= 0; i--) {
					var note = activities[i];

					note.title = note.activity_date + " " + note.activity_time;
					var bgColor = i % 2 != 0 ? "#FAF0E6" : "#FFFFFF";
					var borderColor = "#FFA07A";
					// add child to div

					var displayUsername;
					if(typeof(note.user) == "object" && note.user != null){
						if(typeof(note.user.name) != "undefined"){
							displayUsername = note.user.name
						}else if(typeof(note.user.username) != "undefined"){
							displayUsername = note.user.username
						}
					}else{
						displayUsername = "Anonymous";
					}

					var username;
					if(typeof(note.user) == "object" && note.user != null){
						username = note.user.display
					}else{
						username = "Anonymous"
					}

					notesHtml += "<div style='border-style:solid; border-width:1px; border-color: "+borderColor+"; background-color: "+bgColor+"; padding:5px;'>";
					notesHtml += "<span class='coloredLabel' style='float:right;'>" +note.title+ "</span>";
					notesHtml += "<span class='note_Label' style='float:left; font-weight:bold;'>" + displayUsername + " said: </span>";
					notesHtml += "<br/><br/>";
					notesHtml += "<span>" +note.details+ "</span>"
					notesHtml += "</div>";

				};

				this._noteCollection.innerHTML = notesHtml;
			},

			openForm:function(){
				this.notesForm.domNode.style.display = "";
				this._cancelBtn.domNode.style.display = "";
				this._actionBtn.set("label", this._saveLabel);
			},

			closeForm:function(){
				this.notesForm.domNode.style.display = "none";
				this._cancelBtn.domNode.style.display = "none";
				this._notes.set("value", "");
				this._actionBtn.set("label", this._newLabel);
			},

			onDeactivate:function(){
				this.inherited(arguments);
				console.log("Notes > onDeactivate")
				//remove event handlers
				for (var i=0; i < this.eventHandlers.length; i++) {
					var thisHandler = this.eventHandlers[i];
					if(typeof(thisHandler) != 'undefined'){
						thisHandler.remove();
					}
				};
				
				this.eventHandlers = []		
			}

			
	});
});
