import React, { useState } from 'react'

interface AutoCompleteInputProps {
    staticData?: string[];
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
    staticData,
    placeholder,
    onBlur,
    onSelect,
    onChange,
    customLoading,
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
            if (staticData) {
                result = staticData.filter((item) => {
                    return item.toLowerCase().includes(query.toLowerCase());
                })
            } else if (fetchSuggestions) {
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
                className={customStyles}
            />
        </div>
    )
}

export default AutoCompleteInput
