import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDxQ_wfnt43fOx_Xp2uWWPftpySs2JRzVo",
  authDomain: "control-meat.firebaseapp.com",
  projectId: "control-meat",
  storageBucket: "control-meat.firebasestorage.app",
  messagingSenderId: "604670453387",
  appId: "1:604670453387:web:921e97a1a89c7a2d82568e"
}

// Инициализация Firebase
const app = initializeApp(firebaseConfig)

// Аутентификация
export const auth = getAuth(app)
