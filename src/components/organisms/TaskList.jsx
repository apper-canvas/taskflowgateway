import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import TaskItem from '@/components/molecules/TaskItem';
import Button from '@/components/atoms/Button';

function TaskList({
  tasks,
  selectionMode,
  selectedTasks,
  onToggleComplete,
  onDeleteTask,
  onToggleSelect,
  getPriorityColor,
  getCategoryColor,
  isOverdue,
  onAddFirstTaskClick // Added prop to handle click on "Add Your First Task"
}) {
  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-16"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <ApperIcon name="CheckSquare" className="w-20 h-20 text-surface-300 mx-auto mb-6" />
        </motion.div>
        <h3 className="text-xl font-heading font-semibold text-surface-900 mb-2">No tasks yet</h3>
        <p className="text-surface-500 mb-6">Start organizing your day by adding your first task</p>
        <Button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddFirstTaskClick} // Use the new prop
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary cursor-pointer"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          Add Your First Task
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            selectionMode={selectionMode}
            selectedTasks={selectedTasks}
            onToggleComplete={onToggleComplete}
            onDeleteTask={onDeleteTask}
            onToggleSelect={onToggleSelect}
            getPriorityColor={getPriorityColor}
            getCategoryColor={getCategoryColor}
            isOverdue={isOverdue}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default TaskList;