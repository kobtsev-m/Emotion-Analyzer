import cv from '@techstark/opencv-js';

let faceCascade: cv.CascadeClassifier;
const inputImage = new Image();
const minSize = new cv.Size(30, 30);

const loadDataFile = async (cvFilePath: string, url: string) => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const data = new Uint8Array(buffer);
  cv.FS_createDataFile('/', cvFilePath, data, true, false, false);
};

export const loadHaarFaceModels = async (): Promise<void> => {
  await loadDataFile(
    'haarcascade_frontalface_default.xml',
    'static/js/models/face-detection/haarcascade_frontalface_default.xml'
  );
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      faceCascade = new cv.CascadeClassifier();
      faceCascade.load('haarcascade_frontalface_default.xml');
      resolve();
    }, 2000);
  });
};

export const detectHaarFace = async (
  url: string
): Promise<[number, number, number, number, cv.Mat] | null> => {
  inputImage.src = url;
  await new Promise((resolve) => (inputImage.onload = resolve));

  const src = cv.imread(inputImage);
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

  const faces = new cv.RectVector();

  faceCascade.detectMultiScale(gray, faces, 1.1, 5, cv.CASCADE_SCALE_IMAGE, minSize);

  if (faces.size() == 0) {
    gray.delete();
    faces.delete();
    return null;
  }

  const x1 = faces.get(0).x;
  const y1 = faces.get(0).y;
  const x2 = faces.get(0).x + faces.get(0).width;
  const y2 = faces.get(0).y + faces.get(0).height;
  const point1 = new cv.Point(x1, y1);
  const point2 = new cv.Point(x2, y2);
  cv.rectangle(src, point1, point2, [255, 0, 0, 255]);

  gray.delete();
  faces.delete();

  return [x1, y1, x2, y2, src];
};
