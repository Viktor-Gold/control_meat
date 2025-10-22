import './style.css'

const addMeat = document.querySelector('#addMeat') as HTMLDivElement // Блок добавления
const saleMeat = document.querySelector('#saleMeat') as HTMLDivElement // Блок продаж

// Функця переключателя селектора open/close 
const functionToggle = (id:any) => { 
  id = document.querySelector(id) as HTMLElement // id родителя 
  let first = id.firstElementChild as HTMLDivElement // Наименование позиции
  let last = id.lastElementChild as HTMLDivElement // Кастомный селектор
  
  first.addEventListener('click', () => {
    if (last.style.display == '' || last.style.display == 'none') {
      last.style.display = 'block'
    }
    else {
      last.style.display = 'none'
    }

  })

  document.addEventListener('click', (e) => {
    if (!id.contains(e.target)) { // Клик вне родителя
      last.style.display = 'none'
    }
  })
}

functionToggle('#addMeat')
functionToggle('#saleMeat')

// Функция выбора позиции
function chooseSelect(name:any) {
  name = document.querySelector(name)
  let valueSelect = name.querySelector('.custom_select .selected') as HTMLSpanElement
  let select_option = name.querySelectorAll('.select_option li') as NodeListOf<HTMLLIElement>


  select_option.forEach(el => {
    el.addEventListener('click', () => {
      valueSelect.textContent = el.textContent

      let parentSelect = el.closest('.select_option') as HTMLDivElement // Закрываем родителя
      parentSelect.style.display = 'none'
    })
  });
}

chooseSelect('#saleMeat')
chooseSelect('#addMeat')


