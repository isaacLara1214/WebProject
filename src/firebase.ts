import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyB_4VI2nriwaOMwMyfKnlY5CnHjpiYKpD8',
  authDomain: 'finalwebproject-b9a79.firebaseapp.com',
  projectId: 'finalwebproject-b9a79',
  storageBucket: 'finalwebproject-b9a79.firebasestorage.app',
  messagingSenderId: '435264413372',
  appId: '1:435264413372:web:59c33ba546121ca1147ab9',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
