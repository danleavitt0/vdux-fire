import {component, element} from 'vdux'
import mapValues from '@f/map-values'
import map from '@f/map'
import fire from '..'

export default fire(({classRef, playlistRef, uid, classRefs}) => ({
 activity: {
   ref: `/classes/${classRef}`,
   join: {
     ref: '/playlistInstances',
     child: 'students',
     childRef: (val, ref) => {
      	return map((u, k) => ref.root
         .child('/playlistsByUser')
         .child(k)
         .child('byPlaylistRef')
         .child(playlistRef)
         .child('instanceRef')
         .once('value')
         .then(s => s.val())
         .then(iref => ref.child(iref)), val.students)

       // return Promise.all(p)
       //   .then(snaps => snaps.map(s => {console.log(s.val(), s.key); return s.val()}).filter(s => !!s))
       //   .then(instanceRefs => instanceRefs.map(iref => ref.child(iref.instanceRef)))
     }
   }
 },
 myProgress: {
    ref: `/playlistsByUser/${uid}/byPlaylistRef/${playlistRef}`,
    join: {
      ref: `/playlistInstances`,
      child: `instanceRef`,
      // childRef: (val, ref) => {
      //   return ref.child(val.instanceRef)
      // }
    }
  },
  inProgress: {
		ref: `/playlistsByUser/${uid}/inProgress#orderByChild=lastEdited`,
		join: {
			ref: '/playlistInstances',
			child: 'playlistValue',
			childRef: (val, ref) => val.map(v => ref.child(v.key))
		}
	},
  doubleJoin: {
    ref: `/classes/${classRef}`,
    join: [{
      ref: `/users`,
      child: `students`,
      childRef: (val, ref) => map((v, key) => ref.child(key), val.students),
    }, {
      ref: '/users',
      child: 'teacherID'
    }]
  }
}))(component({
	render ({props}) {
		const {activity, myProgress, inProgress} = props
		if (activity.loading) return <span/>
    console.log(props)
		return (
			<div> Hello World </div>
		)
	}
}))