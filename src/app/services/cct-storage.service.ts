import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class CctStorageService {
  private readonly CCT_KEY = 'clave_centro_trabajo';

  constructor() { }

  /**
   * Guarda la CCT en LocalStorage
   * @param cct - Clave de Centro de Trabajo
   * @returns true si se guardó correctamente, false en caso de error
   */
  saveCCT(cct: string): boolean {
    try {
      if (!cct || cct.trim() === '') {
        console.warn('CCT vacía, no se guardará');
        return false;
      }

      localStorage.setItem(this.CCT_KEY, cct.trim());
      console.log('CCT guardada correctamente:', cct);
      return true;
    } catch (error) {
      console.error('Error al guardar la CCT:', error);
      return false;
    }
  }

  /**
   * Recupera la CCT desde LocalStorage
   * @returns La CCT almacenada o null si no existe
   */
  getCCT(): string | null {
    try {
      const cct = localStorage.getItem(this.CCT_KEY);

      if (!cct) {
        console.log('No hay CCT almacenada');
        return null;
      }
        console.log('CCT recuperada:', cct);
        return cct;

    } catch (error) {
      console.error('Error al recuperar CCT:', error);
      return null;
    }
  }

  /**
   * Elimina la CCT de LocalStorage
   * @returns true si se eliminó correctamente
   */
  deleteCCT(): boolean {
    try {
      localStorage.removeItem(this.CCT_KEY);
      console.log('CCT eliminada correctamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar CCT:', error);
      return false;
    }
  }

  /**
   * Verifica si existe una CCT almacenada
   * @returns true si existe una CCT almacenada
   */
  hasCCT(): boolean {
    return this.getCCT() !== null;
  }

  /**
   * Limpia toda la información de CCT
   */
  clearAll(): void {
    this.deleteCCT();
  }
}
