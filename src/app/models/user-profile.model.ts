export interface UserProfile {
  id?: string;
  uid: string;
  email: string;
  //rol: 'administrador' | 'maestro' | 'padre';
  rol: string;
  nombre?: string;
  escuelaId?: string;
}
