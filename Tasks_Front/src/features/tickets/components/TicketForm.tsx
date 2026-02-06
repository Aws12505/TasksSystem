// components/TicketForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, X, FileIcon } from "lucide-react";
import type {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  TicketTypeOption,
} from "../../../types/Ticket";
import type { User } from "../../../types/User";
import { toast } from "sonner";

// Validation constants based on Laravel validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/csv",
  "video/mp4",
  "video/x-msvideo",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "pdf",
  "doc",
  "docx",
  "csv",
  "mp4",
  "avi",
  "xlsx",
  "xls",
];

// Dynamic schema for create (requester_name required for guests)
const makeCreateTicketSchema = (requireRequesterName: boolean) =>
  z.object({
    title: z.string().min(1, "Title is required").max(255),
    description: z.string().min(1, "Description is required"),
    type: z.enum(["quick_fix", "bug_investigation", "user_support"]),
    priority: z.enum(["low", "medium", "high", "critical"]),
    assigned_to: z.number().optional(),
    requester_name: requireRequesterName
      ? z.string().min(1, "Your name is required").max(255)
      : z.string().max(255).optional(),
  });

const updateTicketSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["quick_fix", "bug_investigation", "user_support"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["open", "in_progress", "resolved"]).optional(),
  assigned_to: z.number().optional(),
  requester_name: z.string().max(255).optional(),
});

