/*
 * 
 * 
 */
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"app/utils/OrbiterManager",
	"app/utils/HashManager",
	"dojo/topic"
	],
	function(declare, lang, OrbiterManager, HashManager, topic){
	
	return declare([], {

		orbiterManager: OrbiterManager.getInstance(),
		hashManager: HashManager.getInstance(),
		otherUsersHere:false,

		configureMultiUser:function(configObject){
			this.__activeUsersLabel = configObject.activeUsersLabel;
		},

		onActivate:function(){
			this.inherited(arguments);
			if(typeof(this.eventHandlers) == "undefined"){
				this.eventHandlers = [];
			}
			this.eventHandlers.push( topic.subscribe("active-users-entities-change", lang.hitch(this, "activeUsersEntityChange")) );

			this.updateActiveUsers();

		},

		activeUsersEntityChange:function(event){
			this.updateActiveUsers();
		},

		updateActiveUsers:function(){

			var entityid = this.hashManager.getEntity();
			if(entityid != "none"){
				var otherClientsInEntity = this.orbiterManager.getClientsThatHaveEntityOpened(entityid);
				if(otherClientsInEntity.length > 0 ){
					this.otherUsersHere = true;
					this.__activeUsersLabel.style.display = "";
					var userNames = [];
					for (var i = otherClientsInEntity.length - 1; i >= 0; i--) {
						var client = otherClientsInEntity[i];
						userNames.push(client.getAttribute("displayUsername", this.orbiterManager.systemRoomName ));
					};
					this.__activeUsersLabel.innerHTML = "Also here: " + userNames.join(", ");
				}else{
					this.otherUsersHere = false;
					this.__activeUsersLabel.style.display = "none";
				}
			}


			if(this.otherUsersHere && !this.orbiterManager.amIFirstClientAtEntity(entityid)){
				this.disable();
			}else{
				this.enable();
			}
		},


		enable:function(){
			// override me
		},

		disable:function(){
			// override me
		},

		onDeactivate:function(){
			this.inherited(arguments);
			//remove event handlers
			for (var i=0; i < this.eventHandlers.length; i++) {
				var thisHandler = this.eventHandlers[i];
				if(typeof(thisHandler) != 'undefined'){
					thisHandler.remove();
				}
			};
			
			this.eventHandlers = []				
		}


	});
});
