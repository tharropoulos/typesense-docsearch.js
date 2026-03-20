import type { DocSearchProps as DocSearchComponentProps } from 'typesense-docsearch-react';
import { DocSearch, version } from 'typesense-docsearch-react';

import {
  createDocSearch,
  type DocSearchInstance,
  type DocSearchProps as CreateDocSearchProps,
} from './createDocSearch';

export type { DocSearchCallbacks, DocSearchInstance } from './createDocSearch';
export type DocSearchProps = CreateDocSearchProps<DocSearchComponentProps>;

export const docsearch: (allProps: DocSearchProps) => DocSearchInstance =
  createDocSearch<DocSearchComponentProps>(DocSearch, version);
