import { getRandomArrayElement, getRandomInteger } from './utils.js';

const PHOTO_COUNT = 25;
const MIN_LIKES = 15;
const MAX_LIKES = 200;
const MIN_COMMENT_COUNT = 0;
const MAX_COMMENT_COUNT = 30;

const DESCRIPTIONS = [
  'Тестим новую камеру!',
  'Забавный момент с друзьями',
  'Летний день на побережье',
  'Уютный завтрак дома',
  'Путешествие в горы',
  'Вечерний городской пейзаж',
  'Наблюдаю за закатом',
  'Новая поездка и впечатления',
  'Осенний день в городе',
  'Всё отлично!'
];

const NAMES = ['Артём', 'Мария', 'Иван', 'Елена', 'Олег', 'Анна', 'Сергей', 'Полина'];

const MESSAGES = [
  'Всё очень хорошо. Но не всё.',
  'Когда вы делаете фотографию, хорошо бы убирать палец из кадра.',
  'В конце концов это просто непрофессионально.',
  'Моя бабушка случайно чихнула с фотоаппаратом в руках и у неё получилась фотография лучше.',
  'Я поскользнулся на банановой корке и уронил фотоаппарат на кота и у меня получилась фотография лучше.',
  'Лица у людей на фотке перекошены, как будто их избивают. Как можно было поймать такой неудачный момент?!',
  'Надо бы всё же любить и признавать, что в целом всё прекрасно.'
];

const createComment = (id) => ({
  id,
  avatar: `img/avatar-${getRandomInteger(1, 6)}.svg`,
  message: getRandomArrayElement(MESSAGES),
  name: getRandomArrayElement(NAMES),
});

const createPhoto = (id) => ({
  id,
  url: `photos/${id}.jpg`,
  description: getRandomArrayElement(DESCRIPTIONS),
  likes: getRandomInteger(MIN_LIKES, MAX_LIKES),
  comments: Array.from(
    { length: getRandomInteger(MIN_COMMENT_COUNT, MAX_COMMENT_COUNT) },
    (_, index) => createComment(index + 1)
  )
});

const photos = Array.from({ length: PHOTO_COUNT }, (_, index) => createPhoto(index + 1));

export { photos, PHOTO_COUNT, MIN_LIKES, MAX_LIKES, MIN_COMMENT_COUNT, MAX_COMMENT_COUNT };
