/*
* jquery.h5form
* https://github.com/vitkon/h5form
*
* Copyright (c) 2013 Vitaly Kondratiev
* Licensed under the MIT license.
*/

/*global $, jQuery, console, window:false */

(function($) {

    "use strict";

    $.h5Form = {
        name: "H5Form",
        version: "0.3.0"
    };

    $.h5Form.defaultOptions = {
            jsPath  : '/js/library/',       // path to js libraries {relative or absolute path}
            cssPath : '/css/',              // path to css styling {relative or absolute path}
            imgPath : '/img/',              // path to images (e.g. ajax-loader) {relative or absolute path}
            langPath: '/js/language/',      // path to language js files {relative or absolute path}
            formPlugin: 'jquery-form-3.02.js',  //jquery.form plugin {filename.js} http://jquery.malsup.com/form/
            language: 'en.js',              // en.js by default {filename.js}
            cssStyle: 'pwnForms.css',       // Pwn form styling {filename.css}
            showMultipleErrors: false,      // show multiple errors (if any) at once or one by one {true|false}
            debug   : 'off',                // debugging option is the console {on|off}
            requiredAsterisk: 'off',         // asterisks next to required field's labels {on|off}
            messagePos: 'above'            // error and success message position {above|below|off}
    };

    /**
    *   Extend default form options with user defined ones
    *
    *   @param {Object} [options] User options
    *   @returns {Object} Extended options combined with defaults
    */
    $.h5Form.setOptions = function (options) {
        options = typeof options === 'object' && options || {};
        var opts = $.extend({}, $.h5Form.defaultOptions, options);
        return opts;
    };

    /**
    *   Safe console output
    *
    *   @param {String} message A message to log
    *   @param {String} [type="log"] Type of the message
    *   @returns {Boolean} True if message was logged
    */
    $.h5Form.toConsole = function (message, type) {
        var types = {log: "log", warn: "warn", error: "error"};

        if (message === undefined || typeof message !== 'string') {
            throw new Error($.h5Form.name + " – Message is not provided for $.h5Form.toConsole");
        }

        type = (type in types) ? type : "log";

        

        // store all logs for reference
        $.h5Form.history = $.h5Form.history || [];
        $.h5Form.history.push(arguments);

        if (window.console) {
            window.console[type]('H5Form: ' + message);
            return true;
        } else {
            return false;
        }
    };

    $.fn.initH5Form = function(options) {
        var h5 = $.h5Form; // shorter notation

        options = h5.setOptions(options);


        function toConsole () {

            if (options && options.debug && options.debug === 'on') {
                $.h5Form.toConsole(Array.prototype.slice.call(arguments));
                return true;
            }
        }

        var x = toConsole();

        console.log(x);

        // make initH5Form chainable
        return this;
    };


}(jQuery));
