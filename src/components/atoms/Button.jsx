import { motion } from 'framer-motion';

function Button({ children, className = '', onClick, type = 'button', disabled, ...props }) {
  // Filter out any non-standard HTML props before passing to the DOM element
  const filteredProps = { ...props };
  delete filteredProps.whileHover;
  delete filteredProps.whileTap;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`transition-colors duration-200 ${className}`}
      {...props} // Pass motion props like whileHover/whileTap directly if they exist
      {...filteredProps} // Pass other standard props
    >
      {children}
    </motion.button>
  );
}

export default Button;