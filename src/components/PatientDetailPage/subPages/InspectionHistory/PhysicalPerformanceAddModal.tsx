import React, { useState, useMemo } from 'react'
import OcrParser from '../../../commons/OcrParser'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import styles from './PhysicalPerformanceAddModal.module.css'
import classNames from 'classnames/bind'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { useDateTimeParser } from '../../../../api/commons/dateTimeParse'


interface FunctionalLine {
    [name: string]: number | number[] | string[] | undefined,
    trialNumber: number,
    rtrt?: number[] | string[],
    rtlt?: number[] | string[],
    ltrt?: number[] | string[],
    ltlt?: number[] | string[]
}

interface YBalance {
    [name: string]: number | number[] | string[] | undefined,
    trialNumber: number,
    rtat?: number[] | string[],
    rtpl?: number[] | string[],
    rtpm?: number[] | string[],
    ltat?: number[] | string[],
    ltpl?: number[] | string[],
    ltpm?: number[] | string[]
}

interface BallBounce {
    [name: string]: number | number[] | string[] | string | undefined,
    trialNumber: number,
    rt?: number[] | string[],
    lt?: number[] | string[],
    rtone?: number[] | string[],
    rttwo?: number[] | string[],
    rtthree?: number[] | string[],
    ltone?: number[] | string[],
    lttwo?: number[] | string[],
    ltthree?: number[] | string[],
    rtNote?: string,
    ltNote?: string
}

interface DynamicMovement {
    [name: string]: number | (number | string)[][] | string[] | string | undefined,
    trialNumber: number,
    evaluations: (number | string)[][],
    evalNotes: string[]
}

interface InspectionStates {
    [name: string]: any
    fl: [FunctionalLine[], React.Dispatch<React.SetStateAction<FunctionalLine[]>>],
    yb: [YBalance[], React.Dispatch<React.SetStateAction<YBalance[]>>],
    bb: [BallBounce[], React.Dispatch<React.SetStateAction<BallBounce[]>>],
    dm: [DynamicMovement[], React.Dispatch<React.SetStateAction<DynamicMovement[]>>]
}

interface PhysicalPerformanceResult {
    [name: string]: FunctionalLine
}

const PhysicalPerformanceAddModal = ({show, handleClose, isNew=false, cv}: {show: any, handleClose: ()=> void, isNew?: boolean, cv: any}) => {
    const cx = classNames.bind(styles)
    const dateParser = useDateTimeParser()

    const { patient_id } = useParams();
    const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `/api/patients/${patient_id}/medical/inspections/physical_performance`

    const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

    const [date, setDate] = useState<Date>(new Date())
    const [functionalLines, setFunctionalLines] = useState<FunctionalLine[]>([])
    const [yBalance, setYBalance] = useState<YBalance[]>([])
    const [ballBounce, setBallBounce] = useState<BallBounce[]>([])
    const [dynamicMovement, setDynamicMovement] = useState<DynamicMovement[]>([])

    const [selectedInspection, setSelectedInspection] = useState<string | null>("")

    const inspectionStates: any = {
        fl: [functionalLines, setFunctionalLines],
        yb: [yBalance, setYBalance],
        bb: [ballBounce, setBallBounce],
        dm: [dynamicMovement, setDynamicMovement]
    }

    const addNewFunctionalLines = () => {
        setFunctionalLines([...functionalLines, {trialNumber: functionalLines.length, rtrt: ["", "", "", ""], rtlt: ["", "", "", ""], ltrt: ["", "", "", ""], ltlt: ["", "", "", ""]}])
    }

    const addNewYBalance = () => {
        setYBalance([...yBalance, {trialNumber: yBalance.length, rtat: ["", "", "", ""], rtpl: ["", "", "", ""], rtpm: ["", "", "", ""], ltat: ["", "", "", ""], ltpl: ["", "", "", ""], ltpm: ["", "", "", ""]}])
    }

    const addNewBallBounce = () => {
        setBallBounce([...ballBounce, {trialNumber: ballBounce.length, rt: ["", ""], lt: ["", ""], rtone: ["", ""], rttwo: ["", ""], rtthree: ["", ""], ltone: ["", ""], lttwo: ["", ""], ltthree: ["", ""], rtNote: "", ltNote: ""}])
    }

    const addNewDynamicMovement = () => {
        setDynamicMovement([...dynamicMovement, {trialNumber: dynamicMovement.length, evaluations: [[""], ["", ""], ["", ""], ["", ""], ["", ""], [""], [""]], evalNotes: ["", "", "", "", "", "", ""]}])
    }

    const deleteFunctionalLines = (index: number, inspection: string) => {
        if (inspection === 'fl') setFunctionalLines([...functionalLines.slice(0, index), ...functionalLines.slice(index + 1)])
        if (inspection === 'yb') setYBalance([...yBalance.slice(0, index), ...yBalance.slice(index + 1)])
        if (inspection === 'bb') setBallBounce([...ballBounce.slice(0, index), ...ballBounce.slice(index + 1)])
        if (inspection === 'dm') setDynamicMovement([...dynamicMovement.slice(0, index), ...dynamicMovement.slice(index + 1)])
    }

    const updateInspection = (index: number, target: string, value: string, inspection: string, targetIndex?: number, twoDimIndex?: number) => {
        let targetInspection = inspectionStates[inspection][0]
        let targetInspectionDispatch = inspectionStates[inspection][1]
        let updatedInspection = {...targetInspection[index]}
        if (updatedInspection) {
            let selectedField = updatedInspection?.[target] // number[]
            if (Array.isArray(selectedField)) {
                console.log(selectedField)
                if (typeof targetIndex !== 'undefined') {
                    console.log(selectedField[0])
                    if (Array.isArray(selectedField[targetIndex])) {
                        if (typeof twoDimIndex !== 'undefined') selectedField[targetIndex][twoDimIndex] = isNaN(+value) ? value : +value
                    }
                    else { selectedField[targetIndex] = isNaN(+value) ? value : +value }
                }
            }
            else {
                updatedInspection[target] = isNaN(+value) ? value : +value
            }
    
            targetInspectionDispatch([...targetInspection.slice(0, index), updatedInspection, ...targetInspection.slice(index + 1)])
            setFunctionalLines([...functionalLines.slice(0, index), updatedInspection, ...functionalLines.slice(index + 1)])
        }
    }

    const onChangeOcrResult = (result: any) => {
        console.log(result)

        const parsedData: PhysicalPerformanceResult = {
            fields: result.fields.split(/\n/),
            exerciseNames: result.exerciseNames.split(/\n/),
            values: result.values.split(/\n/),
            ranges: result.ranges.split(/\n/),
            note: result.note,
            recommendation: result.recommendation
        }

        console.log(parsedData)

        let inspectionLength = Math.max(+(parsedData.fields.length ?? 0), +(parsedData.exerciseNames.length ?? 0), +(parsedData.values.length ?? 0), +(parsedData.ranges.length ?? 0))
    }

    const addPhysicalPerformance = async () => {
        const newPhysicalPerformance = {
            file_url: "",
            inspected: dateParser(date ?? new Date()),
            content: {
                name: "",
                age: 0,
                height: 0,
                gender: 0,
                inspections: functionalLines
            },
            detail: ""
        }
        try {
            await axios.post(url, newPhysicalPerformance, config)
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
                        <strong>운동 능력 검사</strong>
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
                                            type={0} 
                                            isMask={true} 
                                            setOcrResult={onChangeOcrResult} 
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
                            <div className={cx("group-title")}>
                                <Tabs 
                                    activeKey={selectedInspection ?? ""}
                                    onSelect={(k) => setSelectedInspection(k)}
                                    className="mb-3"
                                >
                                    <Tab eventKey="functinalLine" title="기능선 테스트">
                                        <div className={cx("group-content")}>
                                            <div style={{ borderBottom: '1px solid gray', padding: '20px' }}>
                                                <img style={{ width: '100%', height: '500px' }}></img>
                                            </div>
                                            {functionalLines.map((inspection, index) => {
                                                return (
                                                    <div style={{ display: 'flex', borderBottom: '1px solid gray', justifyContent: 'space-between', margin: '0 10px'}} key={index}>
                                                        <div className={`${cx("cell")} ${cx("small")}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                                                            <InputGroup>
                                                                <InputGroup.Text>회차</InputGroup.Text>
                                                                <Form.Control
                                                                    type="number"
                                                                    value={inspection.trialNumber ?? ""}
                                                                    onChange={(e) => {updateInspection(index, "trialNumber", e.target.value, 'fl')}}
                                                                />
                                                            </InputGroup>
                                                        </div>
                                                        <div className={cx("inspection")}>
                                                            <div className={cx("inline")} style={{ display: 'flex', marginBottom: '10px' }}>
                                                                <div className={`${cx("cell")}`} style={{ width: '45%' }}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>RT/RT</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rtrt ? inspection.rtrt[0] : ""}
                                                                            onChange={(e) => {updateInspection(index, "rtrt", e.target.value, 'fl', 0)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rtrt ? inspection.rtrt[1] : ""}
                                                                            onChange={(e) => {updateInspection(index, "rtrt", e.target.value, 'fl', 1)}}
                                                                        />
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rtrt ? inspection.rtrt[2] : ""}
                                                                            onChange={(e) => {updateInspection(index, "rtrt", e.target.value, 'fl', 2)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rtrt ? inspection.rtrt[3] : ""}
                                                                            onChange={(e) => {updateInspection(index, "rtrt", e.target.value, 'fl', 3)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                                <div className={`${cx("cell")}`} style={{ width: '45%' }}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>RT/LT</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rtlt ? inspection.rtlt[0] : ""}
                                                                            onChange={(e) => {updateInspection(index, "rtlt", e.target.value, 'fl', 0)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rtlt ? inspection.rtlt[1] : ""}
                                                                            onChange={(e) => {updateInspection(index, "rtlt", e.target.value, 'fl', 1)}}
                                                                        />
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rtlt ? inspection.rtlt[2] : ""}
                                                                            onChange={(e) => {updateInspection(index, "rtlt", e.target.value, 'fl', 2)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rtlt ? inspection.rtlt[3] : ""}
                                                                            onChange={(e) => {updateInspection(index, "rtlt", e.target.value, 'fl', 3)}}
                                                                        />
                                                                    </InputGroup>
                                                                    
                                                                </div>
                                                            </div>
                                                            <div className={cx("inline")} style={{ display: 'flex' }}>
                                                                <div className={`${cx("cell")}`} style={{ width: '45%' }}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>LT/RT</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.ltrt ? inspection.ltrt[0] : ""}
                                                                            onChange={(e) => {updateInspection(index, "ltrt", e.target.value, 'fl', 0)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.ltrt ? inspection.ltrt[1] : ""}
                                                                            onChange={(e) => {updateInspection(index, "ltrt", e.target.value, 'fl', 1)}}
                                                                        />
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.ltrt ? inspection.ltrt[2] : ""}
                                                                            onChange={(e) => {updateInspection(index, "ltrt", e.target.value, 'fl', 2)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.ltrt ? inspection.ltrt[3] : ""}
                                                                            onChange={(e) => {updateInspection(index, "ltrt", e.target.value, 'fl', 3)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                                <div className={`${cx("cell")}`} style={{ width: '45%' }}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>LT/LT</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.ltlt ? inspection.ltlt[0] : ""}
                                                                            onChange={(e) => {updateInspection(index, "ltlt", e.target.value, 'fl', 0)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.ltlt ? inspection.ltlt[1] : ""}
                                                                            onChange={(e) => {updateInspection(index, "ltlt", e.target.value, 'fl', 1)}}
                                                                        />
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.ltlt ? inspection.ltlt[2] : ""}
                                                                            onChange={(e) => {updateInspection(index, "ltlt", e.target.value, 'fl', 2)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.ltlt ? inspection.ltlt[3] : ""}
                                                                            onChange={(e) => {updateInspection(index, "ltlt", e.target.value, 'fl', 3)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button className={`${cx("delete")}`} onClick={() => deleteFunctionalLines(index, 'fl')}>
                                                            -
                                                        </Button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div style={{ padding: '10px 20px' }}>
                                            <Button style={{ fontSize: '15px', width: '100%', margin: 'auto'}} variant={'secondary'} onClick={addNewFunctionalLines}> 추가 </Button>
                                        </div>
                                    </Tab>
                                    <Tab eventKey="yBalance" title="Y-Balance 테스트">
                                        <div className={cx("group-content")}>
                                            <div style={{ borderBottom: '1px solid gray', padding: '20px' }}>
                                                <img style={{ width: '100%', height: '500px' }}></img>
                                            </div>
                                            {yBalance.map((inspection, index) => {
                                                return (
                                                    <div style={{ display: 'flex', borderBottom: '1px solid gray', justifyContent: 'space-between', margin: '0 10px'}} key={index}>
                                                        <div className={`${cx("cell")} ${cx("small")}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                                                            <InputGroup>
                                                                <InputGroup.Text>회차</InputGroup.Text>
                                                                <Form.Control
                                                                    type="number"
                                                                    value={inspection.trialNumber ?? ""}
                                                                    onChange={(e) => {updateInspection(index, "trialNumber", e.target.value, 'yb')}}
                                                                />
                                                            </InputGroup>
                                                        </div>
                                                        <div className={cx("inspection")}>
                                                            <div className={cx("inline")} style={{ display: 'flex', marginBottom: '10px' }}>
                                                                <div className={`${cx("cell")}`} style={{ width: '30%' }}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>RT/AT</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rtat ? inspection.rtat[0] : ""}
                                                                            onChange={(e) => {updateInspection(index, "rtat", e.target.value, 'yb', 0)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rtat ? inspection.rtat[1] : ""}
                                                                            onChange={(e) => {updateInspection(index, "rtat", e.target.value, 'yb', 1)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                                <div className={`${cx("cell")}`} style={{ width: '30%' }}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>RT/PL</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rtpl ? inspection.rtpl[0] : ""}
                                                                            onChange={(e) => {updateInspection(index, "rtpl", e.target.value, 'yb', 0)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rtpl ? inspection.rtpl[1] : ""}
                                                                            onChange={(e) => {updateInspection(index, "rtpl", e.target.value, 'yb', 1)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                                <div className={`${cx("cell")}`} style={{ width: '30%' }}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>RT/PM</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rtpm ? inspection.rtpm[0] : ""}
                                                                            onChange={(e) => {updateInspection(index, "rtpm", e.target.value, 'yb', 0)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rtpm ? inspection.rtpm[1] : ""}
                                                                            onChange={(e) => {updateInspection(index, "rtpm", e.target.value, 'yb', 1)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                            </div>
                                                            <div className={cx("inline")} style={{ display: 'flex' }}>
                                                                <div className={`${cx("cell")}`} style={{ width: '30%' }}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>LT/AT</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.ltat ? inspection.ltat[0] : ""}
                                                                            onChange={(e) => {updateInspection(index, "ltat", e.target.value, 'yb', 0)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.ltat ? inspection.ltat[1] : ""}
                                                                            onChange={(e) => {updateInspection(index, "ltat", e.target.value, 'yb', 1)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                                <div className={`${cx("cell")}`} style={{ width: '30%' }}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>LT/PL</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.ltpl ? inspection.ltpl[0] : ""}
                                                                            onChange={(e) => {updateInspection(index, "ltpl", e.target.value, 'yb', 0)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.ltpl ? inspection.ltpl[1] : ""}
                                                                            onChange={(e) => {updateInspection(index, "ltpl", e.target.value, 'yb', 1)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                                <div className={`${cx("cell")}`} style={{ width: '30%' }}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>LT/PM</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.ltpm ? inspection.ltpm[0] : ""}
                                                                            onChange={(e) => {updateInspection(index, "ltpm", e.target.value, 'yb', 0)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.ltpm ? inspection.ltpm[1] : ""}
                                                                            onChange={(e) => {updateInspection(index, "ltpm", e.target.value, 'yb', 1)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button className={`${cx("delete")}`} onClick={() => deleteFunctionalLines(index, 'yb')}>
                                                            -
                                                        </Button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div style={{ padding: '10px 20px' }}>
                                            <Button style={{ fontSize: '15px', width: '100%', margin: 'auto'}} variant={'secondary'} onClick={addNewYBalance}> 추가 </Button>
                                        </div>
                                    </Tab>
                                    <Tab eventKey="ballBounce" title="Ball Bounce">
                                        <div className={cx("group-content")}>
                                            {ballBounce.map((inspection, index) => {
                                                return (
                                                    <div style={{ display: 'flex', borderBottom: '1px solid gray', justifyContent: 'space-between', margin: '0 10px'}} key={index}>
                                                        <div className={`${cx("cell")} ${cx("small")}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                                                            <InputGroup>
                                                                <InputGroup.Text>회차</InputGroup.Text>
                                                                <Form.Control
                                                                    type="number"
                                                                    value={inspection.trialNumber ?? ""}
                                                                    onChange={(e) => {updateInspection(index, "trialNumber", e.target.value, 'bb')}}
                                                                />
                                                            </InputGroup>
                                                        </div>
                                                        <div className={cx("inspection")}>
                                                            <div className={cx("inline")}>
                                                                <div className={`${cx("cell")} ${cx("small")}`} style={{ padding: '5px' }}>
                                                                <table>
                                                                        <tbody>
                                                                            <tr>
                                                                                <th scope="row">
                                                                                    RT
                                                                                </th>
                                                                                <td>
                                                                                    <div className={cx(`amountField`)}>
                                                                                        <div className={cx(`unit`)}>{'('}</div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.rt ? inspection.rt[0] : ""}
                                                                                            onChange={(e) => {updateInspection(index, "rt", e.target.value, 'bb', 0)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>단계, </div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.rt ? inspection.rt[1] : ""}
                                                                                            onChange={(e) => {updateInspection(index, "rt", e.target.value, 'bb', 1)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>{'cm)'}</div>
                                                                                    </div>                                                                    
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <table>
                                                                        <tbody>
                                                                            <tr>
                                                                                <th scope="row">
                                                                                    1
                                                                                </th>
                                                                                <td>
                                                                                    <div className={cx(`amountField`)}>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.rtone ? inspection.rtone[0] : ""}
                                                                                            onChange={(e) => {updateInspection(index, "rtone", e.target.value, 'bb', 0)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>초 / </div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.rtone ? inspection.rtone[1] : ""}
                                                                                            onChange={(e) => {updateInspection(index, "rtone", e.target.value, 'bb', 1)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>개</div>
                                                                                    </div>                                                                    
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th scope="row">
                                                                                    2
                                                                                </th>
                                                                                <td>
                                                                                    <div className={cx(`amountField`)}>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.rttwo ? inspection.rttwo[0] : ""}
                                                                                            onChange={(e) => {updateInspection(index, "rttwo", e.target.value, 'bb', 0)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>
                                                                                            초 / 
                                                                                        </div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.rttwo ? inspection.rttwo[1] : ""}
                                                                                            onChange={(e) => {updateInspection(index, "rttwo", e.target.value, 'bb', 1)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>
                                                                                            개
                                                                                        </div>
                                                                                    </div>                                                                    
                                                                                </td>
                                                                            </tr>                                                                
                                                                            <tr>
                                                                                <th scope="row">
                                                                                    3
                                                                                </th>
                                                                                <td>
                                                                                    <div className={cx(`amountField`)}>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.rtthree ? inspection.rtthree[0] : ""}
                                                                                            onChange={(e) => {updateInspection(index, "rtthree", e.target.value, 'bb', 0)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>
                                                                                            초 / 
                                                                                        </div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.rtthree ? inspection.rtthree[1] : ""}
                                                                                            onChange={(e) => {updateInspection(index, "rtthree", e.target.value, 'bb', 1)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>
                                                                                            개
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                                <div className={`${cx("cell")} ${cx("small")}`} style={{ padding: '5px' }}>
                                                                    <table>
                                                                        <tbody>
                                                                            <tr>
                                                                                <th scope="row">
                                                                                    LT
                                                                                </th>
                                                                                <td>
                                                                                    <div className={cx(`amountField`)}>
                                                                                        <div className={cx(`unit`)}>{'('}</div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.lt ? inspection.lt[0] : ""}
                                                                                            onChange={(e) => {updateInspection(index, "lt", e.target.value, 'bb', 0)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>단계, </div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.lt ? inspection.lt[1] : ""}
                                                                                            onChange={(e) => {updateInspection(index, "lt", e.target.value, 'bb', 1)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>{'cm)'}</div>
                                                                                    </div>                                                                    
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <table>
                                                                        <tbody>
                                                                            <tr>
                                                                                <th scope="row">
                                                                                    1
                                                                                </th>
                                                                                <td>
                                                                                    <div className={cx(`amountField`)}>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.ltone ? inspection.ltone[0] : ""}
                                                                                            onChange={(e) => {updateInspection(index, "ltone", e.target.value, 'bb', 0)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>초 / </div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.ltone ? inspection.ltone[1] : ""}
                                                                                            onChange={(e) => {updateInspection(index, "ltone", e.target.value, 'bb', 1)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>개</div>
                                                                                    </div>                                                                    
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th scope="row">
                                                                                    2
                                                                                </th>
                                                                                <td>
                                                                                    <div className={cx(`amountField`)}>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.lttwo ? inspection.lttwo[0] : ""}
                                                                                            onChange={(e) => {updateInspection(index, "lttwo", e.target.value, 'bb', 0)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>
                                                                                            초 / 
                                                                                        </div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.lttwo ? inspection.lttwo[1] : ""}
                                                                                            onChange={(e) => {updateInspection(index, "lttwo", e.target.value, 'bb', 1)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>
                                                                                            개
                                                                                        </div>
                                                                                    </div>                                                                    
                                                                                </td>
                                                                            </tr>                                                                
                                                                            <tr>
                                                                                <th scope="row">
                                                                                    3
                                                                                </th>
                                                                                <td>
                                                                                    <div className={cx(`amountField`)}>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.ltthree ? inspection.ltthree[0] : ""}
                                                                                            onChange={(e) => {updateInspection(index, "ltthree", e.target.value, 'bb', 0)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>
                                                                                            초 / 
                                                                                        </div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.ltthree ? inspection.ltthree[1] : ""}
                                                                                            onChange={(e) => {updateInspection(index, "ltthree", e.target.value, 'bb', 1)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>
                                                                                            개
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                            <div className={cx("inline")}>
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th scope="column"></th>
                                                                            <th scope="column"> 비고 </th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr>
                                                                            <th scope="row">
                                                                                Rt. 지지 시
                                                                            </th>
                                                                            <td>
                                                                                <div className={cx(`amountField`)}>
                                                                                    <Form.Control
                                                                                        type="text"
                                                                                        value={inspection.rtNote ? inspection.rtNote : ""}
                                                                                        placeholder='내용을 입력해주세요'
                                                                                        onChange={(e) => {updateInspection(index, "rtNote", e.target.value, 'bb')}}
                                                                                    />
                                                                                </div>                                                                     
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <th scope="row">
                                                                                Lt. 지지 시
                                                                            </th>
                                                                            <td>
                                                                                <div className={cx(`amountField`)}>
                                                                                    <Form.Control
                                                                                        type="text"
                                                                                        value={inspection.ltNote ? inspection.ltNote : ""}
                                                                                        placeholder='내용을 입력해주세요'
                                                                                        onChange={(e) => {updateInspection(index, "ltNote", e.target.value, 'bb')}}
                                                                                    />
                                                                                </div>                                                                    
                                                                            </td>
                                                                        </tr>                                                
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                        <Button className={`${cx("delete")}`} onClick={() => deleteFunctionalLines(index, 'bb')}>
                                                            -
                                                        </Button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div style={{ padding: '10px 20px' }}>
                                            <Button style={{ fontSize: '15px', width: '100%', margin: 'auto'}} variant={'secondary'} onClick={addNewBallBounce}> 추가 </Button>
                                        </div>
                                    </Tab>
                                    <Tab eventKey="dynamicMovement" title="동적 움직임 평가">
                                        <div className={cx("group-content")}>
                                            {dynamicMovement.map((inspection, index) => {
                                                return (
                                                    <div style={{ display: 'flex', borderBottom: '1px solid gray', justifyContent: 'space-between', margin: '0 10px'}} key={index}>
                                                        <div className={`${cx("cell")} ${cx("small")}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                                                            <InputGroup>
                                                                <InputGroup.Text>회차</InputGroup.Text>
                                                                <Form.Control
                                                                    type="number"
                                                                    value={inspection.trialNumber ?? ""}
                                                                    onChange={(e) => {updateInspection(index, "trialNumber", e.target.value, 'dm')}}
                                                                />
                                                            </InputGroup>
                                                        </div>
                                                        <div className={cx("inspection")}>
                                                            <div style={{ marginBottom: '15px'}}>
                                                                <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '5px'}}>1. Two leg jump</div>
                                                                <div className={cx("inline")} style={{ display: 'flex', height: 'auto', justifyContent: 'space-between' }}>
                                                                    <InputGroup style={{ width: '25%' }}>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.evaluations[0][0] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evaluations", e.target.value, 'dm', 0, 0)}}
                                                                        />
                                                                        <InputGroup.Text>
                                                                            s
                                                                        </InputGroup.Text>
                                                                    </InputGroup>
                                                                    <InputGroup style={{ width: '65%' }}>
                                                                        <InputGroup.Text>
                                                                            비고
                                                                        </InputGroup.Text>
                                                                        <Form.Control
                                                                            type="text"
                                                                            style={{ display: 'table-cell' }}
                                                                            value={inspection.evalNotes[0] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evalNotes", e.target.value, 'dm', 0)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                            </div>
                                                            <div style={{ marginBottom: '15px'}}>
                                                                <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '5px'}}>2. Side step</div>
                                                                <div className={cx("inline")} style={{ display: 'flex', height: 'auto', marginBottom: '15px', justifyContent: 'space-between' }}>
                                                                    <InputGroup style={{ width: '45%' }}>
                                                                        <InputGroup.Text>
                                                                            Rt
                                                                        </InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.evaluations[1][0] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evaluations", e.target.value, 'dm', 1, 0)}}
                                                                        />
                                                                        <InputGroup.Text>
                                                                            s
                                                                        </InputGroup.Text>
                                                                    </InputGroup>
                                                                    <InputGroup style={{ width: '45%' }}>
                                                                        <InputGroup.Text>
                                                                            Lt
                                                                        </InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            style={{ display: 'table-cell' }}
                                                                            value={inspection.evaluations[1][1] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evaluations", e.target.value, 'dm', 1, 1)}}
                                                                        />
                                                                        <InputGroup.Text>
                                                                            s
                                                                        </InputGroup.Text>
                                                                    </InputGroup>
                                                                </div>
                                                                <div className={cx("inline")}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>
                                                                            비고
                                                                        </InputGroup.Text>
                                                                        <Form.Control
                                                                            type="text"
                                                                            style={{ display: 'table-cell' }}
                                                                            value={inspection.evalNotes[1] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evalNotes", e.target.value, 'dm', 1)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                            </div>
                                                            <div style={{ marginBottom: '15px'}}>
                                                                <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '5px'}}>3. Side one step in-out</div>
                                                                <div className={cx("inline")} style={{ display: 'flex', height: 'auto', marginBottom: '15px', justifyContent: 'space-between' }}>
                                                                    <InputGroup style={{ width: '45%' }}>
                                                                        <InputGroup.Text>
                                                                            Rt
                                                                        </InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.evaluations[2][0] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evaluations", e.target.value, 'dm', 2, 0)}}
                                                                        />
                                                                        <InputGroup.Text>
                                                                            s
                                                                        </InputGroup.Text>
                                                                    </InputGroup>
                                                                    <InputGroup style={{ width: '45%' }}>
                                                                        <InputGroup.Text>
                                                                            Lt
                                                                        </InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            style={{ display: 'table-cell' }}
                                                                            value={inspection.evaluations[2][1] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evaluations", e.target.value, 'dm', 2, 1)}}
                                                                        />
                                                                        <InputGroup.Text>
                                                                            s
                                                                        </InputGroup.Text>
                                                                    </InputGroup>
                                                                </div>
                                                                <div className={cx("inline")}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>
                                                                            비고
                                                                        </InputGroup.Text>
                                                                        <Form.Control
                                                                            type="text"
                                                                            style={{ display: 'table-cell' }}
                                                                            value={inspection.evalNotes[2] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evalNotes", e.target.value, 'dm', 2)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                            </div>
                                                            <div style={{ marginBottom: '15px'}}>
                                                                <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '5px'}}>4. Side two step in-out</div>
                                                                <div className={cx("inline")} style={{ display: 'flex', height: 'auto', marginBottom: '15px', justifyContent: 'space-between' }}>
                                                                    <InputGroup style={{ width: '45%' }}>
                                                                        <InputGroup.Text>
                                                                            Rt
                                                                        </InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.evaluations[3][0] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evaluations", e.target.value, 'dm', 3, 0)}}
                                                                        />
                                                                        <InputGroup.Text>
                                                                            s
                                                                        </InputGroup.Text>
                                                                    </InputGroup>
                                                                    <InputGroup style={{ width: '45%' }}>
                                                                        <InputGroup.Text>
                                                                            Lt
                                                                        </InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            style={{ display: 'table-cell' }}
                                                                            value={inspection.evaluations[3][1] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evaluations", e.target.value, 'dm', 3, 1)}}
                                                                        />
                                                                        <InputGroup.Text>
                                                                            s
                                                                        </InputGroup.Text>
                                                                    </InputGroup>
                                                                </div>
                                                                <div className={cx("inline")}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>
                                                                            비고
                                                                        </InputGroup.Text>
                                                                        <Form.Control
                                                                            type="text"
                                                                            style={{ display: 'table-cell' }}
                                                                            value={inspection.evalNotes[3] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evalNotes", e.target.value, 'dm', 3)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                            </div>
                                                            <div style={{ marginBottom: '15px'}}>
                                                                <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '5px'}}>5. Forward side two step</div>
                                                                <div className={cx("inline")} style={{ display: 'flex', height: 'auto', marginBottom: '15px', justifyContent: 'space-between' }}>
                                                                    <InputGroup style={{ width: '45%' }}>
                                                                        <InputGroup.Text>
                                                                            Rt
                                                                        </InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.evaluations[4][0] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evaluations", e.target.value, 'dm', 4, 0)}}
                                                                        />
                                                                        <InputGroup.Text>
                                                                            s
                                                                        </InputGroup.Text>
                                                                    </InputGroup>
                                                                    <InputGroup style={{ width: '45%' }}>
                                                                        <InputGroup.Text>
                                                                            Lt
                                                                        </InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            style={{ display: 'table-cell' }}
                                                                            value={inspection.evaluations[4][1] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evaluations", e.target.value, 'dm', 4, 1)}}
                                                                        />
                                                                        <InputGroup.Text>
                                                                            s
                                                                        </InputGroup.Text>
                                                                    </InputGroup>
                                                                </div>
                                                                <div className={cx("inline")}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>
                                                                            비고
                                                                        </InputGroup.Text>
                                                                        <Form.Control
                                                                            type="text"
                                                                            style={{ display: 'table-cell' }}
                                                                            value={inspection.evalNotes[4] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evalNotes", e.target.value, 'dm', 4)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                            </div>
                                                            <div style={{ marginBottom: '15px'}}>
                                                                <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '5px'}}>6. Brasilian step</div>
                                                                <div className={cx("inline")} style={{ display: 'flex', height: 'auto', justifyContent: 'space-between' }}>
                                                                    <InputGroup style={{ width: '25%' }}>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.evaluations[5][0] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evaluations", e.target.value, 'dm', 5, 0)}}
                                                                        />
                                                                        <InputGroup.Text>
                                                                            s
                                                                        </InputGroup.Text>
                                                                    </InputGroup>
                                                                    <InputGroup style={{ width: '65%' }}>
                                                                        <InputGroup.Text>
                                                                            비고
                                                                        </InputGroup.Text>
                                                                        <Form.Control
                                                                            type="text"
                                                                            style={{ display: 'table-cell' }}
                                                                            value={inspection.evalNotes[5] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evalNotes", e.target.value, 'dm', 5)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                            </div>
                                                            <div style={{ marginBottom: '15px'}}>
                                                                <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '5px'}}>7. Diagonal line run</div>
                                                                <div className={cx("inline")} style={{ display: 'flex', height: 'auto', justifyContent: 'space-between' }}>
                                                                    <InputGroup style={{ width: '25%' }}>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.evaluations[6][0] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evaluations", e.target.value, 'dm', 6, 0)}}
                                                                        />
                                                                        <InputGroup.Text>
                                                                            s
                                                                        </InputGroup.Text>
                                                                    </InputGroup>
                                                                    <InputGroup style={{ width: '65%' }}>
                                                                        <InputGroup.Text>
                                                                            비고
                                                                        </InputGroup.Text>
                                                                        <Form.Control
                                                                            type="text"
                                                                            style={{ display: 'table-cell' }}
                                                                            value={inspection.evalNotes[6] ?? ""}
                                                                            onChange={(e) => {updateInspection(index, "evalNotes", e.target.value, 'dm', 6)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button className={`${cx("delete")}`} onClick={() => deleteFunctionalLines(index, 'dm')}>
                                                            -
                                                        </Button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div style={{ padding: '10px 20px' }}>
                                            <Button style={{ fontSize: '15px', width: '100%', margin: 'auto'}} variant={'secondary'} onClick={addNewDynamicMovement}> 추가 </Button>
                                        </div>
                                    </Tab>
                                </Tabs>
                            </div>                            
                        </div>
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
            </Modal.Body>
            <Modal.Footer>
                <div className={cx("inline-btn")}>
                    <Button variant="primary" onClick={addPhysicalPerformance}>
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

export default PhysicalPerformanceAddModal
