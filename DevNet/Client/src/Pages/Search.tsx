import React from 'react'
import { SearchIcon } from 'lucide-react'

const Search = () => {
    return (
        <div className='flex items-center justify-center flex-col'>
            <h1 className='text-center text-xl my-4 font-black'>Explore </h1>
            <div className='flex gap-1 items-center rounded-lg shadow-xl border border-gray-500 px-2'>
                <input
                    type="text"
                    placeholder='search here'
                    name='search-bar'
                    className='px-4 py-3 outline-none'
                />
                <SearchIcon className='cursor-pointer hover:text-amber-500' />
            </div>
        </div>
    )
}

export default Search
