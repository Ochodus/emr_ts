import { createAction, createReducer } from "@reduxjs/toolkit";

export const changeCategory = createAction<{e: {value: string, label: string}, type: string}>('filter/changeType')
export const changeValue = createAction<{value: string | {start: number, end: number} | {start: Date, end: Date}, type: string}>('filter/changeValue')
export const addFilter = createAction<StringFilterBuffer | NumberFilterBuffer | DateFilterBuffer>('filter/addFilter')
export const removeFilter = createAction<string>('filter/removeFilter')

interface FilterBuffer {
    category: string,
    label: string,
    key: string | null
}

interface StringValue {value: string}
interface NumberValue {value: {start: number, end: number}}
interface DateValue {value: {start: Date, end: Date}}

type StringFilterBuffer = FilterBuffer & StringValue
type NumberFilterBuffer = FilterBuffer & NumberValue
type DateFilterBuffer = FilterBuffer & DateValue

interface Filters {
    count: number,
    stringFilterBuffer: StringFilterBuffer
    numericFilterBuffer: NumberFilterBuffer
    dateFilterBuffer: DateFilterBuffer
    filters: (StringFilterBuffer | NumberFilterBuffer | DateFilterBuffer)[]
}

const initialState = {
    count: 0,
    stringFilterBuffer: {
        category: "",
        label: "",
        value: "",
        key: null
    },
    numericFilterBuffer: {
        category: "",
        label: "",
        value: {
            start: 0,
            end: 0
        },
        key: null
    },
    dateFilterBuffer: {
        category: "",
        label: "",
        value: {
            start: new Date(),
            end: new Date()
        },
        key: null
    },
    filters: []
} as Filters

const counter = createReducer(initialState, (builder) => {
    builder
        .addCase(changeCategory, (state, action) => {
            if (action.payload.type === "string") {
                state.stringFilterBuffer.category = action.payload.e.value
                state.stringFilterBuffer.label = action.payload.e.label
                state.stringFilterBuffer.key = state.stringFilterBuffer.category + "-" + state.stringFilterBuffer.value
            }
            if (action.payload.type === "numeric") {
                state.numericFilterBuffer.category = action.payload.e.value
                state.numericFilterBuffer.label = action.payload.e.label
                state.numericFilterBuffer.key = state.numericFilterBuffer.category + "-" + state.numericFilterBuffer.value.start + "~" + state.numericFilterBuffer.value.end
            }
            if (action.payload.type === "date") {
                state.dateFilterBuffer.category = action.payload.e.value
                state.dateFilterBuffer.label = action.payload.e.label
                state.dateFilterBuffer.key = state.dateFilterBuffer.category + "-" + state.dateFilterBuffer.value.start + "~" + state.dateFilterBuffer.value.end
            }
        })
        .addCase(changeValue, (state, action) => {
            if (action.payload.type === "string") {
                state.stringFilterBuffer.value = action.payload.value as string
                state.stringFilterBuffer.key = state.stringFilterBuffer.category + "-" + state.stringFilterBuffer.value
            }
            if (action.payload.type === "numeric") {
                state.numericFilterBuffer.value = action.payload.value as {start: number, end: number}
                state.numericFilterBuffer.key = state.numericFilterBuffer.category + "-" + state.numericFilterBuffer.value.start + "~" + state.numericFilterBuffer.value.end
            }
            if (action.payload.type === "date") {
                state.dateFilterBuffer.value = action.payload.value as {start: Date, end: Date}
                state.dateFilterBuffer.key = state.dateFilterBuffer.category + "-" + state.dateFilterBuffer.value
            }
        })
        .addCase(addFilter, (state, action) => {
            state.filters.push(action.payload)
        })
        .addCase(removeFilter, (state, action) => {
            for (let i of state.filters) {
                if (i.key === action.payload) state.filters = state.filters.slice(0, state.filters.indexOf(i)).concat(state.filters.slice(state.filters.indexOf(i)+1))
            }
        })
});

export default counter;