import { useMemo, useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styles from './ImooveAddModal.module.css'
import classNames from 'classnames/bind';
import { useDateTimeParser } from '../../../../api/commons/dateTimeParse'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const BloodInspectionAddModal = ({show, handleClose, isNew=false, cv}: { show: boolean, handleClose: () => void, isNew?: boolean, cv: any }) => {
    const cx = classNames.bind(styles);
    const dateParse = useDateTimeParser()

    const { patient_id } = useParams();
    const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `/api/patients/${patient_id}/medical/inspections/blood`

    const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

    const [exDate, setExDate] = useState(new Date())
    const [bloodInspectionNote, setXrayNote] = useState("")
    const [file, setFile] = useState()

    const renderSelected = () => {
    }

    const addNewBloodInspection = async () => {
        let file_url = ""
        try {
            let formData = new FormData()
            formData.append('file', file ?? "")
            let response = await axios.post('/api/file', formData, config)
            file_url = response.data.file_path
            console.log(`InBody 파일 추가 성공: ${file_url}`);
        } catch (error) {
            console.error("InBody 파일 추가 중 오류 발생:", error)
            return
        }

        const newBloodInspection = {
            file_url: file_url,
            inspected: dateParse(exDate),
            content: null,
            detail: bloodInspectionNote
        }
        try {
            await axios.post(url, newBloodInspection, config)
                console.log("X-Ray 검사 기록 추가 성공");
        } catch (error) {
                console.error("X-Ray 검사 기록 추가 중 오류 발생:", error);
        }
    }

    return (
        <Modal show={show} onShow={renderSelected} onHide={handleClose} size='xl'>
            <Modal.Header closeButton>
                <Modal.Title>
                    <span className={cx("title")}>
                        <strong>혈액 검사 결과</strong>
                    </span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className={cx("contents")}>
                    <div className={cx("page-content")}>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")}>
                                <span>파일 업로드</span>
                            </div>
                            <div className={cx("inline")}>
                                <div className={`${cx("cell")} ${cx("large")}`}>
                                <Form.Control
                                    type="file" 
                                    onChange={(e: any) => {setFile(e.target.files[0])}}
                                />
                                </div>
                            </div>
                            <div className={cx("inline")}>
                                <div className={`${cx("cell")} ${cx("large")}`}>
                                    <InputGroup>
                                        <InputGroup.Text>검사 일시</InputGroup.Text>
                                        <Form.Control
                                            type="date"
                                            placeholder=""
                                            value={exDate.toLocaleDateString('en-CA')}
                                            onChange={(e) => setExDate(new Date(e.target.value))}
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
                                            value={bloodInspectionNote}
                                            onChange={(e) => setXrayNote(e.target.value)}
                                        >
                                        </Form.Control>
                                    </InputGroup>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className={cx("inline-btn")}>
                    <Button variant="primary" onClick={addNewBloodInspection}>
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

export default BloodInspectionAddModal
