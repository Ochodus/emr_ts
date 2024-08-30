import { createAction, createReducer } from "@reduxjs/toolkit";

interface LastInspection {
    currentInspection: string
}

export const changeInspection = createAction<LastInspection>('auth/storeLastInspection')

const initialState: LastInspection = {
    currentInspection: "IMOOVE",
}

const inspectionReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(changeInspection, (state, action) => {
            
            state.currentInspection = action.payload.currentInspection
        })
});

export default inspectionReducer;