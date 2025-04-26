// frontend/src/components/common/Button.jsx
import React from 'react';

// Define base styles and variants
const baseStyles = "inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50";

const variants = {
  primary: "text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
  secondary: "text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500",
  danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
  outline: "text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-indigo-500",
  ghost: "text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-indigo-500 border-transparent shadow-none",
};

const sizes = {
   sm: "px-2.5 py-1.5 text-xs rounded",
   md: "px-4 py-2 text-sm rounded-md", // Default size applied by baseStyles potentially
   lg: "px-6 py-3 text-base rounded-md",
};

function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // Default variant
  size = 'md',        // Default size
  disabled = false,
  className = '',     // Allow passing extra custom classes
  ...props          // Pass any other props like aria-label, etc.
}) {
  // Combine base styles, variant styles, size styles, and any custom classes
  const combinedClassName = `
    ${baseStyles}
    ${variants[variant] || variants.primary}
    ${sizes[size] || ''}
    ${className}
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName.trim()} // Trim whitespace
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;