import { useState, useEffect, useMemo, useCallback } from 'react'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Multiselect from 'multiselect-react-dropdown'
import { useLocalTokenValidation } from '../../../../api/commons/auth'
import styles from './ReportHistoryAddModal.module.css'
import classNames from 'classnames/bind'
import { Report, ChangeInfo } from './ReportHistory'
import { Table } from '../../../commons'
import { TableHeader } from '../../../commons/Table'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { Imoove, InBody, Exbody, LookinBody } from '../InspectionHistory/InspectionType.interface'
import { PhysicalExam } from '../../../../interfaces'
import { Inspection } from '../MedicalRecord/MedicalRecord'

const useTrialHandler = (trials: {[index: string]: {startTrial: object, endTrial: object}}, setUpdates: React.Dispatch<React.SetStateAction<Update[]>>) => {
    useEffect(() => {
        let newUpdates: Update[] = []
        for (let keys of Object.keys(trials)) {
            if (keys === '진료 기록') {
                let strial = trials[keys].startTrial as Inspection
                let etrial = trials[keys].endTrial as Inspection
                let insepctionChanges: {[index: string]: ChangeInfo} = {
                    symptoms: {start_value: strial.symptoms, end_value: strial.symptoms, importance: 'res', target_dir: 'res'},
                    diagnostics: {start_value: strial.diagnostics, end_value: strial.diagnostics, importance: 'res', target_dir: 'res'},
                }
                Object.keys(insepctionChanges).forEach((key) => {
                    newUpdates.push({
                        name: '진료 기록',
                        start_date: strial.recorded,
                        end_date: etrial.recorded,
                        value_name: key,
                        value: insepctionChanges[key]
                    })
                })
            }
            else if (keys === 'IMOOVE') {
                let strial = trials[keys].startTrial as Imoove 
                let etrial = trials[keys].endTrial as Imoove
                let imooveChanges: {[index: string]: ChangeInfo} = {
                    strength: {start_value: strial.content.strength, end_value: etrial.content.strength, importance: 'high', target_dir: 'inc'},
                    sensitivity: {start_value: strial.content.sensitivity, end_value: etrial.content.sensitivity, importance: 'high', target_dir: 'inc'},
                    supports_stability: {start_value: strial.content.supports.stability, end_value: etrial.content.supports.stability, importance: 'low', target_dir: 'inc'},
                    supports_distribution: {start_value: strial.content.supports.distribution.numerator, end_value: etrial.content.supports.distribution.numerator, importance: 'low', target_dir: 'inc'},
                    supports_point: {start_value: strial.content.supports.distribution.points, end_value: etrial.content.supports.distribution.points, importance: 'low', target_dir: 'inc'},
                    trunk_stability: {start_value: strial.content.trunk.stability, end_value: etrial.content.trunk.stability, importance: 'low', target_dir: 'inc'},
                    trunk_distribution: {start_value: strial.content.trunk.distribution.numerator, end_value: etrial.content.trunk.distribution.numerator, importance: 'low', target_dir: 'inc'},
                    trunk_points: {start_value: strial.content.trunk.distribution.points, end_value: etrial.content.trunk.distribution.points, importance: 'low', target_dir: 'inc'},
                    postural_coordination: {start_value: strial.content.postural_coordination.value, end_value: etrial.content.postural_coordination.value, importance: 'low', target_dir: 'inc'},
                    postural_points: {start_value: strial.content.postural_coordination.point, end_value: etrial.content.postural_coordination.point, importance: 'low', target_dir: 'inc'},
                    postural_strategy: {start_value: strial.content.postural_strategy, end_value: etrial.content.postural_strategy, importance: 'low', target_dir: 'inc'}
                }
                Object.keys(imooveChanges).forEach((key) => {
                    newUpdates.push({
                        name: 'IMOOVE',
                        start_date: strial.inspected,
                        end_date: etrial.inspected,
                        value_name: key,
                        value: imooveChanges[key]
                    })
                })
            }
            else if (keys === 'exbody') {
                let strial = trials[keys].startTrial as Exbody
                let etrial = trials[keys].endTrial as Exbody
                let exbodyChanges: {[index: string]: ChangeInfo} = {
                    fhp: {start_value: strial.content.analysis.fhp, end_value: etrial.content.analysis.fhp, importance: 'low', target_dir: 'res'},
                    trunkLean: {start_value: strial.content.analysis.trunk_lean, end_value: etrial.content.analysis.trunk_lean, importance: 'low', target_dir: 'res'},
                    hipExtensionFlexion: {start_value: strial.content.analysis.hip_extension_and_flexion, end_value: etrial.content.analysis.hip_extension_and_flexion, importance: 'low', target_dir: 'res'},
                    hipRotation: {start_value: strial.content.analysis.hip_rotation, end_value: etrial.content.analysis.hip_rotation, importance: 'low', target_dir: 'res'},
                    kneeExtension: {start_value: strial.content.analysis.knee_extension_and_flexion, end_value: etrial.content.analysis.knee_extension_and_flexion, importance: 'low', target_dir: 'res'},
                    trunkSideLean: {start_value: strial.content.analysis.trunk_side_lean, end_value: etrial.content.analysis.trunk_side_lean, importance: 'low', target_dir: 'res'},
                    horizontalMovCog: {start_value: strial.content.analysis.horizontal_movement_of_cog, end_value: etrial.content.analysis.horizontal_movement_of_cog, importance: 'low', target_dir: 'res'},
                    verticalMovCog: {start_value: strial.content.analysis.vertical_movement_of_cog, end_value: etrial.content.analysis.vertical_movement_of_cog, importance: 'low', target_dir: 'res'},
                    pelvicRotation: {start_value: strial.content.analysis.pelvic_rotation, end_value: etrial.content.analysis.pelvic_rotation, importance: 'low', target_dir: 'res'},
                    stepWidth: {start_value: strial.content.analysis.step_width, end_value: etrial.content.analysis.step_width, importance: 'low', target_dir: 'res'},
                    stride: {start_value: strial.content.analysis.stride, end_value: etrial.content.analysis.stride, importance: 'low', target_dir: 'res'}
                }
                Object.keys(exbodyChanges).forEach((key) => {
                    newUpdates.push({
                        name: 'Exbody',
                        start_date: strial.inspected,
                        end_date: etrial.inspected,
                        value_name: key,
                        value: exbodyChanges[key]
                    })
                })
            }
            else if (keys === 'InBody') {
                let strial = trials[keys].startTrial as InBody
                let etrial = trials[keys].endTrial as InBody
                let InBodyChanges: {[index: string]: ChangeInfo} = {
                    hydration: {start_value: strial.content.hydration_detail.body_water, end_value: etrial.content.hydration_detail.body_water, importance: 'res', target_dir: 'res'},
                    protein: {start_value: strial.content.protein, end_value: etrial.content.protein, importance: 'low', target_dir: 'inc'},
                    minerals: {start_value: strial.content.minerals, end_value: etrial.content.minerals, importance: 'low', target_dir: 'inc'},
                    bodyFatMass: {start_value: strial.content.skeletal_muscles_fat.body_fat_mass, end_value: etrial.content.skeletal_muscles_fat.body_fat_mass, importance: 'high', target_dir: 'dec'},
                    muscleMass: {start_value: strial.content.muscle_mass, end_value: etrial.content.muscle_mass, importance: 'high', target_dir: 'inc'},
                    leanBodyMass: {start_value: strial.content.lean_body_mass, end_value: etrial.content.lean_body_mass, importance: 'high', target_dir: 'dec'},
                    skeletalMuscles: {start_value: strial.content.skeletal_muscles_fat.skeletal_muscles_mass, end_value: etrial.content.skeletal_muscles_fat.skeletal_muscles_mass, importance: 'high', target_dir: 'inc'},
                    fatPercentage: {start_value: strial.content.obesity_detail.fat_percentage, end_value: etrial.content.obesity_detail.fat_percentage, importance: 'high', target_dir: 'dec'},
                    bmi: {start_value: strial.content.obesity_detail.BMI, end_value: etrial.content.obesity_detail.BMI, importance: 'low', target_dir: 'dec'},
                    rightArmMuscle: {start_value: strial.content.muscles_by_region.right_arm, end_value: etrial.content.muscles_by_region.right_arm, importance: 'low', target_dir: 'inc'},
                    leftArmMuscle: {start_value: strial.content.muscles_by_region.left_arm, end_value: etrial.content.muscles_by_region.left_arm, importance: 'low', target_dir: 'inc'},
                    bodyMuscle: {start_value: strial.content.muscles_by_region.body, end_value: etrial.content.muscles_by_region.body, importance: 'low', target_dir: 'inc'},
                    rightLegMuscle: {start_value: strial.content.muscles_by_region.right_leg, end_value: etrial.content.muscles_by_region.right_leg, importance: 'low', target_dir: 'inc'},
                    leftLegMuscle: {start_value: strial.content.muscles_by_region.left_leg, end_value: etrial.content.muscles_by_region.left_leg, importance: 'low', target_dir: 'inc'},
                    extracellularHydrationRatio: {start_value: strial.content.extracellular_hydration_percentage, end_value: etrial.content.extracellular_hydration_percentage, importance: 'low', target_dir: 'res'},
                    extracellularHydration: {start_value: strial.content.hydration_detail.extracellular, end_value: etrial.content.hydration_detail.extracellular, importance: 'low', target_dir: 'res'},
                    intracellularHydration: {start_value: strial.content.hydration_detail.intracellular, end_value: etrial.content.hydration_detail.intracellular, importance: 'low', target_dir: 'res'},
                    //rightArmHydration: {start_value: strial.content, end_value: etrial.content.hydration_by_region.right_arm, importance: 'low', target_dir: 'res'},
                    //leftArmHydration: {start_value: strial.content.hydration_by_region.left_arm, end_value: etrial.content.hydration_by_region.left_arm, importance: 'low', target_dir: 'res'},
                    //bodyHydration: {start_value: strial.content.hydration_by_region.body, end_value: etrial.content.hydration_by_region.body, importance: 'low', target_dir: 'res'},
                    //rightLegHydration: {start_value: strial.content.hydration_by_region.right_leg, end_value: etrial.content.hydration_by_region.right_leg, importance: 'low', target_dir: 'res'},
                    //leftLegHydration: {start_value: strial.content.hydration_by_region.left_leg, end_value: etrial.content.hydration_by_region.left_leg, importance: 'low', target_dir: 'res'},
                    osseousMineral: {start_value: strial.content.osseous_mineral, end_value: etrial.content.osseous_mineral, importance: 'low', target_dir: 'inc'},
                    basalMetabolicRate: {start_value: strial.content.basal_metabolic_rate, end_value: etrial.content.basal_metabolic_rate, importance: 'low', target_dir: 'inc'},
                    visceralFatArea: {start_value: strial.content.visceral_fat_area, end_value: etrial.content.visceral_fat_area, importance: 'low', target_dir: 'dec'},
                    waistHipRatio: {start_value: strial.content.waist_hip_ratio, end_value: etrial.content.waist_hip_ratio, importance: 'low', target_dir: 'dec'},
                    bodyCellMass: {start_value: strial.content.body_cell_mass, end_value: etrial.content.body_cell_mass, importance: 'low', target_dir: 'res'},
                    upperArmCircumference: {start_value: strial.content.upper_arm_circumference, end_value: etrial.content.upper_arm_circumference, importance: 'low', target_dir: 'res'},
                    upperArmMuscleCircumference: {start_value: strial.content.upper_arm_muscle_circumference, end_value: etrial.content.upper_arm_muscle_circumference, importance: 'low', target_dir: 'inc'},
                    tbwFfm: {start_value: strial.content.tbw_ffm, end_value: etrial.content.tbw_ffm, importance: 'low', target_dir: 'res'},
                    smi: {start_value: strial.content.smi, end_value: etrial.content.smi, importance: 'low', target_dir: 'res'},
                }
                Object.keys(InBodyChanges).forEach((key) => {
                    newUpdates.push({
                        name: 'InBody',
                        start_date: strial.inspected,
                        end_date: etrial.inspected,
                        value_name: key,
                        value: InBodyChanges[key]
                    })
                })
            }
            else if (keys === "Lookin' body") {
                let strial = trials[keys].startTrial as LookinBody
                let etrial = trials[keys].endTrial as LookinBody
                let LookinBodyChanges: {[index: string]: ChangeInfo} = {}
                for (let i = 0; i < strial.content.inspections.length; i++) {
                    let name = strial.content.inspections[i].name
                    let svalue = strial.content.inspections[i].value
                    let evalue = etrial.content.inspections[i].value
                    if (name !== undefined) LookinBodyChanges[name] = {start_value: svalue === "" ? NaN : svalue, end_value: evalue === "" ? NaN : evalue, importance: 'high', target_dir: 'inc'}
                }
                Object.keys(LookinBodyChanges).forEach((key) => {
                    newUpdates.push({
                        name: "Lookin' body",
                        start_date: strial.inspected,
                        end_date: etrial.inspected,
                        value_name: key,
                        value: LookinBodyChanges[key]
                    })
                })
            }
            else if (keys === "운동능력검사") {
                let strial = trials[keys].startTrial as LookinBody
                let etrial = trials[keys].endTrial as LookinBody
                let LookinBodyChanges: {[index: string]: ChangeInfo} = {}
                for (let i = 0; i < strial.content.inspections.length; i++) {
                    let name = strial.content.inspections[i].name
                    let svalue = strial.content.inspections[i].value
                    let evalue = etrial.content.inspections[i].value
                    if (name !== undefined) LookinBodyChanges[name] = {start_value: svalue === "" ? NaN : svalue, end_value: evalue === "" ? NaN : evalue, importance: 'high', target_dir: 'inc'}
                }
                Object.keys(LookinBodyChanges).forEach((key) => {
                    newUpdates.push({
                        name: "운동능력검사",
                        start_date: strial.inspected,
                        end_date: etrial.inspected,
                        value_name: key,
                        value: LookinBodyChanges[key]
                    })
                })
            }
            else if (keys === "기본 검사") {
                let strial = trials[keys].startTrial as PhysicalExam 
                let etrial = trials[keys].endTrial as PhysicalExam
                let physicalExamChanges: {[index: string]: ChangeInfo} = {
                    height: {start_value: strial.height, end_value: etrial.height, importance: 'high', target_dir: 'inc'},
                    weight: {start_value: strial.weight, end_value: etrial.weight, importance: 'high', target_dir: 'res'},
                    systolic_blood_pressure: {start_value: strial.systolic_blood_pressure, end_value: etrial.systolic_blood_pressure, importance: 'res', target_dir: 'res'},
                    diastolic_blood_pressure: {start_value: strial.diastolic_blood_pressure, end_value: etrial.diastolic_blood_pressure, importance: 'res', target_dir: 'res'},
                    body_temperature: {start_value: strial.body_temperature, end_value: etrial.body_temperature, importance: 'res', target_dir: 'res'},
                }
                Object.keys(physicalExamChanges).forEach((key) => {
                    newUpdates.push({
                        name: '기본 검사',
                        start_date: strial.recorded,
                        end_date: etrial.recorded,
                        value_name: key,
                        value: physicalExamChanges[key]
                    })
                })
            }
        }
        setUpdates([...newUpdates])
    }, [trials, setUpdates])
}

