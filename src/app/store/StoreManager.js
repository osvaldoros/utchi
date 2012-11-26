/*
 * StoreManager provides a central place to save and retrieve stores to make sure we only have one store for a given url at a time
 * 
 * it also makes sure that all stores are created the same way
 * 
 */
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",	
	"dojo/store/Memory", 
	"dojo/store/Observable", 
	"dojo/store/Cache", 
	'app/store/QueryResults',
	"app/store/JsonRest"	
	],
	function(declare, lang, baseArray, Memory, Observable, Cache, QueryResults, JsonRest){
	
	var classRef = declare("app.store.StoreManager", [], {
			//===========================================================
			// Instance members
			//===========================================================	
			stores:{},
			baseQueries:{},
		
			getStore:function(url, base_query){
				// do the base query before you try to get the store so you can override the base query even if the store already exists
				if(typeof this.baseQueries == 'undefined'){
					this.baseQueries = {};
				}
				if(typeof base_query != 'undefined' ){
					this.baseQueries[url] = base_query;
				};
				
				if(typeof this.stores == 'undefined'){
					this.stores = {};
				}
				if(typeof this.stores[url] != 'undefined'){
					return this.stores[url];
				}
				
				
				var owner = this;
				
				var baseStore = JsonRest({
					target:url, 
					//target:"dgrid/test/data/rest.php", 
					idProperty: "id",
					query: function(query, options){
						
						var base_query = owner.computeBaseQuery(url, query, options);
						
						if(base_query != false){
							
							var combinedQuery = {};
							for(var p in query){
								combinedQuery[p] = query[p];
							}
							for(var q in base_query){
								combinedQuery[q] = base_query[q];
							}
							
							// have to manually adjust the query to get rid of the double ?? that trips php up
							if(combinedQuery.parent){
								combinedQuery = "parent=" + combinedQuery.parent;
							}
							return JsonRest.prototype.query.call(this, combinedQuery, options);
						}else{
							return QueryResults([]);
						}
					}
				});
				
				var store;
				if(dojo.config.drivercheck.cache == true){
					store = Observable(Cache(baseStore, Memory()));
				}else{
					store = Observable(baseStore);
				}
				
				
				this.stores[url] = store;
				
				return store;
			},
			
			getArrayStore:function(array, observerFn, getChildrenFunction, filterFunction, mayHaveChildrenFunction){
				

				if(typeof(filterFunction) == "function"){
					array = baseArray.filter(array, filterFunction);
				}

				var memoryStore = new Memory({data: array});
				
				if(typeof(getChildrenFunction) == "function"){
					memoryStore.getChildren = getChildrenFunction;
				}

				if(typeof(mayHaveChildrenFunction) == "function"){
					memoryStore.mayHaveChildren = mayHaveChildrenFunction;
				}
				
				var observableStore = Observable(memoryStore);
				
				if(observerFn){
					var originalQuery = observableStore.query;
					observableStore.query = function(query, options){
						var results = originalQuery.apply(this, arguments);
						results.observe(observerFn);
						return results;
					}
				}
				
				return observableStore;
			},
			
			computeBaseQuery:function(url, query, options){
				
				var base_query = this.baseQueries[url];
				
				if(base_query && query && typeof(query) == 'object'){
					var base_query_object = this.getBaseQueryObject(base_query);
					return base_query_object;
				}
			},
			
			getBaseQueryObject:function(base_query){
				var base_query_object;
				if(typeof(base_query) == 'function'){
					base_query_object = base_query();
				}else if(typeof(base_query) == 'object'){
					base_query_object = base_query;
				}
				
				return base_query_object;
			}
			
			
	});
	
	
	
	//===========================================================
	// Static members
	//===========================================================
	lang.mixin(app.store.StoreManager, {
		
		getInstance:function(params){
			if(!app.store.StoreManager._instance){
				app.store.StoreManager._instance = new app.store.StoreManager(params);
			}
			
			return app.store.StoreManager._instance;
		}
		
	});
	
	return classRef;
});
