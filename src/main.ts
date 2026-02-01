import { db } from './firebase'
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  getDocs
} from 'firebase/firestore'
import { auth } from './firebase'
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth'
import './style.css'

// ================== AUTH MODAL ==================
const modal = document.querySelector('#modal_window') as HTMLDivElement
const loginInput = document.querySelector('#loginInput') as HTMLInputElement
const passwordInput = document.querySelector('#passwordInput') as HTMLInputElement
const loginBtn = document.querySelector('#loginBtn') as HTMLInputElement
const errorMsg = document.querySelector('#errorMsg') as HTMLParagraphElement

document.body.style.overflow = 'hidden'

async function checkLogin() {
  try {
    await signInWithEmailAndPassword(
      auth,
      loginInput.value.trim(),
      passwordInput.value.trim()
    )
    errorMsg.textContent = ''
  } catch {
    errorMsg.textContent = 'Неверный логин или пароль'
    passwordInput.value = ''
  }
}

loginBtn.addEventListener('click', checkLogin)
modal.addEventListener('keydown', e => e.key === 'Enter' && checkLogin())

// ================== UI ELEMENTS ==================
const addBtn = document.querySelector('#addBtn') as HTMLInputElement
const saleBtn = document.querySelector('#saleBtn') as HTMLInputElement
const revisionBtn = document.querySelector('#revisionBtn') as HTMLInputElement

const addValue = document.querySelector('#addValue') as HTMLInputElement
const saleValue = document.querySelector('#saleValue') as HTMLInputElement
const revisionValue = document.querySelector('#revisionValue') as HTMLInputElement

const balance = document.querySelector('#balance') as HTMLDivElement
const summaryDiv = document.querySelector('#summary') as HTMLDivElement

let addDataValue = ''
let saleDataValue = ''
let revisionDataValue = ''
let dataLoss = 0

// ================== SELECTORS ==================
function setupSelect(id: string, mode: 'add' | 'sale' | 'revision') {
  const container = document.querySelector(id) as HTMLElement
  const selected = container.querySelector('.selected') as HTMLSpanElement
  const options = container.querySelectorAll('li')

  options.forEach(li => {
    li.addEventListener('click', () => {
      selected.textContent = li.textContent
      const value = String(li.dataset.value)
      const loss = Number(li.dataset.loss || 0)

      if (mode === 'add') {
        addDataValue = value
        dataLoss = loss
      }
      if (mode === 'sale') saleDataValue = value
      if (mode === 'revision') revisionDataValue = value

      ;(li.closest('.select_option') as HTMLElement).style.display = 'none'
    })
  })
}

setupSelect('#addMeat', 'add')
setupSelect('#saleMeat', 'sale')
setupSelect('#revisionMeat', 'revision')

// ================== HELPERS ==================
function findRow(value: string) {
  const nameDiv = balance.querySelector(`div[data-value="${value}"]`) as HTMLDivElement
  if (!nameDiv) return null
  const weightDiv = nameDiv.nextElementSibling as HTMLDivElement
  const priceDiv = weightDiv.nextElementSibling as HTMLDivElement
  const sumDiv = priceDiv.nextElementSibling as HTMLDivElement
  return { weightDiv, priceDiv, sumDiv }
}

function updateSums() {
  let total = 0
  balance.querySelectorAll('div[data-value]').forEach(nameDiv => {
    const w = nameDiv.nextElementSibling as HTMLDivElement
    const p = w.nextElementSibling as HTMLDivElement
    const s = p.nextElementSibling as HTMLDivElement
    const sum = Number(w.textContent) * Number(p.textContent)
    s.textContent = sum.toFixed(2)
    total += sum
  })
  summaryDiv.textContent = `Итоговая сумма: ${total.toFixed(2)} ₽`
}

function netWeight(raw: number, loss: number) {
  return raw - (raw * loss) / 100
}

// ================== FIRESTORE ==================
const balanceRef = collection(db, 'balance')

async function save(value: string, weight: number, price: number) {
  await setDoc(doc(db, 'balance', value), { weight, price })
}

// ===== INIT ONLY ONCE =====
async function initFirestoreIfEmpty() {
  const snapshot = await getDocs(balanceRef)
  if (!snapshot.empty) return

  const rows = balance.querySelectorAll<HTMLDivElement>('div[data-value]')
  for (const nameDiv of rows) {
    const value = nameDiv.dataset.value!
    const weight = Number(nameDiv.nextElementSibling!.textContent) || 0
    const price = Number(
      nameDiv.nextElementSibling!.nextElementSibling!.textContent
    )
    await setDoc(doc(db, 'balance', value), { weight, price })
  }
}

// ================== ACTIONS ==================
addBtn.onclick = async () => {
  if (!addDataValue) return alert('Выберите позицию')
  const raw = Number(addValue.value)
  if (raw <= 0) return

  const row = findRow(addDataValue)!
  const newWeight = Number(row.weightDiv.textContent) + netWeight(raw, dataLoss)
  row.weightDiv.textContent = newWeight.toFixed(2)
  await save(addDataValue, newWeight, Number(row.priceDiv.textContent))
  updateSums()
}

saleBtn.onclick = async () => {
  if (!saleDataValue) return alert('Выберите позицию')
  const sold = Number(saleValue.value)
  if (sold <= 0) return

  const row = findRow(saleDataValue)!
  const current = Number(row.weightDiv.textContent)
  if (sold > current) return alert('Недостаточно остатка')

  const newWeight = current - sold
  row.weightDiv.textContent = newWeight.toFixed(2)
  await save(saleDataValue, newWeight, Number(row.priceDiv.textContent))
  updateSums()
}

revisionBtn.onclick = async () => {
  if (!revisionDataValue) return
  const value = Number(revisionValue.value)
  if (value < 0) return

  const row = findRow(revisionDataValue)!
  row.weightDiv.textContent = value.toFixed(2)
  await save(revisionDataValue, value, Number(row.priceDiv.textContent))
  updateSums()
}

// ================== AUTH + SYNC ==================
onAuthStateChanged(auth, async user => {
  if (!user) {
    modal.style.display = 'flex'
    document.body.style.overflow = 'hidden'
    return
  }

  modal.style.display = 'none'
  document.body.style.overflow = 'auto'

  await initFirestoreIfEmpty()

  onSnapshot(balanceRef, snap => {
    snap.forEach(d => {
      const row = findRow(d.id)
      if (!row) return
      row.weightDiv.textContent = String(d.data().weight)
      row.priceDiv.textContent = String(d.data().price)
    })
    updateSums()
  })
})



