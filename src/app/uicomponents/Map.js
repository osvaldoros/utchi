define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/topic",
	"dojo/parser",
	"dijit/form/_FormWidget",
	"app/mixins/WidgetMap",
	"dojo/text!./templates/Map.html", // this is what includes the html template
	"dojo/_base/lang",
	"dojo/dom-style"
	],
	function(declare, on, topic, parser, _FormWidget, WidgetMap, template, lang, domStyle){
	
	return declare("app.uicomponents.Map", [_FormWidget, WidgetMap], {

			//widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			recordPrefix:"",
			_centerMarker:null,
			_markers:[],
			_location:null,
			_locationEntities:[],
			_clickListeners:[],
			_latitude:null,
			_longitude:null,
			_apiKey:"AIzaSyDtziGVqxnOcoT8R9tLfmP1YS0KOlEWGRQ",
			templateString:template, // default template
			
			mapWidth:"280px",
			mapHeight:"180px",
			
			buildRendering:function(){
				this.inherited(arguments);
				
				domStyle.set(this.focusNode, {
					"width": this.mapWidth,
					"height": this.mapHeight
				})
			},

			startup:function(){
				this.eventHandlers = [];
				this.inherited(arguments);
				this.initializeMapApi();
			},
			
			/**
			 * initializeMapApi
			 * 
			 * This method gets called regardless of how many instances of the google maps api exist. In it we check if the api is already loaded or if we
			 * have to load it and wait for it to complete.
			 * 
			 * Eventually apiReady will be called
			 * 
			 * 
			 */
			initializeMapApi:function(){
				
				// if emanda2.maps doesn't exist it means we need to add the script node and wait for it to load
				if(typeof(emanda2.maps) == 'undefined'){
					// create the emanda2.maps namespace, which will hold the load call back and the apiReady flag ( for quick checking )
					emanda2.maps = {
						apiReady:false,
						// this call back function gets executed by the google maps api when it is ready
						loadCallBack:function(){
							// dispatch a ready event as a topic so that many instances that are initiating at the same time know the api is ready to rock
							emanda2.maps.apiReady = true;
							topic.publish("emanda2-maps-ready");
						}
					};
					
					// create the script node, add it to the body and wait for the callBack
					var script = document.createElement("script");
					script.type = "text/javascript";
					script.src = "http://maps.googleapis.com/maps/api/js?key=" + this._apiKey + "&sensor=false&callback=emanda2.maps.loadCallBack";
					document.body.appendChild(script);
				} 
				
				// if apiReady is true at this point it means the api was already loaded, so we don't need to wait at all
				if(emanda2.maps.apiReady){
					this.apiReady();
				}else{
				// if not, then subscribe to the event so we can initialize ourselves when the api is ready
					this.apiLoadHandler = topic.subscribe("emanda2-maps-ready", lang.hitch(this, "apiReady"));
				}
				
			},
			
			/**
			 * 
			 * apiReady
			 * 
			 * This method is invoked from a few different places whenever the maps api is ready. It can happen directly from initializeMapApi if the api was loaded previously, or from the
			 * topic event if we had to wait for it to load.
			 * 
			 * In any way, at this point we know that the map api is ready and that we can start scripting against it
			 * 
			 */
			apiReady:function(){
				// if we subscribed to the topic event, we should remove that now since we no longer need it
				if(typeof(this.apiLoadHandler) != 'undefined' && this.apiLoadHandler != null){
					this.apiLoadHandler.remove();
				}
				
				
				// get a reference to the DOM element where we are going to place the map
				this.mapNode = this.getWidget('focusNode');
				// instantiate a new Map instance and store it in this.map				
				this.map = new google.maps.Map(this.mapNode, {
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					center : new google.maps.LatLng(43.2875878, -80.45265319999999),
					zoom: 15
				});
				
				// instantiate a geocoder and if an address was passed, code it
				this.geocoder = new google.maps.Geocoder();
				
				this.infowindow = new google.maps.InfoWindow();
				
				
				if(typeof(this._location) != 'undefined' && this._location != null){
					var location = new google.maps.LatLng(this._location.latitude, this._location.longitude);
					this.markCenter(location)
				}else if(lang.isArray(this._locationEntities) && this._locationEntities.length > 0){
					this.createMarkers(this._locationEntities);
				}else if(typeof(this.address) != 'undefined' && this.address != null){
					this.geocode(this.address);
				}
				
				google.maps.event.addListener(this.infowindow, "domready", lang.hitch(this, function(){
					parser.parse(this.mapNode.id);
					var selectButton = this.getWidget("selectButton");
				}));
				
				this.resize();
				
			},
			
			_onClick:function(){
				//console.log("Map > _onClick");
			},			
			
			resize:function(){
				if(typeof(google) != "undefined" && typeof(google.maps) != "undefined"  && typeof(google.maps.event) != "undefined"){
					google.maps.event.trigger(this.map, "resize");
				}
			},
			
			
			/**
			 * 
			 * 
			 */
			_setValueAttr: function(value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
				this.inherited(arguments);
				// if it is a string treat it as an address
				if(typeof(value) == "string" ){
					this.geocode(value, true);

				// if its an array
				}else if(lang.isArray(value)){
					//value = {latitude:value[0], longitude:value[1]};				
					value = {latitude:value[1], longitude:value[0]}; // for some reason mongo does these 2 reversed		
				}
				
				if(typeof(value) == "object" && value.hasOwnProperty('latitude') && value.hasOwnProperty('longitude')){
					this.clearCenterMarker();
					if(typeof(google) != "undefined" && typeof(google.maps) != "undefined" && typeof(google.maps.LatLng) != "undefined"){
						// if it is an object and it has a latitude and longitude properties then convert it to a LatLng object and add the marker directly
						var location = new google.maps.LatLng(value.latitude, value.longitude);
						this.markCenter(location);
					}else{
						this._location = value;
					}
				}
			},			
			
			
			/**
			 * 
			 * 
			 */
			_getValueAttr: function(){
				this.inherited(arguments);
				
				/*var obj = {};
				obj[this.recordPrefix + "latitude"] = this._latitude;
				obj[this.recordPrefix + "longitude"] = this._longitude;
				return obj;
				*/
				
				//return {loc:[this._latitude, this._longitude]};
				var obj = {};
				obj[this.name] = [this._longitude, this._latitude];
				
				return obj; // for some reason mongo does these 2 reversed
			},
			
			/**
			 * 
			 * Returns values in mongo friendly arrays
			 * 
			 */
			getLocationArray:function(){
				return [this._longitude, this._latitude];
			},
			
			
			/**
			 * geocode
			 * 
			 * this method clears any old marker and geocodes a new address using the geocoding service asynchronously. Once we get a response geocodeResponse will be executed
			 * 
			 * 
 			 * @param {Object} address
 			 * @param {Object} clear
			 */
			geocode:function(address, clear){
				if(typeof(clear) != 'undefined' && clear == true){
					this.clearCenterMarker();
				}
				if(typeof(this.geocoder) != 'undefined'){
					this.geocoder.geocode( { 'address': address}, lang.hitch(this, "geocodeResponse") );
				}else{
					this.address = address; // wait for the map to be ready
				}
			},
			
			/**
			 * 
			 * geocodeResponse
			 * 
			 * Response from the geocoding service, if the status was ok then create a marker at the resulting lat and lng
			 * 
 			 * @param {Object} results
 			 * @param {Object} status
			 */
			geocodeResponse:function(results, status){
				if (status == google.maps.GeocoderStatus.OK) {
					this._geocoded = true;
					//only use the first result, center the map around it and add a marker
					var location = results[0].geometry.location;
					this.markCenter(location);
					this._geocoded = false;
				}
			},
			
			/**
			 * 
			 * markCenter
			 * 
			 * This method places a marker and centers the map around one point. It also listenes to drag events from this particular marker which update the latitude and longitude
			 * properties of this map when used as a form field.
			 * 
 			 * @param {Object} place
			 */
			markCenter:function(location){
				//console.log("markCenter");
				//console.log(location);
				
				this.map.setCenter(location);
				this._centerMarker = new google.maps.Marker({
					map: this.map,
					position: location,
					draggable:true
				});
				
				this.updateLatLngFields();
				
				if(typeof(this._centerMarkerListener) != 'undefined'){
					google.maps.event.removeListener(this._centerMarkerListener);
				}
				this._centerMarkerListener = google.maps.event.addListener(this._centerMarker, 'dragend', lang.hitch(this, "updateLatLngFields"));
				
				this.resize();
			},
			
			/**
			 * 
			 * updateLatLngFields
			 * 
			 * Store the lat and lng values from the position of the marker in form fields, the idea is that later when we submit the form we can automatically send a lat and lng.
			 * This method is called when we create a marker and whenever we drag that marker to keep the fields updated
			 * 
			 */
			updateLatLngFields:function(){
				
				var position = this._centerMarker.getPosition()
				
				var oldLat = this._latitude;
				var oldLng = this._longitude;
				
				this._latitude = position.lat();
				this._longitude = position.lng();
				
				// only dispatch onChange if we're modifying the position (not on an initial assignment to the marker)
				// UNLESS it was geocoded which means that either we didn't have the lat and lng OR the user changed the address 
				if(this._geocoded){
					this.onChange();
				}else if( (this._latitude != oldLat && oldLat != null) || (this._longitude != oldLng && oldLng != null)  ){
					this.onChange();
				}
				
			},
			
			/**
			 * clearCenterMarker
			 * 
			 * Removes the center marker from the map
			 * 
			 * 
			 */
			clearCenterMarker:function(){
				if(this._centerMarker != null){
					this._centerMarker.setMap(null) // remove the marker from the map
				}
			},
			
			
			/**
			 * 
			 * mapEntities
			 * 
			 * Given a bunch of entities it attempts to find their coordinates and then maps via createMarkers
			 * 
			 */
			mapEntities:function(entities){
				
				this.clearMarkers();
				var locationEntities = [];
				

				for (var i=0; i < entities.length; i++) {
					var entity = entities[i];
					var obj = lang.clone(entity);
					var addMarker = false;
					if(typeof(obj) == "object" && obj.hasOwnProperty('latitude') && obj.hasOwnProperty('longitude')){
						addMarker = true;
					}else if(typeof(obj) == "object" && obj.hasOwnProperty('loc') && lang.isArray(obj.loc)){
						obj.latitude = obj.loc[1]
						obj.longitude = obj.loc[0]// for some reason mongo does these 2 reversed		
						addMarker = true;
					}
						
					if(addMarker){
						locationEntities.push(obj);
					}
				};		
				
				if(typeof(google) != "undefined"){
					this.createMarkers(locationEntities);
				}else{
					this._locationEntities = locationEntities;
				}		
				
			},
			
			/*
			 * Not used
			 *
			latlngLocations:function(rawLocations){
				var locations = [];
				for (var i=0; i < rawLocations.length; i++) {
					var obj = rawLocations[i];
					var location = new google.maps.LatLng(obj.latitude, obj.longitude);
					locations.push(location);
				};
				return locations;
			},
			*/
			
			/**
			 * 
			 * createMarkers
			 * 
			 * This method places a bunch of markers around the map, these are not draggable or representative when the map is used as a form field, they are simply visual aid
			 * 
 			 * @param {Object} place
			 */
			createMarkers:function(entities){
				
				var bounds = new google.maps.LatLngBounds();
				for (var i=0; i < entities.length; i++) {
					var entity = entities[i]
					var location = new google.maps.LatLng(entity.latitude, entity.longitude);
					
					//console.log("adding " + entity.name + " to map");
					var markerObj = {
						map: this.map,
						position: location,
						title: entity.name
					}
					
					if(entity.hasOwnProperty("icon") && typeof(entity.icon) == "string"){
						markerObj.icon = entity.icon;
					}
					
					var mrkr = new google.maps.Marker(markerObj);
					var owner = this;
					if(entity.hasOwnProperty("content") && typeof(entity.content) == "string"){
						this._clickListeners.push( google.maps.event.addListener(mrkr, 'click', (
							function(mrkr, entity) {
								return function() {
									owner.infowindow.setContent(entity.content);
									owner.infowindow.open(owner.map, mrkr);
								}
							})(mrkr, entity)) // self executing function ( this is done to localize the references to mrkr and entity by passing them as params)
						);
					}
					
					bounds.extend(mrkr.getPosition());
					this._markers.push(mrkr);
				};
				
				this.resize();
				this.map.fitBounds(bounds);
			},
			
			
			/**
			 * clearCenterMarker
			 * 
			 * Removes markers from the map
			 * 
			 * 
			 */
			clearMarkers:function(){
				for (var l=0; l < this._clickListeners.length; l++) {
					var listener = this._clickListeners[l];
					if(typeof(listener) != "undefined" && listener != null){
						google.maps.event.removeListener(listener);
					}
				}
				
				this._clickListeners = [];
				
				for (var i=0; i < this._markers.length; i++) {
					var marker = this._markers[i];
					if(marker != null){
						marker.setMap(null) // remove the marker from the map
					}
				}
				
				this._markers = [];
			}
			
			
	});
});
