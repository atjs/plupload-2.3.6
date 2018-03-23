if (typeof __$coverObject === "undefined"){
	if (typeof window !== "undefined") window.__$coverObject = {};
	else if (typeof global !== "undefined") global.__$coverObject = {};
	else throw new Error("cannot find the global scope");
}
var __$coverInit = function(name, code){
	if (!__$coverObject[name]) __$coverObject[name] = {__code: code};
};
var __$coverInitRange = function(name, range){
	if (!__$coverObject[name][range]) __$coverObject[name][range] = 0;
};
var __$coverCall = function(name, range){
	__$coverObject[name][range]++;
};
__$coverInit("Plupload", "/**\n * Plupload.js\n *\n * Copyright 2013, Moxiecode Systems AB\n * Released under GPL License.\n *\n * License: http://www.plupload.com/license\n * Contributing: http://www.plupload.com/contributing\n */\n\n;(function(exports, o, undef) {\n\nvar delay = window.setTimeout;\nvar fileFilters = {};\nvar u = o.core.utils;\nvar Runtime = o.runtime.Runtime;\n\n// convert plupload features to caps acceptable by mOxie\nfunction normalizeCaps(settings) {\n\tvar features = settings.required_features, caps = {};\n\n\tfunction resolve(feature, value, strict) {\n\t\t// Feature notation is deprecated, use caps (this thing here is required for backward compatibility)\n\t\tvar map = {\n\t\t\tchunks: 'slice_blob',\n\t\t\tjpgresize: 'send_binary_string',\n\t\t\tpngresize: 'send_binary_string',\n\t\t\tprogress: 'report_upload_progress',\n\t\t\tmulti_selection: 'select_multiple',\n\t\t\tdragdrop: 'drag_and_drop',\n\t\t\tdrop_element: 'drag_and_drop',\n\t\t\theaders: 'send_custom_headers',\n\t\t\turlstream_upload: 'send_binary_string',\n\t\t\tcanSendBinary: 'send_binary',\n\t\t\ttriggerDialog: 'summon_file_dialog'\n\t\t};\n\n\t\tif (map[feature]) {\n\t\t\tcaps[map[feature]] = value;\n\t\t} else if (!strict) {\n\t\t\tcaps[feature] = value;\n\t\t}\n\t}\n\n\tif (typeof(features) === 'string') {\n\t\tplupload.each(features.split(/\\s*,\\s*/), function(feature) {\n\t\t\tresolve(feature, true);\n\t\t});\n\t} else if (typeof(features) === 'object') {\n\t\tplupload.each(features, function(value, feature) {\n\t\t\tresolve(feature, value);\n\t\t});\n\t} else if (features === true) {\n\t\t// check settings for required features\n\t\tif (settings.chunk_size && settings.chunk_size > 0) {\n\t\t\tcaps.slice_blob = true;\n\t\t}\n\n\t\tif (!plupload.isEmptyObj(settings.resize) || settings.multipart === false) {\n\t\t\tcaps.send_binary_string = true;\n\t\t}\n\n\t\tif (settings.http_method) {\n            caps.use_http_method = settings.http_method;\n        }\n\n\t\tplupload.each(settings, function(value, feature) {\n\t\t\tresolve(feature, !!value, true); // strict check\n\t\t});\n\t}\n\n\treturn caps;\n}\n\n/**\n * @module plupload\n * @static\n */\nvar plupload = {\n\t/**\n\t * Plupload version will be replaced on build.\n\t *\n\t * @property VERSION\n\t * @for Plupload\n\t * @static\n\t * @final\n\t */\n\tVERSION : '@@version@@',\n\n\t/**\n\t * The state of the queue before it has started and after it has finished\n\t *\n\t * @property STOPPED\n\t * @static\n\t * @final\n\t */\n\tSTOPPED : 1,\n\n\t/**\n\t * Upload process is running\n\t *\n\t * @property STARTED\n\t * @static\n\t * @final\n\t */\n\tSTARTED : 2,\n\n\t/**\n\t * File is queued for upload\n\t *\n\t * @property QUEUED\n\t * @static\n\t * @final\n\t */\n\tQUEUED : 1,\n\n\t/**\n\t * File is being uploaded\n\t *\n\t * @property UPLOADING\n\t * @static\n\t * @final\n\t */\n\tUPLOADING : 2,\n\n\t/**\n\t * File has failed to be uploaded\n\t *\n\t * @property FAILED\n\t * @static\n\t * @final\n\t */\n\tFAILED : 4,\n\n\t/**\n\t * File has been uploaded successfully\n\t *\n\t * @property DONE\n\t * @static\n\t * @final\n\t */\n\tDONE : 5,\n\n\t// Error constants used by the Error event\n\n\t/**\n\t * Generic error for example if an exception is thrown inside Silverlight.\n\t *\n\t * @property GENERIC_ERROR\n\t * @static\n\t * @final\n\t */\n\tGENERIC_ERROR : -100,\n\n\t/**\n\t * HTTP transport error. For example if the server produces a HTTP status other than 200.\n\t *\n\t * @property HTTP_ERROR\n\t * @static\n\t * @final\n\t */\n\tHTTP_ERROR : -200,\n\n\t/**\n\t * Generic I/O error. For example if it wasn't possible to open the file stream on local machine.\n\t *\n\t * @property IO_ERROR\n\t * @static\n\t * @final\n\t */\n\tIO_ERROR : -300,\n\n\t/**\n\t * @property SECURITY_ERROR\n\t * @static\n\t * @final\n\t */\n\tSECURITY_ERROR : -400,\n\n\t/**\n\t * Initialization error. Will be triggered if no runtime was initialized.\n\t *\n\t * @property INIT_ERROR\n\t * @static\n\t * @final\n\t */\n\tINIT_ERROR : -500,\n\n\t/**\n\t * File size error. If the user selects a file that is too large or is empty it will be blocked and\n\t * an error of this type will be triggered.\n\t *\n\t * @property FILE_SIZE_ERROR\n\t * @static\n\t * @final\n\t */\n\tFILE_SIZE_ERROR : -600,\n\n\t/**\n\t * File extension error. If the user selects a file that isn't valid according to the filters setting.\n\t *\n\t * @property FILE_EXTENSION_ERROR\n\t * @static\n\t * @final\n\t */\n\tFILE_EXTENSION_ERROR : -601,\n\n\t/**\n\t * Duplicate file error. If prevent_duplicates is set to true and user selects the same file again.\n\t *\n\t * @property FILE_DUPLICATE_ERROR\n\t * @static\n\t * @final\n\t */\n\tFILE_DUPLICATE_ERROR : -602,\n\n\t/**\n\t * Runtime will try to detect if image is proper one. Otherwise will throw this error.\n\t *\n\t * @property IMAGE_FORMAT_ERROR\n\t * @static\n\t * @final\n\t */\n\tIMAGE_FORMAT_ERROR : -700,\n\n\t/**\n\t * While working on files runtime may run out of memory and will throw this error.\n\t *\n\t * @since 2.1.2\n\t * @property MEMORY_ERROR\n\t * @static\n\t * @final\n\t */\n\tMEMORY_ERROR : -701,\n\n\t/**\n\t * Each runtime has an upper limit on a dimension of the image it can handle. If bigger, will throw this error.\n\t *\n\t * @property IMAGE_DIMENSIONS_ERROR\n\t * @static\n\t * @final\n\t */\n\tIMAGE_DIMENSIONS_ERROR : -702,\n\n\t/**\n\t * Expose whole moxie (#1469).\n\t *\n\t * @property moxie\n\t * @type Object\n\t * @final\n\t */\n\tmoxie: o,\n\n\t/**\n\t * Mime type lookup table.\n\t *\n\t * @property mimeTypes\n\t * @type Object\n\t * @final\n\t */\n\tmimeTypes : u.Mime.mimes,\n\n\t/**\n\t * In some cases sniffing is the only way around :(\n\t */\n\tua: u.Env,\n\n\t/**\n\t * Gets the true type of the built-in object (better version of typeof).\n\t * @credits Angus Croll (http://javascriptweblog.wordpress.com/)\n\t *\n\t * @method typeOf\n\t * @static\n\t * @param {Object} o Object to check.\n\t * @return {String} Object [[Class]]\n\t */\n\ttypeOf: u.Basic.typeOf,\n\n\t/**\n\t * Extends the specified object with another object.\n\t *\n\t * @method extend\n\t * @static\n\t * @param {Object} target Object to extend.\n\t * @param {Object..} obj Multiple objects to extend with.\n\t * @return {Object} Same as target, the extended object.\n\t */\n\textend : u.Basic.extend,\n\n\t/**\n\t * Generates an unique ID. This is 99.99% unique since it takes the current time and 5 random numbers.\n\t * The only way a user would be able to get the same ID is if the two persons at the same exact millisecond manages\n\t * to get 5 the same random numbers between 0-65535 it also uses a counter so each call will be guaranteed to be page unique.\n\t * It's more probable for the earth to be hit with an asteriod. You can also if you want to be 100% sure set the plupload.guidPrefix property\n\t * to an user unique key.\n\t *\n\t * @method guid\n\t * @static\n\t * @return {String} Virtually unique id.\n\t */\n\tguid : u.Basic.guid,\n\n\t/**\n\t * Get array of DOM Elements by their ids.\n\t *\n\t * @method get\n\t * @param {String} id Identifier of the DOM Element\n\t * @return {Array}\n\t*/\n\tgetAll : function get(ids) {\n\t\tvar els = [], el;\n\n\t\tif (plupload.typeOf(ids) !== 'array') {\n\t\t\tids = [ids];\n\t\t}\n\n\t\tvar i = ids.length;\n\t\twhile (i--) {\n\t\t\tel = plupload.get(ids[i]);\n\t\t\tif (el) {\n\t\t\t\tels.push(el);\n\t\t\t}\n\t\t}\n\n\t\treturn els.length ? els : null;\n\t},\n\n\t/**\n\tGet DOM element by id\n\n\t@method get\n\t@param {String} id Identifier of the DOM Element\n\t@return {Node}\n\t*/\n\tget: u.Dom.get,\n\n\t/**\n\t * Executes the callback function for each item in array/object. If you return false in the\n\t * callback it will break the loop.\n\t *\n\t * @method each\n\t * @static\n\t * @param {Object} obj Object to iterate.\n\t * @param {function} callback Callback function to execute for each item.\n\t */\n\teach : u.Basic.each,\n\n\t/**\n\t * Returns the absolute x, y position of an Element. The position will be returned in a object with x, y fields.\n\t *\n\t * @method getPos\n\t * @static\n\t * @param {Element} node HTML element or element id to get x, y position from.\n\t * @param {Element} root Optional root element to stop calculations at.\n\t * @return {object} Absolute position of the specified element object with x, y fields.\n\t */\n\tgetPos : u.Dom.getPos,\n\n\t/**\n\t * Returns the size of the specified node in pixels.\n\t *\n\t * @method getSize\n\t * @static\n\t * @param {Node} node Node to get the size of.\n\t * @return {Object} Object with a w and h property.\n\t */\n\tgetSize : u.Dom.getSize,\n\n\t/**\n\t * Encodes the specified string.\n\t *\n\t * @method xmlEncode\n\t * @static\n\t * @param {String} s String to encode.\n\t * @return {String} Encoded string.\n\t */\n\txmlEncode : function(str) {\n\t\tvar xmlEncodeChars = {'<' : 'lt', '>' : 'gt', '&' : 'amp', '\"' : 'quot', '\\'' : '#39'}, xmlEncodeRegExp = /[<>&\\\"\\']/g;\n\n\t\treturn str ? ('' + str).replace(xmlEncodeRegExp, function(chr) {\n\t\t\treturn xmlEncodeChars[chr] ? '&' + xmlEncodeChars[chr] + ';' : chr;\n\t\t}) : str;\n\t},\n\n\t/**\n\t * Forces anything into an array.\n\t *\n\t * @method toArray\n\t * @static\n\t * @param {Object} obj Object with length field.\n\t * @return {Array} Array object containing all items.\n\t */\n\ttoArray : u.Basic.toArray,\n\n\t/**\n\t * Find an element in array and return its index if present, otherwise return -1.\n\t *\n\t * @method inArray\n\t * @static\n\t * @param {mixed} needle Element to find\n\t * @param {Array} array\n\t * @return {Int} Index of the element, or -1 if not found\n\t */\n\tinArray : u.Basic.inArray,\n\n\t/**\n\tRecieve an array of functions (usually async) to call in sequence, each  function\n\treceives a callback as first argument that it should call, when it completes. Finally,\n\tafter everything is complete, main callback is called. Passing truthy value to the\n\tcallback as a first argument will interrupt the sequence and invoke main callback\n\timmediately.\n\n\t@method inSeries\n\t@static\n\t@param {Array} queue Array of functions to call in sequence\n\t@param {Function} cb Main callback that is called in the end, or in case of error\n\t*/\n\tinSeries: u.Basic.inSeries,\n\n\t/**\n\t * Extends the language pack object with new items.\n\t *\n\t * @method addI18n\n\t * @static\n\t * @param {Object} pack Language pack items to add.\n\t * @return {Object} Extended language pack object.\n\t */\n\taddI18n : o.core.I18n.addI18n,\n\n\t/**\n\t * Translates the specified string by checking for the english string in the language pack lookup.\n\t *\n\t * @method translate\n\t * @static\n\t * @param {String} str String to look for.\n\t * @return {String} Translated string or the input string if it wasn't found.\n\t */\n\ttranslate : o.core.I18n.translate,\n\n\t/**\n\t * Pseudo sprintf implementation - simple way to replace tokens with specified values.\n\t *\n\t * @param {String} str String with tokens\n\t * @return {String} String with replaced tokens\n\t */\n\tsprintf : u.Basic.sprintf,\n\n\t/**\n\t * Checks if object is empty.\n\t *\n\t * @method isEmptyObj\n\t * @static\n\t * @param {Object} obj Object to check.\n\t * @return {Boolean}\n\t */\n\tisEmptyObj : u.Basic.isEmptyObj,\n\n\t/**\n\t * Checks if specified DOM element has specified class.\n\t *\n\t * @method hasClass\n\t * @static\n\t * @param {Object} obj DOM element like object to add handler to.\n\t * @param {String} name Class name\n\t */\n\thasClass : u.Dom.hasClass,\n\n\t/**\n\t * Adds specified className to specified DOM element.\n\t *\n\t * @method addClass\n\t * @static\n\t * @param {Object} obj DOM element like object to add handler to.\n\t * @param {String} name Class name\n\t */\n\taddClass : u.Dom.addClass,\n\n\t/**\n\t * Removes specified className from specified DOM element.\n\t *\n\t * @method removeClass\n\t * @static\n\t * @param {Object} obj DOM element like object to add handler to.\n\t * @param {String} name Class name\n\t */\n\tremoveClass : u.Dom.removeClass,\n\n\t/**\n\t * Returns a given computed style of a DOM element.\n\t *\n\t * @method getStyle\n\t * @static\n\t * @param {Object} obj DOM element like object.\n\t * @param {String} name Style you want to get from the DOM element\n\t */\n\tgetStyle : u.Dom.getStyle,\n\n\t/**\n\t * Adds an event handler to the specified object and store reference to the handler\n\t * in objects internal Plupload registry (@see removeEvent).\n\t *\n\t * @method addEvent\n\t * @static\n\t * @param {Object} obj DOM element like object to add handler to.\n\t * @param {String} name Name to add event listener to.\n\t * @param {Function} callback Function to call when event occurs.\n\t * @param {String} (optional) key that might be used to add specifity to the event record.\n\t */\n\taddEvent : u.Events.addEvent,\n\n\t/**\n\t * Remove event handler from the specified object. If third argument (callback)\n\t * is not specified remove all events with the specified name.\n\t *\n\t * @method removeEvent\n\t * @static\n\t * @param {Object} obj DOM element to remove event listener(s) from.\n\t * @param {String} name Name of event listener to remove.\n\t * @param {Function|String} (optional) might be a callback or unique key to match.\n\t */\n\tremoveEvent: u.Events.removeEvent,\n\n\t/**\n\t * Remove all kind of events from the specified object\n\t *\n\t * @method removeAllEvents\n\t * @static\n\t * @param {Object} obj DOM element to remove event listeners from.\n\t * @param {String} (optional) unique key to match, when removing events.\n\t */\n\tremoveAllEvents: u.Events.removeAllEvents,\n\n\t/**\n\t * Cleans the specified name from national characters (diacritics). The result will be a name with only a-z, 0-9 and _.\n\t *\n\t * @method cleanName\n\t * @static\n\t * @param {String} s String to clean up.\n\t * @return {String} Cleaned string.\n\t */\n\tcleanName : function(name) {\n\t\tvar i, lookup;\n\n\t\t// Replace diacritics\n\t\tlookup = [\n\t\t\t/[\\300-\\306]/g, 'A', /[\\340-\\346]/g, 'a',\n\t\t\t/\\307/g, 'C', /\\347/g, 'c',\n\t\t\t/[\\310-\\313]/g, 'E', /[\\350-\\353]/g, 'e',\n\t\t\t/[\\314-\\317]/g, 'I', /[\\354-\\357]/g, 'i',\n\t\t\t/\\321/g, 'N', /\\361/g, 'n',\n\t\t\t/[\\322-\\330]/g, 'O', /[\\362-\\370]/g, 'o',\n\t\t\t/[\\331-\\334]/g, 'U', /[\\371-\\374]/g, 'u'\n\t\t];\n\n\t\tfor (i = 0; i < lookup.length; i += 2) {\n\t\t\tname = name.replace(lookup[i], lookup[i + 1]);\n\t\t}\n\n\t\t// Replace whitespace\n\t\tname = name.replace(/\\s+/g, '_');\n\n\t\t// Remove anything else\n\t\tname = name.replace(/[^a-z0-9_\\-\\.]+/gi, '');\n\n\t\treturn name;\n\t},\n\n\t/**\n\t * Builds a full url out of a base URL and an object with items to append as query string items.\n\t *\n\t * @method buildUrl\n\t * @static\n\t * @param {String} url Base URL to append query string items to.\n\t * @param {Object} items Name/value object to serialize as a querystring.\n\t * @return {String} String with url + serialized query string items.\n\t */\n\tbuildUrl: function(url, items) {\n\t\tvar query = '';\n\n\t\tplupload.each(items, function(value, name) {\n\t\t\tquery += (query ? '&' : '') + encodeURIComponent(name) + '=' + encodeURIComponent(value);\n\t\t});\n\n\t\tif (query) {\n\t\t\turl += (url.indexOf('?') > 0 ? '&' : '?') + query;\n\t\t}\n\n\t\treturn url;\n\t},\n\n\t/**\n\t * Formats the specified number as a size string for example 1024 becomes 1 KB.\n\t *\n\t * @method formatSize\n\t * @static\n\t * @param {Number} size Size to format as string.\n\t * @return {String} Formatted size string.\n\t */\n\tformatSize : function(size) {\n\n\t\tif (size === undef || /\\D/.test(size)) {\n\t\t\treturn plupload.translate('N/A');\n\t\t}\n\n\t\tfunction round(num, precision) {\n\t\t\treturn Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);\n\t\t}\n\n\t\tvar boundary = Math.pow(1024, 4);\n\n\t\t// TB\n\t\tif (size > boundary) {\n\t\t\treturn round(size / boundary, 1) + \" \" + plupload.translate('tb');\n\t\t}\n\n\t\t// GB\n\t\tif (size > (boundary/=1024)) {\n\t\t\treturn round(size / boundary, 1) + \" \" + plupload.translate('gb');\n\t\t}\n\n\t\t// MB\n\t\tif (size > (boundary/=1024)) {\n\t\t\treturn round(size / boundary, 1) + \" \" + plupload.translate('mb');\n\t\t}\n\n\t\t// KB\n\t\tif (size > 1024) {\n\t\t\treturn Math.round(size / 1024) + \" \" + plupload.translate('kb');\n\t\t}\n\n\t\treturn size + \" \" + plupload.translate('b');\n\t},\n\n\n\t/**\n\t * Parses the specified size string into a byte value. For example 10kb becomes 10240.\n\t *\n\t * @method parseSize\n\t * @static\n\t * @param {String|Number} size String to parse or number to just pass through.\n\t * @return {Number} Size in bytes.\n\t */\n\tparseSize : u.Basic.parseSizeStr,\n\n\n\t/**\n\t * A way to predict what runtime will be choosen in the current environment with the\n\t * specified settings.\n\t *\n\t * @method predictRuntime\n\t * @static\n\t * @param {Object|String} config Plupload settings to check\n\t * @param {String} [runtimes] Comma-separated list of runtimes to check against\n\t * @return {String} Type of compatible runtime\n\t */\n\tpredictRuntime : function(config, runtimes) {\n\t\tvar up, runtime;\n\n\t\tup = new plupload.Uploader(config);\n\t\truntime = Runtime.thatCan(up.getOption().required_features, runtimes || config.runtimes);\n\t\tup.destroy();\n\t\treturn runtime;\n\t},\n\n\t/**\n\t * Registers a filter that will be executed for each file added to the queue.\n\t * If callback returns false, file will not be added.\n\t *\n\t * Callback receives two arguments: a value for the filter as it was specified in settings.filters\n\t * and a file to be filtered. Callback is executed in the context of uploader instance.\n\t *\n\t * @method addFileFilter\n\t * @static\n\t * @param {String} name Name of the filter by which it can be referenced in settings.filters\n\t * @param {String} cb Callback - the actual routine that every added file must pass\n\t */\n\taddFileFilter: function(name, cb) {\n\t\tfileFilters[name] = cb;\n\t}\n};\n\n\nplupload.addFileFilter('mime_types', function(filters, file, cb) {\n\tif (filters.length && !filters.regexp.test(file.name)) {\n\t\tthis.trigger('Error', {\n\t\t\tcode : plupload.FILE_EXTENSION_ERROR,\n\t\t\tmessage : plupload.translate('File extension error.'),\n\t\t\tfile : file\n\t\t});\n\t\tcb(false);\n\t} else {\n\t\tcb(true);\n\t}\n});\n\n\nplupload.addFileFilter('max_file_size', function(maxSize, file, cb) {\n\tvar undef;\n\n\tmaxSize = plupload.parseSize(maxSize);\n\n\t// Invalid file size\n\tif (file.size !== undef && maxSize && file.size > maxSize) {\n\t\tthis.trigger('Error', {\n\t\t\tcode : plupload.FILE_SIZE_ERROR,\n\t\t\tmessage : plupload.translate('File size error.'),\n\t\t\tfile : file\n\t\t});\n\t\tcb(false);\n\t} else {\n\t\tcb(true);\n\t}\n});\n\n\nplupload.addFileFilter('prevent_duplicates', function(value, file, cb) {\n\tif (value) {\n\t\tvar ii = this.files.length;\n\t\twhile (ii--) {\n\t\t\t// Compare by name and size (size might be 0 or undefined, but still equivalent for both)\n\t\t\tif (file.name === this.files[ii].name && file.size === this.files[ii].size) {\n\t\t\t\tthis.trigger('Error', {\n\t\t\t\t\tcode : plupload.FILE_DUPLICATE_ERROR,\n\t\t\t\t\tmessage : plupload.translate('Duplicate file error.'),\n\t\t\t\t\tfile : file\n\t\t\t\t});\n\t\t\t\tcb(false);\n\t\t\t\treturn;\n\t\t\t}\n\t\t}\n\t}\n\tcb(true);\n});\n\nplupload.addFileFilter('prevent_empty', function(value, file, cb) {\n\tif (value && !file.size && file.size !== undef) {\n\t\tthis.trigger('Error', {\n\t\t\tcode : plupload.FILE_SIZE_ERROR,\n\t\t\tmessage : plupload.translate('File size error.'),\n\t\t\tfile : file\n\t\t});\n\t\tcb(false);\n\t} else {\n\t\tcb(true);\n\t}\n});\n\n\n/**\n@class Uploader\n@constructor\n\n@param {Object} settings For detailed information about each option check documentation.\n\t@param {String|DOMElement} settings.browse_button id of the DOM element or DOM element itself to use as file dialog trigger.\n\t@param {Number|String} [settings.chunk_size=0] Chunk size in bytes to slice the file into. Shorcuts with b, kb, mb, gb, tb suffixes also supported. `e.g. 204800 or \"204800b\" or \"200kb\"`. By default - disabled.\n\t@param {String|DOMElement} [settings.container] id of the DOM element or DOM element itself that will be used to wrap uploader structures. Defaults to immediate parent of the `browse_button` element.\n\t@param {String|DOMElement} [settings.drop_element] id of the DOM element or DOM element itself to use as a drop zone for Drag-n-Drop.\n\t@param {String} [settings.file_data_name=\"file\"] Name for the file field in Multipart formated message.\n\t@param {Object} [settings.filters={}] Set of file type filters.\n\t\t@param {String|Number} [settings.filters.max_file_size=0] Maximum file size that the user can pick, in bytes. Optionally supports b, kb, mb, gb, tb suffixes. `e.g. \"10mb\" or \"1gb\"`. By default - not set. Dispatches `plupload.FILE_SIZE_ERROR`.\n\t\t@param {Array} [settings.filters.mime_types=[]] List of file types to accept, each one defined by title and list of extensions. `e.g. {title : \"Image files\", extensions : \"jpg,jpeg,gif,png\"}`. Dispatches `plupload.FILE_EXTENSION_ERROR`\n\t\t@param {Boolean} [settings.filters.prevent_duplicates=false] Do not let duplicates into the queue. Dispatches `plupload.FILE_DUPLICATE_ERROR`.\n\t\t@param {Boolean} [settings.filters.prevent_empty=true] Do not let empty files into the queue (IE10 is known to hang for example when trying to upload such). Dispatches `plupload.FILE_SIZE_ERROR`.\n\t@param {String} [settings.flash_swf_url] URL of the Flash swf.\n\t@param {Object} [settings.headers] Custom headers to send with the upload. Hash of name/value pairs.\n\t@param {String} [settings.http_method=\"POST\"] HTTP method to use during upload (only PUT or POST allowed).\n\t@param {Number} [settings.max_retries=0] How many times to retry the chunk or file, before triggering Error event.\n\t@param {Boolean} [settings.multipart=true] Whether to send file and additional parameters as Multipart formated message.\n\t@param {Object} [settings.multipart_params] Hash of key/value pairs to send with every file upload.\n\t@param {Boolean} [settings.multi_selection=true] Enable ability to select multiple files at once in file dialog.\n\t@param {String|Object} [settings.required_features] Either comma-separated list or hash of required features that chosen runtime should absolutely possess.\n\t@param {Object} [settings.resize] Enable resizng of images on client-side. Applies to `image/jpeg` and `image/png` only. `e.g. {width : 200, height : 200, quality : 90, crop: true}`\n\t\t@param {Number} [settings.resize.width] If image is bigger, it will be resized.\n\t\t@param {Number} [settings.resize.height] If image is bigger, it will be resized.\n\t\t@param {Number} [settings.resize.quality=90] Compression quality for jpegs (1-100).\n\t\t@param {Boolean} [settings.resize.crop=false] Whether to crop images to exact dimensions. By default they will be resized proportionally.\n\t@param {String} [settings.runtimes=\"html5,flash,silverlight,html4\"] Comma separated list of runtimes, that Plupload will try in turn, moving to the next if previous fails.\n\t@param {String} [settings.silverlight_xap_url] URL of the Silverlight xap.\n\t@param {Boolean} [settings.send_chunk_number=true] Whether to send chunks and chunk numbers, or total and offset bytes.\n\t@param {Boolean} [settings.send_file_name=true] Whether to send file name as additional argument - 'name' (required for chunked uploads and some other cases where file name cannot be sent via normal ways).\n\t@param {String} settings.url URL of the server-side upload handler.\n\t@param {Boolean} [settings.unique_names=false] If true will generate unique filenames for uploaded files.\n\n*/\nplupload.Uploader = function(options) {\n\t/**\n\tFires when the current RunTime has been initialized.\n\n\t@event Init\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\n\t/**\n\tFires after the init event incase you need to perform actions there.\n\n\t@event PostInit\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\n\t/**\n\tFires when the option is changed in via uploader.setOption().\n\n\t@event OptionChanged\n\t@since 2.1\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t@param {String} name Name of the option that was changed\n\t@param {Mixed} value New value for the specified option\n\t@param {Mixed} oldValue Previous value of the option\n\t */\n\n\t/**\n\tFires when the silverlight/flash or other shim needs to move.\n\n\t@event Refresh\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\n\t/**\n\tFires when the overall state is being changed for the upload queue.\n\n\t@event StateChanged\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\n\t/**\n\tFires when browse_button is clicked and browse dialog shows.\n\n\t@event Browse\n\t@since 2.1.2\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\n\t/**\n\tFires for every filtered file before it is added to the queue.\n\n\t@event FileFiltered\n\t@since 2.1\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t@param {plupload.File} file Another file that has to be added to the queue.\n\t */\n\n\t/**\n\tFires when the file queue is changed. In other words when files are added/removed to the files array of the uploader instance.\n\n\t@event QueueChanged\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\n\t/**\n\tFires after files were filtered and added to the queue.\n\n\t@event FilesAdded\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t@param {Array} files Array of file objects that were added to queue by the user.\n\t */\n\n\t/**\n\tFires when file is removed from the queue.\n\n\t@event FilesRemoved\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t@param {Array} files Array of files that got removed.\n\t */\n\n\t/**\n\tFires just before a file is uploaded. Can be used to cancel the upload for the specified file\n\tby returning false from the handler.\n\n\t@event BeforeUpload\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t@param {plupload.File} file File to be uploaded.\n\t */\n\n\t/**\n\tFires when a file is to be uploaded by the runtime.\n\n\t@event UploadFile\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t@param {plupload.File} file File to be uploaded.\n\t */\n\n\t/**\n\tFires while a file is being uploaded. Use this event to update the current file upload progress.\n\n\t@event UploadProgress\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t@param {plupload.File} file File that is currently being uploaded.\n\t */\n\n\t/**\n\t* Fires just before a chunk is uploaded. This event enables you to override settings\n\t* on the uploader instance before the chunk is uploaded.\n\t*\n\t* @event BeforeChunkUpload\n\t* @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t* @param {plupload.File} file File to be uploaded.\n\t* @param {Object} args POST params to be sent.\n\t* @param {Blob} chunkBlob Current blob.\n\t* @param {offset} offset Current offset.\n\t*/\n\n\t/**\n\tFires when file chunk is uploaded.\n\n\t@event ChunkUploaded\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t@param {plupload.File} file File that the chunk was uploaded for.\n\t@param {Object} result Object with response properties.\n\t\t@param {Number} result.offset The amount of bytes the server has received so far, including this chunk.\n\t\t@param {Number} result.total The size of the file.\n\t\t@param {String} result.response The response body sent by the server.\n\t\t@param {Number} result.status The HTTP status code sent by the server.\n\t\t@param {String} result.responseHeaders All the response headers as a single string.\n\t */\n\n\t/**\n\tFires when a file is successfully uploaded.\n\n\t@event FileUploaded\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t@param {plupload.File} file File that was uploaded.\n\t@param {Object} result Object with response properties.\n\t\t@param {String} result.response The response body sent by the server.\n\t\t@param {Number} result.status The HTTP status code sent by the server.\n\t\t@param {String} result.responseHeaders All the response headers as a single string.\n\t */\n\n\t/**\n\tFires when all files in a queue are uploaded.\n\n\t@event UploadComplete\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t@param {Array} files Array of file objects that was added to queue/selected by the user.\n\t */\n\n\t/**\n\tFires when a error occurs.\n\n\t@event Error\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t@param {Object} error Contains code, message and sometimes file and other details.\n\t\t@param {Number} error.code The plupload error code.\n\t\t@param {String} error.message Description of the error (uses i18n).\n\t */\n\n\t/**\n\tFires when destroy method is called.\n\n\t@event Destroy\n\t@param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\tvar uid = plupload.guid()\n\t, settings\n\t, files = []\n\t, preferred_caps = {}\n\t, fileInputs = []\n\t, fileDrops = []\n\t, startTime\n\t, total\n\t, disabled = false\n\t, xhr\n\t;\n\n\n\t// Private methods\n\tfunction uploadNext(id) {\n\t\tvar file, count = 0, i;\n\n\t\tif (this.state == plupload.STARTED) {\n\t\t\t// Find first QUEUED file\n\t\t\tfor (i = 0; i < files.length; i++) {\n\t\t\t\tif (!file && files[i].status == plupload.QUEUED) {\n\t\t\t\t\tfile = files[i];\n\t\t\t\t\tif ((!id || id === file.id) && this.trigger(\"BeforeUpload\", file)) {\n\t\t\t\t\t\tfile.status = plupload.UPLOADING;\n\t\t\t\t\t\tthis.trigger(\"UploadFile\", file);\n\t\t\t\t\t}\n\t\t\t\t} else {\n\t\t\t\t\tcount++;\n\t\t\t\t}\n\t\t\t}\n\n\t\t\t// All files are DONE or FAILED\n\t\t\tif (count == files.length) {\n\t\t\t\tif (this.state !== plupload.STOPPED) {\n\t\t\t\t\tthis.state = plupload.STOPPED;\n\t\t\t\t\tthis.trigger(\"StateChanged\");\n\t\t\t\t}\n\t\t\t\tthis.trigger(\"UploadComplete\", files);\n\t\t\t}\n\t\t}\n\t}\n\n\n\tfunction calcFile(file) {\n\t\tfile.percent = file.size > 0 ? Math.ceil(file.loaded / file.size * 100) : 100;\n\t\tcalc();\n\t}\n\n\n\tfunction calc() {\n\t\tvar i, file;\n\t\tvar loaded;\n\t\tvar loadedDuringCurrentSession = 0;\n\n\t\t// Reset stats\n\t\ttotal.reset();\n\n\t\t// Check status, size, loaded etc on all files\n\t\tfor (i = 0; i < files.length; i++) {\n\t\t\tfile = files[i];\n\n\t\t\tif (file.size !== undef) {\n\t\t\t\t// We calculate totals based on original file size\n\t\t\t\ttotal.size += file.origSize;\n\n\t\t\t\t// Since we cannot predict file size after resize, we do opposite and\n\t\t\t\t// interpolate loaded amount to match magnitude of total\n\t\t\t\tloaded = file.loaded * file.origSize / file.size;\n\n\t\t\t\tif (!file.completeTimestamp || file.completeTimestamp > startTime) {\n\t\t\t\t\tloadedDuringCurrentSession += loaded;\n\t\t\t\t}\n\n\t\t\t\ttotal.loaded += loaded;\n\t\t\t} else {\n\t\t\t\ttotal.size = undef;\n\t\t\t}\n\n\t\t\tif (file.status == plupload.DONE) {\n\t\t\t\ttotal.uploaded++;\n\t\t\t} else if (file.status == plupload.FAILED) {\n\t\t\t\ttotal.failed++;\n\t\t\t} else {\n\t\t\t\ttotal.queued++;\n\t\t\t}\n\t\t}\n\n\t\t// If we couldn't calculate a total file size then use the number of files to calc percent\n\t\tif (total.size === undef) {\n\t\t\ttotal.percent = files.length > 0 ? Math.ceil(total.uploaded / files.length * 100) : 0;\n\t\t} else {\n\t\t\ttotal.bytesPerSec = Math.ceil(loadedDuringCurrentSession / ((+new Date() - startTime || 1) / 1000.0));\n\t\t\ttotal.percent = total.size > 0 ? Math.ceil(total.loaded / total.size * 100) : 0;\n\t\t}\n\t}\n\n\n\tfunction getRUID() {\n\t\tvar ctrl = fileInputs[0] || fileDrops[0];\n\t\tif (ctrl) {\n\t\t\treturn ctrl.getRuntime().uid;\n\t\t}\n\t\treturn false;\n\t}\n\n\n\tfunction bindEventListeners() {\n\t\tthis.bind('FilesAdded FilesRemoved', function(up) {\n\t\t\tup.trigger('QueueChanged');\n\t\t\tup.refresh();\n\t\t});\n\n\t\tthis.bind('CancelUpload', onCancelUpload);\n\n\t\tthis.bind('BeforeUpload', onBeforeUpload);\n\n\t\tthis.bind('UploadFile', onUploadFile);\n\n\t\tthis.bind('UploadProgress', onUploadProgress);\n\n\t\tthis.bind('StateChanged', onStateChanged);\n\n\t\tthis.bind('QueueChanged', calc);\n\n\t\tthis.bind('Error', onError);\n\n\t\tthis.bind('FileUploaded', onFileUploaded);\n\n\t\tthis.bind('Destroy', onDestroy);\n\t}\n\n\n\tfunction initControls(settings, cb) {\n\t\tvar self = this, inited = 0, queue = [];\n\n\t\t// common settings\n\t\tvar options = {\n\t\t\truntime_order: settings.runtimes,\n\t\t\trequired_caps: settings.required_features,\n\t\t\tpreferred_caps: preferred_caps,\n\t\t\tswf_url: settings.flash_swf_url,\n\t\t\txap_url: settings.silverlight_xap_url\n\t\t};\n\n\t\t// add runtime specific options if any\n\t\tplupload.each(settings.runtimes.split(/\\s*,\\s*/), function(runtime) {\n\t\t\tif (settings[runtime]) {\n\t\t\t\toptions[runtime] = settings[runtime];\n\t\t\t}\n\t\t});\n\n\t\t// initialize file pickers - there can be many\n\t\tif (settings.browse_button) {\n\t\t\tplupload.each(settings.browse_button, function(el) {\n\t\t\t\tqueue.push(function(cb) {\n\t\t\t\t\tvar fileInput = new o.file.FileInput(plupload.extend({}, options, {\n\t\t\t\t\t\taccept: settings.filters.mime_types,\n\t\t\t\t\t\tname: settings.file_data_name,\n\t\t\t\t\t\tmultiple: settings.multi_selection,\n\t\t\t\t\t\tcontainer: settings.container,\n\t\t\t\t\t\tbrowse_button: el\n\t\t\t\t\t}));\n\n\t\t\t\t\tfileInput.onready = function() {\n\t\t\t\t\t\tvar info = Runtime.getInfo(this.ruid);\n\n\t\t\t\t\t\t// for backward compatibility\n\t\t\t\t\t\tplupload.extend(self.features, {\n\t\t\t\t\t\t\tchunks: info.can('slice_blob'),\n\t\t\t\t\t\t\tmultipart: info.can('send_multipart'),\n\t\t\t\t\t\t\tmulti_selection: info.can('select_multiple')\n\t\t\t\t\t\t});\n\n\t\t\t\t\t\tinited++;\n\t\t\t\t\t\tfileInputs.push(this);\n\t\t\t\t\t\tcb();\n\t\t\t\t\t};\n\n\t\t\t\t\tfileInput.onchange = function() {\n\t\t\t\t\t\tself.addFile(this.files);\n\t\t\t\t\t};\n\n\t\t\t\t\tfileInput.bind('mouseenter mouseleave mousedown mouseup', function(e) {\n\t\t\t\t\t\tif (!disabled) {\n\t\t\t\t\t\t\tif (settings.browse_button_hover) {\n\t\t\t\t\t\t\t\tif ('mouseenter' === e.type) {\n\t\t\t\t\t\t\t\t\tplupload.addClass(el, settings.browse_button_hover);\n\t\t\t\t\t\t\t\t} else if ('mouseleave' === e.type) {\n\t\t\t\t\t\t\t\t\tplupload.removeClass(el, settings.browse_button_hover);\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\tif (settings.browse_button_active) {\n\t\t\t\t\t\t\t\tif ('mousedown' === e.type) {\n\t\t\t\t\t\t\t\t\tplupload.addClass(el, settings.browse_button_active);\n\t\t\t\t\t\t\t\t} else if ('mouseup' === e.type) {\n\t\t\t\t\t\t\t\t\tplupload.removeClass(el, settings.browse_button_active);\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t});\n\n\t\t\t\t\tfileInput.bind('mousedown', function() {\n\t\t\t\t\t\tself.trigger('Browse');\n\t\t\t\t\t});\n\n\t\t\t\t\tfileInput.bind('error runtimeerror', function() {\n\t\t\t\t\t\tfileInput = null;\n\t\t\t\t\t\tcb();\n\t\t\t\t\t});\n\n\t\t\t\t\tfileInput.init();\n\t\t\t\t});\n\t\t\t});\n\t\t}\n\n\t\t// initialize drop zones\n\t\tif (settings.drop_element) {\n\t\t\tplupload.each(settings.drop_element, function(el) {\n\t\t\t\tqueue.push(function(cb) {\n\t\t\t\t\tvar fileDrop = new o.file.FileDrop(plupload.extend({}, options, {\n\t\t\t\t\t\tdrop_zone: el\n\t\t\t\t\t}));\n\n\t\t\t\t\tfileDrop.onready = function() {\n\t\t\t\t\t\tvar info = Runtime.getInfo(this.ruid);\n\n\t\t\t\t\t\t// for backward compatibility\n\t\t\t\t\t\tplupload.extend(self.features, {\n\t\t\t\t\t\t\tchunks: info.can('slice_blob'),\n\t\t\t\t\t\t\tmultipart: info.can('send_multipart'),\n\t\t\t\t\t\t\tdragdrop: info.can('drag_and_drop')\n\t\t\t\t\t\t});\n\n\t\t\t\t\t\tinited++;\n\t\t\t\t\t\tfileDrops.push(this);\n\t\t\t\t\t\tcb();\n\t\t\t\t\t};\n\n\t\t\t\t\tfileDrop.ondrop = function() {\n\t\t\t\t\t\tself.addFile(this.files);\n\t\t\t\t\t};\n\n\t\t\t\t\tfileDrop.bind('error runtimeerror', function() {\n\t\t\t\t\t\tfileDrop = null;\n\t\t\t\t\t\tcb();\n\t\t\t\t\t});\n\n\t\t\t\t\tfileDrop.init();\n\t\t\t\t});\n\t\t\t});\n\t\t}\n\n\n\t\tplupload.inSeries(queue, function() {\n\t\t\tif (typeof(cb) === 'function') {\n\t\t\t\tcb(inited);\n\t\t\t}\n\t\t});\n\t}\n\n\n\tfunction resizeImage(blob, params, runtimeOptions, cb) {\n\t\tvar img = new o.image.Image();\n\n\t\ttry {\n\t\t\timg.onload = function() {\n\t\t\t\t// no manipulation required if...\n\t\t\t\tif (params.width > this.width &&\n\t\t\t\t\tparams.height > this.height &&\n\t\t\t\t\tparams.quality === undef &&\n\t\t\t\t\tparams.preserve_headers &&\n\t\t\t\t\t!params.crop\n\t\t\t\t) {\n\t\t\t\t\tthis.destroy();\n\t\t\t\t\tcb(blob);\n\t\t\t\t} else {\n\t\t\t\t\t// otherwise downsize\n\t\t\t\t\timg.downsize(params.width, params.height, params.crop, params.preserve_headers);\n\t\t\t\t}\n\t\t\t};\n\n\t\t\timg.onresize = function() {\n\t\t\t\tvar resizedBlob = this.getAsBlob(blob.type, params.quality);\n\t\t\t\tthis.destroy();\n\t\t\t\tcb(resizedBlob);\n\t\t\t};\n\n\t\t\timg.bind('error runtimeerror', function() {\n\t\t\t\tthis.destroy();\n\t\t\t\tcb(blob);\n\t\t\t});\n\n\t\t\timg.load(blob, runtimeOptions);\n\t\t} catch(ex) {\n\t\t\tcb(blob);\n\t\t}\n\t}\n\n\n\tfunction setOption(option, value, init) {\n\t\tvar self = this, reinitRequired = false;\n\n\t\tfunction _setOption(option, value, init) {\n\t\t\tvar oldValue = settings[option];\n\n\t\t\tswitch (option) {\n\t\t\t\tcase 'max_file_size':\n\t\t\t\t\tif (option === 'max_file_size') {\n\t\t\t\t\t\tsettings.max_file_size = settings.filters.max_file_size = value;\n\t\t\t\t\t}\n\t\t\t\t\tbreak;\n\n\t\t\t\tcase 'chunk_size':\n\t\t\t\t\tif (value = plupload.parseSize(value)) {\n\t\t\t\t\t\tsettings[option] = value;\n\t\t\t\t\t\tsettings.send_file_name = true;\n\t\t\t\t\t}\n\t\t\t\t\tbreak;\n\n\t\t\t\tcase 'multipart':\n\t\t\t\t\tsettings[option] = value;\n\t\t\t\t\tif (!value) {\n\t\t\t\t\t\tsettings.send_file_name = true;\n\t\t\t\t\t}\n\t\t\t\t\tbreak;\n\n\t\t\t\tcase 'http_method':\n\t\t\t\t\tsettings[option] = value.toUpperCase() === 'PUT' ? 'PUT' : 'POST';\n\t\t\t\t\tbreak;\n\n\t\t\t\tcase 'unique_names':\n\t\t\t\t\tsettings[option] = value;\n\t\t\t\t\tif (value) {\n\t\t\t\t\t\tsettings.send_file_name = true;\n\t\t\t\t\t}\n\t\t\t\t\tbreak;\n\n\t\t\t\tcase 'filters':\n\t\t\t\t\t// for sake of backward compatibility\n\t\t\t\t\tif (plupload.typeOf(value) === 'array') {\n\t\t\t\t\t\tvalue = {\n\t\t\t\t\t\t\tmime_types: value\n\t\t\t\t\t\t};\n\t\t\t\t\t}\n\n\t\t\t\t\tif (init) {\n\t\t\t\t\t\tplupload.extend(settings.filters, value);\n\t\t\t\t\t} else {\n\t\t\t\t\t\tsettings.filters = value;\n\t\t\t\t\t}\n\n\t\t\t\t\t// if file format filters are being updated, regenerate the matching expressions\n\t\t\t\t\tif (value.mime_types) {\n\t\t\t\t\t\tif (plupload.typeOf(value.mime_types) === 'string') {\n\t\t\t\t\t\t\tvalue.mime_types = o.core.utils.Mime.mimes2extList(value.mime_types);\n\t\t\t\t\t\t}\n\n\t\t\t\t\t\tvalue.mime_types.regexp = (function(filters) {\n\t\t\t\t\t\t\tvar extensionsRegExp = [];\n\n\t\t\t\t\t\t\tplupload.each(filters, function(filter) {\n\t\t\t\t\t\t\t\tplupload.each(filter.extensions.split(/,/), function(ext) {\n\t\t\t\t\t\t\t\t\tif (/^\\s*\\*\\s*$/.test(ext)) {\n\t\t\t\t\t\t\t\t\t\textensionsRegExp.push('\\\\.*');\n\t\t\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\t\t\textensionsRegExp.push('\\\\.' + ext.replace(new RegExp('[' + ('/^$.*+?|()[]{}\\\\'.replace(/./g, '\\\\$&')) + ']', 'g'), '\\\\$&'));\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t});\n\t\t\t\t\t\t\t});\n\n\t\t\t\t\t\t\treturn new RegExp('(' + extensionsRegExp.join('|') + ')$', 'i');\n\t\t\t\t\t\t}(value.mime_types));\n\n\t\t\t\t\t\tsettings.filters.mime_types = value.mime_types;\n\t\t\t\t\t}\n\t\t\t\t\tbreak;\n\n\t\t\t\tcase 'resize':\n\t\t\t\t\tif (value) {\n\t\t\t\t\t\tsettings.resize = plupload.extend({\n\t\t\t\t\t\t\tpreserve_headers: true,\n\t\t\t\t\t\t\tcrop: false\n\t\t\t\t\t\t}, value);\n\t\t\t\t\t} else {\n\t\t\t\t\t\tsettings.resize = false;\n\t\t\t\t\t}\n\t\t\t\t\tbreak;\n\n\t\t\t\tcase 'prevent_duplicates':\n\t\t\t\t\tsettings.prevent_duplicates = settings.filters.prevent_duplicates = !!value;\n\t\t\t\t\tbreak;\n\n\t\t\t\t// options that require reinitialisation\n\t\t\t\tcase 'container':\n\t\t\t\tcase 'browse_button':\n\t\t\t\tcase 'drop_element':\n\t\t\t\t\t\tvalue = 'container' === option\n\t\t\t\t\t\t\t? plupload.get(value)\n\t\t\t\t\t\t\t: plupload.getAll(value)\n\t\t\t\t\t\t\t;\n\n\t\t\t\tcase 'runtimes':\n\t\t\t\tcase 'multi_selection':\n\t\t\t\tcase 'flash_swf_url':\n\t\t\t\tcase 'silverlight_xap_url':\n\t\t\t\t\tsettings[option] = value;\n\t\t\t\t\tif (!init) {\n\t\t\t\t\t\treinitRequired = true;\n\t\t\t\t\t}\n\t\t\t\t\tbreak;\n\n\t\t\t\tdefault:\n\t\t\t\t\tsettings[option] = value;\n\t\t\t}\n\n\t\t\tif (!init) {\n\t\t\t\tself.trigger('OptionChanged', option, value, oldValue);\n\t\t\t}\n\t\t}\n\n\t\tif (typeof(option) === 'object') {\n\t\t\tplupload.each(option, function(value, option) {\n\t\t\t\t_setOption(option, value, init);\n\t\t\t});\n\t\t} else {\n\t\t\t_setOption(option, value, init);\n\t\t}\n\n\t\tif (init) {\n\t\t\t// Normalize the list of required capabilities\n\t\t\tsettings.required_features = normalizeCaps(plupload.extend({}, settings));\n\n\t\t\t// Come up with the list of capabilities that can affect default mode in a multi-mode runtimes\n\t\t\tpreferred_caps = normalizeCaps(plupload.extend({}, settings, {\n\t\t\t\trequired_features: true\n\t\t\t}));\n\t\t} else if (reinitRequired) {\n\t\t\tself.trigger('Destroy');\n\n\t\t\tinitControls.call(self, settings, function(inited) {\n\t\t\t\tif (inited) {\n\t\t\t\t\tself.runtime = Runtime.getInfo(getRUID()).type;\n\t\t\t\t\tself.trigger('Init', { runtime: self.runtime });\n\t\t\t\t\tself.trigger('PostInit');\n\t\t\t\t} else {\n\t\t\t\t\tself.trigger('Error', {\n\t\t\t\t\t\tcode : plupload.INIT_ERROR,\n\t\t\t\t\t\tmessage : plupload.translate('Init error.')\n\t\t\t\t\t});\n\t\t\t\t}\n\t\t\t});\n\t\t}\n\t}\n\n\n\t// Internal event handlers\n\tfunction onBeforeUpload(up, file) {\n\t\t// Generate unique target filenames\n\t\tif (up.settings.unique_names) {\n\t\t\tvar matches = file.name.match(/\\.([^.]+)$/), ext = \"part\";\n\t\t\tif (matches) {\n\t\t\t\text = matches[1];\n\t\t\t}\n\t\t\tfile.target_name = file.id + '.' + ext;\n\t\t}\n\t}\n\n\n\tfunction onUploadFile(up, file) {\n\t\tvar url = up.settings.url;\n\t\tvar chunkSize = up.settings.chunk_size;\n\t\tvar retries = up.settings.max_retries;\n\t\tvar features = up.features;\n\t\tvar offset = 0;\n\t\tvar blob;\n\n\t\tvar runtimeOptions = {\n\t\t\truntime_order: up.settings.runtimes,\n\t\t\trequired_caps: up.settings.required_features,\n\t\t\tpreferred_caps: preferred_caps,\n\t\t\tswf_url: up.settings.flash_swf_url,\n\t\t\txap_url: up.settings.silverlight_xap_url\n\t\t};\n\n\t\t// make sure we start at a predictable offset\n\t\tif (file.loaded) {\n\t\t\toffset = file.loaded = chunkSize ? chunkSize * Math.floor(file.loaded / chunkSize) : 0;\n\t\t}\n\n\t\tfunction handleError() {\n\t\t\tif (retries-- > 0) {\n\t\t\t\tdelay(uploadNextChunk, 1000);\n\t\t\t} else {\n\t\t\t\tfile.loaded = offset; // reset all progress\n\n\t\t\t\tup.trigger('Error', {\n\t\t\t\t\tcode : plupload.HTTP_ERROR,\n\t\t\t\t\tmessage : plupload.translate('HTTP Error.'),\n\t\t\t\t\tfile : file,\n\t\t\t\t\tresponse : xhr.responseText,\n\t\t\t\t\tstatus : xhr.status,\n\t\t\t\t\tresponseHeaders: xhr.getAllResponseHeaders()\n\t\t\t\t});\n\t\t\t}\n\t\t}\n\n\t\tfunction uploadNextChunk() {\n\t\t\tvar chunkBlob, args = {}, curChunkSize;\n\n\t\t\t// make sure that file wasn't cancelled and upload is not stopped in general\n\t\t\tif (file.status !== plupload.UPLOADING || up.state === plupload.STOPPED) {\n\t\t\t\treturn;\n\t\t\t}\n\n\t\t\t// send additional 'name' parameter only if required\n\t\t\tif (up.settings.send_file_name) {\n\t\t\t\targs.name = file.target_name || file.name;\n\t\t\t}\n\n\t\t\tif (chunkSize && features.chunks && blob.size > chunkSize) { // blob will be of type string if it was loaded in memory\n\t\t\t\tcurChunkSize = Math.min(chunkSize, blob.size - offset);\n\t\t\t\tchunkBlob = blob.slice(offset, offset + curChunkSize);\n\t\t\t} else {\n\t\t\t\tcurChunkSize = blob.size;\n\t\t\t\tchunkBlob = blob;\n\t\t\t}\n\n\t\t\t// If chunking is enabled add corresponding args, no matter if file is bigger than chunk or smaller\n\t\t\tif (chunkSize && features.chunks) {\n\t\t\t\t// Setup query string arguments\n\t\t\t\tif (up.settings.send_chunk_number) {\n\t\t\t\t\targs.chunk = Math.ceil(offset / chunkSize);\n\t\t\t\t\targs.chunks = Math.ceil(blob.size / chunkSize);\n\t\t\t\t} else { // keep support for experimental chunk format, just in case\n\t\t\t\t\targs.offset = offset;\n\t\t\t\t\targs.total = blob.size;\n\t\t\t\t}\n\t\t\t}\n\n\t\t\tif (up.trigger('BeforeChunkUpload', file, args, chunkBlob, offset)) {\n\t\t\t\tuploadChunk(args, chunkBlob, curChunkSize);\n\t\t\t}\n\t\t}\n\n\t\tfunction uploadChunk(args, chunkBlob, curChunkSize) {\n\t\t\tvar formData;\n\n\t\t\txhr = new o.xhr.XMLHttpRequest();\n\n\t\t\t// Do we have upload progress support\n\t\t\tif (xhr.upload) {\n\t\t\t\txhr.upload.onprogress = function(e) {\n\t\t\t\t\tfile.loaded = Math.min(file.size, offset + e.loaded);\n\t\t\t\t\tup.trigger('UploadProgress', file);\n\t\t\t\t};\n\t\t\t}\n\n\t\t\txhr.onload = function() {\n\t\t\t\t// check if upload made itself through\n\t\t\t\tif (xhr.status < 200 || xhr.status >= 400) {\n\t\t\t\t\thandleError();\n\t\t\t\t\treturn;\n\t\t\t\t}\n\n\t\t\t\tretries = up.settings.max_retries; // reset the counter\n\n\t\t\t\t// Handle chunk response\n\t\t\t\tif (curChunkSize < blob.size) {\n\t\t\t\t\tchunkBlob.destroy();\n\n\t\t\t\t\toffset += curChunkSize;\n\t\t\t\t\tfile.loaded = Math.min(offset, blob.size);\n\n\t\t\t\t\tup.trigger('ChunkUploaded', file, {\n\t\t\t\t\t\toffset : file.loaded,\n\t\t\t\t\t\ttotal : blob.size,\n\t\t\t\t\t\tresponse : xhr.responseText,\n\t\t\t\t\t\tstatus : xhr.status,\n\t\t\t\t\t\tresponseHeaders: xhr.getAllResponseHeaders()\n\t\t\t\t\t});\n\n\t\t\t\t\t// stock Android browser doesn't fire upload progress events, but in chunking mode we can fake them\n\t\t\t\t\tif (plupload.ua.browser === 'Android Browser') {\n\t\t\t\t\t\t// doesn't harm in general, but is not required anywhere else\n\t\t\t\t\t\tup.trigger('UploadProgress', file);\n\t\t\t\t\t}\n\t\t\t\t} else {\n\t\t\t\t\tfile.loaded = file.size;\n\t\t\t\t}\n\n\t\t\t\tchunkBlob = formData = null; // Free memory\n\n\t\t\t\t// Check if file is uploaded\n\t\t\t\tif (!offset || offset >= blob.size) {\n\t\t\t\t\t// If file was modified, destory the copy\n\t\t\t\t\tif (file.size != file.origSize) {\n\t\t\t\t\t\tblob.destroy();\n\t\t\t\t\t\tblob = null;\n\t\t\t\t\t}\n\n\t\t\t\t\tup.trigger('UploadProgress', file);\n\n\t\t\t\t\tfile.status = plupload.DONE;\n\t\t\t\t\tfile.completeTimestamp = +new Date();\n\n\t\t\t\t\tup.trigger('FileUploaded', file, {\n\t\t\t\t\t\tresponse : xhr.responseText,\n\t\t\t\t\t\tstatus : xhr.status,\n\t\t\t\t\t\tresponseHeaders: xhr.getAllResponseHeaders()\n\t\t\t\t\t});\n\t\t\t\t} else {\n\t\t\t\t\t// Still chunks left\n\t\t\t\t\tdelay(uploadNextChunk, 1); // run detached, otherwise event handlers interfere\n\t\t\t\t}\n\t\t\t};\n\n\t\t\txhr.onerror = function() {\n\t\t\t\thandleError();\n\t\t\t};\n\n\t\t\txhr.onloadend = function() {\n\t\t\t\tthis.destroy();\n\t\t\t};\n\n\t\t\t// Build multipart request\n\t\t\tif (up.settings.multipart && features.multipart) {\n\t\t\t\txhr.open(up.settings.http_method, url, true);\n\n\t\t\t\t// Set custom headers\n\t\t\t\tplupload.each(up.settings.headers, function(value, name) {\n\t\t\t\t\txhr.setRequestHeader(name, value);\n\t\t\t\t});\n\n\t\t\t\tformData = new o.xhr.FormData();\n\n\t\t\t\t// Add multipart params\n\t\t\t\tplupload.each(plupload.extend(args, up.settings.multipart_params, file.settings.multipart_params), function(value, name) {\n\t\t\t\t\tformData.append(name, value);\n\t\t\t\t});\n\n\t\t\t\t// Add file and send it\n\t\t\t\tformData.append(up.settings.file_data_name, chunkBlob);\n\t\t\t\txhr.send(formData, runtimeOptions);\n\t\t\t} else {\n\t\t\t\t// if no multipart, send as binary stream\n\t\t\t\turl = plupload.buildUrl(up.settings.url, plupload.extend(args, up.settings.multipart_params, file.settings.multipart_params));\n\n\t\t\t\txhr.open(up.settings.http_method, url, true);\n\n\t\t\t\t// Set custom headers\n\t\t\t\tplupload.each(up.settings.headers, function(value, name) {\n\t\t\t\t\txhr.setRequestHeader(name, value);\n\t\t\t\t});\n\n\t\t\t\t// do not set Content-Type, if it was defined previously (see #1203)\n\t\t\t\tif (!xhr.hasRequestHeader('Content-Type')) {\n\t\t\t\t\txhr.setRequestHeader('Content-Type', 'application/octet-stream'); // Binary stream header\n\t\t\t\t}\n\n\t\t\t\txhr.send(chunkBlob, runtimeOptions);\n\t\t\t}\n\t\t}\n\n\n\t\tblob = file.getSource();\n\n\t\t// Start uploading chunks\n\t\tif (!plupload.isEmptyObj(up.settings.resize) && plupload.inArray(blob.type, ['image/jpeg', 'image/png']) !== -1) {\n\t\t\t// Resize if required\n\t\t\tresizeImage(blob, up.settings.resize, runtimeOptions, function(resizedBlob) {\n\t\t\t\tblob = resizedBlob;\n\t\t\t\tfile.size = resizedBlob.size;\n\t\t\t\tuploadNextChunk();\n\t\t\t});\n\t\t} else {\n\t\t\tuploadNextChunk();\n\t\t}\n\t}\n\n\n\tfunction onUploadProgress(up, file) {\n\t\tcalcFile(file);\n\t}\n\n\n\tfunction onStateChanged(up) {\n\t\tif (up.state == plupload.STARTED) {\n\t\t\t// Get start time to calculate bps\n\t\t\tstartTime = (+new Date());\n\t\t} else if (up.state == plupload.STOPPED) {\n\t\t\t// Reset currently uploading files\n\t\t\tfor (var i = up.files.length - 1; i >= 0; i--) {\n\t\t\t\tif (up.files[i].status == plupload.UPLOADING) {\n\t\t\t\t\tup.files[i].status = plupload.QUEUED;\n\t\t\t\t\tcalc();\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\n\n\tfunction onCancelUpload() {\n\t\tif (xhr) {\n\t\t\txhr.abort();\n\t\t}\n\t}\n\n\n\tfunction onFileUploaded(up) {\n\t\tcalc();\n\n\t\t// Upload next file but detach it from the error event\n\t\t// since other custom listeners might want to stop the queue\n\t\tdelay(function() {\n\t\t\tuploadNext.call(up);\n\t\t}, 1);\n\t}\n\n\n\tfunction onError(up, err) {\n\t\tif (err.code === plupload.INIT_ERROR) {\n\t\t\tup.destroy();\n\t\t}\n\t\t// Set failed status if an error occured on a file\n\t\telse if (err.code === plupload.HTTP_ERROR) {\n\t\t\terr.file.status = plupload.FAILED;\n\t\t\terr.file.completeTimestamp = +new Date();\n\t\t\tcalcFile(err.file);\n\n\t\t\t// Upload next file but detach it from the error event\n\t\t\t// since other custom listeners might want to stop the queue\n\t\t\tif (up.state == plupload.STARTED) { // upload in progress\n\t\t\t\tup.trigger('CancelUpload');\n\t\t\t\tdelay(function() {\n\t\t\t\t\tuploadNext.call(up);\n\t\t\t\t}, 1);\n\t\t\t}\n\t\t}\n\t}\n\n\n\tfunction onDestroy(up) {\n\t\tup.stop();\n\n\t\t// Purge the queue\n\t\tplupload.each(files, function(file) {\n\t\t\tfile.destroy();\n\t\t});\n\t\tfiles = [];\n\n\t\tif (fileInputs.length) {\n\t\t\tplupload.each(fileInputs, function(fileInput) {\n\t\t\t\tfileInput.destroy();\n\t\t\t});\n\t\t\tfileInputs = [];\n\t\t}\n\n\t\tif (fileDrops.length) {\n\t\t\tplupload.each(fileDrops, function(fileDrop) {\n\t\t\t\tfileDrop.destroy();\n\t\t\t});\n\t\t\tfileDrops = [];\n\t\t}\n\n\t\tpreferred_caps = {};\n\t\tdisabled = false;\n\t\tstartTime = xhr = null;\n\t\ttotal.reset();\n\t}\n\n\n\t// Default settings\n\tsettings = {\n\t\tchunk_size: 0,\n\t\tfile_data_name: 'file',\n\t\tfilters: {\n\t\t\tmime_types: [],\n\t\t\tmax_file_size: 0,\n\t\t\tprevent_duplicates: false,\n\t\t\tprevent_empty: true\n\t\t},\n\t\tflash_swf_url: 'js/Moxie.swf',\n\t\thttp_method: 'POST',\n\t\tmax_retries: 0,\n\t\tmultipart: true,\n\t\tmulti_selection: true,\n\t\tresize: false,\n\t\truntimes: Runtime.order,\n\t\tsend_file_name: true,\n\t\tsend_chunk_number: true,\n\t\tsilverlight_xap_url: 'js/Moxie.xap'\n\t};\n\n\n\tsetOption.call(this, options, null, true);\n\n\t// Inital total state\n\ttotal = new plupload.QueueProgress();\n\n\t// Add public methods\n\tplupload.extend(this, {\n\n\t\t/**\n\t\t * Unique id for the Uploader instance.\n\t\t *\n\t\t * @property id\n\t\t * @type String\n\t\t */\n\t\tid : uid,\n\t\tuid : uid, // mOxie uses this to differentiate between event targets\n\n\t\t/**\n\t\t * Current state of the total uploading progress. This one can either be plupload.STARTED or plupload.STOPPED.\n\t\t * These states are controlled by the stop/start methods. The default value is STOPPED.\n\t\t *\n\t\t * @property state\n\t\t * @type Number\n\t\t */\n\t\tstate : plupload.STOPPED,\n\n\t\t/**\n\t\t * Map of features that are available for the uploader runtime. Features will be filled\n\t\t * before the init event is called, these features can then be used to alter the UI for the end user.\n\t\t * Some of the current features that might be in this map is: dragdrop, chunks, jpgresize, pngresize.\n\t\t *\n\t\t * @property features\n\t\t * @type Object\n\t\t */\n\t\tfeatures : {},\n\n\t\t/**\n\t\t * Current runtime name.\n\t\t *\n\t\t * @property runtime\n\t\t * @type String\n\t\t */\n\t\truntime : null,\n\n\t\t/**\n\t\t * Current upload queue, an array of File instances.\n\t\t *\n\t\t * @property files\n\t\t * @type Array\n\t\t * @see plupload.File\n\t\t */\n\t\tfiles : files,\n\n\t\t/**\n\t\t * Object with name/value settings.\n\t\t *\n\t\t * @property settings\n\t\t * @type Object\n\t\t */\n\t\tsettings : settings,\n\n\t\t/**\n\t\t * Total progess information. How many files has been uploaded, total percent etc.\n\t\t *\n\t\t * @property total\n\t\t * @type plupload.QueueProgress\n\t\t */\n\t\ttotal : total,\n\n\n\t\t/**\n\t\t * Initializes the Uploader instance and adds internal event listeners.\n\t\t *\n\t\t * @method init\n\t\t */\n\t\tinit : function() {\n\t\t\tvar self = this, opt, preinitOpt, err;\n\n\t\t\tpreinitOpt = self.getOption('preinit');\n\t\t\tif (typeof(preinitOpt) == \"function\") {\n\t\t\t\tpreinitOpt(self);\n\t\t\t} else {\n\t\t\t\tplupload.each(preinitOpt, function(func, name) {\n\t\t\t\t\tself.bind(name, func);\n\t\t\t\t});\n\t\t\t}\n\n\t\t\tbindEventListeners.call(self);\n\n\t\t\t// Check for required options\n\t\t\tplupload.each(['container', 'browse_button', 'drop_element'], function(el) {\n\t\t\t\tif (self.getOption(el) === null) {\n\t\t\t\t\terr = {\n\t\t\t\t\t\tcode : plupload.INIT_ERROR,\n\t\t\t\t\t\tmessage : plupload.sprintf(plupload.translate(\"%s specified, but cannot be found.\"), el)\n\t\t\t\t\t}\n\t\t\t\t\treturn false;\n\t\t\t\t}\n\t\t\t});\n\n\t\t\tif (err) {\n\t\t\t\treturn self.trigger('Error', err);\n\t\t\t}\n\n\n\t\t\tif (!settings.browse_button && !settings.drop_element) {\n\t\t\t\treturn self.trigger('Error', {\n\t\t\t\t\tcode : plupload.INIT_ERROR,\n\t\t\t\t\tmessage : plupload.translate(\"You must specify either browse_button or drop_element.\")\n\t\t\t\t});\n\t\t\t}\n\n\n\t\t\tinitControls.call(self, settings, function(inited) {\n\t\t\t\tvar initOpt = self.getOption('init');\n\t\t\t\tif (typeof(initOpt) == \"function\") {\n\t\t\t\t\tinitOpt(self);\n\t\t\t\t} else {\n\t\t\t\t\tplupload.each(initOpt, function(func, name) {\n\t\t\t\t\t\tself.bind(name, func);\n\t\t\t\t\t});\n\t\t\t\t}\n\n\t\t\t\tif (inited) {\n\t\t\t\t\tself.runtime = Runtime.getInfo(getRUID()).type;\n\t\t\t\t\tself.trigger('Init', { runtime: self.runtime });\n\t\t\t\t\tself.trigger('PostInit');\n\t\t\t\t} else {\n\t\t\t\t\tself.trigger('Error', {\n\t\t\t\t\t\tcode : plupload.INIT_ERROR,\n\t\t\t\t\t\tmessage : plupload.translate('Init error.')\n\t\t\t\t\t});\n\t\t\t\t}\n\t\t\t});\n\t\t},\n\n\t\t/**\n\t\t * Set the value for the specified option(s).\n\t\t *\n\t\t * @method setOption\n\t\t * @since 2.1\n\t\t * @param {String|Object} option Name of the option to change or the set of key/value pairs\n\t\t * @param {Mixed} [value] Value for the option (is ignored, if first argument is object)\n\t\t */\n\t\tsetOption: function(option, value) {\n\t\t\tsetOption.call(this, option, value, !this.runtime); // until runtime not set we do not need to reinitialize\n\t\t},\n\n\t\t/**\n\t\t * Get the value for the specified option or the whole configuration, if not specified.\n\t\t *\n\t\t * @method getOption\n\t\t * @since 2.1\n\t\t * @param {String} [option] Name of the option to get\n\t\t * @return {Mixed} Value for the option or the whole set\n\t\t */\n\t\tgetOption: function(option) {\n\t\t\tif (!option) {\n\t\t\t\treturn settings;\n\t\t\t}\n\t\t\treturn settings[option];\n\t\t},\n\n\t\t/**\n\t\t * Refreshes the upload instance by dispatching out a refresh event to all runtimes.\n\t\t * This would for example reposition flash/silverlight shims on the page.\n\t\t *\n\t\t * @method refresh\n\t\t */\n\t\trefresh : function() {\n\t\t\tif (fileInputs.length) {\n\t\t\t\tplupload.each(fileInputs, function(fileInput) {\n\t\t\t\t\tfileInput.trigger('Refresh');\n\t\t\t\t});\n\t\t\t}\n\t\t\tthis.trigger('Refresh');\n\t\t},\n\n\t\t/**\n\t\t * Starts uploading the queued files.\n\t\t *\n\t\t * @method start\n\t\t */\n\t\tstart : function(id) {\n\t\t\tif (this.state != plupload.STARTED) {\n\t\t\t\tthis.state = plupload.STARTED;\n\t\t\t\tthis.trigger('StateChanged');\n\n\t\t\t\tuploadNext.call(this, id);\n\t\t\t}\n\t\t},\n\n\t\t/**\n\t\t * Stops the upload of the queued files.\n\t\t *\n\t\t * @method stop\n\t\t */\n\t\tstop : function() {\n\t\t\tif (this.state != plupload.STOPPED) {\n\t\t\t\tthis.state = plupload.STOPPED;\n\t\t\t\tthis.trigger('StateChanged');\n\t\t\t\tthis.trigger('CancelUpload');\n\t\t\t}\n\t\t},\n\n\n\t\t/**\n\t\t * Disables/enables browse button on request.\n\t\t *\n\t\t * @method disableBrowse\n\t\t * @param {Boolean} disable Whether to disable or enable (default: true)\n\t\t */\n\t\tdisableBrowse : function() {\n\t\t\tdisabled = arguments[0] !== undef ? arguments[0] : true;\n\n\t\t\tif (fileInputs.length) {\n\t\t\t\tplupload.each(fileInputs, function(fileInput) {\n\t\t\t\t\tfileInput.disable(disabled);\n\t\t\t\t});\n\t\t\t}\n\n\t\t\tthis.trigger('DisableBrowse', disabled);\n\t\t},\n\n\t\t/**\n\t\t * Returns the specified file object by id.\n\t\t *\n\t\t * @method getFile\n\t\t * @param {String} id File id to look for.\n\t\t * @return {plupload.File} File object or undefined if it wasn't found;\n\t\t */\n\t\tgetFile : function(id) {\n\t\t\tvar i;\n\t\t\tfor (i = files.length - 1; i >= 0; i--) {\n\t\t\t\tif (files[i].id === id) {\n\t\t\t\t\treturn files[i];\n\t\t\t\t}\n\t\t\t}\n\t\t},\n\n\t\t/**\n\t\t * Adds file to the queue programmatically. Can be native file, instance of Plupload.File,\n\t\t * instance of mOxie.File, input[type=\"file\"] element, or array of these. Fires FilesAdded,\n\t\t * if any files were added to the queue. Otherwise nothing happens.\n\t\t *\n\t\t * @method addFile\n\t\t * @since 2.0\n\t\t * @param {plupload.File|mOxie.File|File|Node|Array} file File or files to add to the queue.\n\t\t * @param {String} [fileName] If specified, will be used as a name for the file\n\t\t */\n\t\taddFile : function(file, fileName) {\n\t\t\tvar self = this\n\t\t\t, queue = []\n\t\t\t, filesAdded = []\n\t\t\t, ruid\n\t\t\t;\n\n\t\t\tfunction filterFile(file, cb) {\n\t\t\t\tvar queue = [];\n\t\t\t\tplupload.each(self.settings.filters, function(rule, name) {\n\t\t\t\t\tif (fileFilters[name]) {\n\t\t\t\t\t\tqueue.push(function(cb) {\n\t\t\t\t\t\t\tfileFilters[name].call(self, rule, file, function(res) {\n\t\t\t\t\t\t\t\tcb(!res);\n\t\t\t\t\t\t\t});\n\t\t\t\t\t\t});\n\t\t\t\t\t}\n\t\t\t\t});\n\t\t\t\tplupload.inSeries(queue, cb);\n\t\t\t}\n\n\t\t\t/**\n\t\t\t * @method resolveFile\n\t\t\t * @private\n\t\t\t * @param {moxie.file.File|moxie.file.Blob|plupload.File|File|Blob|input[type=\"file\"]} file\n\t\t\t */\n\t\t\tfunction resolveFile(file) {\n\t\t\t\tvar type = plupload.typeOf(file);\n\n\t\t\t\t// moxie.file.File\n\t\t\t\tif (file instanceof o.file.File) {\n\t\t\t\t\tif (!file.ruid && !file.isDetached()) {\n\t\t\t\t\t\tif (!ruid) { // weird case\n\t\t\t\t\t\t\treturn false;\n\t\t\t\t\t\t}\n\t\t\t\t\t\tfile.ruid = ruid;\n\t\t\t\t\t\tfile.connectRuntime(ruid);\n\t\t\t\t\t}\n\t\t\t\t\tresolveFile(new plupload.File(file));\n\t\t\t\t}\n\t\t\t\t// moxie.file.Blob\n\t\t\t\telse if (file instanceof o.file.Blob) {\n\t\t\t\t\tresolveFile(file.getSource());\n\t\t\t\t\tfile.destroy();\n\t\t\t\t}\n\t\t\t\t// plupload.File - final step for other branches\n\t\t\t\telse if (file instanceof plupload.File) {\n\t\t\t\t\tif (fileName) {\n\t\t\t\t\t\tfile.name = fileName;\n\t\t\t\t\t}\n\n\t\t\t\t\tqueue.push(function(cb) {\n\t\t\t\t\t\t// run through the internal and user-defined filters, if any\n\t\t\t\t\t\tfilterFile(file, function(err) {\n\t\t\t\t\t\t\tif (!err) {\n\t\t\t\t\t\t\t\t// make files available for the filters by updating the main queue directly\n\t\t\t\t\t\t\t\tfiles.push(file);\n\t\t\t\t\t\t\t\t// collect the files that will be passed to FilesAdded event\n\t\t\t\t\t\t\t\tfilesAdded.push(file);\n\n\t\t\t\t\t\t\t\tself.trigger(\"FileFiltered\", file);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tdelay(cb, 1); // do not build up recursions or eventually we might hit the limits\n\t\t\t\t\t\t});\n\t\t\t\t\t});\n\t\t\t\t}\n\t\t\t\t// native File or blob\n\t\t\t\telse if (plupload.inArray(type, ['file', 'blob']) !== -1) {\n\t\t\t\t\tresolveFile(new o.file.File(null, file));\n\t\t\t\t}\n\t\t\t\t// input[type=\"file\"]\n\t\t\t\telse if (type === 'node' && plupload.typeOf(file.files) === 'filelist') {\n\t\t\t\t\t// if we are dealing with input[type=\"file\"]\n\t\t\t\t\tplupload.each(file.files, resolveFile);\n\t\t\t\t}\n\t\t\t\t// mixed array of any supported types (see above)\n\t\t\t\telse if (type === 'array') {\n\t\t\t\t\tfileName = null; // should never happen, but unset anyway to avoid funny situations\n\t\t\t\t\tplupload.each(file, resolveFile);\n\t\t\t\t}\n\t\t\t}\n\n\t\t\truid = getRUID();\n\n\t\t\tresolveFile(file);\n\n\t\t\tif (queue.length) {\n\t\t\t\tplupload.inSeries(queue, function() {\n\t\t\t\t\t// if any files left after filtration, trigger FilesAdded\n\t\t\t\t\tif (filesAdded.length) {\n\t\t\t\t\t\tself.trigger(\"FilesAdded\", filesAdded);\n\t\t\t\t\t}\n\t\t\t\t});\n\t\t\t}\n\t\t},\n\n\t\t/**\n\t\t * Removes a specific file.\n\t\t *\n\t\t * @method removeFile\n\t\t * @param {plupload.File|String} file File to remove from queue.\n\t\t */\n\t\tremoveFile : function(file) {\n\t\t\tvar id = typeof(file) === 'string' ? file : file.id;\n\n\t\t\tfor (var i = files.length - 1; i >= 0; i--) {\n\t\t\t\tif (files[i].id === id) {\n\t\t\t\t\treturn this.splice(i, 1)[0];\n\t\t\t\t}\n\t\t\t}\n\t\t},\n\n\t\t/**\n\t\t * Removes part of the queue and returns the files removed. This will also trigger the\n\t\t * FilesRemoved and QueueChanged events.\n\t\t *\n\t\t * @method splice\n\t\t * @param {Number} [start=0] Start index to remove from.\n\t\t * @param {Number} [length] Number of files to remove (defaults to number of files in the queue).\n\t\t * @return {Array} Array of files that was removed.\n\t\t */\n\t\tsplice : function(start, length) {\n\t\t\t// Splice and trigger events\n\t\t\tvar removed = files.splice(start === undef ? 0 : start, length === undef ? files.length : length);\n\n\t\t\t// if upload is in progress we need to stop it and restart after files are removed\n\t\t\tvar restartRequired = false;\n\t\t\tif (this.state == plupload.STARTED) { // upload in progress\n\t\t\t\tplupload.each(removed, function(file) {\n\t\t\t\t\tif (file.status === plupload.UPLOADING) {\n\t\t\t\t\t\trestartRequired = true; // do not restart, unless file that is being removed is uploading\n\t\t\t\t\t\treturn false;\n\t\t\t\t\t}\n\t\t\t\t});\n\n\t\t\t\tif (restartRequired) {\n\t\t\t\t\tthis.stop();\n\t\t\t\t}\n\t\t\t}\n\n\t\t\tthis.trigger(\"FilesRemoved\", removed);\n\n\t\t\t// Dispose any resources allocated by those files\n\t\t\tplupload.each(removed, function(file) {\n\t\t\t\tfile.destroy();\n\t\t\t});\n\n\t\t\tif (restartRequired) {\n\t\t\t\tthis.start();\n\t\t\t}\n\n\t\t\treturn removed;\n\t\t},\n\n\t\t/**\n\t\tDispatches the specified event name and its arguments to all listeners.\n\n\t\t@method trigger\n\t\t@param {String} name Event name to fire.\n\t\t@param {Object..} Multiple arguments to pass along to the listener functions.\n\t\t*/\n\n\t\t// override the parent method to match Plupload-like event logic\n\t\tdispatchEvent: function(type) {\n\t\t\tvar list, args, result;\n\n\t\t\ttype = type.toLowerCase();\n\n\t\t\tlist = this.hasEventListener(type);\n\n\t\t\tif (list) {\n\t\t\t\t// sort event list by priority\n\t\t\t\tlist.sort(function(a, b) { return b.priority - a.priority; });\n\n\t\t\t\t// first argument should be current plupload.Uploader instance\n\t\t\t\targs = [].slice.call(arguments);\n\t\t\t\targs.shift();\n\t\t\t\targs.unshift(this);\n\n\t\t\t\tfor (var i = 0; i < list.length; i++) {\n\t\t\t\t\t// Fire event, break chain if false is returned\n\t\t\t\t\tif (list[i].fn.apply(list[i].scope, args) === false) {\n\t\t\t\t\t\treturn false;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t\treturn true;\n\t\t},\n\n\t\t/**\n\t\tCheck whether uploader has any listeners to the specified event.\n\n\t\t@method hasEventListener\n\t\t@param {String} name Event name to check for.\n\t\t*/\n\n\n\t\t/**\n\t\tAdds an event listener by name.\n\n\t\t@method bind\n\t\t@param {String} name Event name to listen for.\n\t\t@param {function} fn Function to call ones the event gets fired.\n\t\t@param {Object} [scope] Optional scope to execute the specified function in.\n\t\t@param {Number} [priority=0] Priority of the event handler - handlers with higher priorities will be called first\n\t\t*/\n\t\tbind: function(name, fn, scope, priority) {\n\t\t\t// adapt moxie EventTarget style to Plupload-like\n\t\t\tplupload.Uploader.prototype.bind.call(this, name, fn, priority, scope);\n\t\t},\n\n\t\t/**\n\t\tRemoves the specified event listener.\n\n\t\t@method unbind\n\t\t@param {String} name Name of event to remove.\n\t\t@param {function} fn Function to remove from listener.\n\t\t*/\n\n\t\t/**\n\t\tRemoves all event listeners.\n\n\t\t@method unbindAll\n\t\t*/\n\n\n\t\t/**\n\t\t * Destroys Plupload instance and cleans after itself.\n\t\t *\n\t\t * @method destroy\n\t\t */\n\t\tdestroy : function() {\n\t\t\tthis.trigger('Destroy');\n\t\t\tsettings = total = null; // purge these exclusively\n\t\t\tthis.unbindAll();\n\t\t}\n\t});\n};\n\nplupload.Uploader.prototype = o.core.EventTarget.instance;\n\n/**\n * Constructs a new file instance.\n *\n * @class File\n * @constructor\n *\n * @param {Object} file Object containing file properties\n * @param {String} file.name Name of the file.\n * @param {Number} file.size File size.\n */\nplupload.File = (function() {\n\tvar filepool = {};\n\n\tfunction PluploadFile(file) {\n\n\t\tplupload.extend(this, {\n\n\t\t\t/**\n\t\t\t * File id this is a globally unique id for the specific file.\n\t\t\t *\n\t\t\t * @property id\n\t\t\t * @type String\n\t\t\t */\n\t\t\tid: plupload.guid(),\n\n\t\t\t/**\n\t\t\t * File name for example \"myfile.gif\".\n\t\t\t *\n\t\t\t * @property name\n\t\t\t * @type String\n\t\t\t */\n\t\t\tname: file.name || file.fileName,\n\n\t\t\t/**\n\t\t\t * File type, `e.g image/jpeg`\n\t\t\t *\n\t\t\t * @property type\n\t\t\t * @type String\n\t\t\t */\n\t\t\ttype: file.type || '',\n\n\t\t\t/**\n\t\t\t * Relative path to the file inside a directory\n\t\t\t *\n\t\t\t * @property relativePath\n\t\t\t * @type String\n\t\t\t * @default ''\n\t\t\t */\n\t\t\trelativePath: file.relativePath || '',\n\n\t\t\t/**\n\t\t\t * File size in bytes (may change after client-side manupilation).\n\t\t\t *\n\t\t\t * @property size\n\t\t\t * @type Number\n\t\t\t */\n\t\t\tsize: file.fileSize || file.size,\n\n\t\t\t/**\n\t\t\t * Original file size in bytes.\n\t\t\t *\n\t\t\t * @property origSize\n\t\t\t * @type Number\n\t\t\t */\n\t\t\torigSize: file.fileSize || file.size,\n\n\t\t\t/**\n\t\t\t * Number of bytes uploaded of the files total size.\n\t\t\t *\n\t\t\t * @property loaded\n\t\t\t * @type Number\n\t\t\t */\n\t\t\tloaded: 0,\n\n\t\t\t/**\n\t\t\t * Number of percentage uploaded of the file.\n\t\t\t *\n\t\t\t * @property percent\n\t\t\t * @type Number\n\t\t\t */\n\t\t\tpercent: 0,\n\n\t\t\t/**\n\t\t\t * Status constant matching the plupload states QUEUED, UPLOADING, FAILED, DONE.\n\t\t\t *\n\t\t\t * @property status\n\t\t\t * @type Number\n\t\t\t * @see plupload\n\t\t\t */\n\t\t\tstatus: plupload.QUEUED,\n\n\t\t\t/**\n\t\t\t * Date of last modification.\n\t\t\t *\n\t\t\t * @property lastModifiedDate\n\t\t\t * @type {String}\n\t\t\t */\n\t\t\tlastModifiedDate: file.lastModifiedDate || (new Date()).toLocaleString(), // Thu Aug 23 2012 19:40:00 GMT+0400 (GET)\n\n\n\t\t\t/**\n\t\t\t * Set when file becomes plupload.DONE or plupload.FAILED. Is used to calculate proper plupload.QueueProgress.bytesPerSec.\n\t\t\t * @private\n\t\t\t * @property completeTimestamp\n\t\t\t * @type {Number}\n\t\t\t */\n\t\t\tcompleteTimestamp: 0,\n\n            settings: {},\n\n\t\t\t/**\n\t\t\t * Returns native window.File object, when it's available.\n\t\t\t *\n\t\t\t * @method getNative\n\t\t\t * @return {window.File} or null, if plupload.File is of different origin\n\t\t\t */\n\t\t\tgetNative: function() {\n\t\t\t\tvar file = this.getSource().getSource();\n\t\t\t\treturn plupload.inArray(plupload.typeOf(file), ['blob', 'file']) !== -1 ? file : null;\n\t\t\t},\n\n\t\t\t/**\n\t\t\t * Returns mOxie.File - unified wrapper object that can be used across runtimes.\n\t\t\t *\n\t\t\t * @method getSource\n\t\t\t * @return {mOxie.File} or null\n\t\t\t */\n\t\t\tgetSource: function() {\n\t\t\t\tif (!filepool[this.id]) {\n\t\t\t\t\treturn null;\n\t\t\t\t}\n\t\t\t\treturn filepool[this.id];\n\t\t\t},\n\n            setOption: function(option, value) {\n                this.settings[option] ? plupload.extend(this.settings[option], value) : this.settings[option] = value;\n            },\n\n\t\t\t/**\n\t\t\t * Destroys plupload.File object.\n\t\t\t *\n\t\t\t * @method destroy\n\t\t\t */\n\t\t\tdestroy: function() {\n\t\t\t\tvar src = this.getSource();\n\t\t\t\tif (src) {\n\t\t\t\t\tsrc.destroy();\n\t\t\t\t\tdelete filepool[this.id];\n\t\t\t\t}\n\t\t\t}\n\t\t});\n\n\t\tfilepool[this.id] = file;\n\t}\n\n\treturn PluploadFile;\n}());\n\n\n/**\n * Constructs a queue progress.\n *\n * @class QueueProgress\n * @constructor\n */\n plupload.QueueProgress = function() {\n\tvar self = this; // Setup alias for self to reduce code size when it's compressed\n\n\t/**\n\t * Total queue file size.\n\t *\n\t * @property size\n\t * @type Number\n\t */\n\tself.size = 0;\n\n\t/**\n\t * Total bytes uploaded.\n\t *\n\t * @property loaded\n\t * @type Number\n\t */\n\tself.loaded = 0;\n\n\t/**\n\t * Number of files uploaded.\n\t *\n\t * @property uploaded\n\t * @type Number\n\t */\n\tself.uploaded = 0;\n\n\t/**\n\t * Number of files failed to upload.\n\t *\n\t * @property failed\n\t * @type Number\n\t */\n\tself.failed = 0;\n\n\t/**\n\t * Number of files yet to be uploaded.\n\t *\n\t * @property queued\n\t * @type Number\n\t */\n\tself.queued = 0;\n\n\t/**\n\t * Total percent of the uploaded bytes.\n\t *\n\t * @property percent\n\t * @type Number\n\t */\n\tself.percent = 0;\n\n\t/**\n\t * Bytes uploaded per second.\n\t *\n\t * @property bytesPerSec\n\t * @type Number\n\t */\n\tself.bytesPerSec = 0;\n\n\t/**\n\t * Resets the progress to its initial values.\n\t *\n\t * @method reset\n\t */\n\tself.reset = function() {\n\t\tself.size = self.loaded = self.uploaded = self.failed = self.queued = self.percent = self.bytesPerSec = 0;\n\t};\n};\n\nexports.plupload = plupload;\n\n}(this, moxie));\n");
__$coverInitRange("Plupload", "199:199");
__$coverInitRange("Plupload", "200:64074");
__$coverInitRange("Plupload", "232:261");
__$coverInitRange("Plupload", "263:283");
__$coverInitRange("Plupload", "285:305");
__$coverInitRange("Plupload", "307:338");
__$coverInitRange("Plupload", "398:1931");
__$coverInitRange("Plupload", "1973:16593");
__$coverInitRange("Plupload", "16597:16908");
__$coverInitRange("Plupload", "16912:17296");
__$coverInitRange("Plupload", "17300:17816");
__$coverInitRange("Plupload", "17819:18114");
__$coverInitRange("Plupload", "22125:59513");
__$coverInitRange("Plupload", "59516:59573");
__$coverInitRange("Plupload", "59801:62854");
__$coverInitRange("Plupload", "62942:64026");
__$coverInitRange("Plupload", "64029:64056");
__$coverInitRange("Plupload", "434:486");
__$coverInitRange("Plupload", "490:1153");
__$coverInitRange("Plupload", "1157:1914");
__$coverInitRange("Plupload", "1918:1929");
__$coverInitRange("Plupload", "638:1042");
__$coverInitRange("Plupload", "1047:1150");
__$coverInitRange("Plupload", "1070:1096");
__$coverInitRange("Plupload", "1125:1146");
__$coverInitRange("Plupload", "1196:1288");
__$coverInitRange("Plupload", "1260:1282");
__$coverInitRange("Plupload", "1337:1420");
__$coverInitRange("Plupload", "1391:1414");
__$coverInitRange("Plupload", "1499:1582");
__$coverInitRange("Plupload", "1587:1701");
__$coverInitRange("Plupload", "1706:1799");
__$coverInitRange("Plupload", "1804:1911");
__$coverInitRange("Plupload", "1556:1578");
__$coverInitRange("Plupload", "1667:1697");
__$coverInitRange("Plupload", "1746:1789");
__$coverInitRange("Plupload", "1858:1889");
__$coverInitRange("Plupload", "6553:6569");
__$coverInitRange("Plupload", "6574:6632");
__$coverInitRange("Plupload", "6637:6655");
__$coverInitRange("Plupload", "6659:6741");
__$coverInitRange("Plupload", "6746:6776");
__$coverInitRange("Plupload", "6617:6628");
__$coverInitRange("Plupload", "6676:6701");
__$coverInitRange("Plupload", "6706:6737");
__$coverInitRange("Plupload", "6720:6732");
__$coverInitRange("Plupload", "8071:8189");
__$coverInitRange("Plupload", "8194:8340");
__$coverInitRange("Plupload", "8262:8328");
__$coverInitRange("Plupload", "12849:12862");
__$coverInitRange("Plupload", "12891:13191");
__$coverInitRange("Plupload", "13196:13289");
__$coverInitRange("Plupload", "13318:13350");
__$coverInitRange("Plupload", "13381:13425");
__$coverInitRange("Plupload", "13430:13441");
__$coverInitRange("Plupload", "13240:13285");
__$coverInitRange("Plupload", "13840:13854");
__$coverInitRange("Plupload", "13859:14001");
__$coverInitRange("Plupload", "14006:14075");
__$coverInitRange("Plupload", "14080:14090");
__$coverInitRange("Plupload", "13907:13995");
__$coverInitRange("Plupload", "14022:14071");
__$coverInitRange("Plupload", "14356:14436");
__$coverInitRange("Plupload", "14441:14555");
__$coverInitRange("Plupload", "14560:14592");
__$coverInitRange("Plupload", "14605:14700");
__$coverInitRange("Plupload", "14713:14816");
__$coverInitRange("Plupload", "14829:14932");
__$coverInitRange("Plupload", "14945:15034");
__$coverInitRange("Plupload", "15039:15082");
__$coverInitRange("Plupload", "14400:14432");
__$coverInitRange("Plupload", "14477:14551");
__$coverInitRange("Plupload", "14631:14696");
__$coverInitRange("Plupload", "14747:14812");
__$coverInitRange("Plupload", "14863:14928");
__$coverInitRange("Plupload", "14967:15030");
__$coverInitRange("Plupload", "15781:15796");
__$coverInitRange("Plupload", "15801:15835");
__$coverInitRange("Plupload", "15839:15927");
__$coverInitRange("Plupload", "15931:15943");
__$coverInitRange("Plupload", "15947:15961");
__$coverInitRange("Plupload", "16565:16587");
__$coverInitRange("Plupload", "16665:16904");
__$coverInitRange("Plupload", "16724:16866");
__$coverInitRange("Plupload", "16870:16879");
__$coverInitRange("Plupload", "16893:16901");
__$coverInitRange("Plupload", "16983:16992");
__$coverInitRange("Plupload", "16996:17033");
__$coverInitRange("Plupload", "17059:17292");
__$coverInitRange("Plupload", "17122:17254");
__$coverInitRange("Plupload", "17258:17267");
__$coverInitRange("Plupload", "17281:17289");
__$coverInitRange("Plupload", "17374:17801");
__$coverInitRange("Plupload", "17804:17812");
__$coverInitRange("Plupload", "17389:17415");
__$coverInitRange("Plupload", "17419:17798");
__$coverInitRange("Plupload", "17530:17794");
__$coverInitRange("Plupload", "17612:17762");
__$coverInitRange("Plupload", "17768:17777");
__$coverInitRange("Plupload", "17783:17789");
__$coverInitRange("Plupload", "17888:18110");
__$coverInitRange("Plupload", "17940:18072");
__$coverInitRange("Plupload", "18076:18085");
__$coverInitRange("Plupload", "18099:18107");
__$coverInitRange("Plupload", "27396:27557");
__$coverInitRange("Plupload", "27558:27558");
__$coverInitRange("Plupload", "27583:28262");
__$coverInitRange("Plupload", "28267:28385");
__$coverInitRange("Plupload", "28390:29712");
__$coverInitRange("Plupload", "29717:29850");
__$coverInitRange("Plupload", "29855:30376");
__$coverInitRange("Plupload", "30381:33611");
__$coverInitRange("Plupload", "33616:34423");
__$coverInitRange("Plupload", "34428:38355");
__$coverInitRange("Plupload", "38388:38651");
__$coverInitRange("Plupload", "38656:44722");
__$coverInitRange("Plupload", "44727:44784");
__$coverInitRange("Plupload", "44789:45184");
__$coverInitRange("Plupload", "45189:45251");
__$coverInitRange("Plupload", "45256:45472");
__$coverInitRange("Plupload", "45477:46060");
__$coverInitRange("Plupload", "46065:46557");
__$coverInitRange("Plupload", "46583:47003");
__$coverInitRange("Plupload", "47008:47049");
__$coverInitRange("Plupload", "47076:47112");
__$coverInitRange("Plupload", "47139:59510");
__$coverInitRange("Plupload", "27611:27633");
__$coverInitRange("Plupload", "27638:28259");
__$coverInitRange("Plupload", "27708:28019");
__$coverInitRange("Plupload", "28060:28255");
__$coverInitRange("Plupload", "27749:28014");
__$coverInitRange("Plupload", "27805:27820");
__$coverInitRange("Plupload", "27827:27981");
__$coverInitRange("Plupload", "27902:27934");
__$coverInitRange("Plupload", "27942:27974");
__$coverInitRange("Plupload", "28001:28008");
__$coverInitRange("Plupload", "28093:28207");
__$coverInitRange("Plupload", "28213:28250");
__$coverInitRange("Plupload", "28137:28166");
__$coverInitRange("Plupload", "28173:28201");
__$coverInitRange("Plupload", "28295:28372");
__$coverInitRange("Plupload", "28376:28382");
__$coverInitRange("Plupload", "28410:28421");
__$coverInitRange("Plupload", "28425:28435");
__$coverInitRange("Plupload", "28439:28473");
__$coverInitRange("Plupload", "28495:28508");
__$coverInitRange("Plupload", "28562:29290");
__$coverInitRange("Plupload", "29388:29709");
__$coverInitRange("Plupload", "28602:28617");
__$coverInitRange("Plupload", "28623:29119");
__$coverInitRange("Plupload", "29125:29286");
__$coverInitRange("Plupload", "28709:28736");
__$coverInitRange("Plupload", "28878:28926");
__$coverInitRange("Plupload", "28933:29049");
__$coverInitRange("Plupload", "29056:29078");
__$coverInitRange("Plupload", "29007:29043");
__$coverInitRange("Plupload", "29096:29114");
__$coverInitRange("Plupload", "29165:29181");
__$coverInitRange("Plupload", "29235:29249");
__$coverInitRange("Plupload", "29267:29281");
__$coverInitRange("Plupload", "29419:29504");
__$coverInitRange("Plupload", "29520:29621");
__$coverInitRange("Plupload", "29626:29705");
__$coverInitRange("Plupload", "29740:29780");
__$coverInitRange("Plupload", "29784:29831");
__$coverInitRange("Plupload", "29835:29847");
__$coverInitRange("Plupload", "29799:29827");
__$coverInitRange("Plupload", "29889:29993");
__$coverInitRange("Plupload", "29998:30039");
__$coverInitRange("Plupload", "30044:30085");
__$coverInitRange("Plupload", "30090:30127");
__$coverInitRange("Plupload", "30132:30177");
__$coverInitRange("Plupload", "30182:30223");
__$coverInitRange("Plupload", "30228:30259");
__$coverInitRange("Plupload", "30264:30291");
__$coverInitRange("Plupload", "30296:30337");
__$coverInitRange("Plupload", "30342:30373");
__$coverInitRange("Plupload", "29944:29970");
__$coverInitRange("Plupload", "29975:29987");
__$coverInitRange("Plupload", "30421:30460");
__$coverInitRange("Plupload", "30486:30700");
__$coverInitRange("Plupload", "30746:30895");
__$coverInitRange("Plupload", "30949:32678");
__$coverInitRange("Plupload", "32710:33503");
__$coverInitRange("Plupload", "33509:33608");
__$coverInitRange("Plupload", "30819:30889");
__$coverInitRange("Plupload", "30848:30884");
__$coverInitRange("Plupload", "30982:32674");
__$coverInitRange("Plupload", "31039:32667");
__$coverInitRange("Plupload", "31070:31329");
__$coverInitRange("Plupload", "31337:31702");
__$coverInitRange("Plupload", "31710:31782");
__$coverInitRange("Plupload", "31790:32448");
__$coverInitRange("Plupload", "32456:32534");
__$coverInitRange("Plupload", "32542:32635");
__$coverInitRange("Plupload", "32643:32659");
__$coverInitRange("Plupload", "31376:31413");
__$coverInitRange("Plupload", "31458:31636");
__$coverInitRange("Plupload", "31645:31653");
__$coverInitRange("Plupload", "31661:31682");
__$coverInitRange("Plupload", "31690:31694");
__$coverInitRange("Plupload", "31750:31774");
__$coverInitRange("Plupload", "31868:32439");
__$coverInitRange("Plupload", "31892:32157");
__$coverInitRange("Plupload", "32167:32431");
__$coverInitRange("Plupload", "31936:32148");
__$coverInitRange("Plupload", "31976:32027");
__$coverInitRange("Plupload", "32084:32138");
__$coverInitRange("Plupload", "32212:32422");
__$coverInitRange("Plupload", "32251:32303");
__$coverInitRange("Plupload", "32357:32412");
__$coverInitRange("Plupload", "32503:32525");
__$coverInitRange("Plupload", "32598:32614");
__$coverInitRange("Plupload", "32622:32626");
__$coverInitRange("Plupload", "32742:33499");
__$coverInitRange("Plupload", "32798:33492");
__$coverInitRange("Plupload", "32829:32923");
__$coverInitRange("Plupload", "32931:33285");
__$coverInitRange("Plupload", "33293:33362");
__$coverInitRange("Plupload", "33370:33461");
__$coverInitRange("Plupload", "33469:33484");
__$coverInitRange("Plupload", "32969:33006");
__$coverInitRange("Plupload", "33051:33220");
__$coverInitRange("Plupload", "33229:33237");
__$coverInitRange("Plupload", "33245:33265");
__$coverInitRange("Plupload", "33273:33277");
__$coverInitRange("Plupload", "33330:33354");
__$coverInitRange("Plupload", "33425:33440");
__$coverInitRange("Plupload", "33448:33452");
__$coverInitRange("Plupload", "33550:33602");
__$coverInitRange("Plupload", "33587:33597");
__$coverInitRange("Plupload", "33675:33704");
__$coverInitRange("Plupload", "33709:34420");
__$coverInitRange("Plupload", "33718:34118");
__$coverInitRange("Plupload", "34124:34262");
__$coverInitRange("Plupload", "34268:34351");
__$coverInitRange("Plupload", "34357:34387");
__$coverInitRange("Plupload", "33786:34112");
__$coverInitRange("Plupload", "33951:33965");
__$coverInitRange("Plupload", "33972:33980");
__$coverInitRange("Plupload", "34027:34106");
__$coverInitRange("Plupload", "34156:34215");
__$coverInitRange("Plupload", "34221:34235");
__$coverInitRange("Plupload", "34241:34256");
__$coverInitRange("Plupload", "34316:34330");
__$coverInitRange("Plupload", "34336:34344");
__$coverInitRange("Plupload", "34408:34416");
__$coverInitRange("Plupload", "34472:34511");
__$coverInitRange("Plupload", "34516:37400");
__$coverInitRange("Plupload", "37405:37584");
__$coverInitRange("Plupload", "37589:38352");
__$coverInitRange("Plupload", "34562:34593");
__$coverInitRange("Plupload", "34599:37314");
__$coverInitRange("Plupload", "37320:37396");
__$coverInitRange("Plupload", "34648:34758");
__$coverInitRange("Plupload", "34765:34770");
__$coverInitRange("Plupload", "34688:34751");
__$coverInitRange("Plupload", "34801:34917");
__$coverInitRange("Plupload", "34924:34929");
__$coverInitRange("Plupload", "34848:34872");
__$coverInitRange("Plupload", "34880:34910");
__$coverInitRange("Plupload", "34959:34983");
__$coverInitRange("Plupload", "34990:35047");
__$coverInitRange("Plupload", "35054:35059");
__$coverInitRange("Plupload", "35010:35040");
__$coverInitRange("Plupload", "35091:35156");
__$coverInitRange("Plupload", "35163:35168");
__$coverInitRange("Plupload", "35201:35225");
__$coverInitRange("Plupload", "35232:35288");
__$coverInitRange("Plupload", "35295:35300");
__$coverInitRange("Plupload", "35251:35281");
__$coverInitRange("Plupload", "35371:35468");
__$coverInitRange("Plupload", "35476:35587");
__$coverInitRange("Plupload", "35681:36484");
__$coverInitRange("Plupload", "36491:36496");
__$coverInitRange("Plupload", "35419:35461");
__$coverInitRange("Plupload", "35494:35534");
__$coverInitRange("Plupload", "35556:35580");
__$coverInitRange("Plupload", "35711:35848");
__$coverInitRange("Plupload", "35857:36422");
__$coverInitRange("Plupload", "36431:36477");
__$coverInitRange("Plupload", "35772:35840");
__$coverInitRange("Plupload", "35911:35936");
__$coverInitRange("Plupload", "35946:36321");
__$coverInitRange("Plupload", "36331:36394");
__$coverInitRange("Plupload", "35996:36310");
__$coverInitRange("Plupload", "36065:36298");
__$coverInitRange("Plupload", "36105:36134");
__$coverInitRange("Plupload", "36164:36287");
__$coverInitRange("Plupload", "36523:36695");
__$coverInitRange("Plupload", "36702:36707");
__$coverInitRange("Plupload", "36542:36643");
__$coverInitRange("Plupload", "36665:36688");
__$coverInitRange("Plupload", "36746:36821");
__$coverInitRange("Plupload", "36828:36833");
__$coverInitRange("Plupload", "36960:37058");
__$coverInitRange("Plupload", "37059:37059");
__$coverInitRange("Plupload", "37174:37198");
__$coverInitRange("Plupload", "37205:37252");
__$coverInitRange("Plupload", "37259:37264");
__$coverInitRange("Plupload", "37224:37245");
__$coverInitRange("Plupload", "37285:37309");
__$coverInitRange("Plupload", "37337:37391");
__$coverInitRange("Plupload", "37443:37533");
__$coverInitRange("Plupload", "37495:37526");
__$coverInitRange("Plupload", "37549:37580");
__$coverInitRange("Plupload", "37654:37727");
__$coverInitRange("Plupload", "37831:37928");
__$coverInitRange("Plupload", "37964:37987");
__$coverInitRange("Plupload", "37993:38348");
__$coverInitRange("Plupload", "38050:38341");
__$coverInitRange("Plupload", "38069:38115");
__$coverInitRange("Plupload", "38122:38169");
__$coverInitRange("Plupload", "38176:38200");
__$coverInitRange("Plupload", "38220:38335");
__$coverInitRange("Plupload", "38464:38648");
__$coverInitRange("Plupload", "38499:38556");
__$coverInitRange("Plupload", "38561:38601");
__$coverInitRange("Plupload", "38606:38644");
__$coverInitRange("Plupload", "38580:38596");
__$coverInitRange("Plupload", "38692:38717");
__$coverInitRange("Plupload", "38721:38759");
__$coverInitRange("Plupload", "38763:38800");
__$coverInitRange("Plupload", "38804:38830");
__$coverInitRange("Plupload", "38834:38848");
__$coverInitRange("Plupload", "38852:38860");
__$coverInitRange("Plupload", "38865:39098");
__$coverInitRange("Plupload", "39151:39263");
__$coverInitRange("Plupload", "39268:39664");
__$coverInitRange("Plupload", "39669:40965");
__$coverInitRange("Plupload", "40970:44313");
__$coverInitRange("Plupload", "44319:44342");
__$coverInitRange("Plupload", "44375:44719");
__$coverInitRange("Plupload", "39173:39259");
__$coverInitRange("Plupload", "39296:39660");
__$coverInitRange("Plupload", "39321:39349");
__$coverInitRange("Plupload", "39367:39387");
__$coverInitRange("Plupload", "39416:39655");
__$coverInitRange("Plupload", "39701:39739");
__$coverInitRange("Plupload", "39825:39915");
__$coverInitRange("Plupload", "39977:40061");
__$coverInitRange("Plupload", "40067:40372");
__$coverInitRange("Plupload", "40481:40834");
__$coverInitRange("Plupload", "40840:40961");
__$coverInitRange("Plupload", "39904:39910");
__$coverInitRange("Plupload", "40015:40056");
__$coverInitRange("Plupload", "40190:40244");
__$coverInitRange("Plupload", "40250:40303");
__$coverInitRange("Plupload", "40321:40345");
__$coverInitRange("Plupload", "40351:40367");
__$coverInitRange("Plupload", "40557:40829");
__$coverInitRange("Plupload", "40599:40641");
__$coverInitRange("Plupload", "40648:40694");
__$coverInitRange("Plupload", "40774:40794");
__$coverInitRange("Plupload", "40801:40823");
__$coverInitRange("Plupload", "40914:40956");
__$coverInitRange("Plupload", "41027:41039");
__$coverInitRange("Plupload", "41045:41077");
__$coverInitRange("Plupload", "41124:41294");
__$coverInitRange("Plupload", "41300:42906");
__$coverInitRange("Plupload", "42912:42962");
__$coverInitRange("Plupload", "42968:43021");
__$coverInitRange("Plupload", "43057:44309");
__$coverInitRange("Plupload", "41146:41289");
__$coverInitRange("Plupload", "41189:41241");
__$coverInitRange("Plupload", "41248:41282");
__$coverInitRange("Plupload", "41373:41455");
__$coverInitRange("Plupload", "41462:41495");
__$coverInitRange("Plupload", "41552:42229");
__$coverInitRange("Plupload", "42236:42263");
__$coverInitRange("Plupload", "42318:42900");
__$coverInitRange("Plupload", "41423:41436");
__$coverInitRange("Plupload", "41443:41449");
__$coverInitRange("Plupload", "41589:41608");
__$coverInitRange("Plupload", "41616:41638");
__$coverInitRange("Plupload", "41645:41686");
__$coverInitRange("Plupload", "41694:41903");
__$coverInitRange("Plupload", "42016:42180");
__$coverInitRange("Plupload", "42139:42173");
__$coverInitRange("Plupload", "42200:42223");
__$coverInitRange("Plupload", "42408:42488");
__$coverInitRange("Plupload", "42496:42530");
__$coverInitRange("Plupload", "42538:42565");
__$coverInitRange("Plupload", "42572:42608");
__$coverInitRange("Plupload", "42616:42771");
__$coverInitRange("Plupload", "42448:42462");
__$coverInitRange("Plupload", "42470:42481");
__$coverInitRange("Plupload", "42817:42842");
__$coverInitRange("Plupload", "42943:42956");
__$coverInitRange("Plupload", "43001:43015");
__$coverInitRange("Plupload", "43112:43156");
__$coverInitRange("Plupload", "43189:43294");
__$coverInitRange("Plupload", "43301:43332");
__$coverInitRange("Plupload", "43367:43531");
__$coverInitRange("Plupload", "43566:43620");
__$coverInitRange("Plupload", "43626:43660");
__$coverInitRange("Plupload", "43253:43286");
__$coverInitRange("Plupload", "43495:43523");
__$coverInitRange("Plupload", "43724:43849");
__$coverInitRange("Plupload", "43856:43900");
__$coverInitRange("Plupload", "43933:44038");
__$coverInitRange("Plupload", "44118:44262");
__$coverInitRange("Plupload", "44269:44304");
__$coverInitRange("Plupload", "43997:44030");
__$coverInitRange("Plupload", "44168:44232");
__$coverInitRange("Plupload", "44518:44682");
__$coverInitRange("Plupload", "44600:44618");
__$coverInitRange("Plupload", "44624:44652");
__$coverInitRange("Plupload", "44658:44675");
__$coverInitRange("Plupload", "44698:44715");
__$coverInitRange("Plupload", "44767:44781");
__$coverInitRange("Plupload", "44821:45181");
__$coverInitRange("Plupload", "44898:44923");
__$coverInitRange("Plupload", "45011:45177");
__$coverInitRange("Plupload", "45064:45172");
__$coverInitRange("Plupload", "45117:45153");
__$coverInitRange("Plupload", "45160:45166");
__$coverInitRange("Plupload", "45219:45248");
__$coverInitRange("Plupload", "45233:45244");
__$coverInitRange("Plupload", "45288:45294");
__$coverInitRange("Plupload", "45419:45469");
__$coverInitRange("Plupload", "45441:45460");
__$coverInitRange("Plupload", "45507:46057");
__$coverInitRange("Plupload", "45550:45562");
__$coverInitRange("Plupload", "45671:45704");
__$coverInitRange("Plupload", "45709:45749");
__$coverInitRange("Plupload", "45754:45772");
__$coverInitRange("Plupload", "45900:46053");
__$coverInitRange("Plupload", "45962:45988");
__$coverInitRange("Plupload", "45994:46048");
__$coverInitRange("Plupload", "46018:46037");
__$coverInitRange("Plupload", "46092:46101");
__$coverInitRange("Plupload", "46127:46188");
__$coverInitRange("Plupload", "46192:46202");
__$coverInitRange("Plupload", "46207:46337");
__$coverInitRange("Plupload", "46342:46467");
__$coverInitRange("Plupload", "46472:46491");
__$coverInitRange("Plupload", "46495:46511");
__$coverInitRange("Plupload", "46515:46537");
__$coverInitRange("Plupload", "46541:46554");
__$coverInitRange("Plupload", "46168:46182");
__$coverInitRange("Plupload", "46235:46313");
__$coverInitRange("Plupload", "46318:46333");
__$coverInitRange("Plupload", "46287:46306");
__$coverInitRange("Plupload", "46369:46444");
__$coverInitRange("Plupload", "46449:46463");
__$coverInitRange("Plupload", "46419:46437");
__$coverInitRange("Plupload", "48693:48730");
__$coverInitRange("Plupload", "48736:48774");
__$coverInitRange("Plupload", "48779:48945");
__$coverInitRange("Plupload", "48951:48980");
__$coverInitRange("Plupload", "49019:49314");
__$coverInitRange("Plupload", "49320:49373");
__$coverInitRange("Plupload", "49380:49608");
__$coverInitRange("Plupload", "49615:50182");
__$coverInitRange("Plupload", "48823:48839");
__$coverInitRange("Plupload", "48857:48940");
__$coverInitRange("Plupload", "48911:48932");
__$coverInitRange("Plupload", "49100:49307");
__$coverInitRange("Plupload", "49140:49288");
__$coverInitRange("Plupload", "49289:49301");
__$coverInitRange("Plupload", "49335:49368");
__$coverInitRange("Plupload", "49441:49603");
__$coverInitRange("Plupload", "49672:49708");
__$coverInitRange("Plupload", "49714:49877");
__$coverInitRange("Plupload", "49884:50175");
__$coverInitRange("Plupload", "49756:49769");
__$coverInitRange("Plupload", "49789:49871");
__$coverInitRange("Plupload", "49841:49862");
__$coverInitRange("Plupload", "49903:49949");
__$coverInitRange("Plupload", "49956:50003");
__$coverInitRange("Plupload", "50010:50034");
__$coverInitRange("Plupload", "50054:50169");
__$coverInitRange("Plupload", "50521:50571");
__$coverInitRange("Plupload", "50931:50970");
__$coverInitRange("Plupload", "50975:50998");
__$coverInitRange("Plupload", "50950:50965");
__$coverInitRange("Plupload", "51235:51358");
__$coverInitRange("Plupload", "51363:51386");
__$coverInitRange("Plupload", "51264:51353");
__$coverInitRange("Plupload", "51317:51345");
__$coverInitRange("Plupload", "51498:51640");
__$coverInitRange("Plupload", "51540:51569");
__$coverInitRange("Plupload", "51575:51603");
__$coverInitRange("Plupload", "51610:51635");
__$coverInitRange("Plupload", "51751:51895");
__$coverInitRange("Plupload", "51793:51822");
__$coverInitRange("Plupload", "51828:51856");
__$coverInitRange("Plupload", "51862:51890");
__$coverInitRange("Plupload", "52105:52160");
__$coverInitRange("Plupload", "52166:52288");
__$coverInitRange("Plupload", "52294:52333");
__$coverInitRange("Plupload", "52195:52283");
__$coverInitRange("Plupload", "52248:52275");
__$coverInitRange("Plupload", "52574:52579");
__$coverInitRange("Plupload", "52584:52687");
__$coverInitRange("Plupload", "52630:52682");
__$coverInitRange("Plupload", "52661:52676");
__$coverInitRange("Plupload", "53225:53290");
__$coverInitRange("Plupload", "53291:53291");
__$coverInitRange("Plupload", "53297:53630");
__$coverInitRange("Plupload", "53786:55529");
__$coverInitRange("Plupload", "55535:55551");
__$coverInitRange("Plupload", "55557:55574");
__$coverInitRange("Plupload", "55580:55799");
__$coverInitRange("Plupload", "53333:53347");
__$coverInitRange("Plupload", "53353:53591");
__$coverInitRange("Plupload", "53597:53625");
__$coverInitRange("Plupload", "53418:53583");
__$coverInitRange("Plupload", "53449:53576");
__$coverInitRange("Plupload", "53482:53566");
__$coverInitRange("Plupload", "53547:53555");
__$coverInitRange("Plupload", "53819:53851");
__$coverInitRange("Plupload", "53881:55524");
__$coverInitRange("Plupload", "53921:54085");
__$coverInitRange("Plupload", "54092:54128");
__$coverInitRange("Plupload", "53967:54021");
__$coverInitRange("Plupload", "54029:54045");
__$coverInitRange("Plupload", "54053:54078");
__$coverInitRange("Plupload", "54001:54013");
__$coverInitRange("Plupload", "54208:54237");
__$coverInitRange("Plupload", "54244:54258");
__$coverInitRange("Plupload", "54370:54419");
__$coverInitRange("Plupload", "54427:54948");
__$coverInitRange("Plupload", "54392:54412");
__$coverInitRange("Plupload", "54526:54939");
__$coverInitRange("Plupload", "54566:54840");
__$coverInitRange("Plupload", "54849:54861");
__$coverInitRange("Plupload", "54670:54686");
__$coverInitRange("Plupload", "54765:54786");
__$coverInitRange("Plupload", "54797:54831");
__$coverInitRange("Plupload", "55052:55092");
__$coverInitRange("Plupload", "55259:55297");
__$coverInitRange("Plupload", "55397:55412");
__$coverInitRange("Plupload", "55486:55518");
__$coverInitRange("Plupload", "55604:55794");
__$coverInitRange("Plupload", "55710:55786");
__$coverInitRange("Plupload", "55741:55779");
__$coverInitRange("Plupload", "55980:56031");
__$coverInitRange("Plupload", "56037:56156");
__$coverInitRange("Plupload", "56087:56151");
__$coverInitRange("Plupload", "56118:56145");
__$coverInitRange("Plupload", "56618:56715");
__$coverInitRange("Plupload", "56807:56834");
__$coverInitRange("Plupload", "56839:57176");
__$coverInitRange("Plupload", "57182:57219");
__$coverInitRange("Plupload", "57278:57343");
__$coverInitRange("Plupload", "57349:57393");
__$coverInitRange("Plupload", "57399:57413");
__$coverInitRange("Plupload", "56903:57119");
__$coverInitRange("Plupload", "57126:57171");
__$coverInitRange("Plupload", "56948:57111");
__$coverInitRange("Plupload", "56996:57018");
__$coverInitRange("Plupload", "57092:57104");
__$coverInitRange("Plupload", "57154:57165");
__$coverInitRange("Plupload", "57322:57336");
__$coverInitRange("Plupload", "57376:57388");
__$coverInitRange("Plupload", "57753:57775");
__$coverInitRange("Plupload", "57781:57806");
__$coverInitRange("Plupload", "57812:57846");
__$coverInitRange("Plupload", "57852:58307");
__$coverInitRange("Plupload", "58312:58323");
__$coverInitRange("Plupload", "57903:57964");
__$coverInitRange("Plupload", "58038:58069");
__$coverInitRange("Plupload", "58075:58087");
__$coverInitRange("Plupload", "58093:58111");
__$coverInitRange("Plupload", "58118:58302");
__$coverInitRange("Plupload", "57930:57960");
__$coverInitRange("Plupload", "58216:58296");
__$coverInitRange("Plupload", "58277:58289");
__$coverInitRange("Plupload", "58961:59031");
__$coverInitRange("Plupload", "59402:59425");
__$coverInitRange("Plupload", "59430:59453");
__$coverInitRange("Plupload", "59485:59501");
__$coverInitRange("Plupload", "59832:59849");
__$coverInitRange("Plupload", "59853:62825");
__$coverInitRange("Plupload", "62829:62848");
__$coverInitRange("Plupload", "59886:62793");
__$coverInitRange("Plupload", "62798:62822");
__$coverInitRange("Plupload", "61972:62011");
__$coverInitRange("Plupload", "62017:62102");
__$coverInitRange("Plupload", "62305:62353");
__$coverInitRange("Plupload", "62359:62383");
__$coverInitRange("Plupload", "62336:62347");
__$coverInitRange("Plupload", "62457:62558");
__$coverInitRange("Plupload", "62684:62710");
__$coverInitRange("Plupload", "62716:62782");
__$coverInitRange("Plupload", "62732:62745");
__$coverInitRange("Plupload", "62752:62776");
__$coverInitRange("Plupload", "62981:62996");
__$coverInitRange("Plupload", "63142:63155");
__$coverInitRange("Plupload", "63237:63252");
__$coverInitRange("Plupload", "63340:63357");
__$coverInitRange("Plupload", "63451:63466");
__$coverInitRange("Plupload", "63562:63577");
__$coverInitRange("Plupload", "63675:63691");
__$coverInitRange("Plupload", "63783:63803");
__$coverInitRange("Plupload", "63886:64023");
__$coverInitRange("Plupload", "63914:64019");
__$coverCall('Plupload', '199:199');
;
__$coverCall('Plupload', '200:64074');
(function (exports, o, undef) {
    __$coverCall('Plupload', '232:261');
    var delay = window.setTimeout;
    __$coverCall('Plupload', '263:283');
    var fileFilters = {};
    __$coverCall('Plupload', '285:305');
    var u = o.core.utils;
    __$coverCall('Plupload', '307:338');
    var Runtime = o.runtime.Runtime;
    __$coverCall('Plupload', '398:1931');
    function normalizeCaps(settings) {
        __$coverCall('Plupload', '434:486');
        var features = settings.required_features, caps = {};
        __$coverCall('Plupload', '490:1153');
        function resolve(feature, value, strict) {
            __$coverCall('Plupload', '638:1042');
            var map = {
                    chunks: 'slice_blob',
                    jpgresize: 'send_binary_string',
                    pngresize: 'send_binary_string',
                    progress: 'report_upload_progress',
                    multi_selection: 'select_multiple',
                    dragdrop: 'drag_and_drop',
                    drop_element: 'drag_and_drop',
                    headers: 'send_custom_headers',
                    urlstream_upload: 'send_binary_string',
                    canSendBinary: 'send_binary',
                    triggerDialog: 'summon_file_dialog'
                };
            __$coverCall('Plupload', '1047:1150');
            if (map[feature]) {
                __$coverCall('Plupload', '1070:1096');
                caps[map[feature]] = value;
            } else if (!strict) {
                __$coverCall('Plupload', '1125:1146');
                caps[feature] = value;
            }
        }
        __$coverCall('Plupload', '1157:1914');
        if (typeof features === 'string') {
            __$coverCall('Plupload', '1196:1288');
            plupload.each(features.split(/\s*,\s*/), function (feature) {
                __$coverCall('Plupload', '1260:1282');
                resolve(feature, true);
            });
        } else if (typeof features === 'object') {
            __$coverCall('Plupload', '1337:1420');
            plupload.each(features, function (value, feature) {
                __$coverCall('Plupload', '1391:1414');
                resolve(feature, value);
            });
        } else if (features === true) {
            __$coverCall('Plupload', '1499:1582');
            if (settings.chunk_size && settings.chunk_size > 0) {
                __$coverCall('Plupload', '1556:1578');
                caps.slice_blob = true;
            }
            __$coverCall('Plupload', '1587:1701');
            if (!plupload.isEmptyObj(settings.resize) || settings.multipart === false) {
                __$coverCall('Plupload', '1667:1697');
                caps.send_binary_string = true;
            }
            __$coverCall('Plupload', '1706:1799');
            if (settings.http_method) {
                __$coverCall('Plupload', '1746:1789');
                caps.use_http_method = settings.http_method;
            }
            __$coverCall('Plupload', '1804:1911');
            plupload.each(settings, function (value, feature) {
                __$coverCall('Plupload', '1858:1889');
                resolve(feature, !!value, true);
            });
        }
        __$coverCall('Plupload', '1918:1929');
        return caps;
    }
    __$coverCall('Plupload', '1973:16593');
    var plupload = {
            VERSION: '@@version@@',
            STOPPED: 1,
            STARTED: 2,
            QUEUED: 1,
            UPLOADING: 2,
            FAILED: 4,
            DONE: 5,
            GENERIC_ERROR: -100,
            HTTP_ERROR: -200,
            IO_ERROR: -300,
            SECURITY_ERROR: -400,
            INIT_ERROR: -500,
            FILE_SIZE_ERROR: -600,
            FILE_EXTENSION_ERROR: -601,
            FILE_DUPLICATE_ERROR: -602,
            IMAGE_FORMAT_ERROR: -700,
            MEMORY_ERROR: -701,
            IMAGE_DIMENSIONS_ERROR: -702,
            moxie: o,
            mimeTypes: u.Mime.mimes,
            ua: u.Env,
            typeOf: u.Basic.typeOf,
            extend: u.Basic.extend,
            guid: u.Basic.guid,
            getAll: function get(ids) {
                __$coverCall('Plupload', '6553:6569');
                var els = [], el;
                __$coverCall('Plupload', '6574:6632');
                if (plupload.typeOf(ids) !== 'array') {
                    __$coverCall('Plupload', '6617:6628');
                    ids = [ids];
                }
                __$coverCall('Plupload', '6637:6655');
                var i = ids.length;
                __$coverCall('Plupload', '6659:6741');
                while (i--) {
                    __$coverCall('Plupload', '6676:6701');
                    el = plupload.get(ids[i]);
                    __$coverCall('Plupload', '6706:6737');
                    if (el) {
                        __$coverCall('Plupload', '6720:6732');
                        els.push(el);
                    }
                }
                __$coverCall('Plupload', '6746:6776');
                return els.length ? els : null;
            },
            get: u.Dom.get,
            each: u.Basic.each,
            getPos: u.Dom.getPos,
            getSize: u.Dom.getSize,
            xmlEncode: function (str) {
                __$coverCall('Plupload', '8071:8189');
                var xmlEncodeChars = {
                        '<': 'lt',
                        '>': 'gt',
                        '&': 'amp',
                        '"': 'quot',
                        '\'': '#39'
                    }, xmlEncodeRegExp = /[<>&\"\']/g;
                __$coverCall('Plupload', '8194:8340');
                return str ? ('' + str).replace(xmlEncodeRegExp, function (chr) {
                    __$coverCall('Plupload', '8262:8328');
                    return xmlEncodeChars[chr] ? '&' + xmlEncodeChars[chr] + ';' : chr;
                }) : str;
            },
            toArray: u.Basic.toArray,
            inArray: u.Basic.inArray,
            inSeries: u.Basic.inSeries,
            addI18n: o.core.I18n.addI18n,
            translate: o.core.I18n.translate,
            sprintf: u.Basic.sprintf,
            isEmptyObj: u.Basic.isEmptyObj,
            hasClass: u.Dom.hasClass,
            addClass: u.Dom.addClass,
            removeClass: u.Dom.removeClass,
            getStyle: u.Dom.getStyle,
            addEvent: u.Events.addEvent,
            removeEvent: u.Events.removeEvent,
            removeAllEvents: u.Events.removeAllEvents,
            cleanName: function (name) {
                __$coverCall('Plupload', '12849:12862');
                var i, lookup;
                __$coverCall('Plupload', '12891:13191');
                lookup = [
                    /[\300-\306]/g,
                    'A',
                    /[\340-\346]/g,
                    'a',
                    /\307/g,
                    'C',
                    /\347/g,
                    'c',
                    /[\310-\313]/g,
                    'E',
                    /[\350-\353]/g,
                    'e',
                    /[\314-\317]/g,
                    'I',
                    /[\354-\357]/g,
                    'i',
                    /\321/g,
                    'N',
                    /\361/g,
                    'n',
                    /[\322-\330]/g,
                    'O',
                    /[\362-\370]/g,
                    'o',
                    /[\331-\334]/g,
                    'U',
                    /[\371-\374]/g,
                    'u'
                ];
                __$coverCall('Plupload', '13196:13289');
                for (i = 0; i < lookup.length; i += 2) {
                    __$coverCall('Plupload', '13240:13285');
                    name = name.replace(lookup[i], lookup[i + 1]);
                }
                __$coverCall('Plupload', '13318:13350');
                name = name.replace(/\s+/g, '_');
                __$coverCall('Plupload', '13381:13425');
                name = name.replace(/[^a-z0-9_\-\.]+/gi, '');
                __$coverCall('Plupload', '13430:13441');
                return name;
            },
            buildUrl: function (url, items) {
                __$coverCall('Plupload', '13840:13854');
                var query = '';
                __$coverCall('Plupload', '13859:14001');
                plupload.each(items, function (value, name) {
                    __$coverCall('Plupload', '13907:13995');
                    query += (query ? '&' : '') + encodeURIComponent(name) + '=' + encodeURIComponent(value);
                });
                __$coverCall('Plupload', '14006:14075');
                if (query) {
                    __$coverCall('Plupload', '14022:14071');
                    url += (url.indexOf('?') > 0 ? '&' : '?') + query;
                }
                __$coverCall('Plupload', '14080:14090');
                return url;
            },
            formatSize: function (size) {
                __$coverCall('Plupload', '14356:14436');
                if (size === undef || /\D/.test(size)) {
                    __$coverCall('Plupload', '14400:14432');
                    return plupload.translate('N/A');
                }
                __$coverCall('Plupload', '14441:14555');
                function round(num, precision) {
                    __$coverCall('Plupload', '14477:14551');
                    return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
                }
                __$coverCall('Plupload', '14560:14592');
                var boundary = Math.pow(1024, 4);
                __$coverCall('Plupload', '14605:14700');
                if (size > boundary) {
                    __$coverCall('Plupload', '14631:14696');
                    return round(size / boundary, 1) + ' ' + plupload.translate('tb');
                }
                __$coverCall('Plupload', '14713:14816');
                if (size > (boundary /= 1024)) {
                    __$coverCall('Plupload', '14747:14812');
                    return round(size / boundary, 1) + ' ' + plupload.translate('gb');
                }
                __$coverCall('Plupload', '14829:14932');
                if (size > (boundary /= 1024)) {
                    __$coverCall('Plupload', '14863:14928');
                    return round(size / boundary, 1) + ' ' + plupload.translate('mb');
                }
                __$coverCall('Plupload', '14945:15034');
                if (size > 1024) {
                    __$coverCall('Plupload', '14967:15030');
                    return Math.round(size / 1024) + ' ' + plupload.translate('kb');
                }
                __$coverCall('Plupload', '15039:15082');
                return size + ' ' + plupload.translate('b');
            },
            parseSize: u.Basic.parseSizeStr,
            predictRuntime: function (config, runtimes) {
                __$coverCall('Plupload', '15781:15796');
                var up, runtime;
                __$coverCall('Plupload', '15801:15835');
                up = new plupload.Uploader(config);
                __$coverCall('Plupload', '15839:15927');
                runtime = Runtime.thatCan(up.getOption().required_features, runtimes || config.runtimes);
                __$coverCall('Plupload', '15931:15943');
                up.destroy();
                __$coverCall('Plupload', '15947:15961');
                return runtime;
            },
            addFileFilter: function (name, cb) {
                __$coverCall('Plupload', '16565:16587');
                fileFilters[name] = cb;
            }
        };
    __$coverCall('Plupload', '16597:16908');
    plupload.addFileFilter('mime_types', function (filters, file, cb) {
        __$coverCall('Plupload', '16665:16904');
        if (filters.length && !filters.regexp.test(file.name)) {
            __$coverCall('Plupload', '16724:16866');
            this.trigger('Error', {
                code: plupload.FILE_EXTENSION_ERROR,
                message: plupload.translate('File extension error.'),
                file: file
            });
            __$coverCall('Plupload', '16870:16879');
            cb(false);
        } else {
            __$coverCall('Plupload', '16893:16901');
            cb(true);
        }
    });
    __$coverCall('Plupload', '16912:17296');
    plupload.addFileFilter('max_file_size', function (maxSize, file, cb) {
        __$coverCall('Plupload', '16983:16992');
        var undef;
        __$coverCall('Plupload', '16996:17033');
        maxSize = plupload.parseSize(maxSize);
        __$coverCall('Plupload', '17059:17292');
        if (file.size !== undef && maxSize && file.size > maxSize) {
            __$coverCall('Plupload', '17122:17254');
            this.trigger('Error', {
                code: plupload.FILE_SIZE_ERROR,
                message: plupload.translate('File size error.'),
                file: file
            });
            __$coverCall('Plupload', '17258:17267');
            cb(false);
        } else {
            __$coverCall('Plupload', '17281:17289');
            cb(true);
        }
    });
    __$coverCall('Plupload', '17300:17816');
    plupload.addFileFilter('prevent_duplicates', function (value, file, cb) {
        __$coverCall('Plupload', '17374:17801');
        if (value) {
            __$coverCall('Plupload', '17389:17415');
            var ii = this.files.length;
            __$coverCall('Plupload', '17419:17798');
            while (ii--) {
                __$coverCall('Plupload', '17530:17794');
                if (file.name === this.files[ii].name && file.size === this.files[ii].size) {
                    __$coverCall('Plupload', '17612:17762');
                    this.trigger('Error', {
                        code: plupload.FILE_DUPLICATE_ERROR,
                        message: plupload.translate('Duplicate file error.'),
                        file: file
                    });
                    __$coverCall('Plupload', '17768:17777');
                    cb(false);
                    __$coverCall('Plupload', '17783:17789');
                    return;
                }
            }
        }
        __$coverCall('Plupload', '17804:17812');
        cb(true);
    });
    __$coverCall('Plupload', '17819:18114');
    plupload.addFileFilter('prevent_empty', function (value, file, cb) {
        __$coverCall('Plupload', '17888:18110');
        if (value && !file.size && file.size !== undef) {
            __$coverCall('Plupload', '17940:18072');
            this.trigger('Error', {
                code: plupload.FILE_SIZE_ERROR,
                message: plupload.translate('File size error.'),
                file: file
            });
            __$coverCall('Plupload', '18076:18085');
            cb(false);
        } else {
            __$coverCall('Plupload', '18099:18107');
            cb(true);
        }
    });
    __$coverCall('Plupload', '22125:59513');
    plupload.Uploader = function (options) {
        __$coverCall('Plupload', '27396:27557');
        var uid = plupload.guid(), settings, files = [], preferred_caps = {}, fileInputs = [], fileDrops = [], startTime, total, disabled = false, xhr;
        __$coverCall('Plupload', '27558:27558');
        ;
        __$coverCall('Plupload', '27583:28262');
        function uploadNext(id) {
            __$coverCall('Plupload', '27611:27633');
            var file, count = 0, i;
            __$coverCall('Plupload', '27638:28259');
            if (this.state == plupload.STARTED) {
                __$coverCall('Plupload', '27708:28019');
                for (i = 0; i < files.length; i++) {
                    __$coverCall('Plupload', '27749:28014');
                    if (!file && files[i].status == plupload.QUEUED) {
                        __$coverCall('Plupload', '27805:27820');
                        file = files[i];
                        __$coverCall('Plupload', '27827:27981');
                        if ((!id || id === file.id) && this.trigger('BeforeUpload', file)) {
                            __$coverCall('Plupload', '27902:27934');
                            file.status = plupload.UPLOADING;
                            __$coverCall('Plupload', '27942:27974');
                            this.trigger('UploadFile', file);
                        }
                    } else {
                        __$coverCall('Plupload', '28001:28008');
                        count++;
                    }
                }
                __$coverCall('Plupload', '28060:28255');
                if (count == files.length) {
                    __$coverCall('Plupload', '28093:28207');
                    if (this.state !== plupload.STOPPED) {
                        __$coverCall('Plupload', '28137:28166');
                        this.state = plupload.STOPPED;
                        __$coverCall('Plupload', '28173:28201');
                        this.trigger('StateChanged');
                    }
                    __$coverCall('Plupload', '28213:28250');
                    this.trigger('UploadComplete', files);
                }
            }
        }
        __$coverCall('Plupload', '28267:28385');
        function calcFile(file) {
            __$coverCall('Plupload', '28295:28372');
            file.percent = file.size > 0 ? Math.ceil(file.loaded / file.size * 100) : 100;
            __$coverCall('Plupload', '28376:28382');
            calc();
        }
        __$coverCall('Plupload', '28390:29712');
        function calc() {
            __$coverCall('Plupload', '28410:28421');
            var i, file;
            __$coverCall('Plupload', '28425:28435');
            var loaded;
            __$coverCall('Plupload', '28439:28473');
            var loadedDuringCurrentSession = 0;
            __$coverCall('Plupload', '28495:28508');
            total.reset();
            __$coverCall('Plupload', '28562:29290');
            for (i = 0; i < files.length; i++) {
                __$coverCall('Plupload', '28602:28617');
                file = files[i];
                __$coverCall('Plupload', '28623:29119');
                if (file.size !== undef) {
                    __$coverCall('Plupload', '28709:28736');
                    total.size += file.origSize;
                    __$coverCall('Plupload', '28878:28926');
                    loaded = file.loaded * file.origSize / file.size;
                    __$coverCall('Plupload', '28933:29049');
                    if (!file.completeTimestamp || file.completeTimestamp > startTime) {
                        __$coverCall('Plupload', '29007:29043');
                        loadedDuringCurrentSession += loaded;
                    }
                    __$coverCall('Plupload', '29056:29078');
                    total.loaded += loaded;
                } else {
                    __$coverCall('Plupload', '29096:29114');
                    total.size = undef;
                }
                __$coverCall('Plupload', '29125:29286');
                if (file.status == plupload.DONE) {
                    __$coverCall('Plupload', '29165:29181');
                    total.uploaded++;
                } else if (file.status == plupload.FAILED) {
                    __$coverCall('Plupload', '29235:29249');
                    total.failed++;
                } else {
                    __$coverCall('Plupload', '29267:29281');
                    total.queued++;
                }
            }
            __$coverCall('Plupload', '29388:29709');
            if (total.size === undef) {
                __$coverCall('Plupload', '29419:29504');
                total.percent = files.length > 0 ? Math.ceil(total.uploaded / files.length * 100) : 0;
            } else {
                __$coverCall('Plupload', '29520:29621');
                total.bytesPerSec = Math.ceil(loadedDuringCurrentSession / ((+new Date() - startTime || 1) / 1000));
                __$coverCall('Plupload', '29626:29705');
                total.percent = total.size > 0 ? Math.ceil(total.loaded / total.size * 100) : 0;
            }
        }
        __$coverCall('Plupload', '29717:29850');
        function getRUID() {
            __$coverCall('Plupload', '29740:29780');
            var ctrl = fileInputs[0] || fileDrops[0];
            __$coverCall('Plupload', '29784:29831');
            if (ctrl) {
                __$coverCall('Plupload', '29799:29827');
                return ctrl.getRuntime().uid;
            }
            __$coverCall('Plupload', '29835:29847');
            return false;
        }
        __$coverCall('Plupload', '29855:30376');
        function bindEventListeners() {
            __$coverCall('Plupload', '29889:29993');
            this.bind('FilesAdded FilesRemoved', function (up) {
                __$coverCall('Plupload', '29944:29970');
                up.trigger('QueueChanged');
                __$coverCall('Plupload', '29975:29987');
                up.refresh();
            });
            __$coverCall('Plupload', '29998:30039');
            this.bind('CancelUpload', onCancelUpload);
            __$coverCall('Plupload', '30044:30085');
            this.bind('BeforeUpload', onBeforeUpload);
            __$coverCall('Plupload', '30090:30127');
            this.bind('UploadFile', onUploadFile);
            __$coverCall('Plupload', '30132:30177');
            this.bind('UploadProgress', onUploadProgress);
            __$coverCall('Plupload', '30182:30223');
            this.bind('StateChanged', onStateChanged);
            __$coverCall('Plupload', '30228:30259');
            this.bind('QueueChanged', calc);
            __$coverCall('Plupload', '30264:30291');
            this.bind('Error', onError);
            __$coverCall('Plupload', '30296:30337');
            this.bind('FileUploaded', onFileUploaded);
            __$coverCall('Plupload', '30342:30373');
            this.bind('Destroy', onDestroy);
        }
        __$coverCall('Plupload', '30381:33611');
        function initControls(settings, cb) {
            __$coverCall('Plupload', '30421:30460');
            var self = this, inited = 0, queue = [];
            __$coverCall('Plupload', '30486:30700');
            var options = {
                    runtime_order: settings.runtimes,
                    required_caps: settings.required_features,
                    preferred_caps: preferred_caps,
                    swf_url: settings.flash_swf_url,
                    xap_url: settings.silverlight_xap_url
                };
            __$coverCall('Plupload', '30746:30895');
            plupload.each(settings.runtimes.split(/\s*,\s*/), function (runtime) {
                __$coverCall('Plupload', '30819:30889');
                if (settings[runtime]) {
                    __$coverCall('Plupload', '30848:30884');
                    options[runtime] = settings[runtime];
                }
            });
            __$coverCall('Plupload', '30949:32678');
            if (settings.browse_button) {
                __$coverCall('Plupload', '30982:32674');
                plupload.each(settings.browse_button, function (el) {
                    __$coverCall('Plupload', '31039:32667');
                    queue.push(function (cb) {
                        __$coverCall('Plupload', '31070:31329');
                        var fileInput = new o.file.FileInput(plupload.extend({}, options, {
                                accept: settings.filters.mime_types,
                                name: settings.file_data_name,
                                multiple: settings.multi_selection,
                                container: settings.container,
                                browse_button: el
                            }));
                        __$coverCall('Plupload', '31337:31702');
                        fileInput.onready = function () {
                            __$coverCall('Plupload', '31376:31413');
                            var info = Runtime.getInfo(this.ruid);
                            __$coverCall('Plupload', '31458:31636');
                            plupload.extend(self.features, {
                                chunks: info.can('slice_blob'),
                                multipart: info.can('send_multipart'),
                                multi_selection: info.can('select_multiple')
                            });
                            __$coverCall('Plupload', '31645:31653');
                            inited++;
                            __$coverCall('Plupload', '31661:31682');
                            fileInputs.push(this);
                            __$coverCall('Plupload', '31690:31694');
                            cb();
                        };
                        __$coverCall('Plupload', '31710:31782');
                        fileInput.onchange = function () {
                            __$coverCall('Plupload', '31750:31774');
                            self.addFile(this.files);
                        };
                        __$coverCall('Plupload', '31790:32448');
                        fileInput.bind('mouseenter mouseleave mousedown mouseup', function (e) {
                            __$coverCall('Plupload', '31868:32439');
                            if (!disabled) {
                                __$coverCall('Plupload', '31892:32157');
                                if (settings.browse_button_hover) {
                                    __$coverCall('Plupload', '31936:32148');
                                    if ('mouseenter' === e.type) {
                                        __$coverCall('Plupload', '31976:32027');
                                        plupload.addClass(el, settings.browse_button_hover);
                                    } else if ('mouseleave' === e.type) {
                                        __$coverCall('Plupload', '32084:32138');
                                        plupload.removeClass(el, settings.browse_button_hover);
                                    }
                                }
                                __$coverCall('Plupload', '32167:32431');
                                if (settings.browse_button_active) {
                                    __$coverCall('Plupload', '32212:32422');
                                    if ('mousedown' === e.type) {
                                        __$coverCall('Plupload', '32251:32303');
                                        plupload.addClass(el, settings.browse_button_active);
                                    } else if ('mouseup' === e.type) {
                                        __$coverCall('Plupload', '32357:32412');
                                        plupload.removeClass(el, settings.browse_button_active);
                                    }
                                }
                            }
                        });
                        __$coverCall('Plupload', '32456:32534');
                        fileInput.bind('mousedown', function () {
                            __$coverCall('Plupload', '32503:32525');
                            self.trigger('Browse');
                        });
                        __$coverCall('Plupload', '32542:32635');
                        fileInput.bind('error runtimeerror', function () {
                            __$coverCall('Plupload', '32598:32614');
                            fileInput = null;
                            __$coverCall('Plupload', '32622:32626');
                            cb();
                        });
                        __$coverCall('Plupload', '32643:32659');
                        fileInput.init();
                    });
                });
            }
            __$coverCall('Plupload', '32710:33503');
            if (settings.drop_element) {
                __$coverCall('Plupload', '32742:33499');
                plupload.each(settings.drop_element, function (el) {
                    __$coverCall('Plupload', '32798:33492');
                    queue.push(function (cb) {
                        __$coverCall('Plupload', '32829:32923');
                        var fileDrop = new o.file.FileDrop(plupload.extend({}, options, { drop_zone: el }));
                        __$coverCall('Plupload', '32931:33285');
                        fileDrop.onready = function () {
                            __$coverCall('Plupload', '32969:33006');
                            var info = Runtime.getInfo(this.ruid);
                            __$coverCall('Plupload', '33051:33220');
                            plupload.extend(self.features, {
                                chunks: info.can('slice_blob'),
                                multipart: info.can('send_multipart'),
                                dragdrop: info.can('drag_and_drop')
                            });
                            __$coverCall('Plupload', '33229:33237');
                            inited++;
                            __$coverCall('Plupload', '33245:33265');
                            fileDrops.push(this);
                            __$coverCall('Plupload', '33273:33277');
                            cb();
                        };
                        __$coverCall('Plupload', '33293:33362');
                        fileDrop.ondrop = function () {
                            __$coverCall('Plupload', '33330:33354');
                            self.addFile(this.files);
                        };
                        __$coverCall('Plupload', '33370:33461');
                        fileDrop.bind('error runtimeerror', function () {
                            __$coverCall('Plupload', '33425:33440');
                            fileDrop = null;
                            __$coverCall('Plupload', '33448:33452');
                            cb();
                        });
                        __$coverCall('Plupload', '33469:33484');
                        fileDrop.init();
                    });
                });
            }
            __$coverCall('Plupload', '33509:33608');
            plupload.inSeries(queue, function () {
                __$coverCall('Plupload', '33550:33602');
                if (typeof cb === 'function') {
                    __$coverCall('Plupload', '33587:33597');
                    cb(inited);
                }
            });
        }
        __$coverCall('Plupload', '33616:34423');
        function resizeImage(blob, params, runtimeOptions, cb) {
            __$coverCall('Plupload', '33675:33704');
            var img = new o.image.Image();
            __$coverCall('Plupload', '33709:34420');
            try {
                __$coverCall('Plupload', '33718:34118');
                img.onload = function () {
                    __$coverCall('Plupload', '33786:34112');
                    if (params.width > this.width && params.height > this.height && params.quality === undef && params.preserve_headers && !params.crop) {
                        __$coverCall('Plupload', '33951:33965');
                        this.destroy();
                        __$coverCall('Plupload', '33972:33980');
                        cb(blob);
                    } else {
                        __$coverCall('Plupload', '34027:34106');
                        img.downsize(params.width, params.height, params.crop, params.preserve_headers);
                    }
                };
                __$coverCall('Plupload', '34124:34262');
                img.onresize = function () {
                    __$coverCall('Plupload', '34156:34215');
                    var resizedBlob = this.getAsBlob(blob.type, params.quality);
                    __$coverCall('Plupload', '34221:34235');
                    this.destroy();
                    __$coverCall('Plupload', '34241:34256');
                    cb(resizedBlob);
                };
                __$coverCall('Plupload', '34268:34351');
                img.bind('error runtimeerror', function () {
                    __$coverCall('Plupload', '34316:34330');
                    this.destroy();
                    __$coverCall('Plupload', '34336:34344');
                    cb(blob);
                });
                __$coverCall('Plupload', '34357:34387');
                img.load(blob, runtimeOptions);
            } catch (ex) {
                __$coverCall('Plupload', '34408:34416');
                cb(blob);
            }
        }
        __$coverCall('Plupload', '34428:38355');
        function setOption(option, value, init) {
            __$coverCall('Plupload', '34472:34511');
            var self = this, reinitRequired = false;
            __$coverCall('Plupload', '34516:37400');
            function _setOption(option, value, init) {
                __$coverCall('Plupload', '34562:34593');
                var oldValue = settings[option];
                __$coverCall('Plupload', '34599:37314');
                switch (option) {
                case 'max_file_size':
                    __$coverCall('Plupload', '34648:34758');
                    if (option === 'max_file_size') {
                        __$coverCall('Plupload', '34688:34751');
                        settings.max_file_size = settings.filters.max_file_size = value;
                    }
                    __$coverCall('Plupload', '34765:34770');
                    break;
                case 'chunk_size':
                    __$coverCall('Plupload', '34801:34917');
                    if (value = plupload.parseSize(value)) {
                        __$coverCall('Plupload', '34848:34872');
                        settings[option] = value;
                        __$coverCall('Plupload', '34880:34910');
                        settings.send_file_name = true;
                    }
                    __$coverCall('Plupload', '34924:34929');
                    break;
                case 'multipart':
                    __$coverCall('Plupload', '34959:34983');
                    settings[option] = value;
                    __$coverCall('Plupload', '34990:35047');
                    if (!value) {
                        __$coverCall('Plupload', '35010:35040');
                        settings.send_file_name = true;
                    }
                    __$coverCall('Plupload', '35054:35059');
                    break;
                case 'http_method':
                    __$coverCall('Plupload', '35091:35156');
                    settings[option] = value.toUpperCase() === 'PUT' ? 'PUT' : 'POST';
                    __$coverCall('Plupload', '35163:35168');
                    break;
                case 'unique_names':
                    __$coverCall('Plupload', '35201:35225');
                    settings[option] = value;
                    __$coverCall('Plupload', '35232:35288');
                    if (value) {
                        __$coverCall('Plupload', '35251:35281');
                        settings.send_file_name = true;
                    }
                    __$coverCall('Plupload', '35295:35300');
                    break;
                case 'filters':
                    __$coverCall('Plupload', '35371:35468');
                    if (plupload.typeOf(value) === 'array') {
                        __$coverCall('Plupload', '35419:35461');
                        value = { mime_types: value };
                    }
                    __$coverCall('Plupload', '35476:35587');
                    if (init) {
                        __$coverCall('Plupload', '35494:35534');
                        plupload.extend(settings.filters, value);
                    } else {
                        __$coverCall('Plupload', '35556:35580');
                        settings.filters = value;
                    }
                    __$coverCall('Plupload', '35681:36484');
                    if (value.mime_types) {
                        __$coverCall('Plupload', '35711:35848');
                        if (plupload.typeOf(value.mime_types) === 'string') {
                            __$coverCall('Plupload', '35772:35840');
                            value.mime_types = o.core.utils.Mime.mimes2extList(value.mime_types);
                        }
                        __$coverCall('Plupload', '35857:36422');
                        value.mime_types.regexp = function (filters) {
                            __$coverCall('Plupload', '35911:35936');
                            var extensionsRegExp = [];
                            __$coverCall('Plupload', '35946:36321');
                            plupload.each(filters, function (filter) {
                                __$coverCall('Plupload', '35996:36310');
                                plupload.each(filter.extensions.split(/,/), function (ext) {
                                    __$coverCall('Plupload', '36065:36298');
                                    if (/^\s*\*\s*$/.test(ext)) {
                                        __$coverCall('Plupload', '36105:36134');
                                        extensionsRegExp.push('\\.*');
                                    } else {
                                        __$coverCall('Plupload', '36164:36287');
                                        extensionsRegExp.push('\\.' + ext.replace(new RegExp('[' + '/^$.*+?|()[]{}\\'.replace(/./g, '\\$&') + ']', 'g'), '\\$&'));
                                    }
                                });
                            });
                            __$coverCall('Plupload', '36331:36394');
                            return new RegExp('(' + extensionsRegExp.join('|') + ')$', 'i');
                        }(value.mime_types);
                        __$coverCall('Plupload', '36431:36477');
                        settings.filters.mime_types = value.mime_types;
                    }
                    __$coverCall('Plupload', '36491:36496');
                    break;
                case 'resize':
                    __$coverCall('Plupload', '36523:36695');
                    if (value) {
                        __$coverCall('Plupload', '36542:36643');
                        settings.resize = plupload.extend({
                            preserve_headers: true,
                            crop: false
                        }, value);
                    } else {
                        __$coverCall('Plupload', '36665:36688');
                        settings.resize = false;
                    }
                    __$coverCall('Plupload', '36702:36707');
                    break;
                case 'prevent_duplicates':
                    __$coverCall('Plupload', '36746:36821');
                    settings.prevent_duplicates = settings.filters.prevent_duplicates = !!value;
                    __$coverCall('Plupload', '36828:36833');
                    break;
                case 'container':
                case 'browse_button':
                case 'drop_element':
                    __$coverCall('Plupload', '36960:37058');
                    value = 'container' === option ? plupload.get(value) : plupload.getAll(value);
                    __$coverCall('Plupload', '37059:37059');
                    ;
                case 'runtimes':
                case 'multi_selection':
                case 'flash_swf_url':
                case 'silverlight_xap_url':
                    __$coverCall('Plupload', '37174:37198');
                    settings[option] = value;
                    __$coverCall('Plupload', '37205:37252');
                    if (!init) {
                        __$coverCall('Plupload', '37224:37245');
                        reinitRequired = true;
                    }
                    __$coverCall('Plupload', '37259:37264');
                    break;
                default:
                    __$coverCall('Plupload', '37285:37309');
                    settings[option] = value;
                }
                __$coverCall('Plupload', '37320:37396');
                if (!init) {
                    __$coverCall('Plupload', '37337:37391');
                    self.trigger('OptionChanged', option, value, oldValue);
                }
            }
            __$coverCall('Plupload', '37405:37584');
            if (typeof option === 'object') {
                __$coverCall('Plupload', '37443:37533');
                plupload.each(option, function (value, option) {
                    __$coverCall('Plupload', '37495:37526');
                    _setOption(option, value, init);
                });
            } else {
                __$coverCall('Plupload', '37549:37580');
                _setOption(option, value, init);
            }
            __$coverCall('Plupload', '37589:38352');
            if (init) {
                __$coverCall('Plupload', '37654:37727');
                settings.required_features = normalizeCaps(plupload.extend({}, settings));
                __$coverCall('Plupload', '37831:37928');
                preferred_caps = normalizeCaps(plupload.extend({}, settings, { required_features: true }));
            } else if (reinitRequired) {
                __$coverCall('Plupload', '37964:37987');
                self.trigger('Destroy');
                __$coverCall('Plupload', '37993:38348');
                initControls.call(self, settings, function (inited) {
                    __$coverCall('Plupload', '38050:38341');
                    if (inited) {
                        __$coverCall('Plupload', '38069:38115');
                        self.runtime = Runtime.getInfo(getRUID()).type;
                        __$coverCall('Plupload', '38122:38169');
                        self.trigger('Init', { runtime: self.runtime });
                        __$coverCall('Plupload', '38176:38200');
                        self.trigger('PostInit');
                    } else {
                        __$coverCall('Plupload', '38220:38335');
                        self.trigger('Error', {
                            code: plupload.INIT_ERROR,
                            message: plupload.translate('Init error.')
                        });
                    }
                });
            }
        }
        __$coverCall('Plupload', '38388:38651');
        function onBeforeUpload(up, file) {
            __$coverCall('Plupload', '38464:38648');
            if (up.settings.unique_names) {
                __$coverCall('Plupload', '38499:38556');
                var matches = file.name.match(/\.([^.]+)$/), ext = 'part';
                __$coverCall('Plupload', '38561:38601');
                if (matches) {
                    __$coverCall('Plupload', '38580:38596');
                    ext = matches[1];
                }
                __$coverCall('Plupload', '38606:38644');
                file.target_name = file.id + '.' + ext;
            }
        }
        __$coverCall('Plupload', '38656:44722');
        function onUploadFile(up, file) {
            __$coverCall('Plupload', '38692:38717');
            var url = up.settings.url;
            __$coverCall('Plupload', '38721:38759');
            var chunkSize = up.settings.chunk_size;
            __$coverCall('Plupload', '38763:38800');
            var retries = up.settings.max_retries;
            __$coverCall('Plupload', '38804:38830');
            var features = up.features;
            __$coverCall('Plupload', '38834:38848');
            var offset = 0;
            __$coverCall('Plupload', '38852:38860');
            var blob;
            __$coverCall('Plupload', '38865:39098');
            var runtimeOptions = {
                    runtime_order: up.settings.runtimes,
                    required_caps: up.settings.required_features,
                    preferred_caps: preferred_caps,
                    swf_url: up.settings.flash_swf_url,
                    xap_url: up.settings.silverlight_xap_url
                };
            __$coverCall('Plupload', '39151:39263');
            if (file.loaded) {
                __$coverCall('Plupload', '39173:39259');
                offset = file.loaded = chunkSize ? chunkSize * Math.floor(file.loaded / chunkSize) : 0;
            }
            __$coverCall('Plupload', '39268:39664');
            function handleError() {
                __$coverCall('Plupload', '39296:39660');
                if (retries-- > 0) {
                    __$coverCall('Plupload', '39321:39349');
                    delay(uploadNextChunk, 1000);
                } else {
                    __$coverCall('Plupload', '39367:39387');
                    file.loaded = offset;
                    __$coverCall('Plupload', '39416:39655');
                    up.trigger('Error', {
                        code: plupload.HTTP_ERROR,
                        message: plupload.translate('HTTP Error.'),
                        file: file,
                        response: xhr.responseText,
                        status: xhr.status,
                        responseHeaders: xhr.getAllResponseHeaders()
                    });
                }
            }
            __$coverCall('Plupload', '39669:40965');
            function uploadNextChunk() {
                __$coverCall('Plupload', '39701:39739');
                var chunkBlob, args = {}, curChunkSize;
                __$coverCall('Plupload', '39825:39915');
                if (file.status !== plupload.UPLOADING || up.state === plupload.STOPPED) {
                    __$coverCall('Plupload', '39904:39910');
                    return;
                }
                __$coverCall('Plupload', '39977:40061');
                if (up.settings.send_file_name) {
                    __$coverCall('Plupload', '40015:40056');
                    args.name = file.target_name || file.name;
                }
                __$coverCall('Plupload', '40067:40372');
                if (chunkSize && features.chunks && blob.size > chunkSize) {
                    __$coverCall('Plupload', '40190:40244');
                    curChunkSize = Math.min(chunkSize, blob.size - offset);
                    __$coverCall('Plupload', '40250:40303');
                    chunkBlob = blob.slice(offset, offset + curChunkSize);
                } else {
                    __$coverCall('Plupload', '40321:40345');
                    curChunkSize = blob.size;
                    __$coverCall('Plupload', '40351:40367');
                    chunkBlob = blob;
                }
                __$coverCall('Plupload', '40481:40834');
                if (chunkSize && features.chunks) {
                    __$coverCall('Plupload', '40557:40829');
                    if (up.settings.send_chunk_number) {
                        __$coverCall('Plupload', '40599:40641');
                        args.chunk = Math.ceil(offset / chunkSize);
                        __$coverCall('Plupload', '40648:40694');
                        args.chunks = Math.ceil(blob.size / chunkSize);
                    } else {
                        __$coverCall('Plupload', '40774:40794');
                        args.offset = offset;
                        __$coverCall('Plupload', '40801:40823');
                        args.total = blob.size;
                    }
                }
                __$coverCall('Plupload', '40840:40961');
                if (up.trigger('BeforeChunkUpload', file, args, chunkBlob, offset)) {
                    __$coverCall('Plupload', '40914:40956');
                    uploadChunk(args, chunkBlob, curChunkSize);
                }
            }
            __$coverCall('Plupload', '40970:44313');
            function uploadChunk(args, chunkBlob, curChunkSize) {
                __$coverCall('Plupload', '41027:41039');
                var formData;
                __$coverCall('Plupload', '41045:41077');
                xhr = new o.xhr.XMLHttpRequest();
                __$coverCall('Plupload', '41124:41294');
                if (xhr.upload) {
                    __$coverCall('Plupload', '41146:41289');
                    xhr.upload.onprogress = function (e) {
                        __$coverCall('Plupload', '41189:41241');
                        file.loaded = Math.min(file.size, offset + e.loaded);
                        __$coverCall('Plupload', '41248:41282');
                        up.trigger('UploadProgress', file);
                    };
                }
                __$coverCall('Plupload', '41300:42906');
                xhr.onload = function () {
                    __$coverCall('Plupload', '41373:41455');
                    if (xhr.status < 200 || xhr.status >= 400) {
                        __$coverCall('Plupload', '41423:41436');
                        handleError();
                        __$coverCall('Plupload', '41443:41449');
                        return;
                    }
                    __$coverCall('Plupload', '41462:41495');
                    retries = up.settings.max_retries;
                    __$coverCall('Plupload', '41552:42229');
                    if (curChunkSize < blob.size) {
                        __$coverCall('Plupload', '41589:41608');
                        chunkBlob.destroy();
                        __$coverCall('Plupload', '41616:41638');
                        offset += curChunkSize;
                        __$coverCall('Plupload', '41645:41686');
                        file.loaded = Math.min(offset, blob.size);
                        __$coverCall('Plupload', '41694:41903');
                        up.trigger('ChunkUploaded', file, {
                            offset: file.loaded,
                            total: blob.size,
                            response: xhr.responseText,
                            status: xhr.status,
                            responseHeaders: xhr.getAllResponseHeaders()
                        });
                        __$coverCall('Plupload', '42016:42180');
                        if (plupload.ua.browser === 'Android Browser') {
                            __$coverCall('Plupload', '42139:42173');
                            up.trigger('UploadProgress', file);
                        }
                    } else {
                        __$coverCall('Plupload', '42200:42223');
                        file.loaded = file.size;
                    }
                    __$coverCall('Plupload', '42236:42263');
                    chunkBlob = formData = null;
                    __$coverCall('Plupload', '42318:42900');
                    if (!offset || offset >= blob.size) {
                        __$coverCall('Plupload', '42408:42488');
                        if (file.size != file.origSize) {
                            __$coverCall('Plupload', '42448:42462');
                            blob.destroy();
                            __$coverCall('Plupload', '42470:42481');
                            blob = null;
                        }
                        __$coverCall('Plupload', '42496:42530');
                        up.trigger('UploadProgress', file);
                        __$coverCall('Plupload', '42538:42565');
                        file.status = plupload.DONE;
                        __$coverCall('Plupload', '42572:42608');
                        file.completeTimestamp = +new Date();
                        __$coverCall('Plupload', '42616:42771');
                        up.trigger('FileUploaded', file, {
                            response: xhr.responseText,
                            status: xhr.status,
                            responseHeaders: xhr.getAllResponseHeaders()
                        });
                    } else {
                        __$coverCall('Plupload', '42817:42842');
                        delay(uploadNextChunk, 1);
                    }
                };
                __$coverCall('Plupload', '42912:42962');
                xhr.onerror = function () {
                    __$coverCall('Plupload', '42943:42956');
                    handleError();
                };
                __$coverCall('Plupload', '42968:43021');
                xhr.onloadend = function () {
                    __$coverCall('Plupload', '43001:43015');
                    this.destroy();
                };
                __$coverCall('Plupload', '43057:44309');
                if (up.settings.multipart && features.multipart) {
                    __$coverCall('Plupload', '43112:43156');
                    xhr.open(up.settings.http_method, url, true);
                    __$coverCall('Plupload', '43189:43294');
                    plupload.each(up.settings.headers, function (value, name) {
                        __$coverCall('Plupload', '43253:43286');
                        xhr.setRequestHeader(name, value);
                    });
                    __$coverCall('Plupload', '43301:43332');
                    formData = new o.xhr.FormData();
                    __$coverCall('Plupload', '43367:43531');
                    plupload.each(plupload.extend(args, up.settings.multipart_params, file.settings.multipart_params), function (value, name) {
                        __$coverCall('Plupload', '43495:43523');
                        formData.append(name, value);
                    });
                    __$coverCall('Plupload', '43566:43620');
                    formData.append(up.settings.file_data_name, chunkBlob);
                    __$coverCall('Plupload', '43626:43660');
                    xhr.send(formData, runtimeOptions);
                } else {
                    __$coverCall('Plupload', '43724:43849');
                    url = plupload.buildUrl(up.settings.url, plupload.extend(args, up.settings.multipart_params, file.settings.multipart_params));
                    __$coverCall('Plupload', '43856:43900');
                    xhr.open(up.settings.http_method, url, true);
                    __$coverCall('Plupload', '43933:44038');
                    plupload.each(up.settings.headers, function (value, name) {
                        __$coverCall('Plupload', '43997:44030');
                        xhr.setRequestHeader(name, value);
                    });
                    __$coverCall('Plupload', '44118:44262');
                    if (!xhr.hasRequestHeader('Content-Type')) {
                        __$coverCall('Plupload', '44168:44232');
                        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
                    }
                    __$coverCall('Plupload', '44269:44304');
                    xhr.send(chunkBlob, runtimeOptions);
                }
            }
            __$coverCall('Plupload', '44319:44342');
            blob = file.getSource();
            __$coverCall('Plupload', '44375:44719');
            if (!plupload.isEmptyObj(up.settings.resize) && plupload.inArray(blob.type, [
                    'image/jpeg',
                    'image/png'
                ]) !== -1) {
                __$coverCall('Plupload', '44518:44682');
                resizeImage(blob, up.settings.resize, runtimeOptions, function (resizedBlob) {
                    __$coverCall('Plupload', '44600:44618');
                    blob = resizedBlob;
                    __$coverCall('Plupload', '44624:44652');
                    file.size = resizedBlob.size;
                    __$coverCall('Plupload', '44658:44675');
                    uploadNextChunk();
                });
            } else {
                __$coverCall('Plupload', '44698:44715');
                uploadNextChunk();
            }
        }
        __$coverCall('Plupload', '44727:44784');
        function onUploadProgress(up, file) {
            __$coverCall('Plupload', '44767:44781');
            calcFile(file);
        }
        __$coverCall('Plupload', '44789:45184');
        function onStateChanged(up) {
            __$coverCall('Plupload', '44821:45181');
            if (up.state == plupload.STARTED) {
                __$coverCall('Plupload', '44898:44923');
                startTime = +new Date();
            } else if (up.state == plupload.STOPPED) {
                __$coverCall('Plupload', '45011:45177');
                for (var i = up.files.length - 1; i >= 0; i--) {
                    __$coverCall('Plupload', '45064:45172');
                    if (up.files[i].status == plupload.UPLOADING) {
                        __$coverCall('Plupload', '45117:45153');
                        up.files[i].status = plupload.QUEUED;
                        __$coverCall('Plupload', '45160:45166');
                        calc();
                    }
                }
            }
        }
        __$coverCall('Plupload', '45189:45251');
        function onCancelUpload() {
            __$coverCall('Plupload', '45219:45248');
            if (xhr) {
                __$coverCall('Plupload', '45233:45244');
                xhr.abort();
            }
        }
        __$coverCall('Plupload', '45256:45472');
        function onFileUploaded(up) {
            __$coverCall('Plupload', '45288:45294');
            calc();
            __$coverCall('Plupload', '45419:45469');
            delay(function () {
                __$coverCall('Plupload', '45441:45460');
                uploadNext.call(up);
            }, 1);
        }
        __$coverCall('Plupload', '45477:46060');
        function onError(up, err) {
            __$coverCall('Plupload', '45507:46057');
            if (err.code === plupload.INIT_ERROR) {
                __$coverCall('Plupload', '45550:45562');
                up.destroy();
            } else if (err.code === plupload.HTTP_ERROR) {
                __$coverCall('Plupload', '45671:45704');
                err.file.status = plupload.FAILED;
                __$coverCall('Plupload', '45709:45749');
                err.file.completeTimestamp = +new Date();
                __$coverCall('Plupload', '45754:45772');
                calcFile(err.file);
                __$coverCall('Plupload', '45900:46053');
                if (up.state == plupload.STARTED) {
                    __$coverCall('Plupload', '45962:45988');
                    up.trigger('CancelUpload');
                    __$coverCall('Plupload', '45994:46048');
                    delay(function () {
                        __$coverCall('Plupload', '46018:46037');
                        uploadNext.call(up);
                    }, 1);
                }
            }
        }
        __$coverCall('Plupload', '46065:46557');
        function onDestroy(up) {
            __$coverCall('Plupload', '46092:46101');
            up.stop();
            __$coverCall('Plupload', '46127:46188');
            plupload.each(files, function (file) {
                __$coverCall('Plupload', '46168:46182');
                file.destroy();
            });
            __$coverCall('Plupload', '46192:46202');
            files = [];
            __$coverCall('Plupload', '46207:46337');
            if (fileInputs.length) {
                __$coverCall('Plupload', '46235:46313');
                plupload.each(fileInputs, function (fileInput) {
                    __$coverCall('Plupload', '46287:46306');
                    fileInput.destroy();
                });
                __$coverCall('Plupload', '46318:46333');
                fileInputs = [];
            }
            __$coverCall('Plupload', '46342:46467');
            if (fileDrops.length) {
                __$coverCall('Plupload', '46369:46444');
                plupload.each(fileDrops, function (fileDrop) {
                    __$coverCall('Plupload', '46419:46437');
                    fileDrop.destroy();
                });
                __$coverCall('Plupload', '46449:46463');
                fileDrops = [];
            }
            __$coverCall('Plupload', '46472:46491');
            preferred_caps = {};
            __$coverCall('Plupload', '46495:46511');
            disabled = false;
            __$coverCall('Plupload', '46515:46537');
            startTime = xhr = null;
            __$coverCall('Plupload', '46541:46554');
            total.reset();
        }
        __$coverCall('Plupload', '46583:47003');
        settings = {
            chunk_size: 0,
            file_data_name: 'file',
            filters: {
                mime_types: [],
                max_file_size: 0,
                prevent_duplicates: false,
                prevent_empty: true
            },
            flash_swf_url: 'js/Moxie.swf',
            http_method: 'POST',
            max_retries: 0,
            multipart: true,
            multi_selection: true,
            resize: false,
            runtimes: Runtime.order,
            send_file_name: true,
            send_chunk_number: true,
            silverlight_xap_url: 'js/Moxie.xap'
        };
        __$coverCall('Plupload', '47008:47049');
        setOption.call(this, options, null, true);
        __$coverCall('Plupload', '47076:47112');
        total = new plupload.QueueProgress();
        __$coverCall('Plupload', '47139:59510');
        plupload.extend(this, {
            id: uid,
            uid: uid,
            state: plupload.STOPPED,
            features: {},
            runtime: null,
            files: files,
            settings: settings,
            total: total,
            init: function () {
                __$coverCall('Plupload', '48693:48730');
                var self = this, opt, preinitOpt, err;
                __$coverCall('Plupload', '48736:48774');
                preinitOpt = self.getOption('preinit');
                __$coverCall('Plupload', '48779:48945');
                if (typeof preinitOpt == 'function') {
                    __$coverCall('Plupload', '48823:48839');
                    preinitOpt(self);
                } else {
                    __$coverCall('Plupload', '48857:48940');
                    plupload.each(preinitOpt, function (func, name) {
                        __$coverCall('Plupload', '48911:48932');
                        self.bind(name, func);
                    });
                }
                __$coverCall('Plupload', '48951:48980');
                bindEventListeners.call(self);
                __$coverCall('Plupload', '49019:49314');
                plupload.each([
                    'container',
                    'browse_button',
                    'drop_element'
                ], function (el) {
                    __$coverCall('Plupload', '49100:49307');
                    if (self.getOption(el) === null) {
                        __$coverCall('Plupload', '49140:49288');
                        err = {
                            code: plupload.INIT_ERROR,
                            message: plupload.sprintf(plupload.translate('%s specified, but cannot be found.'), el)
                        };
                        __$coverCall('Plupload', '49289:49301');
                        return false;
                    }
                });
                __$coverCall('Plupload', '49320:49373');
                if (err) {
                    __$coverCall('Plupload', '49335:49368');
                    return self.trigger('Error', err);
                }
                __$coverCall('Plupload', '49380:49608');
                if (!settings.browse_button && !settings.drop_element) {
                    __$coverCall('Plupload', '49441:49603');
                    return self.trigger('Error', {
                        code: plupload.INIT_ERROR,
                        message: plupload.translate('You must specify either browse_button or drop_element.')
                    });
                }
                __$coverCall('Plupload', '49615:50182');
                initControls.call(self, settings, function (inited) {
                    __$coverCall('Plupload', '49672:49708');
                    var initOpt = self.getOption('init');
                    __$coverCall('Plupload', '49714:49877');
                    if (typeof initOpt == 'function') {
                        __$coverCall('Plupload', '49756:49769');
                        initOpt(self);
                    } else {
                        __$coverCall('Plupload', '49789:49871');
                        plupload.each(initOpt, function (func, name) {
                            __$coverCall('Plupload', '49841:49862');
                            self.bind(name, func);
                        });
                    }
                    __$coverCall('Plupload', '49884:50175');
                    if (inited) {
                        __$coverCall('Plupload', '49903:49949');
                        self.runtime = Runtime.getInfo(getRUID()).type;
                        __$coverCall('Plupload', '49956:50003');
                        self.trigger('Init', { runtime: self.runtime });
                        __$coverCall('Plupload', '50010:50034');
                        self.trigger('PostInit');
                    } else {
                        __$coverCall('Plupload', '50054:50169');
                        self.trigger('Error', {
                            code: plupload.INIT_ERROR,
                            message: plupload.translate('Init error.')
                        });
                    }
                });
            },
            setOption: function (option, value) {
                __$coverCall('Plupload', '50521:50571');
                setOption.call(this, option, value, !this.runtime);
            },
            getOption: function (option) {
                __$coverCall('Plupload', '50931:50970');
                if (!option) {
                    __$coverCall('Plupload', '50950:50965');
                    return settings;
                }
                __$coverCall('Plupload', '50975:50998');
                return settings[option];
            },
            refresh: function () {
                __$coverCall('Plupload', '51235:51358');
                if (fileInputs.length) {
                    __$coverCall('Plupload', '51264:51353');
                    plupload.each(fileInputs, function (fileInput) {
                        __$coverCall('Plupload', '51317:51345');
                        fileInput.trigger('Refresh');
                    });
                }
                __$coverCall('Plupload', '51363:51386');
                this.trigger('Refresh');
            },
            start: function (id) {
                __$coverCall('Plupload', '51498:51640');
                if (this.state != plupload.STARTED) {
                    __$coverCall('Plupload', '51540:51569');
                    this.state = plupload.STARTED;
                    __$coverCall('Plupload', '51575:51603');
                    this.trigger('StateChanged');
                    __$coverCall('Plupload', '51610:51635');
                    uploadNext.call(this, id);
                }
            },
            stop: function () {
                __$coverCall('Plupload', '51751:51895');
                if (this.state != plupload.STOPPED) {
                    __$coverCall('Plupload', '51793:51822');
                    this.state = plupload.STOPPED;
                    __$coverCall('Plupload', '51828:51856');
                    this.trigger('StateChanged');
                    __$coverCall('Plupload', '51862:51890');
                    this.trigger('CancelUpload');
                }
            },
            disableBrowse: function () {
                __$coverCall('Plupload', '52105:52160');
                disabled = arguments[0] !== undef ? arguments[0] : true;
                __$coverCall('Plupload', '52166:52288');
                if (fileInputs.length) {
                    __$coverCall('Plupload', '52195:52283');
                    plupload.each(fileInputs, function (fileInput) {
                        __$coverCall('Plupload', '52248:52275');
                        fileInput.disable(disabled);
                    });
                }
                __$coverCall('Plupload', '52294:52333');
                this.trigger('DisableBrowse', disabled);
            },
            getFile: function (id) {
                __$coverCall('Plupload', '52574:52579');
                var i;
                __$coverCall('Plupload', '52584:52687');
                for (i = files.length - 1; i >= 0; i--) {
                    __$coverCall('Plupload', '52630:52682');
                    if (files[i].id === id) {
                        __$coverCall('Plupload', '52661:52676');
                        return files[i];
                    }
                }
            },
            addFile: function (file, fileName) {
                __$coverCall('Plupload', '53225:53290');
                var self = this, queue = [], filesAdded = [], ruid;
                __$coverCall('Plupload', '53291:53291');
                ;
                __$coverCall('Plupload', '53297:53630');
                function filterFile(file, cb) {
                    __$coverCall('Plupload', '53333:53347');
                    var queue = [];
                    __$coverCall('Plupload', '53353:53591');
                    plupload.each(self.settings.filters, function (rule, name) {
                        __$coverCall('Plupload', '53418:53583');
                        if (fileFilters[name]) {
                            __$coverCall('Plupload', '53449:53576');
                            queue.push(function (cb) {
                                __$coverCall('Plupload', '53482:53566');
                                fileFilters[name].call(self, rule, file, function (res) {
                                    __$coverCall('Plupload', '53547:53555');
                                    cb(!res);
                                });
                            });
                        }
                    });
                    __$coverCall('Plupload', '53597:53625');
                    plupload.inSeries(queue, cb);
                }
                __$coverCall('Plupload', '53786:55529');
                function resolveFile(file) {
                    __$coverCall('Plupload', '53819:53851');
                    var type = plupload.typeOf(file);
                    __$coverCall('Plupload', '53881:55524');
                    if (file instanceof o.file.File) {
                        __$coverCall('Plupload', '53921:54085');
                        if (!file.ruid && !file.isDetached()) {
                            __$coverCall('Plupload', '53967:54021');
                            if (!ruid) {
                                __$coverCall('Plupload', '54001:54013');
                                return false;
                            }
                            __$coverCall('Plupload', '54029:54045');
                            file.ruid = ruid;
                            __$coverCall('Plupload', '54053:54078');
                            file.connectRuntime(ruid);
                        }
                        __$coverCall('Plupload', '54092:54128');
                        resolveFile(new plupload.File(file));
                    } else if (file instanceof o.file.Blob) {
                        __$coverCall('Plupload', '54208:54237');
                        resolveFile(file.getSource());
                        __$coverCall('Plupload', '54244:54258');
                        file.destroy();
                    } else if (file instanceof plupload.File) {
                        __$coverCall('Plupload', '54370:54419');
                        if (fileName) {
                            __$coverCall('Plupload', '54392:54412');
                            file.name = fileName;
                        }
                        __$coverCall('Plupload', '54427:54948');
                        queue.push(function (cb) {
                            __$coverCall('Plupload', '54526:54939');
                            filterFile(file, function (err) {
                                __$coverCall('Plupload', '54566:54840');
                                if (!err) {
                                    __$coverCall('Plupload', '54670:54686');
                                    files.push(file);
                                    __$coverCall('Plupload', '54765:54786');
                                    filesAdded.push(file);
                                    __$coverCall('Plupload', '54797:54831');
                                    self.trigger('FileFiltered', file);
                                }
                                __$coverCall('Plupload', '54849:54861');
                                delay(cb, 1);
                            });
                        });
                    } else if (plupload.inArray(type, [
                            'file',
                            'blob'
                        ]) !== -1) {
                        __$coverCall('Plupload', '55052:55092');
                        resolveFile(new o.file.File(null, file));
                    } else if (type === 'node' && plupload.typeOf(file.files) === 'filelist') {
                        __$coverCall('Plupload', '55259:55297');
                        plupload.each(file.files, resolveFile);
                    } else if (type === 'array') {
                        __$coverCall('Plupload', '55397:55412');
                        fileName = null;
                        __$coverCall('Plupload', '55486:55518');
                        plupload.each(file, resolveFile);
                    }
                }
                __$coverCall('Plupload', '55535:55551');
                ruid = getRUID();
                __$coverCall('Plupload', '55557:55574');
                resolveFile(file);
                __$coverCall('Plupload', '55580:55799');
                if (queue.length) {
                    __$coverCall('Plupload', '55604:55794');
                    plupload.inSeries(queue, function () {
                        __$coverCall('Plupload', '55710:55786');
                        if (filesAdded.length) {
                            __$coverCall('Plupload', '55741:55779');
                            self.trigger('FilesAdded', filesAdded);
                        }
                    });
                }
            },
            removeFile: function (file) {
                __$coverCall('Plupload', '55980:56031');
                var id = typeof file === 'string' ? file : file.id;
                __$coverCall('Plupload', '56037:56156');
                for (var i = files.length - 1; i >= 0; i--) {
                    __$coverCall('Plupload', '56087:56151');
                    if (files[i].id === id) {
                        __$coverCall('Plupload', '56118:56145');
                        return this.splice(i, 1)[0];
                    }
                }
            },
            splice: function (start, length) {
                __$coverCall('Plupload', '56618:56715');
                var removed = files.splice(start === undef ? 0 : start, length === undef ? files.length : length);
                __$coverCall('Plupload', '56807:56834');
                var restartRequired = false;
                __$coverCall('Plupload', '56839:57176');
                if (this.state == plupload.STARTED) {
                    __$coverCall('Plupload', '56903:57119');
                    plupload.each(removed, function (file) {
                        __$coverCall('Plupload', '56948:57111');
                        if (file.status === plupload.UPLOADING) {
                            __$coverCall('Plupload', '56996:57018');
                            restartRequired = true;
                            __$coverCall('Plupload', '57092:57104');
                            return false;
                        }
                    });
                    __$coverCall('Plupload', '57126:57171');
                    if (restartRequired) {
                        __$coverCall('Plupload', '57154:57165');
                        this.stop();
                    }
                }
                __$coverCall('Plupload', '57182:57219');
                this.trigger('FilesRemoved', removed);
                __$coverCall('Plupload', '57278:57343');
                plupload.each(removed, function (file) {
                    __$coverCall('Plupload', '57322:57336');
                    file.destroy();
                });
                __$coverCall('Plupload', '57349:57393');
                if (restartRequired) {
                    __$coverCall('Plupload', '57376:57388');
                    this.start();
                }
                __$coverCall('Plupload', '57399:57413');
                return removed;
            },
            dispatchEvent: function (type) {
                __$coverCall('Plupload', '57753:57775');
                var list, args, result;
                __$coverCall('Plupload', '57781:57806');
                type = type.toLowerCase();
                __$coverCall('Plupload', '57812:57846');
                list = this.hasEventListener(type);
                __$coverCall('Plupload', '57852:58307');
                if (list) {
                    __$coverCall('Plupload', '57903:57964');
                    list.sort(function (a, b) {
                        __$coverCall('Plupload', '57930:57960');
                        return b.priority - a.priority;
                    });
                    __$coverCall('Plupload', '58038:58069');
                    args = [].slice.call(arguments);
                    __$coverCall('Plupload', '58075:58087');
                    args.shift();
                    __$coverCall('Plupload', '58093:58111');
                    args.unshift(this);
                    __$coverCall('Plupload', '58118:58302');
                    for (var i = 0; i < list.length; i++) {
                        __$coverCall('Plupload', '58216:58296');
                        if (list[i].fn.apply(list[i].scope, args) === false) {
                            __$coverCall('Plupload', '58277:58289');
                            return false;
                        }
                    }
                }
                __$coverCall('Plupload', '58312:58323');
                return true;
            },
            bind: function (name, fn, scope, priority) {
                __$coverCall('Plupload', '58961:59031');
                plupload.Uploader.prototype.bind.call(this, name, fn, priority, scope);
            },
            destroy: function () {
                __$coverCall('Plupload', '59402:59425');
                this.trigger('Destroy');
                __$coverCall('Plupload', '59430:59453');
                settings = total = null;
                __$coverCall('Plupload', '59485:59501');
                this.unbindAll();
            }
        });
    };
    __$coverCall('Plupload', '59516:59573');
    plupload.Uploader.prototype = o.core.EventTarget.instance;
    __$coverCall('Plupload', '59801:62854');
    plupload.File = function () {
        __$coverCall('Plupload', '59832:59849');
        var filepool = {};
        __$coverCall('Plupload', '59853:62825');
        function PluploadFile(file) {
            __$coverCall('Plupload', '59886:62793');
            plupload.extend(this, {
                id: plupload.guid(),
                name: file.name || file.fileName,
                type: file.type || '',
                relativePath: file.relativePath || '',
                size: file.fileSize || file.size,
                origSize: file.fileSize || file.size,
                loaded: 0,
                percent: 0,
                status: plupload.QUEUED,
                lastModifiedDate: file.lastModifiedDate || new Date().toLocaleString(),
                completeTimestamp: 0,
                settings: {},
                getNative: function () {
                    __$coverCall('Plupload', '61972:62011');
                    var file = this.getSource().getSource();
                    __$coverCall('Plupload', '62017:62102');
                    return plupload.inArray(plupload.typeOf(file), [
                        'blob',
                        'file'
                    ]) !== -1 ? file : null;
                },
                getSource: function () {
                    __$coverCall('Plupload', '62305:62353');
                    if (!filepool[this.id]) {
                        __$coverCall('Plupload', '62336:62347');
                        return null;
                    }
                    __$coverCall('Plupload', '62359:62383');
                    return filepool[this.id];
                },
                setOption: function (option, value) {
                    __$coverCall('Plupload', '62457:62558');
                    this.settings[option] ? plupload.extend(this.settings[option], value) : this.settings[option] = value;
                },
                destroy: function () {
                    __$coverCall('Plupload', '62684:62710');
                    var src = this.getSource();
                    __$coverCall('Plupload', '62716:62782');
                    if (src) {
                        __$coverCall('Plupload', '62732:62745');
                        src.destroy();
                        __$coverCall('Plupload', '62752:62776');
                        delete filepool[this.id];
                    }
                }
            });
            __$coverCall('Plupload', '62798:62822');
            filepool[this.id] = file;
        }
        __$coverCall('Plupload', '62829:62848');
        return PluploadFile;
    }();
    __$coverCall('Plupload', '62942:64026');
    plupload.QueueProgress = function () {
        __$coverCall('Plupload', '62981:62996');
        var self = this;
        __$coverCall('Plupload', '63142:63155');
        self.size = 0;
        __$coverCall('Plupload', '63237:63252');
        self.loaded = 0;
        __$coverCall('Plupload', '63340:63357');
        self.uploaded = 0;
        __$coverCall('Plupload', '63451:63466');
        self.failed = 0;
        __$coverCall('Plupload', '63562:63577');
        self.queued = 0;
        __$coverCall('Plupload', '63675:63691');
        self.percent = 0;
        __$coverCall('Plupload', '63783:63803');
        self.bytesPerSec = 0;
        __$coverCall('Plupload', '63886:64023');
        self.reset = function () {
            __$coverCall('Plupload', '63914:64019');
            self.size = self.loaded = self.uploaded = self.failed = self.queued = self.percent = self.bytesPerSec = 0;
        };
    };
    __$coverCall('Plupload', '64029:64056');
    exports.plupload = plupload;
}(this, moxie));