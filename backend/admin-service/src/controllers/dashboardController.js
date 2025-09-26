import pool from "../config/db.js";

const safeNumber = (value) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const getDashboardMetrics = async (_req, res) => {
  try {
    const [
      centersCountRows,
      specialtiesCountRows,
      doctorsCountRows,
      employeesCountRows,
      totalAppointmentsRows,
      upcomingAppointmentsRows,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS totalCenters FROM centros_medicos"),
      pool.query("SELECT COUNT(*) AS totalSpecialties FROM especialidades"),
      pool.query("SELECT COUNT(*) AS totalDoctors FROM medicos"),
      pool.query("SELECT COUNT(*) AS totalEmployees FROM empleados"),
      pool.query("SELECT COUNT(*) AS totalAppointments FROM consultas"),
      pool.query(
        "SELECT COUNT(*) AS upcomingAppointments FROM consultas WHERE fecha >= CURDATE()"
      ),
    ]);

    const globalMetrics = {
      totalCenters: safeNumber(centersCountRows[0]?.[0]?.totalCenters),
      totalSpecialties: safeNumber(
        specialtiesCountRows[0]?.[0]?.totalSpecialties
      ),
      totalDoctors: safeNumber(doctorsCountRows[0]?.[0]?.totalDoctors),
      totalEmployees: safeNumber(employeesCountRows[0]?.[0]?.totalEmployees),
      totalAppointments: safeNumber(
        totalAppointmentsRows[0]?.[0]?.totalAppointments
      ),
      upcomingAppointments: safeNumber(
        upcomingAppointmentsRows[0]?.[0]?.upcomingAppointments
      ),
    };

    const [centersRows] = await pool.query(`
      SELECT
        c.id,
        c.nombre AS name,
        c.direccion AS address,
        COUNT(DISTINCT m.id) AS doctorsCount,
        COUNT(DISTINCT e.id) AS employeesCount,
        COUNT(DISTINCT m.especialidad_id) AS specialtiesCount,
        COUNT(DISTINCT con.id) AS totalAppointments,
        COUNT(DISTINCT CASE WHEN con.fecha >= CURDATE() THEN con.id END) AS upcomingAppointments
      FROM centros_medicos c
      LEFT JOIN medicos m ON m.id_centro = c.id
      LEFT JOIN empleados e ON e.id_centro = c.id
      LEFT JOIN consultas con ON con.id_centro = c.id
      GROUP BY c.id, c.nombre, c.direccion
      ORDER BY c.nombre ASC
    `);

    const centers = centersRows.map((row) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      doctors: safeNumber(row.doctorsCount),
      employees: safeNumber(row.employeesCount),
      specialties: safeNumber(row.specialtiesCount),
      totalAppointments: safeNumber(row.totalAppointments),
      upcomingAppointments: safeNumber(row.upcomingAppointments),
    }));

    res.json({ global: globalMetrics, centers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
