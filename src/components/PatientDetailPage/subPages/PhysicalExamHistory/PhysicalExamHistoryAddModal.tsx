import { useState, useEffect, useMemo } from 'react'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Multiselect from 'multiselect-react-dropdown'
import { useLocalTokenValidation } from '../../../../api/commons/auth'
import styles from './PhysicalExamHistoryAddModal.module.css'
import classNames from 'classnames/bind'
import { Changes, PhysicalExam } from './PhysicalExamHistory'
import { Table } from '../../../commons'
import { useRowState } from 'react-table'

interface PhysicalExamAddModalProps {
    show: boolean, 
    isNew: boolean
    selectedPhysicalExam: PhysicalExam | null,
    addFunction: (newReport: PhysicalExam, isNew: boolean) => void
    handleClose: () => void, 
}

const PhysicalExamHistoryAddModal = ({ show, isNew, selectedPhysicalExam, addFunction, handleClose }: PhysicalExamAddModalProps) => {
    const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수
    const cx = classNames.bind(styles);

    const [recorded, setRecorded] = useState("")
    const [height, setHeight] = useState("")
    const [weight, setWeight] = useState("")
    const [systolicBloodPressure, setSystolicBloodPressure] = useState("")
    const [diastolicBloodPressure, setDiastolicBloodPressure] = useState("")
    const [bodyTemperature, setBodyTemperature] = useState("")

    const renderSelected = () => {
        if (!isNew && selectedPhysicalExam) {
            setRecorded(selectedPhysicalExam.recorded)
            setHeight(`${selectedPhysicalExam.height}`)
            setWeight(`${selectedPhysicalExam.weight}`)
            setSystolicBloodPressure(`${selectedPhysicalExam.systolic_blood_pressure}`)
            setDiastolicBloodPressure(`${selectedPhysicalExam.diastolic_blood_pressure}`)
            setBodyTemperature(`${selectedPhysicalExam.body_temperature}`)
        }
    }

    const handleAddMedicalRecord = () => {
        console.log(
            isNew ? "add" : ("edit - " + selectedPhysicalExam),
            "\nrecorded: " + recorded,
            "\nheight: " + height,
            "\nweight: " + weight,
            "\nsystolic_blood_pressure: " + systolicBloodPressure,
            "\ndiastolic_blood_pressure: " + diastolicBloodPressure,
            "\nbodyTemperature: " + bodyTemperature
        )

        const newPhysicalExam: PhysicalExam = {
            recorded: recorded,
            height: +height,
            weight: +weight,
            systolic_blood_pressure: +systolicBloodPressure,
            diastolic_blood_pressure: +diastolicBloodPressure,
            body_temperature: +bodyTemperature
        }

        addFunction(newPhysicalExam, isNew)
        handleClose()
    }

    useEffect(() => {
		let testMode = true
		if (process.env.NODE_ENV !== 'development' || testMode) checkAuth()
	  }, [checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사

    return (
        <Modal show={show} onShow={renderSelected} onHide={handleClose} size='xl'>
            <Modal.Header style={{paddingLeft: "20px", paddingRight: "40px"}} closeButton>
            <Modal.Title>
                <span className={cx("title")}>
                    <strong> 환자 신체 검사 {isNew ? "추가" : "편집"}</strong>
                </span></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className={cx("contents")}>
                    <div className={cx("page-title")}>
                        <span>신체 검사</span>
                    </div>
                    <div className={cx("page-content")}>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-content")}>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>키</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder="키"
                                                value={height}
                                                onChange={(e) => setHeight(e.target.value)}
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
                                            >
                                            </Form.Control>
                                            <InputGroup.Text>~</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder="최고혈압"
                                                value={diastolicBloodPressure}
                                                onChange={(e) => setDiastolicBloodPressure(e.target.value)}
                                            >
                                            </Form.Control>
                                        </InputGroup>
                                    </div>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>체온</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder="마지막 회차"
                                                value={bodyTemperature}
                                                onChange={(e) => setBodyTemperature(e.target.value)}
                                            >
                                            </Form.Control>
                                            <InputGroup.Text>℃</InputGroup.Text>
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

export default PhysicalExamHistoryAddModal
