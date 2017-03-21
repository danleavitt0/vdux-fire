import firebase from 'firebase'
import map from '@f/map'
import reducer from './reducer'
import Switch from '@f/switch'
import {toEphemeral} from 'redux-ephemeral'

import {
  subscribe,
  unsubscribe,
  invalidate,
  update,
  refMethod,
  transaction,
  push,
  once,
  set
} from './actions'

let refs = []
let db

const middleware = (config) => {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(config)
  }
  db = firebase.database()
  return mw
}

function mw ({dispatch, getState, actions}) {
  return (next) => (action) => {
    return Switch({
      [subscribe.type]: sub,
      [unsubscribe.type]: unsub,
      [invalidate.type]: inval,
      [refMethod.type]: refMethodHandler,
      [transaction.type]: transactionHandler,
      [set.type]: setValue,
      [update.type]: updateHandler,
      [push.type]: pushHandler,
      [once.type]: onceFn,
      default: () => next(action)
    })(action.type, action.payload)
  }

  function inval (payload) {
    const {ref, value, name} = payload
    console.log(actions)
    return map((path) => dispatch(
      toEphemeral(
        path,
        reducer,
        actions.update({ref, value, name})
      )),
      refs[ref]
    )
  }

  function pushHandler (payload) {
    const {ref, value} = payload
    return db.ref(ref).push(value)
  }

  function setValue (payload) {
    const {ref, value} = payload
    return db.ref(ref).set(value)
  }

  function updateHandler (payload) {
    const {ref, value} = payload
    return db.ref(ref).update(value)
  }

  function transactionHandler (payload) {
    const {ref, value} = payload
    return db.ref(ref).transaction(value)
  }

  function refMethodHandler (payload) {
    const {ref, updates} = payload
    const dbRef = typeof ref === 'string' ? db.ref(ref) : ref
    if (Array.isArray(updates)) {
      return updates.reduce((prev, update) => refMethodHandler({ref: prev || dbRef, updates: update}), undefined)
    }
    const {method, value} = updates
    if (dbRef[method]) {
      return value ? dbRef[method](value) : dbRef[method]()
    } else if (method === 'remove') {
      return dbRef.ref.remove()
    } else {
      throw new Error('Not a valid firebase method')
    }
  }

  function onceFn (payload) {
    const {ref, listener = 'value'} = payload
    return db.ref(ref).once(listener)
  }

  function sub (payload) {
    const {ref, path, type} = payload
    if (!refs[ref] || refs[ref].length < 1) {
      refs[ref] = [path]
    } else {
      if (refs[ref].indexOf(path) === -1) {
        refs[ref].push(path)
      }
    }
    addListener(payload)
  }

  function unsub ({ref, path}) {
    for (var key in refs) {
      const idx = refs[key].indexOf(path)
      if (idx !== -1) {
        refs[key].splice(idx, 1)
        // if (refs[key].length < 1) {
        //   removeListener(key)
        // }
      }
    }
  }

  // function removeListener (ref) {
  //   var dbref = db.ref(ref)
  //   dbref.off('value')
  // }

  function addListener ({ref, name, updates, type}) {
    var dbref = updates ? refMethodHandler({ref, updates}) : db.ref(ref)
    if (type === 'once') {
      return dbref.once('value', function (snap) {
        const value = updates
          ? orderData(snap)
          : snap.val()
        dispatch(invalidate({ref, name, value}))
      })
    }
    dbref.on('value', (snap) => {
      const value = updates
        ? orderData(snap)
        : snap.val()
      dispatch(invalidate({ref, name, value}))
    })
  }
}



function orderData (snap) {
  let ordered = []
  snap.forEach((child) => {
    const val = child.val()
    ordered.push({...val, key: child.key})
  })
  return ordered
}

export {
  mw
}
export default middleware