interface Update {
    name: string, 
    start_date: string, 
    end_date: string, 
    value_name: string, 
    value: ChangeInfo
}

interface ReportAddModalProps {
    show: boolean,
    isNew: boolean,
    selectedReport: Report | null,
    addFunction: (newReport: Report, isNew: boolean) => void,
    handleClose: () => void
}

const therapyList: {[index: string]: string} = {
    "진료 기록": "records",
    "IMOOVE": "inspections?inspection_type=IMOOVE",
    "Exbody": "inspections?inspection_type=EXBODY",
    "InBody": "inspections?inspection_type=INBODY",
    "Lookin' Body": "inspections?inspection_type=LOOKINBODY",
    //"운동능력검사": "inspections?inspection_type=PHYSICAL_PERFORMANCE",
    "운동 치료": "kinesitherapy",
    "기본 검사": "physical_exam"
}

const ReportHistoryAddModal = ({ show, isNew, selectedReport, addFunction, handleClose }: ReportAddModalProps) => {
    const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수
    const cx = classNames.bind(styles)

    const { patient_id } = useParams()
    const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

    const headers: TableHeader = [
		{ 
			Header: "치료/검사 종류",
			accessor: "name",
			width: 100
		},
        {
            Header: "기간",
			accessor: "",
            Cell: ({ row }) => (
				<div>
					{`${row.original.start_date} -> ${row.original.end_date}`}
				</div>
			),
			width: 100
        },
        {
            Header: "측정 수치",
			accessor: "value_name",
			width: 100
        },
        { 
			Header: "초기 수치",
            accessor: "value",
			Cell: ({ row }) => (
				<div>
					{`${row.original.value.start_value}`}
				</div>
			),
			width: 100
		},
        { 
			Header: "변화 수치",
			accessor: "content",
			Cell: ({ row }) => (
				<div>
					{`${row.original.value.end_value}`}
				</div>
			),
			width: 100
		},
        { 
			Header: "변화량",
			accessor: "",
			Cell: ({ row }) => (
				<div>
					{`${Math.round((row.original.value.end_value - row.original.value.start_value) * 100) / 100}`}
				</div>
			),
			width: 100
		},
		{
			Header: "향상 여부",
			accessor: "is_improved",
            Cell: ({ row }) => {
                let flag = row.original.value.target_dir === 'inc' ? 1 : -1
                let result = (row.original.value.end_value - row.original.value.start_value) * flag > 0 ? 'Y' : 'N'
                if (row.original.value.target_dir === 'res') result = '-'
                return (
                    <div>
                        {`${result}`}
                    </div>
                )
            },
			width: 100
		},
        {
			Header: "중요도",
			accessor: "",
            Cell: ({ row }) => (
				<div>
					{`${row.original.value.importance === "res" ? "-" : row.original.value.importance}`}
				</div>
			),
			width: 100
		}
	] // 환자 목록 테이블 헤더 선언
    const [allTherapiesHistory, setAllTherapiesHistory] = useState<{[index: string]: object[]}>({})

    const [selectedTherapies, setSelectedTherapies] = useState<string[]>([])
    const [startId, setStartId] = useState(-1)
    const [endId, setEndId] = useState(-1)
    const [trials, setTrials] = useState<{[index: string]: {startTrial: object, endTrial: object}}>({})
    const [defaultTrials, setDefaultTrials] = useState<{[index: string]: {startTrial: object, endTrial: object}}>({})
    const [updates, setUpdates] = useState<Update[]>([])
    const [defaultUpdates, setDefaultUpdates] = useState<Update[]>([])
    const [memo, setMemo] = useState("")
    const [therapiesHistory, setTherapiesHistory] = useState<{[index: string]: object[]}>({})

    const renderSelected = () => {
        if (!isNew && selectedReport) {
            setMemo(selectedReport.memo)
        }
    }

    const handleAddMedicalRecord = () => {
        console.log(
            isNew ? "add" : ("edit - " + selectedReport),
            "\ntherapies: " + selectedTherapies,
            "\nmemo: " + memo
        )
    }

    const handleTherapySelectionChange = (selectedList: string[]) => {
        setSelectedTherapies([...selectedList])
    }

    const getTherapyHistory = useCallback(async (type: string) => {
        let url = `/api/patients/${patient_id}/medical/${type}`
		try {
			const response = await axios.get(
				url,
				config
			)
		
            return response.data
		} catch (error) {
			console.error("진료 조회 중 오류 발생:", error)
            return null
		}
	}, [config, patient_id])

    const handleHistorySelectionChange = (type: 'start' | 'end', therapy: string, e?: React.ChangeEvent<HTMLSelectElement>) => {
        if (type === 'start') {
            setStartId(+(e?.target.value ?? 0))
            let newTrials = trials
            newTrials[therapy] = {...newTrials[therapy], startTrial: therapiesHistory[therapy][+(e?.target.value ?? 0)]}
            setTrials({...newTrials})
        }
        else if (type === 'end') {
            setEndId(+(e?.target.value ?? 0))
            let newTrials = trials
            newTrials[therapy] = {...newTrials[therapy], endTrial: therapiesHistory[therapy][+(e?.target.value ?? 0)]}
            setTrials({...newTrials})
        }
    }

    useEffect(() => {
		let testMode = true
		if (process.env.NODE_ENV !== 'development' || testMode) checkAuth()
	  }, [checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사

    useEffect(() => {
        selectedTherapies.reduce(async (acc: Promise<any>, curr: string) => {
            let result = await acc
            result[curr] = await getTherapyHistory(therapyList[curr])
            return result
        }, Promise.resolve({})).then((values: {[index: string]: object[]}) => {
            setTherapiesHistory(values)
        })
        // TODO: object to custom type
    }, [selectedTherapies, getTherapyHistory])

    useEffect(() => {
        Object.keys(therapyList).reduce(async (acc: Promise<any>, curr: string) => {
            let result = await acc
            result[curr] = await getTherapyHistory(therapyList[curr])
            return result
        }, Promise.resolve({})).then((values: {[index: string]: object[]}) => {
            setAllTherapiesHistory(values)
        })
        // TODO: object to custom type
    }, [getTherapyHistory])

    // 조건 갱신 시 실행 -> 선택 회차 초기화
    useEffect(() => {
        let trials = {} as {[index: string]: {startTrial: object, endTrial: object}}
        for (let key of Object.keys(therapiesHistory)) {
            trials[key] = {startTrial: therapiesHistory[key][0], endTrial: therapiesHistory[key][0]}
        }
        setTrials(trials)
    }, [therapiesHistory])

    // 추천을 위한 기본 실행
    useEffect(() => {
        let trials = {} as {[index: string]: {startTrial: object, endTrial: object}}
        for (let key of Object.keys(allTherapiesHistory)) {
            trials[key] = {startTrial: allTherapiesHistory[key][0], endTrial: allTherapiesHistory[key].at(-1) ?? allTherapiesHistory[key][0]}
        }
        setDefaultTrials(trials)
    }, [allTherapiesHistory])

    useTrialHandler(trials, setUpdates)
    useTrialHandler(defaultTrials, setDefaultUpdates)

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
                        <span>추천 변화 항목</span>
                    </div>
                    <div className={cx("page-content")}>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-content")}>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")} ${cx("large")}`}>
                                        <Table 
                                            headers={headers} 
                                            items={defaultUpdates.filter((item) => item.value.importance === 'high')} 
                                            useSelector={true}
                                            table_width="calc(100% - 20px)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={cx("page-title")}>
                        <span>조건</span>
                    </div>
                    <div className={cx("page-content")}>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-content")}>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")} ${cx("large")}`}>
                                        <InputGroup style={{ flexWrap: "nowrap" }}>
                                            <InputGroup.Text>치료</InputGroup.Text>
                                            <Multiselect
                                                isObject={false}
                                                options={Object.keys(therapyList)}
                                                selectedValues={selectedTherapies}
                                                onSelect={handleTherapySelectionChange}
                                                onRemove={handleTherapySelectionChange}
                                                placeholder='치료/검사 방법 선택'
                                                emptyRecordMsg='선택 가능한 치료 방법이 없습니다.'
                                                avoidHighlightFirstOption
                                            />
                                        </InputGroup>
                                    </div>
                                </div>
                                {selectedTherapies.map((therapy, index) => {
                                    return (
                                        <div className={cx("inline")} key={index}>
                                            <div className={`${cx("cell")} ${cx("small")}`}>
                                                <InputGroup>
                                                    <InputGroup.Text style={{ width: "100%", justifyContent: "center" }}>{therapy}</InputGroup.Text>
                                                </InputGroup>
                                            </div>
                                            <div className={`${cx("cell")} ${cx("small")}`}>
                                                <InputGroup>
                                                    <InputGroup.Text>시작 회차</InputGroup.Text>
                                                    <Form.Select
                                                        value={startId}
                                                        onChange={(e) => handleHistorySelectionChange('start', therapy, e)}
                                                    >
                                                        {therapiesHistory[therapy]?.map((value: any, index) => {
                                                            return (<option key={index} value={index}>{
                                                                (therapy==="진료 기록" || therapy==="기본 검사") ? value.recorded
                                                                : therapy==="운동 치료" ? value.progressed
                                                                : value.inspected
                                                            }</option>)
                                                        })}
                                                    </Form.Select>
                                                    <InputGroup.Text>회</InputGroup.Text>
                                                </InputGroup>
                                            </div>
                                            <div className={`${cx("cell")} ${cx("small")}`}>
                                                <InputGroup>
                                                    <InputGroup.Text>마지막 회차</InputGroup.Text>
                                                    <Form.Select
                                                        value={endId}
                                                        onChange={(e) => handleHistorySelectionChange('end', therapy, e)}
                                                    >
                                                        {therapiesHistory[therapy]?.map((value: any, index) => {
                                                            return (<option key={index} value={index}>{
                                                                (therapy==="진료 기록" || therapy==="기본 검사") ? value.recorded
                                                                : therapy==="운동 치료" ? value.progressed
                                                                : value.inspected
                                                            }</option>)
                                                        })}
                                                    </Form.Select>
                                                    <InputGroup.Text>회</InputGroup.Text>
                                                </InputGroup>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    <div className={cx("page-title")}>
                        <span>변화 항목</span>
                    </div>
                    <div className={cx("page-content")}>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-content")}>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")} ${cx("large")}`}>
                                    <Table 
                                        headers={headers} 
                                        items={updates} 
                                        useSelector={true}
                                        table_width="calc(100% - 20px)"
                                    />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={cx("page-title")}>
                        <span>기타</span>
                    </div>
                    <div className={cx("page-content")}>
                        <div className={cx("group-field")}> 
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
