import type { AutocompleteState } from '@algolia/autocomplete-core';
import type { InitialAskAiMessage } from 'typesense-docsearch-core';
import docsearch, { type DocSearchInstance, type TemplateHelpers } from 'typesense-docsearch.js';
import sidepanel, { type SidepanelInstance } from 'typesense-docsearch-sidepanel-js';

import './app.css';
import 'typesense-docsearch-css/dist/style.css';
import 'typesense-docsearch-css/dist/sidepanel.css';

declare global {
  interface Window {
    docsearch?: DocSearchInstance;
    sidepanel?: SidepanelInstance;
  }
}

function logDocSearchState(instance: DocSearchInstance, label: string): void {
  // eslint-disable-next-line no-console
  console.log(`[demo-js] ${label}`, {
    isReady: instance.isReady,
    isOpen: instance.isOpen,
  });
}

function logSidepanelState(instance: SidepanelInstance, label: string): void {
  // eslint-disable-next-line no-console
  console.log(`[demo-js] ${label}`, {
    isReady: instance.isReady,
    isOpen: instance.isOpen,
  });
}

const typesenseServerConfig = {
  apiKey: 'xyz',
  nodes: [{ host: 'localhost', port: 8108, protocol: 'http' as const }],
};

const sidepanelInstance = sidepanel({
  container: '#docsearch-sidepanel',
  typesenseCollectionName: 'docsearch',
  typesenseServerConfig,
  askAi: {
    conversationModelId: 'askAIDemo',
  },
  onReady: () => {
    // eslint-disable-next-line no-console
    console.log('[demo-js] sidepanel onReady()');
  },
  onOpen: () => {
    // eslint-disable-next-line no-console
    console.log('[demo-js] sidepanel onOpen()');
  },
  onClose: () => {
    // eslint-disable-next-line no-console
    console.log('[demo-js] sidepanel onClose()');
  },
});

window.sidepanel = sidepanelInstance;

// eslint-disable-next-line no-console
console.log('[demo-js] sidepanel instance exposed on window.sidepanel');
// eslint-disable-next-line no-console
console.log('[demo-js] sidepanel try:', {
  open: 'window.sidepanel?.open()',
  openWithMessage: "window.sidepanel?.open({ query: 'Hello from demo-js' })",
  close: 'window.sidepanel?.close()',
  destroy: 'window.sidepanel?.destroy()',
});
logSidepanelState(sidepanelInstance, 'sidepanel initial state');

const docsearchInstance = docsearch({
  container: '#docsearch',
  typesenseCollectionName: 'docsearch',
  typesenseServerConfig,
  typesenseSearchParameters: {},
  askAi: {
    conversationModelId: 'askAIDemo',
  },
  interceptAskAiEvent: (initialMessage: InitialAskAiMessage) => {
    docsearchInstance.close();
    sidepanelInstance.open(initialMessage);
    return true;
  },
  onReady: () => {
    // eslint-disable-next-line no-console
    console.log('[demo-js] docsearch onReady()');
  },
  onOpen: () => {
    // eslint-disable-next-line no-console
    console.log('[demo-js] docsearch onOpen()');
  },
  onClose: () => {
    // eslint-disable-next-line no-console
    console.log('[demo-js] docsearch onClose()');
  },
  resultsFooterComponent: ({ state }: { state: AutocompleteState<any> }, helpers?: TemplateHelpers) => {
    const { html } = helpers || {};
    if (!html) return null;

    return html`
      <div class="DocSearch-HitsFooter">
        <a href="https://docsearch.algolia.com/apply" target="_blank">
          See all ${state.context?.nbHits || 0} results
        </a>
      </div>
    `;
  },
});

// Expose instance
window.docsearch = docsearchInstance;

// eslint-disable-next-line no-console
console.log('[demo-js] docsearch instance exposed on window.docsearch');
// eslint-disable-next-line no-console
console.log('[demo-js] docsearch try:', {
  open: 'window.docsearch?.open()',
  close: 'window.docsearch?.close()',
  openAskAi: "window.docsearch?.openAskAi({ query: 'Hello from demo-js' })",
  destroy: 'window.docsearch?.destroy()',
});
logDocSearchState(docsearchInstance, 'docsearch initial state');
