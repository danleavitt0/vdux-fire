/** @jsx element */

import {subscribe, unsubscribe} from './actions'
import deepEqual from '@f/deep-equal'
import {mapNewState} from './reducer'
import element from 'vdux/element'
import reducer from './reducer'
import filter from '@f/filter'
import map from '@f/map-obj'
import omit from '@f/omit'

function mapState (obj) {
  return map((url, name) => ({
    name,
    url,
    loading: true,
    error: null,
    value: null
  }), obj)
}

function * addSubscribe (obj) {
  yield mapNewState(obj)
  yield subscribeAll(obj)
}

function connect (fn) {
  return function (Ui) {
    const Component = {
      initialState ({props, state, local, path}) {
        return {
          ...mapState(fn(props)),
          actions: {
            update: function * (newProp) {
              const obj = mapState(newProp)
              yield local(() => mapNewState(obj))
              yield subscribeAll(obj)
            }
          }
        }
      },

      onCreate ({props, state, local, path}) {
        return subscribeAll(path, fn(props))
      },

      * onUpdate (prev, next) {
        // console.log(prev.state, next.state)
        if (!deepEqual(fn(prev.props), fn(next.props))) {
          const prevProps = fn(prev.props)
          const nextProps = fn(next.props)
          const newProps = filter((prop, key) => !prevProps[key] || prevProps[key] !== prop, nextProps)
          const removeProps = filter((prop, key) => !nextProps[key] || nextProps[key] !== prop, prevProps)
          if (removeProps) {
            yield unsubscribeAll(next.path, removeProps)
          }
          if (newProps) {
            // yield next.state.actions.update(newProps)
            yield subscribeAll(next.path, newProps)
          }
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
        return unsubscribe({path})
      }
    }

    return Component
  }
}

function * subscribeAll (path, refs) {
  for (let key in refs) {
    const ref = refs[key]
    if (ref) {
      typeof (ref) === 'string'
        ? yield subscribe({path, ref, name: key})
        : yield subscribe({
          path,
          ref: ref.ref,
          name: key,
          type: ref.type,
          updates: ref.updates,
          size: ref.size,
          sort: ref.sort
        })
    }
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
