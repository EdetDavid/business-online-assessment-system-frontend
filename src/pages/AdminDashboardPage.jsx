import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  QueryBuilder as RecentIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { getAdminAssessments, getUsers, getResponses } from '../services/api';

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    assessments: [],
    users: [],
    responses: [],
    stats: {
      totalAssessments: 0,
      totalUsers: 0,
      totalResponses: 0,
      completionRate: 0,
      activeAssessments: 0
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all required data in parallel
        const [assessmentsRes, usersRes, responsesRes] = await Promise.all([
          getAdminAssessments(),
          getUsers(),
          getResponses()
        ]);

        // Process the data
        const assessments = assessmentsRes.data;
        const users = usersRes.data;
        const responses = responsesRes.data;

        // Calculate statistics
        const totalAssessments = assessments.length;
        const activeAssessments = assessments.filter(a => a.is_active).length;
        const totalUsers = users.length;
        const totalResponses = responses.length;
        
        // Calculate completion rate (assuming each user should complete all assessments)
        const possibleCompletions = totalUsers * totalAssessments;
        const completionRate = possibleCompletions > 0 
          ? Math.round((totalResponses / possibleCompletions) * 100) 
          : 0;

        setDashboardData({
          assessments,
          users,
          responses,
          stats: {
            totalAssessments,
            totalUsers,
            totalResponses,
            completionRate,
            activeAssessments
          }
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('You don\'t have access to this page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Get recent activities (most recent responses)
  const recentResponses = [...(dashboardData.responses || [])]
    .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
    .slice(0, 5);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box my={4} display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h4" gutterBottom>Loading Dashboard...</Typography>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box my={4}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        
        {/* Stats summary cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="subtitle2">
                      Total Users
                    </Typography>
                    <Typography variant="h4">
                      {dashboardData.stats.totalUsers}
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 40, color: 'primary.light' }} />
                </Box>
                <Box mt={2}>
                  <Button
                    component={RouterLink}
                    to="/admin/users"
                    size="small"
                    color="primary"
                  >
                    Manage Users
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="subtitle2">
                      Total Assessments
                    </Typography>
                    <Typography variant="h4">
                      {dashboardData.stats.totalAssessments}
                    </Typography>
                  </Box>
                  <AssessmentIcon sx={{ fontSize: 40, color: 'secondary.light' }} />
                </Box>
                <Box mt={2}>
                  <Button
                    component={RouterLink}
                    to="/admin/assessments"
                    size="small"
                    color="secondary"
                  >
                    Manage Assessments
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="subtitle2">
                      Total Responses
                    </Typography>
                    <Typography variant="h4">
                      {dashboardData.stats.totalResponses}
                    </Typography>
                  </Box>
                  <CompleteIcon sx={{ fontSize: 40, color: 'success.light' }} />
                </Box>
                <Box mt={2}>
                  <Button
                    component={RouterLink}
                    to="/results"
                    size="small"
                    color="success"
                  >
                    View Responses
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="subtitle2">
                      Completion Rate
                    </Typography>
                    <Typography variant="h4">
                      {dashboardData.stats.completionRate}%
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'info.light' }} />
                </Box>
                <Box mt={2}>
                  <LinearProgress 
                    variant="determinate" 
                    value={dashboardData.stats.completionRate} 
                    color={
                      dashboardData.stats.completionRate < 30 ? "error" : 
                      dashboardData.stats.completionRate < 70 ? "warning" : "success"
                    }
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Charts (replaced with simple visualizations) */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Overview Statistics
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {/* Custom bar visualization instead of recharts */}
              <Box display="flex" flexDirection="column" gap={3} mt={3}>
                <Box>
                  <Typography variant="body1" gutterBottom>Total Users: {dashboardData.stats.totalUsers}</Typography>
                  <Box width="100%" bgcolor="grey.100" height={30} borderRadius={1}>
                    <Box 
                      width={`${Math.min((dashboardData.stats.totalUsers / 100) * 100, 100)}%`} 
                      bgcolor="#1976d2" 
                      height="100%"
                      borderRadius={1}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography variant="body2" color="white" fontWeight="bold" sx={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
                        {dashboardData.stats.totalUsers}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="body1" gutterBottom>Total Assessments: {dashboardData.stats.totalAssessments}</Typography>
                  <Box width="100%" bgcolor="grey.100" height={30} borderRadius={1}>
                    <Box 
                      width={`${Math.min((dashboardData.stats.totalAssessments / 20) * 100, 100)}%`} 
                      bgcolor="#9c27b0" 
                      height="100%"
                      borderRadius={1}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography variant="body2" color="white" fontWeight="bold" sx={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
                        {dashboardData.stats.totalAssessments}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="body1" gutterBottom>Completed Responses: {dashboardData.stats.totalResponses}</Typography>
                  <Box width="100%" bgcolor="grey.100" height={30} borderRadius={1}>
                    <Box 
                      width={`${Math.min((dashboardData.stats.totalResponses / 200) * 100, 100)}%`} 
                      bgcolor="#4caf50" 
                      height="100%"
                      borderRadius={1}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography variant="body2" color="white" fontWeight="bold" sx={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
                        {dashboardData.stats.totalResponses}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Assessment Status
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {/* Circular visualization for active/inactive assessments */}
              <Box height={200} display="flex" justifyContent="center" alignItems="center" position="relative">
                <Box
                  sx={{
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: `conic-gradient(
                      #4caf50 0% ${(dashboardData.stats.activeAssessments / dashboardData.stats.totalAssessments) * 100}%, 
                      #f44336 ${(dashboardData.stats.activeAssessments / dashboardData.stats.totalAssessments) * 100}% 100%
                    )`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      bgcolor: 'background.paper',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'column'
                    }}
                  >
                    <Typography variant="h5">
                      {dashboardData.stats.activeAssessments}/{dashboardData.stats.totalAssessments}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Active</Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box textAlign="center" mt={2}>
                <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
                  <Box display="flex" alignItems="center">
                    <Box width={12} height={12} bgcolor="#4caf50" borderRadius={1} mr={1} />
                    <Typography variant="body2">Active: {dashboardData.stats.activeAssessments}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Box width={12} height={12} bgcolor="#f44336" borderRadius={1} mr={1} />
                    <Typography variant="body2">Inactive: {dashboardData.stats.totalAssessments - dashboardData.stats.activeAssessments}</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Recent Activity */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Responses
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {recentResponses.length > 0 ? (
                <List>
                  {recentResponses.map((response, index) => (
                    <ListItem key={response.id || `response-${index}`}>
                      <ListItemIcon>
                        <RecentIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={response.respondent_email} 
                        secondary={`Submitted on ${new Date(response.submitted_at).toLocaleString()}`} 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                  No responses yet
                </Typography>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Assessments
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {dashboardData.assessments.length > 0 ? (
                <List>
                  {dashboardData.assessments.slice(0, 5).map((assessment, index) => (
                    <ListItem key={assessment.id || `assessment-${index}`}>
                      <ListItemIcon>
                        <AssessmentIcon color="secondary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={assessment.title} 
                        secondary={`Created: ${new Date(assessment.created_at).toLocaleDateString()}`} 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                  No assessments created yet
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboardPage;