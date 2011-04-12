
/******

Updates the AirNotes display on public displays. Must be run on either google chorme or safari

*******/
var macs_in_zone = new Array();
var timer = 0;

	var _info = function(msg) {
		if(window.console) {
			window.console.info( msg );//eb.__log(arguments);
		}
	}


// Templates
var audio_template = '<span><!--text--!></span><audio autobuffer><source src="<!--mp3file--!>" /></audio>';
var video_template = '<video height="100%" src="<!--mp4file--!>" autobuffer poster="<!--pngfile--!>" />';
var image_template = '<img align="absmiddle" src="<!--imgfile--!>" />';
var text_template  = '<span><!--text--!></span>';

// Render messages
// Priority: Video, Audio, Image & Text
function RenderNode( message ){
	
	
	_info('Render message');
	
	// Video
	if(message.node.Video){	
		var tmp = video_template;
		tmp = tmp.replace("<!--mp4file--!>", message.node.Video);
		
		if(message.node.field_poster_fid){
			tmp = tmp.replace("<!--pngfile--!>", message.node.field_poster_fid);	
		}else {
			tmp = tmp.replace("<!--pngfile--!>", "");
		}
		
		return tmp;
	}
	
	// Audio
	if(message.node.Audio){	
		var tmp = audio_template;
		tmp.replace("<!--mp3file--!>", message.node.Audio);
		tmp.replace("<!--text--!>", message.node.body);
		return tmp 
	}

	// Image
	if(message.node.Audio){	
		var tmp = image_template;
		return tmp.replace("<!--imgfile--!>", message.node.Audio);
	}
	
	// Text
	if (message.node.body){
		var tmp = text_template;
		return tmp.replace("<!--text--!>", message.node.body);
	}

	return "<span>Content not found</span>";
}

$.fn.airnotesupdate = function(){						
																		
				$.getJSON("notes/json/all",
					function(notes){	
					//_info('Notes loaded: '+ notes.length);
						$.each(notes, function(i,airnotes){
							$.each(airnotes, function(i,airnote){	
							
								//Does the element exist ?
								if($('#'+ airnote.node.nid).length == 0){
										
									// Display nodes 		
					 				//OLD var image = $('<div id="'+airnote.node.nid+'"><img src="'+airnote.node.Image+'" width="50%" align="middle" style="display:block;margin-right:auto;margin-left:auto;" />'+airnote.node.body+'<p>Posted by <b>'+ airnote.node.user_name+'</b></p><br/>'+ airnote.node.rating+'</div>').attr("class", "note " + mac['terminal-id']);
				 					//OLD var image = $('<div id="'+airnote.node.nid+'"><div class="container"><div class="content"><span>'+airnote.node.body+'</span></div><div class="author">Posted by <b>'+ airnote.node.user_name+'</b><br/>'+ airnote.node.rating+'</div></div></div>').attr("class", "note " + mac['terminal-id']);		
				 					//_info('Msg loaded: ' + airnote.node.nid);
				 					
				 					var image = $('<div id="'+airnote.node.nid+'"><div class="container"><div class="content">'+RenderNode( airnote )+'</div><div class="author">Posted by <b>'+ airnote.node.Name+'</b><br/>'+ airnote.node.rating+'</div></div></div>').attr("class", "note");
				 					
				 					// Positioning in the upper, lower, right or left rim
				 					var rim  = Math.floor(Math.random()*3+1);		
				 					switch(rim)
									{
										// Upper rim 
										case 1:
  										image.css("top", Math.floor(Math.random()*15+1-10)+"%").css("left", Math.floor(Math.random()*90+1)+"%");
  										break;
  										
										// Left rim 
										case 2:
  										image.css("top", Math.floor(Math.random()*50+1)+"%").css("left", Math.floor(Math.random()*15+1-10)+"%");
  										break;
  										
										// Right rim 
										case 3:
  										image.css("top", Math.floor(Math.random()*90+1)+"%").css("left", Math.floor(Math.random()*15+1+75)+"%");
  										break;
  										
  										// Lower rim 
										case 4:
  										image.css("top", Math.floor(Math.random()*15+1+75)+"%").css("left", Math.floor(Math.random()*90+1)+"%");
  										break;
  										
										// default right rim 
										default:
  										image.css("top", Math.floor(Math.random()*100+1)+"%").css("left", Math.floor(Math.random()*25+1+75)+"%");
									}
				 					
				 					// Assign random color ( debuging )
				 					var col = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
				 						

				 					/*
				 					if(airnote.node.Name == "admin"){
				 					
				 						var col = 'rgb(255,255,0)';
				 					
				 					}else{
				 					
				 						var col = 'rgb(51,255,0)';
				 						
				 					}
				 						
				 					*/	
				 					image.css("backgroundColor",col);
				 
				 					// Rotate and scale
				 					var random = Math.floor(Math.random()*60+1)-30;
				 					image.css("-webkit-transform", "rotate("+random+"deg) scale(0.4)");
				 					
				 					// Add the note Debug max 60 notes
				 					if( $(".note").length < 60 ) {				
				 						image.css({'z-index' : zindex})
				 						zindex = zindex +1;
				 						image.hide().appendTo("body").fadeIn("slow");
				 						_info('Msg displayed: ' + airnote.node.nid);
				 						
				 						
				 						$('#'+ airnote.node.nid).hover(
  												function () {
    												$(document).slideshow(this);
  												},
  												function () {
    												running=false; 
    												$("video",this).get(0).pause();
  												}
												);
				 					}				 					
			 					}			 					
							});					
						});			
				});
};

/******

 Update data every 10 sec.

*******/
$(document).everyTime(10000, function(i){$(document).airnotesupdate();}, 0);