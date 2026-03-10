import type { JSX } from 'react';
import React from 'react';

import { CopyButton, type AskAiScreenTranslations } from '../AskAiScreen';

interface ConversationActionsProps {
  showActions: boolean;
  latestAssistantMessageContent: string | null;
  translations: AskAiScreenTranslations;
}

export function ConversationActions({
  translations,
  latestAssistantMessageContent,
  showActions,
}: ConversationActionsProps): JSX.Element | null {
  if (!showActions || !latestAssistantMessageContent) {
    return null;
  }

  return (
    <div className="DocSearch-AskAiScreen-Actions">
      <CopyButton
        translations={translations}
        onClick={() => navigator.clipboard.writeText(latestAssistantMessageContent)}
      />
    </div>
  );
}
