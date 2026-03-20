/* eslint-disable react/react-in-jsx-scope */
import { DocSearch } from 'typesense-docsearch-react';
import type { JSX } from 'react';

import { defaultCollection, defaultSearchParameters, typesenseServerConfig } from '../config';

export default function Basic(): JSX.Element {
  return (
    <DocSearch
      typesenseCollectionName={defaultCollection}
      typesenseServerConfig={typesenseServerConfig}
      typesenseSearchParameters={defaultSearchParameters}
      translations={{ button: { buttonText: 'Keyword search' } }}
      insights={true}
    />
  );
}
