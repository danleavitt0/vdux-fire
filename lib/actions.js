'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.set = exports.once = exports.push = exports.refMethod = exports.update = exports.transaction = exports.invalidate = exports.unsubscribe = exports.subscribe = undefined;

var _createAction = require('@f/create-action');

var _createAction2 = _interopRequireDefault(_createAction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var transaction = (0, _createAction2.default)('vdux-fireSummon: transaction');
var unsubscribe = (0, _createAction2.default)('vdux-fireSummon: unsubscribe');
var invalidate = (0, _createAction2.default)('vdux-fireSummon: invalidate');
var subscribe = (0, _createAction2.default)('vdux-fireSummon: subscribe');
var refMethod = (0, _createAction2.default)('vdux-fireSummon: refMethod');
var update = (0, _createAction2.default)('vdux-fireSummon: update');
var once = (0, _createAction2.default)('vdux-fireSummon: once');
var push = (0, _createAction2.default)('vdux-fireSummon: push');
var set = (0, _createAction2.default)('vdux-fireSummon: set');

exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;
exports.invalidate = invalidate;
exports.transaction = transaction;
exports.update = update;
exports.refMethod = refMethod;
exports.push = push;
exports.once = once;
exports.set = set;