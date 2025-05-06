import React, { useState, useEffect } from 'react';
import { Container, CircularProgress, Typography, Box } from '@mui/material';
import AssessmentCard from '../components/AssessmentCard';
import { getAssessments } from '../services/api';

const HomePage = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await getAssessments();
        setAssessments(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Available Assessments
        </Typography>
        {assessments.length === 0 ? (
          <Typography>No assessments available</Typography>
        ) : (
          assessments.map(assessment => (
            <AssessmentCard key={assessment.id} assessment={assessment} />
          ))
        )}
      </Box>
    </Container>
  );
};

export default HomePage;