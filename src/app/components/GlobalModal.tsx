"use client";
import React, { useState, useEffect } from "react";
import { showSuccessToast, showErrorToast } from '../utils/toast';

export interface GlobalModalField {
  key: string;
  label: string;
  type?: string;
  disabled?: boolean;
  value?: any;
  options?: { value: string; label: string }[];
}

interface GlobalModalProps {
  show: boolean;
  title?: string;
  fields: GlobalModalField[];
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  submitText?: string;
  cancelText?: string;
  successMessage?: string;
  errorMessage?: string;
}

export default function GlobalModal({
  show,
  title = "Form",
  fields,
  onClose,
  onSubmit,
  submitText = "Submit",
  cancelText = "Cancel",
  successMessage,
  errorMessage,
}: GlobalModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach(f => {
      initial[f.key] = f.value ?? "";
    });
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);

  // Reset form data when modal opens/closes
  useEffect(() => {
    if (show) {
      const initial: Record<string, any> = {};
      fields.forEach(f => {
        initial[f.key] = f.value ?? "";
      });
      setFormData(initial);
    }
  }, [show, fields]);

  const handleClose = () => {
    // Clear form data
    const initial: Record<string, any> = {};
    fields.forEach(f => {
      initial[f.key] = f.value ?? "";
    });
    setFormData(initial);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // prevent double submit
    setSubmitting(true);
    try {
      await onSubmit(formData);
      // Show success toast if provided
      if (successMessage) {
        showSuccessToast(successMessage);
      }
      // Form will be cleared when modal closes via the success callback
    } catch (error: any) {
      // Show error toast
      const errorMsg = errorMessage || error.message || 'An error occurred while saving';
      showErrorToast(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
              {fields.map(field => (
                <div className="mb-3" key={field.key}>
                  <label className="form-label fw-semibold text-secondary">{field.label}</label>
                  {field.type === 'select' && field.options ? (
                    <select
                      className="form-control"
                      value={formData[field.key]}
                      disabled={field.disabled || submitting}
                      onChange={e =>
                        setFormData({ ...formData, [field.key]: e.target.value })
                      }
                    >
                      <option value="">Select...</option>
                      {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      className="form-control"
                      value={formData[field.key]}
                      disabled={field.disabled || submitting}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      className="form-control"
                      value={formData[field.key]}
                      disabled={field.disabled || submitting}
                      onChange={e => {
                        const newVal = e.target.value;
                        const updated: Record<string, any> = { ...formData, [field.key]: newVal };
                        if (field.key === 'start_date') {
                          const endVal = formData['end_date'];
                          if (endVal && endVal < newVal) {
                            updated['end_date'] = newVal;
                          }
                        }
                        setFormData(updated);
                      }}
                      // Add min attribute for start_date and end_date
                      {...(field.key === 'start_date' ? { min: new Date().toISOString().split('T')[0] } : {})}
                      {...(field.key === 'end_date' && formData['start_date'] ? { min: formData['start_date'] } : {})}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={submitting}>{cancelText}</button>
              <button type="submit" className="btn btn-success" disabled={submitting} aria-busy={submitting}>
                {submitting && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                {submitText}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
