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
	"dojo/topic",
	"dojo/_base/json"
	],
	function(declare, socket, lang, topic, json){
		
		
	var classRef = declare("app.utils.PushManager", [], {
		//===========================================================
		// Instance members
		//===========================================================
		socket:null,
		_connected:false,
		_messageHandler:null,
		_connectHandler:null,
		
		connect:function(){
			var owner = this;
			
			if(dojo.config.drivercheck.websocket_enabled == true){
				this.socket = dojox.socket(emanda2.urls.WEBSOCKET + "?token=" + emanda2.user.auth_token);
				this._connectHandler = this.socket.on("open", function(event){
					owner._connected = true;
				});
				
				this._messageHandler = this.socket.on("message", function(event){
					var data = json.fromJson(event.data);
					topic.publish("push-notification-" + data.type, data);
				});
			}
		},
		
		send:function(data){
			if(this._connected){
				if(typeof(this.socket) != "undefined" && this.socket != null){
					this.socket.send( json.toJson(data) );
				}
			}
		},
		
		disconnect:function(){
			
			if(typeof(this._connectHandler) != "undefined" && this._connectHandler != null){
				this._connectHandler.remove();
			}
			if(typeof(this._messageHandler) != "undefined" && this._messageHandler != null){
				this._messageHandler.remove();
			}
			if(typeof(this.socket) != "undefined" && this.socket != null){
				this.socket.close();
			}
			this._connected = false;
		}
		
	});
	
	//===========================================================
	// Static members
	//===========================================================
	lang.mixin(app.utils.PushManager, {
		getInstance:function(params){
			if(!app.utils.PushManager._instance){
				app.utils.PushManager._instance = new app.utils.PushManager(params);
			}
			
			return app.utils.PushManager._instance;
		}
		
	});
	
	
		
	return classRef
	
});
