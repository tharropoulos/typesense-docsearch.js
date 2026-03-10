import type { JSX } from 'react';
import React, { memo, useMemo } from 'react';

import { type Exchange } from '../AskAiScreen';
import { FeedbackActions } from '../components/FeedbackActions';
import { SourcesPanel } from '../components/SourcesPanel';
import { AlertIcon } from '../icons';
import { MemoizedMarkdown } from '../MemoizedMarkdown';
import type { StoredSearchPlugin } from '../stored-searches';
import type { OnAskAiFeedback, StoredAskAiState } from '../types';
import type { AskAiStatus } from '../types/AskiAi';
import {
  extractLinksFromMessage,
  getMessageContent,
  isAskAiPromptBlockingError,
} from '../utils/ai';

export type ConversationScreenTranslations = Partial<
  {
    /** Text shown as an LLM disclaimer. */
    conversationDisclaimer: string;
    /** Text show while assistant is thinking. */
    thinkingText: string;
    /** Text shown describing a singular related source. */
    relatedSourcesText: string;
    /** Text shown describing multiple related sources. */
    relatedSourcesTextPlural: string;
    /** Message that's shown when user has stopped the streaming of a message. */
    stoppedStreamingText: string;
    /** Text shown for copy button on code snippets. */
    copyButtonText: string;
    /** Message shown after clicking copy. */
    copyButtonCopiedText: string;
    /** Title for thumbs up feedback icon. */
    likeButtonTitle: string;
    /** Title for thumbs down feedback icon. */
    dislikeButtonTitle: string;
    /** Message displayed after feedback action. */
    thanksForFeedbackText: string;
    /** Title shown at the top of the negative feedback note panel. */
    feedbackPanelTitle: string;
    /** Placeholder for the negative feedback details textarea. */
    feedbackDetailsPlaceholder: string;
    /** Disclaimer shown inside the negative feedback note panel. */
    feedbackDisclaimerText: string;
    /** Submit button text for the negative feedback note panel. */
    feedbackSubmitButtonText: string;
    /** Accessible title for the negative feedback note panel close button. */
    feedbackCloseButtonTitle: string;
    /** Reason chip labels for the negative feedback note panel. */
    feedbackTagIncorrect: string;
    feedbackTagNotWhatIAsked: string;
    feedbackTagSlowOrBuggy: string;
    feedbackTagStyleOrTone: string;
    feedbackTagSafetyOrLegal: string;
    feedbackTagOther: string;
    /** Error title shown if there is an error while chatting. */
    errorTitleText: string;
  }
>;

export type ConversationScreenProps = {
  exchanges: Exchange[];
  conversations: StoredSearchPlugin<StoredAskAiState>;
  translations?: ConversationScreenTranslations;
  status: AskAiStatus;
  handleFeedback?: OnAskAiFeedback;
  streamError?: Error;
};

type ConversationnExchangeProps = {
  exchange: Exchange;
  isLastExchange: boolean;
  status: ConversationScreenProps['status'];
  conversations: ConversationScreenProps['conversations'];
  translations?: ConversationScreenTranslations;
  onFeedback?: ConversationScreenProps['handleFeedback'];
  streamError?: ConversationScreenProps['streamError'];
};

const ConversationExchange = React.forwardRef<
  HTMLDivElement,
  ConversationnExchangeProps
