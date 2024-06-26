import { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Multiselect from 'multiselect-react-dropdown'
import styles from './MedicalRecordAddModal.module.css'
import classNames from 'classnames/bind'
import { MedicalRecord } from './MedicalRecord'
import { PhysicalExam } from '../../../../interfaces'

interface MedicalRecordAddModalProps {
    show: boolean, 
    isNew: boolean,
    selectedMedicalRecord: MedicalRecord | null,
    addRecord: (newMedicalRecord: MedicalRecord, isNew: boolean) => void,
    addPhysicalExam: (newPhysicalExam: PhysicalExam) => void,
    handleClose: () => void,
    axiosMode: boolean
}

const symptomsList: string[] = [
    "기침",
    "가래",
    "어지러움",
    "열",
    "구토",
    "피로",
    "식은땀", 
    "발작",
    "기억상실"
]

const diagnosticsList: string[] = [
    "감기", 
    "독감", 
    "식중독",
    "우울증",
    "치매",
    "심근경색",
    "척추측만증",
    "비염",
    "광견병"
]

const MedicalRecordAddModal = ({ show, isNew, selectedMedicalRecord: selectedMedicalRecord, addRecord, addPhysicalExam, handleClose }: MedicalRecordAddModalProps) => {
    const cx = classNames.bind(styles);

    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
    const [selectedDiagnostics, setSelectedDiagnostics] = useState<string[]>([])
    const [memo, setMemo] = useState("")
    const [recorded, setRecorded] = useState(new Date())
    const [height, setHeight] = useState("")
    const [weight, setWeight] = useState("")
    const [systolicBloodPressure, setSystolicBloodPressure] = useState("")
    const [diastolicBloodPressure, setDiastolicBloodPressure] = useState("")
    const [bodyTemperature, setBodyTemperature] = useState("")

    const [ommitPhysicalExam, setOmmitPhysicalExam] = useState(false)

    const renderSelected = () => {
        if (!isNew && selectedMedicalRecord) {
            setSelectedSymptoms([...selectedMedicalRecord.symptoms])
            setSelectedDiagnostics([...selectedMedicalRecord.diagnostics])
            setMemo(selectedMedicalRecord.memo)
            setRecorded(new Date(selectedMedicalRecord.recorded))
        }
    }

    const handleAddMedicalRecord = () => {
        console.log(
            isNew ? "add" : ("edit - " + selectedMedicalRecord?.symptoms),
            "\nsymptoms: " + selectedSymptoms,
            "\ndiagnostics: " + selectedDiagnostics,
            "\nmemo: " + memo,
            "\nrecorded: " + recorded,
            "\nheight: " + height,
            "\nweight: " + weight,
            "\nblood pressure: " + systolicBloodPressure + "~" + diastolicBloodPressure
        )

        const newMedicalRecord: MedicalRecord = {
            symptoms: selectedSymptoms,
            diagnostics: selectedDiagnostics,
            memo: memo,
            recorded: `${recorded.toLocaleDateString('en-CA')}T${recorded.toLocaleTimeString('it-IT')}Z`,
        }

        addRecord(newMedicalRecord, isNew)

        if (!ommitPhysicalExam && isNew) {
            const newPhysicalExam: PhysicalExam = {
                recorded: `${recorded.toLocaleDateString('en-CA')}T${recorded.toLocaleTimeString('it-IT')}Z`,
                body_temperature: +bodyTemperature,
                height: +height,
                weight: +weight,
                systolic_blood_pressure: +systolicBloodPressure,
                diastolic_blood_pressure: +diastolicBloodPressure
            }
            addPhysicalExam(newPhysicalExam)
        }
        
        handleClose()
    }

    const handleSymptomSelectionChange = (selectedList: string[]) => {
        setSelectedSymptoms([...selectedList])
    }

    const handleDiagnosticSelectionChange = (selectedList: string[]) => {
        setSelectedDiagnostics([...selectedList])
    }

    return (
        <Modal show={show} onShow={renderSelected} onHide={handleClose} size='xl'>
            <Modal.Header style={{paddingLeft: "20px", paddingRight: "40px"}} closeButton>
            <Modal.Title>
                <span className={cx("title")}>
                    <strong>진료 기록 {isNew ? "추가" : "편집"}</strong>
                </span></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className={cx("contents")}>
                    <div className={cx("page-title")}>
                        <span>진료 기록</span>
                    </div>
                    <div className={cx("page-content")}>
                        <div className={cx("group-field")}>
                            {isNew &&
                            <div className={cx("group-title")} style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '50px' }}>
                                <span>기본 측정</span>
                                <Form.Check 
                                    label='생략'
                                    value={`${ommitPhysicalExam}`}
                                    onChange={() => setOmmitPhysicalExam(!ommitPhysicalExam)}
                                />
                            </div>}
                            {isNew &&
                            <div className={cx("group-content")}>                                
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>신장</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder="신장"
                                                value={height}
                                                onChange={(e) => setHeight(e.target.value)}
                                                disabled={ommitPhysicalExam}
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
                                                value={weight}
                                                onChange={(e) => setWeight(e.target.value)}
                                                disabled={ommitPhysicalExam}
                                            >
                                            </Form.Control>
                                            <InputGroup.Text>kg</InputGroup.Text>
                                        </InputGroup>
                                    </div>
                                </div>   
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>혈압</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder="최저혈압"
                                                value={systolicBloodPressure}
                                                onChange={(e) => setSystolicBloodPressure(e.target.value)}
                                                disabled={ommitPhysicalExam}
                                            >
                                            </Form.Control>
                                            <div className={cx("dash")}> ~ </div>
                                            <Form.Control
                                                type="number"
                                                placeholder="최고혈압"
                                                value={diastolicBloodPressure}
                                                onChange={(e) => setDiastolicBloodPressure(e.target.value)}
                                                disabled={ommitPhysicalExam}
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
                                                value={bodyTemperature}
                                                onChange={(e) => setBodyTemperature(e.target.value)}
                                                disabled={ommitPhysicalExam}
                                            >
                                            </Form.Control>
                                            <InputGroup.Text>℃</InputGroup.Text>
                                        </InputGroup>
                                    </div>
                                </div>
                            </div>}
                            <div className={cx("group-field")}>
                                <div className={cx("group-title")}>
                                    <span>진료 내용</span>
                                </div>
                                <div className={cx("group-content")}>
                                    <div className={cx("inline")}>
                                        <div className={`${cx("cell")} ${cx("large")}`}>
                                            <InputGroup style={{ flexWrap: 'nowrap' }}>
                                                <InputGroup.Text>증상</InputGroup.Text>
                                                <Multiselect
                                                    isObject={false}
                                                    options={symptomsList}
                                                    selectedValues={selectedSymptoms}
                                                    onSelect={handleSymptomSelectionChange}
                                                    onRemove={handleSymptomSelectionChange}
                                                    placeholder='증상 선택'
                                                    emptyRecordMsg='선택 가능한 증상이 없습니다.'
                                                    avoidHighlightFirstOption
                                                />
                                            </InputGroup>
                                        </div>
                                    </div>
                                    <div className={cx("inline")}>
                                        <div className={`${cx("cell")} ${cx("large")}`}>
                                            <InputGroup style={{ flexWrap: 'nowrap' }}>
                                                <InputGroup.Text>진단</InputGroup.Text>
                                                <Multiselect
                                                    isObject={false}
                                                    options={diagnosticsList}
                                                    selectedValues={selectedDiagnostics}
                                                    onSelect={handleDiagnosticSelectionChange}
                                                    onRemove={handleDiagnosticSelectionChange}
                                                    placeholder='질환 선택'
                                                    emptyRecordMsg='선택 가능한 질환이 없습니다.'
                                                    avoidHighlightFirstOption
                                                />
                                            </InputGroup>
                                        </div>
                                    </div>
                                    <div className={cx("inline")}>
                                        <div className={cx("cell")}>
                                            <InputGroup>
                                                <InputGroup.Text>진료일자</InputGroup.Text>
                                                <Form.Control
                                                    type="date"
                                                    value={recorded.toLocaleDateString('en-CA')}
                                                    onChange={(e)=> setRecorded(new Date(e.target.value))}
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
                                                    value={memo}
                                                    onChange={(e) => setMemo(e.target.value)}
                                                >
                                                </Form.Control>
                                            </InputGroup>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className={cx("inline-btn")}>
                    <Button variant="primary" onClick={handleAddMedicalRecord}>
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

export default MedicalRecordAddModal

