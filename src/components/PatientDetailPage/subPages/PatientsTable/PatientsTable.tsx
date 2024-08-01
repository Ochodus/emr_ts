import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PatientsTableAddModal } from ".";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { Patient, PhysicalExam } from "../../../../interfaces";
import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import utc from "dayjs/plugin/utc"
import 'dayjs/locale/ko'
import { TableMui } from "../../../commons";
import { HeadCell, ID } from "../../../commons/TableMui";
import { Box, Divider, Sheet, Typography, IconButton, Stack } from "@mui/joy";
import { Delete, EditNote, PostAdd, Troubleshoot } from "@mui/icons-material";
import { DateFilterBuffer, NumberFilterBuffer, StringFilterBuffer } from "../../../../reducers/filter";
import { useSelector } from "react-redux";
import { RootState } from "../../../../reducers";
import { Alert } from "../../../commons";
import { BASE_BACKEND_URL } from "api/commons/request";

dayjs.extend(isLeapYear)
dayjs.extend(utc)
dayjs.locale('ko')

export interface Inspection {
	symptoms: string[],
	diagnostics: string[],
	memo: string,
	recorded: string,
} // MedicalRecord 객체 타입

export const PatientsTable = ({ isSummaryMode, axiosMode }: { isSummaryMode: boolean, axiosMode: boolean }) => {
	const navigate = useNavigate()
	
	const headCells: HeadCell<Patient & ID>[] = [
		{
			id: ['last_name', 'first_name'],
			numeric: false,
			sortable: true,
			label: '이름',
			parse: (value: Patient[keyof Patient][]) => { 
				return `${value[0]}${value[1]}`
			}
		},
		{
			id: ['birthday', 'social_number'],
			numeric: false,
			sortable: true,
			label: '주민등록번호',
			parse: (value: Patient[keyof Patient][]) => { 
				return `${dayjs(value[0].toString()).format('YYMMDD')}-${value[1]}`
			}
		},
		{
			id: 'tel',
			numeric: false,
			sortable: true,
			label: '연락처',
			parse: (value: Patient[keyof Patient]) => { 
				return `010-${(value as string[])[0]}-${(value as string[])[1]}`
			}
		},
		{
			id: ['address', 'address_detail', 'post_number'],
			numeric: false,
			sortable: true,
			label: '주소',
			parse: (value: Patient[keyof Patient][]) => { 
				return `${value[0]}, ${value[2]}`
			}
		},
		{
			id: 'memo',
			numeric: true,
			sortable: true,
			label: '비고',
		}
	] // 환자 목록 테이블 헤더 선언

	const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `${BASE_BACKEND_URL}/api/patients`
	
	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

	const [isNewPatient, setIsNewPatient] = useState(false) // 모달의 추가/편집 모드
	const [toggleEditor, setToggleEditor] = useState<boolean>(false)
	const [selected, setSelected] = useState<number[]>([]);
	const [showDeletionAlert, setShowDeletionAlert] = useState<boolean>(false)

	const [patientData, setPatientData] = useState<(Patient & ID)[]>([]) // 테이블에 출력할 로컬 환자 데이터
	const { filters } = useSelector((state: RootState) => state.filter) // 선택된 필터 (전역 관리)
	
	const postPatient = async (newPatient: Patient, isNewPatient: boolean) => {
		try {
			let response = isNewPatient || !patientData ? await axios.post(url, newPatient, config) : await axios.patch(`${url}/${patientData.filter((value) => {return value.id === selected[0]})[0].id}`, newPatient, config)
		  	console.log("환자 추가 성공");
			getAllPatients();
			return response.data.id			
		} catch (error) {
		  	console.error("환자 추가 중 오류 발생:", error);
		}
	}

	const postPhysicalExam = async (newPhysicalExam: PhysicalExam, id: number) => {
		try {
			await axios.post(`${BASE_BACKEND_URL}/api/patients/${id}/medical/physical_exam`, newPhysicalExam, config)
		  	console.log("기본 사항 갱신");
		} catch (error) {
		  	console.error("기본 사항 갱신 중 오류 발생:", error);
		}
	}

	const deletePatient = async (targetPatientId: number) => {
		if (patientData) {
			try {
				await axios.delete(
					`${url}/${targetPatientId}`,
					config
				)
				getAllPatients()
				setSelected([])
			} catch (error) {
				console.error("진료기록 삭제 중 오류 발생:", error)
			}
		}
	} // 환자 삭제

	const getAllPatients = useCallback(async (filters: (StringFilterBuffer | NumberFilterBuffer | DateFilterBuffer)[] | null = null) => {
		let urlQueryPart = ``
		try {
			if (filters) {
				filters.forEach((filter) => {
					let query = 
						filter.category === 'name' ? 'filter_name' : 
						filter.category === 'patientId' ? 'filter_id' :
						filter.category === 'phoneNumber' ? 'filter_tel' :
						filter.category === 'address' ? 'filter_address' :
						filter.category === 'note' ? 'filter_memo' : ""
					urlQueryPart = `${query}=${filter.value}&${urlQueryPart}`
			})}
			const response = await axios.get(
				`${BASE_BACKEND_URL}/api/patients?${urlQueryPart}`,
				config
			)
			setPatientData(response.data)
		} catch (error) {
			console.error("환자 조회 중 오류 발생:", error)
		}
	}, [config]) // 전체 환자 목록 가져오기

	useEffect(() => {
		if (axiosMode) getAllPatients(filters)
	}, [axiosMode, getAllPatients, filters]) // 페이지 첫 렌더링 시 테이블 초기화

	return (
		<>
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
							
						>환자 목록
						</Typography>
						<Stack direction='row'
							sx={{ transition: 'width 0.4s ease' }}
						>
							<IconButton
								variant='plain' 
								onClick={() => {setIsNewPatient(true); setToggleEditor(true)}}
							><PostAdd />
							</IconButton>
							<IconButton
								variant='plain' 
								onClick={() => {setIsNewPatient(false); setToggleEditor(true)}}
								disabled={selected.length !== 1}
							><EditNote />
							</IconButton>
							<IconButton
								variant='plain' 
								onClick={() => {setShowDeletionAlert(true)}}
								disabled={selected.length === 0}
							><Delete />
							</IconButton>
							<IconButton
								variant='plain' 
								onClick={() => {navigate(`../patient-detail/${encodeURIComponent(patientData.filter((patient) => patient.id === selected[0])[0].id)}`)}}
								disabled={selected.length !== 1}
							>
								<Troubleshoot />
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
						<TableMui<Patient & ID>
							headCells={headCells} 
							rows={patientData}
							defaultRowNumber={18}
							selected={selected}
							setSelected={setSelected}
						/>
					</Box>
				</Sheet>
				<PatientsTableAddModal 
					show={toggleEditor} 
					isNew={isNewPatient} 
					selectedPatient={patientData ? patientData.filter((value) => {return value.id === selected[0]})[0] : null}
					handleClose={setToggleEditor} 
					addPatient={postPatient}
					addPhysicalExam={postPhysicalExam}
					axiosMode={axiosMode}
				></PatientsTableAddModal>			
			</Box>
			<Alert 
				showDeletionAlert={showDeletionAlert} 
				setShowDeletionAlert={setShowDeletionAlert} 
				deleteFunction={() => {
					selected.forEach((patientId) => {deletePatient(patientId)}) 
					setShowDeletionAlert(false)
					setSelected([])
				}}
			/>
		</>
	)
}

export default PatientsTable

