'use client';

import * as React from 'react';
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  name: string;
  size: string;
}

interface FileUploadProps {
  label?: string;
  hint?: string;
  onUpload?: (files: UploadedFile[]) => void;
  className?: string;
}

export function FileUpload({ label, hint, onUpload, className }: FileUploadProps) {
  const [dragging, setDragging] = React.useState(false);
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const mapped = Array.from(fileList).map((f) => ({
      name: f.name,
      size: `${Math.round(f.size / 1024)} KB`,
    }));
    const next = [...files, ...mapped];
    setFiles(next);
    onUpload?.(next);
  };

  return (
    <div className={className}>
      {label && <p className="mb-2 text-sm font-medium">{label}</p>}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors',
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UploadCloud className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-medium">Click to upload or drag and drop</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {hint ?? 'PDF, PNG, JPG up to 10MB'}
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{f.name}</span>
                <span className="text-xs text-muted-foreground">{f.size}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFiles(files.filter((_, idx) => idx !== i));
                }}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
