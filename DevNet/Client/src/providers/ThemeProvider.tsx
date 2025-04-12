import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { Rootstate } from '@/redux/store';

interface ThemeProviderProps {
    children: React.ReactNode
}
const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const { mode } = useSelector((state: Rootstate) => state.theme);

    useEffect(() => {
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [mode])
    return <>{children}</>
}

export default ThemeProvider
