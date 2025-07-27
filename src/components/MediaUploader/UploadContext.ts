import React from 'react';
import type { ProviderContext } from './types';

const doNothing = () => {};

export default React.createContext<ProviderContext>({
  createUploadTxn: doNothing,
});
