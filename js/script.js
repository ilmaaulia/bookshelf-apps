const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', function () {
    console.log(books);
    const submitForm = document.getElementById('inputBookForm');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBookItem();
    });

    const searchForm = document.getElementById('searchBookForm');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBooks()
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function addBookItem() {
    const generatedID = generateId();
    const bookTitle = document.getElementById('bookTitle').value;
    const bookAuthor = document.getElementById('bookAuthor').value;
    const bookYear = document.getElementById('bookYear').value;
    const isFinished = document.getElementById('isFinished').checked;
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, parseInt(bookYear), isFinished);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, bookTitle, bookAuthor, bookYear, isFinished) {
    return {
        id,
        bookTitle,
        bookAuthor,
        bookYear,
        isFinished,
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const unFinishedBookList = document.getElementById('unfinishedBookList');
    unFinishedBookList.innerHTML = '';

    const finishedBookList = document.getElementById('finishedBookList');
    finishedBookList.innerHTML = '';


    for (const bookItem of books) {
        const bookElement = newBook(bookItem);
        if (!bookItem.isFinished) {
            unFinishedBookList.append(bookElement);
        } else {
            finishedBookList.append(bookElement);
        }
    }
});


function newBook(bookObject) {
    const bookTitle = document.createElement('h3');
    bookTitle.innerText = bookObject.bookTitle;

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = "Author: " + bookObject.bookAuthor;

    const bookYear = document.createElement('p');
    bookYear.innerText = "Year: " + bookObject.bookYear;

    const finishedButton = document.createElement('button');
    finishedButton.classList.add('finishedButton');
    finishedButton.innerText = "Finished";

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('deleteButton');
    deleteButton.innerText = "Delete";

    const unFinishedButton = document.createElement('button');
    unFinishedButton.classList.add('unFinishedButton');
    unFinishedButton.innerText = "Haven't Finished Yet";

    const button = document.createElement('div');
    button.classList.add('action');

    if (bookObject.isFinished) {
        unFinishedButton.addEventListener('click', function () {
            toUnFinished(bookObject.id);
        });

        deleteButton.addEventListener('click', function () {
            deleteBook(bookObject.id);
        });

        button.append(unFinishedButton, deleteButton);
    } else {
        finishedButton.addEventListener('click', function () {
            toFinished(bookObject.id);
        });

        deleteButton.addEventListener('click', function () {
            deleteBook(bookObject.id);
        });

        button.append(finishedButton, deleteButton);
    }

    const bookItem = document.createElement('article');
    bookItem.classList.add('bookItem');
    bookItem.append(bookTitle, bookAuthor, bookYear, button);
    bookItem.setAttribute('id', `book-${bookObject.id}`);

    return bookItem;
}

function toFinished(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isFinished = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function toUnFinished(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isFinished = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData()
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function deleteBook(bookId) {
    const confirmation = window.confirm("Are you sure you want to delete this book?");

    if (confirmation) {
        const bookTarget = findBookIndex(bookId);

        if (bookTarget === -1) return;

        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert("Your browser doesn't support local storage");
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBooks() {
    const searchBookInput = document.getElementById('searchBookInput').value.toLowerCase();
    const searchResult = books.filter(book => book.bookTitle.toLowerCase().includes(searchBookInput) || book.bookAuthor.toLowerCase().includes(searchBookInput));

    renderSearchResult(searchResult);
}

function renderSearchResult(result) {
    const searchResultList = document.getElementById('searchResultList');
    searchResultList.innerHTML = '';

    for (const bookItem of result) {
        const bookElement = newBook(bookItem);
        searchResultList.appendChild(bookElement);
    }
}