import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Grid,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
  AddCircle as AddChoiceIcon,
  RemoveCircle as RemoveChoiceIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  getAdminAssessments, 
  createAssessment, 
  updateAssessment, 
  deleteAssessment,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createChoice,
  updateChoice,
  deleteChoice
} from '../services/api';

const AdminAssessmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state for creating/editing assessment
  const [isEditing, setIsEditing] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState({
    id: undefined,
    title: '',
    description: '',
    time_limit_minutes: 0,
    is_active: true
  });
  
  // Questions state
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  
  // Load assessments
  useEffect(() => {
    fetchAssessments();
  }, []);
  
  // Load specific assessment if ID is provided
  useEffect(() => {
    if (id) {
      const assessment = assessments.find(a => a.id === parseInt(id));
      if (assessment) {
        setCurrentAssessment(assessment);
        setIsEditing(true);
        fetchQuestions(assessment.id);
      }
    }
  }, [id, assessments]);
  
  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await getAdminAssessments();
      setAssessments(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load assessments:", err);
      setError('Failed to load assessments: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const fetchQuestions = async (assessmentId) => {
    try {
      setLoading(true);
      const response = await getQuestions(assessmentId);
      setQuestions(response.data);
    } catch (err) {
      console.error("Failed to load questions:", err);
      setError('Failed to load questions: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentAssessment({
      ...currentAssessment,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Format the data
      const assessmentData = {
        ...currentAssessment,
        time_limit_minutes: parseInt(currentAssessment.time_limit_minutes) || 0
      };
      
      // Remove the ID field if we're creating a new assessment
      if (!currentAssessment.id) {
        delete assessmentData.id;
      }
      
      if (currentAssessment.id) {
        // Update existing assessment
        await updateAssessment(currentAssessment.id, assessmentData);
        setNotification({
          open: true,
          message: 'Assessment updated successfully',
          severity: 'success'
        });
      } else {
        // Create new assessment
        console.log("Creating new assessment with data:", assessmentData);
        const response = await createAssessment(assessmentData);
        console.log("Create assessment response:", response);
        
        setNotification({
          open: true,
          message: 'Assessment created successfully',
          severity: 'success'
        });
        
        // Navigate to edit the newly created assessment
        navigate(`/admin/assessments/${response.data.id}`);
      }
      
      fetchAssessments();
    } catch (err) {
      console.error("Error saving assessment:", err);
      setError('Failed to save assessment: ' + (err.response?.data?.detail || err.message));
      setNotification({
        open: true,
        message: 'Failed to save assessment: ' + (err.response?.data?.detail || err.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (assessmentId) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteAssessment(assessmentId);
      setNotification({
        open: true,
        message: 'Assessment deleted successfully',
        severity: 'success'
      });
      fetchAssessments();
      
      // If we're currently editing the deleted assessment, go back to list view
      if (isEditing && currentAssessment.id === assessmentId) {
        resetForm();
      }
    } catch (err) {
      console.error("Error deleting assessment:", err);
      setError('Failed to delete assessment: ' + (err.response?.data?.detail || err.message));
      setNotification({
        open: true,
        message: 'Failed to delete assessment',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setCurrentAssessment({
      id: undefined,
      title: '',
      description: '',
      time_limit_minutes: 0,
      is_active: true
    });
    setIsEditing(false);
    setQuestions([]);
    navigate('/admin/assessments');
  };
  
  // Question management functions
  const handleOpenQuestionDialog = (question = null) => {
    if (question) {
      setCurrentQuestion({
        ...question,
        choices: question.choices || []
      });
    } else {
      setCurrentQuestion({
        question_text: '',
        question_type: 'text',
        required: true,
        choices: []
      });
    }
    setQuestionDialogOpen(true);
  };
  
  const handleQuestionInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentQuestion({
      ...currentQuestion,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleChoiceChange = (index, field, value) => {
    const updatedChoices = [...currentQuestion.choices];
    updatedChoices[index] = {
      ...updatedChoices[index],
      [field]: value
    };
    setCurrentQuestion({
      ...currentQuestion,
      choices: updatedChoices
    });
  };
  
  const addChoice = () => {
    setCurrentQuestion({
      ...currentQuestion,
      choices: [
        ...currentQuestion.choices,
        { choice_text: '', value: String(currentQuestion.choices.length + 1) }
      ]
    });
  };
  
  const removeChoice = (index) => {
    const updatedChoices = [...currentQuestion.choices];
    updatedChoices.splice(index, 1);
    setCurrentQuestion({
      ...currentQuestion,
      choices: updatedChoices
    });
  };
  
  const saveQuestion = async () => {
    try {
      setLoading(true);
      
      const questionData = {
        ...currentQuestion,
        assessment: currentAssessment.id
      };
      
      if (currentQuestion.id) {
        // Update existing question
        await updateQuestion(currentQuestion.id, questionData);
        
        // Handle choices updates
        if (currentQuestion.choices && currentQuestion.choices.length > 0) {
          for (const choice of currentQuestion.choices) {
            if (choice.id) {
              await updateChoice(choice.id, choice);
            } else {
              await createChoice(currentQuestion.id, choice);
            }
          }
        }
        
        setNotification({
          open: true,
          message: 'Question updated successfully',
          severity: 'success'
        });
      } else {
        // Create new question
        const response = await createQuestion(currentAssessment.id, questionData);
        
        // Create choices if applicable
        if (currentQuestion.choices && currentQuestion.choices.length > 0) {
          for (const choice of currentQuestion.choices) {
            await createChoice(response.data.id, choice);
          }
        }
        
        setNotification({
          open: true,
          message: 'Question created successfully',
          severity: 'success'
        });
      }
      
      // Refresh questions
      fetchQuestions(currentAssessment.id);
      setQuestionDialogOpen(false);
    } catch (err) {
      console.error("Error saving question:", err);
      setError('Failed to save question: ' + (err.response?.data?.detail || err.message));
      setNotification({
        open: true,
        message: 'Failed to save question',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const deleteQuestionHandler = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteQuestion(questionId);
      setNotification({
        open: true,
        message: 'Question deleted successfully',
        severity: 'success'
      });
      fetchQuestions(currentAssessment.id);
    } catch (err) {
      console.error("Error deleting question:", err);
      setError('Failed to delete question: ' + (err.response?.data?.detail || err.message));
      setNotification({
        open: true,
        message: 'Failed to delete question',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          {isEditing && currentAssessment.id ? 'Edit Assessment' : isEditing ? 'Create New Assessment' : 'Manage Assessments'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {isEditing ? (
          // Edit/Create Assessment Form
          <>
            <Button 
              startIcon={<BackIcon />} 
              onClick={resetForm}
              sx={{ mb: 3 }}
            >
              Back to Assessments
            </Button>
            
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <form onSubmit={handleSubmit}>
                <Typography variant="h5" gutterBottom>
                  Assessment Details
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Assessment Title"
                      name="title"
                      value={currentAssessment.title}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={currentAssessment.description}
                      onChange={handleInputChange}
                      multiline
                      rows={4}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Time Limit (minutes, 0 for no limit)"
                      name="time_limit_minutes"
                      type="number"
                      value={currentAssessment.time_limit_minutes}
                      onChange={handleInputChange}
                      variant="outlined"
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={currentAssessment.is_active}
                          onChange={handleInputChange}
                          name="is_active"
                        />
                      }
                      label="Active (published and available to users)"
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Assessment'}
                  </Button>
                </Box>
              </form>
            </Paper>
            
            {/* Questions Management - only show after assessment is created */}
            {currentAssessment.id && (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5">
                    Questions
                  </Typography>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenQuestionDialog()}
                  >
                    Add Question
                  </Button>
                </Box>
                
                {questions.length === 0 ? (
                  <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
                    No questions added yet. Click "Add Question" to create your first question.
                  </Typography>
                ) : (
                  <Grid container spacing={3}>
                    {questions.map((question, index) => (
                      <Grid item xs={12} key={question.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography variant="h6" gutterBottom>
                                {index + 1}. {question.question_text}
                              </Typography>
                              <Box>
                                <Typography variant="caption" sx={{ mr: 1 }}>
                                  {question.question_type.replace('_', ' ')} {question.required && '(Required)'}
                                </Typography>
                              </Box>
                            </Box>
                            
                            {question.choices && question.choices.length > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Choices:
                                </Typography>
                                <ul style={{ paddingLeft: '20px' }}>
                                  {question.choices.map((choice) => (
                                    <li key={choice.id}>{choice.choice_text}</li>
                                  ))}
                                </ul>
                              </Box>
                            )}
                          </CardContent>
                          <CardActions>
                            <Button
                              startIcon={<EditIcon />}
                              onClick={() => handleOpenQuestionDialog(question)}
                              size="small"
                            >
                              Edit
                            </Button>
                            <Button
                              startIcon={<DeleteIcon />}
                              onClick={() => deleteQuestionHandler(question.id)}
                              color="error"
                              size="small"
                            >
                              Delete
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            )}
          </>
        ) : (
          // Assessment List View
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">
                Your Assessments
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {
                  setCurrentAssessment({
                    id: undefined,
                    title: '',
                    description: '',
                    time_limit_minutes: 0,
                    is_active: true
                  });
                  setIsEditing(true);
                }}
              >
                Create New Assessment
              </Button>
            </Box>
            
            {loading && assessments.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : assessments.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
                No assessments found. Create your first assessment by clicking the button above.
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {assessments.map(assessment => (
                  <Grid item xs={12} sm={6} md={4} key={assessment.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {assessment.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {assessment.description || 'No description'}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color={assessment.is_active ? 'success.main' : 'error.main'}>
                            {assessment.is_active ? 'Active' : 'Inactive'}
                          </Typography>
                          <Typography variant="caption">
                            {assessment.time_limit_minutes > 0 
                              ? `Time limit: ${assessment.time_limit_minutes} min` 
                              : 'No time limit'}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          startIcon={<EditIcon />}
                          onClick={() => navigate(`/admin/assessments/${assessment.id}`)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          color="error" 
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(assessment.id)}
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        )}
      </Box>
      
      {/* Question Dialog */}
      <Dialog 
        open={questionDialogOpen} 
        onClose={() => setQuestionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentQuestion?.id ? 'Edit Question' : 'Add New Question'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Question Text"
              name="question_text"
              value={currentQuestion?.question_text || ''}
              onChange={handleQuestionInputChange}
              required
              margin="normal"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Question Type</InputLabel>
              <Select
                name="question_type"
                value={currentQuestion?.question_type || 'text'}
                onChange={handleQuestionInputChange}
                label="Question Type"
              >
                <MenuItem value="text">Text (Free response)</MenuItem>
                <MenuItem value="multiple_choice">Multiple Choice (Single answer)</MenuItem>
                <MenuItem value="checkbox">Checkbox (Multiple answers)</MenuItem>
                <MenuItem value="scale">Scale (1-5)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={currentQuestion?.required || false}
                  onChange={handleQuestionInputChange}
                  name="required"
                />
              }
              label="Required question"
              margin="normal"
            />
            
            {/* Choices for multiple choice or checkbox questions */}
            {currentQuestion && ['multiple_choice', 'checkbox'].includes(currentQuestion.question_type) && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Answer Choices
                </Typography>
                
                {currentQuestion.choices.map((choice, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TextField
                      label={`Choice ${index + 1}`}
                      value={choice.choice_text}
                      onChange={(e) => handleChoiceChange(index, 'choice_text', e.target.value)}
                      fullWidth
                      margin="dense"
                    />
                    <IconButton 
                      color="error" 
                      onClick={() => removeChoice(index)}
                      disabled={currentQuestion.choices.length <= 2}
                    >
                      <RemoveChoiceIcon />
                    </IconButton>
                  </Box>
                ))}
                
                <Button
                  startIcon={<AddChoiceIcon />}
                  onClick={addChoice}
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  Add Choice
                </Button>
              </Box>
            )}
            
            {/* For scale questions, show explanation */}
            {currentQuestion && currentQuestion.question_type === 'scale' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Scale questions present users with a 1-5 rating scale (Strongly Disagree to Strongly Agree).
                No additional configuration is needed.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={saveQuestion} 
            variant="contained"
            color="primary"
            disabled={
              !currentQuestion || 
              !currentQuestion.question_text || 
              ((['multiple_choice', 'checkbox'].includes(currentQuestion.question_type)) && 
               (!currentQuestion.choices || currentQuestion.choices.length < 2))
            }
          >
            Save Question
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminAssessmentPage;