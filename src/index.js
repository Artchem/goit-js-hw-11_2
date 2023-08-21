import * as API from './js/pixabay-api';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  targetDiv: document.querySelector('.js-guard'),
};

let pageCurrent = 1;
let searchQuery = '';
let gallery = new SimpleLightbox('.gallery-link');

const targetDiv = document.querySelector('.js-guard');
const options = {
  root: null,
  rootMargin: '250px',
  threshold: 1.0,
};

const observer = new IntersectionObserver(onLoadMore, options);

async function onLoadMore(entries, observer) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      try {
        let countPhotos = refs.gallery.childElementCount;

        pageCurrent += 1;

        const nextPage = await API.fetchPixabay(searchQuery, pageCurrent);

        refs.gallery.insertAdjacentHTML(
          'beforeend',
          createMarkup(nextPage.hits)
        );

        gallery.refresh();

        countPhotos += nextPage.hits.length;
        console.log(countPhotos);

        if (countPhotos >= nextPage.totalHits) {
          observer.unobserve(refs.targetDiv);
        }

        // if (nextPage.hits.length === 0) {
        //   Notiflix.Notify.failure(
        //     `Sorry, there are no images matching your search query. Please try again.`
        //   );
        // }
      } catch (error) {
        console.log(error.message);
      }
    }
  });
}

refs.searchForm.addEventListener('submit', onSearchSubmit);

async function onSearchSubmit(evt) {
  evt.preventDefault();
  searchQuery = evt.currentTarget.elements.searchQuery.value;

  refs.gallery.innerHTML = '';
  pageCurrent = 1;

  try {
    const firstPage = await API.fetchPixabay(searchQuery, pageCurrent);

    console.log(evt.target);

    refs.gallery.insertAdjacentHTML('beforeend', createMarkup(firstPage.hits));

    evt.target.reset();
    observer.observe(refs.targetDiv);

    gallery = new SimpleLightbox('.gallery-link');
    if (firstPage.hits.length !== 0) {
      Notiflix.Notify.success(
        `Hooray! We found ${firstPage.totalHits} images.`
      );
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
