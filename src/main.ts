import './style.css'

//! Кнопки
const addBtn = document.querySelector('#addBtn') as HTMLInputElement
const saleBtn = document.querySelector('#saleBtn') as HTMLInputElement
//! Вес для добавления и продаж
const addValue = document.querySelector('#addValue') as HTMLInputElement
const saleValue = document.querySelector('#saleValue') as HTMLInputElement
//! Таблица остатков
const balance = document.querySelector('#balance') as HTMLDivElement

let addDataValue = ''// Наименование позиции для добавления сырья
let dataLoss = 0 // Процент потерь

let saleDataValue = '' // Наименование позиции для продаж

//! Открыть/Закрыть кастомный селектор
function functionToggle(id: string) {
  // Одинаковые классы в разных id, поэтому задаем параметр id
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

//! ФУНКЦИЯ УСТАНОВКИ ОБРАБОТЧИКОВ НА СТРАНИЦЫ ВЫБОРА
function setupSelect(id: string, mode: 'add' | 'sale') { 
  const container = document.querySelector(id) as HTMLElement // Снова заносим наши id в переменную
  const displayed = container.querySelector('.custom_select .selected') as HTMLSpanElement // Наименование позиции
  //Находим все теги li в нашем кастомном селекторе
  const options = container.querySelectorAll('.select_option li') as NodeListOf<HTMLLIElement> 

  options.forEach((li) => {
    // Проходим по каждому эл-ту нашего селектора
    li.addEventListener('click', () => {
      displayed.textContent = li.textContent //заносим наименование эл-та
      const value = String(li.dataset.value) // Получаем имя позиции из атрибута
      const loss = Number(li.dataset.loss) // Получаем процент потерь

      if (mode == 'add') { // Если клик по li в блоке добавления
        addDataValue = value // Имя позиции
        dataLoss = loss // Процент потерь
      } else { // Если клик по li в блоке продаж
        saleDataValue = value
      }

      // прячем селектор после выбора позиции
      const parent = li.closest('.select_option') as HTMLElement
      parent.style.display = 'none'
    })
  })
}
// Вызываем функцию на блок добавления и блок продаж
setupSelect('#addMeat', 'add') 
setupSelect('#saleMeat', 'sale')

// Находим ячейку остатка в таблице по data-value
function findWeightCell(value: string) {
  // Находим div с нужным data-value
  const nameDiv = balance.querySelector(`div[data-value="${value}"]`) as HTMLDivElement | null

  if (!nameDiv) {
    alert(`Позиция с data-value="${value}" не найдена в таблице остатков`)
    return null
  }

  // Ищем следующий соседний div — предполагаем, что он содержит вес
  const weightDiv = nameDiv.nextElementSibling as HTMLDivElement | null

  if (!weightDiv) {
    alert(`Не найден соседний элемент (вес) для позиции "${value}"`)
    return null
  }

  return weightDiv
}

// ФУНКЦИЯ РАСЧЕТА ПОТЕРЬ
function calculateNetWeight(rawKg: number, lossPercent: number): number {
  const lossKg = (rawKg * lossPercent) / 100
  return rawKg - lossKg
}

// ПРОВЕРКА ДОБАВИТЬ
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

  addValue.value = ''
})

// ПРОВЕРКА ПРОДАЖ
saleBtn.addEventListener('click', () => {
  const sold = Number(saleValue.value)
  if (!saleDataValue) {
    alert('Пожалуйста, выберите позицию для продажи.')
    return
  }
  if (!sold || sold <= 0) {
    alert('Введите корректный вес для продажи!')
    return
  }

  const weightCell = findWeightCell(saleDataValue)
  if (!weightCell) {
    alert('Не найдена строка в таблице для данной позиции.')
    return
  }

  const current = Number(weightCell.textContent)
  if (sold > current) {
    alert('Недостаточно остатка для продажи.')
    return
  }

  const updated = current - sold
  weightCell.textContent = updated.toFixed(2)
  saleValue.value = ''
})