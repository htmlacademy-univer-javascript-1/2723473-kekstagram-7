const DATA_URL = 'https://29.javascript.htmlacademy.pro/kekstagram/data';
const SEND_URL = 'https://29.javascript.htmlacademy.pro/kekstagram';
const MAX_HASHTAGS = 5;
const MAX_HASHTAG_LENGTH = 20;
const MAX_COMMENT_LENGTH = 140;
const COMMENTS_STEP = 5;
const SCALE_STEP = 25;
const SCALE_MIN = 25;
const SCALE_MAX = 100;
const FILTER_DELAY = 500;

const uploadForm = document.querySelector('.img-upload__form');
const uploadInput = document.querySelector('#upload-file');
const uploadOverlay = document.querySelector('.img-upload__overlay');
const uploadCancel = document.querySelector('.img-upload__cancel');
const uploadPreview = document.querySelector('.img-upload__preview img');
const uploadScale = document.querySelector('.scale__control--value');
const scaleSmaller = document.querySelector('.scale__control--smaller');
const scaleBigger = document.querySelector('.scale__control--bigger');
const effectSliderContainer = document.querySelector('.img-upload__effect-level');
const effectSlider = document.querySelector('.effect-level__slider');
const effectValue = document.querySelector('.effect-level__value');
const effectsForm = document.querySelector('.img-upload__effects');
const hashtagInput = document.querySelector('.text__hashtags');
const descriptionInput = document.querySelector('.text__description');
const submitButton = document.querySelector('.img-upload__submit');
const picturesContainer = document.querySelector('.pictures');
const filtersSection = document.querySelector('.img-filters');
const filtersForm = document.querySelector('.img-filters__form');
const pictureTemplate = document.querySelector('#picture').content.querySelector('.picture');
const bigPicture = document.querySelector('.big-picture');
const bigPictureImage = bigPicture.querySelector('.big-picture__img img');
const bigPictureCaption = bigPicture.querySelector('.social__caption');
const bigPictureLikes = bigPicture.querySelector('.likes-count');
const bigPictureComments = bigPicture.querySelector('.social__comments');
const commentsCount = bigPicture.querySelector('.social__comment-count');
const commentsCountValue = commentsCount.querySelector('.comments-count');
const commentsLoader = bigPicture.querySelector('.social__comments-loader');
const bigPictureCancel = bigPicture.querySelector('.big-picture__cancel');
const successTemplate = document.querySelector('#success');
const errorTemplate = document.querySelector('#error');
const body = document.body;

const effects = {
  none: {
    filter: '',
    min: 0,
    max: 100,
    step: 1,
    start: 100,
    format: () => '',
  },
  chrome: {
    filter: 'grayscale',
    min: 0,
    max: 1,
    step: 0.1,
    start: 1,
    format: (value) => `grayscale(${value})`,
  },
  sepia: {
    filter: 'sepia',
    min: 0,
    max: 1,
    step: 0.1,
    start: 1,
    format: (value) => `sepia(${value})`,
  },
  marvin: {
    filter: 'invert',
    min: 0,
    max: 100,
    step: 1,
    start: 100,
    format: (value) => `invert(${value}%)`,
  },
  phobos: {
    filter: 'blur',
    min: 0,
    max: 3,
    step: 0.1,
    start: 3,
    format: (value) => `blur(${value}px)`,
  },
  heat: {
    filter: 'brightness',
    min: 1,
    max: 3,
    step: 0.1,
    start: 3,
    format: (value) => `brightness(${value})`,
  },
};

let photos = [];
let currentPhoto = null;
let displayedComments = 0;
let currentScale = SCALE_MAX;
let currentEffect = 'none';
let previewUrl = null;
let activeMessage = null;
let pristine = null;

const checkResponse = (response) => {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response;
};

const showLoadError = () => {
  const error = document.createElement('p');
  error.className = 'load-error';
  error.textContent = 'Не удалось загрузить фотографии. Обновите страницу и попробуйте ещё раз.';
  picturesContainer.append(error);
};

const removePictures = () => {
  picturesContainer.querySelectorAll('.picture').forEach((picture) => picture.remove());
};

const renderNextComments = () => {
  if (!currentPhoto) {
    return;
  }

  const nextComments = currentPhoto.comments.slice(displayedComments, displayedComments + COMMENTS_STEP);
  const fragment = document.createDocumentFragment();

  nextComments.forEach((comment) => {
    const item = document.createElement('li');
    const avatar = document.createElement('img');
    const text = document.createElement('p');

    item.className = 'social__comment';
    avatar.className = 'social__picture';
    avatar.src = comment.avatar;
    avatar.alt = comment.name;
    avatar.title = comment.name;
    avatar.width = 35;
    avatar.height = 35;
    text.className = 'social__text';
    text.textContent = comment.message;
    item.append(avatar, text);
    fragment.append(item);
  });

  bigPictureComments.append(fragment);
  displayedComments += nextComments.length;
  commentsCountValue.textContent = currentPhoto.comments.length;
  commentsCount.firstChild.textContent = `${displayedComments} из `;

  if (displayedComments >= currentPhoto.comments.length) {
    commentsLoader.classList.add('hidden');
  } else {
    commentsLoader.classList.remove('hidden');
  }
};

