'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mw = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _map = require('@f/map');

var _map2 = _interopRequireDefault(_map);

var _reducer = require('./reducer');

var _reducer2 = _interopRequireDefault(_reducer);

var _switch = require('@f/switch');

var _switch2 = _interopRequireDefault(_switch);

var _reduxEphemeral = require('redux-ephemeral');

var _actions = require('./actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var refs = [];
var db = void 0;

var middleware = function middleware(config) {
  if (_firebase2.default.apps.length === 0) {
    _firebase2.default.initializeApp(config);
  }
  db = _firebase2.default.database();
  return mw;
};

function mw(_ref) {
  var dispatch = _ref.dispatch,
      getState = _ref.getState,
      actions = _ref.actions;

  return function (next) {
    return function (action) {
      var _Switch;

      return (0, _switch2.default)((_Switch = {}, (0, _defineProperty3.default)(_Switch, _actions.subscribe.type, sub), (0, _defineProperty3.default)(_Switch, _actions.unsubscribe.type, unsub), (0, _defineProperty3.default)(_Switch, _actions.invalidate.type, inval), (0, _defineProperty3.default)(_Switch, _actions.refMethod.type, refMethodHandler), (0, _defineProperty3.default)(_Switch, _actions.transaction.type, transactionHandler), (0, _defineProperty3.default)(_Switch, _actions.set.type, setValue), (0, _defineProperty3.default)(_Switch, _actions.update.type, updateHandler), (0, _defineProperty3.default)(_Switch, _actions.push.type, pushHandler), (0, _defineProperty3.default)(_Switch, _actions.once.type, onceFn), (0, _defineProperty3.default)(_Switch, 'default', function _default() {
        return next(action);
      }), _Switch))(action.type, action.payload);
    };
  };

  function inval(payload) {
    var ref = payload.ref,
        value = payload.value,
        name = payload.name;

    return (0, _map2.default)(function (path) {
      return dispatch((0, _reduxEphemeral.toEphemeral)(path, _reducer2.default, actions.update({ ref: ref, value: value, name: name })));
    }, refs[ref]);
  }

  function pushHandler(payload) {
    var ref = payload.ref,
        value = payload.value;

    return db.ref(ref).push(value);
  }

  function setValue(payload) {
    var ref = payload.ref,
        value = payload.value;

    return db.ref(ref).set(value);
  }

  function updateHandler(payload) {
    var ref = payload.ref,
        value = payload.value;

    return db.ref(ref).update(value);
  }

  function transactionHandler(payload) {
    var ref = payload.ref,
        value = payload.value;

    return db.ref(ref).transaction(value);
  }

  function refMethodHandler(payload) {
    var ref = payload.ref,
        updates = payload.updates;

    var dbRef = typeof ref === 'string' ? db.ref(ref) : ref;
    if (Array.isArray(updates)) {
      return updates.reduce(function (prev, update) {
        return refMethodHandler({ ref: prev || dbRef, updates: update });
      }, undefined);
    }
    var method = updates.method,
        value = updates.value;

    if (dbRef[method]) {
      return value ? dbRef[method](value) : dbRef[method]();
    } else if (method === 'remove') {
      return dbRef.ref.remove();
    } else {
      throw new Error('Not a valid firebase method');
    }
  }

  function onceFn(payload) {
    var ref = payload.ref,
        _payload$listener = payload.listener,
        listener = _payload$listener === undefined ? 'value' : _payload$listener;

    return db.ref(ref).once(listener);
  }

  function sub(payload) {
    var ref = payload.ref,
        path = payload.path,
        type = payload.type;

    if (!refs[ref] || refs[ref].length < 1) {
      refs[ref] = [path];
    } else {
      if (refs[ref].indexOf(path) === -1) {
        refs[ref].push(path);
      }
    }
    addListener(payload);
  }

  function unsub(_ref2) {
    var ref = _ref2.ref,
        path = _ref2.path;

    for (var key in refs) {
      var idx = refs[key].indexOf(path);
      if (idx !== -1) {
        refs[key].splice(idx, 1);
        // if (refs[key].length < 1) {
        //   removeListener(key)
        // }
      }
    }
  }

  // function removeListener (ref) {
  //   var dbref = db.ref(ref)
  //   dbref.off('value')
  // }

  function addListener(_ref3) {
    var ref = _ref3.ref,
        name = _ref3.name,
        updates = _ref3.updates,
        type = _ref3.type;

    var dbref = updates ? refMethodHandler({ ref: ref, updates: updates }) : db.ref(ref);
    if (type === 'once') {
      return dbref.once('value', function (snap) {
        var value = updates ? orderData(snap) : snap.val();
        dispatch((0, _actions.invalidate)({ ref: ref, name: name, value: value }));
      });
    }
    dbref.on('value', function (snap) {
      var value = updates ? orderData(snap) : snap.val();
      dispatch((0, _actions.invalidate)({ ref: ref, name: name, value: value }));
    });
  }
}

function orderData(snap) {
  var ordered = [];
  snap.forEach(function (child) {
    var val = child.val();
    ordered.push((0, _extends3.default)({}, val, { key: child.key }));
  });
  return ordered;
}

exports.mw = mw;
exports.default = middleware;