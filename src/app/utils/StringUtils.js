/**
 * 
 * StringUtils
 * 
 * Common string utils
 * 
 */
define([
	"dojo/_base/declare",
	"dojo/_base/lang"
	],
	function(declare, lang){

	/* add trim functionality to string if browser doesn't support it*/
	if(typeof String.prototype.trim !== 'function') {
	  String.prototype.trim = function() {
	    return this.replace(/^\s+|\s+$/g, ''); 
	  }
	}
		
		
	var classRef = declare("app.utils.StringUtils", [], {
		//===========================================================
		// Instance members
		//===========================================================
		//** This class since it is a pure utility doesn't need any instance members
	});
	
	//===========================================================
	// Static members
	//===========================================================
	lang.mixin(app.utils.StringUtils, {
		/**
		 * 
		 * 
		 * @param {Object} $orig
		 * @param {Object} $length
		 */
		slugify:function(s) {
			var _slugify_strip_re = /[^\w\s-]/g;
			var _slugify_hyphenate_re = /[-\s]+/g;
			s = s.replace(_slugify_strip_re, '').trim().toLowerCase();
			s = s.replace(_slugify_hyphenate_re, '-');
			return s;
		},

		/**
		*
		* getArrayAsUL
		*
		* Given an array of objects it returns an unorderd list as a string, it supports specifying a custom property to display each entry via the displayProperty param. 
		*
		* @param {string} $displayProperty	can be a string or a function If not specified it defaults to "name"
		*/
		getArrayAsUL:function(array, displayProperty){

			if(typeof(displayProperty) == "undefined"){
				displayProperty = "name";
			}

			var res = "";
			res += "<ul>";
			for (var i = array.length - 1; i >= 0; i--) {
				if(typeof(displayProperty) == "function"){
					res += "<li>" +displayProperty(array[i])+"</li>";
				}else if(typeof(displayProperty) == "string"){
					res += "<li>" +array[i][displayProperty]+"</li>";
				}
			};
			res += "</ul>";
			return res;
		},


		/**
		*
		* getArrayAsCommaSeparated
		*
		* Given an array of objects it returns a list as a string, it supports specifying a custom property to display each entry via the displayProperty param. 
		*
		* @param {string} $displayProperty	can be a string or a function If not specified it defaults to "name"
		*/		

		getArrayAsCommaSeparated:function(array, displayProperty){
			if(typeof(displayProperty) == "undefined"){
				displayProperty = "name";
			}

			var resArray = [];
			for (var i = array.length - 1; i >= 0; i--) {
				if(typeof(displayProperty) == "function"){
					resArray.push(displayProperty(array[i]));
				}else if(typeof(displayProperty) == "string"){
					resArray.push(array[i][displayProperty]);
				}

				
			};

			return resArray.join(", ");
		}	
		
	});
	
	
		
	return classRef
	
});
