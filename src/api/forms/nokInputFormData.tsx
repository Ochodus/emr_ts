import { Dispatch, SetStateAction } from "react"
import { createCustomSelector } from "./commons"
import { AddressForm } from "../../interfaces/form.interface"

export const createRelationshipSelector = (
    values: string,
    onChanges: Dispatch<SetStateAction<string>>,
    options: { text: string }[],
    nokIndex: number
) => {
    return createCustomSelector(
        '관계', 
        values, 
        onChanges, 
        options.map((option) => { 
            return { text: option.text, value: option.text }
        }),
        'relation',
        `nok-${nokIndex}`
    )
}

export const createSameAddressChecker = (
    values: AddressForm & {isSameWithPatient: boolean, setIsSameWithPatient: React.Dispatch<React.SetStateAction<boolean>>},
    nokIndex: number
) => {
    return {
        fieldProps: [
            {
                type: 'checkbox',
                label: '환자주소와 동일',
                idPrefix: `nok-${nokIndex}`,
                name: `sameAdd`,
                value: `${values.isSameWithPatient}`,
                onChange: values.setIsSameWithPatient,
            }
        ]
    }
}