import iziToast from 'izitoast';
import { markupGallery } from './render-functions';
import axios from 'axios';

export const fetchImages = async (request, page) => {
  const API_URL = 'https://pixabay.com/api/';
  const API_KEY = '42512017-1bddfdd3afd2851258a10c68c';
  const QUESTION = request;
  await axios
    .get(`${API_URL}?key=${API_KEY}&q=${QUESTION}`, {
      params: {
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        page: page,
        per_page: 15,
      },
    })
    .then(response => {
      markupGallery(response.data, request, page);
    })
    .catch(error =>
      iziToast.error({
        class: 'popup-message',
        theme: 'dark',
        backgroundColor: '#ef4040',
        messageColor: '#fff',
        iconUrl: Error,
        position: 'topRight',
        pauseOnHover: true,
        timeout: 3000,
        message: `${error}`,
      })
    );
};
