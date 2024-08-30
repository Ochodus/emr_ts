import { createAction, createReducer } from "@reduxjs/toolkit";
import { SummaryCardType } from "components/PatientDetailPage/subPages/Summary/SummaryContainer";

interface SummarySelection {
    currentSummary: SummaryCardType[][]
}

export const addRowSummarySelection = createAction<{index: number, value: SummaryCardType}>('auth/addRowSummarySelection')
export const addColumnSummarySelection = createAction<{value: SummaryCardType}>('auth/addColumnSummarySelection')
export const deleteSummarySelection = createAction<{x: number, y: number}>('auth/deleteSummarySelection')

const initialState: SummarySelection = {
    currentSummary: [[{type: "진료 기록", name: "진료 기록", path: []}]]
}

const summaryReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(addRowSummarySelection, (state, action) => {
            let targetRow = [...state.currentSummary[action.payload.index], action.payload.value]
            state.currentSummary[action.payload.index] = targetRow
        })
        .addCase(addColumnSummarySelection, (state, action) => {
            state.currentSummary = [...state.currentSummary, [action.payload.value]]
        })
        .addCase(deleteSummarySelection, (state, action) => {
            let row = action.payload.y
            let column = action.payload.x
            if (state.currentSummary[row].length === 1) {
                state.currentSummary = [...state.currentSummary.slice(0, row), ...state.currentSummary.slice(row+1)]
            }
            else {
                state.currentSummary[row] = [...state.currentSummary[row].slice(0, column), ...state.currentSummary[row].slice(column+1)]
            }
        })
});

export default summaryReducer;

/*

if (cardTypes[row].length === 1) {
      setCardTypes([...cardTypes.slice(0, row), ...cardTypes.slice(row+1)])
      setData([...data.slice(0, row), ...data.slice(row+1)])
    }
    else {
      updateDeepValue(setCardTypes, [row], [...cardTypes[row].slice(0, col), ...cardTypes[row].slice(col+1)])
      updateDeepValue(setData, [row], [...data[row].slice(0, col), ...data[row].slice(col+1)])
    }

*/