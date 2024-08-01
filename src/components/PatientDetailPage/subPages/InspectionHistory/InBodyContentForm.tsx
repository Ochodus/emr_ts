import React, { useCallback, useEffect } from 'react'
import { InBodyContent, numberInput, rangeInput } from 'interfaces/inspectionType.interface'
import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import utc from "dayjs/plugin/utc"
import 'dayjs/locale/ko'
import { FormControl, FormHelperText, FormLabel, Input, Stack } from '@mui/joy'
import { FormAccordion, FormAccordionDetails, FormAccordionHeader, FormAccordionSummary } from './CustomTheme';
import { InfoOutlined } from '@mui/icons-material'
import { updateDeepValue, validationCheck } from 'api/commons/utils'

dayjs.extend(isLeapYear)
dayjs.extend(utc)
dayjs.locale('ko')

interface InBodyContentFormProps {
    content?: InBodyContent, 
    ocrResults?: {[index: string]: string}[],
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
            {!label && error &&
                <FormHelperText>
                    <InfoOutlined />
                    필수 입력란입니다.
                </FormHelperText>
            }
            <Input
                type="number"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                sx={{
                    backgroundColor: '#ffffff'
                }}
            />
            {label && error && 
                <FormHelperText>
                    <InfoOutlined />
                    필수 입력란입니다.
                </FormHelperText>                  
            }                           
        </FormControl>
    )
}

const InBodyContentForm = ({content, ocrResults=[{}], submitted, setContent, setContentValidation, setExDate}: InBodyContentFormProps) => {
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
        if (Object.keys(ocrResults[0]).length !== 0) {
            console.log(ocrResults[0])
            updateDeepValue(setContent, ['body_water_composition', 'intracellular'], parseStringToData(ocrResults[0]['intracellularWater']))
            updateDeepValue(setContent, ['body_water_composition', 'extracellular'], parseStringToData(ocrResults[0]['extracellularWater']))
            updateDeepValue(setContent, ['body_water_composition', 'extracellular_hydration_percentage'], parseStringToData(ocrResults[0]['ecwRatio']))

            updateDeepValue(setContent, ['segmental_body_water_analysis', 'right_arm'], parseStringToData(ocrResults[0]['rightArmSBA']))
            updateDeepValue(setContent, ['segmental_body_water_analysis', 'left_arm'], parseStringToData(ocrResults[0]['leftArmSBA']))
            updateDeepValue(setContent, ['segmental_body_water_analysis', 'body'], parseStringToData(ocrResults[0]['trunkSBA']))
            updateDeepValue(setContent, ['segmental_body_water_analysis', 'right_leg'], parseStringToData(ocrResults[0]['rightLegSBA']))
            updateDeepValue(setContent, ['segmental_body_water_analysis', 'left_leg'], parseStringToData(ocrResults[0]['leftLegSBA']))

            updateDeepValue(setContent, ['segmental_lean_analysis', 'right_arm'], parseStringToData(ocrResults[0]['rightArmSLA']))
            updateDeepValue(setContent, ['segmental_lean_analysis', 'left_arm'], parseStringToData(ocrResults[0]['leftArmSLA']))
            updateDeepValue(setContent, ['segmental_lean_analysis', 'body'], parseStringToData(ocrResults[0]['trunkSLA']))
            updateDeepValue(setContent, ['segmental_lean_analysis', 'right_leg'], parseStringToData(ocrResults[0]['rightLegSLA']))
            updateDeepValue(setContent, ['segmental_lean_analysis', 'left_leg'], parseStringToData(ocrResults[0]['leftLegSLA']))

            updateDeepValue(setContent, ['body_composition_analysis', 'osseous_mineral'], parseStringToData(ocrResults[0]['osseousMineral']))

            updateDeepValue(setContent, ['research_parameter', 'basal_metabolic_rate'], parseStringToData(ocrResults[0]['basalMetabolicRate']))
            updateDeepValue(setContent, ['research_parameter', 'visceral_fat_area'], parseStringToData(ocrResults[0]['visceralFatArea']))
            updateDeepValue(setContent, ['research_parameter', 'waist_hip_ratio'], parseStringToData(ocrResults[0]['waistHipRatio']))
            updateDeepValue(setContent, ['research_parameter', 'body_cell_mass'], parseStringToData(ocrResults[0]['bodyCellMass']))
            updateDeepValue(setContent, ['research_parameter', 'upper_arm_circumference'], parseStringToData(ocrResults[0]['upperArmCircumference']))
            updateDeepValue(setContent, ['research_parameter', 'tbw_ffm'], parseStringToData(ocrResults[0]['tbwFfm']))
            updateDeepValue(setContent, ['research_parameter', 'smi'], parseStringToData(ocrResults[0]['smi']))            
        }
        if (Object.keys(ocrResults[1]).length !== 0) {
            console.log(ocrResults[1])
            updateDeepValue(setContent, ['body_water_composition', 'body_water'], parseStringToData(ocrResults[1]['bodyWater']))

            updateDeepValue(setContent, ['body_composition_analysis', 'protein'], parseStringToData(ocrResults[1]['protein']))
            updateDeepValue(setContent, ['body_composition_analysis', 'minerals'], parseStringToData(ocrResults[1]['minerals']))
            updateDeepValue(setContent, ['body_composition_analysis', 'body_fat_mass'], parseStringToData(ocrResults[1]['bodyFatMass']))
            updateDeepValue(setContent, ['body_composition_analysis', 'lean_body_mass'], parseStringToData(ocrResults[1]['leanBodyMass']))

            updateDeepValue(setContent, ['muscle_fat_analysis', 'weight'], parseStringToData(ocrResults[1]['weight']))
            updateDeepValue(setContent, ['muscle_fat_analysis', 'skeletal_muscles_mass'], parseStringToData(ocrResults[1]['skeletalMuscleMass']))
            updateDeepValue(setContent, ['muscle_fat_analysis', 'muscle_mass'], parseStringToData(ocrResults[1]['muscleMass']))
            updateDeepValue(setContent, ['muscle_fat_analysis', 'body_fat_mass'], parseStringToData(ocrResults[1]['bodyFatMass']))

            updateDeepValue(setContent, ['obesity_detail', 'BMI'], parseStringToData(ocrResults[1]['bmi']))
            updateDeepValue(setContent, ['obesity_detail', 'fat_percentage'], parseStringToData(ocrResults[1]['percentBodyFat']))

            updateDeepValue(setContent, ['research_parameter', 'upper_arm_muscle_circumference'], parseStringToData(ocrResults[1]['upperArmMuscleCircumference']))
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
