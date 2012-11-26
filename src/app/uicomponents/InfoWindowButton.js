define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/on",
	"dojo/topic",
	"dojo/_base/lang",		
	"dojo/text!./templates/InfoWindowButton.html", // this is what includes the html template
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"dijit/form/Button",
	"app/mixins/WidgetMap"
	],
	function(declare, domClass, on, topic, lang, template, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Button, WidgetMap){
		
		return declare("app.uicomponents.InfoWindowButton", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, WidgetMap], {
			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template,
			
			startup:function(){
				this.inherited(arguments);
				
				this._button = this.getWidget("_button");
				this._buttonHandler = on(this._button, "click", lang.hitch(this, "onButtonClicked"))
			},
			
			onButtonClicked:function(event){
				topic.publish(this.topicName, this.data);
			},
			
			destroy:function(){
				this.inherited(arguments);
				if(typeof(this._buttonHandler) != "undefined" && this._buttonHandler != null){
					this._buttonHandler.remove();				
				}
			}
			
			
	});
});
