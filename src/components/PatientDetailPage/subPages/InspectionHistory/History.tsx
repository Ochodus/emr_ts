import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Alert, TableMui, TooltippedIconButton } from '../../../commons';
import axios from 'axios';
import { useLocalTokenValidation } from 'api/commons/auth';
import { DefaultForm } from '.';
import cv from "opencv-ts";
import { DefaultInspection, ExbodyContent, ImooveContent, InBodyContent, inspectionContent, LookinBodyContent, PhysicalPerformanceContent } from '../../../../interfaces/inspectionType.interface';
import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import utc from "dayjs/plugin/utc"
import 'dayjs/locale/ko'
import { Box, Divider, Sheet, Stack, Tooltip, Typography } from '@mui/joy';
import { Delete, EditNote, PostAdd } from '@mui/icons-material';
import { HeadCell, ID } from '../../../commons/TableMui';
import ImooveContentForm from './ImooveContentForm';
import InBodyContentForm from './InBodyContentForm';
import ExBodyContentForm from './ExBodyContentForm';
import LookinBodyContentForm from './LookinBodyContentForm';
import PhysicalPerformanceContentForm from './PhysicalPerformanceContentForm';
import { prettyPrint } from 'api/commons/utils';
import { BASE_BACKEND_URL } from 'api/commons/request';

dayjs.extend(isLeapYear)
dayjs.extend(utc)
dayjs.locale('ko')

