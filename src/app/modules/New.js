define([
	"dojo/_base/declare",
	"dojo/on",
	"dijit/_WidgetBase", 	
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/New.html", // this is what includes the html template
	"dojo/_base/lang",

	"dojox/validate",
	"dojox/validate/web",
	"dijit/Editor",
	"app/uicomponents/Editor",
	"dijit/form/TextBox",
	"dijit/form/TimeTextBox",
	"dijit/form/DateTextBox",
	"app/form/FilteringSelect",
	"dijit/form/CheckBox",
	"dijit/form/RadioButton",
	"dijit/form/ValidationTextBox",

	"app/utils/HashManager"
	],
	function(declare, on, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, template, lang,
		Validate, Validate_web, Editor, DCEditor, TextBox, TimeTextBox, DateTextBox, FilteringSelect, CheckBox, RadioButton, ValidationTextBox,
		HashManager){
	
	return declare("app.modules.New", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule], {

			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template, // Our template - important!

			startup:function(){
				this.inherited(arguments);

				this.storyTitle = this.getWidget("storyTitle");
				this.storyContent = this.getWidget("storyContent");

				this.saveButton = this.getWidget("saveButton");
				
			},

			setCurrentState:function(state){
				this.inherited(arguments);
			},			
			
			onActivate:function(){
				this.inherited(arguments);
				
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}	

				this.eventHandlers.push( on(this.saveButton, "click", lang.hitch(this, "saveClicked")));
			},

			saveClicked:function(event){
				console.log("Save clicked")


				var storyObj = {
					title: this.storyTitle.get("value"),
					content: this.storyContent.get("value"),
					created_by: emanda2.user.name
				}

				var owner = this;
				var req = emanda2.api.post(emanda2.urls.ADD_STORY, storyObj);
				req.then(function(response){
					console.log(response);
					var storyId = response.result;
					owner.storyTitle.set("value", "")
					owner.storyContent.set("value", "")
					owner.parentDialog.hide();

					
					var hashMgr = HashManager.getInstance();
					hashMgr.setHash("story/view/" + storyId);
					
					var component = emanda2.entities.getCurrentComponent();
					if(typeof(component) == "object" && component != null){
						component.refresh();
					}					

				});

			},
			
			onDeactivate:function(){
				//remove event handlers
				for (var i=0; i < this.eventHandlers.length; i++) {
				  this.eventHandlers[i].remove();
				};
				
				this.eventHandlers = []
				
			}
			
	});
});
