import { useState, useEffect, useCallback, useMemo } from 'react'
import axios, { AxiosResponse } from 'axios'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { useLocalTokenValidation } from '../../api/commons/auth'
import styles from './PatientAddModal.module.css'
import classNames from 'classnames/bind'
import { AddressSearch, InputLine } from '../commons'
import { Patient, User, PhysicalExam, Nok } from '../../interfaces'
import { useRequestAPI } from '../../api/commons/request'
import { createNameInput } from '../../assets/data/inputFromData'
import { findElement } from '../../api/commons/utils'

interface PatientAddModalProps {
    show: boolean, 
    isNew: boolean
    selectedPatient: Patient | null,
    addPatient: (newPatient: Patient, isNew: boolean) => Promise<AxiosResponse<any, any> | undefined>
    addPhysicalExam: (newPhysicalExam: PhysicalExam, patient_id: number) => void
    handleClose: () => void, 
    axiosMode: boolean
}

export interface PatientForm {
    [index: string]: string | string[] | (Nok & {isSameAddr?: boolean})[] | undefined
    patientName?: string[],
    patientGender?: string,
    patientBirth?: string,
    patientRRN?: string,
    patientPhoneNumber?: string[],
    patientAddress?: string[],
    patientDoctor?: string,
    patientRegDate?: string,
    patientNote?: string,
    patientHeight?: string,
    patientWeight?: string,
    patientHighBp?: string,
    patientLowBp?: string,
    patientTemperature?: string,
    nokList?: (Nok & {isSameAddr?: boolean})[]
}

