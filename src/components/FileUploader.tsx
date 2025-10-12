import { useCallback, useEffect, useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import Dropzone, { type DropzoneProps, type FileRejection } from "react-dropzone";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FileUploaderProps {
  /**
   * Value of the uploader.
   */
  value?: File[];

  /**
   * Function to be called when the value changes.
   */
  onValueChange?: (files: File[]) => void;

  /**
   * Function to be called when files are uploaded.
   */
  onUpload?: (files: File[]) => Promise<void>;

  /**
   * Accepted file types for the uploader.
   */
  accept?: DropzoneProps["accept"];

  /**
   * Maximum file size for the uploader.
   */
  maxSize?: DropzoneProps["maxSize"];

  /**
   * Maximum number of files for the uploader.
   */
  maxFileCount?: DropzoneProps["maxFiles"];

  /**
   * Whether the uploader should accept multiple files.
   */
  multiple?: boolean;

  /**
   * Whether the uploader is disabled.
   */
  disabled?: boolean;

  className?: string;
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function FileUploader({
  value,
  onValueChange,
  onUpload,
  accept = { "text/csv": [] },
  maxSize = 4 * 1024 * 1024,
  maxFileCount = 1,
  multiple = false,
  disabled = false,
  className,
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>(value || []);

  useEffect(() => {
    if (value) {
      setFiles(value);
    }
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && maxFileCount === 1 && acceptedFiles.length > 1) {
        toast.error("Cannot upload more than 1 file at a time");
        return;
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFileCount) {
        toast.error(`Cannot upload more than ${maxFileCount} files`);
        return;
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      const updatedFiles = files ? [...files, ...newFiles] : newFiles;

      setFiles(updatedFiles);
      onValueChange?.(updatedFiles);

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(`File ${file.name} was rejected`);
        });
      }

      if (onUpload && updatedFiles.length > 0 && updatedFiles.length <= maxFileCount) {
        const target = updatedFiles.length > 1 ? `${updatedFiles.length} files` : `file`;

        toast.promise(onUpload(updatedFiles), {
          loading: `Uploading ${target}...`,
          success: () => {
            setFiles([]);
            return `${target} uploaded`;
          },
          error: `Failed to upload ${target}`,
        });
      }
    },
    [files, maxFileCount, multiple, onUpload, onValueChange]
  );

  function onRemove(index: number) {
    if (!files) return;
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onValueChange?.(newFiles);
  }

  useEffect(() => {
    return () => {
      if (!files) return;
      files.forEach((file) => {
        if ("preview" in file && typeof (file as any).preview === "string") {
          URL.revokeObjectURL((file as any).preview);
        }
      });
    };
  }, []);

  const isDisabled = disabled || (files?.length ?? 0) >= maxFileCount;

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden">
      <Dropzone
        onDrop={onDrop}
        accept={accept}
        maxSize={maxSize}
        maxFiles={maxFileCount}
        multiple={maxFileCount > 1 || multiple}
        disabled={isDisabled}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              "group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
              "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isDragActive && "border-muted-foreground/50",
              isDisabled && "pointer-events-none opacity-60",
              className
            )}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <Upload className="size-7 text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="font-medium text-muted-foreground">Drop the files here</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <Upload className="size-7 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-px">
                  <p className="font-medium text-muted-foreground">
                    Arraste e solte arquivos aqui, ou clique para selecionar
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    Você pode fazer upload de
                    {maxFileCount > 1
                      ? ` ${maxFileCount === Infinity ? "múltiplos" : maxFileCount} arquivos (até ${formatBytes(maxSize)} cada)`
                      : ` um arquivo com ${formatBytes(maxSize)}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Dropzone>
      {files?.length ? (
        <ScrollArea className="h-fit w-full px-3">
          <div className="flex max-h-48 flex-col gap-4">
            {files?.map((file, index) => (
              <FileCard key={index} file={file} onRemove={() => onRemove(index)} />
            ))}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  );
}

interface FileCardProps {
  file: File;
  onRemove: () => void;
}

function FileCard({ file, onRemove }: FileCardProps) {
  return (
    <div className="relative flex items-center gap-2.5">
      <div className="flex flex-1 gap-2.5">
        <FileText className="size-10 text-muted-foreground" aria-hidden="true" />
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-col gap-px">
            <p className="line-clamp-1 text-sm font-medium text-foreground/80">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="icon" className="size-7" onClick={onRemove}>
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">Remove file</span>
        </Button>
      </div>
    </div>
  );
}

