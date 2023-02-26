import * as _ from 'lodash';
import React, { Fragment, useRef, useState } from 'react';
import Webcam, { WebcamProps } from 'react-webcam';
import cv from '@techstark/opencv-js';
import { Box, Button, CircularProgress, Divider, Paper, Stack, Typography } from '@mui/material';
import { detectHaarFace } from '../utils/face-detection.utils';
import { getTransformedImageTensorFromPath } from '../utils/preprocess-data.utils';
import { parameterEn2Ru } from '../constants/emotion.constants';
import { toast } from 'react-toastify';
import { Tensor } from 'onnxjs';

const WEBCAM_W = 320;
const WEBCAM_H = 200;
const BORDER_STYLE = '1px solid rgb(0 0 0 / 10%)';

const VIDEO_CONSTRAINTS: WebcamProps['videoConstraints'] = {
  width: WEBCAM_W,
  height: WEBCAM_H,
  facingMode: 'user'
};

interface Props {
  title?: string;
  predictCallback: (preprocessedImage: Tensor) => Promise<[string, any]>;
}

export const WebcamBlock: React.FC<Props> = ({ title, predictCallback }) => {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [isWebcamLoading, setIsWebcamLoading] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);

  const webcamRef = useRef<Webcam | null>(null);
  const faceImgRef = useRef<HTMLCanvasElement | null>(null);

  const handlePredict = async (url: string) => {
    if (!faceImgRef.current) {
      return;
    }
    const detectFaceData = await detectHaarFace(url);
    if (!detectFaceData) {
      toast('Необхожимо, чтобы лицо было в кадре', { toastId: 'face-detect-error', type: 'error' });
      return;
    }
    const [x1, y1, x2, y2, src] = detectFaceData;
    cv.imshow(faceImgRef.current, src);
    setPrediction(null);
    const preprocessedImage = await getTransformedImageTensorFromPath(url, x1, y1, x2, y2);
    const [newPrediction, metadata] = await predictCallback(preprocessedImage);
    setPrediction(newPrediction);
    setMetadata(metadata);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) {
      return;
    }
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    setIsLoadingPrediction(true);
    await handlePredict(url);
    setIsLoadingPrediction(false);
  };

  const handleCapture = async () => {
    const url = webcamRef.current?.getScreenshot();
    if (!url) {
      return;
    }
    setIsLoadingPrediction(true);
    await handlePredict(url);
    setIsLoadingPrediction(false);
  };

  const handleClear = () => {
    setPrediction(null);
    setMetadata(null);
    if (!faceImgRef.current) {
      return;
    }
    const faceImgContext = faceImgRef.current.getContext('2d');
    if (!faceImgContext) {
      return;
    }
    faceImgContext.clearRect(0, 0, faceImgRef.current.width, faceImgRef.current.height);
  };

  const toggleCamera = () => {
    const isWebcamOnPrev = isWebcamOn;
    setIsWebcamOn(!isWebcamOnPrev);
    isWebcamOnPrev || setIsWebcamLoading(true);
    handleClear();
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack alignItems={'center'}>
        <Typography variant={'subtitle1'} fontWeight={'bold'}>
          {title}
        </Typography>
        <Divider sx={{ width: '100%', my: 2 }} />
      </Stack>
      <Stack direction={'row'} alignItems={'center'} spacing={2} mb={2}>
        {isWebcamOn ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            onLoadedData={() => setIsWebcamLoading(false)}
            screenshotFormat='image/jpeg'
            width={WEBCAM_W}
            height={WEBCAM_H}
            mirrored={true}
            videoConstraints={VIDEO_CONSTRAINTS}
            style={{ border: BORDER_STYLE }}
          />
        ) : (
          <Box sx={{ width: `${WEBCAM_W}px`, height: `${WEBCAM_H}px`, border: BORDER_STYLE }} />
        )}
        <canvas
          ref={faceImgRef}
          style={{ width: `${WEBCAM_W}px`, height: `${WEBCAM_H}px`, border: BORDER_STYLE }}
        />
        <Stack
          sx={{
            width: `${WEBCAM_W}px`,
            height: `${WEBCAM_H}px`,
            border: BORDER_STYLE,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {prediction ? (
            <>
              <Typography variant={'subtitle1'}>
                <b>Эмоция:</b> {_.capitalize(prediction)}
              </Typography>
              {metadata && (
                <Typography variant={'body2'} textAlign={'center'} mt={2}>
                  {Object.entries(metadata).map(([key, value], i) =>
                    value ? (
                      <Fragment key={key + i}>
                        {parameterEn2Ru(key)}
                        <br />
                      </Fragment>
                    ) : null
                  )}
                </Typography>
              )}
            </>
          ) : isLoadingPrediction ? (
            <CircularProgress size={25} />
          ) : (
            <Typography variant={'subtitle1'} sx={{ color: '#969696' }}>
              Пока нет предсказания
            </Typography>
          )}
        </Stack>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack direction={'row'} spacing={1} flexGrow={1} justifyContent={'center'}>
        <Button
          variant={'contained'}
          color={isWebcamOn && !isWebcamLoading ? 'error' : 'primary'}
          onClick={toggleCamera}
          sx={{ width: '15rem' }}
          disabled={isWebcamLoading}
        >
          {isWebcamLoading ? (
            <CircularProgress size={'1rem'} sx={{ color: '#fff' }} />
          ) : (
            <>{isWebcamOn ? 'Выключить веб-камеру' : 'Включить веб-камеру'}</>
          )}
        </Button>
        {isWebcamOn && !isWebcamLoading ? (
          <Button variant={'outlined'} onClick={handleCapture} disabled={isLoadingPrediction}>
            Предсказать эмоцию из кадра
          </Button>
        ) : (
          <Button
            variant={'outlined'}
            component={'label'}
            disabled={isWebcamLoading || isLoadingPrediction}
          >
            Предсказать эмоцию из файла
            <input type='file' hidden onChange={handleFileChange} />
          </Button>
        )}
        <Button
          variant={'outlined'}
          color={'warning'}
          disabled={!prediction || isLoadingPrediction}
          onClick={handleClear}
        >
          Очистить
        </Button>
      </Stack>
    </Paper>
  );
};
