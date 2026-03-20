import type { DocSearchAIProps as DocSearchComponentProps } from 'typesense-docsearch-react/docsearchAi';
import { DocSearchAI } from 'typesense-docsearch-react/docsearchAi';
import { version } from 'typesense-docsearch-react/version';

import {
  createDocSearch,
  type DocSearchInstance,
  type DocSearchProps as CreateDocSearchProps,
} from './createDocSearch';

export type { DocSearchCallbacks, DocSearchInstance } from './createDocSearch';
export type DocSearchAIProps = CreateDocSearchProps<DocSearchComponentProps>;

export const docsearchAi: (allProps: DocSearchAIProps) => DocSearchInstance =
  createDocSearch<DocSearchComponentProps>(DocSearchAI, version);
