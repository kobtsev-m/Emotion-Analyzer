import * as ort from 'onnxruntime-web';
import { getEmotion } from './logic-model.utils';
import { LABELS_RU, PARAMETERS_EN } from '../constants/emotion.constants';

ort.env.wasm.numThreads = 4;
ort.env.wasm.simd = true;
ort.env.wasm.proxy = true;

const sessions: Record<string, ort.InferenceSession> = {};

const runModel = async (
  preprocessedData: ort.TypedTensor<'float32'>,
  modelVersion: string
): Promise<ort.TypedTensor<'float32'>> => {
  if (!sessions[modelVersion]) {
    sessions[modelVersion] = await ort.InferenceSession.create(`/models/${modelVersion}`, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all'
    });
  }
  const session = sessions[modelVersion];
  const feeds: Record<string, ort.TypedTensor<'float32'>> = {};
  feeds[session.inputNames[0]] = preprocessedData;
  const outputData = await session.run(feeds);
  const output = outputData[session.outputNames[0]];
  return <ort.TypedTensor<'float32'>>output;
};

const getArgmax = (prediction: ort.TypedTensor<'float32'>) => {
  let maxValue = -Infinity;
  let maxValueI = -Infinity;
  for (let i = 0; i < prediction.data.length; ++i) {
    if (prediction.data[i] > maxValue) {
      maxValue = prediction.data[i];
      maxValueI = i;
    }
  }
  return maxValueI;
};

export const runV1 = async (
  version: number,
  preprocessedImage: ort.TypedTensor<'float32'>
): Promise<[string, null]> => {
  const prediction = await runModel(preprocessedImage, `v1/emotion-net-v1.${version}.onnx`);
  const predictionTarget = getArgmax(prediction);
  return [LABELS_RU[predictionTarget], null];
};

export const runV2 = async (
  version: number,
  preprocessedImage: ort.TypedTensor<'float32'>
): Promise<[string, any]> => {
  const predictions: ort.TypedTensor<'float32'>[] = [];
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
