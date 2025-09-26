import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/apiClient";

export interface Doctor extends Record<string, unknown> {
  id: number;
  userId: number | null;
  name: string;
  email: string;
  password: string;
  specialtyId: number | null;
  specialtyName: string;
  centerId: number | null;
  centerName: string;
}

export interface DoctorCreatePayload {
  name: string;
  email: string;
  password: string;
  specialtyId: number;
  centerId: number;
}

export interface DoctorUpdatePayload {
  name: string;
  email: string;
  password?: string;
  specialtyId: number;
  centerId: number;
}

interface DoctorDto {
  id: number;
  user_id: number | null;
  nombre: string;
  email: string | null;
  password: string | null;
  especialidad_id: number | null;
  id_centro: number | null;
  especialidad: string | null;
  centro: string | null;
}

const doctorsKeys = {
  all: ["doctors"] as const,
  list: () => [...doctorsKeys.all] as const,
  detail: (id: number) => [...doctorsKeys.all, id] as const,
};

const mapFromDto = (dto: DoctorDto): Doctor => ({
  id: dto.id,
  userId: dto.user_id,
  name: dto.nombre,
  email: dto.email ?? "",
  password: dto.password ?? "",
  specialtyId: dto.especialidad_id,
  specialtyName: dto.especialidad ?? "",
  centerId: dto.id_centro,
  centerName: dto.centro ?? "",
});

const mapCreateToDto = (payload: DoctorCreatePayload) => ({
  nombre: payload.name,
  email: payload.email,
  password: payload.password,
  especialidad_id: payload.specialtyId,
  id_centro: payload.centerId,
});

const mapUpdateToDto = (payload: DoctorUpdatePayload) => {
  const dto: Record<string, unknown> = {
    nombre: payload.name,
    email: payload.email,
    especialidad_id: payload.specialtyId,
    id_centro: payload.centerId,
  };

  if (payload.password && payload.password.trim() !== "") {
    dto.password = payload.password;
  }

  return dto;
};

async function fetchDoctors(): Promise<Doctor[]> {
  const data = await apiRequest<DoctorDto[]>("/medicos");
  return data.map(mapFromDto);
}

async function createDoctor(payload: DoctorCreatePayload): Promise<Doctor> {
  const dto = await apiRequest<DoctorDto>("/medicos", {
    method: "POST",
    body: JSON.stringify(mapCreateToDto(payload)),
  });

  return mapFromDto(dto);
}

async function updateDoctor(
  id: number,
  payload: DoctorUpdatePayload
): Promise<void> {
  await apiRequest<void>(`/medicos/${id}`, {
    method: "PUT",
    body: JSON.stringify(mapUpdateToDto(payload)),
  });
}

async function deleteDoctor(id: number): Promise<void> {
  await apiRequest<void>(`/medicos/${id}`, {
    method: "DELETE",
    parseJson: false,
  });
}

export function useDoctors() {
  return useQuery({
    queryKey: doctorsKeys.list(),
    queryFn: fetchDoctors,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorsKeys.list() });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: DoctorUpdatePayload;
    }) => updateDoctor(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: doctorsKeys.list() });
      queryClient.invalidateQueries({ queryKey: doctorsKeys.detail(variables.id) });
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorsKeys.list() });
    },
  });
}

export { doctorsKeys };
