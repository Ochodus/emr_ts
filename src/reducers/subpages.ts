import { createAction, createReducer } from "@reduxjs/toolkit";

interface LastIndex {
    currentSubPage: string
}

export const changeSubPage = createAction<LastIndex>('auth/storeLastIndex')

const initialState: LastIndex = {
    currentSubPage: "summary",
}

const subpageReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(changeSubPage, (state, action) => {
            
            state.currentSubPage = action.payload.currentSubPage
        })
});

export default subpageReducer;