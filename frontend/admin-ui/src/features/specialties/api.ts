import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/apiClient";

export interface Specialty extends Record<string, unknown> {
  id: number;
  name: string;
  description: string;
}

export interface SpecialtyPayload {
  name: string;
  description: string;
}

interface SpecialtyDto {
  id: number;
  nombre: string;
  descripcion: string;
}

const specialtiesKeys = {
  all: ["specialties"] as const,
  list: () => [...specialtiesKeys.all] as const,
  detail: (id: number) => [...specialtiesKeys.all, id] as const,
};

const mapFromDto = (dto: SpecialtyDto): Specialty => ({
  id: dto.id,
  name: dto.nombre,
  description: dto.descripcion ?? "",
});

const mapToDto = (payload: SpecialtyPayload) => ({
  nombre: payload.name,
  descripcion: payload.description,
});

async function fetchSpecialties(): Promise<Specialty[]> {
  const data = await apiRequest<SpecialtyDto[]>("/especialidades");
  return data.map(mapFromDto);
}

async function createSpecialty(payload: SpecialtyPayload): Promise<Specialty> {
  const dto = await apiRequest<{ id: number; nombre: string }>("/especialidades", {
    method: "POST",
    body: JSON.stringify(mapToDto(payload)),
  });

  return {
    id: dto.id,
    name: dto.nombre ?? payload.name,
    description: payload.description,
  };
}

async function updateSpecialty(id: number, payload: SpecialtyPayload): Promise<void> {
  await apiRequest<void>(`/especialidades/${id}`, {
    method: "PUT",
    body: JSON.stringify(mapToDto(payload)),
  });
}

async function deleteSpecialty(id: number): Promise<void> {
  await apiRequest<void>(`/especialidades/${id}`, {
    method: "DELETE",
    parseJson: false,
  });
}

export function useSpecialties() {
  return useQuery({
    queryKey: specialtiesKeys.list(),
    queryFn: fetchSpecialties,
  });
}

export function useCreateSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSpecialty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: specialtiesKeys.list() });
    },
  });
}

export function useUpdateSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: SpecialtyPayload;
    }) => updateSpecialty(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: specialtiesKeys.list() });
      queryClient.invalidateQueries({ queryKey: specialtiesKeys.detail(variables.id) });
    },
  });
}

export function useDeleteSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSpecialty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: specialtiesKeys.list() });
    },
  });
}

export { specialtiesKeys };
