import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/apiClient";

export interface Hospital extends Record<string, unknown> {
    id: number;
    name: string;
    address: string;
}

export interface HospitalPayload {
    name: string;
    address: string;
}

interface HospitalDto {
    id: number;
    nombre: string;
    direccion: string;
}

const hospitalsKeys = {
    all: ["hospitals"] as const,
    list: () => [...hospitalsKeys.all] as const,
    detail: (id: number) => [...hospitalsKeys.all, id] as const,
};

const mapFromDto = (dto: HospitalDto): Hospital => ({
    id: dto.id,
    name: dto.nombre,
    address: dto.direccion ?? "",
});

const mapToDto = (payload: HospitalPayload) => ({
    nombre: payload.name,
    direccion: payload.address,
});

async function fetchHospitals(): Promise<Hospital[]> {
    const data = await apiRequest<HospitalDto[]>("/centros");
    return data.map(mapFromDto);
}

async function createHospital(payload: HospitalPayload): Promise<Hospital> {
    const dto = await apiRequest<{ id: number; nombre: string; direccion: string }>("/centros", {
        method: "POST",
        body: JSON.stringify(mapToDto(payload)),
    });

    return {
        id: dto.id,
        name: dto.nombre ?? payload.name,
        address: dto.direccion ?? payload.address,
    };
}

async function updateHospital(id: number, payload: HospitalPayload): Promise<void> {
    await apiRequest<void>(`/centros/${id}`, {
        method: "PUT",
        body: JSON.stringify(mapToDto(payload)),
    });
}

async function deleteHospital(id: number): Promise<void> {
    await apiRequest<void>(`/centros/${id}`, {
        method: "DELETE",
        parseJson: false,
    });
}

export function useHospitals() {
    return useQuery({
        queryKey: hospitalsKeys.list(),
        queryFn: fetchHospitals,
    });
}

export function useCreateHospitals() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createHospital,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hospitalsKeys.list() });
        },
    });
}

export function useUpdateHospital() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: number;
            payload: HospitalPayload;
        }) => updateHospital(id, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: hospitalsKeys.list() });
            queryClient.invalidateQueries({ queryKey: hospitalsKeys.detail(variables.id) });
        },
    });
}

export function useDeleteHospital() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteHospital,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hospitalsKeys.list() });
        },
    });
}

export { hospitalsKeys };