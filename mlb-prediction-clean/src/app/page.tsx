"use client";

import { Suspense, useEffect, useState } from 'react';
import DateNavigation from '@/components/DateNavigation';
import PredictionTypeSelector from '@/components/PredictionTypeSelector';
import GameCard from '@/components/GameCard';

export default function Home({
  searchParams,
}: {
  searchParams: { date?: string; type?: string };
}) {
  // Get the date from the query parameters or use today's date
  const dateParam = searchParams.date;
  const date = dateParam ? new Date(dateParam) : new Date();
  
  // Get the prediction type from the query parameters or use default
  const predictionType = searchParams.type || 'under_1_run_1st';
  
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Format date as YYYY-MM-DD for API
        const formattedDate = date.toISOString().split('T')[0];
        const response = await fetch(`/api/predictions?date=${formattedDate}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch predictions: ${response.status}`);
        }
        
        const data = await response.json();
        setPredictions(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching predictions:', err);
        setError('Failed to load predictions. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [date]);
  
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-navy-950 text-white">
      <h1 className="text-4xl font-bold text-center mb-2">MLB First Inning Prediction Tool</h1>
      <p className="text-xl text-center mb-6">Comprehensive analysis of MLB games with multiple prediction types</p>
      
      <div className="bg-green-600 text-white px-4 py-2 rounded-full mb-4">
        Data Source: MLB Stats API (Official)
      </div>
      
      <p className="text-sm mb-8">
        Last Updated: {new Date().toLocaleString()}
      </p>
      
      <DateNavigation currentDate={date} />
      
      <div className="w-full max-w-6xl mt-8">
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
          onClick={() => window.location.reload()}
        >
          Refresh Data
        </button>
        <span className="ml-4 text-gray-400">Data refreshes automatically every 15 minutes</span>
      </div>
      
      {loading ? (
        <div className="w-full max-w-6xl text-center mt-8">
          <p className="text-xl">Loading predictions...</p>
        </div>
      ) : error ? (
        <div className="w-full max-w-6xl bg-red-900 border border-red-700 text-white px-4 py-3 rounded mt-8">
          <h2 className="text-2xl font-bold">Error</h2>
          <p className="mt-2">{error}</p>
        </div>
      ) : predictions && predictions.games && predictions.games.length === 0 ? (
        <div className="w-full max-w-6xl bg-red-900 border border-red-700 text-white px-4 py-3 rounded mt-8">
          <h2 className="text-2xl font-bold">No MLB games scheduled for this date</h2>
          <p className="mt-2">Please select a different date to view predictions.</p>
        </div>
      ) : predictions ? (
        <>
          <PredictionTypeSelector selectedType={predictionType} />
          
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {predictions.games.map((game: any) => (
              <GameCard 
                key={game.game_id}
                game={game}
                predictions={predictions.predictions[`${game.away_team}_${game.home_team}`]}
                predictionType={predictionType}
              />
            ))}
          </div>
          
          <div className="w-full max-w-6xl mt-12 mb-8">
            <h2 className="text-2xl font-bold mb-4">Comprehensive Stats Comparison</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-navy-800 border border-navy-700">
                <thead>
                  <tr className="bg-navy-700">
                    <th className="py-2 px-4 border border-navy-600">Matchup</th>
                    <th className="py-2 px-4 border border-navy-600">Game Time</th>
                    <th className="py-2 px-4 border border-navy-600">Under 1 Run (1st)</th>
                    <th className="py-2 px-4 border border-navy-600">Over 2.5 Runs (3 Inn)</th>
                    <th className="py-2 px-4 border border-navy-600">Over 3.5 Runs (3 Inn)</th>
                    <th className="py-2 px-4 border border-navy-600">Pitcher Matchup</th>
                    <th className="py-2 px-4 border border-navy-600">ERA Source</th>
                    <th className="py-2 px-4 border border-navy-600">Ballpark</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.games.map((game: any) => {
                    const gamePredictions = predictions.predictions[`${game.away_team}_${game.home_team}`];
                    return (
                      <tr key={game.game_id} className="hover:bg-navy-700">
                        <td className="py-2 px-4 border border-navy-600">{game.away_team} @ {game.home_team}</td>
                        <td className="py-2 px-4 border border-navy-600">{game.game_time}</td>
                        <td className="py-2 px-4 border border-navy-600">{gamePredictions?.under_1_run_1st?.probability}%</td>
                        <td className="py-2 px-4 border border-navy-600">{gamePredictions?.over_2_5_runs_first_3?.probability}%</td>
                        <td className="py-2 px-4 border border-navy-600">{gamePredictions?.over_3_5_runs_first_3?.probability}%</td>
                        <td className="py-2 px-4 border border-navy-600">{game.away_pitcher} vs {game.home_pitcher}</td>
                        <td className="py-2 px-4 border border-navy-600">{game.away_era_source} / {game.home_era_source}</td>
                        <td className="py-2 px-4 border border-navy-600">{game.venue}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}
