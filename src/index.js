import middleware from './middleware'
import connect from './connect'
import * as actions from './actions'

const set = (ref, payload) => actions.set({ref, value: payload})
const transaction = (ref, payload) => actions.transaction({ref, value: payload})
const update = (ref, payload) => actions.update({ref, value: payload})
const push = (ref, payload) => actions.push({ref, value: payload})
const refMethod = actions.refMethod
const once = (ref, listener) => actions.once({ref, listener})

export default connect
export {
  transaction,
  middleware,
  refMethod,
  update,
  push,
  once,
  set,
}