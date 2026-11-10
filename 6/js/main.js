import { photos } from './data.js';

const COMMENTS_PER_STEP = 5;

const state = {
  filter: 'filter-default',
  commentsVisible: 0,
  currentPhoto: null,
};

const pictureTemplate = document.querySelector('#picture');
const picturesContainer = document.querySelector('.pictures');
const filterContainer = document.querySelector('.img-filters');
const filterButtons = Array.from(document.querySelectorAll('.img-filters__button'));
const uploadForm = document.querySelector('.img-upload__form');
const uploadInput = document.querySelector('#upload-file');
const uploadOverlay = document.querySelector('.img-upload__overlay');
const uploadCancel = document.querySelector('#upload-cancel');
const previewImage = document.querySelector('.img-upload__preview img');
const scaleValue = document.querySelector('.scale__control--value');
const scaleDecrease = document.querySelector('.scale__control--smaller');
const scaleIncrease = document.querySelector('.scale__control--bigger');
const hashtagsInput = document.querySelector('.text__hashtags');
const descriptionInput = document.querySelector('.text__description');
const bigPicture = document.querySelector('.big-picture');
const closeBigPictureButton = document.querySelector('#picture-cancel');
const bigPictureImage = document.querySelector('.big-picture__img img');
const bigPictureLikes = document.querySelector('.likes-count');
const bigPictureCaption = document.querySelector('.social__caption');
const commentsList = document.querySelector('.social__comments');
const commentsCount = document.querySelector('.social__comment-count');
const commentsLoader = document.querySelector('.social__comments-loader');
const commentInput = document.querySelector('.social__footer-text');
const commentSubmitButton = document.querySelector('.social__footer-btn');

function shuffle(items) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
  }

  return nextItems;
}

function getFilteredPhotos() {
  let nextPhotos = [...photos];

  switch (state.filter) {
    case 'filter-random':
      nextPhotos = shuffle(nextPhotos).slice(0, 10);
      break;
    case 'filter-discussed':
      nextPhotos.sort((left, right) => right.comments.length - left.comments.length);
      break;
    default:
      nextPhotos = [...photos];
      break;
  }

  return nextPhotos;
}

function renderPictures() {
  const filteredPhotos = getFilteredPhotos();

  picturesContainer.querySelectorAll('.picture').forEach((picture) => picture.remove());

  filteredPhotos.forEach((photo) => {
    const pictureElement = pictureTemplate.content.firstElementChild.cloneNode(true);
    const image = pictureElement.querySelector('.picture__img');
    const comments = pictureElement.querySelector('.picture__comments');
    const likes = pictureElement.querySelector('.picture__likes');

    pictureElement.dataset.id = String(photo.id);
    image.src = photo.url;
    image.alt = photo.description;
    comments.textContent = String(photo.comments.length);
    likes.textContent = String(photo.likes);

    picturesContainer.append(pictureElement);
  });
}

function setActiveFilter(buttonId) {
  filterButtons.forEach((button) => {
    button.classList.toggle('img-filters__button--active', button.id === buttonId);
  });
}

function renderCommentList() {
  const comments = state.currentPhoto.comments;
  const visibleComments = Math.min(state.commentsVisible, comments.length);

  commentsList.innerHTML = '';

  comments.slice(0, visibleComments).forEach((comment) => {
    const item = document.createElement('li');
    item.className = 'social__comment';

    item.innerHTML = `
      <img class="social__picture" src="${comment.avatar}" alt="Аватар комментатора фотографии" width="35" height="35">
      <p class="social__text">${comment.message}</p>
    `;

    commentsList.append(item);
  });

  commentsCount.textContent = `${visibleComments} из ${comments.length} комментариев`;
  commentsLoader.hidden = visibleComments >= comments.length;
}

function openBigPicture(photo) {
  state.currentPhoto = photo;
  state.commentsVisible = COMMENTS_PER_STEP;

  bigPicture.classList.remove('hidden');
  document.body.classList.add('modal-open');

  bigPictureImage.src = photo.url;
  bigPictureImage.alt = photo.description;
  bigPictureLikes.textContent = String(photo.likes);
  bigPictureCaption.textContent = photo.description;
  document.querySelector('.comments-count').textContent = String(photo.comments.length);

  renderCommentList();
}

function closeBigPicture() {
  bigPicture.classList.add('hidden');
  document.body.classList.remove('modal-open');
  state.currentPhoto = null;
  state.commentsVisible = 0;
}

function closeUploadOverlay() {
  uploadOverlay.classList.add('hidden');
  uploadForm.reset();
  previewImage.src = 'img/upload-default-image.jpg';
  previewImage.style.filter = 'none';
  previewImage.style.transform = 'scale(1)';
  scaleValue.value = '100%';
  hashtagsInput.setCustomValidity('');
  descriptionInput.setCustomValidity('');
}

