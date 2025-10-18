"use client";
import React, { useState, useEffect } from "react";

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
  onSubmit: (data: Record<string, any>) => void;
  submitText?: string;
  cancelText?: string;
}

export default function GlobalModal({
  show,
  title = "Form",
  fields,
  onClose,
  onSubmit,
  submitText = "Submit",
  cancelText = "Cancel",
}: GlobalModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach(f => {
      initial[f.key] = f.value ?? "";
    });
    return initial;
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Form will be cleared when modal closes via the success callback
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
                      disabled={field.disabled}
                      onChange={e =>
                        setFormData({ ...formData, [field.key]: e.target.value })
                      }
                    >
                      <option value="">Select...</option>
                      {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || "text"}
                      className="form-control"
                      value={formData[field.key]}
                      disabled={field.disabled}
                      onChange={e =>
                        setFormData({ ...formData, [field.key]: e.target.value })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>{cancelText}</button>
              <button type="submit" className="btn btn-success">{submitText}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