const closeBigPicture = () => {
  bigPicture.classList.add('hidden');
  body.classList.remove('modal-open');
  bigPictureCancel.removeEventListener('click', closeBigPicture);
};

const openBigPicture = (photo) => {
  currentPhoto = photo;
  bigPictureImage.src = photo.url;
  bigPictureImage.alt = photo.description;
  bigPictureLikes.textContent = photo.likes;
  bigPictureCaption.textContent = photo.description;
  bigPicture.classList.remove('hidden');
  body.classList.add('modal-open');

  bigPictureComments.replaceChildren();
  displayedComments = 0;
  renderNextComments();

  bigPictureCancel.addEventListener('click', closeBigPicture);
};

commentsLoader.addEventListener('click', renderNextComments);

const createPicture = (photo) => {
  const picture = pictureTemplate.cloneNode(true);
  const image = picture.querySelector('.picture__img');

  image.src = photo.url;
  image.alt = photo.description;
  picture.querySelector('.picture__likes').textContent = photo.likes;
  picture.querySelector('.picture__comments').textContent = photo.comments.length;
  picture.addEventListener('click', (evt) => {
    evt.preventDefault();
    openBigPicture(photo);
  });

  return picture;
};

const renderPhotos = (items) => {
  const fragment = document.createDocumentFragment();
  items.forEach((photo) => fragment.append(createPicture(photo)));
  picturesContainer.append(fragment);
};

const debounce = (callback, delay) => {
  let timeoutId;

  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), delay);
  };
};

const getFilteredPhotos = (filterId) => {
  switch (filterId) {
    case 'filter-random': {
      const shuffled = photos.slice();
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
      }
      return shuffled.slice(0, 10);
    }
    case 'filter-discussed':
      return photos.slice().sort((first, second) => second.comments.length - first.comments.length);
    default:
      return photos;
  }
};

const rerenderPhotos = debounce((filterId) => {
  removePictures();
  renderPhotos(getFilteredPhotos(filterId));
}, FILTER_DELAY);

filtersForm.addEventListener('click', (evt) => {
  const button = evt.target.closest('.img-filters__button');
  if (!button) {
    return;
  }

  const activeButton = filtersForm.querySelector('.img-filters__button--active');
  if (activeButton) {
    activeButton.classList.remove('img-filters__button--active');
  }
  button.classList.add('img-filters__button--active');
  rerenderPhotos(button.id);
});

const loadPhotos = () => fetch(DATA_URL)
  .then(checkResponse)
  .then((response) => response.json())
  .then((data) => {
    if (!Array.isArray(data)) {
      throw new Error('Photo response is not an array');
    }
    photos = data;
    renderPhotos(photos);
    filtersSection.classList.remove('img-filters--inactive');
  })
  .catch(() => showLoadError());

const updateScale = () => {
  uploadScale.value = `${currentScale}%`;
  uploadPreview.style.transform = `scale(${currentScale / 100})`;
};

scaleSmaller.addEventListener('click', () => {
  currentScale = Math.max(SCALE_MIN, currentScale - SCALE_STEP);
  updateScale();
});

scaleBigger.addEventListener('click', () => {
  currentScale = Math.min(SCALE_MAX, currentScale + SCALE_STEP);
  updateScale();
});

const applyEffect = () => {
  const effect = effects[currentEffect];
  const value = Number(effectValue.value);
  uploadPreview.style.filter = effect.format(value);
};

noUiSlider.create(effectSlider, {
  range: {
    min: 0,
    max: 100,
  },
  start: 100,
  step: 1,
  connect: 'lower',
});

effectSlider.noUiSlider.on('update', (values, handle) => {
  effectValue.value = values[handle];
  applyEffect();
});

const setEffect = (effectName) => {
  currentEffect = effectName;
  const effect = effects[effectName];
  effectSlider.noUiSlider.updateOptions({
    range: {
      min: effect.min,
      max: effect.max,
    },
    step: effect.step,
  });
  effectSlider.noUiSlider.set(effect.start);
  effectSliderContainer.classList.toggle('hidden', effectName === 'none');

  if (effectName === 'none') {
    uploadPreview.style.removeProperty('filter');
    effectValue.value = '';
  }
};

effectsForm.addEventListener('change', (evt) => {
  if (evt.target.matches('.effects__radio')) {
    setEffect(evt.target.value);
  }
});

