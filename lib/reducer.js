'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapNewState = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends4 = require('babel-runtime/helpers/extends');

var _extends5 = _interopRequireDefault(_extends4);

exports.default = function (state, action) {
  switch (action.type) {
    case _actions.update.type:
      var _action$payload = action.payload,
          value = _action$payload.value,
          name = _action$payload.name,
          size = _action$payload.size,
          sort = _action$payload.sort;

      return (0, _extends5.default)({}, state, (0, _defineProperty3.default)({}, name, (0, _extends5.default)({}, state[name], {
        name: name,
        loading: false,
        error: null,
        value: value,
        size: size,
        sort: sort
      })));
    case mapNewState.type:
      return (0, _extends5.default)({}, state, action.payload);
    case mergeValue.type:
      var _action$payload2 = action.payload,
          name = _action$payload2.name,
          value = _action$payload2.value;

      return (0, _extends5.default)({}, state, (0, _defineProperty3.default)({}, name, (0, _extends5.default)({}, state[name], {
        value: (0, _extends5.default)({}, state[name.value], value)
      })));
  }
  return state;
};

var _actions = require('./actions');

var _createAction = require('@f/create-action');

var _createAction2 = _interopRequireDefault(_createAction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mapNewState = (0, _createAction2.default)('MAP_NEW_STATE');
var mergeValue = (0, _createAction2.default)('MERGE_VALUE');

exports.mapNewState = mapNewState;