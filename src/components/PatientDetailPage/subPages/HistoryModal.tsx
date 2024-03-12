import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Modal from 'react-bootstrap/Modal'
import styles from './HistoryModal.module.css'
import classNames from 'classnames/bind';
import { useParams } from 'react-router-dom'
import { Table } from '../../commons';
import { TableHeader } from "../../commons/Table"
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { useLocalTokenValidation } from '../../../api/commons/auth';
import { ExBodyAddModal, ImooveAddModal, InBodyAddModal, LookinBodyAddModal, XRayAddModal } from './InspectionHistory';
import BloodInspectionAddModal from './InspectionHistory/BloodInspectionAddModal';
import SurveyTypeSelectModal from './InspectionHistory/SurveyTypeSelectModal';
import SurveyAddModalAdult from './InspectionHistory/SurveyAddModalAdult';
import SurveyAddModalChild from './InspectionHistory/SurveyAddModalChild';
import PodoscopeAddModal from './InspectionHistory/PodoscopeAddModal';
import PhysicalPerformanceAddModal from './InspectionHistory/PhysicalPerformanceAddModal';
import AlignmentAddModal from './InspectionHistory/AlignmentAddModal';
import FlatWalkingVideoAddModal from './InspectionHistory/FlatWalkingVideoAddModal';
import cv from "opencv-ts";
import { Imoove } from './InspectionHistory/ImooveAddModal';
import { XrayRecord } from './InspectionHistory/XRayAddModal';

interface Inspection {
	id: number,
    file_url: string,
	content: object | null,
	detail: string,
	inspected: string
}

