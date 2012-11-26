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
		
		
	var classRef = declare("app.utils.DateUtils", [], {
		//===========================================================
		// Instance members
		//===========================================================
		//** This class since it is a pure utility doesn't need any instance members
	});
	
	//===========================================================
	// Static members
	//===========================================================
	lang.mixin(app.utils.DateUtils, {
		
		dateFromYYYY_MM_DD:function(str) {
			var newDate = new Date();
			var validArray = false;
			if(typeof(str) == "string"){
				// try diving with -
				var dateArr = str.split("-");
				if(dateArr.length >= 3){
					validArray = true
				// if it didn't work try diving with /
				}else{
					dateArr = str.split("/");
					if(dateArr.length >= 3){
						validArray = true
					// if it didn't work try diving with space
					}else{
						dateArr = str.split(" ");
						if(dateArr.length >= 3){
							validArray = true
						}
					}
				}

				if(validArray){
					newDate.setFullYear(dateArr[0]);
					newDate.setMonth(dateArr[1] - 1);
					newDate.setDate(dateArr[2]);

					return newDate;
				}

			}else{
				return null;
			}
		}
		
	});
	
	
		
	return classRef
	
});
