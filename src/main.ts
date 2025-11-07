import './style.css'

//! МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ
const modal = document.querySelector('#modal_window') as HTMLDivElement
const loginInput = document.querySelector('#loginInput') as HTMLInputElement
const passwordInput = document.querySelector('#passwordInput') as HTMLInputElement
const loginBtn = document.querySelector('#loginBtn') as HTMLInputElement
const errorMsg = document.querySelector('#errorMsg') as HTMLParagraphElement

//! Блок интерфейса, пока не введены правильные данные
document.body.style.overflow = 'hidden'

//! Проверка логина и пароля
function checkLogin() {
  const login = loginInput.value.trim()
  const password = passwordInput.value.trim()

  if (login.toLowerCase() === 'admin' && password === '77777777') {
    modal.style.display = 'none'
    document.body.style.overflow = 'auto'
  } else {
    errorMsg.textContent = 'Неверный логин или пароль'
    passwordInput.value = ''
  }
}

//! При клике на кнопку "Войти"
loginBtn.addEventListener('click', checkLogin)

//! При нажатии Enter
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    checkLogin()
  }
})

//! Кнопки
const addBtn = document.querySelector('#addBtn') as HTMLInputElement
const saleBtn = document.querySelector('#saleBtn') as HTMLInputElement
//! Вес для добавления и продаж
const addValue = document.querySelector('#addValue') as HTMLInputElement
const saleValue = document.querySelector('#saleValue') as HTMLInputElement
//! Таблица остатков
const balance = document.querySelector('#balance') as HTMLDivElement
const summaryDiv = document.querySelector('#summary') as HTMLDivElement // Итоговая сумма
//! Ревизия
const revisionBtn = document.querySelector('#revisionBtn') as HTMLInputElement
const revisionValue = document.querySelector('#revisionValue') as HTMLInputElement
let revisionDataValue = ''

let addDataValue = '' // Наименование позиции для добавления сырья
let dataLoss = 0 // Процент потерь
let saleDataValue = '' // Наименование позиции для продаж

//! Открыть/Закрыть кастомный селектор
function functionToggle(id: string) {
  const container = document.querySelector(id) as HTMLElement // Теперь container наш id
  // Находим наши классы внутри каждого id
  const head = container.querySelector('.custom_select') as HTMLElement // Наименование позиции
  const dropdown = container.querySelector('.select_option') as HTMLElement // Кастомный селектор

  head.addEventListener('click', () => {
    // Открываем селектор выбора
    dropdown.style.display = dropdown.style.display == 'block' ? 'none' : 'block'
  })

  // Закрывает селектор при клике вне родителя
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target as Node)) dropdown.style.display = 'none'
  })
}

functionToggle('#addMeat') // Блок добавления сырья
functionToggle('#saleMeat') // Блок продаж
functionToggle('#revisionMeat') // Блок ревизии

//! Настройка селекторов выбора позиции в разных блоках
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
// Вызываем функцию на блок добавления и блок продаж
setupSelect('#addMeat', 'add') 
setupSelect('#saleMeat', 'sale')
setupSelect('#revisionMeat', 'revision') // настройка выбора


// Поиск строки позиции в таблице остатков
function findRow(value: string) {
  const nameDiv = balance.querySelector(`div[data-value="${value}"]`) as HTMLDivElement 
  if (!nameDiv) return null

  const weightDiv = nameDiv.nextElementSibling as HTMLDivElement // вес
  const priceDiv = weightDiv?.nextElementSibling as HTMLDivElement // цена
  const sumDiv = priceDiv?.nextElementSibling as HTMLDivElement // сумма

  return { nameDiv, weightDiv, priceDiv, sumDiv }
}

// Расчёт потерь
function calculateNetWeight(rawKg: number, lossPercent: number) {
  const lossKg = (rawKg * lossPercent) / 100
  return rawKg - lossKg
}

// Обновление суммы позиции и общей суммы 
function updateSums() {
  let totalSum = 0 
  const rows = balance.querySelectorAll('div[data-value]')

  rows.forEach((nameDiv) => {
    const weightDiv = nameDiv.nextElementSibling as HTMLDivElement // вес
    const priceDiv = weightDiv.nextElementSibling as HTMLDivElement // цена
    const sumDiv = priceDiv.nextElementSibling as HTMLDivElement // сумма

    const weight = Number(weightDiv.textContent)
    const price = Number(priceDiv.textContent)
    const sum = weight * price

    sumDiv.textContent = sum.toFixed(2)
    totalSum += sum
  })

  summaryDiv.textContent = `Итоговая сумма: ${totalSum.toFixed(2)} ₽`
}


// Добавляем обработчик для режима 'revision'
revisionBtn.addEventListener('click', () => {
  const value = Number(revisionValue.value)
  if (!revisionDataValue) return alert('Выберите позицию для ревизии.')
  if (isNaN(value) || value < 0) return alert('Введите корректный остаток.')

  const row = findRow(revisionDataValue)
  if (!row || !row.weightDiv) return alert('Позиция не найдена.')

  row.weightDiv.textContent = value.toFixed(2)
  revisionValue.value = ''
  autoSave() // сохраняем и пересчитываем итоговую сумму
})

// ===== Сохранение данных в localStorage =====
function saveBalanceToStorage() {
  const data: string[] = []
  balance.querySelectorAll('div').forEach(div => data.push(div.textContent || ''))
  localStorage.setItem('balanceData', JSON.stringify(data))
}

// ===== Загрузка данных из localStorage =====
function loadBalanceFromStorage() {
  const stored = localStorage.getItem('balanceData')
  if (!stored) return
  const data: string[] = JSON.parse(stored)
  const divs = balance.querySelectorAll('div')
  data.forEach((text, i) => {
    if (divs[i]) divs[i].textContent = text
  })
}

// ===== Автосохранение после каждого изменения =====
function autoSave() {
  updateSums()
  saveBalanceToStorage()
}

// Добавить продукцию
addBtn.addEventListener('click', () => {
  const raw = Number(addValue.value) // вес пользователя
  if (!addDataValue) return alert('Выберите позицию для добавления.')
  if (!raw || raw <= 0) return alert('Введите корректный вес.')

  const net = calculateNetWeight(raw, dataLoss) // расчитываем потери с помощью нашей функции
  const row = findRow(addDataValue) // Находим строку в таблице по data-value
  if (!row || !row.weightDiv) return alert('Позиция не найдена.')

  const current = Number(row.weightDiv.textContent) // Текущий остаток
  row.weightDiv.textContent = (current + net).toFixed(2) // добавляем вес

  addValue.value = '' // Очищаем поле ввода
  autoSave() // пересчет общей суммы
})

// Продать продукцию (уменьшить остаток)
saleBtn.addEventListener('click', () => {
  const sold = Number(saleValue.value) // вес продажи пользователя
  if (!saleDataValue) return alert('Выберите позицию для продажи.') // проверка позиции
  if (!sold || sold <= 0) return alert('Введите корректный вес продажи.') // корректность веса

  const row = findRow(saleDataValue) // Находим строку в таблице по data-value
  if (!row || !row.weightDiv) return alert('Позиция не найдена.')

  const current = Number(row.weightDiv.textContent) // Текущий остаток
  if (sold > current) return alert('Недостаточно остатка!')

  row.weightDiv.textContent = (current - sold).toFixed(2)

  saleValue.value = ''
  autoSave() // пересчет общей суммы
})

// ===== Загружаем данные при запуске =====
loadBalanceFromStorage()
updateSums()