window.supportedAudioTypes = (function(){
	var list = [
		{
			type: 'mpeg',
			codec: ''
		},
		{
			type: 'ogg',
			codec: 'vorbis'
		},
		{
			type: 'wav',
			codec: '1'
		},
		{
			type: 'mp4',
			codec: 'mp4a.40.2'
		}
	];
	var result = [];
	var a = document.createElement('audio');

	for (var temp, i = list.length - 1; i >= 0; i--) {
		temp = !!( a.canPlayType && a.canPlayType('audio/' + list[i].type + ';' + (list[i].codec || '') ) );
		if (temp)
			result.push('audio/' + list[i].type);
	};
	return result;
})();

String.prototype.htmlToReplace = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;'
};
String.prototype.escapeHtml = function() {
	return this.replace(/[&<>]/g, function(tag) {
		return this.htmlToReplace[tag] || tag;
	}.bind(this));
};

var APP = (function(app, module){
	app.init = function(){
		// values
		this.module = {
			el: document.querySelector(module.selector),
			selector: module.selector
		};
		this.media = null;
		this.player = document.getElementById('player');

		// methods
		this.initChooseInput = function(input){
			input = input || document.getElementById('choose-file');

			/*  i could use it but that sort of behaviour is different between browser yet.
				so just set keyword mask in html. Also it could be used with some libraries like
				https://github.com/addyosmani/getUserMedia.js
			*//*
				if (input) {
					input.accept = supportedAudioTypes.join(',');
				}
			*/
			if (!input) {
				console.error('Отсутствует интерфейс для выбора файла');
				return;
			}
			input.onchange = function(event){
				app.media = event.target.files[0] || null;
				app.startPlaying();
			};
		};

		this.initControls = function(){
			var c = this.player.controls = this.module.el.querySelector(this.module.selector+'_control');
			c.onclick = function(){
				return APP.player.paused ? APP.player.play() : APP.player.pause();
			};
		};

		this.startPlaying = function(){
			if (!this.media || !this.player || !URL.createObjectURL) {
				console.error('Невозможно проиграть локальный файл на этом устройстве');
				return;
			}
			this.player.src = URL.createObjectURL(this.media);
			this.module.el.querySelector(this.module.selector+'_title')
				.innerHTML = this.media.name;
		};

		// calls
		this.initChooseInput();
		this.initControls();

		return this;
	};
	return app.init();
})(APP || {}, {selector: '.player'});