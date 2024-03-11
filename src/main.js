'use strict';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { fetchImg } from './js/pixabay-api';
// import { fetchImg } from './js/render-functions';

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const btn = document.querySelector('button[type="submit"]');
const imgList = document.querySelector('.images-list');
const form = document.querySelector('.js-form');
const jsInput = document.querySelector('input[name="js-input"]');
const loader = document.querySelector('.loader');
const divGallery = document.querySelector('.div-gallery');
loader.style.display = 'none';

form.addEventListener('submit', searchForm);

function searchForm(evt) {
  evt.preventDefault();
  loader.style.display = 'block';
  const inputValue = evt.currentTarget.elements['js-input'].value;
  if (!inputValue) {
    btn.disabled = true;
    iziToast.show({
      message: 'Please, enter the value!',
    });
  } else {
    fetchImg(inputValue, 1)
      .then(res => {
        console.log(res.data);
        //if img not find show alert
        if (res.total === 0) {
          iziToast.show({
            message:
              'Sorry, there are no images matching your search query. Please try again!',
            backgroundColor: 'rgb(239, 64, 64)',
          });
        } else {
          //clear
          imgList.innerHTML = '';
          console.log('inp:', jsInput);
          imgList.insertAdjacentHTML(
            'beforeend',
            createMarkup(res.data, jsInput, 1)
          );
          lightbox.refresh();
        }
      })
      .catch(err => {
        console.log(err);
        iziToast.error({
          class: 'popup-message',
          theme: 'dark',
          backgroundColor: '#ef4040',
          messageColor: '#fff',
          iconUrl: Error,
          position: 'topRight',
          pauseOnHover: true,
          timeout: 3000,
          message: `${err}`,
        });
      })
      .finally(() => {
        // Hide loader when image loading is finished
        loader.style.display = 'none';
      });
  }
}

const windowScrollHandler = () => {
  const itemHeight = document
    .querySelector('.images-list')
    .firstElementChild.getBoundingClientRect().height;

  window.scrollBy({
    top: itemHeight * 2 + 48,
    left: 0,
    behavior: 'smooth',
  });
};

const initPaginationHandler = (state, request, page) => {
  const parent = document.querySelector('.gallery');

  if (state) {
    parent.insertAdjacentHTML(
      'beforeend',
      '<button class="gallery__action" type="button">Load more</button>'
    );

    const trigger = parent.querySelector('.gallery__action');

    trigger.addEventListener('click', () => {
      page += 1;
      trigger.remove();
      // toggleLoader(true);
      setTimeout(async () => {
        await fetchImg(request, page);
        windowScrollHandler();
      }, 500);
    });
  } else {
    const trigger = parent.querySelector('.gallery__action');

    if (!trigger) {
      return;
    }

    trigger.remove();
  }
};

const initGalleryItems = (total, request, page) => {
  const items = [...document.querySelectorAll('.gallery__item')];
  const trigger = document.querySelector('.gallery__action');
  const parent = document.querySelector('.gallery');

  if (!items.length || trigger) {
    return;
  }

  if (items.length < total) {
    initPaginationHandler(true, request, page);
  } else {
    initPaginationHandler(false);
    parent.insertAdjacentHTML(
      'beforeend',
      `<p class="gallery__meassage">We're sorry, but you've reached the end of search results.</p>`
    );
  }
};

const toggleLoader = state => {
  const parent = document.querySelector('.gallery');
  if (state) {
    parent.insertAdjacentHTML('beforeend', '<div class="loader"></div>');
  } else {
    const loader = parent.querySelector('.loader');

    if (!loader) {
      return;
    }

    loader.remove();
  }
};

function createMarkup({ hits, totalHits }, request, page) {
  if (!hits.length) {
    iziToast.error({
      class: 'popup-message',
      theme: 'dark',
      backgroundColor: '#ef4040',
      messageColor: '#fff',
      iconUrl: Error,
      position: 'topRight',
      pauseOnHover: true,
      timeout: 3000,
      message: `Sorry, there are no images matching your search query. Please, try again!`,
    });
    toggleLoader(false);
  }

  const galleryItems = [];

  hits.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      const markup = `<li class="gallery__item">
        <div class="gallery__card">
          <a href="${largeImageURL}" class="gallery-card__link"
            ><img src="${webformatURL}" alt="${tags}" class="gallery-card__image"
          /></a>
          <div class="gallery-card__description">
            <p class="gallery-card__text">Likes <span>${likes}</span></p>
            <p class="gallery-card__text">Views <span>${views}</span></p>
            <p class="gallery-card__text">Comments <span>${comments}</span></p>
            <p class="gallery-card__text">Downloads <span>${downloads}</span></p>
          </div>
        </div>
      </li>`;
      galleryItems.push(markup);
    }
  );
  divGallery.insertAdjacentHTML('beforeend', galleryItems.join(''));
  lightbox.refresh();
  initGalleryItems(totalHits, jsInput, page);
}
//at repeated input unlock button
jsInput.addEventListener('input', function () {
  btn.disabled = false;
});

imgList.addEventListener('click', function (evt) {
  evt.preventDefault();
});
