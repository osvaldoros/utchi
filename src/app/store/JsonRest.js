/**
 * This class extends dojo.store.JsonRest to add custom functionality needed by DriverCheck.
 * 
 * - It supports an alternate package of the Json array ( the array as a property of an object).
 * - It also gives us the flexibility to define our own operations such as a secondary entity PUT that will add an item to a list of the primary entity...
 * 
 */
define([ 
	'dojo/_base/declare', 
	'dojo/_base/xhr', 
	'dojo/store/JsonRest', 
	'app/store/QueryResults', 
	"dojo/_base/lang", 
	"dojo/on", 
	"dojo/topic"
	], function (declare, xhr, JsonRest, QueryResults, lang, on, topic) {
    return declare(JsonRest, {
		//<custom>    	
    	/**
    	 *
    	 * recursively loop through the properties of an object until we find one that is an array 
    	 * 
    	 */
    	findArrayProperty:function(object){
    		
    		// if the object itself is an array return the whole object
    		if(Array.isArray(object)) return object;
    		
			for(var p in object){
    			var property = object[p]
				
	    		// find a property in this object that is an array.
				if(Array.isArray(property)){
					return property;	
				}
				
				// if a property is an object recursively find properties in it that might be arrays
				if(typeof(property) == 'object'){
	    			var nestedProp = this.findArrayProperty( property );
	    			if (Array.isArray(nestedProp)){
	    				return nestedProp;
	    			}
				}
    		}
    		
    		return false;
    		
    	},

    	//</custom>
    	
    	/**
    	 * *CUSTOM
    	 * 
    	 * Unlike Dojo's JsonRest our JsonRest store accepts queries in the get function. Dojo's default implementation accepts only strings (ids) ours supports both
    	 * 
    	 */
    	get: function(query, options){
			//	summary:
			//		Retrieves an object by its identity. This will trigger a GET request to the server using
			//		the url `this.target + id`.
			//	id: Number
			//		The identity to use to lookup the object
			//	returns: Object
			//		The object in the store that matches the given id.
			var headers = options || {};
			headers.Accept = this.accepts;
			
			//<custom>
			if(typeof(emanda2.user.auth_token) !== 'undefined'){
				headers["X-Auth-Token"] = emanda2.user.auth_token;
			}

			if(typeof(query) == "object"){
				query = xhr.objectToQuery(query);
				query = query ? this.getFirstDivider() + query: "";
			}else if(typeof(query) == "string" || typeof(query) == "number"){
				query = this.getFirstDivider() + "id=" + query; // This is the behaviour on Dojo's JsonRest
			}
			//</custom>
			return xhr("GET", {
				url:this.target + query,
				handleAs: "json",
				headers: headers
			});
		},
		put: function(object, options){
			
			if(dojo.config.drivercheck.offline){
				var id = 1;
				if(object.hasOwnProperty("id")){
					id = object.id
				}
				return this.get(id, options)
			}
			
			// summary:
			//		Stores an object. This will trigger a PUT request to the server
			//		if the object has an id, otherwise it will trigger a POST request.
			// object: Object
			//		The object to store.
			// options: dojo.store.api.Store.PutDirectives?
			//		Additional metadata for storing the data.  Includes an "id"
			//		property if a specific id is to be used.
			//	returns: Number
			
			
			options = options || {};
			var id = ("id" in options) ? options.id : this.getIdentity(object);
			var hasId = typeof id != "undefined";
			var headers = {
				"Content-Type": "application/json",
				Accept: this.accepts,
				"If-Match": options.overwrite === true ? "*" : null,
				"If-None-Match": options.overwrite === false ? "*" : null
			};
			//<custom>
			if(typeof(emanda2.user.auth_token) !== 'undefined'){
				headers["X-Auth-Token"] = emanda2.user.auth_token;
			}
			//</custom>
			return xhr(hasId && !options.incremental ? "PUT" : "POST", {
					url: hasId ? this.target + "?id=" + id : this.target,
					postData: JSON.stringify(object),
					handleAs: "json",
					headers: headers
				});
		},
		remove: function(id){
			// summary:
			//		Deletes an object by its identity. This will trigger a DELETE request to the server.
			// id: Number
			//		The identity to use to delete the object
			var headers = {};
			//<custom>
			if(typeof(emanda2.user.auth_token) !== 'undefined'){
				headers["X-Auth-Token"] = emanda2.user.auth_token;
			}
			//</custom>
			return xhr("DELETE",{
				url:this.target + "?id=" + id,
				headers:headers
			});
		},
		
    	query:function(query, options){
    		////console.log(query)
    		// summary:
			//		Queries the store for objects. This will trigger a GET request to the server, with the
			//		query added as a query string.
			// query: Object
			//		The query to use for retrieving objects from the store.
			//	options: dojo.store.api.Store.QueryOptions?
			//		The optional arguments to apply to the resultset.
			//	returns: dojo.store.api.Store.QueryResults
			//		The results of the query, extended with iterative methods.
			var headers = {Accept: this.accepts};
			options = options || {};
			
			// MODIFIED for DriverCheck
			// used to be an OR to signify all range was sent as 0- instead if we want all, we don't include the range header at all
			//if(options.start >= 0 || options.count >= 0){
			
			if(options.start >= 0 && options.count >= 0 && options.count != Infinity){
				headers.Range = "items=" + (options.start || '0') + '-' +
					(("count" in options && options.count != Infinity) ?
						(options.count + (options.start || 0) - 1) : '');
			}
			if(query && typeof query == "object"){
				//query = this.sanitizeQuery(query);
				query = xhr.objectToQuery(query);
				query = query ? this.getFirstDivider() + query: "";
			}
			if(options && options.sort){
				var sortParam = this.sortParam;
				query += this.getFirstDivider(query) + (sortParam ? sortParam + '=' : "sort(");
				for(var i = 0; i<options.sort.length; i++){
					var sort = options.sort[i];
					query += (i > 0 ? "," : "") + (sort.descending ? '-' : '+') + encodeURIComponent(sort.attribute);
				}
				if(!sortParam){
					query += ")";
				}
			}
			
			//<custom>
			if(typeof(emanda2.user.auth_token) !== 'undefined'){
				headers["X-Auth-Token"] = emanda2.user.auth_token;
			}
			//</custom>
			var results = xhr("GET", {
				url: this.target + (query || ""),
				handleAs: "json",
				headers: headers
			});
			
			var owner = this;
			var myResults = results.then(function(data){
				var nestedArray = lang.isArray(data) ? data : [];
				//var nestedArray =  owner.findArrayProperty(data) || [];
				var range = results.ioArgs.xhr.getResponseHeader("Content-Range");
				nestedArray.total = range && (range=range.match(/\/(.*)/)) && +range[1];
				owner.total = nestedArray.total;
				topic.publish(owner.target + "-loadedComplete", nestedArray);
				return nestedArray
			})
			
			/*
			results.total = results.then(function(){
				var range = results.ioArgs.xhr.getResponseHeader("Content-Range");
				return range && (range=range.match(/\/(.*)/)) && +range[1];
			});
			*/
			
			return QueryResults(myResults);
    	},
    	
    	//<custom>
    	/**
    	 * 
    	 * 
 		 * @param {Object} query
    	 */
    	getFirstDivider:function(query){
    		var targetWithoutHost = this.target.split(dojoConfig.drivercheck.api_host).join('');
    		if(targetWithoutHost.indexOf('?') != -1){
    			return "&";
    		}
    		
    		if(query){
    			return "&";
    		}else{
    			return "?"
    		}
    		
    	}
    	
    	/**
    	 * sanitizeQuery
    	 * 
    	 * Removes query properties that match regular expressions for ^.*$ and ^$. The backend doesn't support those
    	 *  
    	 * 
 		 * @param {Object} query
    	 */
    	/*sanitizeQuery:function(query){
    		console.log(query)
    		var newQuery = lang.clone(query);
    		for(var p in newQuery){
    			var instanceOfRegex = newQuery[p] instanceof RegExp;
    			if( instanceOfRegex && (newQuery[p].source == "^.*$" || newQuery[p].source == "^$")){
    				delete newQuery[p];
    			}
    		}
    		console.log(newQuery)
    		return newQuery;
    	}*/
    	
    	
    	
    	
    	
    	
    	//</custom>
		
	});
});
