/* eslint-disable react/react-in-jsx-scope */
import type { AutocompleteState } from '@algolia/autocomplete-core';
import { DocSearch } from 'typesense-docsearch-react';
import type { InternalDocSearchHit } from 'typesense-docsearch-react';
import type { JSX } from 'react';

import type { DemoTheme } from '../App';
import {
  defaultCollection,
  defaultSearchParameters,
  typesenseServerConfig,
} from '../config';

function ResultsFooterComponent({
  state,
}: {
  state: AutocompleteState<InternalDocSearchHit>;
}): JSX.Element {
  // Using JSX templates
  return (
    <div className="DocSearch-HitsFooter">
      <a
        href="https://typesense.org/docs/guide/docsearch.html"
        target="_blank"
        rel="noreferrer"
      >
        See all {String(state.context?.nbHits || 0)} results
      </a>
    </div>
  );
}

export default function WResultsFooter({
  theme,
}: {
  theme: DemoTheme;
}): JSX.Element {
  return (
    <DocSearch
      typesenseCollectionName={defaultCollection}
      typesenseServerConfig={typesenseServerConfig}
      typesenseSearchParameters={defaultSearchParameters}
      insights={true}
      resultsFooterComponent={ResultsFooterComponent}
      translations={{ button: { buttonText: 'Search with results footer' } }}
      theme={theme}
    />
  );
}
