/* eslint-disable react/react-in-jsx-scope */
import { DocSearch } from 'typesense-docsearch-react';
import type { JSX } from 'react';

import type { DemoTheme } from '../App';
import {
  defaultCollection,
  defaultSearchParameters,
  typesenseServerConfig,
} from '../config';

function CustomHit({ hit }: { hit: any }): JSX.Element {
  // Typesense returns flat `hierarchy.lvlN` keys, Algolia a nested object.
  const lvl1 = hit['hierarchy.lvl1'] ?? hit.hierarchy?.lvl1;
  const lvl2 = hit['hierarchy.lvl2'] ?? hit.hierarchy?.lvl2;

  return (
    <a
      href={hit.url}
      style={{
        display: 'block',
        padding: '12px 16px',
        textDecoration: 'none',
        color: 'inherit',
        borderBottom: '1px solid #f0f0f0',
        transition: 'background-color 0.2s ease',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: 1.4,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f8f9fa';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976d2',
          }}
        >
          {/* oxlint-disable-next-line no-nested-ternary */}
          {hit.type === 'lvl1'
            ? 'H1'
            : // oxlint-disable-next-line no-nested-ternary
              hit.type === 'lvl2'
              ? 'H2'
              : hit.type === 'lvl3'
                ? 'H3'
                : 'DOC'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {lvl1 || 'Untitled'}
          </div>

          {lvl2 && (
            <div
              style={{
                fontSize: '13px',
                color: '#666',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {lvl2}
            </div>
          )}

          {hit.content && (
            <div
              style={{
                fontSize: '12px',
                color: '#888',
                marginTop: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.3,
              }}
            >
              {hit.content}
            </div>
          )}

          <div
            style={{
              fontSize: '11px',
              color: '#999',
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>{hit.url}</span>
            {hit.type && (
              <span style={{ textTransform: 'capitalize' }}>{hit.type}</span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}

export default function WHitComponent({
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
      translations={{ button: { buttonText: 'Search with custom hits' } }}
      hitComponent={CustomHit}
      theme={theme}
    />
  );
}
