/** @jsx element */

import {component, element} from 'vdux'
import {mw} from './middleware'
import reducer from './reducer'
import map from '@f/map-obj'
import deepEqual from '@f/deep-equal'
import {subscribe, unsubscribe} from './actions'
import filter from '@f/filter'
import mapValues from '@f/map-values'

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
        // console.log(prev.props, next.props)
        if (!deepEqual(prev.props, next.props)) {
          const prevProps = fn(prev.props)
          const nextProps = fn(next.props)
          const newProps = filter((prop, key) => !prevProps[key] || prevProps[key] !== prop, nextProps)
          const removeProps = filter((prop, key) => !nextProps[key] || nextProps[key] !== prop, prevProps)
          if (removeProps) {
            yield unsubscribeAll(next.path, removeProps)
          }
          if (newProps) {
            const mapped = mapState(newProps)
            yield mapValues(prop => next.actions.update(prop), mapped)
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
                    ref,
                    path,
                    name: key
                  })
              }
          }
        }
      },

      reducer: {
        update: (state, {value, name, size, sort, url}) => ({
          [name]: {
            ...state[name],
            name,
            url,
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
