// src/components/common/form/TextInput.tsx
interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ id, label, value, onChange, required }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && '*'}
    </label>
    <input
      type="text"
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
        focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      required={required}
    />
  </div>
);
