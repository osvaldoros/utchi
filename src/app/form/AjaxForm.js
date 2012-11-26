/**
 * This class extends dijit/form/Form to prevent the form from being submitted, we don't ever want to actually submit ajax forms, instead we use xhr or stores to submit them
 * 
 */
define([ 'dojo/_base/declare', 'dijit/form/Form' ], function (declare, Form) {
    return declare('app.form.AjaxForm', Form, {
    	
		onSubmit:function(){
			return false;
		}

	});
});
