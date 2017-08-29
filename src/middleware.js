import {toEphemeral} from 'redux-ephemeral'
import mapValues from '@f/map-values'
import isPromise from '@f/is-promise'
import isEmpty from 'lodash/isEmpty'
import firebase from 'firebase'
import reducer from './reducer'
import Switch from '@f/switch'
import reduce from '@f/reduce'
import Promise from 'bluebird'
import map from '@f/map'

import {
  unsubscribe,
  transaction,
  invalidate,
  subscribe,
  refMethod,
  getLast,
  update,
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
      [getLast.type]: getLastItem,
      [update.type]: updateHandler,
      [push.type]: pushHandler,
      [once.type]: onceFn,
      default: () => next(action)
    })(action.type, action.payload)
  }

  function inval (payload) {
    const {ref, value, name, page, mergeValues, orderBy, error, childKey} = payload
    const update = mergeValues ? actions.mergeArrayValue : actions.update
    return dispatch(update({ref, value, name, page, orderBy, error, childKey}))
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
    const {url, queryParams = [], type, pageSize, mergeValues} = q
    const startAt = queryParams.find(p => p.search('startAt') > -1)
    const qp = pageSize ? queryParams.concat(`limitToFirst=${startAt ? pageSize + 1 : pageSize}`) : queryParams
    const dbRef = db.ref(url)
    const bindAs = queryParams.filter(p => p.search('bindAs') > -1)[0]
    const orderBy = queryParams.filter(p => p.search(/orderBy/) > -1)

    if (orderBy.length > 1) throw new Error('vdux-fire error: only one order by method is allowed per query')

    return {
      ...q,
      type,
      join: q.ref.join,
      bindAs: buildQueryParams(bindAs).value,
      dbref: queryParams ? reduceParams(qp, dbRef) : dbRef,
      mergeValues: mergeValues || pageSize ? true : false,
      orderBy: orderBy[0]
    }
  }

  function onceFn (payload) {
    const {ref, listener = 'value'} = payload
    return db.ref(ref).once(listener)
  }

  function buildQuery (payload) {
    const {ref, path} = payload
    const query = ref.ref
      ? {...ref, ...stringToQuery(ref.ref)}
      : stringToQuery(ref)


    if (!refs[query.url] || refs[query.url].length < 1) {
      refs[query.url] = [path]
    } else {
      if (refs[query.url].indexOf(path) === -1) {
        refs[query.url].push(path)
      }
    }
    if (query.url) {
      return {...payload, ...query, ref}
    }
  }

  function sub (payload) {
    return addListener(buildQuery(payload))
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

  function getLastItem (payload) {
    const builtQuery = buildQuery(payload)
    const newPayload = {...builtQuery, pageSize: null, queryParams: (builtQuery.queryParams || []).concat('limitToLast=1')}
    const {dbref, name, orderBy, key} = refBuilder(newPayload)
    dbref.once('child_added')
      .then(snap => dispatch(actions.setLastItem({snap, name: key, orderBy})))
      .catch(console.error)
  }

  function addListener (payload) {
    const { url, name, dbref, type, join, pageSize, childKey,
      bindAs, mergeValues, orderBy, queryParams, page } = refBuilder(payload)
    const bind = queryParams && bindAs === 'object' || !queryParams
      ? 'object'
      : 'array'
    if (type === 'once') {
      return dbref.once('value')
        .then((snap) => orderData(snap, bind))
        .then((value) => {
          return join
            ? joinResults(value, 'once')
            : value
        })
        .then(dispatchResults)
        .catch(error => dispatch(invalidate({ref: url, name, error})))
    }
    if (type === 'limitData') {
      dbref.on('child_added', dispatchMerge)
      dbref.on('child_removed', (snap) => dispatch(actions.removeKey({name, key: snap.key})))
      dbref.on('child_changed', dispatchMerge)
      return
    }
    if (pageSize) {
      dbref.on('child_added', dispatchArrayMerge)
      dbref.on('child_removed', (snap) => dispatch(actions.removeKey({name, key: snap.key})))
      dbref.on('child_changed', (snap, prevSib) => dispatchArrayMerge(snap, prevSib, true))
      return 
    }
    dbref.on('value', (snap) => {
      const value = orderData(snap, bind)
      const arrJoin = [].concat(join)
      const p = maybeJoin(value, arrJoin)
      p.then(dispatchResults)
    }, (error) => dispatch(invalidate({ref: url, name, error})))

    function maybeJoin (value, arrJoin) {
      return join
        ? Promise.all(mapValues((j) => joinResults(value, j, 'on'), arrJoin))
            .then(vals => Array.isArray(join)
              ? vals.reduce((acc, val, key) => ({
                ...acc,
                [arrJoin[key].child]: val[arrJoin[key].child]
              }), value)
              : vals[0]
            )
        : Promise.resolve(value)
    }

    function joinResults (value, join, listener) {
      if (!join.child) {
        throw new Error('join must have a child key')
      }
      if (isEmpty(value)) return Promise.resolve(value)
      return buildChildRef(value, db.ref(join.ref), join)
        .then((refs) => gatherPromises(refs, listener))
        .then(populateVal => Array.isArray(value)
          ? value.map((v, i) => ({...v, [join.child]: populateVal[i]}))
          : {...value, [join.child]: populateVal}
        )
        .catch(error => dispatch(invalidate({ref: url, name, error})))
    }

    function dispatchArrayMerge (snap, prevSib) {
      const value = snap.val()
      dispatch(actions.mergeArrayValue({name, value, key: snap.key, prevSib, orderBy}))
    }

    function dispatchMerge (snap) {
      dispatch(actions.mergeValue({name, value: snap.val(), key: snap.key}))
    }

    function dispatchResults (value) {
      dispatch(invalidate({ref: url, name, value, mergeValues, page, childKey}))
      if (pageSize) {
        const cursor = orderByToKey(orderBy, value[value.length - 1])
        pageSize && dispatch(actions.setCursor(cursor(orderBy.split('=')[1])))
      }
    }
  }
}

