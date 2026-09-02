export interface Persona {
  id: number;
  name: string;
  email: string;
  role: string;
  roleDisplayName: string;
  locationId: number | null;
  locationName: string;
  requiresGeoScope: boolean;
  permissions: string[];
  avatar: string;
}

export interface LaravelFile {
  path: string;
  title: string;
  category: "models" | "controllers" | "middleware" | "scopes" | "requests" | "resources" | "services" | "observers" | "policies" | "seeders" | "routes" | "lang" | "tests" | "bootstrap";
  description: string;
  code: string;
}
