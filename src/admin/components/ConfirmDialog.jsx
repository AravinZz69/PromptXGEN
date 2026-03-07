import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/**
 * Confirmation dialog for destructive actions
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether dialog is open
 * @param {function} props.onClose - Close handler
 * @param {function} props.onConfirm - Confirm handler
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message
 * @param {string} props.confirmLabel - Confirm button text
 * @param {string} props.variant - danger or warning
 * @param {string} props.requireTextInput - Text user must type to confirm
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  variant = 'danger',
  requireTextInput = null
}) {
  const [inputValue, setInputValue] = useState('');
  
  const variants = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
    },
  };

  const config = variants[variant] || variants.danger;
  const Icon = config.icon;
  
  const canConfirm = !requireTextInput || inputValue === requireTextInput;

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm();
      setInputValue('');
      onClose();
    }
  };

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className="relative max-w-md w-full mx-4 bg-card border border-border rounded-xl shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-white hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`mx-auto w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-white text-center mb-2">{title}</h3>
          
          {/* Message */}
          <p className="text-muted-foreground text-center mb-6">{message}</p>
          
          {/* Text input for double confirmation */}
          {requireTextInput && (
            <div className="mb-6">
              <label className="block text-sm text-muted-foreground mb-2">
                Type <span className="text-white font-mono">{requireTextInput}</span> to confirm:
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-primary"
                placeholder={requireTextInput}
              />
            </div>
          )}
          
          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`flex-1 px-4 py-2.5 ${config.buttonBg} text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
