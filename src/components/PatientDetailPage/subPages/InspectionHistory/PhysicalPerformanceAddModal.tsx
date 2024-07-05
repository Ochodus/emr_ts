import React, { useState, useMemo } from 'react'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import styles from './PhysicalPerformanceAddModal.module.css'
import classNames from 'classnames/bind'
import { useParams } from 'react-router-dom'
import { useDateTimeParser } from '../../../../api/commons/dateTimeParse'
import { BallBounce, DynamicMovement, FunctionalLine, PhysicalPerformance, YBalance } from './InspectionType.interface'
import { Draft, produce } from 'immer'
import { uploadData, uploadFiles } from './utils'

type inspection = FunctionalLine | YBalance | BallBounce | DynamicMovement
type inspectionUpdater<T extends inspection> = React.Dispatch<React.SetStateAction<T[]>>

interface PhysicalPerformanceAddModalProps {
    show: boolean, 
    isNew?: boolean,
    selectedPhysicalPerformance?: PhysicalPerformance & {id: number} | null 
    handleClose: ()=> void,
}

const initialFunctionalLine: FunctionalLine = {
    trial_number: 0, 
    rt: {
        rt: {
            rt: ["", ""], 
            lt: ["", ""]
        }, 
        lt: {
            rt: ["", ""], 
            lt: ["", ""]
        }
    }, 
    lt: {
        rt: {
            rt: ["", ""], 
            lt: ["", ""]
        }, 
        lt: {
            rt: ["", ""], 
            lt: ["", ""]
        }
    }
}

const initialYBalance: YBalance = {
    trial_number: 0, 
    rt: {
        at: ["", ""], 
        pl: ["", ""], 
        pm: ["", ""]
    }, 
    lt: {
        at: ["", ""], 
        pl: ["", ""], 
        pm: ["", ""]
    }
}

const initialBallBounce: BallBounce = {
    trial_number: 0, 
    rt: {
        step: "", 
        distance: "", 
        trials: [
            {time: "", amount: ""}, 
            {time: "", amount: ""}, 
            {time: "", amount: ""}
        ], 
        note: ""
    }, 
    lt: {step: "", 
        distance: "", 
        trials: [
            {time: "", amount: ""}, 
            {time: "", amount: ""}, 
            {time: "", amount: ""}
        ], 
        note: ""
    }
}

const initialDynamicMovement: DynamicMovement = {
    trial_number: 0, 
    two_leg_jump: {time: "", note: ""}, 
    side_step: {rt: "", lt: "", note: ""}, 
    side_one_step_in_out: {rt: "", lt: "", note: ""}, 
    side_two_step_in_out: {rt: "", lt: "", note: ""},
    forward_side_to_step: {rt: "", lt: "", note: ""}, 
    brasilian_step: {time: "", note: ""}, 
    diagonal_line_run: {time: "", note: ""}
}

