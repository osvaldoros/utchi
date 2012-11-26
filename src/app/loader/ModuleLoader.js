/**
 * This class extends ContentPane in order to provide custom functionality required by DriverCheck.
 * 
 * - It adds a property called moduleURL which supports a module id ( AMD ) to be loaded asynchronously similarly to how the href property works.
 * 
 */
define([ 
	'dojo/_base/declare', 
	'dojo/_base/xhr', 
	'dijit/layout/ContentPane', 
	'require', "dojo/_base/lang", 
	"dojo/dom-class",
	'app/mixins/SelfActivates'
	], 
	function (declare, xhr, ContentPane, require, lang, domClass, SelfActivates) {
		
    return declare("app.loader.ModuleLoader", [ContentPane, SelfActivates], {

    	_pendingActivation:false,
    	usedLoader:false, // important because SelfActivates requires it to be false in order to do activation ( this is used to differentiate modules from moduleLoaders )
    	
		postMixInProperties: function(){
			this.inherited(arguments);

			if(typeof(this.moduleURL) !== 'undefined'){
				this.def = this.set('href', require.toUrl('app/loader/LoadingModule.html'));
			}

		},
		
		postCreate:function(){
			this.inherited(arguments);
			
			if( typeof this.cssClass != 'undefined'){
				if(this.cssClass != null){
					domClass.add(this.domNode, this.cssClass);
				}
			}else{
				domClass.add(this.domNode, "moduleLoader");
			}
		},
    	
    	onLoad:function(){
			var owner = this;
			this.inherited(arguments);
			
			if(typeof(owner.module) == 'undefined' && typeof(this.moduleURL) !== 'undefined'){
				require([this.moduleURL], function(Module){
					owner.instantiateModule(Module);
				});
			}
    	},
    	
    	instantiateModule:function(Module){
    		
    		var params = {usedLoader:true};
			if((typeof(this.parentStoreUrl) != 'undefined')) params.parentStoreUrl = this.parentStoreUrl;
			params.topModule = (typeof(this.topModule) != 'undefined');
			if((typeof(this.hash) != 'undefined')) params.hashId = this.hash;
			if((typeof(this.parentStack) != 'undefined')) params.parentStack = this.parentStack;
			if((typeof(this.stateHashFunction) != 'undefined')) params.stateHashFunction = this.stateHashFunction; // a string corresponding to a function in HashManager such as setState or setEntity
			if((typeof(this.onActivateCallBack) != 'undefined')) params.onActivateCallBack = this.onActivateCallBack; // a function to call upon activation
			if((typeof(this.permissions) != 'undefined')) params.permissions = this.permissions;
    		
    		this.module = new Module(params);
			
			this.set("content", this.module);
			
			if(this._pendingActivation){
				this.__activate();
				this._pendingActivation = false;
			}
    	},
		
		__activate:function(){
			if(typeof(this.module) != 'undefined' && typeof(this.module.activate) != 'undefined' && !this.module.isActive()){
				this.module.activate();
			}else{
				this._pendingActivation = true;
			}
			
		},
		
		prepareForSave:function(){
			if(typeof(this.module) != 'undefined' && typeof(this.module.prepareForSave) == 'function'){
				return this.module.prepareForSave();
			}
			
			return true;
		},
		
		__deactivate:function(){
			if(typeof(this.module) != 'undefined' && typeof(this.module.deactivate) != 'undefined' && this.module.isActive()){
				this.module.deactivate();
			}
		},
		
		activate:function(){
			this.__activate();
		},
		
		deactivate:function(){
			this.__deactivate();
		},
		
		setCurrentState:function(state){
			if(typeof(this.module) != 'undefined' && typeof(this.module.setCurrentState) != 'undefined'){
				this.module.setCurrentState(state);
			}
		},
		
		getCurrentState:function(){
			if(typeof(this.module) != 'undefined' && typeof(this.module.getCurrentState) != 'undefined'){
				return this.module.getCurrentState();
			}
			return '';
		}
		
		
		
	});
});
