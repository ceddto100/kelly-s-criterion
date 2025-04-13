import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Divider,
  Alert
} from '@mui/material';
import HistoricalPerformance from '../components/HistoricalPerformance';
import { useAuth } from '../contexts/AuthContext';

const sports = [
  { id: 'football', name: 'Football' },
  { id: 'basketball', name: 'Basketball' },
  { id: 'baseball', name: 'Baseball' },
  { id: 'hockey', name: 'Hockey' },
  { id: 'soccer', name: 'Soccer' }
];

const HistoricalDataPage = () => {
  const { user } = useAuth();
  const [selectedSport, setSelectedSport] = useState('');
  const [teamName, setTeamName] = useState('');
  const [showData, setShowData] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedSport) {
      setError('Please select a sport');
      return;
    }
    
    if (!teamName) {
      setError('Please enter a team name');
      return;
    }
    
    setError(null);
    setShowData(true);
  };

  const handleReset = () => {
    setSelectedSport('');
    setTeamName('');
    setShowData(false);
    setError(null);
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Historical Performance Analysis
        </Typography>
        <Typography variant="body1" paragraph>
          View historical performance data, model predictions, and calibration curves for your favorite teams.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="sport-select-label">Sport</InputLabel>
              <Select
                labelId="sport-select-label"
                value={selectedSport}
                label="Sport"
                onChange={(e) => setSelectedSport(e.target.value)}
              >
                {sports.map((sport) => (
                  <MenuItem key={sport.id} value={sport.id}>
                    {sport.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. New York Yankees"
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" color="primary">
              View Data
            </Button>
            <Button type="button" variant="outlined" onClick={handleReset}>
              Reset
            </Button>
          </Box>
        </Box>

        {showData && (
          <HistoricalPerformance 
            sport={selectedSport} 
            team={teamName} 
          />
        )}
      </Paper>
    </Container>
  );
};

export default HistoricalDataPage; 