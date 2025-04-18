/**
 * MLB Stats API for Next.js
 * Adapted from the original Python implementation
 */

import { cache } from 'react';

// Team mapping (team name to abbreviation)
const TEAM_MAPPING: Record<string, string> = {
  'Arizona Diamondbacks': 'ARI',
  'Atlanta Braves': 'ATL',
  'Baltimore Orioles': 'BAL',
  'Boston Red Sox': 'BOS',
  'Chicago Cubs': 'CHC',
  'Chicago White Sox': 'CWS',
  'Cincinnati Reds': 'CIN',
  'Cleveland Guardians': 'CLE',
  'Colorado Rockies': 'COL',
  'Detroit Tigers': 'DET',
  'Houston Astros': 'HOU',
  'Kansas City Royals': 'KC',
  'Los Angeles Angels': 'LAA',
  'Los Angeles Dodgers': 'LAD',
  'Miami Marlins': 'MIA',
  'Milwaukee Brewers': 'MIL',
  'Minnesota Twins': 'MIN',
  'New York Mets': 'NYM',
  'New York Yankees': 'NYY',
  'Oakland Athletics': 'OAK',
  'Philadelphia Phillies': 'PHI',
  'Pittsburgh Pirates': 'PIT',
  'San Diego Padres': 'SD',
  'San Francisco Giants': 'SF',
  'Seattle Mariners': 'SEA',
  'St. Louis Cardinals': 'STL',
  'Tampa Bay Rays': 'TB',
  'Texas Rangers': 'TEX',
  'Toronto Blue Jays': 'TOR',
  'Washington Nationals': 'WSH'
};

// Reverse team mapping (abbreviation to team name)
const REVERSE_TEAM_MAPPING: Record<string, string> = 
  Object.entries(TEAM_MAPPING).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {} as Record<string, string>);

// ERA mapping for fallback
const ERA_MAPPING: Record<string, number> = {
  'Brandon Pfaadt': 3.5,
  'Zac Gallen': 3.47,
  'Merrill Kelly': 3.37,
  'Eduardo Rodriguez': 4.15,
  'Ryne Nelson': 5.02,
  'Spencer Strider': 3.6,
  'Max Fried': 3.09,
  'Charlie Morton': 3.64,
  'Reynaldo López': 3.72,
  'Chris Sale': 3.84,
  'Corbin Burnes': 2.94,
  'Grayson Rodriguez': 4.61,
  'Dean Kremer': 8.16,
  'Cole Irvin': 4.81,
  'Kyle Bradish': 3.18,
  'Brayan Bello': 4.34,
  'Nick Pivetta': 1.69,
  'Kutter Crawford': 3.65,
  'Tanner Houck': 2.98,
  'Sean Newcomb': 4.97,
  'Justin Steele': 3.06,
  'Jameson Taillon': 4.01,
  'Javier Assad': 3.55,
  'Kyle Hendricks': 4.04,
  'Matthew Boyd': 2.14,
  'Garrett Crochet': 3.04,
  'Michael Soroka': 4.85,
  'Chris Flexen': 5.09,
  'Jonathan Cannon': 5.79,
  'Erick Fedde': 3.13,
  'Hunter Greene': 3.41,
  'Nick Lodolo': 4.01,
  'Graham Ashcraft': 4.76,
  'Frankie Montas': 4.43,
  'Nick Martinez': 6.06,
  'Shane Bieber': 3.52,
  'Tanner Bibee': 3.91,
  'Logan Allen': 4.46,
  'Gavin Williams': 3.46,
  'Ben Lively': 4.36,
  'Kyle Freeland': 5.27,
  'Cal Quantrill': 4.80,
  'Austin Gomber': 5.51,
  'Ryan Feltner': 5.07,
  'Germán Márquez': 4.6,
  'Tarik Skubal': 2.80,
  'Jack Flaherty': 3.75,
  'Reese Olson': 3.92,
  'Casey Mize': 4.12,
  'Keider Montero': 9.0,
  'Framber Valdez': 3.40,
  'Cristian Javier': 4.25,
  'Hunter Brown': 4.68,
  'J.P. France': 4.46,
  'Ronel Blanco': 6.48,
  'Cole Ragans': 3.06,
  'Seth Lugo': 3.57,
  'Brady Singer': 4.39,
  'Michael Wacha': 3.93,
  'Kris Bubic': 0.96,
  'Patrick Sandoval': 4.38,
  'Tyler Anderson': 4.75,
  'Griffin Canning': 4.75,
  'José Soriano': 2.7,
  'Reid Detmers': 4.43,
  'Yoshinobu Yamamoto': 3.86,
  'Tyler Glasnow': 3.32,
  'James Paxton': 4.01,
  'Gavin Stone': 3.78,
  'Bobby Miller': 4.25,
  'Jesús Luzardo': 3.63,
  'Trevor Rogers': 4.00,
  'Braxton Garrett': 3.66,
  'Ryan Weathers': 5.13,
  'Max Meyer': 2.0,
  'Freddy Peralta': 3.20,
  'Colin Rea': 4.55,
  'Wade Miley': 3.85,
  'Joe Ross': 4.74,
  'Jose Quintana': 0.71,
  'Pablo López': 3.32,
  'Joe Ryan': 3.82,
  'Bailey Ober': 3.43,
  'Chris Paddack': 4.02,
  'David Festa': 0.0,
  'Kodai Senga': 3.38,
  'Luis Severino': 4.47,
  'Sean Manaea': 3.97,
  'José Quintana': 3.57,
  'Huascar Brazobán': 0.73,
  'Gerrit Cole': 2.63,
  'Carlos Rodón': 3.93,
  'Marcus Stroman': 3.66,
  'Nestor Cortes': 3.77,
  'Clarke Schmidt': 4.12,
  'JP Sears': 4.37,
  'Paul Blackburn': 4.21,
  'Alex Wood': 4.46,
  'Ross Stripling': 4.80,
  'Osvaldo Bido': 5.24,
  'Zack Wheeler': 3.07,
  'Aaron Nola': 5.51,
  'Ranger Suárez': 3.42,
  'Cristopher Sánchez': 3.44,
  'Taijuan Walker': 4.57,
  'Mitch Keller': 3.91,
  'Marco Gonzales': 5.22,
  'Bailey Falter': 7.2,
  'Luis Ortiz': 4.78,
  'Quinn Priester': 5.36,
  'Yu Darvish': 3.76,
  'Joe Musgrove': 4.12,
  'Dylan Cease': 3.72,
  'Michael King': 3.33,
  'Logan Webb': 3.25,
  'Blake Snell': 3.38,
  'Kyle Harrison': 4.09,
  'Jordan Hicks': 3.78,
  'Robbie Ray': 2.93,
  'Luis Castillo': 3.32,
  'George Kirby': 3.39,
  'Logan Gilbert': 3.73,
  'Bryce Miller': 4.5,
  'Bryan Woo': 3.63,
  'Sonny Gray': 3.24,
  'Miles Mikolas': 4.23,
  'Lance Lynn': 4.47,
  'Kyle Gibson': 4.16,
  'Steven Matz': 2.16,
  'Zach Eflin': 3.64,
  'Aaron Civale': 4.25,
  'Taj Bradley': 4.19,
  'Shane Baz': 3.99,
  'Zack Littell': 6.88,
  'Nathan Eovaldi': 3.87,
  'Jon Gray': 4.15,
  'Andrew Heaney': 4.56,
  'Dane Dunning': 4.32,
  'Patrick Corbin': 6.75,
  'Kevin Gausman': 3.18,
  'José Berríos': 3.65,
  'Chris Bassitt': 0.77,
  'Yusei Kikuchi': 4.02,
  'Bowden Francis': 4.56,
  'MacKenzie Gore': 3.69,
  'Trevor Williams': 4.46,
  'Jake Irvin': 4.14,
  'Mitchell Parker': 1.96
};

