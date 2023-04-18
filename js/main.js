

const indexedDB = window.indexedDB
const form = document.getElementById('form')
const listContainer = document.getElementById('listContainer')

if(indexedDB && form) {
    let db
    const request = indexedDB.open('wishlist', 1)
    request.onsuccess = () => {
        db = request.result
        console.log('OPEN', db)
        readData()
    }
    request.onupgradeneeded = () => {
        db = request.result
        console.log('Create', db)
        const objectStore = db.createObjectStore('list', {
            keyPath: 'listTitle'
        })
    }
    request.onerror = (error) => {
        console.log('Error', error)
    }

    const addData = (data) =>{
        const transaction = db.transaction(['list'], 'readwrite')
        const objectStore = transaction.objectStore('list')
        const request = objectStore.add(data)
        readData()
    }

    const getData = (key) =>{
        const transaction = db.transaction(['list'], 'readwrite')
        const objectStore = transaction.objectStore('list')
        const request = objectStore.get(key)

        request.onsuccess = () => {
            form.wishlist.value = request.result.listTitle
            form.button.dataset.action = 'update'
            form.button.textContent = 'Editar'
        }
    }

    const updateData = (data) =>{
        const transaction = db.transaction(['list'], 'readwrite')
        const objectStore = transaction.objectStore('list')
        const request = objectStore.put(data)
        request.onsuccess = () => {
            form.button.dataset.action = 'add'
            form.button.textContent = 'Añadir a la Wishlist'
            readData()
        }
    }

    const deleteData = (key) => {
        const transaction = db.transaction(['list'], 'readwrite')
        const objectStore = transaction.objectStore('list')
        const request = objectStore.delete(key)
        request.onsuccess = () => {
            readData()
        }
    }

    const readData = () =>{
        const transaction = db.transaction(['list'], 'readonly')
        const objectStore = transaction.objectStore('list')
        const request = objectStore.openCursor()
        const fragment = document.createDocumentFragment()

        request.onsuccess = (e) =>{
            const cursor = e.target.result
            if(cursor){
                const listTitle = document.createElement('P')
                listTitle.textContent = cursor.value.listTitle
                fragment.appendChild(listTitle)

                const listUpdate = document.createElement('BUTTON')
                listUpdate.dataset.type = 'update'
                listUpdate.dataset.key = cursor.key
                listUpdate.classList = 'icon-edit'
                fragment.appendChild(listUpdate)

                const listDelete = document.createElement('BUTTON')
                listDelete.classList = 'icon-trash-1'
                listDelete.dataset.type = 'delete'
                listDelete.dataset.key = cursor.key
                fragment.appendChild(listDelete)


                cursor.continue()
            } else {
                listContainer.textContent = ''
                listContainer.appendChild(fragment)
            }
        }
    }
    

    form.addEventListener('submit', (e) =>{
        e.preventDefault()
        const data = {
            listTitle: e.target.wishlist.value
        }

        if(e.target.button.dataset.action == 'add'){
            addData(data)
        } else if (e.target.button.dataset.action == 'update'){
            updateData(data)
        }
        form.reset()
    })

    listContainer.addEventListener('click', (e) =>{
        if(e.target.dataset.type == 'update') {
            getData(e.target.dataset.key)
        } else if (e.target.dataset.type == 'delete') {
                deleteData(e.target.dataset.key)
            }   
        
        })        
    
}


