import type { JSX } from 'react';
import React, { memo, useMemo } from 'react';

import { AskAiSourcesPanel, type Exchange } from '../AskAiScreen';
import { AlertIcon } from '../icons';
import { MemoizedMarkdown } from '../MemoizedMarkdown';
import type { StoredSearchPlugin } from '../stored-searches';
import type { StoredAskAiState } from '../types';
import type { AskAiStatus } from '../types/AskiAi';
import { extractLinksFromMessage, getMessageContent } from '../utils/ai';
import { ConversationActions } from './ConversationActions';

export type ConversationScreenTranslations = Partial<
  {
    conversationDisclaimer: string;
    reasoningText: string;
    thinkingText: string;
    relatedSourcesText: string;
    stoppedStreamingText: string;
    copyButtonText: string;
    copyButtonCopiedText: string;
    likeButtonTitle: string;
    dislikeButtonTitle: string;
    thanksForFeedbackText: string;
    errorTitleText: string;
  }
>;

export type ConversationScreenProps = {
  exchanges: Exchange[];
  conversations: StoredSearchPlugin<StoredAskAiState>;
  translations?: ConversationScreenTranslations;
  status: AskAiStatus;
  handleFeedback?: (messageId: string, thumbs: 0 | 1) => Promise<void>;
  streamError?: Error;
};

type ConversationnExchangeProps = {
  exchange: Exchange;
  isLastExchange: boolean;
  status: ConversationScreenProps['status'];
  conversations: ConversationScreenProps['conversations'];
  translations?: ConversationScreenTranslations;
  streamError?: ConversationScreenProps['streamError'];
};

const ConversationExchange = React.forwardRef<HTMLDivElement, ConversationnExchangeProps>(
  ({ exchange, translations = {}, isLastExchange, status, streamError }, conversationRef): JSX.Element => {
    const { userMessage, assistantMessage } = exchange;

    const {
      thinkingText = 'Thinking...',
      relatedSourcesText = 'Related sources',
      stoppedStreamingText = 'You stopped this response',
      copyButtonText = 'Copy',
      copyButtonCopiedText = 'Copied!',
      errorTitleText = 'Chat error',
    } = translations;

    const assistantContent = useMemo(() => getMessageContent(assistantMessage), [assistantMessage]);
    const userContent = useMemo(() => getMessageContent(userMessage), [userMessage]);
    const assistantParts = assistantMessage?.parts || [];
    const urlsToDisplay = React.useMemo(() => extractLinksFromMessage(assistantMessage), [assistantMessage]);

    const wasStopped = userMessage.metadata?.stopped || assistantMessage?.metadata?.stopped;
    const isThinking = ['submitted', 'streaming'].includes(status) && assistantParts.length === 0;
    const showActions =
      !wasStopped && (!isLastExchange || (isLastExchange && status === 'ready' && Boolean(assistantMessage)));

    return (
      <div className="DocSearch-AskAiScreen-Response-Container" ref={conversationRef}>
        <div className="DocSearch-AskAiScreen-Response">
          <div className="DocSearch-AskAiScreen-Message DocSearch-AskAiScreen-Message--user">
            <p className="DocSearch-AskAiScreen-Query">{userContent?.text ?? ''}</p>
          </div>
          <div className="DocSearch-AskAiScreen-Message DocSearch-AskAiScreen-Message--assistant">
            <div className="DocSearch-AskAiScreen-MessageContent">
              {status === 'error' && streamError && isLastExchange && (
                <div className="DocSearch-AskAiScreen-MessageContent DocSearch-AskAiScreen-Error">
                  <AlertIcon />
                  <div className="DocSearch-AskAiScreen-Error-Content">
                    <h4 className="DocSearch-AskAiScreen-Error-Title">{errorTitleText}</h4>
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
                <div className="DocSearch-AskAiScreen-MessageContent-Reasoning">
                  <span className="shimmer">{thinkingText}</span>
                </div>
              )}
            </div>

            {wasStopped && <p className="DocSearck-AskAiScreen-MessageContent-Stopped">{stoppedStreamingText}</p>}
          </div>

          <div className="DocSearch-AskAiScreen-Answer-Footer">
            <ConversationActions
              showActions={showActions}
              latestAssistantMessageContent={assistantContent?.text || null}
              translations={translations}
            />
          </div>
        </div>

        {urlsToDisplay.length > 0 ? (
          <AskAiSourcesPanel urlsToDisplay={urlsToDisplay} relatedSourcesText={relatedSourcesText} />
        ) : null}
      </div>
    );
  },
);

export const ConversationScreen = memo(
  ({ exchanges, translations = {}, handleFeedback, ...props }: ConversationScreenProps): JSX.Element => {
    const { conversationDisclaimer = 'Answers are generated with AI which can make mistakes. Verify responses.' } =
      translations;

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
        <p className="DocSearch-Sidepanel-ConversationScreen-disclaimer">{conversationDisclaimer}</p>

        {exchanges.slice().map((exchange, idx) => {
          const isLastExchange = idx === exchanges.length - 1;
          return (
            <ConversationExchange
              key={exchange.id}
              exchange={exchange}
              translations={translations}
              isLastExchange={isLastExchange}
              ref={isLastExchange ? mostRecentExchangeRef : null}
              {...props}
            />
          );
        })}
      </div>
    );
  },
);
