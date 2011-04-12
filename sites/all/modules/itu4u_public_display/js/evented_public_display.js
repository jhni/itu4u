/*
* ITU4U Public Display EventBus link
* instruct the page to register listeners and get Blip events,
* figure out which mac address are visible in the zone
* and load the macs' nodes.
* TODO: update a visible user list in the page too!
*/
(function($)
{
	var _info = function(msg) {
		if(window.console) {
			window.console.info( msg );//eb.__log(arguments);
		}
	}

	//after 20 seconds, if we didn't received any new event about a mac, we remove the mac anyway
	var max_delay = 60000;
	//wait at least 5 seconds btw. refresh user nodes
	var refresh_delay = 5000;
	//actually, this become an associative array: macs_in_zone[mac_addr] = last_seen_timestamp
	var macs_in_zone = [];
	var refreshing = [];
	var timer = 0;

	// Templates
	var audio_template = '<span><!--text--!></span><audio autobuffer><source src="<!--mp3file--!>" /></audio>';
	var video_template = '<video height="100%" src="<!--mp4file--!>" autobuffer poster="<!--pngfile--!>" />';
	var image_template = '<img align="absmiddle" src="<!--imgfile--!>" />';
	var text_template  = '<span><!--text--!></span>';


	// Render messages
	// Priority: Video, Audio, Image & Text
	var RenderNode = function( message ){
		_info('rendering message..');
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
	};
	
	var OnNodes = function(notes,mac){
		$.each(notes, function(i,airnotes){
			$.each(airnotes, function(i,airnote){	
				//Does the element exist ?
				if($('#'+ airnote.node.nid).length == 0){
						
					// Display nodes 		
 					var image = $('<div id="'+airnote.node.nid+'"><div class="container"><div class="content">'+RenderNode( airnote )+'</div><div class="author">Posted by <b>'+ airnote.node.Name+'</b><br/>'+ airnote.node.rating+'</div></div></div>').attr("class", "note " + mac);
 					
 					// Positioning in the upper, lower, right or left rim
 					var rim  = Math.floor(Math.random()*4+1);		
 					switch(rim)
					{
						// Upper rim 
						case 1:
						image.css("top", Math.floor(Math.random()*15+1-10)+"%").css("left", Math.floor(Math.random()*90+1)+"%");
						break;
						
						// Lower rim 
						case 2:
						image.css("top", Math.floor(Math.random()*15+1+75)+"%").css("left", Math.floor(Math.random()*90+1)+"%");
						break;
						
						// Left rim 
						case 3:
						image.css("top", Math.floor(Math.random()*90+1)+"%").css("left", Math.floor(Math.random()*15+1-10)+"%");
						break;
						
						// Right rim 
						case 4:
						image.css("top", Math.floor(Math.random()*100+1)+"%").css("left", Math.floor(Math.random()*15+1+75)+"%");
						break;
						
						// default right rim 
						default:
						image.css("top", Math.floor(Math.random()*100+1)+"%").css("left", Math.floor(Math.random()*25+1+75)+"%");
					}
 					
 					// Assign random color ( debuging )
 					var col = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
 					image.css("backgroundColor",col);

					image.hover(
  									function () {
    												$(this).addClass("hover");
    												$(document).slideshow();
  												},
  									function () {
    												running=false;

  												}
								 );
 					
 					// Rotate and scale
 					var random = Math.floor(Math.random()*60+1)-30;
 					image.css("-webkit-transform", "rotate("+random+"deg) scale(0.4)");
 					
 					// Add the note Debug max 60 notes
 					if( $(".note").length < 60 ) {
 						image.hide().appendTo("body").fadeIn("slow");	 		
 						
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
	};

	//reference to the listener called when a mac is seen in the current zone
	var enterZoneListener = null;
	//reference to the listener called when a mac leave the zone
	var leftZoneListener = null;

	//eventbus shorter alias
	var eb = $.eventbus;

	//evetnbus initialization function, called every time a connection is made
	var ebInit = function() {
		_info('init eb');
		//just register the listeners

		//register for events that matches zone.current == zone, has any user with any mac address
		enterZoneListener = $.createEventBusListener(
			[ eb.Eq('zone.current',blipzone), /*eb.Any('user'),*/ eb.Any('terminal.btmac'), eb.Eq('type','device.detected') ],
			enterZoneFun
		);

		//register for events that matches zone.previous == zone, has any user with any mac address
		leftZoneListener = $.createEventBusListener(
			[ eb.Eq('zone.previous',blipzone), /*eb.Any('user'),*/ eb.Any('terminal.btmac'), eb.Eq('type','device.moved') ],
			leftZoneFun
		);
	};

	//put the given mac address in the array, updating the timestmap
	var putMac = function(mac) {
		if(macs_in_zone[mac] == undefined) {
			GetUserNodes(mac);
		} else {
			if( (new Date().getTime() - macs_in_zone[mac]) > refresh_delay ) {
				GetUserNodes(mac);
			}
		}
		macs_in_zone[mac] = new Date().getTime();
		_info('last timestamp for ' + mac + " is: " + macs_in_zone[mac]);
	};

	//check if some macs are not updated since at least max_delay milliseconds
	var checkMacs = function() {
		var ref = new Date().getTime();
		for(var i in macs_in_zone) {
			var ts = macs_in_zone[i];
			if( (ref - ts) > max_delay ) {
				//delete the reference in the array and remove the DOM node too
				delete macs_in_zone[i];
				$("." + i).fadeOut(1500, function(){$(this).remove();});
			}
		}
	};
	
	var GetUserNodes = function( mac ) {
		
/*		$.ajax({
			url: 'http://itu4u.com/notes/json/' + mac,
			dataType: 'json',
			success: OnNodes,
			error: function() { _info(arguments); }
		});*/
		$.getJSON("http://itu4u.com/notes/json/"+mac + "/" + blipzone, function(data){ OnNodes(data,mac); });
	};
	
	//callback function for the enterZoneListener
	//update mac timestamp and get the nodes.
	//Ideally, we'd like to load all the nodes just once,
	//so either we:
	//1) use a bit of ReST magic, and load contents only if it has changed since last time we checked (there is http header for this)
	//2) we use the eventbus to get new nodes
	//..personally, I prefer the option 1 :)
	var enterZoneFun = function(message) {
		var evt = message['data'];
		var mac = evt['terminal.btmac'];
		_info(evt['terminal.btmac'] + " in zone!");
		//if(!macs_in_zone[mac]) {
			//user just entered the zone!
			//GetUserNodes( mac );
		//}
		putMac( mac );
		//GetUserNodes( mac );
	};
	
	//callback function for the leftZoneListener
	//delete the reference to the timestamp in the macs_in_zone array
	//and remove the mac address nodes
	var leftZoneFun = function(evt) {
		var evt = message['data'];
		var mac = evt['terminal.btmac'];
		_info(evt['terminal.btmac'] + ' left zone!');
		delete macs_in_zone[mac];
		$("." + i).fadeOut(1500, function(){$(this).remove();});		
	};
	
	//every max_delay millis, check the mac addresses array
	$(document).everyTime(max_delay, checkMacs);
	
	//start the comet connection with the eventbus when page finish loading
	$(document).ready(function(){
		$.eventbus.start( 'http://tiger2.itu.dk:443', 'warn', ebInit );
	});
	
	//on window unload, remove the listeners
	$(window).unload(function(){
		enterZoneListener.stop();
		leftZoneListener.stop();
	});
})(jQuery);