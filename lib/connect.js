'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reducer = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _vdux = require('vdux');

var _middleware = require('./middleware');

var _middleware2 = _interopRequireDefault(_middleware);

var _reducer = require('./reducer');

var _reducer2 = _interopRequireDefault(_reducer);

var _mapObj = require('@f/map-obj');

var _mapObj2 = _interopRequireDefault(_mapObj);

var _omit = require('@f/omit');

var _omit2 = _interopRequireDefault(_omit);

var _deepEqual = require('@f/deep-equal');

var _deepEqual2 = _interopRequireDefault(_deepEqual);

var _actions = require('./actions');

var _filter = require('@f/filter');

var _filter2 = _interopRequireDefault(_filter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [unsubscribeAll].map(_regenerator2.default.mark); /** @jsx element */

function mapState(obj) {
  return (0, _mapObj2.default)(function (url, name) {
    return {
      name: name,
      url: url,
      loading: true,
      error: null,
      value: null
    };
  }, obj);
}

function connect(fn) {
  return function (Ui) {
    var Component = (0, _vdux.component)({
      initialState: function initialState(_ref) {
        var props = _ref.props,
            state = _ref.state,
            local = _ref.local;

        return mapState(fn(props));
      },
      onCreate: _regenerator2.default.mark(function onCreate(_ref2) {
        var props = _ref2.props,
            state = _ref2.state,
            path = _ref2.path,
            actions = _ref2.actions;
        return _regenerator2.default.wrap(function onCreate$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return actions.subscribeAll(path, fn(props));

              case 2:
              case 'end':
                return _context.stop();
            }
          }
        }, onCreate, this);
      }),
      onUpdate: _regenerator2.default.mark(function onUpdate(prev, next) {
        var _this = this;

        return _regenerator2.default.wrap(function onUpdate$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if ((0, _deepEqual2.default)(prev.props, next.props)) {
                  _context3.next = 2;
                  break;
                }

                return _context3.delegateYield(_regenerator2.default.mark(function _callee() {
                  var prevProps, nextProps, newProps, removeProps;
                  return _regenerator2.default.wrap(function _callee$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          prevProps = fn(prev.props);
                          nextProps = fn(next.props);
                          newProps = (0, _filter2.default)(function (prop, key) {
                            return !prevProps[key] || prevProps[key] !== prop;
                          }, nextProps);
                          removeProps = (0, _filter2.default)(function (prop, key) {
                            return !nextProps[key] || nextProps[key] !== prop;
                          }, prevProps);

                          if (!removeProps) {
                            _context2.next = 7;
                            break;
                          }

                          _context2.next = 7;
                          return unsubscribeAll(next.path, removeProps);

                        case 7:
                          if (!newProps) {
                            _context2.next = 12;
                            break;
                          }

                          _context2.next = 10;
                          return next.actions.update(mapState(newProps));

                        case 10:
                          _context2.next = 12;
                          return next.actions.subscribeAll(next.path, newProps);

                        case 12:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _callee, _this);
                })(), 't0', 2);

              case 2:
              case 'end':
                return _context3.stop();
            }
          }
        }, onUpdate, this);
      }),
      render: function render(_ref3) {
        var props = _ref3.props,
            state = _ref3.state,
            children = _ref3.children;

        return (0, _vdux.element)(
          Ui,
          (0, _extends4.default)({}, props, state),
          children
        );
      },


      controller: {
        subscribeAll: _regenerator2.default.mark(function subscribeAll(_ref4, path, refs) {
          var actions = _ref4.actions;
          var key, ref;
          return _regenerator2.default.wrap(function subscribeAll$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.t0 = _regenerator2.default.keys(refs);

                case 1:
                  if ((_context4.t1 = _context4.t0()).done) {
                    _context4.next = 14;
                    break;
                  }

                  key = _context4.t1.value;
                  ref = refs[key];

                  if (!ref) {
                    _context4.next = 12;
                    break;
                  }

                  if (!(typeof ref === 'string')) {
                    _context4.next = 10;
                    break;
                  }

                  _context4.next = 8;
                  return (0, _actions.subscribe)({ path: path, ref: ref, name: key });

                case 8:
                  _context4.next = 12;
                  break;

                case 10:
                  _context4.next = 12;
                  return (0, _actions.subscribe)({
                    path: path,
                    ref: ref.ref,
                    name: key,
                    type: ref.type,
                    updates: ref.updates,
                    size: ref.size,
                    sort: ref.sort,
                    join: ref.join
                  });

                case 12:
                  _context4.next = 1;
                  break;

                case 14:
                case 'end':
                  return _context4.stop();
              }
            }
          }, subscribeAll, this);
        })
      },

      reducer: {
        update: function update(state, _ref5) {
          var value = _ref5.value,
              name = _ref5.name,
              size = _ref5.size,
              sort = _ref5.sort;
          return (0, _defineProperty3.default)({}, name, (0, _extends4.default)({}, state[name], {
            name: name,
            loading: false,
            error: null,
            value: value,
            size: size,
            sort: sort
          }));
        },
        mapNewState: function mapNewState(state, payload) {
          return (0, _extends4.default)({}, state, payload);
        },
        mergeValue: function mergeValue(state, _ref7) {
          var name = _ref7.name,
              value = _ref7.value;
          return (0, _extends4.default)({}, state, (0, _defineProperty3.default)({}, name, (0, _extends4.default)({}, state[name], {
            value: (0, _extends4.default)({}, state[name.value], value)
          })));
        }
      },

      middleware: [_middleware.mw],

      onRemove: function onRemove(_ref8) {
        var path = _ref8.path;

        return (0, _actions.unsubscribe)({ path: path });
      }
    });

    return Component;
  };
}

function unsubscribeAll(path, refs) {
  var ref;
  return _regenerator2.default.wrap(function unsubscribeAll$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.t0 = _regenerator2.default.keys(refs);

        case 1:
          if ((_context5.t1 = _context5.t0()).done) {
            _context5.next = 7;
            break;
          }

          ref = _context5.t1.value;
          _context5.next = 5;
          return (0, _actions.unsubscribe)({ path: path, ref: refs[ref], name: ref });

        case 5:
          _context5.next = 1;
          break;

        case 7:
        case 'end':
          return _context5.stop();
      }
    }
  }, _marked[0], this);
}

exports.default = connect;
exports.reducer = _reducer2.default;