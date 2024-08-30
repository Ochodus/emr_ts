import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MedicalRecord } from '../MedicalRecord'
import { Datum, LineSvgProps, ResponsiveLine, Serie } from '@nivo/line';
import { LegendProps } from '@nivo/legends'
import axios, { AxiosResponse } from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles.css';
import 'react-date-range-ts/dist/theme/default.css';
import { useParams } from "react-router-dom";
import { PhysicalExam } from "../../../../interfaces";
import { SummaryCardType } from "./SummaryContainer";
import { Box, Chip, Divider, FormControl, FormLabel, IconButton, Select, Sheet, Typography, Option, Stack, Textarea } from "@mui/joy";
import { Close } from "@mui/icons-material";
import { DefaultInspection, ExbodyContent, ImooveContent, InBodyContent, LookinBodyContent, PhysicalPerformanceContent } from "../../../../interfaces/inspectionType.interface";
import { BASE_BACKEND_URL } from "api/commons/request";
import cloneDeep from 'lodash/cloneDeep'
import dayjs from "dayjs";
import { GridGraphData, SelectedGraphRange } from "../ReportHistory/ReportHistoryAddModal";

const defaultGraphProps: LineSvgProps = {
  data: [],
  margin: { top: 20, right: 50, bottom: 80, left: 60 },
  xScale: { format: "%Y-%m-%d", type: 'time', precision: "day" },
  xFormat: "time:%Y-%m-%d",
  yScale: {
    type: 'linear',
    min: 'auto',
    max: 'auto',
    stacked: false,
    reverse: false,
  },
  gridYValues: 5,
  axisTop: null,
  axisRight: null,
  axisBottom: {
    tickValues: 8,
    tickSize: 5,
    tickPadding: 5,
    tickRotation: -55,
    format: "%Y.%m.%d",
    legend: "시간",
    legendOffset: 70,
    legendPosition: "middle"
  },
  axisLeft: {
      tickValues: 5,
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "",
      legendPosition: 'middle',
      legendOffset: -40
  },
  gridXValues: [1, 2, 5],
  pointSize: 10,
  pointColor: { theme: 'background' },
  pointBorderWidth: 2,
  pointBorderColor: { from: 'serieColor' },
  pointLabelYOffset: -12,
  enableCrosshair: true,
  useMesh: true 
}

const defaultLegendProps: LegendProps[] = [{
  anchor: 'top-left',
  direction: 'column',
  justify: false,
  translateX: 10,
  translateY: 0,
  itemsSpacing: 0,
  itemDirection: 'left-to-right',
  itemWidth: 200,
  itemHeight: 20,
  itemOpacity: 0.75,
  symbolSize: 12,
  symbolShape: 'circle',
  symbolBorderColor: 'rgba(0, 0, 0, .5)',
  toggleSerie: true,
  effects: [
      {
        on: 'hover',
        style: {
            itemBackground: 'rgba(0, 0, 0, .03)',
            itemOpacity: 1
        }
          
      }
  ]
}]

interface SummaryCardProps {
  cardType: SummaryCardType, 
  axiosMode: boolean, 
  rowIndex: number, 
  colIndex: number, 
  rangeSelectable: boolean,
  start?: string | number,
  end?: string | number,
  graphContainerKey: number,
  useNote?: boolean,
  editable?: boolean,
  cardClose: (row: number, col: number) => void, 
  onRangeChange: (value: SelectedGraphRange[], col_index: number, row_index: number) => void
  onTextChange: (value: string, col_index: number, row_index: number) => void
}

