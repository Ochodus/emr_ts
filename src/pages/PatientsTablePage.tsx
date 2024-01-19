import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../reducers/index'
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Header, Table } from "../components/commons";
import { TableHeader } from "../components/commons/Table"
import { TableFilter, FilterCard, PatientAddModal } from "../components/PatientsTablePage"
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles.css';
import 'react-date-range-ts/dist/theme/default.css';
import { ReactComponent as AddIcon } from '../assets/add_icon.svg';
import { useLocalTokenValidation } from "../api/commons/auth";
import styles from './PatientsTablePage.module.css';
import classNames from 'classnames/bind';

interface Nok {
	type?: string,
	first_name: string,
	last_name: string,
	sex: string,
	birthday: string,
	tel: string,
	address: string,
	address_detail?: string,
	post_number: number
}

export interface Patient {
	birthday: string,
	first_name: string,
	last_name: string,
	sex: string,
	height?: number,
	weight?: number,
	highBp?: number,
	lowBp?: number,
	last_recorded?: Date,
	regDate?: Date,
	tel: string,
	address: string,
	address_detail?: string,
	post_number: number,
	user_id: number,
	social_number: number,
	memo?: string,
	noks: Nok[]
} // Patient 객체 타입

const PatientsTablePage = () => {
	const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수
	const navigate = useNavigate()
	const cx = classNames.bind(styles)

	const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = "/api/patients";

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

	const headers: TableHeader = [
		{ 
			Header: "환자번호",
			accessor: "id",
			width: 40
		},
		{
			Header: "이름",
			accessor: "full_name",
			Cell: ({ row }) => (
				<div>
					{row.original.last_name}{row.original.first_name} 
				</div>
			),
			width: 40
		},
		{
			Header: "주민번호",
			accessor: "social_number_full",
			Cell: ({ row }) => (
				<div>
					{row.original.birthday ? row.original.birthday.replaceAll('-', '').slice(2) : row.original.birthday}-{row.original.social_number} 
				</div>
			),
			width: 120
		},
		{
			Header: "휴대폰",
			accessor: "tel",
			width: 80
		},
		{
			Header: "최종내원일",
			accessor: "last_recorded",
			width: 50
		},
		{
			Header: "주소",
			accessor: "address",
			width: 200
		},
		{
			Header: "메모",
			accessor: "note",
			width: 100
		},
		{
			Header: "상세보기",
			accessor: "details",
			Cell: ({ row }) => (
				<div className={cx('detail-button')}>
					<Button className={cx('cell-button')} onClick={() => renderDetails(row.index)}>상세보기</Button>
				</div>
			),
			width: 100
		},
		{
			Header: "수정 및 삭제",
			accessor: "edit",
			Cell: ({ row }) => (
				<div className={cx('editing-buttons')}>
					<Button className={cx('cell-button')} onClick={() => handleModalOpen(false, row.index)}>수정</Button>
					<Button className={cx('cell-button')} onClick={() => deletePatient(row.index)}>삭제</Button>
				</div>
			),
			width: 100
		},
	] // 환자 목록 테이블 헤더 선언
	
	const [isFilterExpanded, setIsFilterExpanded] = useState<null | string>(null) // 필터 상세 설정 확장 여부
	const [isModalVisible, setIsModalVisible] = useState(false) // 환자 추가/편집 모달 표시 여부
	const [isNewPatient, setIsNewPatient] = useState(false) // 모달의 추가/편집 모드
	const [isLogin, setIsLogin] = useState(false) // 현재 로그인 여부 저장

	const [patientData, setPatientData] = useState<null | (Patient & { id: string })[]>(null) // 테이블에 출력할 로컬 환자 데이터
	const [targetPatientIndex, setTargetPatientIndex] = useState<number>(-1) // 수정 및 삭제에 사용되는 타깃 환자 인덱스 (로컬 데이터 기준 인덱스 / 환자 고유 아이디와 다름)

	const { filters } = useSelector((state: RootState) => state.filter) // 선택된 필터 (전역 관리)

	const handleModalOpen = (isNewPatient: boolean, targetRowIndex: number) => {
		setIsNewPatient(isNewPatient)
		setTargetPatientIndex(targetRowIndex)
		setIsModalVisible(true)
	} // 모달 띄우기

	const handleModalClose = () => setIsModalVisible(false) // 모달 닫기

	const handleExpand = () => {
		if (!isFilterExpanded || isFilterExpanded === "collapsed") {
			setIsFilterExpanded("expanded")
		}
		else setIsFilterExpanded("collapsed")
	} // 상세 필터 보기

	const postPatient = async (newPatientData: Patient, isNewPatient: boolean) => {
		try {
			isNewPatient || !patientData ? await axios.post(url, newPatientData, config) : await axios.patch(`${url}/${patientData[targetPatientIndex].id}`, newPatientData, config)
			await getAllPatients()
		} catch (error) {
			console.error(`환자 ${isNewPatient ? '추가' : '변경'} 중 오류 발생:`, error)
		}
	} // 환자 추가 및 편집

	const getAllPatients = useCallback(async () => {
		try {
			const response = await axios.get(
				`/api/patients`,
				config
			)
			console.log(response.data)
			setPatientData(response.data)
		} catch (error) {
			console.error("환자 조회 중 오류 발생:", error)
		}
	}, [config]) // 전체 환자 목록 가져오기

	const deletePatient = async (targetPatientIndex: number) => {
		if (patientData) {
			let target_id = patientData[targetPatientIndex].id
			try {
				await axios.delete(
					`/api/patients/${target_id}`,
					config
				)
				getAllPatients()
			} catch (error) {
				console.error("환자 삭제 중 오류 발생:", error)
			}
		}
	} // 환자 삭제

	const renderDetails = (index: number) => {
		if (!patientData) return
		navigate(`../patient-detail/${encodeURIComponent(patientData[index].id)}`)
	} // 환자 상세보기

	useEffect(() => {
		getAllPatients()
	}, [getAllPatients]) // 페이지 첫 렌더링 시 테이블 초기화

	useEffect(() => {
		let testMode = true
		if (process.env.NODE_ENV !== 'development' || testMode) checkAuth().then((resolvedData) => {
		  setIsLogin(resolvedData)
		})
	  }, [checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사

	return (
		<div className={cx("structure")}>
			<Header isLogin={isLogin}/>
			<div className={cx("section_wrap")}>
				<Card className={cx("field-table")}>
					<Card.Header style={{ display: "flex" }}>
						<div className={cx("col-inline")}>
							<span style={{ fontSize: "30px", paddingLeft: "10px" }}>
								<strong>환자 목록</strong>
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
							<div className={cx("section-header")}>
								<span>
									<strong>필터 설정</strong>
								</span>
							</div>
							<div className={cx("section-body")}>
								<div className={cx("form-filtering")}>
									<TableFilter type="string"></TableFilter>
									<Button variant="secondary" onClick={handleExpand}>
										상세 검색
									</Button>
								</div>
								<div className={`${cx("form-filtering")} ${cx("more")} ${cx((isFilterExpanded ? isFilterExpanded : ""))}`}>
										<TableFilter type="numeric"></TableFilter>
										<TableFilter type="date"></TableFilter>
								</div>
								<div className={cx("selected-filters")}>
									{filters.map((filter) => {
										return (
											<FilterCard 
												key={filter.key}
												category={filter.category}
												value={filter.value}
												keyVal={filter.key}
											/>
										)
									})}
								</div>
							</div>
						</div>
						<div className={cx("section")}>
							<div className={cx("section-header")}>
								<span>
									<strong>조회 결과</strong>
								</span>
							</div>
							<div className={cx("section-body")}>
								<Table 
									headers={headers} 
									items={patientData} 
									useSelector={true}
									addFunction={postPatient}
									table_width="calc(100% - 20px)"
								/>
							</div>
						</div>
					</Card.Body>
				</Card>
				<PatientAddModal 
					show={isModalVisible} 
					handleClose={handleModalClose} 
					isNew={isNewPatient} 
					selectedPatient={patientData ? patientData[targetPatientIndex] : null}
					addFunction={postPatient}
				></PatientAddModal>
			</div>
		</div>
	);
};

export default PatientsTablePage;