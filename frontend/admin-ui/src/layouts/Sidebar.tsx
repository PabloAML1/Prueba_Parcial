import { NavLink } from "react-router-dom";

const NAV = [
  { to: "/app", label: "Dashboard", end: true },
  { to: "/app/specialties", label: "Specialties" },
  { to: "/app/hospitals", label: "Hospitals" },
  { to: "/app/employees", label: "Employees" },
  { to: "/app/doctors", label: "Doctors" },
];

const Sidebar = () => {
  return (
    <aside className="h-full p-3">
      <div className="px-2 py-3 text-lg font-bold">Admin</div>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={Boolean(item.end)}
            className={({ isActive }) =>
              `px-3 py-2 rounded hover:bg-neutral-100 ${
                isActive ? "bg-neutral-200 font-medium" : ""
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
