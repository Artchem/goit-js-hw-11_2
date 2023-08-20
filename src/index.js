import * as API from './js/pixabay-api';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
  targetDiv: document.querySelector('.js-guard'),
};

let pageCurrent = 1;
let searchQuery = '';
let gallery = new SimpleLightbox('.gallery-link');

// const targetDiv = document.querySelector('.js-guard');
// const options = {
//   root: null,
//   rootMargin: '500px',
//   threshold: 1.0,
// };

// const observer = new IntersectionObserver(onLoadMore, options);
// function onLoadMore(entries, observer) {
//   entries.forEach(entry => {
//     if (entry.isIntersecting) {
//       console.log(entry);

//       onLoadMoreClick();
//     }

//     // console.log(entry);
//   });
// }

refs.searchForm.addEventListener('submit', onSearchSubmit);
refs.loadMore.addEventListener('click', onLoadMoreClick);

async function onLoadMoreClick(evt) {
  console.dir(refs.searchForm.elements.searchQuery.value);
  pageCurrent += 1;

  refs.loadMore.disabled = true;
  refs.loadMore.textContent = 'Loading...';

  try {
    const nextPage = await API.fetchPixabay(searchQuery, pageCurrent);

    console.log(nextPage);

    refs.gallery.insertAdjacentHTML('beforeend', createMarkup(nextPage.hits));

    gallery.refresh();

    scrollBehavior();

    refs.loadMore.disabled = false;
    refs.loadMore.textContent = 'Load more';

    console.log(pageCurrent * nextPage.hits.length);
    if (pageCurrent * nextPage.hits.length >= nextPage.totalHits) {
      refs.loadMore.hidden = true;
    }

    if (nextPage.hits.length === 0) {
      Notiflix.Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function onSearchSubmit(evt) {
  evt.preventDefault();
  searchQuery = evt.currentTarget.elements.searchQuery.value;
  console.log(searchQuery);

  refs.gallery.innerHTML = '';
  pageCurrent = 1;

  try {
    const firstPage = await API.fetchPixabay(searchQuery, pageCurrent);

    console.log(evt.target);

    refs.gallery.insertAdjacentHTML('beforeend', createMarkup(firstPage.hits));

    evt.target.reset();
    // observer.observe(refs.targetDiv);

    gallery = new SimpleLightbox('.gallery-link');

    scrollBehavior();

    Notiflix.Notify.success(`Hooray! We found ${firstPage.totalHits} images.`);

    if (firstPage.hits.length !== firstPage.totalHits) {
      refs.loadMore.classList.remove('is-hidden');
    }

    if (firstPage.hits.length === 0) {
      Notiflix.Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
    }
  } catch (error) {
    console.log(error.message);
    Notiflix.Notify.failure(`Oops! ${error.message}! Try reloading the page!`, {
      width: '380px',
      position: 'center-center',
      timeout: 6000,
      clickToClose: true,
    });
    evt.target.reset();
  }
}

//   API.fetchPixabay(searchQuery, pageCurrent)
//     .then(data => {
//       console.log(data.hits);

//       refs.gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));

//       // observer.observe(refs.targetDiv);

//       gallery = new SimpleLightbox('.gallery-link');

//       scrollBehavior();

//       Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);

//       if (data.hits.length !== data.totalHits) {
//         refs.loadMore.classList.remove('is-hidden');
//       }

//       if (data.hits.length === 0) {
//         Notiflix.Notify.failure(
//           `Sorry, there are no images matching your search query. Please try again.`
//         );
//       }
//     })
//     .catch(error => {
//       console.log(error.message);
//     })
//     .finally(evt.currentTarget.reset());
// }

function scrollBehavior() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight,
    behavior: 'smooth',
  });
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
        largeImageURL,
      }) =>
        `<div class="photo-card">
            <a class = "gallery-link" href= "${largeImageURL}">
            <img class="cover" src="${webformatURL}" alt="${tags}" loading="lazy" width="300" height="200"/>
            </a> 
             <div class="info">
                <p class="info-item">
                  <b>Likes</b>${likes}
                </p>
                <p class="info-item">
                   <b>Views</b>${views}
                </p>
                <p class="info-item">
                  <b>Comments</b>${comments}
                </p>
                <p class="info-item">
                  <b>Downloads</b>${downloads}
                </p>
              </div>
            
          </div>`
    )
    .join('');
}
