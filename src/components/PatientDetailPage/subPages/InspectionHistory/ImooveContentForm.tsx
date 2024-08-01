import React, { useCallback, useEffect } from 'react'
import { ImooveContent } from 'interfaces/inspectionType.interface'
import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import utc from "dayjs/plugin/utc"
import 'dayjs/locale/ko'
import { Divider, FormControl, FormHelperText, FormLabel, Input, Radio, RadioGroup, Stack, Typography } from '@mui/joy'
import { FormAccordion, FormAccordionDetails, FormAccordionHeader, FormAccordionSummary } from './CustomTheme';
import { InfoOutlined } from '@mui/icons-material'
import { updateDeepValue, validationCheck } from 'api/commons/utils'

dayjs.extend(isLeapYear)
dayjs.extend(utc)
dayjs.locale('ko')

interface ImooveContentFormProps {
    content?: ImooveContent, 
    ocrResults?: {[index: string]: string}[],
    submitted?: boolean,
    setContent?: React.Dispatch<React.SetStateAction<ImooveContent>>,
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

const ImooveContentForm = ({content, ocrResults=[{}], submitted, setContent, setContentValidation, setExDate}: ImooveContentFormProps) => {
    const formValidationCheck = useCallback(() => {
        return (
            validationCheck(content)
        )
    }, [content])

    useEffect(() => {
        if (setContent && !content) {
            setContent(initialImooveContent)
        }
    }, [setContent, content])

    useEffect(() => {
        if (setContentValidation) setContentValidation(formValidationCheck())
    }, [content, setContentValidation, formValidationCheck])

    useEffect(() => {
        if (Object.keys(ocrResults[0]).length === 0) return
        updateDeepValue(setContent, ['strength'], ocrResults[0]['strength'])
        updateDeepValue(setContent, ['code'], ocrResults[0]['code'])
        updateDeepValue(setContent, ['time'], ocrResults[0]['duration'])
        updateDeepValue(setContent, ['sensitivity'], ocrResults[0]['sensitivity'])
        
        updateDeepValue(setContent, ['supports', 'stability'], ocrResults[0]['supportStability'].replace(/[^0-9]/g, ""))
        updateDeepValue(setContent, ['supports', 'distribution', 'numerator'], ocrResults[0]['supportDistribution'].split('/')[0].replace(/[^0-9]/g, ""))
        updateDeepValue(setContent, ['supports', 'distribution', 'denominator'], ocrResults[0]['supportDistribution'].split('/')[1].replace(/[^0-9]/g, ""))
        updateDeepValue(setContent, ['supports', 'distribution', 'points'], ocrResults[0]['supportPoints'].replace(/[^0-9]/g, ""))

        updateDeepValue(setContent, ['trunk', 'stability'], ocrResults[0]['trunkStability'].replace(/[^0-9]/g, ""))
        updateDeepValue(setContent, ['trunk', 'distribution', 'numerator'], ocrResults[0]['trunkDistribution'].split('/')[0].replace(/[^0-9]/g, ""))
        updateDeepValue(setContent, ['trunk', 'distribution', 'denominator'], ocrResults[0]['trunkDistribution'].split('/')[1].replace(/[^0-9]/g, ""))
        updateDeepValue(setContent, ['trunk', 'distribution', 'points'], ocrResults[0]['trunkPoints'].replace(/[^0-9]/g, ""))

        updateDeepValue(setContent, ['postural_coordination', 'value'], ocrResults[0]['posturalCoordination'].replace(/[^0-9]/g, ""))
        updateDeepValue(setContent, ['postural_coordination', 'point'], ocrResults[0]['posturalPoints'].replace(/[^0-9]/g, ""))
        updateDeepValue(setContent, ['postural_strategy'], `${+ocrResults[0]['posturalPoints'].replace(/[^0-9]/g, "")/10}`)

        if (setExDate) setExDate(dayjs(ocrResults[0]['exDate']))

    }, [ocrResults, setContent, setExDate])

    return (
        content ?
        <React.Fragment>
            <FormAccordion defaultExpanded>
                <FormAccordionSummary>
                    <FormAccordionHeader>기본 정보</FormAccordionHeader>
                </FormAccordionSummary>
                <FormAccordionDetails>
                    <Stack direction='row' gap={2} sx={{ p: 1, justifyContent: 'space-around' }}>
                        <FormControl size="md">
                            <FormLabel>검사 유형</FormLabel>
                            <RadioGroup 
                                name="radio-buttons-group" 
                                value={content?.type}
                                onChange={(e) => updateDeepValue(setContent, ['type'], e.target.value)}
                                orientation='horizontal'
                            >
                                <Radio value="S" label="S" variant="outlined" />
                                <Radio value="L" label="L" variant="outlined" />
                                <Radio value="R" label="R" variant="outlined" />
                            </RadioGroup>
                        </FormControl>
                        <FormControl size="md" error={!validationCheck(content?.strength) && submitted}>
                            <FormLabel>검사 강도</FormLabel>
                            <Input
                                type="number"
                                placeholder="검사 강도"
                                value={content?.strength}
                                onChange={(e) => updateDeepValue(setContent, ['strength'], e.target.value)}
                                sx={{
                                    backgroundColor: '#ffffff'
                                }}
                            />
                            {!validationCheck(content?.strength) && submitted && 
                                <FormHelperText>
                                    <InfoOutlined />
                                    필수 입력란입니다.
                                </FormHelperText>                            
                            }                           
                        </FormControl>
                    </Stack>
                    <Stack direction='row' gap={2}  sx={{ p: 1, justifyContent: 'space-around'  }}>
                        <FormControl size="md" error={!validationCheck(content?.code) && submitted}>
                            <FormLabel>검사 코드</FormLabel>
                            <Input
                                type="string"
                                placeholder="검사 코드"
                                value={content?.code}
                                onChange={(e) => updateDeepValue(setContent, ['code'], e.target.value)}
                                sx={{
                                    backgroundColor: '#ffffff'
                                }}
                            />
                            {!validationCheck(content?.code) && submitted && 
                                <FormHelperText>
                                    <InfoOutlined />
                                    필수 입력란입니다.
                                </FormHelperText>                            
                            }
                        </FormControl>
                        <FormControl size="md" error={!validationCheck(content?.time) && submitted}>
                            <FormLabel>소요 시간</FormLabel>
                            <Input
                                type="number"
                                placeholder="소요 시간"
                                value={content?.time}
                                onChange={(e) => updateDeepValue(setContent, ['time'], e.target.value)}
                                sx={{
                                    backgroundColor: '#ffffff'
                                }}
                            />
                            {!validationCheck(content?.time) && submitted && 
                                <FormHelperText>
                                    <InfoOutlined />
                                    필수 입력란입니다.
                                </FormHelperText>                            
                            }   
                        </FormControl>
                        <FormControl size="md" error={!validationCheck(content?.sensitivity) && submitted}>
                            <FormLabel>민감도</FormLabel>
                            <Input
                                type="number"
                                placeholder="민감도"
                                value={content?.sensitivity}
                                onChange={(e) => updateDeepValue(setContent, ['sensitivity'], e.target.value)}
                                sx={{
                                    backgroundColor: '#ffffff'
                                }}
                            />
                            {!validationCheck(content?.sensitivity) && submitted && 
                                <FormHelperText>
                                    <InfoOutlined />
                                    필수 입력란입니다.
                                </FormHelperText>                            
                            }   
                        </FormControl>
                    </Stack>
                </FormAccordionDetails>
            </FormAccordion>
            <FormAccordion defaultExpanded>
                <FormAccordionSummary>
                    <FormAccordionHeader>검사 결과</FormAccordionHeader>
                </FormAccordionSummary>
                <FormAccordionDetails>
                    <Stack direction='column' gap={2}>
                        <Stack direction='row' sx={{ alignItems: 'center'}}>
                            <Typography sx={{ fontSize: '24px', fontWeight: 600, ml: 5, width: '20%' }}>SUPPORTS: </Typography>
                            <Stack direction='column' gap={2}>
                                <FormControl size="md" error={!validationCheck(content?.supports.stability) && submitted}>
                                    <FormLabel>Stability Result</FormLabel>
                                    <Input
                                        type="number"
                                        placeholder="안정성"
                                        value={content?.supports.stability}
                                        onChange={(e) => updateDeepValue(setContent, ['supports', 'stability'], e.target.value)}
                                        sx={{
                                            backgroundColor: '#ffffff'
                                        }}
                                    />
                                    {!validationCheck(content?.supports.stability) && submitted && 
                                        <FormHelperText>
                                            <InfoOutlined />
                                            필수 입력란입니다.
                                        </FormHelperText>                            
                                    }   
                                </FormControl>
                                <Stack direction='row' gap={2}>
                                    <Stack direction='row'>
                                        <FormControl size="md" error={!validationCheck(content?.supports.distribution.numerator) && submitted}>
                                            <FormLabel>Distribution</FormLabel>
                                            <Input
                                                type="number"
                                                placeholder="분포"
                                                value={content?.supports.distribution.numerator}
                                                onChange={(e) => updateDeepValue(setContent, ['supports', 'distribution', 'numerator'], e.target.value)}
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                            />
                                            {!validationCheck(content?.supports.distribution.numerator) && submitted && 
                                                <FormHelperText>
                                                    <InfoOutlined />
                                                    필수 입력란입니다.
                                                </FormHelperText>                            
                                            }   
                                        </FormControl>
                                        <FormControl size="md" error={!validationCheck(content?.supports.distribution.denominator) && submitted}>
                                            <FormLabel>/</FormLabel>
                                            <Input
                                                type="number"
                                                placeholder="분포"
                                                value={content?.supports.distribution.denominator}
                                                onChange={(e) => updateDeepValue(setContent, ['supports', 'distribution', 'denominator'], e.target.value)}
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                            />
                                            {!validationCheck(content?.supports.distribution.denominator) && submitted && 
                                                <FormHelperText>
                                                    <InfoOutlined />
                                                    필수 입력란입니다.
                                                </FormHelperText>                            
                                            } 
                                        </FormControl>
                                    </Stack>
                                    <FormControl size="md" error={!validationCheck(content?.supports.distribution.points) && submitted}>
                                        <FormLabel>Distribution Points</FormLabel>
                                        <Input
                                            type="number"
                                            placeholder="점수"
                                            value={content?.supports.distribution.points}
                                            onChange={(e) => updateDeepValue(setContent, ['supports', 'distribution', 'points'], e.target.value)}
                                            sx={{
                                                backgroundColor: '#ffffff'
                                            }}
                                        />
                                        {!validationCheck(content?.supports.distribution.points) && submitted && 
                                            <FormHelperText>
                                                <InfoOutlined />
                                                필수 입력란입니다.
                                            </FormHelperText>                            
                                        } 
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
                                        onChange={(e) => updateDeepValue(setContent, ['trunk', 'stability'], e.target.value)}
                                        sx={{
                                            backgroundColor: '#ffffff'
                                        }}
                                    />
                                    {!validationCheck(content?.trunk.stability) && submitted && 
                                        <FormHelperText>
                                            <InfoOutlined />
                                            필수 입력란입니다.
                                        </FormHelperText>                            
                                    }
                                </FormControl>
                                <Stack direction='row' gap={2}>
                                    <Stack direction='row'>
                                        <FormControl size="md" error={!validationCheck(content?.trunk.distribution.numerator) && submitted}>
                                            <FormLabel>Distribution</FormLabel>
                                            <Input
                                                type="number"
                                                placeholder="분포"
                                                value={content?.trunk.distribution.numerator}
                                                onChange={(e) => updateDeepValue(setContent, ['trunk', 'distribution', 'numerator'], e.target.value)}
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                            />
                                            {!validationCheck(content?.trunk.distribution.numerator) && submitted && 
                                                <FormHelperText>
                                                    <InfoOutlined />
                                                    필수 입력란입니다.
                                                </FormHelperText>                            
                                            }
                                        </FormControl>
                                        <FormControl error={!validationCheck(content?.trunk.distribution.denominator) && submitted}>
                                            <FormLabel>/</FormLabel>
                                            <Input
                                                type="number"
                                                placeholder="분포"
                                                value={content?.trunk.distribution.denominator}
                                                onChange={(e) => updateDeepValue(setContent, ['trunk', 'distribution', 'denominator'], e.target.value)}
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                            />
                                            {!validationCheck(content?.trunk.distribution.denominator) && submitted && 
                                                <FormHelperText>
                                                    <InfoOutlined />
                                                    필수 입력란입니다.
                                                </FormHelperText>                            
                                            }
                                        </FormControl>
                                    </Stack>
                                    <FormControl size="md" error={!validationCheck(content?.trunk.distribution.points) && submitted}>
                                        <FormLabel>Distribution Points</FormLabel>
                                        <Input
                                            type="number"
                                            placeholder="점수"
                                            value={content?.trunk.distribution.points}
                                            onChange={(e) => updateDeepValue(setContent, ['trunk', 'distribution', 'points'], e.target.value)}
                                            sx={{
                                                backgroundColor: '#ffffff'
                                            }}
                                        />
                                        {!validationCheck(content?.trunk.distribution.points) && submitted && 
                                            <FormHelperText>
                                                <InfoOutlined />
                                                필수 입력란입니다.
                                            </FormHelperText>                            
                                        }
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
                                    onChange={(e) => updateDeepValue(setContent, ['postural_coordination', 'value'], e.target.value)}
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                                {!validationCheck(content?.postural_coordination.value) && submitted && 
                                    <FormHelperText>
                                        <InfoOutlined />
                                        필수 입력란입니다.
                                    </FormHelperText>                            
                                }
                            </FormControl>
                            <FormControl size="md" error={!validationCheck(content?.postural_coordination.point) && submitted}>
                                <FormLabel>Postural Points</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="점수"
                                    value={content?.postural_coordination.point}
                                    onChange={(e) => updateDeepValue(setContent, ['postural_coordination', 'point'], e.target.value)}
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                                {!validationCheck(content?.postural_coordination.point) && submitted && 
                                    <FormHelperText>
                                        <InfoOutlined />
                                        필수 입력란입니다.
                                    </FormHelperText>                            
                                }
                            </FormControl>
                            <FormControl size="md" error={!validationCheck(content?.postural_strategy) && submitted}>
                                <FormLabel>Postural Strategy</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="점수"
                                    value={content?.postural_strategy}
                                    onChange={(e) => updateDeepValue(setContent, ['postural_strategy'], e.target.value)}
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                                {!validationCheck(content?.postural_strategy) && submitted && 
                                    <FormHelperText>
                                        <InfoOutlined />
                                        필수 입력란입니다.
                                    </FormHelperText>                            
                                }
                            </FormControl>
                        </Stack>
                    </Stack>
                </FormAccordionDetails>
            </FormAccordion>
        </React.Fragment>
        : null
    )
}

export default ImooveContentForm
