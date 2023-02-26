const isAnger = (parameters: Record<string, number>) => {
  return (
    (parameters['are_eyes_squinting'] &&
      parameters['are_eyebrows_frowned'] &&
      parameters['is_mouth_pursed']) ||
    (parameters['are_eyes_squinting'] && parameters['are_eyebrows_frowned'])
  );
};

const isContempt = (parameters: Record<string, number>) => {
  return parameters['is_mouth_pursed'] && parameters['are_eyebrows_raised'];
};

const isDisgust = (parameters: Record<string, number>) => {
  return (
    parameters['are_eyes_squinting'] &&
    parameters['are_eyebrows_frowned'] &&
    parameters['is_mouth_grinning']
  );
};

const isFear = (parameters: Record<string, number>) => {
  return (
    (parameters['are_eyebrows_raised'] && parameters['is_mouth_grinning']) ||
    (parameters['are_eyebrows_frowned'] && parameters['is_mouth_grinning'])
  );
};

const isHappiness = (parameters: Record<string, number>) => {
  return (
    (parameters['are_eyebrows_raised'] && parameters['is_mouth_smiling']) ||
    (parameters['are_eyes_squinting'] && parameters['is_mouth_smiling'])
  );
};

const isSadness = (parameters: Record<string, number>) => {
  return parameters['is_mouth_sad'];
};

const isSurprise = (parameters: Record<string, number>) => {
  return parameters['are_eyebrows_raised'] && parameters['is_mouth_widely_open'];
};

export const getEmotion = (parameters: Record<string, number>): string => {
  if (isAnger(parameters)) {
    return 'злость';
  }
  if (isContempt(parameters)) {
    return 'презрение';
  }
  if (isDisgust(parameters)) {
    return 'отвращение';
  }
  if (isFear(parameters)) {
    return 'страх';
  }
  if (isHappiness(parameters)) {
    return 'счастье';
  }
  if (isSadness(parameters)) {
    return 'грусть';
  }
  if (isSurprise(parameters)) {
    return 'удивление';
  }
  return 'neutral';
};
