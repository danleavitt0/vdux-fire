'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.set = exports.once = exports.push = exports.update = exports.refMethod = exports.middleware = exports.transaction = undefined;

var _middleware = require('./middleware');

var _middleware2 = _interopRequireDefault(_middleware);

var _connect = require('./connect');

var _connect2 = _interopRequireDefault(_connect);

var _actions = require('./actions');

var actions = _interopRequireWildcard(_actions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var set = function set(ref, payload) {
  return actions.set({ ref: ref, value: payload });
};
var transaction = function transaction(ref, payload) {
  return actions.transaction({ ref: ref, value: payload });
};
var update = function update(ref, payload) {
  return actions.update({ ref: ref, value: payload });
};
var push = function push(ref, payload) {
  return actions.push({ ref: ref, value: payload });
};
var refMethod = actions.refMethod;
var once = actions.once;

exports.default = _connect2.default;
exports.transaction = transaction;
exports.middleware = _middleware2.default;
exports.refMethod = refMethod;
exports.update = update;
exports.push = push;
exports.once = once;
exports.set = set;