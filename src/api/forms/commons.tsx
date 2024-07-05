import { Dispatch, Fragment, SetStateAction } from "react"
import { InputCellProps } from "../../components/commons/InputLine"
import { AddressForm, NameForm, PhoneNumberForm } from "../../interfaces/form.interface"
import { birthToId } from "../commons/utils"
import { Button } from "react-bootstrap"
import { AddressSearch } from "../../components/commons"


export const createNameInput = (
    values: NameForm,
    validation: boolean,
    idPrefix?: string
) => {
    return {
        fieldName: "성명",
        fieldProps: [
            {
                type: 'text',
                placeholder: "성",
                value: values.lastName,
                onChange: values.setLastName,
                name: 'lastName',
                idPrefix: idPrefix
            },
            {
                type: 'text',
                placeholder: "이름",
                value: values.firstName,
                onChange: values.setFirstName,
                name: 'firstName',
                idPrefix: idPrefix
            }
        ],
        invalidMsg: {
            text: "* 필수 입력란입니다.",
            show: !validation
        }
    } as InputCellProps
}

export const createGenderSelector = (
    values: number,
    onChanges: Dispatch<SetStateAction<number>>,
    validation: boolean,
    idPrefix?: string,
) => {
    return {
        fieldName: "성별",
        fieldProps: [
            {
                type: 'radio',
                label: '남',
                name: `gender`,
                value: '0',
                checkedValue: values,
                onChange: onChanges,
                idPrefix: idPrefix
            },
            {
                type: 'radio',
                label: '여',
                name: `gender`,
                value: '1',
                checkedValue: values,
                onChange: onChanges,
                idPrefix: idPrefix
            },
            {
                type: 'radio',
                label: '기타',
                name: `gender`,
                value: '2',
                checkedValue: values,
                onChange: onChanges,
                idPrefix: idPrefix
            }
        ],
        invalidMsg: {
            text: "* 필수 입력란입니다.",
            show: !validation
        }
    } as InputCellProps
}

export const createBirthInput = (
    values: Date, 
    onChanges: Dispatch<SetStateAction<Date>>,
    validation: boolean,
    idPrefix?: string
) => {
    return createDatePicker('생년월일', values, onChanges, validation, 'birth', idPrefix)
}

export const createRNNInput = (
    birth: Date,
    values: string, 
    onChanges: Dispatch<SetStateAction<string>>,
    validation: boolean,
    idPrefix?: string
) => {
    return {
        fieldName: "주민등록번호",
        fieldProps: [
            {
                type: 'number',
                value: birthToId(birth.toLocaleString('en-CA')) ?? "",
                tail: {
                    text: '-',
                    style: { backgroundColor: 'white' }
                },
                name: 'preRNN',
                readOnly: true,
                idPrefix: idPrefix
            },
            {
                type: 'number',
                value: values,
                name: 'postRNN',
                onChange: onChanges,
                idPrefix: idPrefix
            }
        ],
        invalidMsg: {
            text: "* 필수 입력란입니다.",
            show: !validation
        }
    } as InputCellProps
}

export const createPhoneNumberInput = (
    values: PhoneNumberForm, 
    validation: boolean,
    idPrefix?: string
) => {
    return {
        fieldName: "전화번호",
        fieldProps: [
            {
                type: 'select',
                value: values.firstNumber,
                onChange: values.setFirstNumber,
                tail: {
                    text: '-',
                    style: { backgroundColor: 'white' }
                },
                options: [
                    {text: '010'}
                ],
                name: 'firstPhoneNumber',
                idPrefix: idPrefix
            },
            {
                type: 'text',
                value: values.middleNumber,
                onChange: values.setMiddleNumber,
                tail: {
                    text: '-',
                    style: { backgroundColor: 'white' }
                },
                name: 'middlePhoneNumber',
                idPrefix: idPrefix
            },
            {
                type: 'text',
                value: values.lastNumber,
                onChange: values.setLastNumber,
                name: 'lastPhoneNumber',
                idPrefix: idPrefix
            }
        ],
        invalidMsg: {
            text: "* 필수 입력란입니다.",
            show: !validation
        }
    } as InputCellProps
}

export const createAddressPicker = (
    values: AddressForm, 
    validation: boolean,
    idPrefix?: string
) => {
    return {
        fieldName: '주소',
        fieldProps: [
            {
                type: 'string',
                placeholder: '주소',
                value: values.mainAddress ?? "",
                style: { width: "55%" },
                readOnly: true,
                name: 'mainAddress',
                idPrefix: idPrefix
            },
            {
                type: 'string',
                placeholder: '우편번호',
                value: values.postalCode ?? "",
                style: { width: "20%" },
                readOnly: true,
                idPrefix: idPrefix,
                name: 'postalCode',
                tail: {
                    component: 
                        <Fragment>
                            <Button variant='secondary' onClick={() => values.setIsSearcherOpen(true)}>우편번호 찾기</Button>
                            
                        </Fragment>
                }
            }
        ],
        invalidMsg: {
            text: "* 필수 입력란입니다.",
            show: !validation
        },
        tailComponent: values.isSearcherOpen ? 
        <AddressSearch 
            setClosed={values.setIsSearcherOpen} 
            setAddress={{
                setMainAddress: values.setMainAddress,
                setSubAddress: values.setSubAddress,
                setPostalCode: values.setPostalCode
            }}
        /> : null
    } as InputCellProps
}

export const createAddressDetailInput = (
    values: AddressForm,
    idPrefix?: string
) => {
    return {
        fieldName: '상세 주소',
        fieldProps: [
            {
                type: 'text',
                placeholder: "",
                value: values.subAddress,
                onChange: values.setSubAddress,
                name: 'subAddress',
                idPrefix: idPrefix
            }
        ]
    } as InputCellProps
}


export const createCustomInput = (
    label: string,
    values: string,
    onChanges: Dispatch<SetStateAction<number>>,
    name?: string,
    idPrefix?: string
) => {
    return {
        fieldName: label,
        fieldProps: [
            {
                type: 'text',
                placeholder: "",
                value: values,
                onChange: onChanges,
                name: name,
                idPrefix: idPrefix
            }
        ]
    } as InputCellProps
}

export const createCustomSelector = (
    label: string,
    values: string | number,
    onChanges: Dispatch<SetStateAction<number>> | Dispatch<SetStateAction<string>>,
    options: { text: string, value?: string }[],
    name?: string,
    idPrefix?: string
) => {
    return {
        fieldName: label,
        fieldProps: [
            {
                type: 'select',
                placeholder: "",
                value: `${values}`,
                onChange: onChanges,
                options: options,
                name: name,
                idPrefix: idPrefix
            }
        ]
    } as InputCellProps
}

export const createDatePicker = (
    label: string,
    values: Date, 
    onChanges: Dispatch<SetStateAction<Date>>,
    validation: boolean,
    name?: string,
    idPrefix?: string
) => {
    return {
        fieldName: label,
        fieldProps: [
            {
                type: 'date',
                placeholder: "",
                value: values.toLocaleString('en-CA'),
                onChange: onChanges,
                name: name,
                idPrefix: idPrefix
            }
        ],
        invalidMsg: {
            text: "* 필수 입력란입니다.",
            show: !validation
        }
    } as InputCellProps
}