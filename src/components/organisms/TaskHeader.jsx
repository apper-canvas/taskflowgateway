import ApperIcon from '@/components/ApperIcon';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';

function TaskHeader({
  searchQuery,
  setSearchQuery,
  selectionMode,
  setSelectionMode,
  selectedTasks,
  onBulkComplete,
  onBulkDelete,
  onShowAddForm,
}) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
        <div className="flex gap-2">
          {selectionMode ? (
            <>
              <Button
                onClick={onBulkComplete}
                disabled={selectedTasks.size === 0}
                className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete ({selectedTasks.size})
              </Button>
              <Button
                onClick={onBulkDelete}
                disabled={selectedTasks.size === 0}
                className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete ({selectedTasks.size})
              </Button>
              <Button
                onClick={() => setSelectionMode(false)}
                className="px-4 py-2 bg-surface-200 text-surface-700 rounded-lg hover:bg-surface-300"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setSelectionMode(true)}
                className="px-4 py-2 bg-surface-200 text-surface-700 rounded-lg hover:bg-surface-300"
              >
                Select
              </Button>
              <Button
                onClick={onShowAddForm}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transform hover:scale-105 active:scale-95"
              >
                <ApperIcon name="Plus" className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskHeader;