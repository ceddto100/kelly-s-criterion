const MarketOdds = require('../models/marketOddsModel');
const { 
  calculateImpliedProbability, 
  calculateBookmakerMargin, 
  removeFairMargin,
  calculateEdgePercentage,
  calculateExpectedValue,
  rankByEdge,
  convertOdds
} = require('../utils/marketOddsCalculations');

/**
 * Get market odds for an event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMarketOdds = async (req, res) => {
  try {
    const { eventId, marketType } = req.params;
    
    const query = { eventId };
    if (marketType) {
      query.marketType = marketType;
    }
    
    const marketOdds = await MarketOdds.findOne(query);
    
    if (!marketOdds) {
      return res.status(404).json({ error: 'Market odds not found for this event' });
    }
    
    res.status(200).json({ marketOdds });
  } catch (error) {
    console.error('Error fetching market odds:', error);
    res.status(500).json({ error: 'Failed to fetch market odds' });
  }
};

/**
 * Get all upcoming events with market odds
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUpcomingEvents = async (req, res) => {
  try {
    const { sport, league, limit = 10 } = req.query;
    
    const query = {
      startTime: { $gt: new Date() }
    };
    
    if (sport) query.sport = sport;
    if (league) query.league = league;
    
    const events = await MarketOdds.find(query)
      .sort({ startTime: 1 })
      .limit(parseInt(limit));
    
    res.status(200).json({ events });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
};

/**
 * Add or update market odds for an event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateMarketOdds = async (req, res) => {
  try {
    const {
      eventId,
      sport,
      league,
      event,
      homeTeam,
      awayTeam,
      startTime,
      marketType,
      pointSpread,
      total,
      bookmakerOdds
    } = req.body;
    
    if (!eventId || !bookmakerOdds) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Find and update or create new document
    const marketOdds = await MarketOdds.findOneAndUpdate(
      { eventId, marketType },
      {
        sport,
        league,
        event,
        homeTeam,
        awayTeam,
        startTime,
        marketType,
        pointSpread,
        total,
        $push: { bookmakerOdds: { $each: bookmakerOdds } }
      },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
    
    res.status(200).json({ 
      message: 'Market odds updated successfully',
      marketOdds 
    });
  } catch (error) {
    console.error('Error updating market odds:', error);
    res.status(500).json({ error: 'Failed to update market odds' });
  }
};

/**
 * Delete outdated market odds records
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const cleanupOldOdds = async (req, res) => {
  try {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 7); // Delete odds older than 7 days
    
    const result = await MarketOdds.deleteMany({
      startTime: { $lt: thresholdDate }
    });
    
    res.status(200).json({
      message: 'Old market odds deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up old market odds:', error);
    res.status(500).json({ error: 'Failed to clean up old market odds' });
  }
};

/**
 * Compare user's probability with market implied probability
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const compareOdds = async (req, res) => {
  try {
    const { eventId, marketType, userProbability, outcome } = req.body;
    
    if (!eventId || !marketType || !userProbability || !outcome) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const marketOdds = await MarketOdds.findOne({ eventId, marketType });
    
    if (!marketOdds) {
      return res.status(404).json({ error: 'Market odds not found for this event' });
    }
    
    // Process each bookmaker's odds
    const comparisons = marketOdds.bookmakerOdds.map(bookmaker => {
      // Get the appropriate odds for the requested outcome
      let odds;
      switch (outcome) {
        case 'home':
          odds = bookmaker.homeOdds;
          break;
        case 'away':
          odds = bookmaker.awayOdds;
          break;
        case 'draw':
          odds = bookmaker.drawOdds;
          break;
        default:
          throw new Error(`Invalid outcome: ${outcome}`);
      }
      
      // Convert to decimal if not already
      const decimalOdds = convertOdds(odds, bookmaker.oddsFormat, 'decimal');
      
      // Calculate implied probability
      const impliedProbability = calculateImpliedProbability(decimalOdds, 'decimal');
      
      // Calculate bookmaker margin (simplified - should use all outcomes)
      let allProbabilities = [];
      if (bookmaker.homeOdds) {
        allProbabilities.push(calculateImpliedProbability(
          convertOdds(bookmaker.homeOdds, bookmaker.oddsFormat, 'decimal'),
          'decimal'
        ));
      }
      if (bookmaker.awayOdds) {
        allProbabilities.push(calculateImpliedProbability(
          convertOdds(bookmaker.awayOdds, bookmaker.oddsFormat, 'decimal'),
          'decimal'
        ));
      }
      if (bookmaker.drawOdds) {
        allProbabilities.push(calculateImpliedProbability(
          convertOdds(bookmaker.drawOdds, bookmaker.oddsFormat, 'decimal'),
          'decimal'
        ));
      }
      
      const bookmakerMargin = calculateBookmakerMargin(allProbabilities);
      
      // Remove margin to get fair probability
      const fairProbability = removeFairMargin(
        impliedProbability, 
        bookmakerMargin,
        allProbabilities.length
      );
      
      // Calculate edge percentage
      const edgePercentage = calculateEdgePercentage(
        parseFloat(userProbability),
        fairProbability
      );
      
      // Calculate expected value
      const expectedValue = calculateExpectedValue(
        parseFloat(userProbability),
        decimalOdds
      );
      
      return {
        bookmaker: bookmaker.bookmaker,
        odds: {
          original: odds,
          decimal: decimalOdds,
          format: bookmaker.oddsFormat
        },
        probabilities: {
          implied: impliedProbability,
          fair: fairProbability,
          user: parseFloat(userProbability)
        },
        analysis: {
          bookmakerMargin,
          edgePercentage,
          expectedValue,
          isPositiveEV: expectedValue > 0
        }
      };
    });
    
    // Rank opportunities by edge
    const rankedOpportunities = rankByEdge(comparisons);
    
    res.status(200).json({
      event: {
        id: marketOdds.eventId,
        name: marketOdds.event,
        teams: {
          home: marketOdds.homeTeam,
          away: marketOdds.awayTeam
        },
        startTime: marketOdds.startTime
      },
      marketType,
      outcome,
      userProbability: parseFloat(userProbability),
      comparisons: rankedOpportunities
    });
  } catch (error) {
    console.error('Error comparing odds:', error);
    res.status(500).json({ error: 'Failed to compare odds' });
  }
};

module.exports = {
  getMarketOdds,
  getUpcomingEvents,
  updateMarketOdds,
  cleanupOldOdds,
  compareOdds
}; 