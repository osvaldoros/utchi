define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"app/uicomponents/blocks/GridManagerBlock",
	"app/store/GridFormatters",
	"app/utils/HashManager"	
	],
	function(declare, on, lang, GridManagerBlock, GridFormatters, HashManager){
	
	return declare("app.modules.companies.companySetup.configServices.configDrug.Groups", [GridManagerBlock], {
		title:"Groups company belongs to",
		_store:emanda2.urls.GROUPS_OF_COMPANY,
		_showAddBtn:false,
		_showEditBtn:false,
		_showDeleteBtn:false,
		_base_query:function(){
			return {"co_id": HashManager.getInstance().getEntity()}
		},
		_columns: [
			{label:"Name", field:'name', sortable:true},
			{label:'Companies', field:'companies', sortable:false, renderCell: GridFormatters.nestedObjectCount}
		]
	});
});
