import { createAction, createReducer } from "@reduxjs/toolkit";

interface AuthInfo {
    token: string ,
    email?: string,
    userId?: number,
    isValid?: boolean
}

export const changeAuth = createAction<AuthInfo>('auth/changeAuth')

const initialState: AuthInfo = {
    token: "",
    email: "",
    userId: -1,
    isValid: false,
}

const authReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(changeAuth, (state, action) => {
            state.token = action.payload.token
            state.email = action.payload.email
            state.userId = action.payload.userId
            state.isValid = action.payload.isValid
        })
});

export default authReducer;