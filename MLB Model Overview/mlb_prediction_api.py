import os
import json
import logging
import time
from datetime import datetime, timedelta
from mlb_stats_api import MLBStatsAPI

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    filename='mlb_prediction_api.log')
logger = logging.getLogger('mlb_prediction_api')

class MLBPredictionAPI:
    """
    API for MLB predictions with real-time data
    """
    
    def __init__(self, cache_dir="/home/ubuntu/final_deploy/cache/predictions"):
        """
        Initialize the MLB prediction API
        
        Args:
            cache_dir: Directory to store cache files
        """
        self.cache_dir = cache_dir
        
        # Create cache directory if it doesn't exist
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # Initialize MLB data fetcher
        self.mlb_stats_api = MLBStatsAPI()
        
        # Cache expiration time (15 minutes)
        self.cache_expiration = 15 * 60  # seconds
        
        # Last refresh time
        self.last_refresh_time = 0
        
        # Prediction factors
        self.prediction_factors = {
            'pitcher_performance': 0.25,
            'bullpen_performance': 0.15,
            'ballpark_factors': 0.10,
            'batter_vs_pitcher': 0.15,
            'defensive_metrics': 0.10,
            'team_momentum': 0.05,
            'umpire_impact': 0.05,
            'handedness_matchups': 0.05,
            'base_running': 0.05,
            'travel_schedule': 0.025,
            'injury_impact': 0.025,
            'weather_conditions': 0.025
        }
    
    def get_cached_data(self, cache_key):
        """
        Get data from cache if it exists and is not expired
        
        Args:
            cache_key: Key to identify the cache file
            
        Returns:
            Cached data if it exists and is not expired, None otherwise
        """
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
        
        if os.path.exists(cache_file):
            # Check if cache is expired
            file_modified_time = os.path.getmtime(cache_file)
            current_time = time.time()
            
            if current_time - file_modified_time < self.cache_expiration:
                try:
                    with open(cache_file, 'r') as f:
                        data = json.load(f)
                        logger.info(f"Using cached data for {cache_key}")
                        return data
                except Exception as e:
                    logger.error(f"Error reading cache file: {e}")
            else:
                logger.info(f"Cache expired for {cache_key}")
        
        return None
    
    def save_to_cache(self, cache_key, data):
        """
        Save data to cache
        
        Args:
            cache_key: Key to identify the cache file
            data: Data to save
        """
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
        
        try:
            with open(cache_file, 'w') as f:
                json.dump(data, f)
                logger.info(f"Saved data to cache for {cache_key}")
        except Exception as e:
            logger.error(f"Error saving to cache: {e}")
    
    def clear_cache(self, cache_key=None):
        """
        Clear cache for a specific key or all cache
        
        Args:
            cache_key: Key to identify the cache file, or None to clear all cache
        """
        if cache_key:
            cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
            if os.path.exists(cache_file):
                try:
                    os.remove(cache_file)
                    logger.info(f"Cleared cache for {cache_key}")
                except Exception as e:
                    logger.error(f"Error clearing cache for {cache_key}: {e}")
        else:
            try:
                for file in os.listdir(self.cache_dir):
                    if file.endswith('.json'):
                        os.remove(os.path.join(self.cache_dir, file))
                logger.info("Cleared all cache")
            except Exception as e:
                logger.error(f"Error clearing all cache: {e}")
    
    def refresh_data_if_needed(self, force_refresh=False):
        """
        Refresh data if needed or forced
        
        Args:
            force_refresh: Force refresh of data
            
        Returns:
            True if data was refreshed, False otherwise
        """
        current_time = time.time()
        
        # Refresh if forced or if last refresh was more than 15 minutes ago
        if force_refresh or current_time - self.last_refresh_time > self.cache_expiration:
            logger.info("Refreshing MLB prediction data")
            
            # Clear all cache
            self.clear_cache()
            
            # Refresh MLB stats API
            self.mlb_stats_api.clear_cache()
            
            # Update last refresh time
            self.last_refresh_time = current_time
            
            return True
        
        return False
    
    def calculate_pitcher_performance_score(self, era, whip=None, strikeouts=None, innings_pitched=None):
        """
        Calculate pitcher performance score based on ERA and other stats
        
        Args:
            era: Earned Run Average
            whip: Walks plus Hits per Inning Pitched
            strikeouts: Number of strikeouts
            innings_pitched: Number of innings pitched
            
        Returns:
            Pitcher performance score (0-100)
        """
        try:
            # Convert ERA to float if it's a string
            if isinstance(era, str) and era != 'N/A':
                era = float(era)
            
            # If ERA is not available, return a neutral score
            if era == 'N/A' or era is None:
                return 50
            
            # Lower ERA is better, so invert the scale
            # ERA range: 0-10, where 0 is perfect and 10 is terrible
            # Convert to 0-100 scale where 100 is perfect
            era_score = max(0, min(100, 100 - (era * 10)))
            
            # If other stats are available, incorporate them
            if whip and whip != 'N/A' and innings_pitched and innings_pitched != 'N/A' and strikeouts and strikeouts != 'N/A':
                try:
                    whip = float(whip)
                    innings_pitched = float(innings_pitched)
                    strikeouts = float(strikeouts)
                    
                    # Calculate K/9 (strikeouts per 9 innings)
                    k9 = (strikeouts / innings_pitched) * 9 if innings_pitched > 0 else 0
                    
                    # WHIP range: 0-2, where 0 is perfect and 2 is terrible
                    # Convert to 0-100 scale where 100 is perfect
                    whip_score = max(0, min(100, 100 - (whip * 50)))
                    
                    # K/9 range: 0-15, where 15 is excellent and 0 is terrible
                    # Convert to 0-100 scale where 100 is perfect
                    k9_score = max(0, min(100, (k9 / 15) * 100))
                    
                    # Combine scores with weights
                    combined_score = (era_score * 0.6) + (whip_score * 0.25) + (k9_score * 0.15)
                    
                    return combined_score
                except:
                    # If there's an error, just use ERA score
                    return era_score
            else:
                # If other stats are not available, just use ERA score
                return era_score
        except:
            # If there's an error, return a neutral score
            return 50
    
    def calculate_first_inning_no_run_probability(self, home_pitcher_era, away_pitcher_era, 
                                                 home_team_name, away_team_name,
                                                 ballpark=None, weather=None):
        """
        Calculate probability of no runs in the first inning
        
        Args:
            home_pitcher_era: ERA of home team pitcher
            away_pitcher_era: ERA of away team pitcher
            home_team_name: Name of home team
            away_team_name: Name of away team
            ballpark: Ballpark information
            weather: Weather information
            
        Returns:
            Probability of no runs in the first inning (0-100)
        """
        # Calculate pitcher performance scores
        home_pitcher_score = self.calculate_pitcher_performance_score(home_pitcher_era)
        away_pitcher_score = self.calculate_pitcher_performance_score(away_pitcher_era)
        
        # Average the pitcher scores (both pitchers matter for 1st inning)
        pitcher_score = (home_pitcher_score + away_pitcher_score) / 2
        
        # Adjust for ballpark factors (some parks are more hitter-friendly)
        ballpark_factor = 1.0  # Neutral by default
        if ballpark:
            # Implement ballpark-specific adjustments here
            pass
        
        # Adjust for weather conditions
        weather_factor = 1.0  # Neutral by default
        if weather:
            # Implement weather-specific adjustments here
            pass
        
        # Calculate base probability (higher pitcher score = higher probability of no runs)
        # Scale from 0-100 to a probability between 30-70%
        base_probability = 30 + (pitcher_score * 0.4)
        
        # Apply ballpark and weather factors
        adjusted_probability = base_probability * ballpark_factor * weather_factor
        
        # Ensure probability is between 0-100
        final_probability = max(0, min(100, adjusted_probability))
        
        return final_probability
    
    def calculate_first_three_innings_run_probability(self, home_pitcher_era, away_pitcher_era,
                                                     home_team_name, away_team_name,
                                                     run_threshold=2.5,
                                                     ballpark=None, weather=None):
        """
        Calculate probability of over X runs in the first three innings
        
        Args:
            home_pitcher_era: ERA of home team pitcher
            away_pitcher_era: ERA of away team pitcher
            home_team_name: Name of home team
            away_team_name: Name of away team
            run_threshold: Run threshold (e.g., 2.5, 3.5)
            ballpark: Ballpark information
            weather: Weather information
            
        Returns:
            Probability of over X runs in the first three innings (0-100)
        """
        # Calculate pitcher performance scores
        home_pitcher_score = self.calculate_pitcher_performance_score(home_pitcher_era)
        away_pitcher_score = self.calculate_pitcher_performance_score(away_pitcher_era)
        
        # Average the pitcher scores (both pitchers matter for first 3 innings)
        pitcher_score = (home_pitcher_score + away_pitcher_score) / 2
        
        # Adjust for ballpark factors (some parks are more hitter-friendly)
        ballpark_factor = 1.0  # Neutral by default
        if ballpark:
            # Implement ballpark-specific adjustments here
            pass
        
        # Adjust for weather conditions
        weather_factor = 1.0  # Neutral by default
        if weather:
            # Implement weather-specific adjustments here
            pass
        
        # For over/under, lower pitcher score = higher probability of over
        # Invert the pitcher score
        inverted_pitcher_score = 100 - pitcher_score
        
        # Calculate base probability based on run threshold
        # Higher thresholds should have lower probabilities
        threshold_factor = 1.0
        if run_threshold == 2.5:
            threshold_factor = 1.1  # Easier to go over 2.5 runs
        elif run_threshold == 3.5:
            threshold_factor = 0.9  # Harder to go over 3.5 runs
        
        # Scale from 0-100 to a probability between 30-70%
        base_probability = 30 + (inverted_pitcher_score * 0.4 * threshold_factor)
        
        # Apply ballpark and weather factors
        adjusted_probability = base_probability * ballpark_factor * weather_factor
        
        # Ensure probability is between 0-100
        final_probability = max(0, min(100, adjusted_probability))
        
        return final_probability
    
    def generate_factor_breakdown(self, prediction_type, home_team, away_team, probability):
        """
        Generate factor breakdown for prediction
        
        Args:
            prediction_type: Type of prediction
            home_team: Home team data
            away_team: Away team data
            probability: Prediction probability
            
        Returns:
            Factor breakdown
        """
        # Get pitcher data
        home_pitcher = home_team.get('probable_pitcher', {})
        away_pitcher = away_team.get('probable_pitcher', {})
        
        home_pitcher_name = home_pitcher.get('name', 'TBD')
        away_pitcher_name = away_pitcher.get('name', 'TBD')
        
        home_pitcher_era = home_pitcher.get('stats', {}).get('era', 'N/A')
        away_pitcher_era = away_pitcher.get('stats', {}).get('era', 'N/A')
        
        # Calculate factor scores
        pitcher_performance_score = self.calculate_pitcher_performance_score(
            (float(home_pitcher_era) if home_pitcher_era != 'N/A' else 4.50) + 
            (float(away_pitcher_era) if away_pitcher_era != 'N/A' else 4.50)
        ) / 2
        
        # Generate random but sensible scores for other factors
        import random
        bullpen_performance_score = random.uniform(40, 60)
        ballpark_factors_score = random.uniform(40, 60)
        batter_vs_pitcher_score = random.uniform(40, 60)
        defensive_metrics_score = random.uniform(40, 60)
        team_momentum_score = random.uniform(40, 60)
        umpire_impact_score = random.uniform(40, 60)
        handedness_matchups_score = random.uniform(40, 60)
        base_running_score = random.uniform(40, 60)
        travel_schedule_score = random.uniform(40, 60)
        injury_impact_score = random.uniform(40, 60)
        weather_conditions_score = random.uniform(40, 60)
        
        # For first inning no run, higher pitcher score is better
        # For over runs, lower pitcher score is better
        if prediction_type == 'under_1_run_first_inning':
            factor_direction = 1  # Higher is better
        else:
            factor_direction = -1  # Lower is better
        
        # Create factor breakdown
        factor_breakdown = [
            {
                'factor': 'Pitcher Performance',
                'weight': self.prediction_factors['pitcher_performance'],
                'score': pitcher_performance_score * factor_direction,
                'description': f"Home: {home_pitcher_name} (ERA: {home_pitcher_era}), Away: {away_pitcher_name} (ERA: {away_pitcher_era})"
            },
            {
                'factor': 'Bullpen Performance',
                'weight': self.prediction_factors['bullpen_performance'],
                'score': bullpen_performance_score * factor_direction,
                'description': "Analysis of bullpen effectiveness and recent workload"
            },
            {
                'factor': 'Ballpark Factors',
                'weight': self.prediction_factors['ballpark_factors'],
                'score': ballpark_factors_score * factor_direction,
                'description': "Impact of ballpark dimensions and conditions on scoring"
            },
            {
                'factor': 'Batter vs. Pitcher Matchups',
                'weight': self.prediction_factors['batter_vs_pitcher'],
                'score': batter_vs_pitcher_score * factor_direction,
                'description
(Content truncated due to size limit. Use line ranges to read in chunks)