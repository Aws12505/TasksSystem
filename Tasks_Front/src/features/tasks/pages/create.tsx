import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTasks } from '../hooks/useTasks';
import ComprehensiveTaskForm from '../components/ComprehensiveTaskForm';
import { ArrowLeft, CheckSquare } from 'lucide-react';

const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sectionId = searchParams.get('section_id');
  const { createTaskComprehensive, isLoading } = useTasks();

  const handleCreateTask = async (data: any) => {
    const task = await createTaskComprehensive(data);
    if (task) {
      navigate(`/tasks/${task.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/tasks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CheckSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">Create Comprehensive Task</h1>
            <p className="text-muted-foreground">Create a task with subtasks and user assignments</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <ComprehensiveTaskForm
          sectionId={sectionId ? parseInt(sectionId) : undefined}
          onSubmit={handleCreateTask}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default CreateTaskPage;
