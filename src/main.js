import { PixabayApi } from './js/pixabay-api.js';
import { GalleryRenderer } from './js/render-functions.js';
import SimpleLightbox from 'simplelightbox';
import iziToast from 'izitoast';

import 'simplelightbox/dist/simple-lightbox.min.css';
import 'izitoast/dist/css/iziToast.min.css';

/**
 * Class for handling image search functionality.
 * This class initializes the search form, handles search queries,
 * fetches images from the Pixabay API, and manages the gallery rendering.
 */
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
    this._page = 1;
    this._loader = document.querySelector('.loader');
    this._query = null;
    this._loadMoreButton = document.querySelector('.load-more');
    this._noMoreText = document.querySelector('.no-more');
  }

  /**
   * Initializes the search form event listeners.
   */
  async init() {
    this._searchForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      this._resetPaging();
      const query = event.target.querySelector('input[name="searchQuery"]').value;
      if (!query) {
        iziToast.error({
          message: 'Please enter a search term.',
        });
        return;
      }

      this._query = query;
      this._searchForm.reset();
      this._galleryRenderer.clear();
      await this._onSearch();
    });
    document.querySelector('.load-more').addEventListener('click', this._loadMore.bind(this));
  }

  _resetPaging() {
    document.querySelector('.load-more').removeEventListener('click', this._loadMore.bind(this));
    this._page = 1;
  }

  /**
   * Handles the search event.
   */
  async _onSearch() {
    this._toggleLoader();
    const response = await this._pixabayApi.fetchImages(this._query, this._page);
    this._toggleLoader();
    if (!response.hits || !response.hits.length) {
      iziToast.show({
        color: '#EF4040',
        icon: 'icon-close',
        title: '❌',
        message: 'Sorry, there are no images matching your search query. Please try again!',
      });
      return;
    }

    this._galleryRenderer.appendImages(response.hits);
    this._lightbox.refresh();
    if (response.totalHits > 0 && response.totalHits > this._page * 15) {
      if(this._loadMoreButton.classList.contains('hidden')) {
        this._loadMoreButton.classList.toggle('hidden');
      }
      if(!this._noMoreText.classList.contains('hidden')) {
        this._noMoreText.classList.toggle('hidden');
      }
    } else {
      if(!this._loadMoreButton.classList.contains('hidden')) {
        this._loadMoreButton.classList.toggle('hidden');
      }
      if(this._noMoreText.classList.contains('hidden')) {
        this._noMoreText.classList.toggle('hidden');
      }
    }
  }

  /**
   * Scrolls smoothly
   */
  _scrollByOneRow() {
    const firstRowItem = document.querySelector('ul.gallery li');
    if (firstRowItem) {
      const rowHeight = firstRowItem.offsetHeight + firstRowItem.offsetHeight; // Adding margin
      window.scrollBy({ top: rowHeight, behavior: 'smooth' });
    }
  }

  /**
   * Loads more images when the "Load more" button is clicked.
   * @returns {Promise<void>}
   * @private
   */
  async _loadMore(event) {
    event.preventDefault();
    this._page++;
    await this._onSearch(this._query);
    // Scroll to the gallery element after loading new images
    this._scrollByOneRow();
  }

  /**
   * Toggles the loader visibility.
   */
  _toggleLoader() {
    this._loader.classList.toggle('show');
  }
}

const search = new ImageSearch();
search.init().catch(error => {
  console.error(error);
});