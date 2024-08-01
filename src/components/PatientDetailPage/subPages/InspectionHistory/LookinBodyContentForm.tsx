import React, { useCallback, useEffect, useState } from 'react'
import { LookinBodyContent, LookinInspection } from '../../../../interfaces/inspectionType.interface'
import { updateDeepValue, validationCheck } from 'api/commons/utils'
import dayjs from 'dayjs'
import { FormAccordion, FormAccordionDetails, FormAccordionHeader, FormAccordionSummary } from './CustomTheme'
import { Box, Chip, FormControl, FormLabel, IconButton, Select, Option, Input, Typography, Stack, Divider, FormHelperText } from '@mui/joy'
import { Add, Delete, InfoOutlined } from '@mui/icons-material'

interface LookinBodyContentFormProps {
    content?: LookinBodyContent, 
    ocrResults?: {[index: string]: string}[],
    submitted?: boolean,
    setContent?: React.Dispatch<React.SetStateAction<LookinBodyContent>>,
    setContentValidation?: React.Dispatch<React.SetStateAction<boolean>>,
    setExDate?: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>
}

const targetAbilities = ['근력', '유연성', '민첩성', '심폐지구력', '순발력', '근지구력', '평형성']
const targetExercises = ['전신반응 (초)', '제자리 높이뛰기 (cm)', '눈감고 외발서기 (초)']

const initialInspection: LookinInspection = {
    type: "",
    value: "",
    min_value: "",
    max_value: ""
}

const initialLookinBodyContent: LookinBodyContent = targetExercises.reduce((acc, key) => {
    acc[key] = null;
    return acc;
}, {} as LookinBodyContent)

const exerciseCompareFunction = (a: string, b: string) => {
    if (a.includes("initial") === b.includes("initial")) return 0
    else {
        if (a.includes("initial")) return 1
        else return -1 
    }
}

