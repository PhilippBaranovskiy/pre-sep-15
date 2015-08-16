var APP = (function(app) {
	app.init = function() {
		Handlebars.registerHelper('toCodeFormat', function(context, options) {
			var _this = '';
			if (APP.isObject(context)) {
				for (var prop in context) {
					if( context.hasOwnProperty(prop) ) {
						if (typeof context[prop] === 'string') {
							_this += context[prop];
						}
					}
				}
			} else {
				_this = context;
			}
			_this = _this.match(/\w/gi).join('').toLowerCase();
			return new Handlebars.SafeString( _this );
		});
		this.airport.data.load();
	};
	app.isObject = function(value) {
		if (typeof value === 'object' && value !== null &&
			!(value instanceof Boolean) &&
			!(value instanceof Date)    &&
			!(value instanceof Number)  &&
			!(value instanceof RegExp)  &&
			!(value instanceof String)  &&
			!Array.isArray(value))
		{
			return true;
		}
		return false;
	};
	app.airport = {
		data: {
			url: 'http://philipp.ninja/docs/pre-sep-15/airport.json',
			strg: {},
			load: function(url) {
				url = url || this.url;
				var xhq = new XMLHttpRequest();
				xhq.addEventListener('load', xhqHandle.bind(this));
				xhq.open('get', url, true);
				xhq.send();

				function xhqHandle(e) {
					var _ = this;
					try {
						_.strg = JSON.parse(e.target.response);
						_.render();
					} catch (err) {
						console.error(err);
					}
				};
			},
			render: function(data){
				data = data || this.strg;
				var template = Handlebars.compile(document.getElementById('tablo-data-template').innerHTML);
				var out = template(data);
				document.querySelector('.tablo').innerHTML = out;
				// console.log(out);
			}
		}
	};
	// setTimeout(app.init.bind(app), 900);
	app.init();

	return app;
})(APP || {});