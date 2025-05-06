import React, { useEffect, useState, useCallback } from 'react';
import { Formik, Form, Field, useFormikContext } from 'formik';
import * as Yup from 'yup';
import {
  Button,
  TextField,
  Radio,
  Checkbox,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Box,
  Typography,
  FormHelperText,
  Paper,
  Grid,
  Divider,
  Tooltip,
  IconButton,
  LinearProgress,
  Alert,
  Stack,
  useTheme
} from '@mui/material';
import {
  Save as SaveIcon,
  Help as HelpIcon,
  ArrowForward as NextIcon,
  ArrowBack as PrevIcon,
  WarningAmber as WarningIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { debounce } from 'lodash';

// Auto-save functionality component
const AutoSave = ({ debounceMs = 1000 }) => {
  const formik = useFormikContext();
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const debouncedSubmit = React.useCallback(
    debounce((values, onSaveProgress) => {
      if (values.email && onSaveProgress) {
        setIsSaving(true);
        onSaveProgress(values)
          .then(() => {
            setLastSaved(new Date());
            setIsSaving(false);
          })
          .catch(() => {
            setIsSaving(false);
          });
      }
    }, debounceMs),
    [debounceMs]
  );
  
  useEffect(() => {
    const { values, onSaveProgress } = formik;
    if (values.email && onSaveProgress) {
      debouncedSubmit(values, onSaveProgress);
    }
  }, [formik.values, debouncedSubmit, formik]);
  
  return isSaving ? (
    <Box sx={{ width: '100%', mt: 1 }}>
      <LinearProgress variant="indeterminate" color="primary" sx={{ height: 2 }} />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        Saving progress...
      </Typography>
    </Box>
  ) : lastSaved ? (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
      <CheckIcon color="success" fontSize="small" />
      <Typography variant="caption" color="text.secondary">
        Last saved: {lastSaved.toLocaleTimeString()}
      </Typography>
    </Stack>
  ) : null;
};

// FormProgress component to handle form progress tracking
const FormProgress = ({ values, assessment, setProgressPercent }) => {
  // Calculate progress percentage
  useEffect(() => {
    if (!assessment?.questions?.length) return;
    
    const totalQuestions = assessment.questions.length;
    let answeredQuestions = 0;
    
    values.answers.forEach(answer => {
      if (
        (Array.isArray(answer.answer_text) && answer.answer_text.length > 0) ||
        (typeof answer.answer_text === 'string' && answer.answer_text.trim() !== '')
      ) {
        answeredQuestions++;
      }
    });
    
    setProgressPercent(Math.round((answeredQuestions / totalQuestions) * 100));
  }, [values, assessment, setProgressPercent]);
  
  return null; // This component doesn't render anything
};

// EmailChangeNotifier component to handle email change notifications
const EmailChangeNotifier = ({ email, onEmailChange }) => {
  useEffect(() => {
    if (email && onEmailChange) {
      onEmailChange(email);
    }
  }, [email, onEmailChange]);
  
  return null; // This component doesn't render anything
};

const AssessmentForm = ({ 
  assessment, 
  onSubmit, 
  onEmailChange, 
  onSaveProgress,
  initialEmail = '',
  savedAnswers = null
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  
  // Group questions into logical sections/steps (max 3-5 questions per step)
  useEffect(() => {
    if (assessment?.questions?.length) {
      // Create steps with max 3 questions each (adjust as needed)
      const questionsPerStep = 3;
      const questionSteps = [];
      
      for (let i = 0; i < assessment.questions.length; i += questionsPerStep) {
        questionSteps.push(
          assessment.questions.slice(i, i + questionsPerStep)
        );
      }
      
      setSteps([
        // Add user info as first step
        { 
          title: 'Your Information', 
          isUserInfo: true 
        },
        // Add question steps
        ...questionSteps.map((questions, index) => ({
          title: `Section ${index + 1}`,
          questions
        }))
      ]);
    }
  }, [assessment]);
  
  // Create initial values from assessment questions
  const createInitialValues = () => {
    const answers = assessment.questions.map(q => ({
      question: q.id,
      answer_text: q.question_type === 'checkbox' ? [] : ''
    }));
    
    // If we have saved answers, use them
    if (savedAnswers) {
      // Map saved answers to their corresponding questions
      savedAnswers.forEach(savedAnswer => {
        const index = answers.findIndex(a => a.question === savedAnswer.question);
        if (index !== -1) {
          // For checkbox answers stored as comma-separated strings, convert back to array
          if (
            assessment.questions[index].question_type === 'checkbox' && 
            typeof savedAnswer.answer_text === 'string'
          ) {
            answers[index].answer_text = savedAnswer.answer_text.split(',');
          } else {
            answers[index].answer_text = savedAnswer.answer_text;
          }
        }
      });
    }
    
    return {
      email: initialEmail || '',
      answers
    };
  };

  // Dynamic validation schema based on question requirements
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required to save your progress'),
    answers: Yup.array().of(
      Yup.object().shape({
        answer_text: Yup.mixed().test(
          'required',
          'This question requires an answer',
          function(value) {
            const { question } = this.parent;
            const questionObj = assessment.questions.find(q => q.id === question);
            
            if (!questionObj?.required) return true;
            
            if (questionObj.question_type === 'checkbox') {
              return Array.isArray(value) && value.length > 0;
            }
            
            return value !== undefined && value !== null && value !== '';
          }
        )
      })
    )
  });
  
  // Handle step navigation
  const handleNext = () => {
    setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
    window.scrollTo(0, 0);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
    window.scrollTo(0, 0);
  };
  
  // Go to a specific step
  const goToStep = (stepIndex) => {
    setActiveStep(stepIndex);
    window.scrollTo(0, 0);
  };

  if (!assessment || !assessment.questions) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography>Loading assessment questions...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Paper>
    );
  }

  return (
    <Formik
      initialValues={createInitialValues()}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ values, errors, touched, setFieldValue, isSubmitting, validateForm }) => (
        <>
          {/* These components handle effects without breaking the rules of hooks */}
          <FormProgress 
            values={values} 
            assessment={assessment} 
            setProgressPercent={setProgressPercent} 
          />
          <EmailChangeNotifier 
            email={values.email} 
            onEmailChange={onEmailChange} 
          />
        
          <Form>
            {/* Progress indicator */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ width: '100%', mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">
                    Progress: {progressPercent}%
                  </Typography>
                  <Typography variant="body2">
                    Step {activeStep + 1} of {steps.length}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercent} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color={progressPercent < 30 ? "error" : progressPercent < 70 ? "warning" : "success"}
                />
              </Box>
              
              {/* Step navigation buttons */}
              <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1}>
                {steps.map((step, index) => (
                  <Button
                    key={index}
                    variant={activeStep === index ? "contained" : "outlined"}
                    size="small"
                    onClick={() => goToStep(index)}
                    sx={{ 
                      minWidth: 40,
                      bgcolor: activeStep === index ? theme.palette.primary.main : 'transparent',
                      color: activeStep === index ? 'white' : theme.palette.text.primary,
                    }}
                  >
                    {index + 1}
                  </Button>
                ))}
              </Box>
            </Paper>
            
            {/* Active step content */}
            {steps.length > 0 && steps[activeStep].isUserInfo ? (
              // User Information step
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {steps[activeStep].title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Please provide your email address to begin the assessment. This will allow you to save your progress.
                </Typography>
                
                <Field name="email">
                  {({ field, meta }) => (
                    <TextField
                      {...field}
                      label="Email Address"
                      fullWidth
                      margin="normal"
                      error={meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      required
                      placeholder="your.email@example.com"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Field>
                
                {/* Auto-save indicator */}
                {values.email && onSaveProgress && (
                  <AutoSave onSaveProgress={onSaveProgress} />
                )}
                
                <Box display="flex" justifyContent="space-between" mt={3}>
                  <Box /> {/* Empty box for alignment */}
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<NextIcon />}
                    onClick={handleNext}
                    disabled={!values.email}
                  >
                    Next Section
                  </Button>
                </Box>
              </Paper>
            ) : (
              // Questions step
              <>
                {steps[activeStep]?.questions?.map((question, qIndex) => {
                  // Find the index of this question in the overall assessment
                  const questionIndexInForm = assessment.questions.findIndex(q => q.id === question.id);
                  
                  if (questionIndexInForm === -1) return null;
                  
                  return (
                    <Paper key={question.id} elevation={2} sx={{ p: 3, mb: 3 }}>
                      <FormControl 
                        component="fieldset" 
                        error={
                          touched.answers?.[questionIndexInForm]?.answer_text && 
                          !!errors.answers?.[questionIndexInForm]?.answer_text
                        }
                        fullWidth
                      >
                        <Box display="flex" alignItems="flex-start" mb={2}>
                          <FormLabel 
                            component="legend" 
                            required={question.required} 
                            sx={{ flex: 1, color: 'text.primary' }}
                          >
                            <Typography variant="h6">
                              {question.question_text}
                            </Typography>
                          </FormLabel>
                          
                          {question.required && (
                            <Tooltip title="This question requires an answer">
                              <WarningIcon 
                                color="warning" 
                                fontSize="small" 
                                sx={{ ml: 1 }} 
                              />
                            </Tooltip>
                          )}
                        </Box>

                        {/* Text Question */}
                        {question.question_type === 'text' && (
                          <Field name={`answers.${questionIndexInForm}.answer_text`}>
                            {({ field, meta }) => (
                              <TextField
                                {...field}
                                fullWidth
                                multiline
                                rows={4}
                                margin="normal"
                                placeholder="Type your answer here"
                                error={meta.touched && !!meta.error}
                                helperText={meta.touched && meta.error}
                              />
                            )}
                          </Field>
                        )}

                        {/* Multiple Choice Question */}
                        {question.question_type === 'multiple_choice' && (
                          <RadioGroup
                            name={`answers.${questionIndexInForm}.answer_text`}
                            value={values.answers[questionIndexInForm].answer_text}
                            onChange={(e) => {
                              setFieldValue(
                                `answers.${questionIndexInForm}.answer_text`, 
                                e.target.value
                              );
                            }}
                          >
                            <Grid container spacing={2}>
                              {question.choices.map(choice => (
                                <Grid item xs={12} sm={6} key={choice.id}>
                                  <FormControlLabel
                                    value={choice.value}
                                    control={<Radio />}
                                    label={
                                      <Typography variant="body1">
                                        {choice.choice_text}
                                      </Typography>
                                    }
                                  />
                                </Grid>
                              ))}
                            </Grid>
                          </RadioGroup>
                        )}

                        {/* Checkbox Question */}
                        {question.question_type === 'checkbox' && (
                          <Box>
                            <Grid container spacing={2}>
                              {question.choices.map(choice => (
                                <Grid item xs={12} sm={6} key={choice.id}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={
                                          Array.isArray(values.answers[questionIndexInForm].answer_text) &&
                                          values.answers[questionIndexInForm].answer_text.includes(choice.value)
                                        }
                                        onChange={e => {
                                          const currentValues = [...(values.answers[questionIndexInForm].answer_text || [])];
                                          if (e.target.checked) {
                                            currentValues.push(choice.value);
                                          } else {
                                            const index = currentValues.indexOf(choice.value);
                                            if (index > -1) {
                                              currentValues.splice(index, 1);
                                            }
                                          }
                                          setFieldValue(
                                            `answers.${questionIndexInForm}.answer_text`, 
                                            currentValues
                                          );
                                        }}
                                      />
                                    }
                                    label={
                                      <Typography variant="body1">
                                        {choice.choice_text}
                                      </Typography>
                                    }
                                  />
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        )}

                        {/* Scale Question (1-5) */}
                        {question.question_type === 'scale' && (
                          <Box>
                            <Typography variant="body2" gutterBottom>
                              (1 = Strongly Disagree, 5 = Strongly Agree)
                            </Typography>
                            
                            <RadioGroup
                              row
                              name={`answers.${questionIndexInForm}.answer_text`}
                              value={values.answers[questionIndexInForm].answer_text}
                              onChange={e => {
                                setFieldValue(
                                  `answers.${questionIndexInForm}.answer_text`, 
                                  e.target.value
                                );
                              }}
                            >
                              <Grid 
                                container 
                                spacing={1} 
                                justifyContent="space-between"
                                sx={{ 
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  p: 1,
                                  mt: 1
                                }}
                              >
                                {[1, 2, 3, 4, 5].map(num => (
                                  <Grid item key={num}>
                                    <FormControlLabel
                                      value={num.toString()}
                                      control={<Radio />}
                                      label={
                                        <Box textAlign="center">
                                          <Typography variant="h6">{num}</Typography>
                                          <Typography variant="caption">
                                            {num === 1 ? 'Strongly Disagree' : 
                                             num === 2 ? 'Disagree' :
                                             num === 3 ? 'Neutral' :
                                             num === 4 ? 'Agree' :
                                             'Strongly Agree'}
                                          </Typography>
                                        </Box>
                                      }
                                      labelPlacement="bottom"
                                    />
                                  </Grid>
                                ))}
                              </Grid>
                            </RadioGroup>
                          </Box>
                        )}

                        {/* Error Message */}
                        {touched.answers?.[questionIndexInForm]?.answer_text && 
                         errors.answers?.[questionIndexInForm]?.answer_text && (
                          <FormHelperText error>
                            {errors.answers[questionIndexInForm].answer_text}
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Paper>
                  );
                })}
                
                {/* Navigation buttons */}
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Box display="flex" justifyContent="space-between">
                    <Button 
                      variant="outlined"
                      startIcon={<PrevIcon />}
                      onClick={handleBack}
                      disabled={activeStep === 0}
                    >
                      Previous
                    </Button>
                    
                    {activeStep < steps.length - 1 ? (
                      <Button 
                        variant="contained"
                        endIcon={<NextIcon />}
                        onClick={handleNext}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                      </Button>
                    )}
                  </Box>
                  
                  {/* Saving progress info */}
                  {values.email && onSaveProgress && (
                    <Box mt={2}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Your progress is being saved automatically. You can return to this assessment later using the same email address.
                      </Typography>
                      <AutoSave onSaveProgress={onSaveProgress} />
                    </Box>
                  )}
                </Paper>
              </>
            )}
            
            {/* Submit section (last page only) */}
            {activeStep === steps.length - 1 && (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Review & Submit
                </Typography>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                  Please review your answers before submitting. Once submitted, you won't be able to edit your responses.
                </Alert>
                
                <Box 
                  display="flex" 
                  justifyContent="center"
                >
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={isSubmitting}
                    size="large"
                    sx={{ py: 1.5, px: 4 }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                  </Button>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="caption" color="text.secondary">
                  By submitting this assessment, you acknowledge that your responses will be stored and analyzed in accordance with our privacy policy.
                </Typography>
              </Paper>
            )}
          </Form>
        </>
      )}
    </Formik>
  );
};

export default AssessmentForm;