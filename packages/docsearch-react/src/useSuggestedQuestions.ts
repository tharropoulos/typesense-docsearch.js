import type { SearchResponse } from 'algoliasearch/lite';
import { useEffect, useState } from 'react';

import { SUGGESTED_QUETIONS_INDEX_NAME } from './constants';

import type {
  SuggestedQuestion,
  SuggestedQuestionHit,
  TypesenseDocsearchTransformClient,
} from '.';

type UseSuggestedQuestionsProps = {
  agentId: string | null;
  searchClient: TypesenseDocsearchTransformClient;
  suggestedQuestionsEnabled?: boolean;
};

export const useSuggestedQuestions = ({
  agentId,
  searchClient,
  suggestedQuestionsEnabled = false,
}: UseSuggestedQuestionsProps): SuggestedQuestionHit[] => {
  const [suggestedQuestions, setSuggestedQuestions] = useState<
    SuggestedQuestionHit[]
  >([]);

  useEffect(() => {
    // eslint-disable-next-line no-warning-comments
    // TODO: add typesense search parameters
    const getSuggestedQuestions = async (): Promise<void> => {
      const { results } = await searchClient.search<SuggestedQuestion>({
        requests: [
          {
            collection: SUGGESTED_QUETIONS_INDEX_NAME,
            filter_by: `state:published && assistantId:${agentId}`,
            per_page: 3,
          },
        ],
      });

      const result = results[0] as SearchResponse<SuggestedQuestion>;

      setSuggestedQuestions(result.hits);
    };

    if (suggestedQuestionsEnabled && agentId && agentId !== '') {
      getSuggestedQuestions();
    }
  }, [suggestedQuestionsEnabled, agentId, searchClient]);

  return suggestedQuestions;
};
