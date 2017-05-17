var firebase = require('firebase')

const config = {
  apiKey: 'AIzaSyAQ7YJxZruXp5RhMetYq1idFJ8-y0svN-s',
  authDomain: 'artbot-dev.firebaseapp.com',
  databaseURL: 'https://artbot-dev.firebaseio.com',
  storageBucket: 'artbot-dev.appspot.com',
  messagingSenderId: '1001646388415'
}

firebase.initializeApp(config)

// const firebase = require('firebase')

// var config = {
//   apiKey: "AIzaSyAQ7YJxZruXp5RhMetYq1idFJ8-y0svN-s",
//   authDomain: "artbot-dev.firebaseapp.com",
//   databaseURL: "https://artbot-dev.firebaseio.com",
//   projectId: "artbot-dev",
//   storageBucket: "artbot-dev.appspot.com",
//   messagingSenderId: "1001646388415"
// }
// firebase.initializeApp(config)

bindRef(firebase.database().ref('/usernames/danleavitt0'))

let i = 0

function bindRef (ref) {
  let list = []
  ref.on('child_added', (snap) => {
    list.push(snap.val())
    console.log(snap.key, snap.val(), ++i, '\n\n')
  })
  ref.on('value', (snap) => {
    console.log('value', snap.val())
  })
}


// firebase.database().ref('/users/OomwNVi8vScVtr3h5dD7CHFkEj62/playlists')
//   .orderByChild('dateAdded')
//   .startAt(-1481756450868)
//   .limitToFirst(2)
//   .on('value', (snap) => {
//     const results = orderData(snap)
//     console.log(results)
//   })

// function orderData (snap) {
//   let ordered = []
//   snap.forEach((child) => {
//     const val = child.val()
//     val.key = child.key
//     ordered.push(val)
//   })
//   return ordered
// }

//
// export default fire((props) => ({
//   challenges: {
//     ref: '/challenges',
//     size: 30,
//     sort: (ref) => ref.orderByChild('dateAdded')
//   }
// }))({
//   render
// })
