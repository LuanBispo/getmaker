export type UserRole = "admin" | "technician";

export type ProjectStatus =
  | "new"
  | "analyzing"
  | "sent_to_technicians"
  | "negotiating"
  | "closed"
  | "cancelled";

export type Urgency = "low" | "medium" | "high";

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  new: "Novo",
  analyzing: "Em análise",
  sent_to_technicians: "Enviado para técnicos",
  negotiating: "Em negociação",
  closed: "Fechado",
  cancelled: "Cancelado",
};

export const URGENCY_LABELS: Record<Urgency, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  name: string | null;
  email: string | null;
  whatsapp: string | null;
  city_state: string | null;
  created_at: string;
}

export interface Technician {
  id: string;
  user_id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  city_state: string | null;
  specialties: string[] | null;
  closed_projects_count: number;
  created_at: string;
  interests_count?: number;
}

export interface Project {
  id: string;
  client_name: string;
  client_whatsapp: string;
  description: string;
  city_state: string | null;
  budget_range: string | null;
  urgency: Urgency | null;
  status: ProjectStatus;
  created_at: string;
  interests_count?: number;
  user_has_interest?: boolean;
}

export interface ProjectInterest {
  id: string;
  project_id: string;
  technician_id: string;
  created_at: string;
}
