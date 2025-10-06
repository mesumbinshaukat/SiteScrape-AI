import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Divider
} from '@mui/material';
import {
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  SmartToy as AIIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon
} from '@mui/icons-material';

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error' | 'ai';
  category: string;
  message: string;
  details?: any;
}

interface Props {
  logs: LogEntry[];
}

const LogViewer: React.FC<Props> = ({ logs }) => {
  const [filter, setFilter] = useState<string[]>(['info', 'success', 'warning', 'error', 'ai']);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [autoScroll, setAutoScroll] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if user is at bottom
  const checkIfAtBottom = () => {
    if (!containerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    return scrollHeight - scrollTop - clientHeight < 50; // 50px threshold
  };

  // Auto-scroll only if enabled and user is at bottom
  useEffect(() => {
    if (autoScroll && checkIfAtBottom()) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const getIcon = (level: string) => {
    switch (level) {
      case 'info': return <InfoIcon color="info" />;
      case 'success': return <SuccessIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'ai': return <AIIcon sx={{ color: '#9c27b0' }} />;
      default: return <InfoIcon />;
    }
  };

  const getColor = (level: string) => {
    switch (level) {
      case 'info': return 'info';
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'ai': return 'secondary';
      default: return 'default';
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter.includes(log.level);
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groupedLogs = filteredLogs.reduce((acc, log) => {
    if (!acc[log.category]) {
      acc[log.category] = [];
    }
    acc[log.category].push(log);
    return acc;
  }, {} as Record<string, LogEntry[]>);

  return (
    <Paper elevation={3} sx={{ p: 2, maxHeight: '500px', overflow: 'auto' }} ref={containerRef}>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            📋 Activity Logs
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => setAutoScroll(!autoScroll)}
            color={autoScroll ? 'primary' : 'default'}
            title={autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
          >
            {autoScroll ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />
          
          <ToggleButtonGroup
            size="small"
            value={filter}
            onChange={(_, newFilter) => newFilter.length > 0 && setFilter(newFilter)}
          >
            <ToggleButton value="info">Info</ToggleButton>
            <ToggleButton value="success">Success</ToggleButton>
            <ToggleButton value="warning">Warning</ToggleButton>
            <ToggleButton value="error">Error</ToggleButton>
            <ToggleButton value="ai">AI</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`Total: ${filteredLogs.length}`} size="small" />
          <Chip label={`Categories: ${Object.keys(groupedLogs).length}`} size="small" color="primary" />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <List dense>
        {Object.entries(groupedLogs).map(([category, categoryLogs]) => (
          <Box key={category}>
            <ListItem
              button
              onClick={() => toggleCategory(category)}
              sx={{ 
                bgcolor: 'action.hover',
                borderRadius: 1,
                mb: 1
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {category}
                    </Typography>
                    <Chip label={categoryLogs.length} size="small" />
                  </Box>
                }
              />
              <IconButton size="small">
                {expandedCategories.has(category) ? <CollapseIcon /> : <ExpandIcon />}
              </IconButton>
            </ListItem>

            <Collapse in={expandedCategories.has(category)} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {categoryLogs.map((log, index) => (
                  <ListItem
                    key={index}
                    sx={{ 
                      pl: 4,
                      borderLeft: 3,
                      borderColor: `${getColor(log.level)}.main`,
                      mb: 0.5
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getIcon(log.level)}
                    </ListItemIcon>
                    <ListItemText
                      primary={log.message}
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </Typography>
                          {log.details && (
                            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                              {JSON.stringify(log.details, null, 2)}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        ))}
      </List>

      <div ref={logEndRef} />
    </Paper>
  );
};

export default LogViewer;
