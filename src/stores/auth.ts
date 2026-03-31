import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import type { User, UserRole } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const authReady = ref(false)

  // Keep Firestore profile in sync with Firebase Auth state
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (snap.exists()) {
        currentUser.value = { id: firebaseUser.uid, ...(snap.data() as Omit<User, 'id'>) }
      }
    } else {
      currentUser.value = null
    }
    authReady.value = true
  })

  async function login(email: string, password: string): Promise<boolean> {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch {
      return false
    }
  }

  async function register(name: string, email: string, password: string, role: UserRole): Promise<boolean> {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      const profile = { name, email, role }
      await setDoc(doc(db, 'users', user.uid), profile)
      currentUser.value = { id: user.uid, ...profile }
      return true
    } catch {
      return false
    }
  }

  async function logout() {
    await signOut(auth)
  }

  return { currentUser: computed(() => currentUser.value), authReady, login, register, logout }
})
