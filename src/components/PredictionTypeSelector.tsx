"use client";

import { FC } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PredictionTypeSelectorProps {
  selectedType: string;
}

const PredictionTypeSelector: FC<PredictionTypeSelectorProps> = ({ selectedType }) => {
  const searchParams = useSearchParams();
  const currentDate = searchParams.get('date') || '';
  
  const predictionTypes = [
    { id: 'under_1_run_1st', label: 'Under 1 Run (1st Inning)' },
    { id: 'over_2_5_runs_first_3', label: 'Over 2.5 Runs (First 3 Innings)' },
    { id: 'over_3_5_runs_first_3', label: 'Over 3.5 Runs (First 3 Innings)' },
  ];
  
  return (
    <div className="w-full max-w-6xl mt-8">
      <h2 className="text-2xl font-bold mb-4">Prediction Type</h2>
      <div className="flex flex-wrap gap-2">
        {predictionTypes.map((type) => (
          <Link
            key={type.id}
            href={`/?type=${type.id}${currentDate ? `&date=${currentDate}` : ''}`}
            className={`px-4 py-2 rounded-full ${
              selectedType === type.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {type.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PredictionTypeSelector;
