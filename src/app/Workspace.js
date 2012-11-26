define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",	
	"dijit/layout/ContentPane",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/Workspace.html", // this is what includes the html template
	"dijit/layout/BorderContainer",
	"dijit/layout/StackContainer",
	"app/loader/ModuleLoader",
	"app/uicomponents/ConfirmDialog",
	"app/uicomponents/SearchDialog",
	"app/workspace/Topbar",
	"app/workspace/Sidebar",
	"require",	
	"app/uicomponents/Dialog",	
	"dojo/dom-style",
	"app/utils/HashManager"
	],
	function(declare, on, lang, ContentPane, StatefulModule, template, BorderContainer, StackContainer, ModuleLoader, ConfirmDialog, SearchDialog, Topbar, Sidebar, require, Dialog, domStyle, HashManager){
	
	return declare("app.Workspace", [ContentPane, StatefulModule], {
		//widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
		//content: template, // Our template - important!
		content: template, // Our template - important!
		hashManager: HashManager.getInstance(),


		postCreate:function(){
			this.inherited(arguments);
			emanda2.workspaceManager = this;
		},
		
		/**
		 * 	
		 * startup is called by the framework as part of the livecycle of all widgets, it happens after the children widgets have been created and are ready to be used
		 * Notice we don't use postCreate because the child widgets haven't been created yet, and we need to wait for the dgrid to attach the store to it
		 * 
		 */
		startup:function(){
			this.inherited(arguments);

			// get the references of the components we need
			this.contentTabs = this.getWidget('contentTabs');
			this.topBar = this.getWidget('topBar');
			
			emanda2.confirmDialog = new ConfirmDialog();
			emanda2.searchDialog = new SearchDialog();
			
		},
		
		onHashChange:function(hashValue){
			if(!this.hashManager.update) return;
			hashValue = hashValue.toLowerCase();
			if(hashValue != this.currentHash){
				var hashPieces = hashValue.split('/');
				var moduleName = hashPieces[0] != '' ? hashPieces[0] : hashPieces[1]; // check the first spot, but if it is blank ( leading slash ) grab the second spot
				
				if(typeof(this.modulesById[moduleName]) != 'undefined'){
					this.contentTabs.selectChild(this.modulesById[moduleName]);
					this.set('selectedModule', this.modulesById[moduleName]);
					this.set('selectedModuleName', moduleName);
					this.currentHash = hashValue;
					return true;
				}else{
					this.hashManager.setHash(this.currentHash);
				}
			}
			
			return false;
		},
		
		/**
		 * 
		 * Implemented by app/loader/Module, this gets called when its parent ModuleLoader it shown ( only once )
		 * 
		 */
		onActivate:function(){
			// clear the module map
			this.modulesById = {};
			this.currentHash = '';
			if(typeof(this.eventHandlers) == "undefined"){
				this.eventHandlers = [];
			}			
			
			this.eventHandlers.push( dojo.subscribe("/dojo/hashchange", this, this.onHashChange) );
			// load the catalogs and delay building the tabs until we have them			
			this.createTabs();
			
		},
		
		
		
		createTabs:function(){
			// populate the tabs with the modules defined int he configuration
			if(typeof(this.contentTabs) != 'undefined'){
				var moduleArray = dojo.config.drivercheck.modules;				
				for (var i = 0; i < moduleArray.length; i++){
					var moduleObj = moduleArray[i]
					moduleObj.topModule = true; // mark this module as topModule so it can modify the hash in the url if needed
					moduleObj.parentStack = this.contentTabs;
					moduleObj.cssClass = "pad10";
					
					//delete moduleObj.id;
					var module = new ModuleLoader(moduleObj);
					this.modulesById[moduleObj.hash] = module;
					this.contentTabs.addChild( module );
				};
			}
			
			var firstHash = this.hashManager.getHash();
			if(typeof(firstHash) != 'undefined' && firstHash != ''){
				this.onHashChange(firstHash)
			}
		},
		
		getDialogFromModuleURL:function(moduleUrl, options){
			var owner = this;
			require([moduleUrl], function(Module){
				module = new Module();
				var dialog = owner.getModuleInDialog(module, options);
				if(typeof(options.callBack) == "function"){
					options.callBack(dialog);
				}
			});
			
		},
		
		getModuleInDialog:function(module, options){
			if(typeof(options) != "object" || options == null){
				options = {};
			}
			
			var dialogInitObj = {
				title: options.title || "",
				content: module
			}
			
			// pass the callBacks map to the children so they can each trigger related callBacks to their processes
			// i.e. if the child is a Saver and a saveComplete callBack is defined, the Saver child will trigger such callback when it saves
			if(typeof(options.callBacks) != "undefined" && options.callBacks != null){
				module.callBacks = options.callBacks;
			}			
			if(typeof(options.callbacks) != "undefined" && options.callbacks != null){
				module.callbacks = options.callbacks;
			}
			
			var dialog = new Dialog(dialogInitObj);

			module.parentDialog = dialog;
			module.hide = function(){
				dialog.hide();
			}
			
			domStyle.set(dialog.domNode, {
				"width": options.dialogWidth || module.width || "960px",
				"height": options.dialogHeight || module.height || "620px",
				"background-color": options.backgroundColor || "#ffffff"
			})
			
			return dialog;
		},
		
		
		/**
		 * 
		 * Implemented by app/loader/Module, this gets called when its parent ModuleLoader it hidden ( only once )
		 * 
		 */
		onDeactivate:function(){
			//remove event handlers
			for (var i=0; i < this.eventHandlers.length; i++) {
				this.eventHandlers[i].remove();
			};
			
			if(typeof(this.contentTabs) != 'undefined'){
				this.contentTabs.destroyDescendants();
			}
			
			
			this.eventHandlers = []
			
			//this.topBar.deactivate(); // HACK until I can get the children to activate automatically
			
		}
		
		
	});
});
