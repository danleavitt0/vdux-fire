import firebase from 'firebase'
import createAction from '@f/create-action'
import map from '@f/map'
import reducer from './reducer'
import Switch from '@f/switch'
import {toEphemeral} from 'redux-ephemeral'

import {subscribe, unsubscribe, invalidate, update, firebaseSet, once} from './actions'

let refs = []
let db

const middleware = (config) => ({dispatch, getState}) => {
  firebase.initializeApp(config)
  db = firebase.database()

  return (next) => (action) => {
    return Switch({
      [subscribe.type]: sub,
      [unsubscribe.type]: unsub,
      [invalidate.type]: inval,
      [firebaseSet.type]: set,
      [once.type]: onceFn,
      default: () => next(action)
    })(action.type, action.payload)
  }

  function inval (payload) {
    const {ref, value, name} = payload
    return map((path) => dispatch(
			toEphemeral(
				path,
				reducer,
				update({ref, value, name})
			)),
			refs[ref]
		)
  }
  function set (payload) {
    const {ref, value, method = 'set'} = payload
    if (db.ref(ref)[method]) {
      return db.ref(ref)[method](value).key
    } else {
      throw new Error('No a valid firebase method')
    }
  }

  function onceFn (payload) {
    const {ref, listener = 'value'} = payload
    return db.ref(ref).once(listener)
  }

  function sub (payload) {
    const {ref, path, name} = payload
    if (!refs[ref] || refs[ref].length < 1) {
      refs[ref] = [path]
      addListener(ref, name)
    } else {
      if (refs[ref].indexOf(path) === -1) {
        refs[ref].push(path)
      }
    }
  }

  function unsub (path) {
    for (var ref in refs) {
      const idx = refs[ref].indexOf(path)
      if (idx !== -1) {
        refs[ref].splice(idx, 1)
        if (refs[ref].length < 1) {
          removeListener(ref)
        }
      }
    }
  }

  function removeListener (ref) {
    var dbref = db.ref(ref)
    dbref.off('value')
  }

  function addListener (ref, name) {
    var dbref = db.ref(ref)
    dbref.on('value', (snap) => dispatch(invalidate({ref, name, value: snap.val()})))
  }
}

export default middleware
