import React from "react";

interface WarningModalProps {
  show: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function WarningModal({ show, title = "Warning", message, confirmText = "Yes, Delete", cancelText = "Cancel", onConfirm, onCancel }: WarningModalProps) {
  if (!show) return null;
  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{
        background: 'rgba(0,0,0,0.3)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <div className="modal-dialog" style={{ maxWidth: 400, margin: 'auto' }}>
        <div className="modal-content" style={{ margin: 'auto' }}>
          <div className="modal-body text-center py-4">
            <p className="fw-semibold text-danger mb-4" style={{ fontSize: '1.2rem' }}>{message}</p>
            <div className="d-flex justify-content-center gap-2">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>{cancelText}</button>
              <button type="button" className="btn btn-danger" onClick={onConfirm}>{confirmText}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
