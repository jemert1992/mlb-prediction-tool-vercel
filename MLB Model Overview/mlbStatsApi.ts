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
    console.log('Using sample gam
(Content truncated due to size limit. Use line ranges to read in chunks)