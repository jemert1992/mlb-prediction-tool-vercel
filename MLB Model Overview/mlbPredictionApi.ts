import { cache } from 'react';
import { getGamesForDate } from './mlbStatsApi';

// Prediction factors and weights
const PREDICTION_FACTORS = {
  pitcher_era: 0.35,
  bullpen_era: 0.20,
  team_batting_avg: 0.15,
  ballpark_factor: 0.10,
  weather: 0.05,
  recent_performance: 0.15
};

// Sample team stats for fallback
const TEAM_STATS = {
  'Arizona Diamondbacks': { batting_avg: 0.252, bullpen_era: 3.95 },
  'Atlanta Braves': { batting_avg: 0.257, bullpen_era: 3.39 },
  'Baltimore Orioles': { batting_avg: 0.258, bullpen_era: 3.83 },
  'Boston Red Sox': { batting_avg: 0.261, bullpen_era: 3.96 },
  'Chicago Cubs': { batting_avg: 0.247, bullpen_era: 4.02 },
  'Chicago White Sox': { batting_avg: 0.236, bullpen_era: 4.87 },
  'Cincinnati Reds': { batting_avg: 0.243, bullpen_era: 4.28 },
  'Cleveland Guardians': { batting_avg: 0.251, bullpen_era: 3.62 },
  'Colorado Rockies': { batting_avg: 0.251, bullpen_era: 5.37 },
  'Detroit Tigers': { batting_avg: 0.238, bullpen_era: 4.24 },
  'Houston Astros': { batting_avg: 0.259, bullpen_era: 3.56 },
  'Kansas City Royals': { batting_avg: 0.244, bullpen_era: 4.55 },
  'Los Angeles Angels': { batting_avg: 0.245, bullpen_era: 4.12 },
  'Los Angeles Dodgers': { batting_avg: 0.258, bullpen_era: 3.42 },
  'Miami Marlins': { batting_avg: 0.233, bullpen_era: 4.42 },
  'Milwaukee Brewers': { batting_avg: 0.247, bullpen_era: 3.82 },
  'Minnesota Twins': { batting_avg: 0.243, bullpen_era: 3.95 },
  'New York Mets': { batting_avg: 0.254, bullpen_era: 4.02 },
  'New York Yankees': { batting_avg: 0.254, bullpen_era: 3.58 },
  'Oakland Athletics': { batting_avg: 0.227, bullpen_era: 4.92 },
  'Philadelphia Phillies': { batting_avg: 0.256, bullpen_era: 3.72 },
  'Pittsburgh Pirates': { batting_avg: 0.241, bullpen_era: 4.35 },
  'San Diego Padres': { batting_avg: 0.251, bullpen_era: 3.83 },
  'San Francisco Giants': { batting_avg: 0.237, bullpen_era: 3.89 },
  'Seattle Mariners': { batting_avg: 0.232, bullpen_era: 3.45 },
  'St. Louis Cardinals': { batting_avg: 0.252, bullpen_era: 4.12 },
  'Tampa Bay Rays': { batting_avg: 0.238, bullpen_era: 3.82 },
  'Texas Rangers': { batting_avg: 0.263, bullpen_era: 4.02 },
  'Toronto Blue Jays': { batting_avg: 0.243, bullpen_era: 3.68 },
  'Washington Nationals': { batting_avg: 0.254, bullpen_era: 4.56 }
};

// Ballpark factors (run scoring environment)
const BALLPARK_FACTORS = {
  'Coors Field': 1.28,
  'Great American Ball Park': 1.12,
  'Fenway Park': 1.10,
  'Wrigley Field': 1.06,
  'Chase Field': 1.05,
  'Globe Life Field': 1.04,
  'Citizens Bank Park': 1.03,
  'Yankee Stadium': 1.02,
  'Truist Park': 1.01,
  'Dodger Stadium': 0.99,
  'Petco Park': 0.98,
  'Busch Stadium': 0.97,
  'Citi Field': 0.96,
  'Oracle Park': 0.95,
  'T-Mobile Park': 0.94,
  'Tropicana Field': 0.93,
  'Oakland Coliseum': 0.92
};

// Default ballpark factor if not found
const DEFAULT_BALLPARK_FACTOR = 1.0;

// Weather impact on scoring
const WEATHER_IMPACT = {
  'Clear': 1.05,
  'Sunny': 1.05,
  'Partly Cloudy': 1.02,
  'Cloudy': 1.0,
  'Overcast': 0.98,
  'Drizzle': 0.97,
  'Rain': 0.95,
  'Heavy Rain': 0.90,
  'Snow': 0.85,
  'Windy': 0.97
};

// Default weather impact if not found
const DEFAULT_WEATHER_IMPACT = 1.0;

