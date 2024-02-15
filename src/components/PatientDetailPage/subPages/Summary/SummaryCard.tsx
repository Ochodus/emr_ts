import React, { useState, useMemo, useEffect } from "react";
import Card from 'react-bootstrap/Card'
import { MedicalRecord } from '../MedicalRecord'
import { ResponsiveBump } from '@nivo/bump';
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles.css';
import 'react-date-range-ts/dist/theme/default.css';
import styles from './SummaryContainer.module.css';
import classNames from 'classnames/bind';



const SummaryCard = ({type, axiosMode}: {type: string, axiosMode: boolean}) => {
    const patient_id=4
    const [curPatientRecordData, setCurPatientRecordData] = useState()
    const cx = classNames.bind(styles);

    const getPatientRecords = async () => {

      const accessToken = JSON.parse(JSON.parse(window.localStorage.getItem("persist:auth") ?? "")?.token ?? "")
      
      let config = {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      };

      console.log(patient_id)
  
      try {
        // `/patients?${minParam}=${min}&${maxParam}=${max}&offset=0&count=2`
        const response = await axios.get(
          
          `/api/patients/${patient_id}/medical/records`,
          config
        );
  
        setCurPatientRecordData(response.data)
  
        console.log(response.data);
      } catch (error) {
        console.error("환자 조회 중 오류 발생:", error);
      }
    };

    const headers = useMemo(
        () => [
          {
            Header: "진료 ID",
            accessor: "record_id",
            width: 80
          },
          {
            Header: "진료 날짜",
            accessor: "record_date",
            width: 80
          },
          {
            Header: "증상",
            accessor: "sympotms",
            width: 80
          },
          {
            Header: "진단",
            accessor: "diagnotics",
            width: 80
          },
          {
            Header: "처방",
            accessor: "precriptions",
            width: 80
          },
          {
            Header: "비고",
            accessor: "note",
            width: 80
          },
        ],
        []
    )

    const items = useMemo(
        () => 
          [
          {
            record_id: "15512",
            record_date: "2002.05.17",
            symptoms: "기침, 가래, 콧물",
            diagnotics: "감기",
            prescriptions: "약 두 개",
            note: "임상실험용",
          },
          {
            record_id: "15662",
            record_date: "2002.05.17",
            symptoms: "기침, 가래, 콧물",
            diagnotics: "감기",
            prescriptions: "약 두 개",
            note: "임상실험용",
          },
          {
            record_id: "15512",
            record_date: "2002.05.17",
            symptoms: "기침, 가래, 콧물",
            diagnotics: "감기",
            prescriptions: "약 두 개",
            note: "임상실험용",
          },
        ],
        []
    )

    const data = [
        {
          "id": "Serie 1",
          "data": [
            {
              "x": 2000,
              "y": 7
            },
            {
              "x": 2001,
              "y": 1
            },
            {
              "x": 2002,
              "y": 1
            },
            {
              "x": 2003,
              "y": 5
            },
            {
              "x": 2004,
              "y": 5
            }
          ]
        }
    ]

    useEffect(() => {
      if (axiosMode) getPatientRecords();
    }, [])

    return (
        <Card.Body style={{ minHeight: "200px", height: "300px" }}>
            {
                type === "진료 기록"
                ?   <MedicalRecord isSummaryMode axiosMode={axiosMode}></MedicalRecord>
                :   type === "SMM" ?
                    <ResponsiveBump
                        data={data}
                        colors={{ scheme: 'spectral' }}
                        lineWidth={3}
                        activeLineWidth={6}
                        inactiveLineWidth={3}
                        inactiveOpacity={0.15}
                        pointSize={10}
                        activePointSize={16}
                        inactivePointSize={0}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={3}
                        activePointBorderWidth={3}
                        pointBorderColor={{ from: 'serie.color' }}
                        axisTop={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: '',
                            legendPosition: 'middle',
                            legendOffset: -36
                        }}
                        axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: "",
                            legendPosition: 'middle',
                            legendOffset: 32
                        }}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'ranking',
                            legendPosition: 'middle',
                            legendOffset: -40
                        }}
                        margin={{ top: 40, right: 100, bottom: 40, left: 60 }}
                        axisRight={null}
                    />
                : null
            }
        </Card.Body>
    );
};

export default SummaryCard;
