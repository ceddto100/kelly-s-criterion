import React, { useState, useEffect } from 'react';
import { 
  getTeamHistory, 
  getModelPerformance 
} from '../services/historicalDataService';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button
} from '@mui/material';
import CalibrationCurve from './CalibrationCurve';

const HistoricalPerformance = ({ sport, team }) => {
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [modelData, setModelData] = useState(null);
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [calibrationData, setCalibrationData] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Format dates for API requests
      const dateParams = {};
      if (startDateStr) {
        const startDate = new Date(startDateStr);
        dateParams.startDate = startDate.toISOString();
      }
      if (endDateStr) {
        const endDate = new Date(endDateStr);
        dateParams.endDate = endDate.toISOString();
      }
      
      // Fetch team history
      const historyParams = {
        sport,
        team,
        ...dateParams
      };
      
      const history = await getTeamHistory(historyParams);
      setHistoryData(history);
      
      // Fetch model performance
      const modelParams = {
        sport,
        ...dateParams
      };
      
      const performance = await getModelPerformance(modelParams);
      setModelData(performance);
      
      // Process data for calibration curve
      if (history && history.length > 0) {
        // Extract prediction data for calibration curve
        const calibData = history
          .filter(item => item.predictions && item.predictions.length > 0)
          .flatMap(item => 
            item.predictions.map(pred => ({
              predictedProbability: pred.predictedProbability,
              actualOutcome: item.actualOutcome === 'home_win' ? 1 : 0,
              confidence: pred.confidenceLevel,
              date: new Date(item.date).toLocaleDateString(),
              opponent: item.opponent
            }))
          );
        
        setCalibrationData(calibData);
      }
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError('Failed to load historical data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sport && team) {
      fetchData();
    }
  }, [sport, team]);

  const handleApplyDateFilter = () => {
    if (sport && team) {
      fetchData();
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Historical Performance: {team} ({sport})
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="End Date"
                    type="date"
                    value={endDateStr}
                    onChange={(e) => setEndDateStr(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleApplyDateFilter}
                    sx={{ height: '100%' }}
                  >
                    Apply Filter
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {modelData && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Model Performance
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Model</TableCell>
                        <TableCell align="right">Accuracy</TableCell>
                        <TableCell align="right">Total Predictions</TableCell>
                        <TableCell align="right">Correct Predictions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(modelData).map(([model, data]) => (
                        <TableRow key={model}>
                          <TableCell component="th" scope="row">
                            {model.charAt(0).toUpperCase() + model.slice(1)}
                          </TableCell>
                          <TableCell align="right">
                            {(data.accuracy * 100).toFixed(2)}%
                          </TableCell>
                          <TableCell align="right">{data.total}</TableCell>
                          <TableCell align="right">{data.correct}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {calibrationData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Prediction Calibration
                </Typography>
                <CalibrationCurve data={calibrationData} />
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Match History
              </Typography>
              {historyData.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Opponent</TableCell>
                        <TableCell align="right">Result</TableCell>
                        <TableCell align="right">Score</TableCell>
                        <TableCell align="right">Market Odds</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyData.slice(0, 10).map((item) => (
                        <TableRow key={item._id}>
                          <TableCell>
                            {new Date(item.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{item.opponent}</TableCell>
                          <TableCell align="right">
                            {item.actualOutcome === 'home_win' 
                              ? 'Win' 
                              : item.actualOutcome === 'away_win' 
                                ? 'Loss' 
                                : 'Draw'}
                          </TableCell>
                          <TableCell align="right">
                            {item.score ? `${item.score.home} - ${item.score.away}` : 'N/A'}
                          </TableCell>
                          <TableCell align="right">
                            {item.marketOdds ? item.marketOdds.homeWin : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>No historical data available.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default HistoricalPerformance; 