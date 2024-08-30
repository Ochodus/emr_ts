import React, { useCallback, useEffect } from 'react'
import { ImooveContent } from 'interfaces/inspectionType.interface'
import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import utc from "dayjs/plugin/utc"
import 'dayjs/locale/ko'
import { Divider, FormControl, FormLabel, IconButton, Input, Radio, RadioGroup, Stack, Typography } from '@mui/joy'
import { FormAccordion, FormAccordionDetails, FormAccordionHeader, FormAccordionSummary } from './CustomTheme';
import { Add, Delete } from '@mui/icons-material'
import { updateDeepValue, validationCheck } from 'api/commons/utils'

dayjs.extend(isLeapYear)
dayjs.extend(utc)
dayjs.locale('ko')

interface ImooveContentFormProps {
    content?: ImooveContent[], 
    ocrResults?: {parseType: number, result: {[index: string]: any}[]}[],
    submitted?: boolean,
    setContent?: React.Dispatch<React.SetStateAction<ImooveContent[]>>,
    setContentValidation?: React.Dispatch<React.SetStateAction<boolean>>,
    setExDate?: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>
}

const initialImooveContent: ImooveContent = {
    type: "",
    strength: "",
    code: "",
    time: "",
    sensitivity: "",
    supports: {
        stability: "",
        distribution: {
            denominator: "",
            numerator: "",
            points: ""
        }
    },
    trunk: {
        stability: "",
        distribution: {
            denominator: "",
            numerator: "",
            points: ""
        }
    },
    postural_coordination: {
        value: "",
        point: ""
    },
    postural_strategy: ""
}

