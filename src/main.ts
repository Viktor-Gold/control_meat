import './style.css'

const addMeat = document.querySelector('#addMeat') as HTMLElement // Блок добавления сырья
const saleMeat = document.querySelector('#saleMeat') as HTMLElement // Блок продаж

//! Кнопки
const addBtn = document.querySelector('#addBtn') as HTMLInputElement
const saleBtn = document.querySelector('#saleBtn') as HTMLInputElement
//! Вес для добавления и продаж
const addValue = document.querySelector('#addValue') as HTMLInputElement
const saleValue = document.querySelector('#saleValue') as HTMLInputElement
//! Таблица остатков
const balance = document.querySelector('#balance') as HTMLDivElement

let addDataValue = '' // Наименование позиции для добавления
let dataLoss = 0 // Процент потерь

let saleDataValue = '' // Наименование позиции для продаж

//! Открыть/Закрыть кастомный селектор
function functionToggle(id: string) {
  const container = document.querySelector(id) as HTMLElement
  const head = container.querySelector('.custom_select') as HTMLElement // Наименование позиции
  const dropdown = container.querySelector('.select_option') as HTMLElement // Кастомный селектор

  head.addEventListener('click', () => {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block'
  })

  // Закрывает селектор при клике вне родителя
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target as Node)) dropdown.style.display = 'none'
  })
}

functionToggle('#addMeat')
functionToggle('#saleMeat')

//! ФУНКЦИЯ УСТАНОВКИ ОБРАБОТЧИКОВ НА СТРАНИЦЫ ВЫБОРА
function setupSelect(id: string, mode: 'add' | 'sale') {
  const container = document.querySelector(id) as HTMLElement
  const displayed = container.querySelector('.custom_select .selected') as HTMLElement
  const options = container.querySelectorAll('.select_option li') as NodeListOf<HTMLLIElement>

  options.forEach((li) => {
    li.addEventListener('click', () => {
      // ставим видимый текст
      displayed.textContent = li.textContent || '—'

      const value = li.dataset.value || ''
      const loss = Number(li.dataset.loss) || 0

      if (mode === 'add') {
        addDataValue = value
        dataLoss = loss
      } else {
        saleDataValue = value
      }

      // прячем dropdown
      const parent = li.closest('.select_option') as HTMLElement
      if (parent) parent.style.display = 'none'
    })
  })
}

setupSelect('#addMeat', 'add')
setupSelect('#saleMeat', 'sale')

// ======= УТИЛИТА: находим ячейку остатка по data-value =======
function findWeightCell(value: string): HTMLDivElement | null {
  // структура: nameDiv (с data-value), weightDiv, priceDiv (повторяется)
  const children = Array.from(balance.children) as HTMLDivElement[]

  for (let i = 0; i < children.length; i += 3) {
    const nameDiv = children[i]
    const weightDiv = children[i + 1]

    // у блока nameDiv есть атрибут data-value (мы его вставили в HTML)
    const dv = nameDiv.getAttribute('data-value')
    if (dv === value) {
      return weightDiv
    }
  }
  return null
}

// ======= ФУНКЦИЯ РАСЧЕТА ПОТЕРЬ =======
function calculateNetWeight(rawKg: number, lossPercent: number): number {
  const lossKg = (rawKg * lossPercent) / 100
  const net = rawKg - lossKg
  return net
}

// ======= ОБРАБОТКА ДОБАВИТЬ =======
addBtn.addEventListener('click', () => {
  const raw = Number(addValue.value)
  if (!addDataValue) {
    alert('Пожалуйста, выберите позицию для добавления.')
    return
  }
  if (!raw || raw <= 0) {
    alert('Введите корректный вес (больше 0).')
    return
  }

  const net = calculateNetWeight(raw, dataLoss)

  const weightCell = findWeightCell(addDataValue)
  if (!weightCell) {
    alert('Не найдена строка в таблице для данной позиции.')
    return
  }

  const current = Number(weightCell.textContent) || 0
  const updated = current + net
  weightCell.textContent = updated.toFixed(2)

  // Сброс поля ввода (чисто UX)
  addValue.value = ''
  // Для защиты — лог
  console.log(`Добавлено ${raw}кг (net ${net.toFixed(2)}кг) к ${addDataValue}. Итог ${updated.toFixed(2)}кг`)
})

// ======= ОБРАБОТКА ПРОДАТЬ =======
saleBtn.addEventListener('click', () => {
  const sold = Number(saleValue.value)
  if (!saleDataValue) {
    alert('Пожалуйста, выберите позицию для продажи.')
    return
  }
  if (!sold || sold <= 0) {
    alert('Введите корректный вес для продажи (больше 0).')
    return
  }

  const weightCell = findWeightCell(saleDataValue)
  if (!weightCell) {
    alert('Не найдена строка в таблице для данной позиции.')
    return
  }

  const current = Number(weightCell.textContent) || 0
  if (sold > current + 1e-6) {
    alert('Недостаточно остатка для продажи.')
    return
  }

  const updated = current - sold
  weightCell.textContent = updated.toFixed(2)
  saleValue.value = ''
  console.log(`Продано ${sold}кг с ${saleDataValue}. Остаток ${updated.toFixed(2)}кг`)
})