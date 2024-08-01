import { useEffect, useState } from 'react'
import { Nok, Patient, PhysicalExam } from 'interfaces'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import utc from "dayjs/plugin/utc"
import 'dayjs/locale/ko'
import { Box, Divider, FormControl, FormLabel, IconButton, Input, Select, Sheet, Typography, Option, Chip, Textarea, Stack, Button, Switch, RadioGroup, Radio, FormHelperText, Modal, ModalDialog, DialogContent, DialogTitle } from '@mui/joy'
import { Add, Close, Delete, InfoOutlined } from '@mui/icons-material'
import { updateDeepValue, validationCheck } from 'api/commons/utils'
import { FormAccordion, FormAccordionDetails, FormAccordionHeader, FormAccordionSummary } from '../InspectionHistory/CustomTheme'
import DaumPostcodeEmbed from 'react-daum-postcode'

dayjs.extend(isLeapYear)
dayjs.extend(utc)
dayjs.locale('ko')

interface PatientAddModalProps {
    show: boolean, 
    isNew: boolean,
    selectedPatient: Patient | null,
    addPatient: (newPatient: Patient, isNew: boolean) => Promise<any>,
    addPhysicalExam: (newPhysicalExam: PhysicalExam, id: number) => Promise<any>,
    handleClose: React.Dispatch<React.SetStateAction<boolean>>,
    axiosMode: boolean
}

const initialPatient: Patient = {
    birthday: dayjs().format('YYYY-MM-DD'),
    first_name: '',
    last_name: '',
    sex: '',
    tel: ['', ''],
    address: '',
    post_number: '',
    social_number: '',
    noks: [],
    regDate: dayjs().format('YYYY-MM-DD'),
    address_detail: '',
    memo: ''
}

const initialPhysicalExam: PhysicalExam = {
    recorded: '',
    height: '',
    weight: '',
    systolic_blood_pressure: '',
    diastolic_blood_pressure: '',
    body_temperature: ''
}

const initialNok: Nok = {
    relationship: '',
    first_name: '',
    last_name: '',
    sex: '',
    birthday: dayjs().format('YYYY-MM-DD'),
    tel: ['', ''],
    address: '',
    address_detail: '',
    post_number: '',
    social_number: ''
}

