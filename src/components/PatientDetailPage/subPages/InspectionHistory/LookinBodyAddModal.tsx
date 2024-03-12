import React, { useState, useMemo } from 'react'
import OcrParser from '../../../commons/OcrParser'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styles from './LookinBodyAddModal.module.css'
import classNames from 'classnames/bind'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { useDateTimeParser } from '../../../../api/commons/dateTimeParse'

interface LookinInspection {
    [name: string]: string | number | undefined
    type?: string,
    name?: string,
    value?: number,
    minValue?: number,
    maxValue?: number
}

interface LookinBodyOcrResult {
    [name: string]: LookinInspection
}

interface LookinBodyResultStates {
    [index: string]: [LookinInspection[], React.Dispatch<React.SetStateAction<any>>]
}

const LookinBodyAddModal = ({show, handleClose, isNew=false, cv}: {show: any, handleClose: ()=> void, isNew?: boolean, cv: any}) => {
    const cx = classNames.bind(styles)
    const dateParser = useDateTimeParser()

    const { patient_id } = useParams();
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

    const [file, setFile] = useState<File>()

    const addNewLookinInspection = () => {
        setLookinInspections([...lookinInspections, {}])
    }

    const deleteLookinInspection = (index: number) => {
        setLookinInspections([...lookinInspections.slice(0, index), ...lookinInspections.slice(index + 1)])
    }

    const updateInspection = (index: number, target: string, value: string) => {
        let updatedInspection = {...lookinInspections[index]}
        updatedInspection[target] = value
        setLookinInspections([...lookinInspections.slice(0, index), updatedInspection, ...lookinInspections.slice(index + 1)])
    }

    const onChangeOcrResult = (result: any) => {
        console.log(result)

        const parsedData: LookinBodyOcrResult = {
            fields: result.fields.split(/\n/),
            exerciseNames: result.exerciseNames.split(/\n/),
            values: result.values.split(/\n/),
            ranges: result.ranges.split(/\n/),
            note: result.note,
            recommendation: result.recommendation
        }

        console.log(parsedData)

        let inspectionLength = Math.max(+(parsedData.fields.length ?? 0), +(parsedData.exerciseNames.length ?? 0), +(parsedData.values.length ?? 0), +(parsedData.ranges.length ?? 0))
        
        setLookinInspections([])
        let newLookinInspections: LookinInspection[] = []
        for (let i = 0; i < inspectionLength; i++) {
            console.log(+parsedData.values[i]!)
            console.log(`${typeof parsedData.ranges[i]}`)
            newLookinInspections.push({
                type: `${parsedData.fields[i]}`, 
                name: `${parsedData.exerciseNames[i]}`, 
                value: typeof parsedData.values[i] === 'undefined' ? undefined : +parsedData.values[i]! , 
                minValue: +`${parsedData.ranges[i]}`.split('~')[0],
                maxValue: +`${parsedData.ranges[i]}`.split('~')[1]
            })
        }

        setLookinInspections(newLookinInspections)
        setDate(new Date(result.date.split(' ')[0]))
    }

    const targetAbilities = ['근력', '유연성', '민첩성', '심폐지구력', '순발력', '근지구력', '평형성']
    const targetExercises = ['전신반응 (초)', '제자리 높이뛰기 (cm)', '눈감고 외발서기 (초)']

    const addLookinBodyRecord = async () => {
        const newLookinBodyRecord = {
            file_url: "",
            inspected: dateParser(date ?? new Date()),
            content: {
                name: "",
                age: 0,
                height: 0,
                gender: 0,
                inspections: lookinInspections
            },
            detail: ""
        }
        try {
            await axios.post(url, newLookinBodyRecord, config)
                console.log("InBody 검사 기록 추가 성공");
        } catch (error) {
                console.error("InBody 검사 기록 추가 중 오류 발생:", error);
        }
    }

    const renderSelected = () => {
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
                            <div className={cx("group-title")} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>운동 목록</span>
                                <Button style={{ fontSize: '10px', margin: '3px'}} variant={'secondary'} onClick={addNewLookinInspection}> 추가 </Button>
                            </div>
                            <div className={cx("group-content")}>
                                {lookinInspections.map((inspection, index) => {
                                    return (
                                        <div style={{ display: 'flex', borderTop: '1px solid gray', justifyContent: 'space-between', margin: '0 10px'}} key={index}>
                                            <div className={cx("inspection")}>
                                                <div className={cx("inline")}>
                                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                                        <InputGroup>
                                                            <InputGroup.Text>측정 능력</InputGroup.Text>
                                                            <Form.Select
                                                                value={inspection.type ?? ""}
                                                                onChange={(e) => {updateInspection(index, "type", e.target.value)}}
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
                                                                onChange={(e) => {updateInspection(index, "name", e.target.value)}}
                                                            >
                                                                {targetExercises.map((exercise: string) => {
                                                                    return (<option>{exercise}</option>)
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
                                                                onChange={(e) => {updateInspection(index, "value", e.target.value)}}
                                                            />
                                                        </InputGroup>
                                                    </div>
                                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                                        <InputGroup>
                                                            <InputGroup.Text>평균 범위</InputGroup.Text>
                                                            <Form.Control
                                                                type="number"
                                                                value={inspection.minValue ?? ""}
                                                                onChange={(e) => {updateInspection(index, "minValue", e.target.value)}}
                                                            />
                                                            <div className={cx("dash")}> ~ </div>
                                                            <Form.Control
                                                                type="number"
                                                                value={inspection.maxValue ?? ""}
                                                                onChange={(e) => {updateInspection(index, "maxValue", e.target.value)}}
                                                            />
                                                        </InputGroup>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button className={`${cx("delete")}`} onClick={() => deleteLookinInspection(index)}>
                                                -
                                            </Button>
                                        </div>
                                    )
                                })}
                                <div className={cx("inline")}>
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
