define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",	
	"dijit/_WidgetBase", 	
	"dijit/_TemplatedMixin", 
	"dijit/_WidgetsInTemplateMixin",
	"app/mixins/StatefulModule",
	"dojo/text!./templates/Story.html", // this is what includes the html template
	"dojo/_base/lang",

	"dijit/layout/ContentPane",
	"dojox/validate",
	"dojox/validate/web",
	"dijit/Editor",
	"app/uicomponents/Editor",
	"dijit/form/TextBox",
	"dijit/form/TimeTextBox",
	"dijit/form/DateTextBox",
	"app/form/FilteringSelect",
	"dijit/form/CheckBox",
	"dijit/form/RadioButton",
	"dijit/form/ValidationTextBox",

	"app/utils/HashManager",
	"dojox/embed/Flash"
	],
	function(declare, on, domClass, domConstruct, domStyle, WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule, template, lang,
		ContentPane, Validate, Validate_web, Editor, DCEditor, TextBox, TimeTextBox, DateTextBox, FilteringSelect, CheckBox, RadioButton, ValidationTextBox,
		HashManager, Flash){
	
	return declare("app.modules.Story", [WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StatefulModule], {

			widgetsInTemplate: true, // To let the parser know that our template has nested widgets ( default is false to speed up parsing )
			templateString: template, // Our template - important!

			startup:function(){
				this.inherited(arguments);

				this.storyTitle = this.getWidget("storyTitle");
				this.storyContent = this.getWidget("storyContent");

				this.thumbContainer = this.getWidget("thumbContainer");
				this._recordBtn = this.getWidget("_recordBtn");

				this.commentContainer = this.getWidget("commentContainer");
				this._commentBtn = this.getWidget("_commentBtn");
				var owner = this;

				/*Nimbb_initCompleted = function(){
					owner.nimbbPlayerReady();
				}*/

				Nimbb_videoSaved = function(idPlayer){
					console.log("Nimbb_videoSaved > " + idPlayer)
					var videoId = document.getElementById(idPlayer).getGuid();
					owner.addVideoToStory(videoId);
				}

				Nimbb_record = function(){
					owner.recordNarration();
				}

				Nimbb_comment = function(){
					owner.onCommentClicked();
				}

				Nimbb_thumbClicked = function(guid){
					console.log("Nimbb_thumbClicked > " + guid);
					owner.playVideo(guid);
				}


				emanda2.workspaceManager.getDialogFromModuleURL("app/modules/AddComment", {title:"New Comment", dialogWidth:"500px", dialogHeight:"350px", callBack:lang.hitch(this, "dialogReady")});
			},

			dialogReady:function(dialog){
				this.newCommentDialog = dialog;
			},
			
			onCommentClicked:function(event){

				if(typeof(this.newCommentDialog) != "undefined"){
					this.newCommentDialog.show();
				}
			},			

			setCurrentState:function(state){
				this.inherited(arguments);
			},			
			
			onActivate:function(){
				this.inherited(arguments);
				
				if(typeof(this.eventHandlers) == "undefined"){
					this.eventHandlers = [];
				}
				this.initStory()

				this.eventHandlers.push( on(this._recordBtn, "click", lang.hitch(this, "recordNarration")));
				this.eventHandlers.push( on(this._commentBtn, "click", lang.hitch(this, "onCommentClicked")));

				emanda2.entities.setCurrentComponent(this);
			},

			createPlayer:function(guid){

				var playerConfig = {
					width: 320,
					height: 240,
					id:'nimbb',
					params: {
						wmode: 'opaque', 
						allowScriptAccess:'always', 
						allowFullScreen:'true'
					},
					vars: {}
				}
				
				if(typeof(guid) != "undefined"){
					playerConfig.path = 'http://player.nimbb.com/nimbb.swf?mode=view&audioquality=5&simplepage=1&key=8aefb745aa&guid='+guid
				}else{
					playerConfig.path = 'http://player.nimbb.com/nimbb.swf?mode=record&audioquality=5&simplepage=1&key=8aefb745aa'
				}

				var movie = new dojox.embed.Flash(playerConfig, "flashContainer");
			},

			/*nimbbPlayerReady:function(){
				this._playerReady = true;
				if(this.isActive()){
					this.initStory();
				}
			},*/

			initStory:function(story){
				var storyId = HashManager.getInstance().getEntity();
				var storyCollection = emanda2.entities.getStories()
				
				if(typeof(story) == "undefined" && typeof(storyCollection) != "undefined" && storyCollection != null){
					story = storyCollection.get(storyId);
				}

				if(typeof(story) == "undefined"){
					var owner = this;
					var req = emanda2.api.get(emanda2.urls.GET_STORY + "?id=" + storyId);
					req.then(function(data){
						var story = data.result;
						owner.renderStory(story);
					})
				}else{
					this.renderStory(story);
				}

			},

			refresh:function(story){
				this.initStory(story);
			},

			renderStory:function(story){
				if(typeof(story) == "object" && story != null){
					emanda2.entities.setCurrentStory(story);
					this.storyTitle.innerHTML = story.title;
					this.storyContent.set("content", story.content);
					this.createNarrationThumbs(story);
					this.createComments(story);
				}
			},

			createNarrationThumbs:function(story){

				if(typeof(this.thumbContainer.id) == "undefined" || this.thumbContainer.id == ""){
					this.thumbContainer.id = this.id + "_thumbContainer";
				}
				// empty the narration thumbs
				domConstruct.empty(this.thumbContainer.id);

				if(lang.isArray(story.videos) && story.videos.length > 0){

					for (var i = story.videos.length - 1; i >= 0; i--) {
						var video = story.videos[i];


						var div = domConstruct.toDom('<div style="padding: 5px; background-color:#B9AA8E; width:110px; float:left;"></div>');					
						var img = domConstruct.toDom('<a href="#" onclick="Nimbb_thumbClicked(\''+video.guid+'\'); return false;"><img src="http://images.splosive.com/'+video.guid+'.jpg" alt="'+video.created_by +'" height="75" width="100"></a>');					
						var span = domConstruct.toDom('<span style="text-align:middle;"><br/>'+ video.created_by +'</span>');					

						domConstruct.place(img, div);					
						domConstruct.place(span, div);					
						domConstruct.place(div, this.thumbContainer);					
					}

					// play the first video
					this.createPlayer(story.videos[0].guid);
				}else{

					// no videos
					var span = domConstruct.toDom('<a href="#" onclick="Nimbb_record(); return false;"><span><br/>Be the first one to record a narration!</span></a>');					
					domConstruct.place(span, this.thumbContainer);					

					this.createPlayer();
				}

			},

			createComments:function(story){
				if(typeof(this.commentContainer.id) == "undefined" || this.commentContainer.id == ""){
					this.commentContainer.id = this.id + "_commentContainer";
				}
				// empty the narration thumbs
				domConstruct.empty(this.commentContainer.id);

				if(lang.isArray(story.comments) && story.comments.length > 0){

					for (var i = story.comments.length - 1; i >= 0; i--) {
						var comment = story.comments[i];

						var bgColor = i % 2 != 0 ? "#FAF0E6" : "#DDDDDD";

						var div = domConstruct.toDom('<div style="padding-left: 5px; background-color:'+bgColor+'; padding-top:5px;"></div>');					
						var datespan = domConstruct.toDom('<span style="float:right; font-size:x-small;">'+this.formatDate(comment.created) +'</span>');					
						var span = domConstruct.toDom('<span><p style="font-weight:bold; margin:0;">'+ comment.created_by +' : </p><p style="margin-top:5px; margin-bottom:0;">'+ comment.content +'</p></span>');					

						domConstruct.place(datespan, div);					
						domConstruct.place(span, div);					
						domConstruct.place(div, this.commentContainer);					
					}

				}else{
					// no comments
					var span = domConstruct.toDom('<a href="#" onclick="Nimbb_comment(); return false;"><span><br/>Be the first one to comment on this story!</span></a>');					
					domConstruct.place(span, this.commentContainer);					
				}
			},

			formatDate:function(UNIX_timestamp){
				var a = new Date(UNIX_timestamp*1000);
				var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
			    var year = a.getFullYear();
			    var month = months[a.getMonth()];
			    var date = a.getDate();
			    var hour = a.getHours();
			    var min = a.getMinutes();
			    var sec = a.getSeconds();
			    var time = date+','+month+' '+year+' '+hour+':'+min+':'+sec ;
			    return time;
			 },

			addVideoToStory:function(videoId){

				var payload = {
					story_id: HashManager.getInstance().getEntity(),
					video: {
						guid: videoId,
						created_by: emanda2.user.name
					}
				}

				var req = emanda2.api.post(emanda2.urls.ADD_VIDEO_TO_STORY, payload);
				var owner = this;
				req.then(function(response){
					owner.initStory(response.result);
				})

			},

			playVideo:function(guid){
				var player = this.getWidget("nimbb");
				if(player.getMode() == "record"){
					player.setMode("view");
				}
				player.setGuid(guid);
				player.playVideo(true);
			},

			recordNarration:function(event){
				var player = this.getWidget("nimbb");
				if(player.getMode() == "view"){
					player.setMode("record");
				}

				if(!player.isCaptureAllowed()){
					player.showPrivacySettings();
				}
			},

			onDeactivate:function(){
				//remove event handlers
				for (var i=0; i < this.eventHandlers.length; i++) {
				  this.eventHandlers[i].remove();
				};
				
				this.eventHandlers = []
				
			}
			
	});
});
