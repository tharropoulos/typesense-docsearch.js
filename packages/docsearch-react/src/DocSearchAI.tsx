import { DocSearch as DocSearchProvider, useDocSearch } from 'typesense-docsearch-core';
import type { DocSearchRef, InitialAskAiMessage } from 'typesense-docsearch-core';
import React, { type JSX } from 'react';
import { createPortal } from 'react-dom';

import type { DocSearchProps } from './DocSearch';
import { DocSearchAskAiModal } from './DocSearchAskAiModal';
import { DocSearchButton } from './DocSearchButton';
import type { TypesenseAskAiSearchParameters } from './types/AskiAi';

export interface AskAiSearchParameters {
  facetFilters?: string[];
  filters?: string;
  attributesToRetrieve?: string[];
  restrictSearchableAttributes?: string[];
  distinct?: boolean | number | string;
}

export type AgentStudioSearchParameters = Record<
  string,
  Omit<AskAiSearchParameters, 'facetFilters'>
>;

export interface Memory {
  /**
   * Determines whether or not to display the memory based tool calls.
   *
   * @default false
   */
  enabled?: boolean;
  /**
   * The JWT used by the agent to know which user's memory to read.
   *
   * @see https://www.algolia.com/doc/guides/algolia-ai/agent-studio/how-to/user-authentication
   */
  userToken?: string;
}

export interface PromptSuggestions {
  /** The name of the index where the prompt suggestions are stored. */
  indexName: string;
  /**
   * The number of prompt suggestions that are retrieved and displayed.
   *
   * @default 3
   */
  hitsPerPage?: number;
}

export interface DocSearchAskAi {
  /** Typesense conversational model id. */
  conversationModelId: string;
  /**
   * Collection to query for conversational retrieval. Defaults to
   * `typesenseCollectionName`.
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
   * Additional Typesense search parameters for the conversational retrieval
   * request.
   */
  searchParameters?: TypesenseAskAiSearchParameters;
  /**
   * Static suggested questions shown in Ask AI entry points.
   *
   * TODO: Replace this with a Typesense-backed suggestions source instead of
   * shipping questions directly in frontend config.
   */
  suggestedQuestions?: string[];
  /**
   * Enables and configures prompt suggestions that are displayed during keyword
   * search.
   */
  promptSuggestions?: PromptSuggestions;
}

export interface DocSearchAIProps extends DocSearchProps {
  /**
   * Configuration or assistant id to enable ask ai mode. Pass a string
   * assistant id or a full config object.
   */
  askAi: DocSearchAskAi | string;
  /**
   * Intercept Ask AI requests (e.g. Submitting a prompt or selecting a
   * suggested question).
   *
   * Return `true` to prevent the default modal Ask AI flow (no toggle, no
   * sendMessage). Useful to route Ask AI into a different UI (e.g.
   * `typesense-docsearch-sidepanel-js`) without flicker.
   */
  interceptAskAiEvent?: (initialMessage: InitialAskAiMessage) => boolean | void;
}

function DocSearchAIComponent(
  { appId, apiKey, ...props }: DocSearchAIProps,
  ref: React.ForwardedRef<DocSearchRef>
): JSX.Element {
  return (
    <DocSearchProvider {...props} appId={appId} apiKey={apiKey} ref={ref}>
      <DocSearchAIInner {...props} />
    </DocSearchProvider>
  );
}

export const DocSearchAI = React.forwardRef(DocSearchAIComponent);

export function DocSearchAIInner(
  props: Omit<DocSearchAIProps, 'appId' | 'apiKey'>
): JSX.Element {
  const {
    searchButtonRef,
    keyboardShortcuts,
    isModalActive,
    isAskAiActive,
    initialQuery,
    onAskAiToggle,
    openModal,
    closeModal,
    isHybridModeSupported,
    appId,
    apiKey,
  } = useDocSearch();

  if (!appId || !apiKey) {
    throw new Error('`DocSearchAI` requires `appId` and `apiKey` props.');
  }

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
          <DocSearchAskAiModal
            {...props}
            appId={appId}
            apiKey={apiKey}
            initialScrollY={window.scrollY}
            initialQuery={initialQuery}
            translations={props?.translations?.modal}
            isAskAiActive={isAskAiActive}
            isHybridModeSupported={isHybridModeSupported}
            onAskAiToggle={onAskAiToggle}
            onClose={closeModal}
          />,
          props.portalContainer ?? document.body
        )}
    </>
  );
}

export type { ToolCalls } from './types/AskiAi';
