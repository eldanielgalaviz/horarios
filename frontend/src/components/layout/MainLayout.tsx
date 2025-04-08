import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { UserRole } from '../../types/auth.types.ts';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ClassIcon from '@mui/icons-material/Class';
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 240;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Generate navigation items based on user role
  const getNavItems = () => {
    if (!authState.user) return [];

    switch (authState.user.userType) {
      case UserRole.ADMIN:
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
          { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
          { text: 'Groups', icon: <ClassIcon />, path: '/admin/grupos' },
          { text: 'Teachers', icon: <SchoolIcon />, path: '/admin/maestros' },
          { text: 'Students', icon: <PeopleIcon />, path: '/admin/alumnos' },
          { text: 'Subjects', icon: <ClassIcon />, path: '/admin/materias' },
          { text: 'Classrooms', icon: <MeetingRoomIcon />, path: '/admin/salones' },
          { text: 'Schedules', icon: <CalendarMonthIcon />, path: '/admin/horarios' },
          { text: 'Attendance', icon: <CheckCircleOutlineIcon />, path: '/admin/asistencias' },
        ];
      case UserRole.ALUMNO:
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/alumno/dashboard' },
          { text: 'My Schedule', icon: <CalendarMonthIcon />, path: '/alumno/horarios' },
          { text: 'My Attendance', icon: <CheckCircleOutlineIcon />, path: '/alumno/asistencias' },
          { text: 'Profile', icon: <PeopleIcon />, path: '/alumno/profile' },
        ];
      case UserRole.MAESTRO:
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/maestro/dashboard' },
          { text: 'My Subjects', icon: <ClassIcon />, path: '/maestro/materias' },
          { text: 'My Schedule', icon: <CalendarMonthIcon />, path: '/maestro/horarios' },
          { text: 'Attendance', icon: <CheckCircleOutlineIcon />, path: '/maestro/asistencias' },
          { text: 'Profile', icon: <PeopleIcon />, path: '/maestro/profile' },
        ];
      case UserRole.CHECADOR:
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/checador/dashboard' },
          { text: 'Register Attendance', icon: <CheckCircleOutlineIcon />, path: '/checador/register' },
          { text: 'Attendance Reports', icon: <CheckCircleOutlineIcon />, path: '/checador/reports' },
          { text: 'Profile', icon: <PeopleIcon />, path: '/checador/profile' },
        ];
      default:
        return [];
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          School Management
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {getNavItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={logout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {authState.user?.userType === UserRole.ADMIN && 'Admin Panel'}
            {authState.user?.userType === UserRole.ALUMNO && 'Student Portal'}
            {authState.user?.userType === UserRole.MAESTRO && 'Teacher Portal'}
            {authState.user?.userType === UserRole.CHECADOR && 'Attendance Management'}
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {authState.user?.nombre}
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
