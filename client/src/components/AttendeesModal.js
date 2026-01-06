import React from 'react';
import { FaTimes, FaUser, FaIdCard, FaCalendarCheck, FaStickyNote } from 'react-icons/fa';
import { formatDate } from '../utils/dateUtils';
import './AttendeesModal.css';

const AttendeesModal = ({ eventName, attendees, onClose, loading }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content attendees-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Asistentes al Evento</h3>
            <p className="modal-subtitle">{eventName}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando asistentes...</p>
            </div>
          ) : attendees && attendees.length > 0 ? (
            <div className="attendees-list">
              <div className="attendees-count-badge">
                Total: {attendees.length} inscriptos
              </div>
              
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th><FaUser /> Vecino</th>
                      <th><FaIdCard /> DNI</th>
                      <th><FaCalendarCheck /> Fecha Inscripción</th>
                      <th><FaStickyNote /> Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((attendee) => (
                      <tr key={attendee.id || attendee.id_vecino}>
                        <td>
                          <div className="attendee-name">
                            {attendee.nombre} {attendee.apellido}
                          </div>
                          <div className="attendee-contact">
                            {attendee.email || 'Sin email'}
                          </div>
                        </td>
                        <td>{attendee.documento}</td>
                        <td>{formatDate(attendee.fecha_registro, { withTime: true })}</td>
                        <td>
                          {attendee.notas ? (
                            <span className="attendee-note" title={attendee.notas}>
                              {attendee.notas.length > 30 
                                ? attendee.notas.substring(0, 30) + '...' 
                                : attendee.notas}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="empty-attendees">
              <div className="empty-icon-wrapper">
                <FaUser />
              </div>
              <h4>Sin asistentes registrados</h4>
              <p>Aún no hay vecinos inscriptos a este evento.</p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendeesModal;
