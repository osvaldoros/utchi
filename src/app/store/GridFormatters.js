/**
 * 
 * StringUtils
 * 
 * Common string utils
 * 
 */
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"app/store/UIStores",
	"app/uicomponents/MoreInfoRenderer",
	"app/uicomponents/moreInfoRenderers/DonorMoreInfoRenderer",
	"app/uicomponents/moreInfoRenderers/TestMoreInfoRenderer",
	"dijit/ProgressBar"
	
	],
	function(declare, lang, UIStores, MoreInfoRenderer, DonorMoreInfoRenderer, TestMoreInfoRenderer, ProgressBar){
		
		
	var classRef = declare("app.store.GridFormatters", [], {
		//** This class since it is a pure utility doesn't need any instance members
	});
	
	//===========================================================
	// Static members
	//===========================================================
	lang.mixin(app.store.GridFormatters, {
		
		//===========================================================
		// Simple Formatters ( single string processing )
		//===========================================================
		/**
		 * hourFormatter
		 * 
		 * Given a military time it displays returns a friendlier string
		 *  
 		 * @param {Object} item
		 */
		hourFormatter:function(item){
			////console.log(item)
			var hourArray = item.split(":");
			var hour = Number(hourArray[0]);
			var minutes;
			if(hourArray.length > 1){
				minutes = Number(hourArray[1]);
			}
			var pm = false;
			if(hour >= 12){
				pm = true;
			}
			if(hour > 12){
				hour = hour - 12;
			}
			
			if(hour == 0){
				hour = 12;
			}
			
			var label = "";
			label += hour;
			if(typeof(minutes) != "undefined"){
				if(minutes < 10){
					minutes = "0" + minutes;
				}
				label += ":" + minutes;
			}
			
			if(pm){
				label += " pm";
			}
			
			return label;
		},
		
		/**
		 * 
		 * weekDayFormatter
		 * 
		 * Given a number it returns the correspondant name of the week day
		 * 
		 * 
 		 * @param {Object} item
		 */
		weekDayFormatter:function(item){
			return UIStores.getInstance().dayValues[parseInt(item) - 1];
		},	
		
		//===========================================================
		// Cell Renderers 
		//===========================================================
    
    nestedOrBlankObjectRenderer:function(object, data, td, options, manual_field){
			var path = manual_field || this.field;
			var pathArray = path.split(".");
			var currentObject = object;
			for (var i=0; i < pathArray.length; i++) {
				var propName = pathArray[i];
				if(typeof(currentObject) == "object" && currentObject != null){
					currentObject = currentObject[propName];
				}
			};
			
			if(typeof(currentObject) != "string"){
				currentObject = "";
			}
			
			var div = document.createElement("div");
			div.className = "renderedCell";
			div.innerHTML = currentObject;
			return div;
    },
		
		nestedObjectRenderer:function(object, data, td, options, manual_field){
			var path = manual_field || this.field;
			var pathArray = path.split(".");
			var currentObject = object;
			for (var i=0; i < pathArray.length; i++) {
				var propName = pathArray[i];
				if(typeof(currentObject) == "object" && currentObject != null){
					currentObject = currentObject[propName];
				}
			};
			
			if(typeof(currentObject) != "string"){
				currentObject = "NOT FOUND";
			}
			
			var div = document.createElement("div");
			div.className = "renderedCell";
			div.innerHTML = currentObject;
			return div;
		},

		peakRenderer:function(object, data, td, options){
			var story = object[this.field];
			var brief = story.substring(0, 50) + "...";
			var div = document.createElement("div");
			div.className = "renderedCell";
			div.innerHTML = brief;
			return div;
		},		
    
		siteServicesRenderer:function(object, data, td, options){
			var path = this.field;
			var pathArray = path.split(".");
			var currentObject = object;
			for (var i=0; i < pathArray.length; i++) {
				var propName = pathArray[i];
				if(typeof(currentObject) == "object" && currentObject != null){
					currentObject = currentObject[propName];
				}
			};
			
			if(typeof(currentObject) != "string"){
				currentObject = "NOT FOUND";
			}
			
			var div = document.createElement("div");
			div.className = "renderedCell";
			div.innerHTML = currentObject;
			return div;
		},

		checkMarkRenderer:function(object, data, td, options){
			var div = document.createElement("div");
			if(object[this.field] == true){
				div.className = "checkmark_red";
			}
			return div;
		},
		
		nestedObjectCount:function(object, data, td, options){
			var path = this.field;
			var pathArray = path.split(".");
			var currentObject = object;
			for (var i=0; i < pathArray.length; i++) {
				var propName = pathArray[i];
				if(typeof(currentObject) == "object" && currentObject != null){
					currentObject = currentObject[propName];
				}
				
				if(lang.isArray(currentObject) && i < pathArray.length - 1){ // if its an array return the first item
					currentObject = currentObject[0];
				}
			};
			
			if(lang.isArray(currentObject)){
				currentObject = currentObject.length;
			}else{
				currentObject = "0";
			}
			
			var div = document.createElement("div");
			div.className = "renderedCell";
			div.innerHTML = currentObject;
			return div;
		},

		moreInfoRenderer:function(object, data, td, options){

			var rendererWidget = new MoreInfoRenderer({
				_data: object,
				_nameProperty: this.field
			})
			
			var div = document.createElement("div");
			div.className = "renderedCell";

			rendererWidget.placeAt(div);
			rendererWidget.startup();

			return div;
		},

		donorMoreInfoRenderer:function(object, data, td, options){

			var rendererWidget = new DonorMoreInfoRenderer({
				_data: object,
				_nameProperty: this.field
			})
			
			var div = document.createElement("div");
			div.className = "renderedCell";

			rendererWidget.placeAt(div);
			rendererWidget.startup();

			return div;
		},

		testMoreInfoRenderer:function(object, data, td, options){

			var rendererWidget = new TestMoreInfoRenderer({
				_data: object
			})
			
			var div = document.createElement("div");
			div.className = "renderedCell";

			rendererWidget.placeAt(div);
			rendererWidget.startup();

			return div;
		},

		randomSelectionProgressRenderer:function(object, data, td, options){
			if(typeof(object.progress) == "object" && object.progress != null && object.progress.$ref == "rnd_sel_progress" ){
				return app.store.GridFormatters.nestedObjectRenderer(object, data, td, options, "progress.name");
			}else if((typeof(object.progress) == "string" || typeof(object.progress) == "number") && (typeof(object.steps) == "string" || typeof(object.steps) == "number")){
				return app.store.GridFormatters.progressBarRenderer(object, data, td, options);
			}
		},

		progressBarRenderer:function(object, data, td, options){
			if(typeof(emanda2.renderers) != "object" || emanda2.renderers == null){
				emanda2.renderers = {};
			}

			var rendererWidget
			if(emanda2.renderers.hasOwnProperty(object.id)){
				rendererWidget = emanda2.renderers[object.id];
				rendererWidget.update({maximum: object.steps, progress: object.progress});
			}else{
				rendererWidget = new ProgressBar({maximum: object.steps, progress: object.progress})
				rendererWidget.startup();
				emanda2.renderers[object.id] = rendererWidget;
			}

			rendererWidget.placeAt(td);

			return null;
		}
		
	});
	
	
		
	return classRef
	
});
