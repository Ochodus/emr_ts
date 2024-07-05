import { findElement } from "../commons/utils"
import { InputCellProps } from "../../components/commons/InputLine"
import { CurrentUser } from "../../pages/UserInformation"

export const createUserNameInput = (
    values: CurrentUser | undefined,
    onChanges: (key: string, index?: number) => (value: string) => void,
    validation: boolean
) => {
    return {
        fieldName: "성명",
        fieldProps: [
            {
                type: 'text',
                placeholder: "성",
                value: findElement(values?.name, 0) ?? "",
                onChange: onChanges('name', 0)
            },
            {
                type: 'text',
                placeholder: "이름",
                value: findElement(values?.name, 1) ?? "",
                onChange: onChanges('name', 1)
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
                value: findElement(values?.phoneNumber, 0) ?? "",
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
                value: findElement(values?.phoneNumber, 1) ?? "",
                onChange: onChanges('phoneNumber', 1),
                tail: {
                    text: '-',
                    style: { backgroundColor: 'white' }
                }
            },
            {
                type: 'text',
                value: findElement(values?.phoneNumber, 2) ?? "",
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
                value: findElement(values?.email, 0) ?? "",
                onChange: onChanges('email', 0),
                tail: {
                    text: '@',
                    style: { backgroundColor: "white" }
                }
            },
            {
                type: 'text',
                placeholder: "",
                value: findElement(values?.email, 1) ?? "",
                onChange: onChanges('email', 1)
            },
            {
                type: 'select',
                placeholder: "",
                value: findElement(values?.email, 2) ?? "",
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
    key: string,
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
                value: values !== undefined ? values[key] : "",
                onChange: onChanges(key),
                options: options
            }
        ]
    } as InputCellProps
}