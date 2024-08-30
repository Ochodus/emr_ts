import React, { useCallback, useEffect } from 'react'
import { InBodyContent, numberInput, rangeInput } from 'interfaces/inspectionType.interface'
import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import utc from "dayjs/plugin/utc"
import 'dayjs/locale/ko'
import { FormControl, FormLabel, Input, Stack } from '@mui/joy'
import { FormAccordion, FormAccordionDetails, FormAccordionHeader, FormAccordionSummary } from './CustomTheme';
import { updateDeepValue, validationCheck } from 'api/commons/utils'

dayjs.extend(isLeapYear)
dayjs.extend(utc)
dayjs.locale('ko')

interface InBodyContentFormProps {
    content?: InBodyContent, 
    ocrResults?: {parseType: number, result: {[index: string]: any}[]}[],
    submitted?: boolean,
    setContent?: React.Dispatch<React.SetStateAction<InBodyContent>>,
    setContentValidation?: React.Dispatch<React.SetStateAction<boolean>>,
    setExDate?: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>
}

const initialInBodyContent: InBodyContent = {
    body_water_composition: { // 체수분구성
        body_water: {value: "", min: "", max: ""}, // 체수분
        intracellular: {value: "", min: "", max: ""}, // 세포내수분
        extracellular: {value: "", min: "", max: ""}, // 세포외수분
        extracellular_hydration_percentage: "" // 세포외수분비
    },
    segmental_body_water_analysis: { // 부위별 체수분 분석
        right_arm: {value: "", min: "", max: ""},
        left_arm: {value: "", min: "", max: ""},
        body: {value: "", min: "", max: ""},
        right_leg: {value: "", min: "", max: ""},
        left_leg: {value: "", min: "", max: ""}
    },
    segmental_lean_analysis: { // 부위별 근육 분석
        right_arm: "",
        left_arm: "",
        body: "",
        right_leg: "",
        left_leg: ""
    },
    body_composition_analysis: { // 체성분 분석
        protein: {value: "", min: "", max: ""}, // 단백질
        minerals: {value: "", min: "", max: ""}, // 무기질
        body_fat_mass: {value: "", min: "", max: ""}, // 체지방량
        lean_body_mass: {value: "", min: "", max: ""}, // 제지방량
        osseous_mineral: {value: "", min: "", max: ""}, // 골무기질량
    },
    muscle_fat_analysis: { // 골격근 지방 분석
        weight: {value: "", min: "", max: ""}, // 체중
        skeletal_muscles_mass: {value: "", min: "", max: ""}, // 골격근량
        muscle_mass: {value: "", min: "", max: ""}, // 근육량
        body_fat_mass: {value: "", min: "", max: ""} // 체지방량
    },
    obesity_detail: { // 비만 분석
        BMI: {value: "", min: "", max: ""}, // BMI
        fat_percentage: {value: "", min: "", max: ""} // 체지방률
    },
    research_parameter: {
        basal_metabolic_rate: {value: "", min: "", max: ""}, // 기초대사량
        visceral_fat_area: "", // 내장지방단면적
        waist_hip_ratio: {value: "", min: "", max: ""}, // 복부지방률
        body_cell_mass: {value: "", min: "", max: ""}, // 체세포량
        upper_arm_circumference: "", // 상완위팔둘레
        upper_arm_muscle_circumference: "", // 상완위팔근육둘레
        tbw_ffm: "", // TBW/FFM
        smi: "" // SMI
    }
}

const parseStringToData = (value: string | undefined) => {
    if (!value) return undefined
    
    let numbers = value.replace(/[m|cm]2/, '').replace(/[^\d.\s]/g, ' ').replace(/\s+$/, '').split(/\s+/).map(Number);
    
    if (numbers.length === 1) return numbers[0]
    if (numbers.length === 2) return numbers[0]
    if (numbers.length === 3) return { value: numbers[0], min: numbers[1], max: numbers[2] }
    return undefined
}

