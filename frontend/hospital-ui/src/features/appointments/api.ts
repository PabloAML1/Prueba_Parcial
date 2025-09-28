import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/apiClient";

export interface Appointment extends Record<string, unknown> {
  id: number;
  date: string;
  description: string;
  patientName: string;
  centerName: string | null;
  specialtyName?: string | null;
  medicoId: number;
}

export interface AppointmentPayload {
  date: string;
  description: string;
  patientName: string;
  medicoId: number;
}

interface AppointmentDto {
  id: number;
  fecha: string;
  descripcion: string | null;
  paciente_nombre: string | null;
  centro: string | null;
  especialidad?: string | null;
}

const appointmentsKeys = {
  root: ["appointments"] as const,
  doctor: (doctorId: number) => [...appointmentsKeys.root, "doctor", doctorId] as const,
  detail: (appointmentId: number) => [...appointmentsKeys.root, "detail", appointmentId] as const,
};

const toDateInputValue = (value: string | null | undefined): string => {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getUTCFullYear();
  const month = `${parsed.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${parsed.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const mapFromDto = (dto: AppointmentDto, medicoId: number): Appointment => ({
  id: dto.id,
  date: toDateInputValue(dto.fecha),
  description: dto.descripcion ?? "",
  patientName: dto.paciente_nombre ?? "",
  centerName: dto.centro,
  specialtyName: dto.especialidad,
  medicoId,
});

const mapToDto = (payload: AppointmentPayload) => ({
  fecha: payload.date,
  descripcion: payload.description,
  medico_id: payload.medicoId,
  paciente_nombre: payload.patientName,
});

async function fetchAppointments(medicoId: number): Promise<Appointment[]> {
  const data = await apiRequest<AppointmentDto[]>(
    `/consultas-medicas/consultas/medico/${medicoId}`
  );
  return data.map((item) => mapFromDto(item, medicoId));
}

async function createAppointment(payload: AppointmentPayload): Promise<Appointment> {
  const dto = await apiRequest<AppointmentDto>("/consultas-medicas/consultas", {
    method: "POST",
    body: JSON.stringify(mapToDto(payload)),
  });

  return mapFromDto(dto, payload.medicoId);
}

async function updateAppointment(id: number, payload: AppointmentPayload): Promise<void> {
  await apiRequest<void>(`/consultas-medicas/consultas/${id}`, {
    method: "PUT",
    body: JSON.stringify(mapToDto(payload)),
  });
}

async function deleteAppointment(id: number): Promise<void> {
  await apiRequest<void>(`/consultas-medicas/consultas/${id}`, {
    method: "DELETE",
    parseJson: false,
  });
}

export function useAppointments(medicoId: number | undefined) {
  return useQuery({
    queryKey: medicoId
      ? appointmentsKeys.doctor(medicoId)
      : appointmentsKeys.root,
    queryFn: () => fetchAppointments(medicoId as number),
    enabled: Boolean(medicoId),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: appointmentsKeys.doctor(variables.medicoId),
      });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AppointmentPayload }) =>
      updateAppointment(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: appointmentsKeys.doctor(variables.payload.medicoId),
      });
      queryClient.invalidateQueries({
        queryKey: appointmentsKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; medicoId: number }) => deleteAppointment(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: appointmentsKeys.doctor(variables.medicoId),
      });
      queryClient.removeQueries({
        queryKey: appointmentsKeys.detail(variables.id),
      });
    },
  });
}

export { appointmentsKeys };
