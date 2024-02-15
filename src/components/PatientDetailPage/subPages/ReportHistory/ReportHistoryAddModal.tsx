import { useState, useEffect, useMemo } from 'react'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Multiselect from 'multiselect-react-dropdown'
import { useLocalTokenValidation } from '../../../../api/commons/auth'
import styles from './ReportHistoryAddModal.module.css'
import classNames from 'classnames/bind'
import { Report } from './ReportHistory'

interface ReportAddModalProps {
    show: boolean, 
    isNew: boolean
    selectedReport: Report | null,
    addFunction: (newReport: Report, isNew: boolean) => void
    handleClose: () => void, 
}

const therapyList: string[] = [
    "슈로스 치료",
    "장기 이식"
]

const ReportHistoryAddModal = ({ show, isNew, selectedReport: selectedReport, addFunction, handleClose }: ReportAddModalProps) => {
    const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수
    const cx = classNames.bind(styles);

    const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

    const [selectedTherapies, setSelectedTherapies] = useState<string[]>([])
    const [startDate, setStartDate] = useState(new Date().toLocaleDateString('en-CA'))
    const [endDate, setEndDate] = useState(new Date().toLocaleDateString('en-CA'))
    const [startTrial, setStartTrial] = useState(-1)
    const [endTrial, setEndTrial] = useState(-1)
    const [changes, setChanges] = useState([])
    const [changeDetail, setChangeDetail] = useState<object>()
    const [memo, setMemo] = useState("")

    const renderSelected = () => {
        if (!isNew && selectedReport) {
            // setSelectedTherapies([...selectedMedicalRecord.symptoms])
            setMemo(selectedReport.memo)
        }
    }

    const handleAddMedicalRecord = () => {
        console.log(
            isNew ? "add" : ("edit - " + selectedReport),
            "\ntherapies: " + selectedTherapies,
            "\nmemo: " + memo
        )

        const newReport: Report = {
            startDate: startDate,
            endDate: endDate,
            changes_detail: {},
            changes: changes,
            memo: memo
        }

        addFunction(newReport, isNew)
        handleClose()
    }

    const handleTherapySelectionChange = (selectedList: string[]) => {
        setSelectedTherapies([...selectedList])
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
                    <strong>환자 치료 경과 리포트 {isNew ? "추가" : "편집"}</strong>
                </span></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className={cx("contents")}>
                    <div className={cx("page-title")}>
                        <span>변화 항목</span>
                    </div>
                    <div className={cx("page-content")}>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-content")}>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")} ${cx("large")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>치료 방법 선택</InputGroup.Text>
                                            <Multiselect
                                                isObject={false}
                                                options={therapyList}
                                                selectedValues={selectedTherapies}
                                                onSelect={handleTherapySelectionChange}
                                                onRemove={handleTherapySelectionChange}
                                                placeholder='치료 방법 선택'
                                                emptyRecordMsg='선택 가능한 치료 방법이 없습니다.'
                                                avoidHighlightFirstOption
                                            />
                                        </InputGroup>
                                    </div>
                                </div>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>시작 회차</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder="시작 회차"
                                                value={startTrial}
                                                onChange={(e) => setStartTrial(+e.target.value)}
                                            >
                                            </Form.Control>
                                            <InputGroup.Text>cm</InputGroup.Text>
                                        </InputGroup>
                                    </div>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>마지막 회차</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder="마지막 회차"
                                                value={endTrial}
                                                onChange={(e) => setEndTrial(+e.target.value)}
                                            >
                                            </Form.Control>
                                            <InputGroup.Text>kg</InputGroup.Text>
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

export default ReportHistoryAddModal
