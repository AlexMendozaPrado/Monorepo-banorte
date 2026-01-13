'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Refresh as RefreshIcon,
  ChatBubbleOutline as ChatIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Rule as RuleIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNotification } from '@/hooks/useNotification';
import { useBusinessRules } from '@/hooks/useBusinessRules';
import { useConversation } from '@/hooks/useConversation';
import { useNavigation } from '@/hooks/useNavigation';
import { useGlobalNotifications } from '@/contexts/NotificationsContext';
import authService from '@/services/authService';
import { rulesService } from '@/services/api';

export default function DashboardPage() {
  const [promptText, setPromptText] = useState('');
  const [conversationMode, setConversationMode] = useState(false);
  const [conversationMessage, setConversationMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [isFileGenerating, setIsFileGenerating] = useState(false);

  const { showSuccess, showError, showWarning } = useNotification();
  const { addNotification } = useGlobalNotifications();
  const { goToLogin, goToReglas } = useNavigation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const conversationScrollRef = useRef<HTMLDivElement>(null);
  const lastErrorRef = useRef<string | null>(null);

  // Business rules hook
  const {
    isLoading,
    isGenerating,
    currentRule,
    aiResponse,
    error,
    movements,
    generateRule,
    loadMovements,
  } = useBusinessRules(authService.getCurrentUser()?.id);

  // Conversation hook
  const {
    isConversationActive,
    isProcessing,
    conversationHistory,
    isReadyToGenerate,
    startConversation,
    continueConversation,
    resetConversation,
    getConversationSummary,
  } = useConversation();

  // Load movements on mount
  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      goToLogin();
    }
  }, [goToLogin]);

  // Auto-scroll conversation
  useEffect(() => {
    if (conversationScrollRef.current && conversationHistory.length > 0) {
      const scrollElement = conversationScrollRef.current;
      setTimeout(() => {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }, 100);
    }
  }, [conversationHistory]);

  const handleToggleConversationMode = () => {
    if (conversationMode) {
      resetConversation();
      setConversationMessage('');
    }
    setConversationMode(!conversationMode);
  };

  const handleStartConversation = async () => {
    if (!promptText.trim()) {
      showWarning('Escribe una descripción inicial de la regla que necesitas');
      return;
    }

    try {
      await startConversation(promptText.trim());
      showSuccess('¡Conversación iniciada con Gemini!');
    } catch (err) {
      console.error('Error starting conversation:', err);
      showError('Error al iniciar conversación. Intenta nuevamente.');
    }
  };

  const handleContinueConversation = async () => {
    if (!conversationMessage.trim()) {
      showWarning('Escribe una respuesta para continuar la conversación');
      return;
    }

    try {
      await continueConversation(conversationMessage.trim());
      setConversationMessage('');
    } catch (err) {
      console.error('Error continuing conversation:', err);
      showError('Error en la conversación. Intenta nuevamente.');
    }
  };

  const handleGenerateFromConversation = async () => {
    if (!isReadyToGenerate) {
      showWarning('La conversación aún no está lista para generar la regla');
      return;
    }

    try {
      const summary = getConversationSummary();
      const finalPrompt = `${summary?.summary || ''}\n\nDetalles adicionales de la conversación:\n${conversationHistory
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join('\n')}`;

      // Si hay archivo TXT/XML, usar mapeo
      if (selectedFile) {
        const name = selectedFile.name.toLowerCase();
        const isTxt = name.endsWith('.txt');
        const isXml = name.endsWith('.xml');
        if (isTxt || isXml) {
          const user = authService.getCurrentUser?.();
          if (!user?.id) {
            showError('No hay usuario autenticado. Inicia sesión nuevamente.');
            return goToLogin();
          }
          const fileContent = await selectedFile.text();
          const fileType = isXml ? 'xml' : 'txt';
          await rulesService.generateMappedRule({
            usuario_id: user.id,
            descripcion: summary?.summary || 'Mapeo generado desde conversación con IA',
            fileContent,
            fileType,
            fileName: selectedFile.name
          });

          addNotification({
            type: 'success',
            title: 'Regla Creada',
            message: `Mapeo generado y guardado desde conversación (${selectedFile.name})`
          });
          showSuccess('¡Mapeo generado y guardado exitosamente!');

          await loadMovements();
          resetConversation();
          setConversationMode(false);
          setPromptText('');
          setSelectedFile(null);
          return goToReglas();
        }
      }

      // Fallback: generación tradicional
      await generateRule({
        prompt_texto: finalPrompt,
        archivo: null,
        descripcion: summary?.summary || 'Regla generada desde conversación con IA'
      });

      addNotification({
        type: 'success',
        title: 'Regla Creada',
        message: 'Nueva regla de negocio generada desde conversación con IA'
      });

      showSuccess('¡Regla de negocio generada exitosamente!');
      resetConversation();
      setConversationMode(false);
      setPromptText('');
      setSelectedFile(null);
    } catch (err) {
      console.error('Error generating rule from conversation:', err);
      addNotification({
        type: 'error',
        title: 'Error en Generación',
        message: 'No se pudo generar la regla de negocio. Intenta nuevamente.'
      });
      showError('Error al generar la regla. Intenta nuevamente.');
    }
  };

  const handlePromptSubmit = async () => {
    if (!promptText.trim() && !selectedFile) {
      showWarning('Escribe un prompt o sube un archivo para generar una regla');
      return;
    }

    if (conversationMode) {
      return handleStartConversation();
    }

    try {
      setIsFileGenerating(true);
      if (selectedFile) {
        const name = selectedFile.name.toLowerCase();
        const isTxt = name.endsWith('.txt');
        const isXml = name.endsWith('.xml');
        if (isTxt || isXml) {
          const user = authService.getCurrentUser?.();
          if (!user?.id) {
            showError('No hay usuario autenticado. Inicia sesión nuevamente.');
            setIsFileGenerating(false);
            return goToLogin();
          }

          const fileContent = await selectedFile.text();
          const fileType = isXml ? 'xml' : 'txt';
          try {
            await rulesService.generateMappedRule({
              usuario_id: user.id,
              descripcion: promptText.trim() || `Mapeo desde ${selectedFile.name}`,
              fileContent,
              fileType,
              fileName: selectedFile.name
            });
            addNotification({
              type: 'success',
              title: 'Regla Creada',
              message: `Mapeo generado y guardado desde ${selectedFile.name}`
            });
            showSuccess('¡Mapeo generado y guardado exitosamente!');
            await loadMovements();
            setPromptText('');
            setSelectedFile(null);
            setIsFileGenerating(false);
            return goToReglas();
          } catch (err) {
            showError('Error al generar la regla. Intenta nuevamente.');
            setIsFileGenerating(false);
            return;
          }
        }
      }

      await generateRule({
        prompt_texto: promptText.trim(),
        archivo: null,
        descripcion: promptText.trim() || 'Regla generada desde prompt'
      });
      addNotification({
        type: 'success',
        title: 'Regla Creada',
        message: `Nueva regla de negocio generada: ${promptText.trim() || 'desde prompt'}`
      });
      showSuccess('¡Regla de negocio generada exitosamente!');
      setPromptText('');
      setSelectedFile(null);
      setIsFileGenerating(false);
    } catch (err) {
      console.error('Error generating rule:', err);
      addNotification({
        type: 'error',
        title: 'Error en Generación',
        message: 'No se pudo generar la regla de negocio. Intenta nuevamente.'
      });
      showError('Error al generar la regla. Intenta nuevamente.');
    }
  };

  // MIME types permitidos
  const ALLOWED_MIME_TYPES: Record<string, string[]> = {
    '.txt': ['text/plain'],
    '.xml': ['text/xml', 'application/xml'],
    '.csv': ['text/csv', 'application/csv'],
    '.json': ['application/json', 'text/json']
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const fileName = file.name.toLowerCase();
    const extension = '.' + fileName.split('.').pop();

    // Validar extensión
    const allowedExtensions = Object.keys(ALLOWED_MIME_TYPES);
    if (!allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Extensión no permitida. Solo se aceptan: ${allowedExtensions.join(', ')}`
      };
    }

    // Validar MIME type
    const allowedMimes = ALLOWED_MIME_TYPES[extension];
    if (file.type && !allowedMimes.includes(file.type) && file.type !== '') {
      // Algunos navegadores no reportan MIME type, permitir si está vacío
      console.warn(`MIME type ${file.type} no coincide con esperado para ${extension}`);
    }

    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'El archivo no puede ser mayor a 10MB' };
    }

    return { valid: true };
  };

  const showUniqueError = (message: string) => {
    if (lastErrorRef.current !== message) {
      lastErrorRef.current = message;
      showError(message);
      // Reset después de 3 segundos para permitir el mismo error de nuevo
      setTimeout(() => {
        lastErrorRef.current = null;
      }, 3000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        showUniqueError(validation.error || 'Archivo no válido');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        // Limitar preview a primeros 1000 caracteres
        setFilePreview(content.substring(0, 1000) + (content.length > 1000 ? '\n... (contenido truncado)' : ''));
      };
      reader.onerror = () => {
        showUniqueError('Error al leer el archivo');
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        showUniqueError(validation.error || 'Archivo no válido');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFilePreview(content.substring(0, 1000) + (content.length > 1000 ? '\n... (contenido truncado)' : ''));
      };
      reader.onerror = () => {
        showUniqueError('Error al leer el archivo');
      };
      reader.readAsText(file);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#333', mb: 4 }}>
        Generador de Reglas de Negocio
      </Typography>

      {/* AI Response Display */}
      {(currentRule || aiResponse) && (
        <Card sx={{ mb: 4, border: '2px solid #4CAF50', borderRadius: '12px', overflow: 'hidden' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
                Regla Generada Exitosamente
              </Typography>
            </Box>

            <Alert severity="success" sx={{ mb: 3 }}>
              La regla de negocio ha sido generada y guardada. Puedes verla en la sección de Reglas.
            </Alert>

            {currentRule && (
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <RuleIcon sx={{ color: '#EB0029' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {currentRule.id_display || `Regla #${currentRule.id_regla}`}
                    </Typography>
                    {currentRule.estado && (
                      <Chip
                        label={currentRule.estado}
                        size="small"
                        color={currentRule.estado.toLowerCase() === 'activa' ? 'success' : 'default'}
                      />
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {currentRule.descripcion && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                          Descripción:
                        </Typography>
                        <Typography variant="body2">{currentRule.descripcion}</Typography>
                      </Box>
                    )}

                    {currentRule.regla_generada && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666', mb: 1 }}>
                          Regla Generada por IA:
                        </Typography>
                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                          <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                            {typeof currentRule.regla_generada === 'string'
                              ? currentRule.regla_generada
                              : JSON.stringify(currentRule.regla_generada, null, 2)}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    <Divider />

                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => goToReglas()}
                        startIcon={<VisibilityIcon />}
                        sx={{ bgcolor: '#EB0029', '&:hover': { bgcolor: '#d4002a' } }}
                      >
                        Ver en Reglas
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setPromptText('');
                          setSelectedFile(null);
                          setFilePreview('');
                        }}
                        sx={{ borderColor: '#EB0029', color: '#EB0029' }}
                      >
                        Generar Otra Regla
                      </Button>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {aiResponse && !currentRule && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Respuesta de IA:
                </Typography>
                <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, maxHeight: 300, overflow: 'auto' }}>
                  <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                    {typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse, null, 2)}
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 4 }}>
        {/* AI Generator Card */}
        <Card sx={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                {isConversationActive ? 'Conversación con Gemini' : 'Generar Nueva Regla'}
              </Typography>
              <Button
                size="small"
                variant={conversationMode ? 'contained' : 'outlined'}
                onClick={handleToggleConversationMode}
                startIcon={<ChatIcon />}
                sx={{
                  color: conversationMode ? 'white' : '#EB0029',
                  bgcolor: conversationMode ? '#EB0029' : 'transparent',
                  borderColor: '#EB0029',
                  '&:hover': {
                    bgcolor: conversationMode ? '#d4002a' : 'rgba(235, 0, 41, 0.04)',
                    borderColor: '#EB0029'
                  }
                }}
              >
                {conversationMode ? 'Modo Activo' : 'Modo Conversación'}
              </Button>
            </Box>

            {/* Conversation Area */}
            {isConversationActive ? (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
                {/* Conversation History */}
                <Box
                  ref={conversationScrollRef}
                  sx={{
                    flex: 1,
                    overflow: 'auto',
                    mb: 3,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    p: 2,
                    backgroundColor: '#f5f5f5',
                    maxHeight: '400px',
                    '&::-webkit-scrollbar': { width: '8px' },
                    '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1', borderRadius: '4px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '4px' }
                  }}
                >
                  {conversationHistory.length === 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '200px' }}>
                      <Box sx={{ textAlign: 'center', p: 3, backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <Typography variant="h6" sx={{ color: '#333', mb: 1 }}>Conversación Iniciada</Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Gemini te hará preguntas específicas para crear la regla perfecta
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {conversationHistory.map((message, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 2,
                        display: 'flex',
                        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                        width: '100%'
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '80%',
                          p: 2,
                          borderRadius: '12px',
                          backgroundColor: message.role === 'user' ? '#EB0029' : 'white',
                          color: message.role === 'user' ? 'white' : '#333',
                          boxShadow: message.role === 'user' ? '0 2px 8px rgba(235, 0, 41, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                          border: message.role === 'assistant' ? '1px solid #e0e0e0' : 'none'
                        }}
                      >
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {message.content}
                        </Typography>
                        {message.role === 'assistant' && message.data?.questions && message.data.questions.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, opacity: 0.8 }}>
                              Preguntas específicas:
                            </Typography>
                            {message.data.questions.map((question: string, qIndex: number) => (
                              <Typography key={qIndex} variant="body2" sx={{ mb: 0.5, opacity: 0.9 }}>
                                • {question}
                              </Typography>
                            ))}
                          </Box>
                        )}
                        {message.role === 'assistant' && message.data?.confidence_level && (
                          <Chip
                            label={`Confianza: ${message.data.confidence_level}`}
                            size="small"
                            sx={{
                              mt: 1,
                              backgroundColor:
                                message.data.confidence_level === 'alta'
                                  ? '#4CAF50'
                                  : message.data.confidence_level === 'media'
                                  ? '#FF9800'
                                  : '#f44336',
                              color: 'white',
                              fontSize: '10px'
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  ))}

                  {isProcessing && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                      <Box sx={{ maxWidth: '80%', p: 2, borderRadius: '12px', backgroundColor: 'white', border: '1px solid #e0e0e0' }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Gemini está procesando...
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Conversation Input */}
                {conversationHistory.length > 0 && (
                  <Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={conversationMessage}
                      onChange={(e) => setConversationMessage(e.target.value)}
                      placeholder="Responde a Gemini..."
                      disabled={isProcessing}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleContinueConversation}
                        disabled={isProcessing || !conversationMessage.trim()}
                        sx={{ bgcolor: '#EB0029', '&:hover': { bgcolor: '#d4002a' } }}
                      >
                        Enviar Respuesta
                      </Button>
                      {isReadyToGenerate && (
                        <Button
                          variant="outlined"
                          onClick={handleGenerateFromConversation}
                          disabled={isProcessing}
                          sx={{ borderColor: '#EB0029', color: '#EB0029' }}
                        >
                          Generar Regla
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              /* Normal Generation Mode */
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Describe la regla de negocio que necesitas..."
                  disabled={isGenerating || isFileGenerating}
                  sx={{ mb: 3 }}
                />

                {/* File Upload Area */}
                <Box
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  sx={{
                    border: `2px dashed ${dragOver ? '#EB0029' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: dragOver ? '#fff5f5' : '#fafafa',
                    cursor: 'pointer',
                    mb: 3
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.xml,.csv,.json"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#EB0029', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {selectedFile ? selectedFile.name : 'Arrastra un archivo TXT, XML, CSV o JSON'}
                  </Typography>
                  {selectedFile && (
                    <Typography variant="caption" sx={{ color: '#999', mt: 0.5, display: 'block' }}>
                      Tamaño: {(selectedFile.size / 1024).toFixed(1)} KB | Tipo: {selectedFile.type || 'desconocido'}
                    </Typography>
                  )}
                </Box>

                {/* File Preview */}
                {filePreview && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                        Vista previa del contenido:
                      </Typography>
                      <IconButton size="small" onClick={() => { setSelectedFile(null); setFilePreview(''); }}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ maxHeight: 150, overflow: 'auto', bgcolor: '#fff', p: 1, borderRadius: 1 }}>
                      <Typography component="pre" sx={{ fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', m: 0 }}>
                        {filePreview}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {(isGenerating || isFileGenerating) && <LinearProgress sx={{ mb: 2 }} />}

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlePromptSubmit}
                  disabled={isGenerating || isFileGenerating}
                  startIcon={<SendIcon />}
                  sx={{
                    bgcolor: '#EB0029',
                    py: 1.5,
                    '&:hover': { bgcolor: '#d4002a' },
                    '&:disabled': { bgcolor: '#ccc' }
                  }}
                >
                  {isGenerating || isFileGenerating ? 'Generando...' : conversationMode ? 'Iniciar Conversación' : 'Generar Regla'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Recent Movements Card */}
        <Card sx={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                Movimientos Recientes
              </Typography>
              <IconButton size="small" onClick={loadMovements}>
                <RefreshIcon />
              </IconButton>
            </Box>
            {isLoading ? (
              <Typography variant="body2" color="textSecondary">
                Cargando movimientos...
              </Typography>
            ) : movements.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No hay movimientos recientes
              </Typography>
            ) : (
              movements.slice(0, 5).map((movement: any) => (
                <Box key={movement.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {movement.descripcion || 'Sin descripción'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(movement.fecha_creacion).toLocaleDateString()}
                  </Typography>
                </Box>
              ))
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
