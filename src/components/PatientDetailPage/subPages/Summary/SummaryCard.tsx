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
import { Box, Divider, IconButton, Sheet, Typography } from "@mui/joy";
import { Close } from "@mui/icons-material";
import { DefaultInspection, ImooveContent, InBodyContent, LookinBodyContent } from "../../../../interfaces/inspectionType.interface";


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

const SummaryCard = ({cardType, axiosMode, rowIndex, colIndex, cardClose, divider}: {cardType: SummaryCardType, axiosMode: boolean, rowIndex: number, colIndex: number, cardClose: (row: number, col: number) => void, divider: number}) => {
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

    const getDataPoint = useCallback(<T, K extends keyof T>(object: T, path: string[]): T[K] => {
      if (path.length === 0) return object as T[K]
      else return getDataPoint(object[path[0] as keyof T] as T, path.slice(1))
    }, [])

    const getData = useCallback(async <T,>(url: string, id: string, path: string[], datePath: string[], graphProps?: Partial<LineSvgProps>) => {
      try {
        const response: AxiosResponse<T[], any> = await axios.get(
          url,
          config
        )
        
        if (id === "Lookin' Body") {
          let inspections: {[index: string]: Datum[]} = {}
          response.data.map((value) => {
            let points = getDataPoint(value, path)
            let inspected = getDataPoint(value, datePath)
            if (Array.isArray(points)) {
              let datum: {[index: string]: {date: Date, value: number}} = {}
              points.forEach((point) => {
                datum[point.name] = {date: new Date(`${inspected}`), value: point.value}
              })
              return datum
            }
            else return {}
          }).forEach((value) => {
            Object.keys(value).forEach(key => {
              if (!inspections[key]) inspections[key] = []
              inspections[key].push({x: value[key].date, y: value[key].value})
              inspections[key].sort((a: Datum, b: Datum): number => {
                if (a.x && b.x) {
                  if (a['x'] < b['x']) return -1
                  if (a['x'] < b['x']) return 1
                }
                return 0
              })
            })
          })

         
          let data = Object.keys(inspections).map(key => {
            return { "id": key, "data": inspections[key] }
          })
          setGraphData(data)
        }
        else {
          let data = response.data.map((value, index) => {
            return {x: new Date(`${getDataPoint(value, datePath)}`), y: +getDataPoint(value, path)}
          })

          data.sort((a: Datum, b: Datum): number => {
            if (a.x && b.x) {
              if (a['x'] < b['x']) return -1
              if (a['x'] < b['x']) return 1
            }
            return 0
          })
          
          setGraphData([{ "id": id, "data": data }])
        }

        setYLabel(id)
        setGraphProps({...defaultGraphProps, ...graphProps})
      } catch (error) {
        console.error("데이터 조회 중 오류 발생:", error);
      }
    }, [config, getDataPoint])

    useEffect(() => {
      if (cardType.type === "Physical Exam") getData<PhysicalExam>(`/api/patients/${patient_id}/medical/physical_exam`, cardType.name, cardType.path, ['recorded'])
      if (cardType.type === "IMOOVE") getData<DefaultInspection<ImooveContent>>(`/api/patients/${patient_id}/medical/inspections?inspection_type=IMOOVE`, cardType.name, cardType.path, ['inspected'])
      if (cardType.type === "InBody") getData<DefaultInspection<InBodyContent>>(`/api/patients/${patient_id}/medical/inspections?inspection_type=INBODY`, cardType.name, cardType.path, ['inspected'])
      if (cardType.type === "Lookin' Body") getData<DefaultInspection<LookinBodyContent>>(`/api/patients/${patient_id}/medical/inspections?inspection_type=LOOKINBODY`, cardType.name, cardType.path, ['inspected'], {legends: defaultLegendProps})
    }, [getData, patient_id, cardType])

    useEffect(() => {console.log(graphData)}, [graphData])

    return (
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: 'sm',
          p: 1,
          flex: '1 1 auto'
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
          <IconButton>
            <Close 
              onClick={() => {cardClose(rowIndex, colIndex)}} 
              style={{ margin: 'auto 0' }}
            />
          </IconButton>
        </Box>
        <Divider component="div" sx={{ my: 1 }} />
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            p: '0px 5px'
          }}
        >
          <Sheet sx={{
            minHeight: '300px',
            width: '300px',
            overflow: "auto",
            flex: '1 1 auto',
            '&::-webkit-scrollbar': {
              display: 'none'
            }
          }}>
            {cardType.type === "진료 기록" && <MedicalRecord isSummaryMode axiosMode={axiosMode} />}
            {cardType.type !== "진료 기록" && <ResponsiveLine {...graphProps} data={graphData} axisLeft={{...graphProps.axisLeft, legend: yLabel}} />}
          </Sheet>
        </Box>
      </Sheet>
    );
};

export default SummaryCard;
