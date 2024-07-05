import { useState, useEffect, useMemo, useCallback } from "react";
import { Table } from "../../../commons/Table";
import { Card, Button } from "react-bootstrap";
import { TableHeader } from "../../../commons/Table"
import { PhysicalExamHistoryAddModal } from ".";
import { ReactComponent as AddIcon } from '../../../../assets/add_icon.svg';
import { useParams } from 'react-router-dom';
import axios from "axios";
import { useLocalTokenValidation } from "../../../../api/commons/auth";
import styles from './PhysicalExamHistory.module.css';
import classNames from 'classnames/bind';
import { PhysicalExam } from "../../../../interfaces";

export interface Changes {
	name: string,
	before_value: number,
	before_trial: number,
	after_value: number,
	after_trial: number,
	is_improved: boolean
}

const PhysicalExamHistory = ({ isSummaryMode, axiosMode }: { isSummaryMode: boolean, axiosMode: boolean }) => {
	const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수
	const cx = classNames.bind(styles)

	const headers: TableHeader = [
		{ 
			Header: "측정 일시",
			accessor: "recorded",
			width: 40
		},
		{ 
			Header: "키",
			accessor: "height",
			width: 40
		},
		{ 
			Header: "몸무게",
			accessor: "weight",
			width: 40
		},
		{ 
			Header: "최고 혈압",
			accessor: "systolic_blood_pressure",
			width: 40
		},
		{ 
			Header: "최저 혈압",
			accessor: "diastolic_blood_pressure",
			width: 40
		},
		{ 
			Header: "체온",
			accessor: "body_temperature",
			width: 40
		},
		{
			Header: "수정 및 삭제",
			accessor: "edit",
			Cell: ({ row }) => (
				<div className={cx('editing-buttons')}>
					<Button className={cx('cell-button')} onClick={() => handleModalOpen(false, row.index)}>수정</Button>
					<Button className={cx('cell-button')} onClick={() => deletePhysicalExamHistory(row.index)}>삭제</Button>
				</div>
			),
			width: 100
		},
	];

	const { patient_id } = useParams();
	const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `/api/patients/${patient_id}/medical/physical_exam`

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

	const [physicalExam, setPhysicalExam] = useState<(PhysicalExam & {id: number})[]>([]);

	const [isModalVisible, setIsModalVisible] = useState(false) // 환자 추가/편집 모달 표시 여부
	const [isNewPhysicalExam, setIsNewPhysicalExam] = useState(false) // 모달의 추가/편집 모드
	const [targetPhysicalExamIndex, setTargetPhysicalReportIndex] = useState<number>(-1) // 수정 및 삭제에 사용되는 타깃 환자 인덱스 (로컬 데이터 기준 인덱스 / 환자 고유 아이디와 다름)

	const getPhysicalExam = useCallback(async () => {
		try {
			const response = await axios.get(
				url,
				config
			)
		
			console.log(response.data);
			setPhysicalExam(response.data);
		} catch (error) {
			console.error("진료 조회 중 오류 발생:", error);
		}
	}, [config, url])
	
	const postPhysicalExam = async (newPhysicalExam: PhysicalExam, isNewPhysicalExam: boolean) => {
		try {
			isNewPhysicalExam || !physicalExam ? await axios.post(url, newPhysicalExam, config) : await axios.patch(`${url}/${physicalExam[targetPhysicalExamIndex].id}`, newPhysicalExam, config)
		  	console.log("진료 기록 추가 성공");
			getPhysicalExam();
		} catch (error) {
		  	console.error("진료 기록 추가 중 오류 발생:", error);
		}
	}

	const deletePhysicalExamHistory = async (targetPhysicalExamIndex: number) => {
		if (physicalExam) {
			let targetId = physicalExam[targetPhysicalExamIndex].id
			console.log(`${url}/${targetId}`)
			try {
				await axios.delete(
					`${url}/${targetId}`,
					config
				)
				getPhysicalExam()
			} catch (error) {
				console.error("환자 삭제 중 오류 발생:", error)
			}
		}
	} // 환자 삭제

	const handleModalOpen = (isNewPhysicalExam: boolean, targetPhysicalExamIndex: number) => {
		setIsNewPhysicalExam(isNewPhysicalExam)
		setTargetPhysicalReportIndex(targetPhysicalExamIndex)
		setIsModalVisible(true)
	} // 모달 띄우기

	const handleModalClose = () => setIsModalVisible(false) // 모달 닫기

	useEffect(() => {
		if (axiosMode) getPhysicalExam();
	}, [getPhysicalExam, axiosMode]);

	useEffect(() => {
		let testMode = true
		if ((process.env.NODE_ENV !== 'development' || testMode) && axiosMode) checkAuth()
	  }, [checkAuth, axiosMode]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사

	return (
		<div>
			{ !isSummaryMode ?
			<div className={cx("section_wrap")}>
				<Card className={cx("field-table")}>
					<Card.Header style={{ display: "flex" }}>
						<div className={cx("col-inline")}>
							<span style={{ fontSize: "30px", paddingLeft: "10px" }}>
								<strong>측정 내역</strong>
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
									items={physicalExam} 
									useSelector={true}
									table_width="calc(100% - 20px)"
								/>
							</div>
						</div>
					</Card.Body>
				</Card>
				<PhysicalExamHistoryAddModal 
					show={isModalVisible} 
					handleClose={handleModalClose} 
					isNew={isNewPhysicalExam} 
					selectedPhysicalExam={physicalExam ? physicalExam[targetPhysicalExamIndex] : null}
					addFunction={postPhysicalExam}
				></PhysicalExamHistoryAddModal>
			</div> :
			<div className={cx("section-body")}>
				<Table 
					headers={headers} 
					items={physicalExam} 
					useSelector={true}
					table_width="calc(100% - 20px)"
				/>
			</div>
			}
		</div>
	)
}

export default PhysicalExamHistory
