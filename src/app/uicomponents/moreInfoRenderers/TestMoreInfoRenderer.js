define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/dom-class",
	"dojo/_base/lang",
	"app/uicomponents/MoreInfoRenderer"
	],
	function(declare, on, domClass, lang, MoreInfoRenderer){
		
		return declare("app.uicomponents.moreInfoRenderers.TestMoreInfoRenderer", [MoreInfoRenderer], {

			getName:function(data){
				var testInfoArr =[];

				if(typeof(data.service) == "object" && data.service != null)  testInfoArr.push(data.service.name);
				if(typeof(data.battery) == "object" && data.battery != null)  testInfoArr.push(data.battery.name);
				if(typeof(data.sample_type) == "object" && data.sample_type != null)  testInfoArr.push(data.sample_type.name);
				if(typeof(data.collection_type) == "object" && data.collection_type != null)  testInfoArr.push(data.collection_type.name);

				return testInfoArr.join(", ");
			},

			renderItem:function(data){
				this.inherited(arguments);
				if(data.fixed == true || data.fixed == "true"){
					domClass.add(this.name, "lockedRow");
				}
			},
			
			getContent:function(data){
				var objectInfo = "";
				objectInfo += "<div class='moreInfo'>";
				objectInfo += "<h2>" + this.getName(data) + "</h2>";
					objectInfo += "<ul>";
					
						if(typeof(data.service) == "object" && data.service != null) objectInfo += "<li><strong>service</strong> : " + data.service.name + "</li>";
						if(typeof(data.reason) == "object" && data.reason != null) objectInfo += "<li><strong>reason</strong> : " + data.reason.name + "</li>";
						if(typeof(data.battery) == "object" && data.battery != null) objectInfo += "<li><strong>battery</strong> : " + data.battery.name + "</li>";
						if(typeof(data.sample_type) == "object" && data.sample_type != null) objectInfo += "<li><strong>sample type</strong> : " + data.sample_type.name + "</li>";
						if(typeof(data.collection_type) == "object" && data.collection_type != null) objectInfo += "<li><strong>collection type</strong> : " + data.collection_type.name + "</li>";
						if(typeof(data.lab) == "object" && data.lab != null) objectInfo += "<li><strong>lab</strong> : " + data.lab.name + "</li>";
						
						objectInfo += "<li><strong>fixed</strong> : " + data.fixed + "</li>";

					objectInfo += "</ul>";
				objectInfo += "</div>";

				return objectInfo;
			}

	});
});
