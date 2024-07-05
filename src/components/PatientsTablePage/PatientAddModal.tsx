import { useState, useEffect, useMemo } from 'react'
import { AxiosResponse } from 'axios'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { useLocalTokenValidation } from '../../api/commons/auth'
import styles from './PatientAddModal.module.css'
import classNames from 'classnames/bind'
import { InputLine } from '../commons'
import { Patient, User, PhysicalExam } from '../../interfaces'
import { useRequestAPI } from '../../api/commons/request'
import { createGenderSelector, 
    createNameInput, 
    createBirthInput, 
    createRNNInput, 
    createPhoneNumberInput, 
    createAddressPicker, 
    createAddressDetailInput 
} from '../../api/forms/commons'
import { createBloodPressureInput, 
    createBodyTemperatureInput, 
    createDoctorSelector, 
    createHeightInput, 
    createMemoInput, 
    createRegDateInput, 
    createWeightInput 
} from '../../api/forms/patientInputFormData'
import { AddressForm, NameForm, NokForm, PatientForm, PhoneNumberForm, PhysicalExamForm } from '../../interfaces/form.interface'
import NokInputForm from './NokInputForm'


interface PatientAddModalProps {
    show: boolean, 
    isNew: boolean
    selectedPatient: Patient | null,
    addPatient: (newPatient: Patient, isNew: boolean) => Promise<AxiosResponse<any, any> | undefined>
    addPhysicalExam: (newPhysicalExam: PhysicalExam, patient_id: number) => void
    handleClose: () => void,
    axiosMode: boolean
}

