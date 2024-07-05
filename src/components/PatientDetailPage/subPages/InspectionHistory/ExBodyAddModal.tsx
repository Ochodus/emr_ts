import React, { useState, useMemo } from 'react'
import OcrParser from '../../../commons/OcrParser'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styles from './InBodyAddModal.module.css'
import classNames from 'classnames/bind';
import ExBodyTable from './ExBodyTable'
import { useParams } from 'react-router-dom'
import { useDateTimeParser } from '../../../../api/commons/dateTimeParse'
import { Exbody, Analysis, SubAnalysis } from './InspectionType.interface'
import { uploadData, uploadFiles } from './utils'
import { produce } from 'immer'

interface ExbodyAddModalProps {
    show: any, 
    isNew?: boolean,
    selectedExbody?: Exbody & {id: number} | null
    handleClose: ()=> void, 
    cv: any
}

type inspectionUpdater<T> = React.Dispatch<React.SetStateAction<T>>

const initAnalysis: Analysis = {
    fhp: {
        image: "",
        rear: "",
        front: ""
    },
    trunk_lean: {
        image: "",
        rear: "",
        front: ""
    },
    hip_extension_and_flexion: {
        image: "",
        left: {
            front: "",
            rear: ""
        },
        right: {
            front: "",
            rear: ""
        }
    },
    hip_rotation: {
        image: "",
        right: {
            inside: "",
            outside: ""
        },
        left: {
            inside: "",
            outside: ""
        }
    },
    knee_extension_and_flexion: {
        image: "",
        left: "",
        right: ""
    },
    trunk_side_lean: {
        image: "",
        left: "",
        right: ""
    },
    horizontal_movement_of_cog: {
        image: "",
        left: "",
        right: ""
    },
    vertical_movement_of_cog: {
        image: "",
        up: "",
        down: ""
    },
    pelvic_rotation: {
        image: "",
        left: "",
        right: ""
    },
    step_width: {
        image: "",
        value: ""
    },
    stride: {
        image: "",
        value: ""
    }
}

const parseOcrResult = (arr: (string | number)[]): SubAnalysis => {
    let result: SubAnalysis = {};
    let prevIndex: string | number = ""
    let curTarget: SubAnalysis = result

    arr.forEach((value) => {
        if (prevIndex !== "") {
            if (typeof value === 'string') {
                if (typeof prevIndex === 'string') {
                    result[prevIndex] = {}
                    curTarget = result[prevIndex] as SubAnalysis
                }
            }
            else {
                curTarget[prevIndex] = value
            }
        }
        else if (typeof value === 'number') {
            result['value'] = value
        }
        prevIndex = value
    })

    return result;
};

const parseStringToData = (value: string | undefined) => {
    if (!value) return {}

    const convertTable = {
        '앞': 'front',
        '뒤': 'rear',
        '우': 'right',
        '좌': 'left',
        '내': 'inside',
        '외': 'outside',
        '위': 'up',
        '아래': 'down'
    }

    const altRegex = /(앞|뒤|우|좌|내|외|위|아래|\d+)/g;

    let match
    let converted: (string | number)[] = []
    while ((match = altRegex.exec(value)) !== null) {
        if (/^\d+$/.test(match[0])) converted.push(parseInt(match[0], 10))
        else converted.push(convertTable[match[0] as (keyof typeof convertTable)])
    }

    return {...parseOcrResult(converted), image: ""} as SubAnalysis
}