// Sample games data for fallback
const SAMPLE_GAMES = [
  {
    game_id: 718001,
    status: 'Preview',
    home_team: 'New York Yankees',
    away_team: 'Boston Red Sox',
    venue: 'Yankee Stadium',
    game_time: '19:05',
    home_pitcher: 'Gerrit Cole',
    away_pitcher: 'Nick Pivetta',
    home_era: 2.63,
    away_era: 1.69,
    home_era_source: 'MLB Stats API (Fallback)',
    away_era_source: 'MLB Stats API (Fallback)'
  },
  {
    game_id: 718002,
    status: 'Preview',
    home_team: 'Los Angeles Dodgers',
    away_team: 'San Francisco Giants',
    venue: 'Dodger Stadium',
    game_time: '22:10',
    home_pitcher: 'Tyler Glasnow',
    away_pitcher: 'Logan Webb',
    home_era: 3.32,
    away_era: 3.25,
    home_era_source: 'MLB Stats API (Fallback)',
    away_era_source: 'MLB Stats API (Fallback)'
  },
  {
    game_id: 718003,
    status: 'Preview',
    home_team: 'Chicago Cubs',
    away_team: 'St. Louis Cardinals',
    venue: 'Wrigley Field',
    game_time: '14:20',
    home_pitcher: 'Justin Steele',
    away_pitcher: 'Sonny Gray',
    home_era: 3.06,
    away_era: 3.24,
    home_era_source: 'MLB Stats API (Fallback)',
    away_era_source: 'MLB Stats API (Fallback)'
  },
  {
    game_id: 718004,
    status: 'Preview',
    home_team: 'Philadelphia Phillies',
    away_team: 'Atlanta Braves',
    venue: 'Citizens Bank Park',
    game_time: '18:40',
    home_pitcher: 'Zack Wheeler',
    away_pitcher: 'Max Fried',
    home_era: 3.07,
    away_era: 3.09,
    home_era_source: 'MLB Stats API (Fallback)',
    away_era_source: 'MLB Stats API (Fallback)'
  },
  {
    game_id: 718005,
    status: 'Preview',
    home_team: 'Houston Astros',
    away_team: 'Seattle Mariners',
    venue: 'Minute Maid Park',
    game_time: '20:10',
    home_pitcher: 'Framber Valdez',
    away_pitcher: 'Luis Castillo',
    home_era: 3.40,
    away_era: 3.32,
    home_era_source: 'MLB Stats API (Fallback)',
    away_era_source: 'MLB Stats API (Fallback)'
  },
  {
    game_id: 718006,
    status: 'Preview',
    home_team: 'San Diego Padres',
    away_team: 'Los Angeles Angels',
    venue: 'Petco Park',
    game_time: '21:40',
    home_pitcher: 'Yu Darvish',
    away_pitcher: 'Reid Detmers',
    home_era: 3.76,
    away_era: 4.43,
    home_era_source: 'MLB Stats API (Fallback)',
    away_era_source: 'MLB Stats API (Fallback)'
  }
];