const PatientAddModal = ({ show, isNew, selectedPatient, addPatient, addPhysicalExam, handleClose, axiosMode }: PatientAddModalProps) => {
    const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수
    const request = useRequestAPI()

    const cx = classNames.bind(styles);

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')

    const [firstNumber, setFirstNumber] = useState('')
    const [middleNumber, setMiddleNumber] = useState('')
    const [lastNumber, setLastNumber] = useState('')

    const [mainAddress, setMainAddress] = useState('')
    const [subAddress, setSubAddress] = useState('')
    const [postalCode, setPostalCode] = useState('')
    const [isSearcherOpen, setIsSearcherOpen] = useState(false)

    const [gender, setGender] = useState(-1)
    const [birth, setBirth] = useState(new Date())
    const [registrationNumber, setRegistrationNumber] = useState('')

    const [regDate, setRegDate] = useState(new Date())
    const [doctor, setDoctor] = useState(-1)
    const [note, setNote] = useState('')

    const [recorded, setRecorded] = useState(new Date())
    const [height, setHeight] = useState(-1)
    const [weight, setWeight] = useState(-1)
    const [systolicBloodPressure, setSystolicBloodPressure] = useState(-1)
    const [diastolicBloodPressure, setDiastolicBloodPressure] = useState(-1)
    const [bodyTemperature, setBodyTemperature] = useState(-1)

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
    }, [firstNumber, middleNumber, lastNumber])

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
    }, [mainAddress, subAddress, postalCode, isSearcherOpen])

    const patientForm: PatientForm = useMemo(() => {
        return {
            name,
            gender,
            setGender,
            birth,
            setBirth,
            registrationNumber,
            setRegistrationNumber,
            phoneNumber,
            address,
            regDate,
            setRegDate,
            doctor,
            setDoctor,
            note,
            setNote
        }
    }, [name, gender, birth, registrationNumber, phoneNumber, address, regDate, doctor, note])

    const physicalExamForm: PhysicalExamForm = useMemo(() => {
        return {
            recorded,
            setRecorded,
            height,
            setHeight,
            weight,
            setWeight,
            systolicBloodPressure,
            setSystolicBloodPressure,
            diastolicBloodPressure,
            setDiastolicBloodPressure,
            bodyTemperature,
            setBodyTemperature
        }
    }, [recorded, height, weight, systolicBloodPressure, diastolicBloodPressure, bodyTemperature])

    const [nokList, setNokList] = useState<(NokForm | {})[]>([])

    const [userList, setUserList] = useState<User[]>([])

    const [isTriedToEdit, setIsTriedToEdit] = useState(false) // 회원 가입 시도 여부

    const handleNokChange = (nok: NokForm, index: number) => {
        setNokList([...nokList.slice(0, index), nok, ...nokList.slice(index + 1)])
    }

    const renderSelected = () => {
        if (!isNew && selectedPatient) {
            patientForm.name.setFirstName(selectedPatient.first_name)
            patientForm.name.setLastName(selectedPatient.last_name)
            patientForm.setGender(selectedPatient.sex)
            patientForm.setBirth(new Date(selectedPatient.birthday))
            patientForm.setRegistrationNumber(selectedPatient.social_number)
            patientForm.phoneNumber.setFirstNumber(selectedPatient.tel.split("-")[0])
            patientForm.phoneNumber.setMiddleNumber(selectedPatient.tel.split("-")[1])
            patientForm.phoneNumber.setLastNumber(selectedPatient.tel.split("-")[2])
            patientForm.address.setMainAddress(selectedPatient.address)
            patientForm.address.setSubAddress(selectedPatient.address_detail ?? "")
            patientForm.address.setPostalCode(`${selectedPatient.post_number}`)
            patientForm.setDoctor(selectedPatient.user_id)
            patientForm.setNote(selectedPatient.memo ?? "")
            setNokList(selectedPatient.noks.map( _ => { return {} } ))
        }
    }

    const handleAddPatient = () => {
        setIsTriedToEdit(true)

        const newPatient: Patient = {
            first_name: patientForm.name.firstName,
            last_name: patientForm.name.lastName,
            sex: +`${patientForm.gender}`,
            birthday: patientForm.birth.toLocaleString('en-CA'),
            last_recorded: patientForm.regDate,
            tel: `${patientForm.phoneNumber.firstNumber}-${patientForm.phoneNumber.middleNumber}-${patientForm.phoneNumber.lastNumber}`,
            address: patientForm.address.mainAddress,
            address_detail: patientForm.address.subAddress,
            post_number: +patientForm.address.postalCode,
            social_number: patientForm.registrationNumber,
            user_id: patientForm.doctor,
            memo: patientForm.note,
            noks: nokList.filter((nok): nok is NokForm => { return 'relationship' in nok }).map((nok) => {
                    console.log(nokList)
                    return {
                        relationship: nok.relationship,
                        first_name: nok.name.firstName,
                        last_name: nok.name.lastName,
                        sex: nok.gender,
                        birthday: nok.birth.toLocaleString('en-CA'),
                        tel: `${nok.phoneNumber.firstNumber}-${nok.phoneNumber.middleNumber}-${nok.phoneNumber.lastNumber}`,
                        address: nok.address.mainAddress,
                        address_detail: nok.address.subAddress,
                        post_number: +nok.address.postalCode,
                        social_number: nok.registrationNumber
                    }
            })
        }

        const newPhysicalExam: PhysicalExam = {
            recorded: `${patientForm.regDate.toLocaleString('en-CA')}T${new Date().toLocaleTimeString('it-IT')}`,
            height: physicalExamForm.height,
            weight: physicalExamForm.weight,
            systolic_blood_pressure: physicalExamForm.systolicBloodPressure,
            diastolic_blood_pressure: physicalExamForm.diastolicBloodPressure,
            body_temperature: physicalExamForm.bodyTemperature,
        }

        addPatient(newPatient, isNew).then((response) => {
            if (isNew && response) addPhysicalExam(newPhysicalExam, response.data.id)
        })
        
        handleClose()
    }

    useEffect(() => { 
        if (axiosMode) {
            checkAuth(".")
            request("/api/users", 'get', undefined, setUserList)
        }
    }, [axiosMode, checkAuth, request])

    useEffect(() => {
        console.log(userList)
    }, [userList])

    useEffect(() => {
		let testMode = true
		if (process.env.NODE_ENV !== 'development' || testMode) checkAuth()
	  }, [checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사

    return (
        <Modal show={show} onShow={renderSelected} onHide={handleClose} size='xl'>
            <Modal.Header style={{paddingLeft: "20px", paddingRight: "40px"}} closeButton>
            <Modal.Title>
                <span className={cx("title")}>
                    <strong>환자 {isNew ? "추가" : "편집"}</strong>
                </span></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className={cx("contents")}>
                    <div className={cx("page-title")}>
                        <span>기본 정보</span>
                    </div>
                    <div className={cx("page-content")}>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")}>
                                <span>환자 정보</span>
                            </div>
                            <div className={cx("group-content")}>
                                <InputLine
                                    inputCells={[
                                        createNameInput(patientForm.name, true, 'pat'),
                                        createGenderSelector(patientForm.gender, patientForm.setGender, true, 'pat')
                                    ]}
                                />
                                <InputLine 
                                    inputCells={[
                                        createBirthInput(patientForm.birth, patientForm.setBirth, true, 'pat'),
                                        createRNNInput(patientForm.birth, patientForm.registrationNumber, patientForm.setRegistrationNumber, true, 'pat')
                                    ]}
                                />
                                <InputLine
                                    inputCells={[
                                        createPhoneNumberInput(patientForm.phoneNumber, true, 'pat')
                                    ]}
                                />
                                <InputLine
                                    inputCells={[
                                        createAddressPicker(patientForm.address, true, 'pat')
                                    ]}
                                />
                                <InputLine
                                    inputCells={[
                                        createAddressDetailInput(patientForm.address, 'pat')
                                    ]}
                                />
                                {isNew &&
                                    <InputLine
                                        inputCells={[
                                            createHeightInput(physicalExamForm.height, physicalExamForm.setHeight),
                                            createWeightInput(physicalExamForm.weight, physicalExamForm.setWeight)
                                        ]}
                                    />
                                }
                                {isNew &&
                                    <InputLine
                                        inputCells={[
                                            createBloodPressureInput(physicalExamForm),
                                            createBodyTemperatureInput(physicalExamForm.bodyTemperature, physicalExamForm.setBodyTemperature)
                                        ]}
                                    />
                                }
                                <InputLine
                                    inputCells={isNew ? [
                                            createDoctorSelector(patientForm.doctor, patientForm.setDoctor, userList),
                                            createRegDateInput(patientForm.regDate, patientForm.setRegDate, true)
                                        ] :
                                        [createDoctorSelector(patientForm.doctor, patientForm.setDoctor, userList)]
                                    }
                                />
                                <InputLine
                                    inputCells={[
                                        createMemoInput(patientForm.note, patientForm.setNote)
                                    ]}
                                />
                            </div>
                        </div>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")} style={{ display: 'flex', justifyContent: 'space-between', lineHeight: '38px'}}>
                                <span>보호자 정보</span>
                                <Button variant="secondary" onClick={() => setNokList([...nokList, {}])}>
                                    추가
                                </Button>
                            </div>
                            {}
                            {nokList.map((_, index) => {
                                return(
                                    <NokInputForm
                                        key={index}
                                        nokList={nokList}
                                        setNokList={setNokList}
                                        handleNokChange={handleNokChange}
                                        index={index}
                                        isNew={isNew}
                                        originNok={selectedPatient?.noks[index]}
                                        patient={patientForm}
                                    />
                                )
                            })}
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className={cx("inline-btn")}>
                    <Button variant="primary" onClick={handleAddPatient}>
                        {isNew ? "추가": "변경"}
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                        취소
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
        
    )
}

export default PatientAddModal
