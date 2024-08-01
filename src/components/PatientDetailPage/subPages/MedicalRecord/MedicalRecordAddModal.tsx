import { useEffect, useState } from 'react'
import { Inspection } from './MedicalRecord'
import { PhysicalExam } from '../../../../interfaces'
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import utc from "dayjs/plugin/utc"
import 'dayjs/locale/ko'
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers'
import { Box, Divider, FormControl, FormLabel, IconButton, Input, Select, Sheet, Typography, Option, Chip, Textarea, Stack, Button, Switch } from '@mui/joy'
import { Close } from '@mui/icons-material'


dayjs.extend(isLeapYear)
dayjs.extend(utc)
dayjs.locale('ko')

interface MedicalRecordAddModalProps {
    show: boolean, 
    isNew: boolean,
    selectedMedicalRecord: Inspection | null,
    addRecord: (newMedicalRecord: Inspection, isNew: boolean) => void,
    addPhysicalExam: (newPhysicalExam: PhysicalExam) => void,
    handleClose: React.Dispatch<React.SetStateAction<boolean>>,
    axiosMode: boolean
}

const symptomsList: string[] = [
    "기침",
    "가래",
    "어지러움",
    "열",
    "구토",
    "피로",
    "식은땀", 
    "발작",
    "기억상실"
]

const diagnosticsList: string[] = [
    "감기", 
    "독감", 
    "식중독",
    "우울증",
    "치매",
    "심근경색",
    "척추측만증",
    "비염",
    "광견병"
]

