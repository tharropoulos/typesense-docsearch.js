import React from 'react';
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents';

import type { DocSearchFacet } from './DocSearch';
import type { DocSearchHit } from './types';
import type { useSearchClient } from './useSearchClient';

export type FacetValues = Record<string, string[]>;

type TypesenseFacetCounts = {
  facet_counts?: Array<{
    field_name?: string;
    counts?: Array<{ value?: string }>;
  }>;
};

export function useFacetValues({
  facets,
  typesenseCollectionName,
  searchClient,
}: {
  facets: DocSearchFacet[];
  typesenseCollectionName: string;
  searchClient: ReturnType<typeof useSearchClient>;
}): FacetValues {
  const [facetValues, setFacetValues] = React.useState<FacetValues>({});

  // Derive a stable string key so the effect only re-runs when the actual facet
  // keys change, not on every render (the `facets` prop is recreated on each
  // render and would otherwise loop).
  const stableFacetKeys = facets.map((facet) => facet.key).join(',');

  React.useEffect(() => {
    let isMounted = true;

    const facetKeys = stableFacetKeys ? stableFacetKeys.split(',') : [];

    if (facetKeys.length === 0 || !typesenseCollectionName) {
      return () => {
        isMounted = false;
      };
    }

    searchClient
      .search<DocSearchHit & DocumentSchema>({
        requests: [
          {
            collection: typesenseCollectionName,
            q: '*',
            per_page: 0,
            facet_by: facetKeys.join(','),
            max_facet_values: 100,
          },
        ],
      })
      .then(({ results }) => {
        if (!isMounted) {
          return;
        }

        const valuesByFacet = facetKeys.reduce<FacetValues>((acc, facet) => {
          acc[facet] = [];
          return acc;
        }, {});

        const { facet_counts: facetCounts } = (results[0] ??
          {}) as TypesenseFacetCounts;

        (facetCounts ?? []).forEach(({ field_name: fieldName, counts }) => {
          if (!fieldName || !valuesByFacet[fieldName]) {
            return;
          }

          const values = (counts ?? [])
            .map((count) => count.value)
            .filter((value): value is string => typeof value === 'string');

          valuesByFacet[fieldName] = Array.from(
            new Set([...valuesByFacet[fieldName], ...values])
          ).sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: 'base' })
          );
        });

        setFacetValues(valuesByFacet);
      })
      .catch(() => {
        if (isMounted) {
          setFacetValues({});
        }
      });

    return () => {
      isMounted = false;
    };
  }, [stableFacetKeys, typesenseCollectionName, searchClient]);

  return facetValues;
}
