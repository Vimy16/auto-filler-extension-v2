import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { defaultFields, exportFields, loadFields, parseImportedFields, saveFields } from './lib/storage';
import type { FormField } from './types';

function App() {
  const queryClient = useQueryClient();
  const { data: fields = defaultFields } = useQuery({
    queryKey: ['fields'],
    queryFn: loadFields,
    initialData: defaultFields,
  });

  const [status, setStatus] = useState('Ready');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const timeout = window.setTimeout(() => {
      queryClient.setQueryData(['fields'], fields);
      void saveFields(fields);
      setStatus('Saved');
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [fields, isMounted, queryClient]);

  const syncLabel = useMemo(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return 'Chrome storage enabled';
    }

    return 'Demo mode';
  }, []);

  const updateField = (fieldId: string, key: 'label' | 'value', value: string) => {
    queryClient.setQueryData<FormField[]>(['fields'], (currentFields = defaultFields) =>
      currentFields.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              [key]: value,
            }
          : field,
      ),
    );
  };

  const removeField = (fieldId: string) => {
    queryClient.setQueryData<FormField[]>(['fields'], (currentFields = defaultFields) =>
      currentFields.filter((field) => field.id !== fieldId),
    );
  };

  const addField = () => {
    queryClient.setQueryData<FormField[]>(['fields'], (currentFields = defaultFields) => [
      ...currentFields,
      {
        id: `field-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        label: 'Custom',
        value: '',
        isDefault: false,
      },
    ]);
  };

  const fillCurrentPage = async () => {
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.sendMessage) {
      setStatus('Browser API not available in this context');
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab?.id) {
        setStatus('No active tab found');
        return;
      }

      await chrome.tabs.sendMessage(tab.id, { action: 'fill_forms', data: fields });
      setStatus('Form values sent to the page');
    } catch (error) {
      console.error('Fill current page failed', error);
      setStatus('Could not fill the current page');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const importedFields = parseImportedFields(text);
      queryClient.setQueryData(['fields'], importedFields);
      setStatus('Backup imported successfully');
    } catch (error) {
      console.error(error);
      setStatus('Invalid backup file');
    } finally {
      event.target.value = '';
    }
  };

  const exportCurrentFields = () => {
    exportFields(fields);
    setStatus('Backup downloaded');
  };

  return (
    <Container
      disableGutters
      sx={{ width: '100%', maxWidth: 'none', p: 1, mx: 'auto' }}
    >
      <Card sx={{ p: 1.5, borderRadius: 2, boxShadow: '0 3px 12px rgba(28, 54, 98, 0.08)' }}>
        <Stack spacing={1.25}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Typography
              variant="h5"
              component="h1"
              noWrap
              sx={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}
            >
              Auto-Fill Assistant
            </Typography>
            <Chip
              label={syncLabel}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ flexShrink: 0, fontSize: '0.7rem' }}
            />
          </Stack>

          {fields.map((field) => {
            const isPassword = field.label.toLowerCase().includes('password');

            return (
              <Stack key={field.id} direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  value={field.label}
                  inputProps={{ readOnly: field.isDefault }}
                  onChange={(event) => updateField(field.id, 'label', event.target.value)}
                  sx={{
                    flex: '0 0 30%',
                    minWidth: 0,
                    '& .MuiInputBase-root': {
                      backgroundColor: field.isDefault ? '#e9edf4' : '#f6f8fb',
                    },
                  }}
                />

                <TextField
                  size="small"
                  fullWidth
                  type={isPassword ? 'password' : 'text'}
                  value={field.value}
                  placeholder="Enter value..."
                  onChange={(event) => updateField(field.id, 'value', event.target.value)}
                  sx={{
                    minWidth: 0,
                    '& .MuiInputBase-root': {
                      backgroundColor: '#f6f8fb',
                    },
                  }}
                />

                <IconButton
                  color="inherit"
                  aria-label={`Remove ${field.label}`}
                  onClick={() => removeField(field.id)}
                  disabled={field.isDefault}
                  sx={{
                    flex: '0 0 32px',
                    opacity: field.isDefault ? 0.4 : 1,
                  }}
                >
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </Stack>
            );
          })}

          <Button
            variant="contained"
            color="success"
            startIcon={<AddRoundedIcon />}
            onClick={addField}
            sx={{ minHeight: 44 }}
          >
            Add Custom Field
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AutoFixHighRoundedIcon />}
            onClick={fillCurrentPage}
            sx={{ minHeight: 44 }}
          >
            Fill Current Page
          </Button>

          <Divider />

          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              startIcon={<DownloadRoundedIcon />}
              onClick={exportCurrentFields}
              sx={{ minHeight: 42, fontSize: '0.8rem' }}
            >
              Export Backup
            </Button>

            <Button
              fullWidth
              variant="contained"
              color="inherit"
              component="label"
              startIcon={<UploadRoundedIcon />}
              sx={{
                minHeight: 42,
                backgroundColor: '#dfe6ef',
                color: '#1c2b3a',
                fontSize: '0.8rem',
              }}
            >
              Import Backup
              <input hidden type="file" accept="application/json" onChange={handleImport} />
            </Button>
          </Stack>

          {status && (
            <Alert severity="info" sx={{ borderRadius: 2, py: 0, '& .MuiAlert-message': { py: 0.5 } }}>
              {status}
            </Alert>
          )}
        </Stack>
      </Card>
    </Container>
  );
}

export default App;
