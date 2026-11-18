import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { QuoteBookingForm, QuoteCalculationResult } from '../models/quote.model';
import { PressOnOrder } from '../models/press-on.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  
  // Puedes reemplazar estas credenciales con las de tu proyecto en https://app.supabase.com
  private supabaseUrl = 'https://xyzcompany.supabase.co';
  private supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...placeholder';
  private isConfigured = false;

  constructor() {
    try {
      if (this.supabaseUrl && !this.supabaseUrl.includes('xyzcompany')) {
        this.supabase = createClient(this.supabaseUrl, this.supabaseAnonKey);
        this.isConfigured = true;
      }
    } catch (e) {
      console.warn('Supabase no configurado aún, operando en modo local/demo.');
    }
  }

  async saveQuoteRequest(form: QuoteBookingForm, quote: QuoteCalculationResult): Promise<{ success: boolean; id: string }> {
    const quotePayload = {
      client_name: form.clientName,
      client_phone: form.clientPhone,
      address: form.address,
      neighborhood: form.neighborhood,
      service_id: form.serviceId,
      complexity_id: form.complexityId,
      preferred_date: form.preferredDate,
      preferred_time: form.preferredTimeSlot,
      notes: form.notes,
      total_estimated: quote.totalEstimated,
      deposit_amount: quote.depositAmount,
      status: 'pending_confirmation',
      created_at: new Date().toISOString()
    };

    if (this.isConfigured && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('quote_requests')
          .insert([quotePayload])
          .select();
        
        if (error) throw error;
        return { success: true, id: data?.[0]?.id || Date.now().toString() };
      } catch (err) {
        console.error('Error guardando en Supabase:', err);
      }
    }

    // Fallback: almacenar en LocalStorage para no perder solicitudes
    const existing = JSON.parse(localStorage.getItem('bxs_quotes') || '[]');
    const id = 'quote_' + Date.now();
    existing.push({ id, ...quotePayload });
    localStorage.setItem('bxs_quotes', JSON.stringify(existing));

    return { success: true, id };
  }

  async savePressOnOrder(order: PressOnOrder): Promise<{ success: boolean; id: string }> {
    const payload = {
      ...order,
      status: 'pending_quote',
      created_at: new Date().toISOString()
    };

    if (this.isConfigured && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('press_on_orders')
          .insert([payload])
          .select();
        if (error) throw error;
        return { success: true, id: data?.[0]?.id || Date.now().toString() };
      } catch (err) {
        console.error('Error guardando Press On en Supabase:', err);
      }
    }

    const existing = JSON.parse(localStorage.getItem('bxs_press_on') || '[]');
    const id = 'presson_' + Date.now();
    existing.push({ id, ...payload });
    localStorage.setItem('bxs_press_on', JSON.stringify(existing));

    return { success: true, id };
  }
}
