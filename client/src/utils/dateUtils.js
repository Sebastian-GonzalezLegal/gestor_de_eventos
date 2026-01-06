/**
 * Formatea una fecha o string de fecha en un formato legible en español.
 * 
 * @param {string|Date} dateInput - La fecha a formatear.
 * @param {Object} options - Opciones de formato.
 * @param {boolean} options.short - Si es true, retorna un formato corto (DD/MM/YYYY).
 * @param {boolean} options.withTime - Si es true, incluye la hora (HH:mm).
 * @returns {string|Object} - La fecha formateada o un objeto con partes de la fecha si se solicita.
 */
export const formatDate = (dateInput, options = {}) => {
    if (!dateInput) return options.short ? '--' : 'Sin fecha';
  
    try {
      let date;
  
      // Si es un string, intentar parsearlo
      if (typeof dateInput === 'string') {
        // Intentar diferentes formatos comunes
        // YYYY-MM-DD
        if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Fix timezone issue by treating as local time or appending time
          const parts = dateInput.split('-');
          date = new Date(parts[0], parts[1] - 1, parts[2]);
        } 
        // DD/MM/YYYY
        else if (dateInput.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          const parts = dateInput.split('/');
          date = new Date(parts[2], parts[1] - 1, parts[0]);
        }
        // ISO String
        else {
          date = new Date(dateInput);
        }
      } else {
        date = new Date(dateInput);
      }
  
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
  
      if (options.returnObject) {
         return {
          day: date.getDate(),
          month: date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''),
          year: date.getFullYear(),
          full: date.toLocaleDateString('es-ES'),
          time: date.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})
         };
      }
  
      const dateOptions = {
        day: '2-digit',
        month: options.short ? '2-digit' : 'long',
        year: 'numeric'
      };
  
      if (options.withTime) {
        dateOptions.hour = '2-digit';
        dateOptions.minute = '2-digit';
      }
  
      return date.toLocaleDateString('es-ES', dateOptions);
  
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error en fecha';
    }
  };
  
  /**
   * Retorna la fecha actual formateada de forma amigable (ej: Lunes, 12 de Octubre de 2023)
   */
  export const getTodayFriendly = () => {
    return new Date().toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  