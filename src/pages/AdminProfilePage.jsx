import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Divider,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  LinearProgress,
  InputAdornment,
  Tab,
  Tabs
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  SaveAlt as SaveIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ModeEdit as ModeEditIcon
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { getUserProfile, updateUserProfile, changePassword } from '../services/api';
import { styled } from '@mui/material/styles';

// Styled components
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  margin: '0 auto',
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[3],
  fontSize: 40
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Password strength meter
const PasswordStrengthMeter = ({ password }) => {
  // Calculate password strength
  const calculateStrength = (pwd) => {
    if (!pwd) return 0;
    
    let strength = 0;
    // Add length criteria
    if (pwd.length >= 8) strength += 1;
    // Add uppercase criteria
    if (/[A-Z]/.test(pwd)) strength += 1;
    // Add lowercase criteria
    if (/[a-z]/.test(pwd)) strength += 1;
    // Add number criteria
    if (/[0-9]/.test(pwd)) strength += 1;
    // Add special character criteria
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    
    return (strength / 5) * 100;
  };
  
  const strength = calculateStrength(password);
  
  // Determine color based on strength
  const getColor = () => {
    if (strength < 30) return 'error';
    if (strength < 70) return 'warning';
    return 'success';
  };
  
  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <LinearProgress 
        variant="determinate" 
        value={strength} 
        color={getColor()}
        sx={{ height: 8, borderRadius: 5 }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Password strength: {
          strength < 30 ? 'Weak' : 
          strength < 70 ? 'Moderate' : 
          'Strong'
        }
      </Typography>
    </Box>
  );
};

