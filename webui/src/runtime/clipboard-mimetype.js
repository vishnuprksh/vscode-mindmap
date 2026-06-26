/**
 * @Desc: MIME type handling for importing and exporting nodes through system ctrl+c and ctrl+v.
 * It is not initialized when the system does not support ClipboardEvent or when running in Firefox.
 * @Editor: Naixor
 * @Date: 2015.9.21
 */
define(function(require, exports, module) {
	function MimeType() {
		/**
		 * Private variables.
		 */
		var SPLITOR = '\uFEFF';
		var MIMETYPE = {
			'application/km': '\uFFFF'
		};
		var SIGN = {
			'\uFEFF': 'SPLITOR',
			'\uFFFF': 'application/km'
		};

		/**
		 * Wrap plain text in text that matches the target data format.
		 * @method process 			private
		 * @param  {MIMETYPE} mimetype Data format.
		 * @param  {String} text     Original text.
		 * @return {String}          Text matching the data format.
		 * @example
		 * 			var str = "123";
		 * 			str = process('application/km', str); // MimeType reads the returned content as application/km.
		 * 			process('text/plain', str); // Non-plain text input is converted to the new data format.
		 */
		function process(mimetype, text) {
			if (!this.isPureText(text)) {
				var _mimetype = this.whichMimeType(text);
				if (!_mimetype) {
					throw new Error('unknow mimetype!');
				};
				text = this.getPureText(text);
			};
			if (mimetype === false) {
				return text;
			};
			return mimetype + SPLITOR + text;
		}

		/**
		 * Register a data type sign.
		 * @method registMimeTypeProtocol  	public
		 * @param  {String} type Data type.
		 * @param  {String} sign Sign.
		 */
		this.registMimeTypeProtocol = function(type, sign) {
			if (sign && SIGN[sign]) {
				throw new Error('sing has registed!');
			}
			if (type && !!MIMETYPE[type]) {
				throw new Error('mimetype has registed!');
			};
			SIGN[sign] = type;
			MIMETYPE[type] = sign;
		}

		/**
		 * Get a registered data type protocol.
		 * @method getMimeTypeProtocol  	public
		 * @param  {String} type Data type.
		 * @param  {String} text|undefiend  Text content, or omitted.
		 * @return {String|Function} 
		 * @example 
		 * 			If text is omitted, return the process method for the data format.
		 * 			If text is provided, call the corresponding process method and return its result.
		 * 			var m = new MimeType();
		 * 			var kmprocess = m.getMimeTypeProtocol('application/km');
		 * 			kmprocess("123") === m.getMimeTypeProtocol('application/km', "123");
		 * 			
		 */
		this.getMimeTypeProtocol = function(type, text) {
			var mimetype = MIMETYPE[type] || false;
			
			if (text === undefined) {
				return process.bind(this, mimetype);
			};
			
			return process(mimetype, text);
		}

		this.getSpitor = function() {
			return SPLITOR;
		}

		this.getMimeType = function(sign) {
			if (sign !== undefined) {
				return SIGN[sign] || null;
			};
			return MIMETYPE;
		}
	}

	MimeType.prototype.isPureText = function(text) {
		return !(~text.indexOf(this.getSpitor()));
	}

	MimeType.prototype.getPureText = function(text) {
		if (this.isPureText(text)) {
			return text;
		};
		return text.split(this.getSpitor())[1];
	}

	MimeType.prototype.whichMimeType = function(text) {
		if (this.isPureText(text)) {
			return null;
		};
		return this.getMimeType(text.split(this.getSpitor())[0]);
	}

	function MimeTypeRuntime() {
		if (this.minder.supportClipboardEvent && !kity.Browser.gecko) {
			this.MimeType = new MimeType();
		};
	}

	return module.exports = MimeTypeRuntime;
});
