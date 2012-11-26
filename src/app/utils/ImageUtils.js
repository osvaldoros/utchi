/**
 * 
 * ImageUtils
 * 
 * Common image utils
 * 
 */
define([
	"dojo/_base/declare",
	"dojo/_base/lang"
	],
	function(declare, lang){

		
	var classRef = declare("app.utils.ImageUtils", [], {
		//===========================================================
		// Instance members
		//===========================================================
		//** This class since it is a pure utility doesn't need any instance members
	});
	
	//===========================================================
	// Static members
	//===========================================================
	lang.mixin(app.utils.ImageUtils, {
		/**
		 * 
		 * 
		 * @param {Object} $url the url of the image we want to mesure
		 * @param {Object} $callback a function to call when we get the dimensions
		 */
		getDimensions:function(url, callback) {
			if(typeof(url) != "string"){
				console.warn("url used for ImageUtils.getDimensions is not a string");
				return;
			}			
			if(typeof(callback) != "function"){
				console.warn("callback used for ImageUtils.getDimensions is not a function");
				return;
			}

			var myImage = new Image();
			myImage.name = url;
			myImage.onload = function(){
				callback({width:myImage.width, height:myImage.height});
			};
			myImage.src = url;
		}

		
	});
	
	
		
	return classRef
	
});
