import type { JSX } from 'react';
/* eslint-disable react/react-in-jsx-scope */
import { DocSearch } from 'typesense-docsearch-react';

import type { DemoTheme } from '../App';
import {
  defaultCollection,
  defaultSearchParameters,
  typesenseServerConfig,
} from '../config';

export default function DefaultExperience({
  theme,
}: {
  theme: DemoTheme;
}): JSX.Element {
  return (
    <DocSearch
      typesenseCollectionName={defaultCollection}
      typesenseServerConfig={typesenseServerConfig}
      typesenseSearchParameters={defaultSearchParameters}
      theme={theme}
    />
  );
}
