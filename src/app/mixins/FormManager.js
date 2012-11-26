/*
 * 
 * FormManager provides facilities to deal with Forms, it can load data into forms from an object
 * 
 */
define([
	"dojo/_base/declare",
	"dojox/form/Manager",
	"dojo/topic",
	"dojo/_base/lang",
	"app/store/StoreManager",
	"app/utils/HashManager",
	
	"app/form/Manager"

	],
	function(declare, FormManager, topic, lang, StoreManager, HashManager,
			Manager
		){
	
	return declare([], {
		storeManager:StoreManager.getInstance(),
		hashManager:HashManager.getInstance(),
		_entity:null,
		__form: null,



		startup:function(){
			this.inherited(arguments);

			var children = this.getChildren();
			for (var i = children.length - 1; i >= 0; i--) {
				var child = children[i];
				if(typeof(child.isInstanceOf) == "function" && child.isInstanceOf(Manager)){
					this.__form = child;
				}
			};

			if(this.__form == null){
				for (var j = this._attachPoints.length - 1; j >= 0; j--) {
					var attachP = this._attachPoints[j];
					var child = this[attachP];
					if(typeof(child.isInstanceOf) == "function" && child.isInstanceOf(Manager)){
						this.__form = child;
					}
				};
			}

		},
		
		/**
		 * 
		 * configureForm
		 * 
		 * Stores a reference to the form and wires it for listening for entities created
		 * 
		 */
		configureForm:function(form){
			this.__form = form;
		},
		
		/**
		 * 
		 * The entity id is specified in the url hash, so all we need here is to tell it from which store we are getting it and what type of entity it is
		 * 
		 * The type is relevant for deferreds, because the root node of the json object is named as the entity type
		 * 
		 * 
		 */
		loadHashEntityInForm:function(){
			
			var entityId = this.hashManager.getEntity();
			var owner = this;
			var res = emanda2.entities.withEntity(entityId, this.__form.storeUrl, function(data){
				owner.viewInForm(data, owner.__form);
			});
			
			return res;
		},
		
		/**
		 * 
		 * onActivate
		 * 
		 * 
		 */
		onActivate:function(){
			////console.log('FormManager > onActivate')
			this.inherited(arguments);
			if(this.__form){
				this.creationHandler = topic.subscribe(this.__form.storeUrl + "-created", lang.hitch(this, "_formManagerEntityCreated"));
			}
		},		
		
		
		onDeactivate:function(){
			this.inherited(arguments);
			if(this.creationHandler){
				this.creationHandler.remove();
			}
		},
		
			
		/**
		 * 
		 * viewInForm
		 * 
		 * Populates a given form from a data object based on names of fields matching the properties of the object. It is smart enough to pre populate
		 * 
		 * - textBoxes
		 * - checkboxes
		 * - comboBoxes
		 * - selects
		 * 
		 * 
		 */
		viewInForm:function(object, form, arrayPropIndexes){
			
			if(typeof(object) != "object" || object == null) return
			////console.log('FormManager > arrayIndexes')
			////console.log(arrayPropIndexes)
			var flattened = {};
			this.flattenNames(object, flattened, arrayPropIndexes);
			
			////console.log('FormManager > flattened')
			//console.log(flattened);
			//var position = this.getLatLng(flattened);
			var position = object.loc;
			if(typeof(position) != "undefined" && position != null){
				flattened.loc = position;	
			}else{
				var address = this.getAddress(flattened);
				if(address != null && address != "" && address != " "){
					flattened.loc = address;	
				}
			}
			//console.log(flattened)
			form._entity = object; // This is set so that app.form.Manager can have access to the original values 
			form._flattenedEntity = flattened; // This is set so that app.form.Manager can have access to the original values 
			form._arrayPropIndexes = arrayPropIndexes; // This is set so that app.form.Manager can have access to the array Indexes
			
			// default dojox form.Manager setFormValues
			form.setFormValues(flattened);
			return flattened; // so that overriding classes have access to both the original object and the flattened one
		},
		
		
		flattenNames:function(object, flattened, arrayPropIndexes, path){
			if(typeof(path) == "undefined"){
				path = "";
			}
			
			for(var p in object){
				var prop = object[p];
				var newPath = "";
				path == "" ? newPath = path + p : newPath = path + "." + p;
				
				if(lang.isArray(prop)){
					
					if(typeof(arrayPropIndexes) != "undefined" && arrayPropIndexes.hasOwnProperty(p) && typeof(prop[arrayPropIndexes[p]]) != "undefined"){
						//console.log("Found array " + p + " and have index " + arrayPropIndexes[p]);
						path == "" ? newPath = path + p + "[x]" : newPath = path + "." + p + "[x]";
						this.flattenNames(prop[arrayPropIndexes[p]], flattened, arrayPropIndexes, newPath);
					}else{
						//console.log('undefined array index for' + newPath)
						flattened[newPath] = prop;
					}
					
				}else if(typeof(prop) == "object" && prop != null){
					if(typeof(prop.$ref) != "undefined"){
						flattened[newPath] = prop.id;
					}
					
					this.flattenNames(prop, flattened, arrayPropIndexes, newPath);
				}else{
					flattened[newPath] = prop;
				}
			}
			
		},
		
		
		/**
		 * 
		 * _formManagerEntityCreated
		 * 
		 * When an entity is created via a POST it will trigger this method here so we can repopulate the form.
		 * 
		 */
		_formManagerEntityCreated:function(entityId){
			////console.log("_formManagerEntityCreated > ")
			this.entityCreated(entityId);
			var owner = this;
			emanda2.entities.withEntity(entityId, this.__form.storeUrl, function(data){
				owner.updatingEntity = data;
				owner.viewInForm(data, owner.__form);
			});
		},
		
		/**
		 * 
		 * entityCreated provides an opportunity for overriding
		 * 
		 */
		entityCreated:function(entityId){
			
		},		
		
		/*
		getLatLng:function(object){
			var latField = null
			var lngField = null
			for(var p in object){
				// find latitude field
				if(p.indexOf('latitude') != -1){
					
					if(p.indexOf("mail_") != -1){
						var noMailProp = p.split("mail_").join("");
						if(object.hasOwnProperty(noMailProp)){
							p = noMailProp;
						}
					}
					
					if(latField == null){
						latField = p;
					}
					
				}
				
				// find longitude field
				if(p.indexOf('longitude') != -1){
					
					if(p.indexOf("mail_") != -1){
						var noMailProp = p.split("mail_").join("");
						if(object.hasOwnProperty(noMailProp)){
							p = noMailProp;
						}
					}
					
					if(lngField == null){
						lngField = p;
					}
					
				}
			}
			
			if(latField && lngField){
				//return {latitude:object[latField], longitude:object[lngField]};
				return [object[latField], object[lngField]];
			}
			
			return null;
		},
		*/
		
		getAddress:function(object){
			var addressyWords = [
				'street', 
				'city', 
				'province', 
				'state', 
				'country'
			];
			
			var addressArr = [];
			for (var i=0; i < addressyWords.length; i++) {
				var word = addressyWords[i];
				for(var p in object){
					if(p.indexOf(word) != -1){
						
						// if this is a _entity_mail_street or _entity_mail_city, check for a _entity_street or _entity_city first
						if(p.indexOf("mail_") != -1){
							var noMailProp = p.split("mail_").join("");
							if(object.hasOwnProperty(noMailProp)){
								p = noMailProp;
							}
						}
						
						var propertyNum = this.getNumberFromProperty(p);
						if(propertyNum < 2){
							addressArr.push(object[p]);
						}else if(propertyNum == 2){
							var propNoNumber = p.split("2").join("");
							if(object.hasOwnProperty(propNoNumber + "1")){
								addressArr.push(object[propNoNumber + "1"] + " " + object[p]);
							}else{
								addressArr.push(object[p]);
							}
						}
						break;
					}
					
				};
			}
			
			if(addressArr.length > 0){
				return addressArr.join(" ");
			}else{
				return null;
			}
			
			
		},
		
		getNumberFromProperty:function(name){
			var matches = name.match(/[0-9]+/);
			if(matches && matches.length > 0){
				return parseInt(matches[0]);
			}else{
				return 0;
			}
		}
		
			
			
	});
});
