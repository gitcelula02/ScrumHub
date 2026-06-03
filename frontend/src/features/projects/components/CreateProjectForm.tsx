import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles, Loader2, Upload, Users, X, Search } from "lucide-react";
import { projectSchema, type ProjectFormValues } from "../types/projectSchema";
import { useProjects } from "../hooks/useProjects";
import { projectsService } from "../services/projectsService";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CreateProjectFormProps {
  className?: string;
  defaultValues?: Partial<ProjectFormValues>;
  folderId?: string;
}

interface SelectedMember {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
}

interface SearchResult {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
}

/**
 * @component CreateProjectForm
 * Feature component for creating a new project.
 * Handles form state, validation, and submission via useProjects hook.
 *
 * @param {string} className - Optional additional CSS classes
 * @param {Partial<ProjectFormValues>} defaultValues - Optional initial values (e.g., from AI assistant)
 * @returns {JSX.Element}
 */
export function CreateProjectForm({ className, defaultValues, folderId }: CreateProjectFormProps) {
  const navigate = useNavigate();
  const { createProject, isLoading: isProjectsLoading } = useProjects();
  const [serverError, setServerError] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      scrumTeam: "",
      color: "#6B5CFF",
      icon: undefined,
      ...defaultValues,
    },
    mode: "onBlur",
  });

  const projectName = form.watch("name");

  const generateKey = (name: string): string => {
    if (!name) return "";
    const cleaned = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10);
    return cleaned || "";
  };

  const computedKey = projectName ? generateKey(projectName) : "";

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 3) return;

    setIsSearching(true);
    try {
      const response = await projectsService.searchUsers(searchQuery);
      const filteredResults = response.data.filter(
        (user) => !selectedMembers.some((m) => m.id === user.id.toString())
      );
      setSearchResults(filteredResults);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addMember = (user: SearchResult) => {
    const member: SelectedMember = {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
    };
    setSelectedMembers((prev) => [...prev, member]);
    setSearchResults((prev) => prev.filter((u) => u.id !== user.id));
    setSearchQuery("");
  };

  const removeMember = (id: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const onSubmit = async (data: ProjectFormValues) => {
    setServerError(null);
    try {
      const payload = {
        ...data,
        key: generateKey(data.name),
        icon: iconFile || undefined,
        scrumTeam: selectedMembers.map((m) => m.id).join(","),
        folder_id: folderId || null,
      };
      const project = await createProject(payload as any);
      form.reset();
      if (!project?.id) {
        console.warn('[CreateProjectForm] created project has no id', project);
      } else {
        navigate({ to: `/app/projects/${project.id}` });
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Failed to create project");
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {serverError && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{serverError}</p>
            </div>
          )}

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter project name"
                      {...field}
                      className="bg-transparent"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    The display name for your project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <label className="text-[13px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Project Key
              </label>
              <div className="flex items-center gap-2 mt-1.5">
                <Input
                  value={computedKey}
                  readOnly
                  disabled
                  placeholder="Auto-generated from name"
                  className="bg-muted font-mono uppercase"
                />
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {computedKey.length}/10
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Auto-generated from project name, used for task IDs
              </p>
            </FormItem>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief project description (optional)"
                      {...field}
                      className="bg-transparent min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="scrumTeam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scrum Team</FormLabel>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-auto py-2 px-3"
                        onClick={() => setTeamModalOpen(true)}
                      >
                        <Users size={16} className="mr-2 text-muted-foreground" />
                        {selectedMembers.length === 0 ? (
                          <span className="text-muted-foreground">Select team members</span>
                        ) : (
                          <span>{selectedMembers.length} member(s) selected</span>
                        )}
                      </Button>
                    </FormControl>
                    <FormDescription className="text-[11px]">
                      Add members to your Scrum team
                    </FormDescription>
                    <FormMessage />

                    <Dialog open={teamModalOpen} onOpenChange={setTeamModalOpen}>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Select Scrum Team Members</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                              />
                              <Input
                                placeholder="Search by email (min 3 chars)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSearch();
                                  }
                                }}
                                className="pl-9 bg-transparent"
                              />
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleSearch}
                              disabled={isSearching || searchQuery.length < 3}
                            >
                              {isSearching ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                "Search"
                              )}
                            </Button>
                          </div>

                          {searchResults.length > 0 && (
                            <div className="border border-panel-border rounded-md max-h-48 overflow-y-auto">
                              {searchResults.map((user) => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => addMember(user)}
                                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-list-hover text-left transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-full bg-sidebar-bg border border-panel-border flex items-center justify-center text-xs font-semibold">
                                    {user.avatar_url ? (
                                      <img
                                        src={user.avatar_url}
                                        alt={user.username}
                                        className="w-full h-full rounded-full object-cover"
                                      />
                                    ) : (
                                      user.username.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {user.username}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {user.email}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {searchQuery.length >= 3 && searchResults.length === 0 && !isSearching && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No users found matching "{searchQuery}"
                            </p>
                          )}

                          {selectedMembers.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {selectedMembers.map((member) => (
                                <div
                                  key={member.id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-sidebar-bg border border-panel-border text-sm"
                                >
                                  <div className="w-5 h-5 rounded-full bg-status-bar text-status-bar-fg flex items-center justify-center text-[10px] font-semibold">
                                    {member.avatar_url ? (
                                      <img
                                        src={member.avatar_url}
                                        alt={member.username}
                                        className="w-full h-full rounded-full object-cover"
                                      />
                                    ) : (
                                      member.username.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                  <span className="text-xs">{member.username}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeMember(member.id)}
                                    className="w-4 h-4 flex items-center justify-center rounded hover:bg-list-hover"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          {...field}
                          value={field.value ?? "#6B5CFF"}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-9 w-12 cursor-pointer rounded-md border border-input p-0.5"
                          style={{ padding: 0 }}
                        />
                        <Input
                          placeholder="#6B5CFF"
                          {...field}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          className="bg-transparent flex-1 font-mono"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <label className="text-[13px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Project Icon
              </label>
              <div className="border border-input rounded-md p-4 mt-1.5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-sidebar-bg rounded-md flex items-center justify-center border border-panel-border overflow-hidden">
                    {iconFile ? (
                      <img
                        src={URL.createObjectURL(iconFile)}
                        alt="Project icon preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload size={24} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setIconFile(file);
                      }}
                      className="hidden"
                      id="icon-upload"
                    />
                    <label
                      htmlFor="icon-upload"
                      className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-input bg-transparent text-sm cursor-pointer hover:bg-list-hover transition-colors"
                    >
                      <Upload size={16} />
                      {iconFile ? "Change Icon" : "Upload Icon"}
                    </label>
                    {iconFile && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {iconFile.name}
                      </span>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">
                      PNG, JPG or SVG. Max 2MB.
                    </p>
                  </div>
                </div>
              </div>
            </FormItem>
          </div>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting || isProjectsLoading}
            className="w-full"
          >
            {form.formState.isSubmitting || isProjectsLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Project...
              </>
            ) : (
              <>
                Create Project
                <Sparkles className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}