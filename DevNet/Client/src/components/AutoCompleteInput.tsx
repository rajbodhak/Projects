import React, { useState } from 'react'

interface AutoCompleteInputProps {
    fetchSuggestions: (value: string) => Promise<string[]>;
    placeholder: string;
    customLoading: string;
    onSelect: () => void;
    onBlur: () => void;
    onChange: (value: string) => void;
    customStyles?: string;
    datakey: string;
}

const AutoCompleteInput: React.FC<AutoCompleteInputProps> = ({
    placeholder,
    onBlur,
    onSelect,
    onChange,
    customStyles,
    fetchSuggestions
}) => {
    const [inputValue, setInputValue] = useState(" ");
    const [suggestionsData, setSuggestionData] = useState<string[] | unknown>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        onChange(event.target.value)
    };

    const getSuggestions = async (query: string) => {
        setError(null);
        setLoading(true);

        try {
            let result;
            if (fetchSuggestions) {
                result = await fetchSuggestions(query)
            }
            setSuggestionData(result)
        } catch (error) {
            setError("Failed to Fetch Suggestions");
            setSuggestionData([]);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='w-full'>
            <input
                type="text"
                value={inputValue}
                placeholder={placeholder}
                onBlur={onBlur}
                onSelect={onSelect}
                onChange={handleInputChange}
                className={`w-full py-3 px-4 text-base outline-none transition-all duration-200 bg-white placeholder-gray-400 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 ${customStyles}`}
            />
        </div>
    )
}

export default AutoCompleteInput
