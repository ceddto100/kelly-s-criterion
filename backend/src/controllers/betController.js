const Bet = require('../models/betModel');
const User = require('../models/userModel');
const { calculateKellyBet, calculateRiskMetrics, oddsCalculations } = require('../utils/kellyCalculations');
const probabilityController = require('./probabilityController');

// Create new bet with Kelly Criterion calculations
const createBet = async (req, res) => {
  try {
    const {
      sport,
      event,
      eventDate,
      betType,
      odds,
      userProbability,
      stake,
      confidenceLevel,
      notes,
      tags
    } = req.body;

    // Get user's current bankroll and risk settings
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has reached their maximum open bets
    const openBets = await Bet.countDocuments({
      user: req.user._id,
      status: 'pending'
    });
    if (openBets >= user.riskSettings.maxOpenBets) {
      return res.status(400).json({ 
        message: `Maximum number of open bets (${user.riskSettings.maxOpenBets}) reached`
      });
    }

    // Calculate Kelly bet size and analysis
    const kellyResults = calculateKellyBet(
      userProbability,
      odds,
      user.riskSettings.defaultFractionMultiplier,
      user.riskSettings.maxBetPercentage
    );

    // Calculate risk metrics
    const riskMetrics = calculateRiskMetrics(stake, odds, user.bankroll);

    // Check if bet exceeds daily risk limits
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayBets = await Bet.find({
      user: req.user._id,
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const dailyLoss = todayBets.reduce((total, bet) => 
      bet.result < 0 ? total + Math.abs(bet.result) : total, 0);
    const dailyWin = todayBets.reduce((total, bet) => 
      bet.result > 0 ? total + bet.result : total, 0);

    // Check stop loss
    if (dailyLoss + stake > user.bankroll * user.riskSettings.stopLossPercentage) {
      return res.status(400).json({ 
        message: 'Daily stop loss limit would be exceeded'
      });
    }

    // Check stop win
    if (dailyWin > user.bankroll * user.riskSettings.stopWinPercentage) {
      return res.status(400).json({ 
        message: 'Daily stop win limit reached'
      });
    }

    // Create bet with all calculations
    const bet = await Bet.create({
      user: req.user._id,
      sport,
      event,
      eventDate,
      betType,
      odds,
      userProbability,
      impliedProbability: kellyResults.impliedProbability,
      edge: kellyResults.edge,
      confidenceLevel,
      kellyFraction: kellyResults.kellyFraction,
      fractionMultiplier: user.riskSettings.defaultFractionMultiplier,
      stake,
      potentialProfit: riskMetrics.potentialProfit,
      bankrollRiskPercentage: riskMetrics.bankrollRiskPercentage,
      notes,
      tags,
      analysis: {
        riskLevel: kellyResults.analysis.riskLevel,
        recommendation: kellyResults.analysis.recommendation
      }
    });

    res.status(201).json(bet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all user's bets with filtering and sorting
const getBets = async (req, res) => {
  try {
    const {
      status,
      sport,
      betType,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (sport) filter.sport = sport;
    if (betType) filter.betType = betType;
    if (startDate || endDate) {
      filter.eventDate = {};
      if (startDate) filter.eventDate.$gte = new Date(startDate);
      if (endDate) filter.eventDate.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const bets = await Bet.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const count = await Bet.countDocuments(filter);

    res.json({
      bets,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update bet result and user stats
const updateBetResult = async (req, res) => {
  try {
    const { status, result } = req.body;

    const bet = await Bet.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!bet) {
      return res.status(404).json({ message: 'Bet not found' });
    }

    // Update bet status and result
    bet.status = status;
    bet.result = result;
    bet.settledAt = new Date();

    // Update user's bankroll and performance stats
    const user = await User.findById(req.user._id);
    user.bankroll += result;

    // Update performance metrics
    if (status === 'won') {
      user.performance.wonBets += 1;
    } else if (status === 'lost') {
      user.performance.lostBets += 1;
    } else if (status === 'push') {
      user.performance.pushBets += 1;
    }

    user.performance.totalBets = 
      user.performance.wonBets + 
      user.performance.lostBets + 
      user.performance.pushBets;
    
    user.performance.totalProfit += result;
    user.updatePerformanceStats();

    await user.save();
    const updatedBet = await bet.save();
    
    res.json(updatedBet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get betting statistics with date range
const getBetStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const stats = await Bet.aggregate([
      { 
        $match: { 
          user: req.user._id,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalBets: { $sum: 1 },
          wonBets: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
          lostBets: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } },
          pushBets: { $sum: { $cond: [{ $eq: ['$status', 'push'] }, 1, 0] } },
          totalStake: { $sum: '$stake' },
          totalProfit: { $sum: '$result' },
          averageStake: { $avg: '$stake' },
          averageEdge: { $avg: '$edge' },
          profitableBets: { 
            $sum: { 
              $cond: [{ $gt: ['$result', 0] }, 1, 0] 
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalBets: 1,
          wonBets: 1,
          lostBets: 1,
          pushBets: 1,
          totalStake: 1,
          totalProfit: 1,
          averageStake: 1,
          averageEdge: 1,
          profitableBets: 1,
          winRate: {
            $multiply: [
              { $divide: ['$wonBets', { $subtract: ['$totalBets', '$pushBets'] }] },
              100
            ]
          },
          roi: {
            $multiply: [
              { $divide: ['$totalProfit', '$totalStake'] },
              100
            ]
          }
        }
      }
    ]);

    res.json(stats[0] || {
      totalBets: 0,
      wonBets: 0,
      lostBets: 0,
      pushBets: 0,
      totalStake: 0,
      totalProfit: 0,
      averageStake: 0,
      averageEdge: 0,
      profitableBets: 0,
      winRate: 0,
      roi: 0
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get single bet with detailed analysis
const getBet = async (req, res) => {
  try {
    const bet = await Bet.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!bet) {
      return res.status(404).json({ message: 'Bet not found' });
    }

    // Calculate additional analysis if bet is settled
    let analysis = bet.analysis;
    if (bet.status !== 'pending') {
      analysis = {
        ...analysis,
        roi: bet.calculateROI(),
        actualToExpectedReturn: bet.result / bet.potentialProfit,
        edgeEffectiveness: bet.result > 0 ? bet.edge : -bet.edge
      };
    }

    res.json({
      ...bet.toObject(),
      analysis
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createBet,
  getBets,
  getBet,
  updateBetResult,
  getBetStats,
  probabilityController
}; 