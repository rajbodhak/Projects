import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ThemeState {
    mode: 'light' | 'dark'
};

const initialState: ThemeState = {
    mode: 'light'
};

//load from the local storage if exist 
try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
        initialState.mode = savedTheme;
    } else if (window.matchMedia('(prefers-color-schema: dark)').matches) {
        //if no present in localstorage 
        initialState.mode = 'dark';
    }
} catch (error) {
    console.log("Localstorage accessing Error", error);
}

export const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.mode = action.payload;

            //store the value in localstorage
            try {
                localStorage.setItem("theme", action.payload);
            } catch (error) {
                console.error("Errro while storing Theme", error)
            }
        },
        toggleTheme: (state) => {
            state.mode = state.mode === 'light' ? 'dark' : 'light';

            //store the value in localstorage
            try {
                localStorage.setItem("theme", state.mode)
            } catch (error) {
                console.error("Error while storing Theme", error);
            }
        }
    }
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;