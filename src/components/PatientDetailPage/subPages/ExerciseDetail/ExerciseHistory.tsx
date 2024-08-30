import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ExerciseHistoryAddModal } from ".";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { useLocalTokenValidation } from "../../../../api/commons/auth";
import { Box, Divider, Sheet, Typography, Stack, Tooltip } from "@mui/joy";
import { Delete, EditNote, PostAdd } from "@mui/icons-material";
import { Alert, TableMui, TooltippedIconButton } from "../../../commons";
import { HeadCell, ID } from "../../../commons/TableMui";
import dayjs from "dayjs";
import isLeapYear from 'dayjs/plugin/isLeapYear'
import utc from "dayjs/plugin/utc"
import 'dayjs/locale/ko'
import { prettyPrint } from "api/commons/utils";
import { BASE_BACKEND_URL } from "api/commons/request";

dayjs.extend(isLeapYear)
dayjs.extend(utc)
dayjs.locale('ko')

export interface Trial {
	therapist: string,
	exercise: string,
	amount: number | "",
	amount_type: string,
	sets: number | "",
	primary_class: string,
	secondary_class: string,
	tertiary_class: string
}

export interface Exercise {
	progressed: string,
	total_time_ms: string,
	trial_exercises: Trial[],
	memo: string,
} // MedicalRecord 객체 타입

const ExerciseHistory = ({ axiosMode }: { axiosMode: boolean }) => {
	const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수

	const headCells: HeadCell<Exercise & ID>[] = [
		{
			id: 'progressed',
			numeric: false,
			label: '시행 일자',
			sortable: true,
			parse: (value: (Exercise & ID)[keyof (Exercise & ID)]) => {
				return dayjs(value.toString()).format('YYYY년 MM월 DD일 HH시 mm분')
			}
		},
		{
			id: 'total_time_ms',
			numeric: true,
			label: '소요 시간',
			parse: (value: (Exercise & ID)[keyof (Exercise & ID)]) => {
				return `${value}분`
			}
		},
		{
			id: 'trial_exercises',
			numeric: false,
			label: '운동 목록',
			parse: (value: (Exercise & ID)[keyof (Exercise & ID)]) => {
				return (
					value ?
					<div style={{ display: 'flex', justifyContent: 'center' }}>
						<Tooltip 
							title={
								<Box className='scrollable vertical' sx={{ p: 1, height: '20vh' }}>
									<pre style={{ textAlign: 'left', display: 'inline-block', marginBottom: '0'}}>
										{prettyPrint(value)}
									</pre>
								</Box>                            
							}
						>
						<pre style={{ textAlign: 'left', display: 'inline-block', marginBottom: '0'}}>
							{prettyPrint(value).split('\n')[0]} ...
						</pre>
						</Tooltip>
					</div> : ""
				)
			}
		},
		{
			id: 'memo',
			numeric: false,
			label: '기타'
		}
	];

	const { patient_id } = useParams();
	const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `${BASE_BACKEND_URL}/api/patients/${patient_id}/medical/kinesitherapy`

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

	const [exerciseHistory, setExerciseHistory] = useState<(Exercise & ID)[]>([]);
	const [toggleEditor, setToggleEditor] = useState<boolean>(false)	
	const [selected, setSelected] = useState<number[]>([]);
	const [isNewExercise, setIsNewExercise] = useState(false) // 모달의 추가/편집 모드
	const [showDeletionAlert, setShowDeletionAlert] = useState<boolean>(false)

	const getExerciseHistory = useCallback(async () => {
		try {
			const response = await axios.get(
				url,
				config
			)

			setExerciseHistory(response.data);
		} catch (error) {
			console.error("진료 조회 중 오류 발생:", error);
		}
	}, [config, url])
	
	const postExerciseHistory = async (newExercise: Exercise, isNewExercise: boolean) => {
		try {
			isNewExercise || !exerciseHistory ? await axios.post(url, newExercise, config) : await axios.patch(`${url}/${exerciseHistory.filter((value) => {return value.id === selected[0]})[0].id}`, newExercise, config)
		  	console.log("진료 기록 추가 성공");
			getExerciseHistory();
		} catch (error) {
		  	console.error("진료 기록 추가 중 오류 발생:", error);
		}
	}

	const deleteExerciseHistory = async (targetExerciseIndex: number) => {
		if (exerciseHistory) {
			let targetId = exerciseHistory.filter((value) => {return value.id === targetExerciseIndex})[0].id
			console.log(`${url}/${targetId}`)
			try {
				await axios.delete(
					`${url}/${targetId}`,
					config
				)
				getExerciseHistory()
				setSelected([])
			} catch (error) {
				console.error("환자 삭제 중 오류 발생:", error)
			}
		}
	} // 환자 삭제

	useEffect(() => {
		if (axiosMode) getExerciseHistory();
	}, [getExerciseHistory, axiosMode]);

	useEffect(() => {
		let testMode = true
		if ((process.env.NODE_ENV !== 'development' || testMode) && axiosMode) checkAuth()
	  }, [checkAuth, axiosMode]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사

	return (
		<React.Fragment>
			<Box
				sx={{
					m: '1rem',
					display: 'flex',
					overflow: "hidden",
					flexWrap: 'nowrap',
				}}
			>
				<Sheet
					variant="outlined"
					sx={{
						position: 'relative',
						borderRadius: 'sm',
						p: 1,
						width: '100%',
						flexShrink: 0,
						left: toggleEditor ? "-100%" : 0,
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
							
						>운동치료 기록
						</Typography>
						<Stack direction='row'
							sx={{ transition: 'width 0.4s ease' }}
						>
							<TooltippedIconButton
								tooltipString="추가"
								onClick={() => {setIsNewExercise(true); setToggleEditor(true)}}
							>
								<PostAdd />
							</TooltippedIconButton>
							<TooltippedIconButton
								tooltipString="편집"
								onClick={() => {setIsNewExercise(false); setToggleEditor(true)}}
								disabled={selected.length !== 1}
							>
								<EditNote />
							</TooltippedIconButton>
							<TooltippedIconButton
								tooltipString="삭제"
								onClick={() => setShowDeletionAlert(true)}
								disabled={selected.length === 0}
							>
								<Delete />
							</TooltippedIconButton>							
						</Stack>
					</Box>
					<Divider component="div" sx={{ my: 1 }} />
					<Box sx={{
						flexDirection: 'column',
						justifyContent: 'center',
						p: '5px',
						overflow: 'auto',
						'&::-webkit-scrollbar': {
							display: 'none'
						}
					}}>
						<TableMui<Exercise & ID>
							headCells={headCells} 
							rows={exerciseHistory}
							defaultRowNumber={18}
							selected={selected}
							setSelected={setSelected}
						/>
					</Box>
				</Sheet>
				<ExerciseHistoryAddModal 
					show={toggleEditor} 
					isNew={isNewExercise} 
					selectedExercise={exerciseHistory ? exerciseHistory.filter((value) => {return value.id === selected[0]})[0] : null}
					handleClose={setToggleEditor} 
					addExercise={postExerciseHistory}
				></ExerciseHistoryAddModal>
			</Box>
			<Alert 
				showDeletionAlert={showDeletionAlert} 
				setShowDeletionAlert={setShowDeletionAlert} 
				deleteFunction={() => {
					selected.forEach((exerciseID) => {deleteExerciseHistory(exerciseID)}) 
					setShowDeletionAlert(false)
					setSelected([])
				}}
			/>
		</React.Fragment>
	)
}

export default ExerciseHistory