const MedicalRecordAddModal = ({ show, isNew, selectedMedicalRecord, addRecord, addPhysicalExam, handleClose }: MedicalRecordAddModalProps) => {
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
    const [selectedDiagnostics, setSelectedDiagnostics] = useState<string[]>([])
    const [memo, setMemo] = useState("")
    const [recorded, setRecorded] = useState<dayjs.Dayjs>(dayjs())
    const [height, setHeight] = useState("")
    const [weight, setWeight] = useState("")
    const [systolicBloodPressure, setSystolicBloodPressure] = useState("")
    const [diastolicBloodPressure, setDiastolicBloodPressure] = useState("")
    const [bodyTemperature, setBodyTemperature] = useState("")
    const [ommitPhysicalExam, setOmmitPhysicalExam] = useState(false)

    const handleAddMedicalRecord = () => {
        console.log(
            isNew ? "add" : ("edit - " + selectedMedicalRecord?.symptoms),
            "\nsymptoms: " + selectedSymptoms,
            "\ndiagnostics: " + selectedDiagnostics,
            "\nmemo: " + memo,
            "\nrecorded: " + recorded.format(),
            "\nheight: " + height,
            "\nweight: " + weight,
            "\nblood pressure: " + systolicBloodPressure + "~" + diastolicBloodPressure
        )

        const newMedicalRecord: Inspection = {
            symptoms: selectedSymptoms,
            diagnostics: selectedDiagnostics,
            memo: memo,
            recorded: recorded.format(),
        }

        addRecord(newMedicalRecord, isNew)

        if (!ommitPhysicalExam && isNew) {
            const newPhysicalExam: PhysicalExam = {
                recorded: recorded.format(),
                body_temperature: +bodyTemperature,
                height: +height,
                weight: +weight,
                systolic_blood_pressure: +systolicBloodPressure,
                diastolic_blood_pressure: +diastolicBloodPressure
            }
            addPhysicalExam(newPhysicalExam)
        }
        
        handleClose(false)
    }

    useEffect(() => {
        if (!isNew && selectedMedicalRecord) {
            setSelectedSymptoms(selectedMedicalRecord.symptoms)
            setSelectedDiagnostics(selectedMedicalRecord.diagnostics)
            setMemo(selectedMedicalRecord.memo)
            setRecorded(dayjs(selectedMedicalRecord.recorded))
        }
        else {
            setSelectedSymptoms([])
            setSelectedDiagnostics([])
            setMemo("")
            setRecorded(dayjs())
        }
    }, [isNew, selectedMedicalRecord])

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
					>진료 기록 {isNew ? "추가" : "편집"}
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
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 5,
                    justifyContent: 'space-between',
                    p: '20px 5px',
                    alignItems: 'middle'
                }}
            >      
                {isNew &&
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 2,
                        justifyContent: 'space-between',
                        p: '0px 5px',
                        alignItems: 'middle',
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            gap: 2,
                            p: '0px 5px',
                            alignItems: 'middle'
                        }}>
                            <Typography fontSize='18px' fontWeight='550'>기본 사항</Typography>
                            <FormControl size="md" sx={{ margin: 'auto 0' }}>
                                <Switch
                                    checked={!ommitPhysicalExam}
                                    onChange={() => setOmmitPhysicalExam(!ommitPhysicalExam)}
                                />
                            </FormControl>
                        </Box>
                        <Stack direction='row' gap={2} sx={{ 
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            p: '0px 5px',
                            alignItems: 'middle'
                        }}>
                            <FormControl size="md">
                                <FormLabel>신장 (cm)</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="신장"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    disabled={ommitPhysicalExam}
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                            </FormControl>
                            <FormControl size="md">
                                <FormLabel>몸무게 (kg)</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="몸무게"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    disabled={ommitPhysicalExam}
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                            </FormControl>
                            <FormControl size="md">
                                <FormLabel>최저 혈압</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="최저혈압"
                                    value={diastolicBloodPressure}
                                    onChange={(e) => setDiastolicBloodPressure(e.target.value)}
                                    disabled={ommitPhysicalExam}
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                            </FormControl>
                            <FormControl size="md">
                                <FormLabel>최고 혈압</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="최고혈압"
                                    value={systolicBloodPressure}
                                    onChange={(e) => setSystolicBloodPressure(e.target.value)}
                                    disabled={ommitPhysicalExam}
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                            </FormControl>
                            <FormControl size="md">
                                <FormLabel>체온 (℃)</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="체온"
                                    value={bodyTemperature}
                                    onChange={(e) => setBodyTemperature(e.target.value)}
                                    disabled={ommitPhysicalExam}
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                            </FormControl>
                        </Stack>
                    </Box>
                }
                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 2,
                        justifyContent: 'space-between',
                        p: '0px 5px',
                        alignItems: 'middle'
                    }}
                >
                    <Box sx={{ 
                            display: 'flex', 
                            gap: 2,
                            justifyContent: 'space-between',
                            p: '0px 5px',
                            alignItems: 'middle'
                        }}>
                        <Typography fontSize='18px' fontWeight='550'>진료 내용</Typography>
                    </Box>
                    <Stack direction='column' gap={2} sx={{ 
                        justifyContent: 'space-between',
                        p: '0px 5px',
                        alignItems: 'middle'
                    }}>
                        <FormControl size="md">
                            <FormLabel>증상</FormLabel>
                            <Select
                                multiple
                                size="md"
                                placeholder="증상 선택"
                                value={selectedSymptoms}
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
                                onChange={(_, value) => setSelectedSymptoms(value)}
                                sx={{
                                    backgroundColor: '#ffffff'
                                }}
                            >
                                {symptomsList.map((symptom, index) => {
                                    return (
                                        <Option key={index} value={symptom}>{`${symptom}`}</Option>
                                    )
                                })}
                            </Select>
                        </FormControl>
                        <FormControl size="md">
                            <FormLabel>진단</FormLabel>
                            <Select
                                multiple
                                size="md"
                                placeholder="진단 선택"
                                value={selectedDiagnostics}
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
                                onChange={(_, value) => setSelectedDiagnostics(value)}
                                sx={{
                                    backgroundColor: '#ffffff'
                                }}
                            >
                                {diagnosticsList.map((diagnostic, index) => {
                                    return (
                                        <Option key={index} value={diagnostic}>{`${diagnostic}`}</Option>
                                    )
                                })}
                            </Select>
                        </FormControl>
                    </Stack>
                </Box>
                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 2,
                        justifyContent: 'space-between',
                        p: '0px 5px',
                        alignItems: 'middle'
                    }}
                >
                    <Box sx={{ 
                            display: 'flex', 
                            gap: 2,
                            justifyContent: 'space-between',
                            p: '0px 5px',
                            alignItems: 'middle'
                        }}>
                        <Typography fontSize='18px' fontWeight='550'>기타</Typography>
                    </Box>
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
                        <FormControl size="md">
                            <FormLabel>비고</FormLabel>
                            <Textarea
                                minRows={3}
                                placeholder="기타 사항"
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                                sx={{
                                    backgroundColor: '#ffffff'
                                }}
                            />
                        </FormControl>
                    </Stack>
                </Box>
            </Box>
            <Button variant='soft' onClick={handleAddMedicalRecord} sx={{ margin: 'auto', width: '50%' }}>
                {isNew ? "추가": "변경"}
            </Button>
        </Sheet>
    )
}

export default MedicalRecordAddModal

