import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-login-page.component.html',
  styleUrls: ['./admin-login-page.component.scss']
})
export class AdminLoginPageComponent {
  private catalogService = inject(CatalogService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  password = '';
  showPassword = false;
  errorMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.errorMessage.set('');
    this.isSubmitting.set(true);

    setTimeout(() => {
      const ok = this.catalogService.login(this.password);
      this.isSubmitting.set(false);

      if (ok) {
        this.notificationService.success('¡Bienvenida Yeye! Modo Administrador activado.');
        this.router.navigate(['/']);
      } else {
        this.errorMessage.set('Contraseña incorrecta. Por favor verifica e intenta de nuevo.');
        this.notificationService.error('Contraseña incorrecta.');
      }
    }, 400);
  }
}