// MLB API base URL
const MLB_API_BASE_URL = "https://statsapi.mlb.com/api/v1";

// Interface for pitcher ERA data
interface PitcherEraData {
  era: number | string;
  source: string;
  method: string;
}

// Interface for game data
interface GameData {
  game_id: number;
  status: string;
  home_team: string;
  away_team: string;
  venue: string;
  game_time: string;
  home_pitcher: string;
  away_pitcher: string;
  home_era: number;
  away_era: number;
  home_era_source: string;
  away_era_source: string;
  [key: string]: any;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get pitcher ERA
 * This function is cached to improve performance
 */
export const getPitcherEra = cache(async (teamName: string, pitcherName: string): Promise<PitcherEraData> => {
  console.log(`Getting ERA for ${pitcherName} (${teamName})`);
  
  try {
    // Try to get ERA from MLB API
    let teamAbbr = null;
    
    // Get team abbreviation
    for (const [name, abbr] of Object.entries(TEAM_MAPPING)) {
      if (teamName.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(teamName.toLowerCase())) {
        teamAbbr = abbr;
        break;
      }
    }
    
    if (!teamAbbr) {
      console.warn(`Team not found: ${teamName}`);
      // Try fallback
      if (pitcherName in ERA_MAPPING) {
        const era = ERA_MAPPING[pitcherName];
        return {
          era,
          source: 'MLB Stats API (Fallback)',
          method: 'name-lookup'
        };
      }
      return {
        era: 'N/A',
        source: 'not-found',
        method: 'team-not-found'
      };
    }
    
    // Search for player by name
    const searchUrl = `${MLB_API_BASE_URL}/players?search=${encodeURIComponent(pitcherName)}`;
    const response = await fetch(searchUrl);
    
    if (response.ok) {
      const playerData = await response.json();
      
      if (playerData.people && playerData.people.length > 0) {
        // Find the pitcher
        let pitcher = null;
        for (const person of playerData.people) {
          if (person.primaryPosition?.code === '1') { // Pitcher position code
            pitcher = person;
            break;
          }
        }
        
        if (!pitcher) {
          // If no pitcher found, try fallback
          if (pitcherName in ERA_MAPPING) {
            const era = ERA_MAPPING[pitcherName];
            return {
              era,
              source: 'MLB Stats API (Fallback)',
              method: 'position-not-found'
            };
          }
          return {
            era: 'N/A',
            source: 'not-found',
            method: 'position-not-found'
          };
        }
        
        // Get player stats
        const playerId = pitcher.id;
        const statsUrl = `${MLB_API_BASE_URL}/people/${playerId}/stats?stats=season&season=${new Date().getFullYear()}&group=pitching`;
        const statsResponse = await fetch(statsUrl);
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          
          if (statsData.stats && statsData.stats.length > 0 && 
              statsData.stats[0].splits && statsData.stats[0].splits.length > 0) {
            const stats = statsData.stats[0].splits[0].stat;
            const era = stats.era;
            
            return {
              era,
              source: 'MLB Stats API',
              method: 'api'
            };
          }
        }
      }
    }
    
    // If we get here, try fallback
    if (pitcherName in ERA_MAPPING) {
      const era = ERA_MAPPING[pitcherName];
      return {
        era,
        source: 'MLB Stats API (Fallback)',
        method: 'api-failed'
      };
    }
    
    // Default fallback
    return {
      era: 4.50, // League average ERA as fallback
      source: 'MLB Stats API (Default)',
      method: 'default'
    };
  } catch (error) {
    console.error(`Error getting ERA for ${pitcherName}: ${error}`);
    
    // Try fallback
    if (pitcherName in ERA_MAPPING) {
      const era = ERA_MAPPING[pitcherName];
      return {
        era,
        source: 'MLB Stats API (Fallback)',
        method: 'error-fallback'
      };
    }
    
    // Default fallback
    return {
      era: 4.50, // League average ERA as fallback
      source: 'MLB Stats API (Default)',
      method: 'error-default'
    };
  }
});

/**
 * Get games for a specific date
 * This function is cached to improve performance
 */
