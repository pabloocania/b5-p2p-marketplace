import { Input } from "@/components/ui/input";
import { FormInputProps } from "./types";

export const FormInput = ({
  type,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
}: FormInputProps) => (
  <div className="space-y-2">
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
    />
  </div>
);
