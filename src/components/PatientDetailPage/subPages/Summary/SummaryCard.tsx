import React, { useState, useMemo, useEffect } from "react";
import Card from 'react-bootstrap/Card'
import { MedicalRecord } from '../MedicalRecord'
import { ResponsiveLine } from '@nivo/line';
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles.css';
import 'react-date-range-ts/dist/theme/default.css';
import styles from './SummaryContainer.module.css';
import classNames from 'classnames/bind';
import { useParams } from "react-router-dom";
import { get } from "http";

interface GraphData {
  [index: string]: string | {x: number, y: number}[]
  id: string;
  data: {
      x: number;
      y: number;
  }[];
}

const SummaryCard = ({type, axiosMode}: {type: string, axiosMode: boolean}) => {
    const { patient_id } = useParams()
    const cx = classNames.bind(styles)

    const accessToken = JSON.parse(JSON.parse(window.localStorage.getItem("persist:auth") ?? "")?.token ?? "")
    const config = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }

    const [graphData, setGraphData] = useState<GraphData[]>([])

    const getData = async (url: string, parseFunction: (rawData: any) => GraphData) => {
      try {
        const response = await axios.get(
          url,
          config
        )
          
        setGraphData([parseFunction(response.data)])
      } catch (error) {
        console.error("데이터 조회 중 오류 발생:", error);
      }
    }

    const getWeightData = (rawData: any) => {
      let data = []
      for (let index in rawData) {
        data.push({"x": +index, "y": rawData[index].weight})
      }
      return { "id": "weight", "data": data }
    }

    const getSSMData = (rawData: any) => {
      let data = []
      for (let index in rawData) {
        data.push({"x": +index, "y": rawData[index].skeletal_muscels_fat.skeletal_muscles})
      }
      return { "id": "weight", "data": data }
    }

    useEffect(() => {
      if (type === "Weight") getData(`/api/patients/${patient_id}/medical/physical_exam`, getWeightData)
      if (type === "SSM") getData(`/api/patients/${patient_id}/medical/inspections?inspection_type=INBODY`, getSSMData)
    }, [])

    return (
        <Card.Body style={{ minHeight: "200px", height: "300px" }}>
            {
                type === "진료 기록"
                ?   <MedicalRecord isSummaryMode axiosMode={axiosMode}></MedicalRecord>
                :   type === "Weight" ?
                    <ResponsiveLine
                        data={graphData}
                        margin={{ top: 20, right: 50, bottom: 50, left: 60 }}
                        xScale={{ type: 'point' }}
                        yScale={{
                          type: 'linear',
                          min: 'auto',
                          max: 'auto',
                          stacked: true,
                          reverse: false
                        }}
                        yFormat=" >-.2f"
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: "회차",
                            legendPosition: 'middle',
                            legendOffset: 32
                        }}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: '몸무게',
                            legendPosition: 'middle',
                            legendOffset: -40
                        }}
                        pointSize={10}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: 'serieColor' }}
                        pointLabelYOffset={-12}
                        enableCrosshair={true}
                        useMesh={true}
                    />
                : null
            }
        </Card.Body>
    );
};

export default SummaryCard;
