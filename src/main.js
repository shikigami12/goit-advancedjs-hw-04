import { PixabayApi } from './js/pixabay-api.js';
import { GalleryRenderer, PixabayImage } from './js/render-functions.js';
import SimpleLightbox from 'simplelightbox';
import iziToast from 'izitoast';

import 'simplelightbox/dist/simple-lightbox.min.css';
import 'izitoast/dist/css/iziToast.min.css';

class ImageSearch {
  constructor() {
    this._searchForm = document.querySelector('form.search-form');
    this._galleryElement = document.querySelector('.gallery');
    this._galleryRenderer = new GalleryRenderer('gallery', this._galleryElement);
    this._pixabayApi = new PixabayApi('49652038-e061cdaf0adfcf3d7bc5fddbb');
    this._lightbox = new SimpleLightbox('div.gallery ul.gallery li a', {
      captionsData: 'alt',
      captionDelay: 250,
    });
    this._loader = document.querySelector('.loader');
  }

  /**
   * Initializes the search form event listeners.
   */
  init() {
    this._searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = event.target.querySelector('input[name="searchQuery"]').value;
      if (!query) {
        iziToast.error({
          message: 'Please enter a search term.',
        });
        return;
      }
      this._onSearch(query);
    });
  }

  /**
   * Handles the search event.
   * @param {string} query - The search query.
   */
  _onSearch(query) {
    this._galleryRenderer.clear();
    this._searchForm.reset();
    this._toggleLoader();
    this._pixabayApi.fetchImages(query).then(images => {
      this._toggleLoader();
      if (images.length === 0) {
        iziToast.show({
          color: '#EF4040',
          icon: 'icon-close',
          title: '❌',
          message: 'Sorry, there are no images matching your search query. Please try again!',
        });
        return;
      }
      images.forEach(image => {
        this._galleryRenderer.addImage(new PixabayImage(image));
      });

      this._galleryRenderer.render();
      this._lightbox.refresh();
    });
  }

  /**
   * Toggles the loader visibility.
   */
  _toggleLoader() {
    this._loader.classList.toggle('show');
  }
}

new ImageSearch().init();