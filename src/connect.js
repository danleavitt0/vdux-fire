/** @jsx element */

import {component, element} from 'vdux'
import middleware, {mw} from './middleware'
import reducer from './reducer'
import map from '@f/map-obj'
import omit from '@f/omit'
import deepEqual from '@f/deep-equal'
import {subscribe, unsubscribe} from './actions'
import {mapNewState} from './reducer'
import filter from '@f/filter'

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
    const Component = component({
      initialState ({props, state, local}) {
        return mapState(fn(props))
      },

      * onCreate ({props, state, path, actions}) {
        yield actions.subscribeAll(path, fn(props))
      },

      * onUpdate (prev, next) {
        if (!deepEqual(prev.props, next.props)) {
          const prevProps = fn(prev.props)
          const nextProps = fn(next.props)
          const newProps = filter((prop, key) => !prevProps[key] || prevProps[key] !== prop, nextProps)
          const removeProps = filter((prop, key) => !nextProps[key] || nextProps[key] !== prop, prevProps)
          if (removeProps) {
            yield unsubscribeAll(next.path, removeProps)
          }
          if (newProps) {
            yield next.actions.update(mapState(newProps))
            yield next.actions.subscribeAll(next.path, newProps)
          }
        }
      },

      render ({props, state, children}) {
        return (
          <Ui {...props} {...state}>
            {children}
          </Ui>
        )
      },

      controller: {
        * subscribeAll ({actions}, path, refs) {
          for (let key in refs) {
            const ref = refs[key]
            if (ref) {
              typeof (ref) === 'string'
                ? yield subscribe({path, ref, name: key})
                : yield subscribe({
                    ...ref
                    path,
                    ref: ref.ref
                  })
              }
          }
        }
      },

      reducer: {
        update: (state, {value, name, size, sort}) => ({
          [name]: {
            ...state[name],
            name,
            loading: false,
            error: null,
            value,
            size,
            sort
          } 
        }),
        mapNewState: (state, payload) => ({
          ...state,
          ...payload
        }),
        mergeValue: (state, {name, value}) => ({
          ...state,
          [name]: {
            ...state[name],
            value: {...state[name.value], ...value}
          }
        })
      },

      middleware: [
        mw
      ],

      onRemove ({path}) {
        return unsubscribe({path})
      }
    })

    return Component
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
