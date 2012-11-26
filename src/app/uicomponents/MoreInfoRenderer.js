define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/on",
	"dojo/_base/lang",		
	"dojo/text!./templates/MoreInfoRenderer.html", // this is what includes the html template
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"dijit/TooltipDialog",
	"dijit/popup",
	"app/mixins/WidgetMap"
	],
	function(declare, domClass, on, lang, template, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, TooltipDialog, popup, WidgetMap){
		
		return declare("app.uicomponents.MoreInfoRenderer", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, WidgetMap], {
			templateString: template,
			
			startup:function(){
				this.inherited(arguments);
				var owner = this;

				// get reference to the span we are going to use to popup the tooltip
				this.name = this.getWidget("name");
				this._nameProperty = this._nameProperty || "name";
				
				this.renderItem(this._data);

				// use getContent to construct the html string that will be displayed in the tooltip
				var objectInfo = this.getContent(this._data);

				// create instance of the TooltipDialog
				var tooltipDialog = new TooltipDialog({
					content: objectInfo,
					onMouseLeave: function(){
						popup.close(tooltipDialog);
						owner.dialogClosed();
					}
				});
				this._tooltipDialog = tooltipDialog;

				// wire mouse events on the span to open the tooltip
				this._hoverHandler = on(this.name, 'mouseover', lang.hitch(this, "onMoreInfoHover"));
				this._outHandler = on(this.name, 'mouseout', lang.hitch(this, "onMoreInfoOut"));

			},


			renderItem:function(data){
				// update the text in the span to match the "name" of the data if one exists
				this.name.innerHTML = this.getName(data);
			},

			getName:function(data){
				if(!data.hasOwnProperty(this._nameProperty)){
					return "Unnamed Object";
				}

				return data[this._nameProperty];
			},

			getContent:function(data){
				var objectInfo = "";
				objectInfo += "<div class='moreInfo'>";
					objectInfo += "<h2>" + data.name + "</h2>";
					objectInfo += "<ul>";
					for(var p in data){
						objectInfo += "<li>"+p+ " : " +data[p]+"</li>";
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
				if(typeof(this._tooltipDialog) == "object" && this._tooltipDialog != null){
					this._tooltipDialog.destroy();
				}
			}			

	});
});
