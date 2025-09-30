import pool from "../config/db.js";

const safeNumber = (value) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const getDashboardMetrics = async (_req, res) => {
  try {
    // 🔹 Consultas globales
    const [
      centersCountRows,
      specialtiesCountRows,
      doctorsCountRows,
      employeesCountRows,
      totalAppointmentsRows,
      upcomingAppointmentsRows,
      specialtiesDistributionRows,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS totalCenters FROM centros_medicos"),
      pool.query("SELECT COUNT(*) AS totalSpecialties FROM especialidades"),
      pool.query("SELECT COUNT(*) AS totalDoctors FROM medicos"),
      pool.query("SELECT COUNT(*) AS totalEmployees FROM empleados"),
      pool.query("SELECT COUNT(*) AS totalAppointments FROM consultas"),
      pool.query("SELECT COUNT(*) AS upcomingAppointments FROM consultas WHERE fecha >= CURDATE()"),
      pool.query(`
        SELECT s.nombre, COUNT(m.id) AS count
        FROM especialidades s
        LEFT JOIN medicos m ON m.especialidad_id = s.id
        GROUP BY s.nombre
        ORDER BY s.nombre ASC
      `),
    ]);

    // 🔹 Métricas globales
    const globalMetrics = {
      totalCenters: Number(centersCountRows[0]?.[0]?.totalCenters ?? 0),
      totalSpecialties: Number(specialtiesCountRows[0]?.[0]?.totalSpecialties ?? 0),
      totalDoctors: Number(doctorsCountRows[0]?.[0]?.totalDoctors ?? 0),
      totalEmployees: Number(employeesCountRows[0]?.[0]?.totalEmployees ?? 0),
      totalAppointments: Number(totalAppointmentsRows[0]?.[0]?.totalAppointments ?? 0),
      upcomingAppointments: Number(upcomingAppointmentsRows[0]?.[0]?.upcomingAppointments ?? 0),
    };

    // 🔹 Distribución global de especialidades (solo con médicos)
    const specialtiesDistribution = {};
    specialtiesDistributionRows[0].forEach((row) => {
      const count = Number(row.count ?? 0);
      if (count > 0) specialtiesDistribution[row.nombre] = count;
    });

    // 🔹 Datos por centro
    const [centersRows] = await pool.query(`
      SELECT
        c.id,
        c.nombre AS name,
        c.direccion AS address,
        COUNT(DISTINCT m.id) AS doctorsCount,
        COUNT(DISTINCT e.id) AS employeesCount,
        COUNT(DISTINCT con.id) AS totalAppointments,
        COUNT(DISTINCT CASE WHEN con.fecha >= CURDATE() THEN con.id END) AS upcomingAppointments
      FROM centros_medicos c
      LEFT JOIN medicos m ON m.id_centro = c.id
      LEFT JOIN empleados e ON e.id_centro = c.id
      LEFT JOIN consultas con ON m.id_centro = c.id
      GROUP BY c.id, c.nombre, c.direccion
      ORDER BY c.nombre ASC
    `);

    // 🔹 Agregar distribución de especialidades por centro
    const centers = await Promise.all(centersRows.map(async (row) => {
      const [distRows] = await pool.query(`
        SELECT s.nombre, COUNT(m.id) AS count
        FROM especialidades s
        LEFT JOIN medicos m ON m.especialidad_id = s.id AND m.id_centro = ?
        GROUP BY s.nombre
        ORDER BY s.nombre ASC
      `, [row.id]);

      const centerSpecialtiesDistribution = {};
      distRows.forEach(r => {
        const count = Number(r.count ?? 0);
        if (count > 0) centerSpecialtiesDistribution[r.nombre] = count;
      });

      return {
        id: row.id,
        name: row.name,
        address: row.address,
        doctors: Number(row.doctorsCount ?? 0),
        employees: Number(row.employeesCount ?? 0),
        specialties: Object.keys(centerSpecialtiesDistribution).length,
        totalAppointments: Number(row.totalAppointments ?? 0),
        upcomingAppointments: Number(row.upcomingAppointments ?? 0),
        specialtiesDistribution: centerSpecialtiesDistribution,
      };
    }));

    res.json({ global: { ...globalMetrics, specialtiesDistribution }, centers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
