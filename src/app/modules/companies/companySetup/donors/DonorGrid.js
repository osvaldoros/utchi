define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"app/uicomponents/blocks/GridManagerBlock",
	
	"app/utils/HashManager",
	"./DonorSetup"
	],
	function(declare, on, lang, GridManagerBlock, HashManager, DonorSetup){
	
	return declare("app.modules.companies.companySetup.donors.DonorGrid", [GridManagerBlock], {
		title:"Donors",
		gridHeight:"290px",
		
		_store:emanda2.urls.DONOR,
		_entityLabel: "Donor",
		_columns: [
			{label:'Name', field:'name', sortable:true},
			{label:'Address', field:'street1', sortable:true},
			{label:'City', field:'city', sortable:true},
			{label:'Social Insurance', field:'social', sortable:true},
			{label:'Date of Birth', field:'birth_date', sortable:false}
		],
		_base_query: function(){
			return {"company.id": HashManager.getInstance().getEntity()}
		},
		
		startup:function(){
			this.inherited(arguments);
			this.donorSetupDialog = emanda2.workspaceManager.getModuleInDialog(new DonorSetup(), {title:"Donor Setup", dialogWidth:"500px", dialogHeight:"400px"});
		},
		
		// invoked by GridManagerBlock
		onAddClicked: function(event){
			emanda2.entities.setCurrentDonor(null);
			this.donorSetupDialog.show();
		},
		
		// invoked by GridManager mixin
		editEntity:function(donor){
			emanda2.entities.setCurrentDonor(donor);
			this.donorSetupDialog.show();
		},
		
		/*
		 * destroy
		 * 
		 * Since we created the contactSetupDialog manually we need to make sure it is detroyed when this component is destroyed
		 */
		destroy:function(){
			this.donorSetupDialog.destroyDescendants();
			this.donorSetupDialog.destroy();
			this.inherited(arguments);
		}
		
	});
});