const setPreviewImage = (imageUrl) => {
  uploadPreview.src = imageUrl;
  document.querySelectorAll('.effects__preview').forEach((preview) => {
    preview.style.backgroundImage = `url("${imageUrl}")`;
  });
};

const resetEditor = () => {
  uploadForm.reset();
  if (pristine) {
    pristine.reset();
  }
  currentScale = SCALE_MAX;
  currentEffect = 'none';
  updateScale();
  setEffect('none');
  setPreviewImage('img/upload-default-image.jpg');
  uploadOverlay.classList.add('hidden');
  body.classList.remove('modal-open');
  uploadInput.value = '';

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }
};

const openEditor = (file) => {
  if (!file) {
    return;
  }

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
  previewUrl = URL.createObjectURL(file);
  setPreviewImage(previewUrl);
  uploadOverlay.classList.remove('hidden');
  body.classList.add('modal-open');
  currentScale = SCALE_MAX;
  updateScale();
  setEffect('none');
  hashtagInput.focus();
};

uploadInput.addEventListener('change', () => openEditor(uploadInput.files[0]));
uploadCancel.addEventListener('click', resetEditor);

const splitHashtags = (value) => value.trim().split(/\s+/).filter(Boolean);

const hasValidHashtags = (value) => splitHashtags(value).every((hashtag) => (
  new RegExp(`^#[a-zа-яё0-9]{1,${MAX_HASHTAG_LENGTH - 1}}$`, 'i').test(hashtag)
));

const hasFewHashtags = (value) => splitHashtags(value).length <= MAX_HASHTAGS;

const hasUniqueHashtags = (value) => {
  const normalized = splitHashtags(value).map((hashtag) => hashtag.toLowerCase());
  return new Set(normalized).size === normalized.length;
};

pristine = new Pristine(uploadForm, {
  classTo: 'img-upload__field-wrapper',
  errorClass: 'has-danger',
  successClass: 'has-success',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextClass: 'pristine-error',
});

pristine.addValidator(
  hashtagInput,
  hasValidHashtags,
  'Хэштег должен начинаться с # и содержать только буквы и цифры (до 20 символов).',
  3,
  false
);
pristine.addValidator(
  hashtagInput,
  hasFewHashtags,
  `Нельзя указать больше ${MAX_HASHTAGS} хэштегов.`,
  2,
  false
);
pristine.addValidator(
  hashtagInput,
  hasUniqueHashtags,
  'Хэштеги не должны повторяться.',
  1,
  false
);
pristine.addValidator(
  descriptionInput,
  (value) => value.length <= MAX_COMMENT_LENGTH,
  `Комментарий не может быть длиннее ${MAX_COMMENT_LENGTH} символов.`,
  1,
  false
);

const removeMessage = () => {
  if (activeMessage) {
    activeMessage.remove();
    activeMessage = null;
  }
};

const onMessageKeydown = (evt) => {
  if (evt.key === 'Escape') {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    removeMessage();
    document.removeEventListener('keydown', onMessageKeydown);
  }
};

const showMessage = (template, title, buttonText) => {
  removeMessage();
  activeMessage = template.content.firstElementChild.cloneNode(true);
  activeMessage.querySelector('h2').textContent = title;
  const button = activeMessage.querySelector('button');
  button.textContent = buttonText;
  document.body.append(activeMessage);

  const closeMessage = () => {
    removeMessage();
    document.removeEventListener('keydown', onMessageKeydown);
  };

  button.addEventListener('click', closeMessage, { once: true });
  activeMessage.addEventListener('click', (evt) => {
    if (!evt.target.closest('.error__inner, .success__inner')) {
      closeMessage();
    }
  });
  document.addEventListener('keydown', onMessageKeydown);
};

uploadForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  if (!pristine.validate()) {
    return;
  }

  submitButton.disabled = true;
  fetch(SEND_URL, {
    method: 'POST',
    body: new FormData(uploadForm),
  })
    .then(checkResponse)
    .then(() => {
      resetEditor();
      showMessage(successTemplate, 'Изображение успешно загружено', 'Круто!');
    })
    .catch(() => {
      showMessage(errorTemplate, 'Не удалось загрузить изображение', 'Попробовать ещё раз');
    })
    .finally(() => {
      submitButton.disabled = false;
    });
});

document.addEventListener('keydown', (evt) => {
  if (evt.key !== 'Escape') {
    return;
  }

  if (activeMessage) {
    return;
  }

  if (evt.target.matches('.text__hashtags, .text__description')) {
    return;
  }

  if (!bigPicture.classList.contains('hidden')) {
    closeBigPicture();
  } else if (!uploadOverlay.classList.contains('hidden')) {
    resetEditor();
  }
});

loadPhotos();
