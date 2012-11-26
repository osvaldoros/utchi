define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/topic",
	"dijit/form/_FormWidget",
	"app/mixins/WidgetMap",
	"dijit/Editor",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./templates/Editor.html", // this is what includes the html template
	"dojo/_base/lang",
	"dojo/dom-style"	
	],
	function(declare, on, topic, _FormWidget, WidgetMap, Editor, _WidgetsInTemplateMixin, template, lang, domStyle){
	
	return declare("app.uicomponents.Editor", [_FormWidget, _WidgetsInTemplateMixin, WidgetMap], {

			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template, // Our template - important!
			_editorReady:false,
			editorHeight:'180px',


			startup:function(){
				this.inherited(arguments);

				this._editor = new Editor({height:this.editorHeight});
				this._editor.placeAt(this.domNode);
				
				var owner = this;
				this._editor.onLoadDeferred.then(function(){
					if(owner._pendingValue){
						owner._editor.set("value", owner._pendingValue);
					}
					
					owner._editor.onChange = lang.hitch(owner, "onEditorChange")
					owner._editorReady = true;
				})
				
			},
			
			onEditorChange:function(newContent){
				this.onChange();
			},
			
			/**
			 * 
			 * 
			 */
			_setValueAttr: function(value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
				this.inherited(arguments);
				if(this._editorReady){
					this._editor.set("value", value);
				}else{
					this._pendingValue = value;
				}
			},			
			
			
			/**
			 * 
			 * 
			 */
			_getValueAttr: function(){
				this.inherited(arguments);
				return this._editor.get("value");
			}	
			
			
			
	});
});
