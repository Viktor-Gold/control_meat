import './style.css'

//! ==================== МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ ====================
const modal = document.querySelector('#modal_window') as HTMLDivElement
const loginInput = document.querySelector('#loginInput') as HTMLInputElement
const passwordInput = document.querySelector('#passwordInput') as HTMLInputElement
const loginBtn = document.querySelector('#loginBtn') as HTMLInputElement
const errorMsg = document.querySelector('#errorMsg') as HTMLParagraphElement

document.body.style.overflow = 'hidden'

//! Проверка логина и пароля
function checkLogin() {
  const login = loginInput.value.trim().toLowerCase()   // нечувствительный к регистру
  const password = passwordInput.value.trim()

  if (login === 'darvina' && password === 'meat1515') {
    modal.style.display = 'none'
    document.body.style.overflow = 'auto'
    errorMsg.textContent = ''
    loadData() // загружаем данные после успешного входа
    return true
  } else {
    errorMsg.textContent = 'Неверный логин или пароль'
    passwordInput.value = ''
    return false
  }
}

loginBtn.addEventListener('click', checkLogin)

modal.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkLogin()
})

//! ==================== ЭЛЕМЕНТЫ ИНТЕРФЕЙСА ====================
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

//! ==================== ФУНКЦИИ СЕЛЕКТОРОВ ====================
function functionToggle(id: string) {
  const container = document.querySelector(id) as HTMLElement
  const head = container.querySelector('.custom_select') as HTMLElement
  const dropdown = container.querySelector('.select_option') as HTMLElement

  head.addEventListener('click', () => {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block'
  })

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target as Node)) dropdown.style.display = 'none'
  })
}

functionToggle('#addMeat')
functionToggle('#saleMeat')
functionToggle('#revisionMeat')

function setupSelect(id: string, mode: 'add' | 'sale' | 'revision') {
  const container = document.querySelector(id) as HTMLElement
  const displayed = container.querySelector('.custom_select .selected') as HTMLSpanElement
  const options = container.querySelectorAll('.select_option li') as NodeListOf<HTMLLIElement>

  options.forEach(li => {
    li.addEventListener('click', () => {
      displayed.textContent = li.textContent
      const value = String(li.dataset.value)
      const loss = Number(li.dataset.loss)

      if (mode === 'add') {
        addDataValue = value
        dataLoss = loss
      } else if (mode === 'sale') {
        saleDataValue = value
      } else if (mode === 'revision') {
        revisionDataValue = value
      }

      const parent = li.closest('.select_option') as HTMLElement
      parent.style.display = 'none'
    })
  })
}

setupSelect('#addMeat', 'add')
setupSelect('#saleMeat', 'sale')
setupSelect('#revisionMeat', 'revision')

//! ==================== ПОИСК И РАСЧЕТ ====================
function findRow(value: string) {
  const nameDiv = balance.querySelector(`div[data-value="${value}"]`) as HTMLDivElement
  if (!nameDiv) return null
  const weightDiv = nameDiv.nextElementSibling as HTMLDivElement
  const priceDiv = weightDiv.nextElementSibling as HTMLDivElement
  const sumDiv = priceDiv.nextElementSibling as HTMLDivElement
  return { nameDiv, weightDiv, priceDiv, sumDiv }
}

function calculateNetWeight(rawKg: number, lossPercent: number) {
  return rawKg - (rawKg * lossPercent) / 100
}

function updateSums() {
  let totalSum = 0
  const rows = balance.querySelectorAll('div[data-value]')
  rows.forEach((nameDiv) => {
    const weightDiv = nameDiv.nextElementSibling as HTMLDivElement
    const priceDiv = weightDiv.nextElementSibling as HTMLDivElement
    const sumDiv = priceDiv.nextElementSibling as HTMLDivElement
    const weight = Number(weightDiv.textContent)
    const price = Number(priceDiv.textContent)
    sumDiv.textContent = (weight * price).toFixed(2)
    totalSum += weight * price
  })
  summaryDiv.textContent = `Итоговая сумма: ${totalSum.toFixed(2)} ₽`
}

//! ==================== ОБРАБОТЧИКИ ====================
addBtn.addEventListener('click', () => {
  const raw = Number(addValue.value)
  if (!addDataValue) return alert('Выберите позицию для добавления.')
  if (!raw || raw <= 0) return alert('Введите корректный вес.')

  const row = findRow(addDataValue)
  if (!row) return alert('Позиция не найдена.')

  const net = calculateNetWeight(raw, dataLoss)
  row.weightDiv.textContent = (Number(row.weightDiv.textContent) + net).toFixed(2)
  addValue.value = ''
  saveData()
  updateSums()
})

saleBtn.addEventListener('click', () => {
  const sold = Number(saleValue.value)
  if (!saleDataValue) return alert('Выберите позицию для продажи.')
  if (!sold || sold <= 0) return alert('Введите корректный вес.')

  const row = findRow(saleDataValue)
  if (!row) return alert('Позиция не найдена.')

  const current = Number(row.weightDiv.textContent)
  if (sold > current) return alert('Недостаточно остатка!')

  row.weightDiv.textContent = (current - sold).toFixed(2)
  saleValue.value = ''
  saveData()
  updateSums()
})

revisionBtn.addEventListener('click', () => {
  const value = Number(revisionValue.value)
  if (!revisionDataValue) return alert('Выберите позицию для ревизии.')
  if (isNaN(value) || value < 0) return alert('Введите корректный остаток.')

  const row = findRow(revisionDataValue)
  if (!row) return alert('Позиция не найдена.')

  row.weightDiv.textContent = value.toFixed(2)
  revisionValue.value = ''
  saveData()
  updateSums()
})

//! ==================== РАБОТА С JSON ====================
async function saveData() {
  const rows = balance.querySelectorAll<HTMLDivElement>('div[data-value]')
  const data: Record<string, { weight: number, price: number }> = {}

  rows.forEach((nameDiv) => {
    const value = nameDiv.dataset.value
    if (!value) return
    const weightDiv = nameDiv.nextElementSibling as HTMLDivElement
    const priceDiv = weightDiv.nextElementSibling as HTMLDivElement
    data[value] = {
      weight: Number(weightDiv.textContent),
      price: Number(priceDiv.textContent)
    }
  })

  await fetch('/meat/update.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

async function loadData() {
  try {
    const res = await fetch('/meat/data.json')
    const data = await res.json()
    for (const key in data) {
      const row = findRow(key)
      if (!row) continue
      row.weightDiv.textContent = data[key].weight
      row.priceDiv.textContent = data[key].price
    }
    updateSums()
  } catch (e) {
    console.warn('Не удалось загрузить данные:', e)
  }
}