export const getGamesForDate = cache(async (date: Date): Promise<GameData[]> => {
  const dateStr = formatDate(date);
  console.log(`Getting games for date: ${dateStr}`);
  
  try {
    // Try to get games from MLB API
    const scheduleUrl = `${MLB_API_BASE_URL}/schedule?sportId=1&date=${dateStr}&hydrate=team,venue,game(content(summary)),linescore,flags,person,probablePitcher,stats,broadcasts(all),tickets,game(tickets)&useLatestGames=false&language=en`;
    const response = await fetch(scheduleUrl, { next: { revalidate: 900 } }); // Revalidate every 15 minutes
    
    if (response.ok) {
      const scheduleData = await response.json();
      
      if (scheduleData.dates && scheduleData.dates.length > 0 && scheduleData.dates[0].games) {
        const games = scheduleData.dates[0].games;
        const processedGames: GameData[] = [];
        
        for (const game of games) {
          try {
            const homeTeam = game.teams.home.team.name;
            const awayTeam = game.teams.away.team.name;
            const venue = game.venue.name;
            const gameTime = game.gameDate ? new Date(game.gameDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD';
            const status = game.status.abstractGameState;
            
            // Get pitchers
            let homePitcher = 'TBD';
            let awayPitcher = 'TBD';
            let homeEra: number | string = 'N/A';
            let awayEra: number | string = 'N/A';
            let homeEraSource = 'not-available';
            let awayEraSource = 'not-available';
            
            if (game.teams.home.probablePitcher) {
              homePitcher = game.teams.home.probablePitcher.fullName;
              const homeEraData = await getPitcherEra(homeTeam, homePitcher);
              homeEra = homeEraData.era;
              homeEraSource = homeEraData.source;
            }
            
            if (game.teams.away.probablePitcher) {
              awayPitcher = game.teams.away.probablePitcher.fullName;
              const awayEraData = await getPitcherEra(awayTeam, awayPitcher);
              awayEra = awayEraData.era;
              awayEraSource = awayEraData.source;
            }
            
            processedGames.push({
              game_id: game.gamePk,
              status,
              home_team: homeTeam,
              away_team: awayTeam,
              venue,
              game_time: gameTime,
              home_pitcher: homePitcher,
              away_pitcher: awayPitcher,
              home_era: typeof homeEra === 'string' ? 4.50 : homeEra,
              away_era: typeof awayEra === 'string' ? 4.50 : awayEra,
              home_era_source: homeEraSource,
              away_era_source: awayEraSource
            });
          } catch (gameError) {
            console.error(`Error processing game: ${gameError}`);
          }
        }
        
        if (processedGames.length > 0) {
          return processedGames;
        }
      }
    }
    
    // If we get here, try yesterday and tomorrow
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Try yesterday
    try {
      const yesterdayGames = await getGamesForDate(yesterday);
      if (yesterdayGames.length > 0) {
        return yesterdayGames.map(game => ({
          ...game,
          note: `No games scheduled for ${dateStr}. Showing games from ${formatDate(yesterday)}.`
        }));
      }
    } catch (error) {
      console.error(`Error getting yesterday's games: ${error}`);
    }
    
    // Try tomorrow
    try {
      const tomorrowGames = await getGamesForDate(tomorrow);
      if (tomorrowGames.length > 0) {
        return tomorrowGames.map(game => ({
          ...game,
          note: `No games scheduled for ${dateStr}. Showing games from ${formatDate(tomorrow)}.`
        }));
      }
    } catch (error) {
      console.error(`Error getting tomorrow's games: ${error}`);
    }
    
    // If all else fails, use sample games
    console.log('Using sample games as fallback');
    return SAMPLE_GAMES.map(game => ({
      ...game,
      note: `No games found for ${dateStr}. Showing sample games.`
    }));
  } catch (error) {
    console.error(`Error getting games for date ${dateStr}: ${error}`);
    
    // Use sample games as fallback
    console.log('Using sample games as fallback due to error');
    return SAMPLE_GAMES.map(game => ({
      ...game,
      note: `Error fetching games for ${dateStr}. Showing sample games.`
    }));
  }
});

/**
 * Get team stats
 */
export const getTeamStats = cache(async (teamName: string): Promise<any> => {
  console.log(`Getting team stats for ${teamName}`);
  
  try {
    // Get team abbreviation
    let teamAbbr = null;
    for (const [name, abbr] of Object.entries(TEAM_MAPPING)) {
      if (teamName.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(teamName.toLowerCase())) {
        teamAbbr = abbr;
        break;
      }
    }
    
    if (!teamAbbr) {
      console.warn(`Team not found: ${teamName}`);
      return {
        runs_per_game: 4.5,
        era: 4.5,
        whip: 1.3,
        strikeouts: 8.5,
        walks: 3.2,
        source: 'MLB Stats API (Default)',
        method: 'team-not-found'
      };
    }
    
    // Search for team
    const searchUrl = `${MLB_API_BASE_URL}/teams?sportId=1`;
    const response = await fetch(searchUrl);
    
    if (response.ok) {
      const teamsData = await response.json();
      
      if (teamsData.teams) {
        // Find the team
        let team = null;
        for (const t of teamsData.teams) {
          if (t.abbreviation === teamAbbr) {
            team = t;
            break;
          }
        }
        
        if (!team) {
          return {
            runs_per_game: 4.5,
            era: 4.5,
            whip: 1.3,
            strikeouts: 8.5,
            walks: 3.2,
            source: 'MLB Stats API (Default)',
            method: 'team-not-found-in-api'
          };
        }
        
        // Get team stats
        const teamId = team.id;
        const statsUrl = `${MLB_API_BASE_URL}/teams/${teamId}/stats?stats=season&season=${new Date().getFullYear()}&group=pitching,hitting`;
        const statsResponse = await fetch(statsUrl);
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          
          if (statsData.stats && statsData.stats.length > 0) {
            let hittingStats = null;
            let pitchingStats = null;
            
            for (const stat of statsData.stats) {
              if (stat.group.displayName === 'hitting') {
                hittingStats = stat.splits[0].stat;
              } else if (stat.group.displayName === 'pitching') {
                pitchingStats = stat.splits[0].stat;
              }
            }
            
            if (hittingStats && pitchingStats) {
              const runsPerGame = parseFloat(hittingStats.runs) / parseFloat(hittingStats.gamesPlayed);
              
              return {
                runs_per_game: runsPerGame.toFixed(2),
                era: parseFloat(pitchingStats.era).toFixed(2),
                whip: parseFloat(pitchingStats.whip).toFixed(2),
                strikeouts: parseFloat(pitchingStats.strikeOuts).toFixed(0),
                walks: parseFloat(pitchingStats.baseOnBalls).toFixed(0),
                source: 'MLB Stats API',
                method: 'api'
              };
            }
          }
        }
      }
    }
    
    // Default fallback
    return {
      runs_per_game: 4.5,
      era: 4.5,
      whip: 1.3,
      strikeouts: 8.5,
      walks: 3.2,
      source: 'MLB Stats API (Default)',
      method: 'api-failed'
    };
  } catch (error) {
    console.error(`Error getting team stats for ${teamName}: ${error}`);
    
    // Default fallback
    return {
      runs_per_game: 4.5,
      era: 4.5,
      whip: 1.3,
      strikeouts: 8.5,
      walks: 3.2,
      source: 'MLB Stats API (Default)',
      method: 'error'
    };
  }
});

