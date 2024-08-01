import { useState, useEffect } from 'react'
import { useLocalTokenValidation } from 'api/commons/auth'
import { PhysicalExam } from 'interfaces' 
import { Box, Divider, FormControl, FormHelperText, FormLabel, IconButton, Input, Sheet, Stack, Typography, Button } from '@mui/joy'
import { ID } from 'components/commons/TableMui'
import { FormAccordion, FormAccordionDetails, FormAccordionHeader, FormAccordionSummary } from '../InspectionHistory/CustomTheme'
import { DateTimePicker, LocalizationProvider, renderTimeViewClock } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import { Close, InfoOutlined } from '@mui/icons-material'
import { validationCheck } from "api/commons/utils"

interface PhysicalExamAddModalProps {
    show: boolean, 
    isNew: boolean
    selectedPhysicalExam: PhysicalExam & ID | null,
    addPhysicalExam: (newReport: PhysicalExam, isNew: boolean) => void
    handleClose: React.Dispatch<React.SetStateAction<boolean>>, 
}

const PhysicalExamHistoryAddModal = ({ 
    show, 
    isNew, 
    selectedPhysicalExam, 
    addPhysicalExam, 
    handleClose 
}: PhysicalExamAddModalProps) => {
    const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수

    const [recorded, setRecorded] = useState<Dayjs>(dayjs())
    const [height, setHeight] = useState("")
    const [weight, setWeight] = useState("")
    const [systolicBloodPressure, setSystolicBloodPressure] = useState("")
    const [diastolicBloodPressure, setDiastolicBloodPressure] = useState("")
    const [bodyTemperature, setBodyTemperature] = useState("")
    const [submitted, setSubmitted] = useState<boolean>(false)

    const handleAddPhysicalExam = () => {
        setSubmitted(true)

        console.log(
            isNew ? "add" : ("edit - " + selectedPhysicalExam),
            "\nrecorded: " + recorded,
            "\nheight: " + height,
            "\nweight: " + weight,
            "\nsystolic_blood_pressure: " + systolicBloodPressure,
            "\ndiastolic_blood_pressure: " + diastolicBloodPressure,
            "\nbodyTemperature: " + bodyTemperature
        )

        const newPhysicalExam: PhysicalExam = {
            recorded: recorded.format(),
            height: +height,
            weight: +weight,
            systolic_blood_pressure: +systolicBloodPressure,
            diastolic_blood_pressure: +diastolicBloodPressure,
            body_temperature: +bodyTemperature
        }

        addPhysicalExam(newPhysicalExam, isNew)
        handleClose(false)
    }

    useEffect(() => {
		let testMode = true
		if (process.env.NODE_ENV !== 'development' || testMode) checkAuth()
	}, [checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사

    useEffect(() => {
        if (!isNew && selectedPhysicalExam) {
            setRecorded(dayjs(selectedPhysicalExam.recorded))
            setHeight(`${selectedPhysicalExam.height}`)
            setWeight(`${selectedPhysicalExam.weight}`)
            setSystolicBloodPressure(`${selectedPhysicalExam.systolic_blood_pressure}`)
            setDiastolicBloodPressure(`${selectedPhysicalExam.diastolic_blood_pressure}`)
            setBodyTemperature(`${selectedPhysicalExam.body_temperature}`)
        }
    }, [isNew, selectedPhysicalExam])

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
                    >신체 검사 기록 {isNew ? "추가" : "편집"}
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
                        <FormAccordionHeader>검사 결과</FormAccordionHeader>
                    </FormAccordionSummary>
                    <FormAccordionDetails>
                        <Stack direction='column' gap={2} sx={{ 
                            justifyContent: 'space-between',
                            p: '0px 5px',
                            alignItems: 'middle'
                        }}>
                            <FormControl size="md" error={!validationCheck(height) && submitted}>
                                <FormLabel>키 (cm)</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="검사 강도"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                                {!validationCheck(height) && submitted && 
                                    <FormHelperText>
                                        <InfoOutlined />
                                        필수 입력란입니다.
                                    </FormHelperText>                            
                                }                           
                            </FormControl>   
                            <FormControl size="md" error={!validationCheck(weight) && submitted}>
                                <FormLabel>몸무게 (kg)</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="검사 강도"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                                {!validationCheck(weight) && submitted && 
                                    <FormHelperText>
                                        <InfoOutlined />
                                        필수 입력란입니다.
                                    </FormHelperText>                            
                                }                           
                            </FormControl>   
                            <FormControl size="md" error={!validationCheck(diastolicBloodPressure) && submitted}>
                                <FormLabel>최저 혈압</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="검사 강도"
                                    value={diastolicBloodPressure}
                                    onChange={(e) => setDiastolicBloodPressure(e.target.value)}
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                                {!validationCheck(diastolicBloodPressure) && submitted && 
                                    <FormHelperText>
                                        <InfoOutlined />
                                        필수 입력란입니다.
                                    </FormHelperText>                            
                                }                           
                            </FormControl> 
                            <FormControl size="md" error={!validationCheck(systolicBloodPressure) && submitted}>
                                <FormLabel>최고 혈압</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="검사 강도"
                                    value={systolicBloodPressure}
                                    onChange={(e) => setSystolicBloodPressure(e.target.value)}
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                                {!validationCheck(systolicBloodPressure) && submitted && 
                                    <FormHelperText>
                                        <InfoOutlined />
                                        필수 입력란입니다.
                                    </FormHelperText>                            
                                }                           
                            </FormControl> 
                            <FormControl size="md" error={!validationCheck(bodyTemperature) && submitted}>
                                <FormLabel>체온</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="검사 강도"
                                    value={bodyTemperature}
                                    onChange={(e) => setBodyTemperature(e.target.value)}
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                                {!validationCheck(bodyTemperature) && submitted && 
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
                                    value={dayjs(recorded)} 
                                    onChange={(e) => {setRecorded(dayjs(e))}}
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
                    </Stack>
                    </FormAccordionDetails>
                </FormAccordion>
            </Box>
            <Divider component="div" sx={{ my: 1 }} />
            <Button variant='soft' onClick={handleAddPhysicalExam} sx={{ margin: 'auto', width: '50%' }}>
                {isNew ? "추가": "변경"}
            </Button>
        </Sheet>
    )
}

export default PhysicalExamHistoryAddModal
