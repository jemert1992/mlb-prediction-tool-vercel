"use client";

import { FC } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface GameCardProps {
  game: any;
  predictions: any;
  predictionType: string;
}

const GameCard: FC<GameCardProps> = ({ game, predictions, predictionType }) => {
  if (!game || !predictions) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Error Loading Game</CardTitle>
          <CardDescription className="text-center">Unable to load game data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Get the selected prediction
  const prediction = predictions[predictionType];
  
  // Format prediction title based on type
  const getPredictionTitle = (type: string) => {
    switch (type) {
      case 'under_1_run_1st':
        return 'Under 1 Run (1st Inning)';
      case 'over_2_5_runs_first_3':
        return 'Over 2.5 Runs (First 3 Innings)';
      case 'over_3_5_runs_first_3':
        return 'Over 3.5 Runs (First 3 Innings)';
      default:
        return 'Prediction';
    }
  };

  // Get color based on probability
  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'bg-green-500';
    if (probability >= 60) return 'bg-green-400';
    if (probability >= 50) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  // Format factors for display
  const formatFactors = (factors: any) => {
    if (!factors) return [];
    
    return Object.entries(factors)
      .map(([key, value]: [string, any]) => ({
        name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: value
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const topFactors = prediction ? formatFactors(prediction.factors) : [];

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline">{game.game_time}</Badge>
          <Badge variant={game.status === 'Preview' ? 'outline' : 'secondary'}>
            {game.status}
          </Badge>
        </div>
        <CardTitle className="text-center">{game.away_team} @ {game.home_team}</CardTitle>
        <CardDescription className="text-center">{game.venue}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Prediction Probability */}
          {prediction ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{getPredictionTitle(predictionType)}</h3>
                <Badge className={getProbabilityColor(prediction.probability)}>
                  {prediction.probability}%
                </Badge>
              </div>
              <Progress value={prediction.probability} className="h-2" />
            </div>
          ) : (
            <div className="text-center text-red-500">No prediction available</div>
          )}

          {/* Pitcher Matchup */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="text-center">
              <div className="font-semibold">{game.away_pitcher}</div>
              <div className="text-sm">ERA: {game.away_era}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{game.home_pitcher}</div>
              <div className="text-sm">ERA: {game.home_era}</div>
            </div>
          </div>

          {/* Top Factors */}
          {topFactors.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Top Factors</h3>
              <div className="space-y-2">
                {topFactors.map((factor, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{factor.name}</span>
                    <Badge variant="outline">{factor.value.toFixed(2)}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="text-xs text-gray-500 w-full text-center">
          Data Source: {game.home_era_source}
        </div>
      </CardFooter>
    </Card>
  );
};

export default GameCard;
