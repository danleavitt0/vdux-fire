import firebase from 'firebase'
import map from '@f/map'
import reducer from './reducer'
import Switch from '@f/switch'
import {toEphemeral} from 'redux-ephemeral'

import {subscribe, unsubscribe, invalidate, update, refMethod, once} from './actions'

let refs = []
let db

const middleware = (config) => { 
  firebase.initializeApp(config)
  db = firebase.database()
  return ({dispatch, getState}) => {
    return (next) => (action) => {
      return Switch({
        [subscribe.type]: sub,
        [unsubscribe.type]: unsub,
        [invalidate.type]: inval,
        [refMethod.type]: set,
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
      const {ref, updates} = payload
      const dbRef = typeof ref === 'string' ? db.ref(ref) : ref
      if (Array.isArray(updates)) {
        return updates.reduce((prev, update) => set({ref: prev || dbRef, updates: update}), undefined)
      }

      const {method, value} = updates
      if (dbRef[method]) {
        return value ? dbRef[method](value) : dbRef[method]()
      } else {
        throw new Error('Not a valid firebase method')
      }
    }

    function onceFn (payload) {
      const {ref, listener = 'value'} = payload
      return db.ref(ref).once(listener)
    }

    function sub (payload) {
      const {ref, path, name, updates} = payload
      if (!refs[ref] || refs[ref].length < 1) {
        refs[ref] = [path]
        addListener(ref, name, updates)
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

    function addListener (ref, name, updates) {
      var dbref = updates ? set({ref, updates}) : db.ref(ref)
      dbref.on('value', (snap) => dispatch(invalidate({ref, name, value: snap.val()})))
    }
  }
}

export default middleware
