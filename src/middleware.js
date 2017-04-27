import {toEphemeral} from 'redux-ephemeral'
import mapValues from '@f/map-values'
import isPromise from '@f/is-promise'
import firebase from 'firebase'
import reducer from './reducer'
import Switch from '@f/switch'
import map from '@f/map'

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
      [refMethod.type]: refBuilder,
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

  function refBuilder (q) {
    const {url, queryParams, type} = q
    const dbRef = db.ref(url)
    return {
      ...q,
      dbref: queryParams ? reduceParams(queryParams, dbRef) : dbRef,
      type,
    }
  }

  function onceFn (payload) {
    const {ref, listener = 'value'} = payload
    return db.ref(ref).once(listener)
  }

  function sub (payload) {
    const {ref, path} = payload
    const query = ref.ref
      ? stringToQuery(ref.ref)
      : stringToQuery(ref)
    if (!refs[query.url] || refs[query.url].length < 1) {
      refs[query.url] = [path]
    } else {
      if (refs[query.url].indexOf(path) === -1) {
        refs[query.url].push(path)
      }
    }
    if (query.url) {
      addListener({...payload, ...query, ...ref})
    }
    // addListener(payload)
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

  function addListener (payload) {
    const {url, name, dbref, type, queryParams, join} = refBuilder(payload)
    if (type === 'once') {
      return dbref.once('value')
        .then((snap) => queryParams ? orderData(snap) : snap.val())
        .then((value) => {
          return join
            ? joinResults(value, 'once')
            : value
        })
        .then(value => dispatch(invalidate({ref: url, name, value})))
        .catch(e => console.warn(e))
    }
    dbref.on('value', (snap) => {
      const value = queryParams
        ? orderData(snap)
        : snap.val()
      const p = join
        ? joinResults(value, 'on')
        : Promise.resolve(value)
      p.then(value => dispatch(invalidate({ref: url, name, value})))
      
    })

    function joinResults (value, listener) {
      if (!join.child) {
        throw new Error('join must have a child key')
      }
      return buildChildRef(value, db.ref(join.ref), join)
        .then((refs) => Promise.all(toPromise(refs, listener)))
        .then((snap) => Array.isArray(snap) ? mapValues(s => s.val(), snap) : snap.val())
        .then((populateVal) => Array.isArray(value)
          ? value.map((v, i) => ({...v, [join.child]: populateVal[i]}))
          : {...value, [join.child]: populateVal}
        )
    }
  }
}

function buildChildRef (value, ref, join) {
  if (!join.childRef) {
    return Promise.resolve(ref.child(join.child))
  }
  return typeof join.childRef === 'function'
    ? Promise.resolve(join.childRef(value, db.ref(join.ref)))
    : Promise.resolve(ref.child(join.childRef || join.child))
}

function toPromise (ref, listener) {
  const refs = typeof ref === 'object'
    ? ref
    : [ref]
  return mapValues(r => {
    return listener === 'on'
      ? new Promise((resolve, reject) => r.on('value', resolve))
      : r.once('value')
  }, refs)
}

function orderData (snap) {
  let ordered = []
  snap.forEach((child) => {
    const val = child.val()
    ordered.push({...val, key: child.key})
  })
  return ordered
}

function reduceParams (queryParams, dbRef) {
  return queryParams.map(buildQueryParams).reduce((acc, {method, value}) => {
    if (acc[method]) {
      return value ? dbRef[method](value) : dbRef[method]()
    } else if (method === 'remove') {
      return dbRef.ref.remove()
    } else {
      console.warn(`could not process method: ${method}`)
      return dbRef
    }
  }, dbRef)
}

function stringToQuery (ref) {
  if (ref.indexOf('#') === -1 && ref.indexOf('[') === -1) return {url: ref}
  const typeRe = /\[(.*?)\]/gi
  const type = typeRe.exec(ref)
  const split = ref.replace(typeRe, '').split('#')
  return {
    url: split[0],
    queryParams: split[1] && split[1].split('&'),
    type: type ? type[1] : null
  }
}

function buildQueryParams (param) {
  if (typeof param === 'object') return param
  return param.split('=').reduce((acc, next, i) => {
    const key = i === 0 ? 'method' : 'value'
    return {
      ...acc,
      [key]: isNaN(next) ? next : Number(next)
    }
  }, {})
}

export {
  mw
}
export default middleware