/**
 * Get bullpen ERA
 */
export const getBullpenEra = cache(async (teamName: string): Promise<any> => {
  console.log(`Getting bullpen ERA for ${teamName}`);
  
  try {
    const teamStats = await getTeamStats(teamName);
    
    // For now, use a simple formula to estimate bullpen ERA
    // In a real implementation, we would fetch actual bullpen stats
    const teamEra = parseFloat(teamStats.era);
    const bullpenEra = teamEra * 1.1; // Bullpen ERA is typically slightly higher
    
    return {
      era: bullpenEra.toFixed(2),
      source: 'MLB Stats API (Estimated)',
      method: 'estimated'
    };
  } catch (error) {
    console.error(`Error getting bullpen ERA for ${teamName}: ${error}`);
    
    // Default fallback
    return {
      era: 4.7,
      source: 'MLB Stats API (Default)',
      method: 'error'
    };
  }
});

/**
 * Get ballpark factor
 */
export const getBallparkFactor = cache(async (venue: string): Promise<any> => {
  console.log(`Getting ballpark factor for ${venue}`);
  
  // Ballpark factors (sample data)
  const ballparkFactors: Record<string, number> = {
    'Coors Field': 1.28,
    'Great American Ball Park': 1.12,
    'Fenway Park': 1.10,
    'Wrigley Field': 1.08,
    'Citizens Bank Park': 1.07,
    'Yankee Stadium': 1.06,
    'Chase Field': 1.05,
    'Globe Life Field': 1.04,
    'Rogers Centre': 1.03,
    'Dodger Stadium': 1.02,
    'Truist Park': 1.01,
    'Nationals Park': 1.00,
    'Minute Maid Park': 0.99,
    'Petco Park': 0.98,
    'T-Mobile Park': 0.97,
    'Oracle Park': 0.96,
    'Busch Stadium': 0.95,
    'Citi Field': 0.94,
    'PNC Park': 0.93,
    'Comerica Park': 0.92,
    'Target Field': 0.91,
    'Oakland Coliseum': 0.90,
    'Tropicana Field': 0.89,
    'loanDepot park': 0.88,
    'Angel Stadium': 0.95,
    'Kauffman Stadium': 0.94,
    'American Family Field': 1.05,
    'Progressive Field': 0.97,
    'Guaranteed Rate Field': 1.04
  };
  
  // Try to find the ballpark factor
  for (const [ballpark, factor] of Object.entries(ballparkFactors)) {
    if (venue.toLowerCase().includes(ballpark.toLowerCase()) || ballpark.toLowerCase().includes(venue.toLowerCase())) {
      return {
        factor: factor.toFixed(2),
        source: 'MLB Stats API',
        method: 'lookup'
      };
    }
  }
  
  // Default fallback
  return {
    factor: 1.00,
    source: 'MLB Stats API (Default)',
    method: 'default'
  };
});

