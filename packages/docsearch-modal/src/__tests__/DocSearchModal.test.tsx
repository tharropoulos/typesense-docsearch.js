import type { RenderResult } from '@testing-library/react';
import {
  render,
  screen,
  cleanup,
  act,
  fireEvent,
} from '@testing-library/react';
import React from 'react';
import type { DocSearchProps } from 'typesense-docsearch-core';
import { DocSearch } from 'typesense-docsearch-core';
import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { DocSearchModal, type DocSearchModalProps } from '../DocSearchModal';

const COLLECTION_NAME = 'test_collection';
const TYPESENSE_SERVER_CONFIG = {
  apiKey: 'test_api_key',
  nodes: [{ host: 'localhost', port: 8108, protocol: 'http' as const }],
};

const DEFAULT_PROPS: DocSearchModalProps = {
  typesenseCollectionName: COLLECTION_NAME,
  typesenseServerConfig: TYPESENSE_SERVER_CONFIG,
  transformSearchClient(searchClient) {
    return {
      ...searchClient,
      search: () =>
        new Promise((resolve) => {
          resolve({
            results: [
              {
                hits: [],
                hitsPerPage: 0,
                nbHits: 0,
                nbPages: 0,
                page: 0,
                processingTimeMS: 0,
                exhaustiveNbHits: true,
                params: '',
                query: '',
              },
            ],
          });
        }),
    };
  },
};

const renderComponent = (
  props: DocSearchModalProps = DEFAULT_PROPS,
  docsearchProps: Omit<DocSearchProps, 'children'> = {}
): RenderResult =>
  render(<DocSearchModal {...props} />, {
    wrapper({ children }) {
      return <DocSearch {...docsearchProps}>{children}</DocSearch>;
    },
  });

describe('typesense-docsearch-modal', () => {
  afterEach(() => {
    cleanup();
  });

  describe('DocSearchModal', () => {
    it('renders modal component', () => {
      renderComponent();
    });

    it('opens modal on keyboard shortcut', () => {
      renderComponent();

      act(() => {
        fireEvent.keyDown(document, {
          key: 'k',
          ctrlKey: true,
        });
      });

      expect(screen.getByText('Search')).toBeInTheDocument();
    });

    it('closes modal on escape', () => {
      renderComponent();

      act(() => {
        fireEvent.keyDown(document, {
          key: 'k',
          ctrlKey: true,
        });
      });

      expect(screen.getByText('Search')).toBeInTheDocument();

      act(() => {
        fireEvent.keyDown(document, {
          code: 'Escape',
        });
      });

      expect(screen.queryByText('Search')).not.toBeInTheDocument();
    });

    it('renders with initial query', () => {
      renderComponent({ initialQuery: 'hitComponent', ...DEFAULT_PROPS });

      act(() => {
        fireEvent.keyDown(document, {
          key: 'k',
          ctrlKey: true,
        });
      });

      const inputEl =
        screen.getByPlaceholderText<HTMLInputElement>('Search docs');

      expect(inputEl).toBeInTheDocument();
      expect(inputEl.value).toBe('hitComponent');
    });

    it('uses provider initial query', () => {
      renderComponent(undefined, {
        initialQuery: 'hitComponent',
      });

      act(() => {
        fireEvent.keyDown(document, {
          key: 'k',
          ctrlKey: true,
        });
      });

      const inputEl =
        screen.getByPlaceholderText<HTMLInputElement>('Search docs');

      expect(inputEl).toBeInTheDocument();
      expect(inputEl.value).toBe('hitComponent');
    });
  });
});
