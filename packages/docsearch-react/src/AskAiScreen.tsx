import React, { type JSX, useMemo } from 'react';

import type { AskAiScreenStateProps } from './AskAiScreenState';
import { FeedbackActions } from './components/FeedbackActions';
import { SourcesPanel } from './components/SourcesPanel';
import { AlertIcon, SparklesIcon } from './icons';
import { MemoizedMarkdown } from './MemoizedMarkdown';
import type { StoredSearchPlugin } from './stored-searches';
import type {
  InternalDocSearchHit,
  OnAskAiFeedback,
  StoredAskAiState,
} from './types';
import { type AIMessage, type AskAiStatus } from './types/AskiAi';
import {
  extractLinksFromMessage,
  getAskAiBlockingBannerMessage,
  getMessageContent,
  isAskAiPromptBlockingError,
  isThreadDepthError,
  showAskAiBlockingBannerNewConversationLink,
} from './utils/ai';

export type AskAiScreenTranslations = Partial<
  {
    // Misc texts
    disclaimerText: string;
    /** Text shown describing a singular related source. */
    relatedSourcesText: string;
    /** Text shown describing multiple related sources. */
    relatedSourcesTextPlural: string;
    thinkingText: string;
    copyButtonText: string;
    copyButtonCopiedText: string;
    // Feedback buttons
    copyButtonTitle: string;
    likeButtonTitle: string;
    dislikeButtonTitle: string;
    thanksForFeedbackText: string;
    // Negative feedback note panel
    feedbackPanelTitle: string;
    feedbackDetailsPlaceholder: string;
    feedbackDisclaimerText: string;
    feedbackSubmitButtonText: string;
    feedbackCloseButtonTitle: string;
    feedbackTagIncorrect: string;
    feedbackTagNotWhatIAsked: string;
    feedbackTagSlowOrBuggy: string;
    feedbackTagStyleOrTone: string;
    feedbackTagSafetyOrLegal: string;
    feedbackTagOther: string;
    /** Message that's shown when user has stopped the streaming of a message. */
    stoppedStreamingText: string;
    /** Error title shown if there is an error while chatting. */
    errorTitleText: string;
    /** Message shown when thread depth limit is exceeded (AI-217 error). */
    threadDepthExceededMessage: string;
    /** Button text for starting a new conversation after thread depth error. */
    startNewConversationButtonText: string;
  }
>;

type AskAiScreenProps = Omit<
  AskAiScreenStateProps<InternalDocSearchHit>,
  'translations'
> & {
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

function AskAiScreenDisclaimer({
  disclaimerText,
}: AskAiScreenHeaderProps): JSX.Element {
  return (
    <p className="DocSearch-AskAiScreen-Disclaimer">
      <SparklesIcon /> {disclaimerText}
    </p>
  );
}

interface AskAiExchangeCardProps {
  exchange: Exchange;
  askAiError?: Error;
  isLastExchange: boolean;
  loadingStatus: AskAiStatus;
  translations: AskAiScreenTranslations;
  conversations: StoredSearchPlugin<StoredAskAiState>;
  onFeedback?: OnAskAiFeedback;
}

function AskAiExchangeCard({
  exchange,
  askAiError,
  isLastExchange,
  loadingStatus,
  translations,
  conversations,
  onFeedback,
}: AskAiExchangeCardProps): JSX.Element {
  const { userMessage, assistantMessage } = exchange;

  const {
    stoppedStreamingText = 'You stopped this response',
    errorTitleText = 'Chat error',
    relatedSourcesText,
    relatedSourcesTextPlural,
  } = translations;

  const isPromptBlockingError = isAskAiPromptBlockingError(askAiError);

  const assistantContent = useMemo(
    () => getMessageContent(assistantMessage),
    [assistantMessage]
  );
  const userContent = useMemo(
    () => getMessageContent(userMessage),
    [userMessage]
  );

  const urlsToDisplay = React.useMemo(
    () => extractLinksFromMessage(assistantMessage),
    [assistantMessage]
  );

  const displayParts = assistantMessage?.parts ?? [];

  const wasStopped =
    userMessage.metadata?.stopped || assistantMessage?.metadata?.stopped;

  const showActions =
    !wasStopped &&
    (!isLastExchange ||
      (isLastExchange &&
        loadingStatus === 'ready' &&
        Boolean(assistantMessage)));

  const isThinking =
    ['submitted', 'streaming'].includes(loadingStatus) &&
    isLastExchange &&
    displayParts.length === 0;

  const messageId = assistantMessage?.id || exchange.id;

  return (
    <div className="DocSearch-AskAiScreen-Response-Container">
      <div className="DocSearch-AskAiScreen-Response">
        <div className="DocSearch-AskAiScreen-Message DocSearch-AskAiScreen-Message--user">
          <p className="DocSearch-AskAiScreen-Query">{userContent ?? ''}</p>
        </div>
        <div className="DocSearch-AskAiScreen-Message DocSearch-AskAiScreen-Message--assistant">
          <div className="DocSearch-AskAiScreen-MessageContent">
            {loadingStatus === 'error' &&
              askAiError &&
              isLastExchange &&
              !isPromptBlockingError && (
                <div className="DocSearch-AskAiScreen-Error" role="alert">
                  <AlertIcon aria-hidden="true" />
                  <div className="DocSearch-AskAiScreen-Error-Content">
                    <h4 className="DocSearch-AskAiScreen-Error-Title">
                      {errorTitleText}
                    </h4>
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
              <div
                className="DocSearch-AskAiScreen-MessageContent-Thinking"
                role="status"
              >
                <span className="DocSearch-shimmer">
                  {translations.thinkingText || 'Thinking...'}
                </span>
                <span className="DocSearch-AskAi-Thinking-Skeleton DocSearch-shimmer" />
                <span className="DocSearch-AskAi-Thinking-Skeleton DocSearch-AskAi-Thinking-Skeleton--short DocSearch-shimmer" />
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
                    copyButtonCopiedText={
                      translations.copyButtonCopiedText || 'Copied!'
                    }
                    isStreaming={part.state === 'streaming'}
                  />
                );
              }

              // fallback for unknown part type
              return null;
            })}
          </div>

          {wasStopped && (
            <p className="DocSearch-AskAiScreen-MessageContent-Stopped">
              {stoppedStreamingText}
            </p>
          )}
        </div>
        <div className="DocSearch-AskAiScreen-Answer-Footer">
          <SourcesPanel
            links={urlsToDisplay}
            titleText={relatedSourcesText}
            pluralTitleText={relatedSourcesTextPlural}
          />
          <FeedbackActions
            id={messageId}
            showActions={showActions}
            latestAssistantMessageContent={assistantContent || null}
            translations={translations}
            conversations={conversations}
            onFeedback={onFeedback}
          />
        </div>
      </div>
    </div>
  );
}

