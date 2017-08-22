/**
 * Imports
 */

import {
  middleware as firebaseMw,
  set as firebaseSet,
  update as firebaseUpdate,
  once as firebaseOnce,
  push as firebasePush,
  transaction
} from '..'
import {component, element} from 'vdux'
import App from './App'
import map from '@f/map'

/**
 * Constants
 */

const classes = [
  '-KqVQxFjnKZkq9krvKTl',
  '-KqVSs8SeJdW5UiDzYKx',
  '-KqVTodanAnufQS2TseH',
  '-KqVUhnwTrmcQk_DguOE',
  '-KqVZu27_KqRwec1hIPO',
  '-KqZLr-0801Qwql8Xcbw',
  '-KqZUemnM6RTvu10W4X6'
 ]

const schools = [
  '-Ks5Rx7qPFrRoih0rHJH',
  '-Ks5S4pkSqozmPsnmg-n',
  '-Ks5S8YJER3kstWO10_k',
  '-Ks5SPPCS471yZUBrtiQ',
  '-Ks5dEE7c9snbnla5-fq',
  '-Ks63ksRbBTwGchN3hS5'
]

const apiServer = process.env.API_SERVER
const firebaseConfig = {
	"apiKey": "AIzaSyAQ7YJxZruXp5RhMetYq1idFJ8-y0svN-s",
	"authDomain":"artbot-dev.firebaseapp.com",
	"databaseURL":"https://artbot-dev.firebaseio.com",
	"storageBucket":"artbot-dev.appspot.com",
	"messagingSenderId":"1001646388415"
}

/**
 * <Boot/>
 */

export default component({

  initialState ({props}) {
    if (props.req) {
      return {
        currentUrl: props.req.url
      }
    }

    return {}
  },

  getContext ({props, state, actions}) {
    const {media, currentUrl, avatarUpdates} = state
    const userAgent = props.req
      ? props.req.headers['user-agent']
      : window.navigator.userAgent

    return {
      ...actions
    }
  },

  render ({props, state}) {
    return <App
      classRefs={classes}
      schoolRefs={schools}
      uid='A7rojVypFFNCYQb2A22wM189HWL2'
      classRef='-KrYhjpc_dLMXJ8-tMId'
      playlistRef='-Ke7eny8WMLluXLz3Ii5'
      {...state}
      {...props} />
  },

  onUpdate (prev, next) {
    if (prev.state.title !== next.state.title && typeof document !== 'undefined') {
      document.title = next.state.title
    }
  },

  middleware: [firebaseMw(firebaseConfig)],

  controller: {
    firebaseSet: wrapEffect(firebaseSet),
    firebaseUpdate: wrapEffect(firebaseUpdate),
    firebaseOnce: wrapEffect(firebaseOnce),
    firebaseTransaction: wrapEffect(transaction),
    firebasePush: wrapEffect(firebasePush)
  },

  reducer: {
    updateAvatar: state => ({
      avatarUpdates: (state.avatarUpdates || 0) + 1
    }),
    updateMedia: (state, {key, matches}) => ({
      media: state.media === key
        ? matches ? key : null
        : matches ? key : state.media
    }),
    updateUrl: (state, currentUrl) => ({
      currentUrl,
      modal: state.currentUrl === currentUrl ? state.modal : null
    }),
    openModal: (state, modal) => ({
      // Dont allow modal opening on the server, because it causes
      // issues with server-side rendering
      modal: typeof window === 'undefined' ? null : modal
    }),
    closeModal: () => ({modal: null}),
    showToast: (state, toast) => ({toast}),
    hideToast: () => ({toast: null}),
    setTitle: (state, title) => ({title}),
    setUserId: (state, userId) => ({userId}),
    setUsername: (state, username) => ({username})
  }
})

/**
 * Helpers
 */

function wrapEffect (fn) {
  return (model, ...args) => fn(...args)
}
