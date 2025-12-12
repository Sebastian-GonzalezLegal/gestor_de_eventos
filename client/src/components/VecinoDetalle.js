import React from 'react';
import './VecinoDetalle.css';

const VecinoDetalle = ({ vecino, onClose }) => {
  const eventos = vecino.eventos || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Detalle de Vecino</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="detalle-grid">
            <div>
              <strong>Nombre</strong>
              <span>{vecino.nombre} {vecino.apellido}</span>
            </div>
            <div>
              <strong>Documento</strong>
              <span>{vecino.documento}</span>
            </div>
            <div>
              <strong>Email</strong>
              <span>{vecino.email || '-'}</span>
            </div>
            <div>
              <strong>Teléfono</strong>
              <span>{vecino.telefono || '-'}</span>
            </div>
            <div>
              <strong>Estado</strong>
              <span className={`badge ${vecino.activo ? 'badge-success' : 'badge-danger'}`}>
                {vecino.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          <h4 className="mt-4 mb-3" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            Eventos asistidos
          </h4>
          
          {eventos.length === 0 ? (
            <div className="alert alert-info">Aún no tiene registros de eventos.</div>
          ) : (
            <div className="eventos-list">
              {eventos.map((evento) => (
                <div key={evento.id} className="evento-item">
                  <div className="evento-nombre">{evento.nombre}</div>
                  <div className="evento-fecha">
                    {new Date(evento.fecha_evento).toLocaleDateString('es-ES')}
                    {evento.hora_evento && ` - ${evento.hora_evento}`}
                  </div>
                  {evento.lugar && <div className="evento-lugar">{evento.lugar}</div>}
                  <div className="evento-fecha-registro">
                    Registrado: {new Date(evento.fecha_registro).toLocaleString('es-ES')}
                  </div>
                  {evento.notas && <div className="evento-notas">Notas: {evento.notas}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VecinoDetalle;