const LookinBodyContentForm = ({content, ocrResults=[{}], submitted, setContent, setContentValidation, setExDate}: LookinBodyContentFormProps) => {
    const [selectedExercise, setSelectedExercise] = useState<string[]>([])

    const formValidationCheck = useCallback(() => {
        return (
            validationCheck(content)
        )
    }, [content])
    
    useEffect(() => {
        if (setContent && !content) {
            setContent(initialLookinBodyContent)
        }
    }, [setContent, content])

    useEffect(() => {
        if (setContentValidation) setContentValidation(formValidationCheck())
    }, [content, setContentValidation, formValidationCheck])

    useEffect(() => {
        if (Object.keys(ocrResults[0]).length === 0) return
        
        const parsedData = {
            exerciseNames: ocrResults[0].exerciseNames.split(/\n/),
            fields: ocrResults[0].fields.split(/\n/),
            values: ocrResults[0].values.split(/\n/),
            ranges: ocrResults[0].ranges.split(/\n/),
            note: ocrResults[0].note,
            recommendation: ocrResults[0].recommendation
        }

        let inspectionLength = Math.max(+(parsedData.fields.length ?? 0), +(parsedData.exerciseNames.length ?? 0), +(parsedData.values.length ?? 0), +(parsedData.ranges.length ?? 0))
        
        for (let i = 0; i < inspectionLength; i++) {
            let newLookinInspections: LookinInspection = {
                type: `${parsedData.fields[i]}`,
                value: +parsedData.values[i] ?? "",
                min_value: +`${parsedData.ranges[i]}`.split('~')[0],
                max_value: +`${parsedData.ranges[i]}`.split('~')[1]
            }

            updateDeepValue(setContent, [parsedData.exerciseNames[i]], newLookinInspections)
        }

        setSelectedExercise([...selectedExercise, ...parsedData.exerciseNames])

        if (setExDate) setExDate(dayjs(ocrResults[0]['exDate']))
    }, [ocrResults, selectedExercise, setContent, setExDate])

    return (
        <FormAccordion defaultExpanded>
            <FormAccordionSummary>
                <FormAccordionHeader>운동 목록</FormAccordionHeader>
            </FormAccordionSummary>
            <FormAccordionDetails sx={{ p: 0 }}>
                {content && Object.keys(content).sort(exerciseCompareFunction).map((key, index) => {
                    let value = content[key]
                    return (
                        value &&
                        <React.Fragment key={index}>
                            <Stack 
                                direction='row'
                                gap={2}
                                className="scrollable horizontal"
                                sx={{ 
                                    pt: 3,
                                    px: 3,
                                    pb: 2,
                                    justifyContent: 'space-between', 
                                    margin: '0 10px'
                                }}>
                                <Stack direction='row' gap={3}>
                                    <FormControl size="md" error={!key && submitted}>
                                        <FormLabel>운동 종류</FormLabel>
                                        <Select
                                            size="md"
                                            placeholder="종류 선택"
                                            value={key}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', gap: '0.25rem' }}>
                                                    <Chip variant="soft" color="primary">
                                                        {selected ? selected.label : null}
                                                    </Chip>
                                                </Box>
                                            )}
                                            slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                                            onChange={(_, value) => {
                                                if (value && setContent) {
                                                    let newContent = {...content}
                                                    delete newContent[key]
                                                    setContent(newContent)
                                                    updateDeepValue(setContent, [value], initialInspection)
                                                    setSelectedExercise([...selectedExercise, value].filter((exercise) => exercise !== key))
                                                }
                                            }}
                                            sx={{
                                                backgroundColor: '#ffffff'
                                            }}
                                        >
                                            {targetExercises.map((exercise, index) => {
                                                return (
                                                    exercise === key || !(selectedExercise.includes(exercise)) ? <Option key={index} value={exercise}>{`${exercise}`}</Option> : null
                                                )
                                            })} 
                                        </Select>
                                        {!key && submitted && 
                                            <FormHelperText>
                                                <InfoOutlined />
                                                필수 선택란입니다.
                                            </FormHelperText>                            
                                        } 
                                    </FormControl>
                                    <FormControl size="md" error={!validationCheck(value.type) && submitted}>
                                        <FormLabel>측정 능력</FormLabel>
                                        <Select
                                            size="md"
                                            placeholder="능력 선택"
                                            value={value.type}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', gap: '0.25rem' }}>
                                                    <Chip variant="soft" color="primary">
                                                        {selected ? selected.label : null}
                                                    </Chip>
                                                </Box>
                                            )}
                                            slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                                            onChange={(_, value) => {console.log(value); updateDeepValue(setContent, [key, 'type'], value)}}
                                            sx={{
                                                backgroundColor: '#ffffff'
                                            }}
                                            disabled={key.includes('initial')}
                                        >
                                            {targetAbilities.map((ability, index) => {
                                                return (
                                                    <Option key={index} value={ability}>{`${ability}`}</Option>
                                                )
                                            })}
                                        </Select>
                                        {!validationCheck(value.type) && submitted && 
                                            <FormHelperText>
                                                <InfoOutlined />
                                                필수 선택란입니다.
                                            </FormHelperText>                            
                                        } 
                                    </FormControl>
                                    <FormControl size="md" error={!validationCheck(value.value) && submitted}>
                                        <FormLabel>측정 값</FormLabel>
                                        <Input
                                            type="number"
                                            placeholder=""
                                            value={value.value}
                                            onChange={(e) => updateDeepValue(setContent, [key, 'value'], e.target.value)}
                                            sx={{
                                                backgroundColor: '#ffffff'
                                            }}
                                        />
                                        {!validationCheck(value.value) && submitted && 
                                            <FormHelperText>
                                                <InfoOutlined />
                                                필수 입력란입니다.
                                            </FormHelperText>                            
                                        } 
                                    </FormControl>
                                </Stack>
                                <Stack direction='row' gap={2}>
                                    <FormControl size="md" error={!validationCheck(value.min_value) && submitted}>
                                        <FormLabel>평균 범위</FormLabel>
                                        <Input
                                            type="number"
                                            placeholder=""
                                            value={value.min_value}
                                            onChange={(e) => updateDeepValue(setContent, [key, 'min_value'], e.target.value)}
                                            sx={{
                                                backgroundColor: '#ffffff'
                                            }}
                                        />
                                        {!validationCheck(value.min_value) && submitted && 
                                            <FormHelperText>
                                                <InfoOutlined />
                                                필수 입력란입니다.
                                            </FormHelperText>                            
                                        }
                                    </FormControl>
                                    <Typography sx={{ my: 'auto' }}>~</Typography>
                                    <FormControl size="md" sx={{ flexDirection: 'column-reverse' }} error={!validationCheck(value.max_value) && submitted}>
                                        {!validationCheck(value.max_value) && submitted && 
                                            <FormHelperText>
                                                <InfoOutlined />
                                                필수 입력란입니다.
                                            </FormHelperText>                            
                                        }
                                        <Input
                                            type="number"
                                            placeholder=""
                                            value={value.max_value}
                                            onChange={(e) => updateDeepValue(setContent, [key, 'max_value'], e.target.value)}
                                            sx={{
                                                backgroundColor: '#ffffff'
                                            }}
                                        />
                                    </FormControl>
                                </Stack>
                                <Divider orientation='vertical' />
                                <IconButton onClick={() => {
                                    if (setContent) {
                                        let newContent = {...content}
                                        delete newContent[key]
                                        setContent(newContent)
                                        setSelectedExercise(selectedExercise.filter((exercise) => exercise !== key))
                                    }
                                }}>
                                    <Delete/>
                                </IconButton>
                            </Stack>
                            <Divider/>
                        </React.Fragment>
                    )
                })}
                <IconButton onClick={() => { updateDeepValue(setContent, [`initial-${Object.keys(content ?? {}).length}`], initialInspection) }}> 
                    <Add></Add>
                </IconButton>
            </FormAccordionDetails>
        </FormAccordion>
    )
}

export default LookinBodyContentForm