const SummaryCard = ({cardType, 
  axiosMode, 
  rowIndex, 
  colIndex, 
  rangeSelectable=false,
  start,
  end,
  graphContainerKey,
  useNote=false,
  editable=true,
  cardClose, 
  onRangeChange,
  onTextChange
}: SummaryCardProps) => {
  const { patient_id } = useParams()

  const accessToken = JSON.parse(JSON.parse(window.localStorage.getItem("persist:auth") ?? "")?.token ?? "")
  
  const config = useMemo(() => {
    return {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  }, [accessToken])

  const [graphData, setGraphData] = useState<Serie[]>([])
  const [yLabel, setYLabel] = useState<string>("")

  const [graphProps, setGraphProps] = useState(defaultGraphProps)
  const [ranges, setRanges] = useState<{start: number, end: number}[]>([])
  const [slicedGraphData, setSlicedGraphData] = useState<Serie[]>([])
  const [memo, setMemo] = useState((cardType as GridGraphData).memo ?? "")

  const getDataPoint = useCallback(<T, K extends keyof T>(object: T, path: string[]): T[K] => {
    if (path.length === 0) return object as T[K]
    else return getDataPoint(object[path[0] as keyof T] as T, path.slice(1))
  }, [])

  const getData = useCallback(async <T,>(url: string, id: string, path: string[], datePath: string[], graphProps?: Partial<LineSvgProps>) => {
    try {
      const response: AxiosResponse<T[], any> = await axios.get(
        `${BASE_BACKEND_URL}${url}`,
        config
      )
      
      let data = response.data.map((value) => {
        let time = new Date(getDataPoint(value, datePath) as string)
        return {x: time, y: +getDataPoint(value, path)}
      })

      data.sort((a: Datum, b: Datum): number => {
        if (a.x && b.x) {
          if (a.x < b.x) return -1;
          if (a.x > b.x) return 1;
        }
        return 0;
      });

      setGraphData([{ "id": id, "data": data }])
      
      setYLabel(id)
      setGraphProps({...defaultGraphProps, ...graphProps})
    } catch (error) {
      console.error("데이터 조회 중 오류 발생:", error);
    }
  }, [config, getDataPoint])

  useEffect(() => {
    if (graphData.length === 0) return
    let result = graphData.map((datum, index) => {
      return (
        {...datum, data: datum.data.slice(
          datum.data.findIndex((value) => (value.x as Date).getTime() === ranges[index]?.start) ?? 0,
          (datum.data.findIndex((value) => (value.x as Date).getTime() === ranges[index]?.end) ?? 0) + 1
        )}
      )
    })
    setSlicedGraphData(result.every((datum) => datum.data.length > 0) ? result : graphData)
  }, [graphData, ranges, end, start])

  useEffect(() => {
    if (graphData.length === 0) return
    setRanges(graphData.map((datum) => {
      return (
        {start: start ? (new Date(start)).getTime() : (datum.data[0].x as Date).getTime(), end: end ? (new Date(end)).getTime() : (datum.data[datum.data.length - 1].x as Date).getTime()}
      )
    }))
  }, [graphData, start, end])

  useEffect(() => {
    onRangeChange(ranges, colIndex, rowIndex)
  }, [ranges, colIndex, rowIndex, onRangeChange])

  useEffect(() => {
    onTextChange(memo, colIndex, rowIndex)
  }, [memo, colIndex, rowIndex, onTextChange])

  useEffect(() => {
    if (cardType.type === "Physical Exam") getData<PhysicalExam>(`/api/patients/${patient_id}/medical/physical_exam`, cardType.name, cardType.path, ['recorded'])
    if (cardType.type === "IMOOVE") getData<DefaultInspection<ImooveContent[]>>(`/api/patients/${patient_id}/medical/inspections?inspection_type=IMOOVE`, cardType.name, cardType.path, ['inspected'])
    if (cardType.type === "InBody") getData<DefaultInspection<InBodyContent>>(`/api/patients/${patient_id}/medical/inspections?inspection_type=INBODY`, cardType.name, cardType.path, ['inspected'])
    if (cardType.type === "Exbody") getData<DefaultInspection<ExbodyContent>>(`/api/patients/${patient_id}/medical/inspections?inspection_type=EXBODY`, cardType.name, cardType.path, ['inspected'])
    if (cardType.type === "운동능력검사") getData<DefaultInspection<PhysicalPerformanceContent>>(`/api/patients/${patient_id}/medical/inspections?inspection_type=PHYSICAL_PERFORMANCE`, cardType.name, cardType.path, ['inspected'])
    if (cardType.type === "Lookin' Body") getData<DefaultInspection<LookinBodyContent>>(`/api/patients/${patient_id}/medical/inspections?inspection_type=LOOKINBODY`, cardType.name, cardType.path, ['inspected'], {legends: defaultLegendProps})
  }, [getData, patient_id, cardType])

  return (
    <Sheet
      variant="outlined"
      sx={{
        borderRadius: 'sm',
        p: 1,
        width: '100%'
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
            color: '#32383e'
          }}
          margin="auto 0"
        >
          {cardType.name}
        </Typography>
        {editable && 
          <IconButton>
            <Close 
              onClick={() => {cardClose(rowIndex, colIndex)}} 
              style={{ margin: 'auto 0' }}
            />
          </IconButton>
        }        
      </Box>
      <Divider component="div" sx={{ my: 1 }} />
      {rangeSelectable &&
        graphData.map((datum, index) => {
          return (
            ranges[index] ? 
            <Stack key={index} direction='row' sx={{ px: 5, py: 2 }} gap={2}>
              <FormControl size="md" sx={{ flex: '1 1 0' }}>
                <FormLabel> {`범위 선택: ${datum.id}`} </FormLabel>
                <Select
                  size="md"
                  placeholder="진단 선택"
                  defaultValue={start !== undefined ? (new Date(start)).getTime() : (datum.data[0].x as Date).getTime()}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', gap: '0.25rem' }}>
                      <Chip variant="soft" color="primary">
                        {selected?.label}
                      </Chip>
                    </Box>
                  )}
                  slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                  onChange={(_, value) => {
                    if (value !== null) setRanges([...ranges.slice(0, index), {...ranges[index], start: value}, ...ranges.slice(index + 1)])
                  }}
                  sx={{
                    backgroundColor: '#ffffff'
                  }}
                  disabled={!editable}
                >
                  {datum.data.map((value, index) => {
                    return (
                      <Option value={(value.x as Date).getTime()} key={index}>{dayjs(value.x).format('YYYY-MM-DD')}</Option>
                    )
                  })}
                </Select>
              </FormControl>
              <Divider orientation="vertical" />
              <FormControl size="md" sx={{ flex: '1 1 0' }}>
                <FormLabel><br/></FormLabel>
                <Select
                  size="md"
                  placeholder="진단 선택"
                  defaultValue={end !== undefined ? (new Date(end)).getTime() : (datum.data[datum.data.length - 1].x as Date).getTime()}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', gap: '0.25rem' }}>
                      <Chip variant="soft" color="primary">
                        {selected?.label}
                      </Chip>
                    </Box>
                  )}
                  slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                  onChange={(_, value) => {
                    if (value !== null) setRanges([...ranges.slice(0, index), {...ranges[index], end: value}, ...ranges.slice(index + 1)])
                  }}
                  sx={{
                    backgroundColor: '#ffffff'
                  }}
                  disabled={!editable}
                >
                  {datum.data.map((value, index) => {
                    return (
                      <Option value={(value.x as Date).getTime()} key={index}>{dayjs(value.x).format('YYYY-MM-DD')}</Option>
                    )
                  })}
                </Select>
              </FormControl>
            </Stack> : null
          )
        })          
      }        
      <Box sx={{
          justifyContent: 'center',
          p: '0px 5px'
        }}
      >
        <Sheet 
          sx={{
            minHeight: '300px',
            width: '100%',
            display: 'flex'
          }}
        >
          <div style={{ width: '100%', flexGrow: '1' }}>
            {cardType.type === "진료 기록" && <MedicalRecord isSummaryMode axiosMode={axiosMode} />}
            {cardType.type !== "진료 기록" && 
              <ResponsiveLine 
                key={graphContainerKey}
                {...graphProps} 
                data={
                  cloneDeep(slicedGraphData)
                }
                axisLeft={{...graphProps.axisLeft, legend: yLabel}} 
              />
            }
          </div>
        </Sheet>
      </Box>
      {useNote &&
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
              disabled={!editable}
          />
        </FormControl>
      }
    </Sheet>
  );
};

export default SummaryCard;
