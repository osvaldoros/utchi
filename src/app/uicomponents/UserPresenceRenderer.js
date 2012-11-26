define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/on",
	"dojo/_base/lang",		
	"dojo/text!./templates/UserPresenceRenderer.html", // this is what includes the html template
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"dijit/TooltipDialog",
	"dijit/popup",
	"app/mixins/WidgetMap",
	"app/utils/OrbiterManager",
	"dojo/topic"
	],
	function(declare, domClass, on, lang, template, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, TooltipDialog, popup, WidgetMap, OrbiterManager, topic){
		
		return declare("app.uicomponents.UserPresenceRenderer", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, WidgetMap], {
			templateString: template,
			orbiterManager: OrbiterManager.getInstance(),
			
			startup:function(){
				this.inherited(arguments);
				var owner = this;

				// get reference to the span we are going to use to popup the tooltip
				this.name = this.getWidget("name");
				this._nameProperty = this._nameProperty || "name";

				// create instance of the TooltipDialog
				var tooltipDialog = new TooltipDialog({
					content: "Loading...",
					onMouseLeave: function(){
						popup.close(tooltipDialog);
						owner.dialogClosed();
					}
				});
				this._tooltipDialog = tooltipDialog;

				this._activeUsersChangeHandler =  topic.subscribe("active-users-entities-change", lang.hitch(this, "activeUsersEntityChange"));
				this.updateActiveUsers();

				// wire mouse events on the span to open the tooltip
				this._hoverHandler = on(this.name, 'mouseover', lang.hitch(this, "onMoreInfoHover"));
				this._outHandler = on(this.name, 'mouseout', lang.hitch(this, "onMoreInfoOut"));

			},

			activeUsersEntityChange:function(){
				this.updateActiveUsers();
			},

			updateActiveUsers:function(){

				var entityid = this._data.id;
				if(entityid != "none"){
					var otherClientsInEntity = this.orbiterManager.getClientsThatHaveEntityOpened(entityid);
					if(otherClientsInEntity.length > 0 ){
						var userNames = [];
						for (var i = otherClientsInEntity.length - 1; i >= 0; i--) {
							var client = otherClientsInEntity[i];
							userNames.push(client.getAttribute("displayUsername", this.orbiterManager.systemRoomName ));
						};
					}
				}

				this.renderItem(userNames);
				this._tooltipDialog.set("content", this.getContent(userNames));
			},


			renderItem:function(userNames){
				if(lang.isArray(userNames)){
					if(userNames.length == 0){
						this.name.innerHTML = "";
					}else if(userNames.length == 1){
						this.name.innerHTML = userNames[0];
					}else{
						this.name.innerHTML = userNames.length + " users";
					}
				}else{
					this.name.innerHTML = "";
				}
			},

			getContent:function(userNames){
				var objectInfo = "";
				objectInfo += "<div class='moreInfo'>";
					objectInfo += "<ul>";
					for(var p in userNames){
						objectInfo += "<li>"+userNames[p]+"</li>";
					}
					objectInfo += "</ul>";
				objectInfo += "</div>";

				return objectInfo;
			},

			onMoreInfoHover:function(){
				this._hovering = true;
				if(this._dialogOpened){
					this.popToolTip();
				}else{
					setTimeout(lang.hitch(this, "popToolTip"),500);
				}
			},

			popToolTip:function(){
				if(this._hovering || this._dialogOpened){
					popup.open({
						popup: this._tooltipDialog,
						around: this.name,
						orient:["above", "above-centered", "after-centered"]
					})
					this._dialogOpened = true;
				}
			},

			dialogClosed:function(){
				this._dialogOpened = false;
			},

			onMoreInfoOut:function(){
				popup.close(this._tooltipDialog);
				this.dialogClosed();
				this._hovering = false;
			},

			destroy:function(){
				this.inherited(arguments);
				if(typeof(this._hoverHandler) == "object" && this._hoverHandler != null){
					this._hoverHandler.remove();
				}
				if(typeof(this._outHandler) == "object" && this._outHandler != null){
					this._outHandler.remove();
				}
				if(typeof(this._activeUsersChangeHandler) == "object" && this._activeUsersChangeHandler != null){
					this._activeUsersChangeHandler.remove();
				}
				if(typeof(this._tooltipDialog) == "object" && this._tooltipDialog != null){
					this._tooltipDialog.destroy();
				}
			}			

	});
});
