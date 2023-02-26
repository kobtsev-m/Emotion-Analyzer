import { getEmotion } from './logic-model.utils';
import { LABELS_RU, PARAMETERS_EN } from '../constants/emotion.constants';
import { InferenceSession, Tensor } from 'onnxjs';

const sessions: Record<string, InferenceSession> = {};

const getModelVersions = (version1: number, version2: number) => [
  `v1/emotion-net-v1.${version1}.onnx`,
  ...PARAMETERS_EN.map((_, i) => `v2/emotion-net-v2.${version2}.${i + 1}.onnx`)
];

export const loadEmotionModels = (version1: number, version2: number) => {
  const modelVersions = getModelVersions(version1, version2);
  return Promise.all(
    modelVersions.map((modelVersion) => {
      sessions[modelVersion] = new InferenceSession({ backendHint: 'webgl' });
      return sessions[modelVersion].loadModel(`models/${modelVersion}`);
    })
  );
};

const runModel = async (preprocessedData: Tensor, modelVersion: string): Promise<Tensor> => {
  const session = sessions[modelVersion];
  const outputMap = await session.run([preprocessedData]);
  const output = outputMap.values().next().value;
  return output;
};

const getArgmax = (prediction: Tensor) => {
  let maxValue = -Infinity;
  let maxValueI = -Infinity;
  for (let i = 0; i < prediction.data.length; ++i) {
    if (prediction.data[i] > maxValue) {
      maxValue = <number>prediction.data[i];
      maxValueI = i;
    }
  }
  return maxValueI;
};

export const runV1 = async (
  version: number,
  preprocessedImage: Tensor
): Promise<[string, null]> => {
  const prediction = await runModel(preprocessedImage, `v1/emotion-net-v1.${version}.onnx`);
  const predictionTarget = getArgmax(prediction);
  return [LABELS_RU[predictionTarget], null];
};

export const runV2 = async (version: number, preprocessedImage: Tensor): Promise<[string, any]> => {
  const predictions: Tensor[] = [];
  for (let i = 0; i < PARAMETERS_EN.length; ++i) {
    const prediction = await runModel(
      preprocessedImage,
      `v2/emotion-net-v2.${version}.${i + 1}.onnx`
    );
    predictions.push(prediction);
  }
  const parameters = predictions.reduce((acc, prediction, i) => {
    acc[PARAMETERS_EN[i]] = getArgmax(prediction);
    return acc;
  }, <Record<string, number>>{});
  return [getEmotion(parameters), parameters];
};