function validateHashtags() {
  const rawValue = hashtagsInput.value.trim();

  if (!rawValue) {
    hashtagsInput.setCustomValidity('');
    return true;
  }

  const tags = rawValue.split(/\s+/);

  if (tags.length > 5) {
    hashtagsInput.setCustomValidity('Не более 5 хэштегов.');
    return false;
  }

  const normalizedTags = tags.map((tag) => tag.toLowerCase());
  const uniqueTags = new Set(normalizedTags);

  if (uniqueTags.size !== normalizedTags.length) {
    hashtagsInput.setCustomValidity('Хэштеги не должны повторяться.');
    return false;
  }

  const isValid = normalizedTags.every((tag) => /^#[a-zа-яё0-9]+$/i.test(tag) && tag.length <= 21);

  if (!isValid) {
    hashtagsInput.setCustomValidity('Хэштег должен начинаться с #, содержать не более 20 символов и не повторяться.');
    return false;
  }

  hashtagsInput.setCustomValidity('');
  return true;
}

function validateDescription() {
  const comment = descriptionInput.value.trim();

  if (comment.length <= 140) {
    descriptionInput.setCustomValidity('');
    return true;
  }

  descriptionInput.setCustomValidity('Комментарий не должен быть длиннее 140 символов.');
  return false;
}

function showMessage(type) {
  const template = document.querySelector(`#${type}`);
  const message = template.content.firstElementChild.cloneNode(true);

  document.body.append(message);

  const button = message.querySelector('button');

  if (button) {
    button.addEventListener('click', () => message.remove());
  }

  const closeMessage = () => message.remove();

  message.addEventListener('click', (event) => {
    if (event.target === message) {
      closeMessage();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.contains(message)) {
      closeMessage();
      document.removeEventListener('keydown', this);
    }
  });
}

function addComment() {
  const text = commentInput.value.trim();

  if (!text) {
    return;
  }

  state.currentPhoto.comments.push({
    avatar: 'img/avatar-6.svg',
    name: 'Вы',
    message: text,
  });

  commentInput.value = '';
  state.commentsVisible = Math.min(state.commentsVisible + 1, state.currentPhoto.comments.length);
  renderCommentList();
}

function applyEffect(effectName) {
  const effectValue = {
    none: 'none',
    chrome: 'grayscale(1)',
    sepia: 'sepia(1)',
    marvin: 'invert(100%)',
    phobos: 'blur(3px)',
    heat: 'brightness(3)',
  };

  previewImage.style.filter = effectValue[effectName] || 'none';
}

function updateScale(nextScale) {
  const value = Math.min(100, Math.max(25, nextScale));
  previewImage.style.transform = `scale(${value / 100})`;
  scaleValue.value = `${value}%`;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    state.filter = button.id;
    setActiveFilter(button.id);
    renderPictures();
  });
});

picturesContainer.addEventListener('click', (event) => {
  const link = event.target.closest('.picture');

  if (!link) {
    return;
  }

  event.preventDefault();

  const photoId = Number(link.dataset.id);
  const photo = photos.find((item) => item.id === photoId);

  if (photo) {
    openBigPicture(photo);
  }
});

closeBigPictureButton.addEventListener('click', closeBigPicture);
commentsLoader.addEventListener('click', () => {
  state.commentsVisible += COMMENTS_PER_STEP;
  renderCommentList();
});

uploadInput.addEventListener('change', (event) => {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  previewImage.src = URL.createObjectURL(file);
  uploadOverlay.classList.remove('hidden');
});

uploadCancel.addEventListener('click', closeUploadOverlay);
scaleDecrease.addEventListener('click', () => updateScale(Number.parseInt(scaleValue.value, 10) - 25));
scaleIncrease.addEventListener('click', () => updateScale(Number.parseInt(scaleValue.value, 10) + 25));

document.querySelectorAll('.effects__radio').forEach((radio) => {
  radio.addEventListener('change', (event) => applyEffect(event.target.value));
});

hashtagsInput.addEventListener('input', () => {
  validateHashtags();
  hashtagsInput.reportValidity();
});

descriptionInput.addEventListener('input', () => {
  validateDescription();
  descriptionInput.reportValidity();
});

commentSubmitButton.addEventListener('click', addComment);

uploadForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const hashtagIsValid = validateHashtags();
  const descriptionIsValid = validateDescription();

  if (!hashtagIsValid || !descriptionIsValid) {
    hashtagsInput.reportValidity();
    descriptionInput.reportValidity();
    return;
  }

  showMessage('success');
  closeUploadOverlay();
});

uploadForm.addEventListener('reset', closeUploadOverlay);

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') {
    return;
  }

  if (!bigPicture.classList.contains('hidden')) {
    closeBigPicture();
    return;
  }

  if (!uploadOverlay.classList.contains('hidden')) {
    closeUploadOverlay();
  }
});

filterContainer.classList.remove('img-filters--inactive');
setActiveFilter(state.filter);
renderPictures();
closeBigPicture();
closeUploadOverlay();
