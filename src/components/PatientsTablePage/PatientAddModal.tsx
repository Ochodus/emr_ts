import { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { useLocalTokenValidation } from '../../api/commons/auth'
import styles from './PatientAddModal.module.css'
import classNames from 'classnames/bind'
import { AddressSearch } from '../commons'
import { Patient } from '../../pages/PatientsTablePage'

interface PatientAddModalProps {
    show: boolean, 
    isNew: boolean
    selectedPatient: Patient | null,
    addFunction: (newPatient: Patient, isNew: boolean) => void
    handleClose: () => void, 
}

interface User {
    id: number,
    email: string,
    first_name: string,
    last_name: string,
    position: string,
    sex: number,
    phone_number: string,
    department: string
}

const PatientAddModal = ({ show, isNew, selectedPatient, addFunction, handleClose }: PatientAddModalProps) => {
    const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수

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

    const [patientName, setPatientName] = useState(["", ""])
    const [patientGender, setPatientGender] = useState("")
    const [patientBirth, setPatientBirth] = useState("")
    const [patientRRN, setPatientRRN] = useState("")

    const [patientPhoneNumber, setPatientPhoneNumber] = useState(["010", "", ""])
    const [patientAltNumber, setPatientAltNumber] = useState(["없음", "", ""])

    const [patientAddress, setPatientAddress] = useState(["", "", ""])
    const [patientDoctor, setPatientDoctor] = useState("미지정")
    const [patientRegDate, setPatientRegDate] = useState((new Date()).toLocaleDateString('en-CA'))
    const [patientNote, setPatientNote] = useState("")

    const [patientHeight, setPatientHeight] = useState("")
    const [patientWeight, setPatientWeight] = useState("")
    const [patientHighBp, setPatientHighBp] = useState("")
    const [patientLowBp, setPatientLowBp] = useState("") 

    const [nokRelation, setNokRelation] = useState("생략")
    const [nokName, setNokName] = useState(["", ""])
    const [nokGender, setNokGender] = useState("")

    const [nokBirth, setNokBirth] = useState("")
    const [nokRRN, setNokRRN] = useState("")

    const [nokPhoneNumber, setNokPhoneNumber] = useState(["010", "", ""])
    const [nokAltNumber, setNokAltNumber] = useState(["02", "", ""])

    const [nokAddress, setNokAddress] = useState(["", "", ""])

    const [isSameAddr, setIsSameAddr] = useState(false)

    const [isPatientAddressSearcherOpen, setIsPatientAddressSearcherOpen] = useState(false)
    const [isNokAddressSearcherOpen, setIsNokAddressSearcherOpen] = useState(false)

    const [userList, setUserList] = useState<User[]>([])

    const handlePatientGenderRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPatientGender(e.target.id.split("-").slice(-1)[0])
    }

    const handleNokGenderRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNokGender(e.target.id.split("-")[2])
    }

    const getAllUsers = useCallback(async () => {
		try {
			const response = await axios.get(
				`/api/users`,
				config
			)
			setUserList(response.data)
		} catch (error) {
			console.error("환자 조회 중 오류 발생:", error)
		}
	}, [config]) // 전체 환자 목록 가져오기

    const renderSelected = () => {
        if (!isNew && selectedPatient) {
            setPatientName([selectedPatient.last_name, selectedPatient.first_name])
            document.getElementById("gender-radio-" + selectedPatient.sex)?.click()
            setPatientBirth(new Date(selectedPatient.birthday).toLocaleDateString('en-CA'))
            setPatientRRN(`${selectedPatient.social_number}`)
            setPatientPhoneNumber([...selectedPatient.tel.split("-")])
            setPatientHeight(`${selectedPatient.height}`)
            setPatientWeight(`${selectedPatient.weight}`)
            setPatientHighBp(`${selectedPatient.highBp}`)
            setPatientLowBp(`${selectedPatient.lowBp}`)
            setPatientAddress([selectedPatient.address, "", ""])
            setPatientDoctor(`${selectedPatient.user_id}`)
            setPatientRegDate(new Date(selectedPatient.regDate ?? "").toLocaleDateString('en-CA'))
            setPatientNote(selectedPatient.memo ?? "")
        }

    }

    const birthToId = (birth: string) => {
        if (birth.substr(2)) return birth.substr(2).replace(/-/g, "")
        else return ""
    }

    const handleAddPatient = () => {
        console.log(
            isNew ? "add" : ("edit - " + selectedPatient?.last_name + selectedPatient?.first_name),
            "\nname: " + patientName[0] + " " + patientName[1],
            "\ngender: " + patientGender,
            "\nbirth: " + patientBirth,
            "\nrrn: " + patientRRN,
            "\nphone number: " + patientPhoneNumber[0] + "-" + patientPhoneNumber[1] + "-" + patientPhoneNumber[2],
            "\nalt number: " + patientAltNumber[0] + "-" + patientAltNumber[1] + "-" + patientAltNumber[2],
            "\naddress: " + patientAddress[0],
            "\npostal code: " + patientAddress[2],
            "\nmore address: " + patientAddress[1],
            "\nheight: " + patientHeight,
            "\nweight: " + patientWeight,
            "\nblood pressure: " + patientLowBp + "~" + patientHighBp,
            "\ndoctor: " + patientDoctor,
            "\nregister date: " + patientRegDate,
            "\nmemo: " + patientNote,
        )

        const newPatient: Patient = {
            first_name: patientName[1],
            last_name: patientName[0],
            sex: patientGender,
            birthday: patientBirth,
            height: +patientHeight,
            weight: +patientWeight,
            highBp: +patientHighBp,
            lowBp: +patientLowBp,
            last_recorded: new Date(patientRegDate),
            tel: `${patientPhoneNumber[0]}-${patientPhoneNumber[1]}-${patientPhoneNumber[2]}`,
            address: patientAddress[0],
            address_detail: patientAddress[1],
            post_number: patientAddress[2] === "" ? 0 : +patientAddress[2],
            social_number: +patientRRN,
            user_id: patientDoctor === "미지정" ? 1 : +patientDoctor,
            memo: patientNote,
            noks: [{
                type: "",
                first_name: nokName[0],
                last_name: nokName[1],
                sex: nokGender === "" ? "-1" : nokGender,
                birthday: new Date(nokBirth).toLocaleDateString('en-CA'),
                tel: `${nokPhoneNumber[0]}-${nokPhoneNumber[1]}-${nokPhoneNumber[2]}`,
                address: nokAddress[0],
                address_detail: nokAddress[1],
                post_number: nokAddress[2] === "" ? 0 : +patientAddress[2],
            }],
        }

        addFunction(newPatient, isNew)
        handleClose()
    }

    useEffect(() => { getAllUsers() }, [ getAllUsers ])

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
                                    <div className={cx("cell")}>
                                        <InputGroup>
                                            <InputGroup.Text>성명</InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="성"
                                                value={patientName[0]}
                                                onChange={(e) => setPatientName([e.target.value, patientName[1]])}
                                            >
                                            </Form.Control>
                                            <Form.Control
                                                type="text"
                                                placeholder="이름"
                                                value={patientName[1]}
                                                onChange={(e) => setPatientName([patientName[0], e.target.value])}
                                            ></Form.Control>
                                        </InputGroup>
                                    </div>
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
                                    <div className={`${cx("cell")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>전화 번호</InputGroup.Text>
                                            <Form.Select
                                                value={patientAltNumber[0]}
                                                onChange={(e) => setPatientAltNumber([e.target.value, patientAltNumber[1], patientAltNumber[2]])}
                                            >
                                                <option>없음</option>
                                                <option>02</option>
                                                <option>031</option>
                                                <option>032</option>
                                                <option>033</option>
                                                <option>041</option>
                                                <option>043</option>
                                                <option>042</option>
                                                <option>044</option>
                                                <option>051</option>
                                                <option>052</option>
                                                <option>053</option>
                                                <option>054</option>
                                                <option>055</option>
                                                <option>061</option>
                                                <option>062</option>
                                                <option>063</option>
                                                <option>064</option>
                                                <option>070</option>
                                            </Form.Select>
                                            <div className={cx("dash")}> - </div>
                                            <Form.Control
                                                type="number"
                                                value={patientAltNumber[1]}
                                                className={cx("phoneNumber")}
                                                onChange={(e) => setPatientAltNumber([patientAltNumber[0], e.target.value, patientAltNumber[2]])}
                                                disabled={patientAltNumber[0] === "없음"}
                                            >
                                            </Form.Control>
                                            <div className={cx("dash")}> - </div>
                                            <Form.Control
                                                type="number"
                                                value={patientAltNumber[2]}
                                                className={cx("phoneNumber")}
                                                onChange={(e) => setPatientAltNumber([patientAltNumber[0], patientAltNumber[1], e.target.value])}
                                                disabled={patientAltNumber[0] === "없음"}
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
                                </div>
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
                            <div className={cx("group-title")}>
                                <span>보호자 정보</span>
                            </div>
                            <div className={cx("group-content")}>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>가족 관계</InputGroup.Text>
                                            <Form.Select 
                                                value={nokRelation}
                                                onChange={(e) => setNokRelation(e.target.value)}
                                            >
                                                <option>생략</option>
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
                                                value={nokName[0]}
                                                onChange={(e) => setNokName([e.target.value, nokName[1]])}
                                                disabled={nokRelation === "생략"}
                                            >
                                            </Form.Control>
                                            <Form.Control
                                                type="text"
                                                placeholder="이름"
                                                value={nokName[1]}
                                                onChange={(e) => setNokName([nokName[0], e.target.value])}
                                                disabled={nokRelation === "생략"}
                                            ></Form.Control>
                                        </InputGroup>
                                    </div>
                                    <div className={`${cx("cell")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>성별</InputGroup.Text>
                                            <Form.Check
                                                inline
                                                type="radio"
                                                id="gender-radio-0-g"
                                                label="남"
                                                name="gender"
                                                className={cx("radio-cell")}
                                                onChange={(e) => handleNokGenderRadioChange(e)}
                                                disabled={nokRelation === "생략"}
                                            >
                                            </Form.Check>
                                            <Form.Check
                                                inline
                                                type="radio"
                                                id="gender-radio-1-g"
                                                label="여"
                                                name="gender"
                                                className={cx("radio-cell")}
                                                onChange={(e) => handleNokGenderRadioChange(e)}
                                                disabled={nokRelation === "생략"}
                                            >
                                            </Form.Check>
                                            <Form.Check
                                                inline
                                                type="radio"
                                                id="gender-radio-2-g"
                                                label="기타"
                                                name="gender"
                                                className={cx("radio-cell")}
                                                onChange={(e) => handleNokGenderRadioChange(e)}
                                                disabled={nokRelation === "생략"}
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
                                                value={nokBirth}
                                                onChange={(e) => setNokBirth(e.target.value)}
                                                disabled={nokRelation === "생략"}
                                            >
                                            </Form.Control>
                                        </InputGroup>
                                    </div>
                                    <div className={cx("cell")}>
                                        <InputGroup>
                                            <InputGroup.Text>주민등록번호</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                value={birthToId(nokBirth)}
                                                className={cx("patientId")}
                                                readOnly
                                                disabled={nokRelation === "생략"}
                                            >
                                            </Form.Control>
                                            <div className={cx("dash")}> - </div>
                                            <Form.Control
                                                type="number"
                                                value={nokRRN}
                                                className={cx("patientId")}
                                                onChange={(e) => setNokRRN(e.target.value)}
                                                disabled={nokRelation === "생략"}
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
                                                value={nokPhoneNumber[0]}
                                                onChange={(e) => setNokPhoneNumber([e.target.value, nokPhoneNumber[1], nokPhoneNumber[2]])}
                                                disabled={nokRelation === "생략"}
                                            >
                                                <option>010</option>
                                            </Form.Select>
                                            <div className={cx("dash")}> - </div>
                                            <Form.Control
                                                type="number"
                                                value={nokPhoneNumber[1]}
                                                className={cx("phoneNumber")}
                                                onChange={(e) => setNokPhoneNumber([nokPhoneNumber[0], e.target.value, nokPhoneNumber[2]])}
                                                disabled={nokRelation === "생략"}
                                            >
                                            </Form.Control>
                                            <div className={cx("dash")}> - </div>
                                            <Form.Control
                                                type="number"
                                                value={nokPhoneNumber[2]}
                                                className={cx("phoneNumber")}
                                                onChange={(e) => setNokPhoneNumber([nokPhoneNumber[0], nokPhoneNumber[1], e.target.value])}
                                                disabled={nokRelation === "생략"}
                                            >
                                            </Form.Control>
                                        </InputGroup>
                                    </div>
                                    <div className={`${cx("cell")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>전화 번호</InputGroup.Text>
                                            <Form.Select
                                                value={nokAltNumber[0]}
                                                onChange={(e) => setNokAltNumber([e.target.value, nokAltNumber[1], nokAltNumber[2]])}
                                                disabled={nokRelation === "생략"}
                                            >
                                                <option>없음</option>
                                                <option>02</option>
                                                <option>031</option>
                                                <option>032</option>
                                                <option>033</option>
                                                <option>041</option>
                                                <option>043</option>
                                                <option>042</option>
                                                <option>044</option>
                                                <option>051</option>
                                                <option>052</option>
                                                <option>053</option>
                                                <option>054</option>
                                                <option>055</option>
                                                <option>061</option>0
                                                <option>062</option>
                                                <option>063</option>
                                                <option>064</option>
                                                <option>070</option>
                                            </Form.Select>
                                            <div className={cx("dash")}> - </div>
                                            <Form.Control
                                                type="number"
                                                value={nokAltNumber[1]}
                                                className={cx("phoneNumber")}
                                                onChange={(e) => setNokAltNumber([nokAltNumber[0], e.target.value, nokAltNumber[2]])}
                                                disabled={nokAltNumber[0] === "없음" || nokRelation === "생략"}
                                            >
                                            </Form.Control>
                                            <div className={cx("dash")}> - </div>
                                            <Form.Control
                                                type="number"
                                                value={nokAltNumber[2]}
                                                className={cx("phoneNumber")}
                                                onChange={(e) => setNokAltNumber([nokAltNumber[0], nokAltNumber[1], e.target.value])}
                                                disabled={nokAltNumber[0] === "없음" || nokRelation === "생략"}
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
                                                value={`${isSameAddr}`}
                                                onChange={() => {
                                                    setNokAddress([patientAddress[0], patientAddress[1], patientAddress[2]]) 
                                                    setIsSameAddr(!isSameAddr)}
                                                }
                                                disabled={nokRelation === "생략"}
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
                                                value={isSameAddr ? patientAddress[0] : nokAddress[0]}
                                                style={{ width: "55%" }}
                                                onChange={(e) => setNokAddress(
                                                    isSameAddr ? [e.target.value, patientAddress[1], patientAddress[2]]
                                                    : [e.target.value, nokAddress[1], nokAddress[2]]
                                                    )}
                                                readOnly
                                                disabled={nokRelation === "생략" || isSameAddr}
                                            >
                                            </Form.Control>
                                            <Form.Control
                                                type="text"
                                                placeholder="우편 번호"
                                                value={isSameAddr ? patientAddress[2] : nokAddress[2]}
                                                className={cx("postalCode")}
                                                onChange={(e) => setNokAddress(
                                                    isSameAddr ? [patientAddress[0], patientAddress[1], e.target.value]
                                                    : [nokAddress[0], nokAddress[1], e.target.value]
                                                    )}
                                                style={{ width: "20%" }}
                                                readOnly
                                                disabled={nokRelation === "생략" || isSameAddr}
                                            >
                                            </Form.Control>
                                            <Button 
                                                variant="secondary" 
                                                style={{ width: "15%" }} 
                                                disabled={nokRelation === "생략" || isSameAddr}
                                                onClick={() => setIsNokAddressSearcherOpen(true)}
                                            >
                                                우편번호 찾기
                                            </Button>
                                        </InputGroup>
                                        { isNokAddressSearcherOpen ? 
                                        <AddressSearch 
                                            setClosed={setIsNokAddressSearcherOpen}
                                            setAddress={setNokAddress}
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
                                                value={isSameAddr ? patientAddress[1] : nokAddress[1]}
                                                onChange={(e) => setNokAddress(
                                                    isSameAddr ? [patientAddress[0], e.target.value, patientAddress[2]]
                                                    : [nokAddress[0], e.target.value, nokAddress[2]]
                                                )}
                                                disabled={nokRelation === "생략" || isSameAddr}
                                            >
                                            </Form.Control>
                                        </InputGroup>
                                    </div>
                                </div>
                            </div>
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
