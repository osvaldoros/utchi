/**
 * 
 * API
 * 
 * Low level means to make an xhr call to the backend with the host settings and auth token
 * 
 */
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/xhr",
	"app/store/StoreManager"	
	],
	function(declare, lang, baseArray, xhr, StoreManager){
		
		
	var classRef = declare("app.utils.API", [], {
		//===========================================================
		// Instance members
		//===========================================================
		//** This class since it is a pure utility doesn't need any instance members
	});
	
	//===========================================================
	// Static members
	//===========================================================
	lang.mixin(app.utils.API, {
		
		
		get:function(url, headers) {
			if(typeof(headers) == "undefined" || headers == null) headers = {};
			if(typeof(emanda2.user.auth_token) !== 'undefined'){
				headers["X-Auth-Token"] = emanda2.user.auth_token;
			}


			if(typeof(url) == "string" && url.indexOf(dojo.config.drivercheck.api_host) == -1){
				url = dojo.config.drivercheck.api_host + url;
			}
			
			return xhr.get({
				url: url,
				handleAs: "json",
				headers:headers
			});
		},
		
		testGet:function(url, headers){
			var testRequest = app.utils.API.get(url, headers);
			testRequest.then(function(data) {
				console.log(data)
			});
		},
		
		post:function(url, data, headers) {
			if(typeof(headers) == "undefined" || headers == null) headers = {};
			if(typeof(emanda2.user.auth_token) !== 'undefined'){
				headers["X-Auth-Token"] = emanda2.user.auth_token;
			}

			if(typeof(url) == "string" && url.indexOf(dojo.config.drivercheck.api_host) == -1){
				url = dojo.config.drivercheck.api_host + url;
			}			
			
			return xhr("POST", {
				url: url,
				postData: JSON.stringify(data),
				handleAs: "json",
				headers: headers
			});
		},

		testPost:function(url, data, headers){
			var testRequest = app.utils.API.post(url, data, headers);
			testRequest.then(function(data) {
				console.log(data)
			});
		},

		list:function(url, callBack, base_query, filterFunction ){
			var store = StoreManager.getInstance().getStore( url, base_query );
			var res = store.query({}); // get all
							
			if(res.then){
				res.then(function(data){
					if(typeof(filterFunction) == "function"){
						if(typeof(callBack) == "function") callBack( baseArray.filter(data, filterFunction) );
					}else{
						if(typeof(callBack) == "function") callBack(data);
					}
				})
			}
			
		}
		
		
	});
	
	
		
	return classRef
	
});
