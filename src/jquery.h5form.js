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
        version: "0.3.0",
        loaded: false,
        status: "idle"
    };

    $.h5Form.defaultOptions = {
            jsPath  : '../libs/vendors/',       // path to js libraries {relative or absolute path}
            cssPath : '/css/',              // path to css styling {relative or absolute path}
            imgPath : '/img/',              // path to images (e.g. ajax-loader) {relative or absolute path}
            langPath: '/js/language/',      // path to language js files {relative or absolute path}
            formPlugin: 'jquery.form.js',  //jquery.form plugin {filename.js} http://jquery.malsup.com/form/
            language: 'en.js',              // en.js by default {filename.js}
            cssStyle: 'pwnForms.css',       // Pwn form styling {filename.css}
            showMultipleErrors: false,      // show multiple errors (if any) at once or one by one {true|false}
            debug   : 'off',                // debugging option is the console {on|off}
            requiredAsterisk: 'off',        // asterisks next to required field's labels {on|off}
            messagePos: 'above',            // error and success message position {above|below|off}
            html5Validation: 'off'          // HTML5 validation is off by default
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

        // make debug option available
        $.h5Form.debug = opts.debug || 'off';

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

        if ($.h5Form.debug && $.h5Form.debug === 'on') {

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
            } else { return false; }
        } else {
            return false;
        }
    };

    /**
    *   Check if HTML element supports attribute in the browser
    *
    *   @param {String} element HTML element (e.g. "input")
    *   @param {String} attribute HTML attribute (e.g. "placeholder")
    *   @returns {Boolean} True if attribute is supported
    */
    $.h5Form.elementSupportsAttribute = function (element, attribute) {
        var test = document.createElement(element);
        if (attribute in test) {
            return true;
        } else {
            return false;
        }
    };

    /**
    *   Check if it is a valid and supported HTML form element
    *   currently `input`, `select` and `textarea` are supported
    *
    *   @param {String} node HTML element (e.g. "input")
    *   @returns {Boolean} True if element is supported
    */
    $.h5Form.isValidNode = function (node) {
        var validNodes = {
            'input': 'input',
            'select': 'select',
            'textarea': 'textarea'
        };

        if (typeof node === 'string') {
            return (validNodes.hasOwnProperty(node)) ? true : false;
        } else { return false;}
    };

    /**
    *   Set required asterisks '<sup class="asterisk">*</sup>'
    *   next to the label responsible for required field.
    *   Required fields are marked in HTML5 notation as required="required"
    *   or in class notation as class="required"
    *
    *   @this Current form
    */
    $.h5Form.setRequiredAsterisks = function (options) {
        var $form = $(this); // current Form

        // html5 and class notation for required fields, mark every previous label
        $form.find('[required="required"], .required').each(function () {
            var $el = $(this),
                labels = $(this).prevAll('label'), // all prev labels
                $labelFor = $form.find('[for="' + $el.attr('id') + '"]'); // a label that with `for` equals to current id

            if (labels.length > 0) {
                $(labels[0]).append('<sup class="asterisk">*</sup>');
            } else {
                // if no labels found above try searching for a label with `for` attribute
                // equal to the field `id`

                if ($labelFor.length > 0) {
                    $labelFor.append('<sup class="asterisk">*</sup>');
                } else {
                    $.h5Form.toConsole('Label was not found for required element ' + $el.attr('name'));
                }
            }
        });

    };




    $.h5Form.loadRequired = function (options) {
        // jquery.form is required to process ajax forms
        var requiredJsCss = [options.jsPath + options.formPlugin],
            lang = options && options.lang || '',
            cssStyle = options && options.cssStyle || '',
            deferred = $.Deferred();

        // Define languages, en - by default
        //requiredJsCss.push(options.langPath + lang);

        // Define styling if any
        if (cssStyle) {
            //requiredJsCss.push(options.cssPath + cssStyle);
        }

        // load everything from requiredJsCss
        window.yepnope({
            load: requiredJsCss,
            complete: function () {
                $.h5Form.toConsole('Required JS and CSS are loaded');
                $.h5Form.loaded = true;
                deferred.resolve();
            }
        });

        return deferred.promise();
    };


    $.h5Form.init = function (options) {
        var $form = $(this), // current Form
            cssClass = options && options.cssClass || '';
            

        $.h5Form.toConsole('form init started (' + $.h5Form.version + ') - ' + $form.attr('id'));

        //Switches on/off HTML5 Validation
        if (options.html5Validation && options.html5Validation !== 'on') {

            //  Check if browser supports HTML5 validation with checkValidity attribute
            //  https://github.com/Modernizr/Modernizr/blob/master/feature-detects/forms-validation.js
            if ($.h5Form.elementSupportsAttribute('form','checkValidity')) {
                $form.attr('novalidate', 'novalidate');
            }
        }

        // add h5form class, clearfix and a custom user-defined class
        $form.addClass('h5form clearfix ' + cssClass);

        // required asterisk only for preceding label
        if (options.requiredAsterisk && options.requiredAsterisk !== 'on') {

            $.h5Form.setRequiredAsterisks.call(this, options);

        }

        // @todo: custom events (skipped for now)


        if ($.fn.ajaxForm) {
            $form.ajaxForm(options);
            $.h5Form.toConsole('form ' + $form.attr('id') + ' successfully initialised');
            $.h5Form.status = "idle";
            return true;
        } else {
            $.h5Form.toConsole('form ' + $form.attr('id') + ' is NOT initialised', 'error');
            throw new Error($.h5Form.name + " – jquery.form plugin is missing!");
        }

    };



    $.fn.initH5Form = function(options) {
        var h5 = $.h5Form, // shorter notation
            that = this; // `that` is used to pass `this` to inner function

        options = h5.setOptions(options);

        // load yepnope if not loaded
        if ($.h5Form.status === "idle") {
            if (typeof window.yepnope !== 'function') {

                $.h5Form.status = "loading";
                
                $.getScript(options.jsPath + 'yepnope.min.js', function (data, textStatus, jqxhr) {
                    // when yepnope is loaded, load required scripts
                    $.when($.h5Form.loadRequired(options)).then(function () { $.h5Form.init.call(that, options); });
                });

            } else {
                if ($.h5Form.loaded === false && $.h5Form.status !== "loading") {
                    $.when($.h5Form.loadRequired(options)).then(function () { $.h5Form.status = "idle"; });
                }
            }
        } else {
            $.h5Form.toConsole('another try with ' + $(this).attr('id'));
            var t = setTimeout( function () {
                $.fn.initH5Form.call(that, options);
                $.h5Form.toConsole($.h5Form.status);
            }, 200);
        }

        // init multiple instances of forms
        if ($.h5Form.loaded && $.h5Form.status === "idle") {
            $.h5Form.init.call(this, options);
        }

        //setTimeout($.h5Form.init.call(this, options), 1200);


        /* Helpers */

        function getOptionValue (option) {

            if (options && options[option]) { return true; }
            else { return false; }

        }

        // make initH5Form chainable
        return this;
    };


}(jQuery));
