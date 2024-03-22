import classNames from "classnames";
import styles from './NokInputForm.module.css'
import { Button } from "react-bootstrap";
import { InputLine } from "../commons";
import { AddressForm, NameForm, NokForm, PatientForm, PhoneNumberForm } from "../../interfaces/form.interface";
import { useEffect, useMemo, useState } from "react";
import { createRelationshipSelector, createSameAddressChecker } from "../../api/forms/nokInputFormData";
import { createGenderSelector, 
    createNameInput, 
    createBirthInput, 
    createRNNInput, 
    createPhoneNumberInput, 
    createAddressPicker, 
    createAddressDetailInput 
} from "../../api/forms/commons";
import { Nok } from "../../interfaces";

interface NokInputFormProps {
    nokList: (NokForm | {})[],
    setNokList: React.Dispatch<React.SetStateAction<({} | NokForm)[]>>,
    handleNokChange: (nok: NokForm, index: number) => void,
    index: number,
    isNew: boolean,
    originNok?: Nok,
    patient: PatientForm
}

const NokInputForm = ({nokList, setNokList, handleNokChange, index, isNew, originNok, patient}: NokInputFormProps) => {
    const cx = classNames.bind(styles);

    const [relationship, setRelationship] = useState('')

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')

    const [gender, setGender] = useState(-1)
    const [birth, setBirth] = useState(new Date())
    const [registrationNumber, setRegistrationNumber] = useState('')

    const [firstNumber, setFirstNumber] = useState('')
    const [middleNumber, setMiddleNumber] = useState('')
    const [lastNumber, setLastNumber] = useState('')

    const [mainAddress, setMainAddress] = useState('')
    const [subAddress, setSubAddress] = useState('')
    const [postalCode, setPostalCode] = useState('')

    const [isSameWithPatient, setIsSameWithPatient] = useState(false)
    const [isSearcherOpen, setIsSearcherOpen] = useState(false)

    const name: NameForm = useMemo(() => {
        return {
            firstName,
            setFirstName,
            lastName,
            setLastName
        }
    }, [firstName, lastName])

    const phoneNumber: PhoneNumberForm = useMemo(() => {
        return {
            firstNumber,
            setFirstNumber,
            middleNumber,
            setMiddleNumber,
            lastNumber,
            setLastNumber
        }
    }, [firstNumber, lastNumber, middleNumber])

    const address: AddressForm = useMemo(() => {
        return {
            mainAddress,
            setMainAddress,
            subAddress,
            setSubAddress,
            postalCode,
            setPostalCode,
            isSearcherOpen,
            setIsSearcherOpen
        } 
    }, [isSearcherOpen, mainAddress, postalCode, subAddress])

    const nok: NokForm = useMemo(() => { 
        return {
            relationship,
            setRelationship,
            name,
            gender,
            setGender,
            birth,
            setBirth,
            registrationNumber,
            setRegistrationNumber,
            phoneNumber,
            address: {...address, isSameWithPatient, setIsSameWithPatient}
        }
    }, [address, birth, gender, isSameWithPatient, name, phoneNumber, registrationNumber, relationship])

    useEffect(() => {
        handleNokChange(nok, index)
    }, [nok])

    useEffect(() => {
        if (!isNew && originNok !== undefined) {
            nok.setRelationship(originNok.relationship ?? "")
            nok.name.setFirstName(originNok.first_name ?? "")
            nok.name.setLastName(originNok.last_name ?? "")
            nok.setGender(+(originNok.sex ?? ""))
            nok.setBirth(new Date(originNok.birthday ?? ""))
            nok.setRegistrationNumber(originNok.social_number ?? "")
            nok.phoneNumber.setFirstNumber(originNok.tel?.split('-')[0] ?? "")
            nok.phoneNumber.setMiddleNumber(originNok.tel?.split('-')[1] ?? "")
            nok.phoneNumber.setLastNumber(originNok.tel?.split('-')[2] ?? "")
            nok.address.setMainAddress(originNok.address ?? "")
            nok.address.setSubAddress(originNok.address_detail ?? "")
            nok.address.setPostalCode(`${originNok.post_number}` ?? "")
        }
    }, [isNew])

    useEffect(() => {
        console.log(isSameWithPatient)
        if (isSameWithPatient) {
            nok.address.setMainAddress(patient.address.mainAddress)
            nok.address.setSubAddress(patient.address.subAddress)
            nok.address.setPostalCode(patient.address.postalCode)
        }
    }, [isSameWithPatient])
    
    return (
        <div className={cx("list-wrapper")} style={{ display: 'flex', padding: '15px 0', borderTop: index === 0 ? undefined : '1px solid gray' }} key={index}>
            <div className={cx("group-content")} style={{ width: '100%', marginTop: '10px' }}>
                <InputLine
                    inputCells={[
                        createRelationshipSelector(
                            nok.relationship, 
                            nok.setRelationship, 
                            [
                                { text: '부' },
                                { text: '모' },
                                { text: '조부' },
                                { text: '조모' },
                                { text: '기타' }
                            ],
                            index
                        ),
                        createNameInput(nok.name, true, `nok-${index}`),
                        createGenderSelector(nok.gender, nok.setGender, true, `nok-${index}`)
                    ]}
                />
                <InputLine
                    inputCells={[
                        createBirthInput(nok.birth, nok.setBirth, true, `nok-${index}`),
                        createRNNInput(nok.birth, nok.registrationNumber, nok.setRegistrationNumber, true, `nok-${index}`)
                    ]}
                />
                <InputLine
                    inputCells={[
                        createPhoneNumberInput(nok.phoneNumber, true, `nok-${index}`)
                    ]}
                />
                <InputLine
                    inputCells={[
                        createSameAddressChecker(nok.address, index)
                    ]}
                />
                <InputLine
                    inputCells={[
                        createAddressPicker(nok.address, true, `nok-${index}`)
                    ]}
                />
                <InputLine
                    inputCells={[
                        createAddressDetailInput(nok.address, `nok-${index}`)
                    ]}
                />
            </div>
            <Button variant="secondary" onClick={() => setNokList([...nokList.slice(0, index), ...nokList.slice(index+1)])}>
                -
            </Button>
        </div>
    )
}

export default NokInputForm