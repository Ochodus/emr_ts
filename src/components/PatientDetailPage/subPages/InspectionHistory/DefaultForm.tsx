import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Divider, IconButton, Sheet, Typography, Button, FormControl, FormLabel, Textarea, Stack } from '@mui/joy'
import { Close } from '@mui/icons-material'
import { DateTimePicker, LocalizationProvider, renderTimeViewClock } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import utc from "dayjs/plugin/utc"
import 'dayjs/locale/ko'
import { FormAccordion, FormAccordionDetails, FormAccordionHeader, FormAccordionSummary } from './CustomTheme';
import { DefaultInspection, inspectionContent } from 'interfaces/inspectionType.interface';
import OcrParser from 'components/commons/OcrParser';
import { BASE_BACKEND_URL, uploadData, uploadFiles } from 'api/commons/request';
import { CustomSnackbar } from 'components/commons'

dayjs.extend(isLeapYear)
dayjs.extend(utc)
dayjs.locale('ko')

export interface DefaultFormProps<T extends inspectionContent> {
    label: string,
    toggleEditor: boolean,
    isNew?: boolean,
    urlType?: string,
    useOcr?: boolean,
    fileInputNumber?: number,
    fileInputLabel?: string[],
    selectedForm?: DefaultInspection<T> & {id: number} | null,
    ocrIndex?: number[],
    video?: boolean,
    handleEditorVisible: (flag: boolean, index?: number) => void, 
    cv?: any,
    children?: React.ReactNode
    multiple?: boolean
}

