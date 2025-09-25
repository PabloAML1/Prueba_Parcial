import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/apiClient";

export interface Employee extends Record<string, unknown> {
  id: number;
  name: string;
  role: string;
  salary: number;
  centerId: number | null;
  centerName: string;
}

export interface EmployeePayload {
  name: string;
  role: string;
  salary: number;
  centerId: number;
}

interface EmployeeDto {
  id: number;
  nombre: string;
  cargo: string;
  salario: number;
  id_centro: number | null;
  centro: string | null;
}

const employeesKeys = {
  all: ["employees"] as const,
  list: () => [...employeesKeys.all] as const,
  detail: (id: number) => [...employeesKeys.all, id] as const,
};

const mapFromDto = (dto: EmployeeDto): Employee => ({
  id: dto.id,
  name: dto.nombre,
  role: dto.cargo,
  salary: Number(dto.salario ?? 0),
  centerId: dto.id_centro,
  centerName: dto.centro ?? "",
});

const mapToDto = (payload: EmployeePayload) => ({
  nombre: payload.name,
  cargo: payload.role,
  salario: payload.salary,
  id_centro: payload.centerId,
});

async function fetchEmployees(): Promise<Employee[]> {
  const data = await apiRequest<EmployeeDto[]>("/empleados");
  return data.map(mapFromDto);
}

async function createEmployee(payload: EmployeePayload): Promise<Employee> {
  const dto = await apiRequest<EmployeeDto>("/empleados", {
    method: "POST",
    body: JSON.stringify(mapToDto(payload)),
  });

  return mapFromDto(dto);
}

async function updateEmployee(id: number, payload: EmployeePayload): Promise<void> {
  await apiRequest<void>(`/empleados/${id}`, {
    method: "PUT",
    body: JSON.stringify(mapToDto(payload)),
  });
}

async function deleteEmployee(id: number): Promise<void> {
  await apiRequest<void>(`/empleados/${id}`, {
    method: "DELETE",
    parseJson: false,
  });
}

export function useEmployees() {
  return useQuery({
    queryKey: employeesKeys.list(),
    queryFn: fetchEmployees,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.list() });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: EmployeePayload;
    }) => updateEmployee(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.list() });
      queryClient.invalidateQueries({ queryKey: employeesKeys.detail(variables.id) });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.list() });
    },
  });
}

export { employeesKeys };
