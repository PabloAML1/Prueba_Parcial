import React, { useEffect, useState } from "react";

const ConsultasList = ({ apiUrl }) => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Error al obtener consultas");
        const data = await res.json();
        setConsultas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultas();
  }, [apiUrl]);

  if (loading) return <p>Cargando consultas...</p>;
  if (error) return <p>Error: {error}</p>;
  if (consultas.length === 0) return <p>No hay consultas</p>;

  return (
    <ul>
      {consultas.map((c) => (
        <li key={c.id}>
          ID: {c.id}, Paciente: {c.paciente}, Médico: {c.medico}, Fecha: {c.fecha}
        </li>
      ))}
    </ul>
  );
};

export default ConsultasList;
