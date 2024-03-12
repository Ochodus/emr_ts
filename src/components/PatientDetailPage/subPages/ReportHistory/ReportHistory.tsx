import { useState, useEffect, useMemo, useCallback } from "react";
import { Table } from "../../../commons/Table";
import { Card, Button } from "react-bootstrap";
import { TableHeader } from "../../../commons/Table"
import { ReportHistoryAddModal } from ".";
import { ReactComponent as AddIcon } from '../../../../assets/add_icon.svg';
import { useParams } from 'react-router-dom';
import axios from "axios";
import { useLocalTokenValidation } from "../../../../api/commons/auth";
import styles from './ReportHistory.module.css';
import classNames from 'classnames/bind';

export interface Changes {
	name: string,
	before_value: number,
	before_trial: number,
	after_value: number,
	after_trial: number,
	is_improved: boolean
}

export interface Report {
	startDate: string,
	endDate: string,
	changes: Changes[],
	changes_detail?: object,
	memo: string
} // Report 객체 타입

const ReportHistory = ({ isSummaryMode, axiosMode }: { isSummaryMode: boolean, axiosMode: boolean }) => {
	const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수
	const cx = classNames.bind(styles)

	const headers: TableHeader = [
		{ 
			Header: "리포트 기간",
			accessor: "startDate",
			Cell: ({ row }) => {
				return (
					<div>
						{`${row.original.startDate} ~ ${row.original.endDate}`}
					</div>
				)
			},
			width: 40
		},
		{ 
			Header: "변화 항목",
			accessor: "changes",
			Cell: ({ row }) => (
				<div>
					{row.original.changes.map((change: Changes, index: number) => {
						return row.original.changes.length - 1 !== index ? `${change.name}, ` : `${change.name}`
					})}
				</div>
			),
			width: 40
		},
		{ 
			Header: "기타 항목",
			accessor: "changes_detial",
			Cell: ({ row }) => (
				<div>
					{ JSON.stringify(row.original.changes_detail) }
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
					<Button className={cx('cell-button')} onClick={() => deleteReportHistory(row.index)}>삭제</Button>
				</div>
			),
			width: 100
		},
	];

	const { patient_id } = useParams();
	const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `/api/patients/${patient_id}/medical/reports`

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

	const [reportHistory, setReportHistory] = useState<(Report & {id: number})[]>([]);

	const [isModalVisible, setIsModalVisible] = useState(false) // 환자 추가/편집 모달 표시 여부
	const [isNewReport, setIsNewReport] = useState(false) // 모달의 추가/편집 모드
	const [targetReportIndex, setTargetReportIndex] = useState<number>(-1) // 수정 및 삭제에 사용되는 타깃 환자 인덱스 (로컬 데이터 기준 인덱스 / 환자 고유 아이디와 다름)

	const getReportHistory = useCallback(async () => {
		try {
			const response = await axios.get(
				url,
				config
			)
		
			console.log(response.data);
			setReportHistory(response.data);
		} catch (error) {
			console.error("진료 조회 중 오류 발생:", error);
		}
	}, [config])
	
	const postMedicalRecord = async (newReport: Report, isNewReport: boolean) => {
		try {
			isNewReport || !reportHistory ? await axios.post(url, newReport, config) : await axios.patch(`${url}/${reportHistory[targetReportIndex].id}`, newReport, config)
		  	console.log("진료 기록 추가 성공");
			getReportHistory();
		} catch (error) {
		  	console.error("진료 기록 추가 중 오류 발생:", error);
		}
	}

	const deleteReportHistory = async (targetReportIndex: number) => {
		if (reportHistory) {
			let targetId = reportHistory[targetReportIndex].id
			console.log(`${url}/${targetId}`)
			try {
				await axios.delete(
					`${url}/${targetId}`,
					config
				)
				getReportHistory()
			} catch (error) {
				console.error("환자 삭제 중 오류 발생:", error)
			}
		}
	} // 환자 삭제

	const handleModalOpen = (isNewReport: boolean, targetReportIndex: number) => {
		setIsNewReport(isNewReport)
		setTargetReportIndex(targetReportIndex)
		setIsModalVisible(true)
	} // 모달 띄우기

	const handleModalClose = () => setIsModalVisible(false) // 모달 닫기

	useEffect(() => {
		if (axiosMode) getReportHistory();
	}, [getReportHistory]);

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
								<strong>리포트 내역</strong>
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
									items={reportHistory} 
									useSelector={true}
									table_width="calc(100% - 20px)"
								/>
							</div>
						</div>
					</Card.Body>
				</Card>
				<ReportHistoryAddModal 
					show={isModalVisible} 
					handleClose={handleModalClose} 
					isNew={isNewReport} 
					selectedReport={reportHistory ? reportHistory[targetReportIndex] : null}
					addFunction={postMedicalRecord}
				></ReportHistoryAddModal>
			</div> :
			<div className={cx("section-body")}>
				<Table 
					headers={headers} 
					items={reportHistory} 
					useSelector={true}
					table_width="calc(100% - 20px)"
				/>
			</div>
			}
		</div>
	)
}

export default ReportHistory
