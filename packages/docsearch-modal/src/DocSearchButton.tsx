import type { JSX } from 'react';
import React from 'react';
import { useDocSearch } from 'typesense-docsearch-core';
import {
  DocSearchButton as Button,
  type DocSearchButtonProps as ButtonProps,
} from 'typesense-docsearch-react/button';

export type DocSearchButtonProps = Omit<
  ButtonProps,
  'keyboardShortcuts' | 'theme'
>;

export function DocSearchButton({
  onClick,
  ...props
}: DocSearchButtonProps): JSX.Element {
  const { searchButtonRef, keyboardShortcuts, openModal } = useDocSearch();

  return (
    <Button
      ref={searchButtonRef}
      keyboardShortcuts={keyboardShortcuts}
      onClick={(evt) => {
        if (onClick) {
          onClick(evt);
        }
        openModal();
      }}
      {...props}
    />
  );
}
