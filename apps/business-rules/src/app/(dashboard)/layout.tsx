'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Badge,
  Popper,
  Paper,
  ClickAwayListener,
  Fade,
  Divider,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  Rule as RuleIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  Transform as TransformIcon,
  ExitToApp as ExitToAppIcon,
  Person as PersonIcon,
  Key as KeyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useNavigation } from '@/hooks/useNavigation';
import { useGlobalNotifications } from '@/contexts/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { goToDashboard, goToReglas, goToSimulador, goToReports, goToHistorial, goToMapeoXML, goToLogin } = useNavigation();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useGlobalNotifications();

  const notificationsRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLButtonElement>(null);

  const drawerWidth = 240;

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopSidebarOpen(!desktopSidebarOpen);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, onClick: goToDashboard },
    { text: 'Reglas', icon: <RuleIcon />, onClick: goToReglas },
    { text: 'Simulador', icon: <PsychologyIcon />, onClick: goToSimulador },
    { text: 'Mapeo XML', icon: <TransformIcon />, onClick: goToMapeoXML },
    { text: 'Reportes', icon: <AssessmentIcon />, onClick: goToReports },
    { text: 'Historial', icon: <HistoryIcon />, onClick: goToHistorial },
  ];

  const handleMenuItemClick = (onClick: () => void) => {
    onClick();
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleNotificationsToggle = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const handleNotificationsClose = () => {
    setNotificationsOpen(false);
  };

  const handleProfileToggle = () => {
    setProfileOpen(!profileOpen);
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
  };

  const handleLogout = () => {
    goToLogin();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'error':
        return <WarningIcon sx={{ color: '#f44336' }} />;
      case 'info':
      default:
        return <InfoIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const drawerContent = (
    <Box>
      {/* Logo */}
      <Box sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Image
          src="/images/LogoBanorte.svg"
          alt="Banorte"
          width={120}
          height={30}
          priority
        />
      </Box>

      {/* Menu Items */}
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleMenuItemClick(item.onClick)}
              sx={{
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              <ListItemIcon sx={{ color: '#EB0029', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '14px',
                  fontWeight: 500
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: '#EB0029',
          backgroundImage: "url('/images/HeaderBanorte.svg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          px: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {/* Menu Button */}
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, color: 'white' }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo for mobile */}
        {isMobile && (
          <Box sx={{ flexGrow: 1 }}>
            <Image
              src="/images/LogoBanorte.svg"
              alt="Banorte"
              width={100}
              height={25}
              priority
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Notifications */}
        <IconButton
          ref={notificationsRef}
          color="inherit"
          onClick={handleNotificationsToggle}
          sx={{ color: 'white', mr: 1 }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* Profile */}
        <IconButton
          ref={profileRef}
          color="inherit"
          onClick={handleProfileToggle}
          sx={{ color: 'white' }}
        >
          <AccountCircleIcon />
        </IconButton>
      </Box>

      {/* Notifications Popper */}
      <Popper
        open={notificationsOpen}
        anchorEl={notificationsRef.current}
        placement="bottom-end"
        transition
        sx={{ zIndex: theme.zIndex.modal + 1 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper sx={{ width: 360, maxHeight: 500, mt: 1, boxShadow: 3 }}>
              <ClickAwayListener onClickAway={handleNotificationsClose}>
                <Box>
                  {/* Header */}
                  <Box sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Notificaciones
                    </Typography>
                    {unreadCount > 0 && (
                      <Typography
                        variant="caption"
                        onClick={markAllAsRead}
                        sx={{
                          color: '#EB0029',
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        Marcar todas como leídas
                      </Typography>
                    )}
                  </Box>

                  {/* Notifications List */}
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {notifications.length === 0 ? (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="textSecondary">
                          No hay notificaciones
                        </Typography>
                      </Box>
                    ) : (
                      notifications.map((notification) => (
                        <Box
                          key={notification.id}
                          sx={{
                            p: 2,
                            borderBottom: '1px solid #f0f0f0',
                            backgroundColor: notification.read ? 'transparent' : '#f9f9f9',
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: '#f5f5f5' }
                          }}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            {getNotificationIcon(notification.type)}
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {notification.title}
                                </Typography>
                                {!notification.read && (
                                  <CircleIcon sx={{ fontSize: 8, color: '#EB0029' }} />
                                )}
                              </Box>
                              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                {notification.message}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: es })}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>

      {/* Profile Popper */}
      <Popper
        open={profileOpen}
        anchorEl={profileRef.current}
        placement="bottom-end"
        transition
        sx={{ zIndex: theme.zIndex.modal + 1 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper sx={{ width: 250, mt: 1, boxShadow: 3 }}>
              <ClickAwayListener onClickAway={handleProfileClose}>
                <Box>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText primary="Mi Perfil" />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton>
                        <ListItemIcon>
                          <KeyIcon />
                        </ListItemIcon>
                        <ListItemText primary="Cambiar Contraseña" />
                      </ListItemButton>
                    </ListItem>
                    <Divider />
                    <ListItem disablePadding>
                      <ListItemButton onClick={handleLogout}>
                        <ListItemIcon>
                          <ExitToAppIcon sx={{ color: '#EB0029' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Cerrar Sesión"
                          primaryTypographyProps={{ color: '#EB0029' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>

      {/* Sidebar - Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            mt: '64px'
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Sidebar - Desktop */}
      <Drawer
        variant="persistent"
        open={desktopSidebarOpen}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            mt: '64px',
            height: 'calc(100vh - 64px)',
            borderRight: '1px solid #e0e0e0'
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px',
          width: {
            xs: '100%',
            md: desktopSidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%'
          },
          ml: {
            xs: 0,
            md: desktopSidebarOpen ? `${drawerWidth}px` : 0
          },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
