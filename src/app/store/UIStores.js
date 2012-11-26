/*
 * 
 */
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/store/Memory",
	"app/store/StoreManager"
	],
	function(declare, lang, baseArray, Memory, StoreManager){
	
		var classRef = declare("app.store.UIStores", [], {
			//===========================================================
			// Instance members
			//===========================================================
			
			stateStore:null,
			labStore:null,
			mroStore:null,
			reasonStore:null,
			serviceStore:null,
			sampleTypeStore:null,
			subtestTypeStore:null,
			batteriesStore:null,
			DOTAgenciesStore:null,
			sitePrioritiesStore:null,
			hoursStore:null,
			weekDaysStore:null,
			DOTType:null,
			companyGroup:null,
			randomTargetType:null,
			bookingReqTypeStore:null,
			
			donorGroup:null,
			frequency:null,
			randomSelectionType:null,
			docTypes:null,
      feeSchedules:null,
			
			companyGroupType:null,
			_preloadCompleteCallBack:null,
			_catalogsPreloaded:false,
			
			// since we only have one instance of this it doesn't matter if these are static
			dayValues: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
			
			// The constructor
		    constructor: function(args){
		        declare.safeMixin(this,args || {});
		        // all these functions will be called effectively preloading all these collections
		        this._functionsToPreload = [
					lang.hitch(this, "getServices"),
					lang.hitch(this, "getSubtestTypes"),
					lang.hitch(this, "getBatteries"),
					lang.hitch(this, "getSampleTypes"),
					lang.hitch(this, "getDocTypes")
				]
		    },
		    
			preloadCatalogs:function(preloadCompleteCallBack){
				this._preloadCompleteCallBack = preloadCompleteCallBack;
				if(this._catalogsPreloaded){
					this._preloadCompleteCallBack();
				}else{
					
					for (var i=0; i < this._functionsToPreload.length; i++) {
						var storeFunction = this._functionsToPreload[i];
						var store = storeFunction();
						var owner = this;
						if(store.then){
							store.then(function(strFunct){
								return function(){
									owner._preloadComplete(strFunct);
								}
							}(storeFunction))
						}else{
							this._preloadComplete(storeFunction);
						}
					};
					
				}
			},
			
			_preloadComplete:function(storeFunction){
				for (var i=0; i < this._functionsToPreload.length; i++) {
					if(storeFunction == this._functionsToPreload[i]){
						this._functionsToPreload.splice(i,1);
						break;
					}
				};
				
				if(this._functionsToPreload.length == 0){
					this._catalogsPreloaded = true;
					this._preloadCompleteCallBack();
				}
			},
			
			getCachedStore:function(uiStoreFunction, filterFunction){
				var store = uiStoreFunction();
				if(store.then){
					return null; // store not cached
				}
				
				if(typeof(filterFunction) == "function"){
					return  new Memory({data: baseArray.filter(store.data, filterFunction)});
				}else{
					return store;
				}
				
				return null;
			},
			
			populateComboArray:function(combo, array){
				this.populateCombo(combo, null, null, null, array);
			},

			populateCombo:function(combo, uiStoreFunction, filterFunction, afterPopulationCallBack, extraItems){
				if(!lang.isArray(extraItems)){
					extraItems = [];
				}

				var store = null;
				if(typeof(uiStoreFunction) == "function"){
					store = uiStoreFunction();
				}

				if(store != null && store.then){
					store.then(function(data){
						if(typeof(filterFunction) == "function"){
							combo.set("store", new Memory({data: extraItems.concat( baseArray.filter(data, filterFunction)) }));
							if(typeof(afterPopulationCallBack) == "function") afterPopulationCallBack();
						}else{
							combo.set("store", new Memory({data: extraItems.concat( data )}));
							if(typeof(afterPopulationCallBack) == "function") afterPopulationCallBack();
						}
					})
				}else{
					if(typeof(filterFunction) == "function"){
						if(store != null){
							combo.set("store", new Memory({data: extraItems.concat( baseArray.filter(store.data, filterFunction) )}));
						}else{
							combo.set("store", new Memory({data: extraItems}));
						}
						if(typeof(afterPopulationCallBack) == "function") afterPopulationCallBack();
					}else{
						if(store != null){
							combo.set("store", new Memory({data: extraItems.concat( store.data )}));
						}else{
							combo.set("store", new Memory({data: extraItems}));
						}
						if(typeof(afterPopulationCallBack) == "function") afterPopulationCallBack();
					}
				}
			},
			
			
			populateComboREST:function(combo, url, base_query, filterFunction, afterPopulationCallBack){
				var store = StoreManager.getInstance().getStore( url, base_query );
				var res = store.query({}); // get all
								
				if(res.then){
					res.then(function(data){
						if(typeof(filterFunction) == "function"){
							combo.set("store", new Memory({data: baseArray.filter(data, filterFunction)}));
							if(typeof(afterPopulationCallBack) == "function") afterPopulationCallBack();
						}else{
							combo.set("store", new Memory({data: data}));
							if(typeof(afterPopulationCallBack) == "function") afterPopulationCallBack();
						}
					})
				}
				
			},
			
			getStates:function(){
				
				if(this.stateStore != null){
					return this.stateStore;
				}
				
				this.stateStore = new Memory({
					data: [
						{id:"", name:"State/Province"},
						{id:"AL", name:"Alabama"},
						{id:"AK", name:"Alaska"},
						{id:"AB", name:"Alberta"},
						{id:"AZ", name:"Arizona"},
						{id:"AR", name:"Arkansas"},
						{id:"BC", name:"British Columbia"},
						{id:"CA", name:"California"},
						{id:"CO", name:"Colorado"},
						{id:"CT", name:"Connecticut"},
						{id:"DE", name:"Delaware"},
						{id:"DC", name:"District of Columbia"},
						{id:"FL", name:"Florida"},
						{id:"GA", name:"Georgia"},
						{id:"HI", name:"Hawaii"},
						{id:"ID", name:"Idaho"},
						{id:"IL", name:"Illinois"},
						{id:"IN", name:"Indiana"},
						{id:"IA", name:"Iowa"},
						{id:"KS", name:"Kansas"},
						{id:"KY", name:"Kentucky"},
						{id:"LA", name:"Louisiana"},
						{id:"ME", name:"Maine"},
						{id:"MB", name:"Manitoba"},
						{id:"MD", name:"Maryland"},
						{id:"MA", name:"Massachusetts"},
						{id:"MI", name:"Michigan"},
						{id:"MN", name:"Minnesota"},
						{id:"MS", name:"Mississippi"},
						{id:"MO", name:"Missouri"},
						{id:"MT", name:"Montana"},
						{id:"NE", name:"Nebraska"},
						{id:"NV", name:"Nevada"},
						{id:"NB", name:"New Brunswick"},
						{id:"NH", name:"New Hampshire"},
						{id:"NJ", name:"New Jersey"},
						{id:"NM", name:"New Mexico"},
						{id:"NY", name:"New York"},
						{id:"NL", name:"Newfoundland and Labrador"},
						{id:"NC", name:"North Carolina"},
						{id:"ND", name:"North Dakota"},
						{id:"NT", name:"Northwest Territories"},
						{id:"NS", name:"Nova Scotia"},
						{id:"NU", name:"Nunavut"},
						{id:"OH", name:"Ohio"},
						{id:"OK", name:"Oklahoma"},
						{id:"ON", name:"Ontario"},
						{id:"OR", name:"Oregon"},
						{id:"PA", name:"Pennsylvania"},
						{id:"PE", name:"Prince Edward Island"},
						{id:"PR", name:"Puerto Rico"},
						{id:"QC", name:"Quebec"},
						{id:"RI", name:"Rhode Island"},
						{id:"SK", name:"Saskatchewan"},
						{id:"SC", name:"South Carolina"},
						{id:"SD", name:"South Dakota"},
						{id:"TN", name:"Tennessee"},
						{id:"TX", name:"Texas"},
						{id:"UT", name:"Utah"},
						{id:"VT", name:"Vermont"},
						{id:"VA", name:"Virginia"},
						{id:"WA", name:"Washington"},
						{id:"WV", name:"West Virginia"},
						{id:"WI", name:"Wisconsin"},
						{id:"WY", name:"Wyoming"},
						{id:"YT", name:"Yukon"}
					]
				});
				    
				return this.stateStore;
			
			},
			
			getBookingReqType:function(){
				
				if(this.bookingReqTypeStore != null){
					return this.bookingReqTypeStore;
				}
				
				this.bookingReqTypeStore = new Memory({
					data: [
						{id:"contact", name:"Contact"},
						{id:"donor", name:"Donor"},
						{id:"other", name:"Other"}
					]
				});
				    
				return this.bookingReqTypeStore;
			
			},
			
			
			getDOTAgencies:function(){
				
				if(this.DOTAgenciesStore != null){
					return this.DOTAgenciesStore;
				}
				
				this.DOTAgenciesStore = new Memory({
					data: [
						{id:"1", name:"FAA"},
						{id:"2", name:"FMCSA"},
						{id:"3", name:"FRA"},
						{id:"4", name:"FTA"},
						{id:"5", name:"PHMSA"},
						{id:"6", name:"USCG"}
					]
				});
				    
				return this.DOTAgenciesStore;
			
			},
			
			getSitePriorities:function(){
				
				if(this.sitePrioritiesStore != null){
					return this.sitePrioritiesStore;
				}
				
				this.sitePrioritiesStore = new Memory({
					data: [
						{id:"DRIVERCHECK", name:"DriverCheck"},
						{id:"MAIN", name:"Main"},
						{id:"NO_PRIORITY", name:"Regular"},
						{id:"EMERGENCY_ONLY", name:"Emergency Only"}
					]
				});
				    
				return this.sitePrioritiesStore;
			
			},
			
			/*
			getSitePriorities:function(){
				if(this.sitePrioritiesStore != null){
					return this.sitePrioritiesStore;
				}
				
				var remoteStore = StoreManager.getInstance().getStore( emanda2.urls.SITE_PRIORITY );
				var res = remoteStore.query({});
				var owner = this;
				res.then(function(data){
					owner.sitePrioritiesStore = new Memory({data: data});
				})
				
				return res;
			},
			*/
			
			
			getHours:function(){
				if(this.hoursStore != null){
					return this.hoursStore;
				}
				
				var minuteValues = ["00", "30"];
				var hourArray = [];
				for (var i=0; i < 24; i++) {
					var hour = i;
					var pm = false;
					for (var j=0; j < minuteValues.length; j++) {
						var minute = minuteValues[j];
						var displayHour = hour;
						if(displayHour >= 12){
							pm = true;
						}
						if(displayHour > 12){
							displayHour = displayHour - 12;
						}
						
						if(displayHour == 0){
							displayHour = 12;
						}
						if(hour < 9){
							hour = "0" + hour;
						}
						var value = hour + ":" + minute + ":00";
						var label = displayHour + ":" + minute;
						if(pm) label += " pm";
						/*if(displayHour == 12){
							label += pm ? " (noon)" : "(midnight)";
						}*/
						hourArray.push({id:value, name:label});
					}
				};
				
				
				this.hoursStore = new Memory({data:hourArray});
				
				return this.hoursStore
				
			},
			
			getWeekDays:function(){
				if(this.weekDaysStore != null){
					return this.weekDaysStore;
				}
				
				var dayArray = [];
				
				dayArray.push({id:"-2", name:"* Monday to Friday"});
				dayArray.push({id:"-1", name:"* Weekends"});
				
				for (var j=0; j < this.dayValues.length; j++) {
					var day = this.dayValues[j];
					dayArray.push({id:j + 1, name:day});
				}
				
				this.weekDaysStore = new Memory({data:dayArray});
				
				return this.weekDaysStore
			},
			
			getLabs:function(){
				if(this.labStore != null){
					return this.labStore;
				}
				
				var remoteStore = StoreManager.getInstance().getStore( emanda2.urls.LAB );
				var res = remoteStore.query({});
				var owner = this;
				res.then(function(data){
					owner.labStore = new Memory({data: data});
				})
				
				return res;
			},
			
			getMROs:function(){
				if(this.mroStore != null){
					return this.mroStore;
				}
				
				var remoteStore = StoreManager.getInstance().getStore( emanda2.urls.MRO );
				var res = remoteStore.query({});
				var owner = this;
				res.then(function(data){
					owner.mroStore = new Memory({data: data});
				})
				
				return res;
			},
			
			
			getReasons:function(){
				if(this.reasonStore != null){
					return this.reasonStore;
				}
				
				var remoteStore = StoreManager.getInstance().getStore( emanda2.urls.REASON );
				var res = remoteStore.query({});
				var owner = this;
				res.then(function(data){
					owner.reasonStore = new Memory({data: data});
				})
				
				return res;
			},
			
			getServices:function(){
				if(this.serviceStore != null){
					return this.serviceStore;
				}
				
				var remoteStore = StoreManager.getInstance().getStore( emanda2.urls.SERVICE );
				var res = remoteStore.query({});
				var owner = this;
				res.then(function(data){
					owner.serviceStore = data;
				})
				
				return res;
			},
			
			getSubtestTypes:function(){
				if(this.subtestTypeStore != null){
					return this.subtestTypeStore;
				}
				
				var remoteStore = StoreManager.getInstance().getStore( emanda2.urls.SUBTEST_TYPE );
				var res = remoteStore.query({});
				var owner = this;
				res.then(function(data){
					owner.subtestTypeStore = new Memory({data: data});
				})
				
				return res;
			},			

			getDocTypes:function(){
				if(this.docTypes != null){
					return this.docTypes;
				}
				
				var remoteStore = StoreManager.getInstance().getStore( emanda2.urls.DOCUMENT_TYPE );
				var res = remoteStore.query({});
				var owner = this;
				res.then(function(data){
					owner.docTypes = new Memory({data: data});
				})
				
				return res;
			},
			
			getSampleTypes:function(){
				if(this.sampleTypeStore != null){
					return this.sampleTypeStore;
				}
				
				var remoteStore = StoreManager.getInstance().getStore( emanda2.urls.SAMPLE_TYPE );
				var res = remoteStore.query({});
				var owner = this;
				res.then(function(data){
					owner.sampleTypeStore = new Memory({data: data});
				})
				
				return res;
			},
			
			getBatteries:function(){
				if(this.batteriesStore != null){
					return this.batteriesStore;
				}
				
				var remoteStore = StoreManager.getInstance().getStore( emanda2.urls.BATTERY );
				var res = remoteStore.query({});
				var owner = this;
				res.then(function(data){
					owner.batteriesStore = new Memory({data: data});
				})
				
				return res;
			},
			
			getDOTType:function(){
				if(this.DOTType != null){
					return this.DOTType;
				}
				
				var remoteStore = StoreManager.getInstance().getStore( emanda2.urls.DOT_TYPE );
				var res = remoteStore.query({});
				var owner = this;
				res.then(function(data){
					owner.DOTType = new Memory({data: data});
				})
				
				return res;
			},
			
			
			getCompanyGroup:function(){
				if(this.companyGroup != null){
					return this.companyGroup;
				}
				
				var remoteStore = StoreManager.getInstance().getStore( emanda2.urls.COMPANY_GROUP );
				var res = remoteStore.query({});
				var owner = this;
				res.then(function(data){
					owner.companyGroup = new Memory({data: data});
				})
				
				return res;
			},
			
			getRandomTargetType:function(){
				if(this.randomTargetType != null){
					return this.randomTargetType;
				}
				
				var remoteStore = StoreManager.getInstance().getStore( emanda2.urls.RANDOM_TARGET_TYPE );
				var res = remoteStore.query({});
				var owner = this;
				res.then(function(data){
					owner.randomTargetType = new Memory({data: data});
				})
				
				return res;
			},
			
			getRandomSelectionType:function(){
				if(this.randomSelectionType != null){
					return this.randomSelectionType;
				}
				
				var remoteStore = StoreManager.getInstance().getStore( emanda2.urls.RANDOM_SELECTION_TYPE );
				var res = remoteStore.query({});
				var owner = this;
				res.then(function(data){
					owner.randomSelectionType = new Memory({data: data});
				})
				
				return res;
			},
						
			getDonorGroup:function(){
				if(this.donorGroup != null){
					return this.donorGroup;
				}
				
				var remoteStore = StoreManager.getInstance().getStore( emanda2.urls.DONOR_GROUP );
				var res = remoteStore.query({});
				var owner = this;
				res.then(function(data){
					owner.donorGroup = new Memory({data: data});
				})
				
				return res;
			},
													
			getRandomFrequency:function(){
				if(this.frequency != null){
					return this.frequency;
				}
				
				var remoteStore = StoreManager.getInstance().getStore( emanda2.urls.RANDOM_FREQUENCY );
				var res = remoteStore.query({});
				var owner = this;
				res.then(function(data){
					owner.frequency = new Memory({data: data});
				})
				
				return res;
			},
			
			getCompanyGroupType:function(){
				if(this.companyGroupType != null){
					return this.companyGroupType;
				}
				
				var remoteStore = StoreManager.getInstance().getStore( emanda2.urls.COMPANY_GROUP_TYPE );
				var res = remoteStore.query({});
				var owner = this;
				res.then(function(data){
					owner.companyGroupType = new Memory({data: data});
				})
				
				return res;
			},
			
			getFeeSchedules:function(){
				if(this.feeSchedules != null){
					return this.feeSchedules;
				}
				
				var remoteStore = StoreManager.getInstance().getStore( emanda2.urls.FEE_SCHEDULE );
				var res = remoteStore.query({});
				var owner = this;
				res.then(function(data){
					owner.feeSchedules = new Memory({data: data});
				})
				
				return res;
			}
			
	
			
	});
	
	
	//===========================================================
	// Static members
	//===========================================================
	lang.mixin(app.store.UIStores, {
		
		getInstance:function(params){
			if(!app.store.UIStores._instance){
				app.store.UIStores._instance = new app.store.UIStores(params);
			}
			
			return app.store.UIStores._instance;
		}
		
	});	
	
	return classRef;
});