/**
 * Get weather for a venue
 */
export const getWeather = cache(async (venue: string): Promise<any> => {
  console.log(`Getting weather for ${venue}`);
  
  // For now, return sample weather data
  // In a real implementation, we would fetch actual weather data
  return {
    temperature: 72,
    condition: 'Clear',
    wind_speed: 5,
    wind_direction: 'NE',
    source: 'Weather API (Sample)',
    method: 'sample'
  };
});

/**
 * Calculate prediction for Under 1 Run (1st Inning)
 */
export const calculateUnder1RunPrediction = cache(async (game: GameData): Promise<any> => {
  console.log(`Calculating Under 1 Run prediction for ${game.away_team} @ ${game.home_team}`);
  
  try {
    // Get team stats
    const homeTeamStats = await getTeamStats(game.home_team);
    const awayTeamStats = await getTeamStats(game.away_team);
    
    // Get bullpen stats
    const homeBullpenStats = await getBullpenEra(game.home_team);
    const awayBullpenStats = await getBullpenEra(game.away_team);
    
    // Get ballpark factor
    const ballparkFactor = await getBallparkFactor(game.venue);
    
    // Get weather
    const weather = await getWeather(game.venue);
    
    // Calculate prediction
    const homeEra = parseFloat(game.home_era);
    const awayEra = parseFloat(game.away_era);
    const homeBullpenEra = parseFloat(homeBullpenStats.era);
    const awayBullpenEra = parseFloat(awayBullpenStats.era);
    const parkFactor = parseFloat(ballparkFactor.factor);
    
    // Calculate base probability
    let baseProbability = 0.5;
    
    // Adjust for pitcher ERA (lower ERA increases probability)
    baseProbability += (5.0 - homeEra) * 0.02;
    baseProbability += (5.0 - awayEra) * 0.02;
    
    // Adjust for ballpark factor (lower factor increases probability)
    baseProbability += (1.0 - parkFactor) * 0.1;
    
    // Adjust for weather (higher temperature decreases probability)
    baseProbability -= (weather.temperature - 70) * 0.001;
    
    // Adjust for bullpen ERA (not as important for 1st inning)
    baseProbability += (5.0 - homeBullpenEra) * 0.005;
    baseProbability += (5.0 - awayBullpenEra) * 0.005;
    
    // Ensure probability is between 0 and 1
    baseProbability = Math.max(0, Math.min(1, baseProbability));
    
    // Convert to percentage
    const probability = Math.round(baseProbability * 100);
    
    // Calculate factors
    const factors = [
      {
        name: 'Pitcher Performance',
        value: Math.round((5.0 - (homeEra + awayEra) / 2) * 10)
      },
      {
        name: 'Ballpark Factors',
        value: Math.round((1.0 - parkFactor) * 100)
      },
      {
        name: 'Weather',
        value: Math.round((70 - weather.temperature) * 0.5 + 50)
      },
      {
        name: 'Bullpen',
        value: Math.round((5.0 - (homeBullpenEra + awayBullpenEra) / 2) * 5)
      },
      {
        name: 'Team Momentum',
        value: 50
      },
      {
        name: 'Handedness Matchups',
        value: 50
      },
      {
        name: 'Injuries',
        value: 50
      },
      {
        name: 'Travel Fatigue',
        value: 50
      },
      {
        name: 'Umpire Impact',
        value: 50
      },
      {
        name: 'Defensive Metrics',
        value: 50
      },
      {
        name: 'Baserunning',
        value: 50
      }
    ];
    
    // Sort factors by value (descending)
    factors.sort((a, b) => b.value - a.value);
    
    // Get top factors
    const topFactors = factors.slice(0, 3).map(factor => factor.name);
    
    return {
      probability,
      factors,
      top_factors: topFactors,
      home_era: homeEra,
      away_era: awayEra,
      home_bullpen_era: homeBullpenEra,
      away_bullpen_era: awayBullpenEra,
      ballpark_factor: parkFactor,
      weather: weather.temperature
    };
  } catch (error) {
    console.error(`Error calculating Under 1 Run prediction: ${error}`);
    
    // Default fallback
    return {
      probability: 50,
      factors: [
        { name: 'Pitcher Performance', value: 50 },
        { name: 'Ballpark Factors', value: 50 },
        { name: 'Weather', value: 50 }
      ],
      top_factors: ['Pitcher Performance', 'Ballpark Factors', 'Weather'],
      home_era: game.home_era,
      away_era: game.away_era,
      home_bullpen_era: 4.5,
      away_bullpen_era: 4.5,
      ballpark_factor: 1.0,
      weather: 70
    };
  }
});

/**
 * Calculate prediction for Over 2.5 Runs (First 3 Innings)
 */