interface TicketFormProps {
  ticket?: Ticket;
  availableUsers?: User[];
  typeOptions: TicketTypeOption[];
  onSubmit: (data: CreateTicketRequest | UpdateTicketRequest) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Helper function to validate file
const validateFile = (file: File): boolean => {
  if (file.size > MAX_FILE_SIZE) {
    toast.error(`File "${file.name}" exceeds 5MB limit`);
    return false;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    toast.error(
      `File "${file.name}" has invalid type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
    );
    return false;
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type) && file.type !== "") {
    toast.error(`File "${file.name}" has invalid MIME type`);
    return false;
  }

  return true;
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Create Form Component
const CreateTicketForm: React.FC<{
  availableUsers: User[];
  typeOptions: TicketTypeOption[];
  onSubmit: (data: CreateTicketRequest) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}> = ({
  availableUsers,
  typeOptions,
  onSubmit,
  isLoading,
  isAuthenticated,
}) => {
  const schema = React.useMemo(
    () => makeCreateTicketSchema(!isAuthenticated),
    [isAuthenticated],
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      type: "quick_fix",
      priority: "medium",
      assigned_to: undefined,
      requester_name: "", // ignored when authenticated
    },
  });

  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    Array.from(files).forEach((file) => {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    });

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  // Handle paste event
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      Array.from(items).forEach((item) => {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file && validateFile(file)) {
            files.push(file);
          }
        }
      });

      if (files.length > 0) {
        setAttachments((prev) => [...prev, ...files]);
        toast.success(`${files.length} file(s) added from clipboard`);
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (data: z.infer<typeof schema>) => {
    const submitData: CreateTicketRequest = {
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      assigned_to: data.assigned_to,
      ...(data.requester_name ? { requester_name: data.requester_name } : {}),
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    await onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter ticket title"
                  {...field}
                  disabled={isLoading}
                  className="bg-background border-input text-foreground"
                />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the issue or request..."
                  {...field}
                  disabled={isLoading}
                  className="bg-background border-input text-foreground"
                  rows={4}
                />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        {/* Guests provide their name */}
        {!isAuthenticated && (
          <FormField
            control={form.control}
            name="requester_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Your name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your name"
                    {...field}
                    disabled={isLoading}
                    className="bg-background border-input text-foreground"
                  />
                </FormControl>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Select ticket type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />
        </div>

        {/* Assign to (only when authenticated) */}
        {isAuthenticated && (
          <FormField
            control={form.control}
            name="assigned_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">
                  Assign to{" "}
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(
                      value === "unassigned" ? undefined : Number(value),
                    )
                  }
                  value={
                    field.value === undefined
                      ? "unassigned"
                      : field.value.toString()
                  }
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Leave unassigned or select a user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unassigned">Leave unassigned</SelectItem>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />
        )}

        {/* Attachments Section */}
        <div className="space-y-4">
          <FormLabel className="text-foreground">
            Attachments{" "}
            <span className="text-xs text-muted-foreground">
              (optional, max 5MB per file)
            </span>
          </FormLabel>

          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-input bg-background"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={isLoading}
            />

            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />

            <div className="space-y-2">
              <p className="text-sm text-foreground">
                Drag and drop files here, or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary hover:underline font-medium"
                  disabled={isLoading}
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-muted-foreground">
                You can also paste files from clipboard (Ctrl+V)
              </p>
              <p className="text-xs text-muted-foreground">
                Supported: {ALLOWED_EXTENSIONS.join(", ")}
              </p>
            </div>
          </div>

          {/* Attached Files List */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Attached Files ({attachments.length})
              </p>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      disabled={isLoading}
                      className="flex-shrink-0 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Ticket
        </Button>
      </form>
    </Form>
  );
};

// Edit Form Component
const EditTicketForm: React.FC<{
  ticket: Ticket;
  availableUsers: User[];
  typeOptions: TicketTypeOption[];
  onSubmit: (data: UpdateTicketRequest) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}> = ({
  ticket,
  availableUsers,
  typeOptions,
  onSubmit,
  isLoading,
  isAuthenticated,
}) => {
  const form = useForm<z.infer<typeof updateTicketSchema>>({
    resolver: zodResolver(updateTicketSchema),
    defaultValues: {
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      priority: ticket.priority,
      status: ticket.status,
      assigned_to: ticket.assigned_to || undefined,
      requester_name: ticket.requester_name || "",
    },
  });

  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = React.useState(
    ticket.attachments || [],
  );
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    Array.from(files).forEach((file) => {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    });

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  // Handle paste event
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      Array.from(items).forEach((item) => {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file && validateFile(file)) {
            files.push(file);
          }
        }
      });

      if (files.length > 0) {
        setAttachments((prev) => [...prev, ...files]);
        toast.success(`${files.length} file(s) added from clipboard`);
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  // Remove new attachment
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing attachment (just from display, backend handles deletion)
  const removeExistingAttachment = (index: number) => {
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (data: z.infer<typeof updateTicketSchema>) => {
    const submitData: UpdateTicketRequest = {
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      status: data.status,
      assigned_to: data.assigned_to,
      requester_name: data.requester_name,
      // Always send attachments (new ones) even if no edits applied
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    await onSubmit(submitData);
  };

  const isExternalRequester = !ticket.requester; // show requester_name for external

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter ticket title"
                  {...field}
                  disabled={isLoading}
                  className="bg-background border-input text-foreground"
                />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the issue or request..."
                  {...field}
                  disabled={isLoading}
                  className="bg-background border-input text-foreground"
                  rows={4}
                />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        {isExternalRequester && (
          <FormField
            control={form.control}
            name="requester_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">
                  Requester Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter requester name"
                    {...field}
                    disabled={isLoading}
                    className="bg-background border-input text-foreground"
                  />
                </FormControl>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Select ticket type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {option.estimatedTime}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />
        </div>

        {/* Assign to (only when authenticated) */}
        {isAuthenticated && (
          <FormField
            control={form.control}
            name="assigned_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">
                  Assign to{" "}
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(
                      value === "unassigned" ? undefined : Number(value),
                    )
                  }
                  value={
                    field.value === undefined
                      ? "unassigned"
                      : field.value.toString()
                  }
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Leave unassigned or select a user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unassigned">Leave unassigned</SelectItem>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />
        )}

        {/* Attachments Section */}
        <div className="space-y-4">
          <FormLabel className="text-foreground">
            Attachments{" "}
            <span className="text-xs text-muted-foreground">
              (optional, max 5MB per file)
            </span>
          </FormLabel>

          {/* Existing Attachments */}
          {existingAttachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Existing Attachments ({existingAttachments.length})
              </p>
              <div className="space-y-2">
                {existingAttachments.map((attachment, index) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {attachment.file_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.file_size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExistingAttachment(index)}
                      disabled={isLoading}
                      className="flex-shrink-0 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-input bg-background"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={isLoading}
            />

            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />

            <div className="space-y-2">
              <p className="text-sm text-foreground">
                Drag and drop files here, or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary hover:underline font-medium"
                  disabled={isLoading}
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-muted-foreground">
                You can also paste files from clipboard (Ctrl+V)
              </p>
              <p className="text-xs text-muted-foreground">
                Supported: {ALLOWED_EXTENSIONS.join(", ")}
              </p>
            </div>
          </div>

          {/* New Attached Files List */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                New Files to Upload ({attachments.length})
              </p>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      disabled={isLoading}
                      className="flex-shrink-0 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Ticket
        </Button>
      </form>
    </Form>
  );
};

// Main wrapper
const TicketForm: React.FC<TicketFormProps> = ({
  ticket,
  availableUsers = [],
  typeOptions,
  onSubmit,
  isLoading,
  isAuthenticated,
}) => {
  if (ticket) {
    return (
      <EditTicketForm
        ticket={ticket}
        availableUsers={availableUsers}
        typeOptions={typeOptions}
        onSubmit={onSubmit as (data: UpdateTicketRequest) => Promise<void>}
        isLoading={isLoading}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  return (
    <CreateTicketForm
      availableUsers={availableUsers}
      typeOptions={typeOptions}
      onSubmit={onSubmit as (data: CreateTicketRequest) => Promise<void>}
      isLoading={isLoading}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default TicketForm;
