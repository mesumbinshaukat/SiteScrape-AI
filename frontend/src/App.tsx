import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Grid,
} from '@mui/material';
import {
  CloudDownload,
  Language,
  CheckCircle,
  Error as ErrorIcon,
  Autorenew,
  Visibility as PreviewIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { io } from 'socket.io-client';
import LogViewer from './components/LogViewer';
import AIPromptConfig from './components/AIPromptConfig';

interface Job {
  jobId: string;
  url: string;
  status: string;
  progress: number;
  metadata?: {
    title?: string;
    totalAssets?: number;
    totalPages?: number;
  };
  error?: string;
}

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error' | 'ai';
  category: string;
  message: string;
  details?: any;
}

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [promptConfigOpen, setPromptConfigOpen] = useState(false);

  useEffect(() => {
    // Connect to Socket.IO
    const newSocket = io('http://localhost:5000');

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('progress', (data: any) => {
      setCurrentJob((prev) => {
        if (prev && prev.jobId === data.jobId) {
          return { 
            ...prev, 
            status: data.status, 
            progress: data.progress,
            metadata: {
              ...prev.metadata,
              ...data.metadata
            }
          };
        }
        return prev;
      });
    });

    newSocket.on('log', (data: any) => {
      setLogs((prev) => [...prev, {
        ...data,
        timestamp: new Date(data.timestamp)
      }]);
    });

    newSocket.on('error', (data: any) => {
      setError(data.error);
      setLoading(false);
    });

    // Load recent jobs
    loadRecentJobs();

    return () => {
      newSocket.close();
    };
  }, []);

  const loadRecentJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/jobs');
      setRecentJobs(response.data);
    } catch (err) {
      console.error('Failed to load recent jobs:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setLogs([]); // Clear previous logs

    try {
      const response = await axios.post('http://localhost:5000/api/scrape', { url });
      setCurrentJob({
        jobId: response.data.jobId,
        url,
        status: response.data.status,
        progress: 0,
        metadata: {
          totalPages: 0,
          totalAssets: 0
        }
      });
      setUrl('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start scraping');
      setLoading(false);
    }
  };

  const handleDownload = async (jobId: string) => {
    try {
      window.open(`http://localhost:5000/api/download/${jobId}`, '_blank');
    } catch (err) {
      setError('Failed to download theme');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'scraping':
      case 'converting':
      case 'building':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle />;
      case 'failed':
        return <ErrorIcon />;
      default:
        return <Autorenew className="rotating" />;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6, position: 'relative' }}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setPromptConfigOpen(true)}
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              color: 'white',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            AI Config
          </Button>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 700, color: 'white', mb: 2 }}>
            🚀 SiteScape AI
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            AI-Powered Website Scraper & WordPress Theme Converter
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Website URL"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: <Language sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!url || loading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                }}
              >
                {loading ? 'Processing...' : 'Start Conversion'}
              </Button>
            </Stack>
          </form>

          {error && (
            <Alert severity="error" sx={{ mt: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
        </Paper>

        {currentJob && (
          <>
            <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Current Job</Typography>
                  <Chip
                    icon={getStatusIcon(currentJob.status)}
                    label={currentJob.status.toUpperCase()}
                    color={getStatusColor(currentJob.status) as any}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    URL: {currentJob.url}
                  </Typography>
                  {currentJob.metadata?.title && (
                    <Typography variant="body2" color="text.secondary">
                      Title: {currentJob.metadata.title}
                    </Typography>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Pages Found
                        </Typography>
                        <Typography variant="h4">
                          {currentJob.metadata?.totalPages || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Assets Downloaded
                        </Typography>
                        <Typography variant="h4">
                          {currentJob.metadata?.totalAssets || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Progress
                        </Typography>
                        <Typography variant="h4">
                          {currentJob.progress}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Overall Progress</Typography>
                    <Typography variant="body2">{currentJob.progress}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={currentJob.progress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {currentJob.status === 'completed' && (
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<PreviewIcon />}
                      onClick={() => window.open(`http://localhost:5000/api/preview/${currentJob.jobId}`, '_blank')}
                      size="large"
                    >
                      Preview Theme
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CloudDownload />}
                      onClick={() => handleDownload(currentJob.jobId)}
                      size="large"
                      sx={{ flexGrow: 1 }}
                    >
                      Download WordPress Theme
                    </Button>
                  </Stack>
                )}

                {currentJob.error && (
                  <Alert severity="error">{currentJob.error}</Alert>
                )}
              </Stack>
            </Paper>

            {logs.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <LogViewer logs={logs} />
              </Box>
            )}
          </>
        )}

        {recentJobs.length > 0 && (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Jobs
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              {recentJobs.map((job) => (
                <Card key={job.jobId} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" gutterBottom>
                          {job.metadata?.title || job.url}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {job.url}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                          label={job.status}
                          color={getStatusColor(job.status) as any}
                          size="small"
                        />
                        {job.status === 'completed' && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CloudDownload />}
                            onClick={() => handleDownload(job.jobId)}
                          >
                            Download
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        )}
      </Container>

      <AIPromptConfig open={promptConfigOpen} onClose={() => setPromptConfigOpen(false)} />

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating {
          animation: rotate 2s linear infinite;
        }
      `}</style>
    </Box>
  );
};

export default App;
