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

  module('h5Form');

  test('h5Form object exists', function() {
    equal(typeof $.h5Form, "object", "h5Form object exists");

  });

  test('toConsole method', function() {

    equal($.h5Form.toConsole('test'), true, "simple console.log should work");
    equal($.h5Form.toConsole('test', 'warn'), true, "console.warn should work");
    equal($.h5Form.toConsole('test', 'error'), true, "console.error should work");
    raises(
      function () { $.h5Form.toConsole(); },
      Error,
      "console should throw an error if argument is not provided"
    );

  });

  module('initH5Form', {
    setup: function() {
      this.elems = $('#qunit-fixture').children();
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

    console.log($.h5Form.setOptions("123"));

  });




}(jQuery));