>(
  (
    {
      exchange,
      translations = {},
      isLastExchange,
      conversations,
      onFeedback,
      status,
      streamError,
    },
    conversationRef
  ): JSX.Element => {
    const { userMessage, assistantMessage } = exchange;

    const {
      thinkingText = 'Thinking...',
      relatedSourcesText,
      relatedSourcesTextPlural,
      stoppedStreamingText = 'You stopped this response',
      copyButtonText = 'Copy',
      copyButtonCopiedText = 'Copied!',
      errorTitleText = 'Chat error',
    } = translations;

    const assistantContent = useMemo(
      () => getMessageContent(assistantMessage),
      [assistantMessage]
    );
    const userContent = useMemo(
      () => getMessageContent(userMessage),
      [userMessage]
    );

    const assistantParts = assistantMessage?.parts ?? [];
    const urlsToDisplay = React.useMemo(
      () => extractLinksFromMessage(assistantMessage),
      [assistantMessage]
    );

    const wasStopped =
      userMessage.metadata?.stopped || assistantMessage?.metadata?.stopped;
    const isThinking =
      ['submitted', 'streaming'].includes(status) && assistantParts.length === 0;
    const showActions =
      !wasStopped &&
      (!isLastExchange ||
        (isLastExchange && status === 'ready' && Boolean(assistantMessage)));

    const messageId = assistantMessage?.id || exchange.id;

    return (
      <div
        className="DocSearch-AskAiScreen-Response-Container"
        ref={conversationRef}
      >
        <div className="DocSearch-AskAiScreen-Response">
          <div className="DocSearch-AskAiScreen-Message DocSearch-AskAiScreen-Message--user">
            <p className="DocSearch-AskAiScreen-Query">{userContent ?? ''}</p>
          </div>
          <div className="DocSearch-AskAiScreen-Message DocSearch-AskAiScreen-Message--assistant">
            <div className="DocSearch-AskAiScreen-MessageContent">
              {status === 'error' &&
                streamError &&
                isLastExchange &&
                !isAskAiPromptBlockingError(streamError) && (
                  <div className="DocSearch-AskAiScreen-Error" role="alert">
                    <AlertIcon aria-hidden="true" />
                    <div className="DocSearch-AskAiScreen-Error-Content">
                      <h4 className="DocSearch-AskAiScreen-Error-Title">
                        {errorTitleText}
                      </h4>
                      <MemoizedMarkdown
                        content={streamError.message}
                        copyButtonText=""
                        copyButtonCopiedText=""
                        isStreaming={false}
                      />
                    </div>
                  </div>
                )}

              {assistantParts.map((part, idx) => {
                const index = idx;

                if (part.type === 'text') {
                  return (
                    <MemoizedMarkdown
                      key={index}
                      content={part.text}
                      copyButtonText={copyButtonText}
                      copyButtonCopiedText={copyButtonCopiedText}
                      isStreaming={part.state === 'streaming'}
                    />
                  );
                }

                return null;
              })}

              {isThinking && isLastExchange && assistantParts.length === 0 && (
                <div
                  className="DocSearch-AskAiScreen-MessageContent-Thinking"
                  role="status"
                >
                  <span className="DocSearch-shimmer">{thinkingText}</span>
                  <span className="DocSearch-AskAi-Thinking-Skeleton DocSearch-shimmer" />
                  <span className="DocSearch-AskAi-Thinking-Skeleton DocSearch-AskAi-Thinking-Skeleton--short DocSearch-shimmer" />
                </div>
              )}
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
              isSidepanel={true}
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
);

export const ConversationScreen = memo(
  ({
    exchanges,
    translations = {},
    handleFeedback,
    status,
    conversations,
    streamError,
  }: ConversationScreenProps): JSX.Element => {
    const {
      conversationDisclaimer = 'Answers are generated with AI which can make mistakes. Verify responses.',
    } = translations;

    const mostRecentExchangeRef = React.useRef<HTMLDivElement>(null);
    const totalExchanges = exchanges.length;

    // Only scroll the most recent exchange into view when needed
    React.useEffect(() => {
      if (mostRecentExchangeRef.current) {
        mostRecentExchangeRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, [totalExchanges]);

    return (
      <div className="DocSearch-Sidepanel-ConversationScreen">
        <p className="DocSearch-Sidepanel-ConversationScreen-disclaimer">
          {conversationDisclaimer}
        </p>

        {exchanges.slice().map((exchange, idx) => {
          const isLastExchange = idx === exchanges.length - 1;
          return (
            <ConversationExchange
              key={exchange.id}
              exchange={exchange}
              translations={translations}
              isLastExchange={isLastExchange}
              ref={isLastExchange ? mostRecentExchangeRef : null}
              status={status}
              conversations={conversations}
              streamError={streamError}
              onFeedback={handleFeedback}
            />
          );
        })}
      </div>
    );
  }
);
