import React, { useState, useEffect, useMemo, useCallback } from 'react'
import axios from 'axios'
import { useLocalTokenValidation } from 'api/commons/auth'
import { Exercise, Trial } from './ExerciseHistory'
import { ID } from 'components/commons/TableMui'
import { Box, Divider, FormControl, FormLabel, IconButton, Sheet, Stack, Textarea, Typography, Button, Input, FormHelperText, Select, Option } from '@mui/joy'
import { Add, Close, Delete, InfoOutlined } from '@mui/icons-material'
import { FormAccordion, FormAccordionDetails, FormAccordionHeader, FormAccordionSummary } from '../InspectionHistory/CustomTheme'
import { DateTimePicker, LocalizationProvider, renderTimeViewClock } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { validationCheck } from 'api/commons/utils'
import { BASE_BACKEND_URL } from 'api/commons/request'

interface ExerciseHistoryAddModalProps {
    show: boolean, 
    isNew: boolean
    selectedExercise: Exercise & ID | null,
    addExercise: (newExercise: Exercise, isNew: boolean) => void
    handleClose: React.Dispatch<React.SetStateAction<boolean>>, 
}

const exerciseClassifier: {
    [string: string]: {[string: string]: string[]}
} = {
    "upper extremity": {
        "upper_limb": ["hand/wrist", "forearm", "elbow", "humerus", "shoulder", "shoulder gridle"]
    },
    "lower extremity": {
        "lower_limb": ["pelvic", "hip joint", "thigh", "knee", "foot/ankle"]
    },
    "spine": {
        "cervical": ["upper cervical", "lower cervical"],
        "thoracic": ["upper thoracic", "lower thoracic", "rib"],
        "lumbar": [],
        "scoliosis": ["T-type", "L-type"],
        "성장": [],
        "자세": []
    }
}

const exerciseName: string[] = ["mobility", "stability", "strengthening", "co-work", "coordination", " balance", "manual", "core", "rehabilitation", "schroth", "기타 (직접 작성)"]

const trialAmountType: string[] = ["초", "횟수"] 

interface User {
    id: number,
    email: string,
    first_name: string,
    last_name: string,
    position: string,
    sex: number,
    phone_number: string,
    department: string
}

const initialTrial: Trial = {
	therapist: "",
	exercise: "",
	amount: "",
	amount_type: "",
	sets: "",
	primary_class: "",
	secondary_class: "",
	tertiary_class: ""
}

