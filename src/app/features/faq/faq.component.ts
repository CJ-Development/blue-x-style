import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  openFaqId = signal<number | null>(1); // Open first by default

  faqList: FaqItem[] = [
    {
      id: 1,
      question: '¿Cómo funciona la atención a domicilio en Bogotá y qué zonas cubren?',
      answer: 'Atendemos en Bogotá de lunes a sábado de 9:00 a.m. a 4:00 p.m. Nos desplazamos directamente a tu hogar o lugar de trabajo con todo el maletín profesional, lámparas UV/LED e insumos exactos acordados en tu cotización.'
    },
    {
      id: 2,
      question: '¿Por qué se solicita un abono del 20% para confirmar la cita?',
      answer: 'El abono del 20% reserva tu franja horaria exclusiva en la agenda de Yeye y cubre los tiempos logísticos de traslado. Sin este abono, el espacio permanece disponible para otros clientes.'
    },
    {
      id: 3,
      question: '¿Cómo garantizan la bioseguridad y esterilización de las herramientas?',
      answer: 'Tu salud es prioridad absoluta. Todo el instrumental metálico (alicates, empujadores, fresas de tungsteno) se esteriliza y se abre frente a ti en sobres sellados individuales de grado médico. Limas y palitos de naranjo son 100% descartables.'
    },
    {
      id: 4,
      question: '¿Con cuánta anticipación puedo reprogramar o cancelar mi cita?',
      answer: 'Puedes cancelar o reprogramar sin costo avisando con un mínimo de 24 horas de anticipación. De esta forma podemos reasignar el bloque horario y tu abono se transfiere a tu nueva fecha.'
    },
    {
      id: 5,
      question: '¿Cuánto tiempo dura una sesión de manicura o pedicura?',
      answer: 'Los servicios sencillos (tradicional o semipermanente básico) toman entre 1 hora y 2 horas. Servicios estructurales como nivelación con base rubber, polygel o nail art tridimensional toman entre 2.5 y 3.5 horas para asegurar un acabado impecable.'
    },
    {
      id: 6,
      question: '¿Qué diferencia hay entre la nivelación con base rubber y el acrílico tradicional?',
      answer: 'La base rubber aporta flexibilidad anatómica a tu uña natural, corrigiendo estrías y permitiendo que crezca sana sin necesidad de limados agresivos ni monómeros de olor fuerte. Es la opción predilecta para quienes buscan resistencia sin daño.'
    },
    {
      id: 7,
      question: '¿Qué son las Press-On Nails y cómo elijo mi talla?',
      answer: 'Son sets de uñas hechas a mano con gel de alta densidad que te aplicas tú misma en 10 minutos. Son 100% reutilizables. En la sección de Press-On tienes la guía milimétrica para medir tus dedos con cinta y regla.'
    },
    {
      id: 8,
      question: '¿Qué medios de pago aceptan para el saldo el día del servicio?',
      answer: 'Aceptamos transferencias bancarias directas por Nequi, Daviplata, Bancolombia o efectivo al finalizar tu cita.'
    }
  ];

  toggleFaq(id: number) {
    this.openFaqId.update(current => (current === id ? null : id));
  }
}