// Temperature impact on scoring
const getTemperatureImpact = (temperature: number): number => {
  if (temperature >= 85) return 1.08; // Hot weather increases scoring
  if (temperature >= 75) return 1.05;
  if (temperature >= 65) return 1.02;
  if (temperature >= 55) return 1.0;
  if (temperature >= 45) return 0.97;
  return 0.95; // Cold weather decreases scoring
};

// Get team stats (batting average, bullpen ERA)
const getTeamStats = (teamName: string) => {
  // Use sample data for now
  return TEAM_STATS[teamName] || { batting_avg: 0.245, bullpen_era: 4.20 };
};

// Get ballpark factor
const getBallparkFactor = (venueName: string): number => {
  for (const [ballpark, factor] of Object.entries(BALLPARK_FACTORS)) {
    if (venueName.includes(ballpark)) {
      return factor;
    }
  }
  return DEFAULT_BALLPARK_FACTOR;
};

// Get weather impact
const getWeatherImpact = (weather: string): number => {
  for (const [condition, impact] of Object.entries(WEATHER_IMPACT)) {
    if (weather.includes(condition)) {
      return impact;
    }
  }
  return DEFAULT_WEATHER_IMPACT;
};

// Calculate prediction for under 1 run in 1st inning
const calculateUnder1RunPrediction = (game: any): any => {
  try {
    // Get team stats
    const homeStats = getTeamStats(game.home_team);
    const awayStats = getTeamStats(game.away_team);
    
    // Get ballpark factor
    const ballparkFactor = getBallparkFactor(game.venue);
    
    // Get weather impact (default for now)
    const weatherImpact = DEFAULT_WEATHER_IMPACT;
    
    // Calculate pitcher impact
    const homePitcherImpact = 1.0 - (game.home_era / 10.0); // Lower ERA = better pitcher = higher impact
    const awayPitcherImpact = 1.0 - (game.away_era / 10.0);
    const pitcherFactor = (homePitcherImpact + awayPitcherImpact) / 2.0;
    
    // Calculate bullpen impact
    const homeBullpenImpact = 1.0 - (homeStats.bullpen_era / 10.0);
    const awayBullpenImpact = 1.0 - (awayStats.bullpen_era / 10.0);
    const bullpenFactor = (homeBullpenImpact + awayBullpenImpact) / 2.0;
    
    // Calculate batting impact
    const homeBattingImpact = homeStats.batting_avg * 2.5; // Higher avg = better batting = higher impact
    const awayBattingImpact = awayStats.batting_avg * 2.5;
    const battingFactor = (homeBattingImpact + awayBattingImpact) / 2.0;
    
    // Calculate recent performance (random for now)
    const recentPerformanceFactor = 0.5 + (Math.random() * 0.5);
    
    // Calculate final probability
    let probability = 0;
    probability += pitcherFactor * PREDICTION_FACTORS.pitcher_era;
    probability += bullpenFactor * PREDICTION_FACTORS.bullpen_era;
    probability += (1.0 - battingFactor) * PREDICTION_FACTORS.team_batting_avg; // Invert for under
    probability += (1.0 - ballparkFactor) * PREDICTION_FACTORS.ballpark_factor; // Invert for under
    probability += (1.0 - weatherImpact) * PREDICTION_FACTORS.weather; // Invert for under
    probability += recentPerformanceFactor * PREDICTION_FACTORS.recent_performance;
    
    // Scale to percentage
    probability = Math.round(probability * 100);
    
    // Ensure within bounds
    probability = Math.max(30, Math.min(90, probability));
    
    return {
      probability,
      factors: {
        pitcher_era: parseFloat((pitcherFactor * PREDICTION_FACTORS.pitcher_era * 100).toFixed(2)),
        bullpen_era: parseFloat((bullpenFactor * PREDICTION_FACTORS.bullpen_era * 100).toFixed(2)),
        team_batting: parseFloat(((1.0 - battingFactor) * PREDICTION_FACTORS.team_batting_avg * 100).toFixed(2)),
        ballpark: parseFloat(((1.0 - ballparkFactor) * PREDICTION_FACTORS.ballpark_factor * 100).toFixed(2)),
        weather: parseFloat(((1.0 - weatherImpact) * PREDICTION_FACTORS.weather * 100).toFixed(2)),
        recent_performance: parseFloat((recentPerformanceFactor * PREDICTION_FACTORS.recent_performance * 100).toFixed(2))
      },
      details: {
        home_pitcher_era: game.home_era,
        away_pitcher_era: game.away_era,
        home_bullpen_era: homeStats.bullpen_era,
        away_bullpen_era: awayStats.bullpen_era,
        home_batting_avg: homeStats.batting_avg,
        away_batting_avg: awayStats.batting_avg,
        ballpark_factor: ballparkFactor,
        weather_impact: weatherImpact
      }
    };
  } catch (error) {
    console.error(`Error calculating under 1 run prediction: ${error}`);
    return {
      probability: 50,
      factors: {
        pitcher_era: 15,
        bullpen_era: 10,
        team_batting: 8,
        ballpark: 5,
        weather: 2,
        recent_performance: 10
      },
      details: {
        error: `Failed to calculate prediction: ${error}`
      }
    };
  }
};

