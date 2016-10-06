import middleware from './middleware'
import connect from './connect'
import {firebaseSet, once} from './actions'

export default connect
export {
  middleware,
  firebaseSet,
  once
}
