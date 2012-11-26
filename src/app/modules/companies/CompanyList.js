define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"app/uicomponents/blocks/GridManagerBlock"
	],
	function(declare, on, lang, GridManagerBlock){
	
	return declare("app.modules.companies.CompanyList", [GridManagerBlock], {
		title:"Companies",
		_store:emanda2.urls.COMPANY,
		_entityLabel: "Company",
		_columns: [
			{label:"Id", field:"id", sortable:true},
			{label:"Name", field:"name", sortable:true},
			{label:"Address", field:"street1", sortable:true},
			{label:"City", field:"city", sortable:true},
			{label:"Phone", field:"phone"}
		]
	});
});
