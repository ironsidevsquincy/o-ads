'use strict';
var utils = require('./utils');
var config = require('./config');

var attributeParsers = {
	sizes: function(value, sizes) {
		if (value === false || value === 'false') {
			return false;
		}
		/* istanbul ignore else  */
		else if (utils.isArray(sizes)) {
			value.replace(/(\d+)x(\d+)/g, function(match, width, height) {
				sizes.push([parseInt(width, 10), parseInt(height, 10)]);
			});
		}

		return sizes;
	},

	formats: function(value, sizes) {
		if (value === false || value === 'false') {
			sizes = false;
		} else {
			var mapping = config().formats;
			var formats = utils.isArray(value) ? value : value.split(',');
			formats.forEach(function(format) {
				if (mapping && mapping[format]) {
					format = mapping[format];
					if (utils.isArray(format.sizes[0])) {
						for (var j = 0; j < format.sizes.length; j++) {
							sizes.push(format.sizes[j]);
						}
					}
					else {
						sizes.push(format.sizes);
					}
				} else {
					utils.log.error('Slot configured with unknown format ' + format);
				}
			});
		}

		return sizes;
	},

	responsiveSizes: function(name, value, sizes) {
		var screenName = name.replace(/^sizes/, '').toLowerCase();
		if (!utils.isPlainObject(sizes)) {
			sizes = {};
		}

		sizes[screenName] = attributeParsers.sizes(value, sizes[screenName] || []);
		return sizes;
	},

	responsiveFormats: function(name, value, sizes) {
		var screenName = name.replace(/^formats/, '').toLowerCase();
		if (!utils.isPlainObject(sizes)) {
			sizes = {};
		}

		sizes[screenName] = attributeParsers.formats(value, []);
		return sizes;
	},

	targeting: function(value, targeting) {
		value = utils.hash(value, ';', '=');
		utils.extend(targeting, value);
		return targeting;
	},

	base: function(value) {
		if (value === '' || value === 'true') {
			value = true;
		} else if (value === 'false') {
			value = false;
		}

		return value;
	}
};

/**
* The Slot class.
* @class
* @constructor
*/
function Slot(container, screensize) {
	var slotConfig = config('slots') || {};
	var disableSwipeDefault = config('disableSwipeDefault') || false;

	// store the container
	this.container = container;

	// the current responsive screensize
	if (screensize) {
		this.screensize = screensize;
	}

	// init slot dom structure
	this.outer = this.addContainer(container, { 'class': 'o-ads__outer' });
	this.inner = this.addContainer(this.outer, { 'class': 'o-ads__inner'});

	// make sure the slot has a name
	this.setName();
	this.setResponsiveCreative(false);
	slotConfig = slotConfig[this.name] || {};

	// default configuration properties
	this.server = 'gpt';
	this.defer = false;

	// global slots configuration
	this.targeting = slotConfig.targeting || {};
	this.sizes = slotConfig.sizes || [];
	this.center = slotConfig.center || false;
	this.label = slotConfig.label || false;
	this.outOfPage = slotConfig.outOfPage || false;
	this.lazyLoad = slotConfig.lazyLoad || false;
	this.disableSwipeDefault = slotConfig.disableSwipeDefault || disableSwipeDefault;
	this.companion = (slotConfig.companion === false ? false : true);
	this.collapseEmpty = slotConfig.collapseEmpty;
	this.chartbeat = slotConfig.chartbeat || config('chartbeat');

	if (utils.isArray(slotConfig.formats)) {
		attributeParsers.formats(slotConfig.formats, this.sizes);
	}	else if (utils.isPlainObject(slotConfig.formats)) {
		this.sizes = {};
		Object.keys(slotConfig.formats).forEach(function(screenName) {
			this.sizes[screenName] = attributeParsers.formats(slotConfig.formats[screenName], []);
		}.bind(this));
	}

	// extend with imperative configuration options
	this.parseAttributeConfig();

	if (!this.sizes.length && !utils.isPlainObject(this.sizes)) {
		utils.log.error('slot %s has no configured sizes!', this.name);
		return false;
	}

	this.centerContainer();
	this.labelContainer();

	this.initResponsive();
	this.initLazyLoad();
}

/**
* parse slot attribute config
*/
Slot.prototype.parseAttributeConfig = function() {
	utils.arrayLikeToArray(this.container.attributes).forEach(function(attribute) {
		var name = utils.parseAttributeName(attribute.name);
		var value = attribute.value;
		if (name === 'formats') {
			this[name] = attributeParsers[name](value, this.sizes);
		} else if (attributeParsers[name]) {
			this[name] = attributeParsers[name](value, this[name]);
		} else if (/^formats\w*/.test(name)) {
			this.sizes = attributeParsers.responsiveFormats(name, value, this.sizes);
		} else if (/^sizes\w*/.test(name)) {
			this.sizes = attributeParsers.responsiveSizes(name, value, this.sizes);
		} else if (this.hasOwnProperty(name)) {
			this[name] = attributeParsers.base(value);
		}
	}.bind(this));
};

