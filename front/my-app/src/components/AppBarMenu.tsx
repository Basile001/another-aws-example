import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Start from '@mui/icons-material/Start'
import AccountCircle from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import MapIcon from '@mui/icons-material/Map';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Lock from '@mui/icons-material/Lock';
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { AuthService } from '../services/AuthService';
import { notificaton } from '../utils/notifications';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import { ListItem, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';


export default function AppBarMenu() {
  const [open, setOpen] = React.useState(false);

  const authService = new AuthService();
  const navigate = useNavigate();
  const intl = useIntl();

  const handleLogout = () => {
    if (authService) {
      let cognitoUser = authService.userPool.getCurrentUser();
      cognitoUser?.signOut(() => {
        notificaton(intl.formatMessage({ id: "notification.success" }), "Logged out successfully!", "success");
        navigate("/login");
      });
    }
  };

  const toggleMenu = (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setOpen(!open);
  }


  const leftMenu = () => (
    <Box
      sx={{ width: 300 }}
      role="presentation"
      onClick={toggleMenu}
      onKeyDown={toggleMenu}
    >
      <List
        subheader={
          <ListSubheader component="div" id="list-subheader">
            <FormattedMessage id="menu" />
          </ListSubheader>
        }>
        <ListItem>
          <ListItemButton
            component={RouterLink}
            to="/">
            <ListItemIcon>
              <MapIcon />
            </ListItemIcon>
            <ListItemText primary={intl.formatMessage({ id: "menu.home" })} />
          </ListItemButton>
        </ListItem>
        {authService.isLoggedIn() ?
          <ListItem>
            <ListItemButton
              component={RouterLink}
              to="/dashboard">
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary={intl.formatMessage({ id: "menu.dashboard" })} />
            </ListItemButton>
          </ListItem>
          :
          <>
            <ListItem>
              <ListItemButton
                component={RouterLink}
                to="/signup">
                <ListItemIcon>
                  <Start />
                </ListItemIcon>
                <ListItemText primary={intl.formatMessage({ id: "auth.signUp" })} />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton
                component={RouterLink}
                to="/login">
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary={intl.formatMessage({ id: "auth.login" })} />
              </ListItemButton>
            </ListItem>
          </>
        }
        {authService.isLoggedIn() ?
          <>
            <Divider />
            <ListItem>
              <ListItemButton
                component={RouterLink}
                to="/profile">
                <ListItemIcon>
                  <AccountCircle />
                </ListItemIcon>
                <ListItemText primary={intl.formatMessage({ id: "profile" })} />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton
                component={RouterLink}
                to="/security">
                <ListItemIcon>
                  <Lock />
                </ListItemIcon>
                <ListItemText primary={intl.formatMessage({ id: "menu.security" })} />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton
                onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary={intl.formatMessage({ id: "auth.logout" })} />
              </ListItemButton>
            </ListItem>
          </>
          : ""}
      </List>
      <Divider />
    </Box>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="small"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleMenu}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          anchor="left"
          open={open}
          onClose={toggleMenu}
        >
          {leftMenu()}
        </Drawer>
        <Typography
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            boxShadow: "none",
            color: "white"
          }}
          variant="h6"
          component={RouterLink}
          to="/">
          <FormattedMessage id="app.name" />
        </Typography>
        {authService.isLoggedIn() ?
          <>
            <Button
              startIcon={<AccountCircle />}
              component={RouterLink}
              to="/profile"
              color="inherit"
            >
              <FormattedMessage id="profile" />
            </Button>
            <Button
              startIcon={<LogoutIcon />}
              color="inherit"
              onClick={handleLogout}
            >
              <FormattedMessage id="auth.logout" />
            </Button>
          </>
          :
          <>
            <Button
              startIcon={<Start />}
              component={RouterLink}
              to="/signup"
              color="inherit">
              <FormattedMessage id="auth.signUp" />
            </Button>
            <Button
              startIcon={<LoginIcon />}
              component={RouterLink}
              to="/login"
              color="inherit">
              <FormattedMessage id="auth.login" />
            </Button>
          </>
        }
      </Toolbar>
    </AppBar>
  );
}
