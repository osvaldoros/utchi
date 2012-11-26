define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/dom",
	"app/workspace/Breadcrumb",
	"dijit/_WidgetBase", 	
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/Topbar.html", // this is what includes the html template
	"dojo/_base/lang",
	"dojo/_base/xhr",
	"dijit/registry",
	"dojo/parser",

	"app/utils/HashManager"
	],
	function(declare, on, dom, Breadcrumb, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, template, lang, xhr, registry, parser,
		HashManager){
	
	return declare("app.workspace.Topbar", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule], {
			hashManager:HashManager.getInstance(),
			user:'',
			
			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template, // Our template - important!

			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * Notice we don't use postCreate because the child widgets haven't been created yet, and we need to wait for the dgrid to attach the store to it
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				
				this.nameLabel = this.getWidget('nameLabel');
				this.tellButton = this.getWidget('tellButton');
				this.storiesButton = this.getWidget('storiesButton');
				this.breadcrumb = this.getWidget('breadcrumb');

				emanda2.workspaceManager.getDialogFromModuleURL("app/modules/New", {title:"New Story", dialogWidth:"500px", dialogHeight:"640px", callBack:lang.hitch(this, "dialogReady")});
				
			},

			dialogReady:function(dialog){
				this.newStoryDialog = dialog;
			},
			
			onTellClicked:function(event){

				if(typeof(this.newStoryDialog) != "undefined"){
					this.newStoryDialog.show();
				}
			},

			storiesButtonClicked:function(event){
				HashManager.getInstance().setHash("stories");
			},
			
			onActivate:function(){
				this.inherited(arguments);
				
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}

				this.eventHandlers.push( on(this.tellButton, 'click', lang.hitch(this, "onTellClicked")));
				this.eventHandlers.push( on(this.storiesButton, 'click', lang.hitch(this, "storiesButtonClicked")));

				this.nameLabel.innerHTML = emanda2.user.name;
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
