/**
 * This class extends dijit/form/Form to prevent the form from being submitted, we don't ever want to actually submit ajax forms, instead we use xhr or stores to submit them
 * 
 */
define([ 
	'dojo/_base/declare', 
	'dijit/form/Button',
	"dojo/dom-class",
	"dojo/text!dijit/form/templates/DropDownButton.html" 
	], function (declare, Button, domClass, template) {
    return declare('app.form.ArrowButton', Button, {
    	
		baseClass : "dijitDropDownButton",
		templateString: template,
		pointsTo: ["after"],
		//pointsTo: ["below","above"],
		
		buildRendering: function(){
			this.inherited(arguments);

			this._buttonNode = this._buttonNode || this.focusNode || this.domNode;
			// Add a class to the "dijitDownArrowButton" type class to _buttonNode so theme can set direction of arrow
			// based on where drop down will normally appear
			var defaultPos = {
					"after" : this.isLeftToRight() ? "Right" : "Left",
					"before" : this.isLeftToRight() ? "Left" : "Right",
					"above" : "Up",
					"below" : "Down",
					"left" : "Left",
					"right" : "Right"
			}[this.pointsTo[0]] || this.pointsTo[0] || "Down";
			domClass.add(this._arrowWrapperNode || this._buttonNode, "dijit" + defaultPos + "ArrowButton");
		}
		
		
	});
});
