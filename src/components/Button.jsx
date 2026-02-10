import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, style = {} }) => {
  const base = "h-12 px-6 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const styles = {
    primary: "text-white shadow-md hover:opacity-90", 
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
    outline: "border-2 border-gray-100 text-gray-700 bg-white hover:border-gray-300",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-50 shadow-none h-auto p-2",
    float: "fixed bottom-24 left-6 right-6 shadow-xl z-30 text-lg py-4 h-auto"
  };

  return <button onClick={onClick} disabled={disabled} style={style} className={`${base} ${styles[variant]} ${className}`}>{children}</button>;
};

export default Button;