const HistoryModal = ({ type }: { type: string}) => {
    const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수
    const { patient_id } = useParams();

    const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `${BASE_BACKEND_URL}/api/patients/${patient_id}/medical/inspections?inspection_type`

    const [inspectionData, setInspectionData] = useState<(DefaultInspection<inspectionContent> & ID)[]>([])
    const [selectedInspection, setSelectedInspection] = useState<DefaultInspection<inspectionContent>>()
    
    const [selected, setSelected] = React.useState<number[]>([]);
    const [isNewRecord, setIsNewRecord] = useState(false) // 모달의 추가/편집 모드
    const [toggleEditor, setToggleEditor] = useState<boolean>(false)
    const [showDeletionAlert, setShowDeletionAlert] = useState<boolean>(false)

    const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

    const headCells: HeadCell<DefaultInspection<inspectionContent> & ID>[] = [
		{
		  id: 'inspected',
		  numeric: false,
		  label: '검사일자',
          sortable: true,
          parse: (value: (DefaultInspection<inspectionContent> & ID)[keyof (DefaultInspection<inspectionContent> & ID)]) => {
			return dayjs(value?.toString()).format('YYYY년 MM월 DD일 HH시 mm분')
		  }
		},
		{
		  id: 'content',
		  numeric: false,
		  label: '내용',
          sortable: true,
            parse: (value: (DefaultInspection<inspectionContent> & ID)[keyof (DefaultInspection<inspectionContent> & ID)]) => {
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
		  id: 'detail',
		  numeric: true,
		  label: '비고',
          sortable: true
		}
	];

    const handleEditorVisible = (flag: boolean, id?: number) => {
        setToggleEditor(flag)
        if (!flag) getAllInspections(type)
        else if (inspectionData !== undefined && id !== undefined) {
            setSelectedInspection(inspectionData.filter(value => value.id === id)[0])
        }
    }

    const handleInspectionDelete = async (ids: number[]) => {
        ids.forEach(async (id) => {
            try {
                await axios.delete(
                    `${BASE_BACKEND_URL}/api/patients/${patient_id}/medical/inspections/${id}`,
                    config
                )
                getAllInspections(type)
                setSelected([])
            } catch (error) {
                console.error("기록 삭제 중 오류 발생:", error)
            }
        })
    }

    const getAllInspections = useCallback(async (type: string) => {
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
                    type === "정렬 사진" ? "ALIGNMENT" : 
                    type === "평지 보행 동영상" ? "FOOTPATH" :
                    ""
                }`,
				config
			)
			setInspectionData(response.data)
		} catch (error) {
			console.error("환자 조회 중 오류 발생:", error)
		}
	}, [config, url]) // 전체 환자 목록 가져오기

	useEffect(() => {
		if ((process.env.NODE_ENV !== 'development')) checkAuth()
        getAllInspections(type)
	}, [type, getAllInspections, checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사

    return (
        <Box
	  		sx={{
				display: 'flex',
                overflow: 'hidden',
                height: '100%'
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
						
					>{type}
					</Typography>
					<Stack direction='row'
						sx={{ transition: 'width 0.4s ease' }}
					>
                        <TooltippedIconButton
                            tooltipString="추가"
                            onClick={() => {setIsNewRecord(true); handleEditorVisible(true)}}
                        >
                            <PostAdd />
                        </TooltippedIconButton>
                        <TooltippedIconButton
                            tooltipString="편집"
                            onClick={() => {setIsNewRecord(false); handleEditorVisible(true, selected[0])}}
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
				<Box
                    className="scrollable vertical"
                        sx={{
                        flexDirection: 'column',
                        justifyContent: 'center',
                        m: '5px',
                        flex: '1 1 0'
                    }}>
					<TableMui<DefaultInspection<inspectionContent> & ID>
						headCells={headCells} 
						rows={inspectionData}
						defaultRowNumber={20}
						selected={selected}
						setSelected={setSelected}
					/>
				</Box>
			</Sheet>
            {type === "IMOOVE" && 
                <DefaultForm
                    label={type}
                    isNew={isNewRecord}
                    urlType={'imoove'}
                    toggleEditor={toggleEditor}
                    selectedForm={selectedInspection as DefaultInspection<ImooveContent[]> & {id: number}}
                    handleEditorVisible={handleEditorVisible}
                    ocrIndex={[1]}
                    multiple
                    useOcr
                    cv={cv}
                >
                    <ImooveContentForm />
                </DefaultForm>
            }
            { type === "InBody" &&
                <DefaultForm
                    label={type}
                    isNew={isNewRecord}
                    urlType={'inbody'}
                    fileInputNumber={2}
                    fileInputLabel={["체성분", "체수분"]}
                    toggleEditor={toggleEditor}
                    selectedForm={selectedInspection as DefaultInspection<InBodyContent> & {id: number}}
                    handleEditorVisible={handleEditorVisible}
                    useOcr
                    ocrIndex={[2,3]}
                    cv={cv}
                >
                    <InBodyContentForm />
                </DefaultForm>
            }
            { type === "X-Ray" &&
                <DefaultForm
                    label={type}
                    isNew={isNewRecord}
                    urlType={'xray'}
                    toggleEditor={toggleEditor}
                    selectedForm={selectedInspection as DefaultInspection<null> & {id: number}}
                    handleEditorVisible={handleEditorVisible}
                    multiple
                    cv={cv}
                />
            }
            { type === "Exbody" &&
                <DefaultForm
                    label={type}
                    isNew={isNewRecord}
                    urlType={'exbody'}
                    toggleEditor={toggleEditor}
                    selectedForm={selectedInspection as DefaultInspection<ExbodyContent> & {id: number}}
                    handleEditorVisible={handleEditorVisible}
                    useOcr
                    ocrIndex={[4]}
                    cv={cv}
                >
                    <ExBodyContentForm></ExBodyContentForm>
                </DefaultForm>
            }
            { type === "Lookin' Body" &&
                <DefaultForm
                    label={type}
                    isNew={isNewRecord}
                    urlType={'lookinbody'}
                    toggleEditor={toggleEditor}
                    selectedForm={selectedInspection as DefaultInspection<LookinBodyContent> & {id: number}}
                    handleEditorVisible={handleEditorVisible}
                    useOcr
                    ocrIndex={[5]}
                    cv={cv}
                >
                    <LookinBodyContentForm></LookinBodyContentForm>
                </DefaultForm>
            }
            { type === "혈액 검사 결과" &&
                <DefaultForm
                    label={type}
                    isNew={isNewRecord}
                    urlType={'blood'}
                    toggleEditor={toggleEditor}
                    selectedForm={selectedInspection as DefaultInspection<null> & {id: number}}
                    handleEditorVisible={handleEditorVisible}
                    multiple
                    cv={cv}
                />
            }
            { type === "설문지" &&
                <DefaultForm
                    label={type}
                    isNew={isNewRecord}
                    urlType={'survey'}
                    toggleEditor={toggleEditor}
                    selectedForm={selectedInspection as DefaultInspection<null> & {id: number}}
                    handleEditorVisible={handleEditorVisible}
                    multiple
                    cv={cv}
                />
            }
            { type === "족저경" &&
                <DefaultForm
                    label={type}
                    isNew={isNewRecord}
                    urlType={'podoscope'}
                    toggleEditor={toggleEditor}
                    selectedForm={selectedInspection as DefaultInspection<null> & {id: number}}
                    handleEditorVisible={handleEditorVisible}
                    multiple
                    cv={cv}
                />
            }
            { type === "운동능력 검사" &&
                <DefaultForm
                    label={type}
                    isNew={isNewRecord}
                    urlType={'physical_performance'}
                    toggleEditor={toggleEditor}
                    selectedForm={selectedInspection as DefaultInspection<PhysicalPerformanceContent> & {id: number}}
                    handleEditorVisible={handleEditorVisible}
                    multiple
                    cv={cv}
                >
                    <PhysicalPerformanceContentForm/>
                </DefaultForm>
            }
            { type === "정렬 사진" &&
                <DefaultForm
                    label={type}
                    isNew={isNewRecord}
                    urlType={'alignment'}
                    toggleEditor={toggleEditor}
                    selectedForm={selectedInspection as DefaultInspection<null> & {id: number}}
                    handleEditorVisible={handleEditorVisible}
                    multiple
                    cv={cv}
                />
            }
            { type === "평지 보행 동영상" &&
                <DefaultForm
                    label={type}
                    isNew={isNewRecord}
                    urlType={'footpath'}
                    toggleEditor={toggleEditor}
                    selectedForm={selectedInspection as DefaultInspection<null> & {id: number}}
                    handleEditorVisible={handleEditorVisible}
                    video
                    cv={cv}
                />
            }
            <Alert 
				showDeletionAlert={showDeletionAlert} 
				setShowDeletionAlert={setShowDeletionAlert} 
				deleteFunction={() => {
					handleInspectionDelete(selected)
					setShowDeletionAlert(false)
					setSelected([])
				}}
			/>
        </Box>
    )
}

export default HistoryModal
