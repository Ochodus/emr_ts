import React, { useState, useMemo, useEffect } from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'
import { InBodyTable } from '../..'
import { ResponsiveBullet, Datum } from '@nivo/bullet'
import OcrParser from '../../../commons/OcrParser'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styles from './InBodyAddModal.module.css'
import classNames from 'classnames/bind';
import ExBodyTable from './ExBodyTable'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { useDateTimeParser } from '../../../../api/commons/dateTimeParse'

interface GaitFrontRear {
    front: number,
    rear: number
}

interface GaitLeftRight {
    left: number,
    right: number
}

interface GaitComplex {
    leftGait: GaitFrontRear
    rightGait: GaitFrontRear
}

type Gait = GaitFrontRear | GaitLeftRight | GaitComplex | number | undefined

interface ExbodyOcrResult {
    [name: string]: Gait
}

interface ExbodyResultStates {
    [index: string]: [Gait, React.Dispatch<React.SetStateAction<any>>]
}

const parseStringToData = (value: string | undefined) => {
    if (!value) return undefined
    
    let s = value.replace(/[^\d\n]/g, '')
    console.log(s)
    let numbers = value.replace(/[^\d\n]/g, '').split(/\n/).map(Number);
    console.log(numbers)
    
    if (numbers.length === 1) return numbers[0]
    if (numbers.length === 2) return { front: numbers[0], rear: numbers[1] }
    if (numbers.length === 4) return { 
        leftGait: { front: numbers[2], rear: numbers[3] },
        rightGait: { front: numbers[0], rear: numbers[1] } 
    }
    return undefined
}

