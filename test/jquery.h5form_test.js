/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function($) {

  /*
    ======== A Handy Little QUnit Reference ========
    http://docs.jquery.com/QUnit

    Test methods:
      expect(numAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      raises(block, [expected], [message])
  */

  module('H5Form', {
    setup: function() {
      //this.elems = $('#qunit-fixture').children();
      this.elems = $('<form id="qUnit" method="post" name="qUnit" action=""></form>');
    }
  });

  test('toConsole method', function() {
    $.h5Form.debug = 'on';
    equal($.h5Form.toConsole('test'), true, "simple console.log should work");
    equal($.h5Form.toConsole('test', 'warn'), true, "console.warn should work");
    equal($.h5Form.toConsole('test', 'error'), true, "console.error should work");
    raises(
      function () { $.h5Form.toConsole(); },
      Error,
      "toConsole should throw an error if argument is not provided"
    );
    raises(
      function () { $.h5Form.toConsole(['test']); },
      Error,
      "toConsole should throw an error if argument is not string"
    );

  });

  test('isValidNode method', function () {
    strictEqual($.h5Form.isValidNode('input'), true, "input field must be validated");
    strictEqual($.h5Form.isValidNode('textarea'), true, "textarea field must be validated");
    strictEqual($.h5Form.isValidNode('select'), true, "select field must be validated");
    strictEqual($.h5Form.isValidNode('button'), false, "button field shouldn't pass the validation");
    strictEqual($.h5Form.isValidNode({input: 'input'}), false, "elements other than string shouldn't pass the validation");
  });


  // test('init method', function() {

  //   strictEqual(this.elems.initH5Form().hasClass('h5form'), true, "h5form class should be applied to the form");
  //   //console.log(this);
  // });

  module('initH5Form', {
    setup: function() {
      //this.elems = $('#qunit-fixture').children();
      this.elems = $('<form id="qUnit" method="post" name="qUnit" action=""></form>');
    }
  });

  test('initH5Form is chainable', 1, function() {
    // Not a bad test to run on collection methods.
    strictEqual(this.elems.initH5Form(), this.elems, 'initH5Form should be chainable');
  });

  test('h5Form options are working', function() {
    equal(typeof $.h5Form.defaultOptions, "object", "default options should be set up correctly");
    equal(typeof $.h5Form.setOptions("123"), "object", "user can have an option not to provide options");
    equal($.h5Form.setOptions({debug: 'test'}).debug, "test", "user should be able to override default options");

  });




}(jQuery));
