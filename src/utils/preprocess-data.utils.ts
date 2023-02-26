import { Tensor } from 'onnxjs';
import Jimp from 'jimp';

const addPaddingToImage = async (
  path: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
  height: number
): Promise<Jimp> => {
  const image: Jimp = await Jimp.read(path);
  await new Promise((resolve) => image.crop(x1, y1, x2 - x1, y2 - y1, resolve));
  await new Promise((resolve) => image.resize(width, height, resolve));
  await new Promise((resolve) => image.normalize(resolve));

  const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
  const blob = new Blob([buffer], { type: Jimp.MIME_PNG });
  console.log(URL.createObjectURL(blob));

  return image;
};

export const imageDataToTensor = (image: Jimp, dims: number[]): Tensor => {
  // 1. Get buffer data from image and create R, G, and B arrays.
  const imageBufferData = image.bitmap.data;
  const [redArray, greenArray, blueArray] = [
    new Array<number>(),
    new Array<number>(),
    new Array<number>()
  ];

  // 2. Loop through the image buffer and extract the R, G, and B channels
  for (let i = 0; i < imageBufferData.length; i += 4) {
    redArray.push(imageBufferData[i]);
    greenArray.push(imageBufferData[i + 1]);
    blueArray.push(imageBufferData[i + 2]);
    // skip imageBufferData[i + 3] to filter out the alpha channel
  }

  // 3. Concatenate RGB to transpose [224, 224, 3] -> [3, 224, 224] to a number array
  const transposedData = [...redArray, ...greenArray, ...blueArray];

  // 4. convert to float32
  let i: number;
  let l = transposedData.length;

  // create the Float32Array size (3 * 224 * 224) for these dimensions output
  const float32Data = new Float32Array(dims[1] * dims[2] * dims[3]);
  for (i = 0; i < l; ++i) {
    float32Data[i] = transposedData[i] / 255.0;
  }

  // 5. create the tensor object from onnxruntime-web
  return new Tensor(float32Data, 'float32', dims);
};

export const getTransformedImageTensorFromPath = async (
  path: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): Promise<Tensor> => {
  const image = await addPaddingToImage(path, x1, y1, x2, y2, 224, 224);
  return imageDataToTensor(image, [1, 3, 224, 224]);
};