// Calculate prediction for over 2.5 runs in first 3 innings
const calculateOver2_5RunsFirst3Prediction = (game: any): any => {
  try {
    // Get team stats
    const homeStats = getTeamStats(game.home_team);
    const awayStats = getTeamStats(game.away_team);
    
    // Get ballpark factor
    const ballparkFactor = getBallparkFactor(game.venue);
    
    // Get weather impact (default for now)
    const weatherImpact = DEFAULT_WEATHER_IMPACT;
    
    // Calculate pitcher impact
    const homePitcherImpact = game.home_era / 10.0; // Higher ERA = worse pitcher = higher impact for over
    const awayPitcherImpact = game.away_era / 10.0;
    const pitcherFactor = (homePitcherImpact + awayPitcherImpact) / 2.0;
    
    // Calculate bullpen impact
    const homeBullpenImpact = homeStats.bullpen_era / 10.0;
    const awayBullpenImpact = awayStats.bullpen_era / 10.0;
    const bullpenFactor = (homeBullpenImpact + awayBullpenImpact) / 2.0;
    
    // Calculate batting impact
    const homeBattingImpact = homeStats.batting_avg * 2.5; // Higher avg = better batting = higher impact
    const awayBattingImpact = awayStats.batting_avg * 2.5;
    const battingFactor = (homeBattingImpact + awayBattingImpact) / 2.0;
    
    // Calculate recent performance (random for now)
    const recentPerformanceFactor = 0.5 + (Math.random() * 0.5);
    
    // Calculate final probability
    let probability = 0;
    probability += pitcherFactor * PREDICTION_FACTORS.pitcher_era;
    probability += bullpenFactor * PREDICTION_FACTORS.bullpen_era;
    probability += battingFactor * PREDICTION_FACTORS.team_batting_avg;
    probability += ballparkFactor * PREDICTION_FACTORS.ballpark_factor;
    probability += weatherImpact * PREDICTION_FACTORS.weather;
    probability += recentPerformanceFactor * PREDICTION_FACTORS.recent_performance;
    
    // Scale to percentage
    probability = Math.round(probability * 100);
    
    // Ensure within bounds
    probability = Math.max(30, Math.min(90, probability));
    
    return {
      probability,
      factors: {
        pitcher_era: parseFloat((pitcherFactor * PREDICTION_FACTORS.pitcher_era * 100).toFixed(2)),
        bullpen_era: parseFloat((bullpenFactor * PREDICTION_FACTORS.bullpen_era * 100).toFixed(2)),
        team_batting: parseFloat((battingFactor * PREDICTION_FACTORS.team_batting_avg * 100).toFixed(2)),
        ballpark: parseFloat((ballparkFactor * PREDICTION_FACTORS.ballpark_factor * 100).toFixed(2)),
        weather: parseFloat((weatherImpact * PREDICTION_FACTORS.weather * 100).toFixed(2)),
        recent_performance: parseFloat((recentPerformanceFactor * PREDICTION_FACTORS.recent_performance * 100).toFixed(2))
      },
      details: {
        home_pitcher_era: game.home_era,
        away_pitcher_era: game.away_era,
        home_bullpen_era: homeStats.bullpen_era,
        away_bullpen_era: awayStats.bullpen_era,
        home_batting_avg: homeStats.batting_avg,
        away_batting_avg: awayStats.batting_avg,
        ballpark_factor: ballparkFactor,
        weather_impact: weatherImpact
      }
    };
  } catch (error) {
    console.error(`Error calculating over 2.5 runs prediction: ${error}`);
    return {
      probability: 50,
      factors: {
        pitcher_era: 15,
        bullpen_era: 10,
        team_batting: 8,
        ballpark: 5,
        weather: 2,
        recent_performance: 10
      },
      details: {
        error: `Failed to calculate prediction: ${error}`
      }
    };
  }
};

