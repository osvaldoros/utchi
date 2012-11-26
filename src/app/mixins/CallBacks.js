/*
 * 
 * 
 */
define([
	"dojo/_base/declare",
	"dojo/_base/lang"
	],
	function(declare, lang){
	
	return declare([], {
		runCallBack:function(name, data){
			if(typeof(this.callBacks) == "object" && this.callBacks != null && this.callBacks.hasOwnProperty(name) && typeof(this.callBacks[name]) == "function"){
				this.callBacks[name](data);
			}else if(typeof(this.callbacks) == "object" && this.callbacks != null && this.callbacks.hasOwnProperty(name) && typeof(this.callbacks[name]) == "function"){
				this.callbacks[name](data);
			}
		}
	});
});
