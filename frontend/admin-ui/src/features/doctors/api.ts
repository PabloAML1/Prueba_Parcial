import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/apiClient";

export interface Doctor extends Record<string, unknown> {
  id: number;
  name: string;
  specialtyId: number | null;
  specialtyName: string;
  centerId: number | null;
  centerName: string;
}

export interface DoctorPayload {
  name: string;
  specialtyId: number;
  centerId: number;
}

interface DoctorDto {
  id: number;
  nombre: string;
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
  name: dto.nombre,
  specialtyId: dto.especialidad_id,
  specialtyName: dto.especialidad ?? "",
  centerId: dto.id_centro,
  centerName: dto.centro ?? "",
});

const mapToDto = (payload: DoctorPayload) => ({
  nombre: payload.name,
  especialidad_id: payload.specialtyId,
  id_centro: payload.centerId,
});

async function fetchDoctors(): Promise<Doctor[]> {
  const data = await apiRequest<DoctorDto[]>("/medicos");
  return data.map(mapFromDto);
}

async function createDoctor(payload: DoctorPayload): Promise<Doctor> {
  const dto = await apiRequest<DoctorDto>("/medicos", {
    method: "POST",
    body: JSON.stringify(mapToDto(payload)),
  });

  return mapFromDto(dto);
}

async function updateDoctor(id: number, payload: DoctorPayload): Promise<void> {
  await apiRequest<void>(`/medicos/${id}`, {
    method: "PUT",
    body: JSON.stringify(mapToDto(payload)),
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
      payload: DoctorPayload;
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
