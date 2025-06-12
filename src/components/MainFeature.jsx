import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, parseISO } from 'date-fns';
import ApperIcon from './ApperIcon';

function MainFeature({
  tasks,
  categories,
  selectionMode,
  selectedTasks,
  onToggleComplete,
  onDeleteTask,
  onToggleSelect,
  getPriorityColor,
  getCategoryColor,
  isOverdue
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
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors cursor-pointer"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          Add Your First Task
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ delay: index * 0.05 }}
            className={`group relative ${task.completed ? 'task-complete-animation' : ''}`}
          >
            <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${getPriorityColor(task.priority)} 
              hover:shadow-md transition-all duration-200 hover:-translate-y-1 
              ${task.completed ? 'opacity-60' : 'opacity-100'}
              ${selectedTasks.has(task.id) ? 'ring-2 ring-primary' : ''}
            `}>
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onToggleComplete(task.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                    ${task.completed 
                      ? 'bg-success border-success text-white' 
                      : 'border-surface-300 hover:border-primary hover:bg-primary/5'
                    }`}
                >
                  {task.completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="animate-bounce-in"
                    >
                      <ApperIcon name="Check" className="w-4 h-4" />
                    </motion.div>
                  )}
                </motion.button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-surface-900 break-words ${
                        task.completed ? 'strikethrough-animation' : ''
                      }`}>
                        {task.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {/* Category Badge */}
                        {task.category && (
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getCategoryColor(task.category) }}
                          >
                            {task.category}
                          </span>
                        )}
                        
                        {/* Priority Indicator */}
                        <span className={`text-xs font-medium uppercase tracking-wide ${
                          task.priority === 'high' ? 'text-danger' :
                          task.priority === 'medium' ? 'text-accent' :
                          'text-success'
                        }`}>
                          {task.priority} priority
                        </span>
                        
                        {/* Due Date */}
                        {task.dueDate && (
                          <div className={`flex items-center gap-1 text-xs ${
                            isOverdue(task.dueDate) ? 'text-danger' :
                            isToday(parseISO(task.dueDate)) ? 'text-accent' :
                            'text-surface-500'
                          }`}>
                            <ApperIcon name="Calendar" className="w-3 h-3" />
                            {isToday(parseISO(task.dueDate)) ? 'Today' : format(parseISO(task.dueDate), 'MMM d')}
                            {isOverdue(task.dueDate) && (
                              <span className="ml-1 text-danger font-medium">Overdue</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {selectionMode ? (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onToggleSelect(task.id)}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors
                            ${selectedTasks.has(task.id) 
                              ? 'bg-primary border-primary text-white' 
                              : 'border-surface-300 hover:border-primary'
                            }`}
                        >
                          {selectedTasks.has(task.id) && (
                            <ApperIcon name="Check" className="w-4 h-4" />
                          )}
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-surface-400 hover:text-danger transition-all duration-200"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default MainFeature;