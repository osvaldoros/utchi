define([
	"dojo/_base/declare",
	"dojo/on",
	"dijit/_WidgetBase", 	
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/Stories.html", // this is what includes the html template
	"dojo/_base/lang",

	"app/mixins/GridManager",
	"app/utils/HashManager",
	"app/store/StoreManager"
	],
	function(declare, on, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, template, lang, GridManager, HashManager, StoreManager){
	
	return declare("app.modules.Stories", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule], {

			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template, // Our template - important!

			startup:function(){
				this.inherited(arguments);

				this._grid = this.getWidget("_grid");
				this._selectBtn = this.getWidget("_selectBtn");

				var PortableGridManager = declare([StatefulModule, GridManager]);
				
				this.storiesGridMgr = new PortableGridManager();

				var gridConfig ={
					grid:this._grid, 
					editButton: this._selectBtn,
					store:[],
					editEntityCallBack: lang.hitch(this, "storySelected"),
					gridSelectionChangeCallBack: lang.hitch(this, "gridSelectionChangeCallBack")
				}	
				this.storiesGridMgr.configureGrid(gridConfig)
				
			},

			storySelected:function(story){
				console.log(story);
				HashManager.getInstance().setHash("story/view/" + story.id);
			},

			gridSelectionChangeCallBack:function(){

			},
			
			onActivate:function(){
				this.refresh();
				this.storiesGridMgr.activate();
				emanda2.entities.setCurrentComponent(this);

			},

			refresh:function(){
				var owner = this;
				var req = emanda2.api.get(emanda2.urls.LIST_STORIES);
				req.then(function(data){
					var storiesConfig = {
						store:data
					}	
					emanda2.entities.setStories( StoreManager.getInstance().getArrayStore(data) );
					owner.storiesGridMgr.setStore(storiesConfig)
				})
			},
			
			onDeactivate:function(){
				this.storiesGridMgr.deactivate();
			}
			
	});
});