const DefaultForm = <T extends inspectionContent>({
    label,
    toggleEditor, 
    isNew=true, 
    urlType="",
    selectedForm=null,
    useOcr=false,
    fileInputNumber=1,
    fileInputLabel,
    ocrIndex=[0],
    video=false,
    handleEditorVisible,
    cv=null,
    children=null,
    multiple=false
}: DefaultFormProps<T>) => {
    const { patient_id } = useParams();
    const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `${BASE_BACKEND_URL}/api/patients/${patient_id}/medical/inspections/${urlType}`

    const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

    const [exDate, setExDate] = useState<dayjs.Dayjs>(dayjs())
    const [note, setNote] = useState("")
    const [files, setFiles] = useState<(File | null)[]>(Array.from({length: fileInputNumber}, () => null))
    const [filesChanged, setFilesChanged] = useState<boolean[]>(Array.from({length: fileInputNumber}, () => false))
    const [ocrResults, setOcrResults] = useState<object[]>(Array.from({length: fileInputNumber}, () => { return {} }))
    const [content , setContent] = useState<T | null>(null)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [contentValidation, setContentValidation] = useState<boolean>(true)

    const [snackbarShow, setSnackbarShow] = useState<boolean>(false)
    const [snackbarType, setSnackbarType] = useState<"danger" | "success">("success")
    const [snackbarMsg, setSnackbarMsg] = useState("")

    const resetForm = useCallback(() => {
        setFiles(Array.from({length: fileInputNumber}, () => null))
        setContent(null)
        setNote("")
        setExDate(dayjs())
    }, [fileInputNumber])

    const addNewInspection = async () => {
        if (!contentValidation) {
            setSnackbarType("danger")
            setSnackbarMsg(`유효하지 않은 입력값이 있습니다.`)
            setSnackbarShow(true)
            setSubmitted(true)
            return
        }
        
        await uploadFiles(selectedForm, files, label, config, filesChanged).then(async (file_urls: string[]) => {
            const newInspection = {
                file_urls: file_urls,
                inspected: exDate.format(),
                content: content,
                detail: note
            } as DefaultInspection<inspectionContent>

            let result = await uploadData(isNew, url, newInspection, label, config, () => handleEditorVisible(false, selectedForm?.id), selectedForm?.id)

            if (result) {
                setSnackbarType("success")
                setSnackbarMsg(`${label} 기록을 ${isNew ? "추가" : "편집"}하였습니다.`)
                setSnackbarShow(true)
                resetForm()
            }
            else {
                setSnackbarType("danger")
                setSnackbarMsg(`${label} 기록을 ${isNew ? "추가" : "편집"}할 수 없습니다.`)
                setSnackbarShow(true) 
            }
        })

        setSubmitted(false)
    }

    const handleFileChange = (file: File | null, index: number) => {
        setFilesChanged([...filesChanged.slice(0, index), true, ...filesChanged.slice(index+1)])
        setFiles([...files.slice(0, index), file, ...files.slice(index+1)])
    }

    useEffect(() => {
        if (!isNew && selectedForm) {
            setExDate(dayjs(selectedForm.inspected))
            setNote(`${selectedForm.detail}`)
            setContent(selectedForm.content)
        }
        if (isNew) {
            resetForm()
        }
    }, [isNew, selectedForm, fileInputNumber, resetForm])

    return (
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
                >{label} {isNew ? "추가" : "편집"}
                </Typography>
                <IconButton
                    variant='plain' 
                    onClick={() => handleEditorVisible(false)}
                    sx={{ }}
                ><Close />
                </IconButton>
            </Box>
            <Divider component="div" sx={{ my: 1 }} />   
            <Box
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    p: '0 5px',
                    margin: '10px 0',
                    alignItems: 'middle',
                    overflow: 'auto',
                    flex: '1 1 0',
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
                }}
            >      
                <FormAccordion defaultExpanded>
                    <FormAccordionSummary>
                        <FormAccordionHeader>파일 업로드</FormAccordionHeader>
                    </FormAccordionSummary>
                    <FormAccordionDetails>
                        <Stack gap={4}>
                            {files.map((file, index) => (
                                <OcrParser 
                                    key={index}
                                    setOcrResult={(result: object) => setOcrResults([...ocrResults.slice(0, index), result, ...ocrResults.slice(index+1)])}
                                    file={file}
                                    setFile={(file: File | null) => handleFileChange(file, index)}
                                    cv={cv}
                                    label={fileInputLabel ? fileInputLabel[index] : undefined}
                                    index={ocrIndex[index]}    
                                    useOcr={useOcr}
                                    multiple={multiple}
                                    video={video}             
                                />
                            ))}                            
                        </Stack>
                    </FormAccordionDetails>
                </FormAccordion>
                {children ? React.cloneElement(children as React.ReactElement, {content, ocrResults, submitted, setContent, setContentValidation, setExDate}) : null}
                <FormAccordion defaultExpanded>
                    <FormAccordionSummary>
                        <FormAccordionHeader>기타</FormAccordionHeader>
                    </FormAccordionSummary>
                    <FormAccordionDetails>
                        <Stack direction='column' gap={2}>
                            <FormControl size="md">
                                <FormLabel>진료일자</FormLabel>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                                    <DateTimePicker 
                                        value={dayjs(exDate)} 
                                        onChange={(e) => {setExDate(dayjs(e))}}
                                        orientation="portrait"
                                        viewRenderers={{
                                            hours: renderTimeViewClock,
                                            minutes: renderTimeViewClock,
                                            seconds: renderTimeViewClock
                                        }}
                                        format="YYYY/MM/DD a hh:mm"
                                        sx={{
                                            backgroundColor: '#ffffff'
                                        }}
                                        ampm
                                    />
                                </LocalizationProvider>
                            </FormControl>
                            <FormControl>
                                <FormLabel>특이 사항</FormLabel>
                                <Textarea
                                    placeholder="내용 입력"
                                    value={note}
                                    minRows={1}
                                    onChange={(e) => setNote(e.target.value)}
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                            </FormControl>
                        </Stack>
                    </FormAccordionDetails>
                </FormAccordion>
            </Box>
            <CustomSnackbar
                open={snackbarShow}
                snackbarMsg={snackbarMsg}
                color={snackbarType}
                onClose={() => {
                    setSnackbarShow(false);
                }}
            />
            <Button variant='soft' onClick={addNewInspection} sx={{ width: '50%', margin: '10px auto' }}>
                {isNew ? "추가": "변경"}
            </Button>
        </Sheet>
    )
}

export default DefaultForm
