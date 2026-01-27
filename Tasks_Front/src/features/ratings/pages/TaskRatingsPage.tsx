// pages/TaskRatingsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Star, ArrowLeft, Users, Weight } from "lucide-react";
import { useTaskRating } from "../hooks/useTaskRating";
import TaskRatingForm from "../components/TaskRatingForm";
import RatingDisplay from "../components/RatingDisplay";
import { useRatingConfigs } from "@/features/rating-configs/hooks/useRatingConfigs";
import type { RatingConfig } from "../../../types/RatingConfig";

// ✅ uses your existing tasks hook/store
import { useTask } from "@/features/tasks/hooks/useTask";

const TaskRatingsPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();

  if (!taskId) return <div>Task not found</div>;

  // ✅ fetch task + assignments
  const {
    task,
    taskWithAssignments,
    isLoading: isTaskLoading,
  } = useTask(taskId);

  // ✅ set browser tab title
  useEffect(() => {
    document.title = task?.name
      ? `Task Ratings — ${task.name}`
      : "Task Ratings";
  }, [task?.name]);

  const {
    taskRatings,
    pagination,
    isLoading: isRatingsLoading,
    createRating,
    goToPage,
    nextPage,
    prevPage,
  } = useTaskRating(taskId);

  const {
    ratingConfigs,
    isLoading: isConfigsLoading,
    error: configsError,
    fetchActiveRatingConfigsByType,
  } = useRatingConfigs();

  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);

  useEffect(() => {
    fetchActiveRatingConfigsByType("task_rating");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, fetchActiveRatingConfigsByType]);

  const activeConfigs: RatingConfig[] = useMemo(
    () => ratingConfigs,
    [ratingConfigs],
  );

  useEffect(() => {
    if (activeConfigs?.length)
      setSelectedConfigId((prev) => prev ?? activeConfigs[0].id);
    else setSelectedConfigId(null);
  }, [activeConfigs]);

  const activeConfig = useMemo(
    () => activeConfigs.find((c) => c.id === selectedConfigId) ?? null,
    [activeConfigs, selectedConfigId],
  );

  const handleCreateRating = async (data: any) => {
    await createRating(data);
  };

  const generatePaginationItems = () => {
    if (!pagination) return [];
    const items: (number | "ellipsis-start" | "ellipsis-end")[] = [];
    const { current_page, last_page } = pagination;

    if (current_page > 3) {
      items.push(1);
      if (current_page > 4) items.push("ellipsis-start");
    }
    for (
      let i = Math.max(1, current_page - 2);
      i <= Math.min(last_page, current_page + 2);
      i++
    ) {
      items.push(i);
    }
    if (current_page < last_page - 2) {
      if (current_page < last_page - 3) items.push("ellipsis-end");
      items.push(last_page);
    }
    return items;
  };

  // ✅ assignments shape: (User & { pivot: TaskUserPivot })[]
  const assignments = taskWithAssignments?.assigned_users ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-foreground font-sans truncate">
                Task Ratings{task?.name ? ` — ${task.name}` : ""}
              </h1>
              <p className="text-muted-foreground">
                Rate task performance and quality
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/tasks/${taskId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Task
              </Link>
            </Button>
          </div>
        </div>

        {/* ✅ Task info summary */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 min-w-0">
                <p className="text-sm text-muted-foreground">Task</p>
                <p className="font-medium truncate">
                  {isTaskLoading ? "Loading…" : (task?.name ?? "—")}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Weight className="h-4 w-4" />
                  Weight
                </p>
                <p className="font-medium">
                  {isTaskLoading ? "Loading…" : (task?.weight ?? "—")}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Assigned Users
                </p>

                {isTaskLoading ? (
                  <div className="h-10 bg-muted animate-pulse rounded-lg" />
                ) : assignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No assigned users
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      {assignments.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="truncate">
                            {u.name ?? u.email ?? `User #${u.id}`}
                          </span>
                          <span className="text-muted-foreground">
                            {u.pivot?.percentage ?? 0}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main grid (2-up cadence like other pages) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: rating form + config chooser */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">
                      Active Config
                    </p>
                    <p className="text-base font-medium truncate">
                      {activeConfig
                        ? activeConfig.name
                        : isConfigsLoading
                          ? "Loading…"
                          : "—"}
                    </p>
                  </div>

                  <div className="w-64">
                    <Select
                      disabled={isConfigsLoading || activeConfigs.length === 0}
                      value={selectedConfigId?.toString() ?? undefined}
                      onValueChange={(v) => setSelectedConfigId(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isConfigsLoading
                              ? "Loading configs…"
                              : "Choose config"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {activeConfigs.map((cfg) => (
                          <SelectItem key={cfg.id} value={cfg.id.toString()}>
                            {cfg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {configsError && (
                  <p className="mt-2 text-sm text-destructive">
                    {String(configsError)}
                  </p>
                )}
              </CardContent>
            </Card>

            {isConfigsLoading ? (
              <div className="h-72 bg-muted animate-pulse rounded-lg" />
            ) : activeConfigs.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    No active task rating configuration found
                  </p>
                </CardContent>
              </Card>
            ) : activeConfig ? (
              <TaskRatingForm
                taskId={parseInt(taskId)}
                config={activeConfig}
                onSubmit={handleCreateRating}
                isLoading={isRatingsLoading}
              />
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Select a configuration to start rating
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: existing ratings + pagination */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Previous Ratings
            </h2>

            {isRatingsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-muted animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : taskRatings.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    No ratings yet for this task
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {taskRatings.map((rating) => (
                    <RatingDisplay key={rating.id} rating={rating} />
                  ))}
                </div>

                {pagination && pagination.last_page > 1 && (
                  <Card className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Showing {pagination.from || 0} to {pagination.to || 0}{" "}
                          of {pagination.total} results
                        </div>

                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={prevPage}
                                className={
                                  pagination.current_page === 1
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                                }
                              />
                            </PaginationItem>

                            {generatePaginationItems().map((item, index) => (
                              <PaginationItem key={index}>
                                {item === "ellipsis-start" ||
                                item === "ellipsis-end" ? (
                                  <PaginationEllipsis />
                                ) : (
                                  <PaginationLink
                                    onClick={() => goToPage(item as number)}
                                    isActive={pagination.current_page === item}
                                    className="cursor-pointer"
                                  >
                                    {item}
                                  </PaginationLink>
                                )}
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext
                                onClick={nextPage}
                                className={
                                  pagination.current_page ===
                                  pagination.last_page
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskRatingsPage;
