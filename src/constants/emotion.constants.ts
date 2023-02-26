export const LABELS_RU = [
  'злость',
  'презрение',
  'счастье',
  'страх',
  'отвращение',
  'удивление',
  'нейтральная',
  'грусть'
];

export const PARAMETERS_EN = [
  'are_eyes_squinting',
  'are_eyebrows_raised',
  'are_eyebrows_frowned',
  'is_mouth_widely_open',
  'is_mouth_smiling',
  'is_mouth_sad',
  'is_mouth_grinning',
  'is_mouth_pursed'
];

export const parameterEn2Ru = (parameter: string) => {
  switch (parameter) {
    case 'are_eyes_squinting':
      return 'Глаза прищурены';
    case 'are_eyebrows_raised':
      return 'Брови подняты';
    case 'are_eyebrows_frowned':
      return 'Брови нахмурены';
    case 'is_mouth_widely_open':
      return 'Рот широко открыт';
    case 'is_mouth_grinning':
      return 'Рот искривлен';
    case 'is_mouth_pursed':
      return 'Рот сжат';
    case 'is_mouth_smiling':
      return 'Человек улыбается';
    case 'is_mouth_sad':
      return 'Уголки губ опущены вниз';
  }
};
