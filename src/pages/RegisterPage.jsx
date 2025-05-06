import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress,
  Grid,
  Link as MuiLink,
  Stepper,
  Step,
  StepLabel,
  Divider
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import { register } from '../services/api';

const registrationSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First name is required'),
  lastName: Yup.string()
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  agreeToTerms: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
});

const RegisterPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const steps = ['Account Information', 'Password Setup', 'Terms & Conditions'];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setRegistrationError('');
      
      // Format the registration data
      const registrationData = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        password: values.password
      };
      
      // Call the registration API
      await register(registrationData);
      
      // Set registration success
      setRegistrationSuccess(true);
      
      // Navigate to login page after a delay
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please login with your new account.' 
          } 
        });
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.email?.[0] ||
                           'Registration failed. Please try again.';
      setRegistrationError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Initial values for the form
  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  };

  // Render specific step content
  const getStepContent = (step, props) => {
    const { values, touched, errors, handleChange, handleBlur, setFieldValue } = props;
    
    switch (step) {
      case 0:
        return (
          <>
            <Typography variant="h6" gutterBottom>
              Your Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.firstName && Boolean(errors.firstName)}
                  helperText={touched.firstName && errors.firstName}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.lastName && Boolean(errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  margin="normal"
                  required
                  type="email"
                />
              </Grid>
            </Grid>
          </>
        );
      case 1:
        return (
          <>
            <Typography variant="h6" gutterBottom>
              Create a Strong Password
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your password must be at least 8 characters and include uppercase, lowercase, and numbers.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  margin="normal"
                  required
                />
              </Grid>
            </Grid>
          </>
        );
      case 2:
        return (
          <>
            <Typography variant="h6" gutterBottom>
              Terms and Conditions
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, my: 2, maxHeight: 200, overflow: 'auto' }}>
              <Typography variant="body2">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
                
                [Your detailed terms and conditions would go here]
                
                These terms outline how we collect, use, and protect your data, as well as your
                responsibilities when using our assessment platform.
              </Typography>
            </Paper>
            <Box sx={{ mt: 2 }}>
              <label>
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={values.agreeToTerms}
                  onChange={() => setFieldValue('agreeToTerms', !values.agreeToTerms)}
                  style={{ marginRight: '8px' }}
                />
                I agree to the terms and conditions
              </label>
              {touched.agreeToTerms && errors.agreeToTerms && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                  {errors.agreeToTerms}
                </Typography>
              )}
            </Box>
          </>
        );
      default:
        return 'Unknown step';
    }
  };

  // If registration was successful, show success message
  if (registrationSuccess) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box textAlign="center">
              <Typography variant="h5" color="primary" gutterBottom>
                Registration Successful!
              </Typography>
              <Typography variant="body1" paragraph>
                Your account has been created successfully.
              </Typography>
              <Typography variant="body2">
                Redirecting to login page...
              </Typography>
              <CircularProgress size={24} sx={{ mt: 2 }} />
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" textAlign="center" gutterBottom>
            Create Your Account
          </Typography>
          
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, pt: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {registrationError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {registrationError}
            </Alert>
          )}
          
          <Formik
            initialValues={initialValues}
            validationSchema={registrationSchema}
            onSubmit={handleSubmit}
          >
            {(formikProps) => (
              <Form>
                {getStepContent(activeStep, formikProps)}
                
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    variant="outlined"
                    disabled={activeStep === 0}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  
                  <Box>
                    {activeStep === steps.length - 1 ? (
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={!formikProps.values.agreeToTerms || formikProps.isSubmitting}
                      >
                        {formikProps.isSubmitting ? (
                          <CircularProgress size={24} />
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={() => {
                          // Validate current step before proceeding
                          let canProceed = true;
                          
                          if (activeStep === 0) {
                            formikProps.validateField('firstName');
                            formikProps.validateField('lastName');
                            formikProps.validateField('email');
                            
                            canProceed = !(
                              (formikProps.touched.firstName && formikProps.errors.firstName) ||
                              (formikProps.touched.lastName && formikProps.errors.lastName) ||
                              (formikProps.touched.email && formikProps.errors.email) ||
                              !formikProps.values.firstName ||
                              !formikProps.values.lastName ||
                              !formikProps.values.email
                            );
                          } else if (activeStep === 1) {
                            formikProps.validateField('password');
                            formikProps.validateField('confirmPassword');
                            
                            canProceed = !(
                              (formikProps.touched.password && formikProps.errors.password) ||
                              (formikProps.touched.confirmPassword && formikProps.errors.confirmPassword) ||
                              !formikProps.values.password ||
                              !formikProps.values.confirmPassword
                            );
                          }
                          
                          if (canProceed) {
                            handleNext();
                          } else {
                            // Touch all fields to show validation errors
                            if (activeStep === 0) {
                              formikProps.setFieldTouched('firstName', true);
                              formikProps.setFieldTouched('lastName', true);
                              formikProps.setFieldTouched('email', true);
                            } else if (activeStep === 1) {
                              formikProps.setFieldTouched('password', true);
                              formikProps.setFieldTouched('confirmPassword', true);
                            }
                          }
                        }}
                      >
                        Next
                      </Button>
                    )}
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <MuiLink component={Link} to="/login">
                Sign in
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;