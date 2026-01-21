export interface Material {
  id: number;
  name: string;
  grade: string | null;
  unit: string;
}

export interface MaterialCreate {
  name: string;
  grade?: string | null;
  unit: string;
}

export type MaterialOut = Material;
