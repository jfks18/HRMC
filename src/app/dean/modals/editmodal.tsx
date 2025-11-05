
import React, { useState } from "react";
import { showSuccessToast, showErrorToast } from '../../utils/toast';

export interface EditModalColumn<T> {
  key: keyof T;
  header: string;
  type?: string;
  disabled?: boolean;
}

interface EditModalProps<T> {
  show: boolean;
  initialData: T;
  columns: EditModalColumn<T>[];
  onClose: () => void;
  onSubmit: (data: T) => Promise<void> | void;
  successMessage?: string;
  errorMessage?: string;
}

export function EditModal<T>({ show, initialData, columns, onClose, onSubmit, successMessage, errorMessage }: EditModalProps<T>) {
  const [formData, setFormData] = useState<T>(initialData);

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <form
          onSubmit={async e => {
            e.preventDefault();
            try {
              await onSubmit(formData);
              // Show success toast if provided
              if (successMessage) {
                showSuccessToast(successMessage);
              }
            } catch (error: any) {
              // Show error toast
              const errorMsg = errorMessage || error.message || 'An error occurred while saving';
              showErrorToast(errorMsg);
            }
          }}
        >
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Edit User</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {columns.map(col => (
                <div className="mb-3" key={String(col.key)}>
                  <label className="form-label fw-semibold text-secondary">{col.header}</label>
                  <input
                    type={col.type || "text"}
                    className="form-control"
                    value={formData[col.key] as any}
                    disabled={col.disabled}
                    onChange={e =>
                      setFormData({ ...formData, [col.key]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-success">Save Changes</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
