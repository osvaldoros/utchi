define([
	"dojo/_base/declare",
	"dojo/on",
	"dijit/layout/ContentPane",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/Auth.html", // this is what includes the html template
	"dojo/_base/lang",
	"dojo/_base/xhr",
	"app/utils/StringUtils",
	
	"dijit/Tooltip",
	"dojox/validate",
	"dojox/validate/web",
	//"dijit/form/Form",
	"app/form/AjaxForm",
	"dijit/form/Button",
	"dijit/form/ValidationTextBox",
	"app/store/UIStores"		
	
	],
	function(declare, on, ContentPane, StatefulModule, template, lang, xhr, StringUtils, Tooltip, Validate, Validate_web, AjaxForm, Button, ValidationTextBox, UIStores ){
	
		return declare("app.Auth", [ContentPane, StatefulModule], {
			uiStores: UIStores.getInstance(),	
			//widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			content: template, // Our template - important!
			/**
			 * 
			 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
			 * Notice we don't use postCreate because the child widgets haven't been created yet, and we need to wait for the dgrid to attach the store to it
			 * 
			 */
			startup:function(){
				this.inherited(arguments);
				
				// get references to the form elements we need
				this.loginForm = this.getWidget('loginForm');
				this.loginButton = this.getWidget('loginButton');
				this.usernameFld = this.getWidget('usernameFld');
				
				emanda2.authManager = this;
				
			},
			
			/**
			 * 
			 * We monitor this event to make it easier to submit this form via the enter key
			 * 
			 */
			onPasswordKeyUp:function(event){
				if(event.keyIdentifier == "Enter" || event.key == "Enter" || event.keyCode == 13) this.onLoginClicked();
			},
			
			/**
			 * 
			 * Implemented by app/loader/Module, this gets called when its parent ModuleLoader it shown ( only once )
			 * 
			 */
			onActivate:function(){
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}				
				// wire the events we need to catch from those elements
				this.eventHandlers.push( on(this.loginButton, 'click', lang.hitch(this, "onLoginClicked")) );
				this.eventHandlers.push( on(this.loginButton, 'keypress', lang.hitch(this, "onPasswordKeyUp")) );
				
				this.eventHandlers.push( on(this.usernameFld, 'focus', lang.hitch(this, "hideInvalidCredentialsToolTip")) );
				this.loginForm.reset();
				
				
				if(dojo.config.isDebug){
					this.usernameFld.set('value', "Anonymous");
					//this.onLoginClicked();
				}
			},
			
			
			/**
			 * 
			 * Implemented by app/loader/Module, this gets called when its parent ModuleLoader it hidden ( only once )
			 * 
			 */
			onDeactivate:function(){
				this.inherited(arguments);
				this.hideInvalidCredentialsToolTip();
				//remove event handlers
				for (var i=0; i < this.eventHandlers.length; i++) {
				  this.eventHandlers[i].remove();
				};
				
				this.eventHandlers = []
			},
			
			/**
			 * 
			 * Make sure we clear the "invalid credentials" tooltip when we focus any of the fields again
			 * 
			 */
			hideInvalidCredentialsToolTip:function(){
				if(typeof(this.invalidCredentials) != 'undefined'){
					this.invalidCredentials.close();
				}
			},
			
			
			/**
			 * 
			 * If the tooltip exist show it, if it doesn't create it and show it
			 * 
			 */
			showInvalidCredentialsTootip:function(label){
				if(!label || label == '') label = "Invalid username and password";
				if(typeof(this.invalidCredentials) == 'undefined'){
					this.invalidCredentials = new Tooltip({ 
						label: label
					});
				}
				
				this.invalidCredentials.open(this.loginForm.domNode);
			},
			
			
			enableForm:function(enabled){
				this.usernameFld.set('disabled', !enabled)
				this.loginButton.set('disabled', !enabled)
			},
			
			/**
			 * 
			 * Attempt to submit this form in order to authenticate the user
			 * 
			 */
			onLoginClicked:function(event){
				if(this.loginForm.validate()){
					//this.enableForm(false);

					emanda2.user = {
						name: this.usernameFld.value
						//auth_token: "no_token_required"
					}
								
					this.initApp();
								
					
				}
			},

			hasPermission:function(permission){
				if(typeof(emanda2.user) == "object" && emanda2.user != null && lang.isArray(emanda2.user.perms) && emanda2.user.perms.length > 0){
					for (var i = emanda2.user.perms.length - 1; i >= 0; i--) {
						var perm = emanda2.user.perms[i];
						if(perm.name == permission){
							return true;
						}
					};
				}

				return false;
				
			},
			
			initApp:function(){
				emanda2.setCurrentState('app/Workspace');
			},
			
			logout:function(){
			}
			
			
	});
});

