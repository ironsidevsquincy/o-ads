/**
 * @fileOverview
 * Third party library for use with google publisher tags.
 *
 * @author Robin Marr, robin.marr@ft.com
 */
/**
 * FT.ads.targeting is an object providing properties and methods for accessing targeting parameters from various sources including FT Track and Audience Science and passing them into DFP
 * @name targeting
 * @memberof FT.ads

*/
'use strict';
var utils = require('../utils');
var config = require('../config');
var delegate = require('ftdomdelegate');

/**
 * The Krux class defines an FT.ads.krux instance
 * @class
 * @constructor
*/
function Krux() {

}

Krux.prototype.init = function(impl) {
	this.config = config('krux');
	if (this.config && this.config.id) {

		/* istanbul ignore else  */
		if (!window.Krux) {
			((window.Krux = function() {
				window.Krux.q.push(arguments);
			}).q = []
			);
		}

		this.api = window.Krux;
		/* istanbul ignore else  */
		if(this.config.attributes) {
			this.setAttributes('page_attr_',  this.config.attributes.page || {});
			this.setAttributes('user_attr_',  this.config.attributes.user || {});
			this.setAttributes('',  this.config.attributes.custom || {});
		}

		var src;
		var m = utils.getLocation().match(/\bkxsrc=([^&]+)/);
		if (m) {
			src = decodeURIComponent(m[1]);
		}
		var finalSrc = /^https?:\/\/([^\/]+\.)?krxd\.net(:\d{1,5})?\//i.test(src) ? src : src === "disable" ? "" :  "//cdn.krxd.net/controltag?confid=" + this.config.id;

		utils.attach(finalSrc, true);
		this.events.init();
	} else {
		// can't initialize Krux because no Krux ID is configured, please add it as key id in krux config.
	}
};

/**
* retrieve Krux values from localstorage or cookies in older browsers.
* @name retrieve
* @memberof Krux
* @lends Krux
*/
Krux.prototype.retrieve = function(name) {
	var value;
	name = 'kx' + name;
	/* istanbul ignore else  */
	if (window.localStorage && localStorage.getItem(name)) {
		value = localStorage.getItem(name);
	}  else if (utils.cookie(name)) {
		value = utils.cookie(name);
	}

	return value;
};

/**
* retrieve Krux segments
* @name segments
* @memberof Krux
* @lends Krux
*/
Krux.prototype.segments = function() {
	return this.retrieve('segs');
};

/**
* Retrieve all Krux values used in targeting and return them in an object
* Also limit the number of segments going into the ad calls via krux.limit config
* @name targeting
* @memberof Krux
* @lends Krux
*/
Krux.prototype.targeting = function() {
	var segs = this.segments();
	/* istanbul ignore else  */
	if (segs) {
		segs = segs.split(',');
		/* istanbul ignore else  */
		if (config('krux').limit) {
			segs = segs.slice(0, config('krux').limit);
		}
	}

	return {
		"kuid": this.retrieve('user'),
		"ksg": segs,
		"khost": encodeURIComponent(location.hostname),
		"bht": segs && segs.length > 0 ? 'true' : 'false'
	};
};

/**
* An object holding methods used by krux event pixels
* @name events
* @memberof Krux
* @lends Krux
*/
Krux.prototype.events = {
	dwell_time: function(config) {
		/* istanbul ignore else  */
		if (config) {
			var fire = this.fire,
			interval = config.interval || 5,
			max = (config.total / interval) || 120,
			uid = config.id;
			utils.timers.create(interval, (function() {
				return function() {
					fire(uid, {dwell_time: (this.interval * this.ticks) / 1000 });
				};
			}()), max, {reset: true});
		}
	},
	delegated: function(config) {
		/* istanbul ignore else  */
		if (window.addEventListener) {
			/* istanbul ignore else  */
			if (config) {
				var fire = this.fire;
				var eventScope = function(kEvnt) {
					return function(e, t) {
						fire(config[kEvnt].id);
					};
				};

				window.addEventListener('load', function() {
					var delEvnt = new delegate(document.body);
					for (var kEvnt in config) {
						/* istanbul ignore else  */
						if (config.hasOwnProperty(kEvnt)) {
							delEvnt.on(config[kEvnt].eType, config[kEvnt].selector, eventScope(kEvnt));
						}
					}
				}, false);
			}
		}
	}
};

Krux.prototype.events.fire = function(id, attrs) {
	/* istanbul ignore else  */
	if (id) {
		attrs = utils.isPlainObject(attrs) ? attrs : {};
		return window.Krux('admEvent', id, attrs);
	}

	return false;
};

Krux.prototype.events.init = function() {
	var event, configured = config('krux') && config('krux').events;
	/* istanbul ignore else  */
	if (utils.isPlainObject(configured)) {
		for (event in configured) {
			/* istanbul ignore else  */
			if (utils.isFunction(this[event])) {
				this[event](configured[event]);
			} else if (utils.isFunction(configured[event].fn)) {
				configured[event].fn(configured[event]);
			}
		}
	}
};

Krux.prototype.setAttributes = function (prefix, attributes) {
	/* istanbul ignore else  */
	if(attributes){
		Object.keys(attributes).forEach(function(item) {
			this.api('set',  prefix + item, attributes[item]);
		}.bind(this));
	}
};

Krux.prototype.debug = function() {
	var log = utils.log;
	if (!this.config) {
		return;
	}
	log.start('Krux©');
		log('%c id:', 'font-weight: bold', this.config.id);

		if (this.config.limit) {
			log('%c segment limit:', 'font-weight: bold', this.config.limit);
		}

		if (this.config.attributes) {
			var attributes = this.config.attributes;
			log.start('Attributes');
				log.start('Page');
					log.attributeTable(attributes.page);
				log.end();

				log.start('User');
					log.attributeTable(attributes.user);
				log.end();

				log.start('Custom');
					log.attributeTable(attributes.custom);
				log.end();
			log.end();
		}
		if (this.config.events) {
			var events = this.config.events;
			log.start('Events');
				if (events.dwell_time) {
					log.start('Dwell Time');
						log('%c interval:', 'font-weight: bold', events.dwell_time.interval);
						log('%c id:', 'font-weight: bold', events.dwell_time.id);
						log('%c total:', 'font-weight: bold', events.dwell_time.total);
					log.end();
				}
				log.start('Delegated');
					log.table(events.delegated);
				log.end();
			log.end();
		}

		var targeting = this.targeting();
		log.start('Targeting');
			log.attributeTable(targeting);
		log.end();

		var tags = utils.arrayLikeToArray(document.querySelectorAll(".kxinvisible"));
		if (tags.length) {
			log.start(tags.length + " Supertag© scripts");
				tags.forEach(function(tag) {
					log(tag.dataset.alias, tag.querySelector("script"));
				});
			log.end();
		}
	log.end();
};

module.exports = new Krux();
