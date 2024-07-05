import { useState, useEffect, useMemo, useCallback } from 'react'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import axios from 'axios'
import { useLocalTokenValidation } from '../../../../api/commons/auth'
import styles from './ExerciseHistoryAddModal.module.css'
import classNames from 'classnames/bind'
import { Exercise, Trial } from './ExerciseHistory'
import { useDateTimeParser } from '../../../../api/commons/dateTimeParse'

interface ExerciseHistoryAddModalProps {
    show: boolean, 
    isNew: boolean
    selectedExercise: Exercise | null,
    addFunction: (newExercise: Exercise, isNew: boolean) => void
    handleClose: () => void, 
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

const ExerciseHistoryAddModal = ({ show, isNew, selectedExercise, addFunction, handleClose }: ExerciseHistoryAddModalProps) => {
    const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수
    const dateParser = useDateTimeParser()
    const cx = classNames.bind(styles);

    const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

    const [progressedDate, setProgressedDate] = useState<string>(new Date().toLocaleDateString('en-CA'))
    const [totalTime, setTotalTime] = useState<string>("")
    
    const [trialExercises, setTrialExercises] = useState<Trial[]>([])
    const [userList, setUserList] = useState<User[]>([])
    const [memo, setMemo] = useState<string>("")

    const renderSelected = () => {
        if (!isNew && selectedExercise) {
            setProgressedDate(selectedExercise.progressed)
            setTotalTime(selectedExercise.total_time_ms)
            setTrialExercises(selectedExercise.trial_exercises)
            setMemo(selectedExercise.memo)
        }
    }

    const handleAddExerciseHistory = () => {
        console.log(
            isNew ? "add" : ("edit - " + selectedExercise?.progressed),
            "\nprogressedDate: " + progressedDate,
            "\ntotalTime: " + totalTime,
            "\nmemo: " + memo,
        )

        const newExercise: Exercise = {
            progressed: dateParser(new Date(progressedDate)),
            total_time_ms: totalTime,
            trial_exercises: trialExercises,
            memo: memo,
        }

        addFunction(newExercise, isNew)
        handleClose()
    }

    const getAllUsers = useCallback(async () => {
		try {
			const response = await axios.get(
				`/api/users`,
				config
			)
			setUserList(response.data)
		} catch (error) {
			console.error("환자 조회 중 오류 발생:", error)
		}
	}, [config]) // 전체 환자 목록 가져오기


    useEffect(() => { getAllUsers() }, [ getAllUsers ])

    useEffect(() => {
		let testMode = true
		if (process.env.NODE_ENV !== 'development' || testMode) checkAuth()
	}, [checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사

    return (
        <Modal show={show} onShow={renderSelected} onHide={handleClose} size='xl'>
            <Modal.Header style={{paddingLeft: "20px", paddingRight: "40px"}} closeButton>
            <Modal.Title>
                <span className={cx("title")}>
                    <strong>운동 치료 기록 {isNew ? "추가" : "편집"}</strong>
                </span></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className={cx("contents")}>
                    <div className={cx("page-title")}>
                        <span>기본 사항</span>
                    </div>
                    <div className={cx("page-content")}>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-content")}>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")} ${cx("large")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>치료 일시</InputGroup.Text>
                                            <Form.Control
                                                type="date"
                                                placeholder="치료 일시"
                                                value={progressedDate}
                                                onChange={(e) => setProgressedDate(e.target.value)}
                                            >
                                            </Form.Control>
                                        </InputGroup>
                                    </div>
                                </div>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")} ${cx("large")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>총 치료 시간 (분)</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder="총 치료 시간"
                                                value={totalTime}
                                                onChange={(e) => setTotalTime(e.target.value)}
                                            >
                                            </Form.Control>
                                        </InputGroup>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={cx("page-title")} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>시행 운동 정보</span>
                        <Button variant="secondary" onClick={() => setTrialExercises([...trialExercises, {primary_class: "upper extremity", secondary_class: "upper_limb", tertiary_class: "hand/wrist", exercise: "mobility", amount_type: "초"}])}>추가</Button>
                    </div>
                    {trialExercises.map((exercise, index) => {
                        return (
                            <div className={cx("page-content")} key={index} style={{ display: 'flex', borderBottom: '1px solid gray', paddingBottom: '10px' }}>
                                <div className={cx("group-field")} style={{ marginBottom: '0px', height: 'auto' }}> 
                                    <div className={cx("group-content")}>
                                        <div className={cx("inline")}>
                                            <div className={`${cx("cell")} ${cx("large")}`}>
                                                <InputGroup>
                                                    <InputGroup.Text>담당 의사</InputGroup.Text>
                                                    <Form.Select
                                                        value={exercise.therapist ?? ""}
                                                        onChange={(e) => setTrialExercises([
                                                            ...trialExercises.slice(0, index), 
                                                            {...exercise, therapist: e.target.value}, 
                                                            ...trialExercises.slice(index+1)])}
                                                    >
                                                        {userList.map((user) => {
                                                            return (
                                                                <option key={user.id} value={user.id}>{`${user.position} ${user.last_name}${user.first_name}`}</option>
                                                            )
                                                        })}
                                                    </Form.Select>
                                                </InputGroup>
                                            </div>
                                        </div>
                                        <div className={cx("inline")}>
                                            <div className={`${cx("cell")}`}>
                                                <InputGroup>
                                                    <InputGroup.Text>1단계 분류</InputGroup.Text>
                                                    <Form.Select
                                                        value={exercise.primary_class ?? ""}
                                                        onChange={(e) => {
                                                            let initialSecondary = Object.keys(exerciseClassifier[e.target.value])[0]
                                                            setTrialExercises([
                                                                ...trialExercises.slice(0, index), 
                                                                {
                                                                    ...exercise, 
                                                                    primary_class: e.target.value,
                                                                    secondary_class: initialSecondary,
                                                                    tertiary_class: Object.keys(exerciseClassifier[e.target.value][initialSecondary])[0]
                                                                }, 
                                                                ...trialExercises.slice(index+1)
                                                            ])
                                                        }}
                                                    >
                                                        {Object.keys(exerciseClassifier).map((part, index) => {
                                                            return (
                                                                <option key={index} value={part}>{`${part}`}</option>
                                                            )
                                                        })}
                                                    </Form.Select>
                                                </InputGroup>
                                            </div>
                                            <div className={`${cx("cell")}`}>
                                            <InputGroup>
                                                    <InputGroup.Text>2단계 분류</InputGroup.Text>
                                                    <Form.Select
                                                        value={exercise.secondary_class ?? ""}
                                                        onChange={(e) => setTrialExercises([
                                                            ...trialExercises.slice(0, index), 
                                                            {
                                                                ...exercise, 
                                                                secondary_class: e.target.value,
                                                                tertiary_class: Object.keys(exerciseClassifier[exercise.primary_class ?? ""][e.target.value])[0]
                                                            }, 
                                                            ...trialExercises.slice(index+1)])}
                                                    >
                                                        {Object.keys(exerciseClassifier[exercise.primary_class ?? ""]).map((part, index) => {
                                                            return (
                                                                <option key={index} value={part}>{`${part}`}</option>
                                                                
                                                            )
                                                        })}
                                                    </Form.Select>
                                                </InputGroup>
                                            </div>
                                        </div>
                                        <div className={cx("inline")}>
                                            <div className={`${cx("cell")}`}>
                                                <InputGroup>
                                                    <InputGroup.Text>3단계 분류</InputGroup.Text>
                                                    <Form.Select
                                                        value={exercise.tertiary_class ?? ""}
                                                        onChange={(e) => setTrialExercises([
                                                            ...trialExercises.slice(0, index), 
                                                            {...exercise, tertiary_class: e.target.value}, 
                                                            ...trialExercises.slice(index+1)])}
                                                        disabled={exerciseClassifier[exercise.primary_class ?? ""][exercise.secondary_class ?? ""].length === 0}
                                                    >   
                                                        {exerciseClassifier[exercise.primary_class ?? ""][exercise.secondary_class ?? ""].map((part, index) => {
                                                            return (
                                                                <option key={index} value={part}>{`${part}`}</option>
                                                            )
                                                        })}
                                                    </Form.Select>
                                                </InputGroup>
                                            </div>
                                            <div className={`${cx("cell")}`}>
                                                <InputGroup>
                                                    <InputGroup.Text>운동 이름</InputGroup.Text>
                                                    <Form.Select
                                                        value={exercise.exercise ?? ""}
                                                        onChange={(e) => setTrialExercises([
                                                            ...trialExercises.slice(0, index), 
                                                            {...exercise, exercise: e.target.value}, 
                                                            ...trialExercises.slice(index+1)])}
                                                    >
                                                        {exerciseName.map((part, index) => {
                                                            return (
                                                                <option key={index} value={part}>{`${part}`}</option>
                                                            )
                                                        })}
                                                    </Form.Select>
                                                </InputGroup>
                                            </div>
                                        </div>
                                        <div className={cx("inline")}>
                                            <div className={`${cx("cell")}  ${cx("small")}`}>
                                                <InputGroup>
                                                    <InputGroup.Text>세트 당</InputGroup.Text>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="수치"
                                                        value={exercise.amount ?? ""}
                                                        onChange={(e) => setTrialExercises([
                                                            ...trialExercises.slice(0, index), 
                                                            {...exercise, amount: +e.target.value}, 
                                                            ...trialExercises.slice(index+1)])}
                                                    >
                                                    </Form.Control>
                                                    <Form.Select
                                                        value={exercise.amount_type ?? "초"}
                                                        onChange={(e) => setTrialExercises([
                                                            ...trialExercises.slice(0, index), 
                                                            {...exercise, amount_type: e.target.value}, 
                                                            ...trialExercises.slice(index+1)])}
                                                    >
                                                        {trialAmountType.map((part, index) => {
                                                            return (
                                                                <option key={index} value={part}>{`${part}`}</option>
                                                            )
                                                        })}
                                                    </Form.Select>
                                                </InputGroup>
                                            </div>
                                            <div className={`${cx("cell")} ${cx("small")}`}>
                                                <InputGroup>
                                                    <InputGroup.Text>시행 세트</InputGroup.Text>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder={"세트"}
                                                        value={exercise.sets ?? ""}
                                                        onChange={(e) => setTrialExercises([
                                                            ...trialExercises.slice(0, index), 
                                                            {...exercise, sets: +e.target.value}, 
                                                            ...trialExercises.slice(index+1)])}
                                                    >
                                                    </Form.Control>
                                                </InputGroup>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="secondary" onClick={(e) => setTrialExercises([...trialExercises.slice(0, index), ...trialExercises.slice(index+1)])}>-</Button>
                            </div>
                        )
                    })}
                    <div className={cx("page-title")} style={{ marginTop: '20px' }}>
                        <span>치료사 소견</span>
                    </div>
                    <div className={cx("page-content")}>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-content")}>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>메모</InputGroup.Text>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={memo}
                                                onChange={(e) => setMemo(e.target.value)}
                                            >
                                            </Form.Control>
                                        </InputGroup>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className={cx("inline-btn")}>
                    <Button variant="primary" onClick={handleAddExerciseHistory}>
                        {isNew ? "추가": "변경"}
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                        취소
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    )
}

export default ExerciseHistoryAddModal
