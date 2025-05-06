import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  CircularProgress,
  Typography,
  Box,
  Alert,
  Snackbar,
  Paper,
  LinearProgress,
  Button
} from '@mui/material';
import AssessmentForm from '../components/AssessmentForm';
import { getAssessment, submitResponse, savePartialResponse, getPartialResponse } from '../services/api';

const AssessmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [saveProgress, setSaveProgress] = useState(false);
  const [email, setEmail] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerIntervalId, setTimerIntervalId] = useState(null);

  // Fetch the assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const response = await getAssessment(id);
        setAssessment(response.data);
        
        // If time limit is set, initialize timer
        if (response.data.time_limit_minutes) {
          setTimeRemaining(response.data.time_limit_minutes * 60); // Convert to seconds
        }
      } catch (err) {
        setError('Failed to load assessment: ' + (err.response?.data?.detail || err.message));
        console.error('Error fetching assessment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
    
    // Cleanup timer on component unmount
    return () => {
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }
    };
  }, [id]);

  // Setup timer if time limit exists
  useEffect(() => {
    if (timeRemaining !== null && assessment?.time_limit_minutes) {
      const intervalId = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(intervalId);
            // Auto-submit logic could go here
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      setTimerIntervalId(intervalId);
      
      return () => clearInterval(intervalId);
    }
  }, [assessment, timeRemaining]);

  // Try to load partial response if user enters email
  useEffect(() => {
    const loadPartialResponse = async () => {
      if (email && assessment) {
        try {
          const response = await getPartialResponse(assessment.id, email);
          if (response.data && response.data.length > 0) {
            // Found a partial response, could populate the form here
            setSaveProgress(true);
          }
        } catch (err) {
          // No partial response found, which is fine
          console.log('No partial response found');
        }
      }
    };
    
    if (email) {
      loadPartialResponse();
    }
  }, [email, assessment]);

  // Format time remaining as mm:ss
  const formatTimeRemaining = () => {
    if (timeRemaining === null) return '';
    
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleEmailChange = (newEmail) => {
    setEmail(newEmail);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Format the response data
      const responseData = {
        assessment: assessment.id,
        respondent_email: values.email,
        answers: values.answers.map(answer => ({
          question: answer.question,
          answer_text: Array.isArray(answer.answer_text) 
            ? answer.answer_text.join(',') 
            : answer.answer_text
        }))
      };
      
      await submitResponse(responseData);
      setSuccess(true);
      
      // Clear any timer
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }
      
      // Redirect after successful submission
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError('Submission failed: ' + (err.response?.data?.detail || err.message));
      console.error('Error submitting response:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveProgress = async (values) => {
    if (!email) return;
    
    try {
      const partialData = {
        assessment: assessment.id,
        respondent_email: email,
        answers: values.answers
      };
      
      await savePartialResponse(partialData);
      setSaveProgress(true);
    } catch (err) {
      setError('Could not save progress: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !assessment) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box my={4}>
        {assessment && (
          <>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h4" gutterBottom>
                {assessment.title}
              </Typography>
              
              {timeRemaining !== null && (
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">
                      Time Remaining: <strong>{formatTimeRemaining()}</strong>
                    </Typography>
                    <Typography variant="body2">
                      {Math.round((timeRemaining / (assessment.time_limit_minutes * 60)) * 100)}% remaining
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(timeRemaining / (assessment.time_limit_minutes * 60)) * 100} 
                    color={timeRemaining < 60 ? "error" : timeRemaining < 300 ? "warning" : "primary"}
                  />
                </Box>
              )}
              
              <Typography variant="body1" paragraph>
                {assessment.description}
              </Typography>
              
              {saveProgress && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Your progress will be saved automatically as you complete the assessment.
                </Alert>
              )}
            </Paper>
            
            <AssessmentForm 
              assessment={assessment} 
              onSubmit={handleSubmit}
              onEmailChange={handleEmailChange}
              onSaveProgress={handleSaveProgress}
            />
          </>
        )}
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity="error" onClose={handleCloseSnackbar}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity="success" onClose={handleCloseSnackbar}>
          Assessment submitted successfully!
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={saveProgress}
        autoHideDuration={3000}
        onClose={() => setSaveProgress(false)}
      >
        <Alert severity="success" onClose={() => setSaveProgress(false)}>
          Progress saved
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AssessmentPage;