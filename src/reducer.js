import {update} from './actions'
import createAction from '@f/create-action'

const mapNewState = createAction('MAP_NEW_STATE')

export default function (state, action) {
  switch (action.type) {
    case update.type:
      var {value, name} = action.payload
      return {
        ...state,
        [name]: {
          ...state[name],
          loading: false,
          error: null,
          value
        }
      }
    case mapNewState.type:
      var {value, name} = action.payload
      return {
        ...state,
        ...action.payload
      }
  }
  return state
}
export {
  mapNewState
}