const ExBodyAddModal = ({
    show,
    isNew=false, 
    selectedExbody=null,
    handleClose, 
    cv
}: ExbodyAddModalProps) => {
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

    const [analysis, setAnalysis] = useState<Analysis>(initAnalysis)

    const [file, setFile] = useState<File | null>(null)
    const [memo, setMemo] = useState("")

    const onChangeOcrResult = (result: any) => {
        updateDeepValue(setAnalysis, ['fhp'], parseStringToData(result.fhp)) // 뒤4도\n앞6도
        updateDeepValue(setAnalysis, ['trunk_lean'], parseStringToData(result.trunkLean)) // 우1도\n좌1도
        updateDeepValue(setAnalysis, ['hip_extension_and_flexion'], parseStringToData(result.hipExtensionFlexion)) // 우:앞21도\n뒤14도\n좌:앞20도\n뒤13도
        updateDeepValue(setAnalysis, ['hip_rotation'], parseStringToData(result.hipRotation)) //우;내3도\n외4도\n좌:내1도\n외5도
        updateDeepValue(setAnalysis, ['knee_extension_and_flexion'], parseStringToData(result.kneeExtensionFlexion)) // 좌3도\n우6도
        updateDeepValue(setAnalysis, ['trunk_side_lean'], parseStringToData(result.trunkSideLean)) // 우1도\n좌1도
        updateDeepValue(setAnalysis, ['horizontal_movement_of_cog'], parseStringToData(result.horizontalMovementOfCOG)) // 우2cm\n좌5cm
        updateDeepValue(setAnalysis, ['vertical_movement_of_cog'], parseStringToData(result.verticalMovementOfCOG)) // 위1cm
        updateDeepValue(setAnalysis, ['pelvic_rotation'], parseStringToData(result.pelvicRotation)) //우7도\n좌6도
        updateDeepValue(setAnalysis, ['step_width'], parseStringToData(result.stepWidth)) // 14cm
        updateDeepValue(setAnalysis, ['stride'], parseStringToData(result.stride)) // 38cm

        setDate(new Date(result.date.split(' ')[0]))
    }

    const updateInspection = <T,>(
        draft: T, 
        targetPath: (string | number)[], 
        newValue: string | SubAnalysis
    ) => {
        if (targetPath.length === 1) {
            draft[targetPath[0] as (keyof T)] = newValue as T[keyof T]
        } else {
            let newDraft = draft[targetPath[0] as (keyof T)]
            updateInspection<typeof newDraft>(newDraft, targetPath.slice(1), newValue)
        }
    }

    const updateDeepValue = <T extends Analysis>(setInspection: inspectionUpdater<T>, targetPath: (string | number)[], newValue: string | SubAnalysis) => {
        setInspection(prevObj =>
            (produce(prevObj, draft => {
                updateInspection(draft, targetPath, newValue)
            }))
        )
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

    const Entry = <T extends object | string | number>({value, path}: {value: T, path: string[]}) => {
        if (typeof value !== 'object') {
            return (
                <Form.Control
                    type="number"
                    value={+value}
                    onChange={(e) => updateDeepValue(setAnalysis, path, `${e.target.value}`)}
                    style={{ width: '30%', margin: 'auto'}}
                />
            )
        } else {
            return (
                <div>
                    {Object.keys(value as {}).map((key) => {
                        if (key === 'image') return null
                        return (
                            <div style={{ display: 'flex'}} key={key}>
                                <div style={{ width: '40%', margin: 'auto', padding: '10px', fontWeight: '550', borderRight: '1px solid gray' }} >{key}</div>
                                <Entry value={value[key as (keyof T)] as T} path={path.concat(key)}/>
                            </div>
                        )
                    })}
                </div>
            );
        }
    }

    const items = Object.keys(analysis).map((key) => {
        let titles = {
            fhp: "FHP",
            trunk_lean: "Trunk Lean",
            hip_extension_and_flexion: "Hip Extension · Flexion",
            hip_rotation: "Hip Rotation",
            knee_extension_and_flexion: "Knee Extension · Flexion",
            trunk_side_lean: "Trunk Side Lean",
            horizontal_movement_of_cog: "Horizontal Movement of COG",
            vertical_movement_of_cog: "Vertical Movement of COG",
            pelvic_rotation: "Pelvic Rotation",
            step_width: "Step Width",
            stride: "Stride"
        }

        return {
            type: <RowTitle title={titles[key as (keyof typeof titles)]}></RowTitle>,
            graph: <div></div>,
            values: <Entry value={analysis[key as (keyof Analysis)]} path={[key]}></Entry>,
        }
    })

    const addExBodyRecord = async () => {
        uploadFiles(selectedExbody, file, 'Exbody', config).then((file_url) => {

            console.log(analysis)
            const newExbodyRecord: Exbody = {
                file_url: file_url,
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
                    analysis: analysis
                },
                detail: memo
            }
            uploadData(isNew, url, newExbodyRecord, 'Exbody', config, handleClose, selectedExbody?.id)
        })
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
                                            type={2} 
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
                                                value={memo}
                                                onChange={(e) => setMemo(e.target.value)}
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
