define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"app/uicomponents/blocks/WizardManagerBlock"
	],
	function(declare, on, lang, WizardManagerBlock){
	
	return declare("app.modules.companies.CompanySetup", [WizardManagerBlock], {
		_store:emanda2.urls.COMPANY,
		_entityLabel: "company",
		_showNotes:true,
		
	    constructor: function(args){
	        declare.safeMixin(this,args || {});
	        this.overviewStep = { title: 'Overview', moduleURL:'app/modules/companies/companySetup/Overview'};
			this._steps = [
				{ title: 'Basic', moduleURL:'app/modules/companies/companySetup/BasicInfo'},
				{ title: 'Type', moduleURL:'app/modules/companies/companySetup/Type'},
				{ title: 'Homebases', moduleURL:'app/modules/companies/companySetup/Homebases'},
				{ title: 'Services', moduleURL:'app/modules/companies/companySetup/ServicesOffered'},
				{ title: 'Donors', moduleURL:'app/modules/companies/companySetup/Donors'},
				{ title: 'Contacts', moduleURL:'app/modules/Contacts'},
				{ title: 'Booking', moduleURL:'app/modules/companies/companySetup/Booking'},
				{ title: 'Users', moduleURL:'app/modules/Users'},
				{ title: 'Reports', moduleURL:'app/modules/companies/companySetup/Reports'},
				{ title: 'Billing', moduleURL:'app/modules/companies/companySetup/Billing'}
			];
	    }		
	});
});