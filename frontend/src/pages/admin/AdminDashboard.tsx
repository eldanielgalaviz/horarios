import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout.tsx';
import axiosInstance from '../../api/axios.ts';
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Box,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/Class';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import TimelineIcon from '@mui/icons-material/Timeline';

interface StatsData {
  alumnosCount: number;
  maestrosCount: number;
  checadoresCount: number;
  gruposCount: number;
  salonesCount: number;
  materiasCount: number;
}

interface RecentActivity {
  id: number;
  action: string;
  target: string;
  date: string;
  user: string;
}

const AdminDashboard: React.FC = () => {
  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      // This would be a real endpoint in a production app
      // For now, we'll return mock data
      return {
        alumnosCount: 150,
        maestrosCount: 25,
        checadoresCount: 5,
        gruposCount: 10,
        salonesCount: 15,
        materiasCount: 30,
      } as StatsData;
    }
  });
  
  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['admin', 'activity'],
    queryFn: async () => {
      // This would be a real endpoint in a production app
      // For now, we'll return mock data
      return [
        { id: 1, action: 'Created', target: 'New student: Ana García', date: '2023-01-15T10:30:00', user: 'Admin' },
        { id: 2, action: 'Modified', target: 'Schedule for Group A', date: '2023-01-14T14:20:00', user: 'Admin' },
        { id: 3, action: 'Deleted', target: 'Course: Introduction to Physics', date: '2023-01-13T09:15:00', user: 'Admin' },
        { id: 4, action: 'Created', target: 'New teacher: Carlos Hernández', date: '2023-01-12T11:45:00', user: 'Admin' },
        { id: 5, action: 'Modified', target: 'Classroom 101', date: '2023-01-11T16:30:00', user: 'Admin' },
      ] as RecentActivity[];
    }
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <MainLayout>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {/* Statistics Cards */}
      <Box sx={{ mb: 4 }}>
        {statsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3 
          }}>
            {/* Students Card */}
            <Box sx={{ 
              width: { 
                xs: '100%', 
                sm: 'calc(50% - 12px)', 
                md: 'calc(33.333% - 16px)' 
              } 
            }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="h6">Students</Typography>
                  </Box>
                  <Typography variant="h3">{stats?.alumnosCount}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" component={Link} to="/admin/alumnos">Manage Students</Button>
                </CardActions>
              </Card>
            </Box>
            
            {/* Teachers Card */}
            <Box sx={{ 
              width: { 
                xs: '100%', 
                sm: 'calc(50% - 12px)', 
                md: 'calc(33.333% - 16px)' 
              } 
            }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <SchoolIcon />
                    </Avatar>
                    <Typography variant="h6">Teachers</Typography>
                  </Box>
                  <Typography variant="h3">{stats?.maestrosCount}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" component={Link} to="/admin/maestros">Manage Teachers</Button>
                </CardActions>
              </Card>
            </Box>
            
            {/* Groups Card */}
            <Box sx={{ 
              width: { 
                xs: '100%', 
                sm: 'calc(50% - 12px)', 
                md: 'calc(33.333% - 16px)' 
              } 
            }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <GroupIcon />
                    </Avatar>
                    <Typography variant="h6">Groups</Typography>
                  </Box>
                  <Typography variant="h3">{stats?.gruposCount}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" component={Link} to="/admin/grupos">Manage Groups</Button>
                </CardActions>
              </Card>
            </Box>
            
            {/* Classrooms Card */}
            <Box sx={{ 
              width: { 
                xs: '100%', 
                sm: 'calc(50% - 12px)', 
                md: 'calc(33.333% - 16px)' 
              } 
            }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                      <MeetingRoomIcon />
                    </Avatar>
                    <Typography variant="h6">Classrooms</Typography>
                  </Box>
                  <Typography variant="h3">{stats?.salonesCount}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" component={Link} to="/admin/salones">Manage Classrooms</Button>
                </CardActions>
              </Card>
            </Box>
            
            {/* Subjects Card */}
            <Box sx={{ 
              width: { 
                xs: '100%', 
                sm: 'calc(50% - 12px)', 
                md: 'calc(33.333% - 16px)' 
              } 
            }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <ClassIcon />
                    </Avatar>
                    <Typography variant="h6">Subjects</Typography>
                  </Box>
                  <Typography variant="h3">{stats?.materiasCount}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" component={Link} to="/admin/materias">Manage Subjects</Button>
                </CardActions>
              </Card>
            </Box>
            
            {/* Attendance Checkers Card */}
            <Box sx={{ 
              width: { 
                xs: '100%', 
                sm: 'calc(50% - 12px)', 
                md: 'calc(33.333% - 16px)' 
              } 
            }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <TimelineIcon />
                    </Avatar>
                    <Typography variant="h6">Attendance Checkers</Typography>
                  </Box>
                  <Typography variant="h3">{stats?.checadoresCount}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" component={Link} to="/admin/checadores">Manage Checkers</Button>
                </CardActions>
              </Card>
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Recent Activity */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        
        {activityLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {recentActivity?.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 
                      activity.action === 'Created' ? 'success.main' : 
                      activity.action === 'Modified' ? 'info.main' : 
                      'error.main' 
                    }}>
                      {activity.action[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.target}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {activity.action} by {activity.user}
                        </Typography>
                        {` - ${formatDate(activity.date)}`}
                      </>
                    }
                  />
                </ListItem>
                {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
      
      {/* Quick Actions */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2 
        }}>
          {/* Add New Student Button */}
          <Box sx={{ 
            width: { 
              xs: '100%', 
              sm: 'calc(50% - 8px)', 
              md: 'calc(25% - 12px)' 
            } 
          }}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              component={Link} 
              to="/admin/alumnos/new"
              startIcon={<PersonIcon />}
            >
              Add New Student
            </Button>
          </Box>
          
          {/* Add New Teacher Button */}
          <Box sx={{ 
            width: { 
              xs: '100%', 
              sm: 'calc(50% - 8px)', 
              md: 'calc(25% - 12px)' 
            } 
          }}>
            <Button 
              variant="contained" 
              color="secondary" 
              fullWidth 
              component={Link} 
              to="/admin/maestros/new"
              startIcon={<SchoolIcon />}
            >
              Add New Teacher
            </Button>
          </Box>
          
          {/* Create Schedule Button */}
          <Box sx={{ 
            width: { 
              xs: '100%', 
              sm: 'calc(50% - 8px)', 
              md: 'calc(25% - 12px)' 
            } 
          }}>
            <Button 
              variant="contained" 
              color="success" 
              fullWidth 
              component={Link} 
              to="/admin/horarios/new"
              startIcon={<TimelineIcon />}
            >
              Create Schedule
            </Button>
          </Box>
          
          {/* View Reports Button */}
          <Box sx={{ 
            width: { 
              xs: '100%', 
              sm: 'calc(50% - 8px)', 
              md: 'calc(25% - 12px)' 
            } 
          }}>
            <Button 
              variant="contained" 
              color="info" 
              fullWidth 
              component={Link} 
              to="/admin/reportes"
              startIcon={<TimelineIcon />}
            >
              View Reports
            </Button>
          </Box>
        </Box>
      </Paper>
    </MainLayout>
  );
};

export default AdminDashboard;