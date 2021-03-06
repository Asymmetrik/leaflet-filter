L.FilterToolbar = L.FontAwesomeToolbar.extend({

	options: {
		rectangle: {},
		polygon: {},
		circle: {}
	},

	initialize: function (options) {
		L.FontAwesomeToolbar.prototype.initialize.call(this, options);

		/*
		 * Override default options based on what is passed in
		 * Set the options to be the combination of what was passed in and what is default
		 */
		for (var type in this.options) {
			if (this.options.hasOwnProperty(type)) {
				if (options[type]) {
					options[type] = L.extend({}, this.options[type], options[type]);
				}
			}
		}

		// Set this.options to be options since we have already extended the options
		this.options = options;
		this._toolbarClass = 'leaflet-draw-filter';
	},

	getModeHandlers: function (map) {
		var handlers = [];
		if(null != L.Filter.Rectangle) {
			handlers.push({
				enabled: this._isEnabled(this.options.rectangle),
				handler: new L.Filter.Rectangle(map, this.options.rectangle),
				title: L.filterLocal.filter.toolbar.buttons.rectangle,
				icon: 'fa icon-square'
			});
		}
		if(null != L.Filter.Polygon) {
			handlers.push({
				enabled: this._isEnabled(this.options.polygon),
				handler: new L.Filter.Polygon(map, this.options.polygon),
				title: L.filterLocal.filter.toolbar.buttons.polygon,
				icon: 'fa icon-hex'
			});
		}
		if(null != L.Filter.Circle) {
			handlers.push({
				enabled: this._isEnabled(this.options.circle),
				handler: new L.Filter.Circle(map, this.options.circle),
				title: L.filterLocal.filter.toolbar.buttons.circle,
				icon: 'fa fa-circle-o'
			});
		}
		if(null != L.Filter.Clear) {
			handlers.push({
				enabled: true,
				handler: new L.Filter.Clear(map, this.options.clear),
				title: L.filterLocal.filter.toolbar.buttons.clear,
				icon: 'fa fa-trash-o'
			});
		}

		return handlers;
	},

	// Get the actions part of the toolbar
	getActions: function () {
		return [
			{
				title: L.filterLocal.filter.toolbar.actions.title,
				text: L.filterLocal.filter.toolbar.actions.text,
				callback: this.disable,
				context: this
			}
		];
	},

	setOptions: function (options) {
		L.setOptions(this, options);

		for (var type in this._modes) {
			if (this._modes.hasOwnProperty(type) && options.hasOwnProperty(type)) {
				this._modes[type].handler.setOptions(options[type]);
			}
		}
	},

	addToolbar: function (map) {
		var container = L.FontAwesomeToolbar.prototype.addToolbar.call(this, map);

		this.setFiltered(false);
		return container;
	},

	setFiltered: function(filtered) {
		var type, button;

		if(filtered) {
			for(type in this._modes) {
				// The two draw buttons are disabled when we are filtered
				button = this._modes[type].button;
				if(null != button) {
					L.DomUtil.addClass(this._modes[type].button, 'leaflet-disabled');
					this._modes[type].button.setAttribute('title', L.filterLocal.filter.toolbar.buttons.disabled);
				}
				this._modes[type].handler.lock();
			}

			// Clear button is enabled
			L.DomUtil.removeClass(this._modes.clear.button, 'leaflet-disabled');
			this._modes.clear.button.setAttribute('title', L.filterLocal.filter.toolbar.buttons.clear);
			this._modes.clear.handler.unlock();

		}
		else {
			for(type in this._modes) {
				button = this._modes[type].button;
				if(null != button) {
					// The two draw buttons are enabled when there are no filters
					L.DomUtil.removeClass(this._modes[type].button, 'leaflet-disabled');
					this._modes[type].button.setAttribute('title', L.filterLocal.filter.toolbar.buttons[type]);
				}
				this._modes[type].handler.unlock();
			}

			// Clear button is disabled
			L.DomUtil.addClass(this._modes.clear.button, 'leaflet-disabled');
			this._modes.clear.button.setAttribute('title', L.filterLocal.filter.toolbar.buttons.clearDisabled);
			this._modes.clear.handler.lock();
		}
	},

	setFilter: function(filter, suppressEvents) {
		if(null != this._modes[filter.type]) {
			var handler = this._modes[filter.type].handler;

			handler.enable(suppressEvents);
			this.setFiltered(null != filter);
			var toReturn = handler.setFilter(filter);
			handler.disable(suppressEvents);

			return toReturn;
		}
		else {
			console.error('Unsupported filter type: ' + filter.type);
		}
	},

	getGeo: function(layerType, layer) {
		return this._modes[layerType].handler.getGeo(layer);
	},

	equals: function(shape1, shape2) {
		if(shape1 == null || shape1.type == null) {
			shape1 = null;
		}
		if(shape2 == null || shape2.type == null) {
			shape2 = null;
		}

		if(shape1 == null && shape2 == null) {
			return true;
		}
		else if(shape1 == null || shape2 == null) {
			return false;
		}

		return this._modes[shape1.type].handler.equals(shape1, shape2);
	},

	_isEnabled: function(options) {
		return (null != options) && (null == options.enabled || options.enabled);
	}

});