const HistoryModal = ({ show, handleClose, type }: { show: any, handleClose: ()=> void, type: string}) => {
    const cx = classNames.bind(styles)
    const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수
    const { patient_id } = useParams();

    const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `/api/patients/${patient_id}/medical/inspections?inspection_type`

	const [editorShow, setEditorShow] = useState(false)
    const [inspectionData, setInspectionData] = useState<Inspection[]>()
    const [selectedInspection, setSelectedInspection] = useState<Inspection>()

    const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

    const headers: TableHeader = [
		{ 
			Header: "회차",
			accessor: "id",
			width: 100
		},
        { 
			Header: "검사일자",
			accessor: "inspected",
			width: 100
		},
        { 
			Header: "내용",
			accessor: "content",
			Cell: ({ row }) => (
				<div style={{ maxWidth: '610px', overflowX: 'scroll'}}>
					{JSON.stringify(row.original.content).replaceAll('"', '').replaceAll(':', ': ').replaceAll(',', ', ')}
				</div>
			),
			width: 100
		},
		{
			Header: "메모",
			accessor: "detail",
			width: 100
		},
		{
			Header: "수정 및 삭제",
			accessor: "edit",
			Cell: ({ row }) => { 
				console.log()
				return (
				<div className={cx('editing-buttons')}>
					<Button className={cx('cell-button')} onClick={() => {handleEditorShow(row.index)}}>수정</Button>
					<Button className={cx('cell-button')} onClick={() => {handleInspectionDelete(row.original.id)}}>삭제</Button>
				</div>
			)},
			width: 100
		},
	] // 환자 목록 테이블 헤더 선언

    const handleEditorClose = () => {
        setEditorShow(false)
    }

    const handleEditorShow = (index: number) => {
        if (inspectionData !== undefined) {
            setSelectedInspection(inspectionData[index])
            setEditorShow(true)
        }
    }

    const handleInspectionDelete = async (id: number) => {
        console.log(id)
        try {
			await axios.delete(
				`/api/patients/${patient_id}/medical/inspections/${id}`,
				config			
			)
            getAllInspections(type)
		} catch (error) {
			console.error("기록 삭제 중 오류 발생:", error)
		}
    }

    const getAllInspections = useCallback(async (type: string) => {
        console.log(type)
		try {
			const response = await axios.get(
				`${url}=${
                    type === "IMOOVE" ? "IMOOVE" :
                    type === "X-Ray" ? "X-RAY" :
                    type === "InBody" ? "INBODY" :
                    type === "Exbody" ? "EXBODY" :
                    type === "Lookin' Body" ? "LOOKINBODY" :
                    type === "혈액 검사 결과" ? "BLOOD" :
                    type === "설문지" ? "SURVEY" :
                    type === "족저경" ? "PODOSCOPE" :
                    type === "운동능력 검사" ? "PHYSICAL_PERFORMANCE" :
                    type === "정렬 사진" ? "" : 
                    type === "평지 보행 동영상" ? "" :
                    ""
                }`,
				config			
			)
			setInspectionData(response.data)
		} catch (error) {
			console.error("환자 조회 중 오류 발생:", error)
		}
	}, [config]) // 전체 환자 목록 가져오기

    const getSelectedInspection = () => {
        return inspectionData ? inspectionData[1] : null
    }

	useEffect(() => {
		let testMode = true
		if ((process.env.NODE_ENV !== 'development' || testMode)) checkAuth()
	}, [checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사

    return (
        <Modal show={show} onShow={() => getAllInspections(type)} onHide={handleClose} size='xl'>
            <Modal.Header closeButton>
                <Modal.Title>
                    <span className={cx("title")}>
                        <strong>{type} 기록</strong>
                    </span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className={cx("section")}>
                    <div className={cx("section-body")}>
                        <Table 
                            headers={headers} 
                            items={inspectionData} 
                            useSelector={true}
                            table_width="calc(100% - 20px)"
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
			{ type === "IMOOVE" && 
                    <ImooveAddModal cv={cv}
                        show={editorShow} 
                        isNew={false}
                        selectedImoove={selectedInspection as Imoove & {id: number}}
                        handleClose={handleEditorClose} 
                    />
                }
                { type === "InBody" &&
                    <InBodyAddModal cv={cv}
                        show={editorShow} 
                        handleClose={handleEditorClose}
                    />
                }
                { type === "X-Ray" &&
                    <XRayAddModal                                
                        show={editorShow} 
                        isNew={false}
                        selectedXray={selectedInspection as XrayRecord & {id: number}}
                        handleClose={handleEditorClose} 
                    />
                }{ type === "Exbody" &&
                    <ExBodyAddModal cv={cv}
                        show={editorShow} 
                        handleClose={handleEditorClose} 
                    />
                }
                { type === "Lookin' Body" &&
                    <LookinBodyAddModal cv={cv}
                        show={editorShow}
                        handleClose={handleEditorClose}
                    />
                }
                { type === "혈액 검사 결과" &&
                    <BloodInspectionAddModal cv={cv}
                        show={editorShow}
                        handleClose={handleEditorClose}
                    />
                }
                { type === "설문지" && 
                    <SurveyTypeSelectModal 
                        show={editorShow} 
                        handleShowAdult={() => {}} 
                        handleShowChild={() => {}} 
                        handleClose={handleEditorClose} 
                    />
                }
                { <SurveyAddModalAdult cv={cv} show={false} handleClose={handleEditorClose}/> }

                { <SurveyAddModalChild cv={cv} show={false} handleClose={handleEditorClose}/> }
                { type === "족저경" && 
                    <PodoscopeAddModal cv={cv}
                        show={editorShow}
                        handleClose={handleEditorClose}
                    />
                }
                { type === "운동능력 검사" && 
                    <PhysicalPerformanceAddModal cv={cv}
                        show={editorShow}
                        handleClose={handleEditorClose}
                    />
                }
                { type === "정렬 사진" && 
                    <AlignmentAddModal cv={cv}
                        show={editorShow}
                        handleClose={handleEditorClose}
                    />
                }
                { type === "평지 보행 동영상" && 
                    <FlatWalkingVideoAddModal cv={cv}
                        show={editorShow}
                        handleClose={handleEditorClose}
                    />
                }
        </Modal>
    )
}

export default HistoryModal
