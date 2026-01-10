import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled, 
  className = '', 
  icon: Icon,
  type = 'button',
  fullWidth = false
}) => {
  const baseStyles = 'font-semibold transition-all duration-200 flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl rounded-lg',
    secondary: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg',
    outline: 'border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg',
    ghost: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl rounded-lg',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl rounded-lg'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export const Card = ({ children, title, action, className = '', noPadding = false }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        {action}
      </div>
    )}
    <div className={noPadding ? '' : 'p-6'}>
      {children}
    </div>
  </div>
);

export const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required, 
  error,
  disabled = false,
  className = ''
}) => (
  <div className="flex flex-col gap-2">
    {label && (
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`px-4 py-2.5 border-2 rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 
        focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 
        disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed
        text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
        transition-all duration-200 ${error ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-200' : ''} ${className}`}
    />
    {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
  </div>
);

export const Select = ({ 
  label, 
  value, 
  onChange, 
  options, 
  required,
  placeholder = 'Seleccionar...',
  disabled = false
}) => (
  <div className="flex flex-col gap-2">
    {label && (
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      className="px-4 py-2.5 border-2 rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 
        focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 
        disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed
        text-slate-900 dark:text-slate-100 transition-all duration-200"
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export const Textarea = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  required,
  rows = 4,
  error
}) => (
  <div className="flex flex-col gap-2">
    {label && (
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className={`px-4 py-2.5 border-2 rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 
        focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 
        text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
        resize-none transition-all duration-200 ${error ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
    />
    {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
  </div>
);

export const Modal = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }) => {
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ${sizes[size]} w-full max-h-[90vh] overflow-hidden animate-scaleIn border border-slate-200 dark:border-slate-700`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-sm font-medium',
    success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-medium',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-sm font-medium',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium',
    active: 'bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg',
    inactive: 'bg-slate-400 text-white px-3 py-1 rounded-full text-sm font-medium'
  };
  
  return (
    <span className={`${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Table = ({ children, headers }) => (
  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
    <table className="w-full">
      <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              className="px-6 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
        {children}
      </tbody>
    </table>
  </div>
);

export const Alert = ({ type = 'info', children, onClose }) => {
  const types = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200',
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
  };
  
  return (
    <div className={`p-4 rounded-lg border-2 ${types[type]} flex items-start justify-between`}>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button onClick={onClose} className="ml-4 hover:opacity-70 transition-opacity">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export const Spinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  return (
    <div className={`${sizes[size]} border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin`} />
  );
};

export const SearchInput = ({ value, onChange, placeholder = 'Buscar visitante...', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 border-2 rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 
          focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 
          text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200"
      />
    </div>
  );
};

export const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { variant: 'active', text: 'En instalaciones' },
    completed: { variant: 'success', text: 'Salida registrada' },
    pending: { variant: 'warning', text: 'Pendiente' }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  
  return <Badge variant={config.variant}>{config.text}</Badge>;
};