define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"app/uicomponents/MoreInfoRenderer"
	],
	function(declare, on, lang, MoreInfoRenderer){
		
		return declare("app.uicomponents.moreInfoRenderers.DonorMoreInfoRenderer", [MoreInfoRenderer], {


			includeProperties:{
				"street1":true,
				"city":true,
				"province":true,
				"postal":true,
				"email":true,
				"birth_date":true,
				"social":true,
				"active":true,
				"id":true
			},

			
			getContent:function(data){
				var objectInfo = "";
				objectInfo += "<div class='moreInfo'>";
					objectInfo += "<h2>" + data.name + "</h2>";
					objectInfo += "<ul>";
					for(var p in data){
						if(this.includeProperties[p]){
							objectInfo += "<li><strong>"+p+ "</strong> : " +data[p]+"</li>";
						}
					}
					objectInfo += "</ul>";
				objectInfo += "</div>";

				return objectInfo;
			}

	});
});
