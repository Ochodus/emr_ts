import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocalTokenValidation } from '../../../../api/commons/auth'
import { Report, ChangeInfo } from './ReportHistory'
import { TableMui } from '../../../commons'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { PhysicalExam } from '../../../../interfaces'
import { Inspection } from '../MedicalRecord/MedicalRecord'
import { DefaultInspection, ExbodyContent, ImooveContent, InBodyContent, LookinBodyContent, PhysicalPerformanceContent, SubAnalysis } from '../../../../interfaces/inspectionType.interface'
import { Box, Chip, Divider, FormControl, FormLabel, IconButton, Select, Sheet, Stack, Textarea, Typography, Button, Option } from '@mui/joy'
import { Close } from '@mui/icons-material'
import { DateTimePicker, LocalizationProvider, renderTimeViewClock } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { FormAccordion, FormAccordionDetails, FormAccordionHeader, FormAccordionSummary } from '../InspectionHistory/CustomTheme'
import { HeadCell, ID } from '../../../commons/TableMui'

const useTrialHandler = (trials: {[index: string]: {startTrial: object, endTrial: object}}, setUpdates: React.Dispatch<React.SetStateAction<(Update & ID)[]>>) => {
    useEffect(() => {
        let newUpdates: (Update & ID)[] = []
        for (let keys of Object.keys(trials)) {
            if (!trials[keys].startTrial || !trials[keys].endTrial) continue
            if (keys === '진료 기록') {
                let strial = trials[keys].startTrial as Inspection
                let etrial = trials[keys].endTrial as Inspection
                let insepctionChanges: {[index: string]: ChangeInfo} = {
                    symptoms: {start_value: strial.symptoms.toString(), end_value: strial.symptoms.toString(), importance: 'res', target_dir: 'res'},
                    diagnostics: {start_value: strial.diagnostics.toString(), end_value: strial.diagnostics.toString(), importance: 'res', target_dir: 'res'},
                }
                Object.keys(insepctionChanges).forEach((key) => {
                    newUpdates.push({
                        id: newUpdates.length,
                        name: '진료 기록',
                        start_date: strial.recorded,
                        end_date: etrial.recorded,
                        value_name: key,
                        value: insepctionChanges[key]
                    })
                })
            }
            else if (keys === 'IMOOVE') {
                let strial = trials[keys].startTrial as DefaultInspection<ImooveContent> 
                let etrial = trials[keys].endTrial as DefaultInspection<ImooveContent> 
                let imooveChanges: {[index: string]: ChangeInfo} = {
                    strength: {start_value: strial.content.strength.toString(), end_value: etrial.content.strength.toString(), importance: 'high', target_dir: 'inc'},
                    sensitivity: {start_value: strial.content.sensitivity.toString(), end_value: etrial.content.sensitivity.toString(), importance: 'high', target_dir: 'inc'},
                    supports_stability: {start_value: strial.content.supports.stability.toString(), end_value: etrial.content.supports.stability.toString(), importance: 'low', target_dir: 'inc'},
                    supports_distribution: {start_value: strial.content.supports.distribution.numerator.toString(), end_value: etrial.content.supports.distribution.numerator.toString(), importance: 'low', target_dir: 'inc'},
                    supports_point: {start_value: strial.content.supports.distribution.points.toString(), end_value: etrial.content.supports.distribution.points.toString(), importance: 'low', target_dir: 'inc'},
                    trunk_stability: {start_value: strial.content.trunk.stability.toString(), end_value: etrial.content.trunk.stability.toString(), importance: 'low', target_dir: 'inc'},
                    trunk_distribution: {start_value: strial.content.trunk.distribution.numerator.toString(), end_value: etrial.content.trunk.distribution.numerator.toString(), importance: 'low', target_dir: 'inc'},
                    trunk_points: {start_value: strial.content.trunk.distribution.points.toString(), end_value: etrial.content.trunk.distribution.points.toString(), importance: 'low', target_dir: 'inc'},
                    postural_coordination: {start_value: strial.content.postural_coordination.value.toString(), end_value: etrial.content.postural_coordination.value.toString(), importance: 'low', target_dir: 'inc'},
                    postural_points: {start_value: strial.content.postural_coordination.point.toString(), end_value: etrial.content.postural_coordination.point.toString(), importance: 'low', target_dir: 'inc'},
                    postural_strategy: {start_value: strial.content.postural_strategy.toString(), end_value: etrial.content.postural_strategy.toString(), importance: 'low', target_dir: 'inc'}
                }
                Object.keys(imooveChanges).forEach((key) => {
                    newUpdates.push({
                        id: newUpdates.length,
                        name: 'IMOOVE',
                        start_date: strial.inspected,
                        end_date: etrial.inspected,
                        value_name: key,
                        value: imooveChanges[key]
                    })
                })
            }
            else if (keys === 'Exbody') {
                console.log(trials)
                let strial = trials[keys].startTrial as DefaultInspection<ExbodyContent> 
                let etrial = trials[keys].endTrial as DefaultInspection<ExbodyContent>
                let exbodyChanges: {[index: string]: ChangeInfo} = {
                    fhp_rear: {start_value: strial.content.fhp.rear.toString(), end_value: etrial.content.fhp.rear.toString(), importance: 'low', target_dir: 'res'},
                    fhp_front: {start_value: strial.content.fhp.front.toString(), end_value: etrial.content.fhp.front.toString(), importance: 'low', target_dir: 'res'},
                    hipExtensionFlexion_right_rear: {start_value: (strial.content.hip_extension_and_flexion.right as SubAnalysis).rear.toString(), end_value: (etrial.content.hip_extension_and_flexion.right as SubAnalysis).rear.toString(), importance: 'low', target_dir: 'res'},
                    hipExtensionFlexion_right_front: {start_value: (strial.content.hip_extension_and_flexion.right as SubAnalysis).front.toString(), end_value: (etrial.content.hip_extension_and_flexion.right as SubAnalysis).front.toString(), importance: 'low', target_dir: 'res'},
                    hipExtensionFlexion_left_rear: {start_value: (strial.content.hip_extension_and_flexion.left as SubAnalysis).rear.toString(), end_value: (etrial.content.hip_extension_and_flexion.left as SubAnalysis).rear.toString(), importance: 'low', target_dir: 'res'},
                    hipExtensionFlexion_left_front: {start_value: (strial.content.hip_extension_and_flexion.left as SubAnalysis).front.toString(), end_value: (etrial.content.hip_extension_and_flexion.left as SubAnalysis).front.toString(), importance: 'low', target_dir: 'res'},
                    hipRotation_right_inside: {start_value: (strial.content.hip_rotation.right as SubAnalysis).inside.toString(), end_value: (etrial.content.hip_rotation.right as SubAnalysis).inside.toString(), importance: 'low', target_dir: 'res'},
                    hipRotation_right_outside: {start_value: (strial.content.hip_rotation.right as SubAnalysis).outside.toString(), end_value: (etrial.content.hip_rotation.right as SubAnalysis).outside.toString(), importance: 'low', target_dir: 'res'},
                    hipRotation_left_inside: {start_value: (strial.content.hip_rotation.left as SubAnalysis).inside.toString(), end_value: (etrial.content.hip_rotation.left as SubAnalysis).inside.toString(), importance: 'low', target_dir: 'res'},
                    hipRotation_left_outside: {start_value: (strial.content.hip_rotation.left as SubAnalysis).outside.toString(), end_value: (etrial.content.hip_rotation.left as SubAnalysis).outside.toString(), importance: 'low', target_dir: 'res'},
                    kneeExtensionFlexion_right: {start_value: strial.content.knee_extension_and_flexion.right.toString(), end_value: etrial.content.knee_extension_and_flexion.right.toString(), importance: 'low', target_dir: 'res'},
                    kneeExtensionFlexion_left: {start_value: strial.content.knee_extension_and_flexion.left.toString(), end_value: etrial.content.knee_extension_and_flexion.left.toString(), importance: 'low', target_dir: 'res'},
                    trunkSideLean_rear: {start_value: strial.content.trunk_side_lean.rear?.toString(), end_value: etrial.content.trunk_side_lean.rear?.toString(), importance: 'low', target_dir: 'res'},
                    trunkSideLean_front: {start_value: strial.content.trunk_side_lean.front?.toString(), end_value: etrial.content.trunk_side_lean.front?.toString(), importance: 'low', target_dir: 'res'},
                    horizontalMovCog_right: {start_value: strial.content.horizontal_movement_of_cog.right?.toString(), end_value: etrial.content.horizontal_movement_of_cog.right?.toString(), importance: 'low', target_dir: 'res'},
                    horizontalMovCog_left: {start_value: strial.content.horizontal_movement_of_cog.left?.toString(), end_value: etrial.content.horizontal_movement_of_cog.left?.toString(), importance: 'low', target_dir: 'res'},
                    verticalMovCog_up: {start_value: strial.content.vertical_movement_of_cog.up?.toString(), end_value: etrial.content.vertical_movement_of_cog.up?.toString(), importance: 'low', target_dir: 'res'},
                    pelvicRotation_right: {start_value: strial.content.pelvic_rotation.right?.toString(), end_value: etrial.content.pelvic_rotation.right?.toString(), importance: 'low', target_dir: 'res'},
                    pelvicRotation_left: {start_value: strial.content.pelvic_rotation.left?.toString(), end_value: etrial.content.pelvic_rotation.left?.toString(), importance: 'low', target_dir: 'res'},
                    stepWidth: {start_value: strial.content.step_width.value?.toString(), end_value: etrial.content.step_width.value?.toString(), importance: 'low', target_dir: 'res'},
                    stride: {start_value: strial.content.stride.value?.toString(), end_value: etrial.content.stride.value?.toString(), importance: 'low', target_dir: 'res'}
                }
                Object.keys(exbodyChanges).forEach((key) => {
                    newUpdates.push({
                        id: newUpdates.length,
                        name: 'Exbody',
                        start_date: strial.inspected,
                        end_date: etrial.inspected,
                        value_name: key,
                        value: exbodyChanges[key]
                    })
                })
            }
            else if (keys === 'InBody') {
                let strial = trials[keys].startTrial as DefaultInspection<InBodyContent>
                let etrial = trials[keys].endTrial as DefaultInspection<InBodyContent>
                let InBodyChanges: {[index: string]: ChangeInfo} = {                    
                    hydration: {start_value: strial.content.body_water_composition.body_water.value.toString(), end_value: etrial.content.body_water_composition.body_water.value.toString(), importance: 'res', target_dir: 'res'},
                    extracellular: {start_value: strial.content.body_water_composition.extracellular.value.toString(), end_value: etrial.content.body_water_composition.extracellular.value.toString(), importance: 'low', target_dir: 'inc'},
                    // minerals: {start_value: +strial.content.minerals, end_value: +etrial.content.minerals, importance: 'low', target_dir: 'inc'},
                    // bodyFatMass: {start_value: +strial.content.skeletal_muscles_fat.body_fat_mass, end_value: +etrial.content.skeletal_muscles_fat.body_fat_mass, importance: 'high', target_dir: 'dec'},
                    // muscleMass: {start_value: +strial.content.muscle_mass, end_value: +etrial.content.muscle_mass, importance: 'high', target_dir: 'inc'},
                    // leanBodyMass: {start_value: +strial.content.lean_body_mass, end_value: +etrial.content.lean_body_mass, importance: 'high', target_dir: 'dec'},
                    // skeletalMuscles: {start_value: +strial.content.skeletal_muscles_fat.skeletal_muscles_mass, end_value: +etrial.content.skeletal_muscles_fat.skeletal_muscles_mass, importance: 'high', target_dir: 'inc'},
                    // fatPercentage: {start_value: +strial.content.obesity_detail.fat_percentage, end_value: +etrial.content.obesity_detail.fat_percentage, importance: 'high', target_dir: 'dec'},
                    // bmi: {start_value: +strial.content.obesity_detail.BMI, end_value: +etrial.content.obesity_detail.BMI, importance: 'low', target_dir: 'dec'},
                    // rightArmMuscle: {start_value: +strial.content.muscles_by_region.right_arm, end_value: +etrial.content.muscles_by_region.right_arm, importance: 'low', target_dir: 'inc'},
                    // leftArmMuscle: {start_value: +strial.content.muscles_by_region.left_arm, end_value: +etrial.content.muscles_by_region.left_arm, importance: 'low', target_dir: 'inc'},
                    // bodyMuscle: {start_value: +strial.content.muscles_by_region.body, end_value: +etrial.content.muscles_by_region.body, importance: 'low', target_dir: 'inc'},
                    // rightLegMuscle: {start_value: +strial.content.muscles_by_region.right_leg, end_value: +etrial.content.muscles_by_region.right_leg, importance: 'low', target_dir: 'inc'},
                    // leftLegMuscle: {start_value: +strial.content.muscles_by_region.left_leg, end_value: +etrial.content.muscles_by_region.left_leg, importance: 'low', target_dir: 'inc'},
                    // extracellularHydrationRatio: {start_value: +strial.content.extracellular_hydration_percentage, end_value: +etrial.content.extracellular_hydration_percentage, importance: 'low', target_dir: 'res'},
                    // extracellularHydration: {start_value: +strial.content.hydration_detail.extracellular, end_value: +etrial.content.hydration_detail.extracellular, importance: 'low', target_dir: 'res'},
                    // intracellularHydration: {start_value: +strial.content.hydration_detail.intracellular, end_value: +etrial.content.hydration_detail.intracellular, importance: 'low', target_dir: 'res'},
                    // //rightArmHydration: {start_value: strial.content, end_value: etrial.content.hydration_by_region.right_arm, importance: 'low', target_dir: 'res'},
                    // //leftArmHydration: {start_value: strial.content.hydration_by_region.left_arm, end_value: etrial.content.hydration_by_region.left_arm, importance: 'low', target_dir: 'res'},
                    // //bodyHydration: {start_value: strial.content.hydration_by_region.body, end_value: etrial.content.hydration_by_region.body, importance: 'low', target_dir: 'res'},
                    // //rightLegHydration: {start_value: strial.content.hydration_by_region.right_leg, end_value: etrial.content.hydration_by_region.right_leg, importance: 'low', target_dir: 'res'},
                    // //leftLegHydration: {start_value: strial.content.hydration_by_region.left_leg, end_value: etrial.content.hydration_by_region.left_leg, importance: 'low', target_dir: 'res'},
                    // osseousMineral: {start_value: +strial.content.osseous_mineral, end_value: +etrial.content.osseous_mineral, importance: 'low', target_dir: 'inc'},
                    // basalMetabolicRate: {start_value: +strial.content.basal_metabolic_rate, end_value: +etrial.content.basal_metabolic_rate, importance: 'low', target_dir: 'inc'},
                    // visceralFatArea: {start_value: +strial.content.visceral_fat_area, end_value: +etrial.content.visceral_fat_area, importance: 'low', target_dir: 'dec'},
                    // waistHipRatio: {start_value: +strial.content.waist_hip_ratio, end_value: +etrial.content.waist_hip_ratio, importance: 'low', target_dir: 'dec'},
                    // bodyCellMass: {start_value: +strial.content.body_cell_mass, end_value: +etrial.content.body_cell_mass, importance: 'low', target_dir: 'res'},
                    // upperArmCircumference: {start_value: +strial.content.upper_arm_circumference, end_value: +etrial.content.upper_arm_circumference, importance: 'low', target_dir: 'res'},
                    // upperArmMuscleCircumference: {start_value: +strial.content.upper_arm_muscle_circumference, end_value: +etrial.content.upper_arm_muscle_circumference, importance: 'low', target_dir: 'inc'},
                    // tbwFfm: {start_value: +strial.content.tbw_ffm, end_value: +etrial.content.tbw_ffm, importance: 'low', target_dir: 'res'},
                    // smi: {start_value: +strial.content.smi, end_value: +etrial.content.smi, importance: 'low', target_dir: 'res'},
                }
                Object.keys(InBodyChanges).forEach((key) => {
                    newUpdates.push({
                        id: newUpdates.length,
                        name: 'InBody',
                        start_date: strial.inspected,
                        end_date: etrial.inspected,
                        value_name: key,
                        value: InBodyChanges[key]
                    })
                })
            }
            else if (keys === "Lookin' body") {
                let strial = trials[keys].startTrial as DefaultInspection<LookinBodyContent>
                let etrial = trials[keys].endTrial as DefaultInspection<LookinBodyContent>
                let LookinBodyChanges: {[index: string]: ChangeInfo} = {}
                Object.keys(strial.content).forEach((key) => {
                    let name = key
                    let svalue = strial.content[key]?.value ?? ""
                    let evalue = etrial.content[key]?.value ?? ""
                    if (name !== undefined) LookinBodyChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}
                })
                Object.keys(LookinBodyChanges).forEach((key) => {
                    newUpdates.push({
                        id: newUpdates.length,
                        name: "Lookin' body",
                        start_date: strial.inspected,
                        end_date: etrial.inspected,
                        value_name: key,
                        value: LookinBodyChanges[key]
                    })
                })
            }
            else if (keys === "운동능력검사") {
                let strial = trials[keys].startTrial as DefaultInspection<PhysicalPerformanceContent>
                let etrial = trials[keys].endTrial as DefaultInspection<PhysicalPerformanceContent>
                let LookinBodyChanges: {[index: string]: ChangeInfo} = {}
                // Object.keys(strial.content).map((key) => {
                //     let name = key
                //     let svalue = strial.content[key]?.value ?? ""
                //     let evalue = etrial.content[key]?.value ?? ""
                //     if (name !== undefined) LookinBodyChanges[name] = {start_value: svalue === "" ? NaN : svalue, end_value: evalue === "" ? NaN : evalue, importance: 'high', target_dir: 'inc'}
                // })
                Object.keys(LookinBodyChanges).forEach((key) => {
                    newUpdates.push({
                        id: newUpdates.length,
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
                    height: {start_value: strial.height.toString(), end_value: etrial.height.toString(), importance: 'high', target_dir: 'inc'},
                    weight: {start_value: strial.weight.toString(), end_value: etrial.weight.toString(), importance: 'high', target_dir: 'res'},
                    systolic_blood_pressure: {start_value: strial.systolic_blood_pressure.toString(), end_value: etrial.systolic_blood_pressure.toString(), importance: 'res', target_dir: 'res'},
                    diastolic_blood_pressure: {start_value: strial.diastolic_blood_pressure.toString(), end_value: etrial.diastolic_blood_pressure.toString(), importance: 'res', target_dir: 'res'},
                    body_temperature: {start_value: strial.body_temperature.toString(), end_value: etrial.body_temperature.toString(), importance: 'res', target_dir: 'res'},
                }
                Object.keys(physicalExamChanges).forEach((key) => {
                    newUpdates.push({
                        id: newUpdates.length,
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

export interface Update {
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
    addReport: (newReport: Report, isNew: boolean) => void,
    handleClose: React.Dispatch<React.SetStateAction<boolean>>
}

const therapyList: {[index: string]: string} = {
    "진료 기록": "records",
    "IMOOVE": "inspections?inspection_type=IMOOVE",
    "Exbody": "inspections?inspection_type=EXBODY",
    "InBody": "inspections?inspection_type=INBODY",
    "Lookin' Body": "inspections?inspection_type=LOOKINBODY",
    "운동능력검사": "inspections?inspection_type=PHYSICAL_PERFORMANCE",
    "운동 치료": "kinesitherapy",
    "기본 검사": "physical_exam"
}

const ReportHistoryAddModal = ({ show, isNew, selectedReport, addReport, handleClose }: ReportAddModalProps) => {
    const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수

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

    const headCells: HeadCell<Update & ID>[] = [
		{
            id: 'name',
            numeric: false,
            label: '치료/검사 종류',
		},
		{
            id: ['start_date', 'end_date'],
            numeric: false,
            label: '기간',
            parse: (value: (Update[keyof Update] | number)[]) => { 
                if (typeof value[0] === 'string' && typeof value[1] === 'string') {
                    return `${dayjs(value[0]).format('YYYY-MM-DD')} ~ ${dayjs(value[1]).format('YYYY-MM-DD')}`
                }
                else return ''
			}
		},
		{
		  id: 'value_name',
		  numeric: false,
		  label: '측정 항목'
		},
        {
            id: 'value',
            numeric: true,
            label: '값 변화',
            parse: (value) => { 
                if (typeof value !== 'string' && typeof value !== 'number') return `${value.start_value} > ${value.end_value}`
                else return ''
            }
        },
		{
		  id: 'value',
		  numeric: true,
		  label: '수치 변화',
          parse: (value) => { 
            if (typeof value !== 'string' && typeof value !== 'number') {
                let svalue = value.start_value
                let evalue = value.end_value
                if (typeof svalue === 'number' && typeof evalue === 'number') return `${evalue - svalue > 0 ? '+' : ""}${evalue - svalue}`
                else if (!isNaN(+svalue) && !isNaN(+evalue)) return `${+evalue - +svalue > 0 ? '+' : ""}${+evalue - +svalue}`
                else return "-"
            }
            else return value
           }
		},
        {
            id: 'value',
            numeric: true,
            label: '개선 여부',
            parse: (value) => { 
                if (typeof value !== 'string' && typeof value !== 'number') {
                    let svalue = value.start_value
                    let evalue = value.end_value
                    if (!isNaN(+svalue) && !isNaN(+evalue)) {
                        if (value.target_dir === 'inc' && +evalue > +svalue) return 'Y'
                        if (value.target_dir === 'dec' && +svalue > +evalue) return 'Y'
                        return 'N'
                    }
                    return '-'
                }
                else return value
            }
        },
        {
            id: 'value',
            numeric: true,
            label: '중요도',
            parse: (value) => { 
                if (typeof value !== 'string' && typeof value !== 'number') {
                    return value.importance
                }
                else return value
            }
        }
	];
    
    const [allTherapiesHistory, setAllTherapiesHistory] = useState<{[index: string]: object[]}>({})

    const [selectedTherapies, setSelectedTherapies] = useState<string[]>([])
    const [startId, setStartId] = useState(-1)
    const [endId, setEndId] = useState(-1)
    const [trials, setTrials] = useState<{[index: string]: {startTrial: object, endTrial: object}}>({})
    const [defaultTrials, setDefaultTrials] = useState<{[index: string]: {startTrial: object, endTrial: object}}>({})
    const [updates, setUpdates] = useState<(Update & ID)[]>([])
    const [defaultUpdates, setDefaultUpdates] = useState<(Update & ID)[]>([])
    const [reportDate, setReportDate] = useState<dayjs.Dayjs>(dayjs())
    const [memo, setMemo] = useState("")
    const [therapiesHistory, setTherapiesHistory] = useState<{[index: string]: object[]}>({})
    const [defaultSelected, setDefaultSelected] = useState<number[]>([]);
    const [selected, setSelected] = useState<number[]>([]);

    const handleAddReport = () => {
        console.log(
            isNew ? "add" : ("edit - " + selectedReport),
            "\ntherapies: " + selectedTherapies,
            "\nmemo: " + memo
        )

        const newReport: Report = {
            report_date: reportDate.format(),
            changes: selected.map((value) => {
                return updates[value]
            }).concat(defaultSelected.map((value) => {
                return defaultUpdates[value]
            })),
            memo: memo
        }

        console.log(newReport)

        addReport(newReport, isNew)
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

    const handleHistorySelectionChange = (type: 'start' | 'end', therapy: string, value: number | null) => {
        if (value === null) return
        if (type === 'start') {
            setStartId(value)
            let newTrials = trials
            newTrials[therapy] = {...newTrials[therapy], startTrial: therapiesHistory[therapy][value]}
            setTrials({...newTrials})
        }
        else if (type === 'end') {
            setEndId(value)
            let newTrials = trials
            newTrials[therapy] = {...newTrials[therapy], endTrial: therapiesHistory[therapy][value]}
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
            if (therapiesHistory[key]) trials[key] = {startTrial: therapiesHistory[key][0], endTrial: therapiesHistory[key][0]}
        }
        setTrials(trials)
    }, [therapiesHistory])

    // 추천을 위한 기본 실행
    useEffect(() => {
        let trials = {} as {[index: string]: {startTrial: object, endTrial: object}}
        for (let key of Object.keys(allTherapiesHistory)) {
            if (allTherapiesHistory[key]) trials[key] = {startTrial: allTherapiesHistory[key][0], endTrial: allTherapiesHistory[key].at(-1) ?? allTherapiesHistory[key][0]}
        }
        console.log(trials)
        setDefaultTrials(trials)
    }, [allTherapiesHistory])

    useTrialHandler(trials, setUpdates)
    useTrialHandler(defaultTrials, setDefaultUpdates)

    return (
        <Sheet
            variant="outlined"
            sx={{
                position: 'relative',
                borderRadius: 'sm',
                p: 1,
                width: '100%',
                flexShrink: 0,
                left: show ? "-100%" : 0,
                transition: 'left 0.4s ease',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box sx={{ 
                    display: 'flex', 
                    gap: 2,
                    justifyContent: 'space-between',
                    p: '0px 5px'
                }}>
                    <Typography 
                        fontWeight="600" 
                        fontSize="20px"
                        sx={{
                            color: '#32383e',
                            margin: 'auto 0'
                        }}
                    >환자 치료 경과 리포트 {isNew ? "추가" : "편집"}
                    </Typography>
                    <IconButton
                        variant='plain' 
                        onClick={() => {handleClose(false)}}
                        sx={{ }}
                    ><Close />
                    </IconButton>
            </Box>
            <Divider component="div" sx={{ my: 1 }} />  
            <Box
                className="scrollable vertical"
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    p: '0 5px',
                    margin: '10px 0',
                    alignItems: 'middle',
                    flex: '1 1 0',
                }}
            >    
                <FormAccordion defaultExpanded>
                    <FormAccordionSummary>
                        <FormAccordionHeader>추천 변화 항목</FormAccordionHeader>
                    </FormAccordionSummary>
                    <FormAccordionDetails>
                        <Stack direction='column' gap={2} sx={{ 
                            justifyContent: 'space-between',
                            p: '0px 5px',
                            alignItems: 'middle'
                        }}>
                            <TableMui<Update & ID>
                                headCells={headCells} 
                                rows={defaultUpdates.filter((item) => item.value.importance === 'high')}
                                defaultRowNumber={18}
                                selected={defaultSelected}
                                setSelected={setDefaultSelected}
                            />
                        </Stack>
                    </FormAccordionDetails>
                </FormAccordion>
                <FormAccordion defaultExpanded>
                    <FormAccordionSummary>
                        <FormAccordionHeader>진단 및 회차 직접 선택</FormAccordionHeader>
                    </FormAccordionSummary>
                    <FormAccordionDetails>
                        <Stack gap={2} sx={{ justifyContent: 'center' }}>
                            <FormControl size="md">
                                <FormLabel>진단</FormLabel>
                                <Select
                                    multiple
                                    size="md"
                                    placeholder="진단 선택"
                                    value={selectedTherapies}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', gap: '0.25rem' }}>
                                            {selected.map((selectedOption, index) => (
                                                <Chip variant="soft" color="primary" key={index}>
                                                    {selectedOption.label}
                                                </Chip>
                                            ))}
                                        </Box>
                                    )}
                                    slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                                    onChange={(_, value) => handleTherapySelectionChange(value)}
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                >
                                    {Object.keys(therapyList).map((therapy, index) => {
                                        return (
                                            <Option key={index} value={therapy}>{`${therapy}`}</Option>
                                        )
                                    })}
                                </Select>
                            </FormControl>
                            <Divider orientation='horizontal'></Divider>
                            {selectedTherapies.map((therapy, index) => (
                                <React.Fragment key={index}>
                                    <Stack direction='row' gap={2} sx={{ justifyContent: 'space-around'}}>
                                        <Typography fontWeight={600} sx={{ m: 'auto', flex: '0 1 auto', width: '15%', textAlign: 'center' }}>{therapy}</Typography>
                                        <Divider orientation='vertical'></Divider>
                                        <FormControl size="md" sx={{ flex: '1 1 auto' }}>
                                            <FormLabel>시작 회차</FormLabel>
                                            <Select
                                                size="md"
                                                placeholder="진단 선택"
                                                value={startId}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', gap: '0.25rem' }}>
                                                        {selected ?
                                                            <Chip variant="soft" color="primary" key={index}>
                                                                {selected.label}
                                                            </Chip>
                                                        : null}
                                                    </Box>
                                                )}
                                                slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                                                onChange={(_, value) => handleHistorySelectionChange('start', therapy, value)}
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                            >
                                                {therapiesHistory[therapy]?.map((value: any, index) => (
                                                    <Option key={index} value={index}>
                                                        {
                                                            (therapy==="진료 기록" || therapy==="기본 검사") ? value.recorded
                                                            : therapy==="운동 치료" ? value.progressed
                                                            : value.inspected
                                                        }
                                                    </Option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <FormControl size="md" sx={{ flex: '1 1 auto' }}>
                                            <FormLabel>최종 회차</FormLabel>
                                            <Select
                                                size="md"
                                                placeholder="진단 선택"
                                                value={endId}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', gap: '0.25rem' }}>
                                                        {selected ?
                                                            <Chip variant="soft" color="primary" key={index}>
                                                                {selected.label}
                                                            </Chip>
                                                        : null}
                                                    </Box>
                                                )}
                                                slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                                                onChange={(_, value) => handleHistorySelectionChange('end', therapy, value)}
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                            >
                                                {therapiesHistory[therapy]?.map((value: any, index) => (
                                                    <Option key={index} value={index}>
                                                        {
                                                            (therapy==="진료 기록" || therapy==="기본 검사") ? value.recorded
                                                            : therapy==="운동 치료" ? value.progressed
                                                            : value.inspected
                                                        }
                                                    </Option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Stack>
                                    <Divider orientation='horizontal'/>
                                </React.Fragment>
                            ))}
                        </Stack>
                    </FormAccordionDetails>
                </FormAccordion> 
                <FormAccordion defaultExpanded>
                    <FormAccordionSummary>
                        <FormAccordionHeader>검색된 변화 항목</FormAccordionHeader>
                    </FormAccordionSummary>
                    <FormAccordionDetails>
                        <Stack direction='column' gap={2} sx={{ 
                            justifyContent: 'space-between',
                            p: '0px 5px',
                            alignItems: 'middle'
                        }}>
                            <TableMui<Update & ID>
                                headCells={headCells} 
                                rows={updates}
                                defaultRowNumber={18}
                                selected={selected}
                                setSelected={setSelected}
                            />
                        </Stack>
                    </FormAccordionDetails>
                </FormAccordion>
                <FormAccordion defaultExpanded>
                    <FormAccordionSummary>
                        <FormAccordionHeader>기타</FormAccordionHeader>
                    </FormAccordionSummary>
                    <FormAccordionDetails>
                        <Stack direction='column' gap={2} sx={{ 
                            justifyContent: 'space-between',
                            p: '0px 5px',
                            alignItems: 'middle'
                        }}>
                        <FormControl size="md">
                            <FormLabel>진료일자</FormLabel>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                                <DateTimePicker 
                                    value={dayjs(reportDate)} 
                                    onChange={(e) => {setReportDate(dayjs(e))}}
                                    orientation="portrait"
                                    viewRenderers={{
                                        hours: renderTimeViewClock,
                                        minutes: renderTimeViewClock,
                                        seconds: renderTimeViewClock
                                    }}
                                    format="YYYY/MM/DD a hh:mm"
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                    ampm
                                />
                            </LocalizationProvider>
                        </FormControl>
                        <FormControl size="md">
                            <FormLabel>비고</FormLabel>
                            <Textarea
                                minRows={1}
                                placeholder="기타 사항"
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                                sx={{
                                    backgroundColor: '#ffffff'
                                }}
                            />
                        </FormControl>
                    </Stack>
                    </FormAccordionDetails>
                </FormAccordion>
            </Box>
            <Button variant='soft' onClick={handleAddReport} sx={{ margin: 'auto', width: '50%' }}>
                {isNew ? "추가": "변경"}
            </Button>
        </Sheet>
    )
}

export default ReportHistoryAddModal