const defaultInput = (placeholder: string, value: numberInput, error?: boolean, onChange?: React.ChangeEventHandler<HTMLInputElement>, label?: string) => {
    return (
        <FormControl size="md" error={error} sx={{ flexDirection: label ? 'column' : 'column-reverse', flex: label ? '1 1 auto' : '0 0 auto' }}>
            {label && <FormLabel>{label}</FormLabel>}
            <Input
                type="number"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                sx={{
                    backgroundColor: '#ffffff'
                }}
            />                        
        </FormControl>
    )
}

const InBodyContentForm = ({content, ocrResults=[{parseType: 0, result: []}], submitted, setContent, setContentValidation, setExDate}: InBodyContentFormProps) => {
    const GroupInput = (value: {[index: string]: rangeInput | numberInput}) => {
        if (!content) return
        let parentKey = Object.keys(content).find(key => content[key as keyof InBodyContent] === value) ?? ""
        return (
            <Stack gap={2}>
                {Object.keys(value).map((key, index) => {
                    let target = value[key]
                    return (
                        <Stack direction='row' gap={2} sx={{ p: 1 }} key={index}>
                            {!(typeof target === 'number' || typeof target === 'string') 
                            ? <React.Fragment>
                                {defaultInput(                                    
                                    "측정 값", 
                                    target.value,                                    
                                    !validationCheck(target.value) && submitted,
                                    (e) => updateDeepValue(setContent, [parentKey, key, 'value'], e.target.value),
                                    key
                                )}
                                {defaultInput(                                    
                                    "표준 최소", 
                                    target.min, 
                                    !validationCheck(target.min) && submitted, 
                                    (e) => updateDeepValue(setContent, [parentKey, key, 'min'], e.target.value)
                                )}
                                {defaultInput(                                    
                                    "표준 최대", 
                                    target.max, 
                                    !validationCheck(target.max) && submitted, 
                                    (e) => updateDeepValue(setContent, [parentKey, key, 'max'], e.target.value)
                                )}
                            </React.Fragment>
                            : defaultInput(                                
                                "측정 값", 
                                target, 
                                !validationCheck(target) && submitted, 
                                (e) => updateDeepValue(setContent, [parentKey, key], e.target.value),
                                key
                            ) 
                            }
                        </Stack>
                    )
                })}
            </Stack>
        )
    }

    const formValidationCheck = useCallback(() => {
        return (
            validationCheck(content)
        )
    }, [content])

    useEffect(() => {
        if (setContent && !content) {
            setContent(initialInBodyContent)
        }
    }, [setContent, content])

    useEffect(() => {
        if (setContentValidation) setContentValidation(formValidationCheck())
    }, [content, setContentValidation, formValidationCheck])

    useEffect(() => {
        let data = ocrResults[0]['result']
        if (data && Object.keys(data).length !== 0) {
            if (parseStringToData(data[0]['intracellularWater']) !== undefined) updateDeepValue(setContent, ['body_water_composition', 'intracellular'], parseStringToData(data[0]['intracellularWater']))
            if (parseStringToData(data[0]['extracellularWater']) !== undefined) updateDeepValue(setContent, ['body_water_composition', 'extracellular'], parseStringToData(data[0]['extracellularWater']))
            if (parseStringToData(data[0]['ecwRatio']) !== undefined) updateDeepValue(setContent, ['body_water_composition', 'extracellular_hydration_percentage'], parseStringToData(data[0]['ecwRatio']))

            if (parseStringToData(data[0]['rightArmSBA']) !== undefined) updateDeepValue(setContent, ['segmental_body_water_analysis', 'right_arm'], parseStringToData(data[0]['rightArmSBA']))
            if (parseStringToData(data[0]['leftArmSBA']) !== undefined) updateDeepValue(setContent, ['segmental_body_water_analysis', 'left_arm'], parseStringToData(data[0]['leftArmSBA']))
            if (parseStringToData(data[0]['trunkSBA']) !== undefined) updateDeepValue(setContent, ['segmental_body_water_analysis', 'body'], parseStringToData(data[0]['trunkSBA']))
            if (parseStringToData(data[0]['rightLegSBA']) !== undefined) updateDeepValue(setContent, ['segmental_body_water_analysis', 'right_leg'], parseStringToData(data[0]['rightLegSBA']))
            if (parseStringToData(data[0]['leftLegSBA']) !== undefined) updateDeepValue(setContent, ['segmental_body_water_analysis', 'left_leg'], parseStringToData(data[0]['leftLegSBA']))

            if (parseStringToData(data[0]['rightArmSLA']) !== undefined) updateDeepValue(setContent, ['segmental_lean_analysis', 'right_arm'], parseStringToData(data[0]['rightArmSLA']))
            if (parseStringToData(data[0]['leftArmSLA']) !== undefined) updateDeepValue(setContent, ['segmental_lean_analysis', 'left_arm'], parseStringToData(data[0]['leftArmSLA']))
            if (parseStringToData(data[0]['trunkSLA']) !== undefined) updateDeepValue(setContent, ['segmental_lean_analysis', 'body'], parseStringToData(data[0]['trunkSLA']))
            if (parseStringToData(data[0]['rightLegSLA']) !== undefined) updateDeepValue(setContent, ['segmental_lean_analysis', 'right_leg'], parseStringToData(data[0]['rightLegSLA']))
            if (parseStringToData(data[0]['leftLegSLA']) !== undefined) updateDeepValue(setContent, ['segmental_lean_analysis', 'left_leg'], parseStringToData(data[0]['leftLegSLA']))

            if (parseStringToData(data[0]['osseousMineral']) !== undefined) updateDeepValue(setContent, ['body_composition_analysis', 'osseous_mineral'], parseStringToData(data[0]['osseousMineral']))

            if (parseStringToData(data[0]['basalMetabolicRate']) !== undefined) updateDeepValue(setContent, ['research_parameter', 'basal_metabolic_rate'], parseStringToData(data[0]['basalMetabolicRate']))
            if (parseStringToData(data[0]['visceralFatArea']) !== undefined) updateDeepValue(setContent, ['research_parameter', 'visceral_fat_area'], parseStringToData(data[0]['visceralFatArea']))
            if (parseStringToData(data[0]['waistHipRatio']) !== undefined) updateDeepValue(setContent, ['research_parameter', 'waist_hip_ratio'], parseStringToData(data[0]['waistHipRatio']))
            if (parseStringToData(data[0]['bodyCellMass']) !== undefined) updateDeepValue(setContent, ['research_parameter', 'body_cell_mass'], parseStringToData(data[0]['bodyCellMass']))
            if (parseStringToData(data[0]['upperArmCircumference']) !== undefined) updateDeepValue(setContent, ['research_parameter', 'upper_arm_circumference'], parseStringToData(data[0]['upperArmCircumference']))
            if (parseStringToData(data[0]['tbwFfm']) !== undefined) updateDeepValue(setContent, ['research_parameter', 'tbw_ffm'], parseStringToData(data[0]['tbwFfm']))
            if (parseStringToData(data[0]['smi']) !== undefined) updateDeepValue(setContent, ['research_parameter', 'smi'], parseStringToData(data[0]['smi']))            
        }

        data = ocrResults[1]['result']
        if (data && Object.keys(data).length !== 0) {
            if (parseStringToData(data[0]['bodyWater']) !== undefined) updateDeepValue(setContent, ['body_water_composition', 'body_water'], parseStringToData(data[0]['bodyWater']))

            if (parseStringToData(data[0]['protein']) !== undefined) updateDeepValue(setContent, ['body_composition_analysis', 'protein'], parseStringToData(data[0]['protein']))
            if (parseStringToData(data[0]['minerals']) !== undefined) updateDeepValue(setContent, ['body_composition_analysis', 'minerals'], parseStringToData(data[0]['minerals']))
            if (parseStringToData(data[0]['bodyFatMass']) !== undefined) updateDeepValue(setContent, ['body_composition_analysis', 'body_fat_mass'], parseStringToData(data[0]['bodyFatMass']))
            if (parseStringToData(data[0]['leanBodyMass']) !== undefined) updateDeepValue(setContent, ['body_composition_analysis', 'lean_body_mass'], parseStringToData(data[0]['leanBodyMass']))

            if (parseStringToData(data[0]['weight']) !== undefined) updateDeepValue(setContent, ['muscle_fat_analysis', 'weight'], parseStringToData(data[0]['weight']))
            if (parseStringToData(data[0]['skeletalMuscleMass']) !== undefined) updateDeepValue(setContent, ['muscle_fat_analysis', 'skeletal_muscles_mass'], parseStringToData(data[0]['skeletalMuscleMass']))
            if (parseStringToData(data[0]['muscleMass']) !== undefined) updateDeepValue(setContent, ['muscle_fat_analysis', 'muscle_mass'], parseStringToData(data[0]['muscleMass']))
            if (parseStringToData(data[0]['bodyFatMass']) !== undefined) updateDeepValue(setContent, ['muscle_fat_analysis', 'body_fat_mass'], parseStringToData(data[0]['bodyFatMass']))

            if (parseStringToData(data[0]['bmi']) !== undefined) updateDeepValue(setContent, ['obesity_detail', 'BMI'], parseStringToData(data[0]['bmi']))
            if (parseStringToData(data[0]['percentBodyFat']) !== undefined) updateDeepValue(setContent, ['obesity_detail', 'fat_percentage'], parseStringToData(data[0]['percentBodyFat']))

            if (parseStringToData(data[0]['upperArmMuscleCircumference']) !== undefined) updateDeepValue(setContent, ['research_parameter', 'upper_arm_muscle_circumference'], parseStringToData(data[0]['upperArmMuscleCircumference']))
        }

    }, [ocrResults, setContent, setExDate])

    return (
        content ?
        <React.Fragment>
            <FormAccordion defaultExpanded>
                <FormAccordionSummary>
                    <FormAccordionHeader>체수분 구성</FormAccordionHeader>
                </FormAccordionSummary>
                <FormAccordionDetails>
                    {GroupInput(content.body_water_composition)}
                </FormAccordionDetails>
            </FormAccordion>
            <FormAccordion defaultExpanded>
                <FormAccordionSummary>
                    <FormAccordionHeader>부위 별 체수분 분석</FormAccordionHeader>
                </FormAccordionSummary>
                <FormAccordionDetails>
                    {GroupInput(content.segmental_body_water_analysis)}
                </FormAccordionDetails>
            </FormAccordion>
            <FormAccordion defaultExpanded>
                <FormAccordionSummary>
                    <FormAccordionHeader>부위 별 근육 분석</FormAccordionHeader>
                </FormAccordionSummary>
                <FormAccordionDetails>
                    {GroupInput(content.segmental_lean_analysis)}
                </FormAccordionDetails>
            </FormAccordion>
            <FormAccordion defaultExpanded>
                <FormAccordionSummary>
                    <FormAccordionHeader>체성분 분석</FormAccordionHeader>
                </FormAccordionSummary>
                <FormAccordionDetails>
                    {GroupInput(content.body_composition_analysis)}
                </FormAccordionDetails>
            </FormAccordion>            
            <FormAccordion defaultExpanded>
                <FormAccordionSummary>
                    <FormAccordionHeader>골격근/지방 분석</FormAccordionHeader>
                </FormAccordionSummary>
                <FormAccordionDetails>
                    {GroupInput(content.muscle_fat_analysis)}
                </FormAccordionDetails>
            </FormAccordion>
            <FormAccordion defaultExpanded>
                <FormAccordionSummary>
                    <FormAccordionHeader>비만 분석</FormAccordionHeader>
                </FormAccordionSummary>
                <FormAccordionDetails>
                    {GroupInput(content.obesity_detail)}
                </FormAccordionDetails>
            </FormAccordion>
            <FormAccordion defaultExpanded>
                <FormAccordionSummary>
                    <FormAccordionHeader>연구항목</FormAccordionHeader>
                </FormAccordionSummary>
                <FormAccordionDetails>
                    {GroupInput(content.research_parameter)}
                </FormAccordionDetails>
            </FormAccordion>
        </React.Fragment>
        : null
    )
}

export default InBodyContentForm
