import {update} from './actions'

export default function (state, action) {
  switch (action.type) {
    case update.type:
      let {value, name} = action.payload
      return {
        ...state,
        [name]: {
          ...state[name],
          loading: false,
          error: null,
          value
        }
      }
  }
  return state
}
