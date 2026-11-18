import { Injectable, signal } from '@angular/core';

export interface ToastNotification {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  title: string;
  message: string;
  icon?: string;
  timeoutId?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  toasts = signal<ToastNotification[]>([]);

  showWarning(title: string, message: string, duration = 4500) {
    this.addToast('warning', title, message, duration);
  }

  showError(title: string, message: string, duration = 5000) {
    this.addToast('error', title, message, duration);
  }

  showSuccess(title: string, message: string, duration = 4000) {
    this.addToast('success', title, message, duration);
  }

  showInfo(title: string, message: string, duration = 4000) {
    this.addToast('info', title, message, duration);
  }

  success(message: string, title = 'Éxito') {
    this.showSuccess(title, message);
  }

  warning(message: string, title = 'Atención') {
    this.showWarning(title, message);
  }

  error(message: string, title = 'Error') {
    this.showError(title, message);
  }

  info(message: string, title = 'Información') {
    this.showInfo(title, message);
  }

  private addToast(type: 'warning' | 'error' | 'success' | 'info', title: string, message: string, duration: number) {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const timeoutId = setTimeout(() => {
      this.remove(id);
    }, duration);

    const newToast: ToastNotification = {
      id,
      type,
      title,
      message,
      timeoutId
    };

    // Keep at most 3 toasts on screen simultaneously
    this.toasts.update(current => [...current.slice(-2), newToast]);
  }

  remove(id: string) {
    this.toasts.update(current => {
      const toast = current.find(t => t.id === id);
      if (toast?.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
      return current.filter(t => t.id !== id);
    });
  }
}
