/**
 * Class representing a Pixabay image hit response.
 */
class PixabayImage {
  /**
   * Create a PixabayImage.
   * @param {Object} data - The image data.
   * @param {number} data.id - The image ID.
   * @param {string} data.type - The type of the image.
   * @param {string} data.tags - The tags associated with the image.
   * @param {string} data.webformatURL - The URL of the web format image.
   * @param {string} data.largeImageURL - The URL of the original image.
   * @param {number} data.views - The number of views.
   * @param {number} data.downloads - The number of downloads.
   * @param {number} data.likes - The number of likes.
   * @param {number} data.comments - The number of comments.
   * @param {string} data.user - The username of the user who uploaded the image.
   */
  constructor(data) {
    this.id = data.id;
    this.type = data.type;
    this.tags = data.tags;
    this.webformatURL = data.webformatURL;
    this.imageURL = data.largeImageURL;
    this.views = data.views;
    this.downloads = data.downloads;
    this.likes = data.likes;
    this.comments = data.comments;
    this.user = data.user;
  }
}

/**
 * Class for rendering an image.
 */
class ImageRenderer {
  constructor() {
    this._imageElement = document.createElement('img');
  }

  /**
   * Sets the image source and alt text.
   * @param {PixabayImage} image - The image to render.
   */
  setImage(image) {
    this._imageElement.src = image.webformatURL;
    this._imageElement.alt = image.tags;
    this._imageElement.width = 360;
    this._imageElement.height = 200;
    this._imageElement.title = image.tags;
    this._imageElement.setAttribute('data-id', image.id.toString());
    this._imageElement.setAttribute('data-user', image.user);
  }

  /**
   * Renders the image element.
   * @returns {HTMLImageElement} - The image element.
   */
  render() {
    return this._imageElement;
  }
}

/**
 * Class for rendering a gallery of images.
 */
class GalleryRenderer {
  /**
   * Creates a new GalleryRenderer.
   * @param {string} gallerySelector - The CSS class for the gallery.
   * @param {Element} parentElement - The parent element to append the gallery to.
   */
  constructor(gallerySelector, parentElement) {
    this._parentElement = parentElement;
    if (!this._parentElement) {
      throw new Error(`Parent element ${parentElement} not found`);
    }

    // if parent element already has a child with the same class, use that
    const existingGallery = this._parentElement.querySelector(`.${gallerySelector}`);
    if (existingGallery) {
      this._galleryElement = existingGallery;
      return;
    }

    // create a new gallery element
    this._galleryElement = document.createElement('ul');
    this._galleryElement.classList.add(gallerySelector);
  }

  /**
   * Adds an image to the gallery.
   * @param {PixabayImage} image - The image to add.
   */
  addImage(image) {
    const imageRenderer = new ImageRenderer();
    imageRenderer.setImage(image);
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = image.imageURL;
    link.append(imageRenderer.render());
    link.append(this._generateDescription(image));
    listItem.appendChild(link);
    this._galleryElement.appendChild(listItem);
  }

  /**
   * Generates a description table for the image.
   * @param {PixabayImage} image - The image to describe.
   * @returns {HTMLTableElement} - The description table.
   * @private
   */
  _generateDescription(image) {
    const headers = ['Likes', 'Views', 'Comments', 'Downloads'];
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
    const valuesRow = document.createElement('tr');
    const values = [
      image.likes,
      image.views,
      image.comments,
      image.downloads,
    ];
    values.forEach(value => {
      const td = document.createElement('td');
      td.textContent = `${value}`;
      valuesRow.appendChild(td);
    });
    table.appendChild(valuesRow);
    return table;
  }

  /**
   * Renders the gallery.
   */
  render() {
    if (!this._parentElement) {
      throw new Error(`Parent element ${this._parentElement} not found`);
    }

    this._parentElement.appendChild(this._galleryElement);
  }

  /**
   * Clears the gallery.
   */
  clear() {
    this._galleryElement.innerHTML = '';
    this._parentElement.innerHTML = '';
  }
}

export { GalleryRenderer, PixabayImage, ImageRenderer };