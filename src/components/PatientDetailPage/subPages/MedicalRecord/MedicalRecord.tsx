import React, { useState, useEffect, useMemo, useCallback } from "react";
import { MedicalRecordAddModal } from ".";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { useLocalTokenValidation } from "../../../../api/commons/auth";
import { PhysicalExam } from "../../../../interfaces";
import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import utc from "dayjs/plugin/utc"
import 'dayjs/locale/ko'
import { Alert, TableMui, TooltippedIconButton } from "../../../commons";
import { HeadCell, ID } from "../../../commons/TableMui";
import { Box, Divider, Sheet, Typography,Stack, Tooltip } from "@mui/joy";
import { Delete, EditNote, PostAdd } from "@mui/icons-material";
import { BASE_BACKEND_URL } from "api/commons/request";
import { prettyPrint } from "api/commons/utils";

dayjs.extend(isLeapYear)
dayjs.extend(utc)
dayjs.locale('ko')

export interface Inspection {
	symptoms: string[],
	diagnostics: string[],
	memo: string,
	recorded: string,
} // MedicalRecord 객체 타입

const MedicalRecord = ({ isSummaryMode, axiosMode }: { isSummaryMode: boolean, axiosMode: boolean }) => {
	const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수
	
	const headCells: HeadCell<Inspection & ID>[] = [
		{
		  id: 'recorded',
		  numeric: false,
		  label: '일자',
		  sortable: true,
		  parse: (value: (Inspection & ID)[keyof (Inspection & ID)]) => {
			return dayjs(value.toString()).format('YYYY년 MM월 DD일 HH시 mm분')
		  }
		},
		{
		  id: 'symptoms',
		  numeric: true,
		  label: '증상',
		},
		{
		  id: 'diagnostics',
		  numeric: true,
		  label: '진단',
		},
		{
			id: 'memo',
			numeric: true,
			label: '비고',
		}
	];

	const { patient_id } = useParams();
	const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `${BASE_BACKEND_URL}/api/patients/${patient_id}/medical/records`

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

	const [medicalRecords, setMedicalRecords] = useState<(Inspection & ID)[]>([]);
	const [isNewRecord, setIsNewRecord] = useState(false) // 모달의 추가/편집 모드
	const [toggleEditor, setToggleEditor] = useState<boolean>(false)
	const [selected, setSelected] = useState<number[]>([]);
	const [showDeletionAlert, setShowDeletionAlert] = useState<boolean>(false)

	const getMedicalRecord = useCallback(async () => {
		try {
			const response = await axios.get(
				url,
				config
			)
		
			setMedicalRecords(response.data);
		} catch (error) {
			console.error("진료 조회 중 오류 발생:", error);
		}
	}, [config, url])
	
	const postMedicalRecord = async (newMedicalRecord: Inspection, isNewRecord: boolean) => {
		try {
			isNewRecord || !medicalRecords ? await axios.post(url, newMedicalRecord, config) : await axios.patch(`${url}/${medicalRecords.filter((value) => {return value.id === selected[0]})[0].id}`, newMedicalRecord, config)
		  	console.log("진료 기록 추가 성공");
			getMedicalRecord();
			return true
		} catch (error) {
		  	console.error("진료 기록 추가 중 오류 발생:", error);
			return false
		}
	}

	const postPhysicalExam = async (newPhysicalExam: PhysicalExam) => {
		try {
			await axios.post(`${BASE_BACKEND_URL}/api/patients/${patient_id}/medical/physical_exam`, newPhysicalExam, config)
		  	console.log("기본 사항 갱신");
			return true
		} catch (error) {
		  	console.error("기본 사항 갱신 중 오류 발생:", error);
			return false
		}
	}

	const deleteMedicalRecord = async (targetRecordId: number) => {
		if (medicalRecords) {
			try {
				await axios.delete(
					`${url}/${targetRecordId}`,
					config
				)				
				getMedicalRecord()
				setSelected([])
			} catch (error) {
				console.error("진료기록 삭제 중 오류 발생:", error)
			}
		}
	} // 환자 삭제

	useEffect(() => {
		if (axiosMode) getMedicalRecord();
	}, [axiosMode, getMedicalRecord]);

	useEffect(() => {
		let testMode = true
		if ((process.env.NODE_ENV !== 'development' || testMode) && axiosMode) checkAuth()
	}, [axiosMode, checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사

	return !isSummaryMode ?
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
							
						>진료 기록
						</Typography>
						<Stack direction='row'
							sx={{ transition: 'width 0.4s ease' }}
						>
							<TooltippedIconButton
								tooltipString="추가"
								onClick={() => {setIsNewRecord(true); setToggleEditor(true)}}
							>
								<PostAdd />
							</TooltippedIconButton>
							<TooltippedIconButton
								tooltipString="편집"
								onClick={() => {setIsNewRecord(false); setToggleEditor(true)}}
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
						<TableMui<Inspection & ID>
							headCells={headCells} 
							rows={medicalRecords}
							defaultRowNumber={18}
							selected={selected}
							setSelected={setSelected}
						/>
					</Box>
				</Sheet>
				<MedicalRecordAddModal 
					show={toggleEditor} 
					isNew={isNewRecord} 
					selectedMedicalRecord={medicalRecords ? medicalRecords.filter((value) => {return value.id === selected[0]})[0] : null}
					handleClose={setToggleEditor} 
					addRecord={postMedicalRecord}
					addPhysicalExam={postPhysicalExam}
					axiosMode={axiosMode}
				></MedicalRecordAddModal>
			</Box>
			<Alert 
				showDeletionAlert={showDeletionAlert} 
				setShowDeletionAlert={setShowDeletionAlert} 
				deleteFunction={() => {
					selected.forEach((recordId) => {deleteMedicalRecord(recordId)}) 
					setShowDeletionAlert(false)
					setSelected([])
				}}
			/>
		</>
		:
		<TableMui<Inspection & ID>
			headCells={headCells} 
			rows={medicalRecords}
			selected={selected}
			setSelected={setSelected}
		/>
}

export default MedicalRecord
