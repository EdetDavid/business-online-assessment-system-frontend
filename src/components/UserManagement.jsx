import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Snackbar,
  Checkbox,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
  PersonOff as DeactivateIcon
} from '@mui/icons-material';
import { getUsers, updateUser, deleteUser, bulkUpdateUserRoles } from '../services/api';
import { useAuth } from '../auth/AuthContext';

// Create a separate component that doesn't use DataGrid
const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Load users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers(searchQuery);
      console.log("Users data:", response.data); 
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('You don\'t have access to this page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  // Handle user selection
  const toggleUserSelection = (userId) => {
    if (userId === currentUser?.id) return; // Don't allow selecting yourself
    
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Open edit dialog
  const handleEditClick = (user) => {
    setUserToEdit({...user});
    setEditDialogOpen(true);
  };

  // Confirm user deletion
  const confirmDelete = async () => {
    try {
      await deleteUser(userToDelete.id);
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setNotification({
        open: true,
        message: `User ${userToDelete.email} was deleted successfully.`,
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: `Failed to delete user: ${err.response?.data?.detail || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  // Save edited user
  const saveUserEdit = async () => {
    try {
      await updateUser(userToEdit.id, {
        first_name: userToEdit.first_name,
        last_name: userToEdit.last_name,
        email: userToEdit.email,
        is_admin: userToEdit.is_admin,
        is_active: userToEdit.is_active
      });
      
      // Update user in the local state
      setUsers(users.map(user => 
        user.id === userToEdit.id ? {...user, ...userToEdit} : user
      ));
      
      setNotification({
        open: true,
        message: `User ${userToEdit.email} was updated successfully.`,
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: `Failed to update user: ${err.response?.data?.detail || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setEditDialogOpen(false);
      setUserToEdit(null);
    }
  };

  // Make selected users admins
  const makeSelectedUsersAdmins = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      await bulkUpdateUserRoles(selectedUsers, true);
      
      // Update users in the local state
      setUsers(users.map(user => 
        selectedUsers.includes(user.id) ? {...user, is_admin: true} : user
      ));
      
      setNotification({
        open: true,
        message: `Successfully updated ${selectedUsers.length} users to admin status.`,
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: `Failed to update users: ${err.response?.data?.detail || 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  // Remove admin rights from selected users
  const removeAdminRights = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      await bulkUpdateUserRoles(selectedUsers, false);
      
      // Update users in the local state
      setUsers(users.map(user => 
        selectedUsers.includes(user.id) ? {...user, is_admin: false} : user
      ));
      
      setNotification({
        open: true,
        message: `Successfully removed admin rights from ${selectedUsers.length} users.`,
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: `Failed to update users: ${err.response?.data?.detail || 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>
        
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <TextField
              label="Search Users"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <Box>
              <Button 
                startIcon={<RefreshIcon />} 
                onClick={fetchUsers}
                sx={{ mr: 1 }}
              >
                Refresh
              </Button>
            </Box>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {selectedUsers.length > 0 && (
            <Box mb={2} display="flex" alignItems="center">
              <Typography variant="body2" sx={{ mr: 2 }}>
                {selectedUsers.length} users selected
              </Typography>
              
              <Button 
                variant="outlined" 
                color="primary" 
                size="small"
                startIcon={<AdminIcon />}
                onClick={makeSelectedUsersAdmins}
                sx={{ mr: 1 }}
              >
                Make Admins
              </Button>
              
              <Button 
                variant="outlined" 
                color="secondary" 
                size="small"
                startIcon={<DeactivateIcon />}
                onClick={removeAdminRights}
              >
                Remove Admin Rights
              </Button>
            </Box>
          )}
          
          {/* Replace DataGrid with a simple table */}
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <Box 
                sx={{ 
                  display: 'table', 
                  width: '100%',
                  borderCollapse: 'collapse',
                  '& th, & td': {
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  },
                }}
              >
                <Box component="thead" sx={{ bgcolor: 'background.default' }}>
                  <Box component="tr">
                    <Box component="th" width="40px" align="center">
                      {/* Header checkbox */}
                    </Box>
                    <Box component="th" width="60px">ID</Box>
                    <Box component="th" width="250px">Email</Box>
                    <Box component="th" width="200px">Name</Box>
                    <Box component="th" width="80px">Admin</Box>
                    <Box component="th" width="80px">Active</Box>
                    <Box component="th" width="180px">Joined</Box>
                    <Box component="th" width="120px">Actions</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {users.map(user => (
                    <Box 
                      component="tr" 
                      key={user.id}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        bgcolor: selectedUsers.includes(user.id) ? 'action.selected' : 'transparent',
                      }}
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      <Box component="td" align="center">
                        {user.id !== currentUser?.id && (
                          <Checkbox 
                            checked={selectedUsers.includes(user.id)} 
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleUserSelection(user.id)}
                          />
                        )}
                      </Box>
                      <Box component="td">{user.id}</Box>
                      <Box component="td" sx={{ fontWeight: user.id === currentUser?.id ? 'bold' : 'normal' }}>
                        {user.email}
                        {user.id === currentUser?.id && ' (You)'}
                      </Box>
                      <Box component="td">
                        {`${user.first_name || ''} ${user.last_name || ''}`}
                      </Box>
                      <Box component="td" sx={{ color: user.is_admin ? 'success.main' : 'text.secondary' }}>
                        {user.is_admin ? 'Yes' : 'No'}
                      </Box>
                      <Box component="td" sx={{ color: user.is_active ? 'success.main' : 'error.main' }}>
                        {user.is_active ? 'Yes' : 'No'}
                      </Box>
                      <Box component="td">
                        {new Date(user.date_joined).toLocaleString()}
                      </Box>
                      <Box component="td" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Edit User">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditClick(user)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {user.id !== currentUser?.id && (
                          <Tooltip title="Delete User">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteClick(user)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          )}
        </Paper>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {userToDelete?.email}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {userToEdit && (
            <Box component="form" noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                fullWidth
                label="First Name"
                value={userToEdit.first_name || ''}
                onChange={(e) => setUserToEdit({...userToEdit, first_name: e.target.value})}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Last Name"
                value={userToEdit.last_name || ''}
                onChange={(e) => setUserToEdit({...userToEdit, last_name: e.target.value})}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Email"
                value={userToEdit.email || ''}
                onChange={(e) => setUserToEdit({...userToEdit, email: e.target.value})}
                disabled={userToEdit.id === currentUser?.id}
              />
              
              <Box display="flex" alignItems="center" mt={2}>
                <Checkbox
                  checked={userToEdit.is_admin || false}
                  onChange={(e) => setUserToEdit({...userToEdit, is_admin: e.target.checked})}
                  disabled={userToEdit.id === currentUser?.id}
                />
                <Typography>Admin user</Typography>
              </Box>
              
              <Box display="flex" alignItems="center">
                <Checkbox
                  checked={userToEdit.is_active || false}
                  onChange={(e) => setUserToEdit({...userToEdit, is_active: e.target.checked})}
                  disabled={userToEdit.id === currentUser?.id}
                />
                <Typography>Active</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={saveUserEdit} color="primary" variant="contained">
            Save Changes
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
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManagementPage;