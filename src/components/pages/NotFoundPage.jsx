import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, delay: 1 }}
        >
          <ApperIcon name="FileQuestion" className="w-24 h-24 text-surface-300 mx-auto mb-6" />
        </motion.div>
        <h1 className="text-4xl font-heading font-bold text-surface-900 mb-4">Page Not Found</h1>
        <p className="text-surface-600 mb-8 max-w-md">
          The page you're looking for doesn't exist. Let's get you back to your tasks.
        </p>
        <Button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary"
        >
          Back to Tasks
        </Button>
      </motion.div>
    </div>
  );
}

export default NotFoundPage;