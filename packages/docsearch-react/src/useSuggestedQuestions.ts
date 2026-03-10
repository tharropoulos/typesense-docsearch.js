import type { SearchResponse } from 'algoliasearch/lite';
import { useEffect, useState } from 'react';

import { SUGGESTED_QUETIONS_INDEX_NAME } from './constants';

import type { SuggestedQuestion, SuggestedQuestionHit, TypesenseDocsearchTransformClient } from '.';

type UseSuggestedQuestionsProps = {
  assistantId: string | null;
  searchClient: TypesenseDocsearchTransformClient;
  suggestedQuestionsEnabled?: boolean;
};

export const useSuggestedQuestions = ({
  assistantId,
  searchClient,
  suggestedQuestionsEnabled = false,
}: UseSuggestedQuestionsProps): SuggestedQuestionHit[] => {
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestionHit[]>([]);

  useEffect(() => {
    // eslint-disable-next-line no-warning-comments
    // TODO: add typesense search parameters
    const getSuggestedQuestions = async (): Promise<void> => {
      const { results } = await searchClient.search<SuggestedQuestion>({
        requests: [
          {
            collection: SUGGESTED_QUETIONS_INDEX_NAME,
            filter_by: `state:published && assistantId:${assistantId}`,
            per_page: 3,
          },
        ],
      });

      const result = results[0] as SearchResponse<SuggestedQuestion>;

      setSuggestedQuestions(result.hits);
    };

    if (suggestedQuestionsEnabled && assistantId && assistantId !== '') {
      getSuggestedQuestions();
    }
  }, [suggestedQuestionsEnabled, assistantId, searchClient]);

  return suggestedQuestions;
};