const ExerciseHistoryAddModal = ({ show, isNew, selectedExercise, addExercise, handleClose }: ExerciseHistoryAddModalProps) => {
    const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수

    const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

    const [progressedDate, setProgressedDate] = useState<dayjs.Dayjs>(dayjs())
    const [totalTime, setTotalTime] = useState<string>("")
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [trialExercises, setTrialExercises] = useState<Trial[]>([])
    const [userList, setUserList] = useState<User[]>([])
    const [memo, setMemo] = useState<string>("")

    const handleAddExerciseHistory = () => {

        setSubmitted(true)


        console.log(
            isNew ? "add" : ("edit - " + selectedExercise?.progressed),
            "\nprogressedDate: " + progressedDate,
            "\ntotalTime: " + totalTime,
            "\nmemo: " + memo,
        )

        const newExercise: Exercise = {
            progressed: progressedDate.format(),
            total_time_ms: totalTime,
            trial_exercises: trialExercises,
            memo: memo,
        }

        addExercise(newExercise, isNew)
        handleClose(false)
    }

    const getAllUsers = useCallback(async () => {
		try {
			const response = await axios.get(
				`${BASE_BACKEND_URL}/api/users`,
				config
			)
			setUserList(response.data)
		} catch (error) {
			console.error("의사 목록 조회 중 오류 발생:", error)
		}
	}, [config]) // 전체 의사 목록 가져오기


    useEffect(() => { getAllUsers() }, [ getAllUsers ])

    useEffect(() => {
		let testMode = true
		if (process.env.NODE_ENV !== 'development' || testMode) checkAuth()
	}, [checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사

    useEffect(() => {
        if (!isNew && selectedExercise) {
            setProgressedDate(dayjs(selectedExercise.progressed))
            setTotalTime(selectedExercise.total_time_ms)
            setTrialExercises(selectedExercise.trial_exercises)
            setMemo(selectedExercise.memo)
        }
        else {
            setProgressedDate(dayjs())
            setTotalTime("")
            setTrialExercises([])
            setMemo("")
        }
    }, [isNew, selectedExercise])

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
                    >운동치료 기록 {isNew ? "추가" : "편집"}
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
                        <FormAccordionHeader>운동치료 항목</FormAccordionHeader>
                    </FormAccordionSummary>
                    <FormAccordionDetails>
                        <Stack direction='column' gap={2} sx={{ 
                            justifyContent: 'space-between',
                            p: '0px 5px',
                            alignItems: 'middle'
                        }}>
                            <FormControl size="md" error={!validationCheck(totalTime) && submitted}>
                                <FormLabel>총 치료 시간 (분)</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="검사 강도"
                                    value={totalTime}
                                    onChange={(e) => setTotalTime(e.target.value)}
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                                {!validationCheck(totalTime) && submitted && 
                                    <FormHelperText>
                                        <InfoOutlined />
                                        필수 입력란입니다.
                                    </FormHelperText>                            
                                }                           
                            </FormControl>
                            <Divider></Divider>
                            {trialExercises.map((exercise, index) => {
                                return (
                                    <React.Fragment key={index}>
                                        <Stack direction='row' gap={2} sx={{ px: 5, justifyContent: 'space-between'}}>
                                            <Stack gap={2} sx={{ flex: '1 1 auto' }}>
                                                <Stack direction='row' gap={2} sx={{ pr: 5, justifyContent: 'space-between' }}>
                                                    <FormControl size="md" error={!validationCheck(exercise.therapist) && submitted} sx={{ flex: '1 1 0' }}>
                                                        <FormLabel>담당 의사</FormLabel>
                                                        <Select
                                                            size="md"
                                                            placeholder="진단 선택"
                                                            value={+exercise.therapist}
                                                            onChange={(_, value) => setTrialExercises([
                                                                ...trialExercises.slice(0, index), 
                                                                {...exercise, therapist: value?.toString() ?? ""}, 
                                                                ...trialExercises.slice(index+1)])}
                                                            sx={{
                                                                backgroundColor: '#ffffff'
                                                            }}
                                                        >
                                                            {userList.map((user) => {
                                                                return (
                                                                    <Option key={user.id} value={user.id}>{`${user.position} ${user.last_name}${user.first_name}`}</Option>
                                                                )
                                                            })}
                                                        </Select>
                                                        {!validationCheck(exercise.therapist) && submitted && 
                                                            <FormHelperText>
                                                                <InfoOutlined />
                                                                필수 입력란입니다.
                                                            </FormHelperText>                            
                                                        }                           
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(exercise.primary_class) && submitted} sx={{ flex: '1 1 0' }}>
                                                        <FormLabel>1단계 분류</FormLabel>
                                                        <Select
                                                            size="md"
                                                            placeholder="진단 선택"
                                                            value={exercise.primary_class}
                                                            onChange={(_, value) => {
                                                                if (value === null) return
                                                                setTrialExercises([
                                                                    ...trialExercises.slice(0, index), 
                                                                    {...exercise, primary_class: value}, 
                                                                    ...trialExercises.slice(index+1)
                                                                ])
                                                            }}
                                                        >
                                                            {Object.keys(exerciseClassifier).map((part, index) => {
                                                                return (
                                                                    <Option key={index} value={part}>{`${part}`}</Option>
                                                                )
                                                            })}
                                                        </Select>
                                                        {!validationCheck(exercise.primary_class) && submitted && 
                                                            <FormHelperText>
                                                                <InfoOutlined />
                                                                필수 입력란입니다.
                                                            </FormHelperText>                     
                                                        }                           
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(exercise.secondary_class) && submitted} sx={{ flex: '1 1 0' }}>
                                                        <FormLabel>2단계 분류</FormLabel>
                                                        <Select
                                                            size="md"
                                                            placeholder="진단 선택"
                                                            value={exercise.secondary_class}
                                                            onChange={(_, value) => {
                                                                if (value === null) return
                                                                setTrialExercises([
                                                                    ...trialExercises.slice(0, index), 
                                                                    {...exercise, secondary_class: value}, 
                                                                    ...trialExercises.slice(index+1)
                                                                ])
                                                            }}
                                                            disabled={exercise.primary_class === ""}
                                                        >
                                                            {exercise.primary_class !== "" && Object.keys(exerciseClassifier[exercise.primary_class]).map((part, index) => {
                                                                return (
                                                                    <Option key={index} value={part}>{`${part}`}</Option>
                                                                )
                                                            })}
                                                        </Select>
                                                        {!validationCheck(exercise.secondary_class) && submitted && 
                                                            <FormHelperText>
                                                                <InfoOutlined />
                                                                필수 입력란입니다.
                                                            </FormHelperText>                            
                                                        }                           
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(exercise.tertiary_class) && submitted} sx={{ flex: '1 1 0' }}>
                                                        <FormLabel>3단계 분류</FormLabel>
                                                        <Select
                                                            size="md"
                                                            placeholder="진단 선택"
                                                            value={exercise.tertiary_class}
                                                            onChange={(_, value) => {                                                    
                                                                if (value === null) return
                                                                setTrialExercises([
                                                                    ...trialExercises.slice(0, index), 
                                                                    {...exercise, tertiary_class: value}, 
                                                                    ...trialExercises.slice(index+1)
                                                                ])
                                                            }}
                                                            disabled={exercise.primary_class === "" || exercise.secondary_class === "" || exerciseClassifier[exercise.primary_class][exercise.secondary_class].length === 0}
                                                        >
                                                            {(exercise.primary_class !== "" && exercise.secondary_class !== "" && exerciseClassifier[exercise.primary_class][exercise.secondary_class]) && exerciseClassifier[exercise.primary_class][exercise.secondary_class].map((part, index) => {
                                                                return (
                                                                    <Option key={index} value={part}>{`${part}`}</Option>
                                                                )
                                                            })}
                                                        </Select>
                                                        {!validationCheck(exercise.tertiary_class) && submitted && 
                                                            <FormHelperText>
                                                                <InfoOutlined />
                                                                필수 입력란입니다.
                                                            </FormHelperText>                            
                                                        }                           
                                                    </FormControl>
                                                </Stack>
                                                <Stack direction='row' gap={2} sx={{ pr: 5, justifyContent: 'space-between'}}>
                                                    <FormControl size="md" error={!validationCheck(exercise.exercise) && submitted} sx={{ flex: '1 1 0' }}>
                                                        <FormLabel>운동 이름</FormLabel>
                                                        <Select
                                                            size="md"
                                                            placeholder="진단 선택"
                                                            value={exercise.exercise}
                                                            onChange={(_, value) => {
                                                                if (value === null) return
                                                                setTrialExercises([
                                                                    ...trialExercises.slice(0, index), 
                                                                    {...exercise, exercise: value}, 
                                                                    ...trialExercises.slice(index+1)
                                                                ])
                                                            }}
                                                        >
                                                            {exerciseName.map((part, index) => {
                                                                return (
                                                                    <Option key={index} value={part}>{`${part}`}</Option>
                                                                )
                                                            })}
                                                        </Select>
                                                        {!validationCheck(exercise.exercise) && submitted && 
                                                            <FormHelperText>
                                                                <InfoOutlined />
                                                                필수 입력란입니다.
                                                            </FormHelperText>                            
                                                        }                           
                                                    </FormControl>                                        
                                                    <FormControl size="md" error={!validationCheck(exercise.amount) && submitted} sx={{ flex: '1 1 0' }}>
                                                        <FormLabel>세트 당 시간/횟수</FormLabel>
                                                        <Input
                                                            type='number'
                                                            size="md"
                                                            placeholder="값"
                                                            value={exercise.amount}
                                                            onChange={(e) => {
                                                                setTrialExercises([
                                                                    ...trialExercises.slice(0, index), 
                                                                    {...exercise, amount: +e.target.value}, 
                                                                    ...trialExercises.slice(index+1)
                                                                ])
                                                            }}
                                                        />
                                                        {!validationCheck(exercise.amount) && submitted && 
                                                            <FormHelperText>
                                                                <InfoOutlined />
                                                                필수 입력란입니다.
                                                            </FormHelperText>                            
                                                        }                           
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(exercise.amount_type) && submitted} sx={{ flexDirection: 'column-reverse', flex: '1 1 0' }}>
                                                        <Select
                                                            size="md"
                                                            placeholder="단위"
                                                            value={exercise.amount_type}
                                                            onChange={(_, value) => {
                                                                if (value === null) return
                                                                setTrialExercises([
                                                                    ...trialExercises.slice(0, index), 
                                                                    {...exercise, amount_type: value}, 
                                                                    ...trialExercises.slice(index+1)
                                                                ])
                                                            }}
                                                        >
                                                            {trialAmountType.map((part, index) => {
                                                                return (
                                                                    <Option key={index} value={part}>{`${part}`}</Option>
                                                                )
                                                            })}
                                                        </Select>
                                                        {!validationCheck(exercise.amount_type) && submitted && 
                                                            <FormHelperText>
                                                                <InfoOutlined />
                                                                필수 입력란입니다.
                                                            </FormHelperText>                            
                                                        }                           
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(exercise.sets) && submitted} sx={{ flex: '1 1 0' }}>
                                                        <FormLabel>시행 세트</FormLabel>
                                                        <Input
                                                            type='number'
                                                            size="md"
                                                            placeholder="값"
                                                            value={exercise.sets}
                                                            onChange={(e) => {
                                                                setTrialExercises([
                                                                    ...trialExercises.slice(0, index), 
                                                                    {...exercise, sets: +e.target.value}, 
                                                                    ...trialExercises.slice(index+1)
                                                                ])
                                                            }}
                                                        />
                                                        {!validationCheck(exercise.sets) && submitted && 
                                                            <FormHelperText>
                                                                <InfoOutlined />
                                                                필수 입력란입니다.
                                                            </FormHelperText>                            
                                                        }                           
                                                    </FormControl>   
                                                </Stack>
                                            </Stack>
                                            <IconButton onClick={(e) => setTrialExercises([...trialExercises.slice(0, index), ...trialExercises.slice(index+1)])}>
                                                <Delete/>
                                            </IconButton>
                                        </Stack>
                                        <Divider/>
                                    </React.Fragment>
                                )
                            })}                            
                        </Stack>
                        <IconButton onClick={() => setTrialExercises([...trialExercises, initialTrial])}> 
                            <Add/> 
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
                            <FormLabel>진료일자</FormLabel>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                                <DateTimePicker 
                                    value={dayjs(progressedDate)} 
                                    onChange={(e) => {setProgressedDate(dayjs(e))}}
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
            <Divider component="div" sx={{ my: 1 }} />
            <Button variant='soft' onClick={handleAddExerciseHistory} sx={{ margin: 'auto', width: '50%' }}>
                {isNew ? "추가": "변경"}
            </Button>
        </Sheet>
    )
}

export default ExerciseHistoryAddModal