const ImooveContentForm = ({content: contents, ocrResults=[{parseType: 0, result: []}], submitted, setContent, setContentValidation, setExDate}: ImooveContentFormProps) => {
    const formValidationCheck = useCallback(() => {
        return (
            validationCheck(contents)
        )
    }, [contents])

    useEffect(() => {
        if (setContent && !contents) {
            setContent([initialImooveContent])
        }
    }, [setContent, contents])

    useEffect(() => {
        if (setContentValidation) setContentValidation(formValidationCheck())
    }, [contents, setContentValidation, formValidationCheck])

    useEffect(() => {
        let data = ocrResults[0]['result']
        if (!data || Object.keys(ocrResults[0]).length === 0) return
        if (setContent) setContent(data.map(() => { return initialImooveContent }))

        data.forEach((datum: any, index: number) => {
            if (!datum) return
            updateDeepValue(setContent, [index, 'strength'], datum['strength'])
            updateDeepValue(setContent, [index, 'code'], datum['code'])
            updateDeepValue(setContent, [index, 'time'], datum['duration'])
            updateDeepValue(setContent, [index, 'sensitivity'], datum['sensitivity'])
            
            updateDeepValue(setContent, [index, 'supports', 'stability'], datum['supportStability'].replace(/[^0-9]/g, ""))
            updateDeepValue(setContent, [index, 'supports', 'distribution', 'numerator'], datum['supportDistribution'].split('/')[0].replace(/[^0-9]/g, ""))
            updateDeepValue(setContent, [index, 'supports', 'distribution', 'denominator'], datum['supportDistribution'].split('/')[1].replace(/[^0-9]/g, ""))
            updateDeepValue(setContent, [index, 'supports', 'distribution', 'points'], datum['supportPoints'].replace(/[^0-9]/g, ""))
    
            updateDeepValue(setContent, [index, 'trunk', 'stability'], datum['trunkStability'].replace(/[^0-9]/g, ""))
            updateDeepValue(setContent, [index, 'trunk', 'distribution', 'numerator'], datum['trunkDistribution'].split('/')[0].replace(/[^0-9]/g, ""))
            updateDeepValue(setContent, [index, 'trunk', 'distribution', 'denominator'], datum['trunkDistribution'].split('/')[1].replace(/[^0-9]/g, ""))
            updateDeepValue(setContent, [index, 'trunk', 'distribution', 'points'], datum['trunkPoints'].replace(/[^0-9]/g, ""))
    
            updateDeepValue(setContent, [index, 'postural_coordination', 'value'], datum['posturalCoordination'].replace(/[^0-9]/g, ""))
            updateDeepValue(setContent, [index, 'postural_coordination', 'point'], datum['posturalPoints'].replace(/[^0-9]/g, ""))
            updateDeepValue(setContent, [index, 'postural_strategy'], `${+datum['posturalPoints'].replace(/[^0-9]/g, "")/10}`)
        })       

        if (setExDate && data[0]) setExDate(dayjs(data[0]['exDate']))

    }, [ocrResults, setContent, setExDate])

    return (
        contents ?
        <React.Fragment>
            <FormAccordion defaultExpanded>
                <FormAccordionSummary>
                    <FormAccordionHeader>기본 정보</FormAccordionHeader>
                </FormAccordionSummary>
                <FormAccordionDetails>
                    <Stack gap={2}>
                        {contents.map((content, index) => {
                            return (  
                                <React.Fragment key={index}>                        
                                    <Stack direction='row'>
                                        <Typography level='title-lg' sx={{ m: 'auto' }}> {`${index+1}차`} </Typography>
                                        <Stack gap={1} sx={{ flex: '1 1 auto' }}>
                                            <Stack direction='row' gap={2} sx={{ p: 1, justifyContent: 'space-around' }}>
                                                <FormControl size="md" error={!validationCheck(content?.type) && submitted}>
                                                    <FormLabel>검사 유형</FormLabel>
                                                    <RadioGroup
                                                        name="radio-buttons-group" 
                                                        value={content?.type}
                                                        onChange={(e) => updateDeepValue(setContent, [index, 'type'], e.target.value)}
                                                        orientation='horizontal'
                                                        
                                                    >
                                                        <Radio value="S" label="S" variant="outlined" color={!validationCheck(content?.type) && submitted ? 'danger' : 'neutral'}/>
                                                        <Radio value="L" label="L" variant="outlined" color={!validationCheck(content?.type) && submitted ? 'danger' : 'neutral'}/>
                                                        <Radio value="R" label="R" variant="outlined" color={!validationCheck(content?.type) && submitted ? 'danger' : 'neutral'}/>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormControl size="md" error={!validationCheck(content?.strength) && submitted}>
                                                    <FormLabel>검사 강도</FormLabel>
                                                    <Input
                                                        type="number"
                                                        placeholder="검사 강도"
                                                        value={content?.strength}
                                                        onChange={(e) => updateDeepValue(setContent, [index, 'strength'], e.target.value)}
                                                        sx={{
                                                            backgroundColor: '#ffffff'
                                                        }}
                                                    />                         
                                                </FormControl>
                                            </Stack>
                                            <Stack direction='row' gap={2}  sx={{ p: 1, justifyContent: 'space-around'  }}>
                                                <FormControl size="md" error={!validationCheck(content?.code) && submitted}>
                                                    <FormLabel>검사 코드</FormLabel>
                                                    <Input
                                                        type="string"
                                                        placeholder="검사 코드"
                                                        value={content?.code}
                                                        onChange={(e) => updateDeepValue(setContent, [index, 'code'], e.target.value)}
                                                        sx={{
                                                            backgroundColor: '#ffffff'
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormControl size="md" error={!validationCheck(content?.time) && submitted}>
                                                    <FormLabel>소요 시간</FormLabel>
                                                    <Input
                                                        type="number"
                                                        placeholder="소요 시간"
                                                        value={content?.time}
                                                        onChange={(e) => updateDeepValue(setContent, [index, 'time'], e.target.value)}
                                                        sx={{
                                                            backgroundColor: '#ffffff'
                                                        }}
                                                    />  
                                                </FormControl>
                                                <FormControl size="md" error={!validationCheck(content?.sensitivity) && submitted}>
                                                    <FormLabel>민감도</FormLabel>
                                                    <Input
                                                        type="number"
                                                        placeholder="민감도"
                                                        value={content?.sensitivity}
                                                        onChange={(e) => updateDeepValue(setContent, [index, 'sensitivity'], e.target.value)}
                                                        sx={{
                                                            backgroundColor: '#ffffff'
                                                        }}
                                                    /> 
                                                </FormControl>
                                            </Stack>  
                                        </Stack>          
                                        <IconButton onClick={() => {if (setContent) setContent([...contents.slice(0, index), ...contents.slice(index+1)])}}>
                                            <Delete/>
                                        </IconButton>                   
                                    </Stack>
                                    <Divider orientation='horizontal'></Divider>
                                </React.Fragment>
                            )
                        })}                 
                        <IconButton onClick={() => {if (setContent) setContent([...contents, initialImooveContent])}}>
                            <Add/>
                        </IconButton>   
                    </Stack>
                </FormAccordionDetails>
            </FormAccordion>
            <FormAccordion defaultExpanded>
                <FormAccordionSummary>
                    <FormAccordionHeader>검사 결과</FormAccordionHeader>
                </FormAccordionSummary>
                <FormAccordionDetails>
                    <Stack gap={2}>
                        {contents.map((content, index) => {
                            return (
                                <React.Fragment key={index}>
                                    <Stack direction='row'>
                                        <Typography level='title-lg' sx={{ m: 'auto' }}> {`${index+1}차`} </Typography>
                                        <Stack direction='column' gap={2} sx={{ flex: '1 1 auto' }}>
                                            <Stack direction='row' sx={{ alignItems: 'center'}}>
                                                <Typography sx={{ fontSize: '24px', fontWeight: 600, ml: 5, width: '20%' }}>SUPPORTS: </Typography>
                                                <Stack direction='column' gap={2}>
                                                    <FormControl size="md" error={!validationCheck(content?.supports.stability) && submitted}>
                                                        <FormLabel>Stability Result</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder="안정성"
                                                            value={content?.supports.stability}
                                                            onChange={(e) => updateDeepValue(setContent, [index, 'supports', 'stability'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff'
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <Stack direction='row' gap={2}>
                                                        <Stack direction='row'>
                                                            <FormControl size="md" error={!validationCheck(content?.supports.distribution.numerator) && submitted}>
                                                                <FormLabel>Distribution</FormLabel>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="분포"
                                                                    value={content?.supports.distribution.numerator}
                                                                    onChange={(e) => updateDeepValue(setContent, [index, 'supports', 'distribution', 'numerator'], e.target.value)}
                                                                    sx={{
                                                                        backgroundColor: '#ffffff'
                                                                    }}
                                                                />  
                                                            </FormControl>
                                                            <FormControl size="md" error={!validationCheck(content?.supports.distribution.denominator) && submitted}>
                                                                <FormLabel>/</FormLabel>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="분포"
                                                                    value={content?.supports.distribution.denominator}
                                                                    onChange={(e) => updateDeepValue(setContent, [index, 'supports', 'distribution', 'denominator'], e.target.value)}
                                                                    sx={{
                                                                        backgroundColor: '#ffffff'
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        </Stack>
                                                        <FormControl size="md" error={!validationCheck(content?.supports.distribution.points) && submitted}>
                                                            <FormLabel>Distribution Points</FormLabel>
                                                            <Input
                                                                type="number"
                                                                placeholder="점수"
                                                                value={content?.supports.distribution.points}
                                                                onChange={(e) => updateDeepValue(setContent, [index, 'supports', 'distribution', 'points'], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff'
                                                                }}
                                                            />
                                                        </FormControl>
                                                    </Stack>
                                                </Stack>
                                            </Stack>
                                            <Divider></Divider>
                                            <Stack direction='row' sx={{ alignItems: 'center'}}>
                                                <Typography sx={{ fontSize: '24px', fontWeight: 600, ml: 5, width: '20%' }}>TRUNK: </Typography>
                                                <Stack direction='column' gap={2}>
                                                    <FormControl size="md" error={!validationCheck(content?.trunk.stability) && submitted}>
                                                        <FormLabel>Stability Result</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder="안정성"
                                                            value={content?.trunk.stability}
                                                            onChange={(e) => updateDeepValue(setContent, [index, 'trunk', 'stability'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff'
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <Stack direction='row' gap={2}>
                                                        <Stack direction='row'>
                                                            <FormControl size="md" error={!validationCheck(content?.trunk.distribution.numerator) && submitted}>
                                                                <FormLabel>Distribution</FormLabel>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="분포"
                                                                    value={content?.trunk.distribution.numerator}
                                                                    onChange={(e) => updateDeepValue(setContent, [index, 'trunk', 'distribution', 'numerator'], e.target.value)}
                                                                    sx={{
                                                                        backgroundColor: '#ffffff'
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormControl error={!validationCheck(content?.trunk.distribution.denominator) && submitted}>
                                                                <FormLabel>/</FormLabel>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="분포"
                                                                    value={content?.trunk.distribution.denominator}
                                                                    onChange={(e) => updateDeepValue(setContent, [index, 'trunk', 'distribution', 'denominator'], e.target.value)}
                                                                    sx={{
                                                                        backgroundColor: '#ffffff'
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        </Stack>
                                                        <FormControl size="md" error={!validationCheck(content?.trunk.distribution.points) && submitted}>
                                                            <FormLabel>Distribution Points</FormLabel>
                                                            <Input
                                                                type="number"
                                                                placeholder="점수"
                                                                value={content?.trunk.distribution.points}
                                                                onChange={(e) => updateDeepValue(setContent, [index, 'trunk', 'distribution', 'points'], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff'
                                                                }}
                                                            />
                                                        </FormControl>
                                                    </Stack>
                                                </Stack>
                                            </Stack>
                                            <Divider></Divider>
                                            <Stack direction='row' gap={2} sx={{ justifyContent: 'space-around' }}>
                                                <FormControl size="md" error={!validationCheck(content?.postural_coordination.value) && submitted}>
                                                    <FormLabel>Postural coordination (s)</FormLabel>
                                                    <Input
                                                        type="number"
                                                        placeholder="시간"
                                                        value={content?.postural_coordination.value}
                                                        onChange={(e) => updateDeepValue(setContent, [index, 'postural_coordination', 'value'], e.target.value)}
                                                        sx={{
                                                            backgroundColor: '#ffffff'
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormControl size="md" error={!validationCheck(content?.postural_coordination.point) && submitted}>
                                                    <FormLabel>Postural Points</FormLabel>
                                                    <Input
                                                        type="number"
                                                        placeholder="점수"
                                                        value={content?.postural_coordination.point}
                                                        onChange={(e) => updateDeepValue(setContent, [index, 'postural_coordination', 'point'], e.target.value)}
                                                        sx={{
                                                            backgroundColor: '#ffffff'
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormControl size="md" error={!validationCheck(content?.postural_strategy) && submitted}>
                                                    <FormLabel>Postural Strategy</FormLabel>
                                                    <Input
                                                        type="number"
                                                        placeholder="점수"
                                                        value={content?.postural_strategy}
                                                        onChange={(e) => updateDeepValue(setContent, [index, 'postural_strategy'], e.target.value)}
                                                        sx={{
                                                            backgroundColor: '#ffffff'
                                                        }}
                                                    />
                                                </FormControl>
                                            </Stack>
                                        </Stack>
                                        <IconButton onClick={() => {if (setContent) setContent([...contents.slice(0, index), ...contents.slice(index+1)])}}>
                                            <Delete/>
                                        </IconButton>    
                                    </Stack>
                                    <Divider orientation='horizontal'/>
                                </React.Fragment>
                            )
                        })}      
                    </Stack>              
                    <IconButton onClick={() => {if (setContent) setContent([...contents, initialImooveContent])}}>
                        <Add/>
                    </IconButton>    
                </FormAccordionDetails>
            </FormAccordion>
        </React.Fragment>
        : null
    )
}

export default ImooveContentForm
