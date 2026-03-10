import React, { type JSX, useMemo, useState, useEffect } from 'react';

import { AlertIcon } from './icons';
import { MemoizedMarkdown } from './MemoizedMarkdown';
import type { ScreenStateProps } from './ScreenState';
import type { StoredSearchPlugin } from './stored-searches';
import type { InternalDocSearchHit, StoredAskAiState } from './types';
import type { AIMessage, AskAiStatus } from './types/AskiAi';
import { extractLinksFromMessage, getMessageContent, isThreadDepthError } from './utils/ai';

export type AskAiScreenTranslations = Partial<{
  // Misc texts
  disclaimerText: string;
  relatedSourcesText: string;
  thinkingText: string;
  copyButtonText: string;
  copyButtonCopiedText: string;
  // Feedback buttons
  copyButtonTitle: string;
  likeButtonTitle: string;
  dislikeButtonTitle: string;
  thanksForFeedbackText: string;
  /**
   * Message that's shown when user has stopped the streaming of a message.
   */
  stoppedStreamingText: string;
  /**
   * Error title shown if there is an error while chatting.
   */
  errorTitleText: string;
  /**
   * Message shown when thread depth limit is exceeded (AI-217 error).
   */
  threadDepthExceededMessage: string;
  /**
   * Button text for starting a new conversation after thread depth error.
   */
  startNewConversationButtonText: string;
}>;

type AskAiScreenProps = Omit<ScreenStateProps<InternalDocSearchHit>, 'translations'> & {
  messages: AIMessage[];
  status: AskAiStatus;
  askAiError?: Error;
  translations?: AskAiScreenTranslations;
  onNewConversation: () => void;
};

interface AskAiScreenHeaderProps {
  disclaimerText: string;
}

export interface Exchange {
  id: string;
  userMessage: AIMessage;
  assistantMessage: AIMessage | null;
}

function AskAiScreenHeader({ disclaimerText }: AskAiScreenHeaderProps): JSX.Element {
  return <p className="DocSearch-AskAiScreen-Disclaimer">{disclaimerText}</p>;
}

interface AskAiExchangeCardProps {
  exchange: Exchange;
  askAiError?: Error;
  isLastExchange: boolean;
  loadingStatus: AskAiStatus;
  translations: AskAiScreenTranslations;
  conversations: StoredSearchPlugin<StoredAskAiState>;
}

function AskAiExchangeCard({
  exchange,
  askAiError,
  isLastExchange,
  loadingStatus,
  translations,
  conversations,
}: AskAiExchangeCardProps): JSX.Element {
  const { userMessage, assistantMessage } = exchange;

  const { stoppedStreamingText = 'You stopped this response', errorTitleText = 'Chat error' } = translations;

  const isThreadDepth = isThreadDepthError(askAiError);

  const assistantContent = useMemo(() => getMessageContent(assistantMessage), [assistantMessage]);
  const userContent = useMemo(() => getMessageContent(userMessage), [userMessage]);

  const urlsToDisplay = React.useMemo(() => extractLinksFromMessage(assistantMessage), [assistantMessage]);
  const displayParts = assistantMessage?.parts || [];

  const wasStopped = userMessage.metadata?.stopped || assistantMessage?.metadata?.stopped;

  const showActions =
    !wasStopped && (!isLastExchange || (isLastExchange && loadingStatus === 'ready' && Boolean(assistantMessage)));

  const isThinking = ['submitted', 'streaming'].includes(loadingStatus) && isLastExchange && displayParts.length === 0;

  return (
    <div className="DocSearch-AskAiScreen-Response-Container">
      <div className="DocSearch-AskAiScreen-Response">
        <div className="DocSearch-AskAiScreen-Message DocSearch-AskAiScreen-Message--user">
          <p className="DocSearch-AskAiScreen-Query">{userContent?.text ?? ''}</p>
        </div>
        <div className="DocSearch-AskAiScreen-Message DocSearch-AskAiScreen-Message--assistant">
          <div className="DocSearch-AskAiScreen-MessageContent">
            {loadingStatus === 'error' && askAiError && isLastExchange && !isThreadDepth && (
              <div className="DocSearch-AskAiScreen-MessageContent DocSearch-AskAiScreen-Error">
                <AlertIcon />
                <div className="DocSearch-AskAiScreen-Error-Content">
                  <h4 className="DocSearch-AskAiScreen-Error-Title">{errorTitleText}</h4>
                  <MemoizedMarkdown
                    content={askAiError.message}
                    copyButtonText=""
                    copyButtonCopiedText=""
                    isStreaming={false}
                  />
                </div>
              </div>
            )}
            {isThinking && (
              <div className="DocSearch-AskAiScreen-MessageContent-Reasoning">
                <span className="shimmer">{translations.thinkingText || 'Thinking...'}</span>
              </div>
            )}
            {displayParts.map((part, idx) => {
              const index = idx;

              if (part.type === 'text') {
                return (
                  <MemoizedMarkdown
                    key={index}
                    content={part.text}
                    copyButtonText={translations.copyButtonText || 'Copy'}
                    copyButtonCopiedText={translations.copyButtonCopiedText || 'Copied!'}
                    isStreaming={part.state === 'streaming'}
                  />
                );
              }

              // fallback for unknown part type
              return null;
            })}
          </div>

          {wasStopped && <p className="DocSearck-AskAiScreen-MessageContent-Stopped">{stoppedStreamingText}</p>}
        </div>
      </div>
      <div className="DocSearch-AskAiScreen-Answer-Footer">
        <AskAiScreenFooterActions
          id={userMessage?.id || exchange.id}
          showActions={showActions}
          latestAssistantMessageContent={assistantContent?.text || null}
          translations={translations}
          conversations={conversations}
        />
      </div>

      {/* Sources for this exchange */}
      {urlsToDisplay.length > 0 ? (
        <AskAiSourcesPanel urlsToDisplay={urlsToDisplay} relatedSourcesText={translations.relatedSourcesText} />
      ) : null}
    </div>
  );
}

