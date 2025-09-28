import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/apiClient";

export interface SpecialtyDetails {
  id: number;
  name: string;
  description: string;
}

interface SpecialtyDto {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface MedicalCenter {
  id: number;
  name: string;
  address: string;
}

interface CenterDto {
  id: number;
  nombre: string;
  direccion: string | null;
}

const specialtyKeys = {
  root: ["specialty"] as const,
  detail: (id: number) => [...specialtyKeys.root, id] as const,
};

const centerKeys = {
  root: ["medical-center"] as const,
  detail: (id: number) => [...centerKeys.root, id] as const,
};

const mapSpecialty = (dto: SpecialtyDto): SpecialtyDetails => ({
  id: dto.id,
  name: dto.nombre,
  description: dto.descripcion ?? "",
});

const mapCenter = (dto: CenterDto): MedicalCenter => ({
  id: dto.id,
  name: dto.nombre,
  address: dto.direccion ?? "",
});

async function fetchSpecialty(id: number): Promise<SpecialtyDetails> {
  const dto = await apiRequest<SpecialtyDto>(`/admin/especialidades/${id}`);
  return mapSpecialty(dto);
}

async function fetchCenter(id: number): Promise<MedicalCenter> {
  const dto = await apiRequest<CenterDto>(`/admin/centros/${id}`);
  return mapCenter(dto);
}

export function useSpecialtyDetails(id: number | null | undefined) {
  return useQuery({
    queryKey:
      typeof id === "number" ? specialtyKeys.detail(id) : specialtyKeys.root,
    queryFn: () => fetchSpecialty(id as number),
    enabled: typeof id === "number",
  });
}

export function useCenterDetails(id: number | null | undefined) {
  return useQuery({
    queryKey: typeof id === "number" ? centerKeys.detail(id) : centerKeys.root,
    queryFn: () => fetchCenter(id as number),
    enabled: typeof id === "number",
  });
}

export { specialtyKeys, centerKeys };
