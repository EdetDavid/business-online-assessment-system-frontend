import React from 'react';
import { Card, CardContent, Typography, Button, CardActions } from '@mui/material';
import { Link } from 'react-router-dom';

const AssessmentCard = ({ assessment }) => {
  return (
    <Card sx={{ minWidth: 275, mb: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {assessment.title}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {new Date(assessment.created_at).toLocaleDateString()}
        </Typography>
        <Typography variant="body2">
          {assessment.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          component={Link} 
          to={`/assessment/${assessment.id}`}
        >
          Start Assessment
        </Button>
      </CardActions>
    </Card>
  );
};

export default AssessmentCard;