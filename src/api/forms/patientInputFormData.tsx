import { InputCellProps } from "../../components/commons/InputLine"
import { Dispatch, SetStateAction } from "react"
import { User } from "../../interfaces"
import { createDatePicker, createCustomSelector } from "./commons"
import { PhysicalExamForm } from "../../interfaces/form.interface"


export const createHeightInput = (
    values: number, 
    onChanges: React.Dispatch<React.SetStateAction<number>>,
) => {
    return {
        fieldName: '신장',
        fieldProps: [
            {
                type: 'text',
                placeholder: '신장',
                value: values === -1 ? "" : `${values}`,
                onChange: onChanges,
                name: 'height',
                tail: {
                    text: 'cm'
                },
                idPrefix: 'pat'
            }
        ]
    } as InputCellProps
}

export const createWeightInput = (
    values: number, 
    onChanges: React.Dispatch<React.SetStateAction<number>>,
) => {
    return {
        fieldName: '몸무게',
        fieldProps: [
            {
                type: 'text',
                placeholder: '몸무게',
                value: values === -1 ? "" : `${values}`,
                onChange: onChanges,
                name: 'weight',
                tail: {
                    text: 'kg'
                },
                idPrefix: 'pat'
            }
        ]
    } as InputCellProps
}

export const createBloodPressureInput = (
    values: PhysicalExamForm
) => {
    return {
        fieldName: "혈압",
        fieldProps: [
            {
                type: 'number',
                value: values.systolicBloodPressure === -1 ? "" : `${values.systolicBloodPressure}`,
                onChange: values.setSystolicBloodPressure,
                name: 'lowBp',
                tail: {
                    text: '-',
                    style: { backgroundColor: 'white' }
                },
                idPrefix: 'pat'
            },
            {
                type: 'number',
                value: values.diastolicBloodPressure === -1 ? "" : `${values.diastolicBloodPressure}`,
                name: 'highBp',
                onChange: values.setDiastolicBloodPressure,
                idPrefix: 'pat'
            }
        ]
    } as InputCellProps
}

export const createBodyTemperatureInput = (
    values: number,
    onChanges: React.Dispatch<React.SetStateAction<number>>
) => {
    return {
        fieldName: '체온',
        fieldProps: [
            {
                type: 'text',
                placeholder: '체온',
                value: values === -1 ? "" : `${values}`,
                onChange: onChanges,
                name: 'bodyTemp',
                tail: {
                    text: '℃'
                },
                idPrefix: 'pat'
            }
        ]
    } as InputCellProps
}

export const createDoctorSelector = (
    values: number,
    onChanges: Dispatch<SetStateAction<number>>,
    options: User[]
) => {
    return createCustomSelector(
        '담당의', 
        values, 
        onChanges, 
        options.map((user) => { 
            return { text: `${user.last_name}${user.first_name}`, value: `${user.last_name}${user.first_name}` }
        }),
        'doctor',
        'pat'
    )
}

export const createRegDateInput = (
    values: Date, 
    onChanges: Dispatch<SetStateAction<Date>>,
    validation: boolean
) => {
    return createDatePicker('등록일자', values, onChanges, validation, 'regDate', 'pat')
}

export const createMemoInput = (
    values: string, 
    onChanges: Dispatch<SetStateAction<string>>,
) => {
    return {
        fieldName: '메모',
        fieldProps: [
            {
                as: "textarea",
                rows: 3,
                value: values,
                onChange: onChanges,
                name: 'note',
                idPrefix: 'pat'
            }
        ]
    } as InputCellProps
}