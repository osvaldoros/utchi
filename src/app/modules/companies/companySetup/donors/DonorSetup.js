define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"app/uicomponents/blocks/WizardManagerBlock",
	"app/utils/HashManager"	
	],
	function(declare, on, lang, WizardManagerBlock, HashManager){
	
	return declare("app.modules.companies.donors.DonorSetup", [WizardManagerBlock], {
		hashManager: HashManager.getInstance(),				
		_store:emanda2.urls.DONOR,
		_entityLabel: "donor",
		
		constructor: function(args){
			declare.safeMixin(this,args || {});
			
			this.overviewStep =  { title: 'Overview', moduleURL:'app/modules/companies/companySetup/donors/donorSetup/Overview'};
			this._hashManagement = null; // we don't want this wizard to impact the url
			
			this._steps = [
				{ title: 'Identity', moduleURL:'app/modules/companies/companySetup/donors/donorSetup/Identity'},
				{ title: 'Type', moduleURL:'app/modules/companies/companySetup/donors/donorSetup/Type'},
				{ title: 'Dates', moduleURL:'app/modules/companies/companySetup/donors/donorSetup/Dates'}
			]
		},
		
		onActivate:function(){
			var donor = emanda2.entities.getCurrentDonor();
			this.updateTitle(donor);
			this.reconfigureWizard(donor);
			this.inherited(arguments);
		},
		/**
		 * prepareForSave
		 * 
		 * Overriden from WizardManager when the component is getting ready to save, it gives us a chance to massage the data a bit...
		 * 
		 */
		prepareForSave:function(){
			var changesObject = this.changeTracker.getChangesObject(emanda2.urls.DONOR);
			if(typeof(this.company) != "undefined"){
				changesObject.company = this.company // company was injected into this Dialog at some point by its launcher
				return true;
			}else{
				var owner = this;
				emanda2.entities.getEntityFromHash(emanda2.urls.COMPANY, function(company){
					changesObject.company = company // No company was injected so let's assume the entity id in the url is from a company and let's try to fetch it
					owner.save(); // manually calling Saver's save method now that we have the company
				})
				return false; // this is so that saver doesn't save automatically until we've fetched the company
			}
		}			
	});
});