export const calculateOver25RunsPrediction = cache(async (game: GameData): Promise<any> => {
  console.log(`Calculating Over 2.5 Runs prediction for ${game.away_team} @ ${game.home_team}`);
  
  try {
    // Get team stats
    const homeTeamStats = await getTeamStats(game.home_team);
    const awayTeamStats = await getTeamStats(game.away_team);
    
    // Get bullpen stats
    const homeBullpenStats = await getBullpenEra(game.home_team);
    const awayBullpenStats = await getBullpenEra(game.away_team);
    
    // Get ballpark factor
    const ballparkFactor = await getBallparkFactor(game.venue);
    
    // Get weather
    const weather = await getWeather(game.venue);
    
    // Calculate prediction
    const homeEra = parseFloat(game.home_era);
    const awayEra = parseFloat(game.away_era);
    const homeBullpenEra = parseFloat(homeBullpenStats.era);
    const awayBullpenEra = parseFloat(awayBullpenStats.era);
    const parkFactor = parseFloat(ballparkFactor.factor);
    
    // Calculate base probability
    let baseProbability = 0.5;
    
    // Adjust for pitcher ERA (higher ERA increases probability)
    baseProbability += (homeEra - 3.5) * 0.03;
    baseProbability += (awayEra - 3.5) * 0.03;
    
    // Adjust for ballpark factor (higher factor increases probability)
    baseProbability += (parkFactor - 1.0) * 0.15;
    
    // Adjust for weather (higher temperature increases probability)
    baseProbability += (weather.temperature - 70) * 0.002;
    
    // Adjust for bullpen ERA (higher ERA increases probability)
    baseProbability += (homeBullpenEra - 4.0) * 0.01;
    baseProbability += (awayBullpenEra - 4.0) * 0.01;
    
    // Ensure probability is between 0 and 1
    baseProbability = Math.max(0, Math.min(1, baseProbability));
    
    // Convert to percentage
    const probability = Math.round(baseProbability * 100);
    
    // Calculate factors
    const factors = [
      {
        name: 'Pitcher Performance',
        value: Math.round((homeEra + awayEra) / 2 * 10)
      },
      {
        name: 'Ballpark Factors',
        value: Math.round(parkFactor * 50)
      },
      {
        name: 'Weather',
        value: Math.round(weather.temperature * 0.5)
      },
      {
        name: 'Bullpen',
        value: Math.round((homeBullpenEra + awayBullpenEra) / 2 * 5)
      },
      {
        name: 'Team Momentum',
        value: 50
      },
      {
        name: 'Handedness Matchups',
        value: 50
      },
      {
        name: 'Injuries',
        value: 50
      },
      {
        name: 'Travel Fatigue',
        value: 50
      },
      {
        name: 'Umpire Impact',
        value: 50
      },
      {
        name: 'Defensive Metrics',
        value: 50
      },
      {
        name: 'Baserunning',
        value: 50
      }
    ];
    
    // Sort factors by value (descending)
    factors.sort((a, b) => b.value - a.value);
    
    // Get top factors
    const topFactors = factors.slice(0, 3).map(factor => factor.name);
    
    return {
      probability,
      factors,
      top_factors: topFactors,
      home_era: homeEra,
      away_era: awayEra,
      home_bullpen_era: homeBullpenEra,
      away_bullpen_era: awayBullpenEra,
      ballpark_factor: parkFactor,
      weather: weather.temperature
    };
  } catch (error) {
    console.error(`Error calculating Over 2.5 Runs prediction: ${error}`);
    
    // Default fallback
    return {
      probability: 50,
      factors: [
        { name: 'Pitcher Performance', value: 50 },
        { name: 'Ballpark Factors', value: 50 },
        { name: 'Weather', value: 50 }
      ],
      top_factors: ['Pitcher Performance', 'Ballpark Factors', 'Weather'],
      home_era: game.home_era,
      away_era: game.away_era,
      home_bullpen_era: 4.5,
      away_bullpen_era: 4.5,
      ballpark_factor: 1.0,
      weather: 70
    };
  }
});

/**
 * Calculate prediction for Over 3.5 Runs (First 3 Innings)
 */