const ExBodyAddModal = ({show, handleClose, isNew=false, cv}: {show: any, handleClose: ()=> void, isNew?: boolean, cv: any}) => {
    const cx = classNames.bind(styles)
    const dateParser = useDateTimeParser()

    const { patient_id } = useParams();
    const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `/api/patients/${patient_id}/medical/inspections/exbody`

    const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

    const [date, setDate] = useState<Date>(new Date())
    const [fhp, setFhp] = useState<GaitFrontRear>()
    const [trunkLean, setTrunkLean] = useState<GaitFrontRear>()
    const [hipExtensionFlexion, setHipExtensionFlexion] = useState<GaitComplex>()
    const [hipRotation, setHipRotation] = useState<GaitComplex>()
    const [kneeExtensionFlexion, setKneeExtensionFlexion] = useState<GaitLeftRight>()
    const [trunkSideLean, setTrunkSideLean] = useState<GaitLeftRight>()
    const [horizontalMovementOfCOG, setHorizontalMovementOfCOG] = useState<GaitLeftRight>()
    const [verticalMovementOfCOG, setVerticalMovementOfCOG] = useState<number>()
    const [pelvicRotation, setPelvicRotation] = useState<GaitLeftRight>()
    const [stepWidth, setStepWidth] = useState<number>()
    const [stride, setStride] = useState<number>()

    const exbodyResultStates: ExbodyResultStates = {
        fhp: [fhp, setFhp],
        trunkLean: [trunkLean, setTrunkLean],
        hipExtensionFlexion: [hipExtensionFlexion, setHipExtensionFlexion],
        hipRotation: [hipRotation, setHipRotation],
        kneeExtensionFlexion: [kneeExtensionFlexion, setKneeExtensionFlexion],
        trunkSideLean: [trunkSideLean, setTrunkSideLean],
        horizontalMovementOfCOG: [horizontalMovementOfCOG, setHorizontalMovementOfCOG],
        verticalMovementOfCOG: [verticalMovementOfCOG, setVerticalMovementOfCOG],
        pelvicRotation: [pelvicRotation, setPelvicRotation],
        stepWidth: [stepWidth, setStepWidth],
        stride: [stride, setStride],
    }

    const onChangeOcrResult = (result: any) => {
        console.log(result)

        const parsedData: ExbodyOcrResult = {
            fhp: parseStringToData(result.fhp),
            trunkLean: parseStringToData(result.trunkLean),
            hipExtensionFlexion: parseStringToData(result.hipExtensionFlexion),
            hipRotation: parseStringToData(result.hipRotation),
            kneeExtensionFlexion: parseStringToData(result.kneeExtensionFlexion),
            trunkSideLean: parseStringToData(result.trunkSideLean),
            horizontalMovementOfCOG: parseStringToData(result.horizontalMovementOfCOG),
            verticalMovementOfCOG: parseStringToData(result.verticalMovementOfCOG),
            pelvicRotation: parseStringToData(result.pelvicRotation),
            stepWidth: parseStringToData(result.stepWidth),
            stride: parseStringToData(result.stride),
        }

        console.log(parsedData)

        Object.values(exbodyResultStates).map((states, index) => {
            let key = Object.keys(exbodyResultStates)[index]
            let newData = parsedData[key]
            if (newData) {
                states[1](newData)
            }
        })

        setDate(new Date(result.date.split(' ')[0]))
    }

    const headers = useMemo(
        () => [
            {
                Header: "종류",
                accessor: "type",
            },
            {
                Header: "측정치",
                accessor: "graph",
            },
            {
                Header: "측정결과",
                accessor: "values",
            },
        ],
        []
    )

    const handleGaitValueChange = (value: number, path: string) => {
        let paths = path.split('.')
        let target = exbodyResultStates[paths[0]]

        target[1]((prevGait: Gait) => {
            // 이전 값 복사
            if (!prevGait) return undefined
            if (typeof prevGait === 'number') return value

            let newGait = undefined
            if ('front' in prevGait) {
                if (paths[1] === 'front') newGait = { ...prevGait, front: value }
                else newGait = { ...prevGait, rear: value }
            }
            else if ('left' in prevGait) {
                if (paths[1] === 'left') newGait = { ...prevGait, left: value }
                else newGait = { ...prevGait, right: value }
            }
            else {
                if (paths[1] === 'leftGait') {
                    if (paths[2] === 'front') newGait = { ...prevGait, leftGait: {...prevGait.leftGait, front: value} }
                    else newGait = { ...prevGait, leftGait: {...prevGait.leftGait, rear: value} }
                }
                else {
                    if (paths[2] === 'front') newGait = { ...prevGait, rightGait: {...prevGait.rightGait, front: value} }
                    else newGait = { ...prevGait, rightGait: {...prevGait.rightGait, rear: value} }
                }
            }

            return newGait;
          });
    }

    const RowTitle = ({title}: {title: string}) => {
        return (
            <div className={cx("row-title")}>
                <div className={cx("row-title-ko-wrapper")}>
                    <div className={cx("row-title-ko")}>
                        {title}
                    </div>
                </div>
            </div>
        )
    }

    const Entry = ({values, path}: {values: Gait, path: string}) => {
        if (typeof values === 'number') {
            return (
              <Form.Control
                type="number"
                value={values}
                onChange={(e) => handleGaitValueChange(Number(e.target.value), path)}
                style={{ width: '30%', margin: 'auto'}}
              />
            );
          } else if (values !== undefined) {
            return (
              <div>
                {Object.keys(values).map((key) => (
                  <div style={{ display: 'flex'}} key={key}>
                    <div style={{ width: '40%', margin: 'auto', padding: '10px', fontWeight: '550', borderRight: '1px solid gray'  }} >{key}</div>
                    <Entry values={(values as any)[key]} path={`${path}.${key}`}/>
                  </div>
                ))}
              </div>
            );
          } else {
            return null;
          }
    }

    const items = [
        {
            type: <RowTitle title="FHP"></RowTitle>,
            graph: <div></div>,
            values: <Entry values={fhp} path={'fhp'}></Entry>,
        },
        {
            type: <RowTitle title="Trunk Lean"></RowTitle>,
            graph: <div></div>,
            values: <Entry values={trunkLean} path={'trunkLean'}></Entry>,
        },
        {
            type: <RowTitle title="Hip Extension / Flexion"></RowTitle>,
            graph: <div></div>,
            values: <Entry values={hipExtensionFlexion} path={'hipExtensionFlexion'}></Entry>,
        },
        {
            type: <RowTitle title="Hip Rotation"></RowTitle>,
            graph: <div></div>,
            values: <Entry values={hipRotation} path={'hipRotation'}></Entry>,
        },
        {
            type: <RowTitle title="Knee Extension / Flexion"></RowTitle>,
            graph: <div></div>,
            values: <Entry values={kneeExtensionFlexion} path={'kneeExtensionFlexion'}></Entry>,
        },
        {
            type: <RowTitle title="Trunk Side Lean"></RowTitle>,
            graph: <div></div>,
            values: <Entry values={trunkSideLean} path={'trunkSideLean'}></Entry>,
        },
        {
            type: <RowTitle title="Horizontal Movement of COG"></RowTitle>,
            graph: <div></div>,
            values: <Entry values={horizontalMovementOfCOG} path={'horizontalMovementOfCOG'}></Entry>,
        },
        {
            type: <RowTitle title="Vertical Movement of COG"></RowTitle>,
            graph: <div></div>,
            values: <Entry values={verticalMovementOfCOG} path={'verticalMovementOfCOG'}></Entry>,
        },
        {
            type: <RowTitle title="Pelvic Rotation"></RowTitle>,
            graph: <div></div>,
            values: <Entry values={pelvicRotation} path={'pelvicRotation'}></Entry>,
        },
        {
            type: <RowTitle title="Step Width"></RowTitle>,
            graph: <div></div>,
            values: <Entry values={stepWidth} path={'stepWidth'}></Entry>,
        },
        {
            type: <RowTitle title="Stride"></RowTitle>,
            graph: <div></div>,
            values: <Entry values={stride} path={'stride'}></Entry>,
        },
    ]

    const addExBodyRecord = async () => {
        const newInBodyRecord = {
            file_url: "",
            inspected: dateParser(date ?? new Date()),
            content: {
                name: "",
                phone: "",
                age: "",
                gender: 0,
                height: 0,
                weight: 0,
                effectived: dateParser(date ?? new Date()),
                chart_no: 0,
                department: 0,
                inpatient_area: 0,
                bed_no: 0,
                fhp: {
                    image: "",
                    rear: fhp?.rear,
                    front: fhp?.front
                },
                trunk_lean: {
                    image: "",
                    rear: trunkLean?.rear,
                    front: trunkLean?.front
                },
                hip_extension_and_flexion: {
                    image: "",
                    left_front: hipExtensionFlexion?.leftGait.front,
                    left_rear: hipExtensionFlexion?.leftGait.rear,
                    right_front: hipExtensionFlexion?.rightGait.front,
                    right_rear: hipExtensionFlexion?.rightGait.rear,
                },
                hip_rotation: {
                    image: "",
                    right_inside: hipRotation?.leftGait.front,
                    right_outside: hipRotation?.leftGait.rear,
                    left_inside: hipRotation?.rightGait.front,
                    left_outside: hipRotation?.rightGait.rear,
                },
                knee_extension_and_flexion: {
                    image: "",
                    left: kneeExtensionFlexion?.left ?? 0,
                    right: kneeExtensionFlexion?.right ?? 0
                },
                trunk_side_lean: {
                    image: "",
                    left: trunkSideLean?.left,
                    right: trunkSideLean?.right
                },
                horizontal_movement_of_cog: {
                    image: "",
                    left: horizontalMovementOfCOG?.left,
                    right: horizontalMovementOfCOG?.right
                },
                vertical_movement_of_cog: {
                    image: "",
                    left: verticalMovementOfCOG ?? 0,
                    right: verticalMovementOfCOG ?? 0,
                },
                pelvic_rotation: {
                    image: "",
                    left: pelvicRotation?.left,
                    right: pelvicRotation?.right
                },
                step_width: {
                    image: "",
                    value: stepWidth
                },
                stride: {
                    image: "",
                    value: stride
                }
            },
            detail: ""
        }
        try {
            await axios.post(url, newInBodyRecord, config)
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
                        <strong>Exbody</strong>
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
                                <span>Clinical Gait Analysis Graph</span>
                            </div>
                            <div className={cx("group-content")}>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")}`}>
                                        <ExBodyTable headers={headers} items={items} useSelector={false}>
                                        </ExBodyTable>
                                    </div>
                                </div>
                                <div className={cx("inline")}>
                                    <div className={cx("cell")}>
                                        <InputGroup>
                                            <InputGroup.Text>검사일자</InputGroup.Text>
                                            <Form.Control
                                                type="date"
                                                value={date?.toLocaleDateString('en-CA')}
                                                onChange={(e)=> setDate(new Date(e.target.value))}
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
                    <Button variant="primary" onClick={addExBodyRecord}>
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

export default ExBodyAddModal
