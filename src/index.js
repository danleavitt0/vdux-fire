import middleware from './middleware'
import connect from './connect'
import * as actions from './actions'

const set = (ref, payload) => actions.set({ref, value: payload})
const transaction = (ref, payload) => actions.transaction({ref, value: payload})
const refMethod = actions.refMethod
const once = actions.once

export default connect
export {
  transaction,
  middleware,
  refMethod,
  once,
  set,
}