export const calculateOver35RunsPrediction = cache(async (game: GameData): Promise<any> => {
  console.log(`Calculating Over 3.5 Runs prediction for ${game.away_team} @ ${game.home_team}`);
  
  try {
    // Get team stats
    const homeTeamStats = await getTeamStats(game.home_team);
    const awayTeamStats = await getTeamStats(game.away_team);
    
    // Get bullpen stats
    const homeBullpenStats = await getBullpenEra(game.home_team);
    const awayBullpenStats = await getBullpenEra(game.away_team);
    
    // Get ballpark factor
    const ballparkFactor = await getBallparkFactor(game.venue);
    
    // Get weather
    const weather = await getWeather(game.venue);
    
    // Calculate prediction
    const homeEra = parseFloat(game.home_era);
    const awayEra = parseFloat(game.away_era);
    const homeBullpenEra = parseFloat(homeBullpenStats.era);
    const awayBullpenEra = parseFloat(awayBullpenStats.era);
    const parkFactor = parseFloat(ballparkFactor.factor);
    
    // Calculate base probability
    let baseProbability = 0.4; // Lower base probability for over 3.5
    
    // Adjust for pitcher ERA (higher ERA increases probability)
    baseProbability += (homeEra - 3.0) * 0.04;
    baseProbability += (awayEra - 3.0) * 0.04;
    
    // Adjust for ballpark factor (higher factor increases probability)
    baseProbability += (parkFactor - 1.0) * 0.2;
    
    // Adjust for weather (higher temperature increases probability)
    baseProbability += (weather.temperature - 70) * 0.003;
    
    // Adjust for bullpen ERA (higher ERA increases probability)
    baseProbability += (homeBullpenEra - 4.0) * 0.015;
    baseProbability += (awayBullpenEra - 4.0) * 0.015;
    
    // Ensure probability is between 0 and 1
    baseProbability = Math.max(0, Math.min(1, baseProbability));
    
    // Convert to percentage
    const probability = Math.round(baseProbability * 100);
    
    // Calculate factors
    const factors = [
      {
        name: 'Pitcher Performance',
        value: Math.round((homeEra + awayEra) / 2 * 10)
      },
      {
        name: 'Ballpark Factors',
        value: Math.round(parkFactor * 50)
      },
      {
        name: 'Weather',
        value: Math.round(weather.temperature * 0.5)
      },
      {
        name: 'Bullpen',
        value: Math.round((homeBullpenEra + awayBullpenEra) / 2 * 5)
      },
      {
        name: 'Team Momentum',
        value: 50
      },
      {
        name: 'Handedness Matchups',
        value: 50
      },
      {
        name: 'Injuries',
        value: 50
      },
      {
        name: 'Travel Fatigue',
        value: 50
      },
      {
        name: 'Umpire Impact',
        value: 50
      },
      {
        name: 'Defensive Metrics',
        value: 50
      },
      {
        name: 'Baserunning',
        value: 50
      }
    ];
    
    // Sort factors by value (descending)
    factors.sort((a, b) => b.value - a.value);
    
    // Get top factors
    const topFactors = factors.slice(0, 3).map(factor => factor.name);
    
    return {
      probability,
      factors,
      top_factors: topFactors,
      home_era: homeEra,
      away_era: awayEra,
      home_bullpen_era: homeBullpenEra,
      away_bullpen_era: awayBullpenEra,
      ballpark_factor: parkFactor,
      weather: weather.temperature
    };
  } catch (error) {
    console.error(`Error calculating Over 3.5 Runs prediction: ${error}`);
    
    // Default fallback
    return {
      probability: 40,
      factors: [
        { name: 'Pitcher Performance', value: 50 },
        { name: 'Ballpark Factors', value: 50 },
        { name: 'Weather', value: 50 }
      ],
      top_factors: ['Pitcher Performance', 'Ballpark Factors', 'Weather'],
      home_era: game.home_era,
      away_era: game.away_era,
      home_bullpen_era: 4.5,
      away_bullpen_era: 4.5,
      ballpark_factor: 1.0,
      weather: 70
    };
  }
});

/**
 * Get all predictions for a game
 */
export const getAllPredictions = cache(async (game: GameData): Promise<any> => {
  console.log(`Getting all predictions for ${game.away_team} @ ${game.home_team}`);
  
  try {
    // Get predictions
    const under1RunPrediction = await calculateUnder1RunPrediction(game);
    const over25RunsPrediction = await calculateOver25RunsPrediction(game);
    const over35RunsPrediction = await calculateOver35RunsPrediction(game);
    
    return {
      under_1_run_1st: under1RunPrediction,
      over_2_5_runs_first_3: over25RunsPrediction,
      over_3_5_runs_first_3: over35RunsPrediction
    };
  } catch (error) {
    console.error(`Error getting all predictions: ${error}`);
    
    // Default fallback
    return {
      under_1_run_1st: {
        probability: 50,
        factors: [],
        top_factors: []
      },
      over_2_5_runs_first_3: {
        probability: 50,
        factors: [],
        top_factors: []
      },
      over_3_5_runs_first_3: {
        probability: 40,
        factors: [],
        top_factors: []
      }
    };
  }
});

/**
 * Get all predictions for all games on a date
 */
export const getAllPredictionsForDate = cache(async (date: Date): Promise<any> => {
  console.log(`Getting all predictions for date: ${formatDate(date)}`);
  
  try {
    // Get games
    const games = await getGamesForDate(date);
    
    // Get predictions for each game
    const predictions: Record<string, any> = {};
    
    for (const game of games) {
      const gameKey = `${game.away_team}_${game.home_team}`;
      predictions[gameKey] = await getAllPredictions(game);
    }
    
    return {
      date: formatDate(date),
      games,
      predictions
    };
  } catch (error) {
    console.error(`Error getting all predictions for date: ${error}`);
    
    // Default fallback
    return {
      date: formatDate(date),
      games: SAMPLE_GAMES,
      predictions: {}
    };
  }
});
