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
		
		
	var classRef = declare("app.utils.ArrayUtils", [], {
		//===========================================================
		// Instance members
		//===========================================================
		//** This class since it is a pure utility doesn't need any instance members
	});
	
	//===========================================================
	// Static members
	//===========================================================
	lang.mixin(app.utils.ArrayUtils, {
		
		addIds:function(arr) {
			for (var i=0; i < arr.length; i++) {
				var obj = arr[i];
				obj.id = i;
			};
		},
		
		removeIds:function(arr){
			var sendableArr = [];					
			for (var i=0; i < arr.length; i++) {
				var objDef = arr[i];
				var newObj = {}
				for(var p in objDef){
					if(p != "id"){
						newObj[p] = objDef[p];
					}
				}
				sendableArr.push(newObj);
			};
			
			return sendableArr;
		}
		
	});
	
	
		
	return classRef
	
});