// Calculate prediction for over 3.5 runs in first 3 innings
const calculateOver3_5RunsFirst3Prediction = (game: any): any => {
  try {
    // Get team stats
    const homeStats = getTeamStats(game.home_team);
    const awayStats = getTeamStats(game.away_team);
    
    // Get ballpark factor
    const ballparkFactor = getBallparkFactor(game.venue);
    
    // Get weather impact (default for now)
    const weatherImpact = DEFAULT_WEATHER_IMPACT;
    
    // Calculate pitcher impact
    const homePitcherImpact = game.home_era / 9.0; // Higher ERA = worse pitcher = higher impact for over
    const awayPitcherImpact = game.away_era / 9.0;
    const pitcherFactor = (homePitcherImpact + awayPitcherImpact) / 2.0;
    
    // Calculate bullpen impact
    const homeBullpenImpact = homeStats.bullpen_era / 9.0;
    const awayBullpenImpact = awayStats.bullpen_era / 9.0;
    const bullpenFactor = (homeBullpenImpact + awayBullpenImpact) / 2.0;
    
    // Calculate batting impact
    const homeBattingImpact = homeStats.batting_avg * 2.5; // Higher avg = better batting = higher impact
    const awayBattingImpact = awayStats.batting_avg * 2.5;
    const battingFactor = (homeBattingImpact + awayBattingImpact) / 2.0;
    
    // Calculate recent performance (random for now)
    const recentPerformanceFactor = 0.5 + (Math.random() * 0.5);
    
    // Calculate final probability
    let probability = 0;
    probability += pitcherFactor * PREDICTION_FACTORS.pitcher_era;
    probability += bullpenFactor * PREDICTION_FACTORS.bullpen_era;
    probability += battingFactor * PREDICTION_FACTORS.team_batting_avg;
    probability += ballparkFactor * PREDICTION_FACTORS.ballpark_factor;
    probability += weatherImpact * PREDICTION_FACTORS.weather;
    probability += recentPerformanceFactor * PREDICTION_FACTORS.recent_performance;
    
    // Scale to percentage and adjust down for higher run threshold
    probability = Math.round(probability * 90); // Adjust down by 10% for higher threshold
    
    // Ensure within bounds
    probability = Math.max(20, Math.min(85, probability));
    
    return {
      probability,
      factors: {
        pitcher_era: parseFloat((pitcherFactor * PREDICTION_FACTORS.pitcher_era * 100).toFixed(2)),
        bullpen_era: parseFloat((bullpenFactor * PREDICTION_FACTORS.bullpen_era * 100).toFixed(2)),
        team_batting: parseFloat((battingFactor * PREDICTION_FACTORS.team_batting_avg * 100).toFixed(2)),
        ballpark: parseFloat((ballparkFactor * PREDICTION_FACTORS.ballpark_factor * 100).toFixed(2)),
        weather: parseFloat((weatherImpact * PREDICTION_FACTORS.weather * 100).toFixed(2)),
        recent_performance: parseFloat((recentPerformanceFactor * PREDICTION_FACTORS.recent_performance * 100).toFixed(2))
      },
      details: {
        home_pitcher_era: game.home_era,
        away_pitcher_era: game.away_era,
        home_bullpen_era: homeStats.bullpen_era,
        away_bullpen_era: awayStats.bullpen_era,
        home_batting_avg: homeStats.batting_avg,
        away_batting_avg: awayStats.batting_avg,
        ballpark_factor: ballparkFactor,
        weather_impact: weatherImpact
      }
    };
  } catch (error) {
    console.error(`Error calculating over 3.5 runs prediction: ${error}`);
    return {
      probability: 40,
      factors: {
        pitcher_era: 15,
        bullpen_era: 10,
        team_batting: 8,
        ballpark: 5,
        weather: 2,
        recent_performance: 10
      },
      details: {
        error: `Failed to calculate prediction: ${error}`
      }
    };
  }
};

// Get all predictions for a specific date
export const getAllPredictionsForDate = cache(async (date: Date) => {
  try {
    // Get games for the date
    const games = await getGamesForDate(date);
    
    // Calculate predictions for each game
    const predictions: Record<string, any> = {};
    
    for (const game of games) {
      const gameKey = `${game.away_team}_${game.home_team}`;
      
      // Calculate different prediction types
      const under1RunPrediction = calculateUnder1RunPrediction(game);
      const over2_5RunsFirst3Prediction = calculateOver2_5RunsFirst3Prediction(game);
      const over3_5RunsFirst3Prediction = calculateOver3_5RunsFirst3Prediction(game);
      
      predictions[gameKey] = {
        under_1_run_1st: under1RunPrediction,
        over_2_5_runs_first_3: over2_5RunsFirst3Prediction,
        over_3_5_runs_first_3: over3_5RunsFirst3Prediction
      };
    }
    
    return {
      games,
      predictions,
      date: date.toISOString(),
      last_updated: new Date().toISOString()
    }
(Content truncated due to size limit. Use line ranges to read in chunks)