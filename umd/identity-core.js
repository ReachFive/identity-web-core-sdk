(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.reach5 = {}));
})(this, (function (exports) { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var check = function (it) {
	  return it && it.Math === Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global_1 =
	  // eslint-disable-next-line es/no-global-this -- safe
	  check(typeof globalThis == 'object' && globalThis) ||
	  check(typeof window == 'object' && window) ||
	  // eslint-disable-next-line no-restricted-globals -- safe
	  check(typeof self == 'object' && self) ||
	  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
	  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
	  // eslint-disable-next-line no-new-func -- fallback
	  (function () { return this; })() || Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	// Detect IE8's incomplete defineProperty implementation
	var descriptors = !fails(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
	  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] !== 7;
	});

	var functionBindNative = !fails(function () {
	  // eslint-disable-next-line es/no-function-prototype-bind -- safe
	  var test = (function () { /* empty */ }).bind();
	  // eslint-disable-next-line no-prototype-builtins -- safe
	  return typeof test != 'function' || test.hasOwnProperty('prototype');
	});

	var call$2 = Function.prototype.call;

	var functionCall = functionBindNative ? call$2.bind(call$2) : function () {
	  return call$2.apply(call$2, arguments);
	};

	var $propertyIsEnumerable$2 = {}.propertyIsEnumerable;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getOwnPropertyDescriptor$d = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor$d && !$propertyIsEnumerable$2.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
	var f$8 = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor$d(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : $propertyIsEnumerable$2;

	var objectPropertyIsEnumerable = {
		f: f$8
	};

	var createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var FunctionPrototype$5 = Function.prototype;
	var call$1 = FunctionPrototype$5.call;
	var uncurryThisWithBind = functionBindNative && FunctionPrototype$5.bind.bind(call$1, call$1);

	var functionUncurryThis = functionBindNative ? uncurryThisWithBind : function (fn) {
	  return function () {
	    return call$1.apply(fn, arguments);
	  };
	};

	var toString$2 = functionUncurryThis({}.toString);
	var stringSlice$m = functionUncurryThis(''.slice);

	var classofRaw = function (it) {
	  return stringSlice$m(toString$2(it), 8, -1);
	};

	var $Object$8 = Object;
	var split$5 = functionUncurryThis(''.split);

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var indexedObject = fails(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins -- safe
	  return !$Object$8('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classofRaw(it) === 'String' ? split$5(it, '') : $Object$8(it);
	} : $Object$8;

	// we can't use just `it == null` since of `document.all` special case
	// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
	var isNullOrUndefined = function (it) {
	  return it === null || it === undefined;
	};

	var $TypeError$L = TypeError;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.es/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
	  if (isNullOrUndefined(it)) throw new $TypeError$L("Can't call method on " + it);
	  return it;
	};

	// toObject with fallback for non-array-like ES3 strings



	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
	var documentAll = typeof document == 'object' && document.all;

	// `IsCallable` abstract operation
	// https://tc39.es/ecma262/#sec-iscallable
	// eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
	var isCallable = typeof documentAll == 'undefined' && documentAll !== undefined ? function (argument) {
	  return typeof argument == 'function' || argument === documentAll;
	} : function (argument) {
	  return typeof argument == 'function';
	};

	var isObject$1 = function (it) {
	  return typeof it == 'object' ? it !== null : isCallable(it);
	};

	var aFunction = function (argument) {
	  return isCallable(argument) ? argument : undefined;
	};

	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(global_1[namespace]) : global_1[namespace] && global_1[namespace][method];
	};

	var objectIsPrototypeOf = functionUncurryThis({}.isPrototypeOf);

	var engineUserAgent = typeof navigator != 'undefined' && String(navigator.userAgent) || '';

	var process$3 = global_1.process;
	var Deno$1 = global_1.Deno;
	var versions = process$3 && process$3.versions || Deno$1 && Deno$1.version;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
	  // but their correct versions are not interesting for us
	  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
	}

	// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
	// so check `userAgent` even if `.v8` exists, but 0
	if (!version && engineUserAgent) {
	  match = engineUserAgent.match(/Edge\/(\d+)/);
	  if (!match || match[1] >= 74) {
	    match = engineUserAgent.match(/Chrome\/(\d+)/);
	    if (match) version = +match[1];
	  }
	}

	var engineV8Version = version;

	/* eslint-disable es/no-symbol -- required for testing */




	var $String$9 = global_1.String;

	// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
	var symbolConstructorDetection = !!Object.getOwnPropertySymbols && !fails(function () {
	  var symbol = Symbol('symbol detection');
	  // Chrome 38 Symbol has incorrect toString conversion
	  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
	  // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
	  // of course, fail.
	  return !$String$9(symbol) || !(Object(symbol) instanceof Symbol) ||
	    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
	    !Symbol.sham && engineV8Version && engineV8Version < 41;
	});

	/* eslint-disable es/no-symbol -- required for testing */


	var useSymbolAsUid = symbolConstructorDetection
	  && !Symbol.sham
	  && typeof Symbol.iterator == 'symbol';

	var $Object$7 = Object;

	var isSymbol$1 = useSymbolAsUid ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  var $Symbol = getBuiltIn('Symbol');
	  return isCallable($Symbol) && objectIsPrototypeOf($Symbol.prototype, $Object$7(it));
	};

	var $String$8 = String;

	var tryToString = function (argument) {
	  try {
	    return $String$8(argument);
	  } catch (error) {
	    return 'Object';
	  }
	};

	var $TypeError$K = TypeError;

	// `Assert: IsCallable(argument) is true`
	var aCallable = function (argument) {
	  if (isCallable(argument)) return argument;
	  throw new $TypeError$K(tryToString(argument) + ' is not a function');
	};

	// `GetMethod` abstract operation
	// https://tc39.es/ecma262/#sec-getmethod
	var getMethod = function (V, P) {
	  var func = V[P];
	  return isNullOrUndefined(func) ? undefined : aCallable(func);
	};

	var $TypeError$J = TypeError;

	// `OrdinaryToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-ordinarytoprimitive
	var ordinaryToPrimitive = function (input, pref) {
	  var fn, val;
	  if (pref === 'string' && isCallable(fn = input.toString) && !isObject$1(val = functionCall(fn, input))) return val;
	  if (isCallable(fn = input.valueOf) && !isObject$1(val = functionCall(fn, input))) return val;
	  if (pref !== 'string' && isCallable(fn = input.toString) && !isObject$1(val = functionCall(fn, input))) return val;
	  throw new $TypeError$J("Can't convert object to primitive value");
	};

	var isPure = false;

	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var defineProperty$g = Object.defineProperty;

	var defineGlobalProperty = function (key, value) {
	  try {
	    defineProperty$g(global_1, key, { value: value, configurable: true, writable: true });
	  } catch (error) {
	    global_1[key] = value;
	  } return value;
	};

	var SHARED = '__core-js_shared__';
	var store$3 = global_1[SHARED] || defineGlobalProperty(SHARED, {});

	var sharedStore = store$3;

	var shared = createCommonjsModule(function (module) {



	(module.exports = function (key, value) {
	  return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.35.0',
	  mode: 'global',
	  copyright: '© 2014-2023 Denis Pushkarev (zloirock.ru)',
	  license: 'https://github.com/zloirock/core-js/blob/v3.35.0/LICENSE',
	  source: 'https://github.com/zloirock/core-js'
	});
	});

	var $Object$6 = Object;

	// `ToObject` abstract operation
	// https://tc39.es/ecma262/#sec-toobject
	var toObject = function (argument) {
	  return $Object$6(requireObjectCoercible(argument));
	};

	var hasOwnProperty$c = functionUncurryThis({}.hasOwnProperty);

	// `HasOwnProperty` abstract operation
	// https://tc39.es/ecma262/#sec-hasownproperty
	// eslint-disable-next-line es/no-object-hasown -- safe
	var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
	  return hasOwnProperty$c(toObject(it), key);
	};

	var id$1 = 0;
	var postfix = Math.random();
	var toString$1 = functionUncurryThis(1.0.toString);

	var uid = function (key) {
	  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString$1(++id$1 + postfix, 36);
	};

	var Symbol$7 = global_1.Symbol;
	var WellKnownSymbolsStore$2 = shared('wks');
	var createWellKnownSymbol = useSymbolAsUid ? Symbol$7['for'] || Symbol$7 : Symbol$7 && Symbol$7.withoutSetter || uid;

	var wellKnownSymbol = function (name) {
	  if (!hasOwnProperty_1(WellKnownSymbolsStore$2, name)) {
	    WellKnownSymbolsStore$2[name] = symbolConstructorDetection && hasOwnProperty_1(Symbol$7, name)
	      ? Symbol$7[name]
	      : createWellKnownSymbol('Symbol.' + name);
	  } return WellKnownSymbolsStore$2[name];
	};

	var $TypeError$I = TypeError;
	var TO_PRIMITIVE$1 = wellKnownSymbol('toPrimitive');

	// `ToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-toprimitive
	var toPrimitive = function (input, pref) {
	  if (!isObject$1(input) || isSymbol$1(input)) return input;
	  var exoticToPrim = getMethod(input, TO_PRIMITIVE$1);
	  var result;
	  if (exoticToPrim) {
	    if (pref === undefined) pref = 'default';
	    result = functionCall(exoticToPrim, input, pref);
	    if (!isObject$1(result) || isSymbol$1(result)) return result;
	    throw new $TypeError$I("Can't convert object to primitive value");
	  }
	  if (pref === undefined) pref = 'number';
	  return ordinaryToPrimitive(input, pref);
	};

	// `ToPropertyKey` abstract operation
	// https://tc39.es/ecma262/#sec-topropertykey
	var toPropertyKey = function (argument) {
	  var key = toPrimitive(argument, 'string');
	  return isSymbol$1(key) ? key : key + '';
	};

	var document$3 = global_1.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS$1 = isObject$1(document$3) && isObject$1(document$3.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS$1 ? document$3.createElement(it) : {};
	};

	// Thanks to IE8 for its funny defineProperty
	var ie8DomDefine = !descriptors && !fails(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
	  return Object.defineProperty(documentCreateElement('div'), 'a', {
	    get: function () { return 7; }
	  }).a !== 7;
	});

	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var $getOwnPropertyDescriptor$2 = Object.getOwnPropertyDescriptor;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
	var f$7 = descriptors ? $getOwnPropertyDescriptor$2 : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPropertyKey(P);
	  if (ie8DomDefine) try {
	    return $getOwnPropertyDescriptor$2(O, P);
	  } catch (error) { /* empty */ }
	  if (hasOwnProperty_1(O, P)) return createPropertyDescriptor(!functionCall(objectPropertyIsEnumerable.f, O, P), O[P]);
	};

	var objectGetOwnPropertyDescriptor = {
		f: f$7
	};

	// V8 ~ Chrome 36-
	// https://bugs.chromium.org/p/v8/issues/detail?id=3334
	var v8PrototypeDefineBug = descriptors && fails(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
	  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
	    value: 42,
	    writable: false
	  }).prototype !== 42;
	});

	var $String$7 = String;
	var $TypeError$H = TypeError;

	// `Assert: Type(argument) is Object`
	var anObject = function (argument) {
	  if (isObject$1(argument)) return argument;
	  throw new $TypeError$H($String$7(argument) + ' is not an object');
	};

	var $TypeError$G = TypeError;
	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var $defineProperty$1 = Object.defineProperty;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;
	var ENUMERABLE = 'enumerable';
	var CONFIGURABLE$1 = 'configurable';
	var WRITABLE = 'writable';

	// `Object.defineProperty` method
	// https://tc39.es/ecma262/#sec-object.defineproperty
	var f$6 = descriptors ? v8PrototypeDefineBug ? function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPropertyKey(P);
	  anObject(Attributes);
	  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
	    var current = $getOwnPropertyDescriptor$1(O, P);
	    if (current && current[WRITABLE]) {
	      O[P] = Attributes.value;
	      Attributes = {
	        configurable: CONFIGURABLE$1 in Attributes ? Attributes[CONFIGURABLE$1] : current[CONFIGURABLE$1],
	        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
	        writable: false
	      };
	    }
	  } return $defineProperty$1(O, P, Attributes);
	} : $defineProperty$1 : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPropertyKey(P);
	  anObject(Attributes);
	  if (ie8DomDefine) try {
	    return $defineProperty$1(O, P, Attributes);
	  } catch (error) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw new $TypeError$G('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var objectDefineProperty = {
		f: f$6
	};

	var createNonEnumerableProperty = descriptors ? function (object, key, value) {
	  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var FunctionPrototype$4 = Function.prototype;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getDescriptor = descriptors && Object.getOwnPropertyDescriptor;

	var EXISTS = hasOwnProperty_1(FunctionPrototype$4, 'name');
	// additional protection from minified / mangled / dropped function names
	var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
	var CONFIGURABLE = EXISTS && (!descriptors || (descriptors && getDescriptor(FunctionPrototype$4, 'name').configurable));

	var functionName = {
	  EXISTS: EXISTS,
	  PROPER: PROPER,
	  CONFIGURABLE: CONFIGURABLE
	};

	var functionToString$1 = functionUncurryThis(Function.toString);

	// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
	if (!isCallable(sharedStore.inspectSource)) {
	  sharedStore.inspectSource = function (it) {
	    return functionToString$1(it);
	  };
	}

	var inspectSource = sharedStore.inspectSource;

	var WeakMap$5 = global_1.WeakMap;

	var weakMapBasicDetection = isCallable(WeakMap$5) && /native code/.test(String(WeakMap$5));

	var keys$3 = shared('keys');

	var sharedKey = function (key) {
	  return keys$3[key] || (keys$3[key] = uid(key));
	};

	var hiddenKeys$1 = {};

	var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
	var TypeError$9 = global_1.TypeError;
	var WeakMap$4 = global_1.WeakMap;
	var set$b, get$7, has$d;

	var enforce = function (it) {
	  return has$d(it) ? get$7(it) : set$b(it, {});
	};

	var getterFor$2 = function (TYPE) {
	  return function (it) {
	    var state;
	    if (!isObject$1(it) || (state = get$7(it)).type !== TYPE) {
	      throw new TypeError$9('Incompatible receiver, ' + TYPE + ' required');
	    } return state;
	  };
	};

	if (weakMapBasicDetection || sharedStore.state) {
	  var store$2 = sharedStore.state || (sharedStore.state = new WeakMap$4());
	  /* eslint-disable no-self-assign -- prototype methods protection */
	  store$2.get = store$2.get;
	  store$2.has = store$2.has;
	  store$2.set = store$2.set;
	  /* eslint-enable no-self-assign -- prototype methods protection */
	  set$b = function (it, metadata) {
	    if (store$2.has(it)) throw new TypeError$9(OBJECT_ALREADY_INITIALIZED);
	    metadata.facade = it;
	    store$2.set(it, metadata);
	    return metadata;
	  };
	  get$7 = function (it) {
	    return store$2.get(it) || {};
	  };
	  has$d = function (it) {
	    return store$2.has(it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys$1[STATE] = true;
	  set$b = function (it, metadata) {
	    if (hasOwnProperty_1(it, STATE)) throw new TypeError$9(OBJECT_ALREADY_INITIALIZED);
	    metadata.facade = it;
	    createNonEnumerableProperty(it, STATE, metadata);
	    return metadata;
	  };
	  get$7 = function (it) {
	    return hasOwnProperty_1(it, STATE) ? it[STATE] : {};
	  };
	  has$d = function (it) {
	    return hasOwnProperty_1(it, STATE);
	  };
	}

	var internalState = {
	  set: set$b,
	  get: get$7,
	  has: has$d,
	  enforce: enforce,
	  getterFor: getterFor$2
	};

	var makeBuiltIn_1 = createCommonjsModule(function (module) {





	var CONFIGURABLE_FUNCTION_NAME = functionName.CONFIGURABLE;



	var enforceInternalState = internalState.enforce;
	var getInternalState = internalState.get;
	var $String = String;
	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var defineProperty = Object.defineProperty;
	var stringSlice = functionUncurryThis(''.slice);
	var replace = functionUncurryThis(''.replace);
	var join = functionUncurryThis([].join);

	var CONFIGURABLE_LENGTH = descriptors && !fails(function () {
	  return defineProperty(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
	});

	var TEMPLATE = String(String).split('String');

	var makeBuiltIn = module.exports = function (value, name, options) {
	  if (stringSlice($String(name), 0, 7) === 'Symbol(') {
	    name = '[' + replace($String(name), /^Symbol\(([^)]*)\)/, '$1') + ']';
	  }
	  if (options && options.getter) name = 'get ' + name;
	  if (options && options.setter) name = 'set ' + name;
	  if (!hasOwnProperty_1(value, 'name') || (CONFIGURABLE_FUNCTION_NAME && value.name !== name)) {
	    if (descriptors) defineProperty(value, 'name', { value: name, configurable: true });
	    else value.name = name;
	  }
	  if (CONFIGURABLE_LENGTH && options && hasOwnProperty_1(options, 'arity') && value.length !== options.arity) {
	    defineProperty(value, 'length', { value: options.arity });
	  }
	  try {
	    if (options && hasOwnProperty_1(options, 'constructor') && options.constructor) {
	      if (descriptors) defineProperty(value, 'prototype', { writable: false });
	    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
	    } else if (value.prototype) value.prototype = undefined;
	  } catch (error) { /* empty */ }
	  var state = enforceInternalState(value);
	  if (!hasOwnProperty_1(state, 'source')) {
	    state.source = join(TEMPLATE, typeof name == 'string' ? name : '');
	  } return value;
	};

	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	// eslint-disable-next-line no-extend-native -- required
	Function.prototype.toString = makeBuiltIn(function toString() {
	  return isCallable(this) && getInternalState(this).source || inspectSource(this);
	}, 'toString');
	});

	var defineBuiltIn = function (O, key, value, options) {
	  if (!options) options = {};
	  var simple = options.enumerable;
	  var name = options.name !== undefined ? options.name : key;
	  if (isCallable(value)) makeBuiltIn_1(value, name, options);
	  if (options.global) {
	    if (simple) O[key] = value;
	    else defineGlobalProperty(key, value);
	  } else {
	    try {
	      if (!options.unsafe) delete O[key];
	      else if (O[key]) simple = true;
	    } catch (error) { /* empty */ }
	    if (simple) O[key] = value;
	    else objectDefineProperty.f(O, key, {
	      value: value,
	      enumerable: false,
	      configurable: !options.nonConfigurable,
	      writable: !options.nonWritable
	    });
	  } return O;
	};

	var ceil$1 = Math.ceil;
	var floor$a = Math.floor;

	// `Math.trunc` method
	// https://tc39.es/ecma262/#sec-math.trunc
	// eslint-disable-next-line es/no-math-trunc -- safe
	var mathTrunc = Math.trunc || function trunc(x) {
	  var n = +x;
	  return (n > 0 ? floor$a : ceil$1)(n);
	};

	// `ToIntegerOrInfinity` abstract operation
	// https://tc39.es/ecma262/#sec-tointegerorinfinity
	var toIntegerOrInfinity = function (argument) {
	  var number = +argument;
	  // eslint-disable-next-line no-self-compare -- NaN check
	  return number !== number || number === 0 ? 0 : mathTrunc(number);
	};

	var max$9 = Math.max;
	var min$e = Math.min;

	// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
	var toAbsoluteIndex = function (index, length) {
	  var integer = toIntegerOrInfinity(index);
	  return integer < 0 ? max$9(integer + length, 0) : min$e(integer, length);
	};

	var min$d = Math.min;

	// `ToLength` abstract operation
	// https://tc39.es/ecma262/#sec-tolength
	var toLength = function (argument) {
	  return argument > 0 ? min$d(toIntegerOrInfinity(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	// `LengthOfArrayLike` abstract operation
	// https://tc39.es/ecma262/#sec-lengthofarraylike
	var lengthOfArrayLike = function (obj) {
	  return toLength(obj.length);
	};

	// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod$8 = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject($this);
	    var length = lengthOfArrayLike(O);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare -- NaN check
	    if (IS_INCLUDES && el !== el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare -- NaN check
	      if (value !== value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes$1 = {
	  // `Array.prototype.includes` method
	  // https://tc39.es/ecma262/#sec-array.prototype.includes
	  includes: createMethod$8(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.es/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod$8(false)
	};

	var indexOf$2 = arrayIncludes$1.indexOf;


	var push$s = functionUncurryThis([].push);

	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) !hasOwnProperty_1(hiddenKeys$1, key) && hasOwnProperty_1(O, key) && push$s(result, key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (hasOwnProperty_1(O, key = names[i++])) {
	    ~indexOf$2(result, key) || push$s(result, key);
	  }
	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys = [
	  'constructor',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'toLocaleString',
	  'toString',
	  'valueOf'
	];

	var hiddenKeys = enumBugKeys.concat('length', 'prototype');

	// `Object.getOwnPropertyNames` method
	// https://tc39.es/ecma262/#sec-object.getownpropertynames
	// eslint-disable-next-line es/no-object-getownpropertynames -- safe
	var f$5 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return objectKeysInternal(O, hiddenKeys);
	};

	var objectGetOwnPropertyNames = {
		f: f$5
	};

	// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
	var f$4 = Object.getOwnPropertySymbols;

	var objectGetOwnPropertySymbols = {
		f: f$4
	};

	var concat$4 = functionUncurryThis([].concat);

	// all object keys, includes non-enumerable and symbols
	var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = objectGetOwnPropertyNames.f(anObject(it));
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  return getOwnPropertySymbols ? concat$4(keys, getOwnPropertySymbols(it)) : keys;
	};

	var copyConstructorProperties$1 = function (target, source, exceptions) {
	  var keys = ownKeys(source);
	  var defineProperty = objectDefineProperty.f;
	  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!hasOwnProperty_1(target, key) && !(exceptions && hasOwnProperty_1(exceptions, key))) {
	      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	    }
	  }
	};

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value === POLYFILL ? true
	    : value === NATIVE ? false
	    : isCallable(detection) ? fails(detection)
	    : !!detection;
	};

	var normalize = isForced.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';

	var isForced_1 = isForced;

	var getOwnPropertyDescriptor$c = objectGetOwnPropertyDescriptor.f;






	/*
	  options.target         - name of the target object
	  options.global         - target is the global object
	  options.stat           - export as static methods of target
	  options.proto          - export as prototype methods of target
	  options.real           - real prototype method for the `pure` version
	  options.forced         - export even if the native feature is available
	  options.bind           - bind methods to the target, required for the `pure` version
	  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
	  options.sham           - add a flag to not completely full polyfills
	  options.enumerable     - export as enumerable property
	  options.dontCallGetSet - prevent calling a getter on target
	  options.name           - the .name of the function if it does not match the key
	*/
	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
	  if (GLOBAL) {
	    target = global_1;
	  } else if (STATIC) {
	    target = global_1[TARGET] || defineGlobalProperty(TARGET, {});
	  } else {
	    target = (global_1[TARGET] || {}).prototype;
	  }
	  if (target) for (key in source) {
	    sourceProperty = source[key];
	    if (options.dontCallGetSet) {
	      descriptor = getOwnPropertyDescriptor$c(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];
	    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
	    // contained in target
	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty == typeof targetProperty) continue;
	      copyConstructorProperties$1(sourceProperty, targetProperty);
	    }
	    // add a flag to not completely full polyfills
	    if (options.sham || (targetProperty && targetProperty.sham)) {
	      createNonEnumerableProperty(sourceProperty, 'sham', true);
	    }
	    defineBuiltIn(target, key, sourceProperty, options);
	  }
	};

	var TO_STRING_TAG$b = wellKnownSymbol('toStringTag');
	var test$2 = {};

	test$2[TO_STRING_TAG$b] = 'z';

	var toStringTagSupport = String(test$2) === '[object z]';

	var TO_STRING_TAG$a = wellKnownSymbol('toStringTag');
	var $Object$5 = Object;

	// ES3 wrong here
	var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) === 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) { /* empty */ }
	};

	// getting tag from ES6+ `Object.prototype.toString`
	var classof = toStringTagSupport ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (tag = tryGet(O = $Object$5(it), TO_STRING_TAG$a)) == 'string' ? tag
	    // builtinTag case
	    : CORRECT_ARGUMENTS ? classofRaw(O)
	    // ES3 arguments fallback
	    : (result = classofRaw(O)) === 'Object' && isCallable(O.callee) ? 'Arguments' : result;
	};

	var $String$6 = String;

	var toString_1$1 = function (argument) {
	  if (classof(argument) === 'Symbol') throw new TypeError('Cannot convert a Symbol value to a string');
	  return $String$6(argument);
	};

	// `Object.keys` method
	// https://tc39.es/ecma262/#sec-object.keys
	// eslint-disable-next-line es/no-object-keys -- safe
	var objectKeys$1 = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	// `Object.defineProperties` method
	// https://tc39.es/ecma262/#sec-object.defineproperties
	// eslint-disable-next-line es/no-object-defineproperties -- safe
	var f$3 = descriptors && !v8PrototypeDefineBug ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var props = toIndexedObject(Properties);
	  var keys = objectKeys$1(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;
	  while (length > index) objectDefineProperty.f(O, key = keys[index++], props[key]);
	  return O;
	};

	var objectDefineProperties = {
		f: f$3
	};

	var html = getBuiltIn('document', 'documentElement');

	/* global ActiveXObject -- old IE, WSH */








	var GT = '>';
	var LT = '<';
	var PROTOTYPE$2 = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO$1 = sharedKey('IE_PROTO');

	var EmptyConstructor = function () { /* empty */ };

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	};

	// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak
	  return temp;
	};

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  // https://github.com/zloirock/core-js/issues/475
	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	};

	// Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug
	var activeXDocument;
	var NullProtoObject = function () {
	  try {
	    activeXDocument = new ActiveXObject('htmlfile');
	  } catch (error) { /* ignore */ }
	  NullProtoObject = typeof document != 'undefined'
	    ? document.domain && activeXDocument
	      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
	      : NullProtoObjectViaIFrame()
	    : NullProtoObjectViaActiveX(activeXDocument); // WSH
	  var length = enumBugKeys.length;
	  while (length--) delete NullProtoObject[PROTOTYPE$2][enumBugKeys[length]];
	  return NullProtoObject();
	};

	hiddenKeys$1[IE_PROTO$1] = true;

	// `Object.create` method
	// https://tc39.es/ecma262/#sec-object.create
	// eslint-disable-next-line es/no-object-create -- safe
	var objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE$2] = anObject(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE$2] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO$1] = O;
	  } else result = NullProtoObject();
	  return Properties === undefined ? result : objectDefineProperties.f(result, Properties);
	};

	var arraySlice = functionUncurryThis([].slice);

	/* eslint-disable es/no-object-getownpropertynames -- safe */


	var $getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;


	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function (it) {
	  try {
	    return $getOwnPropertyNames$1(it);
	  } catch (error) {
	    return arraySlice(windowNames);
	  }
	};

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var f$2 = function getOwnPropertyNames(it) {
	  return windowNames && classofRaw(it) === 'Window'
	    ? getWindowNames(it)
	    : $getOwnPropertyNames$1(toIndexedObject(it));
	};

	var objectGetOwnPropertyNamesExternal = {
		f: f$2
	};

	var defineBuiltInAccessor = function (target, name, descriptor) {
	  if (descriptor.get) makeBuiltIn_1(descriptor.get, name, { getter: true });
	  if (descriptor.set) makeBuiltIn_1(descriptor.set, name, { setter: true });
	  return objectDefineProperty.f(target, name, descriptor);
	};

	var f$1 = wellKnownSymbol;

	var wellKnownSymbolWrapped = {
		f: f$1
	};

	var path = global_1;

	var defineProperty$f = objectDefineProperty.f;

	var wellKnownSymbolDefine = function (NAME) {
	  var Symbol = path.Symbol || (path.Symbol = {});
	  if (!hasOwnProperty_1(Symbol, NAME)) defineProperty$f(Symbol, NAME, {
	    value: wellKnownSymbolWrapped.f(NAME)
	  });
	};

	var symbolDefineToPrimitive = function () {
	  var Symbol = getBuiltIn('Symbol');
	  var SymbolPrototype = Symbol && Symbol.prototype;
	  var valueOf = SymbolPrototype && SymbolPrototype.valueOf;
	  var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

	  if (SymbolPrototype && !SymbolPrototype[TO_PRIMITIVE]) {
	    // `Symbol.prototype[@@toPrimitive]` method
	    // https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
	    // eslint-disable-next-line no-unused-vars -- required for .length
	    defineBuiltIn(SymbolPrototype, TO_PRIMITIVE, function (hint) {
	      return functionCall(valueOf, this);
	    }, { arity: 1 });
	  }
	};

	var defineProperty$e = objectDefineProperty.f;



	var TO_STRING_TAG$9 = wellKnownSymbol('toStringTag');

	var setToStringTag = function (target, TAG, STATIC) {
	  if (target && !STATIC) target = target.prototype;
	  if (target && !hasOwnProperty_1(target, TO_STRING_TAG$9)) {
	    defineProperty$e(target, TO_STRING_TAG$9, { configurable: true, value: TAG });
	  }
	};

	var functionUncurryThisClause = function (fn) {
	  // Nashorn bug:
	  //   https://github.com/zloirock/core-js/issues/1128
	  //   https://github.com/zloirock/core-js/issues/1130
	  if (classofRaw(fn) === 'Function') return functionUncurryThis(fn);
	};

	var bind$1 = functionUncurryThisClause(functionUncurryThisClause.bind);

	// optional / simple context binding
	var functionBindContext = function (fn, that) {
	  aCallable(fn);
	  return that === undefined ? fn : functionBindNative ? bind$1(fn, that) : function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	// `IsArray` abstract operation
	// https://tc39.es/ecma262/#sec-isarray
	// eslint-disable-next-line es/no-array-isarray -- safe
	var isArray$2 = Array.isArray || function isArray(argument) {
	  return classofRaw(argument) === 'Array';
	};

	var noop$1 = function () { /* empty */ };
	var empty = [];
	var construct$1 = getBuiltIn('Reflect', 'construct');
	var constructorRegExp = /^\s*(?:class|function)\b/;
	var exec$g = functionUncurryThis(constructorRegExp.exec);
	var INCORRECT_TO_STRING$2 = !constructorRegExp.test(noop$1);

	var isConstructorModern = function isConstructor(argument) {
	  if (!isCallable(argument)) return false;
	  try {
	    construct$1(noop$1, empty, argument);
	    return true;
	  } catch (error) {
	    return false;
	  }
	};

	var isConstructorLegacy = function isConstructor(argument) {
	  if (!isCallable(argument)) return false;
	  switch (classof(argument)) {
	    case 'AsyncFunction':
	    case 'GeneratorFunction':
	    case 'AsyncGeneratorFunction': return false;
	  }
	  try {
	    // we can't check .prototype since constructors produced by .bind haven't it
	    // `Function#toString` throws on some built-it function in some legacy engines
	    // (for example, `DOMQuad` and similar in FF41-)
	    return INCORRECT_TO_STRING$2 || !!exec$g(constructorRegExp, inspectSource(argument));
	  } catch (error) {
	    return true;
	  }
	};

	isConstructorLegacy.sham = true;

	// `IsConstructor` abstract operation
	// https://tc39.es/ecma262/#sec-isconstructor
	var isConstructor = !construct$1 || fails(function () {
	  var called;
	  return isConstructorModern(isConstructorModern.call)
	    || !isConstructorModern(Object)
	    || !isConstructorModern(function () { called = true; })
	    || called;
	}) ? isConstructorLegacy : isConstructorModern;

	var SPECIES$6 = wellKnownSymbol('species');
	var $Array$b = Array;

	// a part of `ArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#sec-arrayspeciescreate
	var arraySpeciesConstructor = function (originalArray) {
	  var C;
	  if (isArray$2(originalArray)) {
	    C = originalArray.constructor;
	    // cross-realm fallback
	    if (isConstructor(C) && (C === $Array$b || isArray$2(C.prototype))) C = undefined;
	    else if (isObject$1(C)) {
	      C = C[SPECIES$6];
	      if (C === null) C = undefined;
	    }
	  } return C === undefined ? $Array$b : C;
	};

	// `ArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#sec-arrayspeciescreate
	var arraySpeciesCreate = function (originalArray, length) {
	  return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
	};

	var push$r = functionUncurryThis([].push);

	// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
	var createMethod$7 = function (TYPE) {
	  var IS_MAP = TYPE === 1;
	  var IS_FILTER = TYPE === 2;
	  var IS_SOME = TYPE === 3;
	  var IS_EVERY = TYPE === 4;
	  var IS_FIND_INDEX = TYPE === 6;
	  var IS_FILTER_REJECT = TYPE === 7;
	  var NO_HOLES = TYPE === 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var length = lengthOfArrayLike(self);
	    var boundFunction = functionBindContext(callbackfn, that);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_REJECT ? create($this, 0) : undefined;
	    var value, result;
	    for (;length > index; index++) if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);
	      if (TYPE) {
	        if (IS_MAP) target[index] = result; // map
	        else if (result) switch (TYPE) {
	          case 3: return true;              // some
	          case 5: return value;             // find
	          case 6: return index;             // findIndex
	          case 2: push$r(target, value);      // filter
	        } else switch (TYPE) {
	          case 4: return false;             // every
	          case 7: push$r(target, value);      // filterReject
	        }
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.es/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$7(0),
	  // `Array.prototype.map` method
	  // https://tc39.es/ecma262/#sec-array.prototype.map
	  map: createMethod$7(1),
	  // `Array.prototype.filter` method
	  // https://tc39.es/ecma262/#sec-array.prototype.filter
	  filter: createMethod$7(2),
	  // `Array.prototype.some` method
	  // https://tc39.es/ecma262/#sec-array.prototype.some
	  some: createMethod$7(3),
	  // `Array.prototype.every` method
	  // https://tc39.es/ecma262/#sec-array.prototype.every
	  every: createMethod$7(4),
	  // `Array.prototype.find` method
	  // https://tc39.es/ecma262/#sec-array.prototype.find
	  find: createMethod$7(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$7(6),
	  // `Array.prototype.filterReject` method
	  // https://github.com/tc39/proposal-array-filtering
	  filterReject: createMethod$7(7)
	};

	var $forEach$3 = arrayIteration.forEach;

	var HIDDEN = sharedKey('hidden');
	var SYMBOL = 'Symbol';
	var PROTOTYPE$1 = 'prototype';

	var setInternalState$l = internalState.set;
	var getInternalState$e = internalState.getterFor(SYMBOL);

	var ObjectPrototype$5 = Object[PROTOTYPE$1];
	var $Symbol = global_1.Symbol;
	var SymbolPrototype$1 = $Symbol && $Symbol[PROTOTYPE$1];
	var RangeError$3 = global_1.RangeError;
	var TypeError$8 = global_1.TypeError;
	var QObject = global_1.QObject;
	var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
	var nativeDefineProperty = objectDefineProperty.f;
	var nativeGetOwnPropertyNames = objectGetOwnPropertyNamesExternal.f;
	var nativePropertyIsEnumerable = objectPropertyIsEnumerable.f;
	var push$q = functionUncurryThis([].push);

	var AllSymbols = shared('symbols');
	var ObjectPrototypeSymbols = shared('op-symbols');
	var WellKnownSymbolsStore$1 = shared('wks');

	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var fallbackDefineProperty = function (O, P, Attributes) {
	  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor$1(ObjectPrototype$5, P);
	  if (ObjectPrototypeDescriptor) delete ObjectPrototype$5[P];
	  nativeDefineProperty(O, P, Attributes);
	  if (ObjectPrototypeDescriptor && O !== ObjectPrototype$5) {
	    nativeDefineProperty(ObjectPrototype$5, P, ObjectPrototypeDescriptor);
	  }
	};

	var setSymbolDescriptor = descriptors && fails(function () {
	  return objectCreate(nativeDefineProperty({}, 'a', {
	    get: function () { return nativeDefineProperty(this, 'a', { value: 7 }).a; }
	  })).a !== 7;
	}) ? fallbackDefineProperty : nativeDefineProperty;

	var wrap = function (tag, description) {
	  var symbol = AllSymbols[tag] = objectCreate(SymbolPrototype$1);
	  setInternalState$l(symbol, {
	    type: SYMBOL,
	    tag: tag,
	    description: description
	  });
	  if (!descriptors) symbol.description = description;
	  return symbol;
	};

	var $defineProperty = function defineProperty(O, P, Attributes) {
	  if (O === ObjectPrototype$5) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
	  anObject(O);
	  var key = toPropertyKey(P);
	  anObject(Attributes);
	  if (hasOwnProperty_1(AllSymbols, key)) {
	    if (!Attributes.enumerable) {
	      if (!hasOwnProperty_1(O, HIDDEN)) nativeDefineProperty(O, HIDDEN, createPropertyDescriptor(1, objectCreate(null)));
	      O[HIDDEN][key] = true;
	    } else {
	      if (hasOwnProperty_1(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
	      Attributes = objectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
	    } return setSymbolDescriptor(O, key, Attributes);
	  } return nativeDefineProperty(O, key, Attributes);
	};

	var $defineProperties = function defineProperties(O, Properties) {
	  anObject(O);
	  var properties = toIndexedObject(Properties);
	  var keys = objectKeys$1(properties).concat($getOwnPropertySymbols(properties));
	  $forEach$3(keys, function (key) {
	    if (!descriptors || functionCall($propertyIsEnumerable$1, properties, key)) $defineProperty(O, key, properties[key]);
	  });
	  return O;
	};

	var $create = function create(O, Properties) {
	  return Properties === undefined ? objectCreate(O) : $defineProperties(objectCreate(O), Properties);
	};

	var $propertyIsEnumerable$1 = function propertyIsEnumerable(V) {
	  var P = toPropertyKey(V);
	  var enumerable = functionCall(nativePropertyIsEnumerable, this, P);
	  if (this === ObjectPrototype$5 && hasOwnProperty_1(AllSymbols, P) && !hasOwnProperty_1(ObjectPrototypeSymbols, P)) return false;
	  return enumerable || !hasOwnProperty_1(this, P) || !hasOwnProperty_1(AllSymbols, P) || hasOwnProperty_1(this, HIDDEN) && this[HIDDEN][P]
	    ? enumerable : true;
	};

	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
	  var it = toIndexedObject(O);
	  var key = toPropertyKey(P);
	  if (it === ObjectPrototype$5 && hasOwnProperty_1(AllSymbols, key) && !hasOwnProperty_1(ObjectPrototypeSymbols, key)) return;
	  var descriptor = nativeGetOwnPropertyDescriptor$1(it, key);
	  if (descriptor && hasOwnProperty_1(AllSymbols, key) && !(hasOwnProperty_1(it, HIDDEN) && it[HIDDEN][key])) {
	    descriptor.enumerable = true;
	  }
	  return descriptor;
	};

	var $getOwnPropertyNames = function getOwnPropertyNames(O) {
	  var names = nativeGetOwnPropertyNames(toIndexedObject(O));
	  var result = [];
	  $forEach$3(names, function (key) {
	    if (!hasOwnProperty_1(AllSymbols, key) && !hasOwnProperty_1(hiddenKeys$1, key)) push$q(result, key);
	  });
	  return result;
	};

	var $getOwnPropertySymbols = function (O) {
	  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype$5;
	  var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
	  var result = [];
	  $forEach$3(names, function (key) {
	    if (hasOwnProperty_1(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || hasOwnProperty_1(ObjectPrototype$5, key))) {
	      push$q(result, AllSymbols[key]);
	    }
	  });
	  return result;
	};

	// `Symbol` constructor
	// https://tc39.es/ecma262/#sec-symbol-constructor
	if (!symbolConstructorDetection) {
	  $Symbol = function Symbol() {
	    if (objectIsPrototypeOf(SymbolPrototype$1, this)) throw new TypeError$8('Symbol is not a constructor');
	    var description = !arguments.length || arguments[0] === undefined ? undefined : toString_1$1(arguments[0]);
	    var tag = uid(description);
	    var setter = function (value) {
	      var $this = this === undefined ? global_1 : this;
	      if ($this === ObjectPrototype$5) functionCall(setter, ObjectPrototypeSymbols, value);
	      if (hasOwnProperty_1($this, HIDDEN) && hasOwnProperty_1($this[HIDDEN], tag)) $this[HIDDEN][tag] = false;
	      var descriptor = createPropertyDescriptor(1, value);
	      try {
	        setSymbolDescriptor($this, tag, descriptor);
	      } catch (error) {
	        if (!(error instanceof RangeError$3)) throw error;
	        fallbackDefineProperty($this, tag, descriptor);
	      }
	    };
	    if (descriptors && USE_SETTER) setSymbolDescriptor(ObjectPrototype$5, tag, { configurable: true, set: setter });
	    return wrap(tag, description);
	  };

	  SymbolPrototype$1 = $Symbol[PROTOTYPE$1];

	  defineBuiltIn(SymbolPrototype$1, 'toString', function toString() {
	    return getInternalState$e(this).tag;
	  });

	  defineBuiltIn($Symbol, 'withoutSetter', function (description) {
	    return wrap(uid(description), description);
	  });

	  objectPropertyIsEnumerable.f = $propertyIsEnumerable$1;
	  objectDefineProperty.f = $defineProperty;
	  objectDefineProperties.f = $defineProperties;
	  objectGetOwnPropertyDescriptor.f = $getOwnPropertyDescriptor;
	  objectGetOwnPropertyNames.f = objectGetOwnPropertyNamesExternal.f = $getOwnPropertyNames;
	  objectGetOwnPropertySymbols.f = $getOwnPropertySymbols;

	  wellKnownSymbolWrapped.f = function (name) {
	    return wrap(wellKnownSymbol(name), name);
	  };

	  if (descriptors) {
	    // https://github.com/tc39/proposal-Symbol-description
	    defineBuiltInAccessor(SymbolPrototype$1, 'description', {
	      configurable: true,
	      get: function description() {
	        return getInternalState$e(this).description;
	      }
	    });
	    {
	      defineBuiltIn(ObjectPrototype$5, 'propertyIsEnumerable', $propertyIsEnumerable$1, { unsafe: true });
	    }
	  }
	}

	_export({ global: true, constructor: true, wrap: true, forced: !symbolConstructorDetection, sham: !symbolConstructorDetection }, {
	  Symbol: $Symbol
	});

	$forEach$3(objectKeys$1(WellKnownSymbolsStore$1), function (name) {
	  wellKnownSymbolDefine(name);
	});

	_export({ target: SYMBOL, stat: true, forced: !symbolConstructorDetection }, {
	  useSetter: function () { USE_SETTER = true; },
	  useSimple: function () { USE_SETTER = false; }
	});

	_export({ target: 'Object', stat: true, forced: !symbolConstructorDetection, sham: !descriptors }, {
	  // `Object.create` method
	  // https://tc39.es/ecma262/#sec-object.create
	  create: $create,
	  // `Object.defineProperty` method
	  // https://tc39.es/ecma262/#sec-object.defineproperty
	  defineProperty: $defineProperty,
	  // `Object.defineProperties` method
	  // https://tc39.es/ecma262/#sec-object.defineproperties
	  defineProperties: $defineProperties,
	  // `Object.getOwnPropertyDescriptor` method
	  // https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor
	});

	_export({ target: 'Object', stat: true, forced: !symbolConstructorDetection }, {
	  // `Object.getOwnPropertyNames` method
	  // https://tc39.es/ecma262/#sec-object.getownpropertynames
	  getOwnPropertyNames: $getOwnPropertyNames
	});

	// `Symbol.prototype[@@toPrimitive]` method
	// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
	symbolDefineToPrimitive();

	// `Symbol.prototype[@@toStringTag]` property
	// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
	setToStringTag($Symbol, SYMBOL);

	hiddenKeys$1[HIDDEN] = true;

	/* eslint-disable es/no-symbol -- safe */
	var symbolRegistryDetection = symbolConstructorDetection && !!Symbol['for'] && !!Symbol.keyFor;

	var StringToSymbolRegistry = shared('string-to-symbol-registry');
	var SymbolToStringRegistry$1 = shared('symbol-to-string-registry');

	// `Symbol.for` method
	// https://tc39.es/ecma262/#sec-symbol.for
	_export({ target: 'Symbol', stat: true, forced: !symbolRegistryDetection }, {
	  'for': function (key) {
	    var string = toString_1$1(key);
	    if (hasOwnProperty_1(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
	    var symbol = getBuiltIn('Symbol')(string);
	    StringToSymbolRegistry[string] = symbol;
	    SymbolToStringRegistry$1[symbol] = string;
	    return symbol;
	  }
	});

	var SymbolToStringRegistry = shared('symbol-to-string-registry');

	// `Symbol.keyFor` method
	// https://tc39.es/ecma262/#sec-symbol.keyfor
	_export({ target: 'Symbol', stat: true, forced: !symbolRegistryDetection }, {
	  keyFor: function keyFor(sym) {
	    if (!isSymbol$1(sym)) throw new TypeError(tryToString(sym) + ' is not a symbol');
	    if (hasOwnProperty_1(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
	  }
	});

	var FunctionPrototype$3 = Function.prototype;
	var apply$1 = FunctionPrototype$3.apply;
	var call = FunctionPrototype$3.call;

	// eslint-disable-next-line es/no-reflect -- safe
	var functionApply = typeof Reflect == 'object' && Reflect.apply || (functionBindNative ? call.bind(apply$1) : function () {
	  return call.apply(apply$1, arguments);
	});

	var push$p = functionUncurryThis([].push);

	var getJsonReplacerFunction = function (replacer) {
	  if (isCallable(replacer)) return replacer;
	  if (!isArray$2(replacer)) return;
	  var rawLength = replacer.length;
	  var keys = [];
	  for (var i = 0; i < rawLength; i++) {
	    var element = replacer[i];
	    if (typeof element == 'string') push$p(keys, element);
	    else if (typeof element == 'number' || classofRaw(element) === 'Number' || classofRaw(element) === 'String') push$p(keys, toString_1$1(element));
	  }
	  var keysLength = keys.length;
	  var root = true;
	  return function (key, value) {
	    if (root) {
	      root = false;
	      return value;
	    }
	    if (isArray$2(this)) return value;
	    for (var j = 0; j < keysLength; j++) if (keys[j] === key) return value;
	  };
	};

	var $String$5 = String;
	var $stringify$1 = getBuiltIn('JSON', 'stringify');
	var exec$f = functionUncurryThis(/./.exec);
	var charAt$m = functionUncurryThis(''.charAt);
	var charCodeAt$9 = functionUncurryThis(''.charCodeAt);
	var replace$d = functionUncurryThis(''.replace);
	var numberToString$4 = functionUncurryThis(1.0.toString);

	var tester = /[\uD800-\uDFFF]/g;
	var low = /^[\uD800-\uDBFF]$/;
	var hi = /^[\uDC00-\uDFFF]$/;

	var WRONG_SYMBOLS_CONVERSION = !symbolConstructorDetection || fails(function () {
	  var symbol = getBuiltIn('Symbol')('stringify detection');
	  // MS Edge converts symbol values to JSON as {}
	  return $stringify$1([symbol]) !== '[null]'
	    // WebKit converts symbol values to JSON as null
	    || $stringify$1({ a: symbol }) !== '{}'
	    // V8 throws on boxed symbols
	    || $stringify$1(Object(symbol)) !== '{}';
	});

	// https://github.com/tc39/proposal-well-formed-stringify
	var ILL_FORMED_UNICODE = fails(function () {
	  return $stringify$1('\uDF06\uD834') !== '"\\udf06\\ud834"'
	    || $stringify$1('\uDEAD') !== '"\\udead"';
	});

	var stringifyWithSymbolsFix = function (it, replacer) {
	  var args = arraySlice(arguments);
	  var $replacer = getJsonReplacerFunction(replacer);
	  if (!isCallable($replacer) && (it === undefined || isSymbol$1(it))) return; // IE8 returns string on undefined
	  args[1] = function (key, value) {
	    // some old implementations (like WebKit) could pass numbers as keys
	    if (isCallable($replacer)) value = functionCall($replacer, this, $String$5(key), value);
	    if (!isSymbol$1(value)) return value;
	  };
	  return functionApply($stringify$1, null, args);
	};

	var fixIllFormed = function (match, offset, string) {
	  var prev = charAt$m(string, offset - 1);
	  var next = charAt$m(string, offset + 1);
	  if ((exec$f(low, match) && !exec$f(hi, next)) || (exec$f(hi, match) && !exec$f(low, prev))) {
	    return '\\u' + numberToString$4(charCodeAt$9(match, 0), 16);
	  } return match;
	};

	if ($stringify$1) {
	  // `JSON.stringify` method
	  // https://tc39.es/ecma262/#sec-json.stringify
	  _export({ target: 'JSON', stat: true, arity: 3, forced: WRONG_SYMBOLS_CONVERSION || ILL_FORMED_UNICODE }, {
	    // eslint-disable-next-line no-unused-vars -- required for `.length`
	    stringify: function stringify(it, replacer, space) {
	      var args = arraySlice(arguments);
	      var result = functionApply(WRONG_SYMBOLS_CONVERSION ? stringifyWithSymbolsFix : $stringify$1, null, args);
	      return ILL_FORMED_UNICODE && typeof result == 'string' ? replace$d(result, tester, fixIllFormed) : result;
	    }
	  });
	}

	// V8 ~ Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
	// https://bugs.chromium.org/p/v8/issues/detail?id=3443
	var FORCED$B = !symbolConstructorDetection || fails(function () { objectGetOwnPropertySymbols.f(1); });

	// `Object.getOwnPropertySymbols` method
	// https://tc39.es/ecma262/#sec-object.getownpropertysymbols
	_export({ target: 'Object', stat: true, forced: FORCED$B }, {
	  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
	    var $getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	    return $getOwnPropertySymbols ? $getOwnPropertySymbols(toObject(it)) : [];
	  }
	});

	var NativeSymbol = global_1.Symbol;
	var SymbolPrototype = NativeSymbol && NativeSymbol.prototype;

	if (descriptors && isCallable(NativeSymbol) && (!('description' in SymbolPrototype) ||
	  // Safari 12 bug
	  NativeSymbol().description !== undefined
	)) {
	  var EmptyStringDescriptionStore = {};
	  // wrap Symbol constructor for correct work with undefined description
	  var SymbolWrapper = function Symbol() {
	    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : toString_1$1(arguments[0]);
	    var result = objectIsPrototypeOf(SymbolPrototype, this)
	      ? new NativeSymbol(description)
	      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
	      : description === undefined ? NativeSymbol() : NativeSymbol(description);
	    if (description === '') EmptyStringDescriptionStore[result] = true;
	    return result;
	  };

	  copyConstructorProperties$1(SymbolWrapper, NativeSymbol);
	  SymbolWrapper.prototype = SymbolPrototype;
	  SymbolPrototype.constructor = SymbolWrapper;

	  var NATIVE_SYMBOL = String(NativeSymbol('description detection')) === 'Symbol(description detection)';
	  var thisSymbolValue$2 = functionUncurryThis(SymbolPrototype.valueOf);
	  var symbolDescriptiveString = functionUncurryThis(SymbolPrototype.toString);
	  var regexp = /^Symbol\((.*)\)[^)]+$/;
	  var replace$c = functionUncurryThis(''.replace);
	  var stringSlice$l = functionUncurryThis(''.slice);

	  defineBuiltInAccessor(SymbolPrototype, 'description', {
	    configurable: true,
	    get: function description() {
	      var symbol = thisSymbolValue$2(this);
	      if (hasOwnProperty_1(EmptyStringDescriptionStore, symbol)) return '';
	      var string = symbolDescriptiveString(symbol);
	      var desc = NATIVE_SYMBOL ? stringSlice$l(string, 7, -1) : replace$c(string, regexp, '$1');
	      return desc === '' ? undefined : desc;
	    }
	  });

	  _export({ global: true, constructor: true, forced: true }, {
	    Symbol: SymbolWrapper
	  });
	}

	// `Symbol.asyncIterator` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.asynciterator
	wellKnownSymbolDefine('asyncIterator');

	// `Symbol.hasInstance` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.hasinstance
	wellKnownSymbolDefine('hasInstance');

	// `Symbol.isConcatSpreadable` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.isconcatspreadable
	wellKnownSymbolDefine('isConcatSpreadable');

	// `Symbol.iterator` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.iterator
	wellKnownSymbolDefine('iterator');

	// `Symbol.match` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.match
	wellKnownSymbolDefine('match');

	// `Symbol.matchAll` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.matchall
	wellKnownSymbolDefine('matchAll');

	// `Symbol.replace` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.replace
	wellKnownSymbolDefine('replace');

	// `Symbol.search` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.search
	wellKnownSymbolDefine('search');

	// `Symbol.species` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.species
	wellKnownSymbolDefine('species');

	// `Symbol.split` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.split
	wellKnownSymbolDefine('split');

	// `Symbol.toPrimitive` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.toprimitive
	wellKnownSymbolDefine('toPrimitive');

	// `Symbol.prototype[@@toPrimitive]` method
	// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
	symbolDefineToPrimitive();

	// `Symbol.toStringTag` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.tostringtag
	wellKnownSymbolDefine('toStringTag');

	// `Symbol.prototype[@@toStringTag]` property
	// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
	setToStringTag(getBuiltIn('Symbol'), 'Symbol');

	// `Symbol.unscopables` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.unscopables
	wellKnownSymbolDefine('unscopables');

	var functionUncurryThisAccessor = function (object, key, method) {
	  try {
	    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	    return functionUncurryThis(aCallable(Object.getOwnPropertyDescriptor(object, key)[method]));
	  } catch (error) { /* empty */ }
	};

	var isPossiblePrototype = function (argument) {
	  return isObject$1(argument) || argument === null;
	};

	var $String$4 = String;
	var $TypeError$F = TypeError;

	var aPossiblePrototype = function (argument) {
	  if (isPossiblePrototype(argument)) return argument;
	  throw new $TypeError$F("Can't set " + $String$4(argument) + ' as a prototype');
	};

	/* eslint-disable no-proto -- safe */




	// `Object.setPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.
	// eslint-disable-next-line es/no-object-setprototypeof -- safe
	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;
	  try {
	    setter = functionUncurryThisAccessor(Object.prototype, '__proto__', 'set');
	    setter(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) { /* empty */ }
	  return function setPrototypeOf(O, proto) {
	    anObject(O);
	    aPossiblePrototype(proto);
	    if (CORRECT_SETTER) setter(O, proto);
	    else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);

	var defineProperty$d = objectDefineProperty.f;

	var proxyAccessor = function (Target, Source, key) {
	  key in Target || defineProperty$d(Target, key, {
	    configurable: true,
	    get: function () { return Source[key]; },
	    set: function (it) { Source[key] = it; }
	  });
	};

	// makes subclassing work correct for wrapped built-ins
	var inheritIfRequired = function ($this, dummy, Wrapper) {
	  var NewTarget, NewTargetPrototype;
	  if (
	    // it can work only with native `setPrototypeOf`
	    objectSetPrototypeOf &&
	    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
	    isCallable(NewTarget = dummy.constructor) &&
	    NewTarget !== Wrapper &&
	    isObject$1(NewTargetPrototype = NewTarget.prototype) &&
	    NewTargetPrototype !== Wrapper.prototype
	  ) objectSetPrototypeOf($this, NewTargetPrototype);
	  return $this;
	};

	var normalizeStringArgument = function (argument, $default) {
	  return argument === undefined ? arguments.length < 2 ? '' : $default : toString_1$1(argument);
	};

	// `InstallErrorCause` abstract operation
	// https://tc39.es/proposal-error-cause/#sec-errorobjects-install-error-cause
	var installErrorCause = function (O, options) {
	  if (isObject$1(options) && 'cause' in options) {
	    createNonEnumerableProperty(O, 'cause', options.cause);
	  }
	};

	var $Error$2 = Error;
	var replace$b = functionUncurryThis(''.replace);

	var TEST = (function (arg) { return String(new $Error$2(arg).stack); })('zxcasd');
	// eslint-disable-next-line redos/no-vulnerable -- safe
	var V8_OR_CHAKRA_STACK_ENTRY = /\n\s*at [^:]*:[^\n]*/;
	var IS_V8_OR_CHAKRA_STACK = V8_OR_CHAKRA_STACK_ENTRY.test(TEST);

	var errorStackClear = function (stack, dropEntries) {
	  if (IS_V8_OR_CHAKRA_STACK && typeof stack == 'string' && !$Error$2.prepareStackTrace) {
	    while (dropEntries--) stack = replace$b(stack, V8_OR_CHAKRA_STACK_ENTRY, '');
	  } return stack;
	};

	var errorStackInstallable = !fails(function () {
	  var error = new Error('a');
	  if (!('stack' in error)) return true;
	  // eslint-disable-next-line es/no-object-defineproperty -- safe
	  Object.defineProperty(error, 'stack', createPropertyDescriptor(1, 7));
	  return error.stack !== 7;
	});

	// non-standard V8
	var captureStackTrace = Error.captureStackTrace;

	var errorStackInstall = function (error, C, stack, dropEntries) {
	  if (errorStackInstallable) {
	    if (captureStackTrace) captureStackTrace(error, C);
	    else createNonEnumerableProperty(error, 'stack', errorStackClear(stack, dropEntries));
	  }
	};

	var wrapErrorConstructorWithCause = function (FULL_NAME, wrapper, FORCED, IS_AGGREGATE_ERROR) {
	  var STACK_TRACE_LIMIT = 'stackTraceLimit';
	  var OPTIONS_POSITION = IS_AGGREGATE_ERROR ? 2 : 1;
	  var path = FULL_NAME.split('.');
	  var ERROR_NAME = path[path.length - 1];
	  var OriginalError = getBuiltIn.apply(null, path);

	  if (!OriginalError) return;

	  var OriginalErrorPrototype = OriginalError.prototype;

	  // V8 9.3- bug https://bugs.chromium.org/p/v8/issues/detail?id=12006
	  if (hasOwnProperty_1(OriginalErrorPrototype, 'cause')) delete OriginalErrorPrototype.cause;

	  if (!FORCED) return OriginalError;

	  var BaseError = getBuiltIn('Error');

	  var WrappedError = wrapper(function (a, b) {
	    var message = normalizeStringArgument(IS_AGGREGATE_ERROR ? b : a, undefined);
	    var result = IS_AGGREGATE_ERROR ? new OriginalError(a) : new OriginalError();
	    if (message !== undefined) createNonEnumerableProperty(result, 'message', message);
	    errorStackInstall(result, WrappedError, result.stack, 2);
	    if (this && objectIsPrototypeOf(OriginalErrorPrototype, this)) inheritIfRequired(result, this, WrappedError);
	    if (arguments.length > OPTIONS_POSITION) installErrorCause(result, arguments[OPTIONS_POSITION]);
	    return result;
	  });

	  WrappedError.prototype = OriginalErrorPrototype;

	  if (ERROR_NAME !== 'Error') {
	    if (objectSetPrototypeOf) objectSetPrototypeOf(WrappedError, BaseError);
	    else copyConstructorProperties$1(WrappedError, BaseError, { name: true });
	  } else if (descriptors && STACK_TRACE_LIMIT in OriginalError) {
	    proxyAccessor(WrappedError, OriginalError, STACK_TRACE_LIMIT);
	    proxyAccessor(WrappedError, OriginalError, 'prepareStackTrace');
	  }

	  copyConstructorProperties$1(WrappedError, OriginalError);

	  try {
	    // Safari 13- bug: WebAssembly errors does not have a proper `.name`
	    if (OriginalErrorPrototype.name !== ERROR_NAME) {
	      createNonEnumerableProperty(OriginalErrorPrototype, 'name', ERROR_NAME);
	    }
	    OriginalErrorPrototype.constructor = WrappedError;
	  } catch (error) { /* empty */ }

	  return WrappedError;
	};

	/* eslint-disable no-unused-vars -- required for functions `.length` */





	var WEB_ASSEMBLY = 'WebAssembly';
	var WebAssembly = global_1[WEB_ASSEMBLY];

	// eslint-disable-next-line es/no-error-cause -- feature detection
	var FORCED$A = new Error('e', { cause: 7 }).cause !== 7;

	var exportGlobalErrorCauseWrapper = function (ERROR_NAME, wrapper) {
	  var O = {};
	  O[ERROR_NAME] = wrapErrorConstructorWithCause(ERROR_NAME, wrapper, FORCED$A);
	  _export({ global: true, constructor: true, arity: 1, forced: FORCED$A }, O);
	};

	var exportWebAssemblyErrorCauseWrapper = function (ERROR_NAME, wrapper) {
	  if (WebAssembly && WebAssembly[ERROR_NAME]) {
	    var O = {};
	    O[ERROR_NAME] = wrapErrorConstructorWithCause(WEB_ASSEMBLY + '.' + ERROR_NAME, wrapper, FORCED$A);
	    _export({ target: WEB_ASSEMBLY, stat: true, constructor: true, arity: 1, forced: FORCED$A }, O);
	  }
	};

	// https://tc39.es/ecma262/#sec-nativeerror
	exportGlobalErrorCauseWrapper('Error', function (init) {
	  return function Error(message) { return functionApply(init, this, arguments); };
	});
	exportGlobalErrorCauseWrapper('EvalError', function (init) {
	  return function EvalError(message) { return functionApply(init, this, arguments); };
	});
	exportGlobalErrorCauseWrapper('RangeError', function (init) {
	  return function RangeError(message) { return functionApply(init, this, arguments); };
	});
	exportGlobalErrorCauseWrapper('ReferenceError', function (init) {
	  return function ReferenceError(message) { return functionApply(init, this, arguments); };
	});
	exportGlobalErrorCauseWrapper('SyntaxError', function (init) {
	  return function SyntaxError(message) { return functionApply(init, this, arguments); };
	});
	exportGlobalErrorCauseWrapper('TypeError', function (init) {
	  return function TypeError(message) { return functionApply(init, this, arguments); };
	});
	exportGlobalErrorCauseWrapper('URIError', function (init) {
	  return function URIError(message) { return functionApply(init, this, arguments); };
	});
	exportWebAssemblyErrorCauseWrapper('CompileError', function (init) {
	  return function CompileError(message) { return functionApply(init, this, arguments); };
	});
	exportWebAssemblyErrorCauseWrapper('LinkError', function (init) {
	  return function LinkError(message) { return functionApply(init, this, arguments); };
	});
	exportWebAssemblyErrorCauseWrapper('RuntimeError', function (init) {
	  return function RuntimeError(message) { return functionApply(init, this, arguments); };
	});

	var nativeErrorToString = Error.prototype.toString;

	var INCORRECT_TO_STRING$1 = fails(function () {
	  if (descriptors) {
	    // Chrome 32- incorrectly call accessor
	    // eslint-disable-next-line es/no-object-create, es/no-object-defineproperty -- safe
	    var object = Object.create(Object.defineProperty({}, 'name', { get: function () {
	      return this === object;
	    } }));
	    if (nativeErrorToString.call(object) !== 'true') return true;
	  }
	  // FF10- does not properly handle non-strings
	  return nativeErrorToString.call({ message: 1, name: 2 }) !== '2: 1'
	    // IE8 does not properly handle defaults
	    || nativeErrorToString.call({}) !== 'Error';
	});

	var errorToString = INCORRECT_TO_STRING$1 ? function toString() {
	  var O = anObject(this);
	  var name = normalizeStringArgument(O.name, 'Error');
	  var message = normalizeStringArgument(O.message);
	  return !name ? message : !message ? name : name + ': ' + message;
	} : nativeErrorToString;

	var ErrorPrototype$1 = Error.prototype;

	// `Error.prototype.toString` method fix
	// https://tc39.es/ecma262/#sec-error.prototype.tostring
	if (ErrorPrototype$1.toString !== errorToString) {
	  defineBuiltIn(ErrorPrototype$1, 'toString', errorToString);
	}

	var correctPrototypeGetter = !fails(function () {
	  function F() { /* empty */ }
	  F.prototype.constructor = null;
	  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var IE_PROTO = sharedKey('IE_PROTO');
	var $Object$4 = Object;
	var ObjectPrototype$4 = $Object$4.prototype;

	// `Object.getPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.getprototypeof
	// eslint-disable-next-line es/no-object-getprototypeof -- safe
	var objectGetPrototypeOf = correctPrototypeGetter ? $Object$4.getPrototypeOf : function (O) {
	  var object = toObject(O);
	  if (hasOwnProperty_1(object, IE_PROTO)) return object[IE_PROTO];
	  var constructor = object.constructor;
	  if (isCallable(constructor) && object instanceof constructor) {
	    return constructor.prototype;
	  } return object instanceof $Object$4 ? ObjectPrototype$4 : null;
	};

	var iterators = {};

	var ITERATOR$c = wellKnownSymbol('iterator');
	var ArrayPrototype$1 = Array.prototype;

	// check on default Array iterator
	var isArrayIteratorMethod = function (it) {
	  return it !== undefined && (iterators.Array === it || ArrayPrototype$1[ITERATOR$c] === it);
	};

	var ITERATOR$b = wellKnownSymbol('iterator');

	var getIteratorMethod = function (it) {
	  if (!isNullOrUndefined(it)) return getMethod(it, ITERATOR$b)
	    || getMethod(it, '@@iterator')
	    || iterators[classof(it)];
	};

	var $TypeError$E = TypeError;

	var getIterator = function (argument, usingIterator) {
	  var iteratorMethod = arguments.length < 2 ? getIteratorMethod(argument) : usingIterator;
	  if (aCallable(iteratorMethod)) return anObject(functionCall(iteratorMethod, argument));
	  throw new $TypeError$E(tryToString(argument) + ' is not iterable');
	};

	var iteratorClose = function (iterator, kind, value) {
	  var innerResult, innerError;
	  anObject(iterator);
	  try {
	    innerResult = getMethod(iterator, 'return');
	    if (!innerResult) {
	      if (kind === 'throw') throw value;
	      return value;
	    }
	    innerResult = functionCall(innerResult, iterator);
	  } catch (error) {
	    innerError = true;
	    innerResult = error;
	  }
	  if (kind === 'throw') throw value;
	  if (innerError) throw innerResult;
	  anObject(innerResult);
	  return value;
	};

	var $TypeError$D = TypeError;

	var Result = function (stopped, result) {
	  this.stopped = stopped;
	  this.result = result;
	};

	var ResultPrototype = Result.prototype;

	var iterate = function (iterable, unboundFunction, options) {
	  var that = options && options.that;
	  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
	  var IS_RECORD = !!(options && options.IS_RECORD);
	  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
	  var INTERRUPTED = !!(options && options.INTERRUPTED);
	  var fn = functionBindContext(unboundFunction, that);
	  var iterator, iterFn, index, length, result, next, step;

	  var stop = function (condition) {
	    if (iterator) iteratorClose(iterator, 'normal', condition);
	    return new Result(true, condition);
	  };

	  var callFn = function (value) {
	    if (AS_ENTRIES) {
	      anObject(value);
	      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
	    } return INTERRUPTED ? fn(value, stop) : fn(value);
	  };

	  if (IS_RECORD) {
	    iterator = iterable.iterator;
	  } else if (IS_ITERATOR) {
	    iterator = iterable;
	  } else {
	    iterFn = getIteratorMethod(iterable);
	    if (!iterFn) throw new $TypeError$D(tryToString(iterable) + ' is not iterable');
	    // optimisation for array iterators
	    if (isArrayIteratorMethod(iterFn)) {
	      for (index = 0, length = lengthOfArrayLike(iterable); length > index; index++) {
	        result = callFn(iterable[index]);
	        if (result && objectIsPrototypeOf(ResultPrototype, result)) return result;
	      } return new Result(false);
	    }
	    iterator = getIterator(iterable, iterFn);
	  }

	  next = IS_RECORD ? iterable.next : iterator.next;
	  while (!(step = functionCall(next, iterator)).done) {
	    try {
	      result = callFn(step.value);
	    } catch (error) {
	      iteratorClose(iterator, 'throw', error);
	    }
	    if (typeof result == 'object' && result && objectIsPrototypeOf(ResultPrototype, result)) return result;
	  } return new Result(false);
	};

	var TO_STRING_TAG$8 = wellKnownSymbol('toStringTag');
	var $Error$1 = Error;
	var push$o = [].push;

	var $AggregateError$1 = function AggregateError(errors, message /* , options */) {
	  var isInstance = objectIsPrototypeOf(AggregateErrorPrototype, this);
	  var that;
	  if (objectSetPrototypeOf) {
	    that = objectSetPrototypeOf(new $Error$1(), isInstance ? objectGetPrototypeOf(this) : AggregateErrorPrototype);
	  } else {
	    that = isInstance ? this : objectCreate(AggregateErrorPrototype);
	    createNonEnumerableProperty(that, TO_STRING_TAG$8, 'Error');
	  }
	  if (message !== undefined) createNonEnumerableProperty(that, 'message', normalizeStringArgument(message));
	  errorStackInstall(that, $AggregateError$1, that.stack, 1);
	  if (arguments.length > 2) installErrorCause(that, arguments[2]);
	  var errorsArray = [];
	  iterate(errors, push$o, { that: errorsArray });
	  createNonEnumerableProperty(that, 'errors', errorsArray);
	  return that;
	};

	if (objectSetPrototypeOf) objectSetPrototypeOf($AggregateError$1, $Error$1);
	else copyConstructorProperties$1($AggregateError$1, $Error$1, { name: true });

	var AggregateErrorPrototype = $AggregateError$1.prototype = objectCreate($Error$1.prototype, {
	  constructor: createPropertyDescriptor(1, $AggregateError$1),
	  message: createPropertyDescriptor(1, ''),
	  name: createPropertyDescriptor(1, 'AggregateError')
	});

	// `AggregateError` constructor
	// https://tc39.es/ecma262/#sec-aggregate-error-constructor
	_export({ global: true, constructor: true, arity: 2 }, {
	  AggregateError: $AggregateError$1
	});

	var AGGREGATE_ERROR = 'AggregateError';
	var $AggregateError = getBuiltIn(AGGREGATE_ERROR);

	var FORCED$z = !fails(function () {
	  return $AggregateError([1]).errors[0] !== 1;
	}) && fails(function () {
	  return $AggregateError([1], AGGREGATE_ERROR, { cause: 7 }).cause !== 7;
	});

	// https://tc39.es/ecma262/#sec-aggregate-error
	_export({ global: true, constructor: true, arity: 2, forced: FORCED$z }, {
	  AggregateError: wrapErrorConstructorWithCause(AGGREGATE_ERROR, function (init) {
	    // eslint-disable-next-line no-unused-vars -- required for functions `.length`
	    return function AggregateError(errors, message) { return functionApply(init, this, arguments); };
	  }, FORCED$z, true)
	});

	var defineProperty$c = objectDefineProperty.f;

	var UNSCOPABLES = wellKnownSymbol('unscopables');
	var ArrayPrototype = Array.prototype;

	// Array.prototype[@@unscopables]
	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	if (ArrayPrototype[UNSCOPABLES] === undefined) {
	  defineProperty$c(ArrayPrototype, UNSCOPABLES, {
	    configurable: true,
	    value: objectCreate(null)
	  });
	}

	// add a key to Array.prototype[@@unscopables]
	var addToUnscopables = function (key) {
	  ArrayPrototype[UNSCOPABLES][key] = true;
	};

	// `Array.prototype.at` method
	// https://tc39.es/ecma262/#sec-array.prototype.at
	_export({ target: 'Array', proto: true }, {
	  at: function at(index) {
	    var O = toObject(this);
	    var len = lengthOfArrayLike(O);
	    var relativeIndex = toIntegerOrInfinity(index);
	    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
	    return (k < 0 || k >= len) ? undefined : O[k];
	  }
	});

	addToUnscopables('at');

	var $TypeError$C = TypeError;
	var MAX_SAFE_INTEGER$2 = 0x1FFFFFFFFFFFFF; // 2 ** 53 - 1 == 9007199254740991

	var doesNotExceedSafeInteger = function (it) {
	  if (it > MAX_SAFE_INTEGER$2) throw $TypeError$C('Maximum allowed index exceeded');
	  return it;
	};

	var createProperty = function (object, key, value) {
	  var propertyKey = toPropertyKey(key);
	  if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));
	  else object[propertyKey] = value;
	};

	var SPECIES$5 = wellKnownSymbol('species');

	var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
	  // We can't use this feature detection in V8 since it causes
	  // deoptimization and serious performance degradation
	  // https://github.com/zloirock/core-js/issues/677
	  return engineV8Version >= 51 || !fails(function () {
	    var array = [];
	    var constructor = array.constructor = {};
	    constructor[SPECIES$5] = function () {
	      return { foo: 1 };
	    };
	    return array[METHOD_NAME](Boolean).foo !== 1;
	  });
	};

	var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');

	// We can't use this feature detection in V8 since it causes
	// deoptimization and serious performance degradation
	// https://github.com/zloirock/core-js/issues/679
	var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
	  var array = [];
	  array[IS_CONCAT_SPREADABLE] = false;
	  return array.concat()[0] !== array;
	});

	var isConcatSpreadable = function (O) {
	  if (!isObject$1(O)) return false;
	  var spreadable = O[IS_CONCAT_SPREADABLE];
	  return spreadable !== undefined ? !!spreadable : isArray$2(O);
	};

	var FORCED$y = !IS_CONCAT_SPREADABLE_SUPPORT || !arrayMethodHasSpeciesSupport('concat');

	// `Array.prototype.concat` method
	// https://tc39.es/ecma262/#sec-array.prototype.concat
	// with adding support of @@isConcatSpreadable and @@species
	_export({ target: 'Array', proto: true, arity: 1, forced: FORCED$y }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  concat: function concat(arg) {
	    var O = toObject(this);
	    var A = arraySpeciesCreate(O, 0);
	    var n = 0;
	    var i, k, length, len, E;
	    for (i = -1, length = arguments.length; i < length; i++) {
	      E = i === -1 ? O : arguments[i];
	      if (isConcatSpreadable(E)) {
	        len = lengthOfArrayLike(E);
	        doesNotExceedSafeInteger(n + len);
	        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
	      } else {
	        doesNotExceedSafeInteger(n + 1);
	        createProperty(A, n++, E);
	      }
	    }
	    A.length = n;
	    return A;
	  }
	});

	var $TypeError$B = TypeError;

	var deletePropertyOrThrow = function (O, P) {
	  if (!delete O[P]) throw new $TypeError$B('Cannot delete property ' + tryToString(P) + ' of ' + tryToString(O));
	};

	var min$c = Math.min;

	// `Array.prototype.copyWithin` method implementation
	// https://tc39.es/ecma262/#sec-array.prototype.copywithin
	// eslint-disable-next-line es/no-array-prototype-copywithin -- safe
	var arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
	  var O = toObject(this);
	  var len = lengthOfArrayLike(O);
	  var to = toAbsoluteIndex(target, len);
	  var from = toAbsoluteIndex(start, len);
	  var end = arguments.length > 2 ? arguments[2] : undefined;
	  var count = min$c((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);
	  var inc = 1;
	  if (from < to && to < from + count) {
	    inc = -1;
	    from += count - 1;
	    to += count - 1;
	  }
	  while (count-- > 0) {
	    if (from in O) O[to] = O[from];
	    else deletePropertyOrThrow(O, to);
	    to += inc;
	    from += inc;
	  } return O;
	};

	// `Array.prototype.copyWithin` method
	// https://tc39.es/ecma262/#sec-array.prototype.copywithin
	_export({ target: 'Array', proto: true }, {
	  copyWithin: arrayCopyWithin
	});

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('copyWithin');

	var arrayMethodIsStrict = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails(function () {
	    // eslint-disable-next-line no-useless-call -- required for testing
	    method.call(null, argument || function () { return 1; }, 1);
	  });
	};

	var $every$2 = arrayIteration.every;


	var STRICT_METHOD$4 = arrayMethodIsStrict('every');

	// `Array.prototype.every` method
	// https://tc39.es/ecma262/#sec-array.prototype.every
	_export({ target: 'Array', proto: true, forced: !STRICT_METHOD$4 }, {
	  every: function every(callbackfn /* , thisArg */) {
	    return $every$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// `Array.prototype.fill` method implementation
	// https://tc39.es/ecma262/#sec-array.prototype.fill
	var arrayFill = function fill(value /* , start = 0, end = @length */) {
	  var O = toObject(this);
	  var length = lengthOfArrayLike(O);
	  var argumentsLength = arguments.length;
	  var index = toAbsoluteIndex(argumentsLength > 1 ? arguments[1] : undefined, length);
	  var end = argumentsLength > 2 ? arguments[2] : undefined;
	  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
	  while (endPos > index) O[index++] = value;
	  return O;
	};

	// `Array.prototype.fill` method
	// https://tc39.es/ecma262/#sec-array.prototype.fill
	_export({ target: 'Array', proto: true }, {
	  fill: arrayFill
	});

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('fill');

	var $filter$1 = arrayIteration.filter;


	var HAS_SPECIES_SUPPORT$3 = arrayMethodHasSpeciesSupport('filter');

	// `Array.prototype.filter` method
	// https://tc39.es/ecma262/#sec-array.prototype.filter
	// with adding support of @@species
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$3 }, {
	  filter: function filter(callbackfn /* , thisArg */) {
	    return $filter$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var $find$2 = arrayIteration.find;


	var FIND = 'find';
	var SKIPS_HOLES$1 = true;

	// Shouldn't skip holes
	// eslint-disable-next-line es/no-array-prototype-find -- testing
	if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES$1 = false; });

	// `Array.prototype.find` method
	// https://tc39.es/ecma262/#sec-array.prototype.find
	_export({ target: 'Array', proto: true, forced: SKIPS_HOLES$1 }, {
	  find: function find(callbackfn /* , that = undefined */) {
	    return $find$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables(FIND);

	var $findIndex$1 = arrayIteration.findIndex;


	var FIND_INDEX = 'findIndex';
	var SKIPS_HOLES = true;

	// Shouldn't skip holes
	// eslint-disable-next-line es/no-array-prototype-findindex -- testing
	if (FIND_INDEX in []) Array(1)[FIND_INDEX](function () { SKIPS_HOLES = false; });

	// `Array.prototype.findIndex` method
	// https://tc39.es/ecma262/#sec-array.prototype.findindex
	_export({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
	  findIndex: function findIndex(callbackfn /* , that = undefined */) {
	    return $findIndex$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables(FIND_INDEX);

	// `Array.prototype.{ findLast, findLastIndex }` methods implementation
	var createMethod$6 = function (TYPE) {
	  var IS_FIND_LAST_INDEX = TYPE === 1;
	  return function ($this, callbackfn, that) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var index = lengthOfArrayLike(self);
	    var boundFunction = functionBindContext(callbackfn, that);
	    var value, result;
	    while (index-- > 0) {
	      value = self[index];
	      result = boundFunction(value, index, O);
	      if (result) switch (TYPE) {
	        case 0: return value; // findLast
	        case 1: return index; // findLastIndex
	      }
	    }
	    return IS_FIND_LAST_INDEX ? -1 : undefined;
	  };
	};

	var arrayIterationFromLast = {
	  // `Array.prototype.findLast` method
	  // https://github.com/tc39/proposal-array-find-from-last
	  findLast: createMethod$6(0),
	  // `Array.prototype.findLastIndex` method
	  // https://github.com/tc39/proposal-array-find-from-last
	  findLastIndex: createMethod$6(1)
	};

	var $findLast$1 = arrayIterationFromLast.findLast;


	// `Array.prototype.findLast` method
	// https://tc39.es/ecma262/#sec-array.prototype.findlast
	_export({ target: 'Array', proto: true }, {
	  findLast: function findLast(callbackfn /* , that = undefined */) {
	    return $findLast$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	addToUnscopables('findLast');

	var $findLastIndex$1 = arrayIterationFromLast.findLastIndex;


	// `Array.prototype.findLastIndex` method
	// https://tc39.es/ecma262/#sec-array.prototype.findlastindex
	_export({ target: 'Array', proto: true }, {
	  findLastIndex: function findLastIndex(callbackfn /* , that = undefined */) {
	    return $findLastIndex$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	addToUnscopables('findLastIndex');

	// `FlattenIntoArray` abstract operation
	// https://tc39.github.io/proposal-flatMap/#sec-FlattenIntoArray
	var flattenIntoArray = function (target, original, source, sourceLen, start, depth, mapper, thisArg) {
	  var targetIndex = start;
	  var sourceIndex = 0;
	  var mapFn = mapper ? functionBindContext(mapper, thisArg) : false;
	  var element, elementLen;

	  while (sourceIndex < sourceLen) {
	    if (sourceIndex in source) {
	      element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];

	      if (depth > 0 && isArray$2(element)) {
	        elementLen = lengthOfArrayLike(element);
	        targetIndex = flattenIntoArray(target, original, element, elementLen, targetIndex, depth - 1) - 1;
	      } else {
	        doesNotExceedSafeInteger(targetIndex + 1);
	        target[targetIndex] = element;
	      }

	      targetIndex++;
	    }
	    sourceIndex++;
	  }
	  return targetIndex;
	};

	var flattenIntoArray_1 = flattenIntoArray;

	// `Array.prototype.flat` method
	// https://tc39.es/ecma262/#sec-array.prototype.flat
	_export({ target: 'Array', proto: true }, {
	  flat: function flat(/* depthArg = 1 */) {
	    var depthArg = arguments.length ? arguments[0] : undefined;
	    var O = toObject(this);
	    var sourceLen = lengthOfArrayLike(O);
	    var A = arraySpeciesCreate(O, 0);
	    A.length = flattenIntoArray_1(A, O, O, sourceLen, 0, depthArg === undefined ? 1 : toIntegerOrInfinity(depthArg));
	    return A;
	  }
	});

	// `Array.prototype.flatMap` method
	// https://tc39.es/ecma262/#sec-array.prototype.flatmap
	_export({ target: 'Array', proto: true }, {
	  flatMap: function flatMap(callbackfn /* , thisArg */) {
	    var O = toObject(this);
	    var sourceLen = lengthOfArrayLike(O);
	    var A;
	    aCallable(callbackfn);
	    A = arraySpeciesCreate(O, 0);
	    A.length = flattenIntoArray_1(A, O, O, sourceLen, 0, 1, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    return A;
	  }
	});

	var $forEach$2 = arrayIteration.forEach;


	var STRICT_METHOD$3 = arrayMethodIsStrict('forEach');

	// `Array.prototype.forEach` method implementation
	// https://tc39.es/ecma262/#sec-array.prototype.foreach
	var arrayForEach = !STRICT_METHOD$3 ? function forEach(callbackfn /* , thisArg */) {
	  return $forEach$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	// eslint-disable-next-line es/no-array-prototype-foreach -- safe
	} : [].forEach;

	// `Array.prototype.forEach` method
	// https://tc39.es/ecma262/#sec-array.prototype.foreach
	// eslint-disable-next-line es/no-array-prototype-foreach -- safe
	_export({ target: 'Array', proto: true, forced: [].forEach !== arrayForEach }, {
	  forEach: arrayForEach
	});

	// call something on iterator step with safe closing on error
	var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
	  } catch (error) {
	    iteratorClose(iterator, 'throw', error);
	  }
	};

	var $Array$a = Array;

	// `Array.from` method implementation
	// https://tc39.es/ecma262/#sec-array.from
	var arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
	  var O = toObject(arrayLike);
	  var IS_CONSTRUCTOR = isConstructor(this);
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  if (mapping) mapfn = functionBindContext(mapfn, argumentsLength > 2 ? arguments[2] : undefined);
	  var iteratorMethod = getIteratorMethod(O);
	  var index = 0;
	  var length, result, step, iterator, next, value;
	  // if the target is not iterable or it's an array with the default iterator - use a simple case
	  if (iteratorMethod && !(this === $Array$a && isArrayIteratorMethod(iteratorMethod))) {
	    iterator = getIterator(O, iteratorMethod);
	    next = iterator.next;
	    result = IS_CONSTRUCTOR ? new this() : [];
	    for (;!(step = functionCall(next, iterator)).done; index++) {
	      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
	      createProperty(result, index, value);
	    }
	  } else {
	    length = lengthOfArrayLike(O);
	    result = IS_CONSTRUCTOR ? new this(length) : $Array$a(length);
	    for (;length > index; index++) {
	      value = mapping ? mapfn(O[index], index) : O[index];
	      createProperty(result, index, value);
	    }
	  }
	  result.length = index;
	  return result;
	};

	var ITERATOR$a = wellKnownSymbol('iterator');
	var SAFE_CLOSING = false;

	try {
	  var called = 0;
	  var iteratorWithReturn = {
	    next: function () {
	      return { done: !!called++ };
	    },
	    'return': function () {
	      SAFE_CLOSING = true;
	    }
	  };
	  iteratorWithReturn[ITERATOR$a] = function () {
	    return this;
	  };
	  // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
	  Array.from(iteratorWithReturn, function () { throw 2; });
	} catch (error) { /* empty */ }

	var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
	  try {
	    if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
	  } catch (error) { return false; } // workaround of old WebKit + `eval` bug
	  var ITERATION_SUPPORT = false;
	  try {
	    var object = {};
	    object[ITERATOR$a] = function () {
	      return {
	        next: function () {
	          return { done: ITERATION_SUPPORT = true };
	        }
	      };
	    };
	    exec(object);
	  } catch (error) { /* empty */ }
	  return ITERATION_SUPPORT;
	};

	var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
	  // eslint-disable-next-line es/no-array-from -- required for testing
	  Array.from(iterable);
	});

	// `Array.from` method
	// https://tc39.es/ecma262/#sec-array.from
	_export({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
	  from: arrayFrom
	});

	var $includes$1 = arrayIncludes$1.includes;



	// FF99+ bug
	var BROKEN_ON_SPARSE = fails(function () {
	  // eslint-disable-next-line es/no-array-prototype-includes -- detection
	  return !Array(1).includes();
	});

	// `Array.prototype.includes` method
	// https://tc39.es/ecma262/#sec-array.prototype.includes
	_export({ target: 'Array', proto: true, forced: BROKEN_ON_SPARSE }, {
	  includes: function includes(el /* , fromIndex = 0 */) {
	    return $includes$1(this, el, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('includes');

	/* eslint-disable es/no-array-prototype-indexof -- required for testing */


	var $indexOf$1 = arrayIncludes$1.indexOf;


	var nativeIndexOf = functionUncurryThisClause([].indexOf);

	var NEGATIVE_ZERO$1 = !!nativeIndexOf && 1 / nativeIndexOf([1], 1, -0) < 0;
	var FORCED$x = NEGATIVE_ZERO$1 || !arrayMethodIsStrict('indexOf');

	// `Array.prototype.indexOf` method
	// https://tc39.es/ecma262/#sec-array.prototype.indexof
	_export({ target: 'Array', proto: true, forced: FORCED$x }, {
	  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
	    var fromIndex = arguments.length > 1 ? arguments[1] : undefined;
	    return NEGATIVE_ZERO$1
	      // convert -0 to +0
	      ? nativeIndexOf(this, searchElement, fromIndex) || 0
	      : $indexOf$1(this, searchElement, fromIndex);
	  }
	});

	// `Array.isArray` method
	// https://tc39.es/ecma262/#sec-array.isarray
	_export({ target: 'Array', stat: true }, {
	  isArray: isArray$2
	});

	var ITERATOR$9 = wellKnownSymbol('iterator');
	var BUGGY_SAFARI_ITERATORS$1 = false;

	// `%IteratorPrototype%` object
	// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
	var IteratorPrototype$6, PrototypeOfArrayIteratorPrototype, arrayIterator$1;

	/* eslint-disable es/no-array-prototype-keys -- safe */
	if ([].keys) {
	  arrayIterator$1 = [].keys();
	  // Safari 8 has buggy iterators w/o `next`
	  if (!('next' in arrayIterator$1)) BUGGY_SAFARI_ITERATORS$1 = true;
	  else {
	    PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator$1));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype$6 = PrototypeOfArrayIteratorPrototype;
	  }
	}

	var NEW_ITERATOR_PROTOTYPE = !isObject$1(IteratorPrototype$6) || fails(function () {
	  var test = {};
	  // FF44- legacy iterators case
	  return IteratorPrototype$6[ITERATOR$9].call(test) !== test;
	});

	if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype$6 = {};

	// `%IteratorPrototype%[@@iterator]()` method
	// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
	if (!isCallable(IteratorPrototype$6[ITERATOR$9])) {
	  defineBuiltIn(IteratorPrototype$6, ITERATOR$9, function () {
	    return this;
	  });
	}

	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype$6,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS$1
	};

	var IteratorPrototype$5 = iteratorsCore.IteratorPrototype;





	var returnThis$1 = function () { return this; };

	var iteratorCreateConstructor = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
	  var TO_STRING_TAG = NAME + ' Iterator';
	  IteratorConstructor.prototype = objectCreate(IteratorPrototype$5, { next: createPropertyDescriptor(+!ENUMERABLE_NEXT, next) });
	  setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
	  iterators[TO_STRING_TAG] = returnThis$1;
	  return IteratorConstructor;
	};

	var PROPER_FUNCTION_NAME$3 = functionName.PROPER;
	var CONFIGURABLE_FUNCTION_NAME$1 = functionName.CONFIGURABLE;
	var IteratorPrototype$4 = iteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS = iteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR$8 = wellKnownSymbol('iterator');
	var KEYS = 'keys';
	var VALUES = 'values';
	var ENTRIES = 'entries';

	var returnThis = function () { return this; };

	var iteratorDefine = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
	  iteratorCreateConstructor(IteratorConstructor, NAME, next);

	  var getIterationMethod = function (KIND) {
	    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
	    if (!BUGGY_SAFARI_ITERATORS && KIND && KIND in IterablePrototype) return IterablePrototype[KIND];

	    switch (KIND) {
	      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
	      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
	      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
	    }

	    return function () { return new IteratorConstructor(this); };
	  };

	  var TO_STRING_TAG = NAME + ' Iterator';
	  var INCORRECT_VALUES_NAME = false;
	  var IterablePrototype = Iterable.prototype;
	  var nativeIterator = IterablePrototype[ITERATOR$8]
	    || IterablePrototype['@@iterator']
	    || DEFAULT && IterablePrototype[DEFAULT];
	  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
	  var anyNativeIterator = NAME === 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
	  var CurrentIteratorPrototype, methods, KEY;

	  // fix native
	  if (anyNativeIterator) {
	    CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));
	    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
	      if (objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$4) {
	        if (objectSetPrototypeOf) {
	          objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$4);
	        } else if (!isCallable(CurrentIteratorPrototype[ITERATOR$8])) {
	          defineBuiltIn(CurrentIteratorPrototype, ITERATOR$8, returnThis);
	        }
	      }
	      // Set @@toStringTag to native iterators
	      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
	    }
	  }

	  // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
	  if (PROPER_FUNCTION_NAME$3 && DEFAULT === VALUES && nativeIterator && nativeIterator.name !== VALUES) {
	    if (CONFIGURABLE_FUNCTION_NAME$1) {
	      createNonEnumerableProperty(IterablePrototype, 'name', VALUES);
	    } else {
	      INCORRECT_VALUES_NAME = true;
	      defaultIterator = function values() { return functionCall(nativeIterator, this); };
	    }
	  }

	  // export additional methods
	  if (DEFAULT) {
	    methods = {
	      values: getIterationMethod(VALUES),
	      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
	      entries: getIterationMethod(ENTRIES)
	    };
	    if (FORCED) for (KEY in methods) {
	      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
	        defineBuiltIn(IterablePrototype, KEY, methods[KEY]);
	      }
	    } else _export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
	  }

	  // define iterator
	  if (IterablePrototype[ITERATOR$8] !== defaultIterator) {
	    defineBuiltIn(IterablePrototype, ITERATOR$8, defaultIterator, { name: DEFAULT });
	  }
	  iterators[NAME] = defaultIterator;

	  return methods;
	};

	// `CreateIterResultObject` abstract operation
	// https://tc39.es/ecma262/#sec-createiterresultobject
	var createIterResultObject = function (value, done) {
	  return { value: value, done: done };
	};

	var defineProperty$b = objectDefineProperty.f;





	var ARRAY_ITERATOR = 'Array Iterator';
	var setInternalState$k = internalState.set;
	var getInternalState$d = internalState.getterFor(ARRAY_ITERATOR);

	// `Array.prototype.entries` method
	// https://tc39.es/ecma262/#sec-array.prototype.entries
	// `Array.prototype.keys` method
	// https://tc39.es/ecma262/#sec-array.prototype.keys
	// `Array.prototype.values` method
	// https://tc39.es/ecma262/#sec-array.prototype.values
	// `Array.prototype[@@iterator]` method
	// https://tc39.es/ecma262/#sec-array.prototype-@@iterator
	// `CreateArrayIterator` internal method
	// https://tc39.es/ecma262/#sec-createarrayiterator
	var es_array_iterator = iteratorDefine(Array, 'Array', function (iterated, kind) {
	  setInternalState$k(this, {
	    type: ARRAY_ITERATOR,
	    target: toIndexedObject(iterated), // target
	    index: 0,                          // next index
	    kind: kind                         // kind
	  });
	// `%ArrayIteratorPrototype%.next` method
	// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
	}, function () {
	  var state = getInternalState$d(this);
	  var target = state.target;
	  var index = state.index++;
	  if (!target || index >= target.length) {
	    state.target = undefined;
	    return createIterResultObject(undefined, true);
	  }
	  switch (state.kind) {
	    case 'keys': return createIterResultObject(index, false);
	    case 'values': return createIterResultObject(target[index], false);
	  } return createIterResultObject([index, target[index]], false);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values%
	// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
	// https://tc39.es/ecma262/#sec-createmappedargumentsobject
	var values = iterators.Arguments = iterators.Array;

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

	// V8 ~ Chrome 45- bug
	if (descriptors && values.name !== 'values') try {
	  defineProperty$b(values, 'name', { value: 'values' });
	} catch (error) { /* empty */ }

	var nativeJoin = functionUncurryThis([].join);

	var ES3_STRINGS = indexedObject !== Object;
	var FORCED$w = ES3_STRINGS || !arrayMethodIsStrict('join', ',');

	// `Array.prototype.join` method
	// https://tc39.es/ecma262/#sec-array.prototype.join
	_export({ target: 'Array', proto: true, forced: FORCED$w }, {
	  join: function join(separator) {
	    return nativeJoin(toIndexedObject(this), separator === undefined ? ',' : separator);
	  }
	});

	/* eslint-disable es/no-array-prototype-lastindexof -- safe */






	var min$b = Math.min;
	var $lastIndexOf = [].lastIndexOf;
	var NEGATIVE_ZERO = !!$lastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
	var STRICT_METHOD$2 = arrayMethodIsStrict('lastIndexOf');
	var FORCED$v = NEGATIVE_ZERO || !STRICT_METHOD$2;

	// `Array.prototype.lastIndexOf` method implementation
	// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
	var arrayLastIndexOf = FORCED$v ? function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
	  // convert -0 to +0
	  if (NEGATIVE_ZERO) return functionApply($lastIndexOf, this, arguments) || 0;
	  var O = toIndexedObject(this);
	  var length = lengthOfArrayLike(O);
	  var index = length - 1;
	  if (arguments.length > 1) index = min$b(index, toIntegerOrInfinity(arguments[1]));
	  if (index < 0) index = length + index;
	  for (;index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;
	  return -1;
	} : $lastIndexOf;

	// `Array.prototype.lastIndexOf` method
	// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
	// eslint-disable-next-line es/no-array-prototype-lastindexof -- required for testing
	_export({ target: 'Array', proto: true, forced: arrayLastIndexOf !== [].lastIndexOf }, {
	  lastIndexOf: arrayLastIndexOf
	});

	var $map$1 = arrayIteration.map;


	var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport('map');

	// `Array.prototype.map` method
	// https://tc39.es/ecma262/#sec-array.prototype.map
	// with adding support of @@species
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 }, {
	  map: function map(callbackfn /* , thisArg */) {
	    return $map$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var $Array$9 = Array;

	var ISNT_GENERIC = fails(function () {
	  function F() { /* empty */ }
	  // eslint-disable-next-line es/no-array-of -- safe
	  return !($Array$9.of.call(F) instanceof F);
	});

	// `Array.of` method
	// https://tc39.es/ecma262/#sec-array.of
	// WebKit Array.of isn't generic
	_export({ target: 'Array', stat: true, forced: ISNT_GENERIC }, {
	  of: function of(/* ...args */) {
	    var index = 0;
	    var argumentsLength = arguments.length;
	    var result = new (isConstructor(this) ? this : $Array$9)(argumentsLength);
	    while (argumentsLength > index) createProperty(result, index, arguments[index++]);
	    result.length = argumentsLength;
	    return result;
	  }
	});

	var $TypeError$A = TypeError;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getOwnPropertyDescriptor$b = Object.getOwnPropertyDescriptor;

	// Safari < 13 does not throw an error in this case
	var SILENT_ON_NON_WRITABLE_LENGTH_SET = descriptors && !function () {
	  // makes no sense without proper strict mode support
	  if (this !== undefined) return true;
	  try {
	    // eslint-disable-next-line es/no-object-defineproperty -- safe
	    Object.defineProperty([], 'length', { writable: false }).length = 1;
	  } catch (error) {
	    return error instanceof TypeError;
	  }
	}();

	var arraySetLength = SILENT_ON_NON_WRITABLE_LENGTH_SET ? function (O, length) {
	  if (isArray$2(O) && !getOwnPropertyDescriptor$b(O, 'length').writable) {
	    throw new $TypeError$A('Cannot set read only .length');
	  } return O.length = length;
	} : function (O, length) {
	  return O.length = length;
	};

	var INCORRECT_TO_LENGTH = fails(function () {
	  return [].push.call({ length: 0x100000000 }, 1) !== 4294967297;
	});

	// V8 <= 121 and Safari <= 15.4; FF < 23 throws InternalError
	// https://bugs.chromium.org/p/v8/issues/detail?id=12681
	var properErrorOnNonWritableLength$1 = function () {
	  try {
	    // eslint-disable-next-line es/no-object-defineproperty -- safe
	    Object.defineProperty([], 'length', { writable: false }).push();
	  } catch (error) {
	    return error instanceof TypeError;
	  }
	};

	var FORCED$u = INCORRECT_TO_LENGTH || !properErrorOnNonWritableLength$1();

	// `Array.prototype.push` method
	// https://tc39.es/ecma262/#sec-array.prototype.push
	_export({ target: 'Array', proto: true, arity: 1, forced: FORCED$u }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  push: function push(item) {
	    var O = toObject(this);
	    var len = lengthOfArrayLike(O);
	    var argCount = arguments.length;
	    doesNotExceedSafeInteger(len + argCount);
	    for (var i = 0; i < argCount; i++) {
	      O[len] = arguments[i];
	      len++;
	    }
	    arraySetLength(O, len);
	    return len;
	  }
	});

	var $TypeError$z = TypeError;

	// `Array.prototype.{ reduce, reduceRight }` methods implementation
	var createMethod$5 = function (IS_RIGHT) {
	  return function (that, callbackfn, argumentsLength, memo) {
	    var O = toObject(that);
	    var self = indexedObject(O);
	    var length = lengthOfArrayLike(O);
	    aCallable(callbackfn);
	    var index = IS_RIGHT ? length - 1 : 0;
	    var i = IS_RIGHT ? -1 : 1;
	    if (argumentsLength < 2) while (true) {
	      if (index in self) {
	        memo = self[index];
	        index += i;
	        break;
	      }
	      index += i;
	      if (IS_RIGHT ? index < 0 : length <= index) {
	        throw new $TypeError$z('Reduce of empty array with no initial value');
	      }
	    }
	    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
	      memo = callbackfn(memo, self[index], index, O);
	    }
	    return memo;
	  };
	};

	var arrayReduce$1 = {
	  // `Array.prototype.reduce` method
	  // https://tc39.es/ecma262/#sec-array.prototype.reduce
	  left: createMethod$5(false),
	  // `Array.prototype.reduceRight` method
	  // https://tc39.es/ecma262/#sec-array.prototype.reduceright
	  right: createMethod$5(true)
	};

	var engineIsNode = classofRaw(global_1.process) === 'process';

	var $reduce$1 = arrayReduce$1.left;




	// Chrome 80-82 has a critical bug
	// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
	var CHROME_BUG$1 = !engineIsNode && engineV8Version > 79 && engineV8Version < 83;
	var FORCED$t = CHROME_BUG$1 || !arrayMethodIsStrict('reduce');

	// `Array.prototype.reduce` method
	// https://tc39.es/ecma262/#sec-array.prototype.reduce
	_export({ target: 'Array', proto: true, forced: FORCED$t }, {
	  reduce: function reduce(callbackfn /* , initialValue */) {
	    var length = arguments.length;
	    return $reduce$1(this, callbackfn, length, length > 1 ? arguments[1] : undefined);
	  }
	});

	var $reduceRight$1 = arrayReduce$1.right;




	// Chrome 80-82 has a critical bug
	// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
	var CHROME_BUG = !engineIsNode && engineV8Version > 79 && engineV8Version < 83;
	var FORCED$s = CHROME_BUG || !arrayMethodIsStrict('reduceRight');

	// `Array.prototype.reduceRight` method
	// https://tc39.es/ecma262/#sec-array.prototype.reduceright
	_export({ target: 'Array', proto: true, forced: FORCED$s }, {
	  reduceRight: function reduceRight(callbackfn /* , initialValue */) {
	    return $reduceRight$1(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var nativeReverse = functionUncurryThis([].reverse);
	var test$1 = [1, 2];

	// `Array.prototype.reverse` method
	// https://tc39.es/ecma262/#sec-array.prototype.reverse
	// fix for Safari 12.0 bug
	// https://bugs.webkit.org/show_bug.cgi?id=188794
	_export({ target: 'Array', proto: true, forced: String(test$1) === String(test$1.reverse()) }, {
	  reverse: function reverse() {
	    // eslint-disable-next-line no-self-assign -- dirty hack
	    if (isArray$2(this)) this.length = this.length;
	    return nativeReverse(this);
	  }
	});

	var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('slice');

	var SPECIES$4 = wellKnownSymbol('species');
	var $Array$8 = Array;
	var max$8 = Math.max;

	// `Array.prototype.slice` method
	// https://tc39.es/ecma262/#sec-array.prototype.slice
	// fallback for not array-like ES3 strings and DOM objects
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 }, {
	  slice: function slice(start, end) {
	    var O = toIndexedObject(this);
	    var length = lengthOfArrayLike(O);
	    var k = toAbsoluteIndex(start, length);
	    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
	    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
	    var Constructor, result, n;
	    if (isArray$2(O)) {
	      Constructor = O.constructor;
	      // cross-realm fallback
	      if (isConstructor(Constructor) && (Constructor === $Array$8 || isArray$2(Constructor.prototype))) {
	        Constructor = undefined;
	      } else if (isObject$1(Constructor)) {
	        Constructor = Constructor[SPECIES$4];
	        if (Constructor === null) Constructor = undefined;
	      }
	      if (Constructor === $Array$8 || Constructor === undefined) {
	        return arraySlice(O, k, fin);
	      }
	    }
	    result = new (Constructor === undefined ? $Array$8 : Constructor)(max$8(fin - k, 0));
	    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
	    result.length = n;
	    return result;
	  }
	});

	var $some$2 = arrayIteration.some;


	var STRICT_METHOD$1 = arrayMethodIsStrict('some');

	// `Array.prototype.some` method
	// https://tc39.es/ecma262/#sec-array.prototype.some
	_export({ target: 'Array', proto: true, forced: !STRICT_METHOD$1 }, {
	  some: function some(callbackfn /* , thisArg */) {
	    return $some$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var floor$9 = Math.floor;

	var sort$2 = function (array, comparefn) {
	  var length = array.length;

	  if (length < 8) {
	    // insertion sort
	    var i = 1;
	    var element, j;

	    while (i < length) {
	      j = i;
	      element = array[i];
	      while (j && comparefn(array[j - 1], element) > 0) {
	        array[j] = array[--j];
	      }
	      if (j !== i++) array[j] = element;
	    }
	  } else {
	    // merge sort
	    var middle = floor$9(length / 2);
	    var left = sort$2(arraySlice(array, 0, middle), comparefn);
	    var right = sort$2(arraySlice(array, middle), comparefn);
	    var llength = left.length;
	    var rlength = right.length;
	    var lindex = 0;
	    var rindex = 0;

	    while (lindex < llength || rindex < rlength) {
	      array[lindex + rindex] = (lindex < llength && rindex < rlength)
	        ? comparefn(left[lindex], right[rindex]) <= 0 ? left[lindex++] : right[rindex++]
	        : lindex < llength ? left[lindex++] : right[rindex++];
	    }
	  }

	  return array;
	};

	var arraySort = sort$2;

	var firefox = engineUserAgent.match(/firefox\/(\d+)/i);

	var engineFfVersion = !!firefox && +firefox[1];

	var engineIsIeOrEdge = /MSIE|Trident/.test(engineUserAgent);

	var webkit = engineUserAgent.match(/AppleWebKit\/(\d+)\./);

	var engineWebkitVersion = !!webkit && +webkit[1];

	var test = [];
	var nativeSort$1 = functionUncurryThis(test.sort);
	var push$n = functionUncurryThis(test.push);

	// IE8-
	var FAILS_ON_UNDEFINED = fails(function () {
	  test.sort(undefined);
	});
	// V8 bug
	var FAILS_ON_NULL = fails(function () {
	  test.sort(null);
	});
	// Old WebKit
	var STRICT_METHOD = arrayMethodIsStrict('sort');

	var STABLE_SORT$1 = !fails(function () {
	  // feature detection can be too slow, so check engines versions
	  if (engineV8Version) return engineV8Version < 70;
	  if (engineFfVersion && engineFfVersion > 3) return;
	  if (engineIsIeOrEdge) return true;
	  if (engineWebkitVersion) return engineWebkitVersion < 603;

	  var result = '';
	  var code, chr, value, index;

	  // generate an array with more 512 elements (Chakra and old V8 fails only in this case)
	  for (code = 65; code < 76; code++) {
	    chr = String.fromCharCode(code);

	    switch (code) {
	      case 66: case 69: case 70: case 72: value = 3; break;
	      case 68: case 71: value = 4; break;
	      default: value = 2;
	    }

	    for (index = 0; index < 47; index++) {
	      test.push({ k: chr + index, v: value });
	    }
	  }

	  test.sort(function (a, b) { return b.v - a.v; });

	  for (index = 0; index < test.length; index++) {
	    chr = test[index].k.charAt(0);
	    if (result.charAt(result.length - 1) !== chr) result += chr;
	  }

	  return result !== 'DGBEFHACIJK';
	});

	var FORCED$r = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD || !STABLE_SORT$1;

	var getSortCompare$1 = function (comparefn) {
	  return function (x, y) {
	    if (y === undefined) return -1;
	    if (x === undefined) return 1;
	    if (comparefn !== undefined) return +comparefn(x, y) || 0;
	    return toString_1$1(x) > toString_1$1(y) ? 1 : -1;
	  };
	};

	// `Array.prototype.sort` method
	// https://tc39.es/ecma262/#sec-array.prototype.sort
	_export({ target: 'Array', proto: true, forced: FORCED$r }, {
	  sort: function sort(comparefn) {
	    if (comparefn !== undefined) aCallable(comparefn);

	    var array = toObject(this);

	    if (STABLE_SORT$1) return comparefn === undefined ? nativeSort$1(array) : nativeSort$1(array, comparefn);

	    var items = [];
	    var arrayLength = lengthOfArrayLike(array);
	    var itemsLength, index;

	    for (index = 0; index < arrayLength; index++) {
	      if (index in array) push$n(items, array[index]);
	    }

	    arraySort(items, getSortCompare$1(comparefn));

	    itemsLength = lengthOfArrayLike(items);
	    index = 0;

	    while (index < itemsLength) array[index] = items[index++];
	    while (index < arrayLength) deletePropertyOrThrow(array, index++);

	    return array;
	  }
	});

	var SPECIES$3 = wellKnownSymbol('species');

	var setSpecies = function (CONSTRUCTOR_NAME) {
	  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);

	  if (descriptors && Constructor && !Constructor[SPECIES$3]) {
	    defineBuiltInAccessor(Constructor, SPECIES$3, {
	      configurable: true,
	      get: function () { return this; }
	    });
	  }
	};

	// `Array[@@species]` getter
	// https://tc39.es/ecma262/#sec-get-array-@@species
	setSpecies('Array');

	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('splice');

	var max$7 = Math.max;
	var min$a = Math.min;

	// `Array.prototype.splice` method
	// https://tc39.es/ecma262/#sec-array.prototype.splice
	// with adding support of @@species
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
	  splice: function splice(start, deleteCount /* , ...items */) {
	    var O = toObject(this);
	    var len = lengthOfArrayLike(O);
	    var actualStart = toAbsoluteIndex(start, len);
	    var argumentsLength = arguments.length;
	    var insertCount, actualDeleteCount, A, k, from, to;
	    if (argumentsLength === 0) {
	      insertCount = actualDeleteCount = 0;
	    } else if (argumentsLength === 1) {
	      insertCount = 0;
	      actualDeleteCount = len - actualStart;
	    } else {
	      insertCount = argumentsLength - 2;
	      actualDeleteCount = min$a(max$7(toIntegerOrInfinity(deleteCount), 0), len - actualStart);
	    }
	    doesNotExceedSafeInteger(len + insertCount - actualDeleteCount);
	    A = arraySpeciesCreate(O, actualDeleteCount);
	    for (k = 0; k < actualDeleteCount; k++) {
	      from = actualStart + k;
	      if (from in O) createProperty(A, k, O[from]);
	    }
	    A.length = actualDeleteCount;
	    if (insertCount < actualDeleteCount) {
	      for (k = actualStart; k < len - actualDeleteCount; k++) {
	        from = k + actualDeleteCount;
	        to = k + insertCount;
	        if (from in O) O[to] = O[from];
	        else deletePropertyOrThrow(O, to);
	      }
	      for (k = len; k > len - actualDeleteCount + insertCount; k--) deletePropertyOrThrow(O, k - 1);
	    } else if (insertCount > actualDeleteCount) {
	      for (k = len - actualDeleteCount; k > actualStart; k--) {
	        from = k + actualDeleteCount - 1;
	        to = k + insertCount - 1;
	        if (from in O) O[to] = O[from];
	        else deletePropertyOrThrow(O, to);
	      }
	    }
	    for (k = 0; k < insertCount; k++) {
	      O[k + actualStart] = arguments[k + 2];
	    }
	    arraySetLength(O, len - actualDeleteCount + insertCount);
	    return A;
	  }
	});

	// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.toReversed
	// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.toReversed
	var arrayToReversed = function (O, C) {
	  var len = lengthOfArrayLike(O);
	  var A = new C(len);
	  var k = 0;
	  for (; k < len; k++) A[k] = O[len - k - 1];
	  return A;
	};

	var $Array$7 = Array;

	// `Array.prototype.toReversed` method
	// https://tc39.es/ecma262/#sec-array.prototype.toreversed
	_export({ target: 'Array', proto: true }, {
	  toReversed: function toReversed() {
	    return arrayToReversed(toIndexedObject(this), $Array$7);
	  }
	});

	addToUnscopables('toReversed');

	var arrayFromConstructorAndList = function (Constructor, list, $length) {
	  var index = 0;
	  var length = arguments.length > 2 ? $length : lengthOfArrayLike(list);
	  var result = new Constructor(length);
	  while (length > index) result[index] = list[index++];
	  return result;
	};

	var getBuiltInPrototypeMethod = function (CONSTRUCTOR, METHOD) {
	  var Constructor = global_1[CONSTRUCTOR];
	  var Prototype = Constructor && Constructor.prototype;
	  return Prototype && Prototype[METHOD];
	};

	var $Array$6 = Array;
	var sort$1 = functionUncurryThis(getBuiltInPrototypeMethod('Array', 'sort'));

	// `Array.prototype.toSorted` method
	// https://tc39.es/ecma262/#sec-array.prototype.tosorted
	_export({ target: 'Array', proto: true }, {
	  toSorted: function toSorted(compareFn) {
	    if (compareFn !== undefined) aCallable(compareFn);
	    var O = toIndexedObject(this);
	    var A = arrayFromConstructorAndList($Array$6, O);
	    return sort$1(A, compareFn);
	  }
	});

	addToUnscopables('toSorted');

	var $Array$5 = Array;
	var max$6 = Math.max;
	var min$9 = Math.min;

	// `Array.prototype.toSpliced` method
	// https://tc39.es/ecma262/#sec-array.prototype.tospliced
	_export({ target: 'Array', proto: true }, {
	  toSpliced: function toSpliced(start, deleteCount /* , ...items */) {
	    var O = toIndexedObject(this);
	    var len = lengthOfArrayLike(O);
	    var actualStart = toAbsoluteIndex(start, len);
	    var argumentsLength = arguments.length;
	    var k = 0;
	    var insertCount, actualDeleteCount, newLen, A;
	    if (argumentsLength === 0) {
	      insertCount = actualDeleteCount = 0;
	    } else if (argumentsLength === 1) {
	      insertCount = 0;
	      actualDeleteCount = len - actualStart;
	    } else {
	      insertCount = argumentsLength - 2;
	      actualDeleteCount = min$9(max$6(toIntegerOrInfinity(deleteCount), 0), len - actualStart);
	    }
	    newLen = doesNotExceedSafeInteger(len + insertCount - actualDeleteCount);
	    A = $Array$5(newLen);

	    for (; k < actualStart; k++) A[k] = O[k];
	    for (; k < actualStart + insertCount; k++) A[k] = arguments[k - actualStart + 2];
	    for (; k < newLen; k++) A[k] = O[k + actualDeleteCount - insertCount];

	    return A;
	  }
	});

	addToUnscopables('toSpliced');

	// this method was added to unscopables after implementation
	// in popular engines, so it's moved to a separate module


	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('flat');

	// this method was added to unscopables after implementation
	// in popular engines, so it's moved to a separate module


	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('flatMap');

	// IE8-
	var INCORRECT_RESULT = [].unshift(0) !== 1;

	// V8 ~ Chrome < 71 and Safari <= 15.4, FF < 23 throws InternalError
	var properErrorOnNonWritableLength = function () {
	  try {
	    // eslint-disable-next-line es/no-object-defineproperty -- safe
	    Object.defineProperty([], 'length', { writable: false }).unshift();
	  } catch (error) {
	    return error instanceof TypeError;
	  }
	};

	var FORCED$q = INCORRECT_RESULT || !properErrorOnNonWritableLength();

	// `Array.prototype.unshift` method
	// https://tc39.es/ecma262/#sec-array.prototype.unshift
	_export({ target: 'Array', proto: true, arity: 1, forced: FORCED$q }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  unshift: function unshift(item) {
	    var O = toObject(this);
	    var len = lengthOfArrayLike(O);
	    var argCount = arguments.length;
	    if (argCount) {
	      doesNotExceedSafeInteger(len + argCount);
	      var k = len;
	      while (k--) {
	        var to = k + argCount;
	        if (k in O) O[to] = O[k];
	        else deletePropertyOrThrow(O, to);
	      }
	      for (var j = 0; j < argCount; j++) {
	        O[j] = arguments[j];
	      }
	    } return arraySetLength(O, len + argCount);
	  }
	});

	var $RangeError$d = RangeError;

	// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.with
	// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.with
	var arrayWith = function (O, C, index, value) {
	  var len = lengthOfArrayLike(O);
	  var relativeIndex = toIntegerOrInfinity(index);
	  var actualIndex = relativeIndex < 0 ? len + relativeIndex : relativeIndex;
	  if (actualIndex >= len || actualIndex < 0) throw new $RangeError$d('Incorrect index');
	  var A = new C(len);
	  var k = 0;
	  for (; k < len; k++) A[k] = k === actualIndex ? value : O[k];
	  return A;
	};

	var $Array$4 = Array;

	// `Array.prototype.with` method
	// https://tc39.es/ecma262/#sec-array.prototype.with
	_export({ target: 'Array', proto: true }, {
	  'with': function (index, value) {
	    return arrayWith(toIndexedObject(this), $Array$4, index, value);
	  }
	});

	// eslint-disable-next-line es/no-typed-arrays -- safe
	var arrayBufferBasicDetection = typeof ArrayBuffer != 'undefined' && typeof DataView != 'undefined';

	var defineBuiltIns = function (target, src, options) {
	  for (var key in src) defineBuiltIn(target, key, src[key], options);
	  return target;
	};

	var $TypeError$y = TypeError;

	var anInstance = function (it, Prototype) {
	  if (objectIsPrototypeOf(Prototype, it)) return it;
	  throw new $TypeError$y('Incorrect invocation');
	};

	var $RangeError$c = RangeError;

	// `ToIndex` abstract operation
	// https://tc39.es/ecma262/#sec-toindex
	var toIndex = function (it) {
	  if (it === undefined) return 0;
	  var number = toIntegerOrInfinity(it);
	  var length = toLength(number);
	  if (number !== length) throw new $RangeError$c('Wrong length or index');
	  return length;
	};

	// `Math.sign` method implementation
	// https://tc39.es/ecma262/#sec-math.sign
	// eslint-disable-next-line es/no-math-sign -- safe
	var mathSign = Math.sign || function sign(x) {
	  var n = +x;
	  // eslint-disable-next-line no-self-compare -- NaN check
	  return n === 0 || n !== n ? n : n < 0 ? -1 : 1;
	};

	var abs$8 = Math.abs;

	var EPSILON = 2.220446049250313e-16; // Number.EPSILON
	var INVERSE_EPSILON = 1 / EPSILON;

	var roundTiesToEven = function (n) {
	  return n + INVERSE_EPSILON - INVERSE_EPSILON;
	};

	var mathFloatRound = function (x, FLOAT_EPSILON, FLOAT_MAX_VALUE, FLOAT_MIN_VALUE) {
	  var n = +x;
	  var absolute = abs$8(n);
	  var s = mathSign(n);
	  if (absolute < FLOAT_MIN_VALUE) return s * roundTiesToEven(absolute / FLOAT_MIN_VALUE / FLOAT_EPSILON) * FLOAT_MIN_VALUE * FLOAT_EPSILON;
	  var a = (1 + FLOAT_EPSILON / EPSILON) * absolute;
	  var result = a - (a - absolute);
	  // eslint-disable-next-line no-self-compare -- NaN check
	  if (result > FLOAT_MAX_VALUE || result !== result) return s * Infinity;
	  return s * result;
	};

	var FLOAT32_EPSILON = 1.1920928955078125e-7; // 2 ** -23;
	var FLOAT32_MAX_VALUE = 3.4028234663852886e+38; // 2 ** 128 - 2 ** 104
	var FLOAT32_MIN_VALUE = 1.1754943508222875e-38; // 2 ** -126;

	// `Math.fround` method implementation
	// https://tc39.es/ecma262/#sec-math.fround
	// eslint-disable-next-line es/no-math-fround -- safe
	var mathFround = Math.fround || function fround(x) {
	  return mathFloatRound(x, FLOAT32_EPSILON, FLOAT32_MAX_VALUE, FLOAT32_MIN_VALUE);
	};

	// IEEE754 conversions based on https://github.com/feross/ieee754
	var $Array$3 = Array;
	var abs$7 = Math.abs;
	var pow$5 = Math.pow;
	var floor$8 = Math.floor;
	var log$8 = Math.log;
	var LN2$2 = Math.LN2;

	var pack = function (number, mantissaLength, bytes) {
	  var buffer = $Array$3(bytes);
	  var exponentLength = bytes * 8 - mantissaLength - 1;
	  var eMax = (1 << exponentLength) - 1;
	  var eBias = eMax >> 1;
	  var rt = mantissaLength === 23 ? pow$5(2, -24) - pow$5(2, -77) : 0;
	  var sign = number < 0 || number === 0 && 1 / number < 0 ? 1 : 0;
	  var index = 0;
	  var exponent, mantissa, c;
	  number = abs$7(number);
	  // eslint-disable-next-line no-self-compare -- NaN check
	  if (number !== number || number === Infinity) {
	    // eslint-disable-next-line no-self-compare -- NaN check
	    mantissa = number !== number ? 1 : 0;
	    exponent = eMax;
	  } else {
	    exponent = floor$8(log$8(number) / LN2$2);
	    c = pow$5(2, -exponent);
	    if (number * c < 1) {
	      exponent--;
	      c *= 2;
	    }
	    if (exponent + eBias >= 1) {
	      number += rt / c;
	    } else {
	      number += rt * pow$5(2, 1 - eBias);
	    }
	    if (number * c >= 2) {
	      exponent++;
	      c /= 2;
	    }
	    if (exponent + eBias >= eMax) {
	      mantissa = 0;
	      exponent = eMax;
	    } else if (exponent + eBias >= 1) {
	      mantissa = (number * c - 1) * pow$5(2, mantissaLength);
	      exponent += eBias;
	    } else {
	      mantissa = number * pow$5(2, eBias - 1) * pow$5(2, mantissaLength);
	      exponent = 0;
	    }
	  }
	  while (mantissaLength >= 8) {
	    buffer[index++] = mantissa & 255;
	    mantissa /= 256;
	    mantissaLength -= 8;
	  }
	  exponent = exponent << mantissaLength | mantissa;
	  exponentLength += mantissaLength;
	  while (exponentLength > 0) {
	    buffer[index++] = exponent & 255;
	    exponent /= 256;
	    exponentLength -= 8;
	  }
	  buffer[--index] |= sign * 128;
	  return buffer;
	};

	var unpack = function (buffer, mantissaLength) {
	  var bytes = buffer.length;
	  var exponentLength = bytes * 8 - mantissaLength - 1;
	  var eMax = (1 << exponentLength) - 1;
	  var eBias = eMax >> 1;
	  var nBits = exponentLength - 7;
	  var index = bytes - 1;
	  var sign = buffer[index--];
	  var exponent = sign & 127;
	  var mantissa;
	  sign >>= 7;
	  while (nBits > 0) {
	    exponent = exponent * 256 + buffer[index--];
	    nBits -= 8;
	  }
	  mantissa = exponent & (1 << -nBits) - 1;
	  exponent >>= -nBits;
	  nBits += mantissaLength;
	  while (nBits > 0) {
	    mantissa = mantissa * 256 + buffer[index--];
	    nBits -= 8;
	  }
	  if (exponent === 0) {
	    exponent = 1 - eBias;
	  } else if (exponent === eMax) {
	    return mantissa ? NaN : sign ? -Infinity : Infinity;
	  } else {
	    mantissa += pow$5(2, mantissaLength);
	    exponent -= eBias;
	  } return (sign ? -1 : 1) * mantissa * pow$5(2, exponent - mantissaLength);
	};

	var ieee754$1 = {
	  pack: pack,
	  unpack: unpack
	};

	var PROPER_FUNCTION_NAME$2 = functionName.PROPER;
	var CONFIGURABLE_FUNCTION_NAME = functionName.CONFIGURABLE;
	var ARRAY_BUFFER$1 = 'ArrayBuffer';
	var DATA_VIEW = 'DataView';
	var PROTOTYPE = 'prototype';
	var WRONG_LENGTH = 'Wrong length';
	var WRONG_INDEX = 'Wrong index';
	var getInternalArrayBufferState = internalState.getterFor(ARRAY_BUFFER$1);
	var getInternalDataViewState = internalState.getterFor(DATA_VIEW);
	var setInternalState$j = internalState.set;
	var NativeArrayBuffer$1 = global_1[ARRAY_BUFFER$1];
	var $ArrayBuffer$1 = NativeArrayBuffer$1;
	var ArrayBufferPrototype$2 = $ArrayBuffer$1 && $ArrayBuffer$1[PROTOTYPE];
	var $DataView = global_1[DATA_VIEW];
	var DataViewPrototype$2 = $DataView && $DataView[PROTOTYPE];
	var ObjectPrototype$3 = Object.prototype;
	var Array$3 = global_1.Array;
	var RangeError$2 = global_1.RangeError;
	var fill = functionUncurryThis(arrayFill);
	var reverse = functionUncurryThis([].reverse);

	var packIEEE754$1 = ieee754$1.pack;
	var unpackIEEE754$1 = ieee754$1.unpack;

	var packInt8 = function (number) {
	  return [number & 0xFF];
	};

	var packInt16 = function (number) {
	  return [number & 0xFF, number >> 8 & 0xFF];
	};

	var packInt32 = function (number) {
	  return [number & 0xFF, number >> 8 & 0xFF, number >> 16 & 0xFF, number >> 24 & 0xFF];
	};

	var unpackInt32 = function (buffer) {
	  return buffer[3] << 24 | buffer[2] << 16 | buffer[1] << 8 | buffer[0];
	};

	var packFloat32 = function (number) {
	  return packIEEE754$1(mathFround(number), 23, 4);
	};

	var packFloat64 = function (number) {
	  return packIEEE754$1(number, 52, 8);
	};

	var addGetter$1 = function (Constructor, key, getInternalState) {
	  defineBuiltInAccessor(Constructor[PROTOTYPE], key, {
	    configurable: true,
	    get: function () {
	      return getInternalState(this)[key];
	    }
	  });
	};

	var get$6 = function (view, count, index, isLittleEndian) {
	  var store = getInternalDataViewState(view);
	  var intIndex = toIndex(index);
	  var boolIsLittleEndian = !!isLittleEndian;
	  if (intIndex + count > store.byteLength) throw new RangeError$2(WRONG_INDEX);
	  var bytes = store.bytes;
	  var start = intIndex + store.byteOffset;
	  var pack = arraySlice(bytes, start, start + count);
	  return boolIsLittleEndian ? pack : reverse(pack);
	};

	var set$a = function (view, count, index, conversion, value, isLittleEndian) {
	  var store = getInternalDataViewState(view);
	  var intIndex = toIndex(index);
	  var pack = conversion(+value);
	  var boolIsLittleEndian = !!isLittleEndian;
	  if (intIndex + count > store.byteLength) throw new RangeError$2(WRONG_INDEX);
	  var bytes = store.bytes;
	  var start = intIndex + store.byteOffset;
	  for (var i = 0; i < count; i++) bytes[start + i] = pack[boolIsLittleEndian ? i : count - i - 1];
	};

	if (!arrayBufferBasicDetection) {
	  $ArrayBuffer$1 = function ArrayBuffer(length) {
	    anInstance(this, ArrayBufferPrototype$2);
	    var byteLength = toIndex(length);
	    setInternalState$j(this, {
	      type: ARRAY_BUFFER$1,
	      bytes: fill(Array$3(byteLength), 0),
	      byteLength: byteLength
	    });
	    if (!descriptors) {
	      this.byteLength = byteLength;
	      this.detached = false;
	    }
	  };

	  ArrayBufferPrototype$2 = $ArrayBuffer$1[PROTOTYPE];

	  $DataView = function DataView(buffer, byteOffset, byteLength) {
	    anInstance(this, DataViewPrototype$2);
	    anInstance(buffer, ArrayBufferPrototype$2);
	    var bufferState = getInternalArrayBufferState(buffer);
	    var bufferLength = bufferState.byteLength;
	    var offset = toIntegerOrInfinity(byteOffset);
	    if (offset < 0 || offset > bufferLength) throw new RangeError$2('Wrong offset');
	    byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
	    if (offset + byteLength > bufferLength) throw new RangeError$2(WRONG_LENGTH);
	    setInternalState$j(this, {
	      type: DATA_VIEW,
	      buffer: buffer,
	      byteLength: byteLength,
	      byteOffset: offset,
	      bytes: bufferState.bytes
	    });
	    if (!descriptors) {
	      this.buffer = buffer;
	      this.byteLength = byteLength;
	      this.byteOffset = offset;
	    }
	  };

	  DataViewPrototype$2 = $DataView[PROTOTYPE];

	  if (descriptors) {
	    addGetter$1($ArrayBuffer$1, 'byteLength', getInternalArrayBufferState);
	    addGetter$1($DataView, 'buffer', getInternalDataViewState);
	    addGetter$1($DataView, 'byteLength', getInternalDataViewState);
	    addGetter$1($DataView, 'byteOffset', getInternalDataViewState);
	  }

	  defineBuiltIns(DataViewPrototype$2, {
	    getInt8: function getInt8(byteOffset) {
	      return get$6(this, 1, byteOffset)[0] << 24 >> 24;
	    },
	    getUint8: function getUint8(byteOffset) {
	      return get$6(this, 1, byteOffset)[0];
	    },
	    getInt16: function getInt16(byteOffset /* , littleEndian */) {
	      var bytes = get$6(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : false);
	      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
	    },
	    getUint16: function getUint16(byteOffset /* , littleEndian */) {
	      var bytes = get$6(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : false);
	      return bytes[1] << 8 | bytes[0];
	    },
	    getInt32: function getInt32(byteOffset /* , littleEndian */) {
	      return unpackInt32(get$6(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : false));
	    },
	    getUint32: function getUint32(byteOffset /* , littleEndian */) {
	      return unpackInt32(get$6(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : false)) >>> 0;
	    },
	    getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
	      return unpackIEEE754$1(get$6(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : false), 23);
	    },
	    getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
	      return unpackIEEE754$1(get$6(this, 8, byteOffset, arguments.length > 1 ? arguments[1] : false), 52);
	    },
	    setInt8: function setInt8(byteOffset, value) {
	      set$a(this, 1, byteOffset, packInt8, value);
	    },
	    setUint8: function setUint8(byteOffset, value) {
	      set$a(this, 1, byteOffset, packInt8, value);
	    },
	    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
	      set$a(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : false);
	    },
	    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
	      set$a(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : false);
	    },
	    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
	      set$a(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : false);
	    },
	    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
	      set$a(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : false);
	    },
	    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
	      set$a(this, 4, byteOffset, packFloat32, value, arguments.length > 2 ? arguments[2] : false);
	    },
	    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
	      set$a(this, 8, byteOffset, packFloat64, value, arguments.length > 2 ? arguments[2] : false);
	    }
	  });
	} else {
	  var INCORRECT_ARRAY_BUFFER_NAME = PROPER_FUNCTION_NAME$2 && NativeArrayBuffer$1.name !== ARRAY_BUFFER$1;
	  /* eslint-disable no-new -- required for testing */
	  if (!fails(function () {
	    NativeArrayBuffer$1(1);
	  }) || !fails(function () {
	    new NativeArrayBuffer$1(-1);
	  }) || fails(function () {
	    new NativeArrayBuffer$1();
	    new NativeArrayBuffer$1(1.5);
	    new NativeArrayBuffer$1(NaN);
	    return NativeArrayBuffer$1.length !== 1 || INCORRECT_ARRAY_BUFFER_NAME && !CONFIGURABLE_FUNCTION_NAME;
	  })) {
	    /* eslint-enable no-new -- required for testing */
	    $ArrayBuffer$1 = function ArrayBuffer(length) {
	      anInstance(this, ArrayBufferPrototype$2);
	      return inheritIfRequired(new NativeArrayBuffer$1(toIndex(length)), this, $ArrayBuffer$1);
	    };

	    $ArrayBuffer$1[PROTOTYPE] = ArrayBufferPrototype$2;

	    ArrayBufferPrototype$2.constructor = $ArrayBuffer$1;

	    copyConstructorProperties$1($ArrayBuffer$1, NativeArrayBuffer$1);
	  } else if (INCORRECT_ARRAY_BUFFER_NAME && CONFIGURABLE_FUNCTION_NAME) {
	    createNonEnumerableProperty(NativeArrayBuffer$1, 'name', ARRAY_BUFFER$1);
	  }

	  // WebKit bug - the same parent prototype for typed arrays and data view
	  if (objectSetPrototypeOf && objectGetPrototypeOf(DataViewPrototype$2) !== ObjectPrototype$3) {
	    objectSetPrototypeOf(DataViewPrototype$2, ObjectPrototype$3);
	  }

	  // iOS Safari 7.x bug
	  var testView = new $DataView(new $ArrayBuffer$1(2));
	  var $setInt8 = functionUncurryThis(DataViewPrototype$2.setInt8);
	  testView.setInt8(0, 2147483648);
	  testView.setInt8(1, 2147483649);
	  if (testView.getInt8(0) || !testView.getInt8(1)) defineBuiltIns(DataViewPrototype$2, {
	    setInt8: function setInt8(byteOffset, value) {
	      $setInt8(this, byteOffset, value << 24 >> 24);
	    },
	    setUint8: function setUint8(byteOffset, value) {
	      $setInt8(this, byteOffset, value << 24 >> 24);
	    }
	  }, { unsafe: true });
	}

	setToStringTag($ArrayBuffer$1, ARRAY_BUFFER$1);
	setToStringTag($DataView, DATA_VIEW);

	var arrayBuffer = {
	  ArrayBuffer: $ArrayBuffer$1,
	  DataView: $DataView
	};

	var ARRAY_BUFFER = 'ArrayBuffer';
	var ArrayBuffer$4 = arrayBuffer[ARRAY_BUFFER];
	var NativeArrayBuffer = global_1[ARRAY_BUFFER];

	// `ArrayBuffer` constructor
	// https://tc39.es/ecma262/#sec-arraybuffer-constructor
	_export({ global: true, constructor: true, forced: NativeArrayBuffer !== ArrayBuffer$4 }, {
	  ArrayBuffer: ArrayBuffer$4
	});

	setSpecies(ARRAY_BUFFER);

	var enforceInternalState$2 = internalState.enforce;
	var getInternalState$c = internalState.get;
	var Int8Array$4 = global_1.Int8Array;
	var Int8ArrayPrototype$1 = Int8Array$4 && Int8Array$4.prototype;
	var Uint8ClampedArray$1 = global_1.Uint8ClampedArray;
	var Uint8ClampedArrayPrototype = Uint8ClampedArray$1 && Uint8ClampedArray$1.prototype;
	var TypedArray = Int8Array$4 && objectGetPrototypeOf(Int8Array$4);
	var TypedArrayPrototype$1 = Int8ArrayPrototype$1 && objectGetPrototypeOf(Int8ArrayPrototype$1);
	var ObjectPrototype$2 = Object.prototype;
	var TypeError$7 = global_1.TypeError;

	var TO_STRING_TAG$7 = wellKnownSymbol('toStringTag');
	var TYPED_ARRAY_TAG = uid('TYPED_ARRAY_TAG');
	var TYPED_ARRAY_CONSTRUCTOR = 'TypedArrayConstructor';
	// Fixing native typed arrays in Opera Presto crashes the browser, see #595
	var NATIVE_ARRAY_BUFFER_VIEWS$2 = arrayBufferBasicDetection && !!objectSetPrototypeOf && classof(global_1.opera) !== 'Opera';
	var TYPED_ARRAY_TAG_REQUIRED = false;
	var NAME$1, Constructor, Prototype;

	var TypedArrayConstructorsList = {
	  Int8Array: 1,
	  Uint8Array: 1,
	  Uint8ClampedArray: 1,
	  Int16Array: 2,
	  Uint16Array: 2,
	  Int32Array: 4,
	  Uint32Array: 4,
	  Float32Array: 4,
	  Float64Array: 8
	};

	var BigIntArrayConstructorsList = {
	  BigInt64Array: 8,
	  BigUint64Array: 8
	};

	var isView = function isView(it) {
	  if (!isObject$1(it)) return false;
	  var klass = classof(it);
	  return klass === 'DataView'
	    || hasOwnProperty_1(TypedArrayConstructorsList, klass)
	    || hasOwnProperty_1(BigIntArrayConstructorsList, klass);
	};

	var getTypedArrayConstructor$6 = function (it) {
	  var proto = objectGetPrototypeOf(it);
	  if (!isObject$1(proto)) return;
	  var state = getInternalState$c(proto);
	  return (state && hasOwnProperty_1(state, TYPED_ARRAY_CONSTRUCTOR)) ? state[TYPED_ARRAY_CONSTRUCTOR] : getTypedArrayConstructor$6(proto);
	};

	var isTypedArray$1 = function (it) {
	  if (!isObject$1(it)) return false;
	  var klass = classof(it);
	  return hasOwnProperty_1(TypedArrayConstructorsList, klass)
	    || hasOwnProperty_1(BigIntArrayConstructorsList, klass);
	};

	var aTypedArray$x = function (it) {
	  if (isTypedArray$1(it)) return it;
	  throw new TypeError$7('Target is not a typed array');
	};

	var aTypedArrayConstructor$4 = function (C) {
	  if (isCallable(C) && (!objectSetPrototypeOf || objectIsPrototypeOf(TypedArray, C))) return C;
	  throw new TypeError$7(tryToString(C) + ' is not a typed array constructor');
	};

	var exportTypedArrayMethod$y = function (KEY, property, forced, options) {
	  if (!descriptors) return;
	  if (forced) for (var ARRAY in TypedArrayConstructorsList) {
	    var TypedArrayConstructor = global_1[ARRAY];
	    if (TypedArrayConstructor && hasOwnProperty_1(TypedArrayConstructor.prototype, KEY)) try {
	      delete TypedArrayConstructor.prototype[KEY];
	    } catch (error) {
	      // old WebKit bug - some methods are non-configurable
	      try {
	        TypedArrayConstructor.prototype[KEY] = property;
	      } catch (error2) { /* empty */ }
	    }
	  }
	  if (!TypedArrayPrototype$1[KEY] || forced) {
	    defineBuiltIn(TypedArrayPrototype$1, KEY, forced ? property
	      : NATIVE_ARRAY_BUFFER_VIEWS$2 && Int8ArrayPrototype$1[KEY] || property, options);
	  }
	};

	var exportTypedArrayStaticMethod$3 = function (KEY, property, forced) {
	  var ARRAY, TypedArrayConstructor;
	  if (!descriptors) return;
	  if (objectSetPrototypeOf) {
	    if (forced) for (ARRAY in TypedArrayConstructorsList) {
	      TypedArrayConstructor = global_1[ARRAY];
	      if (TypedArrayConstructor && hasOwnProperty_1(TypedArrayConstructor, KEY)) try {
	        delete TypedArrayConstructor[KEY];
	      } catch (error) { /* empty */ }
	    }
	    if (!TypedArray[KEY] || forced) {
	      // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
	      try {
	        return defineBuiltIn(TypedArray, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS$2 && TypedArray[KEY] || property);
	      } catch (error) { /* empty */ }
	    } else return;
	  }
	  for (ARRAY in TypedArrayConstructorsList) {
	    TypedArrayConstructor = global_1[ARRAY];
	    if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
	      defineBuiltIn(TypedArrayConstructor, KEY, property);
	    }
	  }
	};

	for (NAME$1 in TypedArrayConstructorsList) {
	  Constructor = global_1[NAME$1];
	  Prototype = Constructor && Constructor.prototype;
	  if (Prototype) enforceInternalState$2(Prototype)[TYPED_ARRAY_CONSTRUCTOR] = Constructor;
	  else NATIVE_ARRAY_BUFFER_VIEWS$2 = false;
	}

	for (NAME$1 in BigIntArrayConstructorsList) {
	  Constructor = global_1[NAME$1];
	  Prototype = Constructor && Constructor.prototype;
	  if (Prototype) enforceInternalState$2(Prototype)[TYPED_ARRAY_CONSTRUCTOR] = Constructor;
	}

	// WebKit bug - typed arrays constructors prototype is Object.prototype
	if (!NATIVE_ARRAY_BUFFER_VIEWS$2 || !isCallable(TypedArray) || TypedArray === Function.prototype) {
	  // eslint-disable-next-line no-shadow -- safe
	  TypedArray = function TypedArray() {
	    throw new TypeError$7('Incorrect invocation');
	  };
	  if (NATIVE_ARRAY_BUFFER_VIEWS$2) for (NAME$1 in TypedArrayConstructorsList) {
	    if (global_1[NAME$1]) objectSetPrototypeOf(global_1[NAME$1], TypedArray);
	  }
	}

	if (!NATIVE_ARRAY_BUFFER_VIEWS$2 || !TypedArrayPrototype$1 || TypedArrayPrototype$1 === ObjectPrototype$2) {
	  TypedArrayPrototype$1 = TypedArray.prototype;
	  if (NATIVE_ARRAY_BUFFER_VIEWS$2) for (NAME$1 in TypedArrayConstructorsList) {
	    if (global_1[NAME$1]) objectSetPrototypeOf(global_1[NAME$1].prototype, TypedArrayPrototype$1);
	  }
	}

	// WebKit bug - one more object in Uint8ClampedArray prototype chain
	if (NATIVE_ARRAY_BUFFER_VIEWS$2 && objectGetPrototypeOf(Uint8ClampedArrayPrototype) !== TypedArrayPrototype$1) {
	  objectSetPrototypeOf(Uint8ClampedArrayPrototype, TypedArrayPrototype$1);
	}

	if (descriptors && !hasOwnProperty_1(TypedArrayPrototype$1, TO_STRING_TAG$7)) {
	  TYPED_ARRAY_TAG_REQUIRED = true;
	  defineBuiltInAccessor(TypedArrayPrototype$1, TO_STRING_TAG$7, {
	    configurable: true,
	    get: function () {
	      return isObject$1(this) ? this[TYPED_ARRAY_TAG] : undefined;
	    }
	  });
	  for (NAME$1 in TypedArrayConstructorsList) if (global_1[NAME$1]) {
	    createNonEnumerableProperty(global_1[NAME$1], TYPED_ARRAY_TAG, NAME$1);
	  }
	}

	var arrayBufferViewCore = {
	  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS$2,
	  TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQUIRED && TYPED_ARRAY_TAG,
	  aTypedArray: aTypedArray$x,
	  aTypedArrayConstructor: aTypedArrayConstructor$4,
	  exportTypedArrayMethod: exportTypedArrayMethod$y,
	  exportTypedArrayStaticMethod: exportTypedArrayStaticMethod$3,
	  getTypedArrayConstructor: getTypedArrayConstructor$6,
	  isView: isView,
	  isTypedArray: isTypedArray$1,
	  TypedArray: TypedArray,
	  TypedArrayPrototype: TypedArrayPrototype$1
	};

	var NATIVE_ARRAY_BUFFER_VIEWS$1 = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;

	// `ArrayBuffer.isView` method
	// https://tc39.es/ecma262/#sec-arraybuffer.isview
	_export({ target: 'ArrayBuffer', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS$1 }, {
	  isView: arrayBufferViewCore.isView
	});

	var $TypeError$x = TypeError;

	// `Assert: IsConstructor(argument) is true`
	var aConstructor = function (argument) {
	  if (isConstructor(argument)) return argument;
	  throw new $TypeError$x(tryToString(argument) + ' is not a constructor');
	};

	var SPECIES$2 = wellKnownSymbol('species');

	// `SpeciesConstructor` abstract operation
	// https://tc39.es/ecma262/#sec-speciesconstructor
	var speciesConstructor = function (O, defaultConstructor) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || isNullOrUndefined(S = anObject(C)[SPECIES$2]) ? defaultConstructor : aConstructor(S);
	};

	var ArrayBuffer$3 = arrayBuffer.ArrayBuffer;
	var DataView$3 = arrayBuffer.DataView;
	var DataViewPrototype$1 = DataView$3.prototype;
	var nativeArrayBufferSlice = functionUncurryThisClause(ArrayBuffer$3.prototype.slice);
	var getUint8$1 = functionUncurryThisClause(DataViewPrototype$1.getUint8);
	var setUint8$1 = functionUncurryThisClause(DataViewPrototype$1.setUint8);

	var INCORRECT_SLICE = fails(function () {
	  return !new ArrayBuffer$3(2).slice(1, undefined).byteLength;
	});

	// `ArrayBuffer.prototype.slice` method
	// https://tc39.es/ecma262/#sec-arraybuffer.prototype.slice
	_export({ target: 'ArrayBuffer', proto: true, unsafe: true, forced: INCORRECT_SLICE }, {
	  slice: function slice(start, end) {
	    if (nativeArrayBufferSlice && end === undefined) {
	      return nativeArrayBufferSlice(anObject(this), start); // FF fix
	    }
	    var length = anObject(this).byteLength;
	    var first = toAbsoluteIndex(start, length);
	    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
	    var result = new (speciesConstructor(this, ArrayBuffer$3))(toLength(fin - first));
	    var viewSource = new DataView$3(this);
	    var viewTarget = new DataView$3(result);
	    var index = 0;
	    while (first < fin) {
	      setUint8$1(viewTarget, index++, getUint8$1(viewSource, first++));
	    } return result;
	  }
	});

	// `DataView` constructor
	// https://tc39.es/ecma262/#sec-dataview-constructor
	_export({ global: true, constructor: true, forced: !arrayBufferBasicDetection }, {
	  DataView: arrayBuffer.DataView
	});

	// IE8- non-standard case
	var FORCED$p = fails(function () {
	  // eslint-disable-next-line es/no-date-prototype-getyear-setyear -- detection
	  return new Date(16e11).getYear() !== 120;
	});

	var getFullYear = functionUncurryThis(Date.prototype.getFullYear);

	// `Date.prototype.getYear` method
	// https://tc39.es/ecma262/#sec-date.prototype.getyear
	_export({ target: 'Date', proto: true, forced: FORCED$p }, {
	  getYear: function getYear() {
	    return getFullYear(this) - 1900;
	  }
	});

	// TODO: Remove from `core-js@4`



	var $Date = Date;
	var thisTimeValue$4 = functionUncurryThis($Date.prototype.getTime);

	// `Date.now` method
	// https://tc39.es/ecma262/#sec-date.now
	_export({ target: 'Date', stat: true }, {
	  now: function now() {
	    return thisTimeValue$4(new $Date());
	  }
	});

	var DatePrototype$3 = Date.prototype;
	var thisTimeValue$3 = functionUncurryThis(DatePrototype$3.getTime);
	var setFullYear = functionUncurryThis(DatePrototype$3.setFullYear);

	// `Date.prototype.setYear` method
	// https://tc39.es/ecma262/#sec-date.prototype.setyear
	_export({ target: 'Date', proto: true }, {
	  setYear: function setYear(year) {
	    // validate
	    thisTimeValue$3(this);
	    var yi = toIntegerOrInfinity(year);
	    var yyyy = yi >= 0 && yi <= 99 ? yi + 1900 : yi;
	    return setFullYear(this, yyyy);
	  }
	});

	// `Date.prototype.toGMTString` method
	// https://tc39.es/ecma262/#sec-date.prototype.togmtstring
	_export({ target: 'Date', proto: true }, {
	  toGMTString: Date.prototype.toUTCString
	});

	var $RangeError$b = RangeError;

	// `String.prototype.repeat` method implementation
	// https://tc39.es/ecma262/#sec-string.prototype.repeat
	var stringRepeat = function repeat(count) {
	  var str = toString_1$1(requireObjectCoercible(this));
	  var result = '';
	  var n = toIntegerOrInfinity(count);
	  if (n < 0 || n === Infinity) throw new $RangeError$b('Wrong number of repetitions');
	  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
	  return result;
	};

	// https://github.com/tc39/proposal-string-pad-start-end






	var repeat$2 = functionUncurryThis(stringRepeat);
	var stringSlice$k = functionUncurryThis(''.slice);
	var ceil = Math.ceil;

	// `String.prototype.{ padStart, padEnd }` methods implementation
	var createMethod$4 = function (IS_END) {
	  return function ($this, maxLength, fillString) {
	    var S = toString_1$1(requireObjectCoercible($this));
	    var intMaxLength = toLength(maxLength);
	    var stringLength = S.length;
	    var fillStr = fillString === undefined ? ' ' : toString_1$1(fillString);
	    var fillLen, stringFiller;
	    if (intMaxLength <= stringLength || fillStr === '') return S;
	    fillLen = intMaxLength - stringLength;
	    stringFiller = repeat$2(fillStr, ceil(fillLen / fillStr.length));
	    if (stringFiller.length > fillLen) stringFiller = stringSlice$k(stringFiller, 0, fillLen);
	    return IS_END ? S + stringFiller : stringFiller + S;
	  };
	};

	var stringPad = {
	  // `String.prototype.padStart` method
	  // https://tc39.es/ecma262/#sec-string.prototype.padstart
	  start: createMethod$4(false),
	  // `String.prototype.padEnd` method
	  // https://tc39.es/ecma262/#sec-string.prototype.padend
	  end: createMethod$4(true)
	};

	var padStart = stringPad.start;

	var $RangeError$a = RangeError;
	var $isFinite$1 = isFinite;
	var abs$6 = Math.abs;
	var DatePrototype$2 = Date.prototype;
	var nativeDateToISOString = DatePrototype$2.toISOString;
	var thisTimeValue$2 = functionUncurryThis(DatePrototype$2.getTime);
	var getUTCDate = functionUncurryThis(DatePrototype$2.getUTCDate);
	var getUTCFullYear = functionUncurryThis(DatePrototype$2.getUTCFullYear);
	var getUTCHours = functionUncurryThis(DatePrototype$2.getUTCHours);
	var getUTCMilliseconds = functionUncurryThis(DatePrototype$2.getUTCMilliseconds);
	var getUTCMinutes = functionUncurryThis(DatePrototype$2.getUTCMinutes);
	var getUTCMonth = functionUncurryThis(DatePrototype$2.getUTCMonth);
	var getUTCSeconds = functionUncurryThis(DatePrototype$2.getUTCSeconds);

	// `Date.prototype.toISOString` method implementation
	// https://tc39.es/ecma262/#sec-date.prototype.toisostring
	// PhantomJS / old WebKit fails here:
	var dateToIsoString = (fails(function () {
	  return nativeDateToISOString.call(new Date(-5e13 - 1)) !== '0385-07-25T07:06:39.999Z';
	}) || !fails(function () {
	  nativeDateToISOString.call(new Date(NaN));
	})) ? function toISOString() {
	  if (!$isFinite$1(thisTimeValue$2(this))) throw new $RangeError$a('Invalid time value');
	  var date = this;
	  var year = getUTCFullYear(date);
	  var milliseconds = getUTCMilliseconds(date);
	  var sign = year < 0 ? '-' : year > 9999 ? '+' : '';
	  return sign + padStart(abs$6(year), sign ? 6 : 4, 0) +
	    '-' + padStart(getUTCMonth(date) + 1, 2, 0) +
	    '-' + padStart(getUTCDate(date), 2, 0) +
	    'T' + padStart(getUTCHours(date), 2, 0) +
	    ':' + padStart(getUTCMinutes(date), 2, 0) +
	    ':' + padStart(getUTCSeconds(date), 2, 0) +
	    '.' + padStart(milliseconds, 3, 0) +
	    'Z';
	} : nativeDateToISOString;

	// `Date.prototype.toISOString` method
	// https://tc39.es/ecma262/#sec-date.prototype.toisostring
	// PhantomJS / old WebKit has a broken implementations
	_export({ target: 'Date', proto: true, forced: Date.prototype.toISOString !== dateToIsoString }, {
	  toISOString: dateToIsoString
	});

	var FORCED$o = fails(function () {
	  return new Date(NaN).toJSON() !== null
	    || Date.prototype.toJSON.call({ toISOString: function () { return 1; } }) !== 1;
	});

	// `Date.prototype.toJSON` method
	// https://tc39.es/ecma262/#sec-date.prototype.tojson
	_export({ target: 'Date', proto: true, arity: 1, forced: FORCED$o }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  toJSON: function toJSON(key) {
	    var O = toObject(this);
	    var pv = toPrimitive(O, 'number');
	    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
	  }
	});

	var $TypeError$w = TypeError;

	// `Date.prototype[@@toPrimitive](hint)` method implementation
	// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
	var dateToPrimitive = function (hint) {
	  anObject(this);
	  if (hint === 'string' || hint === 'default') hint = 'string';
	  else if (hint !== 'number') throw new $TypeError$w('Incorrect hint');
	  return ordinaryToPrimitive(this, hint);
	};

	var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
	var DatePrototype$1 = Date.prototype;

	// `Date.prototype[@@toPrimitive]` method
	// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
	if (!hasOwnProperty_1(DatePrototype$1, TO_PRIMITIVE)) {
	  defineBuiltIn(DatePrototype$1, TO_PRIMITIVE, dateToPrimitive);
	}

	// TODO: Remove from `core-js@4`



	var DatePrototype = Date.prototype;
	var INVALID_DATE = 'Invalid Date';
	var TO_STRING$1 = 'toString';
	var nativeDateToString = functionUncurryThis(DatePrototype[TO_STRING$1]);
	var thisTimeValue$1 = functionUncurryThis(DatePrototype.getTime);

	// `Date.prototype.toString` method
	// https://tc39.es/ecma262/#sec-date.prototype.tostring
	if (String(new Date(NaN)) !== INVALID_DATE) {
	  defineBuiltIn(DatePrototype, TO_STRING$1, function toString() {
	    var value = thisTimeValue$1(this);
	    // eslint-disable-next-line no-self-compare -- NaN check
	    return value === value ? nativeDateToString(this) : INVALID_DATE;
	  });
	}

	var charAt$l = functionUncurryThis(''.charAt);
	var charCodeAt$8 = functionUncurryThis(''.charCodeAt);
	var exec$e = functionUncurryThis(/./.exec);
	var numberToString$3 = functionUncurryThis(1.0.toString);
	var toUpperCase = functionUncurryThis(''.toUpperCase);

	var raw = /[\w*+\-./@]/;

	var hex$1 = function (code, length) {
	  var result = numberToString$3(code, 16);
	  while (result.length < length) result = '0' + result;
	  return result;
	};

	// `escape` method
	// https://tc39.es/ecma262/#sec-escape-string
	_export({ global: true }, {
	  escape: function escape(string) {
	    var str = toString_1$1(string);
	    var result = '';
	    var length = str.length;
	    var index = 0;
	    var chr, code;
	    while (index < length) {
	      chr = charAt$l(str, index++);
	      if (exec$e(raw, chr)) {
	        result += chr;
	      } else {
	        code = charCodeAt$8(chr, 0);
	        if (code < 256) {
	          result += '%' + hex$1(code, 2);
	        } else {
	          result += '%u' + toUpperCase(hex$1(code, 4));
	        }
	      }
	    } return result;
	  }
	});

	var $Function = Function;
	var concat$3 = functionUncurryThis([].concat);
	var join$8 = functionUncurryThis([].join);
	var factories = {};

	var construct = function (C, argsLength, args) {
	  if (!hasOwnProperty_1(factories, argsLength)) {
	    var list = [];
	    var i = 0;
	    for (; i < argsLength; i++) list[i] = 'a[' + i + ']';
	    factories[argsLength] = $Function('C,a', 'return new C(' + join$8(list, ',') + ')');
	  } return factories[argsLength](C, args);
	};

	// `Function.prototype.bind` method implementation
	// https://tc39.es/ecma262/#sec-function.prototype.bind
	// eslint-disable-next-line es/no-function-prototype-bind -- detection
	var functionBind = functionBindNative ? $Function.bind : function bind(that /* , ...args */) {
	  var F = aCallable(this);
	  var Prototype = F.prototype;
	  var partArgs = arraySlice(arguments, 1);
	  var boundFunction = function bound(/* args... */) {
	    var args = concat$3(partArgs, arraySlice(arguments));
	    return this instanceof boundFunction ? construct(F, args.length, args) : F.apply(that, args);
	  };
	  if (isObject$1(Prototype)) boundFunction.prototype = Prototype;
	  return boundFunction;
	};

	// TODO: Remove from `core-js@4`



	// `Function.prototype.bind` method
	// https://tc39.es/ecma262/#sec-function.prototype.bind
	// eslint-disable-next-line es/no-function-prototype-bind -- detection
	_export({ target: 'Function', proto: true, forced: Function.bind !== functionBind }, {
	  bind: functionBind
	});

	var HAS_INSTANCE = wellKnownSymbol('hasInstance');
	var FunctionPrototype$2 = Function.prototype;

	// `Function.prototype[@@hasInstance]` method
	// https://tc39.es/ecma262/#sec-function.prototype-@@hasinstance
	if (!(HAS_INSTANCE in FunctionPrototype$2)) {
	  objectDefineProperty.f(FunctionPrototype$2, HAS_INSTANCE, { value: makeBuiltIn_1(function (O) {
	    if (!isCallable(this) || !isObject$1(O)) return false;
	    var P = this.prototype;
	    return isObject$1(P) ? objectIsPrototypeOf(P, O) : O instanceof this;
	  }, HAS_INSTANCE) });
	}

	var FUNCTION_NAME_EXISTS = functionName.EXISTS;



	var FunctionPrototype$1 = Function.prototype;
	var functionToString = functionUncurryThis(FunctionPrototype$1.toString);
	var nameRE = /function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/;
	var regExpExec = functionUncurryThis(nameRE.exec);
	var NAME = 'name';

	// Function instances `.name` property
	// https://tc39.es/ecma262/#sec-function-instances-name
	if (descriptors && !FUNCTION_NAME_EXISTS) {
	  defineBuiltInAccessor(FunctionPrototype$1, NAME, {
	    configurable: true,
	    get: function () {
	      try {
	        return regExpExec(nameRE, functionToString(this))[1];
	      } catch (error) {
	        return '';
	      }
	    }
	  });
	}

	// `globalThis` object
	// https://tc39.es/ecma262/#sec-globalthis
	_export({ global: true, forced: global_1.globalThis !== global_1 }, {
	  globalThis: global_1
	});

	// JSON[@@toStringTag] property
	// https://tc39.es/ecma262/#sec-json-@@tostringtag
	setToStringTag(global_1.JSON, 'JSON', true);

	// FF26- bug: ArrayBuffers are non-extensible, but Object.isExtensible does not report it


	var arrayBufferNonExtensible = fails(function () {
	  if (typeof ArrayBuffer == 'function') {
	    var buffer = new ArrayBuffer(8);
	    // eslint-disable-next-line es/no-object-isextensible, es/no-object-defineproperty -- safe
	    if (Object.isExtensible(buffer)) Object.defineProperty(buffer, 'a', { value: 8 });
	  }
	});

	// eslint-disable-next-line es/no-object-isextensible -- safe
	var $isExtensible = Object.isExtensible;
	var FAILS_ON_PRIMITIVES$6 = fails(function () { $isExtensible(1); });

	// `Object.isExtensible` method
	// https://tc39.es/ecma262/#sec-object.isextensible
	var objectIsExtensible = (FAILS_ON_PRIMITIVES$6 || arrayBufferNonExtensible) ? function isExtensible(it) {
	  if (!isObject$1(it)) return false;
	  if (arrayBufferNonExtensible && classofRaw(it) === 'ArrayBuffer') return false;
	  return $isExtensible ? $isExtensible(it) : true;
	} : $isExtensible;

	var freezing = !fails(function () {
	  // eslint-disable-next-line es/no-object-isextensible, es/no-object-preventextensions -- required for testing
	  return Object.isExtensible(Object.preventExtensions({}));
	});

	var internalMetadata = createCommonjsModule(function (module) {





	var defineProperty = objectDefineProperty.f;






	var REQUIRED = false;
	var METADATA = uid('meta');
	var id = 0;

	var setMetadata = function (it) {
	  defineProperty(it, METADATA, { value: {
	    objectID: 'O' + id++, // object ID
	    weakData: {}          // weak collections IDs
	  } });
	};

	var fastKey = function (it, create) {
	  // return a primitive with prefix
	  if (!isObject$1(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!hasOwnProperty_1(it, METADATA)) {
	    // can't set metadata to uncaught frozen object
	    if (!objectIsExtensible(it)) return 'F';
	    // not necessary to add metadata
	    if (!create) return 'E';
	    // add missing metadata
	    setMetadata(it);
	  // return object ID
	  } return it[METADATA].objectID;
	};

	var getWeakData = function (it, create) {
	  if (!hasOwnProperty_1(it, METADATA)) {
	    // can't set metadata to uncaught frozen object
	    if (!objectIsExtensible(it)) return true;
	    // not necessary to add metadata
	    if (!create) return false;
	    // add missing metadata
	    setMetadata(it);
	  // return the store of weak collections IDs
	  } return it[METADATA].weakData;
	};

	// add metadata on freeze-family methods calling
	var onFreeze = function (it) {
	  if (freezing && REQUIRED && objectIsExtensible(it) && !hasOwnProperty_1(it, METADATA)) setMetadata(it);
	  return it;
	};

	var enable = function () {
	  meta.enable = function () { /* empty */ };
	  REQUIRED = true;
	  var getOwnPropertyNames = objectGetOwnPropertyNames.f;
	  var splice = functionUncurryThis([].splice);
	  var test = {};
	  test[METADATA] = 1;

	  // prevent exposing of metadata key
	  if (getOwnPropertyNames(test).length) {
	    objectGetOwnPropertyNames.f = function (it) {
	      var result = getOwnPropertyNames(it);
	      for (var i = 0, length = result.length; i < length; i++) {
	        if (result[i] === METADATA) {
	          splice(result, i, 1);
	          break;
	        }
	      } return result;
	    };

	    _export({ target: 'Object', stat: true, forced: true }, {
	      getOwnPropertyNames: objectGetOwnPropertyNamesExternal.f
	    });
	  }
	};

	var meta = module.exports = {
	  enable: enable,
	  fastKey: fastKey,
	  getWeakData: getWeakData,
	  onFreeze: onFreeze
	};

	hiddenKeys$1[METADATA] = true;
	});
	internalMetadata.enable;
	internalMetadata.fastKey;
	internalMetadata.getWeakData;
	internalMetadata.onFreeze;

	var collection = function (CONSTRUCTOR_NAME, wrapper, common) {
	  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
	  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
	  var ADDER = IS_MAP ? 'set' : 'add';
	  var NativeConstructor = global_1[CONSTRUCTOR_NAME];
	  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
	  var Constructor = NativeConstructor;
	  var exported = {};

	  var fixMethod = function (KEY) {
	    var uncurriedNativeMethod = functionUncurryThis(NativePrototype[KEY]);
	    defineBuiltIn(NativePrototype, KEY,
	      KEY === 'add' ? function add(value) {
	        uncurriedNativeMethod(this, value === 0 ? 0 : value);
	        return this;
	      } : KEY === 'delete' ? function (key) {
	        return IS_WEAK && !isObject$1(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
	      } : KEY === 'get' ? function get(key) {
	        return IS_WEAK && !isObject$1(key) ? undefined : uncurriedNativeMethod(this, key === 0 ? 0 : key);
	      } : KEY === 'has' ? function has(key) {
	        return IS_WEAK && !isObject$1(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
	      } : function set(key, value) {
	        uncurriedNativeMethod(this, key === 0 ? 0 : key, value);
	        return this;
	      }
	    );
	  };

	  var REPLACE = isForced_1(
	    CONSTRUCTOR_NAME,
	    !isCallable(NativeConstructor) || !(IS_WEAK || NativePrototype.forEach && !fails(function () {
	      new NativeConstructor().entries().next();
	    }))
	  );

	  if (REPLACE) {
	    // create collection constructor
	    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
	    internalMetadata.enable();
	  } else if (isForced_1(CONSTRUCTOR_NAME, true)) {
	    var instance = new Constructor();
	    // early implementations not supports chaining
	    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) !== instance;
	    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
	    var THROWS_ON_PRIMITIVES = fails(function () { instance.has(1); });
	    // most early implementations doesn't supports iterables, most modern - not close it correctly
	    // eslint-disable-next-line no-new -- required for testing
	    var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) { new NativeConstructor(iterable); });
	    // for early implementations -0 and +0 not the same
	    var BUGGY_ZERO = !IS_WEAK && fails(function () {
	      // V8 ~ Chromium 42- fails only with 5+ elements
	      var $instance = new NativeConstructor();
	      var index = 5;
	      while (index--) $instance[ADDER](index, index);
	      return !$instance.has(-0);
	    });

	    if (!ACCEPT_ITERABLES) {
	      Constructor = wrapper(function (dummy, iterable) {
	        anInstance(dummy, NativePrototype);
	        var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
	        if (!isNullOrUndefined(iterable)) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
	        return that;
	      });
	      Constructor.prototype = NativePrototype;
	      NativePrototype.constructor = Constructor;
	    }

	    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
	      fixMethod('delete');
	      fixMethod('has');
	      IS_MAP && fixMethod('get');
	    }

	    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);

	    // weak collections should not contains .clear method
	    if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
	  }

	  exported[CONSTRUCTOR_NAME] = Constructor;
	  _export({ global: true, constructor: true, forced: Constructor !== NativeConstructor }, exported);

	  setToStringTag(Constructor, CONSTRUCTOR_NAME);

	  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

	  return Constructor;
	};

	var fastKey = internalMetadata.fastKey;


	var setInternalState$i = internalState.set;
	var internalStateGetterFor$1 = internalState.getterFor;

	var collectionStrong = {
	  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
	    var Constructor = wrapper(function (that, iterable) {
	      anInstance(that, Prototype);
	      setInternalState$i(that, {
	        type: CONSTRUCTOR_NAME,
	        index: objectCreate(null),
	        first: undefined,
	        last: undefined,
	        size: 0
	      });
	      if (!descriptors) that.size = 0;
	      if (!isNullOrUndefined(iterable)) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
	    });

	    var Prototype = Constructor.prototype;

	    var getInternalState = internalStateGetterFor$1(CONSTRUCTOR_NAME);

	    var define = function (that, key, value) {
	      var state = getInternalState(that);
	      var entry = getEntry(that, key);
	      var previous, index;
	      // change existing entry
	      if (entry) {
	        entry.value = value;
	      // create new entry
	      } else {
	        state.last = entry = {
	          index: index = fastKey(key, true),
	          key: key,
	          value: value,
	          previous: previous = state.last,
	          next: undefined,
	          removed: false
	        };
	        if (!state.first) state.first = entry;
	        if (previous) previous.next = entry;
	        if (descriptors) state.size++;
	        else that.size++;
	        // add to index
	        if (index !== 'F') state.index[index] = entry;
	      } return that;
	    };

	    var getEntry = function (that, key) {
	      var state = getInternalState(that);
	      // fast case
	      var index = fastKey(key);
	      var entry;
	      if (index !== 'F') return state.index[index];
	      // frozen object case
	      for (entry = state.first; entry; entry = entry.next) {
	        if (entry.key === key) return entry;
	      }
	    };

	    defineBuiltIns(Prototype, {
	      // `{ Map, Set }.prototype.clear()` methods
	      // https://tc39.es/ecma262/#sec-map.prototype.clear
	      // https://tc39.es/ecma262/#sec-set.prototype.clear
	      clear: function clear() {
	        var that = this;
	        var state = getInternalState(that);
	        var entry = state.first;
	        while (entry) {
	          entry.removed = true;
	          if (entry.previous) entry.previous = entry.previous.next = undefined;
	          entry = entry.next;
	        }
	        state.first = state.last = undefined;
	        state.index = objectCreate(null);
	        if (descriptors) state.size = 0;
	        else that.size = 0;
	      },
	      // `{ Map, Set }.prototype.delete(key)` methods
	      // https://tc39.es/ecma262/#sec-map.prototype.delete
	      // https://tc39.es/ecma262/#sec-set.prototype.delete
	      'delete': function (key) {
	        var that = this;
	        var state = getInternalState(that);
	        var entry = getEntry(that, key);
	        if (entry) {
	          var next = entry.next;
	          var prev = entry.previous;
	          delete state.index[entry.index];
	          entry.removed = true;
	          if (prev) prev.next = next;
	          if (next) next.previous = prev;
	          if (state.first === entry) state.first = next;
	          if (state.last === entry) state.last = prev;
	          if (descriptors) state.size--;
	          else that.size--;
	        } return !!entry;
	      },
	      // `{ Map, Set }.prototype.forEach(callbackfn, thisArg = undefined)` methods
	      // https://tc39.es/ecma262/#sec-map.prototype.foreach
	      // https://tc39.es/ecma262/#sec-set.prototype.foreach
	      forEach: function forEach(callbackfn /* , that = undefined */) {
	        var state = getInternalState(this);
	        var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	        var entry;
	        while (entry = entry ? entry.next : state.first) {
	          boundFunction(entry.value, entry.key, this);
	          // revert to the last existing entry
	          while (entry && entry.removed) entry = entry.previous;
	        }
	      },
	      // `{ Map, Set}.prototype.has(key)` methods
	      // https://tc39.es/ecma262/#sec-map.prototype.has
	      // https://tc39.es/ecma262/#sec-set.prototype.has
	      has: function has(key) {
	        return !!getEntry(this, key);
	      }
	    });

	    defineBuiltIns(Prototype, IS_MAP ? {
	      // `Map.prototype.get(key)` method
	      // https://tc39.es/ecma262/#sec-map.prototype.get
	      get: function get(key) {
	        var entry = getEntry(this, key);
	        return entry && entry.value;
	      },
	      // `Map.prototype.set(key, value)` method
	      // https://tc39.es/ecma262/#sec-map.prototype.set
	      set: function set(key, value) {
	        return define(this, key === 0 ? 0 : key, value);
	      }
	    } : {
	      // `Set.prototype.add(value)` method
	      // https://tc39.es/ecma262/#sec-set.prototype.add
	      add: function add(value) {
	        return define(this, value = value === 0 ? 0 : value, value);
	      }
	    });
	    if (descriptors) defineBuiltInAccessor(Prototype, 'size', {
	      configurable: true,
	      get: function () {
	        return getInternalState(this).size;
	      }
	    });
	    return Constructor;
	  },
	  setStrong: function (Constructor, CONSTRUCTOR_NAME, IS_MAP) {
	    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
	    var getInternalCollectionState = internalStateGetterFor$1(CONSTRUCTOR_NAME);
	    var getInternalIteratorState = internalStateGetterFor$1(ITERATOR_NAME);
	    // `{ Map, Set }.prototype.{ keys, values, entries, @@iterator }()` methods
	    // https://tc39.es/ecma262/#sec-map.prototype.entries
	    // https://tc39.es/ecma262/#sec-map.prototype.keys
	    // https://tc39.es/ecma262/#sec-map.prototype.values
	    // https://tc39.es/ecma262/#sec-map.prototype-@@iterator
	    // https://tc39.es/ecma262/#sec-set.prototype.entries
	    // https://tc39.es/ecma262/#sec-set.prototype.keys
	    // https://tc39.es/ecma262/#sec-set.prototype.values
	    // https://tc39.es/ecma262/#sec-set.prototype-@@iterator
	    iteratorDefine(Constructor, CONSTRUCTOR_NAME, function (iterated, kind) {
	      setInternalState$i(this, {
	        type: ITERATOR_NAME,
	        target: iterated,
	        state: getInternalCollectionState(iterated),
	        kind: kind,
	        last: undefined
	      });
	    }, function () {
	      var state = getInternalIteratorState(this);
	      var kind = state.kind;
	      var entry = state.last;
	      // revert to the last existing entry
	      while (entry && entry.removed) entry = entry.previous;
	      // get next entry
	      if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
	        // or finish the iteration
	        state.target = undefined;
	        return createIterResultObject(undefined, true);
	      }
	      // return step by kind
	      if (kind === 'keys') return createIterResultObject(entry.key, false);
	      if (kind === 'values') return createIterResultObject(entry.value, false);
	      return createIterResultObject([entry.key, entry.value], false);
	    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

	    // `{ Map, Set }.prototype[@@species]` accessors
	    // https://tc39.es/ecma262/#sec-get-map-@@species
	    // https://tc39.es/ecma262/#sec-get-set-@@species
	    setSpecies(CONSTRUCTOR_NAME);
	  }
	};
	collectionStrong.getConstructor;
	collectionStrong.setStrong;

	// `Map` constructor
	// https://tc39.es/ecma262/#sec-map-objects
	collection('Map', function (init) {
	  return function Map() { return init(this, arguments.length ? arguments[0] : undefined); };
	}, collectionStrong);

	// eslint-disable-next-line es/no-map -- safe
	var MapPrototype$1 = Map.prototype;

	var mapHelpers = {
	  // eslint-disable-next-line es/no-map -- safe
	  Map: Map,
	  set: functionUncurryThis(MapPrototype$1.set),
	  get: functionUncurryThis(MapPrototype$1.get),
	  has: functionUncurryThis(MapPrototype$1.has),
	  remove: functionUncurryThis(MapPrototype$1['delete']),
	  proto: MapPrototype$1
	};

	var Map$c = mapHelpers.Map;
	var has$c = mapHelpers.has;
	var get$5 = mapHelpers.get;
	var set$9 = mapHelpers.set;
	var push$m = functionUncurryThis([].push);

	// `Map.groupBy` method
	// https://github.com/tc39/proposal-array-grouping
	_export({ target: 'Map', stat: true, forced: isPure }, {
	  groupBy: function groupBy(items, callbackfn) {
	    requireObjectCoercible(items);
	    aCallable(callbackfn);
	    var map = new Map$c();
	    var k = 0;
	    iterate(items, function (value) {
	      var key = callbackfn(value, k++);
	      if (!has$c(map, key)) set$9(map, key, [value]);
	      else push$m(get$5(map, key), value);
	    });
	    return map;
	  }
	});

	var log$7 = Math.log;

	// `Math.log1p` method implementation
	// https://tc39.es/ecma262/#sec-math.log1p
	// eslint-disable-next-line es/no-math-log1p -- safe
	var mathLog1p = Math.log1p || function log1p(x) {
	  var n = +x;
	  return n > -1e-8 && n < 1e-8 ? n - n * n / 2 : log$7(1 + n);
	};

	// eslint-disable-next-line es/no-math-acosh -- required for testing
	var $acosh = Math.acosh;
	var log$6 = Math.log;
	var sqrt$2 = Math.sqrt;
	var LN2$1 = Math.LN2;

	var FORCED$n = !$acosh
	  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
	  || Math.floor($acosh(Number.MAX_VALUE)) !== 710
	  // Tor Browser bug: Math.acosh(Infinity) -> NaN
	  || $acosh(Infinity) !== Infinity;

	// `Math.acosh` method
	// https://tc39.es/ecma262/#sec-math.acosh
	_export({ target: 'Math', stat: true, forced: FORCED$n }, {
	  acosh: function acosh(x) {
	    var n = +x;
	    return n < 1 ? NaN : n > 94906265.62425156
	      ? log$6(n) + LN2$1
	      : mathLog1p(n - 1 + sqrt$2(n - 1) * sqrt$2(n + 1));
	  }
	});

	// eslint-disable-next-line es/no-math-asinh -- required for testing
	var $asinh = Math.asinh;
	var log$5 = Math.log;
	var sqrt$1 = Math.sqrt;

	function asinh(x) {
	  var n = +x;
	  return !isFinite(n) || n === 0 ? n : n < 0 ? -asinh(-n) : log$5(n + sqrt$1(n * n + 1));
	}

	var FORCED$m = !($asinh && 1 / $asinh(0) > 0);

	// `Math.asinh` method
	// https://tc39.es/ecma262/#sec-math.asinh
	// Tor Browser bug: Math.asinh(0) -> -0
	_export({ target: 'Math', stat: true, forced: FORCED$m }, {
	  asinh: asinh
	});

	// eslint-disable-next-line es/no-math-atanh -- required for testing
	var $atanh = Math.atanh;
	var log$4 = Math.log;

	var FORCED$l = !($atanh && 1 / $atanh(-0) < 0);

	// `Math.atanh` method
	// https://tc39.es/ecma262/#sec-math.atanh
	// Tor Browser bug: Math.atanh(-0) -> 0
	_export({ target: 'Math', stat: true, forced: FORCED$l }, {
	  atanh: function atanh(x) {
	    var n = +x;
	    return n === 0 ? n : log$4((1 + n) / (1 - n)) / 2;
	  }
	});

	var abs$5 = Math.abs;
	var pow$4 = Math.pow;

	// `Math.cbrt` method
	// https://tc39.es/ecma262/#sec-math.cbrt
	_export({ target: 'Math', stat: true }, {
	  cbrt: function cbrt(x) {
	    var n = +x;
	    return mathSign(n) * pow$4(abs$5(n), 1 / 3);
	  }
	});

	var floor$7 = Math.floor;
	var log$3 = Math.log;
	var LOG2E = Math.LOG2E;

	// `Math.clz32` method
	// https://tc39.es/ecma262/#sec-math.clz32
	_export({ target: 'Math', stat: true }, {
	  clz32: function clz32(x) {
	    var n = x >>> 0;
	    return n ? 31 - floor$7(log$3(n + 0.5) * LOG2E) : 32;
	  }
	});

	// eslint-disable-next-line es/no-math-expm1 -- safe
	var $expm1 = Math.expm1;
	var exp$2 = Math.exp;

	// `Math.expm1` method implementation
	// https://tc39.es/ecma262/#sec-math.expm1
	var mathExpm1 = (!$expm1
	  // Old FF bug
	  // eslint-disable-next-line no-loss-of-precision -- required for old engines
	  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
	  // Tor Browser bug
	  || $expm1(-2e-17) !== -2e-17
	) ? function expm1(x) {
	  var n = +x;
	  return n === 0 ? n : n > -1e-6 && n < 1e-6 ? n + n * n / 2 : exp$2(n) - 1;
	} : $expm1;

	// eslint-disable-next-line es/no-math-cosh -- required for testing
	var $cosh = Math.cosh;
	var abs$4 = Math.abs;
	var E$1 = Math.E;

	var FORCED$k = !$cosh || $cosh(710) === Infinity;

	// `Math.cosh` method
	// https://tc39.es/ecma262/#sec-math.cosh
	_export({ target: 'Math', stat: true, forced: FORCED$k }, {
	  cosh: function cosh(x) {
	    var t = mathExpm1(abs$4(x) - 1) + 1;
	    return (t + 1 / (t * E$1 * E$1)) * (E$1 / 2);
	  }
	});

	// `Math.expm1` method
	// https://tc39.es/ecma262/#sec-math.expm1
	// eslint-disable-next-line es/no-math-expm1 -- required for testing
	_export({ target: 'Math', stat: true, forced: mathExpm1 !== Math.expm1 }, { expm1: mathExpm1 });

	// `Math.fround` method
	// https://tc39.es/ecma262/#sec-math.fround
	_export({ target: 'Math', stat: true }, { fround: mathFround });

	// eslint-disable-next-line es/no-math-hypot -- required for testing
	var $hypot = Math.hypot;
	var abs$3 = Math.abs;
	var sqrt = Math.sqrt;

	// Chrome 77 bug
	// https://bugs.chromium.org/p/v8/issues/detail?id=9546
	var FORCED$j = !!$hypot && $hypot(Infinity, NaN) !== Infinity;

	// `Math.hypot` method
	// https://tc39.es/ecma262/#sec-math.hypot
	_export({ target: 'Math', stat: true, arity: 2, forced: FORCED$j }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  hypot: function hypot(value1, value2) {
	    var sum = 0;
	    var i = 0;
	    var aLen = arguments.length;
	    var larg = 0;
	    var arg, div;
	    while (i < aLen) {
	      arg = abs$3(arguments[i++]);
	      if (larg < arg) {
	        div = larg / arg;
	        sum = sum * div * div + 1;
	        larg = arg;
	      } else if (arg > 0) {
	        div = arg / larg;
	        sum += div * div;
	      } else sum += arg;
	    }
	    return larg === Infinity ? Infinity : larg * sqrt(sum);
	  }
	});

	// eslint-disable-next-line es/no-math-imul -- required for testing
	var $imul = Math.imul;

	var FORCED$i = fails(function () {
	  return $imul(0xFFFFFFFF, 5) !== -5 || $imul.length !== 2;
	});

	// `Math.imul` method
	// https://tc39.es/ecma262/#sec-math.imul
	// some WebKit versions fails with big numbers, some has wrong arity
	_export({ target: 'Math', stat: true, forced: FORCED$i }, {
	  imul: function imul(x, y) {
	    var UINT16 = 0xFFFF;
	    var xn = +x;
	    var yn = +y;
	    var xl = UINT16 & xn;
	    var yl = UINT16 & yn;
	    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
	  }
	});

	var log$2 = Math.log;
	var LOG10E = Math.LOG10E;

	// eslint-disable-next-line es/no-math-log10 -- safe
	var mathLog10 = Math.log10 || function log10(x) {
	  return log$2(x) * LOG10E;
	};

	// `Math.log10` method
	// https://tc39.es/ecma262/#sec-math.log10
	_export({ target: 'Math', stat: true }, {
	  log10: mathLog10
	});

	// `Math.log1p` method
	// https://tc39.es/ecma262/#sec-math.log1p
	_export({ target: 'Math', stat: true }, { log1p: mathLog1p });

	var log$1 = Math.log;
	var LN2 = Math.LN2;

	// `Math.log2` method
	// https://tc39.es/ecma262/#sec-math.log2
	_export({ target: 'Math', stat: true }, {
	  log2: function log2(x) {
	    return log$1(x) / LN2;
	  }
	});

	// `Math.sign` method
	// https://tc39.es/ecma262/#sec-math.sign
	_export({ target: 'Math', stat: true }, {
	  sign: mathSign
	});

	var abs$2 = Math.abs;
	var exp$1 = Math.exp;
	var E = Math.E;

	var FORCED$h = fails(function () {
	  // eslint-disable-next-line es/no-math-sinh -- required for testing
	  return Math.sinh(-2e-17) !== -2e-17;
	});

	// `Math.sinh` method
	// https://tc39.es/ecma262/#sec-math.sinh
	// V8 near Chromium 38 has a problem with very small numbers
	_export({ target: 'Math', stat: true, forced: FORCED$h }, {
	  sinh: function sinh(x) {
	    var n = +x;
	    return abs$2(n) < 1 ? (mathExpm1(n) - mathExpm1(-n)) / 2 : (exp$1(n - 1) - exp$1(-n - 1)) * (E / 2);
	  }
	});

	var exp = Math.exp;

	// `Math.tanh` method
	// https://tc39.es/ecma262/#sec-math.tanh
	_export({ target: 'Math', stat: true }, {
	  tanh: function tanh(x) {
	    var n = +x;
	    var a = mathExpm1(n);
	    var b = mathExpm1(-n);
	    return a === Infinity ? 1 : b === Infinity ? -1 : (a - b) / (exp(n) + exp(-n));
	  }
	});

	// Math[@@toStringTag] property
	// https://tc39.es/ecma262/#sec-math-@@tostringtag
	setToStringTag(Math, 'Math', true);

	// `Math.trunc` method
	// https://tc39.es/ecma262/#sec-math.trunc
	_export({ target: 'Math', stat: true }, {
	  trunc: mathTrunc
	});

	// `thisNumberValue` abstract operation
	// https://tc39.es/ecma262/#sec-thisnumbervalue
	var thisNumberValue$1 = functionUncurryThis(1.0.valueOf);

	// a string of all valid unicode whitespaces
	var whitespaces$1 = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
	  '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

	var replace$a = functionUncurryThis(''.replace);
	var ltrim = RegExp('^[' + whitespaces$1 + ']+');
	var rtrim = RegExp('(^|[^' + whitespaces$1 + '])[' + whitespaces$1 + ']+$');

	// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
	var createMethod$3 = function (TYPE) {
	  return function ($this) {
	    var string = toString_1$1(requireObjectCoercible($this));
	    if (TYPE & 1) string = replace$a(string, ltrim, '');
	    if (TYPE & 2) string = replace$a(string, rtrim, '$1');
	    return string;
	  };
	};

	var stringTrim = {
	  // `String.prototype.{ trimLeft, trimStart }` methods
	  // https://tc39.es/ecma262/#sec-string.prototype.trimstart
	  start: createMethod$3(1),
	  // `String.prototype.{ trimRight, trimEnd }` methods
	  // https://tc39.es/ecma262/#sec-string.prototype.trimend
	  end: createMethod$3(2),
	  // `String.prototype.trim` method
	  // https://tc39.es/ecma262/#sec-string.prototype.trim
	  trim: createMethod$3(3)
	};

	var getOwnPropertyNames$3 = objectGetOwnPropertyNames.f;
	var getOwnPropertyDescriptor$a = objectGetOwnPropertyDescriptor.f;
	var defineProperty$a = objectDefineProperty.f;

	var trim$2 = stringTrim.trim;

	var NUMBER = 'Number';
	var NativeNumber = global_1[NUMBER];
	path[NUMBER];
	var NumberPrototype = NativeNumber.prototype;
	var TypeError$6 = global_1.TypeError;
	var stringSlice$j = functionUncurryThis(''.slice);
	var charCodeAt$7 = functionUncurryThis(''.charCodeAt);

	// `ToNumeric` abstract operation
	// https://tc39.es/ecma262/#sec-tonumeric
	var toNumeric = function (value) {
	  var primValue = toPrimitive(value, 'number');
	  return typeof primValue == 'bigint' ? primValue : toNumber(primValue);
	};

	// `ToNumber` abstract operation
	// https://tc39.es/ecma262/#sec-tonumber
	var toNumber = function (argument) {
	  var it = toPrimitive(argument, 'number');
	  var first, third, radix, maxCode, digits, length, index, code;
	  if (isSymbol$1(it)) throw new TypeError$6('Cannot convert a Symbol value to a number');
	  if (typeof it == 'string' && it.length > 2) {
	    it = trim$2(it);
	    first = charCodeAt$7(it, 0);
	    if (first === 43 || first === 45) {
	      third = charCodeAt$7(it, 2);
	      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
	    } else if (first === 48) {
	      switch (charCodeAt$7(it, 1)) {
	        // fast equal of /^0b[01]+$/i
	        case 66:
	        case 98:
	          radix = 2;
	          maxCode = 49;
	          break;
	        // fast equal of /^0o[0-7]+$/i
	        case 79:
	        case 111:
	          radix = 8;
	          maxCode = 55;
	          break;
	        default:
	          return +it;
	      }
	      digits = stringSlice$j(it, 2);
	      length = digits.length;
	      for (index = 0; index < length; index++) {
	        code = charCodeAt$7(digits, index);
	        // parseInt parses a string to a first unavailable symbol
	        // but ToNumber should return NaN if a string contains unavailable symbols
	        if (code < 48 || code > maxCode) return NaN;
	      } return parseInt(digits, radix);
	    }
	  } return +it;
	};

	var FORCED$g = isForced_1(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'));

	var calledWithNew = function (dummy) {
	  // includes check on 1..constructor(foo) case
	  return objectIsPrototypeOf(NumberPrototype, dummy) && fails(function () { thisNumberValue$1(dummy); });
	};

	// `Number` constructor
	// https://tc39.es/ecma262/#sec-number-constructor
	var NumberWrapper = function Number(value) {
	  var n = arguments.length < 1 ? 0 : NativeNumber(toNumeric(value));
	  return calledWithNew(this) ? inheritIfRequired(Object(n), this, NumberWrapper) : n;
	};

	NumberWrapper.prototype = NumberPrototype;
	if (FORCED$g && !isPure) NumberPrototype.constructor = NumberWrapper;

	_export({ global: true, constructor: true, wrap: true, forced: FORCED$g }, {
	  Number: NumberWrapper
	});

	// Use `internal/copy-constructor-properties` helper in `core-js@4`
	var copyConstructorProperties = function (target, source) {
	  for (var keys = descriptors ? getOwnPropertyNames$3(source) : (
	    // ES3:
	    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
	    // ES2015 (in case, if modules with ES2015 Number statics required before):
	    'EPSILON,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,isFinite,isInteger,isNaN,isSafeInteger,parseFloat,parseInt,' +
	    // ESNext
	    'fromString,range'
	  ).split(','), j = 0, key; keys.length > j; j++) {
	    if (hasOwnProperty_1(source, key = keys[j]) && !hasOwnProperty_1(target, key)) {
	      defineProperty$a(target, key, getOwnPropertyDescriptor$a(source, key));
	    }
	  }
	};
	if (FORCED$g || isPure) copyConstructorProperties(path[NUMBER], NativeNumber);

	// `Number.EPSILON` constant
	// https://tc39.es/ecma262/#sec-number.epsilon
	_export({ target: 'Number', stat: true, nonConfigurable: true, nonWritable: true }, {
	  EPSILON: Math.pow(2, -52)
	});

	var globalIsFinite = global_1.isFinite;

	// `Number.isFinite` method
	// https://tc39.es/ecma262/#sec-number.isfinite
	// eslint-disable-next-line es/no-number-isfinite -- safe
	var numberIsFinite = Number.isFinite || function isFinite(it) {
	  return typeof it == 'number' && globalIsFinite(it);
	};

	// `Number.isFinite` method
	// https://tc39.es/ecma262/#sec-number.isfinite
	_export({ target: 'Number', stat: true }, { isFinite: numberIsFinite });

	var floor$6 = Math.floor;

	// `IsIntegralNumber` abstract operation
	// https://tc39.es/ecma262/#sec-isintegralnumber
	// eslint-disable-next-line es/no-number-isinteger -- safe
	var isIntegralNumber = Number.isInteger || function isInteger(it) {
	  return !isObject$1(it) && isFinite(it) && floor$6(it) === it;
	};

	// `Number.isInteger` method
	// https://tc39.es/ecma262/#sec-number.isinteger
	_export({ target: 'Number', stat: true }, {
	  isInteger: isIntegralNumber
	});

	// `Number.isNaN` method
	// https://tc39.es/ecma262/#sec-number.isnan
	_export({ target: 'Number', stat: true }, {
	  isNaN: function isNaN(number) {
	    // eslint-disable-next-line no-self-compare -- NaN check
	    return number !== number;
	  }
	});

	var abs$1 = Math.abs;

	// `Number.isSafeInteger` method
	// https://tc39.es/ecma262/#sec-number.issafeinteger
	_export({ target: 'Number', stat: true }, {
	  isSafeInteger: function isSafeInteger(number) {
	    return isIntegralNumber(number) && abs$1(number) <= 0x1FFFFFFFFFFFFF;
	  }
	});

	// `Number.MAX_SAFE_INTEGER` constant
	// https://tc39.es/ecma262/#sec-number.max_safe_integer
	_export({ target: 'Number', stat: true, nonConfigurable: true, nonWritable: true }, {
	  MAX_SAFE_INTEGER: 0x1FFFFFFFFFFFFF
	});

	// `Number.MIN_SAFE_INTEGER` constant
	// https://tc39.es/ecma262/#sec-number.min_safe_integer
	_export({ target: 'Number', stat: true, nonConfigurable: true, nonWritable: true }, {
	  MIN_SAFE_INTEGER: -0x1FFFFFFFFFFFFF
	});

	var trim$1 = stringTrim.trim;


	var charAt$k = functionUncurryThis(''.charAt);
	var $parseFloat = global_1.parseFloat;
	var Symbol$6 = global_1.Symbol;
	var ITERATOR$7 = Symbol$6 && Symbol$6.iterator;
	var FORCED$f = 1 / $parseFloat(whitespaces$1 + '-0') !== -Infinity
	  // MS Edge 18- broken with boxed symbols
	  || (ITERATOR$7 && !fails(function () { $parseFloat(Object(ITERATOR$7)); }));

	// `parseFloat` method
	// https://tc39.es/ecma262/#sec-parsefloat-string
	var numberParseFloat = FORCED$f ? function parseFloat(string) {
	  var trimmedString = trim$1(toString_1$1(string));
	  var result = $parseFloat(trimmedString);
	  return result === 0 && charAt$k(trimmedString, 0) === '-' ? -0 : result;
	} : $parseFloat;

	// `Number.parseFloat` method
	// https://tc39.es/ecma262/#sec-number.parseFloat
	// eslint-disable-next-line es/no-number-parsefloat -- required for testing
	_export({ target: 'Number', stat: true, forced: Number.parseFloat !== numberParseFloat }, {
	  parseFloat: numberParseFloat
	});

	var trim = stringTrim.trim;


	var $parseInt$2 = global_1.parseInt;
	var Symbol$5 = global_1.Symbol;
	var ITERATOR$6 = Symbol$5 && Symbol$5.iterator;
	var hex = /^[+-]?0x/i;
	var exec$d = functionUncurryThis(hex.exec);
	var FORCED$e = $parseInt$2(whitespaces$1 + '08') !== 8 || $parseInt$2(whitespaces$1 + '0x16') !== 22
	  // MS Edge 18- broken with boxed symbols
	  || (ITERATOR$6 && !fails(function () { $parseInt$2(Object(ITERATOR$6)); }));

	// `parseInt` method
	// https://tc39.es/ecma262/#sec-parseint-string-radix
	var numberParseInt = FORCED$e ? function parseInt(string, radix) {
	  var S = trim(toString_1$1(string));
	  return $parseInt$2(S, (radix >>> 0) || (exec$d(hex, S) ? 16 : 10));
	} : $parseInt$2;

	// `Number.parseInt` method
	// https://tc39.es/ecma262/#sec-number.parseint
	// eslint-disable-next-line es/no-number-parseint -- required for testing
	_export({ target: 'Number', stat: true, forced: Number.parseInt !== numberParseInt }, {
	  parseInt: numberParseInt
	});

	var $RangeError$9 = RangeError;
	var $String$3 = String;
	var $isFinite = isFinite;
	var abs = Math.abs;
	var floor$5 = Math.floor;
	var pow$3 = Math.pow;
	var round$1 = Math.round;
	var nativeToExponential = functionUncurryThis(1.0.toExponential);
	var repeat$1 = functionUncurryThis(stringRepeat);
	var stringSlice$i = functionUncurryThis(''.slice);

	// Edge 17-
	var ROUNDS_PROPERLY = nativeToExponential(-6.9e-11, 4) === '-6.9000e-11'
	  // IE11- && Edge 14-
	  && nativeToExponential(1.255, 2) === '1.25e+0'
	  // FF86-, V8 ~ Chrome 49-50
	  && nativeToExponential(12345, 3) === '1.235e+4'
	  // FF86-, V8 ~ Chrome 49-50
	  && nativeToExponential(25, 0) === '3e+1';

	// IE8-
	var throwsOnInfinityFraction = function () {
	  return fails(function () {
	    nativeToExponential(1, Infinity);
	  }) && fails(function () {
	    nativeToExponential(1, -Infinity);
	  });
	};

	// Safari <11 && FF <50
	var properNonFiniteThisCheck = function () {
	  return !fails(function () {
	    nativeToExponential(Infinity, Infinity);
	    nativeToExponential(NaN, Infinity);
	  });
	};

	var FORCED$d = !ROUNDS_PROPERLY || !throwsOnInfinityFraction() || !properNonFiniteThisCheck();

	// `Number.prototype.toExponential` method
	// https://tc39.es/ecma262/#sec-number.prototype.toexponential
	_export({ target: 'Number', proto: true, forced: FORCED$d }, {
	  toExponential: function toExponential(fractionDigits) {
	    var x = thisNumberValue$1(this);
	    if (fractionDigits === undefined) return nativeToExponential(x);
	    var f = toIntegerOrInfinity(fractionDigits);
	    if (!$isFinite(x)) return String(x);
	    // TODO: ES2018 increased the maximum number of fraction digits to 100, need to improve the implementation
	    if (f < 0 || f > 20) throw new $RangeError$9('Incorrect fraction digits');
	    if (ROUNDS_PROPERLY) return nativeToExponential(x, f);
	    var s = '';
	    var m = '';
	    var e = 0;
	    var c = '';
	    var d = '';
	    if (x < 0) {
	      s = '-';
	      x = -x;
	    }
	    if (x === 0) {
	      e = 0;
	      m = repeat$1('0', f + 1);
	    } else {
	      // this block is based on https://gist.github.com/SheetJSDev/1100ad56b9f856c95299ed0e068eea08
	      // TODO: improve accuracy with big fraction digits
	      var l = mathLog10(x);
	      e = floor$5(l);
	      var n = 0;
	      var w = pow$3(10, e - f);
	      n = round$1(x / w);
	      if (2 * x >= (2 * n + 1) * w) {
	        n += 1;
	      }
	      if (n >= pow$3(10, f + 1)) {
	        n /= 10;
	        e += 1;
	      }
	      m = $String$3(n);
	    }
	    if (f !== 0) {
	      m = stringSlice$i(m, 0, 1) + '.' + stringSlice$i(m, 1);
	    }
	    if (e === 0) {
	      c = '+';
	      d = '0';
	    } else {
	      c = e > 0 ? '+' : '-';
	      d = $String$3(abs(e));
	    }
	    m += 'e' + c + d;
	    return s + m;
	  }
	});

	var $RangeError$8 = RangeError;
	var $String$2 = String;
	var floor$4 = Math.floor;
	var repeat = functionUncurryThis(stringRepeat);
	var stringSlice$h = functionUncurryThis(''.slice);
	var nativeToFixed = functionUncurryThis(1.0.toFixed);

	var pow$2 = function (x, n, acc) {
	  return n === 0 ? acc : n % 2 === 1 ? pow$2(x, n - 1, acc * x) : pow$2(x * x, n / 2, acc);
	};

	var log = function (x) {
	  var n = 0;
	  var x2 = x;
	  while (x2 >= 4096) {
	    n += 12;
	    x2 /= 4096;
	  }
	  while (x2 >= 2) {
	    n += 1;
	    x2 /= 2;
	  } return n;
	};

	var multiply = function (data, n, c) {
	  var index = -1;
	  var c2 = c;
	  while (++index < 6) {
	    c2 += n * data[index];
	    data[index] = c2 % 1e7;
	    c2 = floor$4(c2 / 1e7);
	  }
	};

	var divide = function (data, n) {
	  var index = 6;
	  var c = 0;
	  while (--index >= 0) {
	    c += data[index];
	    data[index] = floor$4(c / n);
	    c = (c % n) * 1e7;
	  }
	};

	var dataToString = function (data) {
	  var index = 6;
	  var s = '';
	  while (--index >= 0) {
	    if (s !== '' || index === 0 || data[index] !== 0) {
	      var t = $String$2(data[index]);
	      s = s === '' ? t : s + repeat('0', 7 - t.length) + t;
	    }
	  } return s;
	};

	var FORCED$c = fails(function () {
	  return nativeToFixed(0.00008, 3) !== '0.000' ||
	    nativeToFixed(0.9, 0) !== '1' ||
	    nativeToFixed(1.255, 2) !== '1.25' ||
	    nativeToFixed(1000000000000000128.0, 0) !== '1000000000000000128';
	}) || !fails(function () {
	  // V8 ~ Android 4.3-
	  nativeToFixed({});
	});

	// `Number.prototype.toFixed` method
	// https://tc39.es/ecma262/#sec-number.prototype.tofixed
	_export({ target: 'Number', proto: true, forced: FORCED$c }, {
	  toFixed: function toFixed(fractionDigits) {
	    var number = thisNumberValue$1(this);
	    var fractDigits = toIntegerOrInfinity(fractionDigits);
	    var data = [0, 0, 0, 0, 0, 0];
	    var sign = '';
	    var result = '0';
	    var e, z, j, k;

	    // TODO: ES2018 increased the maximum number of fraction digits to 100, need to improve the implementation
	    if (fractDigits < 0 || fractDigits > 20) throw new $RangeError$8('Incorrect fraction digits');
	    // eslint-disable-next-line no-self-compare -- NaN check
	    if (number !== number) return 'NaN';
	    if (number <= -1e21 || number >= 1e21) return $String$2(number);
	    if (number < 0) {
	      sign = '-';
	      number = -number;
	    }
	    if (number > 1e-21) {
	      e = log(number * pow$2(2, 69, 1)) - 69;
	      z = e < 0 ? number * pow$2(2, -e, 1) : number / pow$2(2, e, 1);
	      z *= 0x10000000000000;
	      e = 52 - e;
	      if (e > 0) {
	        multiply(data, 0, z);
	        j = fractDigits;
	        while (j >= 7) {
	          multiply(data, 1e7, 0);
	          j -= 7;
	        }
	        multiply(data, pow$2(10, j, 1), 0);
	        j = e - 1;
	        while (j >= 23) {
	          divide(data, 1 << 23);
	          j -= 23;
	        }
	        divide(data, 1 << j);
	        multiply(data, 1, 1);
	        divide(data, 2);
	        result = dataToString(data);
	      } else {
	        multiply(data, 0, z);
	        multiply(data, 1 << -e, 0);
	        result = dataToString(data) + repeat('0', fractDigits);
	      }
	    }
	    if (fractDigits > 0) {
	      k = result.length;
	      result = sign + (k <= fractDigits
	        ? '0.' + repeat('0', fractDigits - k) + result
	        : stringSlice$h(result, 0, k - fractDigits) + '.' + stringSlice$h(result, k - fractDigits));
	    } else {
	      result = sign + result;
	    } return result;
	  }
	});

	var nativeToPrecision = functionUncurryThis(1.0.toPrecision);

	var FORCED$b = fails(function () {
	  // IE7-
	  return nativeToPrecision(1, undefined) !== '1';
	}) || !fails(function () {
	  // V8 ~ Android 4.3-
	  nativeToPrecision({});
	});

	// `Number.prototype.toPrecision` method
	// https://tc39.es/ecma262/#sec-number.prototype.toprecision
	_export({ target: 'Number', proto: true, forced: FORCED$b }, {
	  toPrecision: function toPrecision(precision) {
	    return precision === undefined
	      ? nativeToPrecision(thisNumberValue$1(this))
	      : nativeToPrecision(thisNumberValue$1(this), precision);
	  }
	});

	// eslint-disable-next-line es/no-object-assign -- safe
	var $assign = Object.assign;
	// eslint-disable-next-line es/no-object-defineproperty -- required for testing
	var defineProperty$9 = Object.defineProperty;
	var concat$2 = functionUncurryThis([].concat);

	// `Object.assign` method
	// https://tc39.es/ecma262/#sec-object.assign
	var objectAssign = !$assign || fails(function () {
	  // should have correct order of operations (Edge bug)
	  if (descriptors && $assign({ b: 1 }, $assign(defineProperty$9({}, 'a', {
	    enumerable: true,
	    get: function () {
	      defineProperty$9(this, 'b', {
	        value: 3,
	        enumerable: false
	      });
	    }
	  }), { b: 2 })).b !== 1) return true;
	  // should work with symbols and should have deterministic property order (V8 bug)
	  var A = {};
	  var B = {};
	  // eslint-disable-next-line es/no-symbol -- safe
	  var symbol = Symbol('assign detection');
	  var alphabet = 'abcdefghijklmnopqrst';
	  A[symbol] = 7;
	  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
	  return $assign({}, A)[symbol] !== 7 || objectKeys$1($assign({}, B)).join('') !== alphabet;
	}) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
	  var T = toObject(target);
	  var argumentsLength = arguments.length;
	  var index = 1;
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  var propertyIsEnumerable = objectPropertyIsEnumerable.f;
	  while (argumentsLength > index) {
	    var S = indexedObject(arguments[index++]);
	    var keys = getOwnPropertySymbols ? concat$2(objectKeys$1(S), getOwnPropertySymbols(S)) : objectKeys$1(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) {
	      key = keys[j++];
	      if (!descriptors || functionCall(propertyIsEnumerable, S, key)) T[key] = S[key];
	    }
	  } return T;
	} : $assign;

	// `Object.assign` method
	// https://tc39.es/ecma262/#sec-object.assign
	// eslint-disable-next-line es/no-object-assign -- required for testing
	_export({ target: 'Object', stat: true, arity: 2, forced: Object.assign !== objectAssign }, {
	  assign: objectAssign
	});

	// TODO: Remove from `core-js@4`




	// `Object.create` method
	// https://tc39.es/ecma262/#sec-object.create
	_export({ target: 'Object', stat: true, sham: !descriptors }, {
	  create: objectCreate
	});

	// Forced replacement object prototype accessors methods
	var objectPrototypeAccessorsForced = !fails(function () {
	  // This feature detection crashes old WebKit
	  // https://github.com/zloirock/core-js/issues/232
	  if (engineWebkitVersion && engineWebkitVersion < 535) return;
	  var key = Math.random();
	  // In FF throws only define methods
	  // eslint-disable-next-line no-undef, no-useless-call, es/no-legacy-object-prototype-accessor-methods -- required for testing
	  __defineSetter__.call(null, key, function () { /* empty */ });
	  delete global_1[key];
	});

	// `Object.prototype.__defineGetter__` method
	// https://tc39.es/ecma262/#sec-object.prototype.__defineGetter__
	if (descriptors) {
	  _export({ target: 'Object', proto: true, forced: objectPrototypeAccessorsForced }, {
	    __defineGetter__: function __defineGetter__(P, getter) {
	      objectDefineProperty.f(toObject(this), P, { get: aCallable(getter), enumerable: true, configurable: true });
	    }
	  });
	}

	var defineProperties = objectDefineProperties.f;

	// `Object.defineProperties` method
	// https://tc39.es/ecma262/#sec-object.defineproperties
	// eslint-disable-next-line es/no-object-defineproperties -- safe
	_export({ target: 'Object', stat: true, forced: Object.defineProperties !== defineProperties, sham: !descriptors }, {
	  defineProperties: defineProperties
	});

	var defineProperty$8 = objectDefineProperty.f;

	// `Object.defineProperty` method
	// https://tc39.es/ecma262/#sec-object.defineproperty
	// eslint-disable-next-line es/no-object-defineproperty -- safe
	_export({ target: 'Object', stat: true, forced: Object.defineProperty !== defineProperty$8, sham: !descriptors }, {
	  defineProperty: defineProperty$8
	});

	// `Object.prototype.__defineSetter__` method
	// https://tc39.es/ecma262/#sec-object.prototype.__defineSetter__
	if (descriptors) {
	  _export({ target: 'Object', proto: true, forced: objectPrototypeAccessorsForced }, {
	    __defineSetter__: function __defineSetter__(P, setter) {
	      objectDefineProperty.f(toObject(this), P, { set: aCallable(setter), enumerable: true, configurable: true });
	    }
	  });
	}

	var $propertyIsEnumerable = objectPropertyIsEnumerable.f;

	var propertyIsEnumerable$2 = functionUncurryThis($propertyIsEnumerable);
	var push$l = functionUncurryThis([].push);

	// in some IE versions, `propertyIsEnumerable` returns incorrect result on integer keys
	// of `null` prototype objects
	var IE_BUG = descriptors && fails(function () {
	  // eslint-disable-next-line es/no-object-create -- safe
	  var O = Object.create(null);
	  O[2] = 2;
	  return !propertyIsEnumerable$2(O, 2);
	});

	// `Object.{ entries, values }` methods implementation
	var createMethod$2 = function (TO_ENTRIES) {
	  return function (it) {
	    var O = toIndexedObject(it);
	    var keys = objectKeys$1(O);
	    var IE_WORKAROUND = IE_BUG && objectGetPrototypeOf(O) === null;
	    var length = keys.length;
	    var i = 0;
	    var result = [];
	    var key;
	    while (length > i) {
	      key = keys[i++];
	      if (!descriptors || (IE_WORKAROUND ? key in O : propertyIsEnumerable$2(O, key))) {
	        push$l(result, TO_ENTRIES ? [key, O[key]] : O[key]);
	      }
	    }
	    return result;
	  };
	};

	var objectToArray = {
	  // `Object.entries` method
	  // https://tc39.es/ecma262/#sec-object.entries
	  entries: createMethod$2(true),
	  // `Object.values` method
	  // https://tc39.es/ecma262/#sec-object.values
	  values: createMethod$2(false)
	};

	var $entries = objectToArray.entries;

	// `Object.entries` method
	// https://tc39.es/ecma262/#sec-object.entries
	_export({ target: 'Object', stat: true }, {
	  entries: function entries(O) {
	    return $entries(O);
	  }
	});

	var onFreeze$2 = internalMetadata.onFreeze;

	// eslint-disable-next-line es/no-object-freeze -- safe
	var $freeze = Object.freeze;
	var FAILS_ON_PRIMITIVES$5 = fails(function () { $freeze(1); });

	// `Object.freeze` method
	// https://tc39.es/ecma262/#sec-object.freeze
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$5, sham: !freezing }, {
	  freeze: function freeze(it) {
	    return $freeze && isObject$1(it) ? $freeze(onFreeze$2(it)) : it;
	  }
	});

	// `Object.fromEntries` method
	// https://github.com/tc39/proposal-object-from-entries
	_export({ target: 'Object', stat: true }, {
	  fromEntries: function fromEntries(iterable) {
	    var obj = {};
	    iterate(iterable, function (k, v) {
	      createProperty(obj, k, v);
	    }, { AS_ENTRIES: true });
	    return obj;
	  }
	});

	var nativeGetOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;


	var FORCED$a = !descriptors || fails(function () { nativeGetOwnPropertyDescriptor(1); });

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
	_export({ target: 'Object', stat: true, forced: FORCED$a, sham: !descriptors }, {
	  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
	    return nativeGetOwnPropertyDescriptor(toIndexedObject(it), key);
	  }
	});

	// `Object.getOwnPropertyDescriptors` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
	_export({ target: 'Object', stat: true, sham: !descriptors }, {
	  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
	    var O = toIndexedObject(object);
	    var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	    var keys = ownKeys(O);
	    var result = {};
	    var index = 0;
	    var key, descriptor;
	    while (keys.length > index) {
	      descriptor = getOwnPropertyDescriptor(O, key = keys[index++]);
	      if (descriptor !== undefined) createProperty(result, key, descriptor);
	    }
	    return result;
	  }
	});

	var getOwnPropertyNames$2 = objectGetOwnPropertyNamesExternal.f;

	// eslint-disable-next-line es/no-object-getownpropertynames -- required for testing
	var FAILS_ON_PRIMITIVES$4 = fails(function () { return !Object.getOwnPropertyNames(1); });

	// `Object.getOwnPropertyNames` method
	// https://tc39.es/ecma262/#sec-object.getownpropertynames
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$4 }, {
	  getOwnPropertyNames: getOwnPropertyNames$2
	});

	var FAILS_ON_PRIMITIVES$3 = fails(function () { objectGetPrototypeOf(1); });

	// `Object.getPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.getprototypeof
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$3, sham: !correctPrototypeGetter }, {
	  getPrototypeOf: function getPrototypeOf(it) {
	    return objectGetPrototypeOf(toObject(it));
	  }
	});

	var create$1 = getBuiltIn('Object', 'create');
	var push$k = functionUncurryThis([].push);

	// `Object.groupBy` method
	// https://github.com/tc39/proposal-array-grouping
	_export({ target: 'Object', stat: true }, {
	  groupBy: function groupBy(items, callbackfn) {
	    requireObjectCoercible(items);
	    aCallable(callbackfn);
	    var obj = create$1(null);
	    var k = 0;
	    iterate(items, function (value) {
	      var key = toPropertyKey(callbackfn(value, k++));
	      // in some IE versions, `hasOwnProperty` returns incorrect result on integer keys
	      // but since it's a `null` prototype object, we can safely use `in`
	      if (key in obj) push$k(obj[key], value);
	      else obj[key] = [value];
	    });
	    return obj;
	  }
	});

	// `Object.hasOwn` method
	// https://tc39.es/ecma262/#sec-object.hasown
	_export({ target: 'Object', stat: true }, {
	  hasOwn: hasOwnProperty_1
	});

	// `SameValue` abstract operation
	// https://tc39.es/ecma262/#sec-samevalue
	// eslint-disable-next-line es/no-object-is -- safe
	var sameValue = Object.is || function is(x, y) {
	  // eslint-disable-next-line no-self-compare -- NaN check
	  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
	};

	// `Object.is` method
	// https://tc39.es/ecma262/#sec-object.is
	_export({ target: 'Object', stat: true }, {
	  is: sameValue
	});

	// `Object.isExtensible` method
	// https://tc39.es/ecma262/#sec-object.isextensible
	// eslint-disable-next-line es/no-object-isextensible -- safe
	_export({ target: 'Object', stat: true, forced: Object.isExtensible !== objectIsExtensible }, {
	  isExtensible: objectIsExtensible
	});

	// eslint-disable-next-line es/no-object-isfrozen -- safe
	var $isFrozen = Object.isFrozen;

	var FORCED$9 = arrayBufferNonExtensible || fails(function () { $isFrozen(1); });

	// `Object.isFrozen` method
	// https://tc39.es/ecma262/#sec-object.isfrozen
	_export({ target: 'Object', stat: true, forced: FORCED$9 }, {
	  isFrozen: function isFrozen(it) {
	    if (!isObject$1(it)) return true;
	    if (arrayBufferNonExtensible && classofRaw(it) === 'ArrayBuffer') return true;
	    return $isFrozen ? $isFrozen(it) : false;
	  }
	});

	// eslint-disable-next-line es/no-object-issealed -- safe
	var $isSealed = Object.isSealed;

	var FORCED$8 = arrayBufferNonExtensible || fails(function () { $isSealed(1); });

	// `Object.isSealed` method
	// https://tc39.es/ecma262/#sec-object.issealed
	_export({ target: 'Object', stat: true, forced: FORCED$8 }, {
	  isSealed: function isSealed(it) {
	    if (!isObject$1(it)) return true;
	    if (arrayBufferNonExtensible && classofRaw(it) === 'ArrayBuffer') return true;
	    return $isSealed ? $isSealed(it) : false;
	  }
	});

	var FAILS_ON_PRIMITIVES$2 = fails(function () { objectKeys$1(1); });

	// `Object.keys` method
	// https://tc39.es/ecma262/#sec-object.keys
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$2 }, {
	  keys: function keys(it) {
	    return objectKeys$1(toObject(it));
	  }
	});

	var getOwnPropertyDescriptor$9 = objectGetOwnPropertyDescriptor.f;

	// `Object.prototype.__lookupGetter__` method
	// https://tc39.es/ecma262/#sec-object.prototype.__lookupGetter__
	if (descriptors) {
	  _export({ target: 'Object', proto: true, forced: objectPrototypeAccessorsForced }, {
	    __lookupGetter__: function __lookupGetter__(P) {
	      var O = toObject(this);
	      var key = toPropertyKey(P);
	      var desc;
	      do {
	        if (desc = getOwnPropertyDescriptor$9(O, key)) return desc.get;
	      } while (O = objectGetPrototypeOf(O));
	    }
	  });
	}

	var getOwnPropertyDescriptor$8 = objectGetOwnPropertyDescriptor.f;

	// `Object.prototype.__lookupSetter__` method
	// https://tc39.es/ecma262/#sec-object.prototype.__lookupSetter__
	if (descriptors) {
	  _export({ target: 'Object', proto: true, forced: objectPrototypeAccessorsForced }, {
	    __lookupSetter__: function __lookupSetter__(P) {
	      var O = toObject(this);
	      var key = toPropertyKey(P);
	      var desc;
	      do {
	        if (desc = getOwnPropertyDescriptor$8(O, key)) return desc.set;
	      } while (O = objectGetPrototypeOf(O));
	    }
	  });
	}

	var onFreeze$1 = internalMetadata.onFreeze;



	// eslint-disable-next-line es/no-object-preventextensions -- safe
	var $preventExtensions = Object.preventExtensions;
	var FAILS_ON_PRIMITIVES$1 = fails(function () { $preventExtensions(1); });

	// `Object.preventExtensions` method
	// https://tc39.es/ecma262/#sec-object.preventextensions
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$1, sham: !freezing }, {
	  preventExtensions: function preventExtensions(it) {
	    return $preventExtensions && isObject$1(it) ? $preventExtensions(onFreeze$1(it)) : it;
	  }
	});

	// eslint-disable-next-line es/no-object-getprototypeof -- safe
	var getPrototypeOf = Object.getPrototypeOf;
	// eslint-disable-next-line es/no-object-setprototypeof -- safe
	var setPrototypeOf = Object.setPrototypeOf;
	var ObjectPrototype$1 = Object.prototype;
	var PROTO = '__proto__';

	// `Object.prototype.__proto__` accessor
	// https://tc39.es/ecma262/#sec-object.prototype.__proto__
	if (descriptors && getPrototypeOf && setPrototypeOf && !(PROTO in ObjectPrototype$1)) try {
	  defineBuiltInAccessor(ObjectPrototype$1, PROTO, {
	    configurable: true,
	    get: function __proto__() {
	      return getPrototypeOf(toObject(this));
	    },
	    set: function __proto__(proto) {
	      var O = requireObjectCoercible(this);
	      if (isPossiblePrototype(proto) && isObject$1(O)) {
	        setPrototypeOf(O, proto);
	      }
	    }
	  });
	} catch (error) { /* empty */ }

	var onFreeze = internalMetadata.onFreeze;



	// eslint-disable-next-line es/no-object-seal -- safe
	var $seal = Object.seal;
	var FAILS_ON_PRIMITIVES = fails(function () { $seal(1); });

	// `Object.seal` method
	// https://tc39.es/ecma262/#sec-object.seal
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !freezing }, {
	  seal: function seal(it) {
	    return $seal && isObject$1(it) ? $seal(onFreeze(it)) : it;
	  }
	});

	// `Object.setPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.setprototypeof
	_export({ target: 'Object', stat: true }, {
	  setPrototypeOf: objectSetPrototypeOf
	});

	// `Object.prototype.toString` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.tostring
	var objectToString$1 = toStringTagSupport ? {}.toString : function toString() {
	  return '[object ' + classof(this) + ']';
	};

	// `Object.prototype.toString` method
	// https://tc39.es/ecma262/#sec-object.prototype.tostring
	if (!toStringTagSupport) {
	  defineBuiltIn(Object.prototype, 'toString', objectToString$1, { unsafe: true });
	}

	var $values = objectToArray.values;

	// `Object.values` method
	// https://tc39.es/ecma262/#sec-object.values
	_export({ target: 'Object', stat: true }, {
	  values: function values(O) {
	    return $values(O);
	  }
	});

	// `parseFloat` method
	// https://tc39.es/ecma262/#sec-parsefloat-string
	_export({ global: true, forced: parseFloat !== numberParseFloat }, {
	  parseFloat: numberParseFloat
	});

	// `parseInt` method
	// https://tc39.es/ecma262/#sec-parseint-string-radix
	_export({ global: true, forced: parseInt !== numberParseInt }, {
	  parseInt: numberParseInt
	});

	var $TypeError$v = TypeError;

	var validateArgumentsLength = function (passed, required) {
	  if (passed < required) throw new $TypeError$v('Not enough arguments');
	  return passed;
	};

	// eslint-disable-next-line redos/no-vulnerable -- safe
	var engineIsIos = /(?:ipad|iphone|ipod).*applewebkit/i.test(engineUserAgent);

	var set$8 = global_1.setImmediate;
	var clear = global_1.clearImmediate;
	var process$2 = global_1.process;
	var Dispatch = global_1.Dispatch;
	var Function$2 = global_1.Function;
	var MessageChannel = global_1.MessageChannel;
	var String$1 = global_1.String;
	var counter = 0;
	var queue$2 = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var $location, defer, channel$1, port;

	fails(function () {
	  // Deno throws a ReferenceError on `location` access without `--location` flag
	  $location = global_1.location;
	});

	var run = function (id) {
	  if (hasOwnProperty_1(queue$2, id)) {
	    var fn = queue$2[id];
	    delete queue$2[id];
	    fn();
	  }
	};

	var runner = function (id) {
	  return function () {
	    run(id);
	  };
	};

	var eventListener = function (event) {
	  run(event.data);
	};

	var globalPostMessageDefer = function (id) {
	  // old engines have not location.origin
	  global_1.postMessage(String$1(id), $location.protocol + '//' + $location.host);
	};

	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if (!set$8 || !clear) {
	  set$8 = function setImmediate(handler) {
	    validateArgumentsLength(arguments.length, 1);
	    var fn = isCallable(handler) ? handler : Function$2(handler);
	    var args = arraySlice(arguments, 1);
	    queue$2[++counter] = function () {
	      functionApply(fn, undefined, args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clear = function clearImmediate(id) {
	    delete queue$2[id];
	  };
	  // Node.js 0.8-
	  if (engineIsNode) {
	    defer = function (id) {
	      process$2.nextTick(runner(id));
	    };
	  // Sphere (JS game engine) Dispatch API
	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(runner(id));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  // except iOS - https://github.com/zloirock/core-js/issues/624
	  } else if (MessageChannel && !engineIsIos) {
	    channel$1 = new MessageChannel();
	    port = channel$1.port2;
	    channel$1.port1.onmessage = eventListener;
	    defer = functionBindContext(port.postMessage, port);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (
	    global_1.addEventListener &&
	    isCallable(global_1.postMessage) &&
	    !global_1.importScripts &&
	    $location && $location.protocol !== 'file:' &&
	    !fails(globalPostMessageDefer)
	  ) {
	    defer = globalPostMessageDefer;
	    global_1.addEventListener('message', eventListener, false);
	  // IE8-
	  } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
	    defer = function (id) {
	      html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
	        html.removeChild(this);
	        run(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function (id) {
	      setTimeout(runner(id), 0);
	    };
	  }
	}

	var task$1 = {
	  set: set$8,
	  clear: clear
	};

	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getOwnPropertyDescriptor$7 = Object.getOwnPropertyDescriptor;

	// Avoid NodeJS experimental warning
	var safeGetBuiltIn = function (name) {
	  if (!descriptors) return global_1[name];
	  var descriptor = getOwnPropertyDescriptor$7(global_1, name);
	  return descriptor && descriptor.value;
	};

	var Queue = function () {
	  this.head = null;
	  this.tail = null;
	};

	Queue.prototype = {
	  add: function (item) {
	    var entry = { item: item, next: null };
	    var tail = this.tail;
	    if (tail) tail.next = entry;
	    else this.head = entry;
	    this.tail = entry;
	  },
	  get: function () {
	    var entry = this.head;
	    if (entry) {
	      var next = this.head = entry.next;
	      if (next === null) this.tail = null;
	      return entry.item;
	    }
	  }
	};

	var queue$1 = Queue;

	var engineIsIosPebble = /ipad|iphone|ipod/i.test(engineUserAgent) && typeof Pebble != 'undefined';

	var engineIsWebosWebkit = /web0s(?!.*chrome)/i.test(engineUserAgent);

	var macrotask = task$1.set;






	var MutationObserver = global_1.MutationObserver || global_1.WebKitMutationObserver;
	var document$2 = global_1.document;
	var process$1 = global_1.process;
	var Promise$7 = global_1.Promise;
	var microtask = safeGetBuiltIn('queueMicrotask');
	var notify$1, toggle, node, promise, then;

	// modern engines have queueMicrotask method
	if (!microtask) {
	  var queue = new queue$1();

	  var flush = function () {
	    var parent, fn;
	    if (engineIsNode && (parent = process$1.domain)) parent.exit();
	    while (fn = queue.get()) try {
	      fn();
	    } catch (error) {
	      if (queue.head) notify$1();
	      throw error;
	    }
	    if (parent) parent.enter();
	  };

	  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
	  // also except WebOS Webkit https://github.com/zloirock/core-js/issues/898
	  if (!engineIsIos && !engineIsNode && !engineIsWebosWebkit && MutationObserver && document$2) {
	    toggle = true;
	    node = document$2.createTextNode('');
	    new MutationObserver(flush).observe(node, { characterData: true });
	    notify$1 = function () {
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if (!engineIsIosPebble && Promise$7 && Promise$7.resolve) {
	    // Promise.resolve without an argument throws an error in LG WebOS 2
	    promise = Promise$7.resolve(undefined);
	    // workaround of WebKit ~ iOS Safari 10.1 bug
	    promise.constructor = Promise$7;
	    then = functionBindContext(promise.then, promise);
	    notify$1 = function () {
	      then(flush);
	    };
	  // Node.js without promises
	  } else if (engineIsNode) {
	    notify$1 = function () {
	      process$1.nextTick(flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessage
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    // `webpack` dev server bug on IE global methods - use bind(fn, global)
	    macrotask = functionBindContext(macrotask, global_1);
	    notify$1 = function () {
	      macrotask(flush);
	    };
	  }

	  microtask = function (fn) {
	    if (!queue.head) notify$1();
	    queue.add(fn);
	  };
	}

	var microtask_1 = microtask;

	var hostReportErrors = function (a, b) {
	  try {
	    // eslint-disable-next-line no-console -- safe
	    arguments.length === 1 ? console.error(a) : console.error(a, b);
	  } catch (error) { /* empty */ }
	};

	var perform = function (exec) {
	  try {
	    return { error: false, value: exec() };
	  } catch (error) {
	    return { error: true, value: error };
	  }
	};

	var promiseNativeConstructor = global_1.Promise;

	/* global Deno -- Deno case */
	var engineIsDeno = typeof Deno == 'object' && Deno && typeof Deno.version == 'object';

	var engineIsBrowser = !engineIsDeno && !engineIsNode
	  && typeof window == 'object'
	  && typeof document == 'object';

	promiseNativeConstructor && promiseNativeConstructor.prototype;
	var SPECIES$1 = wellKnownSymbol('species');
	var SUBCLASSING = false;
	var NATIVE_PROMISE_REJECTION_EVENT$1 = isCallable(global_1.PromiseRejectionEvent);

	var FORCED_PROMISE_CONSTRUCTOR$5 = isForced_1('Promise', function () {
	  var PROMISE_CONSTRUCTOR_SOURCE = inspectSource(promiseNativeConstructor);
	  var GLOBAL_CORE_JS_PROMISE = PROMISE_CONSTRUCTOR_SOURCE !== String(promiseNativeConstructor);
	  // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
	  // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
	  // We can't detect it synchronously, so just check versions
	  if (!GLOBAL_CORE_JS_PROMISE && engineV8Version === 66) return true;
	  // We can't use @@species feature detection in V8 since it causes
	  // deoptimization and performance degradation
	  // https://github.com/zloirock/core-js/issues/679
	  if (!engineV8Version || engineV8Version < 51 || !/native code/.test(PROMISE_CONSTRUCTOR_SOURCE)) {
	    // Detect correctness of subclassing with @@species support
	    var promise = new promiseNativeConstructor(function (resolve) { resolve(1); });
	    var FakePromise = function (exec) {
	      exec(function () { /* empty */ }, function () { /* empty */ });
	    };
	    var constructor = promise.constructor = {};
	    constructor[SPECIES$1] = FakePromise;
	    SUBCLASSING = promise.then(function () { /* empty */ }) instanceof FakePromise;
	    if (!SUBCLASSING) return true;
	  // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	  } return !GLOBAL_CORE_JS_PROMISE && (engineIsBrowser || engineIsDeno) && !NATIVE_PROMISE_REJECTION_EVENT$1;
	});

	var promiseConstructorDetection = {
	  CONSTRUCTOR: FORCED_PROMISE_CONSTRUCTOR$5,
	  REJECTION_EVENT: NATIVE_PROMISE_REJECTION_EVENT$1,
	  SUBCLASSING: SUBCLASSING
	};

	var $TypeError$u = TypeError;

	var PromiseCapability = function (C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw new $TypeError$u('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = aCallable(resolve);
	  this.reject = aCallable(reject);
	};

	// `NewPromiseCapability` abstract operation
	// https://tc39.es/ecma262/#sec-newpromisecapability
	var f = function (C) {
	  return new PromiseCapability(C);
	};

	var newPromiseCapability$1 = {
		f: f
	};

	var task = task$1.set;









	var PROMISE = 'Promise';
	var FORCED_PROMISE_CONSTRUCTOR$4 = promiseConstructorDetection.CONSTRUCTOR;
	var NATIVE_PROMISE_REJECTION_EVENT = promiseConstructorDetection.REJECTION_EVENT;
	var NATIVE_PROMISE_SUBCLASSING = promiseConstructorDetection.SUBCLASSING;
	var getInternalPromiseState = internalState.getterFor(PROMISE);
	var setInternalState$h = internalState.set;
	var NativePromisePrototype$2 = promiseNativeConstructor && promiseNativeConstructor.prototype;
	var PromiseConstructor = promiseNativeConstructor;
	var PromisePrototype = NativePromisePrototype$2;
	var TypeError$5 = global_1.TypeError;
	var document$1 = global_1.document;
	var process = global_1.process;
	var newPromiseCapability = newPromiseCapability$1.f;
	var newGenericPromiseCapability = newPromiseCapability;

	var DISPATCH_EVENT = !!(document$1 && document$1.createEvent && global_1.dispatchEvent);
	var UNHANDLED_REJECTION = 'unhandledrejection';
	var REJECTION_HANDLED = 'rejectionhandled';
	var PENDING$2 = 0;
	var FULFILLED = 1;
	var REJECTED = 2;
	var HANDLED = 1;
	var UNHANDLED = 2;

	var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

	// helpers
	var isThenable = function (it) {
	  var then;
	  return isObject$1(it) && isCallable(then = it.then) ? then : false;
	};

	var callReaction = function (reaction, state) {
	  var value = state.value;
	  var ok = state.state === FULFILLED;
	  var handler = ok ? reaction.ok : reaction.fail;
	  var resolve = reaction.resolve;
	  var reject = reaction.reject;
	  var domain = reaction.domain;
	  var result, then, exited;
	  try {
	    if (handler) {
	      if (!ok) {
	        if (state.rejection === UNHANDLED) onHandleUnhandled(state);
	        state.rejection = HANDLED;
	      }
	      if (handler === true) result = value;
	      else {
	        if (domain) domain.enter();
	        result = handler(value); // can throw
	        if (domain) {
	          domain.exit();
	          exited = true;
	        }
	      }
	      if (result === reaction.promise) {
	        reject(new TypeError$5('Promise-chain cycle'));
	      } else if (then = isThenable(result)) {
	        functionCall(then, result, resolve, reject);
	      } else resolve(result);
	    } else reject(value);
	  } catch (error) {
	    if (domain && !exited) domain.exit();
	    reject(error);
	  }
	};

	var notify = function (state, isReject) {
	  if (state.notified) return;
	  state.notified = true;
	  microtask_1(function () {
	    var reactions = state.reactions;
	    var reaction;
	    while (reaction = reactions.get()) {
	      callReaction(reaction, state);
	    }
	    state.notified = false;
	    if (isReject && !state.rejection) onUnhandled(state);
	  });
	};

	var dispatchEvent = function (name, promise, reason) {
	  var event, handler;
	  if (DISPATCH_EVENT) {
	    event = document$1.createEvent('Event');
	    event.promise = promise;
	    event.reason = reason;
	    event.initEvent(name, false, true);
	    global_1.dispatchEvent(event);
	  } else event = { promise: promise, reason: reason };
	  if (!NATIVE_PROMISE_REJECTION_EVENT && (handler = global_1['on' + name])) handler(event);
	  else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
	};

	var onUnhandled = function (state) {
	  functionCall(task, global_1, function () {
	    var promise = state.facade;
	    var value = state.value;
	    var IS_UNHANDLED = isUnhandled(state);
	    var result;
	    if (IS_UNHANDLED) {
	      result = perform(function () {
	        if (engineIsNode) {
	          process.emit('unhandledRejection', value, promise);
	        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      state.rejection = engineIsNode || isUnhandled(state) ? UNHANDLED : HANDLED;
	      if (result.error) throw result.value;
	    }
	  });
	};

	var isUnhandled = function (state) {
	  return state.rejection !== HANDLED && !state.parent;
	};

	var onHandleUnhandled = function (state) {
	  functionCall(task, global_1, function () {
	    var promise = state.facade;
	    if (engineIsNode) {
	      process.emit('rejectionHandled', promise);
	    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
	  });
	};

	var bind = function (fn, state, unwrap) {
	  return function (value) {
	    fn(state, value, unwrap);
	  };
	};

	var internalReject = function (state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;
	  state.value = value;
	  state.state = REJECTED;
	  notify(state, true);
	};

	var internalResolve = function (state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;
	  try {
	    if (state.facade === value) throw new TypeError$5("Promise can't be resolved itself");
	    var then = isThenable(value);
	    if (then) {
	      microtask_1(function () {
	        var wrapper = { done: false };
	        try {
	          functionCall(then, value,
	            bind(internalResolve, wrapper, state),
	            bind(internalReject, wrapper, state)
	          );
	        } catch (error) {
	          internalReject(wrapper, error, state);
	        }
	      });
	    } else {
	      state.value = value;
	      state.state = FULFILLED;
	      notify(state, false);
	    }
	  } catch (error) {
	    internalReject({ done: false }, error, state);
	  }
	};

	// constructor polyfill
	if (FORCED_PROMISE_CONSTRUCTOR$4) {
	  // 25.4.3.1 Promise(executor)
	  PromiseConstructor = function Promise(executor) {
	    anInstance(this, PromisePrototype);
	    aCallable(executor);
	    functionCall(Internal, this);
	    var state = getInternalPromiseState(this);
	    try {
	      executor(bind(internalResolve, state), bind(internalReject, state));
	    } catch (error) {
	      internalReject(state, error);
	    }
	  };

	  PromisePrototype = PromiseConstructor.prototype;

	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  Internal = function Promise(executor) {
	    setInternalState$h(this, {
	      type: PROMISE,
	      done: false,
	      notified: false,
	      parent: false,
	      reactions: new queue$1(),
	      rejection: false,
	      state: PENDING$2,
	      value: undefined
	    });
	  };

	  // `Promise.prototype.then` method
	  // https://tc39.es/ecma262/#sec-promise.prototype.then
	  Internal.prototype = defineBuiltIn(PromisePrototype, 'then', function then(onFulfilled, onRejected) {
	    var state = getInternalPromiseState(this);
	    var reaction = newPromiseCapability(speciesConstructor(this, PromiseConstructor));
	    state.parent = true;
	    reaction.ok = isCallable(onFulfilled) ? onFulfilled : true;
	    reaction.fail = isCallable(onRejected) && onRejected;
	    reaction.domain = engineIsNode ? process.domain : undefined;
	    if (state.state === PENDING$2) state.reactions.add(reaction);
	    else microtask_1(function () {
	      callReaction(reaction, state);
	    });
	    return reaction.promise;
	  });

	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    var state = getInternalPromiseState(promise);
	    this.promise = promise;
	    this.resolve = bind(internalResolve, state);
	    this.reject = bind(internalReject, state);
	  };

	  newPromiseCapability$1.f = newPromiseCapability = function (C) {
	    return C === PromiseConstructor || C === PromiseWrapper
	      ? new OwnPromiseCapability(C)
	      : newGenericPromiseCapability(C);
	  };

	  if (isCallable(promiseNativeConstructor) && NativePromisePrototype$2 !== Object.prototype) {
	    nativeThen = NativePromisePrototype$2.then;

	    if (!NATIVE_PROMISE_SUBCLASSING) {
	      // make `Promise#then` return a polyfilled `Promise` for native promise-based APIs
	      defineBuiltIn(NativePromisePrototype$2, 'then', function then(onFulfilled, onRejected) {
	        var that = this;
	        return new PromiseConstructor(function (resolve, reject) {
	          functionCall(nativeThen, that, resolve, reject);
	        }).then(onFulfilled, onRejected);
	      // https://github.com/zloirock/core-js/issues/640
	      }, { unsafe: true });
	    }

	    // make `.constructor === Promise` work for native promise-based APIs
	    try {
	      delete NativePromisePrototype$2.constructor;
	    } catch (error) { /* empty */ }

	    // make `instanceof Promise` work for native promise-based APIs
	    if (objectSetPrototypeOf) {
	      objectSetPrototypeOf(NativePromisePrototype$2, PromisePrototype);
	    }
	  }
	}

	_export({ global: true, constructor: true, wrap: true, forced: FORCED_PROMISE_CONSTRUCTOR$4 }, {
	  Promise: PromiseConstructor
	});

	setToStringTag(PromiseConstructor, PROMISE, false);
	setSpecies(PROMISE);

	var FORCED_PROMISE_CONSTRUCTOR$3 = promiseConstructorDetection.CONSTRUCTOR;

	var promiseStaticsIncorrectIteration = FORCED_PROMISE_CONSTRUCTOR$3 || !checkCorrectnessOfIteration(function (iterable) {
	  promiseNativeConstructor.all(iterable).then(undefined, function () { /* empty */ });
	});

	// `Promise.all` method
	// https://tc39.es/ecma262/#sec-promise.all
	_export({ target: 'Promise', stat: true, forced: promiseStaticsIncorrectIteration }, {
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1.f(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aCallable(C.resolve);
	      var values = [];
	      var counter = 0;
	      var remaining = 1;
	      iterate(iterable, function (promise) {
	        var index = counter++;
	        var alreadyCalled = false;
	        remaining++;
	        functionCall($promiseResolve, C, promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});

	var FORCED_PROMISE_CONSTRUCTOR$2 = promiseConstructorDetection.CONSTRUCTOR;





	var NativePromisePrototype$1 = promiseNativeConstructor && promiseNativeConstructor.prototype;

	// `Promise.prototype.catch` method
	// https://tc39.es/ecma262/#sec-promise.prototype.catch
	_export({ target: 'Promise', proto: true, forced: FORCED_PROMISE_CONSTRUCTOR$2, real: true }, {
	  'catch': function (onRejected) {
	    return this.then(undefined, onRejected);
	  }
	});

	// makes sure that native promise-based APIs `Promise#catch` properly works with patched `Promise#then`
	if (isCallable(promiseNativeConstructor)) {
	  var method$1 = getBuiltIn('Promise').prototype['catch'];
	  if (NativePromisePrototype$1['catch'] !== method$1) {
	    defineBuiltIn(NativePromisePrototype$1, 'catch', method$1, { unsafe: true });
	  }
	}

	// `Promise.race` method
	// https://tc39.es/ecma262/#sec-promise.race
	_export({ target: 'Promise', stat: true, forced: promiseStaticsIncorrectIteration }, {
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1.f(C);
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aCallable(C.resolve);
	      iterate(iterable, function (promise) {
	        functionCall($promiseResolve, C, promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});

	var FORCED_PROMISE_CONSTRUCTOR$1 = promiseConstructorDetection.CONSTRUCTOR;

	// `Promise.reject` method
	// https://tc39.es/ecma262/#sec-promise.reject
	_export({ target: 'Promise', stat: true, forced: FORCED_PROMISE_CONSTRUCTOR$1 }, {
	  reject: function reject(r) {
	    var capability = newPromiseCapability$1.f(this);
	    var capabilityReject = capability.reject;
	    capabilityReject(r);
	    return capability.promise;
	  }
	});

	var promiseResolve = function (C, x) {
	  anObject(C);
	  if (isObject$1(x) && x.constructor === C) return x;
	  var promiseCapability = newPromiseCapability$1.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};

	var FORCED_PROMISE_CONSTRUCTOR = promiseConstructorDetection.CONSTRUCTOR;


	getBuiltIn('Promise');

	// `Promise.resolve` method
	// https://tc39.es/ecma262/#sec-promise.resolve
	_export({ target: 'Promise', stat: true, forced: FORCED_PROMISE_CONSTRUCTOR }, {
	  resolve: function resolve(x) {
	    return promiseResolve(this, x);
	  }
	});

	// `Promise.allSettled` method
	// https://tc39.es/ecma262/#sec-promise.allsettled
	_export({ target: 'Promise', stat: true, forced: promiseStaticsIncorrectIteration }, {
	  allSettled: function allSettled(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1.f(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var promiseResolve = aCallable(C.resolve);
	      var values = [];
	      var counter = 0;
	      var remaining = 1;
	      iterate(iterable, function (promise) {
	        var index = counter++;
	        var alreadyCalled = false;
	        remaining++;
	        functionCall(promiseResolve, C, promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[index] = { status: 'fulfilled', value: value };
	          --remaining || resolve(values);
	        }, function (error) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[index] = { status: 'rejected', reason: error };
	          --remaining || resolve(values);
	        });
	      });
	      --remaining || resolve(values);
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});

	var PROMISE_ANY_ERROR = 'No one promise resolved';

	// `Promise.any` method
	// https://tc39.es/ecma262/#sec-promise.any
	_export({ target: 'Promise', stat: true, forced: promiseStaticsIncorrectIteration }, {
	  any: function any(iterable) {
	    var C = this;
	    var AggregateError = getBuiltIn('AggregateError');
	    var capability = newPromiseCapability$1.f(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var promiseResolve = aCallable(C.resolve);
	      var errors = [];
	      var counter = 0;
	      var remaining = 1;
	      var alreadyResolved = false;
	      iterate(iterable, function (promise) {
	        var index = counter++;
	        var alreadyRejected = false;
	        remaining++;
	        functionCall(promiseResolve, C, promise).then(function (value) {
	          if (alreadyRejected || alreadyResolved) return;
	          alreadyResolved = true;
	          resolve(value);
	        }, function (error) {
	          if (alreadyRejected || alreadyResolved) return;
	          alreadyRejected = true;
	          errors[index] = error;
	          --remaining || reject(new AggregateError(errors, PROMISE_ANY_ERROR));
	        });
	      });
	      --remaining || reject(new AggregateError(errors, PROMISE_ANY_ERROR));
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});

	var NativePromisePrototype = promiseNativeConstructor && promiseNativeConstructor.prototype;

	// Safari bug https://bugs.webkit.org/show_bug.cgi?id=200829
	var NON_GENERIC = !!promiseNativeConstructor && fails(function () {
	  // eslint-disable-next-line unicorn/no-thenable -- required for testing
	  NativePromisePrototype['finally'].call({ then: function () { /* empty */ } }, function () { /* empty */ });
	});

	// `Promise.prototype.finally` method
	// https://tc39.es/ecma262/#sec-promise.prototype.finally
	_export({ target: 'Promise', proto: true, real: true, forced: NON_GENERIC }, {
	  'finally': function (onFinally) {
	    var C = speciesConstructor(this, getBuiltIn('Promise'));
	    var isFunction = isCallable(onFinally);
	    return this.then(
	      isFunction ? function (x) {
	        return promiseResolve(C, onFinally()).then(function () { return x; });
	      } : onFinally,
	      isFunction ? function (e) {
	        return promiseResolve(C, onFinally()).then(function () { throw e; });
	      } : onFinally
	    );
	  }
	});

	// makes sure that native promise-based APIs `Promise#finally` properly works with patched `Promise#then`
	if (isCallable(promiseNativeConstructor)) {
	  var method = getBuiltIn('Promise').prototype['finally'];
	  if (NativePromisePrototype['finally'] !== method) {
	    defineBuiltIn(NativePromisePrototype, 'finally', method, { unsafe: true });
	  }
	}

	// `Promise.withResolvers` method
	// https://github.com/tc39/proposal-promise-with-resolvers
	_export({ target: 'Promise', stat: true }, {
	  withResolvers: function withResolvers() {
	    var promiseCapability = newPromiseCapability$1.f(this);
	    return {
	      promise: promiseCapability.promise,
	      resolve: promiseCapability.resolve,
	      reject: promiseCapability.reject
	    };
	  }
	});

	// MS Edge argumentsList argument is optional
	var OPTIONAL_ARGUMENTS_LIST = !fails(function () {
	  // eslint-disable-next-line es/no-reflect -- required for testing
	  Reflect.apply(function () { /* empty */ });
	});

	// `Reflect.apply` method
	// https://tc39.es/ecma262/#sec-reflect.apply
	_export({ target: 'Reflect', stat: true, forced: OPTIONAL_ARGUMENTS_LIST }, {
	  apply: function apply(target, thisArgument, argumentsList) {
	    return functionApply(aCallable(target), thisArgument, anObject(argumentsList));
	  }
	});

	var nativeConstruct = getBuiltIn('Reflect', 'construct');
	var ObjectPrototype = Object.prototype;
	var push$j = [].push;

	// `Reflect.construct` method
	// https://tc39.es/ecma262/#sec-reflect.construct
	// MS Edge supports only 2 arguments and argumentsList argument is optional
	// FF Nightly sets third argument as `new.target`, but does not create `this` from it
	var NEW_TARGET_BUG = fails(function () {
	  function F() { /* empty */ }
	  return !(nativeConstruct(function () { /* empty */ }, [], F) instanceof F);
	});

	var ARGS_BUG = !fails(function () {
	  nativeConstruct(function () { /* empty */ });
	});

	var FORCED$7 = NEW_TARGET_BUG || ARGS_BUG;

	_export({ target: 'Reflect', stat: true, forced: FORCED$7, sham: FORCED$7 }, {
	  construct: function construct(Target, args /* , newTarget */) {
	    aConstructor(Target);
	    anObject(args);
	    var newTarget = arguments.length < 3 ? Target : aConstructor(arguments[2]);
	    if (ARGS_BUG && !NEW_TARGET_BUG) return nativeConstruct(Target, args, newTarget);
	    if (Target === newTarget) {
	      // w/o altered newTarget, optimization for 0-4 arguments
	      switch (args.length) {
	        case 0: return new Target();
	        case 1: return new Target(args[0]);
	        case 2: return new Target(args[0], args[1]);
	        case 3: return new Target(args[0], args[1], args[2]);
	        case 4: return new Target(args[0], args[1], args[2], args[3]);
	      }
	      // w/o altered newTarget, lot of arguments case
	      var $args = [null];
	      functionApply(push$j, $args, args);
	      return new (functionApply(functionBind, Target, $args))();
	    }
	    // with altered newTarget, not support built-in constructors
	    var proto = newTarget.prototype;
	    var instance = objectCreate(isObject$1(proto) ? proto : ObjectPrototype);
	    var result = functionApply(Target, instance, args);
	    return isObject$1(result) ? result : instance;
	  }
	});

	// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
	var ERROR_INSTEAD_OF_FALSE = fails(function () {
	  // eslint-disable-next-line es/no-reflect -- required for testing
	  Reflect.defineProperty(objectDefineProperty.f({}, 1, { value: 1 }), 1, { value: 2 });
	});

	// `Reflect.defineProperty` method
	// https://tc39.es/ecma262/#sec-reflect.defineproperty
	_export({ target: 'Reflect', stat: true, forced: ERROR_INSTEAD_OF_FALSE, sham: !descriptors }, {
	  defineProperty: function defineProperty(target, propertyKey, attributes) {
	    anObject(target);
	    var key = toPropertyKey(propertyKey);
	    anObject(attributes);
	    try {
	      objectDefineProperty.f(target, key, attributes);
	      return true;
	    } catch (error) {
	      return false;
	    }
	  }
	});

	var getOwnPropertyDescriptor$6 = objectGetOwnPropertyDescriptor.f;

	// `Reflect.deleteProperty` method
	// https://tc39.es/ecma262/#sec-reflect.deleteproperty
	_export({ target: 'Reflect', stat: true }, {
	  deleteProperty: function deleteProperty(target, propertyKey) {
	    var descriptor = getOwnPropertyDescriptor$6(anObject(target), propertyKey);
	    return descriptor && !descriptor.configurable ? false : delete target[propertyKey];
	  }
	});

	var isDataDescriptor = function (descriptor) {
	  return descriptor !== undefined && (hasOwnProperty_1(descriptor, 'value') || hasOwnProperty_1(descriptor, 'writable'));
	};

	// `Reflect.get` method
	// https://tc39.es/ecma262/#sec-reflect.get
	function get$4(target, propertyKey /* , receiver */) {
	  var receiver = arguments.length < 3 ? target : arguments[2];
	  var descriptor, prototype;
	  if (anObject(target) === receiver) return target[propertyKey];
	  descriptor = objectGetOwnPropertyDescriptor.f(target, propertyKey);
	  if (descriptor) return isDataDescriptor(descriptor)
	    ? descriptor.value
	    : descriptor.get === undefined ? undefined : functionCall(descriptor.get, receiver);
	  if (isObject$1(prototype = objectGetPrototypeOf(target))) return get$4(prototype, propertyKey, receiver);
	}

	_export({ target: 'Reflect', stat: true }, {
	  get: get$4
	});

	// `Reflect.getOwnPropertyDescriptor` method
	// https://tc39.es/ecma262/#sec-reflect.getownpropertydescriptor
	_export({ target: 'Reflect', stat: true, sham: !descriptors }, {
	  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
	    return objectGetOwnPropertyDescriptor.f(anObject(target), propertyKey);
	  }
	});

	// `Reflect.getPrototypeOf` method
	// https://tc39.es/ecma262/#sec-reflect.getprototypeof
	_export({ target: 'Reflect', stat: true, sham: !correctPrototypeGetter }, {
	  getPrototypeOf: function getPrototypeOf(target) {
	    return objectGetPrototypeOf(anObject(target));
	  }
	});

	// `Reflect.has` method
	// https://tc39.es/ecma262/#sec-reflect.has
	_export({ target: 'Reflect', stat: true }, {
	  has: function has(target, propertyKey) {
	    return propertyKey in target;
	  }
	});

	// `Reflect.isExtensible` method
	// https://tc39.es/ecma262/#sec-reflect.isextensible
	_export({ target: 'Reflect', stat: true }, {
	  isExtensible: function isExtensible(target) {
	    anObject(target);
	    return objectIsExtensible(target);
	  }
	});

	// `Reflect.ownKeys` method
	// https://tc39.es/ecma262/#sec-reflect.ownkeys
	_export({ target: 'Reflect', stat: true }, {
	  ownKeys: ownKeys
	});

	// `Reflect.preventExtensions` method
	// https://tc39.es/ecma262/#sec-reflect.preventextensions
	_export({ target: 'Reflect', stat: true, sham: !freezing }, {
	  preventExtensions: function preventExtensions(target) {
	    anObject(target);
	    try {
	      var objectPreventExtensions = getBuiltIn('Object', 'preventExtensions');
	      if (objectPreventExtensions) objectPreventExtensions(target);
	      return true;
	    } catch (error) {
	      return false;
	    }
	  }
	});

	// `Reflect.set` method
	// https://tc39.es/ecma262/#sec-reflect.set
	function set$7(target, propertyKey, V /* , receiver */) {
	  var receiver = arguments.length < 4 ? target : arguments[3];
	  var ownDescriptor = objectGetOwnPropertyDescriptor.f(anObject(target), propertyKey);
	  var existingDescriptor, prototype, setter;
	  if (!ownDescriptor) {
	    if (isObject$1(prototype = objectGetPrototypeOf(target))) {
	      return set$7(prototype, propertyKey, V, receiver);
	    }
	    ownDescriptor = createPropertyDescriptor(0);
	  }
	  if (isDataDescriptor(ownDescriptor)) {
	    if (ownDescriptor.writable === false || !isObject$1(receiver)) return false;
	    if (existingDescriptor = objectGetOwnPropertyDescriptor.f(receiver, propertyKey)) {
	      if (existingDescriptor.get || existingDescriptor.set || existingDescriptor.writable === false) return false;
	      existingDescriptor.value = V;
	      objectDefineProperty.f(receiver, propertyKey, existingDescriptor);
	    } else objectDefineProperty.f(receiver, propertyKey, createPropertyDescriptor(0, V));
	  } else {
	    setter = ownDescriptor.set;
	    if (setter === undefined) return false;
	    functionCall(setter, receiver, V);
	  } return true;
	}

	// MS Edge 17-18 Reflect.set allows setting the property to object
	// with non-writable property on the prototype
	var MS_EDGE_BUG = fails(function () {
	  var Constructor = function () { /* empty */ };
	  var object = objectDefineProperty.f(new Constructor(), 'a', { configurable: true });
	  // eslint-disable-next-line es/no-reflect -- required for testing
	  return Reflect.set(Constructor.prototype, 'a', 1, object) !== false;
	});

	_export({ target: 'Reflect', stat: true, forced: MS_EDGE_BUG }, {
	  set: set$7
	});

	// `Reflect.setPrototypeOf` method
	// https://tc39.es/ecma262/#sec-reflect.setprototypeof
	if (objectSetPrototypeOf) _export({ target: 'Reflect', stat: true }, {
	  setPrototypeOf: function setPrototypeOf(target, proto) {
	    anObject(target);
	    aPossiblePrototype(proto);
	    try {
	      objectSetPrototypeOf(target, proto);
	      return true;
	    } catch (error) {
	      return false;
	    }
	  }
	});

	_export({ global: true }, { Reflect: {} });

	// Reflect[@@toStringTag] property
	// https://tc39.es/ecma262/#sec-reflect-@@tostringtag
	setToStringTag(global_1.Reflect, 'Reflect', true);

	var MATCH$2 = wellKnownSymbol('match');

	// `IsRegExp` abstract operation
	// https://tc39.es/ecma262/#sec-isregexp
	var isRegexp = function (it) {
	  var isRegExp;
	  return isObject$1(it) && ((isRegExp = it[MATCH$2]) !== undefined ? !!isRegExp : classofRaw(it) === 'RegExp');
	};

	// `RegExp.prototype.flags` getter implementation
	// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
	var regexpFlags = function () {
	  var that = anObject(this);
	  var result = '';
	  if (that.hasIndices) result += 'd';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.dotAll) result += 's';
	  if (that.unicode) result += 'u';
	  if (that.unicodeSets) result += 'v';
	  if (that.sticky) result += 'y';
	  return result;
	};

	var RegExpPrototype$7 = RegExp.prototype;

	var regexpGetFlags = function (R) {
	  var flags = R.flags;
	  return flags === undefined && !('flags' in RegExpPrototype$7) && !hasOwnProperty_1(R, 'flags') && objectIsPrototypeOf(RegExpPrototype$7, R)
	    ? functionCall(regexpFlags, R) : flags;
	};

	// babel-minify and Closure Compiler transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
	var $RegExp$2 = global_1.RegExp;

	var UNSUPPORTED_Y$3 = fails(function () {
	  var re = $RegExp$2('a', 'y');
	  re.lastIndex = 2;
	  return re.exec('abcd') !== null;
	});

	// UC Browser bug
	// https://github.com/zloirock/core-js/issues/1008
	var MISSED_STICKY$2 = UNSUPPORTED_Y$3 || fails(function () {
	  return !$RegExp$2('a', 'y').sticky;
	});

	var BROKEN_CARET = UNSUPPORTED_Y$3 || fails(function () {
	  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
	  var re = $RegExp$2('^r', 'gy');
	  re.lastIndex = 2;
	  return re.exec('str') !== null;
	});

	var regexpStickyHelpers = {
	  BROKEN_CARET: BROKEN_CARET,
	  MISSED_STICKY: MISSED_STICKY$2,
	  UNSUPPORTED_Y: UNSUPPORTED_Y$3
	};

	// babel-minify and Closure Compiler transpiles RegExp('.', 's') -> /./s and it causes SyntaxError
	var $RegExp$1 = global_1.RegExp;

	var regexpUnsupportedDotAll = fails(function () {
	  var re = $RegExp$1('.', 's');
	  return !(re.dotAll && re.test('\n') && re.flags === 's');
	});

	// babel-minify and Closure Compiler transpiles RegExp('(?<a>b)', 'g') -> /(?<a>b)/g and it causes SyntaxError
	var $RegExp = global_1.RegExp;

	var regexpUnsupportedNcg = fails(function () {
	  var re = $RegExp('(?<a>b)', 'g');
	  return re.exec('b').groups.a !== 'b' ||
	    'b'.replace(re, '$<a>c') !== 'bc';
	});

	var getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;









	var enforceInternalState$1 = internalState.enforce;





	var MATCH$1 = wellKnownSymbol('match');
	var NativeRegExp = global_1.RegExp;
	var RegExpPrototype$6 = NativeRegExp.prototype;
	var SyntaxError$4 = global_1.SyntaxError;
	var exec$c = functionUncurryThis(RegExpPrototype$6.exec);
	var charAt$j = functionUncurryThis(''.charAt);
	var replace$9 = functionUncurryThis(''.replace);
	var stringIndexOf$5 = functionUncurryThis(''.indexOf);
	var stringSlice$g = functionUncurryThis(''.slice);
	// TODO: Use only proper RegExpIdentifierName
	var IS_NCG = /^\?<[^\s\d!#%&*+<=>@^][^\s!#%&*+<=>@^]*>/;
	var re1 = /a/g;
	var re2 = /a/g;

	// "new" should create a new object, old webkit bug
	var CORRECT_NEW = new NativeRegExp(re1) !== re1;

	var MISSED_STICKY$1 = regexpStickyHelpers.MISSED_STICKY;
	var UNSUPPORTED_Y$2 = regexpStickyHelpers.UNSUPPORTED_Y;

	var BASE_FORCED = descriptors &&
	  (!CORRECT_NEW || MISSED_STICKY$1 || regexpUnsupportedDotAll || regexpUnsupportedNcg || fails(function () {
	    re2[MATCH$1] = false;
	    // RegExp constructor can alter flags and IsRegExp works correct with @@match
	    return NativeRegExp(re1) !== re1 || NativeRegExp(re2) === re2 || String(NativeRegExp(re1, 'i')) !== '/a/i';
	  }));

	var handleDotAll = function (string) {
	  var length = string.length;
	  var index = 0;
	  var result = '';
	  var brackets = false;
	  var chr;
	  for (; index <= length; index++) {
	    chr = charAt$j(string, index);
	    if (chr === '\\') {
	      result += chr + charAt$j(string, ++index);
	      continue;
	    }
	    if (!brackets && chr === '.') {
	      result += '[\\s\\S]';
	    } else {
	      if (chr === '[') {
	        brackets = true;
	      } else if (chr === ']') {
	        brackets = false;
	      } result += chr;
	    }
	  } return result;
	};

	var handleNCG = function (string) {
	  var length = string.length;
	  var index = 0;
	  var result = '';
	  var named = [];
	  var names = objectCreate(null);
	  var brackets = false;
	  var ncg = false;
	  var groupid = 0;
	  var groupname = '';
	  var chr;
	  for (; index <= length; index++) {
	    chr = charAt$j(string, index);
	    if (chr === '\\') {
	      chr += charAt$j(string, ++index);
	    } else if (chr === ']') {
	      brackets = false;
	    } else if (!brackets) switch (true) {
	      case chr === '[':
	        brackets = true;
	        break;
	      case chr === '(':
	        if (exec$c(IS_NCG, stringSlice$g(string, index + 1))) {
	          index += 2;
	          ncg = true;
	        }
	        result += chr;
	        groupid++;
	        continue;
	      case chr === '>' && ncg:
	        if (groupname === '' || hasOwnProperty_1(names, groupname)) {
	          throw new SyntaxError$4('Invalid capture group name');
	        }
	        names[groupname] = true;
	        named[named.length] = [groupname, groupid];
	        ncg = false;
	        groupname = '';
	        continue;
	    }
	    if (ncg) groupname += chr;
	    else result += chr;
	  } return [result, named];
	};

	// `RegExp` constructor
	// https://tc39.es/ecma262/#sec-regexp-constructor
	if (isForced_1('RegExp', BASE_FORCED)) {
	  var RegExpWrapper = function RegExp(pattern, flags) {
	    var thisIsRegExp = objectIsPrototypeOf(RegExpPrototype$6, this);
	    var patternIsRegExp = isRegexp(pattern);
	    var flagsAreUndefined = flags === undefined;
	    var groups = [];
	    var rawPattern = pattern;
	    var rawFlags, dotAll, sticky, handled, result, state;

	    if (!thisIsRegExp && patternIsRegExp && flagsAreUndefined && pattern.constructor === RegExpWrapper) {
	      return pattern;
	    }

	    if (patternIsRegExp || objectIsPrototypeOf(RegExpPrototype$6, pattern)) {
	      pattern = pattern.source;
	      if (flagsAreUndefined) flags = regexpGetFlags(rawPattern);
	    }

	    pattern = pattern === undefined ? '' : toString_1$1(pattern);
	    flags = flags === undefined ? '' : toString_1$1(flags);
	    rawPattern = pattern;

	    if (regexpUnsupportedDotAll && 'dotAll' in re1) {
	      dotAll = !!flags && stringIndexOf$5(flags, 's') > -1;
	      if (dotAll) flags = replace$9(flags, /s/g, '');
	    }

	    rawFlags = flags;

	    if (MISSED_STICKY$1 && 'sticky' in re1) {
	      sticky = !!flags && stringIndexOf$5(flags, 'y') > -1;
	      if (sticky && UNSUPPORTED_Y$2) flags = replace$9(flags, /y/g, '');
	    }

	    if (regexpUnsupportedNcg) {
	      handled = handleNCG(pattern);
	      pattern = handled[0];
	      groups = handled[1];
	    }

	    result = inheritIfRequired(NativeRegExp(pattern, flags), thisIsRegExp ? this : RegExpPrototype$6, RegExpWrapper);

	    if (dotAll || sticky || groups.length) {
	      state = enforceInternalState$1(result);
	      if (dotAll) {
	        state.dotAll = true;
	        state.raw = RegExpWrapper(handleDotAll(pattern), rawFlags);
	      }
	      if (sticky) state.sticky = true;
	      if (groups.length) state.groups = groups;
	    }

	    if (pattern !== rawPattern) try {
	      // fails in old engines, but we have no alternatives for unsupported regex syntax
	      createNonEnumerableProperty(result, 'source', rawPattern === '' ? '(?:)' : rawPattern);
	    } catch (error) { /* empty */ }

	    return result;
	  };

	  for (var keys$2 = getOwnPropertyNames$1(NativeRegExp), index = 0; keys$2.length > index;) {
	    proxyAccessor(RegExpWrapper, NativeRegExp, keys$2[index++]);
	  }

	  RegExpPrototype$6.constructor = RegExpWrapper;
	  RegExpWrapper.prototype = RegExpPrototype$6;
	  defineBuiltIn(global_1, 'RegExp', RegExpWrapper, { constructor: true });
	}

	// https://tc39.es/ecma262/#sec-get-regexp-@@species
	setSpecies('RegExp');

	var getInternalState$b = internalState.get;

	var RegExpPrototype$5 = RegExp.prototype;
	var $TypeError$t = TypeError;

	// `RegExp.prototype.dotAll` getter
	// https://tc39.es/ecma262/#sec-get-regexp.prototype.dotall
	if (descriptors && regexpUnsupportedDotAll) {
	  defineBuiltInAccessor(RegExpPrototype$5, 'dotAll', {
	    configurable: true,
	    get: function dotAll() {
	      if (this === RegExpPrototype$5) return;
	      // We can't use InternalStateModule.getterFor because
	      // we don't add metadata for regexps created by a literal.
	      if (classofRaw(this) === 'RegExp') {
	        return !!getInternalState$b(this).dotAll;
	      }
	      throw new $TypeError$t('Incompatible receiver, RegExp required');
	    }
	  });
	}

	/* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
	/* eslint-disable regexp/no-useless-quantifier -- testing */







	var getInternalState$a = internalState.get;



	var nativeReplace = shared('native-string-replace', String.prototype.replace);
	var nativeExec = RegExp.prototype.exec;
	var patchedExec = nativeExec;
	var charAt$i = functionUncurryThis(''.charAt);
	var indexOf$1 = functionUncurryThis(''.indexOf);
	var replace$8 = functionUncurryThis(''.replace);
	var stringSlice$f = functionUncurryThis(''.slice);

	var UPDATES_LAST_INDEX_WRONG = (function () {
	  var re1 = /a/;
	  var re2 = /b*/g;
	  functionCall(nativeExec, re1, 'a');
	  functionCall(nativeExec, re2, 'a');
	  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
	})();

	var UNSUPPORTED_Y$1 = regexpStickyHelpers.BROKEN_CARET;

	// nonparticipating capturing group, copied from es5-shim's String#split patch.
	var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1 || regexpUnsupportedDotAll || regexpUnsupportedNcg;

	if (PATCH) {
	  patchedExec = function exec(string) {
	    var re = this;
	    var state = getInternalState$a(re);
	    var str = toString_1$1(string);
	    var raw = state.raw;
	    var result, reCopy, lastIndex, match, i, object, group;

	    if (raw) {
	      raw.lastIndex = re.lastIndex;
	      result = functionCall(patchedExec, raw, str);
	      re.lastIndex = raw.lastIndex;
	      return result;
	    }

	    var groups = state.groups;
	    var sticky = UNSUPPORTED_Y$1 && re.sticky;
	    var flags = functionCall(regexpFlags, re);
	    var source = re.source;
	    var charsAdded = 0;
	    var strCopy = str;

	    if (sticky) {
	      flags = replace$8(flags, 'y', '');
	      if (indexOf$1(flags, 'g') === -1) {
	        flags += 'g';
	      }

	      strCopy = stringSlice$f(str, re.lastIndex);
	      // Support anchored sticky behavior.
	      if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt$i(str, re.lastIndex - 1) !== '\n')) {
	        source = '(?: ' + source + ')';
	        strCopy = ' ' + strCopy;
	        charsAdded++;
	      }
	      // ^(? + rx + ) is needed, in combination with some str slicing, to
	      // simulate the 'y' flag.
	      reCopy = new RegExp('^(?:' + source + ')', flags);
	    }

	    if (NPCG_INCLUDED) {
	      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
	    }
	    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

	    match = functionCall(nativeExec, sticky ? reCopy : re, strCopy);

	    if (sticky) {
	      if (match) {
	        match.input = stringSlice$f(match.input, charsAdded);
	        match[0] = stringSlice$f(match[0], charsAdded);
	        match.index = re.lastIndex;
	        re.lastIndex += match[0].length;
	      } else re.lastIndex = 0;
	    } else if (UPDATES_LAST_INDEX_WRONG && match) {
	      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
	    }
	    if (NPCG_INCLUDED && match && match.length > 1) {
	      // Fix browsers whose `exec` methods don't consistently return `undefined`
	      // for NPCG, like IE8. NOTE: This doesn't work for /(.?)?/
	      functionCall(nativeReplace, match[0], reCopy, function () {
	        for (i = 1; i < arguments.length - 2; i++) {
	          if (arguments[i] === undefined) match[i] = undefined;
	        }
	      });
	    }

	    if (match && groups) {
	      match.groups = object = objectCreate(null);
	      for (i = 0; i < groups.length; i++) {
	        group = groups[i];
	        object[group[0]] = match[group[1]];
	      }
	    }

	    return match;
	  };
	}

	var regexpExec = patchedExec;

	// `RegExp.prototype.exec` method
	// https://tc39.es/ecma262/#sec-regexp.prototype.exec
	_export({ target: 'RegExp', proto: true, forced: /./.exec !== regexpExec }, {
	  exec: regexpExec
	});

	// babel-minify and Closure Compiler transpiles RegExp('.', 'd') -> /./d and it causes SyntaxError
	var RegExp$2 = global_1.RegExp;
	var RegExpPrototype$4 = RegExp$2.prototype;

	var FORCED$6 = descriptors && fails(function () {
	  var INDICES_SUPPORT = true;
	  try {
	    RegExp$2('.', 'd');
	  } catch (error) {
	    INDICES_SUPPORT = false;
	  }

	  var O = {};
	  // modern V8 bug
	  var calls = '';
	  var expected = INDICES_SUPPORT ? 'dgimsy' : 'gimsy';

	  var addGetter = function (key, chr) {
	    // eslint-disable-next-line es/no-object-defineproperty -- safe
	    Object.defineProperty(O, key, { get: function () {
	      calls += chr;
	      return true;
	    } });
	  };

	  var pairs = {
	    dotAll: 's',
	    global: 'g',
	    ignoreCase: 'i',
	    multiline: 'm',
	    sticky: 'y'
	  };

	  if (INDICES_SUPPORT) pairs.hasIndices = 'd';

	  for (var key in pairs) addGetter(key, pairs[key]);

	  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	  var result = Object.getOwnPropertyDescriptor(RegExpPrototype$4, 'flags').get.call(O);

	  return result !== expected || calls !== expected;
	});

	// `RegExp.prototype.flags` getter
	// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
	if (FORCED$6) defineBuiltInAccessor(RegExpPrototype$4, 'flags', {
	  configurable: true,
	  get: regexpFlags
	});

	var MISSED_STICKY = regexpStickyHelpers.MISSED_STICKY;


	var getInternalState$9 = internalState.get;

	var RegExpPrototype$3 = RegExp.prototype;
	var $TypeError$s = TypeError;

	// `RegExp.prototype.sticky` getter
	// https://tc39.es/ecma262/#sec-get-regexp.prototype.sticky
	if (descriptors && MISSED_STICKY) {
	  defineBuiltInAccessor(RegExpPrototype$3, 'sticky', {
	    configurable: true,
	    get: function sticky() {
	      if (this === RegExpPrototype$3) return;
	      // We can't use InternalStateModule.getterFor because
	      // we don't add metadata for regexps created by a literal.
	      if (classofRaw(this) === 'RegExp') {
	        return !!getInternalState$9(this).sticky;
	      }
	      throw new $TypeError$s('Incompatible receiver, RegExp required');
	    }
	  });
	}

	// TODO: Remove from `core-js@4` since it's moved to entry points







	var DELEGATES_TO_EXEC = function () {
	  var execCalled = false;
	  var re = /[ac]/;
	  re.exec = function () {
	    execCalled = true;
	    return /./.exec.apply(this, arguments);
	  };
	  return re.test('abc') === true && execCalled;
	}();

	var nativeTest = /./.test;

	// `RegExp.prototype.test` method
	// https://tc39.es/ecma262/#sec-regexp.prototype.test
	_export({ target: 'RegExp', proto: true, forced: !DELEGATES_TO_EXEC }, {
	  test: function (S) {
	    var R = anObject(this);
	    var string = toString_1$1(S);
	    var exec = R.exec;
	    if (!isCallable(exec)) return functionCall(nativeTest, R, string);
	    var result = functionCall(exec, R, string);
	    if (result === null) return false;
	    anObject(result);
	    return true;
	  }
	});

	var PROPER_FUNCTION_NAME$1 = functionName.PROPER;






	var TO_STRING = 'toString';
	var RegExpPrototype$2 = RegExp.prototype;
	var nativeToString = RegExpPrototype$2[TO_STRING];

	var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) !== '/a/b'; });
	// FF44- RegExp#toString has a wrong name
	var INCORRECT_NAME = PROPER_FUNCTION_NAME$1 && nativeToString.name !== TO_STRING;

	// `RegExp.prototype.toString` method
	// https://tc39.es/ecma262/#sec-regexp.prototype.tostring
	if (NOT_GENERIC || INCORRECT_NAME) {
	  defineBuiltIn(RegExpPrototype$2, TO_STRING, function toString() {
	    var R = anObject(this);
	    var pattern = toString_1$1(R.source);
	    var flags = toString_1$1(regexpGetFlags(R));
	    return '/' + pattern + '/' + flags;
	  }, { unsafe: true });
	}

	// `Set` constructor
	// https://tc39.es/ecma262/#sec-set-objects
	collection('Set', function (init) {
	  return function Set() { return init(this, arguments.length ? arguments[0] : undefined); };
	}, collectionStrong);

	var charAt$h = functionUncurryThis(''.charAt);

	var FORCED$5 = fails(function () {
	  // eslint-disable-next-line es/no-array-string-prototype-at -- safe
	  return '𠮷'.at(-2) !== '\uD842';
	});

	// `String.prototype.at` method
	// https://tc39.es/ecma262/#sec-string.prototype.at
	_export({ target: 'String', proto: true, forced: FORCED$5 }, {
	  at: function at(index) {
	    var S = toString_1$1(requireObjectCoercible(this));
	    var len = S.length;
	    var relativeIndex = toIntegerOrInfinity(index);
	    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
	    return (k < 0 || k >= len) ? undefined : charAt$h(S, k);
	  }
	});

	var charAt$g = functionUncurryThis(''.charAt);
	var charCodeAt$6 = functionUncurryThis(''.charCodeAt);
	var stringSlice$e = functionUncurryThis(''.slice);

	var createMethod$1 = function (CONVERT_TO_STRING) {
	  return function ($this, pos) {
	    var S = toString_1$1(requireObjectCoercible($this));
	    var position = toIntegerOrInfinity(pos);
	    var size = S.length;
	    var first, second;
	    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
	    first = charCodeAt$6(S, position);
	    return first < 0xD800 || first > 0xDBFF || position + 1 === size
	      || (second = charCodeAt$6(S, position + 1)) < 0xDC00 || second > 0xDFFF
	        ? CONVERT_TO_STRING
	          ? charAt$g(S, position)
	          : first
	        : CONVERT_TO_STRING
	          ? stringSlice$e(S, position, position + 2)
	          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
	  };
	};

	var stringMultibyte = {
	  // `String.prototype.codePointAt` method
	  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
	  codeAt: createMethod$1(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod$1(true)
	};

	var codeAt$2 = stringMultibyte.codeAt;

	// `String.prototype.codePointAt` method
	// https://tc39.es/ecma262/#sec-string.prototype.codepointat
	_export({ target: 'String', proto: true }, {
	  codePointAt: function codePointAt(pos) {
	    return codeAt$2(this, pos);
	  }
	});

	var $TypeError$r = TypeError;

	var notARegexp = function (it) {
	  if (isRegexp(it)) {
	    throw new $TypeError$r("The method doesn't accept regular expressions");
	  } return it;
	};

	var MATCH = wellKnownSymbol('match');

	var correctIsRegexpLogic = function (METHOD_NAME) {
	  var regexp = /./;
	  try {
	    '/./'[METHOD_NAME](regexp);
	  } catch (error1) {
	    try {
	      regexp[MATCH] = false;
	      return '/./'[METHOD_NAME](regexp);
	    } catch (error2) { /* empty */ }
	  } return false;
	};

	var getOwnPropertyDescriptor$5 = objectGetOwnPropertyDescriptor.f;







	var slice$6 = functionUncurryThisClause(''.slice);
	var min$8 = Math.min;

	var CORRECT_IS_REGEXP_LOGIC$1 = correctIsRegexpLogic('endsWith');
	// https://github.com/zloirock/core-js/pull/702
	var MDN_POLYFILL_BUG$1 = !CORRECT_IS_REGEXP_LOGIC$1 && !!function () {
	  var descriptor = getOwnPropertyDescriptor$5(String.prototype, 'endsWith');
	  return descriptor && !descriptor.writable;
	}();

	// `String.prototype.endsWith` method
	// https://tc39.es/ecma262/#sec-string.prototype.endswith
	_export({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG$1 && !CORRECT_IS_REGEXP_LOGIC$1 }, {
	  endsWith: function endsWith(searchString /* , endPosition = @length */) {
	    var that = toString_1$1(requireObjectCoercible(this));
	    notARegexp(searchString);
	    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
	    var len = that.length;
	    var end = endPosition === undefined ? len : min$8(toLength(endPosition), len);
	    var search = toString_1$1(searchString);
	    return slice$6(that, end - search.length, end) === search;
	  }
	});

	var $RangeError$7 = RangeError;
	var fromCharCode$5 = String.fromCharCode;
	// eslint-disable-next-line es/no-string-fromcodepoint -- required for testing
	var $fromCodePoint = String.fromCodePoint;
	var join$7 = functionUncurryThis([].join);

	// length should be 1, old FF problem
	var INCORRECT_LENGTH = !!$fromCodePoint && $fromCodePoint.length !== 1;

	// `String.fromCodePoint` method
	// https://tc39.es/ecma262/#sec-string.fromcodepoint
	_export({ target: 'String', stat: true, arity: 1, forced: INCORRECT_LENGTH }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  fromCodePoint: function fromCodePoint(x) {
	    var elements = [];
	    var length = arguments.length;
	    var i = 0;
	    var code;
	    while (length > i) {
	      code = +arguments[i++];
	      if (toAbsoluteIndex(code, 0x10FFFF) !== code) throw new $RangeError$7(code + ' is not a valid code point');
	      elements[i] = code < 0x10000
	        ? fromCharCode$5(code)
	        : fromCharCode$5(((code -= 0x10000) >> 10) + 0xD800, code % 0x400 + 0xDC00);
	    } return join$7(elements, '');
	  }
	});

	var stringIndexOf$4 = functionUncurryThis(''.indexOf);

	// `String.prototype.includes` method
	// https://tc39.es/ecma262/#sec-string.prototype.includes
	_export({ target: 'String', proto: true, forced: !correctIsRegexpLogic('includes') }, {
	  includes: function includes(searchString /* , position = 0 */) {
	    return !!~stringIndexOf$4(
	      toString_1$1(requireObjectCoercible(this)),
	      toString_1$1(notARegexp(searchString)),
	      arguments.length > 1 ? arguments[1] : undefined
	    );
	  }
	});

	var charCodeAt$5 = functionUncurryThis(''.charCodeAt);

	// `String.prototype.isWellFormed` method
	// https://github.com/tc39/proposal-is-usv-string
	_export({ target: 'String', proto: true }, {
	  isWellFormed: function isWellFormed() {
	    var S = toString_1$1(requireObjectCoercible(this));
	    var length = S.length;
	    for (var i = 0; i < length; i++) {
	      var charCode = charCodeAt$5(S, i);
	      // single UTF-16 code unit
	      if ((charCode & 0xF800) !== 0xD800) continue;
	      // unpaired surrogate
	      if (charCode >= 0xDC00 || ++i >= length || (charCodeAt$5(S, i) & 0xFC00) !== 0xDC00) return false;
	    } return true;
	  }
	});

	var charAt$f = stringMultibyte.charAt;





	var STRING_ITERATOR$1 = 'String Iterator';
	var setInternalState$g = internalState.set;
	var getInternalState$8 = internalState.getterFor(STRING_ITERATOR$1);

	// `String.prototype[@@iterator]` method
	// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
	iteratorDefine(String, 'String', function (iterated) {
	  setInternalState$g(this, {
	    type: STRING_ITERATOR$1,
	    string: toString_1$1(iterated),
	    index: 0
	  });
	// `%StringIteratorPrototype%.next` method
	// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
	}, function next() {
	  var state = getInternalState$8(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return createIterResultObject(undefined, true);
	  point = charAt$f(string, index);
	  state.index += point.length;
	  return createIterResultObject(point, false);
	});

	// TODO: Remove from `core-js@4` since it's moved to entry points








	var SPECIES = wellKnownSymbol('species');
	var RegExpPrototype$1 = RegExp.prototype;

	var fixRegexpWellKnownSymbolLogic = function (KEY, exec, FORCED, SHAM) {
	  var SYMBOL = wellKnownSymbol(KEY);

	  var DELEGATES_TO_SYMBOL = !fails(function () {
	    // String methods call symbol-named RegEp methods
	    var O = {};
	    O[SYMBOL] = function () { return 7; };
	    return ''[KEY](O) !== 7;
	  });

	  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
	    // Symbol-named RegExp methods call .exec
	    var execCalled = false;
	    var re = /a/;

	    if (KEY === 'split') {
	      // We can't use real regex here since it causes deoptimization
	      // and serious performance degradation in V8
	      // https://github.com/zloirock/core-js/issues/306
	      re = {};
	      // RegExp[@@split] doesn't call the regex's exec method, but first creates
	      // a new one. We need to return the patched regex when creating the new one.
	      re.constructor = {};
	      re.constructor[SPECIES] = function () { return re; };
	      re.flags = '';
	      re[SYMBOL] = /./[SYMBOL];
	    }

	    re.exec = function () {
	      execCalled = true;
	      return null;
	    };

	    re[SYMBOL]('');
	    return !execCalled;
	  });

	  if (
	    !DELEGATES_TO_SYMBOL ||
	    !DELEGATES_TO_EXEC ||
	    FORCED
	  ) {
	    var uncurriedNativeRegExpMethod = functionUncurryThisClause(/./[SYMBOL]);
	    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
	      var uncurriedNativeMethod = functionUncurryThisClause(nativeMethod);
	      var $exec = regexp.exec;
	      if ($exec === regexpExec || $exec === RegExpPrototype$1.exec) {
	        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
	          // The native String method already delegates to @@method (this
	          // polyfilled function), leasing to infinite recursion.
	          // We avoid it by directly calling the native @@method method.
	          return { done: true, value: uncurriedNativeRegExpMethod(regexp, str, arg2) };
	        }
	        return { done: true, value: uncurriedNativeMethod(str, regexp, arg2) };
	      }
	      return { done: false };
	    });

	    defineBuiltIn(String.prototype, KEY, methods[0]);
	    defineBuiltIn(RegExpPrototype$1, SYMBOL, methods[1]);
	  }

	  if (SHAM) createNonEnumerableProperty(RegExpPrototype$1[SYMBOL], 'sham', true);
	};

	var charAt$e = stringMultibyte.charAt;

	// `AdvanceStringIndex` abstract operation
	// https://tc39.es/ecma262/#sec-advancestringindex
	var advanceStringIndex = function (S, index, unicode) {
	  return index + (unicode ? charAt$e(S, index).length : 1);
	};

	var $TypeError$q = TypeError;

	// `RegExpExec` abstract operation
	// https://tc39.es/ecma262/#sec-regexpexec
	var regexpExecAbstract = function (R, S) {
	  var exec = R.exec;
	  if (isCallable(exec)) {
	    var result = functionCall(exec, R, S);
	    if (result !== null) anObject(result);
	    return result;
	  }
	  if (classofRaw(R) === 'RegExp') return functionCall(regexpExec, R, S);
	  throw new $TypeError$q('RegExp#exec called on incompatible receiver');
	};

	// @@match logic
	fixRegexpWellKnownSymbolLogic('match', function (MATCH, nativeMatch, maybeCallNative) {
	  return [
	    // `String.prototype.match` method
	    // https://tc39.es/ecma262/#sec-string.prototype.match
	    function match(regexp) {
	      var O = requireObjectCoercible(this);
	      var matcher = isNullOrUndefined(regexp) ? undefined : getMethod(regexp, MATCH);
	      return matcher ? functionCall(matcher, regexp, O) : new RegExp(regexp)[MATCH](toString_1$1(O));
	    },
	    // `RegExp.prototype[@@match]` method
	    // https://tc39.es/ecma262/#sec-regexp.prototype-@@match
	    function (string) {
	      var rx = anObject(this);
	      var S = toString_1$1(string);
	      var res = maybeCallNative(nativeMatch, rx, S);

	      if (res.done) return res.value;

	      if (!rx.global) return regexpExecAbstract(rx, S);

	      var fullUnicode = rx.unicode;
	      rx.lastIndex = 0;
	      var A = [];
	      var n = 0;
	      var result;
	      while ((result = regexpExecAbstract(rx, S)) !== null) {
	        var matchStr = toString_1$1(result[0]);
	        A[n] = matchStr;
	        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
	        n++;
	      }
	      return n === 0 ? null : A;
	    }
	  ];
	});

	/* eslint-disable es/no-string-prototype-matchall -- safe */























	var MATCH_ALL = wellKnownSymbol('matchAll');
	var REGEXP_STRING = 'RegExp String';
	var REGEXP_STRING_ITERATOR = REGEXP_STRING + ' Iterator';
	var setInternalState$f = internalState.set;
	var getInternalState$7 = internalState.getterFor(REGEXP_STRING_ITERATOR);
	var RegExpPrototype = RegExp.prototype;
	var $TypeError$p = TypeError;
	var stringIndexOf$3 = functionUncurryThisClause(''.indexOf);
	var nativeMatchAll = functionUncurryThisClause(''.matchAll);

	var WORKS_WITH_NON_GLOBAL_REGEX = !!nativeMatchAll && !fails(function () {
	  nativeMatchAll('a', /./);
	});

	var $RegExpStringIterator = iteratorCreateConstructor(function RegExpStringIterator(regexp, string, $global, fullUnicode) {
	  setInternalState$f(this, {
	    type: REGEXP_STRING_ITERATOR,
	    regexp: regexp,
	    string: string,
	    global: $global,
	    unicode: fullUnicode,
	    done: false
	  });
	}, REGEXP_STRING, function next() {
	  var state = getInternalState$7(this);
	  if (state.done) return createIterResultObject(undefined, true);
	  var R = state.regexp;
	  var S = state.string;
	  var match = regexpExecAbstract(R, S);
	  if (match === null) {
	    state.done = true;
	    return createIterResultObject(undefined, true);
	  }
	  if (state.global) {
	    if (toString_1$1(match[0]) === '') R.lastIndex = advanceStringIndex(S, toLength(R.lastIndex), state.unicode);
	    return createIterResultObject(match, false);
	  }
	  state.done = true;
	  return createIterResultObject(match, false);
	});

	var $matchAll = function (string) {
	  var R = anObject(this);
	  var S = toString_1$1(string);
	  var C = speciesConstructor(R, RegExp);
	  var flags = toString_1$1(regexpGetFlags(R));
	  var matcher, $global, fullUnicode;
	  matcher = new C(C === RegExp ? R.source : R, flags);
	  $global = !!~stringIndexOf$3(flags, 'g');
	  fullUnicode = !!~stringIndexOf$3(flags, 'u');
	  matcher.lastIndex = toLength(R.lastIndex);
	  return new $RegExpStringIterator(matcher, S, $global, fullUnicode);
	};

	// `String.prototype.matchAll` method
	// https://tc39.es/ecma262/#sec-string.prototype.matchall
	_export({ target: 'String', proto: true, forced: WORKS_WITH_NON_GLOBAL_REGEX }, {
	  matchAll: function matchAll(regexp) {
	    var O = requireObjectCoercible(this);
	    var flags, S, matcher, rx;
	    if (!isNullOrUndefined(regexp)) {
	      if (isRegexp(regexp)) {
	        flags = toString_1$1(requireObjectCoercible(regexpGetFlags(regexp)));
	        if (!~stringIndexOf$3(flags, 'g')) throw new $TypeError$p('`.matchAll` does not allow non-global regexes');
	      }
	      if (WORKS_WITH_NON_GLOBAL_REGEX) return nativeMatchAll(O, regexp);
	      matcher = getMethod(regexp, MATCH_ALL);
	      if (matcher === undefined && isPure && classofRaw(regexp) === 'RegExp') matcher = $matchAll;
	      if (matcher) return functionCall(matcher, regexp, O);
	    } else if (WORKS_WITH_NON_GLOBAL_REGEX) return nativeMatchAll(O, regexp);
	    S = toString_1$1(O);
	    rx = new RegExp(regexp, 'g');
	    return rx[MATCH_ALL](S);
	  }
	});

	MATCH_ALL in RegExpPrototype || defineBuiltIn(RegExpPrototype, MATCH_ALL, $matchAll);

	// https://github.com/zloirock/core-js/issues/280


	var stringPadWebkitBug = /Version\/10(?:\.\d+){1,2}(?: [\w./]+)?(?: Mobile\/\w+)? Safari\//.test(engineUserAgent);

	var $padEnd = stringPad.end;


	// `String.prototype.padEnd` method
	// https://tc39.es/ecma262/#sec-string.prototype.padend
	_export({ target: 'String', proto: true, forced: stringPadWebkitBug }, {
	  padEnd: function padEnd(maxLength /* , fillString = ' ' */) {
	    return $padEnd(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var $padStart = stringPad.start;


	// `String.prototype.padStart` method
	// https://tc39.es/ecma262/#sec-string.prototype.padstart
	_export({ target: 'String', proto: true, forced: stringPadWebkitBug }, {
	  padStart: function padStart(maxLength /* , fillString = ' ' */) {
	    return $padStart(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var push$i = functionUncurryThis([].push);
	var join$6 = functionUncurryThis([].join);

	// `String.raw` method
	// https://tc39.es/ecma262/#sec-string.raw
	_export({ target: 'String', stat: true }, {
	  raw: function raw(template) {
	    var rawTemplate = toIndexedObject(toObject(template).raw);
	    var literalSegments = lengthOfArrayLike(rawTemplate);
	    if (!literalSegments) return '';
	    var argumentsLength = arguments.length;
	    var elements = [];
	    var i = 0;
	    while (true) {
	      push$i(elements, toString_1$1(rawTemplate[i++]));
	      if (i === literalSegments) return join$6(elements, '');
	      if (i < argumentsLength) push$i(elements, toString_1$1(arguments[i]));
	    }
	  }
	});

	// `String.prototype.repeat` method
	// https://tc39.es/ecma262/#sec-string.prototype.repeat
	_export({ target: 'String', proto: true }, {
	  repeat: stringRepeat
	});

	var floor$3 = Math.floor;
	var charAt$d = functionUncurryThis(''.charAt);
	var replace$7 = functionUncurryThis(''.replace);
	var stringSlice$d = functionUncurryThis(''.slice);
	// eslint-disable-next-line redos/no-vulnerable -- safe
	var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
	var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;

	// `GetSubstitution` abstract operation
	// https://tc39.es/ecma262/#sec-getsubstitution
	var getSubstitution = function (matched, str, position, captures, namedCaptures, replacement) {
	  var tailPos = position + matched.length;
	  var m = captures.length;
	  var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
	  if (namedCaptures !== undefined) {
	    namedCaptures = toObject(namedCaptures);
	    symbols = SUBSTITUTION_SYMBOLS;
	  }
	  return replace$7(replacement, symbols, function (match, ch) {
	    var capture;
	    switch (charAt$d(ch, 0)) {
	      case '$': return '$';
	      case '&': return matched;
	      case '`': return stringSlice$d(str, 0, position);
	      case "'": return stringSlice$d(str, tailPos);
	      case '<':
	        capture = namedCaptures[stringSlice$d(ch, 1, -1)];
	        break;
	      default: // \d\d?
	        var n = +ch;
	        if (n === 0) return match;
	        if (n > m) {
	          var f = floor$3(n / 10);
	          if (f === 0) return match;
	          if (f <= m) return captures[f - 1] === undefined ? charAt$d(ch, 1) : captures[f - 1] + charAt$d(ch, 1);
	          return match;
	        }
	        capture = captures[n - 1];
	    }
	    return capture === undefined ? '' : capture;
	  });
	};

	var REPLACE$1 = wellKnownSymbol('replace');
	var max$5 = Math.max;
	var min$7 = Math.min;
	var concat$1 = functionUncurryThis([].concat);
	var push$h = functionUncurryThis([].push);
	var stringIndexOf$2 = functionUncurryThis(''.indexOf);
	var stringSlice$c = functionUncurryThis(''.slice);

	var maybeToString = function (it) {
	  return it === undefined ? it : String(it);
	};

	// IE <= 11 replaces $0 with the whole match, as if it was $&
	// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
	var REPLACE_KEEPS_$0 = (function () {
	  // eslint-disable-next-line regexp/prefer-escape-replacement-dollar-char -- required for testing
	  return 'a'.replace(/./, '$0') === '$0';
	})();

	// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
	var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
	  if (/./[REPLACE$1]) {
	    return /./[REPLACE$1]('a', '$0') === '';
	  }
	  return false;
	})();

	var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
	  var re = /./;
	  re.exec = function () {
	    var result = [];
	    result.groups = { a: '7' };
	    return result;
	  };
	  // eslint-disable-next-line regexp/no-useless-dollar-replacements -- false positive
	  return ''.replace(re, '$<a>') !== '7';
	});

	// @@replace logic
	fixRegexpWellKnownSymbolLogic('replace', function (_, nativeReplace, maybeCallNative) {
	  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

	  return [
	    // `String.prototype.replace` method
	    // https://tc39.es/ecma262/#sec-string.prototype.replace
	    function replace(searchValue, replaceValue) {
	      var O = requireObjectCoercible(this);
	      var replacer = isNullOrUndefined(searchValue) ? undefined : getMethod(searchValue, REPLACE$1);
	      return replacer
	        ? functionCall(replacer, searchValue, O, replaceValue)
	        : functionCall(nativeReplace, toString_1$1(O), searchValue, replaceValue);
	    },
	    // `RegExp.prototype[@@replace]` method
	    // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
	    function (string, replaceValue) {
	      var rx = anObject(this);
	      var S = toString_1$1(string);

	      if (
	        typeof replaceValue == 'string' &&
	        stringIndexOf$2(replaceValue, UNSAFE_SUBSTITUTE) === -1 &&
	        stringIndexOf$2(replaceValue, '$<') === -1
	      ) {
	        var res = maybeCallNative(nativeReplace, rx, S, replaceValue);
	        if (res.done) return res.value;
	      }

	      var functionalReplace = isCallable(replaceValue);
	      if (!functionalReplace) replaceValue = toString_1$1(replaceValue);

	      var global = rx.global;
	      var fullUnicode;
	      if (global) {
	        fullUnicode = rx.unicode;
	        rx.lastIndex = 0;
	      }

	      var results = [];
	      var result;
	      while (true) {
	        result = regexpExecAbstract(rx, S);
	        if (result === null) break;

	        push$h(results, result);
	        if (!global) break;

	        var matchStr = toString_1$1(result[0]);
	        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
	      }

	      var accumulatedResult = '';
	      var nextSourcePosition = 0;
	      for (var i = 0; i < results.length; i++) {
	        result = results[i];

	        var matched = toString_1$1(result[0]);
	        var position = max$5(min$7(toIntegerOrInfinity(result.index), S.length), 0);
	        var captures = [];
	        var replacement;
	        // NOTE: This is equivalent to
	        //   captures = result.slice(1).map(maybeToString)
	        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
	        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
	        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
	        for (var j = 1; j < result.length; j++) push$h(captures, maybeToString(result[j]));
	        var namedCaptures = result.groups;
	        if (functionalReplace) {
	          var replacerArgs = concat$1([matched], captures, position, S);
	          if (namedCaptures !== undefined) push$h(replacerArgs, namedCaptures);
	          replacement = toString_1$1(functionApply(replaceValue, undefined, replacerArgs));
	        } else {
	          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
	        }
	        if (position >= nextSourcePosition) {
	          accumulatedResult += stringSlice$c(S, nextSourcePosition, position) + replacement;
	          nextSourcePosition = position + matched.length;
	        }
	      }

	      return accumulatedResult + stringSlice$c(S, nextSourcePosition);
	    }
	  ];
	}, !REPLACE_SUPPORTS_NAMED_GROUPS || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);

	var REPLACE = wellKnownSymbol('replace');
	var $TypeError$o = TypeError;
	var indexOf = functionUncurryThis(''.indexOf);
	functionUncurryThis(''.replace);
	var stringSlice$b = functionUncurryThis(''.slice);
	var max$4 = Math.max;

	var stringIndexOf$1 = function (string, searchValue, fromIndex) {
	  if (fromIndex > string.length) return -1;
	  if (searchValue === '') return fromIndex;
	  return indexOf(string, searchValue, fromIndex);
	};

	// `String.prototype.replaceAll` method
	// https://tc39.es/ecma262/#sec-string.prototype.replaceall
	_export({ target: 'String', proto: true }, {
	  replaceAll: function replaceAll(searchValue, replaceValue) {
	    var O = requireObjectCoercible(this);
	    var IS_REG_EXP, flags, replacer, string, searchString, functionalReplace, searchLength, advanceBy, replacement;
	    var position = 0;
	    var endOfLastMatch = 0;
	    var result = '';
	    if (!isNullOrUndefined(searchValue)) {
	      IS_REG_EXP = isRegexp(searchValue);
	      if (IS_REG_EXP) {
	        flags = toString_1$1(requireObjectCoercible(regexpGetFlags(searchValue)));
	        if (!~indexOf(flags, 'g')) throw new $TypeError$o('`.replaceAll` does not allow non-global regexes');
	      }
	      replacer = getMethod(searchValue, REPLACE);
	      if (replacer) {
	        return functionCall(replacer, searchValue, O, replaceValue);
	      }
	    }
	    string = toString_1$1(O);
	    searchString = toString_1$1(searchValue);
	    functionalReplace = isCallable(replaceValue);
	    if (!functionalReplace) replaceValue = toString_1$1(replaceValue);
	    searchLength = searchString.length;
	    advanceBy = max$4(1, searchLength);
	    position = stringIndexOf$1(string, searchString, 0);
	    while (position !== -1) {
	      replacement = functionalReplace
	        ? toString_1$1(replaceValue(searchString, position, string))
	        : getSubstitution(searchString, string, position, [], undefined, replaceValue);
	      result += stringSlice$b(string, endOfLastMatch, position) + replacement;
	      endOfLastMatch = position + searchLength;
	      position = stringIndexOf$1(string, searchString, position + advanceBy);
	    }
	    if (endOfLastMatch < string.length) {
	      result += stringSlice$b(string, endOfLastMatch);
	    }
	    return result;
	  }
	});

	// @@search logic
	fixRegexpWellKnownSymbolLogic('search', function (SEARCH, nativeSearch, maybeCallNative) {
	  return [
	    // `String.prototype.search` method
	    // https://tc39.es/ecma262/#sec-string.prototype.search
	    function search(regexp) {
	      var O = requireObjectCoercible(this);
	      var searcher = isNullOrUndefined(regexp) ? undefined : getMethod(regexp, SEARCH);
	      return searcher ? functionCall(searcher, regexp, O) : new RegExp(regexp)[SEARCH](toString_1$1(O));
	    },
	    // `RegExp.prototype[@@search]` method
	    // https://tc39.es/ecma262/#sec-regexp.prototype-@@search
	    function (string) {
	      var rx = anObject(this);
	      var S = toString_1$1(string);
	      var res = maybeCallNative(nativeSearch, rx, S);

	      if (res.done) return res.value;

	      var previousLastIndex = rx.lastIndex;
	      if (!sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
	      var result = regexpExecAbstract(rx, S);
	      if (!sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
	      return result === null ? -1 : result.index;
	    }
	  ];
	});

	var UNSUPPORTED_Y = regexpStickyHelpers.UNSUPPORTED_Y;
	var MAX_UINT32 = 0xFFFFFFFF;
	var min$6 = Math.min;
	var $push = [].push;
	var exec$b = functionUncurryThis(/./.exec);
	var push$g = functionUncurryThis($push);
	var stringSlice$a = functionUncurryThis(''.slice);

	// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
	// Weex JS has frozen built-in prototypes, so use try / catch wrapper
	var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
	  // eslint-disable-next-line regexp/no-empty-group -- required for testing
	  var re = /(?:)/;
	  var originalExec = re.exec;
	  re.exec = function () { return originalExec.apply(this, arguments); };
	  var result = 'ab'.split(re);
	  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
	});

	// @@split logic
	fixRegexpWellKnownSymbolLogic('split', function (SPLIT, nativeSplit, maybeCallNative) {
	  var internalSplit;
	  if (
	    'abbc'.split(/(b)*/)[1] === 'c' ||
	    // eslint-disable-next-line regexp/no-empty-group -- required for testing
	    'test'.split(/(?:)/, -1).length !== 4 ||
	    'ab'.split(/(?:ab)*/).length !== 2 ||
	    '.'.split(/(.?)(.?)/).length !== 4 ||
	    // eslint-disable-next-line regexp/no-empty-capturing-group, regexp/no-empty-group -- required for testing
	    '.'.split(/()()/).length > 1 ||
	    ''.split(/.?/).length
	  ) {
	    // based on es5-shim implementation, need to rework it
	    internalSplit = function (separator, limit) {
	      var string = toString_1$1(requireObjectCoercible(this));
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (separator === undefined) return [string];
	      // If `separator` is not a regex, use native split
	      if (!isRegexp(separator)) {
	        return functionCall(nativeSplit, string, separator, lim);
	      }
	      var output = [];
	      var flags = (separator.ignoreCase ? 'i' : '') +
	                  (separator.multiline ? 'm' : '') +
	                  (separator.unicode ? 'u' : '') +
	                  (separator.sticky ? 'y' : '');
	      var lastLastIndex = 0;
	      // Make `global` and avoid `lastIndex` issues by working with a copy
	      var separatorCopy = new RegExp(separator.source, flags + 'g');
	      var match, lastIndex, lastLength;
	      while (match = functionCall(regexpExec, separatorCopy, string)) {
	        lastIndex = separatorCopy.lastIndex;
	        if (lastIndex > lastLastIndex) {
	          push$g(output, stringSlice$a(string, lastLastIndex, match.index));
	          if (match.length > 1 && match.index < string.length) functionApply($push, output, arraySlice(match, 1));
	          lastLength = match[0].length;
	          lastLastIndex = lastIndex;
	          if (output.length >= lim) break;
	        }
	        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
	      }
	      if (lastLastIndex === string.length) {
	        if (lastLength || !exec$b(separatorCopy, '')) push$g(output, '');
	      } else push$g(output, stringSlice$a(string, lastLastIndex));
	      return output.length > lim ? arraySlice(output, 0, lim) : output;
	    };
	  // Chakra, V8
	  } else if ('0'.split(undefined, 0).length) {
	    internalSplit = function (separator, limit) {
	      return separator === undefined && limit === 0 ? [] : functionCall(nativeSplit, this, separator, limit);
	    };
	  } else internalSplit = nativeSplit;

	  return [
	    // `String.prototype.split` method
	    // https://tc39.es/ecma262/#sec-string.prototype.split
	    function split(separator, limit) {
	      var O = requireObjectCoercible(this);
	      var splitter = isNullOrUndefined(separator) ? undefined : getMethod(separator, SPLIT);
	      return splitter
	        ? functionCall(splitter, separator, O, limit)
	        : functionCall(internalSplit, toString_1$1(O), separator, limit);
	    },
	    // `RegExp.prototype[@@split]` method
	    // https://tc39.es/ecma262/#sec-regexp.prototype-@@split
	    //
	    // NOTE: This cannot be properly polyfilled in engines that don't support
	    // the 'y' flag.
	    function (string, limit) {
	      var rx = anObject(this);
	      var S = toString_1$1(string);
	      var res = maybeCallNative(internalSplit, rx, S, limit, internalSplit !== nativeSplit);

	      if (res.done) return res.value;

	      var C = speciesConstructor(rx, RegExp);

	      var unicodeMatching = rx.unicode;
	      var flags = (rx.ignoreCase ? 'i' : '') +
	                  (rx.multiline ? 'm' : '') +
	                  (rx.unicode ? 'u' : '') +
	                  (UNSUPPORTED_Y ? 'g' : 'y');

	      // ^(? + rx + ) is needed, in combination with some S slicing, to
	      // simulate the 'y' flag.
	      var splitter = new C(UNSUPPORTED_Y ? '^(?:' + rx.source + ')' : rx, flags);
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (S.length === 0) return regexpExecAbstract(splitter, S) === null ? [S] : [];
	      var p = 0;
	      var q = 0;
	      var A = [];
	      while (q < S.length) {
	        splitter.lastIndex = UNSUPPORTED_Y ? 0 : q;
	        var z = regexpExecAbstract(splitter, UNSUPPORTED_Y ? stringSlice$a(S, q) : S);
	        var e;
	        if (
	          z === null ||
	          (e = min$6(toLength(splitter.lastIndex + (UNSUPPORTED_Y ? q : 0)), S.length)) === p
	        ) {
	          q = advanceStringIndex(S, q, unicodeMatching);
	        } else {
	          push$g(A, stringSlice$a(S, p, q));
	          if (A.length === lim) return A;
	          for (var i = 1; i <= z.length - 1; i++) {
	            push$g(A, z[i]);
	            if (A.length === lim) return A;
	          }
	          q = p = e;
	        }
	      }
	      push$g(A, stringSlice$a(S, p));
	      return A;
	    }
	  ];
	}, !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC, UNSUPPORTED_Y);

	var getOwnPropertyDescriptor$4 = objectGetOwnPropertyDescriptor.f;







	var stringSlice$9 = functionUncurryThisClause(''.slice);
	var min$5 = Math.min;

	var CORRECT_IS_REGEXP_LOGIC = correctIsRegexpLogic('startsWith');
	// https://github.com/zloirock/core-js/pull/702
	var MDN_POLYFILL_BUG = !CORRECT_IS_REGEXP_LOGIC && !!function () {
	  var descriptor = getOwnPropertyDescriptor$4(String.prototype, 'startsWith');
	  return descriptor && !descriptor.writable;
	}();

	// `String.prototype.startsWith` method
	// https://tc39.es/ecma262/#sec-string.prototype.startswith
	_export({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC }, {
	  startsWith: function startsWith(searchString /* , position = 0 */) {
	    var that = toString_1$1(requireObjectCoercible(this));
	    notARegexp(searchString);
	    var index = toLength(min$5(arguments.length > 1 ? arguments[1] : undefined, that.length));
	    var search = toString_1$1(searchString);
	    return stringSlice$9(that, index, index + search.length) === search;
	  }
	});

	var stringSlice$8 = functionUncurryThis(''.slice);
	var max$3 = Math.max;
	var min$4 = Math.min;

	// eslint-disable-next-line unicorn/prefer-string-slice -- required for testing
	var FORCED$4 = !''.substr || 'ab'.substr(-1) !== 'b';

	// `String.prototype.substr` method
	// https://tc39.es/ecma262/#sec-string.prototype.substr
	_export({ target: 'String', proto: true, forced: FORCED$4 }, {
	  substr: function substr(start, length) {
	    var that = toString_1$1(requireObjectCoercible(this));
	    var size = that.length;
	    var intStart = toIntegerOrInfinity(start);
	    var intLength, intEnd;
	    if (intStart === Infinity) intStart = 0;
	    if (intStart < 0) intStart = max$3(size + intStart, 0);
	    intLength = length === undefined ? size : toIntegerOrInfinity(length);
	    if (intLength <= 0 || intLength === Infinity) return '';
	    intEnd = min$4(intStart + intLength, size);
	    return intStart >= intEnd ? '' : stringSlice$8(that, intStart, intEnd);
	  }
	});

	var $Array$2 = Array;
	var charAt$c = functionUncurryThis(''.charAt);
	var charCodeAt$4 = functionUncurryThis(''.charCodeAt);
	var join$5 = functionUncurryThis([].join);
	// eslint-disable-next-line es/no-string-prototype-iswellformed-towellformed -- safe
	var $toWellFormed = ''.toWellFormed;
	var REPLACEMENT_CHARACTER = '\uFFFD';

	// Safari bug
	var TO_STRING_CONVERSION_BUG = $toWellFormed && fails(function () {
	  return functionCall($toWellFormed, 1) !== '1';
	});

	// `String.prototype.toWellFormed` method
	// https://github.com/tc39/proposal-is-usv-string
	_export({ target: 'String', proto: true, forced: TO_STRING_CONVERSION_BUG }, {
	  toWellFormed: function toWellFormed() {
	    var S = toString_1$1(requireObjectCoercible(this));
	    if (TO_STRING_CONVERSION_BUG) return functionCall($toWellFormed, S);
	    var length = S.length;
	    var result = $Array$2(length);
	    for (var i = 0; i < length; i++) {
	      var charCode = charCodeAt$4(S, i);
	      // single UTF-16 code unit
	      if ((charCode & 0xF800) !== 0xD800) result[i] = charAt$c(S, i);
	      // unpaired surrogate
	      else if (charCode >= 0xDC00 || i + 1 >= length || (charCodeAt$4(S, i + 1) & 0xFC00) !== 0xDC00) result[i] = REPLACEMENT_CHARACTER;
	      // surrogate pair
	      else {
	        result[i] = charAt$c(S, i);
	        result[++i] = charAt$c(S, i);
	      }
	    } return join$5(result, '');
	  }
	});

	var PROPER_FUNCTION_NAME = functionName.PROPER;



	var non = '\u200B\u0085\u180E';

	// check that a method works with the correct list
	// of whitespaces and has a correct name
	var stringTrimForced = function (METHOD_NAME) {
	  return fails(function () {
	    return !!whitespaces$1[METHOD_NAME]()
	      || non[METHOD_NAME]() !== non
	      || (PROPER_FUNCTION_NAME && whitespaces$1[METHOD_NAME].name !== METHOD_NAME);
	  });
	};

	var $trim = stringTrim.trim;


	// `String.prototype.trim` method
	// https://tc39.es/ecma262/#sec-string.prototype.trim
	_export({ target: 'String', proto: true, forced: stringTrimForced('trim') }, {
	  trim: function trim() {
	    return $trim(this);
	  }
	});

	var $trimEnd = stringTrim.end;


	// `String.prototype.{ trimEnd, trimRight }` method
	// https://tc39.es/ecma262/#sec-string.prototype.trimend
	// https://tc39.es/ecma262/#String.prototype.trimright
	var stringTrimEnd = stringTrimForced('trimEnd') ? function trimEnd() {
	  return $trimEnd(this);
	// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
	} : ''.trimEnd;

	// `String.prototype.trimRight` method
	// https://tc39.es/ecma262/#sec-string.prototype.trimend
	// eslint-disable-next-line es/no-string-prototype-trimleft-trimright -- safe
	_export({ target: 'String', proto: true, name: 'trimEnd', forced: ''.trimRight !== stringTrimEnd }, {
	  trimRight: stringTrimEnd
	});

	// TODO: Remove this line from `core-js@4`




	// `String.prototype.trimEnd` method
	// https://tc39.es/ecma262/#sec-string.prototype.trimend
	// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
	_export({ target: 'String', proto: true, name: 'trimEnd', forced: ''.trimEnd !== stringTrimEnd }, {
	  trimEnd: stringTrimEnd
	});

	var $trimStart = stringTrim.start;


	// `String.prototype.{ trimStart, trimLeft }` method
	// https://tc39.es/ecma262/#sec-string.prototype.trimstart
	// https://tc39.es/ecma262/#String.prototype.trimleft
	var stringTrimStart = stringTrimForced('trimStart') ? function trimStart() {
	  return $trimStart(this);
	// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
	} : ''.trimStart;

	// `String.prototype.trimLeft` method
	// https://tc39.es/ecma262/#sec-string.prototype.trimleft
	// eslint-disable-next-line es/no-string-prototype-trimleft-trimright -- safe
	_export({ target: 'String', proto: true, name: 'trimStart', forced: ''.trimLeft !== stringTrimStart }, {
	  trimLeft: stringTrimStart
	});

	// TODO: Remove this line from `core-js@4`




	// `String.prototype.trimStart` method
	// https://tc39.es/ecma262/#sec-string.prototype.trimstart
	// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
	_export({ target: 'String', proto: true, name: 'trimStart', forced: ''.trimStart !== stringTrimStart }, {
	  trimStart: stringTrimStart
	});

	var quot = /"/g;
	var replace$6 = functionUncurryThis(''.replace);

	// `CreateHTML` abstract operation
	// https://tc39.es/ecma262/#sec-createhtml
	var createHtml = function (string, tag, attribute, value) {
	  var S = toString_1$1(requireObjectCoercible(string));
	  var p1 = '<' + tag;
	  if (attribute !== '') p1 += ' ' + attribute + '="' + replace$6(toString_1$1(value), quot, '&quot;') + '"';
	  return p1 + '>' + S + '</' + tag + '>';
	};

	// check the existence of a method, lowercase
	// of a tag and escaping quotes in arguments
	var stringHtmlForced = function (METHOD_NAME) {
	  return fails(function () {
	    var test = ''[METHOD_NAME]('"');
	    return test !== test.toLowerCase() || test.split('"').length > 3;
	  });
	};

	// `String.prototype.anchor` method
	// https://tc39.es/ecma262/#sec-string.prototype.anchor
	_export({ target: 'String', proto: true, forced: stringHtmlForced('anchor') }, {
	  anchor: function anchor(name) {
	    return createHtml(this, 'a', 'name', name);
	  }
	});

	// `String.prototype.big` method
	// https://tc39.es/ecma262/#sec-string.prototype.big
	_export({ target: 'String', proto: true, forced: stringHtmlForced('big') }, {
	  big: function big() {
	    return createHtml(this, 'big', '', '');
	  }
	});

	// `String.prototype.blink` method
	// https://tc39.es/ecma262/#sec-string.prototype.blink
	_export({ target: 'String', proto: true, forced: stringHtmlForced('blink') }, {
	  blink: function blink() {
	    return createHtml(this, 'blink', '', '');
	  }
	});

	// `String.prototype.bold` method
	// https://tc39.es/ecma262/#sec-string.prototype.bold
	_export({ target: 'String', proto: true, forced: stringHtmlForced('bold') }, {
	  bold: function bold() {
	    return createHtml(this, 'b', '', '');
	  }
	});

	// `String.prototype.fixed` method
	// https://tc39.es/ecma262/#sec-string.prototype.fixed
	_export({ target: 'String', proto: true, forced: stringHtmlForced('fixed') }, {
	  fixed: function fixed() {
	    return createHtml(this, 'tt', '', '');
	  }
	});

	// `String.prototype.fontcolor` method
	// https://tc39.es/ecma262/#sec-string.prototype.fontcolor
	_export({ target: 'String', proto: true, forced: stringHtmlForced('fontcolor') }, {
	  fontcolor: function fontcolor(color) {
	    return createHtml(this, 'font', 'color', color);
	  }
	});

	// `String.prototype.fontsize` method
	// https://tc39.es/ecma262/#sec-string.prototype.fontsize
	_export({ target: 'String', proto: true, forced: stringHtmlForced('fontsize') }, {
	  fontsize: function fontsize(size) {
	    return createHtml(this, 'font', 'size', size);
	  }
	});

	// `String.prototype.italics` method
	// https://tc39.es/ecma262/#sec-string.prototype.italics
	_export({ target: 'String', proto: true, forced: stringHtmlForced('italics') }, {
	  italics: function italics() {
	    return createHtml(this, 'i', '', '');
	  }
	});

	// `String.prototype.link` method
	// https://tc39.es/ecma262/#sec-string.prototype.link
	_export({ target: 'String', proto: true, forced: stringHtmlForced('link') }, {
	  link: function link(url) {
	    return createHtml(this, 'a', 'href', url);
	  }
	});

	// `String.prototype.small` method
	// https://tc39.es/ecma262/#sec-string.prototype.small
	_export({ target: 'String', proto: true, forced: stringHtmlForced('small') }, {
	  small: function small() {
	    return createHtml(this, 'small', '', '');
	  }
	});

	// `String.prototype.strike` method
	// https://tc39.es/ecma262/#sec-string.prototype.strike
	_export({ target: 'String', proto: true, forced: stringHtmlForced('strike') }, {
	  strike: function strike() {
	    return createHtml(this, 'strike', '', '');
	  }
	});

	// `String.prototype.sub` method
	// https://tc39.es/ecma262/#sec-string.prototype.sub
	_export({ target: 'String', proto: true, forced: stringHtmlForced('sub') }, {
	  sub: function sub() {
	    return createHtml(this, 'sub', '', '');
	  }
	});

	// `String.prototype.sup` method
	// https://tc39.es/ecma262/#sec-string.prototype.sup
	_export({ target: 'String', proto: true, forced: stringHtmlForced('sup') }, {
	  sup: function sup() {
	    return createHtml(this, 'sup', '', '');
	  }
	});

	/* eslint-disable no-new -- required for testing */



	var NATIVE_ARRAY_BUFFER_VIEWS = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;

	var ArrayBuffer$2 = global_1.ArrayBuffer;
	var Int8Array$3 = global_1.Int8Array;

	var typedArrayConstructorsRequireWrappers = !NATIVE_ARRAY_BUFFER_VIEWS || !fails(function () {
	  Int8Array$3(1);
	}) || !fails(function () {
	  new Int8Array$3(-1);
	}) || !checkCorrectnessOfIteration(function (iterable) {
	  new Int8Array$3();
	  new Int8Array$3(null);
	  new Int8Array$3(1.5);
	  new Int8Array$3(iterable);
	}, true) || fails(function () {
	  // Safari (11+) bug - a reason why even Safari 13 should load a typed array polyfill
	  return new Int8Array$3(new ArrayBuffer$2(2), 1, undefined).length !== 1;
	});

	var $RangeError$6 = RangeError;

	var toPositiveInteger = function (it) {
	  var result = toIntegerOrInfinity(it);
	  if (result < 0) throw new $RangeError$6("The argument can't be less than 0");
	  return result;
	};

	var $RangeError$5 = RangeError;

	var toOffset = function (it, BYTES) {
	  var offset = toPositiveInteger(it);
	  if (offset % BYTES) throw new $RangeError$5('Wrong offset');
	  return offset;
	};

	var round = Math.round;

	var toUint8Clamped = function (it) {
	  var value = round(it);
	  return value < 0 ? 0 : value > 0xFF ? 0xFF : value & 0xFF;
	};

	var isBigIntArray = function (it) {
	  var klass = classof(it);
	  return klass === 'BigInt64Array' || klass === 'BigUint64Array';
	};

	var $TypeError$n = TypeError;

	// `ToBigInt` abstract operation
	// https://tc39.es/ecma262/#sec-tobigint
	var toBigInt = function (argument) {
	  var prim = toPrimitive(argument, 'number');
	  if (typeof prim == 'number') throw new $TypeError$n("Can't convert number to bigint");
	  // eslint-disable-next-line es/no-bigint -- safe
	  return BigInt(prim);
	};

	var aTypedArrayConstructor$3 = arrayBufferViewCore.aTypedArrayConstructor;


	var typedArrayFrom = function from(source /* , mapfn, thisArg */) {
	  var C = aConstructor(this);
	  var O = toObject(source);
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  var iteratorMethod = getIteratorMethod(O);
	  var i, length, result, thisIsBigIntArray, value, step, iterator, next;
	  if (iteratorMethod && !isArrayIteratorMethod(iteratorMethod)) {
	    iterator = getIterator(O, iteratorMethod);
	    next = iterator.next;
	    O = [];
	    while (!(step = functionCall(next, iterator)).done) {
	      O.push(step.value);
	    }
	  }
	  if (mapping && argumentsLength > 2) {
	    mapfn = functionBindContext(mapfn, arguments[2]);
	  }
	  length = lengthOfArrayLike(O);
	  result = new (aTypedArrayConstructor$3(C))(length);
	  thisIsBigIntArray = isBigIntArray(result);
	  for (i = 0; length > i; i++) {
	    value = mapping ? mapfn(O[i], i) : O[i];
	    // FF30- typed arrays doesn't properly convert objects to typed array values
	    result[i] = thisIsBigIntArray ? toBigInt(value) : +value;
	  }
	  return result;
	};

	var typedArrayConstructor = createCommonjsModule(function (module) {























	var getOwnPropertyNames = objectGetOwnPropertyNames.f;

	var forEach = arrayIteration.forEach;








	var getInternalState = internalState.get;
	var setInternalState = internalState.set;
	var enforceInternalState = internalState.enforce;
	var nativeDefineProperty = objectDefineProperty.f;
	var nativeGetOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	var RangeError = global_1.RangeError;
	var ArrayBuffer = arrayBuffer.ArrayBuffer;
	var ArrayBufferPrototype = ArrayBuffer.prototype;
	var DataView = arrayBuffer.DataView;
	var NATIVE_ARRAY_BUFFER_VIEWS = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;
	var TYPED_ARRAY_TAG = arrayBufferViewCore.TYPED_ARRAY_TAG;
	var TypedArray = arrayBufferViewCore.TypedArray;
	var TypedArrayPrototype = arrayBufferViewCore.TypedArrayPrototype;
	var isTypedArray = arrayBufferViewCore.isTypedArray;
	var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
	var WRONG_LENGTH = 'Wrong length';

	var addGetter = function (it, key) {
	  defineBuiltInAccessor(it, key, {
	    configurable: true,
	    get: function () {
	      return getInternalState(this)[key];
	    }
	  });
	};

	var isArrayBuffer = function (it) {
	  var klass;
	  return objectIsPrototypeOf(ArrayBufferPrototype, it) || (klass = classof(it)) === 'ArrayBuffer' || klass === 'SharedArrayBuffer';
	};

	var isTypedArrayIndex = function (target, key) {
	  return isTypedArray(target)
	    && !isSymbol$1(key)
	    && key in target
	    && isIntegralNumber(+key)
	    && key >= 0;
	};

	var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
	  key = toPropertyKey(key);
	  return isTypedArrayIndex(target, key)
	    ? createPropertyDescriptor(2, target[key])
	    : nativeGetOwnPropertyDescriptor(target, key);
	};

	var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
	  key = toPropertyKey(key);
	  if (isTypedArrayIndex(target, key)
	    && isObject$1(descriptor)
	    && hasOwnProperty_1(descriptor, 'value')
	    && !hasOwnProperty_1(descriptor, 'get')
	    && !hasOwnProperty_1(descriptor, 'set')
	    // TODO: add validation descriptor w/o calling accessors
	    && !descriptor.configurable
	    && (!hasOwnProperty_1(descriptor, 'writable') || descriptor.writable)
	    && (!hasOwnProperty_1(descriptor, 'enumerable') || descriptor.enumerable)
	  ) {
	    target[key] = descriptor.value;
	    return target;
	  } return nativeDefineProperty(target, key, descriptor);
	};

	if (descriptors) {
	  if (!NATIVE_ARRAY_BUFFER_VIEWS) {
	    objectGetOwnPropertyDescriptor.f = wrappedGetOwnPropertyDescriptor;
	    objectDefineProperty.f = wrappedDefineProperty;
	    addGetter(TypedArrayPrototype, 'buffer');
	    addGetter(TypedArrayPrototype, 'byteOffset');
	    addGetter(TypedArrayPrototype, 'byteLength');
	    addGetter(TypedArrayPrototype, 'length');
	  }

	  _export({ target: 'Object', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
	    getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
	    defineProperty: wrappedDefineProperty
	  });

	  module.exports = function (TYPE, wrapper, CLAMPED) {
	    var BYTES = TYPE.match(/\d+/)[0] / 8;
	    var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
	    var GETTER = 'get' + TYPE;
	    var SETTER = 'set' + TYPE;
	    var NativeTypedArrayConstructor = global_1[CONSTRUCTOR_NAME];
	    var TypedArrayConstructor = NativeTypedArrayConstructor;
	    var TypedArrayConstructorPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;
	    var exported = {};

	    var getter = function (that, index) {
	      var data = getInternalState(that);
	      return data.view[GETTER](index * BYTES + data.byteOffset, true);
	    };

	    var setter = function (that, index, value) {
	      var data = getInternalState(that);
	      data.view[SETTER](index * BYTES + data.byteOffset, CLAMPED ? toUint8Clamped(value) : value, true);
	    };

	    var addElement = function (that, index) {
	      nativeDefineProperty(that, index, {
	        get: function () {
	          return getter(this, index);
	        },
	        set: function (value) {
	          return setter(this, index, value);
	        },
	        enumerable: true
	      });
	    };

	    if (!NATIVE_ARRAY_BUFFER_VIEWS) {
	      TypedArrayConstructor = wrapper(function (that, data, offset, $length) {
	        anInstance(that, TypedArrayConstructorPrototype);
	        var index = 0;
	        var byteOffset = 0;
	        var buffer, byteLength, length;
	        if (!isObject$1(data)) {
	          length = toIndex(data);
	          byteLength = length * BYTES;
	          buffer = new ArrayBuffer(byteLength);
	        } else if (isArrayBuffer(data)) {
	          buffer = data;
	          byteOffset = toOffset(offset, BYTES);
	          var $len = data.byteLength;
	          if ($length === undefined) {
	            if ($len % BYTES) throw new RangeError(WRONG_LENGTH);
	            byteLength = $len - byteOffset;
	            if (byteLength < 0) throw new RangeError(WRONG_LENGTH);
	          } else {
	            byteLength = toLength($length) * BYTES;
	            if (byteLength + byteOffset > $len) throw new RangeError(WRONG_LENGTH);
	          }
	          length = byteLength / BYTES;
	        } else if (isTypedArray(data)) {
	          return arrayFromConstructorAndList(TypedArrayConstructor, data);
	        } else {
	          return functionCall(typedArrayFrom, TypedArrayConstructor, data);
	        }
	        setInternalState(that, {
	          buffer: buffer,
	          byteOffset: byteOffset,
	          byteLength: byteLength,
	          length: length,
	          view: new DataView(buffer)
	        });
	        while (index < length) addElement(that, index++);
	      });

	      if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
	      TypedArrayConstructorPrototype = TypedArrayConstructor.prototype = objectCreate(TypedArrayPrototype);
	    } else if (typedArrayConstructorsRequireWrappers) {
	      TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, $length) {
	        anInstance(dummy, TypedArrayConstructorPrototype);
	        return inheritIfRequired(function () {
	          if (!isObject$1(data)) return new NativeTypedArrayConstructor(toIndex(data));
	          if (isArrayBuffer(data)) return $length !== undefined
	            ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES), $length)
	            : typedArrayOffset !== undefined
	              ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES))
	              : new NativeTypedArrayConstructor(data);
	          if (isTypedArray(data)) return arrayFromConstructorAndList(TypedArrayConstructor, data);
	          return functionCall(typedArrayFrom, TypedArrayConstructor, data);
	        }(), dummy, TypedArrayConstructor);
	      });

	      if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
	      forEach(getOwnPropertyNames(NativeTypedArrayConstructor), function (key) {
	        if (!(key in TypedArrayConstructor)) {
	          createNonEnumerableProperty(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
	        }
	      });
	      TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
	    }

	    if (TypedArrayConstructorPrototype.constructor !== TypedArrayConstructor) {
	      createNonEnumerableProperty(TypedArrayConstructorPrototype, 'constructor', TypedArrayConstructor);
	    }

	    enforceInternalState(TypedArrayConstructorPrototype).TypedArrayConstructor = TypedArrayConstructor;

	    if (TYPED_ARRAY_TAG) {
	      createNonEnumerableProperty(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG, CONSTRUCTOR_NAME);
	    }

	    var FORCED = TypedArrayConstructor !== NativeTypedArrayConstructor;

	    exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;

	    _export({ global: true, constructor: true, forced: FORCED, sham: !NATIVE_ARRAY_BUFFER_VIEWS }, exported);

	    if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
	      createNonEnumerableProperty(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
	    }

	    if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
	      createNonEnumerableProperty(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
	    }

	    setSpecies(CONSTRUCTOR_NAME);
	  };
	} else module.exports = function () { /* empty */ };
	});

	// `Float32Array` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	typedArrayConstructor('Float32', function (init) {
	  return function Float32Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	// `Float64Array` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	typedArrayConstructor('Float64', function (init) {
	  return function Float64Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	// `Int8Array` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	typedArrayConstructor('Int8', function (init) {
	  return function Int8Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	// `Int16Array` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	typedArrayConstructor('Int16', function (init) {
	  return function Int16Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	// `Int32Array` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	typedArrayConstructor('Int32', function (init) {
	  return function Int32Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	// `Uint8Array` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	typedArrayConstructor('Uint8', function (init) {
	  return function Uint8Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	// `Uint8ClampedArray` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	typedArrayConstructor('Uint8', function (init) {
	  return function Uint8ClampedArray(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	}, true);

	// `Uint16Array` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	typedArrayConstructor('Uint16', function (init) {
	  return function Uint16Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	// `Uint32Array` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	typedArrayConstructor('Uint32', function (init) {
	  return function Uint32Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	var aTypedArray$w = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$x = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.at` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.at
	exportTypedArrayMethod$x('at', function at(index) {
	  var O = aTypedArray$w(this);
	  var len = lengthOfArrayLike(O);
	  var relativeIndex = toIntegerOrInfinity(index);
	  var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
	  return (k < 0 || k >= len) ? undefined : O[k];
	});

	var u$ArrayCopyWithin = functionUncurryThis(arrayCopyWithin);
	var aTypedArray$v = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$w = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.copyWithin` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.copywithin
	exportTypedArrayMethod$w('copyWithin', function copyWithin(target, start /* , end */) {
	  return u$ArrayCopyWithin(aTypedArray$v(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
	});

	var $every$1 = arrayIteration.every;

	var aTypedArray$u = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$v = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.every` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.every
	exportTypedArrayMethod$v('every', function every(callbackfn /* , thisArg */) {
	  return $every$1(aTypedArray$u(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});

	var aTypedArray$t = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$u = arrayBufferViewCore.exportTypedArrayMethod;
	var slice$5 = functionUncurryThis(''.slice);

	// V8 ~ Chrome < 59, Safari < 14.1, FF < 55, Edge <=18
	var CONVERSION_BUG = fails(function () {
	  var count = 0;
	  // eslint-disable-next-line es/no-typed-arrays -- safe
	  new Int8Array(2).fill({ valueOf: function () { return count++; } });
	  return count !== 1;
	});

	// `%TypedArray%.prototype.fill` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.fill
	exportTypedArrayMethod$u('fill', function fill(value /* , start, end */) {
	  var length = arguments.length;
	  aTypedArray$t(this);
	  var actualValue = slice$5(classof(this), 0, 3) === 'Big' ? toBigInt(value) : +value;
	  return functionCall(arrayFill, this, actualValue, length > 1 ? arguments[1] : undefined, length > 2 ? arguments[2] : undefined);
	}, CONVERSION_BUG);

	var aTypedArrayConstructor$2 = arrayBufferViewCore.aTypedArrayConstructor;
	var getTypedArrayConstructor$5 = arrayBufferViewCore.getTypedArrayConstructor;

	// a part of `TypedArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#typedarray-species-create
	var typedArraySpeciesConstructor = function (originalArray) {
	  return aTypedArrayConstructor$2(speciesConstructor(originalArray, getTypedArrayConstructor$5(originalArray)));
	};

	var typedArrayFromSpeciesAndList = function (instance, list) {
	  return arrayFromConstructorAndList(typedArraySpeciesConstructor(instance), list);
	};

	var $filter = arrayIteration.filter;


	var aTypedArray$s = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$t = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.filter` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.filter
	exportTypedArrayMethod$t('filter', function filter(callbackfn /* , thisArg */) {
	  var list = $filter(aTypedArray$s(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  return typedArrayFromSpeciesAndList(this, list);
	});

	var $find$1 = arrayIteration.find;

	var aTypedArray$r = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$s = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.find` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.find
	exportTypedArrayMethod$s('find', function find(predicate /* , thisArg */) {
	  return $find$1(aTypedArray$r(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $findIndex = arrayIteration.findIndex;

	var aTypedArray$q = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$r = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.findIndex` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findindex
	exportTypedArrayMethod$r('findIndex', function findIndex(predicate /* , thisArg */) {
	  return $findIndex(aTypedArray$q(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $findLast = arrayIterationFromLast.findLast;

	var aTypedArray$p = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$q = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.findLast` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findlast
	exportTypedArrayMethod$q('findLast', function findLast(predicate /* , thisArg */) {
	  return $findLast(aTypedArray$p(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $findLastIndex = arrayIterationFromLast.findLastIndex;

	var aTypedArray$o = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$p = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.findLastIndex` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findlastindex
	exportTypedArrayMethod$p('findLastIndex', function findLastIndex(predicate /* , thisArg */) {
	  return $findLastIndex(aTypedArray$o(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $forEach$1 = arrayIteration.forEach;

	var aTypedArray$n = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$o = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.forEach` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.foreach
	exportTypedArrayMethod$o('forEach', function forEach(callbackfn /* , thisArg */) {
	  $forEach$1(aTypedArray$n(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});

	var exportTypedArrayStaticMethod$2 = arrayBufferViewCore.exportTypedArrayStaticMethod;


	// `%TypedArray%.from` method
	// https://tc39.es/ecma262/#sec-%typedarray%.from
	exportTypedArrayStaticMethod$2('from', typedArrayFrom, typedArrayConstructorsRequireWrappers);

	var $includes = arrayIncludes$1.includes;

	var aTypedArray$m = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$n = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.includes` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.includes
	exportTypedArrayMethod$n('includes', function includes(searchElement /* , fromIndex */) {
	  return $includes(aTypedArray$m(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $indexOf = arrayIncludes$1.indexOf;

	var aTypedArray$l = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$m = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.indexOf` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.indexof
	exportTypedArrayMethod$m('indexOf', function indexOf(searchElement /* , fromIndex */) {
	  return $indexOf(aTypedArray$l(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	});

	var ITERATOR$5 = wellKnownSymbol('iterator');
	var Uint8Array$7 = global_1.Uint8Array;
	var arrayValues = functionUncurryThis(es_array_iterator.values);
	var arrayKeys = functionUncurryThis(es_array_iterator.keys);
	var arrayEntries = functionUncurryThis(es_array_iterator.entries);
	var aTypedArray$k = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$l = arrayBufferViewCore.exportTypedArrayMethod;
	var TypedArrayPrototype = Uint8Array$7 && Uint8Array$7.prototype;

	var GENERIC = !fails(function () {
	  TypedArrayPrototype[ITERATOR$5].call([1]);
	});

	var ITERATOR_IS_VALUES = !!TypedArrayPrototype
	  && TypedArrayPrototype.values
	  && TypedArrayPrototype[ITERATOR$5] === TypedArrayPrototype.values
	  && TypedArrayPrototype.values.name === 'values';

	var typedArrayValues = function values() {
	  return arrayValues(aTypedArray$k(this));
	};

	// `%TypedArray%.prototype.entries` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.entries
	exportTypedArrayMethod$l('entries', function entries() {
	  return arrayEntries(aTypedArray$k(this));
	}, GENERIC);
	// `%TypedArray%.prototype.keys` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.keys
	exportTypedArrayMethod$l('keys', function keys() {
	  return arrayKeys(aTypedArray$k(this));
	}, GENERIC);
	// `%TypedArray%.prototype.values` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.values
	exportTypedArrayMethod$l('values', typedArrayValues, GENERIC || !ITERATOR_IS_VALUES, { name: 'values' });
	// `%TypedArray%.prototype[@@iterator]` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype-@@iterator
	exportTypedArrayMethod$l(ITERATOR$5, typedArrayValues, GENERIC || !ITERATOR_IS_VALUES, { name: 'values' });

	var aTypedArray$j = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$k = arrayBufferViewCore.exportTypedArrayMethod;
	var $join = functionUncurryThis([].join);

	// `%TypedArray%.prototype.join` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.join
	exportTypedArrayMethod$k('join', function join(separator) {
	  return $join(aTypedArray$j(this), separator);
	});

	var aTypedArray$i = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$j = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.lastIndexOf` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.lastindexof
	exportTypedArrayMethod$j('lastIndexOf', function lastIndexOf(searchElement /* , fromIndex */) {
	  var length = arguments.length;
	  return functionApply(arrayLastIndexOf, aTypedArray$i(this), length > 1 ? [searchElement, arguments[1]] : [searchElement]);
	});

	var $map = arrayIteration.map;


	var aTypedArray$h = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$i = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.map` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.map
	exportTypedArrayMethod$i('map', function map(mapfn /* , thisArg */) {
	  return $map(aTypedArray$h(this), mapfn, arguments.length > 1 ? arguments[1] : undefined, function (O, length) {
	    return new (typedArraySpeciesConstructor(O))(length);
	  });
	});

	var aTypedArrayConstructor$1 = arrayBufferViewCore.aTypedArrayConstructor;
	var exportTypedArrayStaticMethod$1 = arrayBufferViewCore.exportTypedArrayStaticMethod;

	// `%TypedArray%.of` method
	// https://tc39.es/ecma262/#sec-%typedarray%.of
	exportTypedArrayStaticMethod$1('of', function of(/* ...items */) {
	  var index = 0;
	  var length = arguments.length;
	  var result = new (aTypedArrayConstructor$1(this))(length);
	  while (length > index) result[index] = arguments[index++];
	  return result;
	}, typedArrayConstructorsRequireWrappers);

	var $reduce = arrayReduce$1.left;

	var aTypedArray$g = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$h = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.reduce` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduce
	exportTypedArrayMethod$h('reduce', function reduce(callbackfn /* , initialValue */) {
	  var length = arguments.length;
	  return $reduce(aTypedArray$g(this), callbackfn, length, length > 1 ? arguments[1] : undefined);
	});

	var $reduceRight = arrayReduce$1.right;

	var aTypedArray$f = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$g = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.reduceRight` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduceright
	exportTypedArrayMethod$g('reduceRight', function reduceRight(callbackfn /* , initialValue */) {
	  var length = arguments.length;
	  return $reduceRight(aTypedArray$f(this), callbackfn, length, length > 1 ? arguments[1] : undefined);
	});

	var aTypedArray$e = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$f = arrayBufferViewCore.exportTypedArrayMethod;
	var floor$2 = Math.floor;

	// `%TypedArray%.prototype.reverse` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reverse
	exportTypedArrayMethod$f('reverse', function reverse() {
	  var that = this;
	  var length = aTypedArray$e(that).length;
	  var middle = floor$2(length / 2);
	  var index = 0;
	  var value;
	  while (index < middle) {
	    value = that[index];
	    that[index++] = that[--length];
	    that[length] = value;
	  } return that;
	});

	var RangeError$1 = global_1.RangeError;
	var Int8Array$2 = global_1.Int8Array;
	var Int8ArrayPrototype = Int8Array$2 && Int8Array$2.prototype;
	var $set = Int8ArrayPrototype && Int8ArrayPrototype.set;
	var aTypedArray$d = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$e = arrayBufferViewCore.exportTypedArrayMethod;

	var WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS = !fails(function () {
	  // eslint-disable-next-line es/no-typed-arrays -- required for testing
	  var array = new Uint8ClampedArray(2);
	  functionCall($set, array, { length: 1, 0: 3 }, 1);
	  return array[1] !== 3;
	});

	// https://bugs.chromium.org/p/v8/issues/detail?id=11294 and other
	var TO_OBJECT_BUG = WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS && arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS && fails(function () {
	  var array = new Int8Array$2(2);
	  array.set(1);
	  array.set('2', 1);
	  return array[0] !== 0 || array[1] !== 2;
	});

	// `%TypedArray%.prototype.set` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.set
	exportTypedArrayMethod$e('set', function set(arrayLike /* , offset */) {
	  aTypedArray$d(this);
	  var offset = toOffset(arguments.length > 1 ? arguments[1] : undefined, 1);
	  var src = toObject(arrayLike);
	  if (WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS) return functionCall($set, this, src, offset);
	  var length = this.length;
	  var len = lengthOfArrayLike(src);
	  var index = 0;
	  if (len + offset > length) throw new RangeError$1('Wrong length');
	  while (index < len) this[offset + index] = src[index++];
	}, !WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS || TO_OBJECT_BUG);

	var aTypedArray$c = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$d = arrayBufferViewCore.exportTypedArrayMethod;

	var FORCED$3 = fails(function () {
	  // eslint-disable-next-line es/no-typed-arrays -- required for testing
	  new Int8Array(1).slice();
	});

	// `%TypedArray%.prototype.slice` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.slice
	exportTypedArrayMethod$d('slice', function slice(start, end) {
	  var list = arraySlice(aTypedArray$c(this), start, end);
	  var C = typedArraySpeciesConstructor(this);
	  var index = 0;
	  var length = list.length;
	  var result = new C(length);
	  while (length > index) result[index] = list[index++];
	  return result;
	}, FORCED$3);

	var $some$1 = arrayIteration.some;

	var aTypedArray$b = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$c = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.some` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.some
	exportTypedArrayMethod$c('some', function some(callbackfn /* , thisArg */) {
	  return $some$1(aTypedArray$b(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});

	var aTypedArray$a = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$b = arrayBufferViewCore.exportTypedArrayMethod;
	var Uint16Array = global_1.Uint16Array;
	var nativeSort = Uint16Array && functionUncurryThisClause(Uint16Array.prototype.sort);

	// WebKit
	var ACCEPT_INCORRECT_ARGUMENTS = !!nativeSort && !(fails(function () {
	  nativeSort(new Uint16Array(2), null);
	}) && fails(function () {
	  nativeSort(new Uint16Array(2), {});
	}));

	var STABLE_SORT = !!nativeSort && !fails(function () {
	  // feature detection can be too slow, so check engines versions
	  if (engineV8Version) return engineV8Version < 74;
	  if (engineFfVersion) return engineFfVersion < 67;
	  if (engineIsIeOrEdge) return true;
	  if (engineWebkitVersion) return engineWebkitVersion < 602;

	  var array = new Uint16Array(516);
	  var expected = Array(516);
	  var index, mod;

	  for (index = 0; index < 516; index++) {
	    mod = index % 4;
	    array[index] = 515 - index;
	    expected[index] = index - 2 * mod + 3;
	  }

	  nativeSort(array, function (a, b) {
	    return (a / 4 | 0) - (b / 4 | 0);
	  });

	  for (index = 0; index < 516; index++) {
	    if (array[index] !== expected[index]) return true;
	  }
	});

	var getSortCompare = function (comparefn) {
	  return function (x, y) {
	    if (comparefn !== undefined) return +comparefn(x, y) || 0;
	    // eslint-disable-next-line no-self-compare -- NaN check
	    if (y !== y) return -1;
	    // eslint-disable-next-line no-self-compare -- NaN check
	    if (x !== x) return 1;
	    if (x === 0 && y === 0) return 1 / x > 0 && 1 / y < 0 ? 1 : -1;
	    return x > y;
	  };
	};

	// `%TypedArray%.prototype.sort` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.sort
	exportTypedArrayMethod$b('sort', function sort(comparefn) {
	  if (comparefn !== undefined) aCallable(comparefn);
	  if (STABLE_SORT) return nativeSort(this, comparefn);

	  return arraySort(aTypedArray$a(this), getSortCompare(comparefn));
	}, !STABLE_SORT || ACCEPT_INCORRECT_ARGUMENTS);

	var aTypedArray$9 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$a = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.subarray` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.subarray
	exportTypedArrayMethod$a('subarray', function subarray(begin, end) {
	  var O = aTypedArray$9(this);
	  var length = O.length;
	  var beginIndex = toAbsoluteIndex(begin, length);
	  var C = typedArraySpeciesConstructor(O);
	  return new C(
	    O.buffer,
	    O.byteOffset + beginIndex * O.BYTES_PER_ELEMENT,
	    toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - beginIndex)
	  );
	});

	var Int8Array$1 = global_1.Int8Array;
	var aTypedArray$8 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$9 = arrayBufferViewCore.exportTypedArrayMethod;
	var $toLocaleString = [].toLocaleString;

	// iOS Safari 6.x fails here
	var TO_LOCALE_STRING_BUG = !!Int8Array$1 && fails(function () {
	  $toLocaleString.call(new Int8Array$1(1));
	});

	var FORCED$2 = fails(function () {
	  return [1, 2].toLocaleString() !== new Int8Array$1([1, 2]).toLocaleString();
	}) || !fails(function () {
	  Int8Array$1.prototype.toLocaleString.call([1, 2]);
	});

	// `%TypedArray%.prototype.toLocaleString` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tolocalestring
	exportTypedArrayMethod$9('toLocaleString', function toLocaleString() {
	  return functionApply(
	    $toLocaleString,
	    TO_LOCALE_STRING_BUG ? arraySlice(aTypedArray$8(this)) : aTypedArray$8(this),
	    arraySlice(arguments)
	  );
	}, FORCED$2);

	var aTypedArray$7 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$8 = arrayBufferViewCore.exportTypedArrayMethod;
	var getTypedArrayConstructor$4 = arrayBufferViewCore.getTypedArrayConstructor;

	// `%TypedArray%.prototype.toReversed` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.toreversed
	exportTypedArrayMethod$8('toReversed', function toReversed() {
	  return arrayToReversed(aTypedArray$7(this), getTypedArrayConstructor$4(this));
	});

	var aTypedArray$6 = arrayBufferViewCore.aTypedArray;
	var getTypedArrayConstructor$3 = arrayBufferViewCore.getTypedArrayConstructor;
	var exportTypedArrayMethod$7 = arrayBufferViewCore.exportTypedArrayMethod;
	var sort = functionUncurryThis(arrayBufferViewCore.TypedArrayPrototype.sort);

	// `%TypedArray%.prototype.toSorted` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tosorted
	exportTypedArrayMethod$7('toSorted', function toSorted(compareFn) {
	  if (compareFn !== undefined) aCallable(compareFn);
	  var O = aTypedArray$6(this);
	  var A = arrayFromConstructorAndList(getTypedArrayConstructor$3(O), O);
	  return sort(A, compareFn);
	});

	var exportTypedArrayMethod$6 = arrayBufferViewCore.exportTypedArrayMethod;




	var Uint8Array$6 = global_1.Uint8Array;
	var Uint8ArrayPrototype = Uint8Array$6 && Uint8Array$6.prototype || {};
	var arrayToString = [].toString;
	var join$4 = functionUncurryThis([].join);

	if (fails(function () { arrayToString.call({}); })) {
	  arrayToString = function toString() {
	    return join$4(this);
	  };
	}

	var IS_NOT_ARRAY_METHOD = Uint8ArrayPrototype.toString !== arrayToString;

	// `%TypedArray%.prototype.toString` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tostring
	exportTypedArrayMethod$6('toString', arrayToString, IS_NOT_ARRAY_METHOD);

	var aTypedArray$5 = arrayBufferViewCore.aTypedArray;
	var getTypedArrayConstructor$2 = arrayBufferViewCore.getTypedArrayConstructor;
	var exportTypedArrayMethod$5 = arrayBufferViewCore.exportTypedArrayMethod;

	var PROPER_ORDER$1 = !!function () {
	  try {
	    // eslint-disable-next-line no-throw-literal, es/no-typed-arrays, es/no-array-prototype-with -- required for testing
	    new Int8Array(1)['with'](2, { valueOf: function () { throw 8; } });
	  } catch (error) {
	    // some early implementations, like WebKit, does not follow the final semantic
	    // https://github.com/tc39/proposal-change-array-by-copy/pull/86
	    return error === 8;
	  }
	}();

	// `%TypedArray%.prototype.with` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.with
	exportTypedArrayMethod$5('with', { 'with': function (index, value) {
	  var O = aTypedArray$5(this);
	  var relativeIndex = toIntegerOrInfinity(index);
	  var actualValue = isBigIntArray(O) ? toBigInt(value) : +value;
	  return arrayWith(O, getTypedArrayConstructor$2(O), relativeIndex, actualValue);
	} }['with'], !PROPER_ORDER$1);

	var fromCharCode$4 = String.fromCharCode;
	var charAt$b = functionUncurryThis(''.charAt);
	var exec$a = functionUncurryThis(/./.exec);
	var stringSlice$7 = functionUncurryThis(''.slice);

	var hex2 = /^[\da-f]{2}$/i;
	var hex4 = /^[\da-f]{4}$/i;

	// `unescape` method
	// https://tc39.es/ecma262/#sec-unescape-string
	_export({ global: true }, {
	  unescape: function unescape(string) {
	    var str = toString_1$1(string);
	    var result = '';
	    var length = str.length;
	    var index = 0;
	    var chr, part;
	    while (index < length) {
	      chr = charAt$b(str, index++);
	      if (chr === '%') {
	        if (charAt$b(str, index) === 'u') {
	          part = stringSlice$7(str, index + 1, index + 5);
	          if (exec$a(hex4, part)) {
	            result += fromCharCode$4(parseInt(part, 16));
	            index += 5;
	            continue;
	          }
	        } else {
	          part = stringSlice$7(str, index, index + 2);
	          if (exec$a(hex2, part)) {
	            result += fromCharCode$4(parseInt(part, 16));
	            index += 2;
	            continue;
	          }
	        }
	      }
	      result += chr;
	    } return result;
	  }
	});

	var getWeakData = internalMetadata.getWeakData;









	var setInternalState$e = internalState.set;
	var internalStateGetterFor = internalState.getterFor;
	var find$1 = arrayIteration.find;
	var findIndex = arrayIteration.findIndex;
	var splice$3 = functionUncurryThis([].splice);
	var id = 0;

	// fallback for uncaught frozen keys
	var uncaughtFrozenStore = function (state) {
	  return state.frozen || (state.frozen = new UncaughtFrozenStore());
	};

	var UncaughtFrozenStore = function () {
	  this.entries = [];
	};

	var findUncaughtFrozen = function (store, key) {
	  return find$1(store.entries, function (it) {
	    return it[0] === key;
	  });
	};

	UncaughtFrozenStore.prototype = {
	  get: function (key) {
	    var entry = findUncaughtFrozen(this, key);
	    if (entry) return entry[1];
	  },
	  has: function (key) {
	    return !!findUncaughtFrozen(this, key);
	  },
	  set: function (key, value) {
	    var entry = findUncaughtFrozen(this, key);
	    if (entry) entry[1] = value;
	    else this.entries.push([key, value]);
	  },
	  'delete': function (key) {
	    var index = findIndex(this.entries, function (it) {
	      return it[0] === key;
	    });
	    if (~index) splice$3(this.entries, index, 1);
	    return !!~index;
	  }
	};

	var collectionWeak = {
	  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
	    var Constructor = wrapper(function (that, iterable) {
	      anInstance(that, Prototype);
	      setInternalState$e(that, {
	        type: CONSTRUCTOR_NAME,
	        id: id++,
	        frozen: undefined
	      });
	      if (!isNullOrUndefined(iterable)) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
	    });

	    var Prototype = Constructor.prototype;

	    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

	    var define = function (that, key, value) {
	      var state = getInternalState(that);
	      var data = getWeakData(anObject(key), true);
	      if (data === true) uncaughtFrozenStore(state).set(key, value);
	      else data[state.id] = value;
	      return that;
	    };

	    defineBuiltIns(Prototype, {
	      // `{ WeakMap, WeakSet }.prototype.delete(key)` methods
	      // https://tc39.es/ecma262/#sec-weakmap.prototype.delete
	      // https://tc39.es/ecma262/#sec-weakset.prototype.delete
	      'delete': function (key) {
	        var state = getInternalState(this);
	        if (!isObject$1(key)) return false;
	        var data = getWeakData(key);
	        if (data === true) return uncaughtFrozenStore(state)['delete'](key);
	        return data && hasOwnProperty_1(data, state.id) && delete data[state.id];
	      },
	      // `{ WeakMap, WeakSet }.prototype.has(key)` methods
	      // https://tc39.es/ecma262/#sec-weakmap.prototype.has
	      // https://tc39.es/ecma262/#sec-weakset.prototype.has
	      has: function has(key) {
	        var state = getInternalState(this);
	        if (!isObject$1(key)) return false;
	        var data = getWeakData(key);
	        if (data === true) return uncaughtFrozenStore(state).has(key);
	        return data && hasOwnProperty_1(data, state.id);
	      }
	    });

	    defineBuiltIns(Prototype, IS_MAP ? {
	      // `WeakMap.prototype.get(key)` method
	      // https://tc39.es/ecma262/#sec-weakmap.prototype.get
	      get: function get(key) {
	        var state = getInternalState(this);
	        if (isObject$1(key)) {
	          var data = getWeakData(key);
	          if (data === true) return uncaughtFrozenStore(state).get(key);
	          return data ? data[state.id] : undefined;
	        }
	      },
	      // `WeakMap.prototype.set(key, value)` method
	      // https://tc39.es/ecma262/#sec-weakmap.prototype.set
	      set: function set(key, value) {
	        return define(this, key, value);
	      }
	    } : {
	      // `WeakSet.prototype.add(value)` method
	      // https://tc39.es/ecma262/#sec-weakset.prototype.add
	      add: function add(value) {
	        return define(this, value, true);
	      }
	    });

	    return Constructor;
	  }
	};
	collectionWeak.getConstructor;

	var enforceInternalState = internalState.enforce;



	var $Object$3 = Object;
	// eslint-disable-next-line es/no-array-isarray -- safe
	var isArray$1 = Array.isArray;
	// eslint-disable-next-line es/no-object-isextensible -- safe
	var isExtensible = $Object$3.isExtensible;
	// eslint-disable-next-line es/no-object-isfrozen -- safe
	var isFrozen$2 = $Object$3.isFrozen;
	// eslint-disable-next-line es/no-object-issealed -- safe
	var isSealed = $Object$3.isSealed;
	// eslint-disable-next-line es/no-object-freeze -- safe
	var freeze$2 = $Object$3.freeze;
	// eslint-disable-next-line es/no-object-seal -- safe
	var seal = $Object$3.seal;

	var IS_IE11 = !global_1.ActiveXObject && 'ActiveXObject' in global_1;
	var InternalWeakMap;

	var wrapper = function (init) {
	  return function WeakMap() {
	    return init(this, arguments.length ? arguments[0] : undefined);
	  };
	};

	// `WeakMap` constructor
	// https://tc39.es/ecma262/#sec-weakmap-constructor
	var $WeakMap = collection('WeakMap', wrapper, collectionWeak);
	var WeakMapPrototype$1 = $WeakMap.prototype;
	var nativeSet = functionUncurryThis(WeakMapPrototype$1.set);

	// Chakra Edge bug: adding frozen arrays to WeakMap unfreeze them
	var hasMSEdgeFreezingBug = function () {
	  return freezing && fails(function () {
	    var frozenArray = freeze$2([]);
	    nativeSet(new $WeakMap(), frozenArray, 1);
	    return !isFrozen$2(frozenArray);
	  });
	};

	// IE11 WeakMap frozen keys fix
	// We can't use feature detection because it crash some old IE builds
	// https://github.com/zloirock/core-js/issues/485
	if (weakMapBasicDetection) if (IS_IE11) {
	  InternalWeakMap = collectionWeak.getConstructor(wrapper, 'WeakMap', true);
	  internalMetadata.enable();
	  var nativeDelete = functionUncurryThis(WeakMapPrototype$1['delete']);
	  var nativeHas = functionUncurryThis(WeakMapPrototype$1.has);
	  var nativeGet = functionUncurryThis(WeakMapPrototype$1.get);
	  defineBuiltIns(WeakMapPrototype$1, {
	    'delete': function (key) {
	      if (isObject$1(key) && !isExtensible(key)) {
	        var state = enforceInternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        return nativeDelete(this, key) || state.frozen['delete'](key);
	      } return nativeDelete(this, key);
	    },
	    has: function has(key) {
	      if (isObject$1(key) && !isExtensible(key)) {
	        var state = enforceInternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        return nativeHas(this, key) || state.frozen.has(key);
	      } return nativeHas(this, key);
	    },
	    get: function get(key) {
	      if (isObject$1(key) && !isExtensible(key)) {
	        var state = enforceInternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        return nativeHas(this, key) ? nativeGet(this, key) : state.frozen.get(key);
	      } return nativeGet(this, key);
	    },
	    set: function set(key, value) {
	      if (isObject$1(key) && !isExtensible(key)) {
	        var state = enforceInternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        nativeHas(this, key) ? nativeSet(this, key, value) : state.frozen.set(key, value);
	      } else nativeSet(this, key, value);
	      return this;
	    }
	  });
	// Chakra Edge frozen keys fix
	} else if (hasMSEdgeFreezingBug()) {
	  defineBuiltIns(WeakMapPrototype$1, {
	    set: function set(key, value) {
	      var arrayIntegrityLevel;
	      if (isArray$1(key)) {
	        if (isFrozen$2(key)) arrayIntegrityLevel = freeze$2;
	        else if (isSealed(key)) arrayIntegrityLevel = seal;
	      }
	      nativeSet(this, key, value);
	      if (arrayIntegrityLevel) arrayIntegrityLevel(key);
	      return this;
	    }
	  });
	}

	// `WeakSet` constructor
	// https://tc39.es/ecma262/#sec-weakset-constructor
	collection('WeakSet', function (init) {
	  return function WeakSet() { return init(this, arguments.length ? arguments[0] : undefined); };
	}, collectionWeak);

	var TO_STRING_TAG$6 = wellKnownSymbol('toStringTag');
	var $Error = Error;

	var $SuppressedError = function SuppressedError(error, suppressed, message) {
	  var isInstance = objectIsPrototypeOf(SuppressedErrorPrototype, this);
	  var that;
	  if (objectSetPrototypeOf) {
	    that = objectSetPrototypeOf(new $Error(), isInstance ? objectGetPrototypeOf(this) : SuppressedErrorPrototype);
	  } else {
	    that = isInstance ? this : objectCreate(SuppressedErrorPrototype);
	    createNonEnumerableProperty(that, TO_STRING_TAG$6, 'Error');
	  }
	  if (message !== undefined) createNonEnumerableProperty(that, 'message', normalizeStringArgument(message));
	  errorStackInstall(that, $SuppressedError, that.stack, 1);
	  createNonEnumerableProperty(that, 'error', error);
	  createNonEnumerableProperty(that, 'suppressed', suppressed);
	  return that;
	};

	if (objectSetPrototypeOf) objectSetPrototypeOf($SuppressedError, $Error);
	else copyConstructorProperties$1($SuppressedError, $Error, { name: true });

	var SuppressedErrorPrototype = $SuppressedError.prototype = objectCreate($Error.prototype, {
	  constructor: createPropertyDescriptor(1, $SuppressedError),
	  message: createPropertyDescriptor(1, ''),
	  name: createPropertyDescriptor(1, 'SuppressedError')
	});

	// `SuppressedError` constructor
	// https://github.com/tc39/proposal-explicit-resource-management
	_export({ global: true, constructor: true, arity: 3 }, {
	  SuppressedError: $SuppressedError
	});

	var USE_FUNCTION_CONSTRUCTOR = 'USE_FUNCTION_CONSTRUCTOR';
	var ASYNC_ITERATOR$3 = wellKnownSymbol('asyncIterator');
	var AsyncIterator = global_1.AsyncIterator;
	var PassedAsyncIteratorPrototype = sharedStore.AsyncIteratorPrototype;
	var AsyncIteratorPrototype, prototype;

	if (PassedAsyncIteratorPrototype) {
	  AsyncIteratorPrototype = PassedAsyncIteratorPrototype;
	} else if (isCallable(AsyncIterator)) {
	  AsyncIteratorPrototype = AsyncIterator.prototype;
	} else if (sharedStore[USE_FUNCTION_CONSTRUCTOR] || global_1[USE_FUNCTION_CONSTRUCTOR]) {
	  try {
	    // eslint-disable-next-line no-new-func -- we have no alternatives without usage of modern syntax
	    prototype = objectGetPrototypeOf(objectGetPrototypeOf(objectGetPrototypeOf(Function('return async function*(){}()')())));
	    if (objectGetPrototypeOf(prototype) === Object.prototype) AsyncIteratorPrototype = prototype;
	  } catch (error) { /* empty */ }
	}

	if (!AsyncIteratorPrototype) AsyncIteratorPrototype = {};

	if (!isCallable(AsyncIteratorPrototype[ASYNC_ITERATOR$3])) {
	  defineBuiltIn(AsyncIteratorPrototype, ASYNC_ITERATOR$3, function () {
	    return this;
	  });
	}

	var asyncIteratorPrototype = AsyncIteratorPrototype;

	var Promise$6 = getBuiltIn('Promise');

	var ASYNC_FROM_SYNC_ITERATOR = 'AsyncFromSyncIterator';
	var setInternalState$d = internalState.set;
	var getInternalState$6 = internalState.getterFor(ASYNC_FROM_SYNC_ITERATOR);

	var asyncFromSyncIteratorContinuation = function (result, resolve, reject) {
	  var done = result.done;
	  Promise$6.resolve(result.value).then(function (value) {
	    resolve(createIterResultObject(value, done));
	  }, reject);
	};

	var AsyncFromSyncIterator = function AsyncIterator(iteratorRecord) {
	  iteratorRecord.type = ASYNC_FROM_SYNC_ITERATOR;
	  setInternalState$d(this, iteratorRecord);
	};

	AsyncFromSyncIterator.prototype = defineBuiltIns(objectCreate(asyncIteratorPrototype), {
	  next: function next() {
	    var state = getInternalState$6(this);
	    return new Promise$6(function (resolve, reject) {
	      var result = anObject(functionCall(state.next, state.iterator));
	      asyncFromSyncIteratorContinuation(result, resolve, reject);
	    });
	  },
	  'return': function () {
	    var iterator = getInternalState$6(this).iterator;
	    return new Promise$6(function (resolve, reject) {
	      var $return = getMethod(iterator, 'return');
	      if ($return === undefined) return resolve(createIterResultObject(undefined, true));
	      var result = anObject(functionCall($return, iterator));
	      asyncFromSyncIteratorContinuation(result, resolve, reject);
	    });
	  }
	});

	var asyncFromSyncIterator = AsyncFromSyncIterator;

	// `GetIteratorDirect(obj)` abstract operation
	// https://tc39.es/proposal-iterator-helpers/#sec-getiteratordirect
	var getIteratorDirect = function (obj) {
	  return {
	    iterator: obj,
	    next: obj.next,
	    done: false
	  };
	};

	var ASYNC_ITERATOR$2 = wellKnownSymbol('asyncIterator');

	var getAsyncIterator = function (it, usingIterator) {
	  var method = arguments.length < 2 ? getMethod(it, ASYNC_ITERATOR$2) : usingIterator;
	  return method ? anObject(functionCall(method, it)) : new asyncFromSyncIterator(getIteratorDirect(getIterator(it)));
	};

	var asyncIteratorClose = function (iterator, method, argument, reject) {
	  try {
	    var returnMethod = getMethod(iterator, 'return');
	    if (returnMethod) {
	      return getBuiltIn('Promise').resolve(functionCall(returnMethod, iterator)).then(function () {
	        method(argument);
	      }, function (error) {
	        reject(error);
	      });
	    }
	  } catch (error2) {
	    return reject(error2);
	  } method(argument);
	};

	// https://github.com/tc39/proposal-iterator-helpers
	// https://github.com/tc39/proposal-array-from-async









	var createMethod = function (TYPE) {
	  var IS_TO_ARRAY = TYPE === 0;
	  var IS_FOR_EACH = TYPE === 1;
	  var IS_EVERY = TYPE === 2;
	  var IS_SOME = TYPE === 3;
	  return function (object, fn, target) {
	    anObject(object);
	    var MAPPING = fn !== undefined;
	    if (MAPPING || !IS_TO_ARRAY) aCallable(fn);
	    var record = getIteratorDirect(object);
	    var Promise = getBuiltIn('Promise');
	    var iterator = record.iterator;
	    var next = record.next;
	    var counter = 0;

	    return new Promise(function (resolve, reject) {
	      var ifAbruptCloseAsyncIterator = function (error) {
	        asyncIteratorClose(iterator, reject, error, reject);
	      };

	      var loop = function () {
	        try {
	          if (MAPPING) try {
	            doesNotExceedSafeInteger(counter);
	          } catch (error5) { ifAbruptCloseAsyncIterator(error5); }
	          Promise.resolve(anObject(functionCall(next, iterator))).then(function (step) {
	            try {
	              if (anObject(step).done) {
	                if (IS_TO_ARRAY) {
	                  target.length = counter;
	                  resolve(target);
	                } else resolve(IS_SOME ? false : IS_EVERY || undefined);
	              } else {
	                var value = step.value;
	                try {
	                  if (MAPPING) {
	                    var result = fn(value, counter);

	                    var handler = function ($result) {
	                      if (IS_FOR_EACH) {
	                        loop();
	                      } else if (IS_EVERY) {
	                        $result ? loop() : asyncIteratorClose(iterator, resolve, false, reject);
	                      } else if (IS_TO_ARRAY) {
	                        try {
	                          target[counter++] = $result;
	                          loop();
	                        } catch (error4) { ifAbruptCloseAsyncIterator(error4); }
	                      } else {
	                        $result ? asyncIteratorClose(iterator, resolve, IS_SOME || value, reject) : loop();
	                      }
	                    };

	                    if (isObject$1(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
	                    else handler(result);
	                  } else {
	                    target[counter++] = value;
	                    loop();
	                  }
	                } catch (error3) { ifAbruptCloseAsyncIterator(error3); }
	              }
	            } catch (error2) { reject(error2); }
	          }, reject);
	        } catch (error) { reject(error); }
	      };

	      loop();
	    });
	  };
	};

	var asyncIteratorIteration = {
	  toArray: createMethod(0),
	  forEach: createMethod(1),
	  every: createMethod(2),
	  some: createMethod(3),
	  find: createMethod(4)
	};

	var toArray = asyncIteratorIteration.toArray;

	var ASYNC_ITERATOR$1 = wellKnownSymbol('asyncIterator');
	var arrayIterator = functionUncurryThis(getBuiltInPrototypeMethod('Array', 'values'));
	var arrayIteratorNext = functionUncurryThis(arrayIterator([]).next);

	var safeArrayIterator = function () {
	  return new SafeArrayIterator(this);
	};

	var SafeArrayIterator = function (O) {
	  this.iterator = arrayIterator(O);
	};

	SafeArrayIterator.prototype.next = function () {
	  return arrayIteratorNext(this.iterator);
	};

	// `Array.fromAsync` method implementation
	// https://github.com/tc39/proposal-array-from-async
	var arrayFromAsync = function fromAsync(asyncItems /* , mapfn = undefined, thisArg = undefined */) {
	  var C = this;
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var thisArg = argumentsLength > 2 ? arguments[2] : undefined;
	  return new (getBuiltIn('Promise'))(function (resolve) {
	    var O = toObject(asyncItems);
	    if (mapfn !== undefined) mapfn = functionBindContext(mapfn, thisArg);
	    var usingAsyncIterator = getMethod(O, ASYNC_ITERATOR$1);
	    var usingSyncIterator = usingAsyncIterator ? undefined : getIteratorMethod(O) || safeArrayIterator;
	    var A = isConstructor(C) ? new C() : [];
	    var iterator = usingAsyncIterator
	      ? getAsyncIterator(O, usingAsyncIterator)
	      : new asyncFromSyncIterator(getIteratorDirect(getIterator(O, usingSyncIterator)));
	    resolve(toArray(iterator, mapfn, A));
	  });
	};

	// `Array.fromAsync` method
	// https://github.com/tc39/proposal-array-from-async
	_export({ target: 'Array', stat: true }, {
	  fromAsync: arrayFromAsync
	});

	// TODO: remove from `core-js@4`

	var $filterReject$3 = arrayIteration.filterReject;


	// `Array.prototype.filterOut` method
	// https://github.com/tc39/proposal-array-filtering
	_export({ target: 'Array', proto: true, forced: true }, {
	  filterOut: function filterOut(callbackfn /* , thisArg */) {
	    return $filterReject$3(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	addToUnscopables('filterOut');

	var $filterReject$2 = arrayIteration.filterReject;


	// `Array.prototype.filterReject` method
	// https://github.com/tc39/proposal-array-filtering
	_export({ target: 'Array', proto: true, forced: true }, {
	  filterReject: function filterReject(callbackfn /* , thisArg */) {
	    return $filterReject$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	addToUnscopables('filterReject');

	var $Array$1 = Array;
	var push$f = functionUncurryThis([].push);

	var arrayGroup = function ($this, callbackfn, that, specificConstructor) {
	  var O = toObject($this);
	  var self = indexedObject(O);
	  var boundFunction = functionBindContext(callbackfn, that);
	  var target = objectCreate(null);
	  var length = lengthOfArrayLike(self);
	  var index = 0;
	  var Constructor, key, value;
	  for (;length > index; index++) {
	    value = self[index];
	    key = toPropertyKey(boundFunction(value, index, O));
	    // in some IE versions, `hasOwnProperty` returns incorrect result on integer keys
	    // but since it's a `null` prototype object, we can safely use `in`
	    if (key in target) push$f(target[key], value);
	    else target[key] = [value];
	  }
	  // TODO: Remove this block from `core-js@4`
	  if (specificConstructor) {
	    Constructor = specificConstructor(O);
	    if (Constructor !== $Array$1) {
	      for (key in target) target[key] = arrayFromConstructorAndList(Constructor, target[key]);
	    }
	  } return target;
	};

	// `Array.prototype.group` method
	// https://github.com/tc39/proposal-array-grouping
	_export({ target: 'Array', proto: true }, {
	  group: function group(callbackfn /* , thisArg */) {
	    var thisArg = arguments.length > 1 ? arguments[1] : undefined;
	    return arrayGroup(this, callbackfn, thisArg);
	  }
	});

	addToUnscopables('group');

	// TODO: Remove from `core-js@4`





	// `Array.prototype.groupBy` method
	// https://github.com/tc39/proposal-array-grouping
	// https://bugs.webkit.org/show_bug.cgi?id=236541
	_export({ target: 'Array', proto: true, forced: !arrayMethodIsStrict('groupBy') }, {
	  groupBy: function groupBy(callbackfn /* , thisArg */) {
	    var thisArg = arguments.length > 1 ? arguments[1] : undefined;
	    return arrayGroup(this, callbackfn, thisArg);
	  }
	});

	addToUnscopables('groupBy');

	var Map$b = mapHelpers.Map;
	var mapGet$1 = mapHelpers.get;
	var mapHas$2 = mapHelpers.has;
	var mapSet$2 = mapHelpers.set;
	var push$e = functionUncurryThis([].push);

	// `Array.prototype.groupToMap` method
	// https://github.com/tc39/proposal-array-grouping
	var arrayGroupToMap = function groupToMap(callbackfn /* , thisArg */) {
	  var O = toObject(this);
	  var self = indexedObject(O);
	  var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  var map = new Map$b();
	  var length = lengthOfArrayLike(self);
	  var index = 0;
	  var key, value;
	  for (;length > index; index++) {
	    value = self[index];
	    key = boundFunction(value, index, O);
	    if (mapHas$2(map, key)) push$e(mapGet$1(map, key), value);
	    else mapSet$2(map, key, [value]);
	  } return map;
	};

	// TODO: Remove from `core-js@4`






	// `Array.prototype.groupByToMap` method
	// https://github.com/tc39/proposal-array-grouping
	// https://bugs.webkit.org/show_bug.cgi?id=236541
	_export({ target: 'Array', proto: true, name: 'groupToMap', forced: !arrayMethodIsStrict('groupByToMap') }, {
	  groupByToMap: arrayGroupToMap
	});

	addToUnscopables('groupByToMap');

	// `Array.prototype.groupToMap` method
	// https://github.com/tc39/proposal-array-grouping
	_export({ target: 'Array', proto: true, forced: isPure }, {
	  groupToMap: arrayGroupToMap
	});

	addToUnscopables('groupToMap');

	// eslint-disable-next-line es/no-object-isfrozen -- safe
	var isFrozen$1 = Object.isFrozen;

	var isFrozenStringArray = function (array, allowUndefined) {
	  if (!isFrozen$1 || !isArray$2(array) || !isFrozen$1(array)) return false;
	  var index = 0;
	  var length = array.length;
	  var element;
	  while (index < length) {
	    element = array[index++];
	    if (!(typeof element == 'string' || (allowUndefined && element === undefined))) {
	      return false;
	    }
	  } return length !== 0;
	};

	// `Array.isTemplateObject` method
	// https://github.com/tc39/proposal-array-is-template-object
	_export({ target: 'Array', stat: true, sham: true, forced: true }, {
	  isTemplateObject: function isTemplateObject(value) {
	    if (!isFrozenStringArray(value, true)) return false;
	    var raw = value.raw;
	    return raw.length === value.length && isFrozenStringArray(raw, false);
	  }
	});

	// TODO: Remove from `core-js@4`






	// `Array.prototype.lastIndex` getter
	// https://github.com/keithamus/proposal-array-last
	if (descriptors) {
	  defineBuiltInAccessor(Array.prototype, 'lastIndex', {
	    configurable: true,
	    get: function lastIndex() {
	      var O = toObject(this);
	      var len = lengthOfArrayLike(O);
	      return len === 0 ? 0 : len - 1;
	    }
	  });

	  addToUnscopables('lastIndex');
	}

	// TODO: Remove from `core-js@4`






	// `Array.prototype.lastIndex` accessor
	// https://github.com/keithamus/proposal-array-last
	if (descriptors) {
	  defineBuiltInAccessor(Array.prototype, 'lastItem', {
	    configurable: true,
	    get: function lastItem() {
	      var O = toObject(this);
	      var len = lengthOfArrayLike(O);
	      return len === 0 ? undefined : O[len - 1];
	    },
	    set: function lastItem(value) {
	      var O = toObject(this);
	      var len = lengthOfArrayLike(O);
	      return O[len === 0 ? 0 : len - 1] = value;
	    }
	  });

	  addToUnscopables('lastItem');
	}

	var iterateSimple = function (record, fn, ITERATOR_INSTEAD_OF_RECORD) {
	  var iterator = ITERATOR_INSTEAD_OF_RECORD ? record : record.iterator;
	  var next = record.next;
	  var step, result;
	  while (!(step = functionCall(next, iterator)).done) {
	    result = fn(step.value);
	    if (result !== undefined) return result;
	  }
	};

	var Map$a = mapHelpers.Map;
	var MapPrototype = mapHelpers.proto;
	var forEach$3 = functionUncurryThis(MapPrototype.forEach);
	var entries = functionUncurryThis(MapPrototype.entries);
	var next$1 = entries(new Map$a()).next;

	var mapIterate = function (map, fn, interruptible) {
	  return interruptible ? iterateSimple({ iterator: entries(map), next: next$1 }, function (entry) {
	    return fn(entry[1], entry[0]);
	  }) : forEach$3(map, fn);
	};

	var Map$9 = mapHelpers.Map;
	var mapHas$1 = mapHelpers.has;
	var mapSet$1 = mapHelpers.set;
	var push$d = functionUncurryThis([].push);

	// `Array.prototype.uniqueBy` method
	// https://github.com/tc39/proposal-array-unique
	var arrayUniqueBy$2 = function uniqueBy(resolver) {
	  var that = toObject(this);
	  var length = lengthOfArrayLike(that);
	  var result = [];
	  var map = new Map$9();
	  var resolverFunction = !isNullOrUndefined(resolver) ? aCallable(resolver) : function (value) {
	    return value;
	  };
	  var index, item, key;
	  for (index = 0; index < length; index++) {
	    item = that[index];
	    key = resolverFunction(item);
	    if (!mapHas$1(map, key)) mapSet$1(map, key, item);
	  }
	  mapIterate(map, function (value) {
	    push$d(result, value);
	  });
	  return result;
	};

	// `Array.prototype.uniqueBy` method
	// https://github.com/tc39/proposal-array-unique
	_export({ target: 'Array', proto: true, forced: true }, {
	  uniqueBy: arrayUniqueBy$2
	});

	addToUnscopables('uniqueBy');

	var $TypeError$m = TypeError;

	// Includes
	// - Perform ? RequireInternalSlot(O, [[ArrayBufferData]]).
	// - If IsSharedArrayBuffer(O) is true, throw a TypeError exception.
	var arrayBufferByteLength = functionUncurryThisAccessor(ArrayBuffer.prototype, 'byteLength', 'get') || function (O) {
	  if (classofRaw(O) !== 'ArrayBuffer') throw new $TypeError$m('ArrayBuffer expected');
	  return O.byteLength;
	};

	var slice$4 = functionUncurryThis(ArrayBuffer.prototype.slice);

	var arrayBufferIsDetached = function (O) {
	  if (arrayBufferByteLength(O) !== 0) return false;
	  try {
	    slice$4(O, 0, 0);
	    return false;
	  } catch (error) {
	    return true;
	  }
	};

	var ArrayBufferPrototype$1 = ArrayBuffer.prototype;

	if (descriptors && !('detached' in ArrayBufferPrototype$1)) {
	  defineBuiltInAccessor(ArrayBufferPrototype$1, 'detached', {
	    configurable: true,
	    get: function detached() {
	      return arrayBufferIsDetached(this);
	    }
	  });
	}

	var tryNodeRequire = function (name) {
	  try {
	    // eslint-disable-next-line no-new-func -- safe
	    if (engineIsNode) return Function('return require("' + name + '")')();
	  } catch (error) { /* empty */ }
	};

	var structuredClone$2 = global_1.structuredClone;

	var structuredCloneProperTransfer = !!structuredClone$2 && !fails(function () {
	  // prevent V8 ArrayBufferDetaching protector cell invalidation and performance degradation
	  // https://github.com/zloirock/core-js/issues/679
	  if ((engineIsDeno && engineV8Version > 92) || (engineIsNode && engineV8Version > 94) || (engineIsBrowser && engineV8Version > 97)) return false;
	  var buffer = new ArrayBuffer(8);
	  var clone = structuredClone$2(buffer, { transfer: [buffer] });
	  return buffer.byteLength !== 0 || clone.byteLength !== 8;
	});

	var structuredClone$1 = global_1.structuredClone;
	var $ArrayBuffer = global_1.ArrayBuffer;
	var $MessageChannel = global_1.MessageChannel;
	var detach = false;
	var WorkerThreads, channel, buffer$1, $detach;

	if (structuredCloneProperTransfer) {
	  detach = function (transferable) {
	    structuredClone$1(transferable, { transfer: [transferable] });
	  };
	} else if ($ArrayBuffer) try {
	  if (!$MessageChannel) {
	    WorkerThreads = tryNodeRequire('worker_threads');
	    if (WorkerThreads) $MessageChannel = WorkerThreads.MessageChannel;
	  }

	  if ($MessageChannel) {
	    channel = new $MessageChannel();
	    buffer$1 = new $ArrayBuffer(2);

	    $detach = function (transferable) {
	      channel.port1.postMessage(null, [transferable]);
	    };

	    if (buffer$1.byteLength === 2) {
	      $detach(buffer$1);
	      if (buffer$1.byteLength === 0) detach = $detach;
	    }
	  }
	} catch (error) { /* empty */ }

	var detachTransferable = detach;

	var structuredClone = global_1.structuredClone;
	var ArrayBuffer$1 = global_1.ArrayBuffer;
	var DataView$2 = global_1.DataView;
	var TypeError$4 = global_1.TypeError;
	var min$3 = Math.min;
	var ArrayBufferPrototype = ArrayBuffer$1.prototype;
	var DataViewPrototype = DataView$2.prototype;
	var slice$3 = functionUncurryThis(ArrayBufferPrototype.slice);
	var isResizable = functionUncurryThisAccessor(ArrayBufferPrototype, 'resizable', 'get');
	var maxByteLength = functionUncurryThisAccessor(ArrayBufferPrototype, 'maxByteLength', 'get');
	var getInt8 = functionUncurryThis(DataViewPrototype.getInt8);
	var setInt8 = functionUncurryThis(DataViewPrototype.setInt8);

	var arrayBufferTransfer = (structuredCloneProperTransfer || detachTransferable) && function (arrayBuffer, newLength, preserveResizability) {
	  var byteLength = arrayBufferByteLength(arrayBuffer);
	  var newByteLength = newLength === undefined ? byteLength : toIndex(newLength);
	  var fixedLength = !isResizable || !isResizable(arrayBuffer);
	  var newBuffer;
	  if (arrayBufferIsDetached(arrayBuffer)) throw new TypeError$4('ArrayBuffer is detached');
	  if (structuredCloneProperTransfer) {
	    arrayBuffer = structuredClone(arrayBuffer, { transfer: [arrayBuffer] });
	    if (byteLength === newByteLength && (preserveResizability || fixedLength)) return arrayBuffer;
	  }
	  if (byteLength >= newByteLength && (!preserveResizability || fixedLength)) {
	    newBuffer = slice$3(arrayBuffer, 0, newByteLength);
	  } else {
	    var options = preserveResizability && !fixedLength && maxByteLength ? { maxByteLength: maxByteLength(arrayBuffer) } : undefined;
	    newBuffer = new ArrayBuffer$1(newByteLength, options);
	    var a = new DataView$2(arrayBuffer);
	    var b = new DataView$2(newBuffer);
	    var copyLength = min$3(newByteLength, byteLength);
	    for (var i = 0; i < copyLength; i++) setInt8(b, i, getInt8(a, i));
	  }
	  if (!structuredCloneProperTransfer) detachTransferable(arrayBuffer);
	  return newBuffer;
	};

	// `ArrayBuffer.prototype.transfer` method
	// https://tc39.es/proposal-arraybuffer-transfer/#sec-arraybuffer.prototype.transfer
	if (arrayBufferTransfer) _export({ target: 'ArrayBuffer', proto: true }, {
	  transfer: function transfer() {
	    return arrayBufferTransfer(this, arguments.length ? arguments[0] : undefined, true);
	  }
	});

	// `ArrayBuffer.prototype.transferToFixedLength` method
	// https://tc39.es/proposal-arraybuffer-transfer/#sec-arraybuffer.prototype.transfertofixedlength
	if (arrayBufferTransfer) _export({ target: 'ArrayBuffer', proto: true }, {
	  transferToFixedLength: function transferToFixedLength() {
	    return arrayBufferTransfer(this, arguments.length ? arguments[0] : undefined, false);
	  }
	});

	var ASYNC_DISPOSE$2 = wellKnownSymbol('asyncDispose');
	var DISPOSE$2 = wellKnownSymbol('dispose');

	var push$c = functionUncurryThis([].push);

	// `GetDisposeMethod` abstract operation
	// https://tc39.es/proposal-explicit-resource-management/#sec-getdisposemethod
	var getDisposeMethod = function (V, hint) {
	  if (hint === 'async-dispose') {
	    var method = getMethod(V, ASYNC_DISPOSE$2);
	    if (method !== undefined) return method;
	    method = getMethod(V, DISPOSE$2);
	    return function () {
	      functionCall(method, this);
	    };
	  } return getMethod(V, DISPOSE$2);
	};

	// `CreateDisposableResource` abstract operation
	// https://tc39.es/proposal-explicit-resource-management/#sec-createdisposableresource
	var createDisposableResource = function (V, hint, method) {
	  if (arguments.length < 3 && !isNullOrUndefined(V)) {
	    method = aCallable(getDisposeMethod(anObject(V), hint));
	  }

	  return method === undefined ? function () {
	    return undefined;
	  } : functionBindContext(method, V);
	};

	// `AddDisposableResource` abstract operation
	// https://tc39.es/proposal-explicit-resource-management/#sec-adddisposableresource
	var addDisposableResource = function (disposable, V, hint, method) {
	  var resource;
	  if (arguments.length < 4) {
	    // When `V`` is either `null` or `undefined` and hint is `async-dispose`,
	    // we record that the resource was evaluated to ensure we will still perform an `Await` when resources are later disposed.
	    if (isNullOrUndefined(V) && hint === 'sync-dispose') return;
	    resource = createDisposableResource(V, hint);
	  } else {
	    resource = createDisposableResource(undefined, hint, method);
	  }

	  push$c(disposable.stack, resource);
	};

	// https://github.com/tc39/proposal-async-explicit-resource-management












	var Promise$5 = getBuiltIn('Promise');
	var SuppressedError$1 = getBuiltIn('SuppressedError');
	var $ReferenceError$1 = ReferenceError;

	var ASYNC_DISPOSE$1 = wellKnownSymbol('asyncDispose');
	var TO_STRING_TAG$5 = wellKnownSymbol('toStringTag');

	var ASYNC_DISPOSABLE_STACK = 'AsyncDisposableStack';
	var setInternalState$c = internalState.set;
	var getAsyncDisposableStackInternalState = internalState.getterFor(ASYNC_DISPOSABLE_STACK);

	var HINT$1 = 'async-dispose';
	var DISPOSED$1 = 'disposed';
	var PENDING$1 = 'pending';

	var getPendingAsyncDisposableStackInternalState = function (stack) {
	  var internalState = getAsyncDisposableStackInternalState(stack);
	  if (internalState.state === DISPOSED$1) throw new $ReferenceError$1(ASYNC_DISPOSABLE_STACK + ' already disposed');
	  return internalState;
	};

	var $AsyncDisposableStack = function AsyncDisposableStack() {
	  setInternalState$c(anInstance(this, AsyncDisposableStackPrototype), {
	    type: ASYNC_DISPOSABLE_STACK,
	    state: PENDING$1,
	    stack: []
	  });

	  if (!descriptors) this.disposed = false;
	};

	var AsyncDisposableStackPrototype = $AsyncDisposableStack.prototype;

	defineBuiltIns(AsyncDisposableStackPrototype, {
	  disposeAsync: function disposeAsync() {
	    var asyncDisposableStack = this;
	    return new Promise$5(function (resolve, reject) {
	      var internalState = getAsyncDisposableStackInternalState(asyncDisposableStack);
	      if (internalState.state === DISPOSED$1) return resolve(undefined);
	      internalState.state = DISPOSED$1;
	      if (!descriptors) asyncDisposableStack.disposed = true;
	      var stack = internalState.stack;
	      var i = stack.length;
	      var thrown = false;
	      var suppressed;

	      var handleError = function (result) {
	        if (thrown) {
	          suppressed = new SuppressedError$1(result, suppressed);
	        } else {
	          thrown = true;
	          suppressed = result;
	        }

	        loop();
	      };

	      var loop = function () {
	        if (i) {
	          var disposeMethod = stack[--i];
	          stack[i] = null;
	          try {
	            Promise$5.resolve(disposeMethod()).then(loop, handleError);
	          } catch (error) {
	            handleError(error);
	          }
	        } else {
	          internalState.stack = null;
	          thrown ? reject(suppressed) : resolve(undefined);
	        }
	      };

	      loop();
	    });
	  },
	  use: function use(value) {
	    addDisposableResource(getPendingAsyncDisposableStackInternalState(this), value, HINT$1);
	    return value;
	  },
	  adopt: function adopt(value, onDispose) {
	    var internalState = getPendingAsyncDisposableStackInternalState(this);
	    aCallable(onDispose);
	    addDisposableResource(internalState, undefined, HINT$1, function () {
	      return onDispose(value);
	    });
	    return value;
	  },
	  defer: function defer(onDispose) {
	    var internalState = getPendingAsyncDisposableStackInternalState(this);
	    aCallable(onDispose);
	    addDisposableResource(internalState, undefined, HINT$1, onDispose);
	  },
	  move: function move() {
	    var internalState = getPendingAsyncDisposableStackInternalState(this);
	    var newAsyncDisposableStack = new $AsyncDisposableStack();
	    getAsyncDisposableStackInternalState(newAsyncDisposableStack).stack = internalState.stack;
	    internalState.stack = [];
	    internalState.state = DISPOSED$1;
	    if (!descriptors) this.disposed = true;
	    return newAsyncDisposableStack;
	  }
	});

	if (descriptors) defineBuiltInAccessor(AsyncDisposableStackPrototype, 'disposed', {
	  configurable: true,
	  get: function disposed() {
	    return getAsyncDisposableStackInternalState(this).state === DISPOSED$1;
	  }
	});

	defineBuiltIn(AsyncDisposableStackPrototype, ASYNC_DISPOSE$1, AsyncDisposableStackPrototype.disposeAsync, { name: 'disposeAsync' });
	defineBuiltIn(AsyncDisposableStackPrototype, TO_STRING_TAG$5, ASYNC_DISPOSABLE_STACK, { nonWritable: true });

	_export({ global: true, constructor: true }, {
	  AsyncDisposableStack: $AsyncDisposableStack
	});

	var TO_STRING_TAG$4 = wellKnownSymbol('toStringTag');

	var $TypeError$l = TypeError;

	var AsyncIteratorConstructor = function AsyncIterator() {
	  anInstance(this, asyncIteratorPrototype);
	  if (objectGetPrototypeOf(this) === asyncIteratorPrototype) throw new $TypeError$l('Abstract class AsyncIterator not directly constructable');
	};

	AsyncIteratorConstructor.prototype = asyncIteratorPrototype;

	if (!hasOwnProperty_1(asyncIteratorPrototype, TO_STRING_TAG$4)) {
	  createNonEnumerableProperty(asyncIteratorPrototype, TO_STRING_TAG$4, 'AsyncIterator');
	}

	if (!hasOwnProperty_1(asyncIteratorPrototype, 'constructor') || asyncIteratorPrototype.constructor === Object) {
	  createNonEnumerableProperty(asyncIteratorPrototype, 'constructor', AsyncIteratorConstructor);
	}

	// `AsyncIterator` constructor
	// https://github.com/tc39/proposal-async-iterator-helpers
	_export({ global: true, constructor: true, forced: isPure }, {
	  AsyncIterator: AsyncIteratorConstructor
	});

	var Promise$4 = getBuiltIn('Promise');

	var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
	var ASYNC_ITERATOR_HELPER = 'AsyncIteratorHelper';
	var WRAP_FOR_VALID_ASYNC_ITERATOR = 'WrapForValidAsyncIterator';
	var setInternalState$b = internalState.set;

	var createAsyncIteratorProxyPrototype = function (IS_ITERATOR) {
	  var IS_GENERATOR = !IS_ITERATOR;
	  var getInternalState = internalState.getterFor(IS_ITERATOR ? WRAP_FOR_VALID_ASYNC_ITERATOR : ASYNC_ITERATOR_HELPER);

	  var getStateOrEarlyExit = function (that) {
	    var stateCompletion = perform(function () {
	      return getInternalState(that);
	    });

	    var stateError = stateCompletion.error;
	    var state = stateCompletion.value;

	    if (stateError || (IS_GENERATOR && state.done)) {
	      return { exit: true, value: stateError ? Promise$4.reject(state) : Promise$4.resolve(createIterResultObject(undefined, true)) };
	    } return { exit: false, value: state };
	  };

	  return defineBuiltIns(objectCreate(asyncIteratorPrototype), {
	    next: function next() {
	      var stateCompletion = getStateOrEarlyExit(this);
	      var state = stateCompletion.value;
	      if (stateCompletion.exit) return state;
	      var handlerCompletion = perform(function () {
	        return anObject(state.nextHandler(Promise$4));
	      });
	      var handlerError = handlerCompletion.error;
	      var value = handlerCompletion.value;
	      if (handlerError) state.done = true;
	      return handlerError ? Promise$4.reject(value) : Promise$4.resolve(value);
	    },
	    'return': function () {
	      var stateCompletion = getStateOrEarlyExit(this);
	      var state = stateCompletion.value;
	      if (stateCompletion.exit) return state;
	      state.done = true;
	      var iterator = state.iterator;
	      var returnMethod, result;
	      var completion = perform(function () {
	        if (state.inner) try {
	          iteratorClose(state.inner.iterator, 'normal');
	        } catch (error) {
	          return iteratorClose(iterator, 'throw', error);
	        }
	        return getMethod(iterator, 'return');
	      });
	      returnMethod = result = completion.value;
	      if (completion.error) return Promise$4.reject(result);
	      if (returnMethod === undefined) return Promise$4.resolve(createIterResultObject(undefined, true));
	      completion = perform(function () {
	        return functionCall(returnMethod, iterator);
	      });
	      result = completion.value;
	      if (completion.error) return Promise$4.reject(result);
	      return IS_ITERATOR ? Promise$4.resolve(result) : Promise$4.resolve(result).then(function (resolved) {
	        anObject(resolved);
	        return createIterResultObject(undefined, true);
	      });
	    }
	  });
	};

	var WrapForValidAsyncIteratorPrototype = createAsyncIteratorProxyPrototype(true);
	var AsyncIteratorHelperPrototype = createAsyncIteratorProxyPrototype(false);

	createNonEnumerableProperty(AsyncIteratorHelperPrototype, TO_STRING_TAG$3, 'Async Iterator Helper');

	var asyncIteratorCreateProxy = function (nextHandler, IS_ITERATOR) {
	  var AsyncIteratorProxy = function AsyncIterator(record, state) {
	    if (state) {
	      state.iterator = record.iterator;
	      state.next = record.next;
	    } else state = record;
	    state.type = IS_ITERATOR ? WRAP_FOR_VALID_ASYNC_ITERATOR : ASYNC_ITERATOR_HELPER;
	    state.nextHandler = nextHandler;
	    state.counter = 0;
	    state.done = false;
	    setInternalState$b(this, state);
	  };

	  AsyncIteratorProxy.prototype = IS_ITERATOR ? WrapForValidAsyncIteratorPrototype : AsyncIteratorHelperPrototype;

	  return AsyncIteratorProxy;
	};

	var AsyncIteratorProxy$4 = asyncIteratorCreateProxy(function (Promise) {
	  var state = this;
	  var iterator = state.iterator;
	  var mapper = state.mapper;

	  return new Promise(function (resolve, reject) {
	    var doneAndReject = function (error) {
	      state.done = true;
	      reject(error);
	    };

	    var ifAbruptCloseAsyncIterator = function (error) {
	      asyncIteratorClose(iterator, doneAndReject, error, doneAndReject);
	    };

	    Promise.resolve(anObject(functionCall(state.next, iterator))).then(function (step) {
	      try {
	        if (anObject(step).done) {
	          state.done = true;
	          resolve(createIterResultObject(undefined, true));
	        } else {
	          var value = step.value;
	          try {
	            var result = mapper(value, state.counter++);

	            var handler = function (mapped) {
	              resolve(createIterResultObject(mapped, false));
	            };

	            if (isObject$1(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
	            else handler(result);
	          } catch (error2) { ifAbruptCloseAsyncIterator(error2); }
	        }
	      } catch (error) { doneAndReject(error); }
	    }, doneAndReject);
	  });
	});

	// `AsyncIterator.prototype.map` method
	// https://github.com/tc39/proposal-iterator-helpers
	var asyncIteratorMap = function map(mapper) {
	  anObject(this);
	  aCallable(mapper);
	  return new AsyncIteratorProxy$4(getIteratorDirect(this), {
	    mapper: mapper
	  });
	};

	var callback$1 = function (value, counter) {
	  return [counter, value];
	};

	// `AsyncIterator.prototype.indexed` method
	// https://github.com/tc39/proposal-iterator-helpers
	var asyncIteratorIndexed = function indexed() {
	  return functionCall(asyncIteratorMap, this, callback$1);
	};

	// TODO: Remove from `core-js@4`



	// `AsyncIterator.prototype.asIndexedPairs` method
	// https://github.com/tc39/proposal-iterator-helpers
	_export({ target: 'AsyncIterator', name: 'indexed', proto: true, real: true, forced: true }, {
	  asIndexedPairs: asyncIteratorIndexed
	});

	// https://github.com/tc39/proposal-async-explicit-resource-management








	var ASYNC_DISPOSE = wellKnownSymbol('asyncDispose');
	var Promise$3 = getBuiltIn('Promise');

	if (!hasOwnProperty_1(asyncIteratorPrototype, ASYNC_DISPOSE)) {
	  defineBuiltIn(asyncIteratorPrototype, ASYNC_DISPOSE, function () {
	    var O = this;
	    return new Promise$3(function (resolve, reject) {
	      var $return = getMethod(O, 'return');
	      if ($return) {
	        Promise$3.resolve(functionCall($return, O)).then(function () {
	          resolve(undefined);
	        }, reject);
	      } else resolve(undefined);
	    });
	  });
	}

	var $RangeError$4 = RangeError;

	var notANan = function (it) {
	  // eslint-disable-next-line no-self-compare -- NaN check
	  if (it === it) return it;
	  throw new $RangeError$4('NaN is not allowed');
	};

	var AsyncIteratorProxy$3 = asyncIteratorCreateProxy(function (Promise) {
	  var state = this;

	  return new Promise(function (resolve, reject) {
	    var doneAndReject = function (error) {
	      state.done = true;
	      reject(error);
	    };

	    var loop = function () {
	      try {
	        Promise.resolve(anObject(functionCall(state.next, state.iterator))).then(function (step) {
	          try {
	            if (anObject(step).done) {
	              state.done = true;
	              resolve(createIterResultObject(undefined, true));
	            } else if (state.remaining) {
	              state.remaining--;
	              loop();
	            } else resolve(createIterResultObject(step.value, false));
	          } catch (err) { doneAndReject(err); }
	        }, doneAndReject);
	      } catch (error) { doneAndReject(error); }
	    };

	    loop();
	  });
	});

	// `AsyncIterator.prototype.drop` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	_export({ target: 'AsyncIterator', proto: true, real: true, forced: isPure }, {
	  drop: function drop(limit) {
	    anObject(this);
	    var remaining = toPositiveInteger(notANan(+limit));
	    return new AsyncIteratorProxy$3(getIteratorDirect(this), {
	      remaining: remaining
	    });
	  }
	});

	var $every = asyncIteratorIteration.every;

	// `AsyncIterator.prototype.every` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	_export({ target: 'AsyncIterator', proto: true, real: true }, {
	  every: function every(predicate) {
	    return $every(this, predicate);
	  }
	});

	var AsyncIteratorProxy$2 = asyncIteratorCreateProxy(function (Promise) {
	  var state = this;
	  var iterator = state.iterator;
	  var predicate = state.predicate;

	  return new Promise(function (resolve, reject) {
	    var doneAndReject = function (error) {
	      state.done = true;
	      reject(error);
	    };

	    var ifAbruptCloseAsyncIterator = function (error) {
	      asyncIteratorClose(iterator, doneAndReject, error, doneAndReject);
	    };

	    var loop = function () {
	      try {
	        Promise.resolve(anObject(functionCall(state.next, iterator))).then(function (step) {
	          try {
	            if (anObject(step).done) {
	              state.done = true;
	              resolve(createIterResultObject(undefined, true));
	            } else {
	              var value = step.value;
	              try {
	                var result = predicate(value, state.counter++);

	                var handler = function (selected) {
	                  selected ? resolve(createIterResultObject(value, false)) : loop();
	                };

	                if (isObject$1(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
	                else handler(result);
	              } catch (error3) { ifAbruptCloseAsyncIterator(error3); }
	            }
	          } catch (error2) { doneAndReject(error2); }
	        }, doneAndReject);
	      } catch (error) { doneAndReject(error); }
	    };

	    loop();
	  });
	});

	// `AsyncIterator.prototype.filter` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	_export({ target: 'AsyncIterator', proto: true, real: true, forced: isPure }, {
	  filter: function filter(predicate) {
	    anObject(this);
	    aCallable(predicate);
	    return new AsyncIteratorProxy$2(getIteratorDirect(this), {
	      predicate: predicate
	    });
	  }
	});

	var $find = asyncIteratorIteration.find;

	// `AsyncIterator.prototype.find` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	_export({ target: 'AsyncIterator', proto: true, real: true }, {
	  find: function find(predicate) {
	    return $find(this, predicate);
	  }
	});

	var ASYNC_ITERATOR = wellKnownSymbol('asyncIterator');

	var getAsyncIteratorFlattenable = function (obj) {
	  var object = anObject(obj);
	  var alreadyAsync = true;
	  var method = getMethod(object, ASYNC_ITERATOR);
	  var iterator;
	  if (!isCallable(method)) {
	    method = getIteratorMethod(object);
	    alreadyAsync = false;
	  }
	  if (method !== undefined) {
	    iterator = functionCall(method, object);
	  } else {
	    iterator = object;
	    alreadyAsync = true;
	  }
	  anObject(iterator);
	  return getIteratorDirect(alreadyAsync ? iterator : new asyncFromSyncIterator(getIteratorDirect(iterator)));
	};

	var AsyncIteratorProxy$1 = asyncIteratorCreateProxy(function (Promise) {
	  var state = this;
	  var iterator = state.iterator;
	  var mapper = state.mapper;

	  return new Promise(function (resolve, reject) {
	    var doneAndReject = function (error) {
	      state.done = true;
	      reject(error);
	    };

	    var ifAbruptCloseAsyncIterator = function (error) {
	      asyncIteratorClose(iterator, doneAndReject, error, doneAndReject);
	    };

	    var outerLoop = function () {
	      try {
	        Promise.resolve(anObject(functionCall(state.next, iterator))).then(function (step) {
	          try {
	            if (anObject(step).done) {
	              state.done = true;
	              resolve(createIterResultObject(undefined, true));
	            } else {
	              var value = step.value;
	              try {
	                var result = mapper(value, state.counter++);

	                var handler = function (mapped) {
	                  try {
	                    state.inner = getAsyncIteratorFlattenable(mapped);
	                    innerLoop();
	                  } catch (error4) { ifAbruptCloseAsyncIterator(error4); }
	                };

	                if (isObject$1(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
	                else handler(result);
	              } catch (error3) { ifAbruptCloseAsyncIterator(error3); }
	            }
	          } catch (error2) { doneAndReject(error2); }
	        }, doneAndReject);
	      } catch (error) { doneAndReject(error); }
	    };

	    var innerLoop = function () {
	      var inner = state.inner;
	      if (inner) {
	        try {
	          Promise.resolve(anObject(functionCall(inner.next, inner.iterator))).then(function (result) {
	            try {
	              if (anObject(result).done) {
	                state.inner = null;
	                outerLoop();
	              } else resolve(createIterResultObject(result.value, false));
	            } catch (error1) { ifAbruptCloseAsyncIterator(error1); }
	          }, ifAbruptCloseAsyncIterator);
	        } catch (error) { ifAbruptCloseAsyncIterator(error); }
	      } else outerLoop();
	    };

	    innerLoop();
	  });
	});

	// `AsyncIterator.prototype.flaMap` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	_export({ target: 'AsyncIterator', proto: true, real: true, forced: isPure }, {
	  flatMap: function flatMap(mapper) {
	    anObject(this);
	    aCallable(mapper);
	    return new AsyncIteratorProxy$1(getIteratorDirect(this), {
	      mapper: mapper,
	      inner: null
	    });
	  }
	});

	var $forEach = asyncIteratorIteration.forEach;

	// `AsyncIterator.prototype.forEach` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	_export({ target: 'AsyncIterator', proto: true, real: true }, {
	  forEach: function forEach(fn) {
	    return $forEach(this, fn);
	  }
	});

	var asyncIteratorWrap = asyncIteratorCreateProxy(function () {
	  return functionCall(this.next, this.iterator);
	}, true);

	// `AsyncIterator.from` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	_export({ target: 'AsyncIterator', stat: true, forced: isPure }, {
	  from: function from(O) {
	    var iteratorRecord = getAsyncIteratorFlattenable(typeof O == 'string' ? toObject(O) : O);
	    return objectIsPrototypeOf(asyncIteratorPrototype, iteratorRecord.iterator)
	      ? iteratorRecord.iterator
	      : new asyncIteratorWrap(iteratorRecord);
	  }
	});

	// TODO: Remove from `core-js@4`



	// `AsyncIterator.prototype.indexed` method
	// https://github.com/tc39/proposal-iterator-helpers
	_export({ target: 'AsyncIterator', proto: true, real: true, forced: true }, {
	  indexed: asyncIteratorIndexed
	});

	// `AsyncIterator.prototype.map` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	_export({ target: 'AsyncIterator', proto: true, real: true, forced: isPure }, {
	  map: asyncIteratorMap
	});

	var Promise$2 = getBuiltIn('Promise');
	var $TypeError$k = TypeError;

	// `AsyncIterator.prototype.reduce` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	_export({ target: 'AsyncIterator', proto: true, real: true }, {
	  reduce: function reduce(reducer /* , initialValue */) {
	    anObject(this);
	    aCallable(reducer);
	    var record = getIteratorDirect(this);
	    var iterator = record.iterator;
	    var next = record.next;
	    var noInitial = arguments.length < 2;
	    var accumulator = noInitial ? undefined : arguments[1];
	    var counter = 0;

	    return new Promise$2(function (resolve, reject) {
	      var ifAbruptCloseAsyncIterator = function (error) {
	        asyncIteratorClose(iterator, reject, error, reject);
	      };

	      var loop = function () {
	        try {
	          Promise$2.resolve(anObject(functionCall(next, iterator))).then(function (step) {
	            try {
	              if (anObject(step).done) {
	                noInitial ? reject(new $TypeError$k('Reduce of empty iterator with no initial value')) : resolve(accumulator);
	              } else {
	                var value = step.value;
	                if (noInitial) {
	                  noInitial = false;
	                  accumulator = value;
	                  loop();
	                } else try {
	                  var result = reducer(accumulator, value, counter);

	                  var handler = function ($result) {
	                    accumulator = $result;
	                    loop();
	                  };

	                  if (isObject$1(result)) Promise$2.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
	                  else handler(result);
	                } catch (error3) { ifAbruptCloseAsyncIterator(error3); }
	              }
	              counter++;
	            } catch (error2) { reject(error2); }
	          }, reject);
	        } catch (error) { reject(error); }
	      };

	      loop();
	    });
	  }
	});

	var $some = asyncIteratorIteration.some;

	// `AsyncIterator.prototype.some` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	_export({ target: 'AsyncIterator', proto: true, real: true }, {
	  some: function some(predicate) {
	    return $some(this, predicate);
	  }
	});

	var AsyncIteratorProxy = asyncIteratorCreateProxy(function (Promise) {
	  var state = this;
	  var iterator = state.iterator;
	  var returnMethod;

	  if (!state.remaining--) {
	    var resultDone = createIterResultObject(undefined, true);
	    state.done = true;
	    returnMethod = iterator['return'];
	    if (returnMethod !== undefined) {
	      return Promise.resolve(functionCall(returnMethod, iterator, undefined)).then(function () {
	        return resultDone;
	      });
	    }
	    return resultDone;
	  } return Promise.resolve(functionCall(state.next, iterator)).then(function (step) {
	    if (anObject(step).done) {
	      state.done = true;
	      return createIterResultObject(undefined, true);
	    } return createIterResultObject(step.value, false);
	  }).then(null, function (error) {
	    state.done = true;
	    throw error;
	  });
	});

	// `AsyncIterator.prototype.take` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	_export({ target: 'AsyncIterator', proto: true, real: true, forced: isPure }, {
	  take: function take(limit) {
	    anObject(this);
	    var remaining = toPositiveInteger(notANan(+limit));
	    return new AsyncIteratorProxy(getIteratorDirect(this), {
	      remaining: remaining
	    });
	  }
	});

	var $toArray = asyncIteratorIteration.toArray;

	// `AsyncIterator.prototype.toArray` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	_export({ target: 'AsyncIterator', proto: true, real: true }, {
	  toArray: function toArray() {
	    return $toArray(this, undefined, []);
	  }
	});

	var INCORRECT_RANGE = 'Incorrect Iterator.range arguments';
	var NUMERIC_RANGE_ITERATOR = 'NumericRangeIterator';

	var setInternalState$a = internalState.set;
	var getInternalState$5 = internalState.getterFor(NUMERIC_RANGE_ITERATOR);

	var $RangeError$3 = RangeError;
	var $TypeError$j = TypeError;

	var $RangeIterator = iteratorCreateConstructor(function NumericRangeIterator(start, end, option, type, zero, one) {
	  // TODO: Drop the first `typeof` check after removing legacy methods in `core-js@4`
	  if (typeof start != type || (end !== Infinity && end !== -Infinity && typeof end != type)) {
	    throw new $TypeError$j(INCORRECT_RANGE);
	  }
	  if (start === Infinity || start === -Infinity) {
	    throw new $RangeError$3(INCORRECT_RANGE);
	  }
	  var ifIncrease = end > start;
	  var inclusiveEnd = false;
	  var step;
	  if (option === undefined) {
	    step = undefined;
	  } else if (isObject$1(option)) {
	    step = option.step;
	    inclusiveEnd = !!option.inclusive;
	  } else if (typeof option == type) {
	    step = option;
	  } else {
	    throw new $TypeError$j(INCORRECT_RANGE);
	  }
	  if (isNullOrUndefined(step)) {
	    step = ifIncrease ? one : -one;
	  }
	  if (typeof step != type) {
	    throw new $TypeError$j(INCORRECT_RANGE);
	  }
	  if (step === Infinity || step === -Infinity || (step === zero && start !== end)) {
	    throw new $RangeError$3(INCORRECT_RANGE);
	  }
	  // eslint-disable-next-line no-self-compare -- NaN check
	  var hitsEnd = start !== start || end !== end || step !== step || (end > start) !== (step > zero);
	  setInternalState$a(this, {
	    type: NUMERIC_RANGE_ITERATOR,
	    start: start,
	    end: end,
	    step: step,
	    inclusive: inclusiveEnd,
	    hitsEnd: hitsEnd,
	    currentCount: zero,
	    zero: zero
	  });
	  if (!descriptors) {
	    this.start = start;
	    this.end = end;
	    this.step = step;
	    this.inclusive = inclusiveEnd;
	  }
	}, NUMERIC_RANGE_ITERATOR, function next() {
	  var state = getInternalState$5(this);
	  if (state.hitsEnd) return createIterResultObject(undefined, true);
	  var start = state.start;
	  var end = state.end;
	  var step = state.step;
	  var currentYieldingValue = start + (step * state.currentCount++);
	  if (currentYieldingValue === end) state.hitsEnd = true;
	  var inclusiveEnd = state.inclusive;
	  var endCondition;
	  if (end > start) {
	    endCondition = inclusiveEnd ? currentYieldingValue > end : currentYieldingValue >= end;
	  } else {
	    endCondition = inclusiveEnd ? end > currentYieldingValue : end >= currentYieldingValue;
	  }
	  if (endCondition) {
	    state.hitsEnd = true;
	    return createIterResultObject(undefined, true);
	  } return createIterResultObject(currentYieldingValue, false);
	});

	var addGetter = function (key) {
	  defineBuiltInAccessor($RangeIterator.prototype, key, {
	    get: function () {
	      return getInternalState$5(this)[key];
	    },
	    set: function () { /* empty */ },
	    configurable: true,
	    enumerable: false
	  });
	};

	if (descriptors) {
	  addGetter('start');
	  addGetter('end');
	  addGetter('inclusive');
	  addGetter('step');
	}

	var numericRangeIterator = $RangeIterator;

	/* eslint-disable es/no-bigint -- safe */



	// `BigInt.range` method
	// https://github.com/tc39/proposal-Number.range
	// TODO: Remove from `core-js@4`
	if (typeof BigInt == 'function') {
	  _export({ target: 'BigInt', stat: true, forced: true }, {
	    range: function range(start, end, option) {
	      return new numericRangeIterator(start, end, option, 'bigint', BigInt(0), BigInt(1));
	    }
	  });
	}

	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`






	var $Object$2 = Object;
	var $TypeError$i = TypeError;
	var Map$8 = getBuiltIn('Map');
	var WeakMap$3 = getBuiltIn('WeakMap');

	var Node$1 = function () {
	  // keys
	  this.object = null;
	  this.symbol = null;
	  // child nodes
	  this.primitives = null;
	  this.objectsByIndex = objectCreate(null);
	};

	Node$1.prototype.get = function (key, initializer) {
	  return this[key] || (this[key] = initializer());
	};

	Node$1.prototype.next = function (i, it, IS_OBJECT) {
	  var store = IS_OBJECT
	    ? this.objectsByIndex[i] || (this.objectsByIndex[i] = new WeakMap$3())
	    : this.primitives || (this.primitives = new Map$8());
	  var entry = store.get(it);
	  if (!entry) store.set(it, entry = new Node$1());
	  return entry;
	};

	var root$1 = new Node$1();

	var compositeKey = function () {
	  var active = root$1;
	  var length = arguments.length;
	  var i, it;
	  // for prevent leaking, start from objects
	  for (i = 0; i < length; i++) {
	    if (isObject$1(it = arguments[i])) active = active.next(i, it, true);
	  }
	  if (this === $Object$2 && active === root$1) throw new $TypeError$i('Composite keys must contain a non-primitive component');
	  for (i = 0; i < length; i++) {
	    if (!isObject$1(it = arguments[i])) active = active.next(i, it, false);
	  } return active;
	};

	var $Object$1 = Object;

	var initializer = function () {
	  var freeze = getBuiltIn('Object', 'freeze');
	  return freeze ? freeze(objectCreate(null)) : objectCreate(null);
	};

	// https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey
	_export({ global: true, forced: true }, {
	  compositeKey: function compositeKey$1() {
	    return functionApply(compositeKey, $Object$1, arguments).get('object', initializer);
	  }
	});

	// https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey
	_export({ global: true, forced: true }, {
	  compositeSymbol: function compositeSymbol() {
	    if (arguments.length === 1 && typeof arguments[0] == 'string') return getBuiltIn('Symbol')['for'](arguments[0]);
	    return functionApply(compositeKey, null, arguments).get('symbol', getBuiltIn('Symbol'));
	  }
	});

	var unpackIEEE754 = ieee754$1.unpack;

	// eslint-disable-next-line es/no-typed-arrays -- safe
	var getUint16 = functionUncurryThis(DataView.prototype.getUint16);

	// `DataView.prototype.getFloat16` method
	// https://github.com/tc39/proposal-float16array
	_export({ target: 'DataView', proto: true }, {
	  getFloat16: function getFloat16(byteOffset /* , littleEndian */) {
	    var uint16 = getUint16(this, byteOffset, arguments.length > 1 ? arguments[1] : false);
	    return unpackIEEE754([uint16 & 0xFF, uint16 >> 8 & 0xFF], 10);
	  }
	});

	// eslint-disable-next-line es/no-typed-arrays -- safe
	var getUint8 = functionUncurryThis(DataView.prototype.getUint8);

	// `DataView.prototype.getUint8Clamped` method
	// https://github.com/tc39/proposal-dataview-get-set-uint8clamped
	_export({ target: 'DataView', proto: true, forced: true }, {
	  getUint8Clamped: function getUint8Clamped(byteOffset) {
	    return getUint8(this, byteOffset);
	  }
	});

	var $TypeError$h = TypeError;

	var aDataView = function (argument) {
	  if (classof(argument) === 'DataView') return argument;
	  throw new $TypeError$h('Argument is not a DataView');
	};

	var FLOAT16_EPSILON = 0.0009765625;
	var FLOAT16_MAX_VALUE = 65504;
	var FLOAT16_MIN_VALUE = 6.103515625e-05;

	// `Math.f16round` method implementation
	// https://github.com/tc39/proposal-float16array
	var mathF16round = Math.f16round || function f16round(x) {
	  return mathFloatRound(x, FLOAT16_EPSILON, FLOAT16_MAX_VALUE, FLOAT16_MIN_VALUE);
	};

	var packIEEE754 = ieee754$1.pack;


	// eslint-disable-next-line es/no-typed-arrays -- safe
	var setUint16 = functionUncurryThis(DataView.prototype.setUint16);

	// `DataView.prototype.setFloat16` method
	// https://github.com/tc39/proposal-float16array
	_export({ target: 'DataView', proto: true }, {
	  setFloat16: function setFloat16(byteOffset, value /* , littleEndian */) {
	    aDataView(this);
	    var offset = toIndex(byteOffset);
	    var bytes = packIEEE754(mathF16round(value), 10, 2);
	    return setUint16(this, offset, bytes[1] << 8 | bytes[0], arguments.length > 2 ? arguments[2] : false);
	  }
	});

	// eslint-disable-next-line es/no-typed-arrays -- safe
	var setUint8 = functionUncurryThis(DataView.prototype.setUint8);

	// `DataView.prototype.setUint8Clamped` method
	// https://github.com/tc39/proposal-dataview-get-set-uint8clamped
	_export({ target: 'DataView', proto: true, forced: true }, {
	  setUint8Clamped: function setUint8Clamped(byteOffset, value) {
	    aDataView(this);
	    var offset = toIndex(byteOffset);
	    return setUint8(this, offset, toUint8Clamped(value));
	  }
	});

	// https://github.com/tc39/proposal-explicit-resource-management












	var SuppressedError = getBuiltIn('SuppressedError');
	var $ReferenceError = ReferenceError;

	var DISPOSE$1 = wellKnownSymbol('dispose');
	var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');

	var DISPOSABLE_STACK = 'DisposableStack';
	var setInternalState$9 = internalState.set;
	var getDisposableStackInternalState = internalState.getterFor(DISPOSABLE_STACK);

	var HINT = 'sync-dispose';
	var DISPOSED = 'disposed';
	var PENDING = 'pending';

	var getPendingDisposableStackInternalState = function (stack) {
	  var internalState = getDisposableStackInternalState(stack);
	  if (internalState.state === DISPOSED) throw new $ReferenceError(DISPOSABLE_STACK + ' already disposed');
	  return internalState;
	};

	var $DisposableStack = function DisposableStack() {
	  setInternalState$9(anInstance(this, DisposableStackPrototype), {
	    type: DISPOSABLE_STACK,
	    state: PENDING,
	    stack: []
	  });

	  if (!descriptors) this.disposed = false;
	};

	var DisposableStackPrototype = $DisposableStack.prototype;

	defineBuiltIns(DisposableStackPrototype, {
	  dispose: function dispose() {
	    var internalState = getDisposableStackInternalState(this);
	    if (internalState.state === DISPOSED) return;
	    internalState.state = DISPOSED;
	    if (!descriptors) this.disposed = true;
	    var stack = internalState.stack;
	    var i = stack.length;
	    var thrown = false;
	    var suppressed;
	    while (i) {
	      var disposeMethod = stack[--i];
	      stack[i] = null;
	      try {
	        disposeMethod();
	      } catch (errorResult) {
	        if (thrown) {
	          suppressed = new SuppressedError(errorResult, suppressed);
	        } else {
	          thrown = true;
	          suppressed = errorResult;
	        }
	      }
	    }
	    internalState.stack = null;
	    if (thrown) throw suppressed;
	  },
	  use: function use(value) {
	    addDisposableResource(getPendingDisposableStackInternalState(this), value, HINT);
	    return value;
	  },
	  adopt: function adopt(value, onDispose) {
	    var internalState = getPendingDisposableStackInternalState(this);
	    aCallable(onDispose);
	    addDisposableResource(internalState, undefined, HINT, function () {
	      onDispose(value);
	    });
	    return value;
	  },
	  defer: function defer(onDispose) {
	    var internalState = getPendingDisposableStackInternalState(this);
	    aCallable(onDispose);
	    addDisposableResource(internalState, undefined, HINT, onDispose);
	  },
	  move: function move() {
	    var internalState = getPendingDisposableStackInternalState(this);
	    var newDisposableStack = new $DisposableStack();
	    getDisposableStackInternalState(newDisposableStack).stack = internalState.stack;
	    internalState.stack = [];
	    internalState.state = DISPOSED;
	    if (!descriptors) this.disposed = true;
	    return newDisposableStack;
	  }
	});

	if (descriptors) defineBuiltInAccessor(DisposableStackPrototype, 'disposed', {
	  configurable: true,
	  get: function disposed() {
	    return getDisposableStackInternalState(this).state === DISPOSED;
	  }
	});

	defineBuiltIn(DisposableStackPrototype, DISPOSE$1, DisposableStackPrototype.dispose, { name: 'dispose' });
	defineBuiltIn(DisposableStackPrototype, TO_STRING_TAG$2, DISPOSABLE_STACK, { nonWritable: true });

	_export({ global: true, constructor: true }, {
	  DisposableStack: $DisposableStack
	});

	var functionDemethodize = function demethodize() {
	  return functionUncurryThis(aCallable(this));
	};

	// `Function.prototype.demethodize` method
	// https://github.com/js-choi/proposal-function-demethodize
	_export({ target: 'Function', proto: true, forced: true }, {
	  demethodize: functionDemethodize
	});

	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getOwnPropertyDescriptor$3 = Object.getOwnPropertyDescriptor;
	var classRegExp = /^\s*class\b/;
	var exec$9 = functionUncurryThis(classRegExp.exec);

	var isClassConstructor = function (argument) {
	  try {
	    // `Function#toString` throws on some built-it function in some legacy engines
	    // (for example, `DOMQuad` and similar in FF41-)
	    if (!descriptors || !exec$9(classRegExp, inspectSource(argument))) return false;
	  } catch (error) { /* empty */ }
	  var prototype = getOwnPropertyDescriptor$3(argument, 'prototype');
	  return !!prototype && hasOwnProperty_1(prototype, 'writable') && !prototype.writable;
	};

	// `Function.isCallable` method
	// https://github.com/caitp/TC39-Proposals/blob/trunk/tc39-reflect-isconstructor-iscallable.md
	_export({ target: 'Function', stat: true, sham: true, forced: true }, {
	  isCallable: function isCallable$1(argument) {
	    return isCallable(argument) && !isClassConstructor(argument);
	  }
	});

	// `Function.isConstructor` method
	// https://github.com/caitp/TC39-Proposals/blob/trunk/tc39-reflect-isconstructor-iscallable.md
	_export({ target: 'Function', stat: true, forced: true }, {
	  isConstructor: isConstructor
	});

	var defineProperty$7 = objectDefineProperty.f;

	var METADATA = wellKnownSymbol('metadata');
	var FunctionPrototype = Function.prototype;

	// Function.prototype[@@metadata]
	// https://github.com/tc39/proposal-decorator-metadata
	if (FunctionPrototype[METADATA] === undefined) {
	  defineProperty$7(FunctionPrototype, METADATA, {
	    value: null
	  });
	}

	// `Function.prototype.unThis` method
	// https://github.com/js-choi/proposal-function-demethodize
	// TODO: Remove from `core-js@4`
	_export({ target: 'Function', proto: true, forced: true, name: 'demethodize' }, {
	  unThis: functionDemethodize
	});

	var IteratorPrototype$3 = iteratorsCore.IteratorPrototype;



	var CONSTRUCTOR = 'constructor';
	var ITERATOR$4 = 'Iterator';
	var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');

	var $TypeError$g = TypeError;
	var NativeIterator = global_1[ITERATOR$4];

	// FF56- have non-standard global helper `Iterator`
	var FORCED$1 = !isCallable(NativeIterator)
	  || NativeIterator.prototype !== IteratorPrototype$3
	  // FF44- non-standard `Iterator` passes previous tests
	  || !fails(function () { NativeIterator({}); });

	var IteratorConstructor = function Iterator() {
	  anInstance(this, IteratorPrototype$3);
	  if (objectGetPrototypeOf(this) === IteratorPrototype$3) throw new $TypeError$g('Abstract class Iterator not directly constructable');
	};

	var defineIteratorPrototypeAccessor = function (key, value) {
	  if (descriptors) {
	    defineBuiltInAccessor(IteratorPrototype$3, key, {
	      configurable: true,
	      get: function () {
	        return value;
	      },
	      set: function (replacement) {
	        anObject(this);
	        if (this === IteratorPrototype$3) throw new $TypeError$g("You can't redefine this property");
	        if (hasOwnProperty_1(this, key)) this[key] = replacement;
	        else createProperty(this, key, replacement);
	      }
	    });
	  } else IteratorPrototype$3[key] = value;
	};

	if (!hasOwnProperty_1(IteratorPrototype$3, TO_STRING_TAG$1)) defineIteratorPrototypeAccessor(TO_STRING_TAG$1, ITERATOR$4);

	if (FORCED$1 || !hasOwnProperty_1(IteratorPrototype$3, CONSTRUCTOR) || IteratorPrototype$3[CONSTRUCTOR] === Object) {
	  defineIteratorPrototypeAccessor(CONSTRUCTOR, IteratorConstructor);
	}

	IteratorConstructor.prototype = IteratorPrototype$3;

	// `Iterator` constructor
	// https://github.com/tc39/proposal-iterator-helpers
	_export({ global: true, constructor: true, forced: FORCED$1 }, {
	  Iterator: IteratorConstructor
	});

	var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;



	var TO_STRING_TAG = wellKnownSymbol('toStringTag');
	var ITERATOR_HELPER = 'IteratorHelper';
	var WRAP_FOR_VALID_ITERATOR = 'WrapForValidIterator';
	var setInternalState$8 = internalState.set;

	var createIteratorProxyPrototype = function (IS_ITERATOR) {
	  var getInternalState = internalState.getterFor(IS_ITERATOR ? WRAP_FOR_VALID_ITERATOR : ITERATOR_HELPER);

	  return defineBuiltIns(objectCreate(IteratorPrototype$2), {
	    next: function next() {
	      var state = getInternalState(this);
	      // for simplification:
	      //   for `%WrapForValidIteratorPrototype%.next` our `nextHandler` returns `IterResultObject`
	      //   for `%IteratorHelperPrototype%.next` - just a value
	      if (IS_ITERATOR) return state.nextHandler();
	      try {
	        var result = state.done ? undefined : state.nextHandler();
	        return createIterResultObject(result, state.done);
	      } catch (error) {
	        state.done = true;
	        throw error;
	      }
	    },
	    'return': function () {
	      var state = getInternalState(this);
	      var iterator = state.iterator;
	      state.done = true;
	      if (IS_ITERATOR) {
	        var returnMethod = getMethod(iterator, 'return');
	        return returnMethod ? functionCall(returnMethod, iterator) : createIterResultObject(undefined, true);
	      }
	      if (state.inner) try {
	        iteratorClose(state.inner.iterator, 'normal');
	      } catch (error) {
	        return iteratorClose(iterator, 'throw', error);
	      }
	      iteratorClose(iterator, 'normal');
	      return createIterResultObject(undefined, true);
	    }
	  });
	};

	var WrapForValidIteratorPrototype = createIteratorProxyPrototype(true);
	var IteratorHelperPrototype = createIteratorProxyPrototype(false);

	createNonEnumerableProperty(IteratorHelperPrototype, TO_STRING_TAG, 'Iterator Helper');

	var iteratorCreateProxy = function (nextHandler, IS_ITERATOR) {
	  var IteratorProxy = function Iterator(record, state) {
	    if (state) {
	      state.iterator = record.iterator;
	      state.next = record.next;
	    } else state = record;
	    state.type = IS_ITERATOR ? WRAP_FOR_VALID_ITERATOR : ITERATOR_HELPER;
	    state.nextHandler = nextHandler;
	    state.counter = 0;
	    state.done = false;
	    setInternalState$8(this, state);
	  };

	  IteratorProxy.prototype = IS_ITERATOR ? WrapForValidIteratorPrototype : IteratorHelperPrototype;

	  return IteratorProxy;
	};

	var IteratorProxy$5 = iteratorCreateProxy(function () {
	  var iterator = this.iterator;
	  var result = anObject(functionCall(this.next, iterator));
	  var done = this.done = !!result.done;
	  if (!done) return callWithSafeIterationClosing(iterator, this.mapper, [result.value, this.counter++], true);
	});

	// `Iterator.prototype.map` method
	// https://github.com/tc39/proposal-iterator-helpers
	var iteratorMap = function map(mapper) {
	  anObject(this);
	  aCallable(mapper);
	  return new IteratorProxy$5(getIteratorDirect(this), {
	    mapper: mapper
	  });
	};

	var callback = function (value, counter) {
	  return [counter, value];
	};

	// `Iterator.prototype.indexed` method
	// https://github.com/tc39/proposal-iterator-helpers
	var iteratorIndexed = function indexed() {
	  return functionCall(iteratorMap, this, callback);
	};

	// TODO: Remove from `core-js@4`



	// `Iterator.prototype.asIndexedPairs` method
	// https://github.com/tc39/proposal-iterator-helpers
	_export({ target: 'Iterator', name: 'indexed', proto: true, real: true, forced: true }, {
	  asIndexedPairs: iteratorIndexed
	});

	// https://github.com/tc39/proposal-explicit-resource-management





	var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;

	var DISPOSE = wellKnownSymbol('dispose');

	if (!hasOwnProperty_1(IteratorPrototype$1, DISPOSE)) {
	  defineBuiltIn(IteratorPrototype$1, DISPOSE, function () {
	    var $return = getMethod(this, 'return');
	    if ($return) functionCall($return, this);
	  });
	}

	var IteratorProxy$4 = iteratorCreateProxy(function () {
	  var iterator = this.iterator;
	  var next = this.next;
	  var result, done;
	  while (this.remaining) {
	    this.remaining--;
	    result = anObject(functionCall(next, iterator));
	    done = this.done = !!result.done;
	    if (done) return;
	  }
	  result = anObject(functionCall(next, iterator));
	  done = this.done = !!result.done;
	  if (!done) return result.value;
	});

	// `Iterator.prototype.drop` method
	// https://github.com/tc39/proposal-iterator-helpers
	_export({ target: 'Iterator', proto: true, real: true, forced: isPure }, {
	  drop: function drop(limit) {
	    anObject(this);
	    var remaining = toPositiveInteger(notANan(+limit));
	    return new IteratorProxy$4(getIteratorDirect(this), {
	      remaining: remaining
	    });
	  }
	});

	// `Iterator.prototype.every` method
	// https://github.com/tc39/proposal-iterator-helpers
	_export({ target: 'Iterator', proto: true, real: true }, {
	  every: function every(predicate) {
	    anObject(this);
	    aCallable(predicate);
	    var record = getIteratorDirect(this);
	    var counter = 0;
	    return !iterate(record, function (value, stop) {
	      if (!predicate(value, counter++)) return stop();
	    }, { IS_RECORD: true, INTERRUPTED: true }).stopped;
	  }
	});

	var IteratorProxy$3 = iteratorCreateProxy(function () {
	  var iterator = this.iterator;
	  var predicate = this.predicate;
	  var next = this.next;
	  var result, done, value;
	  while (true) {
	    result = anObject(functionCall(next, iterator));
	    done = this.done = !!result.done;
	    if (done) return;
	    value = result.value;
	    if (callWithSafeIterationClosing(iterator, predicate, [value, this.counter++], true)) return value;
	  }
	});

	// `Iterator.prototype.filter` method
	// https://github.com/tc39/proposal-iterator-helpers
	_export({ target: 'Iterator', proto: true, real: true, forced: isPure }, {
	  filter: function filter(predicate) {
	    anObject(this);
	    aCallable(predicate);
	    return new IteratorProxy$3(getIteratorDirect(this), {
	      predicate: predicate
	    });
	  }
	});

	// `Iterator.prototype.find` method
	// https://github.com/tc39/proposal-iterator-helpers
	_export({ target: 'Iterator', proto: true, real: true }, {
	  find: function find(predicate) {
	    anObject(this);
	    aCallable(predicate);
	    var record = getIteratorDirect(this);
	    var counter = 0;
	    return iterate(record, function (value, stop) {
	      if (predicate(value, counter++)) return stop(value);
	    }, { IS_RECORD: true, INTERRUPTED: true }).result;
	  }
	});

	var getIteratorFlattenable = function (obj, stringHandling) {
	  if (!stringHandling || typeof obj !== 'string') anObject(obj);
	  var method = getIteratorMethod(obj);
	  return getIteratorDirect(anObject(method !== undefined ? functionCall(method, obj) : obj));
	};

	var IteratorProxy$2 = iteratorCreateProxy(function () {
	  var iterator = this.iterator;
	  var mapper = this.mapper;
	  var result, inner;

	  while (true) {
	    if (inner = this.inner) try {
	      result = anObject(functionCall(inner.next, inner.iterator));
	      if (!result.done) return result.value;
	      this.inner = null;
	    } catch (error) { iteratorClose(iterator, 'throw', error); }

	    result = anObject(functionCall(this.next, iterator));

	    if (this.done = !!result.done) return;

	    try {
	      this.inner = getIteratorFlattenable(mapper(result.value, this.counter++), false);
	    } catch (error) { iteratorClose(iterator, 'throw', error); }
	  }
	});

	// `Iterator.prototype.flatMap` method
	// https://github.com/tc39/proposal-iterator-helpers
	_export({ target: 'Iterator', proto: true, real: true, forced: isPure }, {
	  flatMap: function flatMap(mapper) {
	    anObject(this);
	    aCallable(mapper);
	    return new IteratorProxy$2(getIteratorDirect(this), {
	      mapper: mapper,
	      inner: null
	    });
	  }
	});

	// `Iterator.prototype.forEach` method
	// https://github.com/tc39/proposal-iterator-helpers
	_export({ target: 'Iterator', proto: true, real: true }, {
	  forEach: function forEach(fn) {
	    anObject(this);
	    aCallable(fn);
	    var record = getIteratorDirect(this);
	    var counter = 0;
	    iterate(record, function (value) {
	      fn(value, counter++);
	    }, { IS_RECORD: true });
	  }
	});

	var IteratorPrototype = iteratorsCore.IteratorPrototype;




	var IteratorProxy$1 = iteratorCreateProxy(function () {
	  return functionCall(this.next, this.iterator);
	}, true);

	// `Iterator.from` method
	// https://github.com/tc39/proposal-iterator-helpers
	_export({ target: 'Iterator', stat: true, forced: isPure }, {
	  from: function from(O) {
	    var iteratorRecord = getIteratorFlattenable(typeof O == 'string' ? toObject(O) : O, true);
	    return objectIsPrototypeOf(IteratorPrototype, iteratorRecord.iterator)
	      ? iteratorRecord.iterator
	      : new IteratorProxy$1(iteratorRecord);
	  }
	});

	// TODO: Remove from `core-js@4`



	// `Iterator.prototype.indexed` method
	// https://github.com/tc39/proposal-iterator-helpers
	_export({ target: 'Iterator', proto: true, real: true, forced: true }, {
	  indexed: iteratorIndexed
	});

	// `Iterator.prototype.map` method
	// https://github.com/tc39/proposal-iterator-helpers
	_export({ target: 'Iterator', proto: true, real: true, forced: isPure }, {
	  map: iteratorMap
	});

	/* eslint-disable es/no-bigint -- safe */



	var $TypeError$f = TypeError;

	// `Iterator.range` method
	// https://github.com/tc39/proposal-Number.range
	_export({ target: 'Iterator', stat: true, forced: true }, {
	  range: function range(start, end, option) {
	    if (typeof start == 'number') return new numericRangeIterator(start, end, option, 'number', 0, 1);
	    if (typeof start == 'bigint') return new numericRangeIterator(start, end, option, 'bigint', BigInt(0), BigInt(1));
	    throw new $TypeError$f('Incorrect Iterator.range arguments');
	  }
	});

	var $TypeError$e = TypeError;

	// `Iterator.prototype.reduce` method
	// https://github.com/tc39/proposal-iterator-helpers
	_export({ target: 'Iterator', proto: true, real: true }, {
	  reduce: function reduce(reducer /* , initialValue */) {
	    anObject(this);
	    aCallable(reducer);
	    var record = getIteratorDirect(this);
	    var noInitial = arguments.length < 2;
	    var accumulator = noInitial ? undefined : arguments[1];
	    var counter = 0;
	    iterate(record, function (value) {
	      if (noInitial) {
	        noInitial = false;
	        accumulator = value;
	      } else {
	        accumulator = reducer(accumulator, value, counter);
	      }
	      counter++;
	    }, { IS_RECORD: true });
	    if (noInitial) throw new $TypeError$e('Reduce of empty iterator with no initial value');
	    return accumulator;
	  }
	});

	// `Iterator.prototype.some` method
	// https://github.com/tc39/proposal-iterator-helpers
	_export({ target: 'Iterator', proto: true, real: true }, {
	  some: function some(predicate) {
	    anObject(this);
	    aCallable(predicate);
	    var record = getIteratorDirect(this);
	    var counter = 0;
	    return iterate(record, function (value, stop) {
	      if (predicate(value, counter++)) return stop();
	    }, { IS_RECORD: true, INTERRUPTED: true }).stopped;
	  }
	});

	var IteratorProxy = iteratorCreateProxy(function () {
	  var iterator = this.iterator;
	  if (!this.remaining--) {
	    this.done = true;
	    return iteratorClose(iterator, 'normal', undefined);
	  }
	  var result = anObject(functionCall(this.next, iterator));
	  var done = this.done = !!result.done;
	  if (!done) return result.value;
	});

	// `Iterator.prototype.take` method
	// https://github.com/tc39/proposal-iterator-helpers
	_export({ target: 'Iterator', proto: true, real: true, forced: isPure }, {
	  take: function take(limit) {
	    anObject(this);
	    var remaining = toPositiveInteger(notANan(+limit));
	    return new IteratorProxy(getIteratorDirect(this), {
	      remaining: remaining
	    });
	  }
	});

	var push$b = [].push;

	// `Iterator.prototype.toArray` method
	// https://github.com/tc39/proposal-iterator-helpers
	_export({ target: 'Iterator', proto: true, real: true }, {
	  toArray: function toArray() {
	    var result = [];
	    iterate(getIteratorDirect(anObject(this)), push$b, { that: result, IS_RECORD: true });
	    return result;
	  }
	});

	// `Iterator.prototype.toAsync` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	_export({ target: 'Iterator', proto: true, real: true, forced: isPure }, {
	  toAsync: function toAsync() {
	    return new asyncIteratorWrap(getIteratorDirect(new asyncFromSyncIterator(getIteratorDirect(anObject(this)))));
	  }
	});

	/* eslint-disable es/no-json -- safe */


	var nativeRawJson = !fails(function () {
	  var unsafeInt = '9007199254740993';
	  var raw = JSON.rawJSON(unsafeInt);
	  return !JSON.isRawJSON(raw) || JSON.stringify(raw) !== unsafeInt;
	});

	var getInternalState$4 = internalState.get;

	var isRawJson = function isRawJSON(O) {
	  if (!isObject$1(O)) return false;
	  var state = getInternalState$4(O);
	  return !!state && state.type === 'RawJSON';
	};

	// `JSON.parse` method
	// https://tc39.es/proposal-json-parse-with-source/#sec-json.israwjson
	// https://github.com/tc39/proposal-json-parse-with-source
	_export({ target: 'JSON', stat: true, forced: !nativeRawJson }, {
	  isRawJSON: isRawJson
	});

	var $SyntaxError$2 = SyntaxError;
	var $parseInt$1 = parseInt;
	var fromCharCode$3 = String.fromCharCode;
	var at$2 = functionUncurryThis(''.charAt);
	var slice$2 = functionUncurryThis(''.slice);
	var exec$8 = functionUncurryThis(/./.exec);

	var codePoints = {
	  '\\"': '"',
	  '\\\\': '\\',
	  '\\/': '/',
	  '\\b': '\b',
	  '\\f': '\f',
	  '\\n': '\n',
	  '\\r': '\r',
	  '\\t': '\t'
	};

	var IS_4_HEX_DIGITS = /^[\da-f]{4}$/i;
	// eslint-disable-next-line regexp/no-control-character -- safe
	var IS_C0_CONTROL_CODE = /^[\u0000-\u001F]$/;

	var parseJsonString = function (source, i) {
	  var unterminated = true;
	  var value = '';
	  while (i < source.length) {
	    var chr = at$2(source, i);
	    if (chr === '\\') {
	      var twoChars = slice$2(source, i, i + 2);
	      if (hasOwnProperty_1(codePoints, twoChars)) {
	        value += codePoints[twoChars];
	        i += 2;
	      } else if (twoChars === '\\u') {
	        i += 2;
	        var fourHexDigits = slice$2(source, i, i + 4);
	        if (!exec$8(IS_4_HEX_DIGITS, fourHexDigits)) throw new $SyntaxError$2('Bad Unicode escape at: ' + i);
	        value += fromCharCode$3($parseInt$1(fourHexDigits, 16));
	        i += 4;
	      } else throw new $SyntaxError$2('Unknown escape sequence: "' + twoChars + '"');
	    } else if (chr === '"') {
	      unterminated = false;
	      i++;
	      break;
	    } else {
	      if (exec$8(IS_C0_CONTROL_CODE, chr)) throw new $SyntaxError$2('Bad control character in string literal at: ' + i);
	      value += chr;
	      i++;
	    }
	  }
	  if (unterminated) throw new $SyntaxError$2('Unterminated string at: ' + i);
	  return { value: value, end: i };
	};

	var JSON$1 = global_1.JSON;
	var Number$1 = global_1.Number;
	var SyntaxError$3 = global_1.SyntaxError;
	var nativeParse = JSON$1 && JSON$1.parse;
	var enumerableOwnProperties = getBuiltIn('Object', 'keys');
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getOwnPropertyDescriptor$2 = Object.getOwnPropertyDescriptor;
	var at$1 = functionUncurryThis(''.charAt);
	var slice$1 = functionUncurryThis(''.slice);
	var exec$7 = functionUncurryThis(/./.exec);
	var push$a = functionUncurryThis([].push);

	var IS_DIGIT = /^\d$/;
	var IS_NON_ZERO_DIGIT = /^[1-9]$/;
	var IS_NUMBER_START = /^(?:-|\d)$/;
	var IS_WHITESPACE$1 = /^[\t\n\r ]$/;

	var PRIMITIVE = 0;
	var OBJECT = 1;

	var $parse = function (source, reviver) {
	  source = toString_1$1(source);
	  var context = new Context(source, 0);
	  var root = context.parse();
	  var value = root.value;
	  var endIndex = context.skip(IS_WHITESPACE$1, root.end);
	  if (endIndex < source.length) {
	    throw new SyntaxError$3('Unexpected extra character: "' + at$1(source, endIndex) + '" after the parsed data at: ' + endIndex);
	  }
	  return isCallable(reviver) ? internalize({ '': value }, '', reviver, root) : value;
	};

	var internalize = function (holder, name, reviver, node) {
	  var val = holder[name];
	  var unmodified = node && val === node.value;
	  var context = unmodified && typeof node.source == 'string' ? { source: node.source } : {};
	  var elementRecordsLen, keys, len, i, P;
	  if (isObject$1(val)) {
	    var nodeIsArray = isArray$2(val);
	    var nodes = unmodified ? node.nodes : nodeIsArray ? [] : {};
	    if (nodeIsArray) {
	      elementRecordsLen = nodes.length;
	      len = lengthOfArrayLike(val);
	      for (i = 0; i < len; i++) {
	        internalizeProperty(val, i, internalize(val, '' + i, reviver, i < elementRecordsLen ? nodes[i] : undefined));
	      }
	    } else {
	      keys = enumerableOwnProperties(val);
	      len = lengthOfArrayLike(keys);
	      for (i = 0; i < len; i++) {
	        P = keys[i];
	        internalizeProperty(val, P, internalize(val, P, reviver, hasOwnProperty_1(nodes, P) ? nodes[P] : undefined));
	      }
	    }
	  }
	  return functionCall(reviver, holder, name, val, context);
	};

	var internalizeProperty = function (object, key, value) {
	  if (descriptors) {
	    var descriptor = getOwnPropertyDescriptor$2(object, key);
	    if (descriptor && !descriptor.configurable) return;
	  }
	  if (value === undefined) delete object[key];
	  else createProperty(object, key, value);
	};

	var Node = function (value, end, source, nodes) {
	  this.value = value;
	  this.end = end;
	  this.source = source;
	  this.nodes = nodes;
	};

	var Context = function (source, index) {
	  this.source = source;
	  this.index = index;
	};

	// https://www.json.org/json-en.html
	Context.prototype = {
	  fork: function (nextIndex) {
	    return new Context(this.source, nextIndex);
	  },
	  parse: function () {
	    var source = this.source;
	    var i = this.skip(IS_WHITESPACE$1, this.index);
	    var fork = this.fork(i);
	    var chr = at$1(source, i);
	    if (exec$7(IS_NUMBER_START, chr)) return fork.number();
	    switch (chr) {
	      case '{':
	        return fork.object();
	      case '[':
	        return fork.array();
	      case '"':
	        return fork.string();
	      case 't':
	        return fork.keyword(true);
	      case 'f':
	        return fork.keyword(false);
	      case 'n':
	        return fork.keyword(null);
	    } throw new SyntaxError$3('Unexpected character: "' + chr + '" at: ' + i);
	  },
	  node: function (type, value, start, end, nodes) {
	    return new Node(value, end, type ? null : slice$1(this.source, start, end), nodes);
	  },
	  object: function () {
	    var source = this.source;
	    var i = this.index + 1;
	    var expectKeypair = false;
	    var object = {};
	    var nodes = {};
	    while (i < source.length) {
	      i = this.until(['"', '}'], i);
	      if (at$1(source, i) === '}' && !expectKeypair) {
	        i++;
	        break;
	      }
	      // Parsing the key
	      var result = this.fork(i).string();
	      var key = result.value;
	      i = result.end;
	      i = this.until([':'], i) + 1;
	      // Parsing value
	      i = this.skip(IS_WHITESPACE$1, i);
	      result = this.fork(i).parse();
	      createProperty(nodes, key, result);
	      createProperty(object, key, result.value);
	      i = this.until([',', '}'], result.end);
	      var chr = at$1(source, i);
	      if (chr === ',') {
	        expectKeypair = true;
	        i++;
	      } else if (chr === '}') {
	        i++;
	        break;
	      }
	    }
	    return this.node(OBJECT, object, this.index, i, nodes);
	  },
	  array: function () {
	    var source = this.source;
	    var i = this.index + 1;
	    var expectElement = false;
	    var array = [];
	    var nodes = [];
	    while (i < source.length) {
	      i = this.skip(IS_WHITESPACE$1, i);
	      if (at$1(source, i) === ']' && !expectElement) {
	        i++;
	        break;
	      }
	      var result = this.fork(i).parse();
	      push$a(nodes, result);
	      push$a(array, result.value);
	      i = this.until([',', ']'], result.end);
	      if (at$1(source, i) === ',') {
	        expectElement = true;
	        i++;
	      } else if (at$1(source, i) === ']') {
	        i++;
	        break;
	      }
	    }
	    return this.node(OBJECT, array, this.index, i, nodes);
	  },
	  string: function () {
	    var index = this.index;
	    var parsed = parseJsonString(this.source, this.index + 1);
	    return this.node(PRIMITIVE, parsed.value, index, parsed.end);
	  },
	  number: function () {
	    var source = this.source;
	    var startIndex = this.index;
	    var i = startIndex;
	    if (at$1(source, i) === '-') i++;
	    if (at$1(source, i) === '0') i++;
	    else if (exec$7(IS_NON_ZERO_DIGIT, at$1(source, i))) i = this.skip(IS_DIGIT, ++i);
	    else throw new SyntaxError$3('Failed to parse number at: ' + i);
	    if (at$1(source, i) === '.') i = this.skip(IS_DIGIT, ++i);
	    if (at$1(source, i) === 'e' || at$1(source, i) === 'E') {
	      i++;
	      if (at$1(source, i) === '+' || at$1(source, i) === '-') i++;
	      var exponentStartIndex = i;
	      i = this.skip(IS_DIGIT, i);
	      if (exponentStartIndex === i) throw new SyntaxError$3("Failed to parse number's exponent value at: " + i);
	    }
	    return this.node(PRIMITIVE, Number$1(slice$1(source, startIndex, i)), startIndex, i);
	  },
	  keyword: function (value) {
	    var keyword = '' + value;
	    var index = this.index;
	    var endIndex = index + keyword.length;
	    if (slice$1(this.source, index, endIndex) !== keyword) throw new SyntaxError$3('Failed to parse value at: ' + index);
	    return this.node(PRIMITIVE, value, index, endIndex);
	  },
	  skip: function (regex, i) {
	    var source = this.source;
	    for (; i < source.length; i++) if (!exec$7(regex, at$1(source, i))) break;
	    return i;
	  },
	  until: function (array, i) {
	    i = this.skip(IS_WHITESPACE$1, i);
	    var chr = at$1(this.source, i);
	    for (var j = 0; j < array.length; j++) if (array[j] === chr) return i;
	    throw new SyntaxError$3('Unexpected character: "' + chr + '" at: ' + i);
	  }
	};

	var NO_SOURCE_SUPPORT = fails(function () {
	  var unsafeInt = '9007199254740993';
	  var source;
	  nativeParse(unsafeInt, function (key, value, context) {
	    source = context.source;
	  });
	  return source !== unsafeInt;
	});

	var PROPER_BASE_PARSE = symbolConstructorDetection && !fails(function () {
	  // Safari 9 bug
	  return 1 / nativeParse('-0 \t') !== -Infinity;
	});

	// `JSON.parse` method
	// https://tc39.es/ecma262/#sec-json.parse
	// https://github.com/tc39/proposal-json-parse-with-source
	_export({ target: 'JSON', stat: true, forced: NO_SOURCE_SUPPORT }, {
	  parse: function parse(text, reviver) {
	    return PROPER_BASE_PARSE && !isCallable(reviver) ? nativeParse(text) : $parse(text, reviver);
	  }
	});

	var setInternalState$7 = internalState.set;

	var $String$1 = String;
	var $SyntaxError$1 = SyntaxError;
	var parse = getBuiltIn('JSON', 'parse');
	var $stringify = getBuiltIn('JSON', 'stringify');
	var create = getBuiltIn('Object', 'create');
	var freeze$1 = getBuiltIn('Object', 'freeze');
	var at = functionUncurryThis(''.charAt);
	var slice = functionUncurryThis(''.slice);
	var exec$6 = functionUncurryThis(/./.exec);
	var push$9 = functionUncurryThis([].push);

	var MARK = uid();
	var MARK_LENGTH = MARK.length;
	var ERROR_MESSAGE = 'Unacceptable as raw JSON';
	var IS_WHITESPACE = /^[\t\n\r ]$/;

	// `JSON.parse` method
	// https://tc39.es/proposal-json-parse-with-source/#sec-json.israwjson
	// https://github.com/tc39/proposal-json-parse-with-source
	_export({ target: 'JSON', stat: true, forced: !nativeRawJson }, {
	  rawJSON: function rawJSON(text) {
	    var jsonString = toString_1$1(text);
	    if (jsonString === '' || exec$6(IS_WHITESPACE, at(jsonString, 0)) || exec$6(IS_WHITESPACE, at(jsonString, jsonString.length - 1))) {
	      throw new $SyntaxError$1(ERROR_MESSAGE);
	    }
	    var parsed = parse(jsonString);
	    if (typeof parsed == 'object' && parsed !== null) throw new $SyntaxError$1(ERROR_MESSAGE);
	    var obj = create(null);
	    setInternalState$7(obj, { type: 'RawJSON' });
	    createProperty(obj, 'rawJSON', jsonString);
	    return freezing ? freeze$1(obj) : obj;
	  }
	});

	// `JSON.stringify` method
	// https://tc39.es/ecma262/#sec-json.stringify
	// https://github.com/tc39/proposal-json-parse-with-source
	if ($stringify) _export({ target: 'JSON', stat: true, arity: 3, forced: !nativeRawJson }, {
	  stringify: function stringify(text, replacer, space) {
	    var replacerFunction = getJsonReplacerFunction(replacer);
	    var rawStrings = [];

	    var json = $stringify(text, function (key, value) {
	      // some old implementations (like WebKit) could pass numbers as keys
	      var v = isCallable(replacerFunction) ? functionCall(replacerFunction, this, $String$1(key), value) : value;
	      return isRawJson(v) ? MARK + (push$9(rawStrings, v.rawJSON) - 1) : v;
	    }, space);

	    if (typeof json != 'string') return json;

	    var result = '';
	    var length = json.length;

	    for (var i = 0; i < length; i++) {
	      var chr = at(json, i);
	      if (chr === '"') {
	        var end = parseJsonString(json, ++i).end - 1;
	        var string = slice(json, i, end);
	        result += slice(string, 0, MARK_LENGTH) === MARK
	          ? rawStrings[slice(string, MARK_LENGTH)]
	          : '"' + string + '"';
	        i = end;
	      } else result += chr;
	    }

	    return result;
	  }
	});

	var has$b = mapHelpers.has;

	// Perform ? RequireInternalSlot(M, [[MapData]])
	var aMap = function (it) {
	  has$b(it);
	  return it;
	};

	var remove$5 = mapHelpers.remove;

	// `Map.prototype.deleteAll` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Map', proto: true, real: true, forced: true }, {
	  deleteAll: function deleteAll(/* ...elements */) {
	    var collection = aMap(this);
	    var allDeleted = true;
	    var wasDeleted;
	    for (var k = 0, len = arguments.length; k < len; k++) {
	      wasDeleted = remove$5(collection, arguments[k]);
	      allDeleted = allDeleted && wasDeleted;
	    } return !!allDeleted;
	  }
	});

	var get$3 = mapHelpers.get;
	var has$a = mapHelpers.has;
	var set$6 = mapHelpers.set;

	// `Map.prototype.emplace` method
	// https://github.com/tc39/proposal-upsert
	_export({ target: 'Map', proto: true, real: true, forced: true }, {
	  emplace: function emplace(key, handler) {
	    var map = aMap(this);
	    var value, inserted;
	    if (has$a(map, key)) {
	      value = get$3(map, key);
	      if ('update' in handler) {
	        value = handler.update(value, key, map);
	        set$6(map, key, value);
	      } return value;
	    }
	    inserted = handler.insert(key, map);
	    set$6(map, key, inserted);
	    return inserted;
	  }
	});

	// `Map.prototype.every` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Map', proto: true, real: true, forced: true }, {
	  every: function every(callbackfn /* , thisArg */) {
	    var map = aMap(this);
	    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    return mapIterate(map, function (value, key) {
	      if (!boundFunction(value, key, map)) return false;
	    }, true) !== false;
	  }
	});

	var Map$7 = mapHelpers.Map;
	var set$5 = mapHelpers.set;

	// `Map.prototype.filter` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Map', proto: true, real: true, forced: true }, {
	  filter: function filter(callbackfn /* , thisArg */) {
	    var map = aMap(this);
	    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    var newMap = new Map$7();
	    mapIterate(map, function (value, key) {
	      if (boundFunction(value, key, map)) set$5(newMap, key, value);
	    });
	    return newMap;
	  }
	});

	// `Map.prototype.find` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Map', proto: true, real: true, forced: true }, {
	  find: function find(callbackfn /* , thisArg */) {
	    var map = aMap(this);
	    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    var result = mapIterate(map, function (value, key) {
	      if (boundFunction(value, key, map)) return { value: value };
	    }, true);
	    return result && result.value;
	  }
	});

	// `Map.prototype.findKey` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Map', proto: true, real: true, forced: true }, {
	  findKey: function findKey(callbackfn /* , thisArg */) {
	    var map = aMap(this);
	    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    var result = mapIterate(map, function (value, key) {
	      if (boundFunction(value, key, map)) return { key: key };
	    }, true);
	    return result && result.key;
	  }
	});

	// https://tc39.github.io/proposal-setmap-offrom/





	var collectionFrom = function (C, adder, ENTRY) {
	  return function from(source /* , mapFn, thisArg */) {
	    var O = toObject(source);
	    var length = arguments.length;
	    var mapFn = length > 1 ? arguments[1] : undefined;
	    var mapping = mapFn !== undefined;
	    var boundFunction = mapping ? functionBindContext(mapFn, length > 2 ? arguments[2] : undefined) : undefined;
	    var result = new C();
	    var n = 0;
	    iterate(O, function (nextItem) {
	      var entry = mapping ? boundFunction(nextItem, n++) : nextItem;
	      if (ENTRY) adder(result, anObject(entry)[0], entry[1]);
	      else adder(result, entry);
	    });
	    return result;
	  };
	};

	// `Map.from` method
	// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
	_export({ target: 'Map', stat: true, forced: true }, {
	  from: collectionFrom(mapHelpers.Map, mapHelpers.set, true)
	});

	// `SameValueZero` abstract operation
	// https://tc39.es/ecma262/#sec-samevaluezero
	var sameValueZero = function (x, y) {
	  // eslint-disable-next-line no-self-compare -- NaN check
	  return x === y || x !== x && y !== y;
	};

	// `Map.prototype.includes` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Map', proto: true, real: true, forced: true }, {
	  includes: function includes(searchElement) {
	    return mapIterate(aMap(this), function (value) {
	      if (sameValueZero(value, searchElement)) return true;
	    }, true) === true;
	  }
	});

	var Map$6 = mapHelpers.Map;

	// `Map.keyBy` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Map', stat: true, forced: true }, {
	  keyBy: function keyBy(iterable, keyDerivative) {
	    var C = isCallable(this) ? this : Map$6;
	    var newMap = new C();
	    aCallable(keyDerivative);
	    var setter = aCallable(newMap.set);
	    iterate(iterable, function (element) {
	      functionCall(setter, newMap, keyDerivative(element), element);
	    });
	    return newMap;
	  }
	});

	// `Map.prototype.keyOf` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Map', proto: true, real: true, forced: true }, {
	  keyOf: function keyOf(searchElement) {
	    var result = mapIterate(aMap(this), function (value, key) {
	      if (value === searchElement) return { key: key };
	    }, true);
	    return result && result.key;
	  }
	});

	var Map$5 = mapHelpers.Map;
	var set$4 = mapHelpers.set;

	// `Map.prototype.mapKeys` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Map', proto: true, real: true, forced: true }, {
	  mapKeys: function mapKeys(callbackfn /* , thisArg */) {
	    var map = aMap(this);
	    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    var newMap = new Map$5();
	    mapIterate(map, function (value, key) {
	      set$4(newMap, boundFunction(value, key, map), value);
	    });
	    return newMap;
	  }
	});

	var Map$4 = mapHelpers.Map;
	var set$3 = mapHelpers.set;

	// `Map.prototype.mapValues` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Map', proto: true, real: true, forced: true }, {
	  mapValues: function mapValues(callbackfn /* , thisArg */) {
	    var map = aMap(this);
	    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    var newMap = new Map$4();
	    mapIterate(map, function (value, key) {
	      set$3(newMap, key, boundFunction(value, key, map));
	    });
	    return newMap;
	  }
	});

	var set$2 = mapHelpers.set;

	// `Map.prototype.merge` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Map', proto: true, real: true, arity: 1, forced: true }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  merge: function merge(iterable /* ...iterables */) {
	    var map = aMap(this);
	    var argumentsLength = arguments.length;
	    var i = 0;
	    while (i < argumentsLength) {
	      iterate(arguments[i++], function (key, value) {
	        set$2(map, key, value);
	      }, { AS_ENTRIES: true });
	    }
	    return map;
	  }
	});

	// https://tc39.github.io/proposal-setmap-offrom/
	var collectionOf = function (C, adder, ENTRY) {
	  return function of() {
	    var result = new C();
	    var length = arguments.length;
	    for (var index = 0; index < length; index++) {
	      var entry = arguments[index];
	      if (ENTRY) adder(result, anObject(entry)[0], entry[1]);
	      else adder(result, entry);
	    } return result;
	  };
	};

	// `Map.of` method
	// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
	_export({ target: 'Map', stat: true, forced: true }, {
	  of: collectionOf(mapHelpers.Map, mapHelpers.set, true)
	});

	var $TypeError$d = TypeError;

	// `Map.prototype.reduce` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Map', proto: true, real: true, forced: true }, {
	  reduce: function reduce(callbackfn /* , initialValue */) {
	    var map = aMap(this);
	    var noInitial = arguments.length < 2;
	    var accumulator = noInitial ? undefined : arguments[1];
	    aCallable(callbackfn);
	    mapIterate(map, function (value, key) {
	      if (noInitial) {
	        noInitial = false;
	        accumulator = value;
	      } else {
	        accumulator = callbackfn(accumulator, value, key, map);
	      }
	    });
	    if (noInitial) throw new $TypeError$d('Reduce of empty map with no initial value');
	    return accumulator;
	  }
	});

	// `Map.prototype.some` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Map', proto: true, real: true, forced: true }, {
	  some: function some(callbackfn /* , thisArg */) {
	    var map = aMap(this);
	    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    return mapIterate(map, function (value, key) {
	      if (boundFunction(value, key, map)) return true;
	    }, true) === true;
	  }
	});

	var $TypeError$c = TypeError;
	var get$2 = mapHelpers.get;
	var has$9 = mapHelpers.has;
	var set$1 = mapHelpers.set;

	// `Map.prototype.update` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Map', proto: true, real: true, forced: true }, {
	  update: function update(key, callback /* , thunk */) {
	    var map = aMap(this);
	    var length = arguments.length;
	    aCallable(callback);
	    var isPresentInMap = has$9(map, key);
	    if (!isPresentInMap && length < 3) {
	      throw new $TypeError$c('Updating absent value');
	    }
	    var value = isPresentInMap ? get$2(map, key) : aCallable(length > 2 ? arguments[2] : undefined)(key, map);
	    set$1(map, key, callback(value, key, map));
	    return map;
	  }
	});

	var $TypeError$b = TypeError;

	// `Map.prototype.upsert` method
	// https://github.com/tc39/proposal-upsert
	var mapUpsert = function upsert(key, updateFn /* , insertFn */) {
	  var map = anObject(this);
	  var get = aCallable(map.get);
	  var has = aCallable(map.has);
	  var set = aCallable(map.set);
	  var insertFn = arguments.length > 2 ? arguments[2] : undefined;
	  var value;
	  if (!isCallable(updateFn) && !isCallable(insertFn)) {
	    throw new $TypeError$b('At least one callback required');
	  }
	  if (functionCall(has, map, key)) {
	    value = functionCall(get, map, key);
	    if (isCallable(updateFn)) {
	      value = updateFn(value);
	      functionCall(set, map, key, value);
	    }
	  } else if (isCallable(insertFn)) {
	    value = insertFn();
	    functionCall(set, map, key, value);
	  } return value;
	};

	// TODO: remove from `core-js@4`



	// `Map.prototype.updateOrInsert` method (replaced by `Map.prototype.emplace`)
	// https://github.com/thumbsupep/proposal-upsert
	_export({ target: 'Map', proto: true, real: true, name: 'upsert', forced: true }, {
	  updateOrInsert: mapUpsert
	});

	// TODO: remove from `core-js@4`



	// `Map.prototype.upsert` method (replaced by `Map.prototype.emplace`)
	// https://github.com/thumbsupep/proposal-upsert
	_export({ target: 'Map', proto: true, real: true, forced: true }, {
	  upsert: mapUpsert
	});

	var min$2 = Math.min;
	var max$2 = Math.max;

	// `Math.clamp` method
	// https://rwaldron.github.io/proposal-math-extensions/
	_export({ target: 'Math', stat: true, forced: true }, {
	  clamp: function clamp(x, lower, upper) {
	    return min$2(upper, max$2(lower, x));
	  }
	});

	// `Math.DEG_PER_RAD` constant
	// https://rwaldron.github.io/proposal-math-extensions/
	_export({ target: 'Math', stat: true, nonConfigurable: true, nonWritable: true }, {
	  DEG_PER_RAD: Math.PI / 180
	});

	var RAD_PER_DEG = 180 / Math.PI;

	// `Math.degrees` method
	// https://rwaldron.github.io/proposal-math-extensions/
	_export({ target: 'Math', stat: true, forced: true }, {
	  degrees: function degrees(radians) {
	    return radians * RAD_PER_DEG;
	  }
	});

	// `Math.scale` method implementation
	// https://rwaldron.github.io/proposal-math-extensions/
	var mathScale = Math.scale || function scale(x, inLow, inHigh, outLow, outHigh) {
	  var nx = +x;
	  var nInLow = +inLow;
	  var nInHigh = +inHigh;
	  var nOutLow = +outLow;
	  var nOutHigh = +outHigh;
	  // eslint-disable-next-line no-self-compare -- NaN check
	  if (nx !== nx || nInLow !== nInLow || nInHigh !== nInHigh || nOutLow !== nOutLow || nOutHigh !== nOutHigh) return NaN;
	  if (nx === Infinity || nx === -Infinity) return nx;
	  return (nx - nInLow) * (nOutHigh - nOutLow) / (nInHigh - nInLow) + nOutLow;
	};

	// `Math.fscale` method
	// https://rwaldron.github.io/proposal-math-extensions/
	_export({ target: 'Math', stat: true, forced: true }, {
	  fscale: function fscale(x, inLow, inHigh, outLow, outHigh) {
	    return mathFround(mathScale(x, inLow, inHigh, outLow, outHigh));
	  }
	});

	// `Math.f16round` method
	// https://github.com/tc39/proposal-float16array
	_export({ target: 'Math', stat: true }, { f16round: mathF16round });

	// `Math.iaddh` method
	// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
	// TODO: Remove from `core-js@4`
	_export({ target: 'Math', stat: true, forced: true }, {
	  iaddh: function iaddh(x0, x1, y0, y1) {
	    var $x0 = x0 >>> 0;
	    var $x1 = x1 >>> 0;
	    var $y0 = y0 >>> 0;
	    return $x1 + (y1 >>> 0) + (($x0 & $y0 | ($x0 | $y0) & ~($x0 + $y0 >>> 0)) >>> 31) | 0;
	  }
	});

	// `Math.imulh` method
	// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
	// TODO: Remove from `core-js@4`
	_export({ target: 'Math', stat: true, forced: true }, {
	  imulh: function imulh(u, v) {
	    var UINT16 = 0xFFFF;
	    var $u = +u;
	    var $v = +v;
	    var u0 = $u & UINT16;
	    var v0 = $v & UINT16;
	    var u1 = $u >> 16;
	    var v1 = $v >> 16;
	    var t = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
	    return u1 * v1 + (t >> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >> 16);
	  }
	});

	// `Math.isubh` method
	// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
	// TODO: Remove from `core-js@4`
	_export({ target: 'Math', stat: true, forced: true }, {
	  isubh: function isubh(x0, x1, y0, y1) {
	    var $x0 = x0 >>> 0;
	    var $x1 = x1 >>> 0;
	    var $y0 = y0 >>> 0;
	    return $x1 - (y1 >>> 0) - ((~$x0 & $y0 | ~($x0 ^ $y0) & $x0 - $y0 >>> 0) >>> 31) | 0;
	  }
	});

	// `Math.RAD_PER_DEG` constant
	// https://rwaldron.github.io/proposal-math-extensions/
	_export({ target: 'Math', stat: true, nonConfigurable: true, nonWritable: true }, {
	  RAD_PER_DEG: 180 / Math.PI
	});

	var DEG_PER_RAD = Math.PI / 180;

	// `Math.radians` method
	// https://rwaldron.github.io/proposal-math-extensions/
	_export({ target: 'Math', stat: true, forced: true }, {
	  radians: function radians(degrees) {
	    return degrees * DEG_PER_RAD;
	  }
	});

	// `Math.scale` method
	// https://rwaldron.github.io/proposal-math-extensions/
	_export({ target: 'Math', stat: true, forced: true }, {
	  scale: mathScale
	});

	var SEEDED_RANDOM = 'Seeded Random';
	var SEEDED_RANDOM_GENERATOR = SEEDED_RANDOM + ' Generator';
	var SEED_TYPE_ERROR = 'Math.seededPRNG() argument should have a "seed" field with a finite value.';
	var setInternalState$6 = internalState.set;
	var getInternalState$3 = internalState.getterFor(SEEDED_RANDOM_GENERATOR);
	var $TypeError$a = TypeError;

	var $SeededRandomGenerator = iteratorCreateConstructor(function SeededRandomGenerator(seed) {
	  setInternalState$6(this, {
	    type: SEEDED_RANDOM_GENERATOR,
	    seed: seed % 2147483647
	  });
	}, SEEDED_RANDOM, function next() {
	  var state = getInternalState$3(this);
	  var seed = state.seed = (state.seed * 1103515245 + 12345) % 2147483647;
	  return createIterResultObject((seed & 1073741823) / 1073741823, false);
	});

	// `Math.seededPRNG` method
	// https://github.com/tc39/proposal-seeded-random
	// based on https://github.com/tc39/proposal-seeded-random/blob/78b8258835b57fc2100d076151ab506bc3202ae6/demo.html
	_export({ target: 'Math', stat: true, forced: true }, {
	  seededPRNG: function seededPRNG(it) {
	    var seed = anObject(it).seed;
	    if (!numberIsFinite(seed)) throw new $TypeError$a(SEED_TYPE_ERROR);
	    return new $SeededRandomGenerator(seed);
	  }
	});

	// `Math.signbit` method
	// https://github.com/tc39/proposal-Math.signbit
	_export({ target: 'Math', stat: true, forced: true }, {
	  signbit: function signbit(x) {
	    var n = +x;
	    // eslint-disable-next-line no-self-compare -- NaN check
	    return n === n && n === 0 ? 1 / n === -Infinity : n < 0;
	  }
	});

	// `Math.umulh` method
	// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
	// TODO: Remove from `core-js@4`
	_export({ target: 'Math', stat: true, forced: true }, {
	  umulh: function umulh(u, v) {
	    var UINT16 = 0xFFFF;
	    var $u = +u;
	    var $v = +v;
	    var u0 = $u & UINT16;
	    var v0 = $v & UINT16;
	    var u1 = $u >>> 16;
	    var v1 = $v >>> 16;
	    var t = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
	    return u1 * v1 + (t >>> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >>> 16);
	  }
	});

	var INVALID_NUMBER_REPRESENTATION = 'Invalid number representation';
	var INVALID_RADIX = 'Invalid radix';
	var $RangeError$2 = RangeError;
	var $SyntaxError = SyntaxError;
	var $TypeError$9 = TypeError;
	var $parseInt = parseInt;
	var pow$1 = Math.pow;
	var valid = /^[\d.a-z]+$/;
	var charAt$a = functionUncurryThis(''.charAt);
	var exec$5 = functionUncurryThis(valid.exec);
	var numberToString$2 = functionUncurryThis(1.0.toString);
	var stringSlice$6 = functionUncurryThis(''.slice);
	var split$4 = functionUncurryThis(''.split);

	// `Number.fromString` method
	// https://github.com/tc39/proposal-number-fromstring
	_export({ target: 'Number', stat: true, forced: true }, {
	  fromString: function fromString(string, radix) {
	    var sign = 1;
	    if (typeof string != 'string') throw new $TypeError$9(INVALID_NUMBER_REPRESENTATION);
	    if (!string.length) throw new $SyntaxError(INVALID_NUMBER_REPRESENTATION);
	    if (charAt$a(string, 0) === '-') {
	      sign = -1;
	      string = stringSlice$6(string, 1);
	      if (!string.length) throw new $SyntaxError(INVALID_NUMBER_REPRESENTATION);
	    }
	    var R = radix === undefined ? 10 : toIntegerOrInfinity(radix);
	    if (R < 2 || R > 36) throw new $RangeError$2(INVALID_RADIX);
	    if (!exec$5(valid, string)) throw new $SyntaxError(INVALID_NUMBER_REPRESENTATION);
	    var parts = split$4(string, '.');
	    var mathNum = $parseInt(parts[0], R);
	    if (parts.length > 1) mathNum += $parseInt(parts[1], R) / pow$1(R, parts[1].length);
	    if (R === 10 && numberToString$2(mathNum, R) !== string) throw new $SyntaxError(INVALID_NUMBER_REPRESENTATION);
	    return sign * mathNum;
	  }
	});

	// `Number.range` method
	// https://github.com/tc39/proposal-Number.range
	// TODO: Remove from `core-js@4`
	_export({ target: 'Number', stat: true, forced: true }, {
	  range: function range(start, end, option) {
	    return new numericRangeIterator(start, end, option, 'number', 0, 1);
	  }
	});

	var OBJECT_ITERATOR = 'Object Iterator';
	var setInternalState$5 = internalState.set;
	var getInternalState$2 = internalState.getterFor(OBJECT_ITERATOR);

	var objectIterator = iteratorCreateConstructor(function ObjectIterator(source, mode) {
	  var object = toObject(source);
	  setInternalState$5(this, {
	    type: OBJECT_ITERATOR,
	    mode: mode,
	    object: object,
	    keys: objectKeys$1(object),
	    index: 0
	  });
	}, 'Object', function next() {
	  var state = getInternalState$2(this);
	  var keys = state.keys;
	  while (true) {
	    if (keys === null || state.index >= keys.length) {
	      state.object = state.keys = null;
	      return createIterResultObject(undefined, true);
	    }
	    var key = keys[state.index++];
	    var object = state.object;
	    if (!hasOwnProperty_1(object, key)) continue;
	    switch (state.mode) {
	      case 'keys': return createIterResultObject(key, false);
	      case 'values': return createIterResultObject(object[key], false);
	    } /* entries */ return createIterResultObject([key, object[key]], false);
	  }
	});

	// TODO: Remove from `core-js@4`



	// `Object.iterateEntries` method
	// https://github.com/tc39/proposal-object-iteration
	_export({ target: 'Object', stat: true, forced: true }, {
	  iterateEntries: function iterateEntries(object) {
	    return new objectIterator(object, 'entries');
	  }
	});

	// TODO: Remove from `core-js@4`



	// `Object.iterateKeys` method
	// https://github.com/tc39/proposal-object-iteration
	_export({ target: 'Object', stat: true, forced: true }, {
	  iterateKeys: function iterateKeys(object) {
	    return new objectIterator(object, 'keys');
	  }
	});

	// TODO: Remove from `core-js@4`



	// `Object.iterateValues` method
	// https://github.com/tc39/proposal-object-iteration
	_export({ target: 'Object', stat: true, forced: true }, {
	  iterateValues: function iterateValues(object) {
	    return new objectIterator(object, 'values');
	  }
	});

	// https://github.com/tc39/proposal-observable


















	var $$OBSERVABLE$1 = wellKnownSymbol('observable');
	var OBSERVABLE = 'Observable';
	var SUBSCRIPTION = 'Subscription';
	var SUBSCRIPTION_OBSERVER = 'SubscriptionObserver';
	var getterFor$1 = internalState.getterFor;
	var setInternalState$4 = internalState.set;
	var getObservableInternalState = getterFor$1(OBSERVABLE);
	var getSubscriptionInternalState = getterFor$1(SUBSCRIPTION);
	var getSubscriptionObserverInternalState = getterFor$1(SUBSCRIPTION_OBSERVER);

	var SubscriptionState = function (observer) {
	  this.observer = anObject(observer);
	  this.cleanup = undefined;
	  this.subscriptionObserver = undefined;
	};

	SubscriptionState.prototype = {
	  type: SUBSCRIPTION,
	  clean: function () {
	    var cleanup = this.cleanup;
	    if (cleanup) {
	      this.cleanup = undefined;
	      try {
	        cleanup();
	      } catch (error) {
	        hostReportErrors(error);
	      }
	    }
	  },
	  close: function () {
	    if (!descriptors) {
	      var subscription = this.facade;
	      var subscriptionObserver = this.subscriptionObserver;
	      subscription.closed = true;
	      if (subscriptionObserver) subscriptionObserver.closed = true;
	    } this.observer = undefined;
	  },
	  isClosed: function () {
	    return this.observer === undefined;
	  }
	};

	var Subscription = function (observer, subscriber) {
	  var subscriptionState = setInternalState$4(this, new SubscriptionState(observer));
	  var start;
	  if (!descriptors) this.closed = false;
	  try {
	    if (start = getMethod(observer, 'start')) functionCall(start, observer, this);
	  } catch (error) {
	    hostReportErrors(error);
	  }
	  if (subscriptionState.isClosed()) return;
	  var subscriptionObserver = subscriptionState.subscriptionObserver = new SubscriptionObserver(subscriptionState);
	  try {
	    var cleanup = subscriber(subscriptionObserver);
	    var subscription = cleanup;
	    if (!isNullOrUndefined(cleanup)) subscriptionState.cleanup = isCallable(cleanup.unsubscribe)
	      ? function () { subscription.unsubscribe(); }
	      : aCallable(cleanup);
	  } catch (error) {
	    subscriptionObserver.error(error);
	    return;
	  } if (subscriptionState.isClosed()) subscriptionState.clean();
	};

	Subscription.prototype = defineBuiltIns({}, {
	  unsubscribe: function unsubscribe() {
	    var subscriptionState = getSubscriptionInternalState(this);
	    if (!subscriptionState.isClosed()) {
	      subscriptionState.close();
	      subscriptionState.clean();
	    }
	  }
	});

	if (descriptors) defineBuiltInAccessor(Subscription.prototype, 'closed', {
	  configurable: true,
	  get: function closed() {
	    return getSubscriptionInternalState(this).isClosed();
	  }
	});

	var SubscriptionObserver = function (subscriptionState) {
	  setInternalState$4(this, {
	    type: SUBSCRIPTION_OBSERVER,
	    subscriptionState: subscriptionState
	  });
	  if (!descriptors) this.closed = false;
	};

	SubscriptionObserver.prototype = defineBuiltIns({}, {
	  next: function next(value) {
	    var subscriptionState = getSubscriptionObserverInternalState(this).subscriptionState;
	    if (!subscriptionState.isClosed()) {
	      var observer = subscriptionState.observer;
	      try {
	        var nextMethod = getMethod(observer, 'next');
	        if (nextMethod) functionCall(nextMethod, observer, value);
	      } catch (error) {
	        hostReportErrors(error);
	      }
	    }
	  },
	  error: function error(value) {
	    var subscriptionState = getSubscriptionObserverInternalState(this).subscriptionState;
	    if (!subscriptionState.isClosed()) {
	      var observer = subscriptionState.observer;
	      subscriptionState.close();
	      try {
	        var errorMethod = getMethod(observer, 'error');
	        if (errorMethod) functionCall(errorMethod, observer, value);
	        else hostReportErrors(value);
	      } catch (err) {
	        hostReportErrors(err);
	      } subscriptionState.clean();
	    }
	  },
	  complete: function complete() {
	    var subscriptionState = getSubscriptionObserverInternalState(this).subscriptionState;
	    if (!subscriptionState.isClosed()) {
	      var observer = subscriptionState.observer;
	      subscriptionState.close();
	      try {
	        var completeMethod = getMethod(observer, 'complete');
	        if (completeMethod) functionCall(completeMethod, observer);
	      } catch (error) {
	        hostReportErrors(error);
	      } subscriptionState.clean();
	    }
	  }
	});

	if (descriptors) defineBuiltInAccessor(SubscriptionObserver.prototype, 'closed', {
	  configurable: true,
	  get: function closed() {
	    return getSubscriptionObserverInternalState(this).subscriptionState.isClosed();
	  }
	});

	var $Observable = function Observable(subscriber) {
	  anInstance(this, ObservablePrototype);
	  setInternalState$4(this, {
	    type: OBSERVABLE,
	    subscriber: aCallable(subscriber)
	  });
	};

	var ObservablePrototype = $Observable.prototype;

	defineBuiltIns(ObservablePrototype, {
	  subscribe: function subscribe(observer) {
	    var length = arguments.length;
	    return new Subscription(isCallable(observer) ? {
	      next: observer,
	      error: length > 1 ? arguments[1] : undefined,
	      complete: length > 2 ? arguments[2] : undefined
	    } : isObject$1(observer) ? observer : {}, getObservableInternalState(this).subscriber);
	  }
	});

	defineBuiltIn(ObservablePrototype, $$OBSERVABLE$1, function () { return this; });

	_export({ global: true, constructor: true, forced: true }, {
	  Observable: $Observable
	});

	setSpecies(OBSERVABLE);

	var $$OBSERVABLE = wellKnownSymbol('observable');

	// `Observable.from` method
	// https://github.com/tc39/proposal-observable
	_export({ target: 'Observable', stat: true, forced: true }, {
	  from: function from(x) {
	    var C = isConstructor(this) ? this : getBuiltIn('Observable');
	    var observableMethod = getMethod(anObject(x), $$OBSERVABLE);
	    if (observableMethod) {
	      var observable = anObject(functionCall(observableMethod, x));
	      return observable.constructor === C ? observable : new C(function (observer) {
	        return observable.subscribe(observer);
	      });
	    }
	    var iterator = getIterator(x);
	    return new C(function (observer) {
	      iterate(iterator, function (it, stop) {
	        observer.next(it);
	        if (observer.closed) return stop();
	      }, { IS_ITERATOR: true, INTERRUPTED: true });
	      observer.complete();
	    });
	  }
	});

	var Array$2 = getBuiltIn('Array');

	// `Observable.of` method
	// https://github.com/tc39/proposal-observable
	_export({ target: 'Observable', stat: true, forced: true }, {
	  of: function of() {
	    var C = isConstructor(this) ? this : getBuiltIn('Observable');
	    var length = arguments.length;
	    var items = Array$2(length);
	    var index = 0;
	    while (index < length) items[index] = arguments[index++];
	    return new C(function (observer) {
	      for (var i = 0; i < length; i++) {
	        observer.next(items[i]);
	        if (observer.closed) return;
	      } observer.complete();
	    });
	  }
	});

	// TODO: Remove from `core-js@4`




	// `Promise.try` method
	// https://github.com/tc39/proposal-promise-try
	_export({ target: 'Promise', stat: true, forced: true }, {
	  'try': function (callbackfn) {
	    var promiseCapability = newPromiseCapability$1.f(this);
	    var result = perform(callbackfn);
	    (result.error ? promiseCapability.reject : promiseCapability.resolve)(result.value);
	    return promiseCapability.promise;
	  }
	});

	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`






	var Map$3 = getBuiltIn('Map');
	var WeakMap$2 = getBuiltIn('WeakMap');
	var push$8 = functionUncurryThis([].push);

	var metadata = shared('metadata');
	var store$1 = metadata.store || (metadata.store = new WeakMap$2());

	var getOrCreateMetadataMap$1 = function (target, targetKey, create) {
	  var targetMetadata = store$1.get(target);
	  if (!targetMetadata) {
	    if (!create) return;
	    store$1.set(target, targetMetadata = new Map$3());
	  }
	  var keyMetadata = targetMetadata.get(targetKey);
	  if (!keyMetadata) {
	    if (!create) return;
	    targetMetadata.set(targetKey, keyMetadata = new Map$3());
	  } return keyMetadata;
	};

	var ordinaryHasOwnMetadata$3 = function (MetadataKey, O, P) {
	  var metadataMap = getOrCreateMetadataMap$1(O, P, false);
	  return metadataMap === undefined ? false : metadataMap.has(MetadataKey);
	};

	var ordinaryGetOwnMetadata$2 = function (MetadataKey, O, P) {
	  var metadataMap = getOrCreateMetadataMap$1(O, P, false);
	  return metadataMap === undefined ? undefined : metadataMap.get(MetadataKey);
	};

	var ordinaryDefineOwnMetadata$2 = function (MetadataKey, MetadataValue, O, P) {
	  getOrCreateMetadataMap$1(O, P, true).set(MetadataKey, MetadataValue);
	};

	var ordinaryOwnMetadataKeys$2 = function (target, targetKey) {
	  var metadataMap = getOrCreateMetadataMap$1(target, targetKey, false);
	  var keys = [];
	  if (metadataMap) metadataMap.forEach(function (_, key) { push$8(keys, key); });
	  return keys;
	};

	var toMetadataKey$9 = function (it) {
	  return it === undefined || typeof it == 'symbol' ? it : String(it);
	};

	var reflectMetadata = {
	  store: store$1,
	  getMap: getOrCreateMetadataMap$1,
	  has: ordinaryHasOwnMetadata$3,
	  get: ordinaryGetOwnMetadata$2,
	  set: ordinaryDefineOwnMetadata$2,
	  keys: ordinaryOwnMetadataKeys$2,
	  toKey: toMetadataKey$9
	};

	// TODO: Remove from `core-js@4`




	var toMetadataKey$8 = reflectMetadata.toKey;
	var ordinaryDefineOwnMetadata$1 = reflectMetadata.set;

	// `Reflect.defineMetadata` method
	// https://github.com/rbuckton/reflect-metadata
	_export({ target: 'Reflect', stat: true }, {
	  defineMetadata: function defineMetadata(metadataKey, metadataValue, target /* , targetKey */) {
	    var targetKey = arguments.length < 4 ? undefined : toMetadataKey$8(arguments[3]);
	    ordinaryDefineOwnMetadata$1(metadataKey, metadataValue, anObject(target), targetKey);
	  }
	});

	var toMetadataKey$7 = reflectMetadata.toKey;
	var getOrCreateMetadataMap = reflectMetadata.getMap;
	var store = reflectMetadata.store;

	// `Reflect.deleteMetadata` method
	// https://github.com/rbuckton/reflect-metadata
	_export({ target: 'Reflect', stat: true }, {
	  deleteMetadata: function deleteMetadata(metadataKey, target /* , targetKey */) {
	    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$7(arguments[2]);
	    var metadataMap = getOrCreateMetadataMap(anObject(target), targetKey, false);
	    if (metadataMap === undefined || !metadataMap['delete'](metadataKey)) return false;
	    if (metadataMap.size) return true;
	    var targetMetadata = store.get(target);
	    targetMetadata['delete'](targetKey);
	    return !!targetMetadata.size || store['delete'](target);
	  }
	});

	// TODO: Remove from `core-js@4`





	var ordinaryHasOwnMetadata$2 = reflectMetadata.has;
	var ordinaryGetOwnMetadata$1 = reflectMetadata.get;
	var toMetadataKey$6 = reflectMetadata.toKey;

	var ordinaryGetMetadata = function (MetadataKey, O, P) {
	  var hasOwn = ordinaryHasOwnMetadata$2(MetadataKey, O, P);
	  if (hasOwn) return ordinaryGetOwnMetadata$1(MetadataKey, O, P);
	  var parent = objectGetPrototypeOf(O);
	  return parent !== null ? ordinaryGetMetadata(MetadataKey, parent, P) : undefined;
	};

	// `Reflect.getMetadata` method
	// https://github.com/rbuckton/reflect-metadata
	_export({ target: 'Reflect', stat: true }, {
	  getMetadata: function getMetadata(metadataKey, target /* , targetKey */) {
	    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$6(arguments[2]);
	    return ordinaryGetMetadata(metadataKey, anObject(target), targetKey);
	  }
	});

	// TODO: Remove from `core-js@4`







	var arrayUniqueBy$1 = functionUncurryThis(arrayUniqueBy$2);
	var concat = functionUncurryThis([].concat);
	var ordinaryOwnMetadataKeys$1 = reflectMetadata.keys;
	var toMetadataKey$5 = reflectMetadata.toKey;

	var ordinaryMetadataKeys = function (O, P) {
	  var oKeys = ordinaryOwnMetadataKeys$1(O, P);
	  var parent = objectGetPrototypeOf(O);
	  if (parent === null) return oKeys;
	  var pKeys = ordinaryMetadataKeys(parent, P);
	  return pKeys.length ? oKeys.length ? arrayUniqueBy$1(concat(oKeys, pKeys)) : pKeys : oKeys;
	};

	// `Reflect.getMetadataKeys` method
	// https://github.com/rbuckton/reflect-metadata
	_export({ target: 'Reflect', stat: true }, {
	  getMetadataKeys: function getMetadataKeys(target /* , targetKey */) {
	    var targetKey = arguments.length < 2 ? undefined : toMetadataKey$5(arguments[1]);
	    return ordinaryMetadataKeys(anObject(target), targetKey);
	  }
	});

	// TODO: Remove from `core-js@4`




	var ordinaryGetOwnMetadata = reflectMetadata.get;
	var toMetadataKey$4 = reflectMetadata.toKey;

	// `Reflect.getOwnMetadata` method
	// https://github.com/rbuckton/reflect-metadata
	_export({ target: 'Reflect', stat: true }, {
	  getOwnMetadata: function getOwnMetadata(metadataKey, target /* , targetKey */) {
	    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$4(arguments[2]);
	    return ordinaryGetOwnMetadata(metadataKey, anObject(target), targetKey);
	  }
	});

	// TODO: Remove from `core-js@4`




	var ordinaryOwnMetadataKeys = reflectMetadata.keys;
	var toMetadataKey$3 = reflectMetadata.toKey;

	// `Reflect.getOwnMetadataKeys` method
	// https://github.com/rbuckton/reflect-metadata
	_export({ target: 'Reflect', stat: true }, {
	  getOwnMetadataKeys: function getOwnMetadataKeys(target /* , targetKey */) {
	    var targetKey = arguments.length < 2 ? undefined : toMetadataKey$3(arguments[1]);
	    return ordinaryOwnMetadataKeys(anObject(target), targetKey);
	  }
	});

	// TODO: Remove from `core-js@4`





	var ordinaryHasOwnMetadata$1 = reflectMetadata.has;
	var toMetadataKey$2 = reflectMetadata.toKey;

	var ordinaryHasMetadata = function (MetadataKey, O, P) {
	  var hasOwn = ordinaryHasOwnMetadata$1(MetadataKey, O, P);
	  if (hasOwn) return true;
	  var parent = objectGetPrototypeOf(O);
	  return parent !== null ? ordinaryHasMetadata(MetadataKey, parent, P) : false;
	};

	// `Reflect.hasMetadata` method
	// https://github.com/rbuckton/reflect-metadata
	_export({ target: 'Reflect', stat: true }, {
	  hasMetadata: function hasMetadata(metadataKey, target /* , targetKey */) {
	    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$2(arguments[2]);
	    return ordinaryHasMetadata(metadataKey, anObject(target), targetKey);
	  }
	});

	// TODO: Remove from `core-js@4`




	var ordinaryHasOwnMetadata = reflectMetadata.has;
	var toMetadataKey$1 = reflectMetadata.toKey;

	// `Reflect.hasOwnMetadata` method
	// https://github.com/rbuckton/reflect-metadata
	_export({ target: 'Reflect', stat: true }, {
	  hasOwnMetadata: function hasOwnMetadata(metadataKey, target /* , targetKey */) {
	    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$1(arguments[2]);
	    return ordinaryHasOwnMetadata(metadataKey, anObject(target), targetKey);
	  }
	});

	var toMetadataKey = reflectMetadata.toKey;
	var ordinaryDefineOwnMetadata = reflectMetadata.set;

	// `Reflect.metadata` method
	// https://github.com/rbuckton/reflect-metadata
	_export({ target: 'Reflect', stat: true }, {
	  metadata: function metadata(metadataKey, metadataValue) {
	    return function decorator(target, key) {
	      ordinaryDefineOwnMetadata(metadataKey, metadataValue, anObject(target), toMetadataKey(key));
	    };
	  }
	});

	var charCodeAt$3 = functionUncurryThis(''.charCodeAt);
	var replace$5 = functionUncurryThis(''.replace);
	var NEED_ESCAPING = RegExp('[!"#$%&\'()*+,\\-./:;<=>?@[\\\\\\]^`{|}~' + whitespaces$1 + ']', 'g');

	// `RegExp.escape` method
	// https://github.com/tc39/proposal-regex-escaping
	_export({ target: 'RegExp', stat: true, forced: true }, {
	  escape: function escape(S) {
	    var str = toString_1$1(S);
	    var firstCode = charCodeAt$3(str, 0);
	    // escape first DecimalDigit
	    return (firstCode > 47 && firstCode < 58 ? '\\x3' : '') + replace$5(str, NEED_ESCAPING, '\\$&');
	  }
	});

	// eslint-disable-next-line es/no-set -- safe
	var SetPrototype$1 = Set.prototype;

	var setHelpers = {
	  // eslint-disable-next-line es/no-set -- safe
	  Set: Set,
	  add: functionUncurryThis(SetPrototype$1.add),
	  has: functionUncurryThis(SetPrototype$1.has),
	  remove: functionUncurryThis(SetPrototype$1['delete']),
	  proto: SetPrototype$1
	};

	var has$8 = setHelpers.has;

	// Perform ? RequireInternalSlot(M, [[SetData]])
	var aSet = function (it) {
	  has$8(it);
	  return it;
	};

	var add$7 = setHelpers.add;

	// `Set.prototype.addAll` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Set', proto: true, real: true, forced: true }, {
	  addAll: function addAll(/* ...elements */) {
	    var set = aSet(this);
	    for (var k = 0, len = arguments.length; k < len; k++) {
	      add$7(set, arguments[k]);
	    } return set;
	  }
	});

	var remove$4 = setHelpers.remove;

	// `Set.prototype.deleteAll` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Set', proto: true, real: true, forced: true }, {
	  deleteAll: function deleteAll(/* ...elements */) {
	    var collection = aSet(this);
	    var allDeleted = true;
	    var wasDeleted;
	    for (var k = 0, len = arguments.length; k < len; k++) {
	      wasDeleted = remove$4(collection, arguments[k]);
	      allDeleted = allDeleted && wasDeleted;
	    } return !!allDeleted;
	  }
	});

	var Set$8 = setHelpers.Set;
	var SetPrototype = setHelpers.proto;
	var forEach$2 = functionUncurryThis(SetPrototype.forEach);
	var keys$1 = functionUncurryThis(SetPrototype.keys);
	var next = keys$1(new Set$8()).next;

	var setIterate = function (set, fn, interruptible) {
	  return interruptible ? iterateSimple({ iterator: keys$1(set), next: next }, fn) : forEach$2(set, fn);
	};

	var Set$7 = setHelpers.Set;
	var add$6 = setHelpers.add;

	var setClone = function (set) {
	  var result = new Set$7();
	  setIterate(set, function (it) {
	    add$6(result, it);
	  });
	  return result;
	};

	var setSize = functionUncurryThisAccessor(setHelpers.proto, 'size', 'get') || function (set) {
	  return set.size;
	};

	var INVALID_SIZE = 'Invalid size';
	var $RangeError$1 = RangeError;
	var $TypeError$8 = TypeError;
	var max$1 = Math.max;

	var SetRecord = function (set, intSize) {
	  this.set = set;
	  this.size = max$1(intSize, 0);
	  this.has = aCallable(set.has);
	  this.keys = aCallable(set.keys);
	};

	SetRecord.prototype = {
	  getIterator: function () {
	    return getIteratorDirect(anObject(functionCall(this.keys, this.set)));
	  },
	  includes: function (it) {
	    return functionCall(this.has, this.set, it);
	  }
	};

	// `GetSetRecord` abstract operation
	// https://tc39.es/proposal-set-methods/#sec-getsetrecord
	var getSetRecord = function (obj) {
	  anObject(obj);
	  var numSize = +obj.size;
	  // NOTE: If size is undefined, then numSize will be NaN
	  // eslint-disable-next-line no-self-compare -- NaN check
	  if (numSize !== numSize) throw new $TypeError$8(INVALID_SIZE);
	  var intSize = toIntegerOrInfinity(numSize);
	  if (intSize < 0) throw new $RangeError$1(INVALID_SIZE);
	  return new SetRecord(obj, intSize);
	};

	var has$7 = setHelpers.has;
	var remove$3 = setHelpers.remove;

	// `Set.prototype.difference` method
	// https://github.com/tc39/proposal-set-methods
	var setDifference = function difference(other) {
	  var O = aSet(this);
	  var otherRec = getSetRecord(other);
	  var result = setClone(O);
	  if (setSize(O) <= otherRec.size) setIterate(O, function (e) {
	    if (otherRec.includes(e)) remove$3(result, e);
	  });
	  else iterateSimple(otherRec.getIterator(), function (e) {
	    if (has$7(O, e)) remove$3(result, e);
	  });
	  return result;
	};

	var createSetLike = function (size) {
	  return {
	    size: size,
	    has: function () {
	      return false;
	    },
	    keys: function () {
	      return {
	        next: function () {
	          return { done: true };
	        }
	      };
	    }
	  };
	};

	var setMethodAcceptSetLike = function (name) {
	  var Set = getBuiltIn('Set');
	  try {
	    new Set()[name](createSetLike(0));
	    try {
	      // late spec change, early WebKit ~ Safari 17.0 beta implementation does not pass it
	      // https://github.com/tc39/proposal-set-methods/pull/88
	      new Set()[name](createSetLike(-1));
	      return false;
	    } catch (error2) {
	      return true;
	    }
	  } catch (error) {
	    return false;
	  }
	};

	// `Set.prototype.difference` method
	// https://github.com/tc39/proposal-set-methods
	_export({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('difference') }, {
	  difference: setDifference
	});

	var ITERATOR$3 = wellKnownSymbol('iterator');
	var $Object = Object;

	var isIterable = function (it) {
	  if (isNullOrUndefined(it)) return false;
	  var O = $Object(it);
	  return O[ITERATOR$3] !== undefined
	    || '@@iterator' in O
	    || hasOwnProperty_1(iterators, classof(O));
	};

	var Set$6 = getBuiltIn('Set');

	var isSetLike = function (it) {
	  return isObject$1(it)
	    && typeof it.size == 'number'
	    && isCallable(it.has)
	    && isCallable(it.keys);
	};

	// fallback old -> new set methods proposal arguments
	var toSetLike = function (it) {
	  if (isSetLike(it)) return it;
	  return isIterable(it) ? new Set$6(it) : it;
	};

	// `Set.prototype.difference` method
	// https://github.com/tc39/proposal-set-methods
	// TODO: Obsolete version, remove from `core-js@4`
	_export({ target: 'Set', proto: true, real: true, forced: true }, {
	  difference: function difference(other) {
	    return functionCall(setDifference, this, toSetLike(other));
	  }
	});

	// `Set.prototype.every` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Set', proto: true, real: true, forced: true }, {
	  every: function every(callbackfn /* , thisArg */) {
	    var set = aSet(this);
	    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    return setIterate(set, function (value) {
	      if (!boundFunction(value, value, set)) return false;
	    }, true) !== false;
	  }
	});

	var Set$5 = setHelpers.Set;
	var add$5 = setHelpers.add;

	// `Set.prototype.filter` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Set', proto: true, real: true, forced: true }, {
	  filter: function filter(callbackfn /* , thisArg */) {
	    var set = aSet(this);
	    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    var newSet = new Set$5();
	    setIterate(set, function (value) {
	      if (boundFunction(value, value, set)) add$5(newSet, value);
	    });
	    return newSet;
	  }
	});

	// `Set.prototype.find` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Set', proto: true, real: true, forced: true }, {
	  find: function find(callbackfn /* , thisArg */) {
	    var set = aSet(this);
	    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    var result = setIterate(set, function (value) {
	      if (boundFunction(value, value, set)) return { value: value };
	    }, true);
	    return result && result.value;
	  }
	});

	// `Set.from` method
	// https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
	_export({ target: 'Set', stat: true, forced: true }, {
	  from: collectionFrom(setHelpers.Set, setHelpers.add, false)
	});

	var Set$4 = setHelpers.Set;
	var add$4 = setHelpers.add;
	var has$6 = setHelpers.has;

	// `Set.prototype.intersection` method
	// https://github.com/tc39/proposal-set-methods
	var setIntersection = function intersection(other) {
	  var O = aSet(this);
	  var otherRec = getSetRecord(other);
	  var result = new Set$4();

	  if (setSize(O) > otherRec.size) {
	    iterateSimple(otherRec.getIterator(), function (e) {
	      if (has$6(O, e)) add$4(result, e);
	    });
	  } else {
	    setIterate(O, function (e) {
	      if (otherRec.includes(e)) add$4(result, e);
	    });
	  }

	  return result;
	};

	var INCORRECT = !setMethodAcceptSetLike('intersection') || fails(function () {
	  // eslint-disable-next-line es/no-array-from, es/no-set -- testing
	  return Array.from(new Set([1, 2, 3]).intersection(new Set([3, 2]))) !== '3,2';
	});

	// `Set.prototype.intersection` method
	// https://github.com/tc39/proposal-set-methods
	_export({ target: 'Set', proto: true, real: true, forced: INCORRECT }, {
	  intersection: setIntersection
	});

	// `Set.prototype.intersection` method
	// https://github.com/tc39/proposal-set-methods
	// TODO: Obsolete version, remove from `core-js@4`
	_export({ target: 'Set', proto: true, real: true, forced: true }, {
	  intersection: function intersection(other) {
	    return functionCall(setIntersection, this, toSetLike(other));
	  }
	});

	var has$5 = setHelpers.has;






	// `Set.prototype.isDisjointFrom` method
	// https://tc39.github.io/proposal-set-methods/#Set.prototype.isDisjointFrom
	var setIsDisjointFrom = function isDisjointFrom(other) {
	  var O = aSet(this);
	  var otherRec = getSetRecord(other);
	  if (setSize(O) <= otherRec.size) return setIterate(O, function (e) {
	    if (otherRec.includes(e)) return false;
	  }, true) !== false;
	  var iterator = otherRec.getIterator();
	  return iterateSimple(iterator, function (e) {
	    if (has$5(O, e)) return iteratorClose(iterator, 'normal', false);
	  }) !== false;
	};

	// `Set.prototype.isDisjointFrom` method
	// https://github.com/tc39/proposal-set-methods
	_export({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('isDisjointFrom') }, {
	  isDisjointFrom: setIsDisjointFrom
	});

	// `Set.prototype.isDisjointFrom` method
	// https://github.com/tc39/proposal-set-methods
	// TODO: Obsolete version, remove from `core-js@4`
	_export({ target: 'Set', proto: true, real: true, forced: true }, {
	  isDisjointFrom: function isDisjointFrom(other) {
	    return functionCall(setIsDisjointFrom, this, toSetLike(other));
	  }
	});

	// `Set.prototype.isSubsetOf` method
	// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSubsetOf
	var setIsSubsetOf = function isSubsetOf(other) {
	  var O = aSet(this);
	  var otherRec = getSetRecord(other);
	  if (setSize(O) > otherRec.size) return false;
	  return setIterate(O, function (e) {
	    if (!otherRec.includes(e)) return false;
	  }, true) !== false;
	};

	// `Set.prototype.isSubsetOf` method
	// https://github.com/tc39/proposal-set-methods
	_export({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('isSubsetOf') }, {
	  isSubsetOf: setIsSubsetOf
	});

	// `Set.prototype.isSubsetOf` method
	// https://github.com/tc39/proposal-set-methods
	// TODO: Obsolete version, remove from `core-js@4`
	_export({ target: 'Set', proto: true, real: true, forced: true }, {
	  isSubsetOf: function isSubsetOf(other) {
	    return functionCall(setIsSubsetOf, this, toSetLike(other));
	  }
	});

	var has$4 = setHelpers.has;





	// `Set.prototype.isSupersetOf` method
	// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSupersetOf
	var setIsSupersetOf = function isSupersetOf(other) {
	  var O = aSet(this);
	  var otherRec = getSetRecord(other);
	  if (setSize(O) < otherRec.size) return false;
	  var iterator = otherRec.getIterator();
	  return iterateSimple(iterator, function (e) {
	    if (!has$4(O, e)) return iteratorClose(iterator, 'normal', false);
	  }) !== false;
	};

	// `Set.prototype.isSupersetOf` method
	// https://github.com/tc39/proposal-set-methods
	_export({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('isSupersetOf') }, {
	  isSupersetOf: setIsSupersetOf
	});

	// `Set.prototype.isSupersetOf` method
	// https://github.com/tc39/proposal-set-methods
	// TODO: Obsolete version, remove from `core-js@4`
	_export({ target: 'Set', proto: true, real: true, forced: true }, {
	  isSupersetOf: function isSupersetOf(other) {
	    return functionCall(setIsSupersetOf, this, toSetLike(other));
	  }
	});

	var arrayJoin = functionUncurryThis([].join);
	var push$7 = functionUncurryThis([].push);

	// `Set.prototype.join` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Set', proto: true, real: true, forced: true }, {
	  join: function join(separator) {
	    var set = aSet(this);
	    var sep = separator === undefined ? ',' : toString_1$1(separator);
	    var array = [];
	    setIterate(set, function (value) {
	      push$7(array, value);
	    });
	    return arrayJoin(array, sep);
	  }
	});

	var Set$3 = setHelpers.Set;
	var add$3 = setHelpers.add;

	// `Set.prototype.map` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Set', proto: true, real: true, forced: true }, {
	  map: function map(callbackfn /* , thisArg */) {
	    var set = aSet(this);
	    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    var newSet = new Set$3();
	    setIterate(set, function (value) {
	      add$3(newSet, boundFunction(value, value, set));
	    });
	    return newSet;
	  }
	});

	// `Set.of` method
	// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
	_export({ target: 'Set', stat: true, forced: true }, {
	  of: collectionOf(setHelpers.Set, setHelpers.add, false)
	});

	var $TypeError$7 = TypeError;

	// `Set.prototype.reduce` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Set', proto: true, real: true, forced: true }, {
	  reduce: function reduce(callbackfn /* , initialValue */) {
	    var set = aSet(this);
	    var noInitial = arguments.length < 2;
	    var accumulator = noInitial ? undefined : arguments[1];
	    aCallable(callbackfn);
	    setIterate(set, function (value) {
	      if (noInitial) {
	        noInitial = false;
	        accumulator = value;
	      } else {
	        accumulator = callbackfn(accumulator, value, value, set);
	      }
	    });
	    if (noInitial) throw new $TypeError$7('Reduce of empty set with no initial value');
	    return accumulator;
	  }
	});

	// `Set.prototype.some` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'Set', proto: true, real: true, forced: true }, {
	  some: function some(callbackfn /* , thisArg */) {
	    var set = aSet(this);
	    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    return setIterate(set, function (value) {
	      if (boundFunction(value, value, set)) return true;
	    }, true) === true;
	  }
	});

	var add$2 = setHelpers.add;
	var has$3 = setHelpers.has;
	var remove$2 = setHelpers.remove;

	// `Set.prototype.symmetricDifference` method
	// https://github.com/tc39/proposal-set-methods
	var setSymmetricDifference = function symmetricDifference(other) {
	  var O = aSet(this);
	  var keysIter = getSetRecord(other).getIterator();
	  var result = setClone(O);
	  iterateSimple(keysIter, function (e) {
	    if (has$3(O, e)) remove$2(result, e);
	    else add$2(result, e);
	  });
	  return result;
	};

	// `Set.prototype.symmetricDifference` method
	// https://github.com/tc39/proposal-set-methods
	_export({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('symmetricDifference') }, {
	  symmetricDifference: setSymmetricDifference
	});

	// `Set.prototype.symmetricDifference` method
	// https://github.com/tc39/proposal-set-methods
	// TODO: Obsolete version, remove from `core-js@4`
	_export({ target: 'Set', proto: true, real: true, forced: true }, {
	  symmetricDifference: function symmetricDifference(other) {
	    return functionCall(setSymmetricDifference, this, toSetLike(other));
	  }
	});

	var add$1 = setHelpers.add;




	// `Set.prototype.union` method
	// https://github.com/tc39/proposal-set-methods
	var setUnion = function union(other) {
	  var O = aSet(this);
	  var keysIter = getSetRecord(other).getIterator();
	  var result = setClone(O);
	  iterateSimple(keysIter, function (it) {
	    add$1(result, it);
	  });
	  return result;
	};

	// `Set.prototype.union` method
	// https://github.com/tc39/proposal-set-methods
	_export({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('union') }, {
	  union: setUnion
	});

	// `Set.prototype.union` method
	// https://github.com/tc39/proposal-set-methods
	// TODO: Obsolete version, remove from `core-js@4`
	_export({ target: 'Set', proto: true, real: true, forced: true }, {
	  union: function union(other) {
	    return functionCall(setUnion, this, toSetLike(other));
	  }
	});

	// TODO: Remove from `core-js@4`

	var charAt$9 = stringMultibyte.charAt;




	// `String.prototype.at` method
	// https://github.com/mathiasbynens/String.prototype.at
	_export({ target: 'String', proto: true, forced: true }, {
	  at: function at(index) {
	    var S = toString_1$1(requireObjectCoercible(this));
	    var len = S.length;
	    var relativeIndex = toIntegerOrInfinity(index);
	    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
	    return (k < 0 || k >= len) ? undefined : charAt$9(S, k);
	  }
	});

	var $TypeError$6 = TypeError;
	var push$6 = functionUncurryThis([].push);
	var join$3 = functionUncurryThis([].join);

	// `String.cooked` method
	// https://tc39.es/proposal-string-cooked/
	var stringCooked = function cooked(template /* , ...substitutions */) {
	  var cookedTemplate = toIndexedObject(template);
	  var literalSegments = lengthOfArrayLike(cookedTemplate);
	  if (!literalSegments) return '';
	  var argumentsLength = arguments.length;
	  var elements = [];
	  var i = 0;
	  while (true) {
	    var nextVal = cookedTemplate[i++];
	    if (nextVal === undefined) throw new $TypeError$6('Incorrect template');
	    push$6(elements, toString_1$1(nextVal));
	    if (i === literalSegments) return join$3(elements, '');
	    if (i < argumentsLength) push$6(elements, toString_1$1(arguments[i]));
	  }
	};

	// `String.cooked` method
	// https://github.com/tc39/proposal-string-cooked
	_export({ target: 'String', stat: true, forced: true }, {
	  cooked: stringCooked
	});

	var codeAt$1 = stringMultibyte.codeAt;
	var charAt$8 = stringMultibyte.charAt;
	var STRING_ITERATOR = 'String Iterator';
	var setInternalState$3 = internalState.set;
	var getInternalState$1 = internalState.getterFor(STRING_ITERATOR);

	// TODO: unify with String#@@iterator
	var $StringIterator = iteratorCreateConstructor(function StringIterator(string) {
	  setInternalState$3(this, {
	    type: STRING_ITERATOR,
	    string: string,
	    index: 0
	  });
	}, 'String', function next() {
	  var state = getInternalState$1(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return createIterResultObject(undefined, true);
	  point = charAt$8(string, index);
	  state.index += point.length;
	  return createIterResultObject({ codePoint: codeAt$1(point, 0), position: index }, false);
	});

	// `String.prototype.codePoints` method
	// https://github.com/tc39/proposal-string-prototype-codepoints
	_export({ target: 'String', proto: true, forced: true }, {
	  codePoints: function codePoints() {
	    return new $StringIterator(toString_1$1(requireObjectCoercible(this)));
	  }
	});

	// eslint-disable-next-line es/no-weak-map -- safe
	var WeakMapPrototype = WeakMap.prototype;

	var weakMapHelpers = {
	  // eslint-disable-next-line es/no-weak-map -- safe
	  WeakMap: WeakMap,
	  set: functionUncurryThis(WeakMapPrototype.set),
	  get: functionUncurryThis(WeakMapPrototype.get),
	  has: functionUncurryThis(WeakMapPrototype.has),
	  remove: functionUncurryThis(WeakMapPrototype['delete'])
	};

	// adapted from https://github.com/jridgewell/string-dedent



	var fromCharCode$2 = String.fromCharCode;
	var fromCodePoint = getBuiltIn('String', 'fromCodePoint');
	var charAt$7 = functionUncurryThis(''.charAt);
	var charCodeAt$2 = functionUncurryThis(''.charCodeAt);
	var stringIndexOf = functionUncurryThis(''.indexOf);
	var stringSlice$5 = functionUncurryThis(''.slice);

	var ZERO_CODE = 48;
	var NINE_CODE = 57;
	var LOWER_A_CODE = 97;
	var LOWER_F_CODE = 102;
	var UPPER_A_CODE = 65;
	var UPPER_F_CODE = 70;

	var isDigit = function (str, index) {
	  var c = charCodeAt$2(str, index);
	  return c >= ZERO_CODE && c <= NINE_CODE;
	};

	var parseHex = function (str, index, end) {
	  if (end >= str.length) return -1;
	  var n = 0;
	  for (; index < end; index++) {
	    var c = hexToInt(charCodeAt$2(str, index));
	    if (c === -1) return -1;
	    n = n * 16 + c;
	  }
	  return n;
	};

	var hexToInt = function (c) {
	  if (c >= ZERO_CODE && c <= NINE_CODE) return c - ZERO_CODE;
	  if (c >= LOWER_A_CODE && c <= LOWER_F_CODE) return c - LOWER_A_CODE + 10;
	  if (c >= UPPER_A_CODE && c <= UPPER_F_CODE) return c - UPPER_A_CODE + 10;
	  return -1;
	};

	var stringParse = function (raw) {
	  var out = '';
	  var start = 0;
	  // We need to find every backslash escape sequence, and cook the escape into a real char.
	  var i = 0;
	  var n;
	  while ((i = stringIndexOf(raw, '\\', i)) > -1) {
	    out += stringSlice$5(raw, start, i);
	    // If the backslash is the last char of the string, then it was an invalid sequence.
	    // This can't actually happen in a tagged template literal, but could happen if you manually
	    // invoked the tag with an array.
	    if (++i === raw.length) return;
	    var next = charAt$7(raw, i++);
	    switch (next) {
	      // Escaped control codes need to be individually processed.
	      case 'b':
	        out += '\b';
	        break;
	      case 't':
	        out += '\t';
	        break;
	      case 'n':
	        out += '\n';
	        break;
	      case 'v':
	        out += '\v';
	        break;
	      case 'f':
	        out += '\f';
	        break;
	      case 'r':
	        out += '\r';
	        break;
	      // Escaped line terminators just skip the char.
	      case '\r':
	        // Treat `\r\n` as a single terminator.
	        if (i < raw.length && charAt$7(raw, i) === '\n') ++i;
	      // break omitted
	      case '\n':
	      case '\u2028':
	      case '\u2029':
	        break;
	      // `\0` is a null control char, but `\0` followed by another digit is an illegal octal escape.
	      case '0':
	        if (isDigit(raw, i)) return;
	        out += '\0';
	        break;
	      // Hex escapes must contain 2 hex chars.
	      case 'x':
	        n = parseHex(raw, i, i + 2);
	        if (n === -1) return;
	        i += 2;
	        out += fromCharCode$2(n);
	        break;
	      // Unicode escapes contain either 4 chars, or an unlimited number between `{` and `}`.
	      // The hex value must not overflow 0x10FFFF.
	      case 'u':
	        if (i < raw.length && charAt$7(raw, i) === '{') {
	          var end = stringIndexOf(raw, '}', ++i);
	          if (end === -1) return;
	          n = parseHex(raw, i, end);
	          i = end + 1;
	        } else {
	          n = parseHex(raw, i, i + 4);
	          i += 4;
	        }
	        if (n === -1 || n > 0x10FFFF) return;
	        out += fromCodePoint(n);
	        break;
	      default:
	        if (isDigit(next, 0)) return;
	        out += next;
	    }
	    start = i;
	  }
	  return out + stringSlice$5(raw, start);
	};

	var defineProperty$6 = objectDefineProperty.f;






	var DedentMap = new weakMapHelpers.WeakMap();
	var weakMapGet = weakMapHelpers.get;
	var weakMapHas = weakMapHelpers.has;
	var weakMapSet = weakMapHelpers.set;

	var $Array = Array;
	var $TypeError$5 = TypeError;
	// eslint-disable-next-line es/no-object-freeze -- safe
	var freeze = Object.freeze || Object;
	// eslint-disable-next-line es/no-object-isfrozen -- safe
	var isFrozen = Object.isFrozen;
	var min$1 = Math.min;
	var charAt$6 = functionUncurryThis(''.charAt);
	var stringSlice$4 = functionUncurryThis(''.slice);
	var split$3 = functionUncurryThis(''.split);
	var exec$4 = functionUncurryThis(/./.exec);

	var NEW_LINE = /([\n\u2028\u2029]|\r\n?)/g;
	var LEADING_WHITESPACE = RegExp('^[' + whitespaces$1 + ']*');
	var NON_WHITESPACE = RegExp('[^' + whitespaces$1 + ']');
	var INVALID_TAG = 'Invalid tag';
	var INVALID_OPENING_LINE = 'Invalid opening line';
	var INVALID_CLOSING_LINE = 'Invalid closing line';

	var dedentTemplateStringsArray = function (template) {
	  var rawInput = template.raw;
	  // https://github.com/tc39/proposal-string-dedent/issues/75
	  if (freezing && !isFrozen(rawInput)) throw new $TypeError$5('Raw template should be frozen');
	  if (weakMapHas(DedentMap, rawInput)) return weakMapGet(DedentMap, rawInput);
	  var raw = dedentStringsArray(rawInput);
	  var cookedArr = cookStrings(raw);
	  defineProperty$6(cookedArr, 'raw', {
	    value: freeze(raw)
	  });
	  freeze(cookedArr);
	  weakMapSet(DedentMap, rawInput, cookedArr);
	  return cookedArr;
	};

	var dedentStringsArray = function (template) {
	  var t = toObject(template);
	  var length = lengthOfArrayLike(t);
	  var blocks = $Array(length);
	  var dedented = $Array(length);
	  var i = 0;
	  var lines, common, quasi, k;

	  if (!length) throw new $TypeError$5(INVALID_TAG);

	  for (; i < length; i++) {
	    var element = t[i];
	    if (typeof element == 'string') blocks[i] = split$3(element, NEW_LINE);
	    else throw new $TypeError$5(INVALID_TAG);
	  }

	  for (i = 0; i < length; i++) {
	    var lastSplit = i + 1 === length;
	    lines = blocks[i];
	    if (i === 0) {
	      if (lines.length === 1 || lines[0].length > 0) {
	        throw new $TypeError$5(INVALID_OPENING_LINE);
	      }
	      lines[1] = '';
	    }
	    if (lastSplit) {
	      if (lines.length === 1 || exec$4(NON_WHITESPACE, lines[lines.length - 1])) {
	        throw new $TypeError$5(INVALID_CLOSING_LINE);
	      }
	      lines[lines.length - 2] = '';
	      lines[lines.length - 1] = '';
	    }
	    for (var j = 2; j < lines.length; j += 2) {
	      var text = lines[j];
	      var lineContainsTemplateExpression = j + 1 === lines.length && !lastSplit;
	      var leading = exec$4(LEADING_WHITESPACE, text)[0];
	      if (!lineContainsTemplateExpression && leading.length === text.length) {
	        lines[j] = '';
	        continue;
	      }
	      common = commonLeadingIndentation(leading, common);
	    }
	  }

	  var count = common ? common.length : 0;

	  for (i = 0; i < length; i++) {
	    lines = blocks[i];
	    quasi = lines[0];
	    k = 1;
	    for (; k < lines.length; k += 2) {
	      quasi += lines[k] + stringSlice$4(lines[k + 1], count);
	    }
	    dedented[i] = quasi;
	  }

	  return dedented;
	};

	var commonLeadingIndentation = function (a, b) {
	  if (b === undefined || a === b) return a;
	  var i = 0;
	  for (var len = min$1(a.length, b.length); i < len; i++) {
	    if (charAt$6(a, i) !== charAt$6(b, i)) break;
	  }
	  return stringSlice$4(a, 0, i);
	};

	var cookStrings = function (raw) {
	  var i = 0;
	  var length = raw.length;
	  var result = $Array(length);
	  for (; i < length; i++) {
	    result[i] = stringParse(raw[i]);
	  } return result;
	};

	var makeDedentTag = function (tag) {
	  return makeBuiltIn_1(function (template /* , ...substitutions */) {
	    var args = arraySlice(arguments);
	    args[0] = dedentTemplateStringsArray(anObject(template));
	    return functionApply(tag, this, args);
	  }, '');
	};

	var cookedDedentTag = makeDedentTag(stringCooked);

	// `String.dedent` method
	// https://github.com/tc39/proposal-string-dedent
	_export({ target: 'String', stat: true, forced: true }, {
	  dedent: function dedent(templateOrFn /* , ...substitutions */) {
	    anObject(templateOrFn);
	    if (isCallable(templateOrFn)) return makeDedentTag(templateOrFn);
	    return functionApply(cookedDedentTag, this, arguments);
	  }
	});

	var defineProperty$5 = objectDefineProperty.f;
	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;

	var Symbol$4 = global_1.Symbol;

	// `Symbol.asyncDispose` well-known symbol
	// https://github.com/tc39/proposal-async-explicit-resource-management
	wellKnownSymbolDefine('asyncDispose');

	if (Symbol$4) {
	  var descriptor$4 = getOwnPropertyDescriptor$1(Symbol$4, 'asyncDispose');
	  // workaround of NodeJS 20.4 bug
	  // https://github.com/nodejs/node/issues/48699
	  // and incorrect descriptor from some transpilers and userland helpers
	  if (descriptor$4.enumerable && descriptor$4.configurable && descriptor$4.writable) {
	    defineProperty$5(Symbol$4, 'asyncDispose', { value: descriptor$4.value, enumerable: false, configurable: false, writable: false });
	  }
	}

	var defineProperty$4 = objectDefineProperty.f;
	var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

	var Symbol$3 = global_1.Symbol;

	// `Symbol.dispose` well-known symbol
	// https://github.com/tc39/proposal-explicit-resource-management
	wellKnownSymbolDefine('dispose');

	if (Symbol$3) {
	  var descriptor$3 = getOwnPropertyDescriptor(Symbol$3, 'dispose');
	  // workaround of NodeJS 20.4 bug
	  // https://github.com/nodejs/node/issues/48699
	  // and incorrect descriptor from some transpilers and userland helpers
	  if (descriptor$3.enumerable && descriptor$3.configurable && descriptor$3.writable) {
	    defineProperty$4(Symbol$3, 'dispose', { value: descriptor$3.value, enumerable: false, configurable: false, writable: false });
	  }
	}

	var Symbol$2 = getBuiltIn('Symbol');
	var keyFor = Symbol$2.keyFor;
	var thisSymbolValue$1 = functionUncurryThis(Symbol$2.prototype.valueOf);

	// `Symbol.isRegisteredSymbol` method
	// https://tc39.es/proposal-symbol-predicates/#sec-symbol-isregisteredsymbol
	var symbolIsRegistered = Symbol$2.isRegisteredSymbol || function isRegisteredSymbol(value) {
	  try {
	    return keyFor(thisSymbolValue$1(value)) !== undefined;
	  } catch (error) {
	    return false;
	  }
	};

	// `Symbol.isRegisteredSymbol` method
	// https://tc39.es/proposal-symbol-predicates/#sec-symbol-isregisteredsymbol
	_export({ target: 'Symbol', stat: true }, {
	  isRegisteredSymbol: symbolIsRegistered
	});

	// `Symbol.isRegistered` method
	// obsolete version of https://tc39.es/proposal-symbol-predicates/#sec-symbol-isregisteredsymbol
	_export({ target: 'Symbol', stat: true, name: 'isRegisteredSymbol' }, {
	  isRegistered: symbolIsRegistered
	});

	var Symbol$1 = getBuiltIn('Symbol');
	var $isWellKnownSymbol = Symbol$1.isWellKnownSymbol;
	var getOwnPropertyNames = getBuiltIn('Object', 'getOwnPropertyNames');
	var thisSymbolValue = functionUncurryThis(Symbol$1.prototype.valueOf);
	var WellKnownSymbolsStore = shared('wks');

	for (var i$1 = 0, symbolKeys = getOwnPropertyNames(Symbol$1), symbolKeysLength = symbolKeys.length; i$1 < symbolKeysLength; i$1++) {
	  // some old engines throws on access to some keys like `arguments` or `caller`
	  try {
	    var symbolKey = symbolKeys[i$1];
	    if (isSymbol$1(Symbol$1[symbolKey])) wellKnownSymbol(symbolKey);
	  } catch (error) { /* empty */ }
	}

	// `Symbol.isWellKnownSymbol` method
	// https://tc39.es/proposal-symbol-predicates/#sec-symbol-iswellknownsymbol
	// We should patch it for newly added well-known symbols. If it's not required, this module just will not be injected
	var symbolIsWellKnown = function isWellKnownSymbol(value) {
	  if ($isWellKnownSymbol && $isWellKnownSymbol(value)) return true;
	  try {
	    var symbol = thisSymbolValue(value);
	    for (var j = 0, keys = getOwnPropertyNames(WellKnownSymbolsStore), keysLength = keys.length; j < keysLength; j++) {
	      // eslint-disable-next-line eqeqeq -- polyfilled symbols case
	      if (WellKnownSymbolsStore[keys[j]] == symbol) return true;
	    }
	  } catch (error) { /* empty */ }
	  return false;
	};

	// `Symbol.isWellKnownSymbol` method
	// https://tc39.es/proposal-symbol-predicates/#sec-symbol-iswellknownsymbol
	// We should patch it for newly added well-known symbols. If it's not required, this module just will not be injected
	_export({ target: 'Symbol', stat: true, forced: true }, {
	  isWellKnownSymbol: symbolIsWellKnown
	});

	// `Symbol.isWellKnown` method
	// obsolete version of https://tc39.es/proposal-symbol-predicates/#sec-symbol-iswellknownsymbol
	// We should patch it for newly added well-known symbols. If it's not required, this module just will not be injected
	_export({ target: 'Symbol', stat: true, name: 'isWellKnownSymbol', forced: true }, {
	  isWellKnown: symbolIsWellKnown
	});

	// `Symbol.matcher` well-known symbol
	// https://github.com/tc39/proposal-pattern-matching
	wellKnownSymbolDefine('matcher');

	// `Symbol.metadata` well-known symbol
	// https://github.com/tc39/proposal-decorators
	wellKnownSymbolDefine('metadata');

	// TODO: Remove from `core-js@4`


	// `Symbol.metadataKey` well-known symbol
	// https://github.com/tc39/proposal-decorator-metadata
	wellKnownSymbolDefine('metadataKey');

	// `Symbol.observable` well-known symbol
	// https://github.com/tc39/proposal-observable
	wellKnownSymbolDefine('observable');

	// TODO: remove from `core-js@4`


	// `Symbol.patternMatch` well-known symbol
	// https://github.com/tc39/proposal-pattern-matching
	wellKnownSymbolDefine('patternMatch');

	// TODO: remove from `core-js@4`


	wellKnownSymbolDefine('replaceAll');

	// TODO: Remove from `core-js@4`






	var aTypedArrayConstructor = arrayBufferViewCore.aTypedArrayConstructor;
	var exportTypedArrayStaticMethod = arrayBufferViewCore.exportTypedArrayStaticMethod;

	// `%TypedArray%.fromAsync` method
	// https://github.com/tc39/proposal-array-from-async
	exportTypedArrayStaticMethod('fromAsync', function fromAsync(asyncItems /* , mapfn = undefined, thisArg = undefined */) {
	  var C = this;
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var thisArg = argumentsLength > 2 ? arguments[2] : undefined;
	  return new (getBuiltIn('Promise'))(function (resolve) {
	    aConstructor(C);
	    resolve(arrayFromAsync(asyncItems, mapfn, thisArg));
	  }).then(function (list) {
	    return arrayFromConstructorAndList(aTypedArrayConstructor(C), list);
	  });
	}, true);

	// TODO: Remove from `core-js@4`

	var $filterReject$1 = arrayIteration.filterReject;


	var aTypedArray$4 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$4 = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.filterOut` method
	// https://github.com/tc39/proposal-array-filtering
	exportTypedArrayMethod$4('filterOut', function filterOut(callbackfn /* , thisArg */) {
	  var list = $filterReject$1(aTypedArray$4(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  return typedArrayFromSpeciesAndList(this, list);
	}, true);

	var $filterReject = arrayIteration.filterReject;


	var aTypedArray$3 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$3 = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.filterReject` method
	// https://github.com/tc39/proposal-array-filtering
	exportTypedArrayMethod$3('filterReject', function filterReject(callbackfn /* , thisArg */) {
	  var list = $filterReject(aTypedArray$3(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  return typedArrayFromSpeciesAndList(this, list);
	}, true);

	// TODO: Remove from `core-js@4`




	var aTypedArray$2 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$2 = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.groupBy` method
	// https://github.com/tc39/proposal-array-grouping
	exportTypedArrayMethod$2('groupBy', function groupBy(callbackfn /* , thisArg */) {
	  var thisArg = arguments.length > 1 ? arguments[1] : undefined;
	  return arrayGroup(aTypedArray$2(this), callbackfn, thisArg, typedArraySpeciesConstructor);
	}, true);

	// TODO: Remove from `core-js@4`








	var aTypedArray$1 = arrayBufferViewCore.aTypedArray;
	var getTypedArrayConstructor$1 = arrayBufferViewCore.getTypedArrayConstructor;
	var exportTypedArrayMethod$1 = arrayBufferViewCore.exportTypedArrayMethod;
	var max = Math.max;
	var min = Math.min;

	// some early implementations, like WebKit, does not follow the final semantic
	var PROPER_ORDER = !fails(function () {
	  // eslint-disable-next-line es/no-typed-arrays -- required for testing
	  var array = new Int8Array([1]);

	  var spliced = array.toSpliced(1, 0, {
	    valueOf: function () {
	      array[0] = 2;
	      return 3;
	    }
	  });

	  return spliced[0] !== 2 || spliced[1] !== 3;
	});

	// `%TypedArray%.prototype.toSpliced` method
	// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.toSpliced
	exportTypedArrayMethod$1('toSpliced', function toSpliced(start, deleteCount /* , ...items */) {
	  var O = aTypedArray$1(this);
	  var C = getTypedArrayConstructor$1(O);
	  var len = lengthOfArrayLike(O);
	  var actualStart = toAbsoluteIndex(start, len);
	  var argumentsLength = arguments.length;
	  var k = 0;
	  var insertCount, actualDeleteCount, thisIsBigIntArray, convertedItems, value, newLen, A;
	  if (argumentsLength === 0) {
	    insertCount = actualDeleteCount = 0;
	  } else if (argumentsLength === 1) {
	    insertCount = 0;
	    actualDeleteCount = len - actualStart;
	  } else {
	    actualDeleteCount = min(max(toIntegerOrInfinity(deleteCount), 0), len - actualStart);
	    insertCount = argumentsLength - 2;
	    if (insertCount) {
	      convertedItems = new C(insertCount);
	      thisIsBigIntArray = isBigIntArray(convertedItems);
	      for (var i = 2; i < argumentsLength; i++) {
	        value = arguments[i];
	        // FF30- typed arrays doesn't properly convert objects to typed array values
	        convertedItems[i - 2] = thisIsBigIntArray ? toBigInt(value) : +value;
	      }
	    }
	  }
	  newLen = len + insertCount - actualDeleteCount;
	  A = new C(newLen);

	  for (; k < actualStart; k++) A[k] = O[k];
	  for (; k < actualStart + insertCount; k++) A[k] = convertedItems[k - actualStart];
	  for (; k < newLen; k++) A[k] = O[k + actualDeleteCount - insertCount];

	  return A;
	}, !PROPER_ORDER);

	var aTypedArray = arrayBufferViewCore.aTypedArray;
	var getTypedArrayConstructor = arrayBufferViewCore.getTypedArrayConstructor;
	var exportTypedArrayMethod = arrayBufferViewCore.exportTypedArrayMethod;
	var arrayUniqueBy = functionUncurryThis(arrayUniqueBy$2);

	// `%TypedArray%.prototype.uniqueBy` method
	// https://github.com/tc39/proposal-array-unique
	exportTypedArrayMethod('uniqueBy', function uniqueBy(resolver) {
	  aTypedArray(this);
	  return arrayFromConstructorAndList(getTypedArrayConstructor(this), arrayUniqueBy(this, resolver));
	}, true);

	var $String = String;
	var $TypeError$4 = TypeError;

	var anObjectOrUndefined = function (argument) {
	  if (argument === undefined || isObject$1(argument)) return argument;
	  throw new $TypeError$4($String(argument) + ' is not an object or undefined');
	};

	var $TypeError$3 = TypeError;

	var aString = function (argument) {
	  if (typeof argument == 'string') return argument;
	  throw new $TypeError$3('Argument is not a string');
	};

	var commonAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var base64Alphabet$2 = commonAlphabet + '+/';
	var base64UrlAlphabet$2 = commonAlphabet + '-_';

	var inverse = function (characters) {
	  // TODO: use `Object.create(null)` in `core-js@4`
	  var result = {};
	  var index = 0;
	  for (; index < 64; index++) result[characters.charAt(index)] = index;
	  return result;
	};

	var base64Map = {
	  i2c: base64Alphabet$2,
	  c2i: inverse(base64Alphabet$2),
	  i2cUrl: base64UrlAlphabet$2,
	  c2iUrl: inverse(base64UrlAlphabet$2)
	};

	var $TypeError$2 = TypeError;

	var getAlphabetOption = function (options) {
	  var alphabet = options && options.alphabet;
	  if (alphabet === undefined || alphabet === 'base64' || alphabet === 'base64url') return alphabet || 'base64';
	  throw new $TypeError$2('Incorrect `alphabet` option');
	};

	var base64Alphabet$1 = base64Map.c2i;
	var base64UrlAlphabet$1 = base64Map.c2iUrl;

	var Uint8Array$5 = global_1.Uint8Array;
	var SyntaxError$2 = global_1.SyntaxError;
	var charAt$5 = functionUncurryThis(''.charAt);
	var replace$4 = functionUncurryThis(''.replace);
	var stringSlice$3 = functionUncurryThis(''.slice);
	var push$5 = functionUncurryThis([].push);
	var SPACES = /[\t\n\f\r ]/g;
	var EXTRA_BITS = 'Extra bits';

	// `Uint8Array.fromBase64` method
	// https://github.com/tc39/proposal-arraybuffer-base64
	if (Uint8Array$5) _export({ target: 'Uint8Array', stat: true, forced: true }, {
	  fromBase64: function fromBase64(string /* , options */) {
	    aString(string);
	    var options = arguments.length > 1 ? anObjectOrUndefined(arguments[1]) : undefined;
	    var alphabet = getAlphabetOption(options) === 'base64' ? base64Alphabet$1 : base64UrlAlphabet$1;
	    var strict = options ? !!options.strict : false;

	    var input = strict ? string : replace$4(string, SPACES, '');

	    if (input.length % 4 === 0) {
	      if (stringSlice$3(input, -2) === '==') input = stringSlice$3(input, 0, -2);
	      else if (stringSlice$3(input, -1) === '=') input = stringSlice$3(input, 0, -1);
	    } else if (strict) throw new SyntaxError$2('Input is not correctly padded');

	    var lastChunkSize = input.length % 4;

	    switch (lastChunkSize) {
	      case 1: throw new SyntaxError$2('Bad input length');
	      case 2: input += 'AA'; break;
	      case 3: input += 'A';
	    }

	    var bytes = [];
	    var i = 0;
	    var inputLength = input.length;

	    var at = function (shift) {
	      var chr = charAt$5(input, i + shift);
	      if (!hasOwnProperty_1(alphabet, chr)) throw new SyntaxError$2('Bad char in input: "' + chr + '"');
	      return alphabet[chr] << (18 - 6 * shift);
	    };

	    for (; i < inputLength; i += 4) {
	      var triplet = at(0) + at(1) + at(2) + at(3);
	      push$5(bytes, (triplet >> 16) & 255, (triplet >> 8) & 255, triplet & 255);
	    }

	    var byteLength = bytes.length;

	    if (lastChunkSize === 2) {
	      if (strict && bytes[byteLength - 2] !== 0) throw new SyntaxError$2(EXTRA_BITS);
	      byteLength -= 2;
	    } else if (lastChunkSize === 3) {
	      if (strict && bytes[byteLength - 1] !== 0) throw new SyntaxError$2(EXTRA_BITS);
	      byteLength--;
	    }

	    return arrayFromConstructorAndList(Uint8Array$5, bytes, byteLength);
	  }
	});

	var Uint8Array$4 = global_1.Uint8Array;
	var SyntaxError$1 = global_1.SyntaxError;
	var parseInt$2 = global_1.parseInt;
	var NOT_HEX = /[^\da-f]/i;
	var exec$3 = functionUncurryThis(NOT_HEX.exec);
	var stringSlice$2 = functionUncurryThis(''.slice);

	// `Uint8Array.fromHex` method
	// https://github.com/tc39/proposal-arraybuffer-base64
	if (Uint8Array$4) _export({ target: 'Uint8Array', stat: true, forced: true }, {
	  fromHex: function fromHex(string) {
	    aString(string);
	    var stringLength = string.length;
	    if (stringLength % 2) throw new SyntaxError$1('String should have an even number of characters');
	    if (exec$3(NOT_HEX, string)) throw new SyntaxError$1('String should only contain hex characters');
	    var result = new Uint8Array$4(stringLength / 2);
	    for (var i = 0; i < stringLength; i += 2) {
	      result[i / 2] = parseInt$2(stringSlice$2(string, i, i + 2), 16);
	    }
	    return result;
	  }
	});

	var $TypeError$1 = TypeError;

	// Perform ? RequireInternalSlot(argument, [[TypedArrayName]])
	// If argument.[[TypedArrayName]] is not "Uint8Array", throw a TypeError exception
	var anUint8Array = function (argument) {
	  if (classof(argument) === 'Uint8Array') return argument;
	  throw new $TypeError$1('Argument is not an Uint8Array');
	};

	var base64Alphabet = base64Map.i2c;
	var base64UrlAlphabet = base64Map.i2cUrl;

	var Uint8Array$3 = global_1.Uint8Array;
	var charAt$4 = functionUncurryThis(''.charAt);

	// `Uint8Array.prototype.toBase64` method
	// https://github.com/tc39/proposal-arraybuffer-base64
	if (Uint8Array$3) _export({ target: 'Uint8Array', proto: true, forced: true }, {
	  toBase64: function toBase64(/* options */) {
	    var array = anUint8Array(this);
	    var options = arguments.length ? anObjectOrUndefined(arguments[0]) : undefined;
	    var alphabet = getAlphabetOption(options) === 'base64' ? base64Alphabet : base64UrlAlphabet;

	    var result = '';
	    var i = 0;
	    var length = array.length;
	    var triplet;

	    var at = function (shift) {
	      return charAt$4(alphabet, (triplet >> (6 * shift)) & 63);
	    };

	    for (; i + 2 < length; i += 3) {
	      triplet = (array[i] << 16) + (array[i + 1] << 8) + array[i + 2];
	      result += at(3) + at(2) + at(1) + at(0);
	    }
	    if (i + 2 === length) {
	      triplet = (array[i] << 16) + (array[i + 1] << 8);
	      result += at(3) + at(2) + at(1) + '=';
	    } else if (i + 1 === length) {
	      triplet = array[i] << 16;
	      result += at(3) + at(2) + '==';
	    }

	    return result;
	  }
	});

	var Uint8Array$2 = global_1.Uint8Array;
	var numberToString$1 = functionUncurryThis(1.0.toString);

	// `Uint8Array.prototype.toHex` method
	// https://github.com/tc39/proposal-arraybuffer-base64
	if (Uint8Array$2) _export({ target: 'Uint8Array', proto: true, forced: true }, {
	  toHex: function toHex() {
	    anUint8Array(this);
	    var result = '';
	    for (var i = 0, length = this.length; i < length; i++) {
	      var hex = numberToString$1(this[i], 16);
	      result += hex.length === 1 ? '0' + hex : hex;
	    }
	    return result;
	  }
	});

	var has$2 = weakMapHelpers.has;

	// Perform ? RequireInternalSlot(M, [[WeakMapData]])
	var aWeakMap = function (it) {
	  has$2(it);
	  return it;
	};

	var remove$1 = weakMapHelpers.remove;

	// `WeakMap.prototype.deleteAll` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'WeakMap', proto: true, real: true, forced: true }, {
	  deleteAll: function deleteAll(/* ...elements */) {
	    var collection = aWeakMap(this);
	    var allDeleted = true;
	    var wasDeleted;
	    for (var k = 0, len = arguments.length; k < len; k++) {
	      wasDeleted = remove$1(collection, arguments[k]);
	      allDeleted = allDeleted && wasDeleted;
	    } return !!allDeleted;
	  }
	});

	// `WeakMap.from` method
	// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.from
	_export({ target: 'WeakMap', stat: true, forced: true }, {
	  from: collectionFrom(weakMapHelpers.WeakMap, weakMapHelpers.set, true)
	});

	// `WeakMap.of` method
	// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.of
	_export({ target: 'WeakMap', stat: true, forced: true }, {
	  of: collectionOf(weakMapHelpers.WeakMap, weakMapHelpers.set, true)
	});

	var get$1 = weakMapHelpers.get;
	var has$1 = weakMapHelpers.has;
	var set = weakMapHelpers.set;

	// `WeakMap.prototype.emplace` method
	// https://github.com/tc39/proposal-upsert
	_export({ target: 'WeakMap', proto: true, real: true, forced: true }, {
	  emplace: function emplace(key, handler) {
	    var map = aWeakMap(this);
	    var value, inserted;
	    if (has$1(map, key)) {
	      value = get$1(map, key);
	      if ('update' in handler) {
	        value = handler.update(value, key, map);
	        set(map, key, value);
	      } return value;
	    }
	    inserted = handler.insert(key, map);
	    set(map, key, inserted);
	    return inserted;
	  }
	});

	// TODO: remove from `core-js@4`



	// `WeakMap.prototype.upsert` method (replaced by `WeakMap.prototype.emplace`)
	// https://github.com/tc39/proposal-upsert
	_export({ target: 'WeakMap', proto: true, real: true, forced: true }, {
	  upsert: mapUpsert
	});

	// eslint-disable-next-line es/no-weak-set -- safe
	var WeakSetPrototype = WeakSet.prototype;

	var weakSetHelpers = {
	  // eslint-disable-next-line es/no-weak-set -- safe
	  WeakSet: WeakSet,
	  add: functionUncurryThis(WeakSetPrototype.add),
	  has: functionUncurryThis(WeakSetPrototype.has),
	  remove: functionUncurryThis(WeakSetPrototype['delete'])
	};

	var has = weakSetHelpers.has;

	// Perform ? RequireInternalSlot(M, [[WeakSetData]])
	var aWeakSet = function (it) {
	  has(it);
	  return it;
	};

	var add = weakSetHelpers.add;

	// `WeakSet.prototype.addAll` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'WeakSet', proto: true, real: true, forced: true }, {
	  addAll: function addAll(/* ...elements */) {
	    var set = aWeakSet(this);
	    for (var k = 0, len = arguments.length; k < len; k++) {
	      add(set, arguments[k]);
	    } return set;
	  }
	});

	var remove = weakSetHelpers.remove;

	// `WeakSet.prototype.deleteAll` method
	// https://github.com/tc39/proposal-collection-methods
	_export({ target: 'WeakSet', proto: true, real: true, forced: true }, {
	  deleteAll: function deleteAll(/* ...elements */) {
	    var collection = aWeakSet(this);
	    var allDeleted = true;
	    var wasDeleted;
	    for (var k = 0, len = arguments.length; k < len; k++) {
	      wasDeleted = remove(collection, arguments[k]);
	      allDeleted = allDeleted && wasDeleted;
	    } return !!allDeleted;
	  }
	});

	// `WeakSet.from` method
	// https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.from
	_export({ target: 'WeakSet', stat: true, forced: true }, {
	  from: collectionFrom(weakSetHelpers.WeakSet, weakSetHelpers.add, false)
	});

	// `WeakSet.of` method
	// https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.of
	_export({ target: 'WeakSet', stat: true, forced: true }, {
	  of: collectionOf(weakSetHelpers.WeakSet, weakSetHelpers.add, false)
	});

	var c2i = base64Map.c2i;

	var disallowed = /[^\d+/a-z]/i;
	var whitespaces = /[\t\n\f\r ]+/g;
	var finalEq = /[=]{1,2}$/;

	var $atob = getBuiltIn('atob');
	var fromCharCode$1 = String.fromCharCode;
	var charAt$3 = functionUncurryThis(''.charAt);
	var replace$3 = functionUncurryThis(''.replace);
	var exec$2 = functionUncurryThis(disallowed.exec);

	var BASIC$1 = !!$atob && !fails(function () {
	  return $atob('aGk=') !== 'hi';
	});

	var NO_SPACES_IGNORE = BASIC$1 && fails(function () {
	  return $atob(' ') !== '';
	});

	var NO_ENCODING_CHECK = BASIC$1 && !fails(function () {
	  $atob('a');
	});

	var NO_ARG_RECEIVING_CHECK$1 = BASIC$1 && !fails(function () {
	  $atob();
	});

	var WRONG_ARITY$1 = BASIC$1 && $atob.length !== 1;

	var FORCED = !BASIC$1 || NO_SPACES_IGNORE || NO_ENCODING_CHECK || NO_ARG_RECEIVING_CHECK$1 || WRONG_ARITY$1;

	// `atob` method
	// https://html.spec.whatwg.org/multipage/webappapis.html#dom-atob
	_export({ global: true, bind: true, enumerable: true, forced: FORCED }, {
	  atob: function atob(data) {
	    validateArgumentsLength(arguments.length, 1);
	    // `webpack` dev server bug on IE global methods - use call(fn, global, ...)
	    if (BASIC$1 && !NO_SPACES_IGNORE && !NO_ENCODING_CHECK) return functionCall($atob, global_1, data);
	    var string = replace$3(toString_1$1(data), whitespaces, '');
	    var output = '';
	    var position = 0;
	    var bc = 0;
	    var length, chr, bs;
	    if (string.length % 4 === 0) {
	      string = replace$3(string, finalEq, '');
	    }
	    length = string.length;
	    if (length % 4 === 1 || exec$2(disallowed, string)) {
	      throw new (getBuiltIn('DOMException'))('The string is not correctly encoded', 'InvalidCharacterError');
	    }
	    while (position < length) {
	      chr = charAt$3(string, position++);
	      bs = bc % 4 ? bs * 64 + c2i[chr] : c2i[chr];
	      if (bc++ % 4) output += fromCharCode$1(255 & bs >> (-2 * bc & 6));
	    } return output;
	  }
	});

	var i2c = base64Map.i2c;

	var $btoa = getBuiltIn('btoa');
	var charAt$2 = functionUncurryThis(''.charAt);
	var charCodeAt$1 = functionUncurryThis(''.charCodeAt);

	var BASIC = !!$btoa && !fails(function () {
	  return $btoa('hi') !== 'aGk=';
	});

	var NO_ARG_RECEIVING_CHECK = BASIC && !fails(function () {
	  $btoa();
	});

	var WRONG_ARG_CONVERSION = BASIC && fails(function () {
	  return $btoa(null) !== 'bnVsbA==';
	});

	var WRONG_ARITY = BASIC && $btoa.length !== 1;

	// `btoa` method
	// https://html.spec.whatwg.org/multipage/webappapis.html#dom-btoa
	_export({ global: true, bind: true, enumerable: true, forced: !BASIC || NO_ARG_RECEIVING_CHECK || WRONG_ARG_CONVERSION || WRONG_ARITY }, {
	  btoa: function btoa(data) {
	    validateArgumentsLength(arguments.length, 1);
	    // `webpack` dev server bug on IE global methods - use call(fn, global, ...)
	    if (BASIC) return functionCall($btoa, global_1, toString_1$1(data));
	    var string = toString_1$1(data);
	    var output = '';
	    var position = 0;
	    var map = i2c;
	    var block, charCode;
	    while (charAt$2(string, position) || (map = '=', position % 1)) {
	      charCode = charCodeAt$1(string, position += 3 / 4);
	      if (charCode > 0xFF) {
	        throw new (getBuiltIn('DOMException'))('The string contains characters outside of the Latin1 range', 'InvalidCharacterError');
	      }
	      block = block << 8 | charCode;
	      output += charAt$2(map, 63 & block >> 8 - position % 1 * 8);
	    } return output;
	  }
	});

	// iterable DOM collections
	// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
	var domIterables = {
	  CSSRuleList: 0,
	  CSSStyleDeclaration: 0,
	  CSSValueList: 0,
	  ClientRectList: 0,
	  DOMRectList: 0,
	  DOMStringList: 0,
	  DOMTokenList: 1,
	  DataTransferItemList: 0,
	  FileList: 0,
	  HTMLAllCollection: 0,
	  HTMLCollection: 0,
	  HTMLFormElement: 0,
	  HTMLSelectElement: 0,
	  MediaList: 0,
	  MimeTypeArray: 0,
	  NamedNodeMap: 0,
	  NodeList: 1,
	  PaintRequestList: 0,
	  Plugin: 0,
	  PluginArray: 0,
	  SVGLengthList: 0,
	  SVGNumberList: 0,
	  SVGPathSegList: 0,
	  SVGPointList: 0,
	  SVGStringList: 0,
	  SVGTransformList: 0,
	  SourceBufferList: 0,
	  StyleSheetList: 0,
	  TextTrackCueList: 0,
	  TextTrackList: 0,
	  TouchList: 0
	};

	// in old WebKit versions, `element.classList` is not an instance of global `DOMTokenList`


	var classList = documentCreateElement('span').classList;
	var DOMTokenListPrototype = classList && classList.constructor && classList.constructor.prototype;

	var domTokenListPrototype = DOMTokenListPrototype === Object.prototype ? undefined : DOMTokenListPrototype;

	var handlePrototype$1 = function (CollectionPrototype) {
	  // some Chrome versions have non-configurable methods on DOMTokenList
	  if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) try {
	    createNonEnumerableProperty(CollectionPrototype, 'forEach', arrayForEach);
	  } catch (error) {
	    CollectionPrototype.forEach = arrayForEach;
	  }
	};

	for (var COLLECTION_NAME$1 in domIterables) {
	  if (domIterables[COLLECTION_NAME$1]) {
	    handlePrototype$1(global_1[COLLECTION_NAME$1] && global_1[COLLECTION_NAME$1].prototype);
	  }
	}

	handlePrototype$1(domTokenListPrototype);

	var ITERATOR$2 = wellKnownSymbol('iterator');
	var ArrayValues = es_array_iterator.values;

	var handlePrototype = function (CollectionPrototype, COLLECTION_NAME) {
	  if (CollectionPrototype) {
	    // some Chrome versions have non-configurable methods on DOMTokenList
	    if (CollectionPrototype[ITERATOR$2] !== ArrayValues) try {
	      createNonEnumerableProperty(CollectionPrototype, ITERATOR$2, ArrayValues);
	    } catch (error) {
	      CollectionPrototype[ITERATOR$2] = ArrayValues;
	    }
	    setToStringTag(CollectionPrototype, COLLECTION_NAME, true);
	    if (domIterables[COLLECTION_NAME]) for (var METHOD_NAME in es_array_iterator) {
	      // some Chrome versions have non-configurable methods on DOMTokenList
	      if (CollectionPrototype[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
	        createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, es_array_iterator[METHOD_NAME]);
	      } catch (error) {
	        CollectionPrototype[METHOD_NAME] = es_array_iterator[METHOD_NAME];
	      }
	    }
	  }
	};

	for (var COLLECTION_NAME in domIterables) {
	  handlePrototype(global_1[COLLECTION_NAME] && global_1[COLLECTION_NAME].prototype, COLLECTION_NAME);
	}

	handlePrototype(domTokenListPrototype, 'DOMTokenList');

	var domExceptionConstants = {
	  IndexSizeError: { s: 'INDEX_SIZE_ERR', c: 1, m: 1 },
	  DOMStringSizeError: { s: 'DOMSTRING_SIZE_ERR', c: 2, m: 0 },
	  HierarchyRequestError: { s: 'HIERARCHY_REQUEST_ERR', c: 3, m: 1 },
	  WrongDocumentError: { s: 'WRONG_DOCUMENT_ERR', c: 4, m: 1 },
	  InvalidCharacterError: { s: 'INVALID_CHARACTER_ERR', c: 5, m: 1 },
	  NoDataAllowedError: { s: 'NO_DATA_ALLOWED_ERR', c: 6, m: 0 },
	  NoModificationAllowedError: { s: 'NO_MODIFICATION_ALLOWED_ERR', c: 7, m: 1 },
	  NotFoundError: { s: 'NOT_FOUND_ERR', c: 8, m: 1 },
	  NotSupportedError: { s: 'NOT_SUPPORTED_ERR', c: 9, m: 1 },
	  InUseAttributeError: { s: 'INUSE_ATTRIBUTE_ERR', c: 10, m: 1 },
	  InvalidStateError: { s: 'INVALID_STATE_ERR', c: 11, m: 1 },
	  SyntaxError: { s: 'SYNTAX_ERR', c: 12, m: 1 },
	  InvalidModificationError: { s: 'INVALID_MODIFICATION_ERR', c: 13, m: 1 },
	  NamespaceError: { s: 'NAMESPACE_ERR', c: 14, m: 1 },
	  InvalidAccessError: { s: 'INVALID_ACCESS_ERR', c: 15, m: 1 },
	  ValidationError: { s: 'VALIDATION_ERR', c: 16, m: 0 },
	  TypeMismatchError: { s: 'TYPE_MISMATCH_ERR', c: 17, m: 1 },
	  SecurityError: { s: 'SECURITY_ERR', c: 18, m: 1 },
	  NetworkError: { s: 'NETWORK_ERR', c: 19, m: 1 },
	  AbortError: { s: 'ABORT_ERR', c: 20, m: 1 },
	  URLMismatchError: { s: 'URL_MISMATCH_ERR', c: 21, m: 1 },
	  QuotaExceededError: { s: 'QUOTA_EXCEEDED_ERR', c: 22, m: 1 },
	  TimeoutError: { s: 'TIMEOUT_ERR', c: 23, m: 1 },
	  InvalidNodeTypeError: { s: 'INVALID_NODE_TYPE_ERR', c: 24, m: 1 },
	  DataCloneError: { s: 'DATA_CLONE_ERR', c: 25, m: 1 }
	};
	domExceptionConstants.IndexSizeError;
	domExceptionConstants.DOMStringSizeError;
	domExceptionConstants.HierarchyRequestError;
	domExceptionConstants.WrongDocumentError;
	domExceptionConstants.InvalidCharacterError;
	domExceptionConstants.NoDataAllowedError;
	domExceptionConstants.NoModificationAllowedError;
	domExceptionConstants.NotFoundError;
	domExceptionConstants.NotSupportedError;
	domExceptionConstants.InUseAttributeError;
	domExceptionConstants.InvalidStateError;
	domExceptionConstants.InvalidModificationError;
	domExceptionConstants.NamespaceError;
	domExceptionConstants.InvalidAccessError;
	domExceptionConstants.ValidationError;
	domExceptionConstants.TypeMismatchError;
	domExceptionConstants.SecurityError;
	domExceptionConstants.NetworkError;
	domExceptionConstants.AbortError;
	domExceptionConstants.URLMismatchError;
	domExceptionConstants.QuotaExceededError;
	domExceptionConstants.TimeoutError;
	domExceptionConstants.InvalidNodeTypeError;
	domExceptionConstants.DataCloneError;

	var defineProperty$3 = objectDefineProperty.f;













	var DOM_EXCEPTION$2 = 'DOMException';
	var DATA_CLONE_ERR = 'DATA_CLONE_ERR';
	var Error$3 = getBuiltIn('Error');
	// NodeJS < 17.0 does not expose `DOMException` to global
	var NativeDOMException$1 = getBuiltIn(DOM_EXCEPTION$2) || (function () {
	  try {
	    // NodeJS < 15.0 does not expose `MessageChannel` to global
	    var MessageChannel = getBuiltIn('MessageChannel') || tryNodeRequire('worker_threads').MessageChannel;
	    // eslint-disable-next-line es/no-weak-map, unicorn/require-post-message-target-origin -- safe
	    new MessageChannel().port1.postMessage(new WeakMap());
	  } catch (error) {
	    if (error.name === DATA_CLONE_ERR && error.code === 25) return error.constructor;
	  }
	})();
	var NativeDOMExceptionPrototype = NativeDOMException$1 && NativeDOMException$1.prototype;
	var ErrorPrototype = Error$3.prototype;
	var setInternalState$2 = internalState.set;
	var getInternalState = internalState.getterFor(DOM_EXCEPTION$2);
	var HAS_STACK = 'stack' in new Error$3(DOM_EXCEPTION$2);

	var codeFor = function (name) {
	  return hasOwnProperty_1(domExceptionConstants, name) && domExceptionConstants[name].m ? domExceptionConstants[name].c : 0;
	};

	var $DOMException$1 = function DOMException() {
	  anInstance(this, DOMExceptionPrototype$1);
	  var argumentsLength = arguments.length;
	  var message = normalizeStringArgument(argumentsLength < 1 ? undefined : arguments[0]);
	  var name = normalizeStringArgument(argumentsLength < 2 ? undefined : arguments[1], 'Error');
	  var code = codeFor(name);
	  setInternalState$2(this, {
	    type: DOM_EXCEPTION$2,
	    name: name,
	    message: message,
	    code: code
	  });
	  if (!descriptors) {
	    this.name = name;
	    this.message = message;
	    this.code = code;
	  }
	  if (HAS_STACK) {
	    var error = new Error$3(message);
	    error.name = DOM_EXCEPTION$2;
	    defineProperty$3(this, 'stack', createPropertyDescriptor(1, errorStackClear(error.stack, 1)));
	  }
	};

	var DOMExceptionPrototype$1 = $DOMException$1.prototype = objectCreate(ErrorPrototype);

	var createGetterDescriptor = function (get) {
	  return { enumerable: true, configurable: true, get: get };
	};

	var getterFor = function (key) {
	  return createGetterDescriptor(function () {
	    return getInternalState(this)[key];
	  });
	};

	if (descriptors) {
	  // `DOMException.prototype.code` getter
	  defineBuiltInAccessor(DOMExceptionPrototype$1, 'code', getterFor('code'));
	  // `DOMException.prototype.message` getter
	  defineBuiltInAccessor(DOMExceptionPrototype$1, 'message', getterFor('message'));
	  // `DOMException.prototype.name` getter
	  defineBuiltInAccessor(DOMExceptionPrototype$1, 'name', getterFor('name'));
	}

	defineProperty$3(DOMExceptionPrototype$1, 'constructor', createPropertyDescriptor(1, $DOMException$1));

	// FF36- DOMException is a function, but can't be constructed
	var INCORRECT_CONSTRUCTOR = fails(function () {
	  return !(new NativeDOMException$1() instanceof Error$3);
	});

	// Safari 10.1 / Chrome 32- / IE8- DOMException.prototype.toString bugs
	var INCORRECT_TO_STRING = INCORRECT_CONSTRUCTOR || fails(function () {
	  return ErrorPrototype.toString !== errorToString || String(new NativeDOMException$1(1, 2)) !== '2: 1';
	});

	// Deno 1.6.3- DOMException.prototype.code just missed
	var INCORRECT_CODE = INCORRECT_CONSTRUCTOR || fails(function () {
	  return new NativeDOMException$1(1, 'DataCloneError').code !== 25;
	});

	// Deno 1.6.3- DOMException constants just missed
	INCORRECT_CONSTRUCTOR
	  || NativeDOMException$1[DATA_CLONE_ERR] !== 25
	  || NativeDOMExceptionPrototype[DATA_CLONE_ERR] !== 25;

	var FORCED_CONSTRUCTOR$1 = INCORRECT_CONSTRUCTOR;

	// `DOMException` constructor
	// https://webidl.spec.whatwg.org/#idl-DOMException
	_export({ global: true, constructor: true, forced: FORCED_CONSTRUCTOR$1 }, {
	  DOMException: FORCED_CONSTRUCTOR$1 ? $DOMException$1 : NativeDOMException$1
	});

	var PolyfilledDOMException$1 = getBuiltIn(DOM_EXCEPTION$2);
	var PolyfilledDOMExceptionPrototype$1 = PolyfilledDOMException$1.prototype;

	if (INCORRECT_TO_STRING && (NativeDOMException$1 === PolyfilledDOMException$1)) {
	  defineBuiltIn(PolyfilledDOMExceptionPrototype$1, 'toString', errorToString);
	}

	if (INCORRECT_CODE && descriptors && NativeDOMException$1 === PolyfilledDOMException$1) {
	  defineBuiltInAccessor(PolyfilledDOMExceptionPrototype$1, 'code', createGetterDescriptor(function () {
	    return codeFor(anObject(this).name);
	  }));
	}

	// `DOMException` constants
	for (var key$1 in domExceptionConstants) if (hasOwnProperty_1(domExceptionConstants, key$1)) {
	  var constant$2 = domExceptionConstants[key$1];
	  var constantName$1 = constant$2.s;
	  var descriptor$2 = createPropertyDescriptor(6, constant$2.c);
	  if (!hasOwnProperty_1(PolyfilledDOMException$1, constantName$1)) {
	    defineProperty$3(PolyfilledDOMException$1, constantName$1, descriptor$2);
	  }
	  if (!hasOwnProperty_1(PolyfilledDOMExceptionPrototype$1, constantName$1)) {
	    defineProperty$3(PolyfilledDOMExceptionPrototype$1, constantName$1, descriptor$2);
	  }
	}

	var defineProperty$2 = objectDefineProperty.f;









	var DOM_EXCEPTION$1 = 'DOMException';
	var Error$2 = getBuiltIn('Error');
	var NativeDOMException = getBuiltIn(DOM_EXCEPTION$1);

	var $DOMException = function DOMException() {
	  anInstance(this, DOMExceptionPrototype);
	  var argumentsLength = arguments.length;
	  var message = normalizeStringArgument(argumentsLength < 1 ? undefined : arguments[0]);
	  var name = normalizeStringArgument(argumentsLength < 2 ? undefined : arguments[1], 'Error');
	  var that = new NativeDOMException(message, name);
	  var error = new Error$2(message);
	  error.name = DOM_EXCEPTION$1;
	  defineProperty$2(that, 'stack', createPropertyDescriptor(1, errorStackClear(error.stack, 1)));
	  inheritIfRequired(that, this, $DOMException);
	  return that;
	};

	var DOMExceptionPrototype = $DOMException.prototype = NativeDOMException.prototype;

	var ERROR_HAS_STACK = 'stack' in new Error$2(DOM_EXCEPTION$1);
	var DOM_EXCEPTION_HAS_STACK = 'stack' in new NativeDOMException(1, 2);

	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var descriptor$1 = NativeDOMException && descriptors && Object.getOwnPropertyDescriptor(global_1, DOM_EXCEPTION$1);

	// Bun ~ 0.1.1 DOMException have incorrect descriptor and we can't redefine it
	// https://github.com/Jarred-Sumner/bun/issues/399
	var BUGGY_DESCRIPTOR = !!descriptor$1 && !(descriptor$1.writable && descriptor$1.configurable);

	var FORCED_CONSTRUCTOR = ERROR_HAS_STACK && !BUGGY_DESCRIPTOR && !DOM_EXCEPTION_HAS_STACK;

	// `DOMException` constructor patch for `.stack` where it's required
	// https://webidl.spec.whatwg.org/#es-DOMException-specialness
	_export({ global: true, constructor: true, forced: FORCED_CONSTRUCTOR }, { // TODO: fix export logic
	  DOMException: FORCED_CONSTRUCTOR ? $DOMException : NativeDOMException
	});

	var PolyfilledDOMException = getBuiltIn(DOM_EXCEPTION$1);
	var PolyfilledDOMExceptionPrototype = PolyfilledDOMException.prototype;

	if (PolyfilledDOMExceptionPrototype.constructor !== PolyfilledDOMException) {
	  {
	    defineProperty$2(PolyfilledDOMExceptionPrototype, 'constructor', createPropertyDescriptor(1, PolyfilledDOMException));
	  }

	  for (var key in domExceptionConstants) if (hasOwnProperty_1(domExceptionConstants, key)) {
	    var constant$1 = domExceptionConstants[key];
	    var constantName = constant$1.s;
	    if (!hasOwnProperty_1(PolyfilledDOMException, constantName)) {
	      defineProperty$2(PolyfilledDOMException, constantName, createPropertyDescriptor(6, constant$1.c));
	    }
	  }
	}

	var DOM_EXCEPTION = 'DOMException';

	// `DOMException.prototype[@@toStringTag]` property
	setToStringTag(getBuiltIn(DOM_EXCEPTION), DOM_EXCEPTION);

	var clearImmediate = task$1.clear;

	// `clearImmediate` method
	// http://w3c.github.io/setImmediate/#si-clearImmediate
	_export({ global: true, bind: true, enumerable: true, forced: global_1.clearImmediate !== clearImmediate }, {
	  clearImmediate: clearImmediate
	});

	/* global Bun -- Bun case */
	var engineIsBun = typeof Bun == 'function' && Bun && typeof Bun.version == 'string';

	var Function$1 = global_1.Function;
	// dirty IE9- and Bun 0.3.0- checks
	var WRAP = /MSIE .\./.test(engineUserAgent) || engineIsBun && (function () {
	  var version = global_1.Bun.version.split('.');
	  return version.length < 3 || version[0] === '0' && (version[1] < 3 || version[1] === '3' && version[2] === '0');
	})();

	// IE9- / Bun 0.3.0- setTimeout / setInterval / setImmediate additional parameters fix
	// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers
	// https://github.com/oven-sh/bun/issues/1633
	var schedulersFix = function (scheduler, hasTimeArg) {
	  var firstParamIndex = hasTimeArg ? 2 : 1;
	  return WRAP ? function (handler, timeout /* , ...arguments */) {
	    var boundArgs = validateArgumentsLength(arguments.length, 1) > firstParamIndex;
	    var fn = isCallable(handler) ? handler : Function$1(handler);
	    var params = boundArgs ? arraySlice(arguments, firstParamIndex) : [];
	    var callback = boundArgs ? function () {
	      functionApply(fn, this, params);
	    } : fn;
	    return hasTimeArg ? scheduler(callback, timeout) : scheduler(callback);
	  } : scheduler;
	};

	var setTask = task$1.set;


	// https://github.com/oven-sh/bun/issues/1633
	var setImmediate = global_1.setImmediate ? schedulersFix(setTask, false) : setTask;

	// `setImmediate` method
	// http://w3c.github.io/setImmediate/#si-setImmediate
	_export({ global: true, bind: true, enumerable: true, forced: global_1.setImmediate !== setImmediate }, {
	  setImmediate: setImmediate
	});

	// `queueMicrotask` method
	// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask
	_export({ global: true, enumerable: true, dontCallGetSet: true }, {
	  queueMicrotask: function queueMicrotask(fn) {
	    validateArgumentsLength(arguments.length, 1);
	    microtask_1(aCallable(fn));
	  }
	});

	var $TypeError = TypeError;
	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var defineProperty$1 = Object.defineProperty;
	var INCORRECT_VALUE = global_1.self !== global_1;

	// `self` getter
	// https://html.spec.whatwg.org/multipage/window-object.html#dom-self
	try {
	  if (descriptors) {
	    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	    var descriptor = Object.getOwnPropertyDescriptor(global_1, 'self');
	    // some engines have `self`, but with incorrect descriptor
	    // https://github.com/denoland/deno/issues/15765
	    if (INCORRECT_VALUE || !descriptor || !descriptor.get || !descriptor.enumerable) {
	      defineBuiltInAccessor(global_1, 'self', {
	        get: function self() {
	          return global_1;
	        },
	        set: function self(value) {
	          if (this !== global_1) throw new $TypeError('Illegal invocation');
	          defineProperty$1(global_1, 'self', {
	            value: value,
	            writable: true,
	            configurable: true,
	            enumerable: true
	          });
	        },
	        configurable: true,
	        enumerable: true
	      });
	    }
	  } else _export({ global: true, simple: true, forced: INCORRECT_VALUE }, {
	    self: global_1
	  });
	} catch (error) { /* empty */ }

	var Object$1 = global_1.Object;
	var Array$1 = global_1.Array;
	var Date$1 = global_1.Date;
	var Error$1 = global_1.Error;
	var TypeError$3 = global_1.TypeError;
	var PerformanceMark = global_1.PerformanceMark;
	var DOMException$1 = getBuiltIn('DOMException');
	var Map$2 = mapHelpers.Map;
	var mapHas = mapHelpers.has;
	var mapGet = mapHelpers.get;
	var mapSet = mapHelpers.set;
	var Set$2 = setHelpers.Set;
	var setAdd = setHelpers.add;
	var setHas = setHelpers.has;
	var objectKeys = getBuiltIn('Object', 'keys');
	var push$4 = functionUncurryThis([].push);
	var thisBooleanValue = functionUncurryThis(true.valueOf);
	var thisNumberValue = functionUncurryThis(1.0.valueOf);
	var thisStringValue = functionUncurryThis(''.valueOf);
	var thisTimeValue = functionUncurryThis(Date$1.prototype.getTime);
	var PERFORMANCE_MARK = uid('structuredClone');
	var DATA_CLONE_ERROR = 'DataCloneError';
	var TRANSFERRING = 'Transferring';

	var checkBasicSemantic = function (structuredCloneImplementation) {
	  return !fails(function () {
	    var set1 = new global_1.Set([7]);
	    var set2 = structuredCloneImplementation(set1);
	    var number = structuredCloneImplementation(Object$1(7));
	    return set2 === set1 || !set2.has(7) || !isObject$1(number) || +number !== 7;
	  }) && structuredCloneImplementation;
	};

	var checkErrorsCloning = function (structuredCloneImplementation, $Error) {
	  return !fails(function () {
	    var error = new $Error();
	    var test = structuredCloneImplementation({ a: error, b: error });
	    return !(test && test.a === test.b && test.a instanceof $Error && test.a.stack === error.stack);
	  });
	};

	// https://github.com/whatwg/html/pull/5749
	var checkNewErrorsCloningSemantic = function (structuredCloneImplementation) {
	  return !fails(function () {
	    var test = structuredCloneImplementation(new global_1.AggregateError([1], PERFORMANCE_MARK, { cause: 3 }));
	    return test.name !== 'AggregateError' || test.errors[0] !== 1 || test.message !== PERFORMANCE_MARK || test.cause !== 3;
	  });
	};

	// FF94+, Safari 15.4+, Chrome 98+, NodeJS 17.0+, Deno 1.13+
	// FF<103 and Safari implementations can't clone errors
	// https://bugzilla.mozilla.org/show_bug.cgi?id=1556604
	// FF103 can clone errors, but `.stack` of clone is an empty string
	// https://bugzilla.mozilla.org/show_bug.cgi?id=1778762
	// FF104+ fixed it on usual errors, but not on DOMExceptions
	// https://bugzilla.mozilla.org/show_bug.cgi?id=1777321
	// Chrome <102 returns `null` if cloned object contains multiple references to one error
	// https://bugs.chromium.org/p/v8/issues/detail?id=12542
	// NodeJS implementation can't clone DOMExceptions
	// https://github.com/nodejs/node/issues/41038
	// only FF103+ supports new (html/5749) error cloning semantic
	var nativeStructuredClone = global_1.structuredClone;

	var FORCED_REPLACEMENT = !checkErrorsCloning(nativeStructuredClone, Error$1)
	  || !checkErrorsCloning(nativeStructuredClone, DOMException$1)
	  || !checkNewErrorsCloningSemantic(nativeStructuredClone);

	// Chrome 82+, Safari 14.1+, Deno 1.11+
	// Chrome 78-81 implementation swaps `.name` and `.message` of cloned `DOMException`
	// Chrome returns `null` if cloned object contains multiple references to one error
	// Safari 14.1 implementation doesn't clone some `RegExp` flags, so requires a workaround
	// Safari implementation can't clone errors
	// Deno 1.2-1.10 implementations too naive
	// NodeJS 16.0+ does not have `PerformanceMark` constructor
	// NodeJS <17.2 structured cloning implementation from `performance.mark` is too naive
	// and can't clone, for example, `RegExp` or some boxed primitives
	// https://github.com/nodejs/node/issues/40840
	// no one of those implementations supports new (html/5749) error cloning semantic
	var structuredCloneFromMark = !nativeStructuredClone && checkBasicSemantic(function (value) {
	  return new PerformanceMark(PERFORMANCE_MARK, { detail: value }).detail;
	});

	var nativeRestrictedStructuredClone = checkBasicSemantic(nativeStructuredClone) || structuredCloneFromMark;

	var throwUncloneable = function (type) {
	  throw new DOMException$1('Uncloneable type: ' + type, DATA_CLONE_ERROR);
	};

	var throwUnpolyfillable = function (type, action) {
	  throw new DOMException$1((action || 'Cloning') + ' of ' + type + ' cannot be properly polyfilled in this engine', DATA_CLONE_ERROR);
	};

	var tryNativeRestrictedStructuredClone = function (value, type) {
	  if (!nativeRestrictedStructuredClone) throwUnpolyfillable(type);
	  return nativeRestrictedStructuredClone(value);
	};

	var createDataTransfer = function () {
	  var dataTransfer;
	  try {
	    dataTransfer = new global_1.DataTransfer();
	  } catch (error) {
	    try {
	      dataTransfer = new global_1.ClipboardEvent('').clipboardData;
	    } catch (error2) { /* empty */ }
	  }
	  return dataTransfer && dataTransfer.items && dataTransfer.files ? dataTransfer : null;
	};

	var cloneBuffer = function (value, map, $type) {
	  if (mapHas(map, value)) return mapGet(map, value);

	  var type = $type || classof(value);
	  var clone, length, options, source, target, i;

	  if (type === 'SharedArrayBuffer') {
	    if (nativeRestrictedStructuredClone) clone = nativeRestrictedStructuredClone(value);
	    // SharedArrayBuffer should use shared memory, we can't polyfill it, so return the original
	    else clone = value;
	  } else {
	    var DataView = global_1.DataView;

	    // `ArrayBuffer#slice` is not available in IE10
	    // `ArrayBuffer#slice` and `DataView` are not available in old FF
	    if (!DataView && !isCallable(value.slice)) throwUnpolyfillable('ArrayBuffer');
	    // detached buffers throws in `DataView` and `.slice`
	    try {
	      if (isCallable(value.slice) && !value.resizable) {
	        clone = value.slice(0);
	      } else {
	        length = value.byteLength;
	        options = 'maxByteLength' in value ? { maxByteLength: value.maxByteLength } : undefined;
	        // eslint-disable-next-line es/no-resizable-and-growable-arraybuffers -- safe
	        clone = new ArrayBuffer(length, options);
	        source = new DataView(value);
	        target = new DataView(clone);
	        for (i = 0; i < length; i++) {
	          target.setUint8(i, source.getUint8(i));
	        }
	      }
	    } catch (error) {
	      throw new DOMException$1('ArrayBuffer is detached', DATA_CLONE_ERROR);
	    }
	  }

	  mapSet(map, value, clone);

	  return clone;
	};

	var cloneView = function (value, type, offset, length, map) {
	  var C = global_1[type];
	  // in some old engines like Safari 9, typeof C is 'object'
	  // on Uint8ClampedArray or some other constructors
	  if (!isObject$1(C)) throwUnpolyfillable(type);
	  return new C(cloneBuffer(value.buffer, map), offset, length);
	};

	var structuredCloneInternal = function (value, map) {
	  if (isSymbol$1(value)) throwUncloneable('Symbol');
	  if (!isObject$1(value)) return value;
	  // effectively preserves circular references
	  if (map) {
	    if (mapHas(map, value)) return mapGet(map, value);
	  } else map = new Map$2();

	  var type = classof(value);
	  var C, name, cloned, dataTransfer, i, length, keys, key;

	  switch (type) {
	    case 'Array':
	      cloned = Array$1(lengthOfArrayLike(value));
	      break;
	    case 'Object':
	      cloned = {};
	      break;
	    case 'Map':
	      cloned = new Map$2();
	      break;
	    case 'Set':
	      cloned = new Set$2();
	      break;
	    case 'RegExp':
	      // in this block because of a Safari 14.1 bug
	      // old FF does not clone regexes passed to the constructor, so get the source and flags directly
	      cloned = new RegExp(value.source, regexpGetFlags(value));
	      break;
	    case 'Error':
	      name = value.name;
	      switch (name) {
	        case 'AggregateError':
	          cloned = new (getBuiltIn(name))([]);
	          break;
	        case 'EvalError':
	        case 'RangeError':
	        case 'ReferenceError':
	        case 'SuppressedError':
	        case 'SyntaxError':
	        case 'TypeError':
	        case 'URIError':
	          cloned = new (getBuiltIn(name))();
	          break;
	        case 'CompileError':
	        case 'LinkError':
	        case 'RuntimeError':
	          cloned = new (getBuiltIn('WebAssembly', name))();
	          break;
	        default:
	          cloned = new Error$1();
	      }
	      break;
	    case 'DOMException':
	      cloned = new DOMException$1(value.message, value.name);
	      break;
	    case 'ArrayBuffer':
	    case 'SharedArrayBuffer':
	      cloned = cloneBuffer(value, map, type);
	      break;
	    case 'DataView':
	    case 'Int8Array':
	    case 'Uint8Array':
	    case 'Uint8ClampedArray':
	    case 'Int16Array':
	    case 'Uint16Array':
	    case 'Int32Array':
	    case 'Uint32Array':
	    case 'Float16Array':
	    case 'Float32Array':
	    case 'Float64Array':
	    case 'BigInt64Array':
	    case 'BigUint64Array':
	      length = type === 'DataView' ? value.byteLength : value.length;
	      cloned = cloneView(value, type, value.byteOffset, length, map);
	      break;
	    case 'DOMQuad':
	      try {
	        cloned = new DOMQuad(
	          structuredCloneInternal(value.p1, map),
	          structuredCloneInternal(value.p2, map),
	          structuredCloneInternal(value.p3, map),
	          structuredCloneInternal(value.p4, map)
	        );
	      } catch (error) {
	        cloned = tryNativeRestrictedStructuredClone(value, type);
	      }
	      break;
	    case 'File':
	      if (nativeRestrictedStructuredClone) try {
	        cloned = nativeRestrictedStructuredClone(value);
	        // NodeJS 20.0.0 bug, https://github.com/nodejs/node/issues/47612
	        if (classof(cloned) !== type) cloned = undefined;
	      } catch (error) { /* empty */ }
	      if (!cloned) try {
	        cloned = new File([value], value.name, value);
	      } catch (error) { /* empty */ }
	      if (!cloned) throwUnpolyfillable(type);
	      break;
	    case 'FileList':
	      dataTransfer = createDataTransfer();
	      if (dataTransfer) {
	        for (i = 0, length = lengthOfArrayLike(value); i < length; i++) {
	          dataTransfer.items.add(structuredCloneInternal(value[i], map));
	        }
	        cloned = dataTransfer.files;
	      } else cloned = tryNativeRestrictedStructuredClone(value, type);
	      break;
	    case 'ImageData':
	      // Safari 9 ImageData is a constructor, but typeof ImageData is 'object'
	      try {
	        cloned = new ImageData(
	          structuredCloneInternal(value.data, map),
	          value.width,
	          value.height,
	          { colorSpace: value.colorSpace }
	        );
	      } catch (error) {
	        cloned = tryNativeRestrictedStructuredClone(value, type);
	      } break;
	    default:
	      if (nativeRestrictedStructuredClone) {
	        cloned = nativeRestrictedStructuredClone(value);
	      } else switch (type) {
	        case 'BigInt':
	          // can be a 3rd party polyfill
	          cloned = Object$1(value.valueOf());
	          break;
	        case 'Boolean':
	          cloned = Object$1(thisBooleanValue(value));
	          break;
	        case 'Number':
	          cloned = Object$1(thisNumberValue(value));
	          break;
	        case 'String':
	          cloned = Object$1(thisStringValue(value));
	          break;
	        case 'Date':
	          cloned = new Date$1(thisTimeValue(value));
	          break;
	        case 'Blob':
	          try {
	            cloned = value.slice(0, value.size, value.type);
	          } catch (error) {
	            throwUnpolyfillable(type);
	          } break;
	        case 'DOMPoint':
	        case 'DOMPointReadOnly':
	          C = global_1[type];
	          try {
	            cloned = C.fromPoint
	              ? C.fromPoint(value)
	              : new C(value.x, value.y, value.z, value.w);
	          } catch (error) {
	            throwUnpolyfillable(type);
	          } break;
	        case 'DOMRect':
	        case 'DOMRectReadOnly':
	          C = global_1[type];
	          try {
	            cloned = C.fromRect
	              ? C.fromRect(value)
	              : new C(value.x, value.y, value.width, value.height);
	          } catch (error) {
	            throwUnpolyfillable(type);
	          } break;
	        case 'DOMMatrix':
	        case 'DOMMatrixReadOnly':
	          C = global_1[type];
	          try {
	            cloned = C.fromMatrix
	              ? C.fromMatrix(value)
	              : new C(value);
	          } catch (error) {
	            throwUnpolyfillable(type);
	          } break;
	        case 'AudioData':
	        case 'VideoFrame':
	          if (!isCallable(value.clone)) throwUnpolyfillable(type);
	          try {
	            cloned = value.clone();
	          } catch (error) {
	            throwUncloneable(type);
	          } break;
	        case 'CropTarget':
	        case 'CryptoKey':
	        case 'FileSystemDirectoryHandle':
	        case 'FileSystemFileHandle':
	        case 'FileSystemHandle':
	        case 'GPUCompilationInfo':
	        case 'GPUCompilationMessage':
	        case 'ImageBitmap':
	        case 'RTCCertificate':
	        case 'WebAssembly.Module':
	          throwUnpolyfillable(type);
	          // break omitted
	        default:
	          throwUncloneable(type);
	      }
	  }

	  mapSet(map, value, cloned);

	  switch (type) {
	    case 'Array':
	    case 'Object':
	      keys = objectKeys(value);
	      for (i = 0, length = lengthOfArrayLike(keys); i < length; i++) {
	        key = keys[i];
	        createProperty(cloned, key, structuredCloneInternal(value[key], map));
	      } break;
	    case 'Map':
	      value.forEach(function (v, k) {
	        mapSet(cloned, structuredCloneInternal(k, map), structuredCloneInternal(v, map));
	      });
	      break;
	    case 'Set':
	      value.forEach(function (v) {
	        setAdd(cloned, structuredCloneInternal(v, map));
	      });
	      break;
	    case 'Error':
	      createNonEnumerableProperty(cloned, 'message', structuredCloneInternal(value.message, map));
	      if (hasOwnProperty_1(value, 'cause')) {
	        createNonEnumerableProperty(cloned, 'cause', structuredCloneInternal(value.cause, map));
	      }
	      if (name === 'AggregateError') {
	        cloned.errors = structuredCloneInternal(value.errors, map);
	      } else if (name === 'SuppressedError') {
	        cloned.error = structuredCloneInternal(value.error, map);
	        cloned.suppressed = structuredCloneInternal(value.suppressed, map);
	      } // break omitted
	    case 'DOMException':
	      if (errorStackInstallable) {
	        createNonEnumerableProperty(cloned, 'stack', structuredCloneInternal(value.stack, map));
	      }
	  }

	  return cloned;
	};

	var tryToTransfer = function (rawTransfer, map) {
	  if (!isObject$1(rawTransfer)) throw new TypeError$3('Transfer option cannot be converted to a sequence');

	  var transfer = [];

	  iterate(rawTransfer, function (value) {
	    push$4(transfer, anObject(value));
	  });

	  var i = 0;
	  var length = lengthOfArrayLike(transfer);
	  var buffers = new Set$2();
	  var value, type, C, transferred, canvas, context;

	  while (i < length) {
	    value = transfer[i++];

	    type = classof(value);

	    if (type === 'ArrayBuffer' ? setHas(buffers, value) : mapHas(map, value)) {
	      throw new DOMException$1('Duplicate transferable', DATA_CLONE_ERROR);
	    }

	    if (type === 'ArrayBuffer') {
	      setAdd(buffers, value);
	      continue;
	    }

	    if (structuredCloneProperTransfer) {
	      transferred = nativeStructuredClone(value, { transfer: [value] });
	    } else switch (type) {
	      case 'ImageBitmap':
	        C = global_1.OffscreenCanvas;
	        if (!isConstructor(C)) throwUnpolyfillable(type, TRANSFERRING);
	        try {
	          canvas = new C(value.width, value.height);
	          context = canvas.getContext('bitmaprenderer');
	          context.transferFromImageBitmap(value);
	          transferred = canvas.transferToImageBitmap();
	        } catch (error) { /* empty */ }
	        break;
	      case 'AudioData':
	      case 'VideoFrame':
	        if (!isCallable(value.clone) || !isCallable(value.close)) throwUnpolyfillable(type, TRANSFERRING);
	        try {
	          transferred = value.clone();
	          value.close();
	        } catch (error) { /* empty */ }
	        break;
	      case 'MediaSourceHandle':
	      case 'MessagePort':
	      case 'OffscreenCanvas':
	      case 'ReadableStream':
	      case 'TransformStream':
	      case 'WritableStream':
	        throwUnpolyfillable(type, TRANSFERRING);
	    }

	    if (transferred === undefined) throw new DOMException$1('This object cannot be transferred: ' + type, DATA_CLONE_ERROR);

	    mapSet(map, value, transferred);
	  }

	  return buffers;
	};

	var detachBuffers = function (buffers) {
	  setIterate(buffers, function (buffer) {
	    if (structuredCloneProperTransfer) {
	      nativeRestrictedStructuredClone(buffer, { transfer: [buffer] });
	    } else if (isCallable(buffer.transfer)) {
	      buffer.transfer();
	    } else if (detachTransferable) {
	      detachTransferable(buffer);
	    } else {
	      throwUnpolyfillable('ArrayBuffer', TRANSFERRING);
	    }
	  });
	};

	// `structuredClone` method
	// https://html.spec.whatwg.org/multipage/structured-data.html#dom-structuredclone
	_export({ global: true, enumerable: true, sham: !structuredCloneProperTransfer, forced: FORCED_REPLACEMENT }, {
	  structuredClone: function structuredClone(value /* , { transfer } */) {
	    var options = validateArgumentsLength(arguments.length, 1) > 1 && !isNullOrUndefined(arguments[1]) ? anObject(arguments[1]) : undefined;
	    var transfer = options ? options.transfer : undefined;
	    var map, buffers;

	    if (transfer !== undefined) {
	      map = new Map$2();
	      buffers = tryToTransfer(transfer, map);
	    }

	    var clone = structuredCloneInternal(value, map);

	    // since of an issue with cloning views of transferred buffers, we a forced to detach them later
	    // https://github.com/zloirock/core-js/issues/1265
	    if (buffers) detachBuffers(buffers);

	    return clone;
	  }
	});

	var setInterval$1 = schedulersFix(global_1.setInterval, true);

	// Bun / IE9- setInterval additional parameters fix
	// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-setinterval
	_export({ global: true, bind: true, forced: global_1.setInterval !== setInterval$1 }, {
	  setInterval: setInterval$1
	});

	var setTimeout$1 = schedulersFix(global_1.setTimeout, true);

	// Bun / IE9- setTimeout additional parameters fix
	// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-settimeout
	_export({ global: true, bind: true, forced: global_1.setTimeout !== setTimeout$1 }, {
	  setTimeout: setTimeout$1
	});

	var ITERATOR$1 = wellKnownSymbol('iterator');

	var urlConstructorDetection = !fails(function () {
	  // eslint-disable-next-line unicorn/relative-url-style -- required for testing
	  var url = new URL('b?a=1&b=2&c=3', 'http://a');
	  var params = url.searchParams;
	  var params2 = new URLSearchParams('a=1&a=2&b=3');
	  var result = '';
	  url.pathname = 'c%20d';
	  params.forEach(function (value, key) {
	    params['delete']('b');
	    result += key + value;
	  });
	  params2['delete']('a', 2);
	  // `undefined` case is a Chromium 117 bug
	  // https://bugs.chromium.org/p/v8/issues/detail?id=14222
	  params2['delete']('b', undefined);
	  return (isPure && (!url.toJSON || !params2.has('a', 1) || params2.has('a', 2) || !params2.has('a', undefined) || params2.has('b')))
	    || (!params.size && (isPure || !descriptors))
	    || !params.sort
	    || url.href !== 'http://a/c%20d?a=1&c=3'
	    || params.get('c') !== '3'
	    || String(new URLSearchParams('?a=1')) !== 'a=1'
	    || !params[ITERATOR$1]
	    // throws in Edge
	    || new URL('https://a@b').username !== 'a'
	    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
	    // not punycoded in Edge
	    || new URL('http://тест').host !== 'xn--e1aybc'
	    // not escaped in Chrome 62-
	    || new URL('http://a#б').hash !== '#%D0%B1'
	    // fails in Chrome 66-
	    || result !== 'a1c3'
	    // throws in Safari
	    || new URL('http://x', undefined).host !== 'x';
	});

	// based on https://github.com/bestiejs/punycode.js/blob/master/punycode.js


	var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1
	var base = 36;
	var tMin = 1;
	var tMax = 26;
	var skew = 38;
	var damp = 700;
	var initialBias = 72;
	var initialN = 128; // 0x80
	var delimiter = '-'; // '\x2D'
	var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars
	var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators
	var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
	var baseMinusTMin = base - tMin;

	var $RangeError = RangeError;
	var exec$1 = functionUncurryThis(regexSeparators.exec);
	var floor$1 = Math.floor;
	var fromCharCode = String.fromCharCode;
	var charCodeAt = functionUncurryThis(''.charCodeAt);
	var join$2 = functionUncurryThis([].join);
	var push$3 = functionUncurryThis([].push);
	var replace$2 = functionUncurryThis(''.replace);
	var split$2 = functionUncurryThis(''.split);
	var toLowerCase$1 = functionUncurryThis(''.toLowerCase);

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 */
	var ucs2decode = function (string) {
	  var output = [];
	  var counter = 0;
	  var length = string.length;
	  while (counter < length) {
	    var value = charCodeAt(string, counter++);
	    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
	      // It's a high surrogate, and there is a next character.
	      var extra = charCodeAt(string, counter++);
	      if ((extra & 0xFC00) === 0xDC00) { // Low surrogate.
	        push$3(output, ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
	      } else {
	        // It's an unmatched surrogate; only append this code unit, in case the
	        // next code unit is the high surrogate of a surrogate pair.
	        push$3(output, value);
	        counter--;
	      }
	    } else {
	      push$3(output, value);
	    }
	  }
	  return output;
	};

	/**
	 * Converts a digit/integer into a basic code point.
	 */
	var digitToBasic = function (digit) {
	  //  0..25 map to ASCII a..z or A..Z
	  // 26..35 map to ASCII 0..9
	  return digit + 22 + 75 * (digit < 26);
	};

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 */
	var adapt = function (delta, numPoints, firstTime) {
	  var k = 0;
	  delta = firstTime ? floor$1(delta / damp) : delta >> 1;
	  delta += floor$1(delta / numPoints);
	  while (delta > baseMinusTMin * tMax >> 1) {
	    delta = floor$1(delta / baseMinusTMin);
	    k += base;
	  }
	  return floor$1(k + (baseMinusTMin + 1) * delta / (delta + skew));
	};

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 */
	var encode = function (input) {
	  var output = [];

	  // Convert the input in UCS-2 to an array of Unicode code points.
	  input = ucs2decode(input);

	  // Cache the length.
	  var inputLength = input.length;

	  // Initialize the state.
	  var n = initialN;
	  var delta = 0;
	  var bias = initialBias;
	  var i, currentValue;

	  // Handle the basic code points.
	  for (i = 0; i < input.length; i++) {
	    currentValue = input[i];
	    if (currentValue < 0x80) {
	      push$3(output, fromCharCode(currentValue));
	    }
	  }

	  var basicLength = output.length; // number of basic code points.
	  var handledCPCount = basicLength; // number of code points that have been handled;

	  // Finish the basic string with a delimiter unless it's empty.
	  if (basicLength) {
	    push$3(output, delimiter);
	  }

	  // Main encoding loop:
	  while (handledCPCount < inputLength) {
	    // All non-basic code points < n have been handled already. Find the next larger one:
	    var m = maxInt;
	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];
	      if (currentValue >= n && currentValue < m) {
	        m = currentValue;
	      }
	    }

	    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.
	    var handledCPCountPlusOne = handledCPCount + 1;
	    if (m - n > floor$1((maxInt - delta) / handledCPCountPlusOne)) {
	      throw new $RangeError(OVERFLOW_ERROR);
	    }

	    delta += (m - n) * handledCPCountPlusOne;
	    n = m;

	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];
	      if (currentValue < n && ++delta > maxInt) {
	        throw new $RangeError(OVERFLOW_ERROR);
	      }
	      if (currentValue === n) {
	        // Represent delta as a generalized variable-length integer.
	        var q = delta;
	        var k = base;
	        while (true) {
	          var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
	          if (q < t) break;
	          var qMinusT = q - t;
	          var baseMinusT = base - t;
	          push$3(output, fromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
	          q = floor$1(qMinusT / baseMinusT);
	          k += base;
	        }

	        push$3(output, fromCharCode(digitToBasic(q)));
	        bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
	        delta = 0;
	        handledCPCount++;
	      }
	    }

	    delta++;
	    n++;
	  }
	  return join$2(output, '');
	};

	var stringPunycodeToAscii = function (input) {
	  var encoded = [];
	  var labels = split$2(replace$2(toLowerCase$1(input), regexSeparators, '\u002E'), '.');
	  var i, label;
	  for (i = 0; i < labels.length; i++) {
	    label = labels[i];
	    push$3(encoded, exec$1(regexNonASCII, label) ? 'xn--' + encode(label) : label);
	  }
	  return join$2(encoded, '.');
	};

	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`































	var ITERATOR = wellKnownSymbol('iterator');
	var URL_SEARCH_PARAMS = 'URLSearchParams';
	var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
	var setInternalState$1 = internalState.set;
	var getInternalParamsState = internalState.getterFor(URL_SEARCH_PARAMS);
	var getInternalIteratorState = internalState.getterFor(URL_SEARCH_PARAMS_ITERATOR);

	var nativeFetch = safeGetBuiltIn('fetch');
	var NativeRequest = safeGetBuiltIn('Request');
	var Headers$1 = safeGetBuiltIn('Headers');
	var RequestPrototype = NativeRequest && NativeRequest.prototype;
	var HeadersPrototype = Headers$1 && Headers$1.prototype;
	var RegExp$1 = global_1.RegExp;
	var TypeError$2 = global_1.TypeError;
	var decodeURIComponent$1 = global_1.decodeURIComponent;
	var encodeURIComponent$1 = global_1.encodeURIComponent;
	var charAt$1 = functionUncurryThis(''.charAt);
	var join$1 = functionUncurryThis([].join);
	var push$2 = functionUncurryThis([].push);
	var replace$1 = functionUncurryThis(''.replace);
	var shift$1 = functionUncurryThis([].shift);
	var splice$2 = functionUncurryThis([].splice);
	var split$1 = functionUncurryThis(''.split);
	var stringSlice$1 = functionUncurryThis(''.slice);

	var plus = /\+/g;
	var sequences = Array(4);

	var percentSequence = function (bytes) {
	  return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp$1('((?:%[\\da-f]{2}){' + bytes + '})', 'gi'));
	};

	var percentDecode = function (sequence) {
	  try {
	    return decodeURIComponent$1(sequence);
	  } catch (error) {
	    return sequence;
	  }
	};

	var deserialize = function (it) {
	  var result = replace$1(it, plus, ' ');
	  var bytes = 4;
	  try {
	    return decodeURIComponent$1(result);
	  } catch (error) {
	    while (bytes) {
	      result = replace$1(result, percentSequence(bytes--), percentDecode);
	    }
	    return result;
	  }
	};

	var find = /[!'()~]|%20/g;

	var replacements = {
	  '!': '%21',
	  "'": '%27',
	  '(': '%28',
	  ')': '%29',
	  '~': '%7E',
	  '%20': '+'
	};

	var replacer = function (match) {
	  return replacements[match];
	};

	var serialize = function (it) {
	  return replace$1(encodeURIComponent$1(it), find, replacer);
	};

	var URLSearchParamsIterator = iteratorCreateConstructor(function Iterator(params, kind) {
	  setInternalState$1(this, {
	    type: URL_SEARCH_PARAMS_ITERATOR,
	    target: getInternalParamsState(params).entries,
	    index: 0,
	    kind: kind
	  });
	}, URL_SEARCH_PARAMS, function next() {
	  var state = getInternalIteratorState(this);
	  var target = state.target;
	  var index = state.index++;
	  if (!target || index >= target.length) {
	    state.target = undefined;
	    return createIterResultObject(undefined, true);
	  }
	  var entry = target[index];
	  switch (state.kind) {
	    case 'keys': return createIterResultObject(entry.key, false);
	    case 'values': return createIterResultObject(entry.value, false);
	  } return createIterResultObject([entry.key, entry.value], false);
	}, true);

	var URLSearchParamsState = function (init) {
	  this.entries = [];
	  this.url = null;

	  if (init !== undefined) {
	    if (isObject$1(init)) this.parseObject(init);
	    else this.parseQuery(typeof init == 'string' ? charAt$1(init, 0) === '?' ? stringSlice$1(init, 1) : init : toString_1$1(init));
	  }
	};

	URLSearchParamsState.prototype = {
	  type: URL_SEARCH_PARAMS,
	  bindURL: function (url) {
	    this.url = url;
	    this.update();
	  },
	  parseObject: function (object) {
	    var entries = this.entries;
	    var iteratorMethod = getIteratorMethod(object);
	    var iterator, next, step, entryIterator, entryNext, first, second;

	    if (iteratorMethod) {
	      iterator = getIterator(object, iteratorMethod);
	      next = iterator.next;
	      while (!(step = functionCall(next, iterator)).done) {
	        entryIterator = getIterator(anObject(step.value));
	        entryNext = entryIterator.next;
	        if (
	          (first = functionCall(entryNext, entryIterator)).done ||
	          (second = functionCall(entryNext, entryIterator)).done ||
	          !functionCall(entryNext, entryIterator).done
	        ) throw new TypeError$2('Expected sequence with length 2');
	        push$2(entries, { key: toString_1$1(first.value), value: toString_1$1(second.value) });
	      }
	    } else for (var key in object) if (hasOwnProperty_1(object, key)) {
	      push$2(entries, { key: key, value: toString_1$1(object[key]) });
	    }
	  },
	  parseQuery: function (query) {
	    if (query) {
	      var entries = this.entries;
	      var attributes = split$1(query, '&');
	      var index = 0;
	      var attribute, entry;
	      while (index < attributes.length) {
	        attribute = attributes[index++];
	        if (attribute.length) {
	          entry = split$1(attribute, '=');
	          push$2(entries, {
	            key: deserialize(shift$1(entry)),
	            value: deserialize(join$1(entry, '='))
	          });
	        }
	      }
	    }
	  },
	  serialize: function () {
	    var entries = this.entries;
	    var result = [];
	    var index = 0;
	    var entry;
	    while (index < entries.length) {
	      entry = entries[index++];
	      push$2(result, serialize(entry.key) + '=' + serialize(entry.value));
	    } return join$1(result, '&');
	  },
	  update: function () {
	    this.entries.length = 0;
	    this.parseQuery(this.url.query);
	  },
	  updateURL: function () {
	    if (this.url) this.url.update();
	  }
	};

	// `URLSearchParams` constructor
	// https://url.spec.whatwg.org/#interface-urlsearchparams
	var URLSearchParamsConstructor = function URLSearchParams(/* init */) {
	  anInstance(this, URLSearchParamsPrototype$3);
	  var init = arguments.length > 0 ? arguments[0] : undefined;
	  var state = setInternalState$1(this, new URLSearchParamsState(init));
	  if (!descriptors) this.size = state.entries.length;
	};

	var URLSearchParamsPrototype$3 = URLSearchParamsConstructor.prototype;

	defineBuiltIns(URLSearchParamsPrototype$3, {
	  // `URLSearchParams.prototype.append` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
	  append: function append(name, value) {
	    var state = getInternalParamsState(this);
	    validateArgumentsLength(arguments.length, 2);
	    push$2(state.entries, { key: toString_1$1(name), value: toString_1$1(value) });
	    if (!descriptors) this.length++;
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.delete` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
	  'delete': function (name /* , value */) {
	    var state = getInternalParamsState(this);
	    var length = validateArgumentsLength(arguments.length, 1);
	    var entries = state.entries;
	    var key = toString_1$1(name);
	    var $value = length < 2 ? undefined : arguments[1];
	    var value = $value === undefined ? $value : toString_1$1($value);
	    var index = 0;
	    while (index < entries.length) {
	      var entry = entries[index];
	      if (entry.key === key && (value === undefined || entry.value === value)) {
	        splice$2(entries, index, 1);
	        if (value !== undefined) break;
	      } else index++;
	    }
	    if (!descriptors) this.size = entries.length;
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.get` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
	  get: function get(name) {
	    var entries = getInternalParamsState(this).entries;
	    validateArgumentsLength(arguments.length, 1);
	    var key = toString_1$1(name);
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) return entries[index].value;
	    }
	    return null;
	  },
	  // `URLSearchParams.prototype.getAll` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
	  getAll: function getAll(name) {
	    var entries = getInternalParamsState(this).entries;
	    validateArgumentsLength(arguments.length, 1);
	    var key = toString_1$1(name);
	    var result = [];
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) push$2(result, entries[index].value);
	    }
	    return result;
	  },
	  // `URLSearchParams.prototype.has` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
	  has: function has(name /* , value */) {
	    var entries = getInternalParamsState(this).entries;
	    var length = validateArgumentsLength(arguments.length, 1);
	    var key = toString_1$1(name);
	    var $value = length < 2 ? undefined : arguments[1];
	    var value = $value === undefined ? $value : toString_1$1($value);
	    var index = 0;
	    while (index < entries.length) {
	      var entry = entries[index++];
	      if (entry.key === key && (value === undefined || entry.value === value)) return true;
	    }
	    return false;
	  },
	  // `URLSearchParams.prototype.set` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
	  set: function set(name, value) {
	    var state = getInternalParamsState(this);
	    validateArgumentsLength(arguments.length, 1);
	    var entries = state.entries;
	    var found = false;
	    var key = toString_1$1(name);
	    var val = toString_1$1(value);
	    var index = 0;
	    var entry;
	    for (; index < entries.length; index++) {
	      entry = entries[index];
	      if (entry.key === key) {
	        if (found) splice$2(entries, index--, 1);
	        else {
	          found = true;
	          entry.value = val;
	        }
	      }
	    }
	    if (!found) push$2(entries, { key: key, value: val });
	    if (!descriptors) this.size = entries.length;
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.sort` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
	  sort: function sort() {
	    var state = getInternalParamsState(this);
	    arraySort(state.entries, function (a, b) {
	      return a.key > b.key ? 1 : -1;
	    });
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.forEach` method
	  forEach: function forEach(callback /* , thisArg */) {
	    var entries = getInternalParamsState(this).entries;
	    var boundFunction = functionBindContext(callback, arguments.length > 1 ? arguments[1] : undefined);
	    var index = 0;
	    var entry;
	    while (index < entries.length) {
	      entry = entries[index++];
	      boundFunction(entry.value, entry.key, this);
	    }
	  },
	  // `URLSearchParams.prototype.keys` method
	  keys: function keys() {
	    return new URLSearchParamsIterator(this, 'keys');
	  },
	  // `URLSearchParams.prototype.values` method
	  values: function values() {
	    return new URLSearchParamsIterator(this, 'values');
	  },
	  // `URLSearchParams.prototype.entries` method
	  entries: function entries() {
	    return new URLSearchParamsIterator(this, 'entries');
	  }
	}, { enumerable: true });

	// `URLSearchParams.prototype[@@iterator]` method
	defineBuiltIn(URLSearchParamsPrototype$3, ITERATOR, URLSearchParamsPrototype$3.entries, { name: 'entries' });

	// `URLSearchParams.prototype.toString` method
	// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
	defineBuiltIn(URLSearchParamsPrototype$3, 'toString', function toString() {
	  return getInternalParamsState(this).serialize();
	}, { enumerable: true });

	// `URLSearchParams.prototype.size` getter
	// https://github.com/whatwg/url/pull/734
	if (descriptors) defineBuiltInAccessor(URLSearchParamsPrototype$3, 'size', {
	  get: function size() {
	    return getInternalParamsState(this).entries.length;
	  },
	  configurable: true,
	  enumerable: true
	});

	setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

	_export({ global: true, constructor: true, forced: !urlConstructorDetection }, {
	  URLSearchParams: URLSearchParamsConstructor
	});

	// Wrap `fetch` and `Request` for correct work with polyfilled `URLSearchParams`
	if (!urlConstructorDetection && isCallable(Headers$1)) {
	  var headersHas = functionUncurryThis(HeadersPrototype.has);
	  var headersSet = functionUncurryThis(HeadersPrototype.set);

	  var wrapRequestOptions = function (init) {
	    if (isObject$1(init)) {
	      var body = init.body;
	      var headers;
	      if (classof(body) === URL_SEARCH_PARAMS) {
	        headers = init.headers ? new Headers$1(init.headers) : new Headers$1();
	        if (!headersHas(headers, 'content-type')) {
	          headersSet(headers, 'content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	        }
	        return objectCreate(init, {
	          body: createPropertyDescriptor(0, toString_1$1(body)),
	          headers: createPropertyDescriptor(0, headers)
	        });
	      }
	    } return init;
	  };

	  if (isCallable(nativeFetch)) {
	    _export({ global: true, enumerable: true, dontCallGetSet: true, forced: true }, {
	      fetch: function fetch(input /* , init */) {
	        return nativeFetch(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
	      }
	    });
	  }

	  if (isCallable(NativeRequest)) {
	    var RequestConstructor = function Request(input /* , init */) {
	      anInstance(this, RequestPrototype);
	      return new NativeRequest(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
	    };

	    RequestPrototype.constructor = RequestConstructor;
	    RequestConstructor.prototype = RequestPrototype;

	    _export({ global: true, constructor: true, dontCallGetSet: true, forced: true }, {
	      Request: RequestConstructor
	    });
	  }
	}

	var web_urlSearchParams_constructor = {
	  URLSearchParams: URLSearchParamsConstructor,
	  getState: getInternalParamsState
	};

	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`














	var codeAt = stringMultibyte.codeAt;







	var setInternalState = internalState.set;
	var getInternalURLState = internalState.getterFor('URL');
	var URLSearchParams$1 = web_urlSearchParams_constructor.URLSearchParams;
	var getInternalSearchParamsState = web_urlSearchParams_constructor.getState;

	var NativeURL = global_1.URL;
	var TypeError$1 = global_1.TypeError;
	var parseInt$1 = global_1.parseInt;
	var floor = Math.floor;
	var pow = Math.pow;
	var charAt = functionUncurryThis(''.charAt);
	var exec = functionUncurryThis(/./.exec);
	var join = functionUncurryThis([].join);
	var numberToString = functionUncurryThis(1.0.toString);
	var pop = functionUncurryThis([].pop);
	var push$1 = functionUncurryThis([].push);
	var replace = functionUncurryThis(''.replace);
	var shift = functionUncurryThis([].shift);
	var split = functionUncurryThis(''.split);
	var stringSlice = functionUncurryThis(''.slice);
	var toLowerCase = functionUncurryThis(''.toLowerCase);
	var unshift = functionUncurryThis([].unshift);

	var INVALID_AUTHORITY = 'Invalid authority';
	var INVALID_SCHEME = 'Invalid scheme';
	var INVALID_HOST = 'Invalid host';
	var INVALID_PORT = 'Invalid port';

	var ALPHA = /[a-z]/i;
	// eslint-disable-next-line regexp/no-obscure-range -- safe
	var ALPHANUMERIC = /[\d+-.a-z]/i;
	var DIGIT = /\d/;
	var HEX_START = /^0x/i;
	var OCT = /^[0-7]+$/;
	var DEC = /^\d+$/;
	var HEX = /^[\da-f]+$/i;
	/* eslint-disable regexp/no-control-character -- safe */
	var FORBIDDEN_HOST_CODE_POINT = /[\0\t\n\r #%/:<>?@[\\\]^|]/;
	var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\0\t\n\r #/:<>?@[\\\]^|]/;
	var LEADING_C0_CONTROL_OR_SPACE = /^[\u0000-\u0020]+/;
	var TRAILING_C0_CONTROL_OR_SPACE = /(^|[^\u0000-\u0020])[\u0000-\u0020]+$/;
	var TAB_AND_NEW_LINE = /[\t\n\r]/g;
	/* eslint-enable regexp/no-control-character -- safe */
	var EOF;

	// https://url.spec.whatwg.org/#ipv4-number-parser
	var parseIPv4 = function (input) {
	  var parts = split(input, '.');
	  var partsLength, numbers, index, part, radix, number, ipv4;
	  if (parts.length && parts[parts.length - 1] === '') {
	    parts.length--;
	  }
	  partsLength = parts.length;
	  if (partsLength > 4) return input;
	  numbers = [];
	  for (index = 0; index < partsLength; index++) {
	    part = parts[index];
	    if (part === '') return input;
	    radix = 10;
	    if (part.length > 1 && charAt(part, 0) === '0') {
	      radix = exec(HEX_START, part) ? 16 : 8;
	      part = stringSlice(part, radix === 8 ? 1 : 2);
	    }
	    if (part === '') {
	      number = 0;
	    } else {
	      if (!exec(radix === 10 ? DEC : radix === 8 ? OCT : HEX, part)) return input;
	      number = parseInt$1(part, radix);
	    }
	    push$1(numbers, number);
	  }
	  for (index = 0; index < partsLength; index++) {
	    number = numbers[index];
	    if (index === partsLength - 1) {
	      if (number >= pow(256, 5 - partsLength)) return null;
	    } else if (number > 255) return null;
	  }
	  ipv4 = pop(numbers);
	  for (index = 0; index < numbers.length; index++) {
	    ipv4 += numbers[index] * pow(256, 3 - index);
	  }
	  return ipv4;
	};

	// https://url.spec.whatwg.org/#concept-ipv6-parser
	// eslint-disable-next-line max-statements -- TODO
	var parseIPv6 = function (input) {
	  var address = [0, 0, 0, 0, 0, 0, 0, 0];
	  var pieceIndex = 0;
	  var compress = null;
	  var pointer = 0;
	  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

	  var chr = function () {
	    return charAt(input, pointer);
	  };

	  if (chr() === ':') {
	    if (charAt(input, 1) !== ':') return;
	    pointer += 2;
	    pieceIndex++;
	    compress = pieceIndex;
	  }
	  while (chr()) {
	    if (pieceIndex === 8) return;
	    if (chr() === ':') {
	      if (compress !== null) return;
	      pointer++;
	      pieceIndex++;
	      compress = pieceIndex;
	      continue;
	    }
	    value = length = 0;
	    while (length < 4 && exec(HEX, chr())) {
	      value = value * 16 + parseInt$1(chr(), 16);
	      pointer++;
	      length++;
	    }
	    if (chr() === '.') {
	      if (length === 0) return;
	      pointer -= length;
	      if (pieceIndex > 6) return;
	      numbersSeen = 0;
	      while (chr()) {
	        ipv4Piece = null;
	        if (numbersSeen > 0) {
	          if (chr() === '.' && numbersSeen < 4) pointer++;
	          else return;
	        }
	        if (!exec(DIGIT, chr())) return;
	        while (exec(DIGIT, chr())) {
	          number = parseInt$1(chr(), 10);
	          if (ipv4Piece === null) ipv4Piece = number;
	          else if (ipv4Piece === 0) return;
	          else ipv4Piece = ipv4Piece * 10 + number;
	          if (ipv4Piece > 255) return;
	          pointer++;
	        }
	        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
	        numbersSeen++;
	        if (numbersSeen === 2 || numbersSeen === 4) pieceIndex++;
	      }
	      if (numbersSeen !== 4) return;
	      break;
	    } else if (chr() === ':') {
	      pointer++;
	      if (!chr()) return;
	    } else if (chr()) return;
	    address[pieceIndex++] = value;
	  }
	  if (compress !== null) {
	    swaps = pieceIndex - compress;
	    pieceIndex = 7;
	    while (pieceIndex !== 0 && swaps > 0) {
	      swap = address[pieceIndex];
	      address[pieceIndex--] = address[compress + swaps - 1];
	      address[compress + --swaps] = swap;
	    }
	  } else if (pieceIndex !== 8) return;
	  return address;
	};

	var findLongestZeroSequence = function (ipv6) {
	  var maxIndex = null;
	  var maxLength = 1;
	  var currStart = null;
	  var currLength = 0;
	  var index = 0;
	  for (; index < 8; index++) {
	    if (ipv6[index] !== 0) {
	      if (currLength > maxLength) {
	        maxIndex = currStart;
	        maxLength = currLength;
	      }
	      currStart = null;
	      currLength = 0;
	    } else {
	      if (currStart === null) currStart = index;
	      ++currLength;
	    }
	  }
	  if (currLength > maxLength) {
	    maxIndex = currStart;
	    maxLength = currLength;
	  }
	  return maxIndex;
	};

	// https://url.spec.whatwg.org/#host-serializing
	var serializeHost = function (host) {
	  var result, index, compress, ignore0;
	  // ipv4
	  if (typeof host == 'number') {
	    result = [];
	    for (index = 0; index < 4; index++) {
	      unshift(result, host % 256);
	      host = floor(host / 256);
	    } return join(result, '.');
	  // ipv6
	  } else if (typeof host == 'object') {
	    result = '';
	    compress = findLongestZeroSequence(host);
	    for (index = 0; index < 8; index++) {
	      if (ignore0 && host[index] === 0) continue;
	      if (ignore0) ignore0 = false;
	      if (compress === index) {
	        result += index ? ':' : '::';
	        ignore0 = true;
	      } else {
	        result += numberToString(host[index], 16);
	        if (index < 7) result += ':';
	      }
	    }
	    return '[' + result + ']';
	  } return host;
	};

	var C0ControlPercentEncodeSet = {};
	var fragmentPercentEncodeSet = objectAssign({}, C0ControlPercentEncodeSet, {
	  ' ': 1, '"': 1, '<': 1, '>': 1, '`': 1
	});
	var pathPercentEncodeSet = objectAssign({}, fragmentPercentEncodeSet, {
	  '#': 1, '?': 1, '{': 1, '}': 1
	});
	var userinfoPercentEncodeSet = objectAssign({}, pathPercentEncodeSet, {
	  '/': 1, ':': 1, ';': 1, '=': 1, '@': 1, '[': 1, '\\': 1, ']': 1, '^': 1, '|': 1
	});

	var percentEncode = function (chr, set) {
	  var code = codeAt(chr, 0);
	  return code > 0x20 && code < 0x7F && !hasOwnProperty_1(set, chr) ? chr : encodeURIComponent(chr);
	};

	// https://url.spec.whatwg.org/#special-scheme
	var specialSchemes = {
	  ftp: 21,
	  file: null,
	  http: 80,
	  https: 443,
	  ws: 80,
	  wss: 443
	};

	// https://url.spec.whatwg.org/#windows-drive-letter
	var isWindowsDriveLetter = function (string, normalized) {
	  var second;
	  return string.length === 2 && exec(ALPHA, charAt(string, 0))
	    && ((second = charAt(string, 1)) === ':' || (!normalized && second === '|'));
	};

	// https://url.spec.whatwg.org/#start-with-a-windows-drive-letter
	var startsWithWindowsDriveLetter = function (string) {
	  var third;
	  return string.length > 1 && isWindowsDriveLetter(stringSlice(string, 0, 2)) && (
	    string.length === 2 ||
	    ((third = charAt(string, 2)) === '/' || third === '\\' || third === '?' || third === '#')
	  );
	};

	// https://url.spec.whatwg.org/#single-dot-path-segment
	var isSingleDot = function (segment) {
	  return segment === '.' || toLowerCase(segment) === '%2e';
	};

	// https://url.spec.whatwg.org/#double-dot-path-segment
	var isDoubleDot = function (segment) {
	  segment = toLowerCase(segment);
	  return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
	};

	// States:
	var SCHEME_START = {};
	var SCHEME = {};
	var NO_SCHEME = {};
	var SPECIAL_RELATIVE_OR_AUTHORITY = {};
	var PATH_OR_AUTHORITY = {};
	var RELATIVE = {};
	var RELATIVE_SLASH = {};
	var SPECIAL_AUTHORITY_SLASHES = {};
	var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
	var AUTHORITY = {};
	var HOST = {};
	var HOSTNAME = {};
	var PORT = {};
	var FILE = {};
	var FILE_SLASH = {};
	var FILE_HOST = {};
	var PATH_START = {};
	var PATH = {};
	var CANNOT_BE_A_BASE_URL_PATH = {};
	var QUERY = {};
	var FRAGMENT = {};

	var URLState = function (url, isBase, base) {
	  var urlString = toString_1$1(url);
	  var baseState, failure, searchParams;
	  if (isBase) {
	    failure = this.parse(urlString);
	    if (failure) throw new TypeError$1(failure);
	    this.searchParams = null;
	  } else {
	    if (base !== undefined) baseState = new URLState(base, true);
	    failure = this.parse(urlString, null, baseState);
	    if (failure) throw new TypeError$1(failure);
	    searchParams = getInternalSearchParamsState(new URLSearchParams$1());
	    searchParams.bindURL(this);
	    this.searchParams = searchParams;
	  }
	};

	URLState.prototype = {
	  type: 'URL',
	  // https://url.spec.whatwg.org/#url-parsing
	  // eslint-disable-next-line max-statements -- TODO
	  parse: function (input, stateOverride, base) {
	    var url = this;
	    var state = stateOverride || SCHEME_START;
	    var pointer = 0;
	    var buffer = '';
	    var seenAt = false;
	    var seenBracket = false;
	    var seenPasswordToken = false;
	    var codePoints, chr, bufferCodePoints, failure;

	    input = toString_1$1(input);

	    if (!stateOverride) {
	      url.scheme = '';
	      url.username = '';
	      url.password = '';
	      url.host = null;
	      url.port = null;
	      url.path = [];
	      url.query = null;
	      url.fragment = null;
	      url.cannotBeABaseURL = false;
	      input = replace(input, LEADING_C0_CONTROL_OR_SPACE, '');
	      input = replace(input, TRAILING_C0_CONTROL_OR_SPACE, '$1');
	    }

	    input = replace(input, TAB_AND_NEW_LINE, '');

	    codePoints = arrayFrom(input);

	    while (pointer <= codePoints.length) {
	      chr = codePoints[pointer];
	      switch (state) {
	        case SCHEME_START:
	          if (chr && exec(ALPHA, chr)) {
	            buffer += toLowerCase(chr);
	            state = SCHEME;
	          } else if (!stateOverride) {
	            state = NO_SCHEME;
	            continue;
	          } else return INVALID_SCHEME;
	          break;

	        case SCHEME:
	          if (chr && (exec(ALPHANUMERIC, chr) || chr === '+' || chr === '-' || chr === '.')) {
	            buffer += toLowerCase(chr);
	          } else if (chr === ':') {
	            if (stateOverride && (
	              (url.isSpecial() !== hasOwnProperty_1(specialSchemes, buffer)) ||
	              (buffer === 'file' && (url.includesCredentials() || url.port !== null)) ||
	              (url.scheme === 'file' && !url.host)
	            )) return;
	            url.scheme = buffer;
	            if (stateOverride) {
	              if (url.isSpecial() && specialSchemes[url.scheme] === url.port) url.port = null;
	              return;
	            }
	            buffer = '';
	            if (url.scheme === 'file') {
	              state = FILE;
	            } else if (url.isSpecial() && base && base.scheme === url.scheme) {
	              state = SPECIAL_RELATIVE_OR_AUTHORITY;
	            } else if (url.isSpecial()) {
	              state = SPECIAL_AUTHORITY_SLASHES;
	            } else if (codePoints[pointer + 1] === '/') {
	              state = PATH_OR_AUTHORITY;
	              pointer++;
	            } else {
	              url.cannotBeABaseURL = true;
	              push$1(url.path, '');
	              state = CANNOT_BE_A_BASE_URL_PATH;
	            }
	          } else if (!stateOverride) {
	            buffer = '';
	            state = NO_SCHEME;
	            pointer = 0;
	            continue;
	          } else return INVALID_SCHEME;
	          break;

	        case NO_SCHEME:
	          if (!base || (base.cannotBeABaseURL && chr !== '#')) return INVALID_SCHEME;
	          if (base.cannotBeABaseURL && chr === '#') {
	            url.scheme = base.scheme;
	            url.path = arraySlice(base.path);
	            url.query = base.query;
	            url.fragment = '';
	            url.cannotBeABaseURL = true;
	            state = FRAGMENT;
	            break;
	          }
	          state = base.scheme === 'file' ? FILE : RELATIVE;
	          continue;

	        case SPECIAL_RELATIVE_OR_AUTHORITY:
	          if (chr === '/' && codePoints[pointer + 1] === '/') {
	            state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	            pointer++;
	          } else {
	            state = RELATIVE;
	            continue;
	          } break;

	        case PATH_OR_AUTHORITY:
	          if (chr === '/') {
	            state = AUTHORITY;
	            break;
	          } else {
	            state = PATH;
	            continue;
	          }

	        case RELATIVE:
	          url.scheme = base.scheme;
	          if (chr === EOF) {
	            url.username = base.username;
	            url.password = base.password;
	            url.host = base.host;
	            url.port = base.port;
	            url.path = arraySlice(base.path);
	            url.query = base.query;
	          } else if (chr === '/' || (chr === '\\' && url.isSpecial())) {
	            state = RELATIVE_SLASH;
	          } else if (chr === '?') {
	            url.username = base.username;
	            url.password = base.password;
	            url.host = base.host;
	            url.port = base.port;
	            url.path = arraySlice(base.path);
	            url.query = '';
	            state = QUERY;
	          } else if (chr === '#') {
	            url.username = base.username;
	            url.password = base.password;
	            url.host = base.host;
	            url.port = base.port;
	            url.path = arraySlice(base.path);
	            url.query = base.query;
	            url.fragment = '';
	            state = FRAGMENT;
	          } else {
	            url.username = base.username;
	            url.password = base.password;
	            url.host = base.host;
	            url.port = base.port;
	            url.path = arraySlice(base.path);
	            url.path.length--;
	            state = PATH;
	            continue;
	          } break;

	        case RELATIVE_SLASH:
	          if (url.isSpecial() && (chr === '/' || chr === '\\')) {
	            state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	          } else if (chr === '/') {
	            state = AUTHORITY;
	          } else {
	            url.username = base.username;
	            url.password = base.password;
	            url.host = base.host;
	            url.port = base.port;
	            state = PATH;
	            continue;
	          } break;

	        case SPECIAL_AUTHORITY_SLASHES:
	          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	          if (chr !== '/' || charAt(buffer, pointer + 1) !== '/') continue;
	          pointer++;
	          break;

	        case SPECIAL_AUTHORITY_IGNORE_SLASHES:
	          if (chr !== '/' && chr !== '\\') {
	            state = AUTHORITY;
	            continue;
	          } break;

	        case AUTHORITY:
	          if (chr === '@') {
	            if (seenAt) buffer = '%40' + buffer;
	            seenAt = true;
	            bufferCodePoints = arrayFrom(buffer);
	            for (var i = 0; i < bufferCodePoints.length; i++) {
	              var codePoint = bufferCodePoints[i];
	              if (codePoint === ':' && !seenPasswordToken) {
	                seenPasswordToken = true;
	                continue;
	              }
	              var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
	              if (seenPasswordToken) url.password += encodedCodePoints;
	              else url.username += encodedCodePoints;
	            }
	            buffer = '';
	          } else if (
	            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
	            (chr === '\\' && url.isSpecial())
	          ) {
	            if (seenAt && buffer === '') return INVALID_AUTHORITY;
	            pointer -= arrayFrom(buffer).length + 1;
	            buffer = '';
	            state = HOST;
	          } else buffer += chr;
	          break;

	        case HOST:
	        case HOSTNAME:
	          if (stateOverride && url.scheme === 'file') {
	            state = FILE_HOST;
	            continue;
	          } else if (chr === ':' && !seenBracket) {
	            if (buffer === '') return INVALID_HOST;
	            failure = url.parseHost(buffer);
	            if (failure) return failure;
	            buffer = '';
	            state = PORT;
	            if (stateOverride === HOSTNAME) return;
	          } else if (
	            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
	            (chr === '\\' && url.isSpecial())
	          ) {
	            if (url.isSpecial() && buffer === '') return INVALID_HOST;
	            if (stateOverride && buffer === '' && (url.includesCredentials() || url.port !== null)) return;
	            failure = url.parseHost(buffer);
	            if (failure) return failure;
	            buffer = '';
	            state = PATH_START;
	            if (stateOverride) return;
	            continue;
	          } else {
	            if (chr === '[') seenBracket = true;
	            else if (chr === ']') seenBracket = false;
	            buffer += chr;
	          } break;

	        case PORT:
	          if (exec(DIGIT, chr)) {
	            buffer += chr;
	          } else if (
	            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
	            (chr === '\\' && url.isSpecial()) ||
	            stateOverride
	          ) {
	            if (buffer !== '') {
	              var port = parseInt$1(buffer, 10);
	              if (port > 0xFFFF) return INVALID_PORT;
	              url.port = (url.isSpecial() && port === specialSchemes[url.scheme]) ? null : port;
	              buffer = '';
	            }
	            if (stateOverride) return;
	            state = PATH_START;
	            continue;
	          } else return INVALID_PORT;
	          break;

	        case FILE:
	          url.scheme = 'file';
	          if (chr === '/' || chr === '\\') state = FILE_SLASH;
	          else if (base && base.scheme === 'file') {
	            switch (chr) {
	              case EOF:
	                url.host = base.host;
	                url.path = arraySlice(base.path);
	                url.query = base.query;
	                break;
	              case '?':
	                url.host = base.host;
	                url.path = arraySlice(base.path);
	                url.query = '';
	                state = QUERY;
	                break;
	              case '#':
	                url.host = base.host;
	                url.path = arraySlice(base.path);
	                url.query = base.query;
	                url.fragment = '';
	                state = FRAGMENT;
	                break;
	              default:
	                if (!startsWithWindowsDriveLetter(join(arraySlice(codePoints, pointer), ''))) {
	                  url.host = base.host;
	                  url.path = arraySlice(base.path);
	                  url.shortenPath();
	                }
	                state = PATH;
	                continue;
	            }
	          } else {
	            state = PATH;
	            continue;
	          } break;

	        case FILE_SLASH:
	          if (chr === '/' || chr === '\\') {
	            state = FILE_HOST;
	            break;
	          }
	          if (base && base.scheme === 'file' && !startsWithWindowsDriveLetter(join(arraySlice(codePoints, pointer), ''))) {
	            if (isWindowsDriveLetter(base.path[0], true)) push$1(url.path, base.path[0]);
	            else url.host = base.host;
	          }
	          state = PATH;
	          continue;

	        case FILE_HOST:
	          if (chr === EOF || chr === '/' || chr === '\\' || chr === '?' || chr === '#') {
	            if (!stateOverride && isWindowsDriveLetter(buffer)) {
	              state = PATH;
	            } else if (buffer === '') {
	              url.host = '';
	              if (stateOverride) return;
	              state = PATH_START;
	            } else {
	              failure = url.parseHost(buffer);
	              if (failure) return failure;
	              if (url.host === 'localhost') url.host = '';
	              if (stateOverride) return;
	              buffer = '';
	              state = PATH_START;
	            } continue;
	          } else buffer += chr;
	          break;

	        case PATH_START:
	          if (url.isSpecial()) {
	            state = PATH;
	            if (chr !== '/' && chr !== '\\') continue;
	          } else if (!stateOverride && chr === '?') {
	            url.query = '';
	            state = QUERY;
	          } else if (!stateOverride && chr === '#') {
	            url.fragment = '';
	            state = FRAGMENT;
	          } else if (chr !== EOF) {
	            state = PATH;
	            if (chr !== '/') continue;
	          } break;

	        case PATH:
	          if (
	            chr === EOF || chr === '/' ||
	            (chr === '\\' && url.isSpecial()) ||
	            (!stateOverride && (chr === '?' || chr === '#'))
	          ) {
	            if (isDoubleDot(buffer)) {
	              url.shortenPath();
	              if (chr !== '/' && !(chr === '\\' && url.isSpecial())) {
	                push$1(url.path, '');
	              }
	            } else if (isSingleDot(buffer)) {
	              if (chr !== '/' && !(chr === '\\' && url.isSpecial())) {
	                push$1(url.path, '');
	              }
	            } else {
	              if (url.scheme === 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
	                if (url.host) url.host = '';
	                buffer = charAt(buffer, 0) + ':'; // normalize windows drive letter
	              }
	              push$1(url.path, buffer);
	            }
	            buffer = '';
	            if (url.scheme === 'file' && (chr === EOF || chr === '?' || chr === '#')) {
	              while (url.path.length > 1 && url.path[0] === '') {
	                shift(url.path);
	              }
	            }
	            if (chr === '?') {
	              url.query = '';
	              state = QUERY;
	            } else if (chr === '#') {
	              url.fragment = '';
	              state = FRAGMENT;
	            }
	          } else {
	            buffer += percentEncode(chr, pathPercentEncodeSet);
	          } break;

	        case CANNOT_BE_A_BASE_URL_PATH:
	          if (chr === '?') {
	            url.query = '';
	            state = QUERY;
	          } else if (chr === '#') {
	            url.fragment = '';
	            state = FRAGMENT;
	          } else if (chr !== EOF) {
	            url.path[0] += percentEncode(chr, C0ControlPercentEncodeSet);
	          } break;

	        case QUERY:
	          if (!stateOverride && chr === '#') {
	            url.fragment = '';
	            state = FRAGMENT;
	          } else if (chr !== EOF) {
	            if (chr === "'" && url.isSpecial()) url.query += '%27';
	            else if (chr === '#') url.query += '%23';
	            else url.query += percentEncode(chr, C0ControlPercentEncodeSet);
	          } break;

	        case FRAGMENT:
	          if (chr !== EOF) url.fragment += percentEncode(chr, fragmentPercentEncodeSet);
	          break;
	      }

	      pointer++;
	    }
	  },
	  // https://url.spec.whatwg.org/#host-parsing
	  parseHost: function (input) {
	    var result, codePoints, index;
	    if (charAt(input, 0) === '[') {
	      if (charAt(input, input.length - 1) !== ']') return INVALID_HOST;
	      result = parseIPv6(stringSlice(input, 1, -1));
	      if (!result) return INVALID_HOST;
	      this.host = result;
	    // opaque host
	    } else if (!this.isSpecial()) {
	      if (exec(FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT, input)) return INVALID_HOST;
	      result = '';
	      codePoints = arrayFrom(input);
	      for (index = 0; index < codePoints.length; index++) {
	        result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
	      }
	      this.host = result;
	    } else {
	      input = stringPunycodeToAscii(input);
	      if (exec(FORBIDDEN_HOST_CODE_POINT, input)) return INVALID_HOST;
	      result = parseIPv4(input);
	      if (result === null) return INVALID_HOST;
	      this.host = result;
	    }
	  },
	  // https://url.spec.whatwg.org/#cannot-have-a-username-password-port
	  cannotHaveUsernamePasswordPort: function () {
	    return !this.host || this.cannotBeABaseURL || this.scheme === 'file';
	  },
	  // https://url.spec.whatwg.org/#include-credentials
	  includesCredentials: function () {
	    return this.username !== '' || this.password !== '';
	  },
	  // https://url.spec.whatwg.org/#is-special
	  isSpecial: function () {
	    return hasOwnProperty_1(specialSchemes, this.scheme);
	  },
	  // https://url.spec.whatwg.org/#shorten-a-urls-path
	  shortenPath: function () {
	    var path = this.path;
	    var pathSize = path.length;
	    if (pathSize && (this.scheme !== 'file' || pathSize !== 1 || !isWindowsDriveLetter(path[0], true))) {
	      path.length--;
	    }
	  },
	  // https://url.spec.whatwg.org/#concept-url-serializer
	  serialize: function () {
	    var url = this;
	    var scheme = url.scheme;
	    var username = url.username;
	    var password = url.password;
	    var host = url.host;
	    var port = url.port;
	    var path = url.path;
	    var query = url.query;
	    var fragment = url.fragment;
	    var output = scheme + ':';
	    if (host !== null) {
	      output += '//';
	      if (url.includesCredentials()) {
	        output += username + (password ? ':' + password : '') + '@';
	      }
	      output += serializeHost(host);
	      if (port !== null) output += ':' + port;
	    } else if (scheme === 'file') output += '//';
	    output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + join(path, '/') : '';
	    if (query !== null) output += '?' + query;
	    if (fragment !== null) output += '#' + fragment;
	    return output;
	  },
	  // https://url.spec.whatwg.org/#dom-url-href
	  setHref: function (href) {
	    var failure = this.parse(href);
	    if (failure) throw new TypeError$1(failure);
	    this.searchParams.update();
	  },
	  // https://url.spec.whatwg.org/#dom-url-origin
	  getOrigin: function () {
	    var scheme = this.scheme;
	    var port = this.port;
	    if (scheme === 'blob') try {
	      return new URLConstructor(scheme.path[0]).origin;
	    } catch (error) {
	      return 'null';
	    }
	    if (scheme === 'file' || !this.isSpecial()) return 'null';
	    return scheme + '://' + serializeHost(this.host) + (port !== null ? ':' + port : '');
	  },
	  // https://url.spec.whatwg.org/#dom-url-protocol
	  getProtocol: function () {
	    return this.scheme + ':';
	  },
	  setProtocol: function (protocol) {
	    this.parse(toString_1$1(protocol) + ':', SCHEME_START);
	  },
	  // https://url.spec.whatwg.org/#dom-url-username
	  getUsername: function () {
	    return this.username;
	  },
	  setUsername: function (username) {
	    var codePoints = arrayFrom(toString_1$1(username));
	    if (this.cannotHaveUsernamePasswordPort()) return;
	    this.username = '';
	    for (var i = 0; i < codePoints.length; i++) {
	      this.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	    }
	  },
	  // https://url.spec.whatwg.org/#dom-url-password
	  getPassword: function () {
	    return this.password;
	  },
	  setPassword: function (password) {
	    var codePoints = arrayFrom(toString_1$1(password));
	    if (this.cannotHaveUsernamePasswordPort()) return;
	    this.password = '';
	    for (var i = 0; i < codePoints.length; i++) {
	      this.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	    }
	  },
	  // https://url.spec.whatwg.org/#dom-url-host
	  getHost: function () {
	    var host = this.host;
	    var port = this.port;
	    return host === null ? ''
	      : port === null ? serializeHost(host)
	      : serializeHost(host) + ':' + port;
	  },
	  setHost: function (host) {
	    if (this.cannotBeABaseURL) return;
	    this.parse(host, HOST);
	  },
	  // https://url.spec.whatwg.org/#dom-url-hostname
	  getHostname: function () {
	    var host = this.host;
	    return host === null ? '' : serializeHost(host);
	  },
	  setHostname: function (hostname) {
	    if (this.cannotBeABaseURL) return;
	    this.parse(hostname, HOSTNAME);
	  },
	  // https://url.spec.whatwg.org/#dom-url-port
	  getPort: function () {
	    var port = this.port;
	    return port === null ? '' : toString_1$1(port);
	  },
	  setPort: function (port) {
	    if (this.cannotHaveUsernamePasswordPort()) return;
	    port = toString_1$1(port);
	    if (port === '') this.port = null;
	    else this.parse(port, PORT);
	  },
	  // https://url.spec.whatwg.org/#dom-url-pathname
	  getPathname: function () {
	    var path = this.path;
	    return this.cannotBeABaseURL ? path[0] : path.length ? '/' + join(path, '/') : '';
	  },
	  setPathname: function (pathname) {
	    if (this.cannotBeABaseURL) return;
	    this.path = [];
	    this.parse(pathname, PATH_START);
	  },
	  // https://url.spec.whatwg.org/#dom-url-search
	  getSearch: function () {
	    var query = this.query;
	    return query ? '?' + query : '';
	  },
	  setSearch: function (search) {
	    search = toString_1$1(search);
	    if (search === '') {
	      this.query = null;
	    } else {
	      if (charAt(search, 0) === '?') search = stringSlice(search, 1);
	      this.query = '';
	      this.parse(search, QUERY);
	    }
	    this.searchParams.update();
	  },
	  // https://url.spec.whatwg.org/#dom-url-searchparams
	  getSearchParams: function () {
	    return this.searchParams.facade;
	  },
	  // https://url.spec.whatwg.org/#dom-url-hash
	  getHash: function () {
	    var fragment = this.fragment;
	    return fragment ? '#' + fragment : '';
	  },
	  setHash: function (hash) {
	    hash = toString_1$1(hash);
	    if (hash === '') {
	      this.fragment = null;
	      return;
	    }
	    if (charAt(hash, 0) === '#') hash = stringSlice(hash, 1);
	    this.fragment = '';
	    this.parse(hash, FRAGMENT);
	  },
	  update: function () {
	    this.query = this.searchParams.serialize() || null;
	  }
	};

	// `URL` constructor
	// https://url.spec.whatwg.org/#url-class
	var URLConstructor = function URL(url /* , base */) {
	  var that = anInstance(this, URLPrototype);
	  var base = validateArgumentsLength(arguments.length, 1) > 1 ? arguments[1] : undefined;
	  var state = setInternalState(that, new URLState(url, false, base));
	  if (!descriptors) {
	    that.href = state.serialize();
	    that.origin = state.getOrigin();
	    that.protocol = state.getProtocol();
	    that.username = state.getUsername();
	    that.password = state.getPassword();
	    that.host = state.getHost();
	    that.hostname = state.getHostname();
	    that.port = state.getPort();
	    that.pathname = state.getPathname();
	    that.search = state.getSearch();
	    that.searchParams = state.getSearchParams();
	    that.hash = state.getHash();
	  }
	};

	var URLPrototype = URLConstructor.prototype;

	var accessorDescriptor = function (getter, setter) {
	  return {
	    get: function () {
	      return getInternalURLState(this)[getter]();
	    },
	    set: setter && function (value) {
	      return getInternalURLState(this)[setter](value);
	    },
	    configurable: true,
	    enumerable: true
	  };
	};

	if (descriptors) {
	  // `URL.prototype.href` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-href
	  defineBuiltInAccessor(URLPrototype, 'href', accessorDescriptor('serialize', 'setHref'));
	  // `URL.prototype.origin` getter
	  // https://url.spec.whatwg.org/#dom-url-origin
	  defineBuiltInAccessor(URLPrototype, 'origin', accessorDescriptor('getOrigin'));
	  // `URL.prototype.protocol` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-protocol
	  defineBuiltInAccessor(URLPrototype, 'protocol', accessorDescriptor('getProtocol', 'setProtocol'));
	  // `URL.prototype.username` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-username
	  defineBuiltInAccessor(URLPrototype, 'username', accessorDescriptor('getUsername', 'setUsername'));
	  // `URL.prototype.password` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-password
	  defineBuiltInAccessor(URLPrototype, 'password', accessorDescriptor('getPassword', 'setPassword'));
	  // `URL.prototype.host` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-host
	  defineBuiltInAccessor(URLPrototype, 'host', accessorDescriptor('getHost', 'setHost'));
	  // `URL.prototype.hostname` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-hostname
	  defineBuiltInAccessor(URLPrototype, 'hostname', accessorDescriptor('getHostname', 'setHostname'));
	  // `URL.prototype.port` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-port
	  defineBuiltInAccessor(URLPrototype, 'port', accessorDescriptor('getPort', 'setPort'));
	  // `URL.prototype.pathname` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-pathname
	  defineBuiltInAccessor(URLPrototype, 'pathname', accessorDescriptor('getPathname', 'setPathname'));
	  // `URL.prototype.search` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-search
	  defineBuiltInAccessor(URLPrototype, 'search', accessorDescriptor('getSearch', 'setSearch'));
	  // `URL.prototype.searchParams` getter
	  // https://url.spec.whatwg.org/#dom-url-searchparams
	  defineBuiltInAccessor(URLPrototype, 'searchParams', accessorDescriptor('getSearchParams'));
	  // `URL.prototype.hash` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-hash
	  defineBuiltInAccessor(URLPrototype, 'hash', accessorDescriptor('getHash', 'setHash'));
	}

	// `URL.prototype.toJSON` method
	// https://url.spec.whatwg.org/#dom-url-tojson
	defineBuiltIn(URLPrototype, 'toJSON', function toJSON() {
	  return getInternalURLState(this).serialize();
	}, { enumerable: true });

	// `URL.prototype.toString` method
	// https://url.spec.whatwg.org/#URL-stringification-behavior
	defineBuiltIn(URLPrototype, 'toString', function toString() {
	  return getInternalURLState(this).serialize();
	}, { enumerable: true });

	if (NativeURL) {
	  var nativeCreateObjectURL = NativeURL.createObjectURL;
	  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
	  // `URL.createObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
	  if (nativeCreateObjectURL) defineBuiltIn(URLConstructor, 'createObjectURL', functionBindContext(nativeCreateObjectURL, NativeURL));
	  // `URL.revokeObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
	  if (nativeRevokeObjectURL) defineBuiltIn(URLConstructor, 'revokeObjectURL', functionBindContext(nativeRevokeObjectURL, NativeURL));
	}

	setToStringTag(URLConstructor, 'URL');

	_export({ global: true, constructor: true, forced: !urlConstructorDetection, sham: !descriptors }, {
	  URL: URLConstructor
	});

	var URL$1 = getBuiltIn('URL');

	// https://github.com/nodejs/node/issues/47505
	// https://github.com/denoland/deno/issues/18893
	var THROWS_WITHOUT_ARGUMENTS = urlConstructorDetection && fails(function () {
	  URL$1.canParse();
	});

	// `URL.canParse` method
	// https://url.spec.whatwg.org/#dom-url-canparse
	_export({ target: 'URL', stat: true, forced: !THROWS_WITHOUT_ARGUMENTS }, {
	  canParse: function canParse(url) {
	    var length = validateArgumentsLength(arguments.length, 1);
	    var urlString = toString_1$1(url);
	    var base = length < 2 || arguments[1] === undefined ? undefined : toString_1$1(arguments[1]);
	    try {
	      return !!new URL$1(urlString, base);
	    } catch (error) {
	      return false;
	    }
	  }
	});

	// `URL.prototype.toJSON` method
	// https://url.spec.whatwg.org/#dom-url-tojson
	_export({ target: 'URL', proto: true, enumerable: true }, {
	  toJSON: function toJSON() {
	    return functionCall(URL.prototype.toString, this);
	  }
	});

	var $URLSearchParams$1 = URLSearchParams;
	var URLSearchParamsPrototype$2 = $URLSearchParams$1.prototype;
	var append = functionUncurryThis(URLSearchParamsPrototype$2.append);
	var $delete = functionUncurryThis(URLSearchParamsPrototype$2['delete']);
	var forEach$1 = functionUncurryThis(URLSearchParamsPrototype$2.forEach);
	var push = functionUncurryThis([].push);
	var params$1 = new $URLSearchParams$1('a=1&a=2&b=3');

	params$1['delete']('a', 1);
	// `undefined` case is a Chromium 117 bug
	// https://bugs.chromium.org/p/v8/issues/detail?id=14222
	params$1['delete']('b', undefined);

	if (params$1 + '' !== 'a=2') {
	  defineBuiltIn(URLSearchParamsPrototype$2, 'delete', function (name /* , value */) {
	    var length = arguments.length;
	    var $value = length < 2 ? undefined : arguments[1];
	    if (length && $value === undefined) return $delete(this, name);
	    var entries = [];
	    forEach$1(this, function (v, k) { // also validates `this`
	      push(entries, { key: k, value: v });
	    });
	    validateArgumentsLength(length, 1);
	    var key = toString_1$1(name);
	    var value = toString_1$1($value);
	    var index = 0;
	    var dindex = 0;
	    var found = false;
	    var entriesLength = entries.length;
	    var entry;
	    while (index < entriesLength) {
	      entry = entries[index++];
	      if (found || entry.key === key) {
	        found = true;
	        $delete(this, entry.key);
	      } else dindex++;
	    }
	    while (dindex < entriesLength) {
	      entry = entries[dindex++];
	      if (!(entry.key === key && entry.value === value)) append(this, entry.key, entry.value);
	    }
	  }, { enumerable: true, unsafe: true });
	}

	var $URLSearchParams = URLSearchParams;
	var URLSearchParamsPrototype$1 = $URLSearchParams.prototype;
	var getAll = functionUncurryThis(URLSearchParamsPrototype$1.getAll);
	var $has = functionUncurryThis(URLSearchParamsPrototype$1.has);
	var params = new $URLSearchParams('a=1');

	// `undefined` case is a Chromium 117 bug
	// https://bugs.chromium.org/p/v8/issues/detail?id=14222
	if (params.has('a', 2) || !params.has('a', undefined)) {
	  defineBuiltIn(URLSearchParamsPrototype$1, 'has', function has(name /* , value */) {
	    var length = arguments.length;
	    var $value = length < 2 ? undefined : arguments[1];
	    if (length && $value === undefined) return $has(this, name);
	    var values = getAll(this, name); // also validates `this`
	    validateArgumentsLength(length, 1);
	    var value = toString_1$1($value);
	    var index = 0;
	    while (index < values.length) {
	      if (values[index++] === value) return true;
	    } return false;
	  }, { enumerable: true, unsafe: true });
	}

	var URLSearchParamsPrototype = URLSearchParams.prototype;
	var forEach = functionUncurryThis(URLSearchParamsPrototype.forEach);

	// `URLSearchParams.prototype.size` getter
	// https://github.com/whatwg/url/pull/734
	if (descriptors && !('size' in URLSearchParamsPrototype)) {
	  defineBuiltInAccessor(URLSearchParamsPrototype, 'size', {
	    get: function size() {
	      var count = 0;
	      forEach(this, function () { count++; });
	      return count;
	    },
	    configurable: true,
	    enumerable: true
	  });
	}

	function _typeof(o) {
	  "@babel/helpers - typeof";

	  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
	    return typeof o;
	  } : function (o) {
	    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	  }, _typeof(o);
	}

	createCommonjsModule(function (module) {
	  /**
	   * Copyright (c) 2014-present, Facebook, Inc.
	   *
	   * This source code is licensed under the MIT license found in the
	   * LICENSE file in the root directory of this source tree.
	   */

	  var runtime = function (exports) {

	    var Op = Object.prototype;
	    var hasOwn = Op.hasOwnProperty;
	    var undefined$1; // More compressible than void 0.
	    var $Symbol = typeof Symbol === "function" ? Symbol : {};
	    var iteratorSymbol = $Symbol.iterator || "@@iterator";
	    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
	    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
	    function define(obj, key, value) {
	      Object.defineProperty(obj, key, {
	        value: value,
	        enumerable: true,
	        configurable: true,
	        writable: true
	      });
	      return obj[key];
	    }
	    try {
	      // IE 8 has a broken Object.defineProperty that only works on DOM objects.
	      define({}, "");
	    } catch (err) {
	      define = function define(obj, key, value) {
	        return obj[key] = value;
	      };
	    }
	    function wrap(innerFn, outerFn, self, tryLocsList) {
	      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
	      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
	      var generator = Object.create(protoGenerator.prototype);
	      var context = new Context(tryLocsList || []);

	      // The ._invoke method unifies the implementations of the .next,
	      // .throw, and .return methods.
	      generator._invoke = makeInvokeMethod(innerFn, self, context);
	      return generator;
	    }
	    exports.wrap = wrap;

	    // Try/catch helper to minimize deoptimizations. Returns a completion
	    // record like context.tryEntries[i].completion. This interface could
	    // have been (and was previously) designed to take a closure to be
	    // invoked without arguments, but in all the cases we care about we
	    // already have an existing method we want to call, so there's no need
	    // to create a new function object. We can even get away with assuming
	    // the method takes exactly one argument, since that happens to be true
	    // in every case, so we don't have to touch the arguments object. The
	    // only additional allocation required is the completion record, which
	    // has a stable shape and so hopefully should be cheap to allocate.
	    function tryCatch(fn, obj, arg) {
	      try {
	        return {
	          type: "normal",
	          arg: fn.call(obj, arg)
	        };
	      } catch (err) {
	        return {
	          type: "throw",
	          arg: err
	        };
	      }
	    }
	    var GenStateSuspendedStart = "suspendedStart";
	    var GenStateSuspendedYield = "suspendedYield";
	    var GenStateExecuting = "executing";
	    var GenStateCompleted = "completed";

	    // Returning this object from the innerFn has the same effect as
	    // breaking out of the dispatch switch statement.
	    var ContinueSentinel = {};

	    // Dummy constructor functions that we use as the .constructor and
	    // .constructor.prototype properties for functions that return Generator
	    // objects. For full spec compliance, you may wish to configure your
	    // minifier not to mangle the names of these two functions.
	    function Generator() {}
	    function GeneratorFunction() {}
	    function GeneratorFunctionPrototype() {}

	    // This is a polyfill for %IteratorPrototype% for environments that
	    // don't natively support it.
	    var IteratorPrototype = {};
	    IteratorPrototype[iteratorSymbol] = function () {
	      return this;
	    };
	    var getProto = Object.getPrototypeOf;
	    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
	    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	      // This environment has a native %IteratorPrototype%; use it instead
	      // of the polyfill.
	      IteratorPrototype = NativeIteratorPrototype;
	    }
	    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
	    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	    GeneratorFunctionPrototype.constructor = GeneratorFunction;
	    GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction");

	    // Helper for defining the .next, .throw, and .return methods of the
	    // Iterator interface in terms of a single ._invoke method.
	    function defineIteratorMethods(prototype) {
	      ["next", "throw", "return"].forEach(function (method) {
	        define(prototype, method, function (arg) {
	          return this._invoke(method, arg);
	        });
	      });
	    }
	    exports.isGeneratorFunction = function (genFun) {
	      var ctor = typeof genFun === "function" && genFun.constructor;
	      return ctor ? ctor === GeneratorFunction ||
	      // For the native GeneratorFunction constructor, the best we can
	      // do is to check its .name property.
	      (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
	    };
	    exports.mark = function (genFun) {
	      if (Object.setPrototypeOf) {
	        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	      } else {
	        genFun.__proto__ = GeneratorFunctionPrototype;
	        define(genFun, toStringTagSymbol, "GeneratorFunction");
	      }
	      genFun.prototype = Object.create(Gp);
	      return genFun;
	    };

	    // Within the body of any async function, `await x` is transformed to
	    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	    // `hasOwn.call(value, "__await")` to determine if the yielded value is
	    // meant to be awaited.
	    exports.awrap = function (arg) {
	      return {
	        __await: arg
	      };
	    };
	    function AsyncIterator(generator, PromiseImpl) {
	      function invoke(method, arg, resolve, reject) {
	        var record = tryCatch(generator[method], generator, arg);
	        if (record.type === "throw") {
	          reject(record.arg);
	        } else {
	          var result = record.arg;
	          var value = result.value;
	          if (value && _typeof(value) === "object" && hasOwn.call(value, "__await")) {
	            return PromiseImpl.resolve(value.__await).then(function (value) {
	              invoke("next", value, resolve, reject);
	            }, function (err) {
	              invoke("throw", err, resolve, reject);
	            });
	          }
	          return PromiseImpl.resolve(value).then(function (unwrapped) {
	            // When a yielded Promise is resolved, its final value becomes
	            // the .value of the Promise<{value,done}> result for the
	            // current iteration.
	            result.value = unwrapped;
	            resolve(result);
	          }, function (error) {
	            // If a rejected Promise was yielded, throw the rejection back
	            // into the async generator function so it can be handled there.
	            return invoke("throw", error, resolve, reject);
	          });
	        }
	      }
	      var previousPromise;
	      function enqueue(method, arg) {
	        function callInvokeWithMethodAndArg() {
	          return new PromiseImpl(function (resolve, reject) {
	            invoke(method, arg, resolve, reject);
	          });
	        }
	        return previousPromise =
	        // If enqueue has been called before, then we want to wait until
	        // all previous Promises have been resolved before calling invoke,
	        // so that results are always delivered in the correct order. If
	        // enqueue has not been called before, then it is important to
	        // call invoke immediately, without waiting on a callback to fire,
	        // so that the async generator function has the opportunity to do
	        // any necessary setup in a predictable way. This predictability
	        // is why the Promise constructor synchronously invokes its
	        // executor callback, and why async functions synchronously
	        // execute code before the first await. Since we implement simple
	        // async functions in terms of async generators, it is especially
	        // important to get this right, even though it requires care.
	        previousPromise ? previousPromise.then(callInvokeWithMethodAndArg,
	        // Avoid propagating failures to Promises returned by later
	        // invocations of the iterator.
	        callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
	      }

	      // Define the unified helper method that is used to implement .next,
	      // .throw, and .return (see defineIteratorMethods).
	      this._invoke = enqueue;
	    }
	    defineIteratorMethods(AsyncIterator.prototype);
	    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
	      return this;
	    };
	    exports.AsyncIterator = AsyncIterator;

	    // Note that simple async functions are implemented on top of
	    // AsyncIterator objects; they just return a Promise for the value of
	    // the final result produced by the iterator.
	    exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
	      if (PromiseImpl === void 0) PromiseImpl = Promise;
	      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
	      return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
	      : iter.next().then(function (result) {
	        return result.done ? result.value : iter.next();
	      });
	    };
	    function makeInvokeMethod(innerFn, self, context) {
	      var state = GenStateSuspendedStart;
	      return function invoke(method, arg) {
	        if (state === GenStateExecuting) {
	          throw new Error("Generator is already running");
	        }
	        if (state === GenStateCompleted) {
	          if (method === "throw") {
	            throw arg;
	          }

	          // Be forgiving, per 25.3.3.3.3 of the spec:
	          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
	          return doneResult();
	        }
	        context.method = method;
	        context.arg = arg;
	        while (true) {
	          var delegate = context.delegate;
	          if (delegate) {
	            var delegateResult = maybeInvokeDelegate(delegate, context);
	            if (delegateResult) {
	              if (delegateResult === ContinueSentinel) continue;
	              return delegateResult;
	            }
	          }
	          if (context.method === "next") {
	            // Setting context._sent for legacy support of Babel's
	            // function.sent implementation.
	            context.sent = context._sent = context.arg;
	          } else if (context.method === "throw") {
	            if (state === GenStateSuspendedStart) {
	              state = GenStateCompleted;
	              throw context.arg;
	            }
	            context.dispatchException(context.arg);
	          } else if (context.method === "return") {
	            context.abrupt("return", context.arg);
	          }
	          state = GenStateExecuting;
	          var record = tryCatch(innerFn, self, context);
	          if (record.type === "normal") {
	            // If an exception is thrown from innerFn, we leave state ===
	            // GenStateExecuting and loop back for another invocation.
	            state = context.done ? GenStateCompleted : GenStateSuspendedYield;
	            if (record.arg === ContinueSentinel) {
	              continue;
	            }
	            return {
	              value: record.arg,
	              done: context.done
	            };
	          } else if (record.type === "throw") {
	            state = GenStateCompleted;
	            // Dispatch the exception by looping back around to the
	            // context.dispatchException(context.arg) call above.
	            context.method = "throw";
	            context.arg = record.arg;
	          }
	        }
	      };
	    }

	    // Call delegate.iterator[context.method](context.arg) and handle the
	    // result, either by returning a { value, done } result from the
	    // delegate iterator, or by modifying context.method and context.arg,
	    // setting context.delegate to null, and returning the ContinueSentinel.
	    function maybeInvokeDelegate(delegate, context) {
	      var method = delegate.iterator[context.method];
	      if (method === undefined$1) {
	        // A .throw or .return when the delegate iterator has no .throw
	        // method always terminates the yield* loop.
	        context.delegate = null;
	        if (context.method === "throw") {
	          // Note: ["return"] must be used for ES3 parsing compatibility.
	          if (delegate.iterator["return"]) {
	            // If the delegate iterator has a return method, give it a
	            // chance to clean up.
	            context.method = "return";
	            context.arg = undefined$1;
	            maybeInvokeDelegate(delegate, context);
	            if (context.method === "throw") {
	              // If maybeInvokeDelegate(context) changed context.method from
	              // "return" to "throw", let that override the TypeError below.
	              return ContinueSentinel;
	            }
	          }
	          context.method = "throw";
	          context.arg = new TypeError("The iterator does not provide a 'throw' method");
	        }
	        return ContinueSentinel;
	      }
	      var record = tryCatch(method, delegate.iterator, context.arg);
	      if (record.type === "throw") {
	        context.method = "throw";
	        context.arg = record.arg;
	        context.delegate = null;
	        return ContinueSentinel;
	      }
	      var info = record.arg;
	      if (!info) {
	        context.method = "throw";
	        context.arg = new TypeError("iterator result is not an object");
	        context.delegate = null;
	        return ContinueSentinel;
	      }
	      if (info.done) {
	        // Assign the result of the finished delegate to the temporary
	        // variable specified by delegate.resultName (see delegateYield).
	        context[delegate.resultName] = info.value;

	        // Resume execution at the desired location (see delegateYield).
	        context.next = delegate.nextLoc;

	        // If context.method was "throw" but the delegate handled the
	        // exception, let the outer generator proceed normally. If
	        // context.method was "next", forget context.arg since it has been
	        // "consumed" by the delegate iterator. If context.method was
	        // "return", allow the original .return call to continue in the
	        // outer generator.
	        if (context.method !== "return") {
	          context.method = "next";
	          context.arg = undefined$1;
	        }
	      } else {
	        // Re-yield the result returned by the delegate method.
	        return info;
	      }

	      // The delegate iterator is finished, so forget it and continue with
	      // the outer generator.
	      context.delegate = null;
	      return ContinueSentinel;
	    }

	    // Define Generator.prototype.{next,throw,return} in terms of the
	    // unified ._invoke helper method.
	    defineIteratorMethods(Gp);
	    define(Gp, toStringTagSymbol, "Generator");

	    // A Generator should always return itself as the iterator object when the
	    // @@iterator function is called on it. Some browsers' implementations of the
	    // iterator prototype chain incorrectly implement this, causing the Generator
	    // object to not be returned from this call. This ensures that doesn't happen.
	    // See https://github.com/facebook/regenerator/issues/274 for more details.
	    Gp[iteratorSymbol] = function () {
	      return this;
	    };
	    Gp.toString = function () {
	      return "[object Generator]";
	    };
	    function pushTryEntry(locs) {
	      var entry = {
	        tryLoc: locs[0]
	      };
	      if (1 in locs) {
	        entry.catchLoc = locs[1];
	      }
	      if (2 in locs) {
	        entry.finallyLoc = locs[2];
	        entry.afterLoc = locs[3];
	      }
	      this.tryEntries.push(entry);
	    }
	    function resetTryEntry(entry) {
	      var record = entry.completion || {};
	      record.type = "normal";
	      delete record.arg;
	      entry.completion = record;
	    }
	    function Context(tryLocsList) {
	      // The root entry object (effectively a try statement without a catch
	      // or a finally block) gives us a place to store values thrown from
	      // locations where there is no enclosing try statement.
	      this.tryEntries = [{
	        tryLoc: "root"
	      }];
	      tryLocsList.forEach(pushTryEntry, this);
	      this.reset(true);
	    }
	    exports.keys = function (object) {
	      var keys = [];
	      for (var key in object) {
	        keys.push(key);
	      }
	      keys.reverse();

	      // Rather than returning an object with a next method, we keep
	      // things simple and return the next function itself.
	      return function next() {
	        while (keys.length) {
	          var key = keys.pop();
	          if (key in object) {
	            next.value = key;
	            next.done = false;
	            return next;
	          }
	        }

	        // To avoid creating an additional object, we just hang the .value
	        // and .done properties off the next function object itself. This
	        // also ensures that the minifier will not anonymize the function.
	        next.done = true;
	        return next;
	      };
	    };
	    function values(iterable) {
	      if (iterable) {
	        var iteratorMethod = iterable[iteratorSymbol];
	        if (iteratorMethod) {
	          return iteratorMethod.call(iterable);
	        }
	        if (typeof iterable.next === "function") {
	          return iterable;
	        }
	        if (!isNaN(iterable.length)) {
	          var i = -1,
	            next = function next() {
	              while (++i < iterable.length) {
	                if (hasOwn.call(iterable, i)) {
	                  next.value = iterable[i];
	                  next.done = false;
	                  return next;
	                }
	              }
	              next.value = undefined$1;
	              next.done = true;
	              return next;
	            };
	          return next.next = next;
	        }
	      }

	      // Return an iterator with no values.
	      return {
	        next: doneResult
	      };
	    }
	    exports.values = values;
	    function doneResult() {
	      return {
	        value: undefined$1,
	        done: true
	      };
	    }
	    Context.prototype = {
	      constructor: Context,
	      reset: function reset(skipTempReset) {
	        this.prev = 0;
	        this.next = 0;
	        // Resetting context._sent for legacy support of Babel's
	        // function.sent implementation.
	        this.sent = this._sent = undefined$1;
	        this.done = false;
	        this.delegate = null;
	        this.method = "next";
	        this.arg = undefined$1;
	        this.tryEntries.forEach(resetTryEntry);
	        if (!skipTempReset) {
	          for (var name in this) {
	            // Not sure about the optimal order of these conditions:
	            if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
	              this[name] = undefined$1;
	            }
	          }
	        }
	      },
	      stop: function stop() {
	        this.done = true;
	        var rootEntry = this.tryEntries[0];
	        var rootRecord = rootEntry.completion;
	        if (rootRecord.type === "throw") {
	          throw rootRecord.arg;
	        }
	        return this.rval;
	      },
	      dispatchException: function dispatchException(exception) {
	        if (this.done) {
	          throw exception;
	        }
	        var context = this;
	        function handle(loc, caught) {
	          record.type = "throw";
	          record.arg = exception;
	          context.next = loc;
	          if (caught) {
	            // If the dispatched exception was caught by a catch block,
	            // then let that catch block handle the exception normally.
	            context.method = "next";
	            context.arg = undefined$1;
	          }
	          return !!caught;
	        }
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];
	          var record = entry.completion;
	          if (entry.tryLoc === "root") {
	            // Exception thrown outside of any try block that could handle
	            // it, so set the completion value of the entire function to
	            // throw the exception.
	            return handle("end");
	          }
	          if (entry.tryLoc <= this.prev) {
	            var hasCatch = hasOwn.call(entry, "catchLoc");
	            var hasFinally = hasOwn.call(entry, "finallyLoc");
	            if (hasCatch && hasFinally) {
	              if (this.prev < entry.catchLoc) {
	                return handle(entry.catchLoc, true);
	              } else if (this.prev < entry.finallyLoc) {
	                return handle(entry.finallyLoc);
	              }
	            } else if (hasCatch) {
	              if (this.prev < entry.catchLoc) {
	                return handle(entry.catchLoc, true);
	              }
	            } else if (hasFinally) {
	              if (this.prev < entry.finallyLoc) {
	                return handle(entry.finallyLoc);
	              }
	            } else {
	              throw new Error("try statement without catch or finally");
	            }
	          }
	        }
	      },
	      abrupt: function abrupt(type, arg) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];
	          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
	            var finallyEntry = entry;
	            break;
	          }
	        }
	        if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
	          // Ignore the finally entry if control is not jumping to a
	          // location outside the try/catch block.
	          finallyEntry = null;
	        }
	        var record = finallyEntry ? finallyEntry.completion : {};
	        record.type = type;
	        record.arg = arg;
	        if (finallyEntry) {
	          this.method = "next";
	          this.next = finallyEntry.finallyLoc;
	          return ContinueSentinel;
	        }
	        return this.complete(record);
	      },
	      complete: function complete(record, afterLoc) {
	        if (record.type === "throw") {
	          throw record.arg;
	        }
	        if (record.type === "break" || record.type === "continue") {
	          this.next = record.arg;
	        } else if (record.type === "return") {
	          this.rval = this.arg = record.arg;
	          this.method = "return";
	          this.next = "end";
	        } else if (record.type === "normal" && afterLoc) {
	          this.next = afterLoc;
	        }
	        return ContinueSentinel;
	      },
	      finish: function finish(finallyLoc) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];
	          if (entry.finallyLoc === finallyLoc) {
	            this.complete(entry.completion, entry.afterLoc);
	            resetTryEntry(entry);
	            return ContinueSentinel;
	          }
	        }
	      },
	      "catch": function _catch(tryLoc) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];
	          if (entry.tryLoc === tryLoc) {
	            var record = entry.completion;
	            if (record.type === "throw") {
	              var thrown = record.arg;
	              resetTryEntry(entry);
	            }
	            return thrown;
	          }
	        }

	        // The context.catch method must only be called with a location
	        // argument that corresponds to a known catch block.
	        throw new Error("illegal catch attempt");
	      },
	      delegateYield: function delegateYield(iterable, resultName, nextLoc) {
	        this.delegate = {
	          iterator: values(iterable),
	          resultName: resultName,
	          nextLoc: nextLoc
	        };
	        if (this.method === "next") {
	          // Deliberately forget the last sent value so that we don't
	          // accidentally pass it on to the delegate.
	          this.arg = undefined$1;
	        }
	        return ContinueSentinel;
	      }
	    };

	    // Regardless of whether this script is executing as a CommonJS module
	    // or not, return the runtime object so that we can declare the variable
	    // regeneratorRuntime in the outer scope, which allows this module to be
	    // injected easily by `bin/regenerator --include-runtime script.js`.
	    return exports;
	  }(
	  // If this script is executing as a CommonJS module, use module.exports
	  // as the regeneratorRuntime namespace. Otherwise create a new empty
	  // object. Either way, the resulting object will be used to initialize
	  // the regeneratorRuntime variable at the top of this file.
	  module.exports );
	  try {
	    regeneratorRuntime = runtime;
	  } catch (accidentalStrictMode) {
	    // This module should not be running in strict mode, so the above
	    // assignment should always work unless something is misconfigured. Just
	    // in case runtime.js accidentally runs in strict mode, we can escape
	    // strict mode using a global Function call. This could conceivably fail
	    // if a Content Security Policy forbids using Function, but in that case
	    // the proper solution is to fix the accidental strict mode problem. If
	    // you've misconfigured your bundler to force strict mode and applied a
	    // CSP to forbid Function, and you're not willing to fix either of those
	    // problems, please detail your unique predicament in a GitHub issue.
	    Function("r", "regeneratorRuntime = r")(runtime);
	  }
	});

	var global$1 = typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof global$1 !== 'undefined' && global$1;
	var support = {
	  searchParams: 'URLSearchParams' in global$1,
	  iterable: 'Symbol' in global$1 && 'iterator' in Symbol,
	  blob: 'FileReader' in global$1 && 'Blob' in global$1 && function () {
	    try {
	      new Blob();
	      return true;
	    } catch (e) {
	      return false;
	    }
	  }(),
	  formData: 'FormData' in global$1,
	  arrayBuffer: 'ArrayBuffer' in global$1
	};
	function isDataView(obj) {
	  return obj && DataView.prototype.isPrototypeOf(obj);
	}
	if (support.arrayBuffer) {
	  var viewClasses = ['[object Int8Array]', '[object Uint8Array]', '[object Uint8ClampedArray]', '[object Int16Array]', '[object Uint16Array]', '[object Int32Array]', '[object Uint32Array]', '[object Float32Array]', '[object Float64Array]'];
	  var isArrayBufferView = ArrayBuffer.isView || function (obj) {
	    return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
	  };
	}
	function normalizeName(name) {
	  if (typeof name !== 'string') {
	    name = String(name);
	  }
	  if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
	    throw new TypeError('Invalid character in header field name');
	  }
	  return name.toLowerCase();
	}
	function normalizeValue(value) {
	  if (typeof value !== 'string') {
	    value = String(value);
	  }
	  return value;
	}

	// Build a destructive iterator for the value list
	function iteratorFor(items) {
	  var iterator = {
	    next: function next() {
	      var value = items.shift();
	      return {
	        done: value === undefined,
	        value: value
	      };
	    }
	  };
	  if (support.iterable) {
	    iterator[Symbol.iterator] = function () {
	      return iterator;
	    };
	  }
	  return iterator;
	}
	function Headers(headers) {
	  this.map = {};
	  if (headers instanceof Headers) {
	    headers.forEach(function (value, name) {
	      this.append(name, value);
	    }, this);
	  } else if (Array.isArray(headers)) {
	    headers.forEach(function (header) {
	      this.append(header[0], header[1]);
	    }, this);
	  } else if (headers) {
	    Object.getOwnPropertyNames(headers).forEach(function (name) {
	      this.append(name, headers[name]);
	    }, this);
	  }
	}
	Headers.prototype.append = function (name, value) {
	  name = normalizeName(name);
	  value = normalizeValue(value);
	  var oldValue = this.map[name];
	  this.map[name] = oldValue ? oldValue + ', ' + value : value;
	};
	Headers.prototype['delete'] = function (name) {
	  delete this.map[normalizeName(name)];
	};
	Headers.prototype.get = function (name) {
	  name = normalizeName(name);
	  return this.has(name) ? this.map[name] : null;
	};
	Headers.prototype.has = function (name) {
	  return this.map.hasOwnProperty(normalizeName(name));
	};
	Headers.prototype.set = function (name, value) {
	  this.map[normalizeName(name)] = normalizeValue(value);
	};
	Headers.prototype.forEach = function (callback, thisArg) {
	  for (var name in this.map) {
	    if (this.map.hasOwnProperty(name)) {
	      callback.call(thisArg, this.map[name], name, this);
	    }
	  }
	};
	Headers.prototype.keys = function () {
	  var items = [];
	  this.forEach(function (value, name) {
	    items.push(name);
	  });
	  return iteratorFor(items);
	};
	Headers.prototype.values = function () {
	  var items = [];
	  this.forEach(function (value) {
	    items.push(value);
	  });
	  return iteratorFor(items);
	};
	Headers.prototype.entries = function () {
	  var items = [];
	  this.forEach(function (value, name) {
	    items.push([name, value]);
	  });
	  return iteratorFor(items);
	};
	if (support.iterable) {
	  Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
	}
	function consumed(body) {
	  if (body.bodyUsed) {
	    return Promise.reject(new TypeError('Already read'));
	  }
	  body.bodyUsed = true;
	}
	function fileReaderReady(reader) {
	  return new Promise(function (resolve, reject) {
	    reader.onload = function () {
	      resolve(reader.result);
	    };
	    reader.onerror = function () {
	      reject(reader.error);
	    };
	  });
	}
	function readBlobAsArrayBuffer(blob) {
	  var reader = new FileReader();
	  var promise = fileReaderReady(reader);
	  reader.readAsArrayBuffer(blob);
	  return promise;
	}
	function readBlobAsText(blob) {
	  var reader = new FileReader();
	  var promise = fileReaderReady(reader);
	  reader.readAsText(blob);
	  return promise;
	}
	function readArrayBufferAsText(buf) {
	  var view = new Uint8Array(buf);
	  var chars = new Array(view.length);
	  for (var i = 0; i < view.length; i++) {
	    chars[i] = String.fromCharCode(view[i]);
	  }
	  return chars.join('');
	}
	function bufferClone(buf) {
	  if (buf.slice) {
	    return buf.slice(0);
	  } else {
	    var view = new Uint8Array(buf.byteLength);
	    view.set(new Uint8Array(buf));
	    return view.buffer;
	  }
	}
	function Body() {
	  this.bodyUsed = false;
	  this._initBody = function (body) {
	    /*
	      fetch-mock wraps the Response object in an ES6 Proxy to
	      provide useful test harness features such as flush. However, on
	      ES5 browsers without fetch or Proxy support pollyfills must be used;
	      the proxy-pollyfill is unable to proxy an attribute unless it exists
	      on the object before the Proxy is created. This change ensures
	      Response.bodyUsed exists on the instance, while maintaining the
	      semantic of setting Request.bodyUsed in the constructor before
	      _initBody is called.
	    */
	    this.bodyUsed = this.bodyUsed;
	    this._bodyInit = body;
	    if (!body) {
	      this._bodyText = '';
	    } else if (typeof body === 'string') {
	      this._bodyText = body;
	    } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	      this._bodyBlob = body;
	    } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	      this._bodyFormData = body;
	    } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	      this._bodyText = body.toString();
	    } else if (support.arrayBuffer && support.blob && isDataView(body)) {
	      this._bodyArrayBuffer = bufferClone(body.buffer);
	      // IE 10-11 can't handle a DataView body.
	      this._bodyInit = new Blob([this._bodyArrayBuffer]);
	    } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
	      this._bodyArrayBuffer = bufferClone(body);
	    } else {
	      this._bodyText = body = Object.prototype.toString.call(body);
	    }
	    if (!this.headers.get('content-type')) {
	      if (typeof body === 'string') {
	        this.headers.set('content-type', 'text/plain;charset=UTF-8');
	      } else if (this._bodyBlob && this._bodyBlob.type) {
	        this.headers.set('content-type', this._bodyBlob.type);
	      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	        this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	      }
	    }
	  };
	  if (support.blob) {
	    this.blob = function () {
	      var rejected = consumed(this);
	      if (rejected) {
	        return rejected;
	      }
	      if (this._bodyBlob) {
	        return Promise.resolve(this._bodyBlob);
	      } else if (this._bodyArrayBuffer) {
	        return Promise.resolve(new Blob([this._bodyArrayBuffer]));
	      } else if (this._bodyFormData) {
	        throw new Error('could not read FormData body as blob');
	      } else {
	        return Promise.resolve(new Blob([this._bodyText]));
	      }
	    };
	    this.arrayBuffer = function () {
	      if (this._bodyArrayBuffer) {
	        var isConsumed = consumed(this);
	        if (isConsumed) {
	          return isConsumed;
	        }
	        if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
	          return Promise.resolve(this._bodyArrayBuffer.buffer.slice(this._bodyArrayBuffer.byteOffset, this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength));
	        } else {
	          return Promise.resolve(this._bodyArrayBuffer);
	        }
	      } else {
	        return this.blob().then(readBlobAsArrayBuffer);
	      }
	    };
	  }
	  this.text = function () {
	    var rejected = consumed(this);
	    if (rejected) {
	      return rejected;
	    }
	    if (this._bodyBlob) {
	      return readBlobAsText(this._bodyBlob);
	    } else if (this._bodyArrayBuffer) {
	      return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
	    } else if (this._bodyFormData) {
	      throw new Error('could not read FormData body as text');
	    } else {
	      return Promise.resolve(this._bodyText);
	    }
	  };
	  if (support.formData) {
	    this.formData = function () {
	      return this.text().then(decode);
	    };
	  }
	  this.json = function () {
	    return this.text().then(JSON.parse);
	  };
	  return this;
	}

	// HTTP methods whose capitalization should be normalized
	var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];
	function normalizeMethod(method) {
	  var upcased = method.toUpperCase();
	  return methods.indexOf(upcased) > -1 ? upcased : method;
	}
	function Request(input, options) {
	  if (!(this instanceof Request)) {
	    throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
	  }
	  options = options || {};
	  var body = options.body;
	  if (input instanceof Request) {
	    if (input.bodyUsed) {
	      throw new TypeError('Already read');
	    }
	    this.url = input.url;
	    this.credentials = input.credentials;
	    if (!options.headers) {
	      this.headers = new Headers(input.headers);
	    }
	    this.method = input.method;
	    this.mode = input.mode;
	    this.signal = input.signal;
	    if (!body && input._bodyInit != null) {
	      body = input._bodyInit;
	      input.bodyUsed = true;
	    }
	  } else {
	    this.url = String(input);
	  }
	  this.credentials = options.credentials || this.credentials || 'same-origin';
	  if (options.headers || !this.headers) {
	    this.headers = new Headers(options.headers);
	  }
	  this.method = normalizeMethod(options.method || this.method || 'GET');
	  this.mode = options.mode || this.mode || null;
	  this.signal = options.signal || this.signal;
	  this.referrer = null;
	  if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	    throw new TypeError('Body not allowed for GET or HEAD requests');
	  }
	  this._initBody(body);
	  if (this.method === 'GET' || this.method === 'HEAD') {
	    if (options.cache === 'no-store' || options.cache === 'no-cache') {
	      // Search for a '_' parameter in the query string
	      var reParamSearch = /([?&])_=[^&]*/;
	      if (reParamSearch.test(this.url)) {
	        // If it already exists then set the value with the current time
	        this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
	      } else {
	        // Otherwise add a new '_' parameter to the end with the current time
	        var reQueryString = /\?/;
	        this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
	      }
	    }
	  }
	}
	Request.prototype.clone = function () {
	  return new Request(this, {
	    body: this._bodyInit
	  });
	};
	function decode(body) {
	  var form = new FormData();
	  body.trim().split('&').forEach(function (bytes) {
	    if (bytes) {
	      var split = bytes.split('=');
	      var name = split.shift().replace(/\+/g, ' ');
	      var value = split.join('=').replace(/\+/g, ' ');
	      form.append(decodeURIComponent(name), decodeURIComponent(value));
	    }
	  });
	  return form;
	}
	function parseHeaders(rawHeaders) {
	  var headers = new Headers();
	  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
	  // https://tools.ietf.org/html/rfc7230#section-3.2
	  var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
	  preProcessedHeaders.split(/\r?\n/).forEach(function (line) {
	    var parts = line.split(':');
	    var key = parts.shift().trim();
	    if (key) {
	      var value = parts.join(':').trim();
	      headers.append(key, value);
	    }
	  });
	  return headers;
	}
	Body.call(Request.prototype);
	function Response(bodyInit, options) {
	  if (!(this instanceof Response)) {
	    throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
	  }
	  if (!options) {
	    options = {};
	  }
	  this.type = 'default';
	  this.status = options.status === undefined ? 200 : options.status;
	  this.ok = this.status >= 200 && this.status < 300;
	  this.statusText = 'statusText' in options ? options.statusText : '';
	  this.headers = new Headers(options.headers);
	  this.url = options.url || '';
	  this._initBody(bodyInit);
	}
	Body.call(Response.prototype);
	Response.prototype.clone = function () {
	  return new Response(this._bodyInit, {
	    status: this.status,
	    statusText: this.statusText,
	    headers: new Headers(this.headers),
	    url: this.url
	  });
	};
	Response.error = function () {
	  var response = new Response(null, {
	    status: 0,
	    statusText: ''
	  });
	  response.type = 'error';
	  return response;
	};
	var redirectStatuses = [301, 302, 303, 307, 308];
	Response.redirect = function (url, status) {
	  if (redirectStatuses.indexOf(status) === -1) {
	    throw new RangeError('Invalid status code');
	  }
	  return new Response(null, {
	    status: status,
	    headers: {
	      location: url
	    }
	  });
	};
	var DOMException = global$1.DOMException;
	try {
	  new DOMException();
	} catch (err) {
	  DOMException = function DOMException(message, name) {
	    this.message = message;
	    this.name = name;
	    var error = Error(message);
	    this.stack = error.stack;
	  };
	  DOMException.prototype = Object.create(Error.prototype);
	  DOMException.prototype.constructor = DOMException;
	}
	function fetch$1(input, init) {
	  return new Promise(function (resolve, reject) {
	    var request = new Request(input, init);
	    if (request.signal && request.signal.aborted) {
	      return reject(new DOMException('Aborted', 'AbortError'));
	    }
	    var xhr = new XMLHttpRequest();
	    function abortXhr() {
	      xhr.abort();
	    }
	    xhr.onload = function () {
	      var options = {
	        status: xhr.status,
	        statusText: xhr.statusText,
	        headers: parseHeaders(xhr.getAllResponseHeaders() || '')
	      };
	      options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
	      var body = 'response' in xhr ? xhr.response : xhr.responseText;
	      setTimeout(function () {
	        resolve(new Response(body, options));
	      }, 0);
	    };
	    xhr.onerror = function () {
	      setTimeout(function () {
	        reject(new TypeError('Network request failed'));
	      }, 0);
	    };
	    xhr.ontimeout = function () {
	      setTimeout(function () {
	        reject(new TypeError('Network request failed'));
	      }, 0);
	    };
	    xhr.onabort = function () {
	      setTimeout(function () {
	        reject(new DOMException('Aborted', 'AbortError'));
	      }, 0);
	    };
	    function fixUrl(url) {
	      try {
	        return url === '' && global$1.location.href ? global$1.location.href : url;
	      } catch (e) {
	        return url;
	      }
	    }
	    xhr.open(request.method, fixUrl(request.url), true);
	    if (request.credentials === 'include') {
	      xhr.withCredentials = true;
	    } else if (request.credentials === 'omit') {
	      xhr.withCredentials = false;
	    }
	    if ('responseType' in xhr) {
	      if (support.blob) {
	        xhr.responseType = 'blob';
	      } else if (support.arrayBuffer && request.headers.get('Content-Type') && request.headers.get('Content-Type').indexOf('application/octet-stream') !== -1) {
	        xhr.responseType = 'arraybuffer';
	      }
	    }
	    if (init && _typeof(init.headers) === 'object' && !(init.headers instanceof Headers)) {
	      Object.getOwnPropertyNames(init.headers).forEach(function (name) {
	        xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
	      });
	    } else {
	      request.headers.forEach(function (value, name) {
	        xhr.setRequestHeader(name, value);
	      });
	    }
	    if (request.signal) {
	      request.signal.addEventListener('abort', abortXhr);
	      xhr.onreadystatechange = function () {
	        // DONE (success or failure)
	        if (xhr.readyState === 4) {
	          request.signal.removeEventListener('abort', abortXhr);
	        }
	      };
	    }
	    xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
	  });
	}
	fetch$1.polyfill = true;
	if (!global$1.fetch) {
	  global$1.fetch = fetch$1;
	  global$1.Headers = Headers;
	  global$1.Request = Request;
	  global$1.Response = Response;
	}

	function __rest(s, e) {
	  var t = {};
	  for (var p in s) {
	    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
	  }
	  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
	    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
	  }
	  return t;
	}

	var winchan = createCommonjsModule(function (module) {
	  var WinChan = function () {
	    var RELAY_FRAME_NAME = "__winchan_relay_frame";
	    var CLOSE_CMD = "die";

	    // a portable addListener implementation
	    function addListener(w, event, cb) {
	      if (w.attachEvent) w.attachEvent('on' + event, cb);else if (w.addEventListener) w.addEventListener(event, cb, false);
	    }

	    // a portable removeListener implementation
	    function removeListener(w, event, cb) {
	      if (w.detachEvent) w.detachEvent('on' + event, cb);else if (w.removeEventListener) w.removeEventListener(event, cb, false);
	    }

	    // checking for IE8 or above
	    function isInternetExplorer() {
	      if (typeof navigator === 'undefined') {
	        return false;
	      }
	      var rv = -1; // Return value assumes failure.
	      var ua = navigator.userAgent;
	      if (navigator.appName === 'Microsoft Internet Explorer') {
	        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
	        if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
	      }
	      // IE > 11
	      else if (ua.indexOf("Trident") > -1) {
	        var re = new RegExp("rv:([0-9]{2,2}[\.0-9]{0,})");
	        if (re.exec(ua) !== null) {
	          rv = parseFloat(RegExp.$1);
	        }
	      }
	      return rv >= 8;
	    }

	    // checking Mobile Firefox (Fennec)
	    function isFennec() {
	      try {
	        // We must check for both XUL and Java versions of Fennec.  Both have
	        // distinct UA strings.
	        var userAgent = navigator.userAgent;
	        return userAgent.indexOf('Fennec/') != -1 ||
	        // XUL
	        userAgent.indexOf('Firefox/') != -1 && userAgent.indexOf('Android') != -1; // Java
	      } catch (e) {}
	      return false;
	    }

	    // feature checking to see if this platform is supported at all
	    function isSupported() {
	      return typeof window !== 'undefined' && window.JSON && window.JSON.stringify && window.JSON.parse && window.postMessage;
	    }

	    // given a URL, extract the origin. Taken from: https://github.com/firebase/firebase-simple-login/blob/d2cb95b9f812d8488bdbfba51c3a7c153ba1a074/js/src/simple-login/transports/WinChan.js#L25-L30
	    function extractOrigin(url) {
	      if (!/^https?:\/\//.test(url)) url = window.location.href;
	      var m = /^(https?:\/\/[\-_a-zA-Z\.0-9:]+)/.exec(url);
	      if (m) return m[1];
	      return url;
	    }

	    // find the relay iframe in the opener
	    function findRelay() {
	      var frames = window.opener.frames;
	      for (var i = frames.length - 1; i >= 0; i--) {
	        try {
	          if (frames[i].location.protocol === window.location.protocol && frames[i].location.host === window.location.host && frames[i].name === RELAY_FRAME_NAME) {
	            return frames[i];
	          }
	        } catch (e) {}
	      }
	      return;
	    }
	    var isIE = isInternetExplorer();
	    if (isSupported()) {
	      /*  General flow:
	       *                  0. user clicks
	       *  (IE SPECIFIC)   1. caller adds relay iframe (served from trusted domain) to DOM
	       *                  2. caller opens window (with content from trusted domain)
	       *                  3. window on opening adds a listener to 'message'
	       *  (IE SPECIFIC)   4. window on opening finds iframe
	       *                  5. window checks if iframe is "loaded" - has a 'doPost' function yet
	       *  (IE SPECIFIC5)  5a. if iframe.doPost exists, window uses it to send ready event to caller
	       *  (IE SPECIFIC5)  5b. if iframe.doPost doesn't exist, window waits for frame ready
	       *  (IE SPECIFIC5)  5bi. once ready, window calls iframe.doPost to send ready event
	       *                  6. caller upon reciept of 'ready', sends args
	       */
	      return {
	        open: function open(opts, cb) {
	          if (!cb) throw "missing required callback argument";

	          // test required options
	          var err;
	          if (!opts.url) err = "missing required 'url' parameter";
	          if (!opts.relay_url) err = "missing required 'relay_url' parameter";
	          if (err) setTimeout(function () {
	            cb(err);
	          }, 0);

	          // supply default options
	          if (!opts.window_name) opts.window_name = null;
	          if (!opts.window_features || isFennec()) opts.window_features = undefined;

	          // opts.params may be undefined

	          var iframe;

	          // sanity check, are url and relay_url the same origin?
	          var origin = opts.origin || extractOrigin(opts.url);
	          if (origin !== extractOrigin(opts.relay_url)) {
	            return setTimeout(function () {
	              cb('invalid arguments: origin of url and relay_url must match');
	            }, 0);
	          }
	          var messageTarget;
	          if (isIE) {
	            // first we need to add a "relay" iframe to the document that's served
	            // from the target domain.  We can postmessage into a iframe, but not a
	            // window
	            iframe = document.createElement("iframe");
	            // iframe.setAttribute('name', framename);
	            iframe.setAttribute('src', opts.relay_url);
	            iframe.style.display = "none";
	            iframe.setAttribute('name', RELAY_FRAME_NAME);
	            document.body.appendChild(iframe);
	            messageTarget = iframe.contentWindow;
	          }
	          var w = opts.popup || window.open(opts.url, opts.window_name, opts.window_features);
	          if (opts.popup) {
	            w.location.href = opts.url;
	          }
	          if (!messageTarget) messageTarget = w;

	          // lets listen in case the window blows up before telling us
	          var closeInterval = setInterval(function () {
	            if (w && w.closed) {
	              cleanup();
	              if (cb) {
	                cb('User closed the popup window');
	                cb = null;
	              }
	            }
	          }, 500);
	          var req = JSON.stringify({
	            a: 'request',
	            d: opts.params
	          });

	          // cleanup on unload
	          function cleanup() {
	            if (iframe) document.body.removeChild(iframe);
	            iframe = undefined;
	            if (closeInterval) closeInterval = clearInterval(closeInterval);
	            removeListener(window, 'message', onMessage);
	            removeListener(window, 'unload', cleanup);
	            if (w) {
	              try {
	                w.close();
	              } catch (securityViolation) {
	                // This happens in Opera 12 sometimes
	                // see https://github.com/mozilla/browserid/issues/1844
	                messageTarget.postMessage(CLOSE_CMD, origin);
	              }
	            }
	            w = messageTarget = undefined;
	          }
	          addListener(window, 'unload', cleanup);
	          function onMessage(e) {
	            if (e.origin !== origin) {
	              return;
	            }
	            try {
	              var d = JSON.parse(e.data);
	            } catch (err) {
	              if (cb) {
	                return cb(err);
	              } else {
	                throw err;
	              }
	            }
	            if (d.a === 'ready') {
	              messageTarget.postMessage(req, origin);
	            } else if (d.a === 'error') {
	              cleanup();
	              if (cb) {
	                cb(d.d);
	                cb = null;
	              }
	            } else if (d.a === 'response') {
	              cleanup();
	              if (cb) {
	                cb(null, d.d);
	                cb = null;
	              }
	            }
	          }
	          addListener(window, 'message', onMessage);
	          return {
	            originalPopup: w,
	            close: cleanup,
	            focus: function focus() {
	              if (w) {
	                try {
	                  w.focus();
	                } catch (e) {
	                  // IE7 blows up here, do nothing
	                }
	              }
	            }
	          };
	        },
	        onOpen: function onOpen(cb) {
	          var o = "*";
	          var msgTarget = isIE ? findRelay() : window.opener;
	          if (!msgTarget) throw "can't find relay frame";
	          function doPost(msg) {
	            msg = JSON.stringify(msg);
	            if (isIE) msgTarget.doPost(msg, o);else msgTarget.postMessage(msg, o);
	          }
	          function onMessage(e) {
	            // only one message gets through, but let's make sure it's actually
	            // the message we're looking for (other code may be using
	            // postmessage) - we do this by ensuring the payload can
	            // be parsed, and it's got an 'a' (action) value of 'request'.
	            var d;
	            try {
	              d = JSON.parse(e.data);
	            } catch (err) {}
	            if (!d || d.a !== 'request') return;
	            removeListener(window, 'message', onMessage);
	            o = e.origin;
	            if (cb) {
	              // this setTimeout is critically important for IE8 -
	              // in ie8 sometimes addListener for 'message' can synchronously
	              // cause your callback to be invoked.  awesome.
	              setTimeout(function () {
	                cb(o, d.d, function (r) {
	                  cb = undefined;
	                  doPost({
	                    a: 'response',
	                    d: r
	                  });
	                });
	              }, 0);
	            }
	          }
	          function onDie(e) {
	            if (e.data === CLOSE_CMD) {
	              try {
	                window.close();
	              } catch (o_O) {}
	            }
	          }
	          addListener(isIE ? msgTarget : window, 'message', onMessage);
	          addListener(isIE ? msgTarget : window, 'message', onDie);

	          // we cannot post to our parent that we're ready before the iframe
	          // is loaded. (IE specific possible failure)
	          try {
	            doPost({
	              a: "ready"
	            });
	          } catch (e) {
	            // this code should never be exectued outside IE
	            addListener(msgTarget, 'load', function (e) {
	              doPost({
	                a: "ready"
	              });
	            });
	          }

	          // if window is unloaded and the client hasn't called cb, it's an error
	          var onUnload = function onUnload() {
	            try {
	              // IE8 doesn't like this...
	              removeListener(isIE ? msgTarget : window, 'message', onDie);
	            } catch (ohWell) {}
	            if (cb) doPost({
	              a: 'error',
	              d: 'client closed window'
	            });
	            cb = undefined;
	            // explicitly close the window, in case the client is trying to reload or nav
	            try {
	              window.close();
	            } catch (e) {}
	          };
	          addListener(window, 'unload', onUnload);
	          return {
	            detach: function detach() {
	              removeListener(window, 'unload', onUnload);
	            }
	          };
	        }
	      };
	    } else {
	      return {
	        open: function open(url, winopts, arg, cb) {
	          setTimeout(function () {
	            cb("unsupported browser");
	          }, 0);
	        },
	        onOpen: function onOpen(cb) {
	          setTimeout(function () {
	            cb("unsupported browser");
	          }, 0);
	        }
	      };
	    }
	  }();
	  if (module.exports) {
	    module.exports = WinChan;
	  }
	});
	winchan.open;

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;
	var isArray_1 = isArray;

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = _typeof(commonjsGlobal) == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
	var _freeGlobal = freeGlobal;

	/** Detect free variable `self`. */
	var freeSelf = (typeof self === "undefined" ? "undefined" : _typeof(self)) == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = _freeGlobal || freeSelf || Function('return this')();
	var _root = root;

	/** Built-in value references. */
	var _Symbol2 = _root.Symbol;
	var _Symbol = _Symbol2;

	/** Used for built-in method references. */
	var objectProto$e = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$b = objectProto$e.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString$1 = objectProto$e.toString;

	/** Built-in value references. */
	var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag(value) {
	  var isOwn = hasOwnProperty$b.call(value, symToStringTag$1),
	    tag = value[symToStringTag$1];
	  try {
	    value[symToStringTag$1] = undefined;
	    var unmasked = true;
	  } catch (e) {}
	  var result = nativeObjectToString$1.call(value);
	  if (unmasked) {
	    if (isOwn) {
	      value[symToStringTag$1] = tag;
	    } else {
	      delete value[symToStringTag$1];
	    }
	  }
	  return result;
	}
	var _getRawTag = getRawTag;

	/** Used for built-in method references. */
	var objectProto$d = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto$d.toString;

	/**
	 * Converts `value` to a string using `Object.prototype.toString`.
	 *
	 * @private
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 */
	function objectToString(value) {
	  return nativeObjectToString.call(value);
	}
	var _objectToString = objectToString;

	/** `Object#toString` result references. */
	var nullTag = '[object Null]',
	  undefinedTag = '[object Undefined]';

	/** Built-in value references. */
	var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

	/**
	 * The base implementation of `getTag` without fallbacks for buggy environments.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag(value) {
	  if (value == null) {
	    return value === undefined ? undefinedTag : nullTag;
	  }
	  return symToStringTag && symToStringTag in Object(value) ? _getRawTag(value) : _objectToString(value);
	}
	var _baseGetTag = baseGetTag;

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return value != null && _typeof(value) == 'object';
	}
	var isObjectLike_1 = isObjectLike;

	/** `Object#toString` result references. */
	var symbolTag$1 = '[object Symbol]';

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return _typeof(value) == 'symbol' || isObjectLike_1(value) && _baseGetTag(value) == symbolTag$1;
	}
	var isSymbol_1 = isSymbol;

	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	  reIsPlainProp = /^\w*$/;

	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey(value, object) {
	  if (isArray_1(value)) {
	    return false;
	  }
	  var type = _typeof(value);
	  if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol_1(value)) {
	    return true;
	  }
	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
	}
	var _isKey = isKey;

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = _typeof(value);
	  return value != null && (type == 'object' || type == 'function');
	}
	var isObject_1 = isObject;

	/** `Object#toString` result references. */
	var asyncTag = '[object AsyncFunction]',
	  funcTag$1 = '[object Function]',
	  genTag = '[object GeneratorFunction]',
	  proxyTag = '[object Proxy]';

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  if (!isObject_1(value)) {
	    return false;
	  }
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 9 which returns 'object' for typed arrays and other constructors.
	  var tag = _baseGetTag(value);
	  return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
	}
	var isFunction_1 = isFunction;

	/** Used to detect overreaching core-js shims. */
	var coreJsData = _root['__core-js_shared__'];
	var _coreJsData = coreJsData;

	/** Used to detect methods masquerading as native. */
	var maskSrcKey = function () {
	  var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
	  return uid ? 'Symbol(src)_1.' + uid : '';
	}();

	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked(func) {
	  return !!maskSrcKey && maskSrcKey in func;
	}
	var _isMasked = isMasked;

	/** Used for built-in method references. */
	var funcProto$1 = Function.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString$1 = funcProto$1.toString;

	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to convert.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString$1.call(func);
	    } catch (e) {}
	    try {
	      return func + '';
	    } catch (e) {}
	  }
	  return '';
	}
	var _toSource = toSource;

	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	  objectProto$c = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty$a = objectProto$c.hasOwnProperty;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty$a).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');

	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative(value) {
	  if (!isObject_1(value) || _isMasked(value)) {
	    return false;
	  }
	  var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
	  return pattern.test(_toSource(value));
	}
	var _baseIsNative = baseIsNative;

	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue(object, key) {
	  return object == null ? undefined : object[key];
	}
	var _getValue = getValue;

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = _getValue(object, key);
	  return _baseIsNative(value) ? value : undefined;
	}
	var _getNative = getNative;

	/* Built-in method references that are verified to be native. */
	var nativeCreate = _getNative(Object, 'create');
	var _nativeCreate = nativeCreate;

	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
	  this.size = 0;
	}
	var _hashClear = hashClear;

	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  var result = this.has(key) && delete this.__data__[key];
	  this.size -= result ? 1 : 0;
	  return result;
	}
	var _hashDelete = hashDelete;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

	/** Used for built-in method references. */
	var objectProto$b = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$9 = objectProto$b.hasOwnProperty;

	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(key) {
	  var data = this.__data__;
	  if (_nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED$2 ? undefined : result;
	  }
	  return hasOwnProperty$9.call(data, key) ? data[key] : undefined;
	}
	var _hashGet = hashGet;

	/** Used for built-in method references. */
	var objectProto$a = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$8 = objectProto$a.hasOwnProperty;

	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(key) {
	  var data = this.__data__;
	  return _nativeCreate ? data[key] !== undefined : hasOwnProperty$8.call(data, key);
	}
	var _hashHas = hashHas;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet(key, value) {
	  var data = this.__data__;
	  this.size += this.has(key) ? 0 : 1;
	  data[key] = _nativeCreate && value === undefined ? HASH_UNDEFINED$1 : value;
	  return this;
	}
	var _hashSet = hashSet;

	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	    length = entries == null ? 0 : entries.length;
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `Hash`.
	Hash.prototype.clear = _hashClear;
	Hash.prototype['delete'] = _hashDelete;
	Hash.prototype.get = _hashGet;
	Hash.prototype.has = _hashHas;
	Hash.prototype.set = _hashSet;
	var _Hash = Hash;

	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	  this.size = 0;
	}
	var _listCacheClear = listCacheClear;

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || value !== value && other !== other;
	}
	var eq_1 = eq;

	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq_1(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}
	var _assocIndexOf = assocIndexOf;

	/** Used for built-in method references. */
	var arrayProto$1 = Array.prototype;

	/** Built-in value references. */
	var splice$1 = arrayProto$1.splice;

	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	    index = _assocIndexOf(data, key);
	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice$1.call(data, index, 1);
	  }
	  --this.size;
	  return true;
	}
	var _listCacheDelete = listCacheDelete;

	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	    index = _assocIndexOf(data, key);
	  return index < 0 ? undefined : data[index][1];
	}
	var _listCacheGet = listCacheGet;

	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return _assocIndexOf(this.__data__, key) > -1;
	}
	var _listCacheHas = listCacheHas;

	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	    index = _assocIndexOf(data, key);
	  if (index < 0) {
	    ++this.size;
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}
	var _listCacheSet = listCacheSet;

	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	    length = entries == null ? 0 : entries.length;
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `ListCache`.
	ListCache.prototype.clear = _listCacheClear;
	ListCache.prototype['delete'] = _listCacheDelete;
	ListCache.prototype.get = _listCacheGet;
	ListCache.prototype.has = _listCacheHas;
	ListCache.prototype.set = _listCacheSet;
	var _ListCache = ListCache;

	/* Built-in method references that are verified to be native. */
	var Map$1 = _getNative(_root, 'Map');
	var _Map = Map$1;

	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.size = 0;
	  this.__data__ = {
	    'hash': new _Hash(),
	    'map': new (_Map || _ListCache)(),
	    'string': new _Hash()
	  };
	}
	var _mapCacheClear = mapCacheClear;

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = _typeof(value);
	  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
	}
	var _isKeyable = isKeyable;

	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData(map, key) {
	  var data = map.__data__;
	  return _isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
	}
	var _getMapData = getMapData;

	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete(key) {
	  var result = _getMapData(this, key)['delete'](key);
	  this.size -= result ? 1 : 0;
	  return result;
	}
	var _mapCacheDelete = mapCacheDelete;

	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet(key) {
	  return _getMapData(this, key).get(key);
	}
	var _mapCacheGet = mapCacheGet;

	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas(key) {
	  return _getMapData(this, key).has(key);
	}
	var _mapCacheHas = mapCacheHas;

	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet(key, value) {
	  var data = _getMapData(this, key),
	    size = data.size;
	  data.set(key, value);
	  this.size += data.size == size ? 0 : 1;
	  return this;
	}
	var _mapCacheSet = mapCacheSet;

	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	    length = entries == null ? 0 : entries.length;
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `MapCache`.
	MapCache.prototype.clear = _mapCacheClear;
	MapCache.prototype['delete'] = _mapCacheDelete;
	MapCache.prototype.get = _mapCacheGet;
	MapCache.prototype.has = _mapCacheHas;
	MapCache.prototype.set = _mapCacheSet;
	var _MapCache = MapCache;

	/** Error message constants. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/**
	 * Creates a function that memoizes the result of `func`. If `resolver` is
	 * provided, it determines the cache key for storing the result based on the
	 * arguments provided to the memoized function. By default, the first argument
	 * provided to the memoized function is used as the map cache key. The `func`
	 * is invoked with the `this` binding of the memoized function.
	 *
	 * **Note:** The cache is exposed as the `cache` property on the memoized
	 * function. Its creation may be customized by replacing the `_.memoize.Cache`
	 * constructor with one whose instances implement the
	 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
	 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to have its output memoized.
	 * @param {Function} [resolver] The function to resolve the cache key.
	 * @returns {Function} Returns the new memoized function.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': 2 };
	 * var other = { 'c': 3, 'd': 4 };
	 *
	 * var values = _.memoize(_.values);
	 * values(object);
	 * // => [1, 2]
	 *
	 * values(other);
	 * // => [3, 4]
	 *
	 * object.a = 2;
	 * values(object);
	 * // => [1, 2]
	 *
	 * // Modify the result cache.
	 * values.cache.set(object, ['a', 'b']);
	 * values(object);
	 * // => ['a', 'b']
	 *
	 * // Replace `_.memoize.Cache`.
	 * _.memoize.Cache = WeakMap;
	 */
	function memoize(func, resolver) {
	  if (typeof func != 'function' || resolver != null && typeof resolver != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  var memoized = function memoized() {
	    var args = arguments,
	      key = resolver ? resolver.apply(this, args) : args[0],
	      cache = memoized.cache;
	    if (cache.has(key)) {
	      return cache.get(key);
	    }
	    var result = func.apply(this, args);
	    memoized.cache = cache.set(key, result) || cache;
	    return result;
	  };
	  memoized.cache = new (memoize.Cache || _MapCache)();
	  return memoized;
	}

	// Expose `MapCache`.
	memoize.Cache = _MapCache;
	var memoize_1 = memoize;

	/** Used as the maximum memoize cache size. */
	var MAX_MEMOIZE_SIZE = 500;

	/**
	 * A specialized version of `_.memoize` which clears the memoized function's
	 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
	 *
	 * @private
	 * @param {Function} func The function to have its output memoized.
	 * @returns {Function} Returns the new memoized function.
	 */
	function memoizeCapped(func) {
	  var result = memoize_1(func, function (key) {
	    if (cache.size === MAX_MEMOIZE_SIZE) {
	      cache.clear();
	    }
	    return key;
	  });
	  var cache = result.cache;
	  return result;
	}
	var _memoizeCapped = memoizeCapped;

	/** Used to match property names within property paths. */
	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;

	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */
	var stringToPath = _memoizeCapped(function (string) {
	  var result = [];
	  if (string.charCodeAt(0) === 46 /* . */) {
	    result.push('');
	  }
	  string.replace(rePropName, function (match, number, quote, subString) {
	    result.push(quote ? subString.replace(reEscapeChar, '$1') : number || match);
	  });
	  return result;
	});
	var _stringToPath = stringToPath;

	/**
	 * A specialized version of `_.map` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function arrayMap(array, iteratee) {
	  var index = -1,
	    length = array == null ? 0 : array.length,
	    result = Array(length);
	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}
	var _arrayMap = arrayMap;

	/** Used as references for various `Number` constants. */
	var INFINITY$2 = 1 / 0;

	/** Used to convert symbols to primitives and strings. */
	var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined,
	  symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;

	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (isArray_1(value)) {
	    // Recursively convert values (susceptible to call stack limits).
	    return _arrayMap(value, baseToString) + '';
	  }
	  if (isSymbol_1(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = value + '';
	  return result == '0' && 1 / value == -INFINITY$2 ? '-0' : result;
	}
	var _baseToString = baseToString;

	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString(value) {
	  return value == null ? '' : _baseToString(value);
	}
	var toString_1 = toString;

	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {Array} Returns the cast property path array.
	 */
	function castPath(value, object) {
	  if (isArray_1(value)) {
	    return value;
	  }
	  return _isKey(value, object) ? [value] : _stringToPath(toString_1(value));
	}
	var _castPath = castPath;

	/** Used as references for various `Number` constants. */
	var INFINITY$1 = 1 / 0;

	/**
	 * Converts `value` to a string key if it's not a string or symbol.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {string|symbol} Returns the key.
	 */
	function toKey(value) {
	  if (typeof value == 'string' || isSymbol_1(value)) {
	    return value;
	  }
	  var result = value + '';
	  return result == '0' && 1 / value == -INFINITY$1 ? '-0' : result;
	}
	var _toKey = toKey;

	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path) {
	  path = _castPath(path, object);
	  var index = 0,
	    length = path.length;
	  while (object != null && index < length) {
	    object = object[_toKey(path[index++])];
	  }
	  return index && index == length ? object : undefined;
	}
	var _baseGet = baseGet;

	var defineProperty = function () {
	  try {
	    var func = _getNative(Object, 'defineProperty');
	    func({}, '', {});
	    return func;
	  } catch (e) {}
	}();
	var _defineProperty = defineProperty;

	/**
	 * The base implementation of `assignValue` and `assignMergeValue` without
	 * value checks.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function baseAssignValue(object, key, value) {
	  if (key == '__proto__' && _defineProperty) {
	    _defineProperty(object, key, {
	      'configurable': true,
	      'enumerable': true,
	      'value': value,
	      'writable': true
	    });
	  } else {
	    object[key] = value;
	  }
	}
	var _baseAssignValue = baseAssignValue;

	/** Used for built-in method references. */
	var objectProto$9 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

	/**
	 * Assigns `value` to `key` of `object` if the existing value is not equivalent
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function assignValue(object, key, value) {
	  var objValue = object[key];
	  if (!(hasOwnProperty$7.call(object, key) && eq_1(objValue, value)) || value === undefined && !(key in object)) {
	    _baseAssignValue(object, key, value);
	  }
	}
	var _assignValue = assignValue;

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER$1 = 9007199254740991;

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  var type = _typeof(value);
	  length = length == null ? MAX_SAFE_INTEGER$1 : length;
	  return !!length && (type == 'number' || type != 'symbol' && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
	}
	var _isIndex = isIndex;

	/**
	 * The base implementation of `_.set`.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {Array|string} path The path of the property to set.
	 * @param {*} value The value to set.
	 * @param {Function} [customizer] The function to customize path creation.
	 * @returns {Object} Returns `object`.
	 */
	function baseSet(object, path, value, customizer) {
	  if (!isObject_1(object)) {
	    return object;
	  }
	  path = _castPath(path, object);
	  var index = -1,
	    length = path.length,
	    lastIndex = length - 1,
	    nested = object;
	  while (nested != null && ++index < length) {
	    var key = _toKey(path[index]),
	      newValue = value;
	    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
	      return object;
	    }
	    if (index != lastIndex) {
	      var objValue = nested[key];
	      newValue = customizer ? customizer(objValue, key, nested) : undefined;
	      if (newValue === undefined) {
	        newValue = isObject_1(objValue) ? objValue : _isIndex(path[index + 1]) ? [] : {};
	      }
	    }
	    _assignValue(nested, key, newValue);
	    nested = nested[key];
	  }
	  return object;
	}
	var _baseSet = baseSet;

	/**
	 * The base implementation of  `_.pickBy` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The source object.
	 * @param {string[]} paths The property paths to pick.
	 * @param {Function} predicate The function invoked per property.
	 * @returns {Object} Returns the new object.
	 */
	function basePickBy(object, paths, predicate) {
	  var index = -1,
	    length = paths.length,
	    result = {};
	  while (++index < length) {
	    var path = paths[index],
	      value = _baseGet(object, path);
	    if (predicate(value, path)) {
	      _baseSet(result, _castPath(path, object), value);
	    }
	  }
	  return result;
	}
	var _basePickBy = basePickBy;

	/**
	 * The base implementation of `_.hasIn` without support for deep paths.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHasIn(object, key) {
	  return object != null && key in Object(object);
	}
	var _baseHasIn = baseHasIn;

	/** `Object#toString` result references. */
	var argsTag$2 = '[object Arguments]';

	/**
	 * The base implementation of `_.isArguments`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 */
	function baseIsArguments(value) {
	  return isObjectLike_1(value) && _baseGetTag(value) == argsTag$2;
	}
	var _baseIsArguments = baseIsArguments;

	/** Used for built-in method references. */
	var objectProto$8 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$6 = objectProto$8.hasOwnProperty;

	/** Built-in value references. */
	var propertyIsEnumerable$1 = objectProto$8.propertyIsEnumerable;

	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	var isArguments = _baseIsArguments(function () {
	  return arguments;
	}()) ? _baseIsArguments : function (value) {
	  return isObjectLike_1(value) && hasOwnProperty$6.call(value, 'callee') && !propertyIsEnumerable$1.call(value, 'callee');
	};
	var isArguments_1 = isArguments;

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	var isLength_1 = isLength;

	/**
	 * Checks if `path` exists on `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @param {Function} hasFunc The function to check properties.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 */
	function hasPath(object, path, hasFunc) {
	  path = _castPath(path, object);
	  var index = -1,
	    length = path.length,
	    result = false;
	  while (++index < length) {
	    var key = _toKey(path[index]);
	    if (!(result = object != null && hasFunc(object, key))) {
	      break;
	    }
	    object = object[key];
	  }
	  if (result || ++index != length) {
	    return result;
	  }
	  length = object == null ? 0 : object.length;
	  return !!length && isLength_1(length) && _isIndex(key, length) && (isArray_1(object) || isArguments_1(object));
	}
	var _hasPath = hasPath;

	/**
	 * Checks if `path` is a direct or inherited property of `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 * @example
	 *
	 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
	 *
	 * _.hasIn(object, 'a');
	 * // => true
	 *
	 * _.hasIn(object, 'a.b');
	 * // => true
	 *
	 * _.hasIn(object, ['a', 'b']);
	 * // => true
	 *
	 * _.hasIn(object, 'b');
	 * // => false
	 */
	function hasIn(object, path) {
	  return object != null && _hasPath(object, path, _baseHasIn);
	}
	var hasIn_1 = hasIn;

	/**
	 * The base implementation of `_.pick` without support for individual
	 * property identifiers.
	 *
	 * @private
	 * @param {Object} object The source object.
	 * @param {string[]} paths The property paths to pick.
	 * @returns {Object} Returns the new object.
	 */
	function basePick(object, paths) {
	  return _basePickBy(object, paths, function (value, path) {
	    return hasIn_1(object, path);
	  });
	}
	var _basePick = basePick;

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */
	function arrayPush(array, values) {
	  var index = -1,
	    length = values.length,
	    offset = array.length;
	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}
	var _arrayPush = arrayPush;

	/** Built-in value references. */
	var spreadableSymbol = _Symbol ? _Symbol.isConcatSpreadable : undefined;

	/**
	 * Checks if `value` is a flattenable `arguments` object or array.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
	 */
	function isFlattenable(value) {
	  return isArray_1(value) || isArguments_1(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
	}
	var _isFlattenable = isFlattenable;

	/**
	 * The base implementation of `_.flatten` with support for restricting flattening.
	 *
	 * @private
	 * @param {Array} array The array to flatten.
	 * @param {number} depth The maximum recursion depth.
	 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
	 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
	 * @param {Array} [result=[]] The initial result value.
	 * @returns {Array} Returns the new flattened array.
	 */
	function baseFlatten(array, depth, predicate, isStrict, result) {
	  var index = -1,
	    length = array.length;
	  predicate || (predicate = _isFlattenable);
	  result || (result = []);
	  while (++index < length) {
	    var value = array[index];
	    if (depth > 0 && predicate(value)) {
	      if (depth > 1) {
	        // Recursively flatten arrays (susceptible to call stack limits).
	        baseFlatten(value, depth - 1, predicate, isStrict, result);
	      } else {
	        _arrayPush(result, value);
	      }
	    } else if (!isStrict) {
	      result[result.length] = value;
	    }
	  }
	  return result;
	}
	var _baseFlatten = baseFlatten;

	/**
	 * Flattens `array` a single level deep.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to flatten.
	 * @returns {Array} Returns the new flattened array.
	 * @example
	 *
	 * _.flatten([1, [2, [3, [4]], 5]]);
	 * // => [1, 2, [3, [4]], 5]
	 */
	function flatten(array) {
	  var length = array == null ? 0 : array.length;
	  return length ? _baseFlatten(array, 1) : [];
	}
	var flatten_1 = flatten;

	/**
	 * A faster alternative to `Function#apply`, this function invokes `func`
	 * with the `this` binding of `thisArg` and the arguments of `args`.
	 *
	 * @private
	 * @param {Function} func The function to invoke.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {Array} args The arguments to invoke `func` with.
	 * @returns {*} Returns the result of `func`.
	 */
	function apply(func, thisArg, args) {
	  switch (args.length) {
	    case 0:
	      return func.call(thisArg);
	    case 1:
	      return func.call(thisArg, args[0]);
	    case 2:
	      return func.call(thisArg, args[0], args[1]);
	    case 3:
	      return func.call(thisArg, args[0], args[1], args[2]);
	  }
	  return func.apply(thisArg, args);
	}
	var _apply = apply;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * A specialized version of `baseRest` which transforms the rest array.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @param {Function} transform The rest array transform.
	 * @returns {Function} Returns the new function.
	 */
	function overRest(func, start, transform) {
	  start = nativeMax(start === undefined ? func.length - 1 : start, 0);
	  return function () {
	    var args = arguments,
	      index = -1,
	      length = nativeMax(args.length - start, 0),
	      array = Array(length);
	    while (++index < length) {
	      array[index] = args[start + index];
	    }
	    index = -1;
	    var otherArgs = Array(start + 1);
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = transform(array);
	    return _apply(func, this, otherArgs);
	  };
	}
	var _overRest = overRest;

	/**
	 * Creates a function that returns `value`.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {*} value The value to return from the new function.
	 * @returns {Function} Returns the new constant function.
	 * @example
	 *
	 * var objects = _.times(2, _.constant({ 'a': 1 }));
	 *
	 * console.log(objects);
	 * // => [{ 'a': 1 }, { 'a': 1 }]
	 *
	 * console.log(objects[0] === objects[1]);
	 * // => true
	 */
	function constant(value) {
	  return function () {
	    return value;
	  };
	}
	var constant_1 = constant;

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}
	var identity_1 = identity;

	/**
	 * The base implementation of `setToString` without support for hot loop shorting.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */
	var baseSetToString = !_defineProperty ? identity_1 : function (func, string) {
	  return _defineProperty(func, 'toString', {
	    'configurable': true,
	    'enumerable': false,
	    'value': constant_1(string),
	    'writable': true
	  });
	};
	var _baseSetToString = baseSetToString;

	/** Used to detect hot functions by number of calls within a span of milliseconds. */
	var HOT_COUNT = 800,
	  HOT_SPAN = 16;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeNow = Date.now;

	/**
	 * Creates a function that'll short out and invoke `identity` instead
	 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
	 * milliseconds.
	 *
	 * @private
	 * @param {Function} func The function to restrict.
	 * @returns {Function} Returns the new shortable function.
	 */
	function shortOut(func) {
	  var count = 0,
	    lastCalled = 0;
	  return function () {
	    var stamp = nativeNow(),
	      remaining = HOT_SPAN - (stamp - lastCalled);
	    lastCalled = stamp;
	    if (remaining > 0) {
	      if (++count >= HOT_COUNT) {
	        return arguments[0];
	      }
	    } else {
	      count = 0;
	    }
	    return func.apply(undefined, arguments);
	  };
	}
	var _shortOut = shortOut;

	/**
	 * Sets the `toString` method of `func` to return `string`.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */
	var setToString = _shortOut(_baseSetToString);
	var _setToString = setToString;

	/**
	 * A specialized version of `baseRest` which flattens the rest array.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @returns {Function} Returns the new function.
	 */
	function flatRest(func) {
	  return _setToString(_overRest(func, undefined, flatten_1), func + '');
	}
	var _flatRest = flatRest;

	/**
	 * Creates an object composed of the picked `object` properties.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The source object.
	 * @param {...(string|string[])} [paths] The property paths to pick.
	 * @returns {Object} Returns the new object.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': '2', 'c': 3 };
	 *
	 * _.pick(object, ['a', 'c']);
	 * // => { 'a': 1, 'c': 3 }
	 */
	var pick = _flatRest(function (object, paths) {
	  return object == null ? {} : _basePick(object, paths);
	});
	var pick_1 = pick;

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	    result = Array(n);
	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}
	var _baseTimes = baseTimes;

	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */
	function stubFalse() {
	  return false;
	}
	var stubFalse_1 = stubFalse;

	var isBuffer_1 = createCommonjsModule(function (module, exports) {
	  /** Detect free variable `exports`. */
	  var freeExports = exports && !exports.nodeType && exports;

	  /** Detect free variable `module`. */
	  var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

	  /** Detect the popular CommonJS extension `module.exports`. */
	  var moduleExports = freeModule && freeModule.exports === freeExports;

	  /** Built-in value references. */
	  var Buffer = moduleExports ? _root.Buffer : undefined;

	  /* Built-in method references for those with the same name as other `lodash` methods. */
	  var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

	  /**
	   * Checks if `value` is a buffer.
	   *
	   * @static
	   * @memberOf _
	   * @since 4.3.0
	   * @category Lang
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	   * @example
	   *
	   * _.isBuffer(new Buffer(2));
	   * // => true
	   *
	   * _.isBuffer(new Uint8Array(2));
	   * // => false
	   */
	  var isBuffer = nativeIsBuffer || stubFalse_1;
	  module.exports = isBuffer;
	});

	/** `Object#toString` result references. */
	var argsTag$1 = '[object Arguments]',
	  arrayTag$1 = '[object Array]',
	  boolTag$1 = '[object Boolean]',
	  dateTag$1 = '[object Date]',
	  errorTag$1 = '[object Error]',
	  funcTag = '[object Function]',
	  mapTag$3 = '[object Map]',
	  numberTag$1 = '[object Number]',
	  objectTag$2 = '[object Object]',
	  regexpTag$1 = '[object RegExp]',
	  setTag$3 = '[object Set]',
	  stringTag$2 = '[object String]',
	  weakMapTag$1 = '[object WeakMap]';
	var arrayBufferTag$1 = '[object ArrayBuffer]',
	  dataViewTag$2 = '[object DataView]',
	  float32Tag = '[object Float32Array]',
	  float64Tag = '[object Float64Array]',
	  int8Tag = '[object Int8Array]',
	  int16Tag = '[object Int16Array]',
	  int32Tag = '[object Int32Array]',
	  uint8Tag = '[object Uint8Array]',
	  uint8ClampedTag = '[object Uint8ClampedArray]',
	  uint16Tag = '[object Uint16Array]',
	  uint32Tag = '[object Uint32Array]';

	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] = typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] = typedArrayTags[dataViewTag$2] = typedArrayTags[dateTag$1] = typedArrayTags[errorTag$1] = typedArrayTags[funcTag] = typedArrayTags[mapTag$3] = typedArrayTags[numberTag$1] = typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$1] = typedArrayTags[setTag$3] = typedArrayTags[stringTag$2] = typedArrayTags[weakMapTag$1] = false;

	/**
	 * The base implementation of `_.isTypedArray` without Node.js optimizations.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 */
	function baseIsTypedArray(value) {
	  return isObjectLike_1(value) && isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
	}
	var _baseIsTypedArray = baseIsTypedArray;

	/**
	 * The base implementation of `_.unary` without support for storing metadata.
	 *
	 * @private
	 * @param {Function} func The function to cap arguments for.
	 * @returns {Function} Returns the new capped function.
	 */
	function baseUnary(func) {
	  return function (value) {
	    return func(value);
	  };
	}
	var _baseUnary = baseUnary;

	var _nodeUtil = createCommonjsModule(function (module, exports) {
	  /** Detect free variable `exports`. */
	  var freeExports = exports && !exports.nodeType && exports;

	  /** Detect free variable `module`. */
	  var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

	  /** Detect the popular CommonJS extension `module.exports`. */
	  var moduleExports = freeModule && freeModule.exports === freeExports;

	  /** Detect free variable `process` from Node.js. */
	  var freeProcess = moduleExports && _freeGlobal.process;

	  /** Used to access faster Node.js helpers. */
	  var nodeUtil = function () {
	    try {
	      // Use `util.types` for Node.js 10+.
	      var types = freeModule && freeModule.require && freeModule.require('util').types;
	      if (types) {
	        return types;
	      }

	      // Legacy `process.binding('util')` for Node.js < 10.
	      return freeProcess && freeProcess.binding && freeProcess.binding('util');
	    } catch (e) {}
	  }();
	  module.exports = nodeUtil;
	});

	/* Node.js helper references. */
	var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;
	var isTypedArray_1 = isTypedArray;

	/** Used for built-in method references. */
	var objectProto$7 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$5 = objectProto$7.hasOwnProperty;

	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys(value, inherited) {
	  var isArr = isArray_1(value),
	    isArg = !isArr && isArguments_1(value),
	    isBuff = !isArr && !isArg && isBuffer_1(value),
	    isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
	    skipIndexes = isArr || isArg || isBuff || isType,
	    result = skipIndexes ? _baseTimes(value.length, String) : [],
	    length = result.length;
	  for (var key in value) {
	    if ((inherited || hasOwnProperty$5.call(value, key)) && !(skipIndexes && (
	    // Safari 9 has enumerable `arguments.length` in strict mode.
	    key == 'length' ||
	    // Node.js 0.10 has enumerable non-index properties on buffers.
	    isBuff && (key == 'offset' || key == 'parent') ||
	    // PhantomJS 2 has enumerable non-index properties on typed arrays.
	    isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') ||
	    // Skip index properties.
	    _isIndex(key, length)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	var _arrayLikeKeys = arrayLikeKeys;

	/** Used for built-in method references. */
	var objectProto$6 = Object.prototype;

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	    proto = typeof Ctor == 'function' && Ctor.prototype || objectProto$6;
	  return value === proto;
	}
	var _isPrototype = isPrototype;

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function (arg) {
	    return func(transform(arg));
	  };
	}
	var _overArg = overArg;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = _overArg(Object.keys, Object);
	var _nativeKeys = nativeKeys;

	/** Used for built-in method references. */
	var objectProto$5 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  if (!_isPrototype(object)) {
	    return _nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty$4.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}
	var _baseKeys = baseKeys;

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength_1(value.length) && !isFunction_1(value);
	}
	var isArrayLike_1 = isArrayLike;

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
	}
	var keys_1 = keys;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/**
	 * Adds `value` to the array cache.
	 *
	 * @private
	 * @name add
	 * @memberOf SetCache
	 * @alias push
	 * @param {*} value The value to cache.
	 * @returns {Object} Returns the cache instance.
	 */
	function setCacheAdd(value) {
	  this.__data__.set(value, HASH_UNDEFINED);
	  return this;
	}
	var _setCacheAdd = setCacheAdd;

	/**
	 * Checks if `value` is in the array cache.
	 *
	 * @private
	 * @name has
	 * @memberOf SetCache
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `true` if `value` is found, else `false`.
	 */
	function setCacheHas(value) {
	  return this.__data__.has(value);
	}
	var _setCacheHas = setCacheHas;

	/**
	 *
	 * Creates an array cache object to store unique values.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function SetCache(values) {
	  var index = -1,
	    length = values == null ? 0 : values.length;
	  this.__data__ = new _MapCache();
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}

	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd;
	SetCache.prototype.has = _setCacheHas;
	var _SetCache = SetCache;

	/**
	 * The base implementation of `_.findIndex` and `_.findLastIndex` without
	 * support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {number} fromIndex The index to search from.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseFindIndex(array, predicate, fromIndex, fromRight) {
	  var length = array.length,
	    index = fromIndex + (fromRight ? 1 : -1);
	  while (fromRight ? index-- : ++index < length) {
	    if (predicate(array[index], index, array)) {
	      return index;
	    }
	  }
	  return -1;
	}
	var _baseFindIndex = baseFindIndex;

	/**
	 * The base implementation of `_.isNaN` without support for number objects.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
	 */
	function baseIsNaN(value) {
	  return value !== value;
	}
	var _baseIsNaN = baseIsNaN;

	/**
	 * A specialized version of `_.indexOf` which performs strict equality
	 * comparisons of values, i.e. `===`.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function strictIndexOf(array, value, fromIndex) {
	  var index = fromIndex - 1,
	    length = array.length;
	  while (++index < length) {
	    if (array[index] === value) {
	      return index;
	    }
	  }
	  return -1;
	}
	var _strictIndexOf = strictIndexOf;

	/**
	 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseIndexOf(array, value, fromIndex) {
	  return value === value ? _strictIndexOf(array, value, fromIndex) : _baseFindIndex(array, _baseIsNaN, fromIndex);
	}
	var _baseIndexOf = baseIndexOf;

	/**
	 * A specialized version of `_.includes` for arrays without support for
	 * specifying an index to search from.
	 *
	 * @private
	 * @param {Array} [array] The array to inspect.
	 * @param {*} target The value to search for.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludes(array, value) {
	  var length = array == null ? 0 : array.length;
	  return !!length && _baseIndexOf(array, value, 0) > -1;
	}
	var _arrayIncludes = arrayIncludes;

	/**
	 * This function is like `arrayIncludes` except that it accepts a comparator.
	 *
	 * @private
	 * @param {Array} [array] The array to inspect.
	 * @param {*} target The value to search for.
	 * @param {Function} comparator The comparator invoked per element.
	 * @returns {boolean} Returns `true` if `target` is found, else `false`.
	 */
	function arrayIncludesWith(array, value, comparator) {
	  var index = -1,
	    length = array == null ? 0 : array.length;
	  while (++index < length) {
	    if (comparator(value, array[index])) {
	      return true;
	    }
	  }
	  return false;
	}
	var _arrayIncludesWith = arrayIncludesWith;

	/**
	 * Checks if a `cache` value for `key` exists.
	 *
	 * @private
	 * @param {Object} cache The cache to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function cacheHas(cache, key) {
	  return cache.has(key);
	}
	var _cacheHas = cacheHas;

	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE$2 = 200;

	/**
	 * The base implementation of methods like `_.difference` without support
	 * for excluding multiple arrays or iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Array} values The values to exclude.
	 * @param {Function} [iteratee] The iteratee invoked per element.
	 * @param {Function} [comparator] The comparator invoked per element.
	 * @returns {Array} Returns the new array of filtered values.
	 */
	function baseDifference(array, values, iteratee, comparator) {
	  var index = -1,
	    includes = _arrayIncludes,
	    isCommon = true,
	    length = array.length,
	    result = [],
	    valuesLength = values.length;
	  if (!length) {
	    return result;
	  }
	  if (iteratee) {
	    values = _arrayMap(values, _baseUnary(iteratee));
	  }
	  if (comparator) {
	    includes = _arrayIncludesWith;
	    isCommon = false;
	  } else if (values.length >= LARGE_ARRAY_SIZE$2) {
	    includes = _cacheHas;
	    isCommon = false;
	    values = new _SetCache(values);
	  }
	  outer: while (++index < length) {
	    var value = array[index],
	      computed = iteratee == null ? value : iteratee(value);
	    value = comparator || value !== 0 ? value : 0;
	    if (isCommon && computed === computed) {
	      var valuesIndex = valuesLength;
	      while (valuesIndex--) {
	        if (values[valuesIndex] === computed) {
	          continue outer;
	        }
	      }
	      result.push(value);
	    } else if (!includes(values, computed, comparator)) {
	      result.push(value);
	    }
	  }
	  return result;
	}
	var _baseDifference = baseDifference;

	/**
	 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 */
	function baseRest(func, start) {
	  return _setToString(_overRest(func, start, identity_1), func + '');
	}
	var _baseRest = baseRest;

	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike_1(value) && isArrayLike_1(value);
	}
	var isArrayLikeObject_1 = isArrayLikeObject;

	/**
	 * Creates an array of `array` values not included in the other given arrays
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons. The order and references of result values are
	 * determined by the first array.
	 *
	 * **Note:** Unlike `_.pullAll`, this method returns a new array.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to inspect.
	 * @param {...Array} [values] The values to exclude.
	 * @returns {Array} Returns the new array of filtered values.
	 * @see _.without, _.xor
	 * @example
	 *
	 * _.difference([2, 1], [2, 3]);
	 * // => [1]
	 */
	var difference = _baseRest(function (array, values) {
	  return isArrayLikeObject_1(array) ? _baseDifference(array, _baseFlatten(values, 1, isArrayLikeObject_1, true)) : [];
	});
	var difference_1 = difference;

	/**
	 * Checks if `value` is `undefined`.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
	 * @example
	 *
	 * _.isUndefined(void 0);
	 * // => true
	 *
	 * _.isUndefined(null);
	 * // => false
	 */
	function isUndefined(value) {
	  return value === undefined;
	}
	var isUndefined_1 = isUndefined;

	function logError(messageOrException, exception) {
	    if (window.console) {
	        if (window.console.error) {
	            if (exception) {
	                window.console.error(messageOrException, exception);
	            }
	            else {
	                window.console.error(messageOrException);
	            }
	        }
	        else if (window.console.log) {
	            window.console.log(messageOrException);
	        }
	    }
	}

	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = new _ListCache();
	  this.size = 0;
	}
	var _stackClear = stackClear;

	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function stackDelete(key) {
	  var data = this.__data__,
	    result = data['delete'](key);
	  this.size = data.size;
	  return result;
	}
	var _stackDelete = stackDelete;

	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function stackGet(key) {
	  return this.__data__.get(key);
	}
	var _stackGet = stackGet;

	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function stackHas(key) {
	  return this.__data__.has(key);
	}
	var _stackHas = stackHas;

	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE$1 = 200;

	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */
	function stackSet(key, value) {
	  var data = this.__data__;
	  if (data instanceof _ListCache) {
	    var pairs = data.__data__;
	    if (!_Map || pairs.length < LARGE_ARRAY_SIZE$1 - 1) {
	      pairs.push([key, value]);
	      this.size = ++data.size;
	      return this;
	    }
	    data = this.__data__ = new _MapCache(pairs);
	  }
	  data.set(key, value);
	  this.size = data.size;
	  return this;
	}
	var _stackSet = stackSet;

	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack(entries) {
	  var data = this.__data__ = new _ListCache(entries);
	  this.size = data.size;
	}

	// Add methods to `Stack`.
	Stack.prototype.clear = _stackClear;
	Stack.prototype['delete'] = _stackDelete;
	Stack.prototype.get = _stackGet;
	Stack.prototype.has = _stackHas;
	Stack.prototype.set = _stackSet;
	var _Stack = Stack;

	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	    length = array == null ? 0 : array.length;
	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}
	var _arraySome = arraySome;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$5 = 1,
	  COMPARE_UNORDERED_FLAG$3 = 2;

	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$5,
	    arrLength = array.length,
	    othLength = other.length;
	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Check that cyclic values are equal.
	  var arrStacked = stack.get(array);
	  var othStacked = stack.get(other);
	  if (arrStacked && othStacked) {
	    return arrStacked == other && othStacked == array;
	  }
	  var index = -1,
	    result = true,
	    seen = bitmask & COMPARE_UNORDERED_FLAG$3 ? new _SetCache() : undefined;
	  stack.set(array, other);
	  stack.set(other, array);

	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	      othValue = other[index];
	    if (customizer) {
	      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
	    }
	    if (compared !== undefined) {
	      if (compared) {
	        continue;
	      }
	      result = false;
	      break;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (seen) {
	      if (!_arraySome(other, function (othValue, othIndex) {
	        if (!_cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
	          return seen.push(othIndex);
	        }
	      })) {
	        result = false;
	        break;
	      }
	    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  stack['delete'](other);
	  return result;
	}
	var _equalArrays = equalArrays;

	/** Built-in value references. */
	var Uint8Array$1 = _root.Uint8Array;
	var _Uint8Array = Uint8Array$1;

	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */
	function mapToArray(map) {
	  var index = -1,
	    result = Array(map.size);
	  map.forEach(function (value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}
	var _mapToArray = mapToArray;

	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */
	function setToArray(set) {
	  var index = -1,
	    result = Array(set.size);
	  set.forEach(function (value) {
	    result[++index] = value;
	  });
	  return result;
	}
	var _setToArray = setToArray;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$4 = 1,
	  COMPARE_UNORDERED_FLAG$2 = 2;

	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	  dateTag = '[object Date]',
	  errorTag = '[object Error]',
	  mapTag$2 = '[object Map]',
	  numberTag = '[object Number]',
	  regexpTag = '[object RegExp]',
	  setTag$2 = '[object Set]',
	  stringTag$1 = '[object String]',
	  symbolTag = '[object Symbol]';
	var arrayBufferTag = '[object ArrayBuffer]',
	  dataViewTag$1 = '[object DataView]';

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = _Symbol ? _Symbol.prototype : undefined,
	  symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
	  switch (tag) {
	    case dataViewTag$1:
	      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
	        return false;
	      }
	      object = object.buffer;
	      other = other.buffer;
	    case arrayBufferTag:
	      if (object.byteLength != other.byteLength || !equalFunc(new _Uint8Array(object), new _Uint8Array(other))) {
	        return false;
	      }
	      return true;
	    case boolTag:
	    case dateTag:
	    case numberTag:
	      // Coerce booleans to `1` or `0` and dates to milliseconds.
	      // Invalid dates are coerced to `NaN`.
	      return eq_1(+object, +other);
	    case errorTag:
	      return object.name == other.name && object.message == other.message;
	    case regexpTag:
	    case stringTag$1:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == other + '';
	    case mapTag$2:
	      var convert = _mapToArray;
	    case setTag$2:
	      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4;
	      convert || (convert = _setToArray);
	      if (object.size != other.size && !isPartial) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked) {
	        return stacked == other;
	      }
	      bitmask |= COMPARE_UNORDERED_FLAG$2;

	      // Recursively compare objects (susceptible to call stack limits).
	      stack.set(object, other);
	      var result = _equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
	      stack['delete'](object);
	      return result;
	    case symbolTag:
	      if (symbolValueOf) {
	        return symbolValueOf.call(object) == symbolValueOf.call(other);
	      }
	  }
	  return false;
	}
	var _equalByTag = equalByTag;

	/**
	 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @param {Function} symbolsFunc The function to get the symbols of `object`.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function baseGetAllKeys(object, keysFunc, symbolsFunc) {
	  var result = keysFunc(object);
	  return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
	}
	var _baseGetAllKeys = baseGetAllKeys;

	/**
	 * A specialized version of `_.filter` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */
	function arrayFilter(array, predicate) {
	  var index = -1,
	    length = array == null ? 0 : array.length,
	    resIndex = 0,
	    result = [];
	  while (++index < length) {
	    var value = array[index];
	    if (predicate(value, index, array)) {
	      result[resIndex++] = value;
	    }
	  }
	  return result;
	}
	var _arrayFilter = arrayFilter;

	/**
	 * This method returns a new empty array.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {Array} Returns the new empty array.
	 * @example
	 *
	 * var arrays = _.times(2, _.stubArray);
	 *
	 * console.log(arrays);
	 * // => [[], []]
	 *
	 * console.log(arrays[0] === arrays[1]);
	 * // => false
	 */
	function stubArray() {
	  return [];
	}
	var stubArray_1 = stubArray;

	/** Used for built-in method references. */
	var objectProto$4 = Object.prototype;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto$4.propertyIsEnumerable;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

	/**
	 * Creates an array of the own enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols = !nativeGetSymbols$1 ? stubArray_1 : function (object) {
	  if (object == null) {
	    return [];
	  }
	  object = Object(object);
	  return _arrayFilter(nativeGetSymbols$1(object), function (symbol) {
	    return propertyIsEnumerable.call(object, symbol);
	  });
	};
	var _getSymbols = getSymbols;

	/**
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeys(object) {
	  return _baseGetAllKeys(object, keys_1, _getSymbols);
	}
	var _getAllKeys = getAllKeys;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$3 = 1;

	/** Used for built-in method references. */
	var objectProto$3 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$3 = objectProto$3.hasOwnProperty;

	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3,
	    objProps = _getAllKeys(object),
	    objLength = objProps.length,
	    othProps = _getAllKeys(other),
	    othLength = othProps.length;
	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : hasOwnProperty$3.call(other, key))) {
	      return false;
	    }
	  }
	  // Check that cyclic values are equal.
	  var objStacked = stack.get(object);
	  var othStacked = stack.get(other);
	  if (objStacked && othStacked) {
	    return objStacked == other && othStacked == object;
	  }
	  var result = true;
	  stack.set(object, other);
	  stack.set(other, object);
	  var skipCtor = isPartial;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	      othValue = other[key];
	    if (customizer) {
	      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
	    }
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
	      result = false;
	      break;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	      othCtor = other.constructor;

	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }
	  stack['delete'](object);
	  stack['delete'](other);
	  return result;
	}
	var _equalObjects = equalObjects;

	/* Built-in method references that are verified to be native. */
	var DataView$1 = _getNative(_root, 'DataView');
	var _DataView = DataView$1;

	/* Built-in method references that are verified to be native. */
	var Promise$1 = _getNative(_root, 'Promise');
	var _Promise = Promise$1;

	/* Built-in method references that are verified to be native. */
	var Set$1 = _getNative(_root, 'Set');
	var _Set = Set$1;

	/* Built-in method references that are verified to be native. */
	var WeakMap$1 = _getNative(_root, 'WeakMap');
	var _WeakMap = WeakMap$1;

	/** `Object#toString` result references. */
	var mapTag$1 = '[object Map]',
	  objectTag$1 = '[object Object]',
	  promiseTag = '[object Promise]',
	  setTag$1 = '[object Set]',
	  weakMapTag = '[object WeakMap]';
	var dataViewTag = '[object DataView]';

	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = _toSource(_DataView),
	  mapCtorString = _toSource(_Map),
	  promiseCtorString = _toSource(_Promise),
	  setCtorString = _toSource(_Set),
	  weakMapCtorString = _toSource(_WeakMap);

	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	var getTag = _baseGetTag;

	// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
	if (_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag || _Map && getTag(new _Map()) != mapTag$1 || _Promise && getTag(_Promise.resolve()) != promiseTag || _Set && getTag(new _Set()) != setTag$1 || _WeakMap && getTag(new _WeakMap()) != weakMapTag) {
	  getTag = function getTag(value) {
	    var result = _baseGetTag(value),
	      Ctor = result == objectTag$1 ? value.constructor : undefined,
	      ctorString = Ctor ? _toSource(Ctor) : '';
	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString:
	          return dataViewTag;
	        case mapCtorString:
	          return mapTag$1;
	        case promiseCtorString:
	          return promiseTag;
	        case setCtorString:
	          return setTag$1;
	        case weakMapCtorString:
	          return weakMapTag;
	      }
	    }
	    return result;
	  };
	}
	var _getTag = getTag;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$2 = 1;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	  arrayTag = '[object Array]',
	  objectTag = '[object Object]';

	/** Used for built-in method references. */
	var objectProto$2 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
	  var objIsArr = isArray_1(object),
	    othIsArr = isArray_1(other),
	    objTag = objIsArr ? arrayTag : _getTag(object),
	    othTag = othIsArr ? arrayTag : _getTag(other);
	  objTag = objTag == argsTag ? objectTag : objTag;
	  othTag = othTag == argsTag ? objectTag : othTag;
	  var objIsObj = objTag == objectTag,
	    othIsObj = othTag == objectTag,
	    isSameTag = objTag == othTag;
	  if (isSameTag && isBuffer_1(object)) {
	    if (!isBuffer_1(other)) {
	      return false;
	    }
	    objIsArr = true;
	    objIsObj = false;
	  }
	  if (isSameTag && !objIsObj) {
	    stack || (stack = new _Stack());
	    return objIsArr || isTypedArray_1(object) ? _equalArrays(object, other, bitmask, customizer, equalFunc, stack) : _equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
	  }
	  if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
	    var objIsWrapped = objIsObj && hasOwnProperty$2.call(object, '__wrapped__'),
	      othIsWrapped = othIsObj && hasOwnProperty$2.call(other, '__wrapped__');
	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	        othUnwrapped = othIsWrapped ? other.value() : other;
	      stack || (stack = new _Stack());
	      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new _Stack());
	  return _equalObjects(object, other, bitmask, customizer, equalFunc, stack);
	}
	var _baseIsEqualDeep = baseIsEqualDeep;

	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {boolean} bitmask The bitmask flags.
	 *  1 - Unordered comparison
	 *  2 - Partial comparison
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, bitmask, customizer, stack) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || !isObjectLike_1(value) && !isObjectLike_1(other)) {
	    return value !== value && other !== other;
	  }
	  return _baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
	}
	var _baseIsEqual = baseIsEqual;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$1 = 1,
	  COMPARE_UNORDERED_FLAG$1 = 2;

	/**
	 * The base implementation of `_.isMatch` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Object} source The object of property values to match.
	 * @param {Array} matchData The property names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch(object, source, matchData, customizer) {
	  var index = matchData.length,
	    length = index,
	    noCustomizer = !customizer;
	  if (object == null) {
	    return !length;
	  }
	  object = Object(object);
	  while (index--) {
	    var data = matchData[index];
	    if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
	      return false;
	    }
	  }
	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	      objValue = object[key],
	      srcValue = data[1];
	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var stack = new _Stack();
	      if (customizer) {
	        var result = customizer(objValue, srcValue, key, object, source, stack);
	      }
	      if (!(result === undefined ? _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack) : result)) {
	        return false;
	      }
	    }
	  }
	  return true;
	}
	var _baseIsMatch = baseIsMatch;

	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable(value) {
	  return value === value && !isObject_1(value);
	}
	var _isStrictComparable = isStrictComparable;

	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData(object) {
	  var result = keys_1(object),
	    length = result.length;
	  while (length--) {
	    var key = result[length],
	      value = object[key];
	    result[length] = [key, value, _isStrictComparable(value)];
	  }
	  return result;
	}
	var _getMatchData = getMatchData;

	/**
	 * A specialized version of `matchesProperty` for source values suitable
	 * for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function matchesStrictComparable(key, srcValue) {
	  return function (object) {
	    if (object == null) {
	      return false;
	    }
	    return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
	  };
	}
	var _matchesStrictComparable = matchesStrictComparable;

	/**
	 * The base implementation of `_.matches` which doesn't clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatches(source) {
	  var matchData = _getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    return _matchesStrictComparable(matchData[0][0], matchData[0][1]);
	  }
	  return function (object) {
	    return object === source || _baseIsMatch(object, source, matchData);
	  };
	}
	var _baseMatches = baseMatches;

	/**
	 * Gets the value at `path` of `object`. If the resolved value is
	 * `undefined`, the `defaultValue` is returned in its place.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.7.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
	 * @returns {*} Returns the resolved value.
	 * @example
	 *
	 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	 *
	 * _.get(object, 'a[0].b.c');
	 * // => 3
	 *
	 * _.get(object, ['a', '0', 'b', 'c']);
	 * // => 3
	 *
	 * _.get(object, 'a.b.c', 'default');
	 * // => 'default'
	 */
	function get(object, path, defaultValue) {
	  var result = object == null ? undefined : _baseGet(object, path);
	  return result === undefined ? defaultValue : result;
	}
	var get_1 = get;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	  COMPARE_UNORDERED_FLAG = 2;

	/**
	 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatchesProperty(path, srcValue) {
	  if (_isKey(path) && _isStrictComparable(srcValue)) {
	    return _matchesStrictComparable(_toKey(path), srcValue);
	  }
	  return function (object) {
	    var objValue = get_1(object, path);
	    return objValue === undefined && objValue === srcValue ? hasIn_1(object, path) : _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
	  };
	}
	var _baseMatchesProperty = baseMatchesProperty;

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function baseProperty(key) {
	  return function (object) {
	    return object == null ? undefined : object[key];
	  };
	}
	var _baseProperty = baseProperty;

	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyDeep(path) {
	  return function (object) {
	    return _baseGet(object, path);
	  };
	}
	var _basePropertyDeep = basePropertyDeep;

	/**
	 * Creates a function that returns the value at `path` of a given object.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': 2 } },
	 *   { 'a': { 'b': 1 } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b'));
	 * // => [2, 1]
	 *
	 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
	 * // => [1, 2]
	 */
	function property(path) {
	  return _isKey(path) ? _baseProperty(_toKey(path)) : _basePropertyDeep(path);
	}
	var property_1 = property;

	/**
	 * The base implementation of `_.iteratee`.
	 *
	 * @private
	 * @param {*} [value=_.identity] The value to convert to an iteratee.
	 * @returns {Function} Returns the iteratee.
	 */
	function baseIteratee(value) {
	  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
	  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
	  if (typeof value == 'function') {
	    return value;
	  }
	  if (value == null) {
	    return identity_1;
	  }
	  if (_typeof(value) == 'object') {
	    return isArray_1(value) ? _baseMatchesProperty(value[0], value[1]) : _baseMatches(value);
	  }
	  return property_1(value);
	}
	var _baseIteratee = baseIteratee;

	/** Built-in value references. */
	var getPrototype = _overArg(Object.getPrototypeOf, Object);
	var _getPrototype = getPrototype;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols;

	/**
	 * Creates an array of the own and inherited enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbolsIn = !nativeGetSymbols ? stubArray_1 : function (object) {
	  var result = [];
	  while (object) {
	    _arrayPush(result, _getSymbols(object));
	    object = _getPrototype(object);
	  }
	  return result;
	};
	var _getSymbolsIn = getSymbolsIn;

	/**
	 * This function is like
	 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * except that it includes inherited enumerable properties.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function nativeKeysIn(object) {
	  var result = [];
	  if (object != null) {
	    for (var key in Object(object)) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	var _nativeKeysIn = nativeKeysIn;

	/** Used for built-in method references. */
	var objectProto$1 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

	/**
	 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeysIn(object) {
	  if (!isObject_1(object)) {
	    return _nativeKeysIn(object);
	  }
	  var isProto = _isPrototype(object),
	    result = [];
	  for (var key in object) {
	    if (!(key == 'constructor' && (isProto || !hasOwnProperty$1.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	var _baseKeysIn = baseKeysIn;

	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */
	function keysIn(object) {
	  return isArrayLike_1(object) ? _arrayLikeKeys(object, true) : _baseKeysIn(object);
	}
	var keysIn_1 = keysIn;

	/**
	 * Creates an array of own and inherited enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeysIn(object) {
	  return _baseGetAllKeys(object, keysIn_1, _getSymbolsIn);
	}
	var _getAllKeysIn = getAllKeysIn;

	/**
	 * Creates an object composed of the `object` properties `predicate` returns
	 * truthy for. The predicate is invoked with two arguments: (value, key).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The source object.
	 * @param {Function} [predicate=_.identity] The function invoked per property.
	 * @returns {Object} Returns the new object.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': '2', 'c': 3 };
	 *
	 * _.pickBy(object, _.isNumber);
	 * // => { 'a': 1, 'c': 3 }
	 */
	function pickBy(object, predicate) {
	  if (object == null) {
	    return {};
	  }
	  var props = _arrayMap(_getAllKeysIn(object), function (prop) {
	    return [prop];
	  });
	  predicate = _baseIteratee(predicate);
	  return _basePickBy(object, props, function (value, path) {
	    return predicate(value, path[0]);
	  });
	}
	var pickBy_1 = pickBy;

	/**
	 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function (object, iteratee, keysFunc) {
	    var index = -1,
	      iterable = Object(object),
	      props = keysFunc(object),
	      length = props.length;
	    while (length--) {
	      var key = props[fromRight ? length : ++index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}
	var _createBaseFor = createBaseFor;

	/**
	 * The base implementation of `baseForOwn` which iterates over `object`
	 * properties returned by `keysFunc` and invokes `iteratee` for each property.
	 * Iteratee functions may exit iteration early by explicitly returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = _createBaseFor();
	var _baseFor = baseFor;

	/**
	 * The base implementation of `_.forOwn` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return object && _baseFor(object, iteratee, keys_1);
	}
	var _baseForOwn = baseForOwn;

	/**
	 * Creates a `baseEach` or `baseEachRight` function.
	 *
	 * @private
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseEach(eachFunc, fromRight) {
	  return function (collection, iteratee) {
	    if (collection == null) {
	      return collection;
	    }
	    if (!isArrayLike_1(collection)) {
	      return eachFunc(collection, iteratee);
	    }
	    var length = collection.length,
	      index = fromRight ? length : -1,
	      iterable = Object(collection);
	    while (fromRight ? index-- : ++index < length) {
	      if (iteratee(iterable[index], index, iterable) === false) {
	        break;
	      }
	    }
	    return collection;
	  };
	}
	var _createBaseEach = createBaseEach;

	/**
	 * The base implementation of `_.forEach` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object} Returns `collection`.
	 */
	var baseEach = _createBaseEach(_baseForOwn);
	var _baseEach = baseEach;

	/**
	 * The base implementation of `_.map` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function baseMap(collection, iteratee) {
	  var index = -1,
	    result = isArrayLike_1(collection) ? Array(collection.length) : [];
	  _baseEach(collection, function (value, key, collection) {
	    result[++index] = iteratee(value, key, collection);
	  });
	  return result;
	}
	var _baseMap = baseMap;

	/**
	 * Creates an array of values by running each element in `collection` thru
	 * `iteratee`. The iteratee is invoked with three arguments:
	 * (value, index|key, collection).
	 *
	 * Many lodash methods are guarded to work as iteratees for methods like
	 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
	 *
	 * The guarded methods are:
	 * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
	 * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
	 * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
	 * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 * @example
	 *
	 * function square(n) {
	 *   return n * n;
	 * }
	 *
	 * _.map([4, 8], square);
	 * // => [16, 64]
	 *
	 * _.map({ 'a': 4, 'b': 8 }, square);
	 * // => [16, 64] (iteration order is not guaranteed)
	 *
	 * var users = [
	 *   { 'user': 'barney' },
	 *   { 'user': 'fred' }
	 * ];
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.map(users, 'user');
	 * // => ['barney', 'fred']
	 */
	function map(collection, iteratee) {
	  var func = isArray_1(collection) ? _arrayMap : _baseMap;
	  return func(collection, _baseIteratee(iteratee));
	}
	var map_1 = map;

	/**
	 * The base implementation of `_.slice` without an iteratee call guard.
	 *
	 * @private
	 * @param {Array} array The array to slice.
	 * @param {number} [start=0] The start position.
	 * @param {number} [end=array.length] The end position.
	 * @returns {Array} Returns the slice of `array`.
	 */
	function baseSlice(array, start, end) {
	  var index = -1,
	    length = array.length;
	  if (start < 0) {
	    start = -start > length ? 0 : length + start;
	  }
	  end = end > length ? length : end;
	  if (end < 0) {
	    end += length;
	  }
	  length = start > end ? 0 : end - start >>> 0;
	  start >>>= 0;
	  var result = Array(length);
	  while (++index < length) {
	    result[index] = array[index + start];
	  }
	  return result;
	}
	var _baseSlice = baseSlice;

	/**
	 * Casts `array` to a slice if it's needed.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {number} start The start position.
	 * @param {number} [end=array.length] The end position.
	 * @returns {Array} Returns the cast slice.
	 */
	function castSlice(array, start, end) {
	  var length = array.length;
	  end = end === undefined ? length : end;
	  return !start && end >= length ? array : _baseSlice(array, start, end);
	}
	var _castSlice = castSlice;

	/** Used to compose unicode character classes. */
	var rsAstralRange$2 = "\\ud800-\\udfff",
	  rsComboMarksRange$3 = "\\u0300-\\u036f",
	  reComboHalfMarksRange$3 = "\\ufe20-\\ufe2f",
	  rsComboSymbolsRange$3 = "\\u20d0-\\u20ff",
	  rsComboRange$3 = rsComboMarksRange$3 + reComboHalfMarksRange$3 + rsComboSymbolsRange$3,
	  rsVarRange$2 = "\\ufe0e\\ufe0f";

	/** Used to compose unicode capture groups. */
	var rsZWJ$2 = "\\u200d";

	/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
	var reHasUnicode = RegExp('[' + rsZWJ$2 + rsAstralRange$2 + rsComboRange$3 + rsVarRange$2 + ']');

	/**
	 * Checks if `string` contains Unicode symbols.
	 *
	 * @private
	 * @param {string} string The string to inspect.
	 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
	 */
	function hasUnicode(string) {
	  return reHasUnicode.test(string);
	}
	var _hasUnicode = hasUnicode;

	/**
	 * Converts an ASCII `string` to an array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the converted array.
	 */
	function asciiToArray(string) {
	  return string.split('');
	}
	var _asciiToArray = asciiToArray;

	/** Used to compose unicode character classes. */
	var rsAstralRange$1 = "\\ud800-\\udfff",
	  rsComboMarksRange$2 = "\\u0300-\\u036f",
	  reComboHalfMarksRange$2 = "\\ufe20-\\ufe2f",
	  rsComboSymbolsRange$2 = "\\u20d0-\\u20ff",
	  rsComboRange$2 = rsComboMarksRange$2 + reComboHalfMarksRange$2 + rsComboSymbolsRange$2,
	  rsVarRange$1 = "\\ufe0e\\ufe0f";

	/** Used to compose unicode capture groups. */
	var rsAstral = '[' + rsAstralRange$1 + ']',
	  rsCombo$2 = '[' + rsComboRange$2 + ']',
	  rsFitz$1 = "\\ud83c[\\udffb-\\udfff]",
	  rsModifier$1 = '(?:' + rsCombo$2 + '|' + rsFitz$1 + ')',
	  rsNonAstral$1 = '[^' + rsAstralRange$1 + ']',
	  rsRegional$1 = "(?:\\ud83c[\\udde6-\\uddff]){2}",
	  rsSurrPair$1 = "[\\ud800-\\udbff][\\udc00-\\udfff]",
	  rsZWJ$1 = "\\u200d";

	/** Used to compose unicode regexes. */
	var reOptMod$1 = rsModifier$1 + '?',
	  rsOptVar$1 = '[' + rsVarRange$1 + ']?',
	  rsOptJoin$1 = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral$1, rsRegional$1, rsSurrPair$1].join('|') + ')' + rsOptVar$1 + reOptMod$1 + ')*',
	  rsSeq$1 = rsOptVar$1 + reOptMod$1 + rsOptJoin$1,
	  rsSymbol = '(?:' + [rsNonAstral$1 + rsCombo$2 + '?', rsCombo$2, rsRegional$1, rsSurrPair$1, rsAstral].join('|') + ')';

	/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
	var reUnicode = RegExp(rsFitz$1 + '(?=' + rsFitz$1 + ')|' + rsSymbol + rsSeq$1, 'g');

	/**
	 * Converts a Unicode `string` to an array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the converted array.
	 */
	function unicodeToArray(string) {
	  return string.match(reUnicode) || [];
	}
	var _unicodeToArray = unicodeToArray;

	/**
	 * Converts `string` to an array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the converted array.
	 */
	function stringToArray(string) {
	  return _hasUnicode(string) ? _unicodeToArray(string) : _asciiToArray(string);
	}
	var _stringToArray = stringToArray;

	/**
	 * Creates a function like `_.lowerFirst`.
	 *
	 * @private
	 * @param {string} methodName The name of the `String` case method to use.
	 * @returns {Function} Returns the new case function.
	 */
	function createCaseFirst(methodName) {
	  return function (string) {
	    string = toString_1(string);
	    var strSymbols = _hasUnicode(string) ? _stringToArray(string) : undefined;
	    var chr = strSymbols ? strSymbols[0] : string.charAt(0);
	    var trailing = strSymbols ? _castSlice(strSymbols, 1).join('') : string.slice(1);
	    return chr[methodName]() + trailing;
	  };
	}
	var _createCaseFirst = createCaseFirst;

	/**
	 * Converts the first character of `string` to upper case.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category String
	 * @param {string} [string=''] The string to convert.
	 * @returns {string} Returns the converted string.
	 * @example
	 *
	 * _.upperFirst('fred');
	 * // => 'Fred'
	 *
	 * _.upperFirst('FRED');
	 * // => 'FRED'
	 */
	var upperFirst = _createCaseFirst('toUpperCase');
	var upperFirst_1 = upperFirst;

	/**
	 * Converts the first character of `string` to upper case and the remaining
	 * to lower case.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category String
	 * @param {string} [string=''] The string to capitalize.
	 * @returns {string} Returns the capitalized string.
	 * @example
	 *
	 * _.capitalize('FRED');
	 * // => 'Fred'
	 */
	function capitalize(string) {
	  return upperFirst_1(toString_1(string).toLowerCase());
	}
	var capitalize_1 = capitalize;

	/**
	 * A specialized version of `_.reduce` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {*} [accumulator] The initial value.
	 * @param {boolean} [initAccum] Specify using the first element of `array` as
	 *  the initial value.
	 * @returns {*} Returns the accumulated value.
	 */
	function arrayReduce(array, iteratee, accumulator, initAccum) {
	  var index = -1,
	    length = array == null ? 0 : array.length;
	  if (initAccum && length) {
	    accumulator = array[++index];
	  }
	  while (++index < length) {
	    accumulator = iteratee(accumulator, array[index], index, array);
	  }
	  return accumulator;
	}
	var _arrayReduce = arrayReduce;

	/**
	 * The base implementation of `_.propertyOf` without support for deep paths.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyOf(object) {
	  return function (key) {
	    return object == null ? undefined : object[key];
	  };
	}
	var _basePropertyOf = basePropertyOf;

	/** Used to map Latin Unicode letters to basic Latin letters. */
	var deburredLetters = {
	  // Latin-1 Supplement block.
	  '\xc0': 'A',
	  '\xc1': 'A',
	  '\xc2': 'A',
	  '\xc3': 'A',
	  '\xc4': 'A',
	  '\xc5': 'A',
	  '\xe0': 'a',
	  '\xe1': 'a',
	  '\xe2': 'a',
	  '\xe3': 'a',
	  '\xe4': 'a',
	  '\xe5': 'a',
	  '\xc7': 'C',
	  '\xe7': 'c',
	  '\xd0': 'D',
	  '\xf0': 'd',
	  '\xc8': 'E',
	  '\xc9': 'E',
	  '\xca': 'E',
	  '\xcb': 'E',
	  '\xe8': 'e',
	  '\xe9': 'e',
	  '\xea': 'e',
	  '\xeb': 'e',
	  '\xcc': 'I',
	  '\xcd': 'I',
	  '\xce': 'I',
	  '\xcf': 'I',
	  '\xec': 'i',
	  '\xed': 'i',
	  '\xee': 'i',
	  '\xef': 'i',
	  '\xd1': 'N',
	  '\xf1': 'n',
	  '\xd2': 'O',
	  '\xd3': 'O',
	  '\xd4': 'O',
	  '\xd5': 'O',
	  '\xd6': 'O',
	  '\xd8': 'O',
	  '\xf2': 'o',
	  '\xf3': 'o',
	  '\xf4': 'o',
	  '\xf5': 'o',
	  '\xf6': 'o',
	  '\xf8': 'o',
	  '\xd9': 'U',
	  '\xda': 'U',
	  '\xdb': 'U',
	  '\xdc': 'U',
	  '\xf9': 'u',
	  '\xfa': 'u',
	  '\xfb': 'u',
	  '\xfc': 'u',
	  '\xdd': 'Y',
	  '\xfd': 'y',
	  '\xff': 'y',
	  '\xc6': 'Ae',
	  '\xe6': 'ae',
	  '\xde': 'Th',
	  '\xfe': 'th',
	  '\xdf': 'ss',
	  // Latin Extended-A block.
	  "\u0100": 'A',
	  "\u0102": 'A',
	  "\u0104": 'A',
	  "\u0101": 'a',
	  "\u0103": 'a',
	  "\u0105": 'a',
	  "\u0106": 'C',
	  "\u0108": 'C',
	  "\u010A": 'C',
	  "\u010C": 'C',
	  "\u0107": 'c',
	  "\u0109": 'c',
	  "\u010B": 'c',
	  "\u010D": 'c',
	  "\u010E": 'D',
	  "\u0110": 'D',
	  "\u010F": 'd',
	  "\u0111": 'd',
	  "\u0112": 'E',
	  "\u0114": 'E',
	  "\u0116": 'E',
	  "\u0118": 'E',
	  "\u011A": 'E',
	  "\u0113": 'e',
	  "\u0115": 'e',
	  "\u0117": 'e',
	  "\u0119": 'e',
	  "\u011B": 'e',
	  "\u011C": 'G',
	  "\u011E": 'G',
	  "\u0120": 'G',
	  "\u0122": 'G',
	  "\u011D": 'g',
	  "\u011F": 'g',
	  "\u0121": 'g',
	  "\u0123": 'g',
	  "\u0124": 'H',
	  "\u0126": 'H',
	  "\u0125": 'h',
	  "\u0127": 'h',
	  "\u0128": 'I',
	  "\u012A": 'I',
	  "\u012C": 'I',
	  "\u012E": 'I',
	  "\u0130": 'I',
	  "\u0129": 'i',
	  "\u012B": 'i',
	  "\u012D": 'i',
	  "\u012F": 'i',
	  "\u0131": 'i',
	  "\u0134": 'J',
	  "\u0135": 'j',
	  "\u0136": 'K',
	  "\u0137": 'k',
	  "\u0138": 'k',
	  "\u0139": 'L',
	  "\u013B": 'L',
	  "\u013D": 'L',
	  "\u013F": 'L',
	  "\u0141": 'L',
	  "\u013A": 'l',
	  "\u013C": 'l',
	  "\u013E": 'l',
	  "\u0140": 'l',
	  "\u0142": 'l',
	  "\u0143": 'N',
	  "\u0145": 'N',
	  "\u0147": 'N',
	  "\u014A": 'N',
	  "\u0144": 'n',
	  "\u0146": 'n',
	  "\u0148": 'n',
	  "\u014B": 'n',
	  "\u014C": 'O',
	  "\u014E": 'O',
	  "\u0150": 'O',
	  "\u014D": 'o',
	  "\u014F": 'o',
	  "\u0151": 'o',
	  "\u0154": 'R',
	  "\u0156": 'R',
	  "\u0158": 'R',
	  "\u0155": 'r',
	  "\u0157": 'r',
	  "\u0159": 'r',
	  "\u015A": 'S',
	  "\u015C": 'S',
	  "\u015E": 'S',
	  "\u0160": 'S',
	  "\u015B": 's',
	  "\u015D": 's',
	  "\u015F": 's',
	  "\u0161": 's',
	  "\u0162": 'T',
	  "\u0164": 'T',
	  "\u0166": 'T',
	  "\u0163": 't',
	  "\u0165": 't',
	  "\u0167": 't',
	  "\u0168": 'U',
	  "\u016A": 'U',
	  "\u016C": 'U',
	  "\u016E": 'U',
	  "\u0170": 'U',
	  "\u0172": 'U',
	  "\u0169": 'u',
	  "\u016B": 'u',
	  "\u016D": 'u',
	  "\u016F": 'u',
	  "\u0171": 'u',
	  "\u0173": 'u',
	  "\u0174": 'W',
	  "\u0175": 'w',
	  "\u0176": 'Y',
	  "\u0177": 'y',
	  "\u0178": 'Y',
	  "\u0179": 'Z',
	  "\u017B": 'Z',
	  "\u017D": 'Z',
	  "\u017A": 'z',
	  "\u017C": 'z',
	  "\u017E": 'z',
	  "\u0132": 'IJ',
	  "\u0133": 'ij',
	  "\u0152": 'Oe',
	  "\u0153": 'oe',
	  "\u0149": "'n",
	  "\u017F": 's'
	};

	/**
	 * Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
	 * letters to basic Latin letters.
	 *
	 * @private
	 * @param {string} letter The matched letter to deburr.
	 * @returns {string} Returns the deburred letter.
	 */
	var deburrLetter = _basePropertyOf(deburredLetters);
	var _deburrLetter = deburrLetter;

	/** Used to match Latin Unicode letters (excluding mathematical operators). */
	var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

	/** Used to compose unicode character classes. */
	var rsComboMarksRange$1 = "\\u0300-\\u036f",
	  reComboHalfMarksRange$1 = "\\ufe20-\\ufe2f",
	  rsComboSymbolsRange$1 = "\\u20d0-\\u20ff",
	  rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1;

	/** Used to compose unicode capture groups. */
	var rsCombo$1 = '[' + rsComboRange$1 + ']';

	/**
	 * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
	 * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
	 */
	var reComboMark = RegExp(rsCombo$1, 'g');

	/**
	 * Deburrs `string` by converting
	 * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
	 * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
	 * letters to basic Latin letters and removing
	 * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category String
	 * @param {string} [string=''] The string to deburr.
	 * @returns {string} Returns the deburred string.
	 * @example
	 *
	 * _.deburr('déjà vu');
	 * // => 'deja vu'
	 */
	function deburr(string) {
	  string = toString_1(string);
	  return string && string.replace(reLatin, _deburrLetter).replace(reComboMark, '');
	}
	var deburr_1 = deburr;

	/** Used to match words composed of alphanumeric characters. */
	var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

	/**
	 * Splits an ASCII `string` into an array of its words.
	 *
	 * @private
	 * @param {string} The string to inspect.
	 * @returns {Array} Returns the words of `string`.
	 */
	function asciiWords(string) {
	  return string.match(reAsciiWord) || [];
	}
	var _asciiWords = asciiWords;

	/** Used to detect strings that need a more robust regexp to match words. */
	var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;

	/**
	 * Checks if `string` contains a word composed of Unicode symbols.
	 *
	 * @private
	 * @param {string} string The string to inspect.
	 * @returns {boolean} Returns `true` if a word is found, else `false`.
	 */
	function hasUnicodeWord(string) {
	  return reHasUnicodeWord.test(string);
	}
	var _hasUnicodeWord = hasUnicodeWord;

	/** Used to compose unicode character classes. */
	var rsAstralRange = "\\ud800-\\udfff",
	  rsComboMarksRange = "\\u0300-\\u036f",
	  reComboHalfMarksRange = "\\ufe20-\\ufe2f",
	  rsComboSymbolsRange = "\\u20d0-\\u20ff",
	  rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
	  rsDingbatRange = "\\u2700-\\u27bf",
	  rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff',
	  rsMathOpRange = '\\xac\\xb1\\xd7\\xf7',
	  rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf',
	  rsPunctuationRange = "\\u2000-\\u206f",
	  rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000",
	  rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde',
	  rsVarRange = "\\ufe0e\\ufe0f",
	  rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;

	/** Used to compose unicode capture groups. */
	var rsApos$1 = "['\u2019]",
	  rsBreak = '[' + rsBreakRange + ']',
	  rsCombo = '[' + rsComboRange + ']',
	  rsDigits = '\\d+',
	  rsDingbat = '[' + rsDingbatRange + ']',
	  rsLower = '[' + rsLowerRange + ']',
	  rsMisc = '[^' + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + ']',
	  rsFitz = "\\ud83c[\\udffb-\\udfff]",
	  rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
	  rsNonAstral = '[^' + rsAstralRange + ']',
	  rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}",
	  rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]",
	  rsUpper = '[' + rsUpperRange + ']',
	  rsZWJ = "\\u200d";

	/** Used to compose unicode regexes. */
	var rsMiscLower = '(?:' + rsLower + '|' + rsMisc + ')',
	  rsMiscUpper = '(?:' + rsUpper + '|' + rsMisc + ')',
	  rsOptContrLower = '(?:' + rsApos$1 + '(?:d|ll|m|re|s|t|ve))?',
	  rsOptContrUpper = '(?:' + rsApos$1 + '(?:D|LL|M|RE|S|T|VE))?',
	  reOptMod = rsModifier + '?',
	  rsOptVar = '[' + rsVarRange + ']?',
	  rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
	  rsOrdLower = '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])',
	  rsOrdUpper = '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])',
	  rsSeq = rsOptVar + reOptMod + rsOptJoin,
	  rsEmoji = '(?:' + [rsDingbat, rsRegional, rsSurrPair].join('|') + ')' + rsSeq;

	/** Used to match complex or compound words. */
	var reUnicodeWord = RegExp([rsUpper + '?' + rsLower + '+' + rsOptContrLower + '(?=' + [rsBreak, rsUpper, '$'].join('|') + ')', rsMiscUpper + '+' + rsOptContrUpper + '(?=' + [rsBreak, rsUpper + rsMiscLower, '$'].join('|') + ')', rsUpper + '?' + rsMiscLower + '+' + rsOptContrLower, rsUpper + '+' + rsOptContrUpper, rsOrdUpper, rsOrdLower, rsDigits, rsEmoji].join('|'), 'g');

	/**
	 * Splits a Unicode `string` into an array of its words.
	 *
	 * @private
	 * @param {string} The string to inspect.
	 * @returns {Array} Returns the words of `string`.
	 */
	function unicodeWords(string) {
	  return string.match(reUnicodeWord) || [];
	}
	var _unicodeWords = unicodeWords;

	/**
	 * Splits `string` into an array of its words.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category String
	 * @param {string} [string=''] The string to inspect.
	 * @param {RegExp|string} [pattern] The pattern to match words.
	 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	 * @returns {Array} Returns the words of `string`.
	 * @example
	 *
	 * _.words('fred, barney, & pebbles');
	 * // => ['fred', 'barney', 'pebbles']
	 *
	 * _.words('fred, barney, & pebbles', /[^, ]+/g);
	 * // => ['fred', 'barney', '&', 'pebbles']
	 */
	function words(string, pattern, guard) {
	  string = toString_1(string);
	  pattern = guard ? undefined : pattern;
	  if (pattern === undefined) {
	    return _hasUnicodeWord(string) ? _unicodeWords(string) : _asciiWords(string);
	  }
	  return string.match(pattern) || [];
	}
	var words_1 = words;

	/** Used to compose unicode capture groups. */
	var rsApos = "['\u2019]";

	/** Used to match apostrophes. */
	var reApos = RegExp(rsApos, 'g');

	/**
	 * Creates a function like `_.camelCase`.
	 *
	 * @private
	 * @param {Function} callback The function to combine each word.
	 * @returns {Function} Returns the new compounder function.
	 */
	function createCompounder(callback) {
	  return function (string) {
	    return _arrayReduce(words_1(deburr_1(string).replace(reApos, '')), callback, '');
	  };
	}
	var _createCompounder = createCompounder;

	/**
	 * Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category String
	 * @param {string} [string=''] The string to convert.
	 * @returns {string} Returns the camel cased string.
	 * @example
	 *
	 * _.camelCase('Foo Bar');
	 * // => 'fooBar'
	 *
	 * _.camelCase('--foo-bar--');
	 * // => 'fooBar'
	 *
	 * _.camelCase('__FOO_BAR__');
	 * // => 'fooBar'
	 */
	var camelCase = _createCompounder(function (result, word, index) {
	  word = word.toLowerCase();
	  return result + (index ? capitalize_1(word) : word);
	});
	var camelCase_1 = camelCase;

	/**
	 * Converts `string` to
	 * [snake case](https://en.wikipedia.org/wiki/Snake_case).
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category String
	 * @param {string} [string=''] The string to convert.
	 * @returns {string} Returns the snake cased string.
	 * @example
	 *
	 * _.snakeCase('Foo Bar');
	 * // => 'foo_bar'
	 *
	 * _.snakeCase('fooBar');
	 * // => 'foo_bar'
	 *
	 * _.snakeCase('--FOO-BAR--');
	 * // => 'foo_bar'
	 */
	var snakeCase$1 = _createCompounder(function (result, word, index) {
	  return result + (index ? '_' : '') + word.toLowerCase();
	});
	var snakeCase_1 = snakeCase$1;

	const camelCaseProperties = (object) => transformObjectProperties(object, camelCase_1);
	const snakeCaseProperties = (object) => transformObjectProperties(object, snakeCase);
	/**
	 * Won't convert the value of the field, but the field key will be converted.
	 * The values in this list should be in snake_case.
	 */
	const fieldsNotToConvert = ['custom_fields', 'consents'];
	function transformObjectProperties(input, transform) {
	    if (Array.isArray(input)) {
	        return input.map(value => transformObjectProperties(value, transform));
	    }
	    if (typeof input === "object" && input !== null) {
	        return Object.fromEntries(Object.entries(input).map(([key, value]) => ([
	            transform(key),
	            fieldsNotToConvert.find(s => s === snakeCase(key))
	                ? value
	                : transformObjectProperties(value, transform)
	        ])));
	    }
	    return input;
	}
	/* reuse lodash as it covers most cases, but we want the same behavior as the
	   snakecasing strategy on the server where numbers are not separated from non numbers.  */
	function snakeCase(input) {
	    return snakeCase_1(input).replace(/_\d/g, dashNumber => dashNumber.slice(1));
	}

	/**
	 * Basic query string parser.
	 * !! Does not support multi valued parameters
	 */
	function parseQueryString(queryString) {
	    const qs = queryString.split('&').reduce((acc, param) => {
	        const [key, value = ''] = param.split('=');
	        if (key && key.length) {
	            return Object.assign(Object.assign({}, acc), { [key]: decodeURIComponent(value.replace(/\+/g, ' ')) });
	        }
	        else {
	            return acc;
	        }
	    }, {});
	    return camelCaseProperties(qs);
	}
	function toQueryString(obj, snakeCase = true) {
	    const params = snakeCase ? snakeCaseProperties(obj) : obj;
	    return map_1(pickBy_1(params, v => v !== null && v !== undefined), (value, key) => value !== '' ? `${key}=${encodeURIComponent(value)}` : key).join('&');
	}

	exports.MFA = void 0;
	(function (MFA) {
	    function isPhoneCredential(credential) {
	        return credential.type === 'sms';
	    }
	    MFA.isPhoneCredential = isPhoneCredential;
	    function isEmailCredential(credential) {
	        return credential.type === 'email';
	    }
	    MFA.isEmailCredential = isEmailCredential;
	})(exports.MFA || (exports.MFA = {}));
	exports.ErrorResponse = void 0;
	(function (ErrorResponse) {
	    function isErrorResponse(thing) {
	        return typeof thing === 'object' && thing !== null && 'error' in thing;
	    }
	    ErrorResponse.isErrorResponse = isErrorResponse;
	})(exports.ErrorResponse || (exports.ErrorResponse = {}));

	/**
	 * This method returns `undefined`.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.3.0
	 * @category Util
	 * @example
	 *
	 * _.times(2, _.noop);
	 * // => [undefined, undefined]
	 */
	function noop() {
	  // No operation performed.
	}
	var noop_1 = noop;

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;

	/**
	 * Creates a set object of `values`.
	 *
	 * @private
	 * @param {Array} values The values to add to the set.
	 * @returns {Object} Returns the new set.
	 */
	var createSet = !(_Set && 1 / _setToArray(new _Set([, -0]))[1] == INFINITY) ? noop_1 : function (values) {
	  return new _Set(values);
	};
	var _createSet = createSet;

	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;

	/**
	 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} [iteratee] The iteratee invoked per element.
	 * @param {Function} [comparator] The comparator invoked per element.
	 * @returns {Array} Returns the new duplicate free array.
	 */
	function baseUniq(array, iteratee, comparator) {
	  var index = -1,
	    includes = _arrayIncludes,
	    length = array.length,
	    isCommon = true,
	    result = [],
	    seen = result;
	  if (comparator) {
	    isCommon = false;
	    includes = _arrayIncludesWith;
	  } else if (length >= LARGE_ARRAY_SIZE) {
	    var set = iteratee ? null : _createSet(array);
	    if (set) {
	      return _setToArray(set);
	    }
	    isCommon = false;
	    includes = _cacheHas;
	    seen = new _SetCache();
	  } else {
	    seen = iteratee ? [] : result;
	  }
	  outer: while (++index < length) {
	    var value = array[index],
	      computed = iteratee ? iteratee(value) : value;
	    value = comparator || value !== 0 ? value : 0;
	    if (isCommon && computed === computed) {
	      var seenIndex = seen.length;
	      while (seenIndex--) {
	        if (seen[seenIndex] === computed) {
	          continue outer;
	        }
	      }
	      if (iteratee) {
	        seen.push(computed);
	      }
	      result.push(value);
	    } else if (!includes(seen, computed, comparator)) {
	      if (seen !== result) {
	        seen.push(computed);
	      }
	      result.push(value);
	    }
	  }
	  return result;
	}
	var _baseUniq = baseUniq;

	/**
	 * Creates a duplicate-free version of an array, using
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons, in which only the first occurrence of each element
	 * is kept. The order of result values is determined by the order they occur
	 * in the array.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to inspect.
	 * @returns {Array} Returns the new duplicate free array.
	 * @example
	 *
	 * _.uniq([2, 1, 2]);
	 * // => [2, 1]
	 */
	function uniq(array) {
	  return array && array.length ? _baseUniq(array) : [];
	}
	var uniq_1 = uniq;

	/** `Object#toString` result references. */
	var stringTag = '[object String]';

	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
	 * @example
	 *
	 * _.isString('abc');
	 * // => true
	 *
	 * _.isString(1);
	 * // => false
	 */
	function isString(value) {
	  return typeof value == 'string' || !isArray_1(value) && isObjectLike_1(value) && _baseGetTag(value) == stringTag;
	}
	var isString_1 = isString;

	/**
	 * Resolve the actual oauth2 scope according to the authentication options.
	 */
	function resolveScope(opts = {}, defaultScopes) {
	    const fetchBasicProfile = isUndefined_1(opts.fetchBasicProfile) || opts.fetchBasicProfile;
	    const scopes = isUndefined_1(opts.scope) ? defaultScopes : opts.scope;
	    return uniq_1([
	        ...(fetchBasicProfile ? ['openid', 'profile', 'email', 'phone'] : []),
	        ...(opts.requireRefreshToken ? ['offline_access'] : []),
	        ...parseScope(scopes)
	    ]).join(' ');
	}
	/**
	 * Normalize the scope format (e.g. "openid email" => ["openid", "email"])
	 * @param scope Scope entered by the user
	 */
	function parseScope(scope) {
	    if (isUndefined_1(scope))
	        return [];
	    if (isArray_1(scope))
	        return scope;
	    if (isString_1(scope))
	        return scope.split(' ');
	    throw new Error('Invalid scope format: string or array expected.');
	}

	/**
	 * Transform authentication options into authentication parameters
	 * @param opts
	 *    Authentication options
	 * @param acceptPopupMode
	 *    Indicates if the popup mode is allowed (depends on the type of authentication or context)
	 * @param defaultScopes
	 *    Default scopes
	 */
	function computeAuthOptions(opts = {}, { acceptPopupMode = false } = {}, defaultScopes) {
	    const isPopup = opts.popupMode && acceptPopupMode;
	    const responseType = opts.redirectUri ? 'code' : 'token';
	    const responseMode = opts.useWebMessage && !isPopup ? 'web_message' : undefined;
	    const display = isPopup ? 'popup' : (responseMode !== 'web_message') ? 'page' : undefined;
	    const prompt = responseMode === 'web_message' ? 'none' : opts.prompt;
	    const scope = resolveScope(opts, defaultScopes);
	    return Object.assign(Object.assign({ responseType }, pick_1(opts, [
	        'responseType',
	        'redirectUri',
	        'origin',
	        'state',
	        'nonce',
	        'providerScope',
	        'idTokenHint',
	        'loginHint',
	        'accessToken',
	        'persistent'
	    ])), { scope,
	        display,
	        responseMode,
	        prompt });
	}

	var byteLength_1 = byteLength;
	var toByteArray_1 = toByteArray;
	var fromByteArray_1 = fromByteArray;
	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
	var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	for (var i = 0, len = code.length; i < len; ++i) {
	  lookup[i] = code[i];
	  revLookup[code.charCodeAt(i)] = i;
	}

	// Support decoding URL-safe base64 strings, as Node.js does.
	// See: https://en.wikipedia.org/wiki/Base64#URL_applications
	revLookup['-'.charCodeAt(0)] = 62;
	revLookup['_'.charCodeAt(0)] = 63;
	function getLens(b64) {
	  var len = b64.length;
	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4');
	  }

	  // Trim off extra bytes after placeholder bytes are found
	  // See: https://github.com/beatgammit/base64-js/issues/42
	  var validLen = b64.indexOf('=');
	  if (validLen === -1) validLen = len;
	  var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
	  return [validLen, placeHoldersLen];
	}

	// base64 is 4/3 + up to two characters of the original data
	function byteLength(b64) {
	  var lens = getLens(b64);
	  var validLen = lens[0];
	  var placeHoldersLen = lens[1];
	  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function _byteLength(b64, validLen, placeHoldersLen) {
	  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function toByteArray(b64) {
	  var tmp;
	  var lens = getLens(b64);
	  var validLen = lens[0];
	  var placeHoldersLen = lens[1];
	  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
	  var curByte = 0;

	  // if there are placeholders, only get up to the last complete 4 chars
	  var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
	  var i;
	  for (i = 0; i < len; i += 4) {
	    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
	    arr[curByte++] = tmp >> 16 & 0xFF;
	    arr[curByte++] = tmp >> 8 & 0xFF;
	    arr[curByte++] = tmp & 0xFF;
	  }
	  if (placeHoldersLen === 2) {
	    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
	    arr[curByte++] = tmp & 0xFF;
	  }
	  if (placeHoldersLen === 1) {
	    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
	    arr[curByte++] = tmp >> 8 & 0xFF;
	    arr[curByte++] = tmp & 0xFF;
	  }
	  return arr;
	}
	function tripletToBase64(num) {
	  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
	}
	function encodeChunk(uint8, start, end) {
	  var tmp;
	  var output = [];
	  for (var i = start; i < end; i += 3) {
	    tmp = (uint8[i] << 16 & 0xFF0000) + (uint8[i + 1] << 8 & 0xFF00) + (uint8[i + 2] & 0xFF);
	    output.push(tripletToBase64(tmp));
	  }
	  return output.join('');
	}
	function fromByteArray(uint8) {
	  var tmp;
	  var len = uint8.length;
	  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
	  var parts = [];
	  var maxChunkLength = 16383; // must be multiple of 3

	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
	  }

	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1];
	    parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 0x3F] + '==');
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
	    parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 0x3F] + lookup[tmp << 2 & 0x3F] + '=');
	  }
	  return parts.join('');
	}
	var base64Js = {
	  byteLength: byteLength_1,
	  toByteArray: toByteArray_1,
	  fromByteArray: fromByteArray_1
	};

	var read = function read(buffer, offset, isLE, mLen, nBytes) {
	  var e, m;
	  var eLen = nBytes * 8 - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var nBits = -7;
	  var i = isLE ? nBytes - 1 : 0;
	  var d = isLE ? -1 : 1;
	  var s = buffer[offset + i];
	  i += d;
	  e = s & (1 << -nBits) - 1;
	  s >>= -nBits;
	  nBits += eLen;
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
	  m = e & (1 << -nBits) - 1;
	  e >>= -nBits;
	  nBits += mLen;
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
	  if (e === 0) {
	    e = 1 - eBias;
	  } else if (e === eMax) {
	    return m ? NaN : (s ? -1 : 1) * Infinity;
	  } else {
	    m = m + Math.pow(2, mLen);
	    e = e - eBias;
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
	};
	var write = function write(buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c;
	  var eLen = nBytes * 8 - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
	  var i = isLE ? 0 : nBytes - 1;
	  var d = isLE ? 1 : -1;
	  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
	  value = Math.abs(value);
	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0;
	    e = eMax;
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2);
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--;
	      c *= 2;
	    }
	    if (e + eBias >= 1) {
	      value += rt / c;
	    } else {
	      value += rt * Math.pow(2, 1 - eBias);
	    }
	    if (value * c >= 2) {
	      e++;
	      c /= 2;
	    }
	    if (e + eBias >= eMax) {
	      m = 0;
	      e = eMax;
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen);
	      e = e + eBias;
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
	      e = 0;
	    }
	  }
	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
	  e = e << mLen | m;
	  eLen += mLen;
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
	  buffer[offset + i - d] |= s * 128;
	};
	var ieee754 = {
	  read: read,
	  write: write
	};

	var buffer = createCommonjsModule(function (module, exports) {

	  var customInspectSymbol = typeof Symbol === 'function' && typeof Symbol.for === 'function' ? Symbol.for('nodejs.util.inspect.custom') : null;
	  exports.Buffer = Buffer;
	  exports.SlowBuffer = SlowBuffer;
	  exports.INSPECT_MAX_BYTES = 50;
	  var K_MAX_LENGTH = 0x7fffffff;
	  exports.kMaxLength = K_MAX_LENGTH;

	  /**
	   * If `Buffer.TYPED_ARRAY_SUPPORT`:
	   *   === true    Use Uint8Array implementation (fastest)
	   *   === false   Print warning and recommend using `buffer` v4.x which has an Object
	   *               implementation (most compatible, even IE6)
	   *
	   * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	   * Opera 11.6+, iOS 4.2+.
	   *
	   * We report that the browser does not support typed arrays if the are not subclassable
	   * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
	   * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
	   * for __proto__ and has a buggy typed array implementation.
	   */
	  Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
	  if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' && typeof console.error === 'function') {
	    console.error('This browser lacks typed array (Uint8Array) support which is required by ' + '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.');
	  }
	  function typedArraySupport() {
	    // Can typed array instances can be augmented?
	    try {
	      var arr = new Uint8Array(1);
	      var proto = {
	        foo: function foo() {
	          return 42;
	        }
	      };
	      Object.setPrototypeOf(proto, Uint8Array.prototype);
	      Object.setPrototypeOf(arr, proto);
	      return arr.foo() === 42;
	    } catch (e) {
	      return false;
	    }
	  }
	  Object.defineProperty(Buffer.prototype, 'parent', {
	    enumerable: true,
	    get: function get() {
	      if (!Buffer.isBuffer(this)) return undefined;
	      return this.buffer;
	    }
	  });
	  Object.defineProperty(Buffer.prototype, 'offset', {
	    enumerable: true,
	    get: function get() {
	      if (!Buffer.isBuffer(this)) return undefined;
	      return this.byteOffset;
	    }
	  });
	  function createBuffer(length) {
	    if (length > K_MAX_LENGTH) {
	      throw new RangeError('The value "' + length + '" is invalid for option "size"');
	    }
	    // Return an augmented `Uint8Array` instance
	    var buf = new Uint8Array(length);
	    Object.setPrototypeOf(buf, Buffer.prototype);
	    return buf;
	  }

	  /**
	   * The Buffer constructor returns instances of `Uint8Array` that have their
	   * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	   * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	   * and the `Uint8Array` methods. Square bracket notation works as expected -- it
	   * returns a single octet.
	   *
	   * The `Uint8Array` prototype remains unmodified.
	   */

	  function Buffer(arg, encodingOrOffset, length) {
	    // Common case.
	    if (typeof arg === 'number') {
	      if (typeof encodingOrOffset === 'string') {
	        throw new TypeError('The "string" argument must be of type string. Received type number');
	      }
	      return allocUnsafe(arg);
	    }
	    return from(arg, encodingOrOffset, length);
	  }
	  Buffer.poolSize = 8192; // not used by this implementation

	  function from(value, encodingOrOffset, length) {
	    if (typeof value === 'string') {
	      return fromString(value, encodingOrOffset);
	    }
	    if (ArrayBuffer.isView(value)) {
	      return fromArrayLike(value);
	    }
	    if (value == null) {
	      throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + _typeof(value));
	    }
	    if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
	      return fromArrayBuffer(value, encodingOrOffset, length);
	    }
	    if (typeof SharedArrayBuffer !== 'undefined' && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
	      return fromArrayBuffer(value, encodingOrOffset, length);
	    }
	    if (typeof value === 'number') {
	      throw new TypeError('The "value" argument must not be of type number. Received type number');
	    }
	    var valueOf = value.valueOf && value.valueOf();
	    if (valueOf != null && valueOf !== value) {
	      return Buffer.from(valueOf, encodingOrOffset, length);
	    }
	    var b = fromObject(value);
	    if (b) return b;
	    if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === 'function') {
	      return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length);
	    }
	    throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + _typeof(value));
	  }

	  /**
	   * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	   * if value is a number.
	   * Buffer.from(str[, encoding])
	   * Buffer.from(array)
	   * Buffer.from(buffer)
	   * Buffer.from(arrayBuffer[, byteOffset[, length]])
	   **/
	  Buffer.from = function (value, encodingOrOffset, length) {
	    return from(value, encodingOrOffset, length);
	  };

	  // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
	  // https://github.com/feross/buffer/pull/148
	  Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
	  Object.setPrototypeOf(Buffer, Uint8Array);
	  function assertSize(size) {
	    if (typeof size !== 'number') {
	      throw new TypeError('"size" argument must be of type number');
	    } else if (size < 0) {
	      throw new RangeError('The value "' + size + '" is invalid for option "size"');
	    }
	  }
	  function alloc(size, fill, encoding) {
	    assertSize(size);
	    if (size <= 0) {
	      return createBuffer(size);
	    }
	    if (fill !== undefined) {
	      // Only pay attention to encoding if it's a string. This
	      // prevents accidentally sending in a number that would
	      // be interpretted as a start offset.
	      return typeof encoding === 'string' ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
	    }
	    return createBuffer(size);
	  }

	  /**
	   * Creates a new filled Buffer instance.
	   * alloc(size[, fill[, encoding]])
	   **/
	  Buffer.alloc = function (size, fill, encoding) {
	    return alloc(size, fill, encoding);
	  };
	  function allocUnsafe(size) {
	    assertSize(size);
	    return createBuffer(size < 0 ? 0 : checked(size) | 0);
	  }

	  /**
	   * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	   * */
	  Buffer.allocUnsafe = function (size) {
	    return allocUnsafe(size);
	  };
	  /**
	   * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	   */
	  Buffer.allocUnsafeSlow = function (size) {
	    return allocUnsafe(size);
	  };
	  function fromString(string, encoding) {
	    if (typeof encoding !== 'string' || encoding === '') {
	      encoding = 'utf8';
	    }
	    if (!Buffer.isEncoding(encoding)) {
	      throw new TypeError('Unknown encoding: ' + encoding);
	    }
	    var length = byteLength(string, encoding) | 0;
	    var buf = createBuffer(length);
	    var actual = buf.write(string, encoding);
	    if (actual !== length) {
	      // Writing a hex string, for example, that contains invalid characters will
	      // cause everything after the first invalid character to be ignored. (e.g.
	      // 'abxxcd' will be treated as 'ab')
	      buf = buf.slice(0, actual);
	    }
	    return buf;
	  }
	  function fromArrayLike(array) {
	    var length = array.length < 0 ? 0 : checked(array.length) | 0;
	    var buf = createBuffer(length);
	    for (var i = 0; i < length; i += 1) {
	      buf[i] = array[i] & 255;
	    }
	    return buf;
	  }
	  function fromArrayBuffer(array, byteOffset, length) {
	    if (byteOffset < 0 || array.byteLength < byteOffset) {
	      throw new RangeError('"offset" is outside of buffer bounds');
	    }
	    if (array.byteLength < byteOffset + (length || 0)) {
	      throw new RangeError('"length" is outside of buffer bounds');
	    }
	    var buf;
	    if (byteOffset === undefined && length === undefined) {
	      buf = new Uint8Array(array);
	    } else if (length === undefined) {
	      buf = new Uint8Array(array, byteOffset);
	    } else {
	      buf = new Uint8Array(array, byteOffset, length);
	    }

	    // Return an augmented `Uint8Array` instance
	    Object.setPrototypeOf(buf, Buffer.prototype);
	    return buf;
	  }
	  function fromObject(obj) {
	    if (Buffer.isBuffer(obj)) {
	      var len = checked(obj.length) | 0;
	      var buf = createBuffer(len);
	      if (buf.length === 0) {
	        return buf;
	      }
	      obj.copy(buf, 0, 0, len);
	      return buf;
	    }
	    if (obj.length !== undefined) {
	      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
	        return createBuffer(0);
	      }
	      return fromArrayLike(obj);
	    }
	    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
	      return fromArrayLike(obj.data);
	    }
	  }
	  function checked(length) {
	    // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
	    // length is NaN (which is otherwise coerced to zero.)
	    if (length >= K_MAX_LENGTH) {
	      throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes');
	    }
	    return length | 0;
	  }
	  function SlowBuffer(length) {
	    if (+length != length) {
	      // eslint-disable-line eqeqeq
	      length = 0;
	    }
	    return Buffer.alloc(+length);
	  }
	  Buffer.isBuffer = function isBuffer(b) {
	    return b != null && b._isBuffer === true && b !== Buffer.prototype; // so Buffer.isBuffer(Buffer.prototype) will be false
	  };
	  Buffer.compare = function compare(a, b) {
	    if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
	    if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);
	    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	      throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
	    }
	    if (a === b) return 0;
	    var x = a.length;
	    var y = b.length;
	    for (var i = 0, len = Math.min(x, y); i < len; ++i) {
	      if (a[i] !== b[i]) {
	        x = a[i];
	        y = b[i];
	        break;
	      }
	    }
	    if (x < y) return -1;
	    if (y < x) return 1;
	    return 0;
	  };
	  Buffer.isEncoding = function isEncoding(encoding) {
	    switch (String(encoding).toLowerCase()) {
	      case 'hex':
	      case 'utf8':
	      case 'utf-8':
	      case 'ascii':
	      case 'latin1':
	      case 'binary':
	      case 'base64':
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return true;
	      default:
	        return false;
	    }
	  };
	  Buffer.concat = function concat(list, length) {
	    if (!Array.isArray(list)) {
	      throw new TypeError('"list" argument must be an Array of Buffers');
	    }
	    if (list.length === 0) {
	      return Buffer.alloc(0);
	    }
	    var i;
	    if (length === undefined) {
	      length = 0;
	      for (i = 0; i < list.length; ++i) {
	        length += list[i].length;
	      }
	    }
	    var buffer = Buffer.allocUnsafe(length);
	    var pos = 0;
	    for (i = 0; i < list.length; ++i) {
	      var buf = list[i];
	      if (isInstance(buf, Uint8Array)) {
	        buf = Buffer.from(buf);
	      }
	      if (!Buffer.isBuffer(buf)) {
	        throw new TypeError('"list" argument must be an Array of Buffers');
	      }
	      buf.copy(buffer, pos);
	      pos += buf.length;
	    }
	    return buffer;
	  };
	  function byteLength(string, encoding) {
	    if (Buffer.isBuffer(string)) {
	      return string.length;
	    }
	    if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
	      return string.byteLength;
	    }
	    if (typeof string !== 'string') {
	      throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' + 'Received type ' + _typeof(string));
	    }
	    var len = string.length;
	    var mustMatch = arguments.length > 2 && arguments[2] === true;
	    if (!mustMatch && len === 0) return 0;

	    // Use a for loop to avoid recursion
	    var loweredCase = false;
	    for (;;) {
	      switch (encoding) {
	        case 'ascii':
	        case 'latin1':
	        case 'binary':
	          return len;
	        case 'utf8':
	        case 'utf-8':
	          return utf8ToBytes(string).length;
	        case 'ucs2':
	        case 'ucs-2':
	        case 'utf16le':
	        case 'utf-16le':
	          return len * 2;
	        case 'hex':
	          return len >>> 1;
	        case 'base64':
	          return base64ToBytes(string).length;
	        default:
	          if (loweredCase) {
	            return mustMatch ? -1 : utf8ToBytes(string).length; // assume utf8
	          }
	          encoding = ('' + encoding).toLowerCase();
	          loweredCase = true;
	      }
	    }
	  }
	  Buffer.byteLength = byteLength;
	  function slowToString(encoding, start, end) {
	    var loweredCase = false;

	    // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	    // property of a typed array.

	    // This behaves neither like String nor Uint8Array in that we set start/end
	    // to their upper/lower bounds if the value passed is out of range.
	    // undefined is handled specially as per ECMA-262 6th Edition,
	    // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	    if (start === undefined || start < 0) {
	      start = 0;
	    }
	    // Return early if start > this.length. Done here to prevent potential uint32
	    // coercion fail below.
	    if (start > this.length) {
	      return '';
	    }
	    if (end === undefined || end > this.length) {
	      end = this.length;
	    }
	    if (end <= 0) {
	      return '';
	    }

	    // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
	    end >>>= 0;
	    start >>>= 0;
	    if (end <= start) {
	      return '';
	    }
	    if (!encoding) encoding = 'utf8';
	    while (true) {
	      switch (encoding) {
	        case 'hex':
	          return hexSlice(this, start, end);
	        case 'utf8':
	        case 'utf-8':
	          return utf8Slice(this, start, end);
	        case 'ascii':
	          return asciiSlice(this, start, end);
	        case 'latin1':
	        case 'binary':
	          return latin1Slice(this, start, end);
	        case 'base64':
	          return base64Slice(this, start, end);
	        case 'ucs2':
	        case 'ucs-2':
	        case 'utf16le':
	        case 'utf-16le':
	          return utf16leSlice(this, start, end);
	        default:
	          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
	          encoding = (encoding + '').toLowerCase();
	          loweredCase = true;
	      }
	    }
	  }

	  // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
	  // to detect a Buffer instance. It's not possible to use `instanceof Buffer`
	  // reliably in a browserify context because there could be multiple different
	  // copies of the 'buffer' package in use. This method works even for Buffer
	  // instances that were created from another copy of the `buffer` package.
	  // See: https://github.com/feross/buffer/issues/154
	  Buffer.prototype._isBuffer = true;
	  function swap(b, n, m) {
	    var i = b[n];
	    b[n] = b[m];
	    b[m] = i;
	  }
	  Buffer.prototype.swap16 = function swap16() {
	    var len = this.length;
	    if (len % 2 !== 0) {
	      throw new RangeError('Buffer size must be a multiple of 16-bits');
	    }
	    for (var i = 0; i < len; i += 2) {
	      swap(this, i, i + 1);
	    }
	    return this;
	  };
	  Buffer.prototype.swap32 = function swap32() {
	    var len = this.length;
	    if (len % 4 !== 0) {
	      throw new RangeError('Buffer size must be a multiple of 32-bits');
	    }
	    for (var i = 0; i < len; i += 4) {
	      swap(this, i, i + 3);
	      swap(this, i + 1, i + 2);
	    }
	    return this;
	  };
	  Buffer.prototype.swap64 = function swap64() {
	    var len = this.length;
	    if (len % 8 !== 0) {
	      throw new RangeError('Buffer size must be a multiple of 64-bits');
	    }
	    for (var i = 0; i < len; i += 8) {
	      swap(this, i, i + 7);
	      swap(this, i + 1, i + 6);
	      swap(this, i + 2, i + 5);
	      swap(this, i + 3, i + 4);
	    }
	    return this;
	  };
	  Buffer.prototype.toString = function toString() {
	    var length = this.length;
	    if (length === 0) return '';
	    if (arguments.length === 0) return utf8Slice(this, 0, length);
	    return slowToString.apply(this, arguments);
	  };
	  Buffer.prototype.toLocaleString = Buffer.prototype.toString;
	  Buffer.prototype.equals = function equals(b) {
	    if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
	    if (this === b) return true;
	    return Buffer.compare(this, b) === 0;
	  };
	  Buffer.prototype.inspect = function inspect() {
	    var str = '';
	    var max = exports.INSPECT_MAX_BYTES;
	    str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
	    if (this.length > max) str += ' ... ';
	    return '<Buffer ' + str + '>';
	  };
	  if (customInspectSymbol) {
	    Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect;
	  }
	  Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
	    if (isInstance(target, Uint8Array)) {
	      target = Buffer.from(target, target.offset, target.byteLength);
	    }
	    if (!Buffer.isBuffer(target)) {
	      throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. ' + 'Received type ' + _typeof(target));
	    }
	    if (start === undefined) {
	      start = 0;
	    }
	    if (end === undefined) {
	      end = target ? target.length : 0;
	    }
	    if (thisStart === undefined) {
	      thisStart = 0;
	    }
	    if (thisEnd === undefined) {
	      thisEnd = this.length;
	    }
	    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
	      throw new RangeError('out of range index');
	    }
	    if (thisStart >= thisEnd && start >= end) {
	      return 0;
	    }
	    if (thisStart >= thisEnd) {
	      return -1;
	    }
	    if (start >= end) {
	      return 1;
	    }
	    start >>>= 0;
	    end >>>= 0;
	    thisStart >>>= 0;
	    thisEnd >>>= 0;
	    if (this === target) return 0;
	    var x = thisEnd - thisStart;
	    var y = end - start;
	    var len = Math.min(x, y);
	    var thisCopy = this.slice(thisStart, thisEnd);
	    var targetCopy = target.slice(start, end);
	    for (var i = 0; i < len; ++i) {
	      if (thisCopy[i] !== targetCopy[i]) {
	        x = thisCopy[i];
	        y = targetCopy[i];
	        break;
	      }
	    }
	    if (x < y) return -1;
	    if (y < x) return 1;
	    return 0;
	  };

	  // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
	  // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
	  //
	  // Arguments:
	  // - buffer - a Buffer to search
	  // - val - a string, Buffer, or number
	  // - byteOffset - an index into `buffer`; will be clamped to an int32
	  // - encoding - an optional encoding, relevant is val is a string
	  // - dir - true for indexOf, false for lastIndexOf
	  function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
	    // Empty buffer means no match
	    if (buffer.length === 0) return -1;

	    // Normalize byteOffset
	    if (typeof byteOffset === 'string') {
	      encoding = byteOffset;
	      byteOffset = 0;
	    } else if (byteOffset > 0x7fffffff) {
	      byteOffset = 0x7fffffff;
	    } else if (byteOffset < -0x80000000) {
	      byteOffset = -0x80000000;
	    }
	    byteOffset = +byteOffset; // Coerce to Number.
	    if (numberIsNaN(byteOffset)) {
	      // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
	      byteOffset = dir ? 0 : buffer.length - 1;
	    }

	    // Normalize byteOffset: negative offsets start from the end of the buffer
	    if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
	    if (byteOffset >= buffer.length) {
	      if (dir) return -1;else byteOffset = buffer.length - 1;
	    } else if (byteOffset < 0) {
	      if (dir) byteOffset = 0;else return -1;
	    }

	    // Normalize val
	    if (typeof val === 'string') {
	      val = Buffer.from(val, encoding);
	    }

	    // Finally, search either indexOf (if dir is true) or lastIndexOf
	    if (Buffer.isBuffer(val)) {
	      // Special case: looking for empty string/buffer always fails
	      if (val.length === 0) {
	        return -1;
	      }
	      return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
	    } else if (typeof val === 'number') {
	      val = val & 0xFF; // Search for a byte value [0-255]
	      if (typeof Uint8Array.prototype.indexOf === 'function') {
	        if (dir) {
	          return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
	        } else {
	          return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
	        }
	      }
	      return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
	    }
	    throw new TypeError('val must be string, number or Buffer');
	  }
	  function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
	    var indexSize = 1;
	    var arrLength = arr.length;
	    var valLength = val.length;
	    if (encoding !== undefined) {
	      encoding = String(encoding).toLowerCase();
	      if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
	        if (arr.length < 2 || val.length < 2) {
	          return -1;
	        }
	        indexSize = 2;
	        arrLength /= 2;
	        valLength /= 2;
	        byteOffset /= 2;
	      }
	    }
	    function read(buf, i) {
	      if (indexSize === 1) {
	        return buf[i];
	      } else {
	        return buf.readUInt16BE(i * indexSize);
	      }
	    }
	    var i;
	    if (dir) {
	      var foundIndex = -1;
	      for (i = byteOffset; i < arrLength; i++) {
	        if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
	          if (foundIndex === -1) foundIndex = i;
	          if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
	        } else {
	          if (foundIndex !== -1) i -= i - foundIndex;
	          foundIndex = -1;
	        }
	      }
	    } else {
	      if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
	      for (i = byteOffset; i >= 0; i--) {
	        var found = true;
	        for (var j = 0; j < valLength; j++) {
	          if (read(arr, i + j) !== read(val, j)) {
	            found = false;
	            break;
	          }
	        }
	        if (found) return i;
	      }
	    }
	    return -1;
	  }
	  Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
	    return this.indexOf(val, byteOffset, encoding) !== -1;
	  };
	  Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
	    return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
	  };
	  Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
	    return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
	  };
	  function hexWrite(buf, string, offset, length) {
	    offset = Number(offset) || 0;
	    var remaining = buf.length - offset;
	    if (!length) {
	      length = remaining;
	    } else {
	      length = Number(length);
	      if (length > remaining) {
	        length = remaining;
	      }
	    }
	    var strLen = string.length;
	    if (length > strLen / 2) {
	      length = strLen / 2;
	    }
	    for (var i = 0; i < length; ++i) {
	      var parsed = parseInt(string.substr(i * 2, 2), 16);
	      if (numberIsNaN(parsed)) return i;
	      buf[offset + i] = parsed;
	    }
	    return i;
	  }
	  function utf8Write(buf, string, offset, length) {
	    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
	  }
	  function asciiWrite(buf, string, offset, length) {
	    return blitBuffer(asciiToBytes(string), buf, offset, length);
	  }
	  function latin1Write(buf, string, offset, length) {
	    return asciiWrite(buf, string, offset, length);
	  }
	  function base64Write(buf, string, offset, length) {
	    return blitBuffer(base64ToBytes(string), buf, offset, length);
	  }
	  function ucs2Write(buf, string, offset, length) {
	    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
	  }
	  Buffer.prototype.write = function write(string, offset, length, encoding) {
	    // Buffer#write(string)
	    if (offset === undefined) {
	      encoding = 'utf8';
	      length = this.length;
	      offset = 0;
	      // Buffer#write(string, encoding)
	    } else if (length === undefined && typeof offset === 'string') {
	      encoding = offset;
	      length = this.length;
	      offset = 0;
	      // Buffer#write(string, offset[, length][, encoding])
	    } else if (isFinite(offset)) {
	      offset = offset >>> 0;
	      if (isFinite(length)) {
	        length = length >>> 0;
	        if (encoding === undefined) encoding = 'utf8';
	      } else {
	        encoding = length;
	        length = undefined;
	      }
	    } else {
	      throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
	    }
	    var remaining = this.length - offset;
	    if (length === undefined || length > remaining) length = remaining;
	    if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
	      throw new RangeError('Attempt to write outside buffer bounds');
	    }
	    if (!encoding) encoding = 'utf8';
	    var loweredCase = false;
	    for (;;) {
	      switch (encoding) {
	        case 'hex':
	          return hexWrite(this, string, offset, length);
	        case 'utf8':
	        case 'utf-8':
	          return utf8Write(this, string, offset, length);
	        case 'ascii':
	          return asciiWrite(this, string, offset, length);
	        case 'latin1':
	        case 'binary':
	          return latin1Write(this, string, offset, length);
	        case 'base64':
	          // Warning: maxLength not taken into account in base64Write
	          return base64Write(this, string, offset, length);
	        case 'ucs2':
	        case 'ucs-2':
	        case 'utf16le':
	        case 'utf-16le':
	          return ucs2Write(this, string, offset, length);
	        default:
	          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
	          encoding = ('' + encoding).toLowerCase();
	          loweredCase = true;
	      }
	    }
	  };
	  Buffer.prototype.toJSON = function toJSON() {
	    return {
	      type: 'Buffer',
	      data: Array.prototype.slice.call(this._arr || this, 0)
	    };
	  };
	  function base64Slice(buf, start, end) {
	    if (start === 0 && end === buf.length) {
	      return base64Js.fromByteArray(buf);
	    } else {
	      return base64Js.fromByteArray(buf.slice(start, end));
	    }
	  }
	  function utf8Slice(buf, start, end) {
	    end = Math.min(buf.length, end);
	    var res = [];
	    var i = start;
	    while (i < end) {
	      var firstByte = buf[i];
	      var codePoint = null;
	      var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;
	      if (i + bytesPerSequence <= end) {
	        var secondByte, thirdByte, fourthByte, tempCodePoint;
	        switch (bytesPerSequence) {
	          case 1:
	            if (firstByte < 0x80) {
	              codePoint = firstByte;
	            }
	            break;
	          case 2:
	            secondByte = buf[i + 1];
	            if ((secondByte & 0xC0) === 0x80) {
	              tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;
	              if (tempCodePoint > 0x7F) {
	                codePoint = tempCodePoint;
	              }
	            }
	            break;
	          case 3:
	            secondByte = buf[i + 1];
	            thirdByte = buf[i + 2];
	            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;
	              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	                codePoint = tempCodePoint;
	              }
	            }
	            break;
	          case 4:
	            secondByte = buf[i + 1];
	            thirdByte = buf[i + 2];
	            fourthByte = buf[i + 3];
	            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;
	              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	                codePoint = tempCodePoint;
	              }
	            }
	        }
	      }
	      if (codePoint === null) {
	        // we did not generate a valid codePoint so insert a
	        // replacement char (U+FFFD) and advance only 1 byte
	        codePoint = 0xFFFD;
	        bytesPerSequence = 1;
	      } else if (codePoint > 0xFFFF) {
	        // encode to utf16 (surrogate pair dance)
	        codePoint -= 0x10000;
	        res.push(codePoint >>> 10 & 0x3FF | 0xD800);
	        codePoint = 0xDC00 | codePoint & 0x3FF;
	      }
	      res.push(codePoint);
	      i += bytesPerSequence;
	    }
	    return decodeCodePointsArray(res);
	  }

	  // Based on http://stackoverflow.com/a/22747272/680742, the browser with
	  // the lowest limit is Chrome, with 0x10000 args.
	  // We go 1 magnitude less, for safety
	  var MAX_ARGUMENTS_LENGTH = 0x1000;
	  function decodeCodePointsArray(codePoints) {
	    var len = codePoints.length;
	    if (len <= MAX_ARGUMENTS_LENGTH) {
	      return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
	    }

	    // Decode in chunks to avoid "call stack size exceeded".
	    var res = '';
	    var i = 0;
	    while (i < len) {
	      res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
	    }
	    return res;
	  }
	  function asciiSlice(buf, start, end) {
	    var ret = '';
	    end = Math.min(buf.length, end);
	    for (var i = start; i < end; ++i) {
	      ret += String.fromCharCode(buf[i] & 0x7F);
	    }
	    return ret;
	  }
	  function latin1Slice(buf, start, end) {
	    var ret = '';
	    end = Math.min(buf.length, end);
	    for (var i = start; i < end; ++i) {
	      ret += String.fromCharCode(buf[i]);
	    }
	    return ret;
	  }
	  function hexSlice(buf, start, end) {
	    var len = buf.length;
	    if (!start || start < 0) start = 0;
	    if (!end || end < 0 || end > len) end = len;
	    var out = '';
	    for (var i = start; i < end; ++i) {
	      out += hexSliceLookupTable[buf[i]];
	    }
	    return out;
	  }
	  function utf16leSlice(buf, start, end) {
	    var bytes = buf.slice(start, end);
	    var res = '';
	    for (var i = 0; i < bytes.length; i += 2) {
	      res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
	    }
	    return res;
	  }
	  Buffer.prototype.slice = function slice(start, end) {
	    var len = this.length;
	    start = ~~start;
	    end = end === undefined ? len : ~~end;
	    if (start < 0) {
	      start += len;
	      if (start < 0) start = 0;
	    } else if (start > len) {
	      start = len;
	    }
	    if (end < 0) {
	      end += len;
	      if (end < 0) end = 0;
	    } else if (end > len) {
	      end = len;
	    }
	    if (end < start) end = start;
	    var newBuf = this.subarray(start, end);
	    // Return an augmented `Uint8Array` instance
	    Object.setPrototypeOf(newBuf, Buffer.prototype);
	    return newBuf;
	  };

	  /*
	   * Need to make sure that buffer isn't trying to write out of bounds.
	   */
	  function checkOffset(offset, ext, length) {
	    if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
	    if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
	  }
	  Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
	    offset = offset >>> 0;
	    byteLength = byteLength >>> 0;
	    if (!noAssert) checkOffset(offset, byteLength, this.length);
	    var val = this[offset];
	    var mul = 1;
	    var i = 0;
	    while (++i < byteLength && (mul *= 0x100)) {
	      val += this[offset + i] * mul;
	    }
	    return val;
	  };
	  Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
	    offset = offset >>> 0;
	    byteLength = byteLength >>> 0;
	    if (!noAssert) {
	      checkOffset(offset, byteLength, this.length);
	    }
	    var val = this[offset + --byteLength];
	    var mul = 1;
	    while (byteLength > 0 && (mul *= 0x100)) {
	      val += this[offset + --byteLength] * mul;
	    }
	    return val;
	  };
	  Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 1, this.length);
	    return this[offset];
	  };
	  Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 2, this.length);
	    return this[offset] | this[offset + 1] << 8;
	  };
	  Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 2, this.length);
	    return this[offset] << 8 | this[offset + 1];
	  };
	  Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 4, this.length);
	    return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
	  };
	  Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 4, this.length);
	    return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
	  };
	  Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
	    offset = offset >>> 0;
	    byteLength = byteLength >>> 0;
	    if (!noAssert) checkOffset(offset, byteLength, this.length);
	    var val = this[offset];
	    var mul = 1;
	    var i = 0;
	    while (++i < byteLength && (mul *= 0x100)) {
	      val += this[offset + i] * mul;
	    }
	    mul *= 0x80;
	    if (val >= mul) val -= Math.pow(2, 8 * byteLength);
	    return val;
	  };
	  Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
	    offset = offset >>> 0;
	    byteLength = byteLength >>> 0;
	    if (!noAssert) checkOffset(offset, byteLength, this.length);
	    var i = byteLength;
	    var mul = 1;
	    var val = this[offset + --i];
	    while (i > 0 && (mul *= 0x100)) {
	      val += this[offset + --i] * mul;
	    }
	    mul *= 0x80;
	    if (val >= mul) val -= Math.pow(2, 8 * byteLength);
	    return val;
	  };
	  Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 1, this.length);
	    if (!(this[offset] & 0x80)) return this[offset];
	    return (0xff - this[offset] + 1) * -1;
	  };
	  Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 2, this.length);
	    var val = this[offset] | this[offset + 1] << 8;
	    return val & 0x8000 ? val | 0xFFFF0000 : val;
	  };
	  Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 2, this.length);
	    var val = this[offset + 1] | this[offset] << 8;
	    return val & 0x8000 ? val | 0xFFFF0000 : val;
	  };
	  Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 4, this.length);
	    return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
	  };
	  Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 4, this.length);
	    return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
	  };
	  Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 4, this.length);
	    return ieee754.read(this, offset, true, 23, 4);
	  };
	  Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 4, this.length);
	    return ieee754.read(this, offset, false, 23, 4);
	  };
	  Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 8, this.length);
	    return ieee754.read(this, offset, true, 52, 8);
	  };
	  Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 8, this.length);
	    return ieee754.read(this, offset, false, 52, 8);
	  };
	  function checkInt(buf, value, offset, ext, max, min) {
	    if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
	    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
	    if (offset + ext > buf.length) throw new RangeError('Index out of range');
	  }
	  Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    byteLength = byteLength >>> 0;
	    if (!noAssert) {
	      var maxBytes = Math.pow(2, 8 * byteLength) - 1;
	      checkInt(this, value, offset, byteLength, maxBytes, 0);
	    }
	    var mul = 1;
	    var i = 0;
	    this[offset] = value & 0xFF;
	    while (++i < byteLength && (mul *= 0x100)) {
	      this[offset + i] = value / mul & 0xFF;
	    }
	    return offset + byteLength;
	  };
	  Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    byteLength = byteLength >>> 0;
	    if (!noAssert) {
	      var maxBytes = Math.pow(2, 8 * byteLength) - 1;
	      checkInt(this, value, offset, byteLength, maxBytes, 0);
	    }
	    var i = byteLength - 1;
	    var mul = 1;
	    this[offset + i] = value & 0xFF;
	    while (--i >= 0 && (mul *= 0x100)) {
	      this[offset + i] = value / mul & 0xFF;
	    }
	    return offset + byteLength;
	  };
	  Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
	    this[offset] = value & 0xff;
	    return offset + 1;
	  };
	  Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
	    this[offset] = value & 0xff;
	    this[offset + 1] = value >>> 8;
	    return offset + 2;
	  };
	  Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
	    this[offset] = value >>> 8;
	    this[offset + 1] = value & 0xff;
	    return offset + 2;
	  };
	  Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
	    this[offset + 3] = value >>> 24;
	    this[offset + 2] = value >>> 16;
	    this[offset + 1] = value >>> 8;
	    this[offset] = value & 0xff;
	    return offset + 4;
	  };
	  Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
	    this[offset] = value >>> 24;
	    this[offset + 1] = value >>> 16;
	    this[offset + 2] = value >>> 8;
	    this[offset + 3] = value & 0xff;
	    return offset + 4;
	  };
	  Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) {
	      var limit = Math.pow(2, 8 * byteLength - 1);
	      checkInt(this, value, offset, byteLength, limit - 1, -limit);
	    }
	    var i = 0;
	    var mul = 1;
	    var sub = 0;
	    this[offset] = value & 0xFF;
	    while (++i < byteLength && (mul *= 0x100)) {
	      if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
	        sub = 1;
	      }
	      this[offset + i] = (value / mul >> 0) - sub & 0xFF;
	    }
	    return offset + byteLength;
	  };
	  Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) {
	      var limit = Math.pow(2, 8 * byteLength - 1);
	      checkInt(this, value, offset, byteLength, limit - 1, -limit);
	    }
	    var i = byteLength - 1;
	    var mul = 1;
	    var sub = 0;
	    this[offset + i] = value & 0xFF;
	    while (--i >= 0 && (mul *= 0x100)) {
	      if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
	        sub = 1;
	      }
	      this[offset + i] = (value / mul >> 0) - sub & 0xFF;
	    }
	    return offset + byteLength;
	  };
	  Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
	    if (value < 0) value = 0xff + value + 1;
	    this[offset] = value & 0xff;
	    return offset + 1;
	  };
	  Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
	    this[offset] = value & 0xff;
	    this[offset + 1] = value >>> 8;
	    return offset + 2;
	  };
	  Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
	    this[offset] = value >>> 8;
	    this[offset + 1] = value & 0xff;
	    return offset + 2;
	  };
	  Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
	    this[offset] = value & 0xff;
	    this[offset + 1] = value >>> 8;
	    this[offset + 2] = value >>> 16;
	    this[offset + 3] = value >>> 24;
	    return offset + 4;
	  };
	  Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
	    if (value < 0) value = 0xffffffff + value + 1;
	    this[offset] = value >>> 24;
	    this[offset + 1] = value >>> 16;
	    this[offset + 2] = value >>> 8;
	    this[offset + 3] = value & 0xff;
	    return offset + 4;
	  };
	  function checkIEEE754(buf, value, offset, ext, max, min) {
	    if (offset + ext > buf.length) throw new RangeError('Index out of range');
	    if (offset < 0) throw new RangeError('Index out of range');
	  }
	  function writeFloat(buf, value, offset, littleEndian, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) {
	      checkIEEE754(buf, value, offset, 4);
	    }
	    ieee754.write(buf, value, offset, littleEndian, 23, 4);
	    return offset + 4;
	  }
	  Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
	    return writeFloat(this, value, offset, true, noAssert);
	  };
	  Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
	    return writeFloat(this, value, offset, false, noAssert);
	  };
	  function writeDouble(buf, value, offset, littleEndian, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) {
	      checkIEEE754(buf, value, offset, 8);
	    }
	    ieee754.write(buf, value, offset, littleEndian, 52, 8);
	    return offset + 8;
	  }
	  Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
	    return writeDouble(this, value, offset, true, noAssert);
	  };
	  Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
	    return writeDouble(this, value, offset, false, noAssert);
	  };

	  // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	  Buffer.prototype.copy = function copy(target, targetStart, start, end) {
	    if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer');
	    if (!start) start = 0;
	    if (!end && end !== 0) end = this.length;
	    if (targetStart >= target.length) targetStart = target.length;
	    if (!targetStart) targetStart = 0;
	    if (end > 0 && end < start) end = start;

	    // Copy 0 bytes; we're done
	    if (end === start) return 0;
	    if (target.length === 0 || this.length === 0) return 0;

	    // Fatal error conditions
	    if (targetStart < 0) {
	      throw new RangeError('targetStart out of bounds');
	    }
	    if (start < 0 || start >= this.length) throw new RangeError('Index out of range');
	    if (end < 0) throw new RangeError('sourceEnd out of bounds');

	    // Are we oob?
	    if (end > this.length) end = this.length;
	    if (target.length - targetStart < end - start) {
	      end = target.length - targetStart + start;
	    }
	    var len = end - start;
	    if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
	      // Use built-in when available, missing from IE11
	      this.copyWithin(targetStart, start, end);
	    } else if (this === target && start < targetStart && targetStart < end) {
	      // descending copy from end
	      for (var i = len - 1; i >= 0; --i) {
	        target[i + targetStart] = this[i + start];
	      }
	    } else {
	      Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
	    }
	    return len;
	  };

	  // Usage:
	  //    buffer.fill(number[, offset[, end]])
	  //    buffer.fill(buffer[, offset[, end]])
	  //    buffer.fill(string[, offset[, end]][, encoding])
	  Buffer.prototype.fill = function fill(val, start, end, encoding) {
	    // Handle string cases:
	    if (typeof val === 'string') {
	      if (typeof start === 'string') {
	        encoding = start;
	        start = 0;
	        end = this.length;
	      } else if (typeof end === 'string') {
	        encoding = end;
	        end = this.length;
	      }
	      if (encoding !== undefined && typeof encoding !== 'string') {
	        throw new TypeError('encoding must be a string');
	      }
	      if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
	        throw new TypeError('Unknown encoding: ' + encoding);
	      }
	      if (val.length === 1) {
	        var code = val.charCodeAt(0);
	        if (encoding === 'utf8' && code < 128 || encoding === 'latin1') {
	          // Fast path: If `val` fits into a single byte, use that numeric value.
	          val = code;
	        }
	      }
	    } else if (typeof val === 'number') {
	      val = val & 255;
	    } else if (typeof val === 'boolean') {
	      val = Number(val);
	    }

	    // Invalid ranges are not set to a default, so can range check early.
	    if (start < 0 || this.length < start || this.length < end) {
	      throw new RangeError('Out of range index');
	    }
	    if (end <= start) {
	      return this;
	    }
	    start = start >>> 0;
	    end = end === undefined ? this.length : end >>> 0;
	    if (!val) val = 0;
	    var i;
	    if (typeof val === 'number') {
	      for (i = start; i < end; ++i) {
	        this[i] = val;
	      }
	    } else {
	      var bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
	      var len = bytes.length;
	      if (len === 0) {
	        throw new TypeError('The value "' + val + '" is invalid for argument "value"');
	      }
	      for (i = 0; i < end - start; ++i) {
	        this[i + start] = bytes[i % len];
	      }
	    }
	    return this;
	  };

	  // HELPER FUNCTIONS
	  // ================

	  var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
	  function base64clean(str) {
	    // Node takes equal signs as end of the Base64 encoding
	    str = str.split('=')[0];
	    // Node strips out invalid characters like \n and \t from the string, base64-js does not
	    str = str.trim().replace(INVALID_BASE64_RE, '');
	    // Node converts strings with length < 2 to ''
	    if (str.length < 2) return '';
	    // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	    while (str.length % 4 !== 0) {
	      str = str + '=';
	    }
	    return str;
	  }
	  function utf8ToBytes(string, units) {
	    units = units || Infinity;
	    var codePoint;
	    var length = string.length;
	    var leadSurrogate = null;
	    var bytes = [];
	    for (var i = 0; i < length; ++i) {
	      codePoint = string.charCodeAt(i);

	      // is surrogate component
	      if (codePoint > 0xD7FF && codePoint < 0xE000) {
	        // last char was a lead
	        if (!leadSurrogate) {
	          // no lead yet
	          if (codePoint > 0xDBFF) {
	            // unexpected trail
	            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	            continue;
	          } else if (i + 1 === length) {
	            // unpaired lead
	            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	            continue;
	          }

	          // valid lead
	          leadSurrogate = codePoint;
	          continue;
	        }

	        // 2 leads in a row
	        if (codePoint < 0xDC00) {
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	          leadSurrogate = codePoint;
	          continue;
	        }

	        // valid surrogate pair
	        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
	      } else if (leadSurrogate) {
	        // valid bmp char, but last char was a lead
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	      }
	      leadSurrogate = null;

	      // encode utf8
	      if (codePoint < 0x80) {
	        if ((units -= 1) < 0) break;
	        bytes.push(codePoint);
	      } else if (codePoint < 0x800) {
	        if ((units -= 2) < 0) break;
	        bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
	      } else if (codePoint < 0x10000) {
	        if ((units -= 3) < 0) break;
	        bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
	      } else if (codePoint < 0x110000) {
	        if ((units -= 4) < 0) break;
	        bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
	      } else {
	        throw new Error('Invalid code point');
	      }
	    }
	    return bytes;
	  }
	  function asciiToBytes(str) {
	    var byteArray = [];
	    for (var i = 0; i < str.length; ++i) {
	      // Node's code seems to be doing this and not & 0x7F..
	      byteArray.push(str.charCodeAt(i) & 0xFF);
	    }
	    return byteArray;
	  }
	  function utf16leToBytes(str, units) {
	    var c, hi, lo;
	    var byteArray = [];
	    for (var i = 0; i < str.length; ++i) {
	      if ((units -= 2) < 0) break;
	      c = str.charCodeAt(i);
	      hi = c >> 8;
	      lo = c % 256;
	      byteArray.push(lo);
	      byteArray.push(hi);
	    }
	    return byteArray;
	  }
	  function base64ToBytes(str) {
	    return base64Js.toByteArray(base64clean(str));
	  }
	  function blitBuffer(src, dst, offset, length) {
	    for (var i = 0; i < length; ++i) {
	      if (i + offset >= dst.length || i >= src.length) break;
	      dst[i + offset] = src[i];
	    }
	    return i;
	  }

	  // ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
	  // the `instanceof` check but they should be treated as of that type.
	  // See: https://github.com/feross/buffer/issues/166
	  function isInstance(obj, type) {
	    return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
	  }
	  function numberIsNaN(obj) {
	    // For IE11 support
	    return obj !== obj; // eslint-disable-line no-self-compare
	  }

	  // Create lookup table for `toString('hex')`
	  // See: https://github.com/feross/buffer/issues/219
	  var hexSliceLookupTable = function () {
	    var alphabet = '0123456789abcdef';
	    var table = new Array(256);
	    for (var i = 0; i < 16; ++i) {
	      var i16 = i * 16;
	      for (var j = 0; j < 16; ++j) {
	        table[i16 + j] = alphabet[i] + alphabet[j];
	      }
	    }
	    return table;
	  }();
	});
	var buffer_1 = buffer.Buffer;
	buffer.SlowBuffer;
	buffer.INSPECT_MAX_BYTES;
	buffer.kMaxLength;

	/**
	 * return an decoded URL Safe Base64 as UTF-8 encoded string
	 */
	function decodeBase64UrlSafe(base64) {
	    // Add removed at end '='
	    // base64 += Array(5 - base64.length % 4).join('=');
	    base64 = base64
	        .replace(/-/g, '+') // Convert '-' to '+'
	        .replace(/_/g, '/'); // Convert '_' to '/'
	    return decodeBase64(base64); // Cf: https://developer.mozilla.org/fr/docs/D%C3%A9coder_encoder_en_base64
	}
	/**
	 * Encode an array into Base64 url safe - Used for PKCE random/hash functions.
	 */
	function encodeToBase64(array) {
	    return buffer_1.from(array)
	        .toString('base64')
	        .replace(/\+/g, '-')
	        .replace(/\//g, '_')
	        .replace(/=+$/, '');
	}
	/**
	 * decode Base64 as UTF-8 encoded string
	 */
	function decodeBase64(str) {
	    // Cf: https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
	    return decodeURIComponent(Array.prototype.map
	        .call(window.atob(str), (c) => {
	        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	    })
	        .join(''));
	}

	function parseJwtTokenPayload(token) {
	    const bodyPart = token.split('.')[1];
	    return camelCaseProperties(JSON.parse(decodeBase64UrlSafe(bodyPart)));
	}

	/**
	 * Parse the id token, if present, and add the payload to the AuthResult
	 */
	function enrichAuthResult(response) {
	    if (response.idToken) {
	        try {
	            const idTokenPayload = parseJwtTokenPayload(response.idToken);
	            return Object.assign(Object.assign({}, response), { idTokenPayload });
	        }
	        catch (e) {
	            logError('ID Token parsing error', e);
	        }
	    }
	    return response;
	}
	exports.AuthResult = void 0;
	(function (AuthResult) {
	    function isAuthResult(thing) {
	        return typeof thing === "object" && thing !== null
	            && ('accessToken' in thing || 'idToken' in thing || 'code' in thing);
	    }
	    AuthResult.isAuthResult = isAuthResult;
	})(exports.AuthResult || (exports.AuthResult = {}));

	function popupSize(provider) {
	    switch (provider) {
	        case 'amazon':
	            return { width: 715, height: 525 };
	        case 'facebook':
	            return { width: 650, height: 400 };
	        case 'google':
	            return { width: 560, height: 630 };
	        case 'kakaotalk':
	            return { width: 450, height: 400 };
	        case 'line':
	            return { width: 440, height: 550 };
	        case 'mailru':
	            return { width: 450, height: 400 };
	        case 'qq':
	            return { width: 450, height: 400 };
	        case 'twitter':
	            return { width: 800, height: 440 };
	        case 'vkontakte':
	            return { width: 655, height: 430 };
	        case 'yandex':
	            return { width: 655, height: 700 };
	        default:
	            return { width: 400, height: 550 };
	    }
	}

	function randomBase64String() {
	    const randomValues = window.crypto.getRandomValues(new Uint8Array(32));
	    return encodeToBase64(randomValues);
	}

	function computePkceParams() {
	    const codeVerifier = randomBase64String();
	    sessionStorage.setItem('verifier_key', codeVerifier);
	    return computeCodeChallenge(codeVerifier).then(challenge => {
	        return {
	            codeChallenge: challenge,
	            codeChallengeMethod: 'S256'
	        };
	    });
	}
	function computeCodeChallenge(verifier) {
	    const binaryChallenge = buffer_1.from(verifier, 'utf-8');
	    return new Promise(resolve => {
	        window.crypto.subtle.digest('SHA-256', binaryChallenge).then(hash => {
	            return resolve(encodeToBase64(hash));
	        });
	    });
	}

	function getWithExpiry(key) {
	    const storedValue = sessionStorage.getItem(key);
	    if (!storedValue) {
	        return null;
	    }
	    try {
	        const item = JSON.parse(storedValue);
	        const now = new Date();
	        if (now.getTime() > item.expiry) {
	            sessionStorage.removeItem(key);
	            return null;
	        }
	        return item.value;
	    }
	    catch (e) {
	        return null;
	    }
	}
	function setWithExpiry(key, value, ttl) {
	    const now = new Date();
	    const item = {
	        value,
	        expiry: now.getTime() + ttl
	    };
	    sessionStorage.setItem(key, JSON.stringify(item));
	}

	/**
	 * Identity Rest API Client
	 */
	class OAuthClient {
	    constructor(props) {
	        this.config = props.config;
	        this.http = props.http;
	        this.eventManager = props.eventManager;
	        this.authorizeUrl = `${this.config.baseUrl}/oauth/authorize`;
	        this.customTokenUrl = `${this.config.baseUrl}/identity/v1/custom-token/login`;
	        this.logoutUrl = `${this.config.baseUrl}/identity/v1/logout`;
	        this.revokeUrl = `${this.config.baseUrl}/oauth/revoke`;
	        this.passwordlessVerifyUrl = `${this.config.baseUrl}/identity/v1/passwordless/verify`;
	        this.popupRelayUrl = `${this.config.baseUrl}/popup/relay`;
	        this.tokenUrl = `${this.config.baseUrl}/oauth/token`;
	        this.passwordlessVerifyAuthCodeUrl = '/verify-auth-code';
	        this.passwordLoginUrl = '/password/login';
	        this.passwordlessStartUrl = '/passwordless/start';
	        this.sessionInfoUrl = '/sso/data';
	        this.signupUrl = '/signup';
	        this.signupTokenUrl = '/signup-token';
	    }
	    setMfaClient(mfaClient) {
	        this.mfaClient = mfaClient;
	    }
	    checkSession(opts = {}) {
	        if (!this.config.sso)
	            return Promise.reject(new Error("Cannot call 'checkSession' if SSO is not enabled."));
	        const authParams = this.authParams(Object.assign(Object.assign({}, opts), { responseType: 'code', useWebMessage: true }));
	        if (this.isAuthorizationLocked() || this.isSessionLocked())
	            return Promise.reject(new Error('An ongoing authorization flow has not yet completed.'));
	        this.acquireSessionLock();
	        return this.getPkceParams(authParams).then((maybeChallenge) => {
	            const params = Object.assign(Object.assign({}, authParams), maybeChallenge);
	            const authorizationUrl = this.getAuthorizationUrl(params);
	            return this.getWebMessage(authorizationUrl, this.config.baseUrl, opts.redirectUri);
	        });
	    }
	    exchangeAuthorizationCodeWithPkce(params) {
	        return this.http
	            .post(this.tokenUrl, {
	            body: Object.assign({ clientId: this.config.clientId, grantType: 'authorization_code', codeVerifier: sessionStorage.getItem('verifier_key') }, params)
	        })
	            .then(authResult => {
	            this.eventManager.fireEvent('authenticated', authResult);
	            return enrichAuthResult(authResult);
	        })
	            .finally(() => {
	            this.releaseAuthorizationLock();
	            this.releaseSessionLock();
	        });
	    }
	    getSessionInfo() {
	        return this.http.get(this.sessionInfoUrl, {
	            query: { clientId: this.config.clientId },
	            withCookies: true
	        });
	    }
	    loginFromSession(opts = {}) {
	        if (!this.config.sso)
	            return Promise.reject(new Error("Cannot call 'loginFromSession' if SSO is not enabled."));
	        if (this.isAuthorizationLocked() || this.isSessionLocked())
	            return Promise.reject(new Error('An ongoing authorization flow has not yet completed.'));
	        this.acquireSessionLock();
	        const authParams = this.authParams(Object.assign(Object.assign({}, opts), { useWebMessage: false }));
	        return this.getPkceParams(authParams).then(maybeChallenge => {
	            const params = Object.assign(Object.assign({}, authParams), maybeChallenge);
	            return this.redirectThruAuthorization(params);
	        });
	    }
	    isPasswordCredential(credentials) {
	        return credentials.type === 'password';
	    }
	    loginWithCredentials(params) {
	        if (navigator.credentials && navigator.credentials.get) {
	            const request = {
	                password: true,
	                mediation: params.mediation || 'silent'
	            };
	            return navigator.credentials.get(request).then(credentials => {
	                if (credentials && this.isPasswordCredential(credentials)) {
	                    const loginParams = {
	                        email: credentials.id,
	                        password: credentials.password || '',
	                        auth: params.auth
	                    };
	                    return this.ropcPasswordLogin(loginParams);
	                }
	                return Promise.reject(new Error('Invalid credentials'));
	            });
	        }
	        else {
	            return Promise.reject(new Error('Unsupported Credentials Management API'));
	        }
	    }
	    loginWithCustomToken(params) {
	        const { token, auth } = params;
	        const queryString = toQueryString(Object.assign(Object.assign({}, this.authParams(auth)), { token }));
	        // Non existent endpoint URL
	        window.location.assign(`${this.customTokenUrl}?${queryString}`);
	    }
	    loginWithPassword(params) {
	        const { auth = {} } = params, rest = __rest(params, ["auth"]);
	        this.acquireAuthorizationLock();
	        const loginPromise = window.cordova
	            ? this.ropcPasswordLogin(params)
	                .then(authResult => this.storeCredentialsInBrowser(params).then(() => enrichAuthResult(authResult)))
	            : this.http
	                .post(this.passwordLoginUrl, {
	                body: Object.assign({ clientId: this.config.clientId, scope: resolveScope(auth, this.config.scope) }, rest)
	            })
	                .then(tkn => this.storeCredentialsInBrowser(params).then(() => tkn))
	                .then(authenticationToken => {
	                var _a;
	                if (authenticationToken.mfaRequired) {
	                    return this.mfaClient ?
	                        (_a = this.mfaClient) === null || _a === void 0 ? void 0 : _a.getMfaStepUpToken({ tkn: authenticationToken.tkn, options: auth }).then(res => ({ stepUpToken: res.token, amr: res.amr }))
	                        : Promise.reject(new Error("Error during client instantiation"));
	                }
	                return this.loginCallback(authenticationToken, auth);
	            });
	        return loginPromise.catch((err) => {
	            if (err.error) {
	                this.eventManager.fireEvent('login_failed', err);
	            }
	            return Promise.reject(err);
	        });
	    }
	    loginWithSocialProvider(provider, opts = {}) {
	        if (this.config.orchestrationToken) {
	            const params = Object.assign(Object.assign({}, (this.orchestratedFlowParams(this.config.orchestrationToken, Object.assign(Object.assign({}, opts), { useWebMessage: false })))), { provider });
	            if ('cordova' in window) {
	                return this.loginWithCordovaInAppBrowser(params);
	            }
	            else if (params.display === 'popup') {
	                return this.loginWithPopup(params);
	            }
	            else {
	                return this.redirectThruAuthorization(params);
	            }
	        }
	        else {
	            const authParams = this.authParams(Object.assign(Object.assign({}, opts), { useWebMessage: false }), { acceptPopupMode: true });
	            return this.getPkceParams(authParams).then(maybeChallenge => {
	                const params = Object.assign(Object.assign(Object.assign({}, authParams), { provider }), maybeChallenge);
	                if ('cordova' in window) {
	                    return this.loginWithCordovaInAppBrowser(params);
	                }
	                else if (params.display === 'popup') {
	                    return this.loginWithPopup(params);
	                }
	                else {
	                    return this.redirectThruAuthorization(params);
	                }
	            });
	        }
	    }
	    loginWithIdToken(provider, idToken, nonce, opts = {}) {
	        const authParams = this.authParams(Object.assign({}, opts));
	        if (opts.useWebMessage) {
	            const queryString = toQueryString(Object.assign(Object.assign({}, authParams), { provider,
	                idToken,
	                nonce }));
	            return this.getWebMessage(`${this.authorizeUrl}?${queryString}`, this.config.baseUrl, opts.redirectUri).then();
	        }
	        else {
	            return this.redirectThruAuthorization(Object.assign(Object.assign({}, authParams), { provider,
	                idToken,
	                nonce }));
	        }
	    }
	    googleOneTap(opts = {}, nonce = randomBase64String()) {
	        const binaryNonce = buffer_1.from(nonce, 'utf-8');
	        return window.crypto.subtle.digest('SHA-256', binaryNonce).then(hash => {
	            const googleIdConfiguration = {
	                client_id: this.config.googleClientId,
	                callback: (response) => this.loginWithIdToken("google", response.credential, nonce, opts),
	                nonce: encodeToBase64(hash),
	                // Enable auto sign-in
	                auto_select: true,
	            };
	            window.google.accounts.id.initialize(googleIdConfiguration);
	            // Activate Google One Tap
	            window.google.accounts.id.prompt();
	        });
	    }
	    instantiateOneTap(opts = {}) {
	        var _a, _b;
	        if ((_a = this.config) === null || _a === void 0 ? void 0 : _a.googleClientId) {
	            const script = document.createElement("script");
	            script.src = "https://accounts.google.com/gsi/client";
	            script.onload = () => this.googleOneTap(opts);
	            script.async = true;
	            script.defer = true;
	            (_b = document.querySelector("body")) === null || _b === void 0 ? void 0 : _b.appendChild(script);
	        }
	        else {
	            logError('Google configuration missing.');
	        }
	    }
	    logout(opts = {}, revocationParams) {
	        if (navigator.credentials && navigator.credentials.preventSilentAccess && opts.removeCredentials === true) {
	            navigator.credentials.preventSilentAccess();
	        }
	        if (this.config.isPublic && revocationParams) {
	            return this.revokeToken(revocationParams)
	                .then(() => window.location.assign(`${this.logoutUrl}?${toQueryString(opts)}`));
	        }
	        else {
	            return Promise.resolve(window.location.assign(`${this.logoutUrl}?${toQueryString(opts)}`));
	        }
	    }
	    revokeToken(revocationParams) {
	        const revocationsCalls = revocationParams.tokens.map(token => this.http.post(this.revokeUrl, {
	            body: {
	                clientId: this.config.clientId,
	                token
	            }
	        }));
	        return Promise.all(revocationsCalls);
	    }
	    refreshTokens(params) {
	        const result = this.http.post(this.tokenUrl, {
	            body: Object.assign({ clientId: this.config.clientId, grantType: 'refresh_token', refreshToken: params.refreshToken }, pick_1(params, 'scope'))
	        });
	        return result.then(enrichAuthResult);
	    }
	    signup(params) {
	        const { data, auth, redirectUrl, returnToAfterEmailConfirmation, saveCredentials, captchaToken } = params;
	        const { clientId } = this.config;
	        const scope = resolveScope(auth, this.config.scope);
	        const loginParams = Object.assign(Object.assign({}, (data.phoneNumber)
	            ? { phoneNumber: data.phoneNumber }
	            : { email: data.email || "" }), { password: data.password, saveCredentials,
	            auth });
	        const resultPromise = window.cordova
	            ? this.http
	                .post(this.signupTokenUrl, {
	                body: Object.assign(Object.assign({ clientId,
	                    redirectUrl,
	                    scope }, pick_1(auth, 'origin')), { data,
	                    returnToAfterEmailConfirmation,
	                    captchaToken })
	            })
	                .then(authResult => {
	                this.eventManager.fireEvent('authenticated', authResult);
	                return this.storeCredentialsInBrowser(loginParams).then(() => enrichAuthResult(authResult));
	            })
	            : this.http
	                .post(this.signupUrl, {
	                body: {
	                    clientId,
	                    redirectUrl,
	                    scope,
	                    data,
	                    returnToAfterEmailConfirmation,
	                    captchaToken
	                }
	            })
	                .then(tkn => this.storeCredentialsInBrowser(loginParams).then(() => tkn))
	                .then(tkn => this.loginCallback(tkn, auth));
	        return resultPromise.catch(err => {
	            if (err.error) {
	                this.eventManager.fireEvent('signup_failed', err);
	            }
	            return Promise.reject(err);
	        });
	    }
	    startPasswordless(params, auth = {}) {
	        const passwordlessPayload = ('stepUp' in params)
	            ? Promise.resolve(params)
	            : this.resolveSingleFactorPasswordlessParams(params, auth);
	        return passwordlessPayload.then(payload => this.http.post(this.passwordlessStartUrl, {
	            body: payload
	        }));
	    }
	    verifyPasswordless(params, auth = {}) {
	        return ('challengeId' in params)
	            ? Promise.resolve(this.loginWithVerificationCode(params))
	            : this.http
	                .post(this.passwordlessVerifyAuthCodeUrl, { body: params })
	                .catch(err => {
	                if (err.error)
	                    this.eventManager.fireEvent('login_failed', err);
	                return Promise.reject(err);
	            })
	                .then(() => this.loginWithVerificationCode(params, auth));
	    }
	    getAuthorizationUrl(queryString) {
	        return `${this.authorizeUrl}?${toQueryString(queryString)}`;
	    }
	    getWebMessage(src, origin, redirectUri) {
	        const iframe = document.createElement('iframe');
	        // "wm" needed to make sure the randomized id is valid
	        const id = `wm${randomBase64String()}`;
	        iframe.setAttribute('width', '0');
	        iframe.setAttribute('height', '0');
	        iframe.setAttribute('style', 'display:none;');
	        iframe.setAttribute('id', id);
	        iframe.setAttribute('src', src);
	        return new Promise((resolve, reject) => {
	            const listener = (event) => {
	                // Verify the event's origin
	                if (event.origin !== origin)
	                    return;
	                // Verify the event's syntax
	                const data = camelCaseProperties(event.data);
	                if (data.type !== 'authorization_response')
	                    return;
	                // The iframe is no longer needed, clean it up ..
	                if (window.document.body.contains(iframe)) {
	                    window.document.body.removeChild(iframe);
	                }
	                const result = data.response;
	                if (exports.AuthResult.isAuthResult(result)) {
	                    if (result.code) {
	                        resolve(this.exchangeAuthorizationCodeWithPkce({
	                            code: result.code,
	                            redirectUri: redirectUri || window.location.origin,
	                        }));
	                    }
	                    else {
	                        this.eventManager.fireEvent('authenticated', data.response);
	                        resolve(enrichAuthResult(data.response));
	                    }
	                }
	                else if (exports.ErrorResponse.isErrorResponse(result)) {
	                    // The 'authentication_failed' event must not be triggered because it is not a real authentication failure.
	                    reject(result);
	                }
	                else {
	                    reject({
	                        error: 'unexpected_error',
	                        errorDescription: 'Unexpected error occurred'
	                    });
	                }
	                window.removeEventListener('message', listener, false);
	            };
	            window.addEventListener('message', listener, false);
	            document.body.appendChild(iframe);
	        })
	            .finally(() => {
	            this.releaseAuthorizationLock();
	            this.releaseSessionLock();
	        });
	    }
	    loginWithPopup(opts) {
	        const { responseType, redirectUri, provider } = opts;
	        winchan.open({
	            url: `${this.authorizeUrl}?${toQueryString(opts)}`,
	            relay_url: this.popupRelayUrl,
	            window_features: this.computeProviderPopupOptions(provider)
	        }, (err, result) => {
	            if (err) {
	                logError(err);
	                this.eventManager.fireEvent('authentication_failed', {
	                    errorDescription: 'Unexpected error occurred',
	                    error: 'server_error'
	                });
	                return;
	            }
	            if (result) {
	                const r = camelCaseProperties(result);
	                if (r.success) {
	                    if (responseType === 'code') {
	                        window.location.assign(`${redirectUri}?code=${r.data.code}`);
	                    }
	                    else {
	                        this.eventManager.fireEvent('authenticated', r.data);
	                    }
	                }
	                else {
	                    this.eventManager.fireEvent('authentication_failed', r.data);
	                }
	            }
	        });
	        return Promise.resolve();
	    }
	    computeProviderPopupOptions(provider) {
	        try {
	            const opts = popupSize(provider);
	            const left = Math.max(0, (screen.width - opts.width) / 2);
	            const top = Math.max(0, (screen.height - opts.height) / 2);
	            const width = Math.min(screen.width, opts.width);
	            const height = Math.min(screen.height, opts.height);
	            return `menubar=0,toolbar=0,resizable=1,scrollbars=1,width=${width},height=${height},top=${top},left=${left}`;
	        }
	        catch (e) {
	            return 'menubar=0,toolbar=0,resizable=1,scrollbars=1,width=960,height=680';
	        }
	    }
	    redirectThruAuthorization(queryString) {
	        const location = this.getAuthorizationUrl(queryString);
	        this.releaseAuthorizationLock();
	        this.releaseSessionLock();
	        window.location.assign(location);
	        return Promise.resolve();
	    }
	    loginWithVerificationCode(params, auth = {}) {
	        const queryString = toQueryString(Object.assign(Object.assign({}, this.authParams(auth)), params));
	        if (auth.useWebMessage) {
	            const timeout = (delay) => new Promise((resolve) => setTimeout(() => resolve(), delay));
	            const promiseGetWebMessage = this.getWebMessage(`${this.passwordlessVerifyUrl}?${queryString}`, this.config.baseUrl, auth.redirectUri).then();
	            return Promise.race([
	                promiseGetWebMessage,
	                timeout(1000)
	            ]);
	        }
	        else {
	            window.location.assign(`${this.passwordlessVerifyUrl}?${queryString}`);
	            return Promise.resolve();
	        }
	    }
	    ropcPasswordLogin(params) {
	        const auth = params.auth;
	        return this.http
	            .post(this.tokenUrl, {
	            body: Object.assign({ clientId: this.config.clientId, grantType: 'password', username: this.getAuthenticationId(params), password: params.password, scope: resolveScope(auth, this.config.scope) }, pick_1(auth, 'origin'))
	        })
	            .then(authResult => {
	            this.eventManager.fireEvent('authenticated', authResult);
	            return enrichAuthResult(authResult);
	        });
	    }
	    loginWithCordovaInAppBrowser(opts) {
	        return this.openInCordovaSystemBrowser(this.getAuthorizationUrl(Object.assign(Object.assign({}, opts), { display: 'page' })));
	    }
	    openInCordovaSystemBrowser(url) {
	        return this.getAvailableBrowserTabPlugin().then(maybeBrowserTab => {
	            if (!window.cordova) {
	                return Promise.reject(new Error('Cordova environnement not detected.'));
	            }
	            if (maybeBrowserTab) {
	                maybeBrowserTab.openUrl(url, () => { }, logError);
	                return Promise.resolve();
	            }
	            if (window.cordova.InAppBrowser) {
	                const ref = window.cordova.platformId === 'ios' ?
	                    // Open a webview (to pass Apple validation tests)
	                    window.cordova.InAppBrowser.open(url, '_blank') :
	                    // Open the system browser
	                    window.cordova.InAppBrowser.open(url, '_system');
	                return Promise.resolve(ref);
	            }
	            return Promise.reject(new Error('Cordova plugin "InAppBrowser" is required.'));
	        });
	    }
	    getAvailableBrowserTabPlugin() {
	        return new Promise((resolve, reject) => {
	            const cordova = window.cordova;
	            if (!cordova || !cordova.plugins || !cordova.plugins.browsertab)
	                return resolve(undefined);
	            const plugin = cordova.plugins.browsertab;
	            plugin.isAvailable(isAvailable => resolve(isAvailable ? plugin : undefined), reject);
	        });
	    }
	    storeCredentialsInBrowser(params) {
	        if (!params.saveCredentials)
	            return Promise.resolve();
	        if (navigator.credentials && navigator.credentials.create && navigator.credentials.store) {
	            const credentialParams = {
	                password: {
	                    password: params.password,
	                    id: this.getAuthenticationId(params)
	                }
	            };
	            return navigator.credentials
	                .create(credentialParams)
	                .then(credentials => !isUndefined_1(credentials) && credentials
	                ? navigator.credentials.store(credentials).then(() => { })
	                : Promise.resolve());
	        }
	        else {
	            logError('Unsupported Credentials Management API');
	            return Promise.resolve();
	        }
	    }
	    // TODO: Make passwordless able to handle web_message
	    // Asana https://app.asana.com/0/982150578058310/1200173806808689/f
	    resolveSingleFactorPasswordlessParams(params, auth = {}) {
	        const { authType, email, phoneNumber, captchaToken } = params;
	        if (this.config.orchestrationToken) {
	            const authParams = this.orchestratedFlowParams(this.config.orchestrationToken, auth);
	            return Promise.resolve(Object.assign(Object.assign({}, authParams), { authType,
	                email,
	                phoneNumber,
	                captchaToken }));
	        }
	        else {
	            const authParams = this.authParams(auth);
	            return this.getPkceParams(authParams).then(maybeChallenge => {
	                return Object.assign(Object.assign(Object.assign({}, authParams), { authType,
	                    email,
	                    phoneNumber,
	                    captchaToken }), maybeChallenge);
	            });
	        }
	    }
	    hasLoggedWithEmail(params) {
	        return params.email !== undefined;
	    }
	    hasLoggedWithPhoneNumber(params) {
	        return params.phoneNumber !== undefined;
	    }
	    getAuthenticationId(params) {
	        if (this.hasLoggedWithEmail(params)) {
	            return params.email;
	        }
	        else if (this.hasLoggedWithPhoneNumber(params)) {
	            return params.phoneNumber;
	        }
	        else {
	            return params.customIdentifier;
	        }
	    }
	    // TODO: Shared among the clients
	    loginCallback(tkn, auth = {}) {
	        if (this.config.orchestrationToken) {
	            const authParams = Object.assign(Object.assign({}, this.orchestratedFlowParams(this.config.orchestrationToken, auth)), pick_1(tkn, 'tkn'));
	            return Promise.resolve().then(() => this.redirectThruAuthorization(authParams));
	        }
	        else {
	            const authParams = this.authParams(auth);
	            return this.getPkceParams(authParams).then(maybeChallenge => {
	                const params = Object.assign(Object.assign(Object.assign({}, authParams), maybeChallenge), pick_1(tkn, 'tkn'));
	                if (auth.useWebMessage) {
	                    return this.getWebMessage(this.getAuthorizationUrl(params), this.config.baseUrl, auth.redirectUri);
	                }
	                else {
	                    return this.redirectThruAuthorization(params);
	                }
	            });
	        }
	    }
	    // In an orchestrated flow, only parameters from the original request are to be considered,
	    // as well as parameters that depend on user action
	    orchestratedFlowParams(orchestrationToken, authOptions = {}) {
	        const authParams = computeAuthOptions(authOptions);
	        const correctedAuthParams = Object.assign({ clientId: this.config.clientId, r5_request_token: orchestrationToken }, pick_1(authParams, 'responseType', 'redirectUri', 'clientId', 'persistent'));
	        const uselessParams = difference_1(keys_1(authParams), keys_1(correctedAuthParams));
	        if (uselessParams.length !== 0)
	            console.debug("Orchestrated flow: pruned parameters: " + uselessParams);
	        return correctedAuthParams;
	    }
	    authParams(opts, { acceptPopupMode = false } = {}) {
	        const isConfidentialCodeWebMsg = !this.config.isPublic && !!opts.useWebMessage && (opts.responseType === 'code' || opts.redirectUri);
	        const overrideResponseType = isConfidentialCodeWebMsg
	            ? { responseType: 'token', redirectUri: undefined }
	            : {};
	        return Object.assign({ clientId: this.config.clientId }, computeAuthOptions(Object.assign(Object.assign({}, opts), overrideResponseType), { acceptPopupMode }, this.config.scope));
	    }
	    getPkceParams(authParams) {
	        if (this.config.isPublic && authParams.responseType === 'code')
	            return computePkceParams();
	        else if (authParams.responseType === 'token' && this.config.pkceEnforced)
	            return Promise.reject(new Error('Cannot use implicit flow when PKCE is enforced'));
	        else
	            return Promise.resolve({});
	    }
	    acquireAuthorizationLock() {
	        setWithExpiry('authorize_state', 'state', 20000);
	    }
	    acquireSessionLock() {
	        setWithExpiry('session_state', 'state', 20000);
	    }
	    releaseSessionLock() {
	        sessionStorage.removeItem('session_state');
	    }
	    isSessionLocked() {
	        return getWithExpiry('session_state') !== null;
	    }
	    releaseAuthorizationLock() {
	        sessionStorage.removeItem('authorize_state');
	    }
	    isAuthorizationLocked() {
	        return getWithExpiry('authorize_state') !== null;
	    }
	}

	/**
	 * This function is like `baseIndexOf` except that it accepts a comparator.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @param {Function} comparator The comparator invoked per element.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseIndexOfWith(array, value, fromIndex, comparator) {
	  var index = fromIndex - 1,
	    length = array.length;
	  while (++index < length) {
	    if (comparator(array[index], value)) {
	      return index;
	    }
	  }
	  return -1;
	}
	var _baseIndexOfWith = baseIndexOfWith;

	/**
	 * Copies the values of `source` to `array`.
	 *
	 * @private
	 * @param {Array} source The array to copy values from.
	 * @param {Array} [array=[]] The array to copy values to.
	 * @returns {Array} Returns `array`.
	 */
	function copyArray(source, array) {
	  var index = -1,
	    length = source.length;
	  array || (array = Array(length));
	  while (++index < length) {
	    array[index] = source[index];
	  }
	  return array;
	}
	var _copyArray = copyArray;

	/** Used for built-in method references. */
	var arrayProto = Array.prototype;

	/** Built-in value references. */
	var splice = arrayProto.splice;

	/**
	 * The base implementation of `_.pullAllBy` without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to remove.
	 * @param {Function} [iteratee] The iteratee invoked per element.
	 * @param {Function} [comparator] The comparator invoked per element.
	 * @returns {Array} Returns `array`.
	 */
	function basePullAll(array, values, iteratee, comparator) {
	  var indexOf = comparator ? _baseIndexOfWith : _baseIndexOf,
	    index = -1,
	    length = values.length,
	    seen = array;
	  if (array === values) {
	    values = _copyArray(values);
	  }
	  if (iteratee) {
	    seen = _arrayMap(array, _baseUnary(iteratee));
	  }
	  while (++index < length) {
	    var fromIndex = 0,
	      value = values[index],
	      computed = iteratee ? iteratee(value) : value;
	    while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
	      if (seen !== array) {
	        splice.call(seen, fromIndex, 1);
	      }
	      splice.call(array, fromIndex, 1);
	    }
	  }
	  return array;
	}
	var _basePullAll = basePullAll;

	/**
	 * This method is like `_.pull` except that it accepts an array of values to remove.
	 *
	 * **Note:** Unlike `_.difference`, this method mutates `array`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Array
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to remove.
	 * @returns {Array} Returns `array`.
	 * @example
	 *
	 * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
	 *
	 * _.pullAll(array, ['a', 'c']);
	 * console.log(array);
	 * // => ['b', 'b']
	 */
	function pullAll(array, values) {
	  return array && array.length && values && values.length ? _basePullAll(array, values) : array;
	}
	var pullAll_1 = pullAll;

	/**
	 * Removes all given values from `array` using
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons.
	 *
	 * **Note:** Unlike `_.without`, this method mutates `array`. Use `_.remove`
	 * to remove elements from an array by predicate.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.0.0
	 * @category Array
	 * @param {Array} array The array to modify.
	 * @param {...*} [values] The values to remove.
	 * @returns {Array} Returns `array`.
	 * @example
	 *
	 * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
	 *
	 * _.pull(array, 'a', 'c');
	 * console.log(array);
	 * // => ['b', 'b']
	 */
	var pull = _baseRest(pullAll_1);
	var pull_1 = pull;

	class EventManager {
	    constructor() {
	        this.listeners = {};
	    }
	    fire(name, data) {
	        this.getListeners(name).forEach(listener => {
	            try {
	                listener(data);
	            }
	            catch (e) {
	                logError(e);
	            }
	        });
	    }
	    on(name, listener) {
	        this.getListeners(name).push(listener);
	    }
	    off(name, listener) {
	        pull_1(this.getListeners(name), listener);
	    }
	    getListeners(name) {
	        let listeners = this.listeners[name];
	        if (!listeners) {
	            listeners = this.listeners[name] = [];
	        }
	        return listeners;
	    }
	}

	function createEventManager() {
	    const eventManager = new EventManager();
	    return {
	        on(eventName, listener) {
	            eventManager.on(eventName, listener);
	        },
	        off(eventName, listener) {
	            eventManager.off(eventName, listener);
	        },
	        fireEvent(eventName, data) {
	            if (eventName === 'authenticated') {
	                const ar = enrichAuthResult(data);
	                eventManager.fire(eventName, ar);
	            }
	            else {
	                eventManager.fire(eventName, data);
	            }
	        }
	    };
	}

	function createUrlParser(eventManager) {
	    return {
	        checkUrlFragment(url) {
	            const authResult = this.parseUrlFragment(url);
	            if (exports.AuthResult.isAuthResult(authResult)) {
	                eventManager.fireEvent('authenticated', authResult);
	                return true;
	            }
	            else if (exports.ErrorResponse.isErrorResponse(authResult)) {
	                eventManager.fireEvent('authentication_failed', authResult);
	                return true;
	            }
	            return false;
	        },
	        parseUrlFragment(url = '') {
	            const separatorIndex = url.indexOf('#');
	            if (separatorIndex >= 0) {
	                const parsed = parseQueryString(url.substr(separatorIndex + 1));
	                const expiresIn = parsed.expiresIn ? parseInt(parsed.expiresIn, 10) : undefined;
	                if (exports.AuthResult.isAuthResult(parsed)) {
	                    return Object.assign(Object.assign({}, parsed), { expiresIn });
	                }
	                return exports.ErrorResponse.isErrorResponse(parsed) ? parsed : undefined;
	            }
	            return undefined;
	        }
	    };
	}

	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	  setTag = '[object Set]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Checks if `value` is an empty object, collection, map, or set.
	 *
	 * Objects are considered empty if they have no own enumerable string keyed
	 * properties.
	 *
	 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
	 * jQuery-like collections are considered empty if they have a `length` of `0`.
	 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
	 * @example
	 *
	 * _.isEmpty(null);
	 * // => true
	 *
	 * _.isEmpty(true);
	 * // => true
	 *
	 * _.isEmpty(1);
	 * // => true
	 *
	 * _.isEmpty([1, 2, 3]);
	 * // => false
	 *
	 * _.isEmpty({ 'a': 1 });
	 * // => false
	 */
	function isEmpty(value) {
	  if (value == null) {
	    return true;
	  }
	  if (isArrayLike_1(value) && (isArray_1(value) || typeof value == 'string' || typeof value.splice == 'function' || isBuffer_1(value) || isTypedArray_1(value) || isArguments_1(value))) {
	    return !value.length;
	  }
	  var tag = _getTag(value);
	  if (tag == mapTag || tag == setTag) {
	    return !value.size;
	  }
	  if (_isPrototype(value)) {
	    return !_baseKeys(value).length;
	  }
	  for (var key in value) {
	    if (hasOwnProperty.call(value, key)) {
	      return false;
	    }
	  }
	  return true;
	}
	var isEmpty_1 = isEmpty;

	function createHttpClient(config) {
	    function get(path, params) {
	        return request(path, Object.assign(Object.assign({}, params), { method: 'GET' }));
	    }
	    function remove(path, params) {
	        return request(path, Object.assign(Object.assign({}, params), { method: 'DELETE' }));
	    }
	    function post(path, params) {
	        return request(path, Object.assign(Object.assign({}, params), { method: 'POST' }));
	    }
	    function request(path, params) {
	        const { method = 'GET', query = {}, body, accessToken = null, withCookies = false } = params;
	        const fullPath = query && !isEmpty_1(query) ? `${path}?${toQueryString(query)}` : path;
	        const url = fullPath.startsWith('http') ? fullPath : config.baseUrl + fullPath;
	        const fetchOptions = Object.assign(Object.assign({ method, headers: Object.assign(Object.assign(Object.assign(Object.assign({}, (accessToken && { Authorization: 'Bearer ' + accessToken })), (config.language && { 'Accept-Language': config.language })), (config.locale && { 'Custom-Locale': config.locale })), (body && { 'Content-Type': 'application/json;charset=UTF-8' })) }, (withCookies && config.acceptCookies && { credentials: 'include' })), (body && { body: JSON.stringify(snakeCaseProperties(body)) }));
	        return rawRequest(url, fetchOptions);
	    }
	    return { get, remove, post, request };
	}
	/**
	 * Low level HTTP client
	 */
	function rawRequest(url, fetchOptions) {
	    return fetch(url, fetchOptions).then(response => {
	        if (response.status !== 204) {
	            const dataP = (response.json().then(res => camelCaseProperties(res)));
	            return response.ok ? dataP : dataP.then(data => Promise.reject(data));
	        }
	        return undefined;
	    });
	}

	function initCordovaCallbackIfNecessary(urlParser) {
	    if (!window.cordova)
	        return;
	    if (window.handleOpenURL)
	        return;
	    window.handleOpenURL = url => {
	        const cordova = window.cordova;
	        if (!cordova)
	            return;
	        const parsed = urlParser.checkUrlFragment(url);
	        if (parsed && cordova.plugins && cordova.plugins.browsertab) {
	            cordova.plugins.browsertab.close();
	        }
	    };
	}

	/**
	 * Identity Rest API Client
	 */
	class MfaClient {
	    constructor(props) {
	        this.http = props.http;
	        this.oAuthClient = props.oAuthClient;
	        this.credentialsUrl = '/mfa/credentials';
	        this.emailCredentialUrl = `${this.credentialsUrl}/emails`;
	        this.emailCredentialVerifyUrl = `${this.emailCredentialUrl}/verify`;
	        this.passwordlessVerifyUrl = '/passwordless/verify';
	        this.phoneNumberCredentialUrl = `${this.credentialsUrl}/phone-numbers`;
	        this.phoneNumberCredentialVerifyUrl = `${this.phoneNumberCredentialUrl}/verify`;
	        this.stepUpUrl = '/mfa/stepup';
	        this.trustedDeviceUrl = '/mfa/trusteddevices';
	    }
	    getMfaStepUpToken(params) {
	        var _a;
	        const authParams = this.oAuthClient.authParams((_a = params.options) !== null && _a !== void 0 ? _a : {});
	        return this.oAuthClient.getPkceParams(authParams).then(challenge => {
	            return this.http.post(this.stepUpUrl, {
	                body: Object.assign(Object.assign(Object.assign({}, authParams), { tkn: params.tkn }), challenge),
	                withCookies: params.accessToken === undefined,
	                accessToken: params.accessToken
	            });
	        });
	    }
	    listMfaCredentials(accessToken) {
	        return this.http.get(this.credentialsUrl, {
	            accessToken
	        });
	    }
	    removeMfaEmail(params) {
	        const { accessToken } = params;
	        return this.http.remove(this.emailCredentialUrl, {
	            accessToken,
	        });
	    }
	    removeMfaPhoneNumber(params) {
	        const { accessToken, phoneNumber } = params;
	        return this.http.remove(this.phoneNumberCredentialUrl, {
	            body: {
	                phoneNumber
	            },
	            accessToken,
	        });
	    }
	    startMfaEmailRegistration(params) {
	        const { accessToken } = params;
	        return this.http.post(this.emailCredentialUrl, {
	            accessToken
	        });
	    }
	    startMfaPhoneNumberRegistration(params) {
	        const { accessToken, phoneNumber } = params;
	        return this.http.post(this.phoneNumberCredentialUrl, {
	            body: {
	                phoneNumber
	            },
	            accessToken
	        });
	    }
	    verifyMfaEmailRegistration(params) {
	        const { accessToken, verificationCode } = params;
	        return this.http.post(this.emailCredentialVerifyUrl, {
	            body: {
	                verificationCode
	            },
	            accessToken
	        });
	    }
	    verifyMfaPasswordless(params) {
	        const { challengeId, verificationCode, trustDevice } = params;
	        return this.http.post(this.passwordlessVerifyUrl, {
	            body: {
	                challengeId,
	                verificationCode,
	                trustDevice
	            },
	        });
	    }
	    verifyMfaPhoneNumberRegistration(params) {
	        const { accessToken, verificationCode } = params;
	        return this.http.post(this.phoneNumberCredentialVerifyUrl, {
	            body: {
	                verificationCode
	            },
	            accessToken
	        });
	    }
	    listTrustedDevices(accessToken) {
	        return this.http.get(this.trustedDeviceUrl, {
	            accessToken
	        });
	    }
	    deleteTrustedDevices(params) {
	        const { accessToken, trustedDeviceId } = params;
	        return this.http.remove(this.trustedDeviceUrl + '/' + trustedDeviceId, { accessToken });
	    }
	}

	/**
	 * Identity Rest API Client
	 */
	class ProfileClient {
	    constructor(props) {
	        this.config = props.config;
	        this.http = props.http;
	        this.eventManager = props.eventManager;
	        this.sendEmailVerificationUrl = '/send-email-verification';
	        this.sendPhoneNumberVerificationUrl = '/send-phone-number-verification';
	        this.signupDataUrl = '/signup/data';
	        this.unlinkUrl = '/unlink';
	        this.updateEmailUrl = '/update-email';
	        this.updatePasswordUrl = '/update-password';
	        this.updatePhoneNumberUrl = '/update-phone-number';
	        this.updateProfileUrl = '/update-profile';
	        this.userInfoUrl = '/userinfo';
	        this.verifyPhoneNumberUrl = '/verify-phone-number';
	    }
	    getSignupData(signupToken) {
	        return this.http.get(this.signupDataUrl, {
	            query: {
	                clientId: this.config.clientId,
	                token: signupToken
	            }
	        });
	    }
	    getUser(params) {
	        const { accessToken, fields } = params;
	        return this.http.get(this.userInfoUrl, { query: { fields }, accessToken });
	    }
	    requestPasswordReset(params) {
	        return this.http.post('/forgot-password', {
	            body: Object.assign({ clientId: this.config.clientId }, params)
	        });
	    }
	    sendEmailVerification(params) {
	        const { accessToken } = params, data = __rest(params, ["accessToken"]);
	        return this.http.post(this.sendEmailVerificationUrl, { body: Object.assign({}, data), accessToken });
	    }
	    sendPhoneNumberVerification(params) {
	        const { accessToken } = params;
	        return this.http.post(this.sendPhoneNumberVerificationUrl, { accessToken });
	    }
	    unlink(params) {
	        const { accessToken } = params, data = __rest(params, ["accessToken"]);
	        return this.http.post(this.unlinkUrl, { body: data, accessToken });
	    }
	    updateEmail(params) {
	        const { accessToken, email, redirectUrl, captchaToken } = params;
	        return this.http.post(this.updateEmailUrl, { body: { email, redirectUrl, captchaToken }, accessToken });
	    }
	    updatePhoneNumber(params) {
	        const { accessToken } = params, data = __rest(params, ["accessToken"]);
	        return this.http.post(this.updatePhoneNumberUrl, { body: data, accessToken });
	    }
	    updateProfile(params) {
	        const { accessToken, redirectUrl, data } = params;
	        return this.http
	            .post(this.updateProfileUrl, { body: Object.assign(Object.assign({}, data), { redirectUrl }), accessToken })
	            .then(() => this.eventManager.fireEvent('profile_updated', data));
	    }
	    updatePassword(params) {
	        const { accessToken } = params, data = __rest(params, ["accessToken"]);
	        return this.http.post(this.updatePasswordUrl, {
	            body: Object.assign({ clientId: this.config.clientId }, data),
	            accessToken
	        });
	    }
	    verifyPhoneNumber(params) {
	        const { accessToken } = params, data = __rest(params, ["accessToken"]);
	        const { phoneNumber } = data;
	        return this.http
	            .post(this.verifyPhoneNumberUrl, { body: data, accessToken })
	            .then(() => this.eventManager.fireEvent('profile_updated', { phoneNumber, phoneNumberVerified: true }));
	    }
	}

	const publicKeyCredentialType = 'public-key';
	function encodePublicKeyCredentialCreationOptions(serializedOptions) {
	    return Object.assign(Object.assign({}, serializedOptions), { challenge: buffer_1.from(serializedOptions.challenge, 'base64'), user: Object.assign(Object.assign({}, serializedOptions.user), { id: buffer_1.from(serializedOptions.user.id, 'base64') }), excludeCredentials: serializedOptions.excludeCredentials &&
	            serializedOptions.excludeCredentials.map((excludeCredential) => (Object.assign(Object.assign({}, excludeCredential), { id: buffer_1.from(excludeCredential.id, 'base64') }))) });
	}
	function encodePublicKeyCredentialRequestOptions(serializedOptions) {
	    return Object.assign(Object.assign({}, serializedOptions), { challenge: buffer_1.from(serializedOptions.challenge, 'base64'), allowCredentials: serializedOptions.allowCredentials.map((allowCrendential) => (Object.assign(Object.assign({}, allowCrendential), { id: buffer_1.from(allowCrendential.id, 'base64') }))) });
	}
	function serializeRegistrationPublicKeyCredential(encodedPublicKey) {
	    const response = encodedPublicKey.response;
	    return {
	        id: encodedPublicKey.id,
	        rawId: encodeToBase64(encodedPublicKey.rawId),
	        type: 'public-key',
	        response: {
	            clientDataJSON: encodeToBase64(response.clientDataJSON),
	            attestationObject: encodeToBase64(response.attestationObject)
	        }
	    };
	}
	function serializeAuthenticationPublicKeyCredential(encodedPublicKey) {
	    const response = encodedPublicKey.response;
	    return {
	        id: encodedPublicKey.id,
	        rawId: encodeToBase64(encodedPublicKey.rawId),
	        type: 'public-key',
	        response: {
	            authenticatorData: encodeToBase64(response.authenticatorData),
	            clientDataJSON: encodeToBase64(response.clientDataJSON),
	            signature: encodeToBase64(response.signature),
	            userHandle: response.userHandle && encodeToBase64(response.userHandle)
	        }
	    };
	}

	/**
	 * Identity Rest API Client
	 */
	class WebAuthnClient {
	    constructor(props) {
	        this.authenticationOptionsUrl = '/webauthn/authentication-options';
	        this.authenticationUrl = '/webauthn/authentication';
	        this.registrationOptionsUrl = '/webauthn/registration-options';
	        this.registrationUrl = '/webauthn/registration';
	        this.signupOptionsUrl = '/webauthn/signup-options';
	        this.signupUrl = '/webauthn/signup';
	        this.config = props.config;
	        this.http = props.http;
	        this.eventManager = props.eventManager;
	        this.oAuthClient = props.oAuthClient;
	        this.authenticationOptionsUrl = '/webauthn/authentication-options';
	        this.authenticationUrl = '/webauthn/authentication';
	        this.registrationOptionsUrl = '/webauthn/registration-options';
	        this.registrationUrl = '/webauthn/registration';
	        this.signupOptionsUrl = '/webauthn/signup-options';
	        this.signupUrl = '/webauthn/signup';
	    }
	    isPublicKeyCredential(credentials) {
	        return credentials.type === publicKeyCredentialType;
	    }
	    addNewWebAuthnDevice(accessToken, friendlyName) {
	        if (window.PublicKeyCredential) {
	            const body = {
	                origin: window.location.origin,
	                friendlyName: friendlyName || window.navigator.platform
	            };
	            return this.http
	                .post(this.registrationOptionsUrl, { body, accessToken })
	                .then((response) => {
	                const publicKey = encodePublicKeyCredentialCreationOptions(response.options.publicKey);
	                const corrected_creation_options = Object.assign(Object.assign({}, publicKey), { authenticatorSelection: Object.assign(Object.assign({}, publicKey.authenticatorSelection), { authenticatorAttachment: "cross-platform" }) });
	                console.log("original creation options");
	                console.log(publicKey);
	                console.log("corrected creation options");
	                console.log(corrected_creation_options);
	                return navigator.credentials.create({ publicKey: corrected_creation_options });
	            })
	                .then((credentials) => {
	                if (!credentials || !this.isPublicKeyCredential(credentials)) {
	                    return Promise.reject(new Error('Unable to register invalid public key credentials.'));
	                }
	                const serializedCredentials = serializeRegistrationPublicKeyCredential(credentials);
	                return this.http.post(this.registrationUrl, { body: Object.assign({}, serializedCredentials), accessToken });
	            })
	                .catch((err) => {
	                if (err.error)
	                    this.eventManager.fireEvent('login_failed', err);
	                return Promise.reject(err);
	            });
	        }
	        else {
	            return Promise.reject(new Error('Unsupported WebAuthn API'));
	        }
	    }
	    listWebAuthnDevices(accessToken) {
	        return this.http.get(this.registrationUrl, { accessToken });
	    }
	    isDiscoverable(params) {
	        return typeof params.conditionalMediation !== 'undefined';
	    }
	    buildWebAuthnParams(params) {
	        var _a, _b;
	        const body = this.isDiscoverable(params)
	            ? {
	                clientId: this.config.clientId,
	                origin: window.location.origin,
	                scope: resolveScope(params.auth, this.config.scope)
	            }
	            : {
	                clientId: this.config.clientId,
	                origin: window.location.origin,
	                scope: resolveScope(params.auth, this.config.scope),
	                email: params.email,
	                phoneNumber: params.phoneNumber
	            };
	        // to appease ESLint we have to put PublicKeyCredential in a const
	        const pubKeyCred = PublicKeyCredential;
	        const conditionalMediationAvailable = (_b = (_a = pubKeyCred.isConditionalMediationAvailable) === null || _a === void 0 ? void 0 : _a.call(pubKeyCred)) !== null && _b !== void 0 ? _b : Promise.resolve(false);
	        return conditionalMediationAvailable.then((conditionalMediationAvailable) => {
	            return {
	                body,
	                conditionalMediationAvailable: conditionalMediationAvailable
	            };
	        });
	    }
	    loginWithWebAuthn(params) {
	        if (!window.PublicKeyCredential) {
	            return Promise.reject(new Error('Unsupported WebAuthn API'));
	        }
	        return this.buildWebAuthnParams(params).then((queryParams) => {
	            if (this.isDiscoverable(params) &&
	                params.conditionalMediation === true &&
	                !queryParams.conditionalMediationAvailable) {
	                return Promise.reject(new Error('Conditional mediation unavailable'));
	            }
	            return this.http
	                .post(this.authenticationOptionsUrl, { body: queryParams.body })
	                .then((response) => {
	                const options = encodePublicKeyCredentialRequestOptions(response.publicKey);
	                const corrected_authentication_options = Object.assign({}, options);
	                //console.log('original authentication options')
	                //console.log(options)
	                //console.log('corrected authentication options')
	                //console.log(corrected_authentication_options)
	                if (this.isDiscoverable(params) &&
	                    params.conditionalMediation !== false &&
	                    queryParams.conditionalMediationAvailable) {
	                    // do autofill query
	                    return navigator.credentials.get({ publicKey: corrected_authentication_options, mediation: 'conditional', signal: params.signal });
	                }
	                // do modal query
	                return navigator.credentials.get({ publicKey: corrected_authentication_options, signal: params.signal });
	            })
	                .then((credentials) => {
	                if (!credentials || !this.isPublicKeyCredential(credentials)) {
	                    return Promise.reject(new Error('Unable to authenticate with invalid public key credentials.'));
	                }
	                const serializedCredentials = serializeAuthenticationPublicKeyCredential(credentials);
	                return this.http
	                    .post(this.authenticationUrl, { body: Object.assign({}, serializedCredentials) })
	                    .then((tkn) => this.oAuthClient.loginCallback(tkn, params.auth));
	            })
	                .catch((err) => {
	                if (err.error)
	                    this.eventManager.fireEvent('login_failed', err);
	                return Promise.reject(err);
	            });
	        });
	    }
	    removeWebAuthnDevice(accessToken, deviceId) {
	        return this.http.remove(`${this.registrationUrl}/${deviceId}`, { accessToken });
	    }
	    signupWithWebAuthn(params, auth) {
	        if (window.PublicKeyCredential) {
	            const body = {
	                origin: window.location.origin,
	                clientId: this.config.clientId,
	                friendlyName: params.friendlyName || window.navigator.platform,
	                profile: params.profile,
	                scope: resolveScope(auth, this.config.scope),
	                redirectUrl: params.redirectUrl,
	                returnToAfterEmailConfirmation: params.returnToAfterEmailConfirmation
	            };
	            const registrationOptionsPromise = this.http.post(this.signupOptionsUrl, { body });
	            const credentialsPromise = registrationOptionsPromise.then((response) => {
	                const publicKey = encodePublicKeyCredentialCreationOptions(response.options.publicKey);
	                const corrected_creation_options = Object.assign(Object.assign({}, publicKey), { authenticatorSelection: Object.assign(Object.assign({}, publicKey.authenticatorSelection), { authenticatorAttachment: "cross-platform" }) });
	                console.log("original creation options");
	                console.log(publicKey);
	                console.log("corrected creation options");
	                console.log(corrected_creation_options);
	                return navigator.credentials.create({ publicKey: corrected_creation_options });
	            });
	            return Promise.all([registrationOptionsPromise, credentialsPromise])
	                .then(([registrationOptions, credentials]) => {
	                if (!credentials || !this.isPublicKeyCredential(credentials)) {
	                    return Promise.reject(new Error('Unable to register invalid public key credentials.'));
	                }
	                const serializedCredentials = serializeRegistrationPublicKeyCredential(credentials);
	                return this.http
	                    .post(this.signupUrl, {
	                    body: {
	                        publicKeyCredential: serializedCredentials,
	                        webauthnId: registrationOptions.options.publicKey.user.id
	                    }
	                })
	                    .then((tkn) => this.oAuthClient.loginCallback(tkn, auth));
	            })
	                .catch((err) => {
	                if (err.error)
	                    this.eventManager.fireEvent('login_failed', err);
	                return Promise.reject(err);
	            });
	        }
	        else {
	            return Promise.reject(new Error('Unsupported WebAuthn API'));
	        }
	    }
	}

	function checkParam(data, key) {
	    const value = data[key];
	    if (value === undefined || value === null) {
	        throw new Error(`The reach5 creation config has errors: ${key} is not set`);
	    }
	}
	function createClient(creationConfig) {
	    checkParam(creationConfig, 'domain');
	    checkParam(creationConfig, 'clientId');
	    const { domain, clientId, language, locale } = creationConfig;
	    const eventManager = createEventManager();
	    const urlParser = createUrlParser(eventManager);
	    initCordovaCallbackIfNecessary(urlParser);
	    const baseUrl = `https://${domain}`;
	    const baseIdentityUrl = `${baseUrl}/identity/v1`;
	    const remoteSettings = rawRequest(`https://${domain}/identity/v1/config?${toQueryString({ clientId, lang: language })}`);
	    const apiClients = remoteSettings.then(remoteConfig => {
	        const { language, sso } = remoteConfig;
	        const params = new URLSearchParams(window.location.search);
	        const orchestrationToken = params.get('r5_request_token') || undefined;
	        const config = Object.assign({ clientId,
	            baseUrl,
	            orchestrationToken }, remoteConfig);
	        const http = createHttpClient({
	            baseUrl: baseIdentityUrl,
	            language,
	            acceptCookies: sso,
	            locale
	        });
	        const oAuthClient = new OAuthClient({
	            config,
	            http,
	            eventManager
	        });
	        const mfaClient = new MfaClient({
	            http,
	            oAuthClient
	        });
	        oAuthClient.setMfaClient(mfaClient);
	        return {
	            oAuth: oAuthClient,
	            mfa: mfaClient,
	            webAuthn: new WebAuthnClient({
	                config,
	                http,
	                eventManager,
	                oAuthClient
	            }),
	            profile: new ProfileClient({
	                config,
	                http,
	                eventManager
	            })
	        };
	    });
	    function addNewWebAuthnDevice(accessToken, friendlyName) {
	        return apiClients.then(clients => clients.webAuthn.addNewWebAuthnDevice(accessToken, friendlyName));
	    }
	    function checkSession(options = {}) {
	        return apiClients.then(clients => clients.oAuth.checkSession(options));
	    }
	    function checkUrlFragment(url = window.location.href) {
	        const authResponseDetected = urlParser.checkUrlFragment(url);
	        if (authResponseDetected && url === window.location.href) {
	            window.location.hash = '';
	        }
	        return authResponseDetected;
	    }
	    function exchangeAuthorizationCodeWithPkce(params) {
	        return apiClients.then(clients => clients.oAuth.exchangeAuthorizationCodeWithPkce(params));
	    }
	    function getMfaStepUpToken(params) {
	        return apiClients.then(clients => clients.mfa.getMfaStepUpToken(params));
	    }
	    function getSessionInfo() {
	        return apiClients.then(clients => clients.oAuth.getSessionInfo());
	    }
	    function getSignupData(signupToken) {
	        return apiClients.then(clients => clients.profile.getSignupData(signupToken));
	    }
	    function getUser(params) {
	        return apiClients.then(clients => clients.profile.getUser(params));
	    }
	    function listMfaCredentials(accessToken) {
	        return apiClients.then(clients => clients.mfa.listMfaCredentials(accessToken));
	    }
	    function listWebAuthnDevices(accessToken) {
	        return apiClients.then(clients => clients.webAuthn.listWebAuthnDevices(accessToken));
	    }
	    function loginFromSession(options = {}) {
	        return apiClients.then(clients => clients.oAuth.loginFromSession(options));
	    }
	    function loginWithCredentials(params) {
	        return apiClients.then(clients => clients.oAuth.loginWithCredentials(params));
	    }
	    function loginWithCustomToken(params) {
	        return apiClients.then(clients => clients.oAuth.loginWithCustomToken(params));
	    }
	    function loginWithPassword(params) {
	        return apiClients.then(clients => clients.oAuth.loginWithPassword(params));
	    }
	    function instantiateOneTap(opts = {}) {
	        return apiClients.then(clients => clients.oAuth.instantiateOneTap(opts));
	    }
	    function listTrustedDevices(accessToken) {
	        return apiClients.then(clients => clients.mfa.listTrustedDevices(accessToken));
	    }
	    function loginWithSocialProvider(provider, options = {}) {
	        return apiClients.then(clients => clients.oAuth.loginWithSocialProvider(provider, options));
	    }
	    function loginWithWebAuthn(params) {
	        return apiClients.then(clients => clients.webAuthn.loginWithWebAuthn(params));
	    }
	    function logout(params = {}, revocationParams) {
	        return apiClients.then(clients => clients.oAuth.logout(params, revocationParams));
	    }
	    function off(eventName, listener) {
	        return eventManager.off(eventName, listener);
	    }
	    function on(eventName, listener) {
	        eventManager.on(eventName, listener);
	        if (eventName === 'authenticated' || eventName === 'authentication_failed') {
	            // This call must be asynchronous to ensure the listener cannot be called synchronously
	            // (this type of behavior is generally unexpected for the developer)
	            setTimeout(() => checkUrlFragment(), 0);
	        }
	    }
	    function refreshTokens(params) {
	        return apiClients.then(clients => clients.oAuth.refreshTokens(params));
	    }
	    function removeMfaEmail(params) {
	        return apiClients.then(clients => clients.mfa.removeMfaEmail(params));
	    }
	    function removeMfaPhoneNumber(params) {
	        return apiClients.then(clients => clients.mfa.removeMfaPhoneNumber(params));
	    }
	    function removeTrustedDevice(params) {
	        return apiClients.then(clients => clients.mfa.deleteTrustedDevices(params));
	    }
	    function removeWebAuthnDevice(accessToken, deviceId) {
	        return apiClients.then(clients => clients.webAuthn.removeWebAuthnDevice(accessToken, deviceId));
	    }
	    function requestPasswordReset(params) {
	        return apiClients.then(clients => clients.profile.requestPasswordReset(params));
	    }
	    function sendEmailVerification(params) {
	        return apiClients.then(clients => clients.profile.sendEmailVerification(params));
	    }
	    function sendPhoneNumberVerification(params) {
	        return apiClients.then(clients => clients.profile.sendPhoneNumberVerification(params));
	    }
	    function signup(params) {
	        return apiClients.then(clients => clients.oAuth.signup(params));
	    }
	    function signupWithWebAuthn(params, auth) {
	        return apiClients.then(clients => clients.webAuthn.signupWithWebAuthn(params, auth));
	    }
	    function startMfaEmailRegistration(params) {
	        return apiClients.then(clients => clients.mfa.startMfaEmailRegistration(params));
	    }
	    function startMfaPhoneNumberRegistration(params) {
	        return apiClients.then(clients => clients.mfa.startMfaPhoneNumberRegistration(params));
	    }
	    function startPasswordless(params, options = {}) {
	        return apiClients.then(clients => clients.oAuth.startPasswordless(params, options));
	    }
	    function unlink(params) {
	        return apiClients.then(clients => clients.profile.unlink(params));
	    }
	    function updateEmail(params) {
	        return apiClients.then(clients => clients.profile.updateEmail(params));
	    }
	    function updatePassword(params) {
	        return apiClients.then(clients => clients.profile.updatePassword(params));
	    }
	    function updatePhoneNumber(params) {
	        return apiClients.then(clients => clients.profile.updatePhoneNumber(params));
	    }
	    function updateProfile(params) {
	        return apiClients.then(clients => clients.profile.updateProfile(params));
	    }
	    function verifyMfaEmailRegistration(params) {
	        return apiClients.then(clients => clients.mfa.verifyMfaEmailRegistration(params));
	    }
	    function verifyMfaPasswordless(params) {
	        return apiClients.then(clients => clients.mfa.verifyMfaPasswordless(params));
	    }
	    function verifyMfaPhoneNumberRegistration(params) {
	        return apiClients.then(clients => clients.mfa.verifyMfaPhoneNumberRegistration(params));
	    }
	    function verifyPasswordless(params, auth) {
	        return apiClients.then(clients => clients.oAuth.verifyPasswordless(params, auth));
	    }
	    function verifyPhoneNumber(params) {
	        return apiClients.then(clients => clients.profile.verifyPhoneNumber(params));
	    }
	    return {
	        addNewWebAuthnDevice,
	        checkSession,
	        checkUrlFragment,
	        exchangeAuthorizationCodeWithPkce,
	        getMfaStepUpToken,
	        getSessionInfo,
	        getSignupData,
	        getUser,
	        listMfaCredentials,
	        listTrustedDevices,
	        listWebAuthnDevices,
	        loginFromSession,
	        loginWithCredentials,
	        loginWithCustomToken,
	        loginWithPassword,
	        instantiateOneTap,
	        loginWithSocialProvider,
	        loginWithWebAuthn,
	        logout,
	        off,
	        on,
	        refreshTokens,
	        remoteSettings,
	        removeMfaEmail,
	        removeMfaPhoneNumber,
	        removeTrustedDevice,
	        removeWebAuthnDevice,
	        requestPasswordReset,
	        sendEmailVerification,
	        sendPhoneNumberVerification,
	        signup,
	        signupWithWebAuthn,
	        startMfaEmailRegistration,
	        startMfaPhoneNumberRegistration,
	        startPasswordless,
	        unlink,
	        updateEmail,
	        updatePassword,
	        updatePhoneNumber,
	        updateProfile,
	        verifyMfaEmailRegistration,
	        verifyMfaPasswordless,
	        verifyMfaPhoneNumberRegistration,
	        verifyPasswordless,
	        verifyPhoneNumber,
	    };
	}

	exports.createClient = createClient;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