Slot.prototype.getAttributes = function() {
	var attributes = {};
	utils.arrayLikeToArray(this.container.attributes).forEach(function(attribute) {
		attributes[utils.parseAttributeName(attribute)] = attribute.value;
	});
	this.attributes = attributes;
	return this;
};

/**
*	Load a slot when it appears in the viewport
*/
Slot.prototype.initLazyLoad = function() {
	/* istanbul ignore else  */
	if (this.lazyLoad) {
		this.defer = true;
		var renderSlot = function(slot) {
			/* istanbul ignore else */
			if(!slot.rendered) {
				slot.fire('render');
				slot.rendered = true;
			}
		}.bind(null, this);
		utils.once('inview', renderSlot, this.container);
		//Master/Companion ads don't work with lazy loading, so if a master ad loads trigger
		//the companions to render immediately

		/* istanbul ignore else */
		if(this.companion) {
			utils.once('masterLoaded', renderSlot, this.container);
		}
	}
	return this;
};

/**
*	Listen to responsive breakpoints and collapse slots
* where the configured size is set to false
*/
Slot.prototype.initResponsive = function() {
	/* istanbul ignore else  */
	if (utils.isPlainObject(this.sizes)) {

		if (!this.hasValidSize()) {
			this.collapse();
		}

		utils.on('breakpoint', function(event) {
			var slot = event.detail.slot;
			slot.screensize = event.detail.screensize;

			if (slot.hasValidSize()) {
				slot.uncollapse();
			} else {
				slot.collapse();
			}
		}, this.container);
	}

	return this;
};

/**
* Maximise the slot when size is 100x100
*/
Slot.prototype.maximise = function (size) {
	if (size && +size[0] === 100 && +size[1] === 100) {
		this.fire('resize', {
			size: ['100%', '100%']
		});
	}
};

/**
*	If the slot doesn't have a name give it one
*/
Slot.prototype.setName = function() {
	this.name = this.container.getAttribute('data-o-ads-name') || this.container.getAttribute('o-ads-name');
	if (!this.name) {
		this.name = 'o-ads-slot-' + (Math.floor(Math.random() * 10000));
		this.container.setAttribute('data-o-ads-name', this.name);
	}
	return this;
};

/**
*	If the slot doesn't have a name give it one
*/
Slot.prototype.setResponsiveCreative = function (value) {
	this.responsiveCreative = value;
	return this;
};


/**
* add the empty class to the slot
*/
Slot.prototype.collapse = function() {
	utils.addClass(this.container, 'empty');
	utils.addClass(document.body, 'no-' + this.name);
	return this;
};

/**
* sets a classname of the format
*/
Slot.prototype.setFormatLoaded = function(format) {
	this.container.setAttribute('data-o-ads-loaded', format);
	return this;
};

/**
* remove the empty class from the slot
*/
Slot.prototype.uncollapse = function() {
	utils.removeClass(this.container, 'empty');
	utils.removeClass(document.body, 'no-' + this.name);
	return this;
};

/**
* call the ad server clear method on the slot if one exists
*/
Slot.prototype.clear = function() {
	/* istanbul ignore else  */
	if (utils.isFunction(this['clearSlot'])) {
		this.clearSlot();
	}
	return this;
};

/**
* call the ad server impression URL for an out of page slot if it has been configured correctly for delayed impressions
*/
Slot.prototype.submitImpression = function() {
	/* istanbul ignore else  */
	if (utils.isFunction(this['submitGptImpression'])) {
		this.submitGptImpression();
	}
	return this;
};

/**
*	fire an event on the slot
*/
Slot.prototype.fire = function(name, data) {
	var details = {
		name: this.name,
		slot: this
	};

	if (utils.isPlainObject(data)) {
		utils.extend(details, data);
	}

	utils.broadcast(name, details, this.container);
	return this;
};

/**
*	add a div tag into the current slot container
**/
Slot.prototype.addContainer = function(node, attrs) {
	var container = '<div ';
	/* istanbul ignore else  */
	if(attrs) {
		Object.keys(attrs).forEach(function(attr) {
			var value = attrs[attr];
			container += attr + '=' + value + ' ';
		});
	}
	container += '></div>';
	node.insertAdjacentHTML('beforeend', container);
	return node.lastChild;
};


Slot.prototype.hasValidSize = function(screensize) {
	screensize = screensize || this.screensize;
	if (screensize && utils.isPlainObject(this.sizes)) {
		return this.sizes[screensize] !== false;
	}

	return true;
};

/**
* Add a center class to the main container
*/
Slot.prototype.centerContainer = function() {
	if (this.center) {
		utils.addClass(this.container, 'center');
	}

	return this;
};


/**
* Add a label class to the main container
*/
Slot.prototype.labelContainer = function() {
	var className;
	if (this.label === true || this.label === 'left') {
		className = 'label-left';
	} else if (this.label === 'right') {
		className = 'label-right';
	}

	utils.addClass(this.container, className);
	return this;
};

module.exports = Slot;
