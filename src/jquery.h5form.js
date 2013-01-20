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
        version: "0.3.1",
        loaded: false,
        status: "idle"
    };


    /**
    *   Default form options
    */
    $.h5Form.defaultOptions = {
            jsPath  : '../libs/vendors/',       // path to js libraries {relative or absolute path}
            cssPath : '/css/',              // path to css styling {relative or absolute path}
            imgPath : '/img/',              // path to images (e.g. ajax-loader) {relative or absolute path}
            langPath: '/js/language/',      // path to language js files {relative or absolute path}
            formPlugin: 'jquery.form.js',  //jquery.form plugin {filename.js} http://jquery.malsup.com/form/
            //language: 'en.js',              // en.js by default {filename.js}
            //cssStyle: 'pwnForms.css',       // Pwn form styling {filename.css}
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

            if (message === undefined || typeof message !== 'string' && type !== 'debug') {
                throw new Error($.h5Form.name + " – Message is not provided for $.h5Form.toConsole");
            }

            type = (type in types) ? type : "log";

            // store all logs for reference
            $.h5Form.history = $.h5Form.history || [];
            $.h5Form.history.push(arguments);

            if (window.console) {
                if (typeof message !== 'object') {
                    window.console[type]('H5Form: ' + message);
                } else {
                    window.console[type](message);
                }
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
    *   Check if it is a valid and supported DOM element
    *   currently `input`, `select` and `textarea` are supported
    *
    *   @param {String} node DOM element (e.g. "input")
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
    *   Valid DOM elements classifier
    *
    *   @returns {Array} Array of valid form elements
    */
    $.h5Form.validNodes = function () {
        var validNodes = [
            'input', 'select', 'textarea'
        ];

        return validNodes;
    };

    /**
    *   Count own properties in the object
    *
    *   @param {Object} obj JS object
    *   @returns {Number} Number of elements
    */
    $.h5Form.countProperties = function (obj) {
        var count = 0;

        $.each(obj, function (key, value) {
            if (obj.hasOwnProperty(key)) {
                count += 1;
            }
        });

        return count;
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

    /**
    *   Load required js and css files
    *
    *   @param {Object} options Form options object
    *   @returns {Object} Promise Object
    */
    $.h5Form.loadRequired = function (options) {
        // jquery.form is required to process ajax forms
        var requiredJsCss = [options.jsPath + options.formPlugin],
            lang = options && options.language || '',
            cssStyle = options && options.cssStyle || '',
            deferred = $.Deferred();

        // Define languages, en - by default
        if (lang) {
            requiredJsCss.push(options.langPath + lang);
        }

        // Define styling if any
        if (cssStyle) {
            requiredJsCss.push(options.cssPath + cssStyle);
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

    /**
    *   Enable/disable UI of the form,
    *   mostly submit functionality
    *
    *   @this Current form context
    *   @param {Boolean} status True to disable UI, False to enable it back
    *   @param {Object} options Form options
    *   @returns {Object} this Current form context
    */
    $.h5Form.toggleFormInProcess = function (status, options) {
        var $form = $(this);

        if (status === false) {

            $form.find('.ajax-loader').remove();
            $.h5Form.toConsole('ajax loader is hidden');

            $form.find('[type=submit]').attr("disabled", false);
            $.h5Form.toConsole('submit button is enabled');

        }

        if (status === true) {
            $form.find('[type="submit"]:first-child')
            .after('<span class="ajax-loader"></span>');
            $.h5Form.toConsole('ajax loader is visible (after the submit button)');

            //Disable Submit Button, to prevent clicking the button Multiple times
            $form.find('[type=submit]').attr("disabled", true);
            $.h5Form.toConsole('submit button is disabled');
        }

        return this;

    };

    /**
    *   The chain of message evaluation
    *
    *   @param {String} text Text to evaluate
    *   @returns {String} Evaluated text
    */
    $.h5Form.evaluateText = function (text) {
        return ($.h5Form.language && $.h5Form.language[text]) || window[text] || undefined;
    };

    /**
    *   Show error/success message for the form
    *
    *   @this Current form context
    *   @param {String} message Message to show after error/success form submission
    *   @param {String} status Form options
    *   @param {Object} options Form options
    *   @returns {Object} this Current form context
    */
    $.h5Form.showMessage = function (message, status, options) {
        var position, // message position sh
            $form = $(this),
            _message; //temporary store evaluated message

        //prepare and evaluate the message
        if (typeof message === 'string') {
            message = message.trim();

            _message = $.h5Form.evaluateText(message);

            if (_message === undefined) {
                $.h5Form.toConsole('`message` didn\'t evaluate. Displayed as is: ' + message);
            } else {
                message = _message; // evaluated message
            }
        }

        // position of the message is defined in form options [above|below|off]
        position = options && options.messagePos || 'above';

        // evaluate the message if it hasn't been done before
        
        if (position === 'below') {
            $form.append('<div class="h5form-message ' + status + '">' + message + '</div>');
        }

        if (position === 'above') {
            $form.prepend('<div class="h5form-message ' + status + '">' + message + '</div>');
        }

        if (status === 'success') { $form.find('.h5form-message').delay(6000).fadeOut('slow'); }

    };

    /**
    *   get input field name even with square brackets
    *   e.g. name="form[email]" will evaluate to `email`
    *
    *   @param {String} inputName Name attribute of input field
    *   @returns {String} Name attribute without []
    */
    $.h5Form.getFormInputName = function (inputName) {
        //Check if the inputName has [] Square Brackets in it
        if (inputName !== undefined) {
            if ((inputName.indexOf("[") >= 0) && (inputName.indexOf("]") >= 0)) {
                return inputName.substring(inputName.indexOf("[") + 1, inputName.indexOf("]"));
            }

            if ((inputName.indexOf("[") < 0) && (inputName.indexOf("]") < 0)) {
                return inputName;
            }
        } else { return undefined; }
    };

    /**
    *   Show errors next to input fields
    *
    *   @this Current form context
    *   @param {String} message Message to show after error/success form submission
    *   @param {String} status Form options
    *   @param {Boolean} [showMultiple=true] True to show multiple error messages next to input fields
    *   @param {Boolean} [quotedConstants=true] True if the message has to be evaluated
    *   @returns {Object} this Current form context
    */
    $.h5Form.showInputErrors = function (fieldsArr, quotedConstants, showMultiple) {
        var fieldIndex, $fieldHandle, $prevHandle,
        $form = $(this),
        _message,
        quotedMsg;

        // show one error at a time or multiple messages
        showMultiple = showMultiple || true;

        // evaluate message by default
        quotedConstants = quotedConstants || true;


        // Hide all existing error boxes
        $('.h5form-error').remove();

        fieldIndex = fieldsArr.length;

        if (fieldIndex > 0) {
            for (fieldIndex in fieldsArr) {
                if (fieldsArr.hasOwnProperty(fieldIndex)) {
                    // If the constant is quoted then get the constant value
                    if (quotedConstants) {
                        // evaluate message
                        _message = $.h5Form.evaluateText(fieldsArr[fieldIndex].message);

                        if (_message === undefined) {
                            $.h5Form.toConsole('`error` didn\'t evaluate. Displayed as is: ' + fieldsArr[fieldIndex].message);
                        } else {
                            fieldsArr[fieldIndex].message = _message; // evaluated message
                        }

                    }

                    // If the field name is specified as alert, then show an alert box
                    if (fieldsArr[fieldIndex].field_name === 'alert') {
                        window.alert(fieldsArr[fieldIndex].message);
                    } else {

                        // store previous field
                        $prevHandle = $fieldHandle;

                        $fieldHandle = $form.find('[name="'+ fieldsArr[fieldIndex].field_name + '"]');

                        // to prevent multiple error containers in 1 field
                        if (!$prevHandle || $fieldHandle.attr('name') !== $prevHandle.attr('id')) {
                            $fieldHandle.after('<div class="h5form-error" id="' + $.h5Form.getFormInputName(fieldsArr[fieldIndex].field_name) + '-error-box">' + fieldsArr[fieldIndex].message + '</div>');
                        } else {
                            $('#' + $.h5Form.getFormInputName(fieldsArr[fieldIndex].field_name) + '-error-box').append('<br/>' + fieldsArr[fieldIndex].message);
                        }
                    }

                    // Quit looping and show only 1 message if we are not showing multiple messages
                    if (showMultiple !== true) {
                        return false;
                    }
                }
            }

            return false;
        }

        // If there is nothing to validate then validation has passed
        if (fieldsArr.length === 0) {
            return true;
        }

    }; // end of ShowInputErrors
    
    // get field length constrains from the regexp
    $.h5Form.getLengthConstrains = function (str) {

        var arr,
            results = [],
            re = /{([^}]+)}/g, text;

        if ((str !== undefined) && (str.charAt(str.length - 2) === '}')) {
            while (text = re.exec(str)) {
                results.push(text[1]);
            }

            if (results[0] !== undefined) {
                arr = results[0].split(',');
            }
        }

        return arr;
    };
    
    // Evaluate error message with variables
    $.h5Form.evalErrorMessage = function (errorMsg, obj) {
        var errorMsgEval = $.h5Form.evaluateText(errorMsg) || errorMsg;

        $.each(obj, function (key, value) {
            if (obj.hasOwnProperty(key)) {
                if (errorMsgEval !== undefined) {
                    errorMsgEval = errorMsgEval.replace('{' + key + '}', obj[key]);
                }

                // warn if variable doesn't exist
                if ((errorMsgEval === undefined) && (errorMsg !== undefined)) {
                    $.h5Form.toConsole(errorMsg + ' variable is not defined', 'error');
                }
            }
        });

        return errorMsgEval;
    };

    $.h5Form.validationRule = function (fieldOptions, errors) {
        
        var attributeKey, check, email, emailReg, errorMsg, errorMsgVars,
            field, //field value
            $field = $(fieldOptions.field), // cache jQuery element
            fieldMin, fieldMax, maxValue, minValue, pattern, patternLength, val;

        attributeKey = $field.attr(fieldOptions.attribute);

        // if field is visible - proceed with validation
        if ($field.is(':visible')) {

            // edge case for patterns
            if ((fieldOptions.attribute === 'pattern')) { attributeKey = fieldOptions.value; }

            if ((attributeKey === fieldOptions.value) || ($field.hasClass(fieldOptions.value))) {

                if (fieldOptions.error === 'EMPTY') {

                    // checkbox case
                    if ($field.is('input') === true) {
                        if ($field.attr('type') === 'checkbox') {
                            if ($field.is(':checked') === false) {
                                check = false;
                            }
                        }
                    }

                    if (($field.val().trim() === '') || (check === false)) {
                        errorMsg = 'FORM_VALIDATION_' + $.h5Form.getFormInputName($field.attr('name')).toUpperCase() + '_' + fieldOptions.error;
                        if (typeof $.h5Form.evaluateText(errorMsg) === 'undefined') { errorMsg = 'FORM_VALIDATION_FIELD_' + fieldOptions.error; }
                        errors.push({ message: errorMsg, field_name  : $field.attr('name')});
                    }

                }
                
                if (fieldOptions.error === 'INVALID_EMAIL_ADDRESS') {
                    email = $field.val();
                    if (email !== '') {
                        /*http://stackoverflow.com/questions/46155/validate-email-address-in-javascript*/
                        emailReg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        if (!emailReg.test(email)) {
                            errorMsg = 'FORM_VALIDATION_' + $.h5Form.getFormInputName($field.attr('name')).toUpperCase() + '_' + fieldOptions.error;
                            if (typeof $.h5Form.evaluateText(errorMsg) === 'undefined') { errorMsg = 'FORM_VALIDATION_' + fieldOptions.error; }
                            errors.push({message: errorMsg, field_name  : $field.attr('name')});
                        }
                    }
                }
                
                if (fieldOptions.error === 'INVALID_PATTERN') {

                    patternLength = $.h5Form.getLengthConstrains($field.attr('pattern'));

                    // define Max and Min length from regexp
                    if (patternLength !== undefined) {
                        if (patternLength[0] !== '') { fieldMin = patternLength[0]; }

                        if (patternLength[1] !== '') { fieldMax = patternLength[1]; }
                    }

                    field = $(fieldOptions.field).val();
                    pattern = new RegExp($(fieldOptions.field).attr('pattern'));

                    if (field.length > 0) {
                        if (!pattern.test(field)) {

                            if (patternLength !== undefined) {

                                if ((fieldMin !== undefined) && (fieldMax === undefined) && (field.length < fieldMin)) {
                                    errorMsg = 'FORM_VALIDATION_' + $.h5Form.getFormInputName($field.attr('name')).toUpperCase() + '_' + fieldOptions.error;
                                    if (typeof $.h5Form.evaluateText(errorMsg) === 'undefined') { errorMsg = 'FORM_VALIDATION_LENGTH_UNDER_MIN'; }
                                    errorMsgVars = { minLength: fieldMin };
                                    errors.push({ message: $.h5Form.evalErrorMessage(errorMsg, errorMsgVars), field_name: $field.attr('name')});
                                }

                                else if ((fieldMin === undefined) && (fieldMax !== undefined) && (field.length > fieldMax)) {
                                    errorMsg = 'FORM_VALIDATION_' + $.h5Form.getFormInputName($field.attr('name')).toUpperCase() + '_' + fieldOptions.error;
                                    if (typeof $.h5Form.evaluateText(errorMsg) === 'undefined') { errorMsg = 'FORM_VALIDATION_LENGTH_OVER_MAX'; }
                                    errorMsgVars = { maxLength: fieldMax };
                                    errors.push({ message: $.h5Form.evalErrorMessage(errorMsg, errorMsgVars), field_name: $(fieldOptions.field).attr('name')});
                                }

                                else if ((fieldMin !== undefined) && (fieldMax !== undefined) && (field.length < fieldMin) && (field.length > fieldMax)) {
                                    errorMsg = 'FORM_VALIDATION_' + $.h5Form.getFormInputName($field.attr('name')).toUpperCase() + '_' + fieldOptions.error;
                                    if (typeof $.h5Form.evaluateText(errorMsg) === 'undefined') { errorMsg = 'FORM_VALIDATION_LENGTH_BETWEEN'; }
                                    errorMsgVars = { minLength: fieldMin, maxLength: fieldMax };
                                    errors.push({ message: $.h5Form.evalErrorMessage(errorMsg, errorMsgVars), field_name: $field.attr('name')});
                                }

                                else {
                                    errorMsg = 'FORM_VALIDATION_' + $.h5Form.getFormInputName($(fieldOptions.field).attr('name')).toUpperCase() + '_' + fieldOptions.error;
                                    if (typeof $.h5Form.evaluateText(errorMsg) === 'undefined') { errorMsg = 'FORM_VALIDATION_' + fieldOptions.error; }
                                    errors.push({ message: errorMsg, field_name  : $field.attr('name')});
                                }
                            }

                            if (patternLength === undefined) {
                                errorMsg = 'FORM_VALIDATION_' + $.h5Form.getFormInputName($field.attr('name')).toUpperCase() + '_' + fieldOptions.error;
                                if (typeof $.h5Form.evaluateText(errorMsg) === 'undefined') { errorMsg = 'FORM_VALIDATION_' + fieldOptions.error; }
                                errors.push({ message: errorMsg, field_name : $field.attr('name')});
                            }

                        }
                    }

                } // end of INVALID_PATTERN
                
                if (fieldOptions.error === 'INVALID_NUMBER') {
                    val = $(fieldOptions.field).val();
                    val = !isNaN(val) && parseInt(val, 10); // cast to `number` type if value is a number

                    // not a number
                    if (val && isNaN(val)) {

                        errorMsg = 'FORM_VALIDATION_' + $.h5Form.getFormInputName($field.attr('name')).toUpperCase() + '_' + fieldOptions.error;
                        if (typeof $.h5Form.evaluateText(errorMsg) === 'undefined') { errorMsg = 'FORM_VALIDATION_' + fieldOptions.error; }
                        errors.push({ message: errorMsg, field_name : $field.attr('name')});

                    }

                    if ( val && !isNaN(val)) {
                        maxValue = parseInt($field.attr('max'), 10);
                        minValue = parseInt($field.attr('min'), 10);

                        if (minValue && val < minValue) {
                            errorMsg = 'FORM_VALIDATION_' + $.h5Form.getFormInputName($field.attr('name')).toUpperCase() + '_UNDER_MIN';
                            if (typeof $.h5Form.evaluateText(errorMsg) === 'undefined') { errorMsg = 'FORM_VALIDATION_UNDER_MIN'; }

                            errorMsgVars = { minValue: minValue, maxValue: maxValue};
                            errors.push({ message: $.h5Form.evalErrorMessage(errorMsg, errorMsgVars), field_name: $field.attr('name')});
                        }

                        else if (maxValue && val > maxValue) {
                            errorMsg = 'FORM_VALIDATION_' + $.h5Form.getFormInputName($field.attr('name')).toUpperCase() + '_OVER_MAX';
                            if (typeof $.h5Form.evaluateText(errorMsg) === 'undefined')  { errorMsg = 'FORM_VALIDATION_OVER_MAX'; }

                            errorMsgVars = { minValue: minValue, maxValue: maxValue};
                            errors.push({ message: $.h5Form.evalErrorMessage(errorMsg, errorMsgVars), field_name: $field.attr('name')});
                        }
                    }
                } // end of INVALID_NUMBER
                
            }
            
        } // if it is a visible field
        
        return errors;


    };

    //Before form submit
    $.h5Form.beforeSubmit = function (options) {
        var countToValidate, elemsToValidate, errors = [], fieldOptions = [], j, message, node, validNodes,
        deferred = $.Deferred(),
        $this = $(this), // cache jQuery element
        that = this;

        $.h5Form.toConsole('generic beforeSubmit function started');

        //Remove all previous messages
        $this.find('.h5form-message').remove();
        $this.find('.h5form-error').remove();

        $.h5Form.toggleFormInProcess.call(this, true, options);

        //Go through all the Input Fields within the Form
        $this.find($.h5Form.validNodes().join(', ')).addClass('h5form-validate');
        elemsToValidate = $this.find('.h5form-validate');
        
        $this.find('.h5form-validate').each(function () {
            var $this = $(this); // cache jQuery element

            node =  $this.get(0).nodeName.toLowerCase();

            if ($.h5Form.isValidNode(node)) {
                /**
                 * EMPTY REQUIRED FIELD
                 * HTML Markup: <input type="text" name="first_name" class="required" /> or HTML5 markup <input type="text" name="first_name" required="required" />
                 * Error format: variable defaults to FORM_VALIDATION_(FIELD_NAME)_EMPTY; if it's not set it uses var FORM_VALIDATION_FIELD_EMPTY
                 */
                //Normal markup
                if ($this.hasClass('required')) {
                    fieldOptions.push({ field: this, type: node, attribute: 'class', value: 'required', error: 'EMPTY' });
                }
                
                //HTML5 markup
                if ($this.attr('required')) {
                    fieldOptions.push({ field: this, type: node, attribute: 'required', value: 'required', error: 'EMPTY' });
                }

                /**Email Check**/
                //Normal
                if ($this.hasClass('email')) {
                    fieldOptions.push({ field: this, type: node, attribute: 'class', value: 'email', error: 'INVALID_EMAIL_ADDRESS' });
                }
                
                //HTML5
                if ($this.attr('type') === 'email') {
                    fieldOptions.push({ field: this, type: node, attribute: 'type', value: 'email', error: 'INVALID_EMAIL_ADDRESS' });
                }
                /**
                * PATTERN
                * HTML5 markup <input type="text" name="first_name" required="required" pattern="[^0-9][A-Za-z]{2,20}" />
                * Error format:
                * Suggested password pattern: ^.{6,}$  - more than 6 characters
                * Alpha/numeric with spaces and special chars
                * Different patterns here: http://html5pattern.com
                */
                //HTML5 only
                if ($this.attr('pattern')) {
                    fieldOptions.push({ field: this, type: node, attribute: 'pattern', value: '*', error: 'INVALID_PATTERN' });
                }
                
                /**
                * NUMBER
                * HTML5 markup <input type="number" name="participants" max="10" min="1" required="required" value="1" />
                * only numeric values accepted, optional min and max parameters for the values
                * Error format:
                * not a valid number - defaults to FORM_VALIDATION_(FIELD_NAME)_INVALID_NUMBER; if it's not set it uses var FORM_VALIDATION_INVALID_NUMBER
                * if number is greater than max - defaults to FORM_VALIDATION_(FIELD_NAME)_OVER_MAX; if it's not set it uses var FORM_VALIDATION_OVER_MAX
                * if number is less than min - defaults to FORM_VALIDATION_(FIELD_NAME)_UNDER_MIN; if it's not set it uses var FORM_VALIDATION_UNDER_MIN
                *
                * all error messages are parsed:
                * {minValue} and {maxValue} in the error messages are substituted with actual values
                * for example:
                *
                * FORM_VALIDATION_OVER_MAX = "Field value must be between {minValue} and {maxValue}";
                *
                * will be evaluated as:
                * Field value must be between 1 and 10
                */
                
                if ($this.attr('type') === 'number') {
                    fieldOptions.push({ field: this, type: node, attribute: 'type', value: 'number', error: 'INVALID_NUMBER' });
                }
                
            }


        }); // end each element loop

        //check for against validation rules
        for (var i = 0; i < fieldOptions.length; i += 1) {
            $.h5Form.validationRule(fieldOptions[i], errors);
        }
                

        //errors.push('test error'); // @todo: remove this debug line

        //Check if there are any Errors
        if (errors.length > 0) {

            $.h5Form.toConsole('Validation errors (' + (errors.length) + ') found on client side', 'warn');
            //$.h5Form.toConsole(errors);

            message = "FORM_VALIDATION_ERRORS_FOUND";

            $.h5Form.toggleFormInProcess.call(this, false, options);

            $.h5Form.showMessage.call(this, message, 'error', options);
            $.h5Form.showInputErrors.call(this, errors, true, options.showMultipleErrors);
            deferred.reject(); // send fail
        }

        if (errors.length === 0) {
            deferred.resolve(); // send success
        }

        return deferred.promise();

    }; //End Before Submit

    $.h5Form.onError = function (responseText) {
        console.log('error');
    };

    $.h5Form.onSuccess = function (responseText) {
        var message, responseArr;

        $.h5Form.toConsole('generic onSuccess function started');
        $.h5Form.toggleFormInProcess(false);

        /**
         * If the http header specifies application/json as the content type, then
         * the content is automatically parsed to JSON for us, otherwise do it manually
        */

        try {
            responseArr = $.parseJSON(responseText);
        } catch (e) {
            responseArr = responseText;
        }

        $.h5Form.toConsole(responseArr, 'debug');

        // if message doesn't evaluate - display as is
        message = $.h5Form.evaluateText('FORM_VALIDATION_SUCCESS_MESSAGE') || 'FORM_VALIDATION_SUCCESS_MESSAGE';

        $.h5Form.showMessage.call( this, message , 'success');
        $.h5Form.toConsole('Success Message shown');
    };


    $.h5Form.init = function (options) {
        var $form = $(this), // current Form
            cssClass = options && options.cssClass || '',
            that = this,
            eventsOptions = {}; // events options for jquery.form plugin init
            
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
        var onSuccessCustom = function () {};
        var onErrorCustom = function () {};
        var beforeSubmitCustom = function () {return true;};

        if (options && options.beforeSubmit) {
            beforeSubmitCustom = options.beforeSubmit;
        }

        if (options && options.success) {
            onSuccessCustom  = options.success;
        }

        if (options && options.error) {
            onErrorCustom  = options.error;
        }

        eventsOptions = {
            beforeSubmit: function () {
                var result;

                $.h5Form.beforeSubmit.call(that, options)
                .done(function() {
                    console.log('success in generic beforeSubmit');
                    result = beforeSubmitCustom();
                })
                .fail(function() {
                    console.log('fail in generic beforeSubmit');
                    result = false;
                });

                
                $.h5Form.toggleFormInProcess.call(that, false, options); //unblock UI

                return (result === false) ? false : true;
            },
            success: function (responseText) {
                $.h5Form.onSuccess.call(that, responseText);
                onSuccessCustom(responseText); // user-defined success scenario
            },
            error: function (responseText) {
                $.h5Form.onError.call(that, responseText);
                onErrorCustom(responseText);
            }
        };




        if ($.fn.ajaxForm) {
            $form.ajaxForm(eventsOptions);
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