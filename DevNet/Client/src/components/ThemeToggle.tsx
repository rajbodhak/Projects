import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Rootstate } from "@/redux/store";
import { toggleTheme } from "@/redux/themeSlice";

const ThemeToggle: React.FC = () => {
    const dispatch = useDispatch();
    const { mode } = useSelector((state: Rootstate) => state.theme);

    return (
        <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700"
            aria-label="Toggle theme"
        >
            {mode === 'light' ? 'Dark Mode🌙' : 'light Mode☀️'}
        </button>
    )
}

export default ThemeToggle


