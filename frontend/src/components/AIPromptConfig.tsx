import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tabs,
  Tab,
  Box,
  Typography,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  RestartAlt as ResetIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const promptTypes = [
  { key: 'websiteAnalysis', label: 'Website Analysis' },
  { key: 'pageDiscovery', label: 'Page Discovery' },
  { key: 'assetAnalysis', label: 'Asset Analysis' },
  { key: 'htmlToReact', label: 'HTML to React' },
  { key: 'elementorOptimization', label: 'Elementor Optimization' },
  { key: 'componentStructure', label: 'Component Structure' },
  { key: 'demoContentExtraction', label: 'Demo Content' },
  { key: 'elementorTemplate', label: 'Elementor Template' },
  { key: 'projectValidation', label: 'Project Validation' }
];

const AIPromptConfig: React.FC<Props> = ({ open, onClose }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (open) {
      loadPrompts();
    }
  }, [open]);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/prompts');
      setPrompts(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load prompts' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (type: string) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/api/prompts/${type}`, {
        prompt: prompts[type]
      });
      setMessage({ type: 'success', text: `Prompt '${type}' saved successfully` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save prompt' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all prompts to defaults? This cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/prompts/reset');
      await loadPrompts();
      setMessage({ type: 'success', text: 'All prompts reset to defaults' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reset prompts' });
    } finally {
      setLoading(false);
    }
  };

  const handlePromptChange = (type: string, value: string) => {
    setPrompts(prev => ({ ...prev, [type]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">🤖 AI Prompt Configuration</Typography>
          <Box>
            <Tooltip title="Reset all to defaults">
              <IconButton onClick={handleReset} disabled={loading}>
                <ResetIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Customize AI prompts for different conversion steps. Use variables like {'{url}'}, {'{html}'}, {'{css}'}, etc.
        </Typography>

        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {promptTypes.map((type, index) => (
            <Tab key={type.key} label={type.label} />
          ))}
        </Tabs>

        {promptTypes.map((type, index) => (
          <TabPanel key={type.key} value={currentTab} index={index}>
            <Typography variant="subtitle2" gutterBottom>
              {type.label} Prompt
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={15}
              value={prompts[type.key] || ''}
              onChange={(e) => handlePromptChange(type.key, e.target.value)}
              disabled={loading}
              variant="outlined"
              sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSave(type.key)}
                disabled={loading}
              >
                Save This Prompt
              </Button>
            </Box>
          </TabPanel>
        ))}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIPromptConfig;