const PhysicalPerformanceAddModal = ({
    show,
    isNew=true,
    selectedPhysicalPerformance=null,
    handleClose, 
}: PhysicalPerformanceAddModalProps) => {
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

    const [selectedInspection, setSelectedInspection] = useState<string>("functionalLine")

    const [note, setNote] = useState<string>("")

    const [file, setFile] = useState<File | null>(null)

    const addInspections = <T extends inspection>(setInspection: inspectionUpdater<T>, initValue: T) => {
        setInspection(prevObj =>
            (produce(prevObj, draft => {
                if (Array.isArray(draft)) draft.push(initValue as Draft<T>)
            }))
        )
    }

    const deleteInspections = <T extends inspection>(setInspection: inspectionUpdater<T>, index: number) => {
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

    const updateDeepValue = <T extends inspection>(setInspection: inspectionUpdater<T>, targetPath: (string | number)[], newValue: string) => {
        setInspection(prevObj =>
            (produce(prevObj, draft => {
                updateInspection(draft, targetPath, newValue)
            }))
        )
    }

    const addPhysicalPerformance = async () => {
        uploadFiles(selectedPhysicalPerformance, file, "운동능력검사", config).then((file_url) => { 
            const newPhysicalPerformance: PhysicalPerformance = {
                file_url: file_url,
                inspected: dateParser(date ?? new Date()),
                content: {
                    name: "",
                    age: 0,
                    height: 0,
                    gender: 0,
                    functional_line: functionalLines,
                    y_balance: yBalance,
                    ball_bounce: ballBounce,
                    dynamic_movement: dynamicMovement
                },
                detail: ""
            }
            
            uploadData(isNew, url, newPhysicalPerformance, "운동능력검사", config, handleClose, selectedPhysicalPerformance?.id)
        })
    }

    const renderSelected = () => {
        if (selectedPhysicalPerformance) {
            selectedPhysicalPerformance.content.functional_line.forEach((item) => {
                addInspections(setFunctionalLines, item)
            })
            selectedPhysicalPerformance.content.y_balance.forEach((item) => {
                addInspections(setYBalance, item)
            })
            selectedPhysicalPerformance.content.ball_bounce.forEach((item) => {
                addInspections(setBallBounce, item)
            })
            selectedPhysicalPerformance.content.dynamic_movement.forEach((item) => {
                addInspections(setDynamicMovement, item)
            })
        }
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
                                <div className={`${cx("cell")} ${cx("large")}`}>
                                <Form.Control
                                    type="file" 
                                    onChange={(e: any) => setFile(e.target.files[0])}
                                />
                                </div>
                            </div>
                        </div>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")}>
                                <span>검사일자</span>
                            </div>
                            <div className={cx("inline")}>
                                <div className={`${cx("cell")}`}>
                                    <InputGroup>
                                        <InputGroup.Text>검사일자</InputGroup.Text>
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
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")}>
                                <Tabs 
                                    activeKey={selectedInspection}
                                    onSelect={(k) => setSelectedInspection(k ?? 'functionalLine')}
                                    className="mb-3"
                                >
                                    <Tab eventKey="functionalLine" title="기능선 테스트">
                                        <div className={cx("group-content")}>
                                            <div style={{ borderBottom: '1px solid gray', padding: '20px' }}>
                                                <img src={`${process.env.PUBLIC_URL}/images/inspectionIcon/functionalLine.png`} style={{ width: '100%', height: '500px' }} alt=''></img>
                                            </div>
                                            {functionalLines.map((inspection, index) => {
                                                return (
                                                    <div style={{ display: 'flex', borderBottom: '1px solid gray', justifyContent: 'space-between', margin: '0 10px'}} key={index}>
                                                        <div className={`${cx("cell")} ${cx("small")}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                                                            <InputGroup>
                                                                <InputGroup.Text>회차</InputGroup.Text>
                                                                <Form.Control
                                                                    type="number"
                                                                    value={inspection.trial_number}
                                                                    onChange={(e) => {updateDeepValue(setFunctionalLines, [index, "trial_number"], e.target.value)}}
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
                                                                            value={inspection.rt.rt.rt[0]}
                                                                            onChange={(e) => {updateDeepValue(setFunctionalLines, [index, 'rt', 'rt', 'rt', 0], e.target.value)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rt.rt.rt[1]}
                                                                            onChange={(e) => {updateDeepValue(setFunctionalLines, [index, 'rt', 'rt', 'rt', 1], e.target.value)}}
                                                                        />
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rt.rt.lt[0]}
                                                                            onChange={(e) => {updateDeepValue(setFunctionalLines, [index, 'rt', 'rt', 'lt', 0], e.target.value)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rt.rt.lt[1]}
                                                                            onChange={(e) => {updateDeepValue(setFunctionalLines, [index, 'rt', 'rt', 'lt', 1], e.target.value)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                                <div className={`${cx("cell")}`} style={{ width: '45%' }}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>RT/LT</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rt.lt.rt[0]}
                                                                            onChange={(e) => {updateDeepValue(setFunctionalLines, [index, 'rt', 'lt', 'rt', 0], e.target.value)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rt.lt.rt[1]}
                                                                            onChange={(e) => {updateDeepValue(setFunctionalLines, [index, 'rt', 'lt', 'rt', 1], e.target.value)}}
                                                                        />
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rt.lt.lt[0]}
                                                                            onChange={(e) => {updateDeepValue(setFunctionalLines, [index, 'rt', 'lt', 'lt', 0], e.target.value)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rt.lt.lt[1]}
                                                                            onChange={(e) => {updateDeepValue(setFunctionalLines, [index, 'rt', 'lt', 'lt', 1], e.target.value)}}
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
                                                                            value={inspection.lt.rt.rt[0]}
                                                                            onChange={(e) => {updateDeepValue(setFunctionalLines, [index, 'lt', 'rt', 'rt', 0], e.target.value)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.lt.rt.rt[1]}
                                                                            onChange={(e) => {updateDeepValue(setFunctionalLines, [index, 'lt', 'rt', 'rt', 1], e.target.value)}}
                                                                        />
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.lt.rt.lt[0]}
                                                                            onChange={(e) => {updateDeepValue(setFunctionalLines, [index, 'lt', 'rt', 'lt', 0], e.target.value)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.lt.rt.lt[1]}
                                                                            onChange={(e) => {updateDeepValue(setFunctionalLines, [index, 'lt', 'rt', 'lt', 1], e.target.value)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                                <div className={`${cx("cell")}`} style={{ width: '45%' }}>
                                                                <InputGroup>
                                                                        <InputGroup.Text>LT/LT</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.lt.lt.rt[0]}
                                                                            onChange={(e) => {updateDeepValue(setFunctionalLines, [index, 'lt', 'lt', 'rt', 0], e.target.value)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.lt.lt.rt[1]}
                                                                            onChange={(e) => {updateDeepValue(setFunctionalLines, [index, 'lt', 'lt', 'rt', 1], e.target.value)}}
                                                                        />
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.lt.lt.lt[0]}
                                                                            onChange={(e) => {updateDeepValue(setFunctionalLines, [index, 'lt', 'lt', 'lt', 0], e.target.value)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.lt.lt.lt[1]}
                                                                            onChange={(e) => {updateDeepValue(setFunctionalLines, [index, 'lt', 'lt', 'lt', 1], e.target.value)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button className={`${cx("delete")}`} onClick={() => deleteInspections(setFunctionalLines, index)}>
                                                            -
                                                        </Button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div style={{ padding: '10px 20px' }}>
                                            <Button style={{ fontSize: '15px', width: '100%', margin: 'auto'}} variant={'secondary'} onClick={() => addInspections(setFunctionalLines, initialFunctionalLine)}> 추가 </Button>
                                        </div>
                                    </Tab>
                                    <Tab eventKey="yBalance" title="Y-Balance 테스트">
                                        <div className={cx("group-content")}>
                                            <div style={{ borderBottom: '1px solid gray', padding: '20px' }}>
                                                <img src={`${process.env.PUBLIC_URL}/images/inspectionIcon/yBalance.png`} style={{ width: '100%', height: '500px' }} alt=''></img>
                                            </div>
                                            {yBalance.map((inspection, index) => {
                                                return (
                                                    <div style={{ display: 'flex', borderBottom: '1px solid gray', justifyContent: 'space-between', margin: '0 10px'}} key={index}>
                                                        <div className={`${cx("cell")} ${cx("small")}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                                                            <InputGroup>
                                                                <InputGroup.Text>회차</InputGroup.Text>
                                                                <Form.Control
                                                                    type="number"
                                                                    value={inspection.trial_number ?? ""}
                                                                    onChange={(e) => {updateDeepValue(setYBalance, [index, 'trial_number'], e.target.value)}}
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
                                                                            value={inspection.rt.at[0]}
                                                                            onChange={(e) => {updateDeepValue(setYBalance, [index, 'rt', 'at', 0], e.target.value)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rt.at[1]}
                                                                            onChange={(e) => {updateDeepValue(setYBalance, [index, 'rt', 'at', 1], e.target.value)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                                <div className={`${cx("cell")}`} style={{ width: '30%' }}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>RT/PL</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rt.pl[0]}
                                                                            onChange={(e) => {updateDeepValue(setYBalance, [index, 'rt', 'pl', 0], e.target.value)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rt.pl[1]}
                                                                            onChange={(e) => {updateDeepValue(setYBalance, [index, 'rt', 'pl', 1], e.target.value)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                                <div className={`${cx("cell")}`} style={{ width: '30%' }}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>RT/PM</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rt.pm[0]}
                                                                            onChange={(e) => {updateDeepValue(setYBalance, [index, 'rt', 'pm', 0], e.target.value)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.rt.pm[1]}
                                                                            onChange={(e) => {updateDeepValue(setYBalance, [index, 'rt', 'pm', 1], e.target.value)}}
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
                                                                            value={inspection.lt.at[0]}
                                                                            onChange={(e) => {updateDeepValue(setYBalance, [index, 'lt', 'at', 0], e.target.value)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.lt.at[1]}
                                                                            onChange={(e) => {updateDeepValue(setYBalance, [index, 'lt', 'at', 1], e.target.value)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                                <div className={`${cx("cell")}`} style={{ width: '30%' }}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>LT/PL</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.lt.pl[0]}
                                                                            onChange={(e) => {updateDeepValue(setYBalance, [index, 'lt', 'pl', 0], e.target.value)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.lt.pl[1]}
                                                                            onChange={(e) => {updateDeepValue(setYBalance, [index, 'lt', 'pl', 1], e.target.value)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                                <div className={`${cx("cell")}`} style={{ width: '30%' }}>
                                                                    <InputGroup>
                                                                        <InputGroup.Text>LT/PM</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.lt.pm[0]}
                                                                            onChange={(e) => {updateDeepValue(setYBalance, [index, 'lt', 'pm', 0], e.target.value)}}
                                                                        />
                                                                        <div className={cx("dash")}> , </div>
                                                                        <Form.Control
                                                                            type="number"
                                                                            value={inspection.lt.pm[1]}
                                                                            onChange={(e) => {updateDeepValue(setYBalance, [index, 'lt', 'pm', 1], e.target.value)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button className={`${cx("delete")}`} onClick={() => deleteInspections(setYBalance, index)}>
                                                            -
                                                        </Button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div style={{ padding: '10px 20px' }}>
                                            <Button style={{ fontSize: '15px', width: '100%', margin: 'auto'}} variant={'secondary'} onClick={() => addInspections(setYBalance, initialYBalance)}> 추가 </Button>
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
                                                                    value={inspection.trial_number ?? ""}
                                                                    onChange={(e) => {updateDeepValue(setBallBounce, [index, 'trial_number'], e.target.value)}}
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
                                                                                            value={inspection.rt.step}
                                                                                            onChange={(e) => {updateDeepValue(setBallBounce, [index, 'rt', 'step'], e.target.value)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>단계, </div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.rt.distance}
                                                                                            onChange={(e) => {updateDeepValue(setBallBounce, [index, 'rt', 'distance'], e.target.value)}}
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
                                                                                            value={inspection.rt.trials[0].time}
                                                                                            onChange={(e) => {updateDeepValue(setBallBounce, [index, 'rt', 'trials', 0, 'time'], e.target.value)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>초 / </div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.rt.trials[0].amount}
                                                                                            onChange={(e) => {updateDeepValue(setBallBounce, [index, 'rt', 'trials', 0, 'amount'], e.target.value)}}
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
                                                                                            value={inspection.rt.trials[1].time}
                                                                                            onChange={(e) => {updateDeepValue(setBallBounce, [index, 'rt', 'trials', 1, 'time'], e.target.value)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>
                                                                                            초 / 
                                                                                        </div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.rt.trials[1].amount}
                                                                                            onChange={(e) => {updateDeepValue(setBallBounce, [index, 'rt', 'trials', 1, 'amount'], e.target.value)}}
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
                                                                                            value={inspection.rt.trials[2].time}
                                                                                            onChange={(e) => {updateDeepValue(setBallBounce, [index, 'rt', 'trials', 2, 'time'], e.target.value)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>
                                                                                            초 / 
                                                                                        </div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.rt.trials[2].amount}
                                                                                            onChange={(e) => {updateDeepValue(setBallBounce, [index, 'rt', 'trials', 2, 'amount'], e.target.value)}}
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
                                                                                            value={inspection.lt.step}
                                                                                            onChange={(e) => {updateDeepValue(setBallBounce, [index, 'lt', 'step'], e.target.value)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>단계, </div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.lt.distance}
                                                                                            onChange={(e) => {updateDeepValue(setBallBounce, [index, 'lt', 'distance'], e.target.value)}}
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
                                                                                            value={inspection.lt.trials[0].time}
                                                                                            onChange={(e) => {updateDeepValue(setBallBounce, [index, 'lt', 'trials', 0, 'time'], e.target.value)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>초 / </div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.lt.trials[0].amount}
                                                                                            onChange={(e) => {updateDeepValue(setBallBounce, [index, 'lt', 'trials', 0, 'amount'], e.target.value)}}
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
                                                                                            value={inspection.lt.trials[1].time}
                                                                                            onChange={(e) => {updateDeepValue(setBallBounce, [index, 'lt', 'trials', 1, 'time'], e.target.value)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>
                                                                                            초 / 
                                                                                        </div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.lt.trials[1].amount}
                                                                                            onChange={(e) => {updateDeepValue(setBallBounce, [index, 'lt', 'trials', 1, 'amount'], e.target.value)}}
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
                                                                                            value={inspection.lt.trials[2].time}
                                                                                            onChange={(e) => {updateDeepValue(setBallBounce, [index, 'lt', 'trials', 2, 'time'], e.target.value)}}
                                                                                        />
                                                                                        <div className={cx(`unit`)}>
                                                                                            초 / 
                                                                                        </div>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            value={inspection.lt.trials[2].amount}
                                                                                            onChange={(e) => {updateDeepValue(setBallBounce, [index, 'lt', 'trials', 2, 'amount'], e.target.value)}}
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
                                                                                        value={inspection.rt.note}
                                                                                        placeholder='내용을 입력해주세요'
                                                                                        onChange={(e) => {updateDeepValue(setBallBounce, [index, 'rt', 'note'], e.target.value)}}
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
                                                                                        value={inspection.lt.note}
                                                                                        placeholder='내용을 입력해주세요'
                                                                                        onChange={(e) => {updateDeepValue(setBallBounce, [index, 'lt', 'note'], e.target.value)}}
                                                                                    />
                                                                                </div>                                                                    
                                                                            </td>
                                                                        </tr>                                                
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                        <Button className={`${cx("delete")}`} onClick={() => deleteInspections(setBallBounce, index)}>
                                                            -
                                                        </Button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div style={{ padding: '10px 20px' }}>
                                            <Button style={{ fontSize: '15px', width: '100%', margin: 'auto'}} variant={'secondary'} onClick={() => addInspections(setBallBounce, initialBallBounce)}> 추가 </Button>
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
                                                                    value={inspection.trial_number}
                                                                    onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'trial_number'], e.target.value)}}
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
                                                                            value={inspection['two_leg_jump'].time ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'two_leg_jump', 'time'], e.target.value)}}
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
                                                                            value={inspection['two_leg_jump'].note ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'two_leg_jump', 'note'], e.target.value)}}
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
                                                                            value={inspection['side_step'].rt ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'side_step', 'rt'], e.target.value)}}
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
                                                                            value={inspection['side_step'].lt ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'side_step', 'lt'], e.target.value)}}
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
                                                                            value={inspection['side_step'].note ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'side_step', 'note'], e.target.value)}}
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
                                                                            value={inspection['side_one_step_in_out'].rt ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'side_one_step_in_out', 'rt'], e.target.value)}}
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
                                                                            value={inspection['side_one_step_in_out'].lt ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'side_one_step_in_out', 'lt'], e.target.value)}}
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
                                                                            value={inspection['side_one_step_in_out'].note ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'side_one_step_in_out', 'note'], e.target.value)}}
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
                                                                            value={inspection['side_two_step_in_out'].rt ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'side_two_step_in_out', 'rt'], e.target.value)}}
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
                                                                            value={inspection['side_two_step_in_out'].lt ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'side_two_step_in_out', 'lt'], e.target.value)}}
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
                                                                            value={inspection['side_two_step_in_out'].note ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'side_two_step_in_out', 'note'], e.target.value)}}
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
                                                                            value={inspection['forward_side_to_step'].rt ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'forward_side_to_step', 'rt'], e.target.value)}}
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
                                                                            value={inspection['forward_side_to_step'].lt ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'forward_side_to_step', 'lt'], e.target.value)}}
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
                                                                            value={inspection['forward_side_to_step'].note ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'forward_side_to_step', 'note'], e.target.value)}}
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
                                                                            value={inspection['brasilian_step'].time ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'brasilian_step', 'time'], e.target.value)}}
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
                                                                            value={inspection['brasilian_step'].note ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'brasilian_step', 'note'], e.target.value)}}
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
                                                                            value={inspection['diagonal_line_run'].time ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'diagonal_line_run', 'time'], e.target.value)}}
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
                                                                            value={inspection['diagonal_line_run'].note ?? ""}
                                                                            onChange={(e) => {updateDeepValue(setDynamicMovement, [index, 'diagonal_line_run', 'note'], e.target.value)}}
                                                                        />
                                                                    </InputGroup>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button className={`${cx("delete")}`} onClick={() => deleteInspections(setDynamicMovement, index)}>
                                                            -
                                                        </Button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div style={{ padding: '10px 20px' }}>
                                            <Button style={{ fontSize: '15px', width: '100%', margin: 'auto'}} variant={'secondary'} onClick={() => addInspections(setDynamicMovement, initialDynamicMovement)}> 추가 </Button>
                                        </div>
                                    </Tab>
                                </Tabs>
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
