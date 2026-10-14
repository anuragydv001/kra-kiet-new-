// frontend/components/kra-forms/types.ts

export interface KRAFormProps {
  kraCode: string;
  departmentName: string;
  cycle: string;
  hodName?: string;
  formData: any;
  patchFormData: (updates: Partial<any>) => void;
}
