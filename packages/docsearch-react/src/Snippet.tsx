import { type JSX, createElement } from 'react';

import type { DocSearchHit, StoredDocSearchHit } from './types';

type HierarchyLevel =
  | 'lvl0'
  | 'lvl1'
  | 'lvl2'
  | 'lvl3'
  | 'lvl4'
  | 'lvl5'
  | 'lvl6';
type SnippetAttribute = 'content' | `hierarchy.${HierarchyLevel}`;
type SnippetHit = StoredDocSearchHit &
  Partial<Pick<DocSearchHit, '_highlightResult' | '_snippetResult'>>;

function parseHierarchyAttribute(attribute: string): HierarchyLevel | null {
  if (!attribute.startsWith('hierarchy.')) {
    return null;
  }

  const level = attribute.replace('hierarchy.', '') as HierarchyLevel;
  return ['lvl0', 'lvl1', 'lvl2', 'lvl3', 'lvl4', 'lvl5', 'lvl6'].includes(
    level
  )
    ? level
    : null;
}

function getRawValue(hit: SnippetHit, attribute: SnippetAttribute): string {
  if (attribute === 'content') {
    return hit.content ?? '';
  }

  const level = parseHierarchyAttribute(attribute);
  if (!level) {
    return '';
  }

  return hit[attribute] ?? hit.hierarchy[level] ?? '';
}

function getHighlightedValue(
  hit: SnippetHit,
  attribute: SnippetAttribute
): string {
  const highlight = hit._highlightResult;
  if (!highlight) {
    return '';
  }

  if (attribute === 'content') {
    return highlight.content?.value ?? '';
  }

  const level = parseHierarchyAttribute(attribute);
  if (!level) {
    return '';
  }

  return (
    highlight[attribute]?.value ?? highlight.hierarchy?.[level]?.value ?? ''
  );
}

function getSnippetValue(hit: SnippetHit, attribute: SnippetAttribute): string {
  const snippet = hit._snippetResult;
  if (!snippet) {
    return '';
  }

  if (attribute === 'content') {
    return snippet.content?.value ?? '';
  }

  const level = parseHierarchyAttribute(attribute);
  if (!level) {
    return '';
  }

  return snippet[attribute]?.value ?? snippet.hierarchy?.[level]?.value ?? '';
}

interface SnippetProps<TItem> {
  hit: TItem;
  attribute: SnippetAttribute;
  tagName?: string;
  [prop: string]: unknown;
}

export function Snippet<TItem extends SnippetHit>({
  hit,
  attribute,
  tagName = 'span',
  ...rest
}: SnippetProps<TItem>): JSX.Element {
  const highlightValue = getHighlightedValue(hit, attribute);
  const rawValue = getRawValue(hit, attribute);
  const baseValue = highlightValue || rawValue;
  const snippetValue = getSnippetValue(hit, attribute);

  let displayValue = baseValue;

  if (snippetValue && baseValue) {
    let formattedSnippet = snippetValue;
    if (baseValue.substring(0, 20) !== snippetValue.substring(0, 20)) {
      formattedSnippet = `… ${formattedSnippet}`;
    }
    if (
      baseValue.substring(baseValue.length - 20, baseValue.length) !==
      snippetValue.substring(snippetValue.length - 20, snippetValue.length)
    ) {
      formattedSnippet = `${formattedSnippet} …`;
    }
    displayValue = formattedSnippet;
  } else if (snippetValue) {
    displayValue = snippetValue;
  }

  return createElement(tagName, {
    ...rest,
    dangerouslySetInnerHTML: {
      __html: displayValue,
    },
  });
}
