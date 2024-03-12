import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, Button, InputGroup, Form } from "react-bootstrap";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { useLocalTokenValidation } from "../../../../api/commons/auth";
import styles from './Enchiridion.module.css';
import classNames from 'classnames/bind';

interface Enchiridion {
	id: number,
	file_url: string,
    content: object,
    detail: string,
    inspected: string
}

const Enchiridion = ({ isSummaryMode, axiosMode }: { isSummaryMode: boolean, axiosMode: boolean }) => {
	const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수
	const cx = classNames.bind(styles)

	const { patient_id } = useParams();
	const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `/api/patients/${patient_id}/medical/inspections?inspection_type`

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

	const [enchiridionType, setEnchiridionType] = useState<string | undefined>()
	const [enchiridionNumber, setEnchiridionNumber] = useState<string | undefined>()
	const [enchiridionList, setEnchiridionList] = useState<Enchiridion[] | undefined>()
	const [fileUrl, setFileUrl] = useState("")
	const [fileUrlAlt, setFileUrlAlt] = useState("")

	const enchiridionTypeList = ["IMOOVE", "X-Ray", "InBody", "Exbody", "Lookin' Body", "혈액 검사 결과", "설문지", "족저경", "운동능력 검사", "정렬 사진", "평지 보행 동영상"]

	const handleEnchiridionTypeChange = (type: string) => {
		setEnchiridionType(type)
		handleEnchiridionNumberChange('-1')
		if (+type === -1) return
		getSelectedInspectionList(type)
	}

	const handleEnchiridionNumberChange = async (number: string) => {
		setEnchiridionNumber(number)
		if (+number === -1) {
			setFileUrl("") 
			setFileUrlAlt("")
			return
		}
		if (enchiridionList !== undefined ) {
			let url = enchiridionList[+number].file_url
			console.log(url)
			if (url.includes(' ')) {
				setFileUrl(url.split(' ')[0])
				setFileUrlAlt(url.split(' ')[1])
					// let setImages = [setImage, setImageAlt];
					// [fileUrl, fileUrlAlt].map(async (furl, index) => {
					// 	try {
					// 		const response = await axios.get(
					// 			`${furl}`,
					// 			config
					// 		)
					// 		setImages[index](response.data)
					// 	} catch (error) {
					// 		console.log(index)
					// 		console.error("기록 조회 중 오류 발생:", error)
					// 	}
					// })
			}
			else {
				setFileUrl(enchiridionList[+number].file_url)
				// try {
				// 	const response = await axios.get(
				// 		`${enchiridionList[+number].file_url}`,
				// 		config
				// 	)
				// 	setImage(response.data)
				// } catch (error) {
				// 	console.error("기록 조회 중 오류 발생:", error)
				// }
			}
		}
	}

	const getSelectedInspectionList = useCallback(async (type: string) => {
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
                }
            `,
				config
			)
			console.log(response.data)
			setEnchiridionList(response.data)
		} catch (error) {
			console.error("기록 조회 중 오류 발생:", error)
		}
	}, [config]) // 전체 환자 목록 가져오기

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
								<strong>자료 선택</strong>
							</span>
						</div>
					</Card.Header>
					<Card.Body>
						<div className={cx("section")} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid gray" }}>
							<InputGroup style={{ width: "45%" }}>
								<InputGroup.Text>자료 타입</InputGroup.Text>
								<Form.Select
									value={enchiridionType}
									onChange={(e) => handleEnchiridionTypeChange(e.target.value)}
								>
									<option key={-1} value={-1}>미지정</option>
									{enchiridionTypeList.map((enchiridionType, index) => {
										return (
											<option key={index} value={enchiridionType}>{`${enchiridionType}`}</option>
										)
									})}
								</Form.Select>
							</InputGroup>
							<InputGroup style={{ width: "45%" }}>
								<InputGroup.Text>회차</InputGroup.Text>
								<Form.Select
									value={enchiridionNumber}
									onChange={(e) => handleEnchiridionNumberChange(e.target.value)}
								>
									<option key={-1} value={-1}>미지정</option>
									{enchiridionList?.map((enchiridion, index) => {
										return (
											<option key={index} value={index}>{`${index} / ${enchiridion.inspected}`}</option>
										)
									})}
								</Form.Select>
							</InputGroup>
						</div>
						<div className={cx("section-body")}>
							<img style={{ width: '100%'}} src={fileUrl}></img>
							{enchiridionType === 'InBody' ? <img style={{ width: '100%'}} src={fileUrlAlt}></img> : null}
						</div>
					</Card.Body>
					<Card.Footer>
						<Button variant="secondary">편집하기</Button>
					</Card.Footer>
				</Card>
			</div> :
			<div className={cx("section-body")}>
			</div>
			}
		</div>
	)
}

export default Enchiridion
