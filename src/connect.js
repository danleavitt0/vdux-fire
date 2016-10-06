/** @jsx element */

import element from 'vdux/element'
import reducer from './reducer'
import map from '@f/map-obj'

import {subscribe, unsubscribe} from './actions'

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
  for (let ref in refs) {
    yield subscribe({path, ref: refs[ref], name: ref})
  }
}

export default connect
export {
  reducer
}
