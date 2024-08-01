import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Divider, IconButton, Sheet, Typography, Button, FormControl, FormLabel, Textarea, Stack } from '@mui/joy'
import { AttachFile, Close } from '@mui/icons-material'
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
import { MuiFileInput } from 'mui-file-input';

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
    handleEditorVisible: (flag: boolean, index?: number) => void, 
    cv?: any,
    children?: React.ReactNode
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
    handleEditorVisible,
    cv=null,
    children=null
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

    const addNewInspection = async () => {
        console.log(contentValidation)
        if (!contentValidation) {
            setSubmitted(true)
            return
        }
        
        await uploadFiles(selectedForm, files, label, config, filesChanged).then((file_urls: string[]) => { 
            const newInspection = {
                file_urls: file_urls,
                inspected: exDate.format(),
                content: content,
                detail: note
            } as DefaultInspection<inspectionContent>

            uploadData(isNew, url, newInspection, label, config, () => handleEditorVisible(false, selectedForm?.id), selectedForm?.id)
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
            setFiles(Array.from({length: fileInputNumber}, () => null))
            setExDate(dayjs())
            setNote("")
            setContent(null)
        }
    }, [isNew, selectedForm, fileInputNumber])

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
                        {useOcr 
                        ? <React.Fragment>
                            {files.map((file, index) => (
                                <Stack key={index}>
                                    <OcrParser 
                                        type={0}
                                        isMask={false}
                                        setOcrResult={(result: object) => setOcrResults([...ocrResults.slice(0, index), result, ...ocrResults.slice(index+1)])}
                                        file={file}
                                        setFile={(file: File | null) => handleFileChange(file, index)}
                                        smallSize={false}
                                        cv={cv}
                                        indicator={0}
                                        label={fileInputLabel ? fileInputLabel[index] : undefined}
                                        index={index}                        
                                    />
                                </Stack>
                            ))}                            
                        </React.Fragment> : 
                        <React.Fragment>
                            {files.map((file, index) => (
                                <Stack key={index}>
                                    <Typography>{fileInputLabel ? fileInputLabel[index] : null}</Typography>
                                    <MuiFileInput
                                        value={file}
                                        onChange={(file) => handleFileChange(file, index)}
                                        InputProps={{
                                            inputProps: { 
                                                accept: '.png, .jpeg, .jpg, .pdf'
                                            },
                                            startAdornment: <AttachFile />
                                        }}
                                        clearIconButtonProps={{
                                            title: "Remove",
                                            children: <Close fontSize="small" />,
                                        }}
                                        label={'파일 선택'}
                                        style={{ padding: 'auto', margin: '10px' }}                                        
                                    />
                                </Stack>
                            ))}                            
                        </React.Fragment> }
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
            <Button variant='soft' onClick={addNewInspection} sx={{ width: '50%', margin: '10px auto' }}>
                {isNew ? "추가": "변경"}
            </Button>
        </Sheet>
    )
}

export default DefaultForm
