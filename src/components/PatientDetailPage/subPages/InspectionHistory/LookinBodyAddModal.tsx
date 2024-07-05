import React, { useState, useMemo } from 'react'
import OcrParser from '../../../commons/OcrParser'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styles from './LookinBodyAddModal.module.css'
import classNames from 'classnames/bind'
import { useParams } from 'react-router-dom'
import { useDateTimeParser } from '../../../../api/commons/dateTimeParse'
import { LookinBody, LookinInspection } from './InspectionType.interface'
import { uploadData, uploadFiles } from './utils'
import { Draft, produce } from 'immer'

interface LookinBodyAddModalProps {
    show: boolean, 
    isNew?: boolean,
    selectedLookinBody?: LookinBody & {id: number} | null 
    handleClose: ()=> void,
    cv: any
}

type inspectionUpdater<T extends LookinInspection> = React.Dispatch<React.SetStateAction<T[]>>

const initialInspection: LookinInspection = {
    type: "",
    name: "",
    value: "",
    min_value: "",
    max_value: ""
}

const LookinBodyAddModal = ({
    show, 
    isNew=true, 
    selectedLookinBody=null,
    handleClose, 
    cv
}: LookinBodyAddModalProps) => {
    const cx = classNames.bind(styles)
    const dateParser = useDateTimeParser()

    const { patient_id } = useParams()
    const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `/api/patients/${patient_id}/medical/inspections/lookinbody`

    const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

    const [date, setDate] = useState<Date>(new Date())
    const [lookinInspections, setLookinInspections] = useState<LookinInspection[]>([])
    const [note, setNote] = useState("")

    const [file, setFile] = useState<File | null>(null)

    const addInspections = <T extends LookinInspection>(setInspection: inspectionUpdater<T>, initValue: T) => {
        setInspection(prevObj =>
            (produce(prevObj, draft => {
                draft.push(initValue as Draft<T>)
            }))
        )
    }

    const deleteInspection = <T extends LookinInspection>(setInspection: inspectionUpdater<T>, index: number) => {
        setInspection(prevObj =>
            (produce(prevObj, draft => {
                draft.splice(index, 1)
            }))
        )
    }

    const updateInspection = <T,>(
        draft: T, 
        targetPath: (string | number)[], 
        newValue: string
    ) => {
        if (targetPath.length === 1) {
            draft[targetPath[0] as (keyof T)] = newValue as T[keyof T]
        } else {
            let newDraft = draft[targetPath[0] as (keyof T)]
            updateInspection<typeof newDraft>(newDraft, targetPath.slice(1), newValue)
        }
    }

    const updateDeepValue = <T extends LookinInspection>(setInspection: inspectionUpdater<T>, targetPath: (string | number)[], newValue: string) => {
        setInspection(prevObj =>
            (produce(prevObj, draft => {
                updateInspection(draft, targetPath, newValue)
            }))
        )
    }

    const onChangeOcrResult = (result: any) => {
        const parsedData: any = {
            fields: result.fields.split(/\n/),
            exerciseNames: result.exerciseNames.split(/\n/),
            values: result.values.split(/\n/),
            ranges: result.ranges.split(/\n/),
            note: result.note,
            recommendation: result.recommendation
        }

        let inspectionLength = Math.max(+(parsedData.fields.length ?? 0), +(parsedData.exerciseNames.length ?? 0), +(parsedData.values.length ?? 0), +(parsedData.ranges.length ?? 0))
        
        setLookinInspections([])
        let newLookinInspections: LookinInspection[] = []
        for (let i = 0; i < inspectionLength; i++) {
            newLookinInspections.push({
                type: `${parsedData.fields[i]}`, 
                name: `${parsedData.exerciseNames[i]}`, 
                value: parsedData.values[i] ?? "", 
                min_value: +`${parsedData.ranges[i]}`.split('~')[0],
                max_value: +`${parsedData.ranges[i]}`.split('~')[1]
            })
        }

        setLookinInspections(newLookinInspections)
        setDate(new Date(result.date.split(' ')[0]))
    }

    const targetAbilities = ['근력', '유연성', '민첩성', '심폐지구력', '순발력', '근지구력', '평형성']
    const targetExercises = ['전신반응 (초)', '제자리 높이뛰기 (cm)', '눈감고 외발서기 (초)']

    const addLookinBodyRecord = async () => {
        uploadFiles(selectedLookinBody, file, "Lookin' body", config).then((file_url) => { 
            const newLookinBodyRecord: LookinBody = {
                file_url: file_url,
                inspected: dateParser(date ?? new Date()),
                content: {
                    name: "",
                    age: 0,
                    height: 0,
                    gender: 0,
                    inspections: lookinInspections
                },
                detail: note
            }
    
            uploadData(isNew, url, newLookinBodyRecord, "Lookin' body", config, handleClose, selectedLookinBody?.id)
        })
    }

    const renderSelected = () => {
        if (selectedLookinBody) {
            selectedLookinBody.content.inspections.forEach((item) => {
                addInspections(setLookinInspections, item)
            })
        }
    }

    return (
        <Modal show={show} onShow={renderSelected} onHide={handleClose} size='xl'>
            <Modal.Header closeButton>
                <Modal.Title>
                    <span className={cx("title")}>
                        <strong>Lookin' Body</strong>
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
                                <div className={`${cx("cell")} ${cx("text-only")}`}>
                                    <div className={`${cx("cell")} ${cx("smaller")}`}>
                                        <OcrParser 
                                            type={3} 
                                            isMask={true} 
                                            setOcrResult={onChangeOcrResult}
                                            file={file}
                                            setFile={setFile}
                                            cv={cv} 
                                            smallSize={false}
                                            indicator={1}
                                            >
                                        </OcrParser>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '' }}>
                                <span>운동 목록</span>
                                <Button style={{ fontSize: '10px', margin: '3px'}} variant={'secondary'} onClick={() => { addInspections(setLookinInspections, initialInspection) }}> 추가 </Button>
                            </div>
                            <div className={cx("group-content")}>
                                {lookinInspections.map((inspection, index) => {
                                    return (
                                        <div style={{ display: 'flex', borderBottom: '1px solid gray', justifyContent: 'space-between', margin: '0 10px'}} key={index}>
                                            <div className={cx("inspection")}>
                                                <div className={cx("inline")}>
                                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                                        <InputGroup>
                                                            <InputGroup.Text>측정 능력</InputGroup.Text>
                                                            <Form.Select
                                                                value={inspection.type ?? ""}
                                                                onChange={(e) => {updateDeepValue(setLookinInspections, [index, "type"], e.target.value)}}
                                                            >
                                                                {targetAbilities.map((ability: string, index) => {
                                                                    return (<option key={index}>{ability}</option>)
                                                                })}
                                                            </Form.Select>
                                                        </InputGroup>
                                                    </div>
                                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                                        <InputGroup>
                                                            <InputGroup.Text>운동 종류</InputGroup.Text>
                                                            <Form.Select
                                                                value={inspection.name ?? ""}
                                                                onChange={(e) => {updateDeepValue(setLookinInspections, [index, "name"], e.target.value)}}
                                                            >
                                                                {targetExercises.map((exercise: string, index) => {
                                                                    return (<option key={index}>{exercise}</option>)
                                                                })}
                                                            </Form.Select>
                                                        </InputGroup>
                                                    </div>
                                                </div>
                                                <div className={cx("inline")}>
                                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                                        <InputGroup>
                                                            <InputGroup.Text>측정 값</InputGroup.Text>
                                                            <Form.Control
                                                                type="number"
                                                                value={inspection.value ?? ""}
                                                                onChange={(e) => {updateDeepValue(setLookinInspections, [index, "value"], e.target.value)}}
                                                            />
                                                        </InputGroup>
                                                    </div>
                                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                                        <InputGroup>
                                                            <InputGroup.Text>평균 범위</InputGroup.Text>
                                                            <Form.Control
                                                                type="number"
                                                                value={inspection.min_value ?? ""}
                                                                onChange={(e) => {updateDeepValue(setLookinInspections, [index, "min_value"], e.target.value)}}
                                                            />
                                                            <div className={cx("dash")}> ~ </div>
                                                            <Form.Control
                                                                type="number"
                                                                value={inspection.max_value ?? ""}
                                                                onChange={(e) => {updateDeepValue(setLookinInspections, [index, "max_value"], e.target.value)}}
                                                            />
                                                        </InputGroup>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button className={`${cx("delete")}`} onClick={() => deleteInspection(setLookinInspections, index)}>
                                                -
                                            </Button>
                                        </div>
                                    )
                                })}
                                <div className={cx("inline")} style={{ marginTop: "10px" }}>
                                    <div className={`${cx("cell")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>시행 날짜</InputGroup.Text>
                                            <Form.Control
                                                type='date'
                                                value={date.toLocaleDateString('en-CA')}
                                                onChange={(e) => {setDate(new Date(e.target.value))}}
                                            >
                                            </Form.Control>
                                        </InputGroup>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")}>
                                <span>비고</span>
                            </div>
                            <div className={cx("group-content")}>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>메모</InputGroup.Text>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                            />
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
                    <Button variant="primary" onClick={addLookinBodyRecord}>
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

export default LookinBodyAddModal
