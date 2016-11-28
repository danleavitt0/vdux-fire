/** @jsx element */

import element from 'vdux/element'
import reducer from './reducer'
import map from '@f/map-obj'
import equalObj from '@f/equal-obj'
import deepEqual from '@f/deep-equal'
import {subscribe, unsubscribe} from './actions'
import {mapNewState} from './reducer'

function mapState (obj) {
  return map((url, name) => ({
    name,
    url,
    loading: true,
    error: null,
    value: null
  }), obj)
}

function connect (fn) {
  return function (Ui) {
    const Component = {
      initialState ({props, state, local}) {
        return {
          ...mapState(fn(props)),
          actions: {
            update: local((props) => mapNewState(mapState(fn(props))))
          }
        }
      },

      onCreate ({props, state, local, path}) {
        return subscribeAll(path, fn(props))
      },

      onUpdate (prev, next) {
        if (!deepEqual(fn(prev.props), fn(next.props))) {
          return [
            unsubscribeAll(next.path, fn(next.props)),
            next.state.actions.update(next.props),
            subscribeAll(next.path, fn(next.props))
          ]
        }
      },

      render ({props, state, children}) {
        return (
          <Ui {...state} {...props}>
            {children}
          </Ui>
        )
      },

      reducer,

      onRemove ({path}) {
        return unsubscribe(path)
      }
    }

    return Component
  }
}

function * subscribeAll (path, refs) {
  for (let key in refs) {
    const ref = refs[key]
    typeof (ref) === 'string'
      ? yield subscribe({path, ref, name: key})
      : yield subscribe({path, ref: ref.ref, name: key, updates: ref.updates})
  }
}

function * unsubscribeAll (path, refs) {
  for (let ref in refs) {
    yield unsubscribe({path, ref: refs[ref], name: ref})
  }
}

export default connect
export {
  reducer
}
