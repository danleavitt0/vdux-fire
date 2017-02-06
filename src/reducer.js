import {update} from './actions'
import createAction from '@f/create-action'

const mapNewState = createAction('MAP_NEW_STATE')
const mergeValue = createAction('MERGE_VALUE')

export default function (state, action) {
  switch (action.type) {
    case update.type:
      var {value, name, size, sort} = action.payload
      return {
        ...state,
        [name]: {
          ...state[name],
          name,
          loading: false,
          error: null,
          value,
          size,
          sort
        }
      }
    case mapNewState.type:
      return {
        ...state,
        ...action.payload
      }
    case mergeValue.type:
      var {name, value} = action.payload
      return {
        ...state,
        [name]: {
          ...state[name],
          value: {...state[name.value], ...value}
        }
      }
  }
  return state
}
export {
  mapNewState
}
