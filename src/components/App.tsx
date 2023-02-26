import React, { useEffect, useState } from 'react';
import { Container, Stack } from '@mui/material';
import { loadHaarFaceModels } from '../utils/face-detection.utils';
import { WebcamBlock } from './WebcamBlock';
import { runV1, runV2 } from '../utils/predict.utils';

export const App: React.FC = () => {
  const [faceModelLoaded, setFaceModelLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      if (!faceModelLoaded) {
        await loadHaarFaceModels();
        setFaceModelLoaded(true);
      }
    })();
  }, [faceModelLoaded]);

  return (
    <Container maxWidth='xl'>
      <Stack height={'100vh'} justifyContent={'center'} alignItems={'center'} spacing={3}>
        <WebcamBlock
          title={'Без использования семантических моделей'}
          predictCallback={(...args) => runV1(6, ...args)}
        />
        <WebcamBlock
          title={'С использованием семантических моделей'}
          predictCallback={(...args) => runV2(1, ...args)}
        />
      </Stack>
    </Container>
  );
};
