import type { StoredDocSearchHit } from '../types';

import { decodeHtmlEntities } from './decodeHtmlEntities';

const LEVELS = [
  'lvl0',
  'lvl1',
  'lvl2',
  'lvl3',
  'lvl4',
  'lvl5',
  'lvl6',
] as const;

/**
 * Typesense returns hierarchy levels as flat `hierarchy.lvlN` keys rather than
 * the nested `hierarchy` object Algolia returns, so read both shapes.
 */
function getHierarchyValue<TItem extends StoredDocSearchHit>(
  item: TItem,
  lvl: (typeof LEVELS)[number]
): string | null {
  const nested = item.hierarchy?.[lvl];
  if (typeof nested === 'string') {
    return nested;
  }

  const flat = (item as Record<string, unknown>)[`hierarchy.${lvl}`];
  return typeof flat === 'string' ? flat : null;
}

export function getHitItemBreadcrumbs<TItem extends StoredDocSearchHit>(
  item: TItem
): string {
  const currentIndex =
    item.type === 'content' || item.type === 'askAI'
      ? LEVELS.length
      : LEVELS.indexOf(item.type);
  return LEVELS.slice(0, currentIndex)
    .map((lvl) => {
      const value = getHierarchyValue(item, lvl);
      return value ? decodeHtmlEntities(value) : null;
    })
    .filter(Boolean)
    .join(' > ');
}
