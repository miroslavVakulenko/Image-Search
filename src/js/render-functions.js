import { fetchImages } from './pixabay-api';
import SimpleLightbox from 'simplelightbox';
import iziToast from 'izitoast';

const lightbox = new SimpleLightbox('.gallery a', {
  spinner: false,
  overlayOpacity: 0.8,
});

const windowScrollHandler = () => {
  const itemHeight = document
    .querySelector('.gallery__list')
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
      toggleLoader(true);
      setTimeout(async () => {
        await fetchImages(request, page);
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

const clearGallery = () => {
  const gallery = document.querySelector('.gallery__list');

  if (!gallery) {
    return;
  }

  gallery.innerHTML = '';

  const message = document.querySelector('.gallery__meassage');

  if (!message) {
    return;
  }

  message.remove();
};

export const markupGallery = ({ hits, totalHits }, request, page) => {
  const gallery = document.querySelector('.gallery__list');

  if (!gallery) {
    return;
  }

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

  hits.map(item => {
    const markup = `<li class="gallery__item">
      <div class="gallery-card">
        <a class="gallery-card__link" href="${item.largeImageURL}" aria-label="Open image in modal">
          <img class="gallery-card__image" src="${item.webformatURL}" alt="${item.tags}">
        </a>
        <div class="gallery-card__caption">
          <p class="gallery-card__text">Likes <span>${item.likes}</span></p>
          <p class="gallery-card__text">Views <span>${item.views}</span></p>
          <p class="gallery-card__text">Comments <span>${item.comments}</span></p>
          <p class="gallery-card__text">Downloads <span>${item.downloads}</span></p>
        </div>
      </div>
    </li>`;

    galleryItems.push(markup);
  });

  toggleLoader(false);
  gallery.insertAdjacentHTML('beforeend', galleryItems.join(''));
  lightbox.refresh();
  initGalleryItems(totalHits, request, page);
};

export const initForm = () => {
  const form = document.querySelector('.form');
  const input = form.querySelector('.form__input');

  if (!form || !input) {
    return;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    if (!input.value.length) {
      return;
    }

    const request = input.value.trim().split(' ').join('+');

    clearGallery();
    toggleLoader(true);
    initPaginationHandler(false, request);

    setTimeout(() => {
      fetchImages(request, 1);
    }, 500);

    input.value = '';
  });
};
