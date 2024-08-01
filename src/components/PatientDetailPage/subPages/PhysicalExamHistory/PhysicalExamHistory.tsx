import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PhysicalExamHistoryAddModal } from ".";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { useLocalTokenValidation } from "../../../../api/commons/auth";
import { PhysicalExam } from "../../../../interfaces";
import { Box, Divider, IconButton, Sheet, Stack, Typography } from "@mui/joy";
import { Delete, EditNote, PostAdd } from "@mui/icons-material";
import { Alert, TableMui } from "../../../commons";
import { HeadCell, ID } from "../../../commons/TableMui";
import isLeapYear from 'dayjs/plugin/isLeapYear'
import utc from "dayjs/plugin/utc"
import 'dayjs/locale/ko'
import dayjs from "dayjs";
import { BASE_BACKEND_URL } from "api/commons/request";

dayjs.extend(isLeapYear)
dayjs.extend(utc)
dayjs.locale('ko')

const PhysicalExamHistory = ({ axiosMode, renewPatient }: { axiosMode: boolean, renewPatient: () => Promise<void> }) => {
	const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수

	const headCells: HeadCell<PhysicalExam & ID>[] = [
		{
			id: 'recorded',
			numeric: false,
			label: '시행 일자',
			parse: (value: (PhysicalExam & ID)[keyof (PhysicalExam & ID)]) => {
				return dayjs(value.toString()).format('YYYY년 MM월 DD일 HH시 mm분')
			}
		},
		{
			id: 'height',
			numeric: true,
			label: '키',
			parse: (value: (PhysicalExam & ID)[keyof (PhysicalExam & ID)]) => {
				return `${value}cm`
			}
		},
		{
			id: 'weight',
			numeric: false,
			label: '몸무게',
			parse: (value: (PhysicalExam & ID)[keyof (PhysicalExam & ID)]) => {
				return `${value}kg`
			}
		},
		{
			id: ['diastolic_blood_pressure', 'systolic_blood_pressure'],
			numeric: false,
			label: '혈압',
			parse: (value: (PhysicalExam)[keyof (PhysicalExam)][]) => {
				return `${value[0]} ~ ${value[1]}`
			}
		},
		{
			id: 'body_temperature',
			numeric: false,
			label: '체온',
			parse: (value: (PhysicalExam & ID)[keyof (PhysicalExam & ID)]) => {
				return `${value}°C`
			}
		}
	];

	const { patient_id } = useParams();
	const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `${BASE_BACKEND_URL}/api/patients/${patient_id}/medical/physical_exam`

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

	const [physicalExam, setPhysicalExam] = useState<(PhysicalExam & ID)[]>([]);
	const [selected, setSelected] = useState<number[]>([]);
	const [isNewPhysicalExam, setIsNewPhysicalExam] = useState<boolean>(false) // 수정 및 삭제에 사용되는 타깃 환자 인덱스 (로컬 데이터 기준 인덱스 / 환자 고유 아이디와 다름)
	const [toggleEditor, setToggleEditor] = useState(false)
	const [showDeletionAlert, setShowDeletionAlert] = useState<boolean>(false)

	const getPhysicalExam = useCallback(async () => {
		try {
			const response = await axios.get(
				url,
				config
			)
			setPhysicalExam(response.data);
		} catch (error) {
			console.error("진료 조회 중 오류 발생:", error);
		}
	}, [config, url])
	
	const postPhysicalExam = async (newPhysicalExam: PhysicalExam, isNewPhysicalExam: boolean) => {
		try {
			isNewPhysicalExam || !physicalExam ? await axios.post(url, newPhysicalExam, config) : await axios.patch(`${url}/${physicalExam.filter((value) => {return value.id === selected[0]})[0].id}`, newPhysicalExam, config)
		  	console.log("진료 기록 추가 성공");
			getPhysicalExam();
			renewPatient()
		} catch (error) {
		  	console.error("진료 기록 추가 중 오류 발생:", error);
		}
	}

	const deletePhysicalExamHistory = async (targetPhysicalExamIndex: number) => {
		if (physicalExam) {
			let targetId = physicalExam.filter((value) => {return value.id === targetPhysicalExamIndex})[0].id
			console.log(`${url}/${targetId}`)
			try {
				await axios.delete(
					`${url}/${targetId}`,
					config
				)
				getPhysicalExam()
				renewPatient()
				setSelected([])
			} catch (error) {
				console.error("환자 삭제 중 오류 발생:", error)
			}
		}
	}

	useEffect(() => {
		if (axiosMode) getPhysicalExam();
	}, [getPhysicalExam, axiosMode]);

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

						>신체검사 기록
						</Typography>
						<Stack direction='row'
							sx={{ transition: 'width 0.4s ease' }}
						>
							<IconButton
								variant='plain'
								onClick={() => { setIsNewPhysicalExam(true); setToggleEditor(true) } }
							><PostAdd />
							</IconButton>
							<IconButton
								variant='plain'
								onClick={() => { setIsNewPhysicalExam(false); setToggleEditor(true) } }
								disabled={selected.length !== 1}
							><EditNote />
							</IconButton>
							<IconButton
								variant='plain'
								onClick={() => setShowDeletionAlert(true) }
								disabled={selected.length === 0}
							><Delete />
							</IconButton>
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
						<TableMui<PhysicalExam & ID>
							headCells={headCells}
							rows={physicalExam}
							defaultRowNumber={18}
							selected={selected}
							setSelected={setSelected} />
					</Box>
				</Sheet>
				<PhysicalExamHistoryAddModal
					show={toggleEditor}
					isNew={isNewPhysicalExam}
					selectedPhysicalExam={physicalExam ? physicalExam.filter((value) => { return value.id === selected[0] })[0] : null}
					handleClose={setToggleEditor}
					addPhysicalExam={postPhysicalExam}
				></PhysicalExamHistoryAddModal>
			</Box>
			<Alert 
				showDeletionAlert={showDeletionAlert} 
				setShowDeletionAlert={setShowDeletionAlert} 
				deleteFunction={() => {
					selected.forEach((exerciseID) => {deletePhysicalExamHistory(exerciseID)}) 
					setShowDeletionAlert(false)
					setSelected([])
				}}
			/>
		</React.Fragment>
	)
}

export default PhysicalExamHistory
