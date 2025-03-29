import React from 'react'
import { SearchIcon } from 'lucide-react'
import AutoCompleteInput from '@/components/AutoCompleteInput'

const Search = () => {

    const fetchSuggestionsMock = async (query: string): Promise<string[]> => {

        await new Promise(resolve => setTimeout(resolve, 500));

        const demoSuggestions = [
            "React hooks",
            "React components",
            "React router",
            "React state management",
            "React context API",
            "React performance optimization",
            "React server components",
            "React suspense",
            "React typescript integration"
        ];

        // Filter suggestions based on the query
        return demoSuggestions.filter(suggestion =>
            suggestion.toLowerCase().includes(query.toLowerCase())
        );
    };
    return (
        <div className='flex items-center justify-center flex-col'>
            <h1 className='text-center text-xl my-4 font-black'>Explore </h1>
            <div className='flex gap-1 items-center rounded-lg shadow-xl border border-gray-500 px-2'>
                <AutoCompleteInput
                    datakey='profile'
                    onBlur={() => { }}
                    onSelect={() => { }}
                    customStyles="pl-10 pr-4 w-full rounded-full shadow-md border border-gray-200 focus:border-blue-500"
                    fetchSuggestions={fetchSuggestionsMock}
                    placeholder='search...'
                    customLoading='Loading...'
                    onChange={() => { }}
                />
                <SearchIcon className='cursor-pointer hover:text-amber-500' />
            </div>
        </div>
    )
}

export default Search
