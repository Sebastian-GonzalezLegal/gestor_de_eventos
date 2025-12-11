import React from 'react';
import './Modal.css';
import './VecinoDetalle.css';

const VecinoDetalle = ({ vecino, onClose }) => {
  const eventos = vecino.eventos || [];

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Detalle de Vecino</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="detalle-grid">
          <div>
            <strong>Nombre:</strong> {vecino.nombre} {vecino.apellido}
          </div>
          <div>
            <strong>Documento:</strong> {vecino.documento}
          </div>
          <div>
            <strong>Email:</strong> {vecino.email || '-'}
          </div>
          <div>
            <strong>Teléfono:</strong> {vecino.telefono || '-'}
          </div>
          <div>
            <strong>Estado:</strong>{' '}
            <span className={`badge ${vecino.activo ? 'badge-success' : 'badge-danger'}`}>
              {vecino.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        <h3 style={{ marginTop: '20px' }}>Eventos asistidos</h3>
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
  );
};

export default VecinoDetalle;