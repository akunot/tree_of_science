/**
 * Componente de loading para descarga de PDFs
 * 
 * ✅ UX: Feedback visual claro del progreso
 * ✅ Accesibilidad: Estados descriptivos y lectores de pantalla
 * ✅ shadcn: Estilo consistente con el resto de la app
 */
import React from 'react';
import { Button } from './button';
import { Progress } from './progress';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Loader2, Download, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const PdfLoadingComponent = ({ 
  isLoading, 
  isProcessing, 
  progress, 
  message, 
  error, 
  onCancel, 
  taskId 
}) => {
  if (!isLoading && !isProcessing && !error) return null;

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (progress >= 100) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (isProcessing) return <Loader2 className="h-4 w-4 animate-spin" />;
    return <Clock className="h-4 w-4" />;
  };

  const getStatusVariant = () => {
    if (error) return 'destructive';
    if (progress >= 100) return 'default';
    if (isProcessing) return 'secondary';
    return 'outline';
  };

  const getProgressColor = () => {
    if (error) return 'bg-destructive';
    if (progress >= 100) return 'bg-green-600';
    return 'bg-primary';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="font-medium">
                {error ? 'Error en descarga' : 'Generando PDF'}
              </span>
              <Badge variant={getStatusVariant()}>
                {error ? 'Fallido' : progress >= 100 ? 'Completado' : 'Procesando'}
              </Badge>
            </div>
            
            {(isProcessing || isLoading) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-8 w-8 p-0"
                aria-label="Cancelar descarga"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress */}
          {!error && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-2"
                // Custom color classes
                style={{
                  '--progress-background': getProgressColor(),
                }}
              />
            </div>
          )}

          {/* Message */}
          <div className="text-sm">
            <p className={error ? 'text-destructive' : 'text-muted-foreground'}>
              {message}
            </p>
            {taskId && !error && (
              <p className="text-xs text-muted-foreground mt-1">
                ID de tarea: {taskId}
              </p>
            )}
          </div>

          {/* Error details */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-destructive">
                {error.message || 'Ocurrió un error inesperado'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2">
            {error && (
              <Button variant="outline" size="sm" onClick={onCancel} className="flex-1">
                Cerrar
              </Button>
            )}
            
            {progress >= 100 && !error && (
              <Button size="sm" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            )}
          </div>

          {/* Accessibility: Screen reader announcements */}
          <div className="sr-only" role="status" aria-live="polite">
            {error 
              ? `Error generando PDF: ${error.message}`
              : `Generando PDF: ${progress}% completado. ${message}`
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente simplificado para inline usage
export const PdfLoadingInline = ({ 
  isLoading, 
  progress, 
  message 
}) => {
  if (!isLoading) return null;

  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{message || 'Generando PDF...'}</span>
      {progress > 0 && (
        <span className="font-medium">({progress}%)</span>
      )}
    </div>
  );
};
