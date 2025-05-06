import React, { useState, useEffect } from 'react';
import { 
  Container, 
  CircularProgress, 
  Typography, 
  Box, 
  Paper, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem 
} from '@mui/material';
import ResultsTable from '../components/ResultsTable';
import { getResponses, getAssessments } from '../services/api';
import { useAuth } from '../auth/AuthContext';

const ResultsPage = () => {
  const [responses, setResponses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch all assessments for the filter dropdown
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await getAssessments();
        setAssessments(response.data);
      } catch (err) {
        console.error('Error fetching assessments:', err);
      }
    };

    if (isAuthenticated) {
      fetchAssessments();
    }
  }, [isAuthenticated]);
  useEffect(() => {
    const fetchResponses = async () => {
      setLoading(true);
      try {
        const response = await getResponses(selectedAssessment || null);
        setResponses(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load responses: ' + (err.response?.data?.detail || err.message));
        console.error('Error fetching responses:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchResponses();
    }
  }, [selectedAssessment, isAuthenticated]);

  const handleAssessmentChange = (event) => {
    setSelectedAssessment(event.target.value);
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          You need to be logged in to view results.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Assessment Results
        </Typography>

        {/* Assessment filter dropdown */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="assessment-select-label">Filter by Assessment</InputLabel>
            <Select
              labelId="assessment-select-label"
              id="assessment-select"
              value={selectedAssessment}
              label="Filter by Assessment"
              onChange={handleAssessmentChange}
            >
              <MenuItem value="">All Assessments</MenuItem>
              {assessments.map((assessment) => (
                <MenuItem key={assessment.id} value={assessment.id}>
                  {assessment.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : responses.length === 0 ? (
          <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
            <Typography>No responses found.</Typography>
          </Paper>
        ) : (
          <ResultsTable responses={responses} />
        )}
      </Box>
    </Container>
  );
};

export default ResultsPage;