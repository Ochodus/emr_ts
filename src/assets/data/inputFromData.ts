import { PatientForm } from "../../components/PatientsTablePage/PatientAddModal"
import { InputCellProps } from "../../components/commons/InputLine"
import { CurrentUser } from "../../pages/UserInformation"

export const createNameInput = (
    values: CurrentUser | PatientForm | undefined, 
    onChanges: (key: string, index?: number) => (value: string) => void,
    validation: boolean
) => {
    return {
        fieldName: "성명",
        fieldProps: [
            {
                type: 'text',
                placeholder: "성",
                value: values?.patientName ?? "",
                onChange: onChanges('lastName')
            },
            {
                type: 'text',
                placeholder: "이름",
                value: values?.firstName ?? "",
                onChange: onChanges('firstName')
            }
        ],
        invalidMsg: {
            text: "* 필수 입력란입니다.",
            show: !validation
        }
    } as InputCellProps
}

export const createPhoneNumberInput = (
    values: CurrentUser | undefined, 
    onChanges: (key: string, index?: number) => (value: string) => void,
    validation: boolean
) => {
    return {
        fieldName: "전화번호",
        fieldProps: [
            {
                type: 'select',
                value: values?.phoneNumber?.find((_, index) => index === 0) ?? "",
                onChange: onChanges('phoneNumber', 0),
                tail: {
                    text: '-',
                    style: { backgroundColor: 'white' }
                },
                options: [
                    {text: '010'}
                ]
            },
            {
                type: 'text',
                value: values?.phoneNumber?.find((_, index) => index === 1) ?? "",
                onChange: onChanges('phoneNumber', 1),
                tail: {
                    text: '-',
                    style: { backgroundColor: 'white' }
                }
            },
            {
                type: 'text',
                value: values?.phoneNumber?.find((_, index) => index === 2) ?? "",
                onChange: onChanges('phoneNumber', 2)
            }
        ],
        invalidMsg: {
            text: "* 필수 입력란입니다.",
            show: !validation
        }
    } as InputCellProps
}

export const createEmailInput = (
    values: CurrentUser | undefined, 
    onChanges: (key: string, index?: number) => (value: string) => void,
    validation: boolean
) => {
    return {
        fieldName: "이메일",
        fieldProps: [
            {
                type: 'text',
                placeholder: "example",
                value: values?.email?.find((_, index) => index === 0) ?? "",
                onChange: onChanges('email', 0),
                tail: {
                    text: '@',
                    style: { backgroundColor: "white" }
                }
            },
            {
                type: 'text',
                placeholder: "",
                value: values?.email?.find((_, index) => index === 1) ?? "",
                onChange: onChanges('email', 1)
            },
            {
                type: 'select',
                placeholder: "",
                value: values?.email?.find((_, index) => index === 2) ?? "",
                onChange: onChanges('email', 2),
                options: [
                    { text: 'gmail.com' },
                    { text: 'naver.com' },
                    { text: 'hanmail.net' },
                    { text: 'nate.com' },
                    { text: 'kakao.com' },
                    { text: '직접 입력' },
                ]
            }
        ],
        invalidMsg: {
            text: "* 필수 입력란입니다.",
            show: !validation
        }
    } as InputCellProps
}

export const createCustomSelector = (
    label: string,
    values: CurrentUser | undefined, 
    onChanges: (key: string, index?: number) => (value: string) => void,
    options: { text: string }[]
) => {
    return {
        fieldName: label,
        fieldProps: [
            {
                type: 'select',
                placeholder: "",
                value: values !== undefined ? values[label] : "",
                onChange: onChanges(label),
                options: options
            }
        ]
    } as InputCellProps
}