function gatherPromises (refs, listener) {
  const promises = toPromise(refs, listener)
  if (Array.isArray(refs)) {
    return Promise.all(promises)
  } else if (typeof refs === 'object' && !refs.database) {
    return Promise.props(promises)
  }
  return Promise.resolve(promises)
}

function buildChildRef (value, ref, join) {
  if (!join.childRef) {
    if (Array.isArray(value)) {
      return Promise.resolve(value.map(v => ref.child(v[join.child])))
    }
    return Promise.resolve(ref.child(value[join.child]))
  }
  if (typeof join.childRef === 'function') {
    const res = join.childRef(value, db.ref(join.ref))
    return typeof res === 'object' && !res.database && !Array.isArray(res)
      ? Promise.props(map((val, key) => val.then(v => v).catch(() => {}), promisify(res)))
      : Promise.resolve(res)
    // return typeof res === 'object' ? Promise.props(res) : Promise.resolve(res)
  } else {
    return Promise.resolve(ref.child(value[join.childRef || join.child]))
  }
}

function promisify (data) {
  return map(val => isPromise(val) ? val : Promise.resolve(val), data)
}



function toPromise (ref, listener) {
  if (Array.isArray(ref)) {
    return mapValues(r => getPromise(r).then(s => ({...s.val(), key: s.key})), ref)
  } else if (typeof ref === 'object' && !ref.database) {
    return map((val, key) => val ? getPromise(val).then(s => ({...s.val(), key: s.key})) : val, ref)
  } else {
    return getPromise(ref).then(s => Array.isArray(s.val()) ? s.val() : ({...s.val(), key: s.key}))
  }
  function getPromise (r) {
    return listener === 'on'
      ? new Promise((resolve, reject) => r.on('value', resolve))
      : r.once('value')
  }
}

function orderData (snap, bindAs) {
  if (bindAs === 'object') return snap.val()
  const ordered = []
  snap.forEach((child) => {
    const val = child.val()
    if (child.hasChildren()) {
      ordered.push({...val, key: child.key})
    } else {
      ordered.push({val, key: child.key})
    }
  })
  return ordered.length === 0 ? snap.val() : ordered
}

function reduceParams (queryParams = [], dbRef) {
  return queryParams.map(buildQueryParams).filter(p => p.method !== 'bindAs')
    .reduce((acc, {method, value}) => {
      if (acc[method]) {
        return value ? acc[method](value) : acc[method]()
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
  if (typeof ref === 'object') return ref
  const typeRe = /\[(.*?)\]/gi
  const type = typeRe.exec(ref)
  const split = ref.replace(typeRe, '').split('#')
  return {
    queryParams: split[1] && split[1].split('&'),
    type: type ? type[1] : null,
    url: split[0]
  }
}

function buildQueryParams (param) {
  if (typeof param === 'undefined') return {}
  if (typeof param === 'object') return param
  return param.split('=').reduce((acc, next, i) => {
    const key = i === 0 ? 'method' : 'value'
    return {
      ...acc,
      [key]: isNaN(next) ? next : Number(next)
    }
  }, {})
}

function orderByToKey (sort, val) {
  const orders = {
    'orderByKey': () => val.key,
    'orderByValue': () => val.value,
    'orderByChild': child => val[child] 
  }
  return orders[sort]
}

export {
  mw
}
export default middleware
