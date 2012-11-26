/**
 * 
 * PushManager
 * 
 * Common string utils
 * 
 */
define([
	"dojo/_base/declare",
	"dojox/socket",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/topic",
	"dojo/_base/json",
	"app/utils/HashManager"
	],
	function(declare, socket, lang, baseArray, topic, json, HashManager){
		
		
	var classRef = declare("app.utils.OrbiterManager", [], {
		//===========================================================
		// Instance members
		//===========================================================
		orbiter:null,
		_connected:false,
		_readyCallBack:null,
		hashManager: HashManager.getInstance(),
		systemRoomName:"systemRoom",
		systemRoom:null,

		constructor: function(args){
   			declare.safeMixin(this,args || {});
   			this.orbiter = new net.user1.orbiter.Orbiter();

   			this.orbiter.getLog().setLevel(net.user1.logger.Logger.ERROR);
   			//this.orbiter.getLog().setLevel(net.user1.logger.Logger.DEBUG);

   			this.orbiter.addEventListener(net.user1.orbiter.OrbiterEvent.READY, this.orbiterReady, this);
			this.orbiter.addEventListener(net.user1.orbiter.OrbiterEvent.CLOSE, this.orbiterDisconnected, this);

   		},
		
		connect:function(readyCallBack){
			this._readyCallBack = readyCallBack;
			if(dojo.config.drivercheck.union_enabled == true && this.orbiter.getSystem().isJavaScriptCompatible()){
				this.orbiter.connect(dojo.config.drivercheck.union_host, dojo.config.drivercheck.union_port);
			}else{
				if(typeof(this._readyCallBack) == "function"){
					this._readyCallBack();
				}
			}
		},
		
		disconnect:function(){


			if(typeof(this.hashChangeHandle) == "object" && this.hashChangeHandle != null){
				this.hashChangeHandle.remove();
			}

			this.systemRoom.removeEventListener(net.user1.orbiter.RoomEvent.JOIN, this.joinRoomListener, this);
			this.systemRoom.removeEventListener(net.user1.orbiter.RoomEvent.ADD_OCCUPANT, this.addOccupantListener, this);
			this.systemRoom.removeEventListener(net.user1.orbiter.RoomEvent.REMOVE_OCCUPANT, this.removeOccupantListener, this);
			this.systemRoom.addEventListener(net.user1.orbiter.RoomEvent.UPDATE_CLIENT_ATTRIBUTE, this.clientAttributeUpdateListener, this);

			this.orbiter.disconnect();
		},

		orbiterReady:function(event){
			this._connected = true;
			this._selfClient = this.orbiter.self();
			console.log("Orbiter ready!");

			this.systemRoom = this.orbiter.getRoomManager().createRoom(this.systemRoomName);


			this.hashChangeHandle = dojo.subscribe("/dojo/hashchange", this, this.onHashChange);

			this.systemRoom.addEventListener(net.user1.orbiter.RoomEvent.JOIN, this.joinRoomListener, this);
			this.systemRoom.addEventListener(net.user1.orbiter.RoomEvent.ADD_OCCUPANT, this.addOccupantListener, this);
			this.systemRoom.addEventListener(net.user1.orbiter.RoomEvent.REMOVE_OCCUPANT, this.removeOccupantListener, this);
			this.systemRoom.addEventListener(net.user1.orbiter.RoomEvent.UPDATE_CLIENT_ATTRIBUTE, this.clientAttributeUpdateListener, this);


			var firstHash = this.hashManager.getHash();
			if(typeof(firstHash) != 'undefined' && firstHash != ''){
				this.onHashChange(firstHash)
			}

			this.systemRoom.join();

		},

		orbiterDisconnected:function(event){
			this._connected = false;
			this._selfClient = null;
			console.log("Orbiter disconnected!")
		},

		joinRoomListener:function(e) {

			var displayUsername;
			if(typeof(emanda2.user.name) != "undefined"){
				displayUsername = emanda2.user.name
			}else if(typeof(emanda2.user.username) != "undefined"){
				displayUsername = emanda2.user.username
			}else{
				displayUsername = "Unnamed user";
			}

			this.buildEntityClients();

			this._selfClient.setAttribute("displayUsername", displayUsername, this.systemRoomName);
			this.refreshUserEntities();

			if(typeof(this._readyCallBack) == "function"){
				this._readyCallBack();
			}
		},

		// Triggered when another client joins the chat room
		addOccupantListener:function(e) {
			if (this.systemRoom.getSyncState() != net.user1.orbiter.SynchronizationState.SYNCHRONIZING) { 
				console.log("User" + e.getClientID() + " logged in." + " Total sessions: " + this.systemRoom.getNumOccupants());
				this.refreshUserEntities();
			}
		},
		  
		// Triggered when another client leaves the chat room
		removeOccupantListener:function(e) {
			console.log("User" + e.getClientID() + " logged out." + " Total sessions: " + this.systemRoom.getNumOccupants());
			this.refreshUserEntities();
		},

		onHashChange:function(hashValue){

			var selfClient = this._selfClient;
			if(selfClient != null){
				selfClient.setAttribute("hash", hashValue, this.systemRoomName);
				var entityId = this.hashManager.getEntity();
				selfClient.setAttribute("entityId", entityId, this.systemRoomName);
			}

		},


		getClientsThatHaveEntityOpened:function(entityId){
			var clients = [];
			for(var p in this.userEntities){
				var meta = this.userEntities[p];
				if(meta.entity == entityId && !meta.client.isSelf()){
					clients.push(meta.client);
				}
			}

			return clients;

		},

		clientAttributeUpdateListener:function(e){


			if(e.getChangedAttr().name != "entityId" && e.getChangedAttr().name != "displayUsername") return;

			//var myEntity = this._selfClient.getAttribute("entityId", this.systemRoomName);
			//if(myEntity == "none") return;

			/*
			if(e.getClient().isSelf()){
				console.log("UPDATE! You changed " + e.getChangedAttr().name + " to: " + e.getChangedAttr().value);
			}else{
				console.log("UPDATE! User" + e.getClient().getClientID() + " changed " + e.getChangedAttr().name + " to: " + e.getChangedAttr().value);
			}
			*/

			if(e.getChangedAttr().name == "entityId"){

				var entityId = e.getChangedAttr().value;
				var client = e.getClient();

				// check if we are removing an entity id
				if(entityId == "none"){
					var oldValue = e.getChangedAttr().oldValue;
					if(this.entityExistsInMap(oldValue)){
						this.removeClientFromEntityMap(oldValue, client);
					}
				// for adding an entity id
				}else{
					this.addClientToEntityMap(entityId, client);
				}
				console.log("entityClients > ")
				console.log(this.entityClients);
			}


			this.refreshUserEntities();

		},

		entityExistsInMap:function(entityId){
			if(typeof(this.entityClients) == "undefined") this.entityClients = {};
			return this.entityClients.hasOwnProperty(entityId);
		},


		addClientToEntityMap:function(entityId, client){
			if(typeof(client) != "object" || client == null) return;
			if(typeof(this.entityClients) == "undefined") this.entityClients = {};

			var obj = this.entityClients[entityId];
			if(typeof(obj) != "object" || obj == null){
				obj = {};
				obj.clients = [];
				obj.first = client;
			}

			obj.clients.push(client);
			this.entityClients[entityId] = obj;

		},

		removeClientFromEntityMap:function(entityId, client){
			if(typeof(client) != "object" || client == null) return;
			if(typeof(this.entityClients) == "undefined") this.entityClients = {};

			if(this.entityClients.hasOwnProperty(entityId)){
				var obj = this.entityClients[entityId];
				if(typeof(obj) == "object" && obj != null && lang.isArray(obj.clients) && obj.clients.length > 0){
					for (var i = obj.clients.length - 1; i >= 0; i--) {
						var storedClient = obj.clients[i];
						if(storedClient.getClientID() == client.getClientID()){
							obj.clients.splice(i, 1);
						}
					};

					if(obj.clients.length == 0){
						delete this.entityClients[entityId];
					}else{
						// if the client leaving is the first, set the first to someone else, if available...
						if(obj.first.getClientID() == client.getClientID()){
							obj.first = obj.clients[0];
						}
					}
				}else{
					delete this.entityClients[entityId];
				}
			}

		},

		buildEntityClients:function(){
			var occupants = this.systemRoom.getOccupants();
			if (occupants.length > 0) {
				for (var i = 0; i < occupants.length; i++) {
					var client = occupants[i];
					var entityId = client.getAttribute("entityId", this.systemRoomName);
					this.addClientToEntityMap(entityId, client);
				}
			}

		},


		refreshUserEntities:function(){

			this.userEntities = {};

			var occupants = this.systemRoom.getOccupants();
			if (occupants.length > 0) {
				for (var i = 0; i < occupants.length; i++) {
					var occupant = occupants[i];
					var meta = {};
					meta.client = occupant;
					meta.entity = occupant.getAttribute("entityId", this.systemRoomName);

					this.userEntities[occupant.getClientID()] = meta;
				}
			}

			topic.publish("active-users-entities-change");

		},

		amIFirstClientAtEntity:function(entityId){
			var entityObj = this.entityClients[entityId]
			if(typeof(entityObj) != "undefined"){
				if(typeof(entityObj.first) != "undefined"){
					return this._selfClient == entityObj.first;
				}
			}

			return true;

		}

		
	});
	
	//===========================================================
	// Static members
	//===========================================================
	lang.mixin(app.utils.OrbiterManager, {
		getInstance:function(params){
			if(!app.utils.OrbiterManager._instance){
				app.utils.OrbiterManager._instance = new app.utils.OrbiterManager(params);
			}
			
			return app.utils.OrbiterManager._instance;
		}
		
	});
	
	
		
	return classRef
	
});
