import { Injectable } from '@angular/core';
import { QuoteBookingForm, QuoteCalculationResult } from '../models/quote.model';
import { PressOnOrder } from '../models/press-on.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: any = null;

  // Reemplaza estas credenciales con las de tu proyecto real en https://app.supabase.com
  private supabaseUrl = 'https://xyzcompany.supabase.co';
  private supabaseAnonKey = 'placeholder';
  private isConfigured = false;

  private async ensureClient(): Promise<any | null> {
    if (this.supabase) return this.supabase;
    if (!this.supabaseUrl || this.supabaseUrl.includes('xyzcompany')) {
      return null;
    }

    try {
      // Lazy import para mantener el bundle inicial súper ligero
      const { createClient } = await import('@supabase/supabase-js');
      this.supabase = createClient(this.supabaseUrl, this.supabaseAnonKey);
      this.isConfigured = true;
      return this.supabase;
    } catch (e) {
      console.warn('Supabase no disponible, operando en modo local:', e);
      return null;
    }
  }

  get configured(): boolean {
    return this.isConfigured || (!this.supabaseUrl.includes('xyzcompany') && !!this.supabaseAnonKey);
  }

  async saveCatalogSnapshot(snapshot: Record<string, unknown>): Promise<boolean> {
    const client = await this.ensureClient();
    if (!client) return false;

    try {
      const { error } = await client
        .from('site_config')
        .upsert({ id: 'blue-x-style-main', payload: snapshot, updated_at: new Date().toISOString() });
      return !error;
    } catch (err) {
      console.error('Error sincronizando catálogo con Supabase:', err);
      return false;
    }
  }

  async fetchCatalogSnapshot(): Promise<Record<string, unknown> | null> {
    const client = await this.ensureClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('site_config')
        .select('payload')
        .eq('id', 'blue-x-style-main')
        .single();
      if (error || !data?.payload) return null;
      return data.payload as Record<string, unknown>;
    } catch {
      return null;
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

    const client = await this.ensureClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('quote_requests')
          .insert([quotePayload])
          .select();

        if (error) throw error;
        return { success: true, id: data?.[0]?.id || Date.now().toString() };
      } catch (err) {
        console.error('Error guardando en Supabase:', err);
      }
    }

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

    const client = await this.ensureClient();
    if (client) {
      try {
        const { data, error } = await client
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
