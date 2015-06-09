/**
 * Sax
 * Semantic AIDAX
 *
 * Javascript library to help you with AIDAX
 *
 * @version 1.0.0
 * @author Gabriel Guerreiro <gabrielguerreiro.com>
 * @url https://github.com/gaguerreiro/sax
 *
 */

var Sax = (function() {

	/**
	 * Properties
	 * @type {Boolean}
	 */
	var $init 		   = false;
	var $me 		   = null;
	var $els_track     = [];
	var $els_profile   = [];
	var $el_goal       = null;
	var $profile_cache = {};
	var $flag_event    = true;

	/**
	 * Attributes HTML
	 * @type {Object}
	 */
	var $attributes = {
		track: 'sax-track',
		track_properties: 'sax-track-properties',
		identify: 'sax-identify',
		identify_properties: 'sax-identify-properties',
		not_prevent: 'sax-not-prevent',
		property: 'sax-property',
		on: 'sax-on',
		email: 'sax-email',
		goal: 'sax-goal'
	};

	/**
	 * AIDAX default settings
	 * @type {Object}
	 */
	var $default = {
		properties_limit: 20,
		keys_length: 30,
		event_length: 40,
		goal_length: 254
	};


	/**
	 * Constructor
	 * @return {Void}
	 */
	var init = function() {

		if ($init === false) {
			me();
			finder();
		}

		$init = true;
	};


	/**
	 * Whois
	 * @return {Void}
	 */
	var me = function() {
		$me = (exists(ax)) ? ax.whois() : null;
	};


	/**
	 * Search all elements
	 * @return {Void}
	 */
	var finder = function() {

		try {

			// Elements to track
			$els_track = document.querySelectorAll('[' + $attributes.track + ']');

			// Elements to identify
			$els_profile = document.querySelectorAll('[' + $attributes.identify + ']');

		} catch (e) {

			// All element at DOM
			var all = document.getElementsByTagName('*');

			for(var i=0, l=all.length; i<l; i++) {

				var el = all[i];

				// Register tracks
				if (has(el, $attributes.track))
					$els_track.push(el);

				// Register identify
				if (has(el, $attributes.identify))
					$els_profile.push(el);
			}
		}

		// Register element to goal
		$el_goal = document.querySelector('[' + $attributes.goal + ']');

		// If has attrs to Identify
		if (!isEmpty($els_profile) && $els_profile.length > 0)
			identifier();

		// If has attrs to Track
		if (!isEmpty($els_track) && $els_track.length > 0)
			tracker();

		// If has attrs to Track
		if (!isEmpty($el_goal) && $el_goal.length > 0)
			goal();
	};


	/**
	 * Track elements
	 * @return {Void}
	 */
	var tracker = function() {

		// clone context
		var els_track = $els_track;

		for (var i=0, l=els_track.length; i < l; i++) {

			var el = els_track[i];
			trackListeners(el, i);
		}
	};


	/**
	 * Create listeners to trackers
	 * @param  {Object} el "Element"
	 * @param  {Int} i  "Index"
	 * @return {Boolean}
	 */
	var trackListeners = function(el, i) {

		var track_class = $attributes.track + '-' + i;

		// Set Sax class
		setClass(el, track_class);

		// Event
		var tag_event = eventByTag(el);

		document.querySelector('.'+track_class).addEventListener(tag_event, function(event) {

			// Prevent Default
			var check_prevent = checkPrevent(el, tag_event);
			if (check_prevent) {

				// If is not to run aidax, return TRUE to event default
				if (!run())
					return eventDefault();

				event.preventDefault();
			}

			// Track properties
			var track_properties = {};
			var attr_properties = this.getAttribute($attributes.identify);

			// If has attribute properties
			if (exists(attr_properties)) {

				// Properties by attributes
				try {

					track_properties = JSON.parse(attr_properties);

				} catch (e) { // If is not JSON

					if (attr_properties.indexOf(":") === -1)
						return eventDefault();

					var property = attr_properties.split(';');
					var properties = {};
					var tmp;

					for (var x=0, l=property.length; x<l; x++) {
						tmp = property[x].split(':');
						properties[formatKey(tmp[0])] = tmp[1].trim();
					}

					track_properties = properties;
				}
			}

			// If is Field, track digited value
			if (isField(this))
				track_properties[propertyKey(this)] = this.value;


			// Execute Track
			ax.track(
				trackEvent(this),
				track_properties
			);

			// Trigger if was prevented
			if (check_prevent) {
				var self = this;
				setTimeout(function(){
					self.click();
				}, 300);
			}

		}, false);
	};


	/**
	 * Identify profile
	 * @return {Void}
	 */
	var identifier = function() {

		// clone context
		var els_profile = $els_profile;
		var el;

		for (var i=0,l=els_profile.length; i<l; i++) {
			el = els_profile[i];
			profileListeners(el, i);
		}
	};


	/**
	 * Create profile listeners
	 * @param  {Object} el "Element"
	 * @param  {Int} i  "Index"
	 * @return {Boolean}
	 */
	var profileListeners = function(el, i) {

		var profile_class = $attributes.identify + '-' + i;

		// Set Sax class
		setClass(el, profile_class);

		// Event
		var tag_event = eventByTag(el);

		document.querySelector('.'+profile_class).addEventListener(tag_event, function(event) {

			// Prevent Default
			var check_prevent = checkPrevent(el, tag_event);
			if (check_prevent) {

				// If is not to run aidax, return TRUE to event default
				if (!run())
					return eventDefault();

				event.preventDefault();
			}

			// If is INPUT
			if (isInput(this)) {

				// If value is NULL, execute default event
				if (isEmpty(this.value))
					return eventDefault();

				// Get KEY
				var key = propertyKey(this);

				// If same value, ignore
				if ($profile_cache.hasOwnProperty(key) && $profile_cache[key] == this.value)
					return eventDefault();

				// If is Email update Cache
				if (isEmail(this)) {

					$me = this.value;
					$profile_cache[key] = this.value;

				// If $me is null, add cache and wait
				} else if (isEmpty($me) || $me == 'anonymous') {

					$profile_cache[key] = this.value;

					// Is anonymous
					if (ax.whois() == 'anonymous')
						return eventDefault();

					// Me update
					me();

				} else {
					$profile_cache[key] = this.value;
				}

				// Execute Identify
				ax.identify(
					$me,
					$profile_cache
				);

			} else { // BETA

				// Is anonymous
				if (ax.whois() == 'anonymous')
					return eventDefault();

				// Me update
				me();

				// Profile properties
				var profile_properties = this.getAttribute($attributes.identify_properties);

				// If NULL, ignore
				if (canUse(profile_properties))
					return eventDefault();

				// Try parse JSON
				try {

					profile_properties = JSON.parse(profile_properties);

				} catch (e) { // If is not JSON

					if (profile_properties.indexOf(":") === -1)
						return eventDefault();

					var property = profile_properties.split(';');
					var properties = {};
					var tmp;

					for (var x=0,l=property.length; x<l; x++) {
						tmp = property[x].split(':');
						properties[formatKey(tmp[0])] = tmp[1].trim();
					}

					profile_properties = properties;
				}

				// Execute Identify
				ax.identify(
					$me,
					profile_properties
				);
			}

			// Trigger if was prevented
			if (check_prevent) {
				var self = this;
				setTimeout(function(){
					self.click();
				}, 300);
			}

		}, false);
	};


	/**
	 * Goal event
	 * @param  {Object} el "Element"
	 * @return {Boolean}
	 */
	var goal = function(el) {

		// Set Sax class
		setClass(el, $attributes.goal);

		// Event
		var tag_event = eventByTag(el);

		document.addEventListener(tag_event, function(event) {

			if (isEmpty($me) || $me == 'anonymous')
				return eventDefault();

			// Prevent Default
			var check_prevent = checkPrevent(el, tag_event);
			if (check_prevent) {

				// If is not to run aidax, return TRUE to event default
				if (!run())
					return eventDefault();

				event.preventDefault();
			}

			// Execute AIDAX
			ax.goal(goalName(this), true, false);

			// Trigger if was prevented
			if (check_prevent) {
				var self = this;
				setTimeout(function(){
					self.click();
				}, 300);
			}

		}, false);
	};


	/**
	 * Check aidax execution
	 * @return {Boolean}
	 */
	var run = function() {

		// If FALSE
		if ($flag_event === false) {

			// Set TRUE to next event
			$flag_event = true;

			// Return FALSE to not run aidax
			return false;

		} else {

			// Set FALSE to prevent loop on next event
			$flag_event = false;

			// Return TRUE to run aidax
			return true;
		}
	};


	/**
	 * Only return default event
	 * @return {Boolean}
	 */
	var eventDefault = function() {
		$flag_event = true;
		return true;
	};


	/**
	 * Check if must prevent event default
	 * @param  {Object} el    "Element"
	 * @param  {String} event "Name of event"
	 * @return {Boolean}
	 */
	var checkPrevent = function(el, event) {

		// Force NOT preventDefault
		if (has(el, $attributes.not_prevent))
			return false;

		// If click and exists HREF and != '' and != '#'
		var href = el.getAttribute('href');
		if (event == 'click' && exists(href) && href.charAt(0) != '#')
			return true;

		// If submit and exists Action and != '' and != '#'
		var action = el.getAttribute('action');
		if (event == 'submit' && exists(action) && action.charAt(0) != '#')
			return true;

		return false;
	};


	/**
	 * Set Sax class in element
	 * @param {Object} el        "Element"
	 * @param {String} sax_class "Class to set"
	 */
	var setClass = function(el, sax_class) {
		var el_class = el.className;

		if (canUse(el_class) && el_class != sax_class) {
			el.className += ' ' + sax_class;
		} else {
			el.className = sax_class;
		}
	};


	/**
	 * Return the track name event
	 * @param  {Object} el "Element"
	 * @return {String}    "Track event"
	 */
	var trackEvent = function(el) {

		var sax_event = el.getAttribute($attributes.track);
		var ev;

		if (!isEmpty(sax_event)) {
			ev = sax_event;
		} else if (canUse(el.title)) {
			ev = el.title;
		} else if (canUse(el.alt)) {
			ev = el.alt;
		} else if (canUse(el.id)) {
			ev = el.id;
		} else {
			ev = el.tagName + '_' + el.className;
		}

		return ev.substr(0, $default.event_length).trim().toLowerCase();
	};


	/**
	 * Return KEY to identify property
	 * @param  {Object} el "Element"
	 * @return {String}    "Property key"
	 */
	var propertyKey = function(el) {

		var sax_property = el.getAttribute($attributes.property);
		var key;

		if (canUse(sax_property)) {
			key = sax_property;
		} else if (canUse(el.name)) {
			key = el.name;
		} else if (canUse(el.id)) {
			key = el.id;
		} else {
			key = el.tagName + '_' + el.className;
		}

		return formatKey(key);
	};


	/**
	 * Generate the goal event name
	 * @param  {Object} el "Element"
	 * @return {String}    "Goal event name"
	 */
	var goalName = function(el) {

		var sax_goal = el.getAttribute($attributes.goal);
		var name;

		if (!isEmpty(sax_goal)) {
			name = sax_goal;
		} else if (canUse(el.title)) {
			name = el.title;
		} else if (canUse(el.alt)) {
			name = el.alt;
		} else if (canUse(el.id)) {
			name = el.id;
		} else {
			name = el.tagName + '_' + el.className;
		}

		return name.substring(0, $default.goal_length).trim();
	};


	/**
	 * Events by element tag
	 * @param  {Object} el "Element"
	 * @return {String}    "Event name"
	 */
	var eventByTag = function(el) {

		// Force event
		var on = el.getAttribute($attributes.on);
		if (canUse(on))
			return on;

		var tag = el.tagName;
		var type = (exists(el.type)) ? el.type : null;

		// Input exceptions
		if (tag == 'INPUT' && (type == 'submit' || type == 'button'))
			return 'click';

		switch(tag) {
			case 'INPUT':
			case 'TEXTAREA':
				return 'blur';
			case 'SELECT':
				return 'change';
			case 'IMG':
				return 'load';
			case 'FORM':
				return 'submit';
			default:
				return 'click';
		}
	};


	/**
	 * Check if object has an attribute
	 * @param  {Object}  el Element
	 * @param  {String}  prop Attribute
	 * @return {Boolean}
	 */
	var has = function(el, prop) {
		return el.getAttribute(prop) !== null;
	}


	/**
	 * Validate Email
	 * @param  {Object}  el "Element"
	 * @return {Boolean}
	 */
	var isEmail = function(el) {

		if (canUse(el.getAttribute($attributes.email)))
			return true;

		if (el.tagName != 'INPUT')
			return false;

		var rgx = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

		if ((el.type == 'email' || el.name.indexOf('email') !== -1  || el.id.indexOf('email') !== -1) && el.value.match(rgx))
			return true;

    	return false;
	};


	/**
	 * Is any input element?
	 * @param  {Object}  el "Element"
	 * @return {Boolean}
	 */
	var isInput = function(el) {
		var tag = el.tagName;
		return (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'CHECKBOX' || tag === 'RADIO');
	};


	/**
	 * Is input, but only writable
	 * @param  {Object}  el "Element"
	 * @return {Boolean}
	 */
	var isField = function(el) {
		var type = (exists(el.type)) ? el.type : null;
		return (isInput(el) && type != 'submit' && type != 'button');
	};


	/**
	 * Exists in DOM?
	 * @param  {Object|Attribute} e "Object or Attribute to check existance"
	 * @return {Boolean}
	 */
	var exists = function(e) {
		return (e !== undefined && e !== null);
	};


	/**
	 * Is empty?
	 * @param  {String|Object}  str "String/Object to check"
	 * @return {Boolean}
	 */
	var isEmpty = function(str) {
		return (!exists(str) || str.length === 0);
	};


	/**
	 * If exists and is not empty, so i can use
	 * @param  {Object} el "Element"
	 * @return {Boolean}
	 */
	var canUse = function (el) {
		return (exists(el) && !isEmpty(el));
	};


	/**
	 * Format property key, to aidax rules
	 * @param  {String} key "Property key"
	 * @return {String}     "Formated property"
	 */
	var formatKey = function(key) {
		return key.substr(0, $default.key_length).trim().replace('/\.|-|\x20/', '_');
	};

	return {
		init:init,
		me:me,
		profile:$profile_cache
	};

})();

ax.ready(function() {
  Sax.init();
});