import React, { useEffect, useState } from 'react';
import { Backdrop, Container, Stack, Typography } from '@mui/material';
import { loadHaarFaceModels } from '../utils/face-detection.utils';
import { WebcamBlock } from './WebcamBlock';
import { loadEmotionModels, runV1, runV2 } from '../utils/predict.utils';
import { ClockLoader } from 'react-spinners';

const VERSION_1 = 6;
const VERSION_2 = 1;

export const App: React.FC = () => {
  const [areModelsLoaded, setAreModelsLoaded] = useState(false);

  useEffect(() => {
    if (areModelsLoaded) {
      return;
    }
    (async () => {
      await Promise.all([loadHaarFaceModels(), loadEmotionModels(VERSION_1, VERSION_2)]);
      setAreModelsLoaded(true);
    })();
  }, []);

  if (!areModelsLoaded) {
    return (
      <Backdrop open={true} sx={{ flexDirection: 'column' }}>
        <ClockLoader color='#fff' />
        <Typography color='#fff' textAlign={'center'} mt={3}>
          Пожалуйста, подождите некоторое время прежде, <br />
          чем все модели загрузятся
        </Typography>
      </Backdrop>
    );
  }

  return (
    <Container maxWidth='xl'>
      <Stack height={'100vh'} justifyContent={'center'} alignItems={'center'} spacing={3}>
        <WebcamBlock
          title={'Без использования семантических моделей'}
          predictCallback={(...args) => runV1(VERSION_1, ...args)}
        />
        <WebcamBlock
          title={'С использованием семантических моделей'}
          predictCallback={(...args) => runV2(VERSION_2, ...args)}
        />
      </Stack>
    </Container>
  );
};
