import React from 'react';
import type { ProviderContext } from './types';
import { doNothing } from 'src/helpers';

export default React.createContext<ProviderContext>({
  createUploadTxn: doNothing,
});
