import React, { useState, useEffect } from 'react'
import { useLocalTokenValidation } from '../../../../api/commons/auth'
import { Report } from './ReportHistory'
import { Box, Divider, FormControl, FormLabel, IconButton, Sheet, Stack, Textarea, Typography } from '@mui/joy'
import { Close } from '@mui/icons-material'
import { DateTimePicker, LocalizationProvider, renderTimeViewClock } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { FormAccordion, FormAccordionDetails, FormAccordionHeader, FormAccordionSummary } from '../InspectionHistory/CustomTheme'
import { SummaryContainer } from '../Summary'

interface ReportViewerProps {
    show: boolean,
    selectedReport: Report | null,
    handleClose: React.Dispatch<React.SetStateAction<boolean>>
}

const ReportHistoryViewer = ({ show, selectedReport, handleClose }: ReportViewerProps) => {
    const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수
    
    const [reportDate, setReportDate] = useState<dayjs.Dayjs>(dayjs())
    const [memo, setMemo] = useState("")
    const [containerKey, setContainerKey] = useState(0)

    useEffect(() => {
		let testMode = true
		if (process.env.NODE_ENV !== 'development' || testMode) checkAuth()
	  }, [checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사

    useEffect(() => {
        if (selectedReport) {
            setReportDate(dayjs(selectedReport.report_date))
            setMemo(selectedReport.memo)
            setContainerKey(prev => prev + 1)
        }
    }, [selectedReport])

    return (
        <Sheet
            variant="outlined"
            sx={{
                position: 'relative',
                borderRadius: 'sm',
                p: 1,
                width: '100%',
                flexShrink: 0,
                left: show ? "-100%" : 0,
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
                    >환자 치료 경과 리포트
                    </Typography>
                    <IconButton
                        variant='plain' 
                        onClick={() => {handleClose(false)}}
                        sx={{ }}
                    ><Close />
                    </IconButton>
            </Box>
            <Divider component="div" sx={{ my: 1 }} />  
            <Box
                className="scrollable vertical"
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    p: '0 5px',
                    margin: '10px 0',
                    alignItems: 'middle',
                    flex: '1 1 0',
                }}
            >    
                <FormAccordion defaultExpanded>
                    <FormAccordionSummary>
                        <FormAccordionHeader>내용</FormAccordionHeader>
                    </FormAccordionSummary>
                    <FormAccordionDetails>
                        <SummaryContainer 
                            key={containerKey}
                            axiosMode={true} 
                            rangeSelectable
                            editable={false}
                            initialValue={selectedReport?.changes}
                        />
                    </FormAccordionDetails>
                </FormAccordion>
                <FormAccordion defaultExpanded>
                    <FormAccordionSummary>
                        <FormAccordionHeader>기타</FormAccordionHeader>
                    </FormAccordionSummary>
                    <FormAccordionDetails>
                        <Stack direction='column' gap={2} sx={{ 
                            justifyContent: 'space-between',
                            p: '0px 5px',
                            alignItems: 'middle'
                        }}>
                        <FormControl size="md">
                            <FormLabel>진료일자</FormLabel>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                                <DateTimePicker 
                                    value={dayjs(reportDate)} 
                                    onChange={(e) => {setReportDate(dayjs(e))}}
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
                                    disabled
                                />
                            </LocalizationProvider>
                        </FormControl>
                        <FormControl size="md">
                            <FormLabel>비고</FormLabel>
                            <Textarea
                                minRows={1}
                                placeholder="기타 사항"
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                                sx={{
                                    backgroundColor: '#ffffff'
                                }}
                                disabled
                            />
                        </FormControl>
                    </Stack>
                    </FormAccordionDetails>
                </FormAccordion>
            </Box>
        </Sheet>
    )
}

export default ReportHistoryViewer
