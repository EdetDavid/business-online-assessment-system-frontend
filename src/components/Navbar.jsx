import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Divider,
  Badge,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Assessment as AssessmentIcon,
  Home as HomeIcon,
  BarChart as ResultsIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Help as HelpIcon,
  Dashboard as DashboardIcon,
  History as HistoryIcon,
  Favorite as FavoriteIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Language as LanguageIcon,
  Accessibility as AccessibilityIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useAuth } from "../auth/AuthContext";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}));

const LinkButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  margin: theme.spacing(0, 0.5),
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
}));

const Navbar = ({ toggleTheme, isDarkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  // State for menus
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [adminMenuAnchorEl, setAdminMenuAnchorEl] = useState(null);

  // State for preferences
  const [language, setLanguage] = useState("en");

  // Mock data for notifications
  const notificationsCount = 3;

  const handleMobileMenuOpen = (event) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleAdminMenuOpen = (event) => {
    setAdminMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMobileAnchorEl(null);
    setProfileAnchorEl(null);
    setNotificationsAnchorEl(null);
    setAdminMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleLogin = () => {
    navigate("/login");
    handleMenuClose();
  };

  const handleRegister = () => {
    navigate("/register");
    handleMenuClose();
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    // Actual language change implementation would go here
    handleMenuClose();
  };

  const mobileMenuId = "primary-search-account-menu-mobile";
  const profileMenuId = "primary-search-account-menu-profile";
  const notificationsMenuId = "primary-search-account-menu-notifications";
  const adminMenuId = "primary-search-account-menu-admin";

  // Check if the current route is active
  const isActive = (path) => location.pathname === path;

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={Boolean(mobileAnchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => handleNavigate("/")} selected={isActive("/")}>
        <ListItemIcon>
          <HomeIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="body1">Home</Typography>
      </MenuItem>

      <MenuItem
        onClick={() => handleNavigate("/assessment/1")}
        selected={isActive("/assessment/1")}
      >
        <ListItemIcon>
          <AssessmentIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="body1">Assessments</Typography>
      </MenuItem>

      {isAuthenticated && (
        <MenuItem
          onClick={() => handleNavigate("/results")}
          selected={isActive("/results")}
        >
          <ListItemIcon>
            <ResultsIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">Results</Typography>
        </MenuItem>
      )}

      {/* Admin section in mobile menu */}
      {isAuthenticated && isAdmin && (
        <div>
          <Divider />
          <Box sx={{ px: 2, py: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Admin
            </Typography>
          </Box>

          <MenuItem
            onClick={() => handleNavigate("/admin/users")}
            selected={isActive("/admin/users")}
          >
            <ListItemIcon>
              <PeopleIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body1">User Management</Typography>
          </MenuItem>
        </div>
      )}

      {/* Theme toggle in mobile menu */}
      <div>
        <Divider />
        <MenuItem onClick={toggleTheme}>
          <ListItemIcon>
            {isDarkMode ? (
              <LightModeIcon fontSize="small" />
            ) : (
              <DarkModeIcon fontSize="small" />
            )}
          </ListItemIcon>
          <Typography variant="body1">
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </Typography>
        </MenuItem>

        <Divider />

        {!isAuthenticated ? (
          <div>
            <MenuItem onClick={handleLogin}>
              <ListItemIcon>
                <LoginIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body1">Login</Typography>
            </MenuItem>

            <MenuItem onClick={handleRegister}>
              <ListItemIcon>
                <RegisterIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body1">Register</Typography>
            </MenuItem>
          </div>
        ) : (
          <div>
            <MenuItem onClick={() => handleNavigate("/profile")}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body1">Profile</Typography>
            </MenuItem>

            <MenuItem onClick={() => handleNavigate("/admin/dashboard")}>
              <ListItemIcon>
                <DashboardIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body1">Dashboard</Typography>
            </MenuItem>

            <MenuItem onClick={() => handleNavigate("/history")}>
              <ListItemIcon>
                <HistoryIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body1">Assessment History</Typography>
            </MenuItem>

            <MenuItem onClick={() => handleNavigate("/settings")}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body1">Settings</Typography>
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body1">Logout</Typography>
            </MenuItem>
          </div>
        )}
      </div>
    </Menu>
  );

  const renderProfileMenu = (
    <Menu
      anchorEl={profileAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={profileMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={Boolean(profileAnchorEl)}
      onClose={handleMenuClose}
    >
      {isAuthenticated ? (
        // Authenticated user profile menu
        <div>
          <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center" }}>
            <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {user?.email?.split("@")[0] || "User"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || ""}
                {isAdmin && (
                  <Box
                    component="span"
                    sx={{ ml: 1, color: "primary.main", fontWeight: "bold" }}
                  >
                    (Admin)
                  </Box>
                )}
              </Typography>
            </Box>
          </Box>

          <Divider />

          <MenuItem onClick={() => handleNavigate("/profile")}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            My Profile
          </MenuItem>

          <MenuItem onClick={() => handleNavigate("/admin/dashboard")}>
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            Dashboard
          </MenuItem>

          <MenuItem onClick={() => handleNavigate("/history")}>
            <ListItemIcon>
              <HistoryIcon fontSize="small" />
            </ListItemIcon>
            Assessment History
          </MenuItem>

          <MenuItem onClick={() => handleNavigate("/favorites")}>
            <ListItemIcon>
              <FavoriteIcon fontSize="small" />
            </ListItemIcon>
            Saved Assessments
          </MenuItem>

          {/* Admin section in profile menu */}
          {isAdmin && (
            <div>
              <Divider />
              <Box sx={{ px: 2, py: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Admin Controls
                </Typography>
              </Box>

              <MenuItem onClick={() => handleNavigate("/admin/users")}>
                <ListItemIcon>
                  <PeopleIcon fontSize="small" color="primary" />
                </ListItemIcon>
                User Management
              </MenuItem>
            </div>
          )}

          <Divider />

          {/* Theme toggle for authenticated users */}
          <MenuItem onClick={toggleTheme}>
            <ListItemIcon>
              {isDarkMode ? (
                <LightModeIcon fontSize="small" />
              ) : (
                <DarkModeIcon fontSize="small" />
              )}
            </ListItemIcon>
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </MenuItem>

          <MenuItem onClick={() => handleNavigate("/settings")}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>

          <MenuItem onClick={() => handleNavigate("/help")}>
            <ListItemIcon>
              <HelpIcon fontSize="small" />
            </ListItemIcon>
            Help & Support
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <Typography color="error">Logout</Typography>
          </MenuItem>
        </div>
      ) : (
        // Non-authenticated profile menu - with theme, accessibility, language options
        <div>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Preferences
            </Typography>
          </Box>

          <MenuItem onClick={toggleTheme}>
            <ListItemIcon>
              {isDarkMode ? (
                <LightModeIcon fontSize="small" />
              ) : (
                <DarkModeIcon fontSize="small" />
              )}
            </ListItemIcon>
            <Typography variant="body1">
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </Typography>
          </MenuItem>

          <Divider />

          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Language
            </Typography>
          </Box>

          <MenuItem
            onClick={() => handleLanguageChange("en")}
            selected={language === "en"}
          >
            <ListItemIcon>
              <LanguageIcon fontSize="small" />
            </ListItemIcon>
            English
          </MenuItem>

          <MenuItem
            onClick={() => handleLanguageChange("es")}
            selected={language === "es"}
          >
            <ListItemIcon>
              <LanguageIcon fontSize="small" />
            </ListItemIcon>
            Español
          </MenuItem>

          <MenuItem
            onClick={() => handleLanguageChange("fr")}
            selected={language === "fr"}
          >
            <ListItemIcon>
              <LanguageIcon fontSize="small" />
            </ListItemIcon>
            Français
          </MenuItem>

          <Divider />

          <MenuItem onClick={() => handleNavigate("/accessibility")}>
            <ListItemIcon>
              <AccessibilityIcon fontSize="small" />
            </ListItemIcon>
            Accessibility
          </MenuItem>

          <MenuItem onClick={() => handleNavigate("/help")}>
            <ListItemIcon>
              <HelpIcon fontSize="small" />
            </ListItemIcon>
            Help & Support
          </MenuItem>
        </div>
      )}
    </Menu>
  );

  const renderAdminMenu = (
    <Menu
      anchorEl={adminMenuAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={adminMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={Boolean(adminMenuAnchorEl)}
      onClose={handleMenuClose}
    >
      <div>
        <MenuItem onClick={() => handleNavigate("/admin/users")}>
          <ListItemIcon>
            <PeopleIcon fontSize="small" />
          </ListItemIcon>
          User Management
        </MenuItem>
        <MenuItem onClick={() => handleNavigate("/admin/assessments")}>
          <ListItemIcon>
            <AssessmentIcon fontSize="small" />
          </ListItemIcon>
          Manage Assessments
        </MenuItem>
        <MenuItem onClick={() => handleNavigate("/admin/stats")}>
          <ListItemIcon>
            <ResultsIcon fontSize="small" />
          </ListItemIcon>
          System Statistics
        </MenuItem>
      </div>
    </Menu>
  );

  const renderNotificationsMenu = (
    <Menu
      anchorEl={notificationsAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={notificationsMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={Boolean(notificationsAnchorEl)}
      onClose={handleMenuClose}
    >
      <div>
        <MenuItem onClick={handleMenuClose} sx={{ px: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Notifications ({notificationsCount})
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <Box sx={{ display: "flex", alignItems: "flex-start", p: 1 }}>
            <AssessmentIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
            <div>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                New assessment available
              </Typography>
              <Typography variant="body2">
                Business Strategy Assessment is now available
              </Typography>
              <Typography variant="caption" color="text.secondary">
                2 hours ago
              </Typography>
            </div>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Box sx={{ display: "flex", alignItems: "flex-start", p: 1 }}>
            <AssessmentIcon color="secondary" sx={{ mr: 2, mt: 0.5 }} />
            <div>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Assessment deadline reminder
              </Typography>
              <Typography variant="body2">
                The Leadership Assessment is due tomorrow
              </Typography>
              <Typography variant="caption" color="text.secondary">
                1 day remaining
              </Typography>
            </div>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => handleNavigate("/notifications")}
          sx={{ justifyContent: "center" }}
        >
          <Typography variant="body2" color="primary">
            View all notifications
          </Typography>
        </MenuItem>

        <MenuItem onClick={() => handleNavigate("/admin/assessments")}>
          <ListItemIcon>
            <AssessmentIcon fontSize="small" />
          </ListItemIcon>
          Manage Assessments
        </MenuItem>
      </div>
    </Menu>
  );

  // Theme toggle button for the toolbar
  const renderThemeToggle = (
    <Tooltip
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        sx={{ ml: 1, color: "text.primary" }}
      >
        {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );

  console.log("Auth state in Navbar:", { isAuthenticated, isAdmin, user });

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{ bgcolor: "background.paper" }}
    >
      <Container maxWidth="xl">
        <Toolbar>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={handleMobileMenuOpen}
              sx={{ mr: 2, color: "text.primary" }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo/Brand */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: "flex",
              alignItems: "center",
              fontWeight: 700,
              letterSpacing: ".1rem",
              color: "primary.main",
              textDecoration: "none",
              flexGrow: isMobile ? 1 : 0,
            }}
          >
            <AssessmentIcon sx={{ mr: 1 }} />
            BizAssess
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: "flex", flexGrow: 1, ml: 3 }}>
              <LinkButton
                component={RouterLink}
                to="/"
                startIcon={<HomeIcon />}
                color={isActive("/") ? "primary" : "inherit"}
                sx={{ color: isActive("/") ? "primary.main" : "text.primary" }}
              >
                Home
              </LinkButton>

              <LinkButton
                component={RouterLink}
                to="/assessment/1"
                startIcon={<AssessmentIcon />}
                color={isActive("/assessment/1") ? "primary" : "inherit"}
                sx={{
                  color: isActive("/assessment/1")
                    ? "primary.main"
                    : "text.primary",
                }}
              >
                Assessments
              </LinkButton>

              {isAuthenticated && (
                <LinkButton
                  component={RouterLink}
                  to="/results"
                  startIcon={<ResultsIcon />}
                  color={isActive("/results") ? "primary" : "inherit"}
                  sx={{
                    color: isActive("/results")
                      ? "primary.main"
                      : "text.primary",
                  }}
                >
                  Results
                </LinkButton>
              )}

              {/* Admin menu in desktop mode */}
              {isAuthenticated && isAdmin && (
                <LinkButton
                  aria-label="admin menu"
                  aria-controls={adminMenuId}
                  aria-haspopup="true"
                  onClick={handleAdminMenuOpen}
                  startIcon={<AdminIcon />}
                  color="inherit"
                  sx={{ color: "text.primary" }}
                >
                  Admin
                </LinkButton>
              )}
            </Box>
          )}

          {/* Right side buttons and icons */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* Theme toggle button - always visible */}
            {!isMobile && renderThemeToggle}

            {/* Login/Register buttons for non-authenticated users on desktop */}
            {!isMobile && !isAuthenticated && (
              <>
                <Button
                  color="inherit"
                  onClick={handleLogin}
                  sx={{
                    color: "text.primary",
                    mr: 1,
                    borderRadius: 2,
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={handleRegister}
                  startIcon={<RegisterIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                >
                  Register
                </Button>
              </>
            )}

            {/* Notification icon for authenticated users */}
            {isAuthenticated && (
              <Tooltip title="Notifications">
                <IconButton
                  size="large"
                  aria-label={`show ${notificationsCount} new notifications`}
                  color="inherit"
                  onClick={handleNotificationsMenuOpen}
                  sx={{ color: "text.primary", ml: isMobile ? 0 : 2 }}
                >
                  <StyledBadge badgeContent={notificationsCount} color="error">
                    <NotificationsIcon />
                  </StyledBadge>
                </IconButton>
              </Tooltip>
            )}

            {/* Direct shortcut to User Management for admins */}
            {isAuthenticated && isAdmin && !isMobile && (
              <Tooltip title="User Management">
                <IconButton
                  size="large"
                  color="inherit"
                  onClick={() => handleNavigate("/admin/users")}
                  sx={{ color: "text.primary", ml: 1 }}
                >
                  <PeopleIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* User/preferences icon */}
            <Tooltip title={isAuthenticated ? "Account menu" : "Preferences"}>
              <IconButton
                size="large"
                edge="end"
                aria-label={isAuthenticated ? "account menu" : "preferences"}
                aria-controls={profileMenuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                sx={{ color: "text.primary", ml: 1 }}
              >
                {isAuthenticated ? (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: isAdmin ? "secondary.main" : "primary.main",
                    }}
                  >
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </Avatar>
                ) : (
                  <PersonIcon />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </Container>

      {/* Render the menus */}
      {renderMobileMenu}
      {renderProfileMenu}
      {renderNotificationsMenu}
      {renderAdminMenu}
    </AppBar>
  );
};

export default Navbar;