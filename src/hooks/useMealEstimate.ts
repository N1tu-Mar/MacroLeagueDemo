import { useCallback, useState } from 'react';
import {
  EstimateError,
  estimateMeal,
} from '../services/nutrition/mealEstimateService';
import { DatabaseError } from '../services/mealLogService';
import { MealEstimateCandidate } from '../services/nutrition/types';

function toUserFacingError(error: unknown): string {
  if (error instanceof EstimateError) {
    return error.message;
  }
  if (error instanceof DatabaseError) {
    return 'We could not estimate that meal. Please try again.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export function useMealEstimate(): {
  query: string;
  setQuery: (value: string) => void;
  candidates: MealEstimateCandidate[];
  isEstimating: boolean;
  cached: boolean;
  error: string | null;
  estimate: () => Promise<void>;
  reset: () => void;
} {
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState<MealEstimateCandidate[]>([]);
  const [isEstimating, setIsEstimating] = useState(false);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimate = useCallback(async () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setError('Please describe your meal in at least 2 characters.');
      return;
    }

    setIsEstimating(true);
    setError(null);

    try {
      const result = await estimateMeal({ query: trimmed });
      setCandidates(result.candidates);
      setCached(result.cached);
      if (result.candidates.length === 0) {
        setError('No matches found. Try simpler keywords, then edit the macros before saving.');
      }
    } catch (caughtError) {
      setCandidates([]);
      setError(toUserFacingError(caughtError));
    } finally {
      setIsEstimating(false);
    }
  }, [query]);

  const reset = useCallback(() => {
    setQuery('');
    setCandidates([]);
    setCached(false);
    setError(null);
  }, []);

  return { query, setQuery, candidates, isEstimating, cached, error, estimate, reset };
}
