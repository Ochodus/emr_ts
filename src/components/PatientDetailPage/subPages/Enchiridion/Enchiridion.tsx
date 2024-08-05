import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { useLocalTokenValidation } from "../../../../api/commons/auth";
import { Box, Divider, FormControl, FormLabel, Select, Sheet, Typography, Option, Stack } from "@mui/joy";
import { DefaultInspection, inspectionContent } from "../../../../interfaces/inspectionType.interface";
import { BASE_BACKEND_URL, BASE_FILE_URL } from "api/commons/request";

const Enchiridion = ({ isSummaryMode, axiosMode }: { isSummaryMode: boolean, axiosMode: boolean }) => {
	const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수

	const { patient_id } = useParams();
	const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `${BASE_BACKEND_URL}/api/patients/${patient_id}/medical/inspections?inspection_type`

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

	const [enchiridionType, setEnchiridionType] = useState<string>("")
	const [selectedEnchiridion, setSelectedEnchiridion] = useState<DefaultInspection<inspectionContent> | null>(null)
	const [enchiridionList, setEnchiridionList] = useState<DefaultInspection<inspectionContent>[]>([])
	
	const enchiridionTypeList = ["IMOOVE", "X-Ray", "InBody", "Exbody", "Lookin' Body", "혈액 검사 결과", "설문지", "족저경", "운동능력 검사", "정렬 사진", "평지 보행 동영상"]

	const getSelectedEnchiridionList = useCallback(async () => {
		try {
			const response = await axios.get(
				`${url}=${
                    enchiridionType === "IMOOVE" ? "IMOOVE" :
                    enchiridionType === "X-Ray" ? "X-RAY" :
                    enchiridionType === "InBody" ? "INBODY" :
                    enchiridionType === "Exbody" ? "EXBODY" :
                    enchiridionType === "Lookin' Body" ? "LOOKINBODY" :
                    enchiridionType === "혈액 검사 결과" ? "BLOOD" :
                    enchiridionType === "설문지" ? "SURVEY" :
                    enchiridionType === "족저경" ? "PODOSCOPE" :
                    enchiridionType === "운동능력 검사" ? "PHYSICAL_PERFORMANCE" :
                    enchiridionType === "정렬 사진" ? "" : 
                    enchiridionType === "평지 보행 동영상" ? "" :
                    ""
                }
            `,
				config
			)
			return response.data
		} catch (error) {
			console.error("기록 조회 중 오류 발생:", error)
			return []
		}
	}, [enchiridionType, config, url])

	useEffect(() => {
		setSelectedEnchiridion(null)
		
		if (enchiridionType === "") return

		getSelectedEnchiridionList().then((result) => {
			setEnchiridionList(result)
		})
		
	}, [enchiridionType, getSelectedEnchiridionList])

	useEffect(() => {
		let testMode = true
		if ((process.env.NODE_ENV !== 'development' || testMode) && axiosMode) checkAuth()
	  }, [checkAuth, axiosMode]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사

	return (
		<Sheet
			variant="outlined"
			sx={{
				borderRadius: 'sm',
				p: 1,
				m: '1rem',
				display: 'flex',
				flexDirection: 'column',
				height: '100%'
			}}
		>
			<Box sx={{ 
				height: '36px',
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
				>자료 열람</Typography>
			</Box>
			<Divider component="div" sx={{ my: 1 }} />
			<Box sx={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				p: '0px 5px',
				overflow: 'auto'
			}}>
				<Box
					className="SearchAndFilters-tabletUp"
					sx={{
						borderRadius: "sm",
						py: 2,
						display: { xs: "none", sm: "flex" },
						gap: 1.5,
						"& > *": {
							minWidth: { xs: "120px", md: "160px" }
						}
					}}
				>
					<FormControl size="md" sx={{ width: '100%' }}>
						<FormLabel>자료</FormLabel>
						<Select
							size="md"
							placeholder="자료 종류 선택"
							slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
							value={enchiridionType}
							onChange={(_, value) => setEnchiridionType(value ?? "")}
							sx={{ background: '#ffffff' }}
						>
							{enchiridionTypeList.map((enchiridionType, index) => {
								return (
									<Option key={index} value={enchiridionType}>{`${enchiridionType}`}</Option>
								)
							})}
						</Select>
					</FormControl>
					<FormControl size="md" sx={{ width: '100%' }}>
						<FormLabel>회차</FormLabel>
						<Select
							size="md"
							placeholder="회차 선택"
							slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
							value={selectedEnchiridion}
							onChange={(_, value) => setSelectedEnchiridion(value)}
							sx={{ background: '#ffffff' }}
						>
							{enchiridionList.map((enchiridion, index) => {
								return (
									<Option key={index} value={enchiridion}>{`${enchiridion.inspected}`}</Option>
								)
							})}
						</Select>
					</FormControl>
				</Box>
			</Box>
			<Box sx={{ 
				flex: '1 1 0',
				overflow: 'auto',
				'&::-webkit-scrollbar': {
					width: '10px'  
				},
				'&::-webkit-scrollbar-thumb': {
					background: 'rgba(110, 162, 213)',
					borderRadius: '10px'
				},
				'&::-webkit-scrollbar-track': {
					background: 'rgba(110, 162, 213, .1)'
				}
			}}>
				{selectedEnchiridion?.file_urls.map((url, index) => {
					console.log(selectedEnchiridion)
					return (
						<Stack key={index}>
							<img style={{ width: '100%'}} src={`${BASE_FILE_URL}${url}`} alt=""></img>
						</Stack>						
					)
				})}
			</Box>
		</Sheet>
	)
}

export default Enchiridion
