'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function () {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype,
      ObjProto = Object.prototype,
      FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeBind = FuncProto.bind,
      nativeCreate = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function Ctor() {};

  // Create a safe reference to the Underscore object for use below.
  var _ = function _(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function optimizeCb(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1:
        return function (value) {
          return func.call(context, value);
        };
      case 2:
        return function (value, other) {
          return func.call(context, value, other);
        };
      case 3:
        return function (value, index, collection) {
          return func.call(context, value, index, collection);
        };
      case 4:
        return function (accumulator, value, index, collection) {
          return func.call(context, accumulator, value, index, collection);
        };
    }
    return function () {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function cb(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function (value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function createAssigner(keysFunc, undefinedOnly) {
    return function (obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function baseCreate(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor();
    Ctor.prototype = null;
    return result;
  };

  var property = function property(key) {
    return function (obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function isArrayLike(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function (obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function (obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function (obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function (obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function (obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function (value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function (obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function (obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function (obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function (obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function (obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function (value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function (obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function (obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function (obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function (obj, iteratee, context) {
    var result = -Infinity,
        lastComputed = -Infinity,
        value,
        computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function (value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function (obj, iteratee, context) {
    var result = Infinity,
        lastComputed = Infinity,
        value,
        computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function (value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function (obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function (obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function (obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function (value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function (left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function group(behavior) {
    return function (obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function (value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function (result, value, key) {
    if (_.has(result, key)) result[key].push(value);else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function (result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function (result, value, key) {
    if (_.has(result, key)) result[key]++;else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function (obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function (obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function (obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [],
        fail = [];
    _.each(obj, function (value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function (array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function (array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function (array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function (array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function (array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function flatten(input, shallow, strict, startIndex) {
    var output = [],
        idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0,
            len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function (array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function (array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function (array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function () {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function (array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function (array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function (value) {
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function () {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function (array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function (list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function (array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function (array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0,
        high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1;else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function (array, item, idx) {
      var i = 0,
          length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function (start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function (func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function bound() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function (func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function bound() {
      var position = 0,
          length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) {
        args.push(arguments[position++]);
      }return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function (obj) {
    var i,
        length = arguments.length,
        key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function (func, hasher) {
    var memoize = function memoize(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function (func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function () {
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function (func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function later() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function () {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function (func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function later() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function () {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function (func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function (predicate) {
    return function () {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function () {
    var args = arguments;
    var start = args.length - 1;
    return function () {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) {
        result = args[i].call(this, result);
      }return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function (times, func) {
    return function () {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function (times, func) {
    var memo;
    return function () {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function (obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) {
      if (_.has(obj, key)) keys.push(key);
    } // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function (obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) {
      keys.push(key);
    } // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function (obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function (obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = _.keys(obj),
        length = keys.length,
        results = {},
        currentKey;
    for (var index = 0; index < length; index++) {
      currentKey = keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function (obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function (obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function (obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function (obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj),
        key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function (object, oiteratee, context) {
    var result = {},
        obj = object,
        iteratee,
        keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function iteratee(value, key, obj) {
        return key in obj;
      };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

  // Return a copy of the object without the blacklisted properties.
  _.omit = function (obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function iteratee(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function (prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function (obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function (obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function (object, attrs) {
    var keys = _.keys(attrs),
        length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function eq(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) != 'object' || (typeof b === 'undefined' ? 'undefined' : _typeof(b)) != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor,
          bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && 'constructor' in a && 'constructor' in b) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a),
          key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function (a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function (obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function (obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function (obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function (obj) {
    var type = typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function (name) {
    _['is' + name] = function (obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function (obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && (typeof Int8Array === 'undefined' ? 'undefined' : _typeof(Int8Array)) != 'object') {
    _.isFunction = function (obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function (obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function (obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function (obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function (obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function (obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function (obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function () {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function (value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function (value) {
    return function () {
      return value;
    };
  };

  _.noop = function () {};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function (obj) {
    return obj == null ? function () {} : function (key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function (attrs) {
    attrs = _.extendOwn({}, attrs);
    return function (obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function (n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) {
      accum[i] = iteratee(i);
    }return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function (min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function () {
    return new Date().getTime();
  };

  // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function createEscaper(map) {
    var escaper = function escaper(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function (string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function (object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function (prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function escapeChar(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function (text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function template(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function (obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function result(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function (obj) {
    _.each(_.functions(obj), function (name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function () {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
    var method = ArrayProto[name];
    _.prototype[name] = function () {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function (name) {
    var method = ArrayProto[name];
    _.prototype[name] = function () {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function () {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function () {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function () {
      return _;
    });
  }
}).call(undefined);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyJdLCJuYW1lcyI6WyJyb290IiwicHJldmlvdXNVbmRlcnNjb3JlIiwiXyIsIkFycmF5UHJvdG8iLCJBcnJheSIsInByb3RvdHlwZSIsIk9ialByb3RvIiwiT2JqZWN0IiwiRnVuY1Byb3RvIiwiRnVuY3Rpb24iLCJwdXNoIiwic2xpY2UiLCJ0b1N0cmluZyIsImhhc093blByb3BlcnR5IiwibmF0aXZlSXNBcnJheSIsImlzQXJyYXkiLCJuYXRpdmVLZXlzIiwia2V5cyIsIm5hdGl2ZUJpbmQiLCJiaW5kIiwibmF0aXZlQ3JlYXRlIiwiY3JlYXRlIiwiQ3RvciIsIm9iaiIsIl93cmFwcGVkIiwiZXhwb3J0cyIsIm1vZHVsZSIsIlZFUlNJT04iLCJvcHRpbWl6ZUNiIiwiZnVuYyIsImNvbnRleHQiLCJhcmdDb3VudCIsInZhbHVlIiwiY2FsbCIsIm90aGVyIiwiaW5kZXgiLCJjb2xsZWN0aW9uIiwiYWNjdW11bGF0b3IiLCJhcHBseSIsImFyZ3VtZW50cyIsImNiIiwiaWRlbnRpdHkiLCJpc0Z1bmN0aW9uIiwiaXNPYmplY3QiLCJtYXRjaGVyIiwicHJvcGVydHkiLCJpdGVyYXRlZSIsIkluZmluaXR5IiwiY3JlYXRlQXNzaWduZXIiLCJrZXlzRnVuYyIsInVuZGVmaW5lZE9ubHkiLCJsZW5ndGgiLCJzb3VyY2UiLCJsIiwiaSIsImtleSIsImJhc2VDcmVhdGUiLCJyZXN1bHQiLCJNQVhfQVJSQVlfSU5ERVgiLCJNYXRoIiwicG93IiwiZ2V0TGVuZ3RoIiwiaXNBcnJheUxpa2UiLCJlYWNoIiwiZm9yRWFjaCIsIm1hcCIsImNvbGxlY3QiLCJyZXN1bHRzIiwiY3VycmVudEtleSIsImNyZWF0ZVJlZHVjZSIsImRpciIsIml0ZXJhdG9yIiwibWVtbyIsInJlZHVjZSIsImZvbGRsIiwiaW5qZWN0IiwicmVkdWNlUmlnaHQiLCJmb2xkciIsImZpbmQiLCJkZXRlY3QiLCJwcmVkaWNhdGUiLCJmaW5kSW5kZXgiLCJmaW5kS2V5IiwiZmlsdGVyIiwic2VsZWN0IiwibGlzdCIsInJlamVjdCIsIm5lZ2F0ZSIsImV2ZXJ5IiwiYWxsIiwic29tZSIsImFueSIsImNvbnRhaW5zIiwiaW5jbHVkZXMiLCJpbmNsdWRlIiwiaXRlbSIsImZyb21JbmRleCIsImd1YXJkIiwidmFsdWVzIiwiaW5kZXhPZiIsImludm9rZSIsIm1ldGhvZCIsImFyZ3MiLCJpc0Z1bmMiLCJwbHVjayIsIndoZXJlIiwiYXR0cnMiLCJmaW5kV2hlcmUiLCJtYXgiLCJsYXN0Q29tcHV0ZWQiLCJjb21wdXRlZCIsIm1pbiIsInNodWZmbGUiLCJzZXQiLCJzaHVmZmxlZCIsInJhbmQiLCJyYW5kb20iLCJzYW1wbGUiLCJuIiwic29ydEJ5IiwiY3JpdGVyaWEiLCJzb3J0IiwibGVmdCIsInJpZ2h0IiwiYSIsImIiLCJncm91cCIsImJlaGF2aW9yIiwiZ3JvdXBCeSIsImhhcyIsImluZGV4QnkiLCJjb3VudEJ5IiwidG9BcnJheSIsInNpemUiLCJwYXJ0aXRpb24iLCJwYXNzIiwiZmFpbCIsImZpcnN0IiwiaGVhZCIsInRha2UiLCJhcnJheSIsImluaXRpYWwiLCJsYXN0IiwicmVzdCIsInRhaWwiLCJkcm9wIiwiY29tcGFjdCIsImZsYXR0ZW4iLCJpbnB1dCIsInNoYWxsb3ciLCJzdHJpY3QiLCJzdGFydEluZGV4Iiwib3V0cHV0IiwiaWR4IiwiaXNBcmd1bWVudHMiLCJqIiwibGVuIiwid2l0aG91dCIsImRpZmZlcmVuY2UiLCJ1bmlxIiwidW5pcXVlIiwiaXNTb3J0ZWQiLCJpc0Jvb2xlYW4iLCJzZWVuIiwidW5pb24iLCJpbnRlcnNlY3Rpb24iLCJhcmdzTGVuZ3RoIiwiemlwIiwidW56aXAiLCJvYmplY3QiLCJjcmVhdGVQcmVkaWNhdGVJbmRleEZpbmRlciIsImZpbmRMYXN0SW5kZXgiLCJzb3J0ZWRJbmRleCIsImxvdyIsImhpZ2giLCJtaWQiLCJmbG9vciIsImNyZWF0ZUluZGV4RmluZGVyIiwicHJlZGljYXRlRmluZCIsImlzTmFOIiwibGFzdEluZGV4T2YiLCJyYW5nZSIsInN0YXJ0Iiwic3RvcCIsInN0ZXAiLCJjZWlsIiwiZXhlY3V0ZUJvdW5kIiwic291cmNlRnVuYyIsImJvdW5kRnVuYyIsImNhbGxpbmdDb250ZXh0Iiwic2VsZiIsIlR5cGVFcnJvciIsImJvdW5kIiwiY29uY2F0IiwicGFydGlhbCIsImJvdW5kQXJncyIsInBvc2l0aW9uIiwiYmluZEFsbCIsIkVycm9yIiwibWVtb2l6ZSIsImhhc2hlciIsImNhY2hlIiwiYWRkcmVzcyIsImRlbGF5Iiwid2FpdCIsInNldFRpbWVvdXQiLCJkZWZlciIsInRocm90dGxlIiwib3B0aW9ucyIsInRpbWVvdXQiLCJwcmV2aW91cyIsImxhdGVyIiwibGVhZGluZyIsIm5vdyIsInJlbWFpbmluZyIsImNsZWFyVGltZW91dCIsInRyYWlsaW5nIiwiZGVib3VuY2UiLCJpbW1lZGlhdGUiLCJ0aW1lc3RhbXAiLCJjYWxsTm93Iiwid3JhcCIsIndyYXBwZXIiLCJjb21wb3NlIiwiYWZ0ZXIiLCJ0aW1lcyIsImJlZm9yZSIsIm9uY2UiLCJoYXNFbnVtQnVnIiwicHJvcGVydHlJc0VudW1lcmFibGUiLCJub25FbnVtZXJhYmxlUHJvcHMiLCJjb2xsZWN0Tm9uRW51bVByb3BzIiwibm9uRW51bUlkeCIsImNvbnN0cnVjdG9yIiwicHJvdG8iLCJwcm9wIiwiYWxsS2V5cyIsIm1hcE9iamVjdCIsInBhaXJzIiwiaW52ZXJ0IiwiZnVuY3Rpb25zIiwibWV0aG9kcyIsIm5hbWVzIiwiZXh0ZW5kIiwiZXh0ZW5kT3duIiwiYXNzaWduIiwicGljayIsIm9pdGVyYXRlZSIsIm9taXQiLCJTdHJpbmciLCJkZWZhdWx0cyIsInByb3BzIiwiY2xvbmUiLCJ0YXAiLCJpbnRlcmNlcHRvciIsImlzTWF0Y2giLCJlcSIsImFTdGFjayIsImJTdGFjayIsImNsYXNzTmFtZSIsImFyZUFycmF5cyIsImFDdG9yIiwiYkN0b3IiLCJwb3AiLCJpc0VxdWFsIiwiaXNFbXB0eSIsImlzU3RyaW5nIiwiaXNFbGVtZW50Iiwibm9kZVR5cGUiLCJ0eXBlIiwibmFtZSIsIkludDhBcnJheSIsImlzRmluaXRlIiwicGFyc2VGbG9hdCIsImlzTnVtYmVyIiwiaXNOdWxsIiwiaXNVbmRlZmluZWQiLCJub0NvbmZsaWN0IiwiY29uc3RhbnQiLCJub29wIiwicHJvcGVydHlPZiIsIm1hdGNoZXMiLCJhY2N1bSIsIkRhdGUiLCJnZXRUaW1lIiwiZXNjYXBlTWFwIiwidW5lc2NhcGVNYXAiLCJjcmVhdGVFc2NhcGVyIiwiZXNjYXBlciIsIm1hdGNoIiwiam9pbiIsInRlc3RSZWdleHAiLCJSZWdFeHAiLCJyZXBsYWNlUmVnZXhwIiwic3RyaW5nIiwidGVzdCIsInJlcGxhY2UiLCJlc2NhcGUiLCJ1bmVzY2FwZSIsImZhbGxiYWNrIiwiaWRDb3VudGVyIiwidW5pcXVlSWQiLCJwcmVmaXgiLCJpZCIsInRlbXBsYXRlU2V0dGluZ3MiLCJldmFsdWF0ZSIsImludGVycG9sYXRlIiwibm9NYXRjaCIsImVzY2FwZXMiLCJlc2NhcGVDaGFyIiwidGVtcGxhdGUiLCJ0ZXh0Iiwic2V0dGluZ3MiLCJvbGRTZXR0aW5ncyIsIm9mZnNldCIsInZhcmlhYmxlIiwicmVuZGVyIiwiZSIsImRhdGEiLCJhcmd1bWVudCIsImNoYWluIiwiaW5zdGFuY2UiLCJfY2hhaW4iLCJtaXhpbiIsInZhbHVlT2YiLCJ0b0pTT04iLCJkZWZpbmUiLCJhbWQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQyxhQUFXOztBQUVWO0FBQ0E7O0FBRUE7QUFDQSxNQUFJQSxPQUFPLElBQVg7O0FBRUE7QUFDQSxNQUFJQyxxQkFBcUJELEtBQUtFLENBQTlCOztBQUVBO0FBQ0EsTUFBSUMsYUFBYUMsTUFBTUMsU0FBdkI7QUFBQSxNQUFrQ0MsV0FBV0MsT0FBT0YsU0FBcEQ7QUFBQSxNQUErREcsWUFBWUMsU0FBU0osU0FBcEY7O0FBRUE7QUFDQSxNQUNFSyxPQUFtQlAsV0FBV08sSUFEaEM7QUFBQSxNQUVFQyxRQUFtQlIsV0FBV1EsS0FGaEM7QUFBQSxN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QUFDN0IsV0FBTyxLQUFLUixRQUFaO0FBQ0QsR0FGRDs7QUFJQTtBQUNBO0FBQ0F0QixJQUFFRyxTQUFGLENBQVkrVCxPQUFaLEdBQXNCbFUsRUFBRUcsU0FBRixDQUFZZ1UsTUFBWixHQUFxQm5VLEVBQUVHLFNBQUYsQ0FBWTJCLEtBQXZEOztBQUVBOUIsSUFBRUcsU0FBRixDQUFZTyxRQUFaLEdBQXVCLFlBQVc7QUFDaEMsV0FBTyxLQUFLLEtBQUtZLFFBQWpCO0FBQ0QsR0FGRDs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUksT0FBTzhTLE1BQVAsS0FBa0IsVUFBbEIsSUFBZ0NBLE9BQU9DLEdBQTNDLEVBQWdEO0FBQzlDRCxXQUFPLFlBQVAsRUFBcUIsRUFBckIsRUFBeUIsWUFBVztBQUNsQyxhQUFPcFUsQ0FBUDtBQUNELEtBRkQ7QUFHRDtBQUNGLENBdGdEQSxFQXNnREMrQixJQXRnREQsV0FBRCIsImZpbGUiOiJ1bmRlcnNjb3JlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gICAgIFVuZGVyc2NvcmUuanMgMS44LjNcbi8vICAgICBodHRwOi8vdW5kZXJzY29yZWpzLm9yZ1xuLy8gICAgIChjKSAyMDA5LTIwMTUgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbi8vICAgICBVbmRlcnNjb3JlIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLy8gQmFzZWxpbmUgc2V0dXBcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCBpbiB0aGUgYnJvd3Nlciwgb3IgYGV4cG9ydHNgIG9uIHRoZSBzZXJ2ZXIuXG4gIHZhciByb290ID0gdGhpcztcblxuICAvLyBTYXZlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGUgYF9gIHZhcmlhYmxlLlxuICB2YXIgcHJldmlvdXNVbmRlcnNjb3JlID0gcm9vdC5fO1xuXG4gIC8vIFNhdmUgYnl0ZXMgaW4gdGhlIG1pbmlmaWVkIChidXQgbm90IGd6aXBwZWQpIHZlcnNpb246XG4gIHZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLCBPYmpQcm90byA9IE9iamVjdC5wcm90b3R5cGUsIEZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuICAvLyBDcmVhdGUgcXVpY2sgcmVmZXJlbmNlIHZhcmlhYmxlcyBmb3Igc3BlZWQgYWNjZXNzIHRvIGNvcmUgcHJvdG90eXBlcy5cbiAgdmFyXG4gICAgcHVzaCAgICAgICAgICAgICA9IEFycmF5UHJvdG8ucHVzaCxcbiAgICBzbGljZSAgICAgICAgICAgID0gQXJyYXlQcm90by5zbGljZSxcbiAgICB0b1N0cmluZyAgICAgICAgID0gT2JqUHJvdG8udG9TdHJpbmcsXG4gICAgaGFzT3duUHJvcGVydHkgICA9IE9ialByb3RvLmhhc093blByb3BlcnR5O1xuXG4gIC8vIEFsbCAqKkVDTUFTY3JpcHQgNSoqIG5hdGl2ZSBmdW5jdGlvbiBpbXBsZW1lbnRhdGlvbnMgdGhhdCB3ZSBob3BlIHRvIHVzZVxuICAvLyBhcmUgZGVjbGFyZWQgaGVyZS5cbiAgdmFyXG4gICAgbmF0aXZlSXNBcnJheSAgICAgID0gQXJyYXkuaXNBcnJheSxcbiAgICBuYXRpdmVLZXlzICAgICAgICAgPSBPYmplY3Qua2V5cyxcbiAgICBuYXRpdmVCaW5kICAgICAgICAgPSBGdW5jUHJvdG8uYmluZCxcbiAgICBuYXRpdmVDcmVhdGUgICAgICAgPSBPYmplY3QuY3JlYXRlO1xuXG4gIC8vIE5ha2VkIGZ1bmN0aW9uIHJlZmVyZW5jZSBmb3Igc3Vycm9nYXRlLXByb3RvdHlwZS1zd2FwcGluZy5cbiAgdmFyIEN0b3IgPSBmdW5jdGlvbigpe307XG5cbiAgLy8gQ3JlYXRlIGEgc2FmZSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciB1c2UgYmVsb3cuXG4gIHZhciBfID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mIF8pIHJldHVybiBvYmo7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIF8pKSByZXR1cm4gbmV3IF8ob2JqKTtcbiAgICB0aGlzLl93cmFwcGVkID0gb2JqO1xuICB9O1xuXG4gIC8vIEV4cG9ydCB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yICoqTm9kZS5qcyoqLCB3aXRoXG4gIC8vIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGZvciB0aGUgb2xkIGByZXF1aXJlKClgIEFQSS4gSWYgd2UncmUgaW5cbiAgLy8gdGhlIGJyb3dzZXIsIGFkZCBgX2AgYXMgYSBnbG9iYWwgb2JqZWN0LlxuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBfO1xuICAgIH1cbiAgICBleHBvcnRzLl8gPSBfO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuXyA9IF87XG4gIH1cblxuICAvLyBDdXJyZW50IHZlcnNpb24uXG4gIF8uVkVSU0lPTiA9ICcxLjguMyc7XG5cbiAgLy8gSW50ZXJuYWwgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGVmZmljaWVudCAoZm9yIGN1cnJlbnQgZW5naW5lcykgdmVyc2lvblxuICAvLyBvZiB0aGUgcGFzc2VkLWluIGNhbGxiYWNrLCB0byBiZSByZXBlYXRlZGx5IGFwcGxpZWQgaW4gb3RoZXIgVW5kZXJzY29yZVxuICAvLyBmdW5jdGlvbnMuXG4gIHZhciBvcHRpbWl6ZUNiID0gZnVuY3Rpb24oZnVuYywgY29udGV4dCwgYXJnQ291bnQpIHtcbiAgICBpZiAoY29udGV4dCA9PT0gdm9pZCAwKSByZXR1cm4gZnVuYztcbiAgICBzd2l0Y2ggKGFyZ0NvdW50ID09IG51bGwgPyAzIDogYXJnQ291bnQpIHtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUpO1xuICAgICAgfTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvdGhlcikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlLCBvdGhlcik7XG4gICAgICB9O1xuICAgICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgIH07XG4gICAgICBjYXNlIDQ6IHJldHVybiBmdW5jdGlvbihhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gQSBtb3N0bHktaW50ZXJuYWwgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgY2FsbGJhY2tzIHRoYXQgY2FuIGJlIGFwcGxpZWRcbiAgLy8gdG8gZWFjaCBlbGVtZW50IGluIGEgY29sbGVjdGlvbiwgcmV0dXJuaW5nIHRoZSBkZXNpcmVkIHJlc3VsdCDigJQgZWl0aGVyXG4gIC8vIGlkZW50aXR5LCBhbiBhcmJpdHJhcnkgY2FsbGJhY2ssIGEgcHJvcGVydHkgbWF0Y2hlciwgb3IgYSBwcm9wZXJ0eSBhY2Nlc3Nvci5cbiAgdmFyIGNiID0gZnVuY3Rpb24odmFsdWUsIGNvbnRleHQsIGFyZ0NvdW50KSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBfLmlkZW50aXR5O1xuICAgIGlmIChfLmlzRnVuY3Rpb24odmFsdWUpKSByZXR1cm4gb3B0aW1pemVDYih2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpO1xuICAgIGlmIChfLmlzT2JqZWN0KHZhbHVlKSkgcmV0dXJuIF8ubWF0Y2hlcih2YWx1ZSk7XG4gICAgcmV0dXJuIF8ucHJvcGVydHkodmFsdWUpO1xuICB9O1xuICBfLml0ZXJhdGVlID0gZnVuY3Rpb24odmFsdWUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gY2IodmFsdWUsIGNvbnRleHQsIEluZmluaXR5KTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgYXNzaWduZXIgZnVuY3Rpb25zLlxuICB2YXIgY3JlYXRlQXNzaWduZXIgPSBmdW5jdGlvbihrZXlzRnVuYywgdW5kZWZpbmVkT25seSkge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgaWYgKGxlbmd0aCA8IDIgfHwgb2JqID09IG51bGwpIHJldHVybiBvYmo7XG4gICAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaW5kZXhdLFxuICAgICAgICAgICAga2V5cyA9IGtleXNGdW5jKHNvdXJjZSksXG4gICAgICAgICAgICBsID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgaWYgKCF1bmRlZmluZWRPbmx5IHx8IG9ialtrZXldID09PSB2b2lkIDApIG9ialtrZXldID0gc291cmNlW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgYSBuZXcgb2JqZWN0IHRoYXQgaW5oZXJpdHMgZnJvbSBhbm90aGVyLlxuICB2YXIgYmFzZUNyZWF0ZSA9IGZ1bmN0aW9uKHByb3RvdHlwZSkge1xuICAgIGlmICghXy5pc09iamVjdChwcm90b3R5cGUpKSByZXR1cm4ge307XG4gICAgaWYgKG5hdGl2ZUNyZWF0ZSkgcmV0dXJuIG5hdGl2ZUNyZWF0ZShwcm90b3R5cGUpO1xuICAgIEN0b3IucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgIHZhciByZXN1bHQgPSBuZXcgQ3RvcjtcbiAgICBDdG9yLnByb3RvdHlwZSA9IG51bGw7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICB2YXIgcHJvcGVydHkgPSBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqID09IG51bGwgPyB2b2lkIDAgOiBvYmpba2V5XTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEhlbHBlciBmb3IgY29sbGVjdGlvbiBtZXRob2RzIHRvIGRldGVybWluZSB3aGV0aGVyIGEgY29sbGVjdGlvblxuICAvLyBzaG91bGQgYmUgaXRlcmF0ZWQgYXMgYW4gYXJyYXkgb3IgYXMgYW4gb2JqZWN0XG4gIC8vIFJlbGF0ZWQ6IGh0dHA6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLXRvbGVuZ3RoXG4gIC8vIEF2b2lkcyBhIHZlcnkgbmFzdHkgaU9TIDggSklUIGJ1ZyBvbiBBUk0tNjQuICMyMDk0XG4gIHZhciBNQVhfQVJSQVlfSU5ERVggPSBNYXRoLnBvdygyLCA1MykgLSAxO1xuICB2YXIgZ2V0TGVuZ3RoID0gcHJvcGVydHkoJ2xlbmd0aCcpO1xuICB2YXIgaXNBcnJheUxpa2UgPSBmdW5jdGlvbihjb2xsZWN0aW9uKSB7XG4gICAgdmFyIGxlbmd0aCA9IGdldExlbmd0aChjb2xsZWN0aW9uKTtcbiAgICByZXR1cm4gdHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJyAmJiBsZW5ndGggPj0gMCAmJiBsZW5ndGggPD0gTUFYX0FSUkFZX0lOREVYO1xuICB9O1xuXG4gIC8vIENvbGxlY3Rpb24gRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gVGhlIGNvcm5lcnN0b25lLCBhbiBgZWFjaGAgaW1wbGVtZW50YXRpb24sIGFrYSBgZm9yRWFjaGAuXG4gIC8vIEhhbmRsZXMgcmF3IG9iamVjdHMgaW4gYWRkaXRpb24gdG8gYXJyYXktbGlrZXMuIFRyZWF0cyBhbGxcbiAgLy8gc3BhcnNlIGFycmF5LWxpa2VzIGFzIGlmIHRoZXkgd2VyZSBkZW5zZS5cbiAgXy5lYWNoID0gXy5mb3JFYWNoID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gb3B0aW1pemVDYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIGksIGxlbmd0aDtcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSkge1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZXJhdGVlKG9ialtpXSwgaSwgb2JqKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlcmF0ZWUob2JqW2tleXNbaV1dLCBrZXlzW2ldLCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgcmVzdWx0cyBvZiBhcHBseWluZyB0aGUgaXRlcmF0ZWUgdG8gZWFjaCBlbGVtZW50LlxuICBfLm1hcCA9IF8uY29sbGVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aCxcbiAgICAgICAgcmVzdWx0cyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIHJlc3VsdHNbaW5kZXhdID0gaXRlcmF0ZWUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBDcmVhdGUgYSByZWR1Y2luZyBmdW5jdGlvbiBpdGVyYXRpbmcgbGVmdCBvciByaWdodC5cbiAgZnVuY3Rpb24gY3JlYXRlUmVkdWNlKGRpcikge1xuICAgIC8vIE9wdGltaXplZCBpdGVyYXRvciBmdW5jdGlvbiBhcyB1c2luZyBhcmd1bWVudHMubGVuZ3RoXG4gICAgLy8gaW4gdGhlIG1haW4gZnVuY3Rpb24gd2lsbCBkZW9wdGltaXplIHRoZSwgc2VlICMxOTkxLlxuICAgIGZ1bmN0aW9uIGl0ZXJhdG9yKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGtleXMsIGluZGV4LCBsZW5ndGgpIHtcbiAgICAgIGZvciAoOyBpbmRleCA+PSAwICYmIGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSBkaXIpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgICAgbWVtbyA9IGl0ZXJhdGVlKG1lbW8sIG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBtZW1vLCBjb250ZXh0KSB7XG4gICAgICBpdGVyYXRlZSA9IG9wdGltaXplQ2IoaXRlcmF0ZWUsIGNvbnRleHQsIDQpO1xuICAgICAgdmFyIGtleXMgPSAhaXNBcnJheUxpa2Uob2JqKSAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aCxcbiAgICAgICAgICBpbmRleCA9IGRpciA+IDAgPyAwIDogbGVuZ3RoIC0gMTtcbiAgICAgIC8vIERldGVybWluZSB0aGUgaW5pdGlhbCB2YWx1ZSBpZiBub25lIGlzIHByb3ZpZGVkLlxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG4gICAgICAgIG1lbW8gPSBvYmpba2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXhdO1xuICAgICAgICBpbmRleCArPSBkaXI7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXRlcmF0b3Iob2JqLCBpdGVyYXRlZSwgbWVtbywga2V5cywgaW5kZXgsIGxlbmd0aCk7XG4gICAgfTtcbiAgfVxuXG4gIC8vICoqUmVkdWNlKiogYnVpbGRzIHVwIGEgc2luZ2xlIHJlc3VsdCBmcm9tIGEgbGlzdCBvZiB2YWx1ZXMsIGFrYSBgaW5qZWN0YCxcbiAgLy8gb3IgYGZvbGRsYC5cbiAgXy5yZWR1Y2UgPSBfLmZvbGRsID0gXy5pbmplY3QgPSBjcmVhdGVSZWR1Y2UoMSk7XG5cbiAgLy8gVGhlIHJpZ2h0LWFzc29jaWF0aXZlIHZlcnNpb24gb2YgcmVkdWNlLCBhbHNvIGtub3duIGFzIGBmb2xkcmAuXG4gIF8ucmVkdWNlUmlnaHQgPSBfLmZvbGRyID0gY3JlYXRlUmVkdWNlKC0xKTtcblxuICAvLyBSZXR1cm4gdGhlIGZpcnN0IHZhbHVlIHdoaWNoIHBhc3NlcyBhIHRydXRoIHRlc3QuIEFsaWFzZWQgYXMgYGRldGVjdGAuXG4gIF8uZmluZCA9IF8uZGV0ZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIga2V5O1xuICAgIGlmIChpc0FycmF5TGlrZShvYmopKSB7XG4gICAgICBrZXkgPSBfLmZpbmRJbmRleChvYmosIHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtleSA9IF8uZmluZEtleShvYmosIHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgfVxuICAgIGlmIChrZXkgIT09IHZvaWQgMCAmJiBrZXkgIT09IC0xKSByZXR1cm4gb2JqW2tleV07XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgdGhhdCBwYXNzIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgc2VsZWN0YC5cbiAgXy5maWx0ZXIgPSBfLnNlbGVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKHByZWRpY2F0ZSh2YWx1ZSwgaW5kZXgsIGxpc3QpKSByZXN1bHRzLnB1c2godmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIGZvciB3aGljaCBhIHRydXRoIHRlc3QgZmFpbHMuXG4gIF8ucmVqZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBfLm5lZ2F0ZShjYihwcmVkaWNhdGUpKSwgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgYWxsIG9mIHRoZSBlbGVtZW50cyBtYXRjaCBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYGFsbGAuXG4gIF8uZXZlcnkgPSBfLmFsbCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgaWYgKCFwcmVkaWNhdGUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiBhdCBsZWFzdCBvbmUgZWxlbWVudCBpbiB0aGUgb2JqZWN0IG1hdGNoZXMgYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBhbnlgLlxuICBfLnNvbWUgPSBfLmFueSA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgaWYgKHByZWRpY2F0ZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaikpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIHRoZSBhcnJheSBvciBvYmplY3QgY29udGFpbnMgYSBnaXZlbiBpdGVtICh1c2luZyBgPT09YCkuXG4gIC8vIEFsaWFzZWQgYXMgYGluY2x1ZGVzYCBhbmQgYGluY2x1ZGVgLlxuICBfLmNvbnRhaW5zID0gXy5pbmNsdWRlcyA9IF8uaW5jbHVkZSA9IGZ1bmN0aW9uKG9iaiwgaXRlbSwgZnJvbUluZGV4LCBndWFyZCkge1xuICAgIGlmICghaXNBcnJheUxpa2Uob2JqKSkgb2JqID0gXy52YWx1ZXMob2JqKTtcbiAgICBpZiAodHlwZW9mIGZyb21JbmRleCAhPSAnbnVtYmVyJyB8fCBndWFyZCkgZnJvbUluZGV4ID0gMDtcbiAgICByZXR1cm4gXy5pbmRleE9mKG9iaiwgaXRlbSwgZnJvbUluZGV4KSA+PSAwO1xuICB9O1xuXG4gIC8vIEludm9rZSBhIG1ldGhvZCAod2l0aCBhcmd1bWVudHMpIG9uIGV2ZXJ5IGl0ZW0gaW4gYSBjb2xsZWN0aW9uLlxuICBfLmludm9rZSA9IGZ1bmN0aW9uKG9iaiwgbWV0aG9kKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgdmFyIGlzRnVuYyA9IF8uaXNGdW5jdGlvbihtZXRob2QpO1xuICAgIHJldHVybiBfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICB2YXIgZnVuYyA9IGlzRnVuYyA/IG1ldGhvZCA6IHZhbHVlW21ldGhvZF07XG4gICAgICByZXR1cm4gZnVuYyA9PSBudWxsID8gZnVuYyA6IGZ1bmMuYXBwbHkodmFsdWUsIGFyZ3MpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYG1hcGA6IGZldGNoaW5nIGEgcHJvcGVydHkuXG4gIF8ucGx1Y2sgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBfLm1hcChvYmosIF8ucHJvcGVydHkoa2V5KSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmlsdGVyYDogc2VsZWN0aW5nIG9ubHkgb2JqZWN0c1xuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLndoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIF8ubWF0Y2hlcihhdHRycykpO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbmRgOiBnZXR0aW5nIHRoZSBmaXJzdCBvYmplY3RcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy5maW5kV2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8uZmluZChvYmosIF8ubWF0Y2hlcihhdHRycykpO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWF4aW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5tYXggPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IC1JbmZpbml0eSwgbGFzdENvbXB1dGVkID0gLUluZmluaXR5LFxuICAgICAgICB2YWx1ZSwgY29tcHV0ZWQ7XG4gICAgaWYgKGl0ZXJhdGVlID09IG51bGwgJiYgb2JqICE9IG51bGwpIHtcbiAgICAgIG9iaiA9IGlzQXJyYXlMaWtlKG9iaikgPyBvYmogOiBfLnZhbHVlcyhvYmopO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IG9iai5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YWx1ZSA9IG9ialtpXTtcbiAgICAgICAgaWYgKHZhbHVlID4gcmVzdWx0KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgY29tcHV0ZWQgPSBpdGVyYXRlZSh2YWx1ZSwgaW5kZXgsIGxpc3QpO1xuICAgICAgICBpZiAoY29tcHV0ZWQgPiBsYXN0Q29tcHV0ZWQgfHwgY29tcHV0ZWQgPT09IC1JbmZpbml0eSAmJiByZXN1bHQgPT09IC1JbmZpbml0eSkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgIGxhc3RDb21wdXRlZCA9IGNvbXB1dGVkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1pbmltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWluID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSBJbmZpbml0eSwgbGFzdENvbXB1dGVkID0gSW5maW5pdHksXG4gICAgICAgIHZhbHVlLCBjb21wdXRlZDtcbiAgICBpZiAoaXRlcmF0ZWUgPT0gbnVsbCAmJiBvYmogIT0gbnVsbCkge1xuICAgICAgb2JqID0gaXNBcnJheUxpa2Uob2JqKSA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gb2JqW2ldO1xuICAgICAgICBpZiAodmFsdWUgPCByZXN1bHQpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgICAgIGlmIChjb21wdXRlZCA8IGxhc3RDb21wdXRlZCB8fCBjb21wdXRlZCA9PT0gSW5maW5pdHkgJiYgcmVzdWx0ID09PSBJbmZpbml0eSkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgIGxhc3RDb21wdXRlZCA9IGNvbXB1dGVkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBTaHVmZmxlIGEgY29sbGVjdGlvbiwgdXNpbmcgdGhlIG1vZGVybiB2ZXJzaW9uIG9mIHRoZVxuICAvLyBbRmlzaGVyLVlhdGVzIHNodWZmbGVdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRmlzaGVy4oCTWWF0ZXNfc2h1ZmZsZSkuXG4gIF8uc2h1ZmZsZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBzZXQgPSBpc0FycmF5TGlrZShvYmopID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0gc2V0Lmxlbmd0aDtcbiAgICB2YXIgc2h1ZmZsZWQgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGluZGV4ID0gMCwgcmFuZDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHJhbmQgPSBfLnJhbmRvbSgwLCBpbmRleCk7XG4gICAgICBpZiAocmFuZCAhPT0gaW5kZXgpIHNodWZmbGVkW2luZGV4XSA9IHNodWZmbGVkW3JhbmRdO1xuICAgICAgc2h1ZmZsZWRbcmFuZF0gPSBzZXRbaW5kZXhdO1xuICAgIH1cbiAgICByZXR1cm4gc2h1ZmZsZWQ7XG4gIH07XG5cbiAgLy8gU2FtcGxlICoqbioqIHJhbmRvbSB2YWx1ZXMgZnJvbSBhIGNvbGxlY3Rpb24uXG4gIC8vIElmICoqbioqIGlzIG5vdCBzcGVjaWZpZWQsIHJldHVybnMgYSBzaW5nbGUgcmFuZG9tIGVsZW1lbnQuXG4gIC8vIFRoZSBpbnRlcm5hbCBgZ3VhcmRgIGFyZ3VtZW50IGFsbG93cyBpdCB0byB3b3JrIHdpdGggYG1hcGAuXG4gIF8uc2FtcGxlID0gZnVuY3Rpb24ob2JqLCBuLCBndWFyZCkge1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHtcbiAgICAgIGlmICghaXNBcnJheUxpa2Uob2JqKSkgb2JqID0gXy52YWx1ZXMob2JqKTtcbiAgICAgIHJldHVybiBvYmpbXy5yYW5kb20ob2JqLmxlbmd0aCAtIDEpXTtcbiAgICB9XG4gICAgcmV0dXJuIF8uc2h1ZmZsZShvYmopLnNsaWNlKDAsIE1hdGgubWF4KDAsIG4pKTtcbiAgfTtcblxuICAvLyBTb3J0IHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24gcHJvZHVjZWQgYnkgYW4gaXRlcmF0ZWUuXG4gIF8uc29ydEJ5ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHJldHVybiBfLnBsdWNrKF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgY3JpdGVyaWE6IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdClcbiAgICAgIH07XG4gICAgfSkuc29ydChmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhO1xuICAgICAgdmFyIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgIGlmIChhICE9PSBiKSB7XG4gICAgICAgIGlmIChhID4gYiB8fCBhID09PSB2b2lkIDApIHJldHVybiAxO1xuICAgICAgICBpZiAoYSA8IGIgfHwgYiA9PT0gdm9pZCAwKSByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGVmdC5pbmRleCAtIHJpZ2h0LmluZGV4O1xuICAgIH0pLCAndmFsdWUnKTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiB1c2VkIGZvciBhZ2dyZWdhdGUgXCJncm91cCBieVwiIG9wZXJhdGlvbnMuXG4gIHZhciBncm91cCA9IGZ1bmN0aW9uKGJlaGF2aW9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgIHZhciBrZXkgPSBpdGVyYXRlZSh2YWx1ZSwgaW5kZXgsIG9iaik7XG4gICAgICAgIGJlaGF2aW9yKHJlc3VsdCwgdmFsdWUsIGtleSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBHcm91cHMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbi4gUGFzcyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlXG4gIC8vIHRvIGdyb3VwIGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY3JpdGVyaW9uLlxuICBfLmdyb3VwQnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICBpZiAoXy5oYXMocmVzdWx0LCBrZXkpKSByZXN1bHRba2V5XS5wdXNoKHZhbHVlKTsgZWxzZSByZXN1bHRba2V5XSA9IFt2YWx1ZV07XG4gIH0pO1xuXG4gIC8vIEluZGV4ZXMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiwgc2ltaWxhciB0byBgZ3JvdXBCeWAsIGJ1dCBmb3JcbiAgLy8gd2hlbiB5b3Uga25vdyB0aGF0IHlvdXIgaW5kZXggdmFsdWVzIHdpbGwgYmUgdW5pcXVlLlxuICBfLmluZGV4QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICB9KTtcblxuICAvLyBDb3VudHMgaW5zdGFuY2VzIG9mIGFuIG9iamVjdCB0aGF0IGdyb3VwIGJ5IGEgY2VydGFpbiBjcml0ZXJpb24uIFBhc3NcbiAgLy8gZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZSB0byBjb3VudCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlXG4gIC8vIGNyaXRlcmlvbi5cbiAgXy5jb3VudEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgaWYgKF8uaGFzKHJlc3VsdCwga2V5KSkgcmVzdWx0W2tleV0rKzsgZWxzZSByZXN1bHRba2V5XSA9IDE7XG4gIH0pO1xuXG4gIC8vIFNhZmVseSBjcmVhdGUgYSByZWFsLCBsaXZlIGFycmF5IGZyb20gYW55dGhpbmcgaXRlcmFibGUuXG4gIF8udG9BcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghb2JqKSByZXR1cm4gW107XG4gICAgaWYgKF8uaXNBcnJheShvYmopKSByZXR1cm4gc2xpY2UuY2FsbChvYmopO1xuICAgIGlmIChpc0FycmF5TGlrZShvYmopKSByZXR1cm4gXy5tYXAob2JqLCBfLmlkZW50aXR5KTtcbiAgICByZXR1cm4gXy52YWx1ZXMob2JqKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiBhbiBvYmplY3QuXG4gIF8uc2l6ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIDA7XG4gICAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iaikgPyBvYmoubGVuZ3RoIDogXy5rZXlzKG9iaikubGVuZ3RoO1xuICB9O1xuXG4gIC8vIFNwbGl0IGEgY29sbGVjdGlvbiBpbnRvIHR3byBhcnJheXM6IG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgc2F0aXNmeSB0aGUgZ2l2ZW5cbiAgLy8gcHJlZGljYXRlLCBhbmQgb25lIHdob3NlIGVsZW1lbnRzIGFsbCBkbyBub3Qgc2F0aXNmeSB0aGUgcHJlZGljYXRlLlxuICBfLnBhcnRpdGlvbiA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIgcGFzcyA9IFtdLCBmYWlsID0gW107XG4gICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqKSB7XG4gICAgICAocHJlZGljYXRlKHZhbHVlLCBrZXksIG9iaikgPyBwYXNzIDogZmFpbCkucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtwYXNzLCBmYWlsXTtcbiAgfTtcblxuICAvLyBBcnJheSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gR2V0IHRoZSBmaXJzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBmaXJzdCBOXG4gIC8vIHZhbHVlcyBpbiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYGhlYWRgIGFuZCBgdGFrZWAuIFRoZSAqKmd1YXJkKiogY2hlY2tcbiAgLy8gYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLmZpcnN0ID0gXy5oZWFkID0gXy50YWtlID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkgcmV0dXJuIGFycmF5WzBdO1xuICAgIHJldHVybiBfLmluaXRpYWwoYXJyYXksIGFycmF5Lmxlbmd0aCAtIG4pO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGxhc3QgZW50cnkgb2YgdGhlIGFycmF5LiBFc3BlY2lhbGx5IHVzZWZ1bCBvblxuICAvLyB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiBhbGwgdGhlIHZhbHVlcyBpblxuICAvLyB0aGUgYXJyYXksIGV4Y2x1ZGluZyB0aGUgbGFzdCBOLlxuICBfLmluaXRpYWwgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgMCwgTWF0aC5tYXgoMCwgYXJyYXkubGVuZ3RoIC0gKG4gPT0gbnVsbCB8fCBndWFyZCA/IDEgOiBuKSkpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgbGFzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBsYXN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS5cbiAgXy5sYXN0ID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiBfLnJlc3QoYXJyYXksIE1hdGgubWF4KDAsIGFycmF5Lmxlbmd0aCAtIG4pKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBmaXJzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYHRhaWxgIGFuZCBgZHJvcGAuXG4gIC8vIEVzcGVjaWFsbHkgdXNlZnVsIG9uIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nIGFuICoqbioqIHdpbGwgcmV0dXJuXG4gIC8vIHRoZSByZXN0IE4gdmFsdWVzIGluIHRoZSBhcnJheS5cbiAgXy5yZXN0ID0gXy50YWlsID0gXy5kcm9wID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIG4gPT0gbnVsbCB8fCBndWFyZCA/IDEgOiBuKTtcbiAgfTtcblxuICAvLyBUcmltIG91dCBhbGwgZmFsc3kgdmFsdWVzIGZyb20gYW4gYXJyYXkuXG4gIF8uY29tcGFjdCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBfLmlkZW50aXR5KTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBpbXBsZW1lbnRhdGlvbiBvZiBhIHJlY3Vyc2l2ZSBgZmxhdHRlbmAgZnVuY3Rpb24uXG4gIHZhciBmbGF0dGVuID0gZnVuY3Rpb24oaW5wdXQsIHNoYWxsb3csIHN0cmljdCwgc3RhcnRJbmRleCkge1xuICAgIHZhciBvdXRwdXQgPSBbXSwgaWR4ID0gMDtcbiAgICBmb3IgKHZhciBpID0gc3RhcnRJbmRleCB8fCAwLCBsZW5ndGggPSBnZXRMZW5ndGgoaW5wdXQpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IGlucHV0W2ldO1xuICAgICAgaWYgKGlzQXJyYXlMaWtlKHZhbHVlKSAmJiAoXy5pc0FycmF5KHZhbHVlKSB8fCBfLmlzQXJndW1lbnRzKHZhbHVlKSkpIHtcbiAgICAgICAgLy9mbGF0dGVuIGN1cnJlbnQgbGV2ZWwgb2YgYXJyYXkgb3IgYXJndW1lbnRzIG9iamVjdFxuICAgICAgICBpZiAoIXNoYWxsb3cpIHZhbHVlID0gZmxhdHRlbih2YWx1ZSwgc2hhbGxvdywgc3RyaWN0KTtcbiAgICAgICAgdmFyIGogPSAwLCBsZW4gPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgIG91dHB1dC5sZW5ndGggKz0gbGVuO1xuICAgICAgICB3aGlsZSAoaiA8IGxlbikge1xuICAgICAgICAgIG91dHB1dFtpZHgrK10gPSB2YWx1ZVtqKytdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFzdHJpY3QpIHtcbiAgICAgICAgb3V0cHV0W2lkeCsrXSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9O1xuXG4gIC8vIEZsYXR0ZW4gb3V0IGFuIGFycmF5LCBlaXRoZXIgcmVjdXJzaXZlbHkgKGJ5IGRlZmF1bHQpLCBvciBqdXN0IG9uZSBsZXZlbC5cbiAgXy5mbGF0dGVuID0gZnVuY3Rpb24oYXJyYXksIHNoYWxsb3cpIHtcbiAgICByZXR1cm4gZmxhdHRlbihhcnJheSwgc2hhbGxvdywgZmFsc2UpO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHZlcnNpb24gb2YgdGhlIGFycmF5IHRoYXQgZG9lcyBub3QgY29udGFpbiB0aGUgc3BlY2lmaWVkIHZhbHVlKHMpLlxuICBfLndpdGhvdXQgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHJldHVybiBfLmRpZmZlcmVuY2UoYXJyYXksIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhIGR1cGxpY2F0ZS1mcmVlIHZlcnNpb24gb2YgdGhlIGFycmF5LiBJZiB0aGUgYXJyYXkgaGFzIGFscmVhZHlcbiAgLy8gYmVlbiBzb3J0ZWQsIHlvdSBoYXZlIHRoZSBvcHRpb24gb2YgdXNpbmcgYSBmYXN0ZXIgYWxnb3JpdGhtLlxuICAvLyBBbGlhc2VkIGFzIGB1bmlxdWVgLlxuICBfLnVuaXEgPSBfLnVuaXF1ZSA9IGZ1bmN0aW9uKGFycmF5LCBpc1NvcnRlZCwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpZiAoIV8uaXNCb29sZWFuKGlzU29ydGVkKSkge1xuICAgICAgY29udGV4dCA9IGl0ZXJhdGVlO1xuICAgICAgaXRlcmF0ZWUgPSBpc1NvcnRlZDtcbiAgICAgIGlzU29ydGVkID0gZmFsc2U7XG4gICAgfVxuICAgIGlmIChpdGVyYXRlZSAhPSBudWxsKSBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdmFyIHNlZW4gPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdmFsdWUgPSBhcnJheVtpXSxcbiAgICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlID8gaXRlcmF0ZWUodmFsdWUsIGksIGFycmF5KSA6IHZhbHVlO1xuICAgICAgaWYgKGlzU29ydGVkKSB7XG4gICAgICAgIGlmICghaSB8fCBzZWVuICE9PSBjb21wdXRlZCkgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICBzZWVuID0gY29tcHV0ZWQ7XG4gICAgICB9IGVsc2UgaWYgKGl0ZXJhdGVlKSB7XG4gICAgICAgIGlmICghXy5jb250YWlucyhzZWVuLCBjb21wdXRlZCkpIHtcbiAgICAgICAgICBzZWVuLnB1c2goY29tcHV0ZWQpO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghXy5jb250YWlucyhyZXN1bHQsIHZhbHVlKSkge1xuICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB1bmlvbjogZWFjaCBkaXN0aW5jdCBlbGVtZW50IGZyb20gYWxsIG9mXG4gIC8vIHRoZSBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLnVuaW9uID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8udW5pcShmbGF0dGVuKGFyZ3VtZW50cywgdHJ1ZSwgdHJ1ZSkpO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyBldmVyeSBpdGVtIHNoYXJlZCBiZXR3ZWVuIGFsbCB0aGVcbiAgLy8gcGFzc2VkLWluIGFycmF5cy5cbiAgXy5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgYXJnc0xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGl0ZW0gPSBhcnJheVtpXTtcbiAgICAgIGlmIChfLmNvbnRhaW5zKHJlc3VsdCwgaXRlbSkpIGNvbnRpbnVlO1xuICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCBhcmdzTGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYgKCFfLmNvbnRhaW5zKGFyZ3VtZW50c1tqXSwgaXRlbSkpIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKGogPT09IGFyZ3NMZW5ndGgpIHJlc3VsdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFRha2UgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBvbmUgYXJyYXkgYW5kIGEgbnVtYmVyIG9mIG90aGVyIGFycmF5cy5cbiAgLy8gT25seSB0aGUgZWxlbWVudHMgcHJlc2VudCBpbiBqdXN0IHRoZSBmaXJzdCBhcnJheSB3aWxsIHJlbWFpbi5cbiAgXy5kaWZmZXJlbmNlID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgcmVzdCA9IGZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCB0cnVlLCAxKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIHJldHVybiAhXy5jb250YWlucyhyZXN0LCB2YWx1ZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gWmlwIHRvZ2V0aGVyIG11bHRpcGxlIGxpc3RzIGludG8gYSBzaW5nbGUgYXJyYXkgLS0gZWxlbWVudHMgdGhhdCBzaGFyZVxuICAvLyBhbiBpbmRleCBnbyB0b2dldGhlci5cbiAgXy56aXAgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy51bnppcChhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8vIENvbXBsZW1lbnQgb2YgXy56aXAuIFVuemlwIGFjY2VwdHMgYW4gYXJyYXkgb2YgYXJyYXlzIGFuZCBncm91cHNcbiAgLy8gZWFjaCBhcnJheSdzIGVsZW1lbnRzIG9uIHNoYXJlZCBpbmRpY2VzXG4gIF8udW56aXAgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciBsZW5ndGggPSBhcnJheSAmJiBfLm1heChhcnJheSwgZ2V0TGVuZ3RoKS5sZW5ndGggfHwgMDtcbiAgICB2YXIgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHJlc3VsdFtpbmRleF0gPSBfLnBsdWNrKGFycmF5LCBpbmRleCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gQ29udmVydHMgbGlzdHMgaW50byBvYmplY3RzLiBQYXNzIGVpdGhlciBhIHNpbmdsZSBhcnJheSBvZiBgW2tleSwgdmFsdWVdYFxuICAvLyBwYWlycywgb3IgdHdvIHBhcmFsbGVsIGFycmF5cyBvZiB0aGUgc2FtZSBsZW5ndGggLS0gb25lIG9mIGtleXMsIGFuZCBvbmUgb2ZcbiAgLy8gdGhlIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICBfLm9iamVjdCA9IGZ1bmN0aW9uKGxpc3QsIHZhbHVlcykge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZ2V0TGVuZ3RoKGxpc3QpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh2YWx1ZXMpIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1dID0gdmFsdWVzW2ldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1bMF1dID0gbGlzdFtpXVsxXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBHZW5lcmF0b3IgZnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBmaW5kSW5kZXggYW5kIGZpbmRMYXN0SW5kZXggZnVuY3Rpb25zXG4gIGZ1bmN0aW9uIGNyZWF0ZVByZWRpY2F0ZUluZGV4RmluZGVyKGRpcikge1xuICAgIHJldHVybiBmdW5jdGlvbihhcnJheSwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgICAgdmFyIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7XG4gICAgICB2YXIgaW5kZXggPSBkaXIgPiAwID8gMCA6IGxlbmd0aCAtIDE7XG4gICAgICBmb3IgKDsgaW5kZXggPj0gMCAmJiBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gZGlyKSB7XG4gICAgICAgIGlmIChwcmVkaWNhdGUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpKSByZXR1cm4gaW5kZXg7XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfVxuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGluZGV4IG9uIGFuIGFycmF5LWxpa2UgdGhhdCBwYXNzZXMgYSBwcmVkaWNhdGUgdGVzdFxuICBfLmZpbmRJbmRleCA9IGNyZWF0ZVByZWRpY2F0ZUluZGV4RmluZGVyKDEpO1xuICBfLmZpbmRMYXN0SW5kZXggPSBjcmVhdGVQcmVkaWNhdGVJbmRleEZpbmRlcigtMSk7XG5cbiAgLy8gVXNlIGEgY29tcGFyYXRvciBmdW5jdGlvbiB0byBmaWd1cmUgb3V0IHRoZSBzbWFsbGVzdCBpbmRleCBhdCB3aGljaFxuICAvLyBhbiBvYmplY3Qgc2hvdWxkIGJlIGluc2VydGVkIHNvIGFzIHRvIG1haW50YWluIG9yZGVyLiBVc2VzIGJpbmFyeSBzZWFyY2guXG4gIF8uc29ydGVkSW5kZXggPSBmdW5jdGlvbihhcnJheSwgb2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQsIDEpO1xuICAgIHZhciB2YWx1ZSA9IGl0ZXJhdGVlKG9iaik7XG4gICAgdmFyIGxvdyA9IDAsIGhpZ2ggPSBnZXRMZW5ndGgoYXJyYXkpO1xuICAgIHdoaWxlIChsb3cgPCBoaWdoKSB7XG4gICAgICB2YXIgbWlkID0gTWF0aC5mbG9vcigobG93ICsgaGlnaCkgLyAyKTtcbiAgICAgIGlmIChpdGVyYXRlZShhcnJheVttaWRdKSA8IHZhbHVlKSBsb3cgPSBtaWQgKyAxOyBlbHNlIGhpZ2ggPSBtaWQ7XG4gICAgfVxuICAgIHJldHVybiBsb3c7XG4gIH07XG5cbiAgLy8gR2VuZXJhdG9yIGZ1bmN0aW9uIHRvIGNyZWF0ZSB0aGUgaW5kZXhPZiBhbmQgbGFzdEluZGV4T2YgZnVuY3Rpb25zXG4gIGZ1bmN0aW9uIGNyZWF0ZUluZGV4RmluZGVyKGRpciwgcHJlZGljYXRlRmluZCwgc29ydGVkSW5kZXgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXJyYXksIGl0ZW0sIGlkeCkge1xuICAgICAgdmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgoYXJyYXkpO1xuICAgICAgaWYgKHR5cGVvZiBpZHggPT0gJ251bWJlcicpIHtcbiAgICAgICAgaWYgKGRpciA+IDApIHtcbiAgICAgICAgICAgIGkgPSBpZHggPj0gMCA/IGlkeCA6IE1hdGgubWF4KGlkeCArIGxlbmd0aCwgaSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZW5ndGggPSBpZHggPj0gMCA/IE1hdGgubWluKGlkeCArIDEsIGxlbmd0aCkgOiBpZHggKyBsZW5ndGggKyAxO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHNvcnRlZEluZGV4ICYmIGlkeCAmJiBsZW5ndGgpIHtcbiAgICAgICAgaWR4ID0gc29ydGVkSW5kZXgoYXJyYXksIGl0ZW0pO1xuICAgICAgICByZXR1cm4gYXJyYXlbaWR4XSA9PT0gaXRlbSA/IGlkeCA6IC0xO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW0gIT09IGl0ZW0pIHtcbiAgICAgICAgaWR4ID0gcHJlZGljYXRlRmluZChzbGljZS5jYWxsKGFycmF5LCBpLCBsZW5ndGgpLCBfLmlzTmFOKTtcbiAgICAgICAgcmV0dXJuIGlkeCA+PSAwID8gaWR4ICsgaSA6IC0xO1xuICAgICAgfVxuICAgICAgZm9yIChpZHggPSBkaXIgPiAwID8gaSA6IGxlbmd0aCAtIDE7IGlkeCA+PSAwICYmIGlkeCA8IGxlbmd0aDsgaWR4ICs9IGRpcikge1xuICAgICAgICBpZiAoYXJyYXlbaWR4XSA9PT0gaXRlbSkgcmV0dXJuIGlkeDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSBwb3NpdGlvbiBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBhbiBpdGVtIGluIGFuIGFycmF5LFxuICAvLyBvciAtMSBpZiB0aGUgaXRlbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhlIGFycmF5LlxuICAvLyBJZiB0aGUgYXJyYXkgaXMgbGFyZ2UgYW5kIGFscmVhZHkgaW4gc29ydCBvcmRlciwgcGFzcyBgdHJ1ZWBcbiAgLy8gZm9yICoqaXNTb3J0ZWQqKiB0byB1c2UgYmluYXJ5IHNlYXJjaC5cbiAgXy5pbmRleE9mID0gY3JlYXRlSW5kZXhGaW5kZXIoMSwgXy5maW5kSW5kZXgsIF8uc29ydGVkSW5kZXgpO1xuICBfLmxhc3RJbmRleE9mID0gY3JlYXRlSW5kZXhGaW5kZXIoLTEsIF8uZmluZExhc3RJbmRleCk7XG5cbiAgLy8gR2VuZXJhdGUgYW4gaW50ZWdlciBBcnJheSBjb250YWluaW5nIGFuIGFyaXRobWV0aWMgcHJvZ3Jlc3Npb24uIEEgcG9ydCBvZlxuICAvLyB0aGUgbmF0aXZlIFB5dGhvbiBgcmFuZ2UoKWAgZnVuY3Rpb24uIFNlZVxuICAvLyBbdGhlIFB5dGhvbiBkb2N1bWVudGF0aW9uXShodHRwOi8vZG9jcy5weXRob24ub3JnL2xpYnJhcnkvZnVuY3Rpb25zLmh0bWwjcmFuZ2UpLlxuICBfLnJhbmdlID0gZnVuY3Rpb24oc3RhcnQsIHN0b3AsIHN0ZXApIHtcbiAgICBpZiAoc3RvcCA9PSBudWxsKSB7XG4gICAgICBzdG9wID0gc3RhcnQgfHwgMDtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgc3RlcCA9IHN0ZXAgfHwgMTtcblxuICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChNYXRoLmNlaWwoKHN0b3AgLSBzdGFydCkgLyBzdGVwKSwgMCk7XG4gICAgdmFyIHJhbmdlID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGxlbmd0aDsgaWR4KyssIHN0YXJ0ICs9IHN0ZXApIHtcbiAgICAgIHJhbmdlW2lkeF0gPSBzdGFydDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmFuZ2U7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gKGFoZW0pIEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBEZXRlcm1pbmVzIHdoZXRoZXIgdG8gZXhlY3V0ZSBhIGZ1bmN0aW9uIGFzIGEgY29uc3RydWN0b3JcbiAgLy8gb3IgYSBub3JtYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJvdmlkZWQgYXJndW1lbnRzXG4gIHZhciBleGVjdXRlQm91bmQgPSBmdW5jdGlvbihzb3VyY2VGdW5jLCBib3VuZEZ1bmMsIGNvbnRleHQsIGNhbGxpbmdDb250ZXh0LCBhcmdzKSB7XG4gICAgaWYgKCEoY2FsbGluZ0NvbnRleHQgaW5zdGFuY2VvZiBib3VuZEZ1bmMpKSByZXR1cm4gc291cmNlRnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICB2YXIgc2VsZiA9IGJhc2VDcmVhdGUoc291cmNlRnVuYy5wcm90b3R5cGUpO1xuICAgIHZhciByZXN1bHQgPSBzb3VyY2VGdW5jLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgIGlmIChfLmlzT2JqZWN0KHJlc3VsdCkpIHJldHVybiByZXN1bHQ7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgZnVuY3Rpb24gYm91bmQgdG8gYSBnaXZlbiBvYmplY3QgKGFzc2lnbmluZyBgdGhpc2AsIGFuZCBhcmd1bWVudHMsXG4gIC8vIG9wdGlvbmFsbHkpLiBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgRnVuY3Rpb24uYmluZGAgaWZcbiAgLy8gYXZhaWxhYmxlLlxuICBfLmJpbmQgPSBmdW5jdGlvbihmdW5jLCBjb250ZXh0KSB7XG4gICAgaWYgKG5hdGl2ZUJpbmQgJiYgZnVuYy5iaW5kID09PSBuYXRpdmVCaW5kKSByZXR1cm4gbmF0aXZlQmluZC5hcHBseShmdW5jLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGlmICghXy5pc0Z1bmN0aW9uKGZ1bmMpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdCaW5kIG11c3QgYmUgY2FsbGVkIG9uIGEgZnVuY3Rpb24nKTtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICB2YXIgYm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleGVjdXRlQm91bmQoZnVuYywgYm91bmQsIGNvbnRleHQsIHRoaXMsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgIH07XG4gICAgcmV0dXJuIGJvdW5kO1xuICB9O1xuXG4gIC8vIFBhcnRpYWxseSBhcHBseSBhIGZ1bmN0aW9uIGJ5IGNyZWF0aW5nIGEgdmVyc2lvbiB0aGF0IGhhcyBoYWQgc29tZSBvZiBpdHNcbiAgLy8gYXJndW1lbnRzIHByZS1maWxsZWQsIHdpdGhvdXQgY2hhbmdpbmcgaXRzIGR5bmFtaWMgYHRoaXNgIGNvbnRleHQuIF8gYWN0c1xuICAvLyBhcyBhIHBsYWNlaG9sZGVyLCBhbGxvd2luZyBhbnkgY29tYmluYXRpb24gb2YgYXJndW1lbnRzIHRvIGJlIHByZS1maWxsZWQuXG4gIF8ucGFydGlhbCA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICB2YXIgYm91bmRBcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHZhciBib3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBvc2l0aW9uID0gMCwgbGVuZ3RoID0gYm91bmRBcmdzLmxlbmd0aDtcbiAgICAgIHZhciBhcmdzID0gQXJyYXkobGVuZ3RoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJnc1tpXSA9IGJvdW5kQXJnc1tpXSA9PT0gXyA/IGFyZ3VtZW50c1twb3NpdGlvbisrXSA6IGJvdW5kQXJnc1tpXTtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChwb3NpdGlvbiA8IGFyZ3VtZW50cy5sZW5ndGgpIGFyZ3MucHVzaChhcmd1bWVudHNbcG9zaXRpb24rK10pO1xuICAgICAgcmV0dXJuIGV4ZWN1dGVCb3VuZChmdW5jLCBib3VuZCwgdGhpcywgdGhpcywgYXJncyk7XG4gICAgfTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH07XG5cbiAgLy8gQmluZCBhIG51bWJlciBvZiBhbiBvYmplY3QncyBtZXRob2RzIHRvIHRoYXQgb2JqZWN0LiBSZW1haW5pbmcgYXJndW1lbnRzXG4gIC8vIGFyZSB0aGUgbWV0aG9kIG5hbWVzIHRvIGJlIGJvdW5kLiBVc2VmdWwgZm9yIGVuc3VyaW5nIHRoYXQgYWxsIGNhbGxiYWNrc1xuICAvLyBkZWZpbmVkIG9uIGFuIG9iamVjdCBiZWxvbmcgdG8gaXQuXG4gIF8uYmluZEFsbCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBpLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLCBrZXk7XG4gICAgaWYgKGxlbmd0aCA8PSAxKSB0aHJvdyBuZXcgRXJyb3IoJ2JpbmRBbGwgbXVzdCBiZSBwYXNzZWQgZnVuY3Rpb24gbmFtZXMnKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGtleSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIG9ialtrZXldID0gXy5iaW5kKG9ialtrZXldLCBvYmopO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIE1lbW9pemUgYW4gZXhwZW5zaXZlIGZ1bmN0aW9uIGJ5IHN0b3JpbmcgaXRzIHJlc3VsdHMuXG4gIF8ubWVtb2l6ZSA9IGZ1bmN0aW9uKGZ1bmMsIGhhc2hlcikge1xuICAgIHZhciBtZW1vaXplID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICB2YXIgY2FjaGUgPSBtZW1vaXplLmNhY2hlO1xuICAgICAgdmFyIGFkZHJlc3MgPSAnJyArIChoYXNoZXIgPyBoYXNoZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IGtleSk7XG4gICAgICBpZiAoIV8uaGFzKGNhY2hlLCBhZGRyZXNzKSkgY2FjaGVbYWRkcmVzc10gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gY2FjaGVbYWRkcmVzc107XG4gICAgfTtcbiAgICBtZW1vaXplLmNhY2hlID0ge307XG4gICAgcmV0dXJuIG1lbW9pemU7XG4gIH07XG5cbiAgLy8gRGVsYXlzIGEgZnVuY3Rpb24gZm9yIHRoZSBnaXZlbiBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLCBhbmQgdGhlbiBjYWxsc1xuICAvLyBpdCB3aXRoIHRoZSBhcmd1bWVudHMgc3VwcGxpZWQuXG4gIF8uZGVsYXkgPSBmdW5jdGlvbihmdW5jLCB3YWl0KSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH0sIHdhaXQpO1xuICB9O1xuXG4gIC8vIERlZmVycyBhIGZ1bmN0aW9uLCBzY2hlZHVsaW5nIGl0IHRvIHJ1biBhZnRlciB0aGUgY3VycmVudCBjYWxsIHN0YWNrIGhhc1xuICAvLyBjbGVhcmVkLlxuICBfLmRlZmVyID0gXy5wYXJ0aWFsKF8uZGVsYXksIF8sIDEpO1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgd2hlbiBpbnZva2VkLCB3aWxsIG9ubHkgYmUgdHJpZ2dlcmVkIGF0IG1vc3Qgb25jZVxuICAvLyBkdXJpbmcgYSBnaXZlbiB3aW5kb3cgb2YgdGltZS4gTm9ybWFsbHksIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gd2lsbCBydW5cbiAgLy8gYXMgbXVjaCBhcyBpdCBjYW4sIHdpdGhvdXQgZXZlciBnb2luZyBtb3JlIHRoYW4gb25jZSBwZXIgYHdhaXRgIGR1cmF0aW9uO1xuICAvLyBidXQgaWYgeW91J2QgbGlrZSB0byBkaXNhYmxlIHRoZSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSwgcGFzc1xuICAvLyBge2xlYWRpbmc6IGZhbHNlfWAuIFRvIGRpc2FibGUgZXhlY3V0aW9uIG9uIHRoZSB0cmFpbGluZyBlZGdlLCBkaXR0by5cbiAgXy50aHJvdHRsZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgICB2YXIgY29udGV4dCwgYXJncywgcmVzdWx0O1xuICAgIHZhciB0aW1lb3V0ID0gbnVsbDtcbiAgICB2YXIgcHJldmlvdXMgPSAwO1xuICAgIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcHJldmlvdXMgPSBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlID8gMCA6IF8ubm93KCk7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBub3cgPSBfLm5vdygpO1xuICAgICAgaWYgKCFwcmV2aW91cyAmJiBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlKSBwcmV2aW91cyA9IG5vdztcbiAgICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKG5vdyAtIHByZXZpb3VzKTtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGlmIChyZW1haW5pbmcgPD0gMCB8fCByZW1haW5pbmcgPiB3YWl0KSB7XG4gICAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoIXRpbWVvdXQgJiYgb3B0aW9ucy50cmFpbGluZyAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCBhcyBsb25nIGFzIGl0IGNvbnRpbnVlcyB0byBiZSBpbnZva2VkLCB3aWxsIG5vdFxuICAvLyBiZSB0cmlnZ2VyZWQuIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBhZnRlciBpdCBzdG9wcyBiZWluZyBjYWxsZWQgZm9yXG4gIC8vIE4gbWlsbGlzZWNvbmRzLiBJZiBgaW1tZWRpYXRlYCBpcyBwYXNzZWQsIHRyaWdnZXIgdGhlIGZ1bmN0aW9uIG9uIHRoZVxuICAvLyBsZWFkaW5nIGVkZ2UsIGluc3RlYWQgb2YgdGhlIHRyYWlsaW5nLlxuICBfLmRlYm91bmNlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gICAgdmFyIHRpbWVvdXQsIGFyZ3MsIGNvbnRleHQsIHRpbWVzdGFtcCwgcmVzdWx0O1xuXG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGFzdCA9IF8ubm93KCkgLSB0aW1lc3RhbXA7XG5cbiAgICAgIGlmIChsYXN0IDwgd2FpdCAmJiBsYXN0ID49IDApIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQgLSBsYXN0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICBpZiAoIWltbWVkaWF0ZSkge1xuICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgaWYgKCF0aW1lb3V0KSBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgdGltZXN0YW1wID0gXy5ub3coKTtcbiAgICAgIHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0O1xuICAgICAgaWYgKCF0aW1lb3V0KSB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgICBpZiAoY2FsbE5vdykge1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBmdW5jdGlvbiBwYXNzZWQgYXMgYW4gYXJndW1lbnQgdG8gdGhlIHNlY29uZCxcbiAgLy8gYWxsb3dpbmcgeW91IHRvIGFkanVzdCBhcmd1bWVudHMsIHJ1biBjb2RlIGJlZm9yZSBhbmQgYWZ0ZXIsIGFuZFxuICAvLyBjb25kaXRpb25hbGx5IGV4ZWN1dGUgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uLlxuICBfLndyYXAgPSBmdW5jdGlvbihmdW5jLCB3cmFwcGVyKSB7XG4gICAgcmV0dXJuIF8ucGFydGlhbCh3cmFwcGVyLCBmdW5jKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgbmVnYXRlZCB2ZXJzaW9uIG9mIHRoZSBwYXNzZWQtaW4gcHJlZGljYXRlLlxuICBfLm5lZ2F0ZSA9IGZ1bmN0aW9uKHByZWRpY2F0ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAhcHJlZGljYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBpcyB0aGUgY29tcG9zaXRpb24gb2YgYSBsaXN0IG9mIGZ1bmN0aW9ucywgZWFjaFxuICAvLyBjb25zdW1pbmcgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24gdGhhdCBmb2xsb3dzLlxuICBfLmNvbXBvc2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICB2YXIgc3RhcnQgPSBhcmdzLmxlbmd0aCAtIDE7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGkgPSBzdGFydDtcbiAgICAgIHZhciByZXN1bHQgPSBhcmdzW3N0YXJ0XS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgd2hpbGUgKGktLSkgcmVzdWx0ID0gYXJnc1tpXS5jYWxsKHRoaXMsIHJlc3VsdCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBvbmx5IGJlIGV4ZWN1dGVkIG9uIGFuZCBhZnRlciB0aGUgTnRoIGNhbGwuXG4gIF8uYWZ0ZXIgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzIDwgMSkge1xuICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBvbmx5IGJlIGV4ZWN1dGVkIHVwIHRvIChidXQgbm90IGluY2x1ZGluZykgdGhlIE50aCBjYWxsLlxuICBfLmJlZm9yZSA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgdmFyIG1lbW87XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPiAwKSB7XG4gICAgICAgIG1lbW8gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgICBpZiAodGltZXMgPD0gMSkgZnVuYyA9IG51bGw7XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgYXQgbW9zdCBvbmUgdGltZSwgbm8gbWF0dGVyIGhvd1xuICAvLyBvZnRlbiB5b3UgY2FsbCBpdC4gVXNlZnVsIGZvciBsYXp5IGluaXRpYWxpemF0aW9uLlxuICBfLm9uY2UgPSBfLnBhcnRpYWwoXy5iZWZvcmUsIDIpO1xuXG4gIC8vIE9iamVjdCBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEtleXMgaW4gSUUgPCA5IHRoYXQgd29uJ3QgYmUgaXRlcmF0ZWQgYnkgYGZvciBrZXkgaW4gLi4uYCBhbmQgdGh1cyBtaXNzZWQuXG4gIHZhciBoYXNFbnVtQnVnID0gIXt0b1N0cmluZzogbnVsbH0ucHJvcGVydHlJc0VudW1lcmFibGUoJ3RvU3RyaW5nJyk7XG4gIHZhciBub25FbnVtZXJhYmxlUHJvcHMgPSBbJ3ZhbHVlT2YnLCAnaXNQcm90b3R5cGVPZicsICd0b1N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJ2hhc093blByb3BlcnR5JywgJ3RvTG9jYWxlU3RyaW5nJ107XG5cbiAgZnVuY3Rpb24gY29sbGVjdE5vbkVudW1Qcm9wcyhvYmosIGtleXMpIHtcbiAgICB2YXIgbm9uRW51bUlkeCA9IG5vbkVudW1lcmFibGVQcm9wcy5sZW5ndGg7XG4gICAgdmFyIGNvbnN0cnVjdG9yID0gb2JqLmNvbnN0cnVjdG9yO1xuICAgIHZhciBwcm90byA9IChfLmlzRnVuY3Rpb24oY29uc3RydWN0b3IpICYmIGNvbnN0cnVjdG9yLnByb3RvdHlwZSkgfHwgT2JqUHJvdG87XG5cbiAgICAvLyBDb25zdHJ1Y3RvciBpcyBhIHNwZWNpYWwgY2FzZS5cbiAgICB2YXIgcHJvcCA9ICdjb25zdHJ1Y3Rvcic7XG4gICAgaWYgKF8uaGFzKG9iaiwgcHJvcCkgJiYgIV8uY29udGFpbnMoa2V5cywgcHJvcCkpIGtleXMucHVzaChwcm9wKTtcblxuICAgIHdoaWxlIChub25FbnVtSWR4LS0pIHtcbiAgICAgIHByb3AgPSBub25FbnVtZXJhYmxlUHJvcHNbbm9uRW51bUlkeF07XG4gICAgICBpZiAocHJvcCBpbiBvYmogJiYgb2JqW3Byb3BdICE9PSBwcm90b1twcm9wXSAmJiAhXy5jb250YWlucyhrZXlzLCBwcm9wKSkge1xuICAgICAgICBrZXlzLnB1c2gocHJvcCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gUmV0cmlldmUgdGhlIG5hbWVzIG9mIGFuIG9iamVjdCdzIG93biBwcm9wZXJ0aWVzLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgT2JqZWN0LmtleXNgXG4gIF8ua2V5cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gW107XG4gICAgaWYgKG5hdGl2ZUtleXMpIHJldHVybiBuYXRpdmVLZXlzKG9iaik7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSBrZXlzLnB1c2goa2V5KTtcbiAgICAvLyBBaGVtLCBJRSA8IDkuXG4gICAgaWYgKGhhc0VudW1CdWcpIGNvbGxlY3ROb25FbnVtUHJvcHMob2JqLCBrZXlzKTtcbiAgICByZXR1cm4ga2V5cztcbiAgfTtcblxuICAvLyBSZXRyaWV2ZSBhbGwgdGhlIHByb3BlcnR5IG5hbWVzIG9mIGFuIG9iamVjdC5cbiAgXy5hbGxLZXlzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBbXTtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGtleXMucHVzaChrZXkpO1xuICAgIC8vIEFoZW0sIElFIDwgOS5cbiAgICBpZiAoaGFzRW51bUJ1ZykgY29sbGVjdE5vbkVudW1Qcm9wcyhvYmosIGtleXMpO1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xuXG4gIC8vIFJldHJpZXZlIHRoZSB2YWx1ZXMgb2YgYW4gb2JqZWN0J3MgcHJvcGVydGllcy5cbiAgXy52YWx1ZXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgdmFsdWVzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YWx1ZXNbaV0gPSBvYmpba2V5c1tpXV07XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZXM7XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgcmVzdWx0cyBvZiBhcHBseWluZyB0aGUgaXRlcmF0ZWUgdG8gZWFjaCBlbGVtZW50IG9mIHRoZSBvYmplY3RcbiAgLy8gSW4gY29udHJhc3QgdG8gXy5tYXAgaXQgcmV0dXJucyBhbiBvYmplY3RcbiAgXy5tYXBPYmplY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSAgXy5rZXlzKG9iaiksXG4gICAgICAgICAgbGVuZ3RoID0ga2V5cy5sZW5ndGgsXG4gICAgICAgICAgcmVzdWx0cyA9IHt9LFxuICAgICAgICAgIGN1cnJlbnRLZXk7XG4gICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGN1cnJlbnRLZXkgPSBrZXlzW2luZGV4XTtcbiAgICAgICAgcmVzdWx0c1tjdXJyZW50S2V5XSA9IGl0ZXJhdGVlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIENvbnZlcnQgYW4gb2JqZWN0IGludG8gYSBsaXN0IG9mIGBba2V5LCB2YWx1ZV1gIHBhaXJzLlxuICBfLnBhaXJzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIHBhaXJzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBwYWlyc1tpXSA9IFtrZXlzW2ldLCBvYmpba2V5c1tpXV1dO1xuICAgIH1cbiAgICByZXR1cm4gcGFpcnM7XG4gIH07XG5cbiAgLy8gSW52ZXJ0IHRoZSBrZXlzIGFuZCB2YWx1ZXMgb2YgYW4gb2JqZWN0LiBUaGUgdmFsdWVzIG11c3QgYmUgc2VyaWFsaXphYmxlLlxuICBfLmludmVydCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRbb2JqW2tleXNbaV1dXSA9IGtleXNbaV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgc29ydGVkIGxpc3Qgb2YgdGhlIGZ1bmN0aW9uIG5hbWVzIGF2YWlsYWJsZSBvbiB0aGUgb2JqZWN0LlxuICAvLyBBbGlhc2VkIGFzIGBtZXRob2RzYFxuICBfLmZ1bmN0aW9ucyA9IF8ubWV0aG9kcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBuYW1lcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChfLmlzRnVuY3Rpb24ob2JqW2tleV0pKSBuYW1lcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBuYW1lcy5zb3J0KCk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBwcm9wZXJ0aWVzIGluIHBhc3NlZC1pbiBvYmplY3QocykuXG4gIF8uZXh0ZW5kID0gY3JlYXRlQXNzaWduZXIoXy5hbGxLZXlzKTtcblxuICAvLyBBc3NpZ25zIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBvd24gcHJvcGVydGllcyBpbiB0aGUgcGFzc2VkLWluIG9iamVjdChzKVxuICAvLyAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2Fzc2lnbilcbiAgXy5leHRlbmRPd24gPSBfLmFzc2lnbiA9IGNyZWF0ZUFzc2lnbmVyKF8ua2V5cyk7XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3Qga2V5IG9uIGFuIG9iamVjdCB0aGF0IHBhc3NlcyBhIHByZWRpY2F0ZSB0ZXN0XG4gIF8uZmluZEtleSA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopLCBrZXk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICBpZiAocHJlZGljYXRlKG9ialtrZXldLCBrZXksIG9iaikpIHJldHVybiBrZXk7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCBvbmx5IGNvbnRhaW5pbmcgdGhlIHdoaXRlbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ucGljayA9IGZ1bmN0aW9uKG9iamVjdCwgb2l0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9LCBvYmogPSBvYmplY3QsIGl0ZXJhdGVlLCBrZXlzO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdDtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKG9pdGVyYXRlZSkpIHtcbiAgICAgIGtleXMgPSBfLmFsbEtleXMob2JqKTtcbiAgICAgIGl0ZXJhdGVlID0gb3B0aW1pemVDYihvaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBrZXlzID0gZmxhdHRlbihhcmd1bWVudHMsIGZhbHNlLCBmYWxzZSwgMSk7XG4gICAgICBpdGVyYXRlZSA9IGZ1bmN0aW9uKHZhbHVlLCBrZXksIG9iaikgeyByZXR1cm4ga2V5IGluIG9iajsgfTtcbiAgICAgIG9iaiA9IE9iamVjdChvYmopO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICB2YXIgdmFsdWUgPSBvYmpba2V5XTtcbiAgICAgIGlmIChpdGVyYXRlZSh2YWx1ZSwga2V5LCBvYmopKSByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgd2l0aG91dCB0aGUgYmxhY2tsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5vbWl0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmIChfLmlzRnVuY3Rpb24oaXRlcmF0ZWUpKSB7XG4gICAgICBpdGVyYXRlZSA9IF8ubmVnYXRlKGl0ZXJhdGVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBfLm1hcChmbGF0dGVuKGFyZ3VtZW50cywgZmFsc2UsIGZhbHNlLCAxKSwgU3RyaW5nKTtcbiAgICAgIGl0ZXJhdGVlID0gZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICByZXR1cm4gIV8uY29udGFpbnMoa2V5cywga2V5KTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBfLnBpY2sob2JqLCBpdGVyYXRlZSwgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gRmlsbCBpbiBhIGdpdmVuIG9iamVjdCB3aXRoIGRlZmF1bHQgcHJvcGVydGllcy5cbiAgXy5kZWZhdWx0cyA9IGNyZWF0ZUFzc2lnbmVyKF8uYWxsS2V5cywgdHJ1ZSk7XG5cbiAgLy8gQ3JlYXRlcyBhbiBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIHRoZSBnaXZlbiBwcm90b3R5cGUgb2JqZWN0LlxuICAvLyBJZiBhZGRpdGlvbmFsIHByb3BlcnRpZXMgYXJlIHByb3ZpZGVkIHRoZW4gdGhleSB3aWxsIGJlIGFkZGVkIHRvIHRoZVxuICAvLyBjcmVhdGVkIG9iamVjdC5cbiAgXy5jcmVhdGUgPSBmdW5jdGlvbihwcm90b3R5cGUsIHByb3BzKSB7XG4gICAgdmFyIHJlc3VsdCA9IGJhc2VDcmVhdGUocHJvdG90eXBlKTtcbiAgICBpZiAocHJvcHMpIF8uZXh0ZW5kT3duKHJlc3VsdCwgcHJvcHMpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgKHNoYWxsb3ctY2xvbmVkKSBkdXBsaWNhdGUgb2YgYW4gb2JqZWN0LlxuICBfLmNsb25lID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gICAgcmV0dXJuIF8uaXNBcnJheShvYmopID8gb2JqLnNsaWNlKCkgOiBfLmV4dGVuZCh7fSwgb2JqKTtcbiAgfTtcblxuICAvLyBJbnZva2VzIGludGVyY2VwdG9yIHdpdGggdGhlIG9iaiwgYW5kIHRoZW4gcmV0dXJucyBvYmouXG4gIC8vIFRoZSBwcmltYXJ5IHB1cnBvc2Ugb2YgdGhpcyBtZXRob2QgaXMgdG8gXCJ0YXAgaW50b1wiIGEgbWV0aG9kIGNoYWluLCBpblxuICAvLyBvcmRlciB0byBwZXJmb3JtIG9wZXJhdGlvbnMgb24gaW50ZXJtZWRpYXRlIHJlc3VsdHMgd2l0aGluIHRoZSBjaGFpbi5cbiAgXy50YXAgPSBmdW5jdGlvbihvYmosIGludGVyY2VwdG9yKSB7XG4gICAgaW50ZXJjZXB0b3Iob2JqKTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybnMgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmlzTWF0Y2ggPSBmdW5jdGlvbihvYmplY3QsIGF0dHJzKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMoYXR0cnMpLCBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICBpZiAob2JqZWN0ID09IG51bGwpIHJldHVybiAhbGVuZ3RoO1xuICAgIHZhciBvYmogPSBPYmplY3Qob2JqZWN0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgIGlmIChhdHRyc1trZXldICE9PSBvYmpba2V5XSB8fCAhKGtleSBpbiBvYmopKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG5cbiAgLy8gSW50ZXJuYWwgcmVjdXJzaXZlIGNvbXBhcmlzb24gZnVuY3Rpb24gZm9yIGBpc0VxdWFsYC5cbiAgdmFyIGVxID0gZnVuY3Rpb24oYSwgYiwgYVN0YWNrLCBiU3RhY2spIHtcbiAgICAvLyBJZGVudGljYWwgb2JqZWN0cyBhcmUgZXF1YWwuIGAwID09PSAtMGAsIGJ1dCB0aGV5IGFyZW4ndCBpZGVudGljYWwuXG4gICAgLy8gU2VlIHRoZSBbSGFybW9ueSBgZWdhbGAgcHJvcG9zYWxdKGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWhhcm1vbnk6ZWdhbCkuXG4gICAgaWYgKGEgPT09IGIpIHJldHVybiBhICE9PSAwIHx8IDEgLyBhID09PSAxIC8gYjtcbiAgICAvLyBBIHN0cmljdCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIGBudWxsID09IHVuZGVmaW5lZGAuXG4gICAgaWYgKGEgPT0gbnVsbCB8fCBiID09IG51bGwpIHJldHVybiBhID09PSBiO1xuICAgIC8vIFVud3JhcCBhbnkgd3JhcHBlZCBvYmplY3RzLlxuICAgIGlmIChhIGluc3RhbmNlb2YgXykgYSA9IGEuX3dyYXBwZWQ7XG4gICAgaWYgKGIgaW5zdGFuY2VvZiBfKSBiID0gYi5fd3JhcHBlZDtcbiAgICAvLyBDb21wYXJlIGBbW0NsYXNzXV1gIG5hbWVzLlxuICAgIHZhciBjbGFzc05hbWUgPSB0b1N0cmluZy5jYWxsKGEpO1xuICAgIGlmIChjbGFzc05hbWUgIT09IHRvU3RyaW5nLmNhbGwoYikpIHJldHVybiBmYWxzZTtcbiAgICBzd2l0Y2ggKGNsYXNzTmFtZSkge1xuICAgICAgLy8gU3RyaW5ncywgbnVtYmVycywgcmVndWxhciBleHByZXNzaW9ucywgZGF0ZXMsIGFuZCBib29sZWFucyBhcmUgY29tcGFyZWQgYnkgdmFsdWUuXG4gICAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgLy8gUmVnRXhwcyBhcmUgY29lcmNlZCB0byBzdHJpbmdzIGZvciBjb21wYXJpc29uIChOb3RlOiAnJyArIC9hL2kgPT09ICcvYS9pJylcbiAgICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6XG4gICAgICAgIC8vIFByaW1pdGl2ZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgb2JqZWN0IHdyYXBwZXJzIGFyZSBlcXVpdmFsZW50OyB0aHVzLCBgXCI1XCJgIGlzXG4gICAgICAgIC8vIGVxdWl2YWxlbnQgdG8gYG5ldyBTdHJpbmcoXCI1XCIpYC5cbiAgICAgICAgcmV0dXJuICcnICsgYSA9PT0gJycgKyBiO1xuICAgICAgY2FzZSAnW29iamVjdCBOdW1iZXJdJzpcbiAgICAgICAgLy8gYE5hTmBzIGFyZSBlcXVpdmFsZW50LCBidXQgbm9uLXJlZmxleGl2ZS5cbiAgICAgICAgLy8gT2JqZWN0KE5hTikgaXMgZXF1aXZhbGVudCB0byBOYU5cbiAgICAgICAgaWYgKCthICE9PSArYSkgcmV0dXJuICtiICE9PSArYjtcbiAgICAgICAgLy8gQW4gYGVnYWxgIGNvbXBhcmlzb24gaXMgcGVyZm9ybWVkIGZvciBvdGhlciBudW1lcmljIHZhbHVlcy5cbiAgICAgICAgcmV0dXJuICthID09PSAwID8gMSAvICthID09PSAxIC8gYiA6ICthID09PSArYjtcbiAgICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOlxuICAgICAgY2FzZSAnW29iamVjdCBCb29sZWFuXSc6XG4gICAgICAgIC8vIENvZXJjZSBkYXRlcyBhbmQgYm9vbGVhbnMgdG8gbnVtZXJpYyBwcmltaXRpdmUgdmFsdWVzLiBEYXRlcyBhcmUgY29tcGFyZWQgYnkgdGhlaXJcbiAgICAgICAgLy8gbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zLiBOb3RlIHRoYXQgaW52YWxpZCBkYXRlcyB3aXRoIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9uc1xuICAgICAgICAvLyBvZiBgTmFOYCBhcmUgbm90IGVxdWl2YWxlbnQuXG4gICAgICAgIHJldHVybiArYSA9PT0gK2I7XG4gICAgfVxuXG4gICAgdmFyIGFyZUFycmF5cyA9IGNsYXNzTmFtZSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICBpZiAoIWFyZUFycmF5cykge1xuICAgICAgaWYgKHR5cGVvZiBhICE9ICdvYmplY3QnIHx8IHR5cGVvZiBiICE9ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIC8vIE9iamVjdHMgd2l0aCBkaWZmZXJlbnQgY29uc3RydWN0b3JzIGFyZSBub3QgZXF1aXZhbGVudCwgYnV0IGBPYmplY3RgcyBvciBgQXJyYXlgc1xuICAgICAgLy8gZnJvbSBkaWZmZXJlbnQgZnJhbWVzIGFyZS5cbiAgICAgIHZhciBhQ3RvciA9IGEuY29uc3RydWN0b3IsIGJDdG9yID0gYi5jb25zdHJ1Y3RvcjtcbiAgICAgIGlmIChhQ3RvciAhPT0gYkN0b3IgJiYgIShfLmlzRnVuY3Rpb24oYUN0b3IpICYmIGFDdG9yIGluc3RhbmNlb2YgYUN0b3IgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmlzRnVuY3Rpb24oYkN0b3IpICYmIGJDdG9yIGluc3RhbmNlb2YgYkN0b3IpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICYmICgnY29uc3RydWN0b3InIGluIGEgJiYgJ2NvbnN0cnVjdG9yJyBpbiBiKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEFzc3VtZSBlcXVhbGl0eSBmb3IgY3ljbGljIHN0cnVjdHVyZXMuIFRoZSBhbGdvcml0aG0gZm9yIGRldGVjdGluZyBjeWNsaWNcbiAgICAvLyBzdHJ1Y3R1cmVzIGlzIGFkYXB0ZWQgZnJvbSBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zLCBhYnN0cmFjdCBvcGVyYXRpb24gYEpPYC5cblxuICAgIC8vIEluaXRpYWxpemluZyBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICAvLyBJdCdzIGRvbmUgaGVyZSBzaW5jZSB3ZSBvbmx5IG5lZWQgdGhlbSBmb3Igb2JqZWN0cyBhbmQgYXJyYXlzIGNvbXBhcmlzb24uXG4gICAgYVN0YWNrID0gYVN0YWNrIHx8IFtdO1xuICAgIGJTdGFjayA9IGJTdGFjayB8fCBbXTtcbiAgICB2YXIgbGVuZ3RoID0gYVN0YWNrLmxlbmd0aDtcbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgIC8vIExpbmVhciBzZWFyY2guIFBlcmZvcm1hbmNlIGlzIGludmVyc2VseSBwcm9wb3J0aW9uYWwgdG8gdGhlIG51bWJlciBvZlxuICAgICAgLy8gdW5pcXVlIG5lc3RlZCBzdHJ1Y3R1cmVzLlxuICAgICAgaWYgKGFTdGFja1tsZW5ndGhdID09PSBhKSByZXR1cm4gYlN0YWNrW2xlbmd0aF0gPT09IGI7XG4gICAgfVxuXG4gICAgLy8gQWRkIHRoZSBmaXJzdCBvYmplY3QgdG8gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIGFTdGFjay5wdXNoKGEpO1xuICAgIGJTdGFjay5wdXNoKGIpO1xuXG4gICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIGFuZCBhcnJheXMuXG4gICAgaWYgKGFyZUFycmF5cykge1xuICAgICAgLy8gQ29tcGFyZSBhcnJheSBsZW5ndGhzIHRvIGRldGVybWluZSBpZiBhIGRlZXAgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnkuXG4gICAgICBsZW5ndGggPSBhLmxlbmd0aDtcbiAgICAgIGlmIChsZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICAvLyBEZWVwIGNvbXBhcmUgdGhlIGNvbnRlbnRzLCBpZ25vcmluZyBub24tbnVtZXJpYyBwcm9wZXJ0aWVzLlxuICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIGlmICghZXEoYVtsZW5ndGhdLCBiW2xlbmd0aF0sIGFTdGFjaywgYlN0YWNrKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEZWVwIGNvbXBhcmUgb2JqZWN0cy5cbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKGEpLCBrZXk7XG4gICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICAgIC8vIEVuc3VyZSB0aGF0IGJvdGggb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIG51bWJlciBvZiBwcm9wZXJ0aWVzIGJlZm9yZSBjb21wYXJpbmcgZGVlcCBlcXVhbGl0eS5cbiAgICAgIGlmIChfLmtleXMoYikubGVuZ3RoICE9PSBsZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICAvLyBEZWVwIGNvbXBhcmUgZWFjaCBtZW1iZXJcbiAgICAgICAga2V5ID0ga2V5c1tsZW5ndGhdO1xuICAgICAgICBpZiAoIShfLmhhcyhiLCBrZXkpICYmIGVxKGFba2V5XSwgYltrZXldLCBhU3RhY2ssIGJTdGFjaykpKSByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFJlbW92ZSB0aGUgZmlyc3Qgb2JqZWN0IGZyb20gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIGFTdGFjay5wb3AoKTtcbiAgICBiU3RhY2sucG9wKCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gUGVyZm9ybSBhIGRlZXAgY29tcGFyaXNvbiB0byBjaGVjayBpZiB0d28gb2JqZWN0cyBhcmUgZXF1YWwuXG4gIF8uaXNFcXVhbCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gZXEoYSwgYik7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiBhcnJheSwgc3RyaW5nLCBvciBvYmplY3QgZW1wdHk/XG4gIC8vIEFuIFwiZW1wdHlcIiBvYmplY3QgaGFzIG5vIGVudW1lcmFibGUgb3duLXByb3BlcnRpZXMuXG4gIF8uaXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gICAgaWYgKGlzQXJyYXlMaWtlKG9iaikgJiYgKF8uaXNBcnJheShvYmopIHx8IF8uaXNTdHJpbmcob2JqKSB8fCBfLmlzQXJndW1lbnRzKG9iaikpKSByZXR1cm4gb2JqLmxlbmd0aCA9PT0gMDtcbiAgICByZXR1cm4gXy5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBET00gZWxlbWVudD9cbiAgXy5pc0VsZW1lbnQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gISEob2JqICYmIG9iai5ub2RlVHlwZSA9PT0gMSk7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhbiBhcnJheT9cbiAgLy8gRGVsZWdhdGVzIHRvIEVDTUE1J3MgbmF0aXZlIEFycmF5LmlzQXJyYXlcbiAgXy5pc0FycmF5ID0gbmF0aXZlSXNBcnJheSB8fCBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgYW4gb2JqZWN0P1xuICBfLmlzT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2Ygb2JqO1xuICAgIHJldHVybiB0eXBlID09PSAnZnVuY3Rpb24nIHx8IHR5cGUgPT09ICdvYmplY3QnICYmICEhb2JqO1xuICB9O1xuXG4gIC8vIEFkZCBzb21lIGlzVHlwZSBtZXRob2RzOiBpc0FyZ3VtZW50cywgaXNGdW5jdGlvbiwgaXNTdHJpbmcsIGlzTnVtYmVyLCBpc0RhdGUsIGlzUmVnRXhwLCBpc0Vycm9yLlxuICBfLmVhY2goWydBcmd1bWVudHMnLCAnRnVuY3Rpb24nLCAnU3RyaW5nJywgJ051bWJlcicsICdEYXRlJywgJ1JlZ0V4cCcsICdFcnJvciddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgX1snaXMnICsgbmFtZV0gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0ICcgKyBuYW1lICsgJ10nO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIERlZmluZSBhIGZhbGxiYWNrIHZlcnNpb24gb2YgdGhlIG1ldGhvZCBpbiBicm93c2VycyAoYWhlbSwgSUUgPCA5KSwgd2hlcmVcbiAgLy8gdGhlcmUgaXNuJ3QgYW55IGluc3BlY3RhYmxlIFwiQXJndW1lbnRzXCIgdHlwZS5cbiAgaWYgKCFfLmlzQXJndW1lbnRzKGFyZ3VtZW50cykpIHtcbiAgICBfLmlzQXJndW1lbnRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gXy5oYXMob2JqLCAnY2FsbGVlJyk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIE9wdGltaXplIGBpc0Z1bmN0aW9uYCBpZiBhcHByb3ByaWF0ZS4gV29yayBhcm91bmQgc29tZSB0eXBlb2YgYnVncyBpbiBvbGQgdjgsXG4gIC8vIElFIDExICgjMTYyMSksIGFuZCBpbiBTYWZhcmkgOCAoIzE5MjkpLlxuICBpZiAodHlwZW9mIC8uLyAhPSAnZnVuY3Rpb24nICYmIHR5cGVvZiBJbnQ4QXJyYXkgIT0gJ29iamVjdCcpIHtcbiAgICBfLmlzRnVuY3Rpb24gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09ICdmdW5jdGlvbicgfHwgZmFsc2U7XG4gICAgfTtcbiAgfVxuXG4gIC8vIElzIGEgZ2l2ZW4gb2JqZWN0IGEgZmluaXRlIG51bWJlcj9cbiAgXy5pc0Zpbml0ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBpc0Zpbml0ZShvYmopICYmICFpc05hTihwYXJzZUZsb2F0KG9iaikpO1xuICB9O1xuXG4gIC8vIElzIHRoZSBnaXZlbiB2YWx1ZSBgTmFOYD8gKE5hTiBpcyB0aGUgb25seSBudW1iZXIgd2hpY2ggZG9lcyBub3QgZXF1YWwgaXRzZWxmKS5cbiAgXy5pc05hTiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBfLmlzTnVtYmVyKG9iaikgJiYgb2JqICE9PSArb2JqO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBib29sZWFuP1xuICBfLmlzQm9vbGVhbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHRydWUgfHwgb2JqID09PSBmYWxzZSB8fCB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEJvb2xlYW5dJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGVxdWFsIHRvIG51bGw/XG4gIF8uaXNOdWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gbnVsbDtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIHVuZGVmaW5lZD9cbiAgXy5pc1VuZGVmaW5lZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHZvaWQgMDtcbiAgfTtcblxuICAvLyBTaG9ydGN1dCBmdW5jdGlvbiBmb3IgY2hlY2tpbmcgaWYgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHByb3BlcnR5IGRpcmVjdGx5XG4gIC8vIG9uIGl0c2VsZiAoaW4gb3RoZXIgd29yZHMsIG5vdCBvbiBhIHByb3RvdHlwZSkuXG4gIF8uaGFzID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gb2JqICE9IG51bGwgJiYgaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSk7XG4gIH07XG5cbiAgLy8gVXRpbGl0eSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSdW4gVW5kZXJzY29yZS5qcyBpbiAqbm9Db25mbGljdCogbW9kZSwgcmV0dXJuaW5nIHRoZSBgX2AgdmFyaWFibGUgdG8gaXRzXG4gIC8vIHByZXZpb3VzIG93bmVyLiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcm9vdC5fID0gcHJldmlvdXNVbmRlcnNjb3JlO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIEtlZXAgdGhlIGlkZW50aXR5IGZ1bmN0aW9uIGFyb3VuZCBmb3IgZGVmYXVsdCBpdGVyYXRlZXMuXG4gIF8uaWRlbnRpdHkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICAvLyBQcmVkaWNhdGUtZ2VuZXJhdGluZyBmdW5jdGlvbnMuIE9mdGVuIHVzZWZ1bCBvdXRzaWRlIG9mIFVuZGVyc2NvcmUuXG4gIF8uY29uc3RhbnQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICB9O1xuXG4gIF8ubm9vcCA9IGZ1bmN0aW9uKCl7fTtcblxuICBfLnByb3BlcnR5ID0gcHJvcGVydHk7XG5cbiAgLy8gR2VuZXJhdGVzIGEgZnVuY3Rpb24gZm9yIGEgZ2l2ZW4gb2JqZWN0IHRoYXQgcmV0dXJucyBhIGdpdmVuIHByb3BlcnR5LlxuICBfLnByb3BlcnR5T2YgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09IG51bGwgPyBmdW5jdGlvbigpe30gOiBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBvYmpba2V5XTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBwcmVkaWNhdGUgZm9yIGNoZWNraW5nIHdoZXRoZXIgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHNldCBvZlxuICAvLyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy5tYXRjaGVyID0gXy5tYXRjaGVzID0gZnVuY3Rpb24oYXR0cnMpIHtcbiAgICBhdHRycyA9IF8uZXh0ZW5kT3duKHt9LCBhdHRycyk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIF8uaXNNYXRjaChvYmosIGF0dHJzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJ1biBhIGZ1bmN0aW9uICoqbioqIHRpbWVzLlxuICBfLnRpbWVzID0gZnVuY3Rpb24obiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgYWNjdW0gPSBBcnJheShNYXRoLm1heCgwLCBuKSk7XG4gICAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0LCAxKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykgYWNjdW1baV0gPSBpdGVyYXRlZShpKTtcbiAgICByZXR1cm4gYWNjdW07XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgcmFuZG9tIGludGVnZXIgYmV0d2VlbiBtaW4gYW5kIG1heCAoaW5jbHVzaXZlKS5cbiAgXy5yYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIGlmIChtYXggPT0gbnVsbCkge1xuICAgICAgbWF4ID0gbWluO1xuICAgICAgbWluID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIG1pbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSk7XG4gIH07XG5cbiAgLy8gQSAocG9zc2libHkgZmFzdGVyKSB3YXkgdG8gZ2V0IHRoZSBjdXJyZW50IHRpbWVzdGFtcCBhcyBhbiBpbnRlZ2VyLlxuICBfLm5vdyA9IERhdGUubm93IHx8IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfTtcblxuICAgLy8gTGlzdCBvZiBIVE1MIGVudGl0aWVzIGZvciBlc2NhcGluZy5cbiAgdmFyIGVzY2FwZU1hcCA9IHtcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJzwnOiAnJmx0OycsXG4gICAgJz4nOiAnJmd0OycsXG4gICAgJ1wiJzogJyZxdW90OycsXG4gICAgXCInXCI6ICcmI3gyNzsnLFxuICAgICdgJzogJyYjeDYwOydcbiAgfTtcbiAgdmFyIHVuZXNjYXBlTWFwID0gXy5pbnZlcnQoZXNjYXBlTWFwKTtcblxuICAvLyBGdW5jdGlvbnMgZm9yIGVzY2FwaW5nIGFuZCB1bmVzY2FwaW5nIHN0cmluZ3MgdG8vZnJvbSBIVE1MIGludGVycG9sYXRpb24uXG4gIHZhciBjcmVhdGVFc2NhcGVyID0gZnVuY3Rpb24obWFwKSB7XG4gICAgdmFyIGVzY2FwZXIgPSBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgcmV0dXJuIG1hcFttYXRjaF07XG4gICAgfTtcbiAgICAvLyBSZWdleGVzIGZvciBpZGVudGlmeWluZyBhIGtleSB0aGF0IG5lZWRzIHRvIGJlIGVzY2FwZWRcbiAgICB2YXIgc291cmNlID0gJyg/OicgKyBfLmtleXMobWFwKS5qb2luKCd8JykgKyAnKSc7XG4gICAgdmFyIHRlc3RSZWdleHAgPSBSZWdFeHAoc291cmNlKTtcbiAgICB2YXIgcmVwbGFjZVJlZ2V4cCA9IFJlZ0V4cChzb3VyY2UsICdnJyk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgc3RyaW5nID0gc3RyaW5nID09IG51bGwgPyAnJyA6ICcnICsgc3RyaW5nO1xuICAgICAgcmV0dXJuIHRlc3RSZWdleHAudGVzdChzdHJpbmcpID8gc3RyaW5nLnJlcGxhY2UocmVwbGFjZVJlZ2V4cCwgZXNjYXBlcikgOiBzdHJpbmc7XG4gICAgfTtcbiAgfTtcbiAgXy5lc2NhcGUgPSBjcmVhdGVFc2NhcGVyKGVzY2FwZU1hcCk7XG4gIF8udW5lc2NhcGUgPSBjcmVhdGVFc2NhcGVyKHVuZXNjYXBlTWFwKTtcblxuICAvLyBJZiB0aGUgdmFsdWUgb2YgdGhlIG5hbWVkIGBwcm9wZXJ0eWAgaXMgYSBmdW5jdGlvbiB0aGVuIGludm9rZSBpdCB3aXRoIHRoZVxuICAvLyBgb2JqZWN0YCBhcyBjb250ZXh0OyBvdGhlcndpc2UsIHJldHVybiBpdC5cbiAgXy5yZXN1bHQgPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5LCBmYWxsYmFjaykge1xuICAgIHZhciB2YWx1ZSA9IG9iamVjdCA9PSBudWxsID8gdm9pZCAwIDogb2JqZWN0W3Byb3BlcnR5XTtcbiAgICBpZiAodmFsdWUgPT09IHZvaWQgMCkge1xuICAgICAgdmFsdWUgPSBmYWxsYmFjaztcbiAgICB9XG4gICAgcmV0dXJuIF8uaXNGdW5jdGlvbih2YWx1ZSkgPyB2YWx1ZS5jYWxsKG9iamVjdCkgOiB2YWx1ZTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhIHVuaXF1ZSBpbnRlZ2VyIGlkICh1bmlxdWUgd2l0aGluIHRoZSBlbnRpcmUgY2xpZW50IHNlc3Npb24pLlxuICAvLyBVc2VmdWwgZm9yIHRlbXBvcmFyeSBET00gaWRzLlxuICB2YXIgaWRDb3VudGVyID0gMDtcbiAgXy51bmlxdWVJZCA9IGZ1bmN0aW9uKHByZWZpeCkge1xuICAgIHZhciBpZCA9ICsraWRDb3VudGVyICsgJyc7XG4gICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeCArIGlkIDogaWQ7XG4gIH07XG5cbiAgLy8gQnkgZGVmYXVsdCwgVW5kZXJzY29yZSB1c2VzIEVSQi1zdHlsZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLCBjaGFuZ2UgdGhlXG4gIC8vIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmUgZGVsaW1pdGVycy5cbiAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICAgIGV2YWx1YXRlICAgIDogLzwlKFtcXHNcXFNdKz8pJT4vZyxcbiAgICBpbnRlcnBvbGF0ZSA6IC88JT0oW1xcc1xcU10rPyklPi9nLFxuICAgIGVzY2FwZSAgICAgIDogLzwlLShbXFxzXFxTXSs/KSU+L2dcbiAgfTtcblxuICAvLyBXaGVuIGN1c3RvbWl6aW5nIGB0ZW1wbGF0ZVNldHRpbmdzYCwgaWYgeW91IGRvbid0IHdhbnQgdG8gZGVmaW5lIGFuXG4gIC8vIGludGVycG9sYXRpb24sIGV2YWx1YXRpb24gb3IgZXNjYXBpbmcgcmVnZXgsIHdlIG5lZWQgb25lIHRoYXQgaXNcbiAgLy8gZ3VhcmFudGVlZCBub3QgdG8gbWF0Y2guXG4gIHZhciBub01hdGNoID0gLyguKV4vO1xuXG4gIC8vIENlcnRhaW4gY2hhcmFjdGVycyBuZWVkIHRvIGJlIGVzY2FwZWQgc28gdGhhdCB0aGV5IGNhbiBiZSBwdXQgaW50byBhXG4gIC8vIHN0cmluZyBsaXRlcmFsLlxuICB2YXIgZXNjYXBlcyA9IHtcbiAgICBcIidcIjogICAgICBcIidcIixcbiAgICAnXFxcXCc6ICAgICAnXFxcXCcsXG4gICAgJ1xccic6ICAgICAncicsXG4gICAgJ1xcbic6ICAgICAnbicsXG4gICAgJ1xcdTIwMjgnOiAndTIwMjgnLFxuICAgICdcXHUyMDI5JzogJ3UyMDI5J1xuICB9O1xuXG4gIHZhciBlc2NhcGVyID0gL1xcXFx8J3xcXHJ8XFxufFxcdTIwMjh8XFx1MjAyOS9nO1xuXG4gIHZhciBlc2NhcGVDaGFyID0gZnVuY3Rpb24obWF0Y2gpIHtcbiAgICByZXR1cm4gJ1xcXFwnICsgZXNjYXBlc1ttYXRjaF07XG4gIH07XG5cbiAgLy8gSmF2YVNjcmlwdCBtaWNyby10ZW1wbGF0aW5nLCBzaW1pbGFyIHRvIEpvaG4gUmVzaWcncyBpbXBsZW1lbnRhdGlvbi5cbiAgLy8gVW5kZXJzY29yZSB0ZW1wbGF0aW5nIGhhbmRsZXMgYXJiaXRyYXJ5IGRlbGltaXRlcnMsIHByZXNlcnZlcyB3aGl0ZXNwYWNlLFxuICAvLyBhbmQgY29ycmVjdGx5IGVzY2FwZXMgcXVvdGVzIHdpdGhpbiBpbnRlcnBvbGF0ZWQgY29kZS5cbiAgLy8gTkI6IGBvbGRTZXR0aW5nc2Agb25seSBleGlzdHMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuICBfLnRlbXBsYXRlID0gZnVuY3Rpb24odGV4dCwgc2V0dGluZ3MsIG9sZFNldHRpbmdzKSB7XG4gICAgaWYgKCFzZXR0aW5ncyAmJiBvbGRTZXR0aW5ncykgc2V0dGluZ3MgPSBvbGRTZXR0aW5ncztcbiAgICBzZXR0aW5ncyA9IF8uZGVmYXVsdHMoe30sIHNldHRpbmdzLCBfLnRlbXBsYXRlU2V0dGluZ3MpO1xuXG4gICAgLy8gQ29tYmluZSBkZWxpbWl0ZXJzIGludG8gb25lIHJlZ3VsYXIgZXhwcmVzc2lvbiB2aWEgYWx0ZXJuYXRpb24uXG4gICAgdmFyIG1hdGNoZXIgPSBSZWdFeHAoW1xuICAgICAgKHNldHRpbmdzLmVzY2FwZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuaW50ZXJwb2xhdGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmV2YWx1YXRlIHx8IG5vTWF0Y2gpLnNvdXJjZVxuICAgIF0uam9pbignfCcpICsgJ3wkJywgJ2cnKTtcblxuICAgIC8vIENvbXBpbGUgdGhlIHRlbXBsYXRlIHNvdXJjZSwgZXNjYXBpbmcgc3RyaW5nIGxpdGVyYWxzIGFwcHJvcHJpYXRlbHkuXG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc291cmNlID0gXCJfX3ArPSdcIjtcbiAgICB0ZXh0LnJlcGxhY2UobWF0Y2hlciwgZnVuY3Rpb24obWF0Y2gsIGVzY2FwZSwgaW50ZXJwb2xhdGUsIGV2YWx1YXRlLCBvZmZzZXQpIHtcbiAgICAgIHNvdXJjZSArPSB0ZXh0LnNsaWNlKGluZGV4LCBvZmZzZXQpLnJlcGxhY2UoZXNjYXBlciwgZXNjYXBlQ2hhcik7XG4gICAgICBpbmRleCA9IG9mZnNldCArIG1hdGNoLmxlbmd0aDtcblxuICAgICAgaWYgKGVzY2FwZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGVzY2FwZSArIFwiKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXFxuJ1wiO1xuICAgICAgfSBlbHNlIGlmIChpbnRlcnBvbGF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGludGVycG9sYXRlICsgXCIpKT09bnVsbD8nJzpfX3QpK1xcbidcIjtcbiAgICAgIH0gZWxzZSBpZiAoZXZhbHVhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlICsgXCJcXG5fX3ArPSdcIjtcbiAgICAgIH1cblxuICAgICAgLy8gQWRvYmUgVk1zIG5lZWQgdGhlIG1hdGNoIHJldHVybmVkIHRvIHByb2R1Y2UgdGhlIGNvcnJlY3Qgb2ZmZXN0LlxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuICAgIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgICAvLyBJZiBhIHZhcmlhYmxlIGlzIG5vdCBzcGVjaWZpZWQsIHBsYWNlIGRhdGEgdmFsdWVzIGluIGxvY2FsIHNjb3BlLlxuICAgIGlmICghc2V0dGluZ3MudmFyaWFibGUpIHNvdXJjZSA9ICd3aXRoKG9ianx8e30pe1xcbicgKyBzb3VyY2UgKyAnfVxcbic7XG5cbiAgICBzb3VyY2UgPSBcInZhciBfX3QsX19wPScnLF9faj1BcnJheS5wcm90b3R5cGUuam9pbixcIiArXG4gICAgICBcInByaW50PWZ1bmN0aW9uKCl7X19wKz1fX2ouY2FsbChhcmd1bWVudHMsJycpO307XFxuXCIgK1xuICAgICAgc291cmNlICsgJ3JldHVybiBfX3A7XFxuJztcblxuICAgIHRyeSB7XG4gICAgICB2YXIgcmVuZGVyID0gbmV3IEZ1bmN0aW9uKHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonLCAnXycsIHNvdXJjZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZS5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiByZW5kZXIuY2FsbCh0aGlzLCBkYXRhLCBfKTtcbiAgICB9O1xuXG4gICAgLy8gUHJvdmlkZSB0aGUgY29tcGlsZWQgc291cmNlIGFzIGEgY29udmVuaWVuY2UgZm9yIHByZWNvbXBpbGF0aW9uLlxuICAgIHZhciBhcmd1bWVudCA9IHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonO1xuICAgIHRlbXBsYXRlLnNvdXJjZSA9ICdmdW5jdGlvbignICsgYXJndW1lbnQgKyAnKXtcXG4nICsgc291cmNlICsgJ30nO1xuXG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9O1xuXG4gIC8vIEFkZCBhIFwiY2hhaW5cIiBmdW5jdGlvbi4gU3RhcnQgY2hhaW5pbmcgYSB3cmFwcGVkIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLmNoYWluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGluc3RhbmNlID0gXyhvYmopO1xuICAgIGluc3RhbmNlLl9jaGFpbiA9IHRydWU7XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9O1xuXG4gIC8vIE9PUFxuICAvLyAtLS0tLS0tLS0tLS0tLS1cbiAgLy8gSWYgVW5kZXJzY29yZSBpcyBjYWxsZWQgYXMgYSBmdW5jdGlvbiwgaXQgcmV0dXJucyBhIHdyYXBwZWQgb2JqZWN0IHRoYXRcbiAgLy8gY2FuIGJlIHVzZWQgT08tc3R5bGUuIFRoaXMgd3JhcHBlciBob2xkcyBhbHRlcmVkIHZlcnNpb25zIG9mIGFsbCB0aGVcbiAgLy8gdW5kZXJzY29yZSBmdW5jdGlvbnMuIFdyYXBwZWQgb2JqZWN0cyBtYXkgYmUgY2hhaW5lZC5cblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29udGludWUgY2hhaW5pbmcgaW50ZXJtZWRpYXRlIHJlc3VsdHMuXG4gIHZhciByZXN1bHQgPSBmdW5jdGlvbihpbnN0YW5jZSwgb2JqKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlLl9jaGFpbiA/IF8ob2JqKS5jaGFpbigpIDogb2JqO1xuICB9O1xuXG4gIC8vIEFkZCB5b3VyIG93biBjdXN0b20gZnVuY3Rpb25zIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5taXhpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIF8uZWFjaChfLmZ1bmN0aW9ucyhvYmopLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgZnVuYyA9IF9bbmFtZV0gPSBvYmpbbmFtZV07XG4gICAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IFt0aGlzLl93cmFwcGVkXTtcbiAgICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0KHRoaXMsIGZ1bmMuYXBwbHkoXywgYXJncykpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBBZGQgYWxsIG9mIHRoZSBVbmRlcnNjb3JlIGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlciBvYmplY3QuXG4gIF8ubWl4aW4oXyk7XG5cbiAgLy8gQWRkIGFsbCBtdXRhdG9yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgXy5lYWNoKFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG9iaiA9IHRoaXMuX3dyYXBwZWQ7XG4gICAgICBtZXRob2QuYXBwbHkob2JqLCBhcmd1bWVudHMpO1xuICAgICAgaWYgKChuYW1lID09PSAnc2hpZnQnIHx8IG5hbWUgPT09ICdzcGxpY2UnKSAmJiBvYmoubGVuZ3RoID09PSAwKSBkZWxldGUgb2JqWzBdO1xuICAgICAgcmV0dXJuIHJlc3VsdCh0aGlzLCBvYmopO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIEFkZCBhbGwgYWNjZXNzb3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBfLmVhY2goWydjb25jYXQnLCAnam9pbicsICdzbGljZSddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiByZXN1bHQodGhpcywgbWV0aG9kLmFwcGx5KHRoaXMuX3dyYXBwZWQsIGFyZ3VtZW50cykpO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIEV4dHJhY3RzIHRoZSByZXN1bHQgZnJvbSBhIHdyYXBwZWQgYW5kIGNoYWluZWQgb2JqZWN0LlxuICBfLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl93cmFwcGVkO1xuICB9O1xuXG4gIC8vIFByb3ZpZGUgdW53cmFwcGluZyBwcm94eSBmb3Igc29tZSBtZXRob2RzIHVzZWQgaW4gZW5naW5lIG9wZXJhdGlvbnNcbiAgLy8gc3VjaCBhcyBhcml0aG1ldGljIGFuZCBKU09OIHN0cmluZ2lmaWNhdGlvbi5cbiAgXy5wcm90b3R5cGUudmFsdWVPZiA9IF8ucHJvdG90eXBlLnRvSlNPTiA9IF8ucHJvdG90eXBlLnZhbHVlO1xuXG4gIF8ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICcnICsgdGhpcy5fd3JhcHBlZDtcbiAgfTtcblxuICAvLyBBTUQgcmVnaXN0cmF0aW9uIGhhcHBlbnMgYXQgdGhlIGVuZCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIEFNRCBsb2FkZXJzXG4gIC8vIHRoYXQgbWF5IG5vdCBlbmZvcmNlIG5leHQtdHVybiBzZW1hbnRpY3Mgb24gbW9kdWxlcy4gRXZlbiB0aG91Z2ggZ2VuZXJhbFxuICAvLyBwcmFjdGljZSBmb3IgQU1EIHJlZ2lzdHJhdGlvbiBpcyB0byBiZSBhbm9ueW1vdXMsIHVuZGVyc2NvcmUgcmVnaXN0ZXJzXG4gIC8vIGFzIGEgbmFtZWQgbW9kdWxlIGJlY2F1c2UsIGxpa2UgalF1ZXJ5LCBpdCBpcyBhIGJhc2UgbGlicmFyeSB0aGF0IGlzXG4gIC8vIHBvcHVsYXIgZW5vdWdoIHRvIGJlIGJ1bmRsZWQgaW4gYSB0aGlyZCBwYXJ0eSBsaWIsIGJ1dCBub3QgYmUgcGFydCBvZlxuICAvLyBhbiBBTUQgbG9hZCByZXF1ZXN0LiBUaG9zZSBjYXNlcyBjb3VsZCBnZW5lcmF0ZSBhbiBlcnJvciB3aGVuIGFuXG4gIC8vIGFub255bW91cyBkZWZpbmUoKSBpcyBjYWxsZWQgb3V0c2lkZSBvZiBhIGxvYWRlciByZXF1ZXN0LlxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKCd1bmRlcnNjb3JlJywgW10sIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF87XG4gICAgfSk7XG4gIH1cbn0uY2FsbCh0aGlzKSk7XG4iXX0=