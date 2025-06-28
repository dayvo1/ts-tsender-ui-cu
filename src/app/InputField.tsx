interface InputFieldProps {
    label?: string;
    placeholder: string;
    value: string;
    onChange:(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: string;
    large?: boolean;
}

export default function InputField({
    label,
    placeholder,
    value = "text",
    large = false,
    onChange,
}: InputFieldProps) {
    const inputId = label ? label.toLowerCase().replace(/\s+/g, '-') : 'input-field';

    return (
        <div className={"w-full space-y-2"}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-gray-500"
                >
                    {label}
                </label>

            )}
            
            {large ? (
                <textarea
                    id={inputId}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            ) : (
                <input
                    id={inputId}
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            )}
        </div>
    )
}