export function AskAiScreen({
  translations = {},
  ...props
}: AskAiScreenProps): JSX.Element | null {
  const {
    disclaimerText = 'Answers are generated with AI which can make mistakes.',
    threadDepthExceededMessage = 'This conversation is now closed to keep responses accurate.',
    startNewConversationButtonText = 'Start a new conversation',
  } = translations;

  const { messages, askAiError, status } = props;

  const hasPromptBlockingError = useMemo(() => {
    return status === 'error' && isAskAiPromptBlockingError(askAiError);
  }, [status, askAiError]);
  const blockingMessage = useMemo(
    () => getAskAiBlockingBannerMessage(askAiError),
    [askAiError]
  );
  const showNewConversationLink =
    showAskAiBlockingBannerNewConversationLink(askAiError);

  // Group messages into exchanges (user + assistant pairs)
  const exchanges: Exchange[] = useMemo(() => {
    const grouped: Exchange[] = [];
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === 'user') {
        const userMessage = messages[i];
        const assistantMessage =
          messages[i + 1]?.role === 'assistant' ? messages[i + 1] : null;
        grouped.push({ id: userMessage.id, userMessage, assistantMessage });
        if (assistantMessage) {
          i++;
        }
      }
    }

    return grouped;
  }, [messages]);

  const showBlockingBanner =
    hasPromptBlockingError &&
    (!isThreadDepthError(askAiError) ||
      messages.some((message) => message.role === 'assistant'));

  return (
    <div className="DocSearch-AskAiScreen DocSearch-AskAiScreen-Container">
      <div id={props.promptBlockingErrorId} role="alert">
        {showBlockingBanner && (
          <div className="DocSearch-AskAiScreen-MessageContent DocSearch-AskAiScreen-Error DocSearch-AskAiScreen-Error--ThreadDepth">
            <div className="DocSearch-AskAiScreen-Error-Content">
              <p className="DocSearch-AskAiScreen-Error-Title">
                {blockingMessage ??
                  (isThreadDepthError(askAiError)
                    ? threadDepthExceededMessage
                    : 'This conversation cannot continue.')}
              </p>
              {showNewConversationLink && (
                <p>
                  <button
                    type="button"
                    className="DocSearch-ThreadDepthError-Link"
                    onClick={props.onNewConversation}
                  >
                    {startNewConversationButtonText}
                  </button>{' '}
                  to continue.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <AskAiScreenDisclaimer disclaimerText={disclaimerText} />

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
                onFeedback={props.onFeedback}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