interface AskAiScreenFooterActionsProps {
  id: string;
  showActions: boolean;
  latestAssistantMessageContent: string | null;
  translations: AskAiScreenTranslations;
  conversations: StoredSearchPlugin<StoredAskAiState>;
}

export function AskAiScreenFooterActions({
  id,
  showActions,
  latestAssistantMessageContent,
  translations,
  conversations,
}: AskAiScreenFooterActionsProps): JSX.Element | null {
  void id;
  void conversations;

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

interface AskAiSourcesPanelProps {
  urlsToDisplay: Array<{ url: string; title?: string }>;
  relatedSourcesText?: string;
}

export function AskAiSourcesPanel({ urlsToDisplay, relatedSourcesText }: AskAiSourcesPanelProps): JSX.Element {
  return (
    <div className="DocSearch-AskAiScreen-RelatedSources">
      <p className="DocSearch-AskAiScreen-RelatedSources-Title">{relatedSourcesText || 'Related sources'}</p>
      <div className="DocSearch-AskAiScreen-RelatedSources-List">
        {urlsToDisplay.length > 0 &&
          urlsToDisplay.map((link) => (
            <a
              key={link.url}
              href={link.url}
              className="DocSearch-AskAiScreen-RelatedSources-Item-Link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <RelatedSourceIcon />
              <span>{link.title || link.url}</span>
            </a>
          ))}
      </div>
    </div>
  );
}

export function AskAiScreen({ translations = {}, ...props }: AskAiScreenProps): JSX.Element | null {
  const {
    disclaimerText = 'Answers are generated with AI which can make mistakes. Verify responses.',
    threadDepthExceededMessage = 'This conversation is now closed to keep responses accurate.',
    startNewConversationButtonText = 'Start a new conversation',
  } = translations;

  const { messages, askAiError, status } = props;

  // Check if there's a thread depth error
  const hasThreadDepthError = useMemo(() => {
    return status === 'error' && isThreadDepthError(askAiError);
  }, [status, askAiError]);

  // Group messages into exchanges (user + assistant pairs)
  const exchanges: Exchange[] = useMemo(() => {
    const grouped: Exchange[] = [];
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === 'user') {
        const userMessage = messages[i];
        const assistantMessage = messages[i + 1]?.role === 'assistant' ? messages[i + 1] : null;
        grouped.push({ id: userMessage.id, userMessage, assistantMessage });
        if (assistantMessage) {
          i++;
        }
      }
    }

    // If there's a thread depth error, remove the last exchange (the one that triggered the error)
    // We only want to show successful exchanges
    if (hasThreadDepthError && grouped.length > 0) {
      // Check if the last exchange has no assistant message (failed to complete)
      const lastExchange = grouped[grouped.length - 1];
      if (!lastExchange.assistantMessage) {
        grouped.pop();
      }
    }

    return grouped;
  }, [messages, hasThreadDepthError]);

  // Only show the thread depth error if we have assistant messages
  const showThreadDepthError = hasThreadDepthError && messages.some((m) => m.role === 'assistant');

  return (
    <div className="DocSearch-AskAiScreen DocSearch-AskAiScreen-Container">
      {/* Thread Depth Error */}
      {showThreadDepthError && (
        <div className="DocSearch-AskAiScreen-MessageContent DocSearch-AskAiScreen-Error DocSearch-AskAiScreen-Error--ThreadDepth">
          <div className="DocSearch-AskAiScreen-Error-Content">
            <p>
              {threadDepthExceededMessage}{' '}
              <button type="button" className="DocSearch-ThreadDepthError-Link" onClick={props.onNewConversation}>
                {startNewConversationButtonText}
              </button>{' '}
              to continue.
            </p>
          </div>
        </div>
      )}

      <AskAiScreenHeader disclaimerText={disclaimerText} />

      <div className="DocSearch-AskAiScreen-Body">
        <div className="DocSearch-AskAiScreen-ExchangesList">
          {exchanges
            .slice()
            .reverse()
            .map((exchange, index) => (
              <AskAiExchangeCard
                key={exchange.id}
                exchange={exchange}
                askAiError={props.askAiError}
                isLastExchange={index === 0}
                loadingStatus={props.status}
                translations={translations}
                conversations={props.conversations}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

function RelatedSourceIcon(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="9" y2="9" />
      <line x1="4" x2="20" y1="15" y2="15" />
      <line x1="10" x2="8" y1="3" y2="21" />
      <line x1="16" x2="14" y1="3" y2="21" />
    </svg>
  );
}

export function CopyButton({
  onClick,
  translations,
}: {
  onClick: () => void;
  translations: AskAiScreenTranslations;
}): JSX.Element {
  const { copyButtonTitle = 'Copy', copyButtonCopiedText = 'Copied!' } = translations;

  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 1500); // reset after 1.5 seconds
      return (): void => clearTimeout(timer);
    }
    return undefined;
  }, [isCopied]);

  const handleClick = (): void => {
    onClick();
    setIsCopied(true);
  };

  return (
    <button
      type="button"
      className={`DocSearch-AskAiScreen-ActionButton DocSearch-AskAiScreen-CopyButton ${
        isCopied ? 'DocSearch-AskAiScreen-CopyButton--copied' : ''
      }`}
      disabled={isCopied} // disable button briefly after copy
      title={isCopied ? copyButtonCopiedText : copyButtonTitle}
      onClick={handleClick}
    >
      {isCopied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-check-icon lucide-check"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-copy-icon lucide-copy"
        >
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      )}
    </button>
  );
}
