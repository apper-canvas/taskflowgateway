function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-4 py-3 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors ${className}`}
      {...props}
    />
  );
}

export default Input;