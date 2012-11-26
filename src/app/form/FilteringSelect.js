/**
 * This class extends dijit/form/Form to prevent the form from being submitted, we don't ever want to actually submit ajax forms, instead we use xhr or stores to submit them
 * 
 */
define([
		'dojo/_base/declare', 
		'dijit/form/FilteringSelect',
		"dojo/store/Memory"
		], function (declare, FilteringSelect, Memory) {
    return declare('app.form.FilteringSelect', FilteringSelect, {
    	storeSet:false,
    	pendingValue:undefined,
    	
		_setStoreAttr: function(/*String*/ value, /*Boolean?*/ priorityChange, /*String?*/ displayedValue, /*item?*/ item){
			this.inherited(arguments);
			
			if(value.isInstanceOf && value.isInstanceOf(Memory)){
				if(value.data.length > 0){
					this.storeSet = true;
					if(typeof(this.pendingValue) != "undefined"){
						this.set("value", this.pendingValue.value, this.pendingValue.priorityChange, this.pendingValue.displayedValue, this.pendingValue.item);
						this.pendingValue = undefined;
					}
				}
			}
		},
    	
		_setValueAttr: function(/*String*/ value, /*Boolean?*/ priorityChange, /*String?*/ displayedValue, /*item?*/ item){
			if(this.storeSet == true){
				this.inherited(arguments);
			}else{
				this.pendingValue = {value:value, priorityChange:priorityChange, displayedValue:displayedValue, item:item};
			}
		}

	});
});
