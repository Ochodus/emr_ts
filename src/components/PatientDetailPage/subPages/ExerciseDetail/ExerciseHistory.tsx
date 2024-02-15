import { useState, useEffect, useMemo, useCallback } from "react";
import { Table } from "../../../commons/Table";
import { Card, Button } from "react-bootstrap";
import { TableHeader } from "../../../commons/Table"
import { ExerciseHistoryAddModal } from ".";
import { ReactComponent as AddIcon } from '../../../../assets/add_icon.svg';
import { useParams } from 'react-router-dom';
import axios from "axios";
import { useLocalTokenValidation } from "../../../../api/commons/auth";
import styles from './ExerciseHistory.module.css';
import classNames from 'classnames/bind';

export interface Trial {
	therapist: string,
	exercise: string,
	time: string,
	sets: number,
	count_per_set: number
}

export interface Exercise {
	progressed: string,
	total_time: string,
	trial_exercises: Trial[],
	memo: string,
} // MedicalRecord 객체 타입

const ExerciseHistory = ({ isSummaryMode, axiosMode }: { isSummaryMode: boolean, axiosMode: boolean }) => {
	const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수
	const cx = classNames.bind(styles)

	const headers: TableHeader = [
		{ 
			Header: "시행 날짜",
			accessor: "progressed",
			Cell: ({ row }) => {
				let dateArray = row.original.progressed?.split(/[TZ]/)[0].split('-')
				let timeArray = row.original.progressed?.split(/[TZ]/)[1].split(':')
				return (
					<div>
						{`${dateArray[0]}년 ${dateArray[1]}월 ${dateArray[2]}일  ${timeArray[0]}시 ${timeArray[1]}분`}
					</div>
				)
			},
			width: 40
		},
		{ 
			Header: "운동 종류",
			accessor: "exercise",
			Cell: ({ row }) => (
				<div>
					{row.original.trial_exercises[0].therapist}
				</div>
			),
			width: 40
		},
		{ 
			Header: "상세 내역",
			accessor: "details",
			Cell: ({ row }) => (
				<div>
				</div>
			),
			width: 40
		},
		{ 
			Header: "시행 시간",
			accessor: "time",
			Cell: ({ row }) => (
				<div>
					{ row.original.trial_exercises[0].time }
				</div>
			),
			width: 40
		},
		{ 
			Header: "시행 횟수",
			accessor: "count",
			Cell: ({ row }) => (
				<div>
					{ row.original.trial_exercises.length }
				</div>
			),
			width: 40
		},
		{ 
			Header: "비고",
			accessor: "memo",
			width: 40
		},
		{
			Header: "수정 및 삭제",
			accessor: "edit",
			Cell: ({ row }) => (
				<div className={cx('editing-buttons')}>
					<Button className={cx('cell-button')} onClick={() => handleModalOpen(false, row.index)}>수정</Button>
					<Button className={cx('cell-button')} onClick={() => deleteExerciseHistory(row.index)}>삭제</Button>
				</div>
			),
			width: 100
		},
	];

	const { patient_id } = useParams();
	const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `/api/patients/${patient_id}/medical/kinesitherapy`

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

	const [exerciseHistory, setExerciseHistory] = useState<(Exercise & {id: number})[]>([]);

	const [isModalVisible, setIsModalVisible] = useState(false) // 환자 추가/편집 모달 표시 여부
	const [isNewExercise, setIsNewExercise] = useState(false) // 모달의 추가/편집 모드
	const [targetExerciseIndex, setTargetExerciseIndex] = useState<number>(-1) // 수정 및 삭제에 사용되는 타깃 환자 인덱스 (로컬 데이터 기준 인덱스 / 환자 고유 아이디와 다름)

	const getExerciseHistory = useCallback(async () => {
		try {
			const response = await axios.get(
				url,
				config
			)
		 
			console.log(response.data);
			setExerciseHistory(response.data);
		} catch (error) {
			console.error("진료 조회 중 오류 발생:", error);
		}
	}, [config])
	
	const postExerciseHistory = async (newExercise: Exercise, isNewExercise: boolean) => {
		try {
			isNewExercise || !exerciseHistory ? await axios.post(url, newExercise, config) : await axios.patch(`${url}/${exerciseHistory[targetExerciseIndex].id}`, newExercise, config)
		  	console.log("진료 기록 추가 성공");
			getExerciseHistory();
		} catch (error) {
		  	console.error("진료 기록 추가 중 오류 발생:", error);
		}
	}

	const deleteExerciseHistory = async (targetExerciseIndex: number) => {
		if (exerciseHistory) {
			let targetId = exerciseHistory[targetExerciseIndex].id
			console.log(`${url}/${targetId}`)
			try {
				await axios.delete(
					`${url}/${targetId}`,
					config
				)
				getExerciseHistory()
			} catch (error) {
				console.error("환자 삭제 중 오류 발생:", error)
			}
		}
	} // 환자 삭제

	const handleModalOpen = (isNewRecord: boolean, targetRecordIndex: number) => {
		setIsNewExercise(isNewRecord)
		setTargetExerciseIndex(targetRecordIndex)
		setIsModalVisible(true)
	} // 모달 띄우기

	const handleModalClose = () => setIsModalVisible(false) // 모달 닫기

	useEffect(() => {
		if (axiosMode) getExerciseHistory();
	}, [getExerciseHistory]);

	useEffect(() => {
		let testMode = true
		if ((process.env.NODE_ENV !== 'development' || testMode) && axiosMode) checkAuth()
	  }, [checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사

	return (
		<div>
			{ !isSummaryMode ?
			<div className={cx("section_wrap")}>
				<Card className={cx("field-table")}>
					<Card.Header style={{ display: "flex" }}>
						<div className={cx("col-inline")}>
							<span style={{ fontSize: "30px", paddingLeft: "10px" }}>
								<strong>진료 기록</strong>
							</span>
						</div>
						<div className={`${cx("col-inline")} ${cx("col-inline-right")}`}>
							<div className={cx("button-group")} onClick={() => handleModalOpen(true, -1)}>
								<AddIcon fill="#454545" className={cx("button-add")}/>
							</div>
						</div>
					</Card.Header>
					<Card.Body>
						<div className={cx("section")}>
							<div className={cx("section-body")}>
								<Table 
									headers={headers} 
									items={exerciseHistory} 
									useSelector={true}
									table_width="calc(100% - 20px)"
								/>
							</div>
						</div>
					</Card.Body>
				</Card>
				<ExerciseHistoryAddModal 
					show={isModalVisible} 
					handleClose={handleModalClose} 
					isNew={isNewExercise} 
					selectedExercise={exerciseHistory ? exerciseHistory[targetExerciseIndex] : null}
					addFunction={postExerciseHistory}
				></ExerciseHistoryAddModal>
			</div> :
			<div className={cx("section-body")}>
				<Table 
					headers={headers} 
					items={exerciseHistory} 
					useSelector={true}
					table_width="calc(100% - 20px)"
				/>
			</div>
			}
		</div>
	)
}

export default ExerciseHistory
