define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",	
	"dojo/on",
	"dojo/_base/lang",		
	"dojo/text!./templates/PDFPreview.html", // this is what includes the html template
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule"
	],
	function(declare, domClass, domConstruct, domStyle, on, lang, template, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule){
		
		return declare("app.uicomponents.PDFPreview", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule], {
			title:'Document Preview',
			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template,
			_contentURL: null,
			
			startup:function(){
				this.inherited(arguments);

				this._contentLoader = this.getWidget("contentLoader");
				this._submitBtn = this.getWidget("_submitBtn");
				this._closeBtn = this.getWidget("_closeBtn");

				if(this._contentURL != null){
					this.updateContentLoader();
				}

				if(typeof(this.submitButtonLabel) == "string" && this.submitButtonLabel != null){
					this._submitBtn.set("label", this.submitButtonLabel)
				}

			},


			_setContentURLAttr:function(value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
				this._contentURL = value;
				this.updateContentLoader();
			},

			onActivate:function(){
				this.inherited(arguments);
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}

				this.eventHandlers.push( on( this._submitBtn, "click", lang.hitch(this, "submitButtonClicked")))
				this.eventHandlers.push( on( this._closeBtn, "click", lang.hitch(this, "closeButtonClicked")))

			},


			submitButtonClicked:function(event){
				this.runCallBack("submitClicked", this.entity);
			},

			closeButtonClicked:function(event){
				if(typeof(this.parentDialog) == "object" && this.parentDialog != null){
					this.parentDialog.hide();
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


			updateContentLoader:function(){
				if(typeof(this._contentLoader) != "undefined" && this._contentLoader != null){
					var iframeWidth = this.width;
					var iframeHeight = this.height;
					var loaderWidth = this.width;
					var loaderHeight = this.height;

					var widthNum = parseInt(this.width);
					var heightNum = parseInt(this.height);

					if(!isNaN(widthNum)){
						iframeWidth = widthNum - 20 + "px";
						loaderWidth = widthNum
					}
					if(!isNaN(heightNum)){
						iframeHeight = heightNum - 100 + "px";
						loaderHeight = heightNum - 90 + "px";
					}					

					var contentIframe = domConstruct.toDom("<iframe  src='" + this._contentURL + "' width='" + iframeWidth + "' height='" + iframeHeight + "' scrolling='no'><!-- browsers without iframe support see this --><a href='"+ this._contentURL + "'>Open content</a></iframe>")
					this._contentLoader.set("content", contentIframe);

					domStyle.set(this._contentLoader.domNode, {
						"width": loaderWidth,
						"height": loaderHeight
					})


				}
			}
			
	});
});