const AdminProfilePage = () => {
  const { user, refreshUserToken } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  
  // Form states
  const [formValues, setFormValues] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    phone: '',
    department: ''
  });
  
  // Password change states
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState('');
  
  // Settings states
  const [settings, setSettings] = useState({
    emailNotifications: true,
    twoFactorAuth: false,
    dataSharing: false
  });
  
  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile();
        const userData = response.data;
        setProfile(userData);
        
        // Set form values
        setFormValues({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          role: userData.is_admin ? 'Administrator' : 'Staff',
          phone: userData.phone || '',
          department: userData.department || 'IT'
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setNotification({
          open: true,
          message: 'Failed to load profile data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };
  
  // Handle password change inputs
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({
      ...passwords,
      [name]: value
    });
    
    // Clear error when typing
    if (passwordError) setPasswordError('');
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };
  
  // Handle settings toggle
  const handleSettingToggle = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
  };
  
  // Save profile changes
  const saveProfile = async () => {
    try {
      setLoading(true);
      
      // Prepare data for update
      const updateData = {
        first_name: formValues.first_name,
        last_name: formValues.last_name,
        // Don't include email if it hasn't changed to avoid unique constraint issues
        ...(formValues.email !== profile.email ? { email: formValues.email } : {}),
        phone: formValues.phone
      };
      
      await updateUserProfile(updateData);
      
      // Update local profile state
      setProfile({
        ...profile,
        ...updateData
      });
      
      // If email was changed, we might need to refresh the auth token
      if (formValues.email !== profile.email) {
        await refreshUserToken();
      }
      
      setEditMode(false);
      setNotification({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        open: true,
        message: 'Failed to update profile: ' + (error.response?.data?.detail || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Change password
  const handleChangePassword = async () => {
    // Validate passwords
    if (passwords.new_password !== passwords.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwords.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      
      await changePassword({
        old_password: passwords.current_password,
        new_password: passwords.new_password
      });
      
      // Clear form
      setPasswords({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      setNotification({
        open: true,
        message: 'Password changed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };
  
  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  if (loading && !profile) {
    return (
      <Container maxWidth="md">
        <Box my={4} display="flex" flexDirection="column" alignItems="center">
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading profile...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom mb={4}>
          Admin Profile
        </Typography>
        
        <Grid container spacing={4}>
          {/* Left column - Profile overview */}
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <ProfileAvatar>
                  {formValues.first_name && formValues.last_name 
                    ? `${formValues.first_name[0]}${formValues.last_name[0]}`
                    : formValues.email?.[0].toUpperCase() || 'A'}
                </ProfileAvatar>
                
                <Typography variant="h5" sx={{ mt: 2 }}>
                  {formValues.first_name} {formValues.last_name}
                </Typography>
                
                <Typography variant="body1" color="textSecondary">
                  {formValues.email}
                </Typography>
                
                <Chip 
                  label={formValues.role} 
                  color="primary" 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                />
                
                <Divider sx={{ my: 3 }} />
                
                <List>
                  <ListItem dense>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText primary="Email" secondary={formValues.email} />
                  </ListItem>
                  
                  <ListItem dense>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary="Department" secondary={formValues.department || 'Not specified'} />
                  </ListItem>
                  
                  <ListItem dense>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Account Status" 
                      secondary={
                        <Chip 
                          size="small" 
                          label="Active" 
                          color="success" 
                          sx={{ mt: 0.5 }}
                        />
                      } 
                    />
                  </ListItem>
                  
                  {!editMode && (
                    <ListItem dense sx={{ mt: 2 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => setEditMode(true)}
                      >
                        Edit Profile
                      </Button>
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Right column - Tabs with different sections */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Profile Information" icon={<PersonIcon />} iconPosition="start" />
                  <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
                  <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" />
                  <Tab label="Activity" icon={<HistoryIcon />} iconPosition="start" />
                </Tabs>
              </Box>
              
              {/* Profile Information Tab */}
              <TabPanel value={activeTab} index={0}>
                <Typography variant="h6" gutterBottom>
                  {editMode ? 'Edit Profile' : 'Profile Information'}
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="first_name"
                      value={formValues.first_name}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      margin="normal"
                      InputProps={{
                        readOnly: !editMode,
                        endAdornment: !editMode && (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              onClick={() => setEditMode(true)}
                            >
                              <ModeEditIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="last_name"
                      value={formValues.last_name}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      margin="normal"
                      InputProps={{
                        readOnly: !editMode,
                        endAdornment: !editMode && (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              onClick={() => setEditMode(true)}
                            >
                              <ModeEditIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={formValues.email}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      margin="normal"
                      InputProps={{
                        readOnly: !editMode,
                        endAdornment: !editMode && (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              onClick={() => setEditMode(true)}
                            >
                              <ModeEditIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formValues.phone}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      margin="normal"
                      placeholder="+1 (123) 456-7890"
                      InputProps={{
                        readOnly: !editMode
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      name="department"
                      value={formValues.department}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      margin="normal"
                      InputProps={{
                        readOnly: !editMode
                      }}
                    />
                  </Grid>
                  
                  {editMode && (
                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="flex-end" mt={2}>
                        <Button 
                          variant="outlined" 
                          onClick={() => setEditMode(false)} 
                          sx={{ mr: 2 }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          startIcon={<SaveIcon />}
                          onClick={saveProfile}
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>
              
              {/* Security Tab */}
              <TabPanel value={activeTab} index={1}>
                <Typography variant="h6" gutterBottom>
                  Security Settings
                </Typography>
                
                <Box mb={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    <LockIcon 
                      fontSize="small" 
                      color="primary" 
                      sx={{ mr: 1, verticalAlign: 'middle' }} 
                    />
                    Change Password
                  </Typography>
                  
                  <Box mt={2}>
                    {passwordError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {passwordError}
                      </Alert>
                    )}
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Current Password"
                          name="current_password"
                          type={showPassword.current ? 'text' : 'password'}
                          value={passwords.current_password}
                          onChange={handlePasswordChange}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => togglePasswordVisibility('current')}
                                  edge="end"
                                >
                                  {showPassword.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="New Password"
                          name="new_password"
                          type={showPassword.new ? 'text' : 'password'}
                          value={passwords.new_password}
                          onChange={handlePasswordChange}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => togglePasswordVisibility('new')}
                                  edge="end"
                                >
                                  {showPassword.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                        
                        {passwords.new_password && (
                          <PasswordStrengthMeter password={passwords.new_password} />
                        )}
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Confirm New Password"
                          name="confirm_password"
                          type={showPassword.confirm ? 'text' : 'password'}
                          value={passwords.confirm_password}
                          onChange={handlePasswordChange}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => togglePasswordVisibility('confirm')}
                                  edge="end"
                                >
                                  {showPassword.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box display="flex" justifyContent="flex-end">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleChangePassword}
                            disabled={
                              !passwords.current_password ||
                              !passwords.new_password ||
                              !passwords.confirm_password ||
                              loading
                            }
                          >
                            Update Password
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  <SecurityIcon 
                    fontSize="small" 
                    color="primary" 
                    sx={{ mr: 1, verticalAlign: 'middle' }} 
                  />
                  Two-Factor Authentication
                </Typography>
                
                <Box mt={2} mb={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.twoFactorAuth}
                        onChange={() => handleSettingToggle('twoFactorAuth')}
                        color="primary"
                      />
                    }
                    label="Enable Two-Factor Authentication"
                  />
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Add an extra layer of security to your account by requiring an authentication code along with your password.
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  <LockIcon 
                    fontSize="small" 
                    color="primary" 
                    sx={{ mr: 1, verticalAlign: 'middle' }} 
                  />
                  Account Access
                </Typography>
                
                <Box mt={2}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Last login" 
                        secondary="Today at 10:32 AM from 192.168.1.1" 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <ErrorIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Failed login attempts" 
                        secondary="None in the last 30 days" 
                      />
                    </ListItem>
                  </List>
                </Box>
              </TabPanel>
              
              {/* Settings Tab */}
              <TabPanel value={activeTab} index={2}>
                <Typography variant="h6" gutterBottom>
                  Admin Settings
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email Notifications" 
                      secondary="Receive updates about system activity and changes" 
                    />
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={() => handleSettingToggle('emailNotifications')}
                      color="primary"
                    />
                  </ListItem>
                  
                  <Divider variant="inset" component="li" />
                  
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Enhanced Security Alerts" 
                      secondary="Get notified about suspicious login attempts" 
                    />
                    <Switch
                      checked={settings.twoFactorAuth}
                      onChange={() => handleSettingToggle('twoFactorAuth')}
                      color="primary"
                    />
                  </ListItem>
                  
                  <Divider variant="inset" component="li" />
                  
                  <ListItem>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Data Sharing" 
                      secondary="Share anonymized usage data to improve the platform" 
                    />
                    <Switch
                      checked={settings.dataSharing}
                      onChange={() => handleSettingToggle('dataSharing')}
                      color="primary"
                    />
                  </ListItem>
                </List>
                
                <Box display="flex" justifyContent="flex-end" mt={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setNotification({
                        open: true,
                        message: 'Settings saved successfully',
                        severity: 'success'
                      });
                    }}
                  >
                    Save Settings
                  </Button>
                </Box>
              </TabPanel>
              
              {/* Activity Tab */}
              <TabPanel value={activeTab} index={3}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Profile updated" 
                      secondary="You updated your profile information" 
                    />
                    <Typography variant="caption" color="textSecondary">
                      Today, 2:30 PM
                    </Typography>
                  </ListItem>
                  
                  <Divider variant="inset" component="li" />
                  
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Password changed" 
                      secondary="You changed your account password" 
                    />
                    <Typography variant="caption" color="textSecondary">
                      Yesterday, 11:45 AM
                    </Typography>
                  </ListItem>
                  
                  <Divider variant="inset" component="li" />
                  
                  <ListItem>
                    <ListItemIcon>
                      <SettingsIcon color="action" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Settings updated" 
                      secondary="You changed your notification preferences" 
                    />
                    <Typography variant="caption" color="textSecondary">
                      Mar 15, 2023, 9:20 AM
                    </Typography>
                  </ListItem>
                  
                  <Divider variant="inset" component="li" />
                  
                  <ListItem>
                    <ListItemIcon>
                      <HistoryIcon color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Account created" 
                      secondary="Your admin account was created" 
                    />
                    <Typography variant="caption" color="textSecondary">
                      Mar 10, 2023, 2:15 PM
                    </Typography>
                  </ListItem>
                </List>
                
                <Box display="flex" justifyContent="center" mt={2}>
                  <Button color="primary">
                    View All Activity
                  </Button>
                </Box>
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
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
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminProfilePage;