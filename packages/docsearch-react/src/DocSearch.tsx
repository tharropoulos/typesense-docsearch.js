/* eslint-disable prettier/prettier */
import type {
  AutocompleteOptions,
  AutocompleteState,
} from '@algolia/autocomplete-core';
import { DocSearch as DocSearchProvider, useDocSearch } from 'typesense-docsearch-core';
import type {
  DocSearchModalShortcuts,
  DocSearchRef,
  InitialAskAiMessage,
} from 'typesense-docsearch-core';
import type {
  LiteClient,
  SearchParamsObject,
  SearchResponses,
} from 'algoliasearch/lite';
import React, { type JSX } from 'react';
import { createPortal } from 'react-dom';
import type { ConfigurationOptions as TypesenseConfigurationOptions } from 'typesense/lib/Typesense/Configuration';
import type {
  DocumentSchema,
  SearchParams as TypesenseSearchParams,
} from 'typesense/lib/Typesense/Documents';
import type { MultiSearchRequestSchema } from 'typesense/lib/Typesense/Types';

import { DocSearchButton } from './DocSearchButton';
import { DocSearchModal } from './DocSearchModal';
import type {
  DocSearchHit,
  DocSearchTheme,
  InternalDocSearchHit,
  StoredDocSearchHit,
} from './types';

import type { ButtonTranslations, ModalTranslations } from '.';
import type { TypesenseAskAiSearchParameters } from './types/AskiAi';

export type { DocSearchRef } from 'typesense-docsearch-core';

export type DocSearchTranslations = Partial<{
  button: ButtonTranslations;
  modal: ModalTranslations;
}>;

// The interface that describes the minimal implementation required for the algoliasearch client, when using the [`transformSearchClient`](https://docsearch.algolia.com/docs/api/#transformsearchclient) option.
export type TypesenseDocsearchTransformClient = {
  search: <T extends DocumentSchema>(searchMethodParams: {
    requests: Array<MultiSearchRequestSchema<T, string>>;
  }) => Promise<SearchResponses<T>>;
};

export type DocSearchTransformClient = {
  search: LiteClient['search'];
  addAlgoliaAgent: LiteClient['addAlgoliaAgent'];
  transporter: Pick<LiteClient['transporter'], 'algoliaAgent'>;
};

export type DocSearchAskAi = {
  /**
   * Typesense conversational model id.
   */
  conversationModelId: string;
  /**
   * Static suggested questions shown in Ask AI entry points.
   *
   * TODO: Replace this with a Typesense-backed suggestions source instead of
   * shipping questions directly in frontend config.
   */
  suggestedQuestions?: string[];
  /**
   * Collection to query for conversational retrieval.
   * Defaults to `typesenseCollectionName`.
   */
  collection?: string;
  /**
   * Query field to use for conversational retrieval.
   *
   * @default 'embedding'
   */
  queryBy?: string;
  /**
   * Fields excluded from the conversational payload.
   *
   * @default 'embedding'
   */
  excludeFields?: string;
  /**
   * Additional Typesense search parameters for the conversational retrieval request.
   */
  searchParameters?: TypesenseAskAiSearchParameters;
};

export interface DocSearchIndex {
  name: string;
  searchParameters?: SearchParamsObject;
}

export interface DocSearchProps {
  /**
   * Typesense collection name to query.
   */
  typesenseCollectionName: string;
  /**
   * Typesense server configuration for the client.
   */
  typesenseServerConfig: TypesenseConfigurationOptions;
  /**
   * Additional Typesense search parameters to merge into each query.
   */
  typesenseSearchParameters: TypesenseSearchParams<
    Record<string, unknown>,
    string
  >;
  /**
   * List of indices and _optional_ searchParameters to be used for search.
   *
   * @see {@link https://docsearch.algolia.com/docs/api#indices}
   */
  indices?: Array<DocSearchIndex | string>;
  /**
   * Configuration to enable Typesense conversational search.
   */
  askAi?: DocSearchAskAi;
  /**
   * Intercept Ask AI requests (e.g. Submitting a prompt or selecting a suggested question).
   *
   * Return `true` to prevent the default modal Ask AI flow (no toggle, no sendMessage).
   * Useful to route Ask AI into a different UI (e.g. `typesense-docsearch-sidepanel-js`) without flicker.
   */
  interceptAskAiEvent?: (initialMessage: InitialAskAiMessage) => boolean | void;
  /**
   * Theme overrides applied to the modal and related components.
   */
  theme?: DocSearchTheme;
  /**
   * Placeholder text for the search input.
   */
  placeholder?: string;
  /**
   * Additional algolia search parameters to merge into each query.
   *
   * @deprecated `searchParameters` will be removed in a future version. Please use `indices` property going forward.
   */
  searchParameters?: SearchParamsObject;
  /**
   * Maximum number of hits to display per source/group.
   */
  maxResultsPerGroup?: number;
  /**
   * Hook to post-process hits before rendering.
   */
  transformItems?: (items: DocSearchHit[]) => DocSearchHit[];
  /**
   * Custom component to render an individual hit.
   * Supports template patterns:
   * - HTML strings with html helper: (props, { html }) => html`<div>...</div>`
   * - JSX templates: (props) => <div>...</div>
   * - Function-based templates: (props) => string | JSX.Element | Function.
   */
  hitComponent?: (
    props: {
      hit: InternalDocSearchHit | StoredDocSearchHit;
      children: React.ReactNode;
    },
    helpers?: {
      html: (template: TemplateStringsArray, ...values: any[]) => any;
    }
  ) => JSX.Element;
  /**
   * Custom component rendered at the bottom of the results panel.
   * Supports template patterns:
   * - HTML strings with html helper: (props, { html }) => html`<div>...</div>`
   * - JSX templates: (props) => <div>...</div>
   * - Function-based templates: (props) => string | JSX.Element | Function.
   */
  resultsFooterComponent?: (
    props: {
      state: AutocompleteState<InternalDocSearchHit>;
    },
    helpers?: {
      html: (template: TemplateStringsArray, ...values: any[]) => any;
    }
  ) => JSX.Element | null;
  /**
   * Hook to wrap or modify the algolia search client.
   */
  transformSearchClient?: (
    searchClient: TypesenseDocsearchTransformClient
  ) => TypesenseDocsearchTransformClient;
  /**
   * Disable storage and usage of recent and favorite searches.
   */
  disableUserPersonalization?: boolean;
  /**
   * Query string to prefill when opening the modal.
   */
  initialQuery?: string;
  /**
   * Custom navigator for controlling link navigation.
   */
  navigator?: AutocompleteOptions<InternalDocSearchHit>['navigator'];
  /**
   * Localized strings for the button and modal ui.
   */
  translations?: DocSearchTranslations;
  /**
   * Builds a url to report missing results for a given query.
   */
  getMissingResultsUrl?: ({ query }: { query: string }) => string;
  /**
   * Insights client integration options to send analytics events.
   */
  insights?: AutocompleteOptions<InternalDocSearchHit>['insights'];
  /**
   * The container element where the modal should be portaled to. Defaults to document.body.
   */
  portalContainer?: DocumentFragment | Element;
  /**
   * Limit of how many recent searches should be saved/displayed..
   *
   * @default 7
   */
  recentSearchesLimit?: number;
  /**
   * Limit of how many recent searches should be saved/displayed when there are favorited searches..
   *
   * @default 4
   */
  recentSearchesWithFavoritesLimit?: number;
  /**
   * Configuration for keyboard shortcuts. Allows enabling/disabling specific shortcuts.
   *
   * @default `{ 'Ctrl/Cmd+K': true, '/': true }`
   */
  keyboardShortcuts?: DocSearchModalShortcuts;
}

function DocSearchComponent(
  props: DocSearchProps,
  ref: React.ForwardedRef<DocSearchRef>
): JSX.Element {
  return (
    <DocSearchProvider {...props} ref={ref}>
      <DocSearchInner {...props} />
    </DocSearchProvider>
  );
}

export const DocSearch = React.forwardRef(DocSearchComponent);

export function DocSearchInner(props: DocSearchProps): JSX.Element {
  const {
    searchButtonRef,
    keyboardShortcuts,
    isModalActive,
    isAskAiActive,
    initialQuery,
    onAskAiToggle,
    openModal,
    closeModal,
  } = useDocSearch();

  return (
    <>
      <DocSearchButton
        keyboardShortcuts={keyboardShortcuts}
        ref={searchButtonRef}
        translations={props.translations?.button}
        onClick={openModal}
      />
      {isModalActive &&
        createPortal(
          <DocSearchModal
            {...props}
            initialScrollY={window.scrollY}
            initialQuery={initialQuery}
            translations={props?.translations?.modal}
            isAskAiActive={isAskAiActive}
            onAskAiToggle={onAskAiToggle}
            onClose={closeModal}
          />,
          props.portalContainer ?? document.body
        )}
    </>
  );
}
