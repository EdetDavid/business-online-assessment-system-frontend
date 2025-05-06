import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { getAssessments, getAssessmentStats } from "../services/api";

export default function AssessmentStats({ stats: propStats }) {
  const [stats, setStats] = useState(propStats || null);
  const [loading, setLoading] = useState(!propStats);
  const [error, setError] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState("");

  // Fetch assessments for the dropdown
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await getAssessments();
        console.log(`This is the response data {${response.data}}`);
        setAssessments(response.data);
        // If we have assessments, select the first one by default
        if (response.data.length > 0 && !selectedAssessment) {
          setSelectedAssessment(response.data[0].id);
        }
      } catch (err) {
        console.error("Error fetching assessments:", err);
        setError("Failed to load assessments");
      }
    };

    fetchAssessments();
  }, []);

  // Fetch stats when selectedAssessment changes
  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedAssessment) return;

      setLoading(true);
      try {
        console.log(`Fetching stats for assessment ID: ${selectedAssessment}`);
        const response = await getAssessmentStats(selectedAssessment);
        console.log("Full API Response:", response.data);

        // Safely extract data from the API response
        const statsData = {
          total_responses: response.data.response_metrics?.total_responses || 0,
          completion_rate: response.data.response_metrics?.completion_rate || 0,
          avg_time_spent:
            response.data.response_metrics?.avg_time_spent ?? "N/A", // Use nullish coalescing
          most_common_answers: Array.isArray(response.data.most_common_answers)
            ? response.data.most_common_answers.join(", ")
            : response.data.most_common_answers || "N/A",
        };

        console.log("Processed Stats Data:", statsData);

        setStats(statsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load statistics for this assessment");
      } finally {
        setLoading(false);
      }
    };

    if (selectedAssessment && !propStats) {
      fetchStats();
    }
  }, [selectedAssessment, propStats]);

  const handleAssessmentChange = (event) => {
    setSelectedAssessment(event.target.value);
  };

  // Handle case when still loading
  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Assessment Statistics
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Assessment Statistics
      </Typography>

      {/* Assessment selector dropdown */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="assessment-select-label">Select Assessment</InputLabel>
        <Select
          labelId="assessment-select-label"
          id="assessment-select"
          value={selectedAssessment}
          label="Select Assessment"
          onChange={handleAssessmentChange}
        >
          {assessments.map((assessment) => (
            <MenuItem key={assessment.id} value={assessment.id}>
              {assessment.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {error ? (
        <Box sx={{ p: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : !stats ? (
        <Box sx={{ p: 2 }}>
          <Typography>No statistics available for this assessment.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h5" align="center" gutterBottom>
                  Key Metrics
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Typography variant="body1" color="textSecondary">
                      Total Responses
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {stats.total_responses || 0}
                    </Typography>
                    {/* Simple bar visualization */}
                    <Box
                      mt={1}
                      height={10}
                      width={`${Math.min(
                        (stats.total_responses || 0) * 5,
                        100
                      )}%`}
                      bgcolor="primary.main"
                      borderRadius={1}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body1" color="textSecondary">
                      Completion Rate
                    </Typography>
                    <Typography
                      variant="h4"
                      color={
                        (stats.completion_rate || 0) < 30
                          ? "error.main"
                          : (stats.completion_rate || 0) < 70
                          ? "warning.main"
                          : "success.main"
                      }
                    >
                      {stats.completion_rate
                        ? Math.round(stats.completion_rate)
                        : 0}
                      %
                    </Typography>
                    {/* Simple completion rate bar */}
                    <Box
                      mt={1}
                      height={10}
                      width="100%"
                      bgcolor="grey.200"
                      borderRadius={1}
                    >
                      <Box
                        height="100%"
                        width={`${stats.completion_rate || 0}%`}
                        bgcolor={
                          (stats.completion_rate || 0) < 30
                            ? "error.main"
                            : (stats.completion_rate || 0) < 70
                            ? "warning.main"
                            : "success.main"
                        }
                        borderRadius={1}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h5" align="center" gutterBottom>
                  Detailed Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box display="flex" flexDirection="column" gap={2}>
                  <Typography variant="body1">
                    <strong>Total Responses:</strong>{" "}
                    {stats.total_responses || 0}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Completion Rate:</strong>{" "}
                    {stats.completion_rate
                      ? Math.round(stats.completion_rate)
                      : 0}
                    %
                  </Typography>
                  <Typography variant="body1">
                    <strong>Average Time Spent:</strong>{" "}
                    {stats.avg_time_spent || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Most Common Answers:</strong>{" "}
                    {stats.most_common_answers || "N/A"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
}
