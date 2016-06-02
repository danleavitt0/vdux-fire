import element from 'vdux/element'
import firebase from 'firebase'
import createAction from '@f/create-action'
import handleActions from '@f/handle-actions'
import reducer from './reducer'
import map from '@f/map-obj'

import {subscribe, unsubscribe, invalidate, update} from './actions'

function connect (fn) {
  return function (Ui) {
    const Component = {
      initialState ({props, state}) {
        return map((url, name) => ({
          name,
          url,
          loading: true,
          error: null,
          value: null
        }), fn(props))
      },

      onCreate ({props, state, local, path}) {
        return subscribeAll(path, fn(props))
      },

      render ({props, state, children, local, path}) {
        const mapping = fn(props)
        const fns = {}

        return (
          <Ui {...state} {...fns} {...props}>
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

function *subscribeAll (path, refs) {
  for (let ref in refs) {
    yield subscribe({path, ref: refs[ref], name: ref})
  }
}

export default connect
export {
  reducer
}
