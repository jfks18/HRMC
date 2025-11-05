/**
 * Toast Utility Functions
 * Provides consistent success and error toast notifications across the application
 */

export interface ToastOptions {
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // in milliseconds, default 5000
}

/**
 * Show a toast notification
 */
export function showToast({ title, message, type, duration = 5000 }: ToastOptions) {
  if (typeof window === 'undefined' || !(window as any).bootstrap) {
    console.log(`Toast (${type}): ${title ? title + ' - ' : ''}${message}`);
    return;
  }

  const bgClass = {
    success: 'text-bg-success',
    error: 'text-bg-danger', 
    warning: 'text-bg-warning',
    info: 'text-bg-info'
  }[type];

  const icon = {
    success: 'bi-check-circle-fill',
    error: 'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill'
  }[type];

  const toastHtml = `
    <div class="toast align-items-center ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          <div class="d-flex align-items-center">
            <i class="bi ${icon} me-2"></i>
            <div>
              ${title ? `<strong>${title}</strong><br>` : ''}
              ${message}
            </div>
          </div>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  // Get or create toast container
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }

  // Add toast to container
  toastContainer.insertAdjacentHTML('beforeend', toastHtml);
  const toastElement = toastContainer.lastElementChild as HTMLElement;
  
  // Initialize and show toast
  const toast = new (window as any).bootstrap.Toast(toastElement, {
    delay: duration
  });
  toast.show();

  // Remove element when hidden
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

/**
 * Show success toast
 */
export function showSuccessToast(message: string, title?: string, duration?: number) {
  showToast({ title, message, type: 'success', duration });
}

/**
 * Show error toast
 */
export function showErrorToast(message: string, title?: string, duration?: number) {
  showToast({ title, message, type: 'error', duration });
}

/**
 * Show warning toast
 */
export function showWarningToast(message: string, title?: string, duration?: number) {
  showToast({ title, message, type: 'warning', duration });
}

/**
 * Show info toast
 */
export function showInfoToast(message: string, title?: string, duration?: number) {
  showToast({ title, message, type: 'info', duration });
}