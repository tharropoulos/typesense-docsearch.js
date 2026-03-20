/* eslint-disable react/react-in-jsx-scope */
import { DocSearch } from 'typesense-docsearch-react';
import type { JSX } from 'react';

import { defaultSearchParameters, typesenseServerConfig } from '../config';

// this type matches the structure of the provided example hit
/* type _DocSearchCustomHit = {
  path: string;
  metaDescription: string;
  title: string;
  h1: string;
  h2: string;
  content: string;
  breadcrumb: string[];
  variation: Record<string, unknown>;
  pageDepth: number;
  domain: string;
  objectID: string;
  _snippetResult: any;
  _highlightResult: any;
}; */

export default function WTransformItems(): JSX.Element {
  return (
    <DocSearch
      typesenseCollectionName="crawler_doc"
      typesenseServerConfig={typesenseServerConfig}
      typesenseSearchParameters={defaultSearchParameters}
      askAi={{
        conversationModelId: 'askAIDemo',
      }}
      insights={true}
      searchParameters={{
        attributesToRetrieve: ['*'],
        attributesToSnippet: ['*'],
        hitsPerPage: 20,
      }}
      transformItems={(items) => {
        return items.map((item: any) => ({
          objectID: item.objectID,
          content: item.content ?? '',
          url: item.domain + item.path,
          hierarchy: {
            lvl0: item.breadcrumb.join(' > ') ?? '',
            lvl1: item.h1 ?? '',
            lvl2: item.h2 ?? '',
            lvl3: null,
            lvl4: null,
            lvl5: null,
            lvl6: null,
          },
          url_without_anchor: item.domain + item.path,
          type: 'content' as const,
          anchor: null,
          _highlightResult: item._highlightResult,
          _snippetResult: item._snippetResult,
        }));
      }}
      translations={{ button: { buttonText: 'Search with transformItems' } }}
    />
  );
}
