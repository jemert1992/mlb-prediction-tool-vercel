import { getAllPredictionsForDate } from '@/lib/mlbStatsApi';
import GameCard from '@/components/GameCard';
import DateNavigation from '@/components/DateNavigation';
import PredictionTypeSelector from '@/components/PredictionTypeSelector';
import { Suspense } from 'react';

export default async function Home({
  searchParams,
}: {
  searchParams: { date?: string; type?: string };
}) {
  // Get the date from the query parameters or use today's date
  const dateParam = searchParams.date;
  const date = dateParam ? new Date(dateParam) : new Date();
  
  // Get the prediction type from the query parameters or use default
  const predictionType = searchParams.type || 'under_1_run_1st';
  
  // Get all predictions for the date
  const allPredictions = await getAllPredictionsForDate(date);
  
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
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
        <span className="ml-4 text-gray-600">Data refreshes automatically every 15 minutes</span>
      </div>
      
      {allPredictions.games.length === 0 ? (
        <div className="w-full max-w-6xl bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-8">
          <h2 className="text-2xl font-bold">No MLB games scheduled for this date</h2>
          <p className="mt-2">Please select a different date to view predictions.</p>
        </div>
      ) : (
        <>
          <PredictionTypeSelector selectedType={predictionType} />
          
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <Suspense fallback={<div>Loading games...</div>}>
              {allPredictions.games.map((game: any) => (
                <GameCard 
                  key={game.game_id}
                  game={game}
                  predictions={allPredictions.predictions[`${game.away_team}_${game.home_team}`]}
                  predictionType={predictionType}
                />
              ))}
            </Suspense>
          </div>
          
          <div className="w-full max-w-6xl mt-12 mb-8">
            <h2 className="text-2xl font-bold mb-4">Comprehensive Stats Comparison</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border">Matchup</th>
                    <th className="py-2 px-4 border">Game Time</th>
                    <th className="py-2 px-4 border">Under 1 Run (1st)</th>
                    <th className="py-2 px-4 border">Over 2.5 Runs (3 Inn)</th>
                    <th className="py-2 px-4 border">Over 3.5 Runs (3 Inn)</th>
                    <th className="py-2 px-4 border">Pitcher Matchup</th>
                    <th className="py-2 px-4 border">ERA Source</th>
                    <th className="py-2 px-4 border">Ballpark</th>
                  </tr>
                </thead>
                <tbody>
                  {allPredictions.games.map((game: any) => {
                    const predictions = allPredictions.predictions[`${game.away_team}_${game.home_team}`];
                    return (
                      <tr key={game.game_id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border">{game.away_team} @ {game.home_team}</td>
                        <td className="py-2 px-4 border">{game.game_time}</td>
                        <td className="py-2 px-4 border">{predictions?.under_1_run_1st?.probability}%</td>
                        <td className="py-2 px-4 border">{predictions?.over_2_5_runs_first_3?.probability}%</td>
                        <td className="py-2 px-4 border">{predictions?.over_3_5_runs_first_3?.probability}%</td>
                        <td className="py-2 px-4 border">{game.away_pitcher} vs {game.home_pitcher}</td>
                        <td className="py-2 px-4 border">{game.away_era_source} / {game.home_era_source}</td>
                        <td className="py-2 px-4 border">{game.venue}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
