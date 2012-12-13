function tests(){

   module("test-helpers");

   test("getType() test helper", function ()
   {
      expect(13);
      equal(getType(), 'undefined',  "getType(undefined)");
      equal(getType(null), 'null', "getType(null)");
      equal(getType(1 === 1), 'boolean', "getType(true expression)");
      equal(getType(1 === 2), 'boolean', "getType(false expression)");
      equal(getType('this is the dog'), 'string', "getType(a string)");
      equal(getType(12), 'number', "getType(12)");
      equal(getType(12.34), 'number', "getType(12.34)");
      equal(getType([12, 34]), 'array', "getType(Array)");
      equal(getType({'a': 'b'}), 'object', "getType(Object)");
      equal(getType(function () {}), 'function', "getType(function)");
      equal(getType(/this/), 'regexp', "getType(RegExp)");
      equal(getType(window), 'window', "getType(window)");
      equal(getType(new Date()), 'date', "getType(new Date())");
   });

   test("arrayLike() test helper", function ()
   {
      expect(12);

      var arrayUndef = function () {
         arrayLike();
      };
      var arrayNull = function () {
         arrayLike(null);
      };
      assertException(undefined, arrayUndef, 'arrayLike(undefined) should be exception');
      assertException(undefined, arrayNull, 'arrayLike(null) should be exception');
      equal(arrayLike(1 === 1), false, "arrayLike(true expression) should be false");
      equal(arrayLike(1 === 2), false, "arrayLike(false expression) should be false");
      equal(arrayLike('this is the dog'), true, "arrayLike(a string) should be true");
      equal(arrayLike(12), false, "arrayLike(12) should be false");
      equal(arrayLike(12.34), false, "arrayLike(12.34) should be false");
      equal(arrayLike([12, 34]), true, "arrayLike(Array) should be true");
      equal(arrayLike({'a': 'b'}), false, "arrayLike(Object) should be false");
      equal(arrayLike(function () {}), true, "arrayLike(function) should be TRUE!! really?");
      equal(arrayLike(/this/), false, "arrayLike(RegExp) should be false");
      // IE throws an exception when you try checking the window object
      //    Object doesn't support this property or method
      // Opera and Chrome considers the window object to be arrayLike
      // Firefox and safari considers the window object to be not arrayLike
      //equal(arrayLike(window), false, "arrayLike(window) should be false");
      equal(arrayLike(new Date()), false, "arrayLike(new Date()) should be false");
   });

   test("type() test helper", function ()
   {
      expect(13);
      equal(type(), 'undefined', "type(undefined)");
      equal(type(null), 'null', "type(null)");
      equal(type(1 === 1), 'boolean', "type(true expression)");
      equal(type(1 === 2), 'boolean', "type(false expression)");
      equal(type('this is the dog'), 'string', "type(a string)");
      equal(type(12), 'number', "type(12)");
      equal(type(12.34), 'number', "type(12.34)");
      equal(type([12, 34]), 'array', "type(Array)");
      equal(type({'a': 'b'}), 'object', "type(Object)");
      equal(type(function () {}), 'function', "type(function)");
      equal(type(/this/), 'regexp', "type(RegExp)");
      equal(type(window), 'window', "type(window)");
      equal(type(new Date()), 'date', "type(new Date())");
   });

   test("type_size() test helper", function ()
   {
      expect(13);
      equal(type_size(), 'undefined', "type_size(undefined)");
      equal(type_size(null), 'null', "type_size(null)");
      equal(type_size(1 === 1), 'boolean', "type_size(true expression)");
      equal(type_size(1 === 2), 'boolean', "type_size(false expression)");
      equal(type_size('this is the dog'), 'string[15]', "type_size(a string)");
      equal(type_size(12), 'number[2]', "type_size(12)");
      equal(type_size(12.34), 'number[5]', "type_size(12.34)");
      equal(type_size([12, 34]), 'array[2]', "type_size(Array)");
      equal(type_size({'a': 'b'}), 'object[1]', "type_size(Object)");
      equal(type_size(function () {}), 'function', "type_size(function)");
      equal(type_size(/this/), 'regexp', "type_size(RegExp)");
      equal(type_size(window), 'window', "type_size(window)");
      equal(type_size(new Date()), 'date', "type_size(new Date())");
   });

   test("matches() test helper", function ()
   {
      expect(4);
      matches('this is the dog', 'the dog', "Regex Match True should match");
      matches('this is the dog', 'the cat', "Regex Match False should not", false);
      matches('this is the dog', 'the dog', "Regex Match True");
      matches('this is the dog', 'the cat', "Regex Match False", false);

   });

   test("matches() test helper - failures", function ()
   {
      expect(2);
      // pending because we expect a failure in this test.
      if (pending(2))
      {
         return;
      }

      // Failure cases
      matches('this is the dog', 'the cat', "(should fail) Regex Match True should");
      matches('this is the dog', 'the dog', "(should fail) Regex Match False should not", false);

   });

   test("differs() test helper", function ()
   {
      expect(1);
      differs('this is the dog', 'the dog', "Values differ");
   });

   test("differs() test helper - failures", function ()
   {
      expect(1);
      // pending because we expect a failure in this test.
      if (pending(1))
      {
         return;
      }

      // Failure cases
      differs('this is the dog', 'this is the dog', "(should fail) Values differ");
   });

   test("assertException() test helper", function ()
   {
      expect(2);
      var throwError = function () {
         throw "AnException";
      };
      assertException(undefined, throwError, "should throw any exception");
      assertException('AnException', throwError, "should throw a AnException exception");
   });

   test("assertException() test helper - failures", function ()
   {
      expect(3);
      // pending because we expect a failure in this test.
      if (pending(3))
      {
         return;
      }

      // Failure cases
      var nothing = function () {};
      var throwError = function () {
         throw "AnException";
      };
      assertException('TheException', throwError, "(should fail) should throw a TheException exception");
      assertException('AnException', nothing, "(should fail) should throw a AnException exception");
      assertException(undefined, nothing, "(should fail) should throw any exception");
   });

   test("assertNoException() test helper", function ()
   {
      expect(1);

      // Failure cases
      var nothing = function () {};
      assertNoException(nothing, "should not throw an exception");
   });

   test("assertNoException() test helper - failures", function ()
   {
      expect(1);
      // pending because we expect a failure in this test.
      if (pending(1))
      {
         return;
      }
      var throwError = function () {
         throw "AnException";
      };
      assertNoException(throwError, "(should fail) should throw any exception");
   });

   test("debug() test helper", function ()
   {
      expect(1);
      var debugMsg = function () {
         debug('A MESSAGE');
      };
      assertNoException(debugMsg, 'debug() should not throw an exception');
   });

   test("locateDiv() test helper", function ()
   {
      expect(1);
      // pending because we expect a failure in this test.
      if (pending(1))
      {
         return;
      }
      ok(false, 'other functions are still untested');
   });
};

$(tests);