/*
 * 
 */
define([
	"dojo/_base/declare"
	],
	function(declare){
	
	return declare([], {
			
			init:function(){
				
				
				this.ADD_STORY = dojo.config.drivercheck.api_host + "stories/addStory";
				this.GET_STORY = dojo.config.drivercheck.api_host + "stories/getStory";
				this.LIST_STORIES = dojo.config.drivercheck.api_host + "stories/listStories";
				this.ADD_VIDEO_TO_STORY = dojo.config.drivercheck.api_host + "stories/addVideoToStory";
				this.ADD_COMMENT_TO_STORY = dojo.config.drivercheck.api_host + "stories/addCommentToStory";

			},
			
			list:function(){
				
			}
	});
});