const PatientAddModal = ({ show, isNew, selectedPatient, addPatient, addPhysicalExam, handleClose, axiosMode }: PatientAddModalProps) => {
    const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수
    const request = useRequestAPI()
    const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

    const cx = classNames.bind(styles);

    const [currentPatient, setCurrentPatient] = useState<PatientForm>()
    const [patientName, setPatientName] = useState(["", ""])
    const [patientGender, setPatientGender] = useState("")
    const [patientBirth, setPatientBirth] = useState("")
    const [patientRRN, setPatientRRN] = useState("")

    const [patientPhoneNumber, setPatientPhoneNumber] = useState(["010", "", ""])

    const [patientAddress, setPatientAddress] = useState(["", "", ""])
    const [patientDoctor, setPatientDoctor] = useState("미지정")
    const [patientRegDate, setPatientRegDate] = useState((new Date()).toLocaleDateString('en-CA'))
    const [patientNote, setPatientNote] = useState("")

    const [patientHeight, setPatientHeight] = useState("")
    const [patientWeight, setPatientWeight] = useState("")
    const [patientHighBp, setPatientHighBp] = useState("")
    const [patientLowBp, setPatientLowBp] = useState("") 
    const [patientTemperature, setPatientTemperature] = useState("")

    const [nokList, setNokList] = useState<(Nok & {isSameAddr?: boolean})[]>([{}])

    const [isPatientAddressSearcherOpen, setIsPatientAddressSearcherOpen] = useState(false)
    const [isNokAddressSearcherOpen, setIsNokAddressSearcherOpen] = useState(false)

    const [userList, setUserList] = useState<User[]>([])

    const [isTriedToEdit, setIsTriedToEdit] = useState(false) // 회원 가입 시도 여부
    const [isFormValid, setIsFormValid] = useState({
		name: false,
		phoneNumber: false,
	})

    const updateCurrentPatient = (key: string, index?: number) => {
        let newPatient = {...currentPatient}
		let target = newPatient[key]
		return (value: string) => {
			if (Array.isArray(target) && index !== undefined) {
				target[index] = value
				if (key === 'email') {
					if (index === 2 && value !== '직접 입력') {
						target[1] = value
					}
					else if (index === 2) {
						target[1] = ""
					}
				}
			}
			else {
				newPatient[key] = value
			}
	
			setCurrentPatient(newPatient)
		}
    }

    const formValidationCheck = () => {
		let nameCheck = currentPatient?.patientName?.find((_, index) => index === 0) !== "" && currentPatient?.patientName?.find((_, index) => index === 1) !== ""
		let phoneNumberCheck = currentPatient?.patientPhoneNumber?.find((_, index) => index === 1) !== "" && currentPatient?.patientPhoneNumber?.find((_, index) => index === 2) !== ""
	
		setIsFormValid({
		  ...isFormValid,
		  name: nameCheck,
		  phoneNumber: phoneNumberCheck,
		})
		
		return nameCheck && phoneNumberCheck
	} // 회원 가입 폼 유효성 검사

    const handlePatientGenderRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPatientGender(e.target.id.split("-").slice(-1)[0])
    }

    const handleNokListChange = (value: string | boolean | (string | boolean)[], index: number, field: string | string[]) => {
        let updatedNok = {...nokList[index]}
        if (Array.isArray(value) && Array.isArray(field)) {
            value.map((v, index) => { 
                updatedNok[field[index]] = v
            })
            setNokList([...nokList.slice(0, index), {...updatedNok, }, ...nokList.slice(index + 1)])
        }
        else if (!Array.isArray(value) && !Array.isArray(field)) {
            updatedNok[field] = value
            setNokList([...nokList.slice(0, index), {...updatedNok, }, ...nokList.slice(index + 1)])
        }
    }

    const renderSelected = () => {
        if (!isNew && selectedPatient) {
            setPatientGender(`${selectedPatient.sex}`)
            setPatientName([selectedPatient.last_name, selectedPatient.first_name])
            document.getElementById(`gender-radio-${selectedPatient.sex}`)?.click()
            setPatientBirth(new Date(selectedPatient.birthday).toLocaleDateString('en-CA'))
            setPatientRRN(`${selectedPatient.social_number}`)
            setPatientPhoneNumber([...selectedPatient.tel.split("-")])
            setPatientAddress([selectedPatient.address, selectedPatient.address_detail ?? "", `${selectedPatient.post_number}`])
            setPatientDoctor(`${selectedPatient.user_id}`)
            setPatientNote(selectedPatient.memo ?? "")
            setNokList(selectedPatient.noks)
        }
    }

    const birthToId = (birth: string | undefined) => {
        if (birth && birth.substr(2)) return birth.substr(2).replace(/-/g, "")
        else return ""
    }

    const handleAddPatient = () => {
        setIsTriedToEdit(true)
		if (!formValidationCheck()) {
			alert("유효하지 않은 입력 필드가 있습니다.")
			return
		}
        
        // console.log(
        //     isNew ? "add" : ("edit - " + selectedPatient?.last_name + selectedPatient?.first_name),
        //     "\nname: " + patientName[0] + " " + patientName[1],
        //     "\ngender: " + patientGender,
        //     "\nbirth: " + patientBirth,
        //     "\nrrn: " + patientRRN,
        //     "\nphone number: " + patientPhoneNumber[0] + "-" + patientPhoneNumber[1] + "-" + patientPhoneNumber[2],
        //     "\naddress: " + patientAddress[0],
        //     "\npostal code: " + patientAddress[2],
        //     "\nmore address: " + patientAddress[1],
        //     "\nheight: " + patientHeight,
        //     "\nweight: " + patientWeight,
        //     "\nblood pressure: " + patientLowBp + "~" + patientHighBp,
        //     "\ndoctor: " + patientDoctor,
        //     "\nregister date: " + patientRegDate,
        //     "\nmemo: " + patientNote,
        //     "\nnoks: " + nokList
        // )

        const newPatient: Patient = {
            first_name: findElement(currentPatient?.patientName, 0) ?? "",
            last_name: findElement(currentPatient?.patientName, 1) ?? "",
            sex: +(currentPatient?.patientGender ?? ""),
            birthday: currentPatient?.patientBirth ?? "",
            last_recorded: new Date(currentPatient?.patientRegDate ?? ""),
            tel: `${findElement(currentPatient?.patientPhoneNumber, 0)}-${findElement(currentPatient?.patientPhoneNumber, 1)}-${findElement(currentPatient?.patientPhoneNumber, 2)}`,
            address: findElement(currentPatient?.patientAddress, 0) ?? "",
            address_detail: findElement(currentPatient?.patientAddress, 1) ?? "",
            post_number: +(findElement(currentPatient?.patientAddress, 2) ?? ""),
            social_number: currentPatient?.patientRRN ?? "",
            user_id: currentPatient?.patientDoctor === "미지정" ? -1 : +(currentPatient?.patientDoctor ?? ""),
            memo: currentPatient?.patientNote,
            noks: [...(currentPatient?.nokList ?? [])],
        }

        const newPhysicalExam: PhysicalExam = {
            recorded: `${patientRegDate}T${new Date().toLocaleTimeString('it-IT')}`,
            height: +patientHeight,
            weight: +patientWeight,
            systolic_blood_pressure: +patientHighBp,
            diastolic_blood_pressure: +patientLowBp,
            body_temperature: +patientTemperature
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
        selectedPatient?.noks.map((nok, index) => {
            console.log(`gender-radio-${nok.sex}-${index}`)
            console.log(document.getElementById(`gender-radio-${nok.sex}-${index}`))
            document.getElementById(`gender-radio-${nok.sex}-${index}`)?.click()
        }
    )}, [nokList])

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
                                <div className={cx("inline")}>
                                    <InputLine
                                        inputCells={[createNameInput(currentPatient, updateCurrentPatient, isFormValid.name || !isTriedToEdit)]}
                                    />
                                    <div className={cx("input-padding")}></div>
                                    <div className={`${cx("cell")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>성별</InputGroup.Text>
                                            <Form.Check
                                                inline
                                                type="radio"
                                                id="gender-radio-0"
                                                label="남"
                                                name="gender"
                                                className={cx("radio-cell")}
                                                onChange={(e) => handlePatientGenderRadioChange(e)}
                                            >
                                            </Form.Check>
                                            <Form.Check
                                                inline
                                                type="radio"
                                                id="gender-radio-1"
                                                label="여"
                                                name="gender"
                                                className={cx("radio-cell")}
                                                onChange={(e) => handlePatientGenderRadioChange(e)}
                                            >
                                            </Form.Check>
                                            <Form.Check
                                                inline
                                                type="radio"
                                                id="gender-radio-2"
                                                label="기타"
                                                name="gender"
                                                className={cx("radio-cell")}
                                                onChange={(e) => handlePatientGenderRadioChange(e)}
                                            >
                                            </Form.Check>
                                        </InputGroup>
                                    </div>
                                </div>
                                <div className={cx("inline")}>
                                    <div className={cx("cell")}>
                                        <InputGroup>
                                            <InputGroup.Text>생년월일</InputGroup.Text>
                                            <Form.Control
                                                type="date"
                                                value={patientBirth}
                                                onChange={(e) => setPatientBirth(e.target.value)}
                                            >
                                            </Form.Control>
                                        </InputGroup>
                                    </div>
                                    <div className={cx("cell")}>
                                        <InputGroup>
                                            <InputGroup.Text>주민등록번호</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                value={birthToId(patientBirth)}
                                                className={cx("patientId")}
                                                readOnly
                                            >
                                            </Form.Control>
                                            <div className={cx("dash")}> - </div>
                                            <Form.Control
                                                type="number"
                                                value={patientRRN}
                                                className={cx("patientId")}
                                                onChange={(e) => setPatientRRN(e.target.value)}
                                            >
                                            </Form.Control>
                                        </InputGroup>
                                    </div>
                                </div>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>휴대폰 번호</InputGroup.Text>
                                            <Form.Select
                                                value={patientPhoneNumber[0]}
                                                onChange={(e) => setPatientPhoneNumber([e.target.value, patientPhoneNumber[1], patientPhoneNumber[2]])}
                                            >
                                                <option>010</option>
                                            </Form.Select>
                                            <div className={cx("dash")}> - </div>
                                            <Form.Control
                                                type="number"
                                                value={patientPhoneNumber[1]}
                                                className={cx("phoneNumber")}
                                                onChange={(e) => setPatientPhoneNumber([patientPhoneNumber[0], e.target.value, patientPhoneNumber[2]])}
                                            >
                                            </Form.Control>
                                            <div className={cx("dash")}> - </div>
                                            <Form.Control
                                                type="number"
                                                value={patientPhoneNumber[2]}
                                                className={cx("phoneNumber")}
                                                onChange={(e) => setPatientPhoneNumber([patientPhoneNumber[0], patientPhoneNumber[1], e.target.value])}
                                            >
                                            </Form.Control>
                                        </InputGroup>
                                    </div>
                                </div>
                                <div className={cx("inline")}>
                                    <div className={cx("cell")}>
                                        <InputGroup>
                                            <InputGroup.Text>주소</InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="주소"
                                                value={patientAddress[0]}
                                                style={{ width: "55%" }}
                                                onChange={(e) => setPatientAddress([e.target.value, patientAddress[1], patientAddress[2]])}
                                                readOnly
                                            >
                                            </Form.Control>
                                            <Form.Control
                                                type="number"
                                                placeholder="우편 번호"
                                                value={patientAddress[2]}
                                                className={cx("postalCode")}
                                                onChange={(e) => setPatientAddress([patientAddress[0], patientAddress[1], e.target.value])}
                                                style={{ width: "20%" }}
                                                readOnly
                                            >
                                            </Form.Control>
                                            <Button 
                                                variant="secondary" 
                                                style={{ width: "15%" }}
                                                onClick={() => setIsPatientAddressSearcherOpen(true)}
                                            >
                                                우편번호 찾기
                                            </Button>
                                        </InputGroup>
                                        { isPatientAddressSearcherOpen ? 
                                        <AddressSearch 
                                            setClosed={setIsPatientAddressSearcherOpen}
                                            setAddress={setPatientAddress}
                                        /> : 
                                        null }
                                    </div>
                                </div>
                                <div className={cx("inline")}>
                                    <div className={cx("cell")}>
                                        <InputGroup>
                                            <InputGroup.Text>상세 주소</InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="상세 주소"
                                                value={patientAddress[1]}
                                                onChange={(e) => setPatientAddress([patientAddress[0], e.target.value, patientAddress[2]])}
                                            >
                                            </Form.Control>
                                        </InputGroup>
                                    </div>
                                </div>
                                {isNew &&
                                    <div className={cx("inline")}>
                                        <div className={`${cx("cell")} ${cx("small")}`}>
                                            <InputGroup>
                                                <InputGroup.Text>신장</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="신장"
                                                    value={patientHeight}
                                                    onChange={(e) => setPatientHeight(e.target.value)}
                                                >
                                                </Form.Control>
                                                <InputGroup.Text>cm</InputGroup.Text>
                                            </InputGroup>
                                        </div>
                                        <div className={`${cx("cell")} ${cx("small")}`}>
                                            <InputGroup>
                                                <InputGroup.Text>몸무게</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="몸무게"
                                                    value={patientWeight}
                                                    onChange={(e) => setPatientWeight(e.target.value)}
                                                >
                                                </Form.Control>
                                                <InputGroup.Text>kg</InputGroup.Text>
                                            </InputGroup>
                                        </div>
                                    </div>
                                }
                                {isNew &&
                                    <div className={cx("inline")}>
                                        <div className={`${cx("cell")} ${cx("small")}`}>
                                            <InputGroup>
                                                <InputGroup.Text>혈압</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="최저혈압"
                                                    value={patientLowBp}
                                                    onChange={(e) => setPatientLowBp(e.target.value)}
                                                >
                                                </Form.Control>
                                                <div className={cx("dash")}> ~ </div>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="최고혈압"
                                                    value={patientHighBp}
                                                    onChange={(e) => setPatientHighBp(e.target.value)}
                                                >
                                                </Form.Control>
                                            </InputGroup>
                                        </div>
                                        <div className={`${cx("cell")} ${cx("small")}`}>
                                            <InputGroup>
                                                <InputGroup.Text>체온</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="체온"
                                                    value={patientTemperature}
                                                    onChange={(e) => setPatientTemperature(e.target.value)}
                                                >
                                                </Form.Control>
                                                <InputGroup.Text>℃</InputGroup.Text>
                                            </InputGroup>
                                        </div>
                                    </div>
                                }
                                
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>담당의</InputGroup.Text>
                                            <Form.Select
                                                value={patientDoctor}
                                                onChange={(e) => setPatientDoctor(e.target.value)}
                                            >
                                                <option key={-1} value={-1}>미지정</option>
                                                {userList.map((user) => {
                                                    return (
                                                        <option key={user.id} value={user.id}>{`${user.position} ${user.last_name}${user.first_name}`}</option>
                                                    )
                                                })}
                                            </Form.Select>
                                        </InputGroup>
                                    </div>
                                    {isNew && 
                                        <div className={cx("cell")}>
                                            <InputGroup>
                                                <InputGroup.Text>등록일자</InputGroup.Text>
                                                <Form.Control
                                                    type="date"
                                                    value={patientRegDate}
                                                    onChange={(e)=> setPatientRegDate(e.target.value)}
                                                >
                                                </Form.Control>
                                            </InputGroup>
                                        </div>
                                    }
                                </div>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>메모</InputGroup.Text>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={patientNote}
                                                onChange={(e) => setPatientNote(e.target.value)}
                                            >

                                            </Form.Control>
                                        </InputGroup>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")} style={{ display: 'flex', justifyContent: 'space-between', lineHeight: '38px'}}>
                                <span>보호자 정보</span>
                                <Button variant="secondary" onClick={() => setNokList([...nokList, {}])}>
                                    추가
                                </Button>
                            </div>
                            {nokList.map((nok, index) => {
                                return (
                                    <div className={cx("list-wrapper")} style={{ display: 'flex', padding: '15px 0', borderTop: index==0 ? undefined : '1px solid gray' }} key={index}>
                                        <div className={cx("group-content")}>
                                            <div className={cx("inline")}>
                                                <div className={`${cx("cell")} ${cx("small")}`}>
                                                    <InputGroup>
                                                        <InputGroup.Text>가족 관계</InputGroup.Text>
                                                        <Form.Select 
                                                            value={nok.relationship}
                                                            onChange={(e) => handleNokListChange(e.target.value, index, "relationship")}
                                                        >
                                                            <option>부</option>
                                                            <option>모</option>
                                                            <option>조부</option>
                                                            <option>조모</option>
                                                            <option>기타</option>
                                                        </Form.Select>
                                                    </InputGroup>
                                                </div>
                                                <div className={`${cx("cell")} ${cx("small")}`}>
                                                    <InputGroup>
                                                        <InputGroup.Text>성명</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="성"
                                                            value={nok.last_name ?? ""}
                                                            onChange={(e) => handleNokListChange(e.target.value, index, "last_name")}
                                                        >
                                                        </Form.Control>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="이름"
                                                            value={nok.first_name ?? ""}
                                                            onChange={(e) => handleNokListChange(e.target.value, index, "first_name")}
                                                        ></Form.Control>
                                                    </InputGroup>
                                                </div>
                                                <div className={`${cx("cell")}`}>
                                                    <InputGroup>
                                                        <InputGroup.Text>성별</InputGroup.Text>
                                                        <Form.Check
                                                            inline
                                                            type="radio"
                                                            id={`gender-radio-0-${index}`}
                                                            label="남"
                                                            name={`gender-${index}`}
                                                            className={cx("radio-cell")}
                                                            onChange={(e) => handleNokListChange(e.target.id.split("-")[2], index, "sex")}
                                                        >
                                                        </Form.Check>
                                                        <Form.Check
                                                            inline
                                                            type="radio"
                                                            id={`gender-radio-1-${index}`}
                                                            label="여"
                                                            name={`gender-${index}`}
                                                            className={cx("radio-cell")}
                                                            onChange={(e) => handleNokListChange(e.target.id.split("-")[2], index, "sex")}
                                                        >
                                                        </Form.Check>
                                                        <Form.Check
                                                            inline
                                                            type="radio"
                                                            id={`gender-radio-2-${index}`}
                                                            label="기타"
                                                            name={`gender-${index}`}
                                                            className={cx("radio-cell")}
                                                            onChange={(e) => handleNokListChange(e.target.id.split("-")[2], index, "sex")}
                                                        >
                                                        </Form.Check>
                                                    </InputGroup>
                                                </div>
                                            </div>
                                            <div className={cx("inline")}>
                                                <div className={cx("cell")}>
                                                    <InputGroup>
                                                        <InputGroup.Text>생년월일</InputGroup.Text>
                                                        <Form.Control
                                                            type="date"
                                                            value={nok.birthday ?? ""}
                                                            onChange={(e) => handleNokListChange(e.target.value, index, "birthday")}
                                                        >
                                                        </Form.Control>
                                                    </InputGroup>
                                                </div>
                                                <div className={cx("cell")}>
                                                    <InputGroup>
                                                        <InputGroup.Text>주민등록번호</InputGroup.Text>
                                                        <Form.Control
                                                            type="number"
                                                            value={birthToId(nok.birthday ?? "")}
                                                            className={cx("patientId")}
                                                            readOnly
                                                        >
                                                        </Form.Control>
                                                        <div className={cx("dash")}> - </div>
                                                        <Form.Control
                                                            type="number"
                                                            value={nok.social_number ?? ""}
                                                            className={cx("patientId")}
                                                            onChange={(e) => handleNokListChange(e.target.value, index, "social_number")}
                                                        >
                                                        </Form.Control>
                                                    </InputGroup>
                                                </div>
                                            </div>
                                            <div className={cx("inline")}>
                                                <div className={`${cx("cell")}`}>
                                                    <InputGroup>
                                                    <InputGroup.Text>휴대폰 번호</InputGroup.Text>
                                                        <Form.Select
                                                            value={nok.tel?.split('-')[0] ?? ""}
                                                            onChange={(e) => 
                                                                handleNokListChange(`
                                                                ${e.target.value}-${nok.tel?.split('-')[1] ?? ""}-${nok.tel?.split('-')[2] ?? ""}`, 
                                                                index, 
                                                                "tel"
                                                            )}
                                                        >
                                                            <option>010</option>
                                                        </Form.Select>
                                                        <div className={cx("dash")}> - </div>
                                                        <Form.Control
                                                            type="number"
                                                            value={nok.tel?.split('-')[1] ?? ""}
                                                            className={cx("phoneNumber")}
                                                            onChange={(e) => 
                                                                handleNokListChange(`
                                                                ${nok.tel?.split('-')[0] ?? ""}-${e.target.value}-${nok.tel?.split('-')[2] ?? ""}`, 
                                                                index, 
                                                                "tel"
                                                            )}
                                                        >
                                                        </Form.Control>
                                                        <div className={cx("dash")}> - </div>
                                                        <Form.Control
                                                            type="number"
                                                            value={nok.tel?.split('-')[2] ?? ""}
                                                            className={cx("phoneNumber")}
                                                            onChange={(e) => 
                                                                handleNokListChange(`
                                                                ${nok.tel?.split('-')[0] ?? ""}-${nok.tel?.split('-')[1] ?? ""}-${e.target.value}`, 
                                                                index, 
                                                                "tel"
                                                            )}
                                                        >
                                                        </Form.Control>
                                                    </InputGroup>
                                                </div>
                                            </div>
                                            <div className={cx("inline")}>
                                                <div className={cx("cell")}>
                                                    <InputGroup>
                                                        <Form.Check
                                                            inline
                                                            type="checkbox"
                                                            id="same-addr"
                                                            label="환자와 주소 동일"
                                                            name="gender"
                                                            value={`${nok.isSameAddr}`}
                                                            onChange={() => {                
                                                                handleNokListChange(
                                                                    [patientAddress[0], patientAddress[1], patientAddress[2], !nok.isSameAddr], 
                                                                    index, 
                                                                    ["address", "address_detail", "post_number", "isSameAddr"])
                                                            }}
                                                        >
                                                        </Form.Check>
                                                    </InputGroup>
                                                </div>
                                            </div>
                                            <div className={cx("inline")}>
                                                <div className={cx("cell")}>
                                                    <InputGroup>
                                                        <InputGroup.Text>주소</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="주소"
                                                            value={nok.isSameAddr ? patientAddress[0] : nok.address ?? ""}
                                                            style={{ width: "55%" }}
                                                            onChange={(e) => handleNokListChange(nok.isSameAddr ? patientAddress[0] : e.target.value, index, "address")}
                                                            readOnly
                                                            disabled={nok.isSameAddr}
                                                        >
                                                        </Form.Control>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="우편 번호"
                                                            value={nok.isSameAddr ? patientAddress[2] : nok.post_number ?? ""}
                                                            className={cx("postalCode")}
                                                            onChange={(e) => handleNokListChange(nok.isSameAddr ? patientAddress[1] : e.target.value, index, "post_number")}
                                                            style={{ width: "20%" }}
                                                            readOnly
                                                            disabled={nok.isSameAddr}
                                                        >
                                                        </Form.Control>
                                                        <Button 
                                                            variant="secondary" 
                                                            style={{ width: "15%" }} 
                                                            disabled={nok.isSameAddr}
                                                            onClick={() => setIsNokAddressSearcherOpen(true)}
                                                        >
                                                            우편번호 찾기
                                                        </Button>
                                                    </InputGroup>
                                                    { isNokAddressSearcherOpen ? 
                                                    <AddressSearch 
                                                        setClosed={setIsNokAddressSearcherOpen}
                                                        setNokAddress={handleNokListChange}
                                                        nokIndex={index}
                                                    /> : 
                                                    null }
                                                </div>
                                            </div>
                                            <div className={cx("inline")}>
                                                <div className={cx("cell")}>
                                                    <InputGroup>
                                                        <InputGroup.Text>상세 주소</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="상세 주소"
                                                            style={{ width: "55%" }}
                                                            value={nok.isSameAddr ? patientAddress[1] : nok.address_detail ?? ""}
                                                            onChange={(e) => handleNokListChange(nok.isSameAddr ? patientAddress[0] : e.target.value, index, "address_detail")}
                                                            disabled={nok.isSameAddr}
                                                        >
                                                        </Form.Control>
                                                    </InputGroup>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="secondary" onClick={() => setNokList([...nokList.slice(0, index), ...nokList.slice(index+1)])}>
                                            -
                                        </Button>
                                    </div>
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
