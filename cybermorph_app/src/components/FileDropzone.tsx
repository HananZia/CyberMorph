import { useCallback, useState } from 'react';
import { Upload, FileCode, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
  acceptedTypes?: string[];
}

const FileDropzone = ({
  onFileSelect,
  isProcessing = false,
  acceptedTypes = ['.exe', '.dll', '.sys', '.scr'],
}: FileDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      setError(`Invalid file type. Accepted: ${acceptedTypes.join(', ')}`);
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size: 10MB');
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && validateFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      <motion.label
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        className={cn(
          `relative flex flex-col items-center justify-center
          min-h-[250px] p-8 cursor-pointer
          border-2 border-dashed transition-all duration-300`,
          isDragging
            ? 'border-primary bg-primary/10 shadow-[0_0_40px_hsl(180_100%_50%/0.3)]'
            : 'border-border hover:border-primary/50 bg-card/50',
          isProcessing && 'pointer-events-none opacity-50'
        )}
      >
        <input
          type="file"
          className="hidden"
          onChange={handleChange}
          accept={acceptedTypes.join(',')}
          disabled={isProcessing}
        />

        <AnimatePresence mode="wait">
          {isDragging ? (
            <motion.div
              key="dragging"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              <Upload className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
              <p className="font-mono text-primary text-lg">Drop file to scan</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              <div className="relative mb-6">
                <FileCode className="w-16 h-16 text-muted-foreground mx-auto" />
                <motion.div
                  className="absolute inset-0 border-2 border-primary/30 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <p className="font-mono text-foreground mb-2">
                Drag & drop PE file to scan
              </p>
              <p className="font-mono text-xs text-muted-foreground mb-4">
                or click to browse
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {acceptedTypes.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-1 text-xs font-mono bg-secondary text-muted-foreground"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corner decorations */}
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
      </motion.label>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/50 text-destructive"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="font-mono text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileDropzone;