const PatientsTableAddModal = ({ show, isNew, selectedPatient, addPatient, addPhysicalExam, handleClose }: PatientAddModalProps) => {
    const [newPatient, setNewPatient] = useState<Patient>(initialPatient)
    const [newPhysicalExam, setNewPhysicalExam] = useState<PhysicalExam>(initialPhysicalExam)
    const [ommitPhysicalExam, setOmmitPhysicalExam] = useState<boolean>(false)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [addressSearcherOpen, setAddressSearcherOpen] = useState<boolean>(false)
    const [targetNok, setTargetNok] = useState<number>()
    const [isSameAddress, setIsSameAddress] = useState<boolean[]>([])

    const handleAddPatient = async () => {

        setSubmitted(true)

        console.log(
            isNew ? "add" : ("edit - " + selectedPatient?.last_name),
        )

        try {
            let id = await addPatient(newPatient, isNew)
            if (!ommitPhysicalExam && isNew) {
                addPhysicalExam(newPhysicalExam, id)
            }
        }
        catch {

        }
        
        handleClose(false)
    }

    const handlePostCode = (data: any) => {
        let fullAddress = data.address
        let extraAddress = ''
        
        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName)
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '')
        }

        if (targetNok === undefined) {
            updateDeepValue(setNewPatient, ['address'], fullAddress)
            updateDeepValue(setNewPatient, ['address_detail'], "")
            updateDeepValue(setNewPatient, ['post_number'], data.zonecode)
        }
        else {
            updateDeepValue(setNewPatient, ['noks', targetNok, 'address'], fullAddress)
            updateDeepValue(setNewPatient, ['noks', targetNok, 'address_detail'], "")
            updateDeepValue(setNewPatient, ['noks', targetNok, 'post_number'], data.zonecode)
        }

        setAddressSearcherOpen(false)
    }

    useEffect(() => {
        if (!isNew && selectedPatient) {
            setNewPatient(selectedPatient)
        }
        else {
            setNewPatient(initialPatient)
            setNewPhysicalExam(initialPhysicalExam)
            setIsSameAddress([])
        }
    }, [isNew, selectedPatient])

    return (
        <>
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
                        >환자 목록 {isNew ? "추가" : "편집"}
                        </Typography>
                        <IconButton
                            variant='plain' 
                            onClick={() => {handleClose(false)}}
                            sx={{ }}
                        ><Close />
                        </IconButton>
                </Box>
                <Divider component="div" sx={{ my: 1 }} />  
                <Box className='scrollable vertical' sx={{ mb: 2 }}>
                    <FormAccordion defaultExpanded>
                        <FormAccordionSummary>
                            <FormAccordionHeader>환자 정보</FormAccordionHeader>
                        </FormAccordionSummary>
                        <FormAccordionDetails>
                            <Stack gap={2}>
                                <Stack direction='row' gap={5} sx={{ py: 2, justifyContent: 'space-between', px: 10 }}>
                                    <Stack direction='row' gap={1} sx={{ flex: '1 1 auto' }}>
                                        <FormControl size="md" error={!validationCheck(newPatient?.last_name) && submitted} sx={{ flex: '1 1 auto' }}>
                                            <FormLabel>이름</FormLabel>
                                            <Input
                                                type="string"
                                                placeholder="성"
                                                value={newPatient?.last_name}
                                                onChange={(e) => updateDeepValue(setNewPatient, ['last_name'], e.target.value)}
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                            />
                                            {!validationCheck(newPatient?.last_name) && submitted && 
                                                <FormHelperText>
                                                    <InfoOutlined />
                                                    필수 입력란입니다.
                                                </FormHelperText>                            
                                            }
                                        </FormControl>
                                        <FormControl size="md" error={!validationCheck(newPatient?.first_name) && submitted} sx={{ flex: "1 1 auto" }}>
                                            <FormLabel><br/></FormLabel>
                                            <Input
                                                type="string"
                                                placeholder="이름"
                                                value={newPatient?.first_name}
                                                onChange={(e) => updateDeepValue(setNewPatient, ['first_name'], e.target.value)}
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                            />
                                            {!validationCheck(newPatient?.first_name) && submitted && 
                                                <FormHelperText>
                                                    <InfoOutlined />
                                                    필수 입력란입니다.
                                                </FormHelperText>                            
                                            }
                                        </FormControl>
                                    </Stack>
                                    <FormControl size="md">
                                        <FormLabel>성별</FormLabel>
                                        <RadioGroup 
                                            name="radio-buttons-group" 
                                            value={newPatient?.sex}
                                            onChange={(e) => updateDeepValue(setNewPatient, ['sex'], e.target.value)}
                                            orientation='horizontal'
                                        >
                                            <Radio value="0" label="남" variant="outlined" />
                                            <Radio value="1" label="여" variant="outlined" />
                                            <Radio value="2" label="기타" variant="outlined" />
                                        </RadioGroup>
                                    </FormControl>
                                </Stack>
                                <Stack direction='row' gap={5} sx={{ py: 2, justifyContent: 'space-between', px: 10 }}>
                                    <FormControl size="md" sx={{ flex: '1 1 auto' }}>
                                        <FormLabel>생년월일</FormLabel>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                                            <DatePicker 
                                                value={dayjs(newPatient.birthday)} 
                                                onChange={(e) => {updateDeepValue(setNewPatient, ['birthday'], dayjs(e).format('YYYY-MM-DD'))}}
                                                orientation="portrait"
                                                format="YYYY/MM/DD"
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </FormControl>
                                    <Stack direction='row' gap={1} sx={{ flex: '1 1 auto' }}>
                                        <FormControl size="md" sx={{ justifyContent: 'flex-end', flex: '1 1 auto' }}>
                                            <FormLabel>주민등록번호</FormLabel>
                                            <Input
                                                type="number"
                                                placeholder="주민등록번호"
                                                value={dayjs(newPatient.birthday).format('YYMMDD')}
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                                disabled={true}
                                            />
                                        </FormControl>
                                        <FormControl size="md" error={!validationCheck(newPatient.social_number) && submitted} sx={{ justifyContent: "flex-end", flex: '1 1 auto' }}>
                                            <Input
                                                type="number"
                                                placeholder=""
                                                value={newPatient.social_number}
                                                onChange={(e) => updateDeepValue(setNewPatient, ['social_number'], e.target.value)}
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                            />
                                            {!validationCheck(newPatient.social_number) && submitted && 
                                                <FormHelperText>
                                                    <InfoOutlined />
                                                    필수 입력란입니다.
                                                </FormHelperText>                            
                                            }   
                                        </FormControl>
                                    </Stack>
                                </Stack>
                                <Stack direction='row' gap={1} sx={{ py: 2, justifyContent: 'space-between', px: 10 }}>
                                    <Stack direction='row' gap={2} sx={{ flex: '1 1 auto' }}>
                                        <FormControl size="md" sx={{ justifyContent: 'flex-end', flex: '1 1 auto' }}>
                                            <FormLabel>휴대폰번호</FormLabel>
                                            <Input
                                                type="number"
                                                placeholder=""
                                                value={`010`}
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                                disabled={true}
                                            />
                                        </FormControl>
                                        <FormControl size="md" error={!validationCheck(newPatient.tel[0]) && submitted} sx={{ justifyContent: "flex-end", flex: '1 1 auto' }}>
                                            <Input
                                                type="number"
                                                placeholder=""
                                                value={newPatient.tel[0]}
                                                onChange={(e) => updateDeepValue(setNewPatient, ['tel', 0], e.target.value)}
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                            />
                                            {!validationCheck(newPatient.tel[0]) && submitted && 
                                                <FormHelperText>
                                                    <InfoOutlined />
                                                    필수 입력란입니다.
                                                </FormHelperText>                            
                                            }   
                                        </FormControl>
                                        <FormControl size="md" error={!validationCheck(newPatient.tel[1]) && submitted} sx={{ justifyContent: "flex-end", flex: '1 1 auto' }}>
                                            <Input
                                                type="number"
                                                placeholder=""
                                                value={newPatient.tel[1]}
                                                onChange={(e) => updateDeepValue(setNewPatient, ['tel', 1], e.target.value)}
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                            />
                                            {!validationCheck(newPatient.tel[1]) && submitted && 
                                                <FormHelperText>
                                                    <InfoOutlined />
                                                    필수 입력란입니다.
                                                </FormHelperText>                            
                                            }   
                                        </FormControl>
                                    </Stack>
                                </Stack>
                                <Stack direction='row' gap={1} sx={{ py: 2, justifyContent: 'space-between', px: 10 }}>
                                    <Stack gap={2} sx={{ flex: '1 1 auto' }}>
                                        <Stack direction='row' gap={1}>
                                            <FormControl size="md" sx={{ justifyContent: 'flex-end', flex: '1 1 auto' }}>
                                                <FormLabel>주소 입력</FormLabel>
                                                <Input
                                                    type="string"
                                                    placeholder="주소"
                                                    value={newPatient.address}
                                                    sx={{
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                    disabled={true}
                                                />
                                            </FormControl>    
                                            <FormControl size="md" error={!validationCheck(newPatient.post_number) && submitted} sx={{ justifyContent: "flex-end" }}>
                                                <Input
                                                    type="number"
                                                    placeholder="우편번호"
                                                    value={newPatient.post_number}
                                                    onChange={(e) => updateDeepValue(setNewPatient, ['post_number'], e.target.value)}
                                                    sx={{
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                    disabled={true}
                                                />
                                                {!validationCheck(newPatient.post_number) && submitted && 
                                                    <FormHelperText>
                                                        <InfoOutlined />
                                                        필수 입력란입니다.
                                                    </FormHelperText>                            
                                                }   
                                            </FormControl>
                                            <FormControl sx={{ justifyContent: 'flex-end' }}>
                                                <Button onClick={() => {setTargetNok(undefined); setAddressSearcherOpen(true)}}>
                                                    우편번호 찾기
                                                </Button>
                                            </FormControl>
                                        </Stack>                                           
                                        <FormControl size="md" error={!validationCheck(newPatient.social_number) && submitted} sx={{ justifyContent: "flex-end" }}>
                                            <Input
                                                type="string"
                                                placeholder="상세 주소"
                                                value={newPatient.address_detail}
                                                onChange={(e) => updateDeepValue(setNewPatient, ['address_detail'], e.target.value)}
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                            />
                                            {!validationCheck(newPatient.tel) && submitted && 
                                                <FormHelperText>
                                                    <InfoOutlined />
                                                    필수 입력란입니다.
                                                </FormHelperText>                            
                                            }   
                                        </FormControl>
                                    </Stack>
                                </Stack>   
                                <Stack direction='row' gap={1} sx={{ py: 2, justifyContent: 'space-between', px: 10, flexWrap: 'wrap' }}>
                                    <FormControl size="md" sx={{ margin: 'auto 0' }}>
                                        <FormLabel>생략</FormLabel>
                                        <Switch
                                            checked={!ommitPhysicalExam}
                                            onChange={() => setOmmitPhysicalExam(!ommitPhysicalExam)}
                                        />
                                    </FormControl>
                                    <FormControl size="md">
                                        <FormLabel>신장 (cm)</FormLabel>
                                        <Input
                                            type="number"
                                            placeholder="신장"
                                            value={newPhysicalExam.height}
                                            onChange={(e) => updateDeepValue(setNewPhysicalExam, ['height'], e.target.value)}
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
                                            value={newPhysicalExam.weight}
                                            onChange={(e) => updateDeepValue(setNewPhysicalExam, ['weight'], e.target.value)}
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
                                            value={newPhysicalExam.diastolic_blood_pressure}
                                            onChange={(e) => updateDeepValue(setNewPhysicalExam, ['diastolic_blood_pressure'], e.target.value)}
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
                                            value={newPhysicalExam.systolic_blood_pressure}
                                            onChange={(e) => updateDeepValue(setNewPhysicalExam, ['systolic_blood_pressure'], e.target.value)}
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
                                            value={newPhysicalExam.body_temperature}
                                            onChange={(e) => updateDeepValue(setNewPhysicalExam, ['body_temperature'], e.target.value)}
                                            disabled={ommitPhysicalExam}
                                            sx={{
                                                backgroundColor: '#ffffff'
                                            }}
                                        />
                                    </FormControl>
                                </Stack>
                                <Stack direction='row' gap={1} sx={{ py: 2, justifyContent: 'space-between', px: 10, flexWrap: 'wrap' }}>
                                    <FormControl size="md" sx={{ flex: '1 1 auto' }}>
                                        <FormLabel>등록일자</FormLabel>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                                            <DatePicker 
                                                value={dayjs(newPatient.regDate)} 
                                                onChange={(e) => {updateDeepValue(setNewPatient, ['regDate'], dayjs(e))}}
                                                orientation="portrait"
                                                format="YYYY/MM/DD"
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </FormControl>
                                </Stack>              
                            </Stack>
                        </FormAccordionDetails>
                    </FormAccordion>
                    <FormAccordion defaultExpanded>
                        <FormAccordionSummary>
                            <FormAccordionHeader>보호자 정보</FormAccordionHeader>
                        </FormAccordionSummary>
                        <FormAccordionDetails>
                            {newPatient.noks.map((_, index) => {
                                return(
                                    <Stack direction='row' gap={1} key={index}>
                                        <Stack gap={2} sx={{ flex: '1 1 auto' }}>
                                            <Stack direction='row' gap={5} sx={{ py: 2, justifyContent: 'space-between', px: 10 }}>
                                                <Stack direction='row' gap={1} sx={{ flex: '1 1 auto' }}>
                                                    <FormControl size="md" sx={{ flex: '1 1 auto' }}>
                                                        <FormLabel>관계</FormLabel>
                                                        <Select
                                                            size="md"
                                                            placeholder="관계 선택"
                                                            value={newPatient.noks[index].relationship}
                                                            renderValue={(selected) => (
                                                                <Chip variant="soft" color="primary" key={index}>
                                                                    {selected?.label}
                                                                </Chip>
                                                            )}
                                                            slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                                                            onChange={(_, value) => updateDeepValue(setNewPatient, ['noks', index, 'relationship'], value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff'
                                                            }}
                                                        >
                                                            {['부', '모', '조부', '조모', '기타'].map((relation, index) => {
                                                                return (
                                                                    <Option key={index} value={relation}>{`${relation}`}</Option>
                                                                )
                                                            })}
                                                        </Select>
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(newPatient?.noks[index].last_name) && submitted} sx={{ flex: '1 1 auto' }}>
                                                        <FormLabel>이름</FormLabel>
                                                        <Input
                                                            type="string"
                                                            placeholder="성"
                                                            value={newPatient?.noks[index].last_name}
                                                            onChange={(e) => updateDeepValue(setNewPatient, ['noks', index, 'last_name'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff'
                                                            }}
                                                        />
                                                        {!validationCheck(newPatient?.noks[index].last_name) && submitted && 
                                                            <FormHelperText>
                                                                <InfoOutlined />
                                                                필수 입력란입니다.
                                                            </FormHelperText>                            
                                                        }
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(newPatient?.noks[index].first_name) && submitted} sx={{ flex: "1 1 auto" }}>
                                                        <FormLabel><br/></FormLabel>
                                                        <Input
                                                            type="string"
                                                            placeholder="이름"
                                                            value={newPatient?.noks[index].first_name}
                                                            onChange={(e) => updateDeepValue(setNewPatient, ['noks', index, 'first_name'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff'
                                                            }}
                                                        />
                                                        {!validationCheck(newPatient?.noks[index].first_name) && submitted && 
                                                            <FormHelperText>
                                                                <InfoOutlined />
                                                                필수 입력란입니다.
                                                            </FormHelperText>                            
                                                        }
                                                    </FormControl>
                                                </Stack>
                                                <FormControl size="md">
                                                    <FormLabel>성별</FormLabel>
                                                    <RadioGroup 
                                                        name="radio-buttons-group" 
                                                        value={newPatient?.noks[index].sex}
                                                        onChange={(e) => updateDeepValue(setNewPatient, ['noks', index, 'sex'], e.target.value)}
                                                        orientation='horizontal'
                                                    >
                                                        <Radio value="0" label="남" variant="outlined" />
                                                        <Radio value="1" label="여" variant="outlined" />
                                                        <Radio value="2" label="기타" variant="outlined" />
                                                    </RadioGroup>
                                                </FormControl>
                                            </Stack>
                                            <Stack direction='row' gap={5} sx={{ py: 2, justifyContent: 'space-between', px: 10 }}>
                                                <FormControl size="md" sx={{ flex: '1 1 auto' }}>
                                                    <FormLabel>생년월일</FormLabel>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                                                        <DatePicker 
                                                            value={dayjs(newPatient.noks[index].birthday)} 
                                                            onChange={(e) => {updateDeepValue(setNewPatient, ['noks', index, 'birthday'], dayjs(e).format('YYYY-MM-DD'))}}
                                                            orientation="portrait"
                                                            format="YYYY/MM/DD"
                                                            sx={{
                                                                backgroundColor: '#ffffff'
                                                            }}
                                                        />
                                                    </LocalizationProvider>
                                                </FormControl>
                                                <Stack direction='row' gap={1} sx={{ flex: '1 1 auto' }}>
                                                    <FormControl size="md" sx={{ justifyContent: 'flex-end', flex: '1 1 auto' }}>
                                                        <FormLabel>주민등록번호</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder="주민등록번호"
                                                            value={dayjs(newPatient.noks[index].birthday).format('YYMMDD')}
                                                            sx={{
                                                                backgroundColor: '#ffffff'
                                                            }}
                                                            disabled={true}
                                                        />
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(newPatient.noks[index].social_number) && submitted} sx={{ justifyContent: "flex-end", flex: '1 1 auto' }}>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={newPatient.noks[index].social_number}
                                                            onChange={(e) => updateDeepValue(setNewPatient, ['noks', index, 'social_number'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff'
                                                            }}
                                                        />
                                                        {!validationCheck(newPatient.noks[index].social_number) && submitted && 
                                                            <FormHelperText>
                                                                <InfoOutlined />
                                                                필수 입력란입니다.
                                                            </FormHelperText>                            
                                                        }   
                                                    </FormControl>
                                                </Stack>
                                            </Stack>
                                            <Stack direction='row' gap={1} sx={{ py: 2, justifyContent: 'space-between', px: 10 }}>
                                                <Stack direction='row' gap={2} sx={{ flex: '1 1 auto' }}>
                                                    <FormControl size="md" sx={{ justifyContent: 'flex-end', flex: '1 1 auto' }}>
                                                        <FormLabel>휴대폰번호</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={`010`}
                                                            sx={{
                                                                backgroundColor: '#ffffff'
                                                            }}
                                                            disabled={true}
                                                        />
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(newPatient.noks[index].tel[0]) && submitted} sx={{ justifyContent: "flex-end", flex: '1 1 auto' }}>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={newPatient.noks[index].tel[0]}
                                                            onChange={(e) => updateDeepValue(setNewPatient, ['noks', index, 'tel', 0], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff'
                                                            }}
                                                        />
                                                        {!validationCheck(newPatient.noks[index].tel[0]) && submitted && 
                                                            <FormHelperText>
                                                                <InfoOutlined />
                                                                필수 입력란입니다.
                                                            </FormHelperText>                            
                                                        }   
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(newPatient.noks[index].tel[1]) && submitted} sx={{ justifyContent: "flex-end", flex: '1 1 auto' }}>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={newPatient.noks[index].tel[1]}
                                                            onChange={(e) => updateDeepValue(setNewPatient, ['noks', index, 'tel', 1], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff'
                                                            }}
                                                        />
                                                        {!validationCheck(newPatient.noks[index].tel[1]) && submitted && 
                                                            <FormHelperText>
                                                                <InfoOutlined />
                                                                필수 입력란입니다.
                                                            </FormHelperText>                            
                                                        }   
                                                    </FormControl>
                                                </Stack>
                                            </Stack>
                                            <Stack direction='row' gap={1} sx={{ py: 2, justifyContent: 'space-between', px: 10 }}>
                                                <Stack gap={2} sx={{ flex: '1 1 auto' }}>                                                    
                                                    <Stack direction='row' gap={1}>
                                                        <FormControl size="md" sx={{ justifyContent: 'flex-end', flex: '1 1 auto' }}>
                                                            <FormLabel>주소 입력</FormLabel>
                                                            <Input
                                                                type="string"
                                                                placeholder="주소"
                                                                value={isSameAddress[index] ? newPatient.address : newPatient.noks[index].address}
                                                                sx={{
                                                                    backgroundColor: '#ffffff'
                                                                }}
                                                                disabled={true}
                                                            />
                                                        </FormControl>    
                                                        <FormControl size="md" error={!validationCheck(newPatient.noks[index].post_number) && submitted} sx={{ justifyContent: "flex-end" }}>
                                                            <Input
                                                                type="number"
                                                                placeholder="우편번호"
                                                                value={isSameAddress[index] ? newPatient.post_number : newPatient.noks[index].post_number}
                                                                onChange={(e) => updateDeepValue(setNewPatient, ['noks', index, 'post_number'], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff'
                                                                }}
                                                                disabled={true}
                                                            />
                                                            {!validationCheck(newPatient.noks[index].post_number) && submitted && 
                                                                <FormHelperText>
                                                                    <InfoOutlined />
                                                                    필수 입력란입니다.
                                                                </FormHelperText>                            
                                                            }   
                                                        </FormControl>
                                                        <FormControl sx={{ justifyContent: 'flex-end' }}>
                                                            <Button onClick={() => {setTargetNok(index); setAddressSearcherOpen(true)}}>
                                                                우편번호 찾기
                                                            </Button>
                                                        </FormControl>
                                                    </Stack> 
                                                    <Stack direction='row' gap={5}>
                                                        <FormControl size="md" error={!validationCheck(newPatient.noks[index].address_detail) && submitted} sx={{ justifyContent: "flex-end", flex: '1 1 auto' }}>
                                                            <Input
                                                                type="string"
                                                                placeholder="상세 주소"
                                                                value={isSameAddress ? newPatient.address_detail : newPatient.noks[index].address_detail}
                                                                onChange={(e) => updateDeepValue(setNewPatient, ['noks', index, 'address_detail'], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff'
                                                                }}
                                                                disabled={isSameAddress[index]}
                                                            />
                                                            {!validationCheck(newPatient.noks[index].address_detail) && submitted && 
                                                                <FormHelperText>
                                                                    <InfoOutlined />
                                                                    필수 입력란입니다.
                                                                </FormHelperText>                            
                                                            }   
                                                        </FormControl>
                                                        <FormControl size="md" sx={{ margin: 'auto 0' }}>                                                        
                                                            <FormLabel>환자와 동일</FormLabel>
                                                            <Switch
                                                                checked={isSameAddress[index]}
                                                                onChange={() => {
                                                                    if (!isSameAddress[index]) {
                                                                        updateDeepValue(setNewPatient, ['noks', index, 'address'], newPatient.address)
                                                                        updateDeepValue(setNewPatient, ['noks', index, 'address_detail'], newPatient.address_detail)
                                                                        updateDeepValue(setNewPatient, ['noks', index, 'post_number'], newPatient.post_number)
                                                                    }
                                                                    setIsSameAddress([...isSameAddress.slice(0, index), !isSameAddress[index], ...isSameAddress.slice(index+1)])                                                                    
                                                                }}
                                                            />
                                                        </FormControl>                                                    
                                                    </Stack>                                          
                                                    
                                                </Stack>
                                            </Stack> 
                                        </Stack>
                                        <IconButton onClick={() => {updateDeepValue(setNewPatient, ['noks'], [...newPatient.noks.slice(0, index), ...newPatient.noks.slice(index+1)]); setIsSameAddress([...isSameAddress.slice(0, index), ...isSameAddress.slice(index+1)])}}>
                                            <Delete />
                                        </IconButton>
                                    </Stack>
                                )
                            })}
                            <IconButton onClick={() => {updateDeepValue(setNewPatient, ['noks'], [...newPatient.noks, initialNok]); setIsSameAddress([...isSameAddress, false])}}>
                                <Add />
                            </IconButton>
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
                                    <FormLabel>비고</FormLabel>
                                    <Textarea
                                        minRows={1}
                                        placeholder="기타 사항"
                                        value={newPatient.memo}
                                        onChange={(e) => updateDeepValue(setNewPatient, ['memo'], e.target.value)}
                                        sx={{
                                            backgroundColor: '#ffffff'
                                        }}
                                    />
                                </FormControl>
                            </Stack>
                        </FormAccordionDetails>
                    </FormAccordion>                    
                </Box>
                <Button variant='soft' onClick={handleAddPatient} sx={{ mx: 'auto', mt: 'auto', width: '50%' }}>
                    {isNew ? "추가": "변경"}
                </Button>    
            </Sheet>
            <Modal open={addressSearcherOpen} onClose={() => setAddressSearcherOpen(false)} sx={{ left: 'var(--Sidebar-width)' }}>
                <ModalDialog>
                    <DialogTitle>
                        우편번호 검색
                    </DialogTitle>  
                    <Divider/>                
                    <DialogContent>
                        <DaumPostcodeEmbed onComplete={handlePostCode} style={{ width: 'calc(100vw - 2 * var(--Sidebar-width))' }}/>
                    </DialogContent>                    
                </ModalDialog>
            </Modal>
        </>
    )
}

export default PatientsTableAddModal

