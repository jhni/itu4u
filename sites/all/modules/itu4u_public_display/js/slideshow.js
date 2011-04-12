var timer = 0;
var running = false;

var _info = function(msg) {
	if(window.console) {
		window.console.info( msg );//eb.__log(arguments);
	}
}

$.fn.slideshow = function(node) {

	// Update number of tracked devices
	$.getJSON("http://itu4u.com/sites/all/modules/itu4u_public_display/php/blip.php?zone=itu&jsoncallback=?",
		function(devices){ 
			$("#devices").html("Tracking "+devices.length+" devices.");
		});
			
	if( !running && node == undefined){
		$(".HighLight").toggleClass('HighLight',3000);
				 							
		var index = Math.floor(Math.random()*$(".note").length);
		$(".note").eq(index).toggleClass('HighLight',3000);
		$(".note").eq(index).css({'z-index' : zindex});
		zindex = zindex +1;
		
		// Video message
		if($(".note").eq(index).find("video").length > 0){
			
			$(".note").eq(index).find("video").get(0).play();
			running=true;
			
			$(".note").eq(index).find("video").bind('ended', function(){
        		running=false;
        		$(".note").eq(index).find("video").get(0).currentTime(0);
  			});		
		}		
		
		$.get("http://itu4u.com/display/read/" + $(".note").eq(index).attr('id'));
		_info('Highlight msg ' + $(".note").eq(index).attr('id') );
	}
	
	if(node != undefined){
		$(".HighLight").toggleClass('HighLight',3000);
		running=true;
		$(node).toggleClass('HighLight',3000);
		$(node).css({'z-index' : zindex});
		zindex = zindex +1;
		
		//$("video",node).get(0).play()
		
		
		// Video message
		if($("video",node).length > 0){
			
			$("video",node).get(0).play();
			running=true;
			
			$("video",node).bind('ended', function(){
        		running=false;
  			});		
		}	
		
		
		// Positioning in the upper, lower, right or left rim
 		var rim  = Math.floor(Math.random()*4+1);		
 					switch(rim)
					{
						// Upper rim 
						case 1:
						$(node).css("top", Math.floor(Math.random()*15+1-10)+"%").css("left", Math.floor(Math.random()*90+1)+"%");
						break;
						
						// Lower rim 
						case 2:
						$(node).css("top", Math.floor(Math.random()*15+1+75)+"%").css("left", Math.floor(Math.random()*90+1)+"%");
						break;
						
						// Left rim 
						case 3:
						$(node).css("top", Math.floor(Math.random()*90+1)+"%").css("left", Math.floor(Math.random()*15+1-10)+"%");
						break;
						
						// Right rim 
						case 4:
						$(node).css("top", Math.floor(Math.random()*100+1)+"%").css("left", Math.floor(Math.random()*15+1+75)+"%");
						break;
						
						// default right rim 
						default:
						$(node).css("top", Math.floor(Math.random()*100+1)+"%").css("left", Math.floor(Math.random()*25+1+75)+"%");
					}
		
		$.get("http://itu4u.com/display/read/" + $(".note").eq(index).attr('id'));
		_info('Highlight msg ' + $(".note").eq(index).attr('id') );
	}
		
}
  
/******
 Update data every 10 sec.
*******/
$(document).everyTime(10000, function(i){$(document).slideshow();}, 0);