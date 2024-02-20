const ul = document.querySelector('ul');
const loadButton = document.querySelector('.loadData');
const loader = document.querySelector('.content');
const chunk = 5;
const userObj = {
    url : 'https://jsonplaceholder.typicode.com/users', 
    fetched : false,
    storage : []
}

const albumUrl = {
    url : 'https://jsonplaceholder.typicode.com/albums', 
    fetched : false,
}

const fetchHistory = [];
const timerHistory = [];

function delay(time = 500) {
    return new Promise((resolve) => {
        timerHistory.push(setTimeout(resolve, time));
    });
  }


const stopFetching = () => {
    fetchHistory.forEach(el => {
        el.abort();
    });
    timerHistory.forEach(el => {
        clearTimeout(el);
    });
}

const clearUl = () => {
    ul.innerHTML = '';
}

const createAlbums = (li) => {
    const albums = document.createElement('div');
    albums.classList.add('albums');
    albums.innerHTML = `
        <div class="miniContent">
            <div class="mBars">
                <div class="mBar"></div>
                <div class="mBar"></div>
                <div class="mBar"></div>
                <div class="mBar"></div>
                <div class="mBar"></div>
                <div class="mBar"></div>
                <div class="mBar"></div>
            </div>
            <div class="mBars">
                <div class="mBar"></div>
                <div class="mBar"></div>
                <div class="mBar"></div>
                <div class="mBar"></div>
                <div class="mBar"></div>
                <div class="mBar"></div>
                <div class="mBar"></div>
            </div>
        </div>
    `
    li.appendChild(albums);
    return albums;
}

const albumDataFetch = async (obj, id) => {
    if (id !== 0 && (!id || !isFinite(id))) {
        return;
    }
    try {
        const controller = new AbortController();
        fetchHistory.push(controller);
        const response = await fetch(obj.url + `?userId=${id}`, {signal : controller.signal });
        const el = await response.json();
        await delay(1000);
        return el;
    } catch (error) {
        console.log(error);
    }
    return null;

};

const addUsers = () => {
    if (userObj.fetched) {
        userObj.storage.forEach (el => {
            const li = document.createElement('li');
            li.setAttribute('id', `${el.id}`);
            li.innerHTML = `
                <div class="content2">
                    <h1>${el.name}</h1>
                    <h3>${el.email}</h3>
                    <div class="address">
                        <p>${el.address.street}, ${el.address.suite}</p>
                        <p>${el.address.city}</p>
                    </div>
                    <p>${el.phone}</p>
                    <p>${el.website}</p>
                </div>
                    <button class="user">get album</button>`;
            ul.appendChild(li);
        })
    }
    ul.addEventListener('click', async (e) => {
        e.preventDefault();
        if (e.target.classList.contains('user')) {
            e.stopPropagation();
            const button = e.target;
            const li = button.parentNode;
            button.remove();
            const id = li.id;
            const albums = createAlbums(li);
            const info = await albumDataFetch(albumUrl, id);
            if (info && Array.isArray(info) && info.length != 0) {
                albums.innerHTML = `<p>${info[0].title}</p>`
            } else {
                albums.innerHTML = `<p class='red'>could not obtain!</p>`
                await delay(2000);
                albums.remove();
                const button = document.createElement('button');
                button.classList.add('user');
                button.innerText = 'get album'
                li.appendChild(button);
            }
        }
    })
}

const usersDataFetch = async (obj) => {
    try {
        clearUl();
        const controller = new AbortController();
        fetchHistory.push(controller);
        const defaultNumber = 5;
        const response = await fetch(obj.url + `?_limit=${defaultNumber}`, {signal : controller.signal })
        obj.storage = await response.json();
        await delay(1000);
        obj.fetched = true;
        loader.style.display = 'none';
        addUsers();
    } catch (error) {
        console.log(error);
    }

};


loadButton.addEventListener('click', (e) => {
    e.preventDefault();
    stopFetching();
    loader.style.display = 'flex';
    usersDataFetch(userObj, 0);
});