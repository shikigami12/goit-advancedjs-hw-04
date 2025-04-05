import axios from 'axios';

/**
 * Configuration for Pixabay API requests
 */
class RequestConfig {
  /**
   * Creates a new request configuration with default parameters
   */
  constructor() {
    this.params = {
      key: '',
      q: '',
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 15,
      page: 1,
    };
  }

  /**
   * Sets the API key for authentication
   * @param {string} apiKey - Pixabay API key
   */
  setApiKey(apiKey) {
    this.params.key = apiKey;
  }

  /**
   * Sets the search query
   * @param {string} query - Search term
   */
  setQuery(query) {
    this.params.q = query;
  }

  /**
   * Sets the page number for pagination
   * @param {number} page - Page number
   */
  setPage(page) {
    this.params.page = page;
  }
}

/**
 * Class representing a single image from Pixabay
 */
class ResponseModel {
  constructor(response) {
    this.hits = response.hits;
    this.total = response.total;
    this.totalHits = response.totalHits;
  }
}

/**
 * Client for interacting with Pixabay API
 */
class PixabayApi {
  /**
   * Creates a new Pixabay API client
   * @param {string} apiKey - Pixabay API key
   */
  constructor(apiKey) {
    this.apiKey = apiKey;
    axios.defaults.baseURL = 'https://pixabay.com/api/';
  }

  /**
   * Fetches images matching the provided query
   * @param {string} query - Search term
   * @param {number} page - Page number for pagination
   * @returns {Promise<ResponseModel>} - Promise resolving to array of image objects
   */
  async fetchImages(query, page = 1) {
    const config = new RequestConfig();
    config.setApiKey(this.apiKey);
    config.setQuery(query);
    config.setPage(page);

    const response = await this._get('', config);
    return new ResponseModel(response);
  }

  /**
   * Makes a GET request to the API
   * @param {string} url - API endpoint
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} - Promise resolving to API response data
   * @private
   */
  _get(url, config) {
    return axios.get(url, config)
      .then(response => response.data)
      .catch(error => this._onError(error, url, config));
  }

  /**
   * Handles API errors with rate limit retry logic
   * @param error - Error object from axios
   * @param {string} url - Original request URL
   * @param {Object} config - Original request configuration
   * @returns {Promise<Object>} - Promise that may retry the request
   * @private
   */
  _onError(error, url, config) {
    if (error.status === 429) {
      const retryAfter = error.response.headers['x-ratelimit-reset'] ||
        error.response.headers['X-RateLimit-Reset'] ||
        60;
      console.warn(`Rate limit exceeded. Retrying after ${retryAfter} seconds...`);

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this._get(url, config));
        }, retryAfter * 1000);
      });
    } else {
      console.error('Error fetching images:', error);
      throw error;
    }
  }
}

export { PixabayApi, RequestConfig };