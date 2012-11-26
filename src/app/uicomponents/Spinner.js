define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/on",
	"dojo/_base/lang",		
	"dojo/text!./templates/Spinner.html", // this is what includes the html template
	"dijit/_WidgetBase", 
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin"
	],
	function(declare, domClass, on, lang, template, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin){
		
		return declare("app.uicomponents.Spinner", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
			title:'Spinner',
			widgetsInTemplate: false, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template,
			spinning:false,
			jsonRequests:0,
			
			startup:function(){
				this.inherited(arguments);
				this.hide();
			},
			
			spin:function(){
				if(this.jsonRequests == 0){
					this.__spin();
				}
				this.jsonRequests++;				
			},

			__spin:function(){
				if(!this.spinning){
					this.show();
					this.spinning = true;
				}
			},
			
			unspin:function(){
				if(this.jsonRequests > 0){
					this.jsonRequests--;
				}
				
				if(this.jsonRequests == 0){
					this.__unspin();
				}				
			},

			__unspin:function(){
				if(this.jsonRequests == 0){
					if(this.open){
						this.hide();	
					}
					this.spinning = false;
				}
			},
			
			show:function(){
				this.domNode.style.display = "block";
				this.open = true
			},
			
			hide:function(){
				this.domNode.style.display = "none";
				this.open = false;
			}
			
	});
});
