/**
 * EventBus comet API for jQuery.
 * Interesting bits:
 * $.eventbus (the default instance of the EventBus)
 * $.eventbus. Eq, Neq, Lt, Lteq, Gt, Gteq, Any, Undef (functions to create event patterns)
 * $.eventbus.start (start the eventbus)
 * $.createEventBusListener (create and connect a Listener)
 * $.createEventBusGenerator (create and connect a generator)
 *
 * Generator.publish (emit and event)
 * Generator.stop (remove the generator)
 *
 * Listener.stop (remove the listener)
 */
(function($)
{
	//the service channel
	var EBCHAN = '/service/infobus';
	
	//log level
	var _logLevel = "debug";
	
	function _isFunction(value)
    {
        if (value === undefined || value === null)
        {
            return false;
        }
        return typeof value === 'function';
    }
	function _log(level, args)
    {
        if (window.console)
        {
            var logger = window.console[level];
            if (_isFunction(logger))
            {
                logger.apply(window.console, args);
            }
        }
    }

    function _warn()
    {
        _log('warn', arguments);
    }

    function _info()
    {
        if (_logLevel != 'warn')
        {
            _log('info', arguments);
        }
    }

    function _debug()
    {
        if (_logLevel == 'debug')
        {
            _log('debug', arguments);
        }
    }
	
	/**
	* Listener constructor
	* @pattern, an array of objects in the format: [ {field:<field>, operator:<operator>, value: <single or array of value>} ]
	* @callback, a function called with the comet message. The event is in the message.data field
	*/
	var Listener = function(pattern, callback) {
		var _t = this;
		_t._ptn = pattern;
		_t._clb = callback;
		_t._chan = "";
		_t._subscr;
    }
	/**
	* Remove the listener subscription
	*/
	Listener.prototype.stop = function() {
		$.eventbus.removeListener(this);
	}
	
	/**
	* Generator constructor
	* @name, the generator name
	* @specs, an array of strings that specifies the fields contained in the events generated
	* @callback, a callback to receive messages from the EventBus (e.g. requests to shut down or start again to produce events)
	*/
	var Generator = function(name,specs,callback) {
		var _t = this;
		_t._nm = name;
		_t._specs = specs;
		_t._clb = callback;
	}
	/**
	* Publish an event.
	* @evt, an object whose fields have the names specified in the @specs parameter of the constructor
	*/
	Generator.prototype.publish = function(evt) {
		$.eventbus.publish(this,evt);
	}
	/**
	* Remove the generator
	*/
	Generator.prototype.stop = function() {
		$.eventbus.removeGenerator(this);
	}
	
	/**
	* EventBus constructor
	*/
	var EventBus = function() {
		var _t = this;
		
		_t.listeners = {};
		_t.generators = {};
		_t._lastId = 0;
		_t.oldInit = function(){};
		
		_t.cometlst = function(){};
		
		var _init = function(){};
		
		var __log = function(msg) {
			_info(msg);
		}
		
		/**
		* Create a Listener token
		* @fieldName, a string that identifies the field
		* @operator, a string with value: =, !=, <, <=, >, >=
		* @values, a single (string|number) or array of values (only for = and != operators)
		*/
		this.createToken = function(fieldName, operator, values) {
			return {field: fieldName, operator: operator, value: values};
		}
		
		//
		// Utility functions to create Listener tokens
		//
		this.Eq = function(fieldName,value) {
			return _t.createToken(fieldName,'=',value);
		}
		this.Neq = function(fieldName,value) {
			return _t.createToken(fieldName,'!=',value);
		}
		this.Lt = function(fieldName,value) {
			return _t.createToken(fieldName,'<',value);
		}
		this.Lteq = function(fieldName,value) {
			return _t.createToken(fieldName,'<=',value);
		}
		this.Gt = function(fieldName,value) {
			return _t.createToken(fieldName,'>',value);
		}
		this.Gteq = function(fieldName,value) {
			return _t.createToken(fieldName,'>=',value);
		}
		//
		//
		//
		
		/**
		* Utility function to create a Listener token that matches ANY value for the given fieldName
		*/
		this.Any = function(fieldName) {
			return _t.createToken(fieldName,'=','*');
		}
		/**
		* Utility function to create a Listener token that matches only when the given fieldName is NOT in the event
		*/
		this.Undef = function(fieldName) {
			return _t.createToken(fieldName,'=','UNDEF');
		}
		
		this.getId = function() {
			_t._lastId++;
			return "_id_" + _t._lastId;
		}
		
		/**
		* Start the EventBus
		* @eventBusUrl, the EventBus host
		* @logLvl, the log level (info, warn or debug)
		* @afterInitialization, a function that will be called (with no parameters) when the connection is established
		*/
		this.start = function(eventBusUrl, logLvl, afterInitialization) {
			_t.init = afterInitialization || function(){};
			$.cometd.configure({
				url: eventBusUrl+"/infobuscomet/cometd",
				logLevel: logLvl
			});
			$.cometd.handshake();
		};
		/**
		* Stop the EventBus, remove all generators and listeners.
		* The call is optional, as when a comet client is removed, the
		* server performs the removing of listeners/generators
		*/
		this.stop = function() {
			$(_t.listeners).each(function(k,v){
				removeListener(k);
			});
		};
		
		var _getChan = function(msg) {
			return msg['result']['connect_to'];
		}
		
		/**
		* Add a Listener. Get a listener instance using the $.createEventBusListener function
		*/
		this.addListener = function(listener) {
			var id = _t.getId();
			$.cometd.publish(EBCHAN, {
				id: id,
				method: 'subscribe',
				params: [listener._ptn]
			});
			_t.listeners[id] = listener;
		};
		/**
		* Add a generator. Get a generator instance using the $.createEventBusGenerator function
		*/
		this.addGenerator = function(generator) {
			$.cometd.publish(EBCHAN, {
				method: 'generator',
				params: [generator._nm, generator._specs]
			});
			_t.generators[generator._nm] = generator;
		};
		/**
		* Remvoe a listener. Alternative to call Listener.stop()
		*/
		this.removeListener = function(listener) {
			$.cometd.unsubscribe(listener._subscr);
		};
		/**
		* Remove a generator. Alternative to call Generator.stop()
		*/
		this.removeGenerator = function(generator) {
			$.cometd.unsubscribe(generator._subscr);
		};
		/**
		* Publish a message. Alternative to call Generator.publish(evt)
		*/
		this.publish = function(generator, evt) {
			$.cometd.publish(EBCHAN, {
				method: 'publish',
				params: [evt]
			});
		};
		
		this.setcometlistener = function(listener) {
			_t.cometlst = listener;
		}
		
		function _unsubscribe() {};
		function _subscribe() {};
		
		function _connectionEstablished() {
			_info("connection established");
			_t.cometlst("connection established");
		};
		function _connectionBroken() {
			_info("connection broken");
			_t.cometlst("connection broken");
			_t.init = _t.oldInit;
		};
		function _connectionClosed() {
			_info("connection closed");
			_t.conetlst("connection closed");
		};
		
		var _disconnecting = false;
		var _connected = false;
		
		function _subscribe() {
			$.cometd.subscribe(EBCHAN, _t, function(message){
				var msg = message['data'];
				_info("Received message on "+EBCHAN,msg);
				if(msg['result'] && msg['id']) {
					var id = msg['id'];
					var chan = _getChan(msg);
					var obj = null;
					if( _t.listeners[id] ) {
						_info("received chan for listener "+id)
						obj = _t.listeners[id];
					} else if( _t.generators[id] ) {
						_info("received chan for generator "+id)
						obj = _t.generators[id];
					}
					if(obj) {
						_info("performing data chan subscription");
						obj._chan = chan;
						obj._subscr = $.cometd.subscribe(chan,obj,obj._clb);
					} else {
						_info("obj is null! cannot find "+id+"! - "+obj);
					}
				}
			});
			
			_t.init();
			_t.oldInit = _t.init;
			_t.init = function(){};
		}
		function _metaHandshake(message) {
			if(message.successful) {
				_info("handshake successful");
				_subscribe();
			} else {
				_info("ouch, handshake not successfull??",message);
			}
		};
		function _metaConnect(message) {
			if(_disconnecting) {
				_connected = false;
				_connectionClosed();
			} else {
				_wasConnected = _connected;
				_connected = message.successful === true;
				if(!_wasConnected && _connected) {
					_connectionEstablished();
				} else if(_wasConnected && !_connected) {
					_connectionBroken();
				}
			}
		};

		$.cometd.addListener('/meta/handshake', _metaHandshake);
		$.cometd.addListener('/meta/connect', _metaConnect);
	}
	
	/**
	* $.eventbus is the default EventBus instance
	*/
	$.eventbus = new EventBus();
	
	/**
	* Create and register a listener, given a pattern and a callback.
	* @pattern, an array of objects in the format: [ {field:<field>, operator:<operator>, value: <single or array of value>} ]
	* @callback, a function called with the comet message. The event is in the message.data field
	*/
	$.createEventBusListener = function(pattern,callback) {
		var out = new Listener(pattern,callback);
		$.eventbus.addListener(out);
		return out;
	};
	
	/**
	* Create and register a generator, given the name, specs and callback
	* @name, the generator name
	* @specs, an array of strings that specifies the fields contained in the events generated
	* @callback, a callback to receive messages from the EventBus (e.g. requests to shut down or start again to produce events)
	*/
	$.createEventBusGenerator = function(name,specs,callback) {
		var out = new Generator(name,specs,callback);
		$.eventbus.addGenerator(out);
		return out;
	};

	$(window).unload(function()
	{
		$.cometd.disconnect();
	});

})(jQuery);