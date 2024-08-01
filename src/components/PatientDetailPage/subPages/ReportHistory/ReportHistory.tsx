import { useState, useEffect, useMemo, useCallback } from "react";
import { ReportHistoryAddModal } from ".";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { useLocalTokenValidation } from "../../../../api/commons/auth";
import { Box, Divider, IconButton, Sheet, Stack, Tooltip, Typography } from "@mui/joy";
import { Alert, TableMui } from "../../../commons";
import { HeadCell, ID } from "../../../commons/TableMui";
import { Delete, EditNote, PostAdd } from "@mui/icons-material";
import { Update } from "./ReportHistoryAddModal";
import { BASE_BACKEND_URL } from "api/commons/request";
import { prettyPrint } from "api/commons/utils";
import isLeapYear from 'dayjs/plugin/isLeapYear'
import utc from "dayjs/plugin/utc"
import 'dayjs/locale/ko'
import dayjs from "dayjs";
import React from "react";

dayjs.extend(isLeapYear)
dayjs.extend(utc)
dayjs.locale('ko')

export interface ChangeInfo {
	start_value: string,
	end_value: string,
	importance: 'high'|'low'|'res',
	target_dir: 'inc'|'dec'|'res'
}

export interface Report {
	report_date: string,
	changes: Update[],
	memo: string
} // Report 객체 타입

const ReportHistory = ({ axiosMode }: { axiosMode: boolean }) => {
	const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수

	const headCells: HeadCell<Report & ID>[] = [
		{
		  id: 'report_date',
		  numeric: false,
		  label: '작성 일자',
		  parse: (value: (Report & ID)[keyof (Report & ID)]) => {
			return dayjs(value.toString()).format('YYYY년 MM월 DD일 HH시 mm분')
		  }
		},
		{
		  id: 'changes',
		  numeric: true,
		  label: '변화 항목',
		  parse: (value: (Report & ID)[keyof (Report & ID)]) => {
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
			label: '비고'
		}
	];

	const { patient_id } = useParams();
	const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `${BASE_BACKEND_URL}/api/patients/${patient_id}/medical/reports`

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

	const [reportHistory, setReportHistory] = useState<(Report & ID)[]>([]);
	const [isNewReport, setIsNewReport] = useState(false)
	const [toggleEditor, setToggleEditor] = useState<boolean>(false)	
	const [selected, setSelected] = useState<number[]>([]);
	const [showDeletionAlert, setShowDeletionAlert] = useState<boolean>(false)

	const getReportHistory = useCallback(async () => {
		try {
			const response = await axios.get(
				url,
				config
			)
		
			setReportHistory(response.data);
		} catch (error) {
			console.error("진료 조회 중 오류 발생:", error);
		}
	}, [config, url])
	
	const postReport = async (newReport: Report, isNewReport: boolean) => {
		try {
			isNewReport || !reportHistory ? await axios.post(url, newReport, config) : await axios.patch(`${url}/${reportHistory.filter((value) => {return value.id === selected[0]})[0].id}`, newReport, config)
		  	console.log("진료 기록 추가 성공");
			getReportHistory();
			setToggleEditor(false)
		} catch (error) {
		  	console.error("진료 기록 추가 중 오류 발생:", error);
		}
	}

	const deleteReportHistory = async (targetReportIndex: number) => {
		if (reportHistory) {
			let targetId = reportHistory.filter((value) => {return value.id === targetReportIndex})[0].id
			try {
				let response = await axios.delete(`${BASE_BACKEND_URL}${url}/${targetId}`, config)
				console.log(response)
				getReportHistory()
			} catch (error) {
				console.error("환자 삭제 중 오류 발생:", error)
			}
		}
	} // 환자 삭제

	useEffect(() => {
		if (axiosMode) getReportHistory();
	}, [getReportHistory, axiosMode]);

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
							
						>레포트 기록
						</Typography>
							<Stack direction='row'
								sx={{ transition: 'width 0.4s ease' }}
							>
								<IconButton
									variant='plain' 
									onClick={() => {setIsNewReport(true); setToggleEditor(true)}}
								><PostAdd />
								</IconButton>
								<IconButton
									variant='plain' 
									onClick={() => {setIsNewReport(false); setToggleEditor(true)}}
									disabled={selected.length !== 1}
								><EditNote />
								</IconButton>
								<IconButton
									variant='plain' 
									onClick={() => setShowDeletionAlert(true)}
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
							<TableMui<Report & ID>
								headCells={headCells} 
								rows={reportHistory}
								defaultRowNumber={18}
								selected={selected}
								setSelected={setSelected}
							/>
						</Box>
					</Sheet>
				<ReportHistoryAddModal 
					show={toggleEditor} 
					isNew={isNewReport} 
					selectedReport={reportHistory ? reportHistory.filter((value) => {return value.id === selected[0]})[0] : null}
					handleClose={setToggleEditor} 
					addReport={postReport}
				></ReportHistoryAddModal>
			</Box>
			<Alert 
				showDeletionAlert={showDeletionAlert} 
				setShowDeletionAlert={setShowDeletionAlert} 
				deleteFunction={() => {
					selected.forEach((recordId) => {deleteReportHistory(recordId)}) 
					setShowDeletionAlert(false)
					setSelected([])
				}}
			/>
		</React.Fragment>
	)
}

export default ReportHistory
