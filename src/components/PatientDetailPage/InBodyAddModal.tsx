import { useState, useMemo } from 'react'
import { InBodyTable } from './'
import { ResponsiveBar } from '@nivo/bar'
import { scaleLinear } from 'd3-scale'
import OcrParser from '../commons/OcrParser'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styles from './InBodyAddModal.module.css'
import classNames from 'classnames/bind';

const InBodyAddModal = ({show, handleClose, isNew=false, cv}: {show: any, handleClose: ()=> void, isNew?: boolean, cv: any}) => {
    const cx = classNames.bind(styles);

    const [imooveType, setImooveType] = useState("")
    const [strength, setStrength] = useState("")
    const [code, setCode] = useState("")
    const [duration, setDuration] = useState("")
    const [sensitivity, setSensitivity] = useState("")
    const [exDate, setExDate] = useState("")

    const [supportStability, setSupportStability] = useState("")
    const [supportDistributionL, setSupportDistributionL] = useState("")
    const [supportDistributionR, setSupportDistributionR] = useState("")
    const [supportPoints, setSupportPoints] = useState("")

    const [trunkStability, setTrunkStability] = useState("")
    const [trunkDistributionL, setTrunkDistributionL] = useState("")
    const [trunkDistributionR, setTrunkDistributionR] = useState("")
    const [trunkPoints, setTrunkPoints] = useState("")

    const [posturalCoordination, setPosturalCoordination] = useState("")
    const [posturalPoints, setPosturalPoints] = useState("")
    const [posturalStrategy, setPosturalStrategy] = useState("")

    const onChangeOcrResult = (result: any) => {
        setStrength(result['strength'])
        setCode(result['code'])
        setDuration(result['duration'])
        setSensitivity(result['sensitivity'])
        setExDate(new Date(result['exDate']).toLocaleDateString('en-CA'))
        
        setSupportStability(result['supportStability'].replace(/[^0-9]/g, ""))
        setSupportDistributionL(result['supportDistribution'].split('/')[0].replace(/[^0-9]/g, ""))
        setSupportDistributionR(result['supportDistribution'].split('/')[1].replace(/[^0-9]/g, ""))
        setSupportPoints(result['supportPoints'].replace(/[^0-9]/g, ""))

        setTrunkStability(result['trunkStability'].replace(/[^0-9]/g, ""))
        setTrunkDistributionL(result['trunkDistribution'].split('/')[0].replace(/[^0-9]/g, ""))
        setTrunkDistributionR(result['trunkDistribution'].split('/')[1].replace(/[^0-9]/g, ""))
        setTrunkPoints(result['trunkPoints'].replace(/[^0-9]/g, ""))

        setPosturalCoordination(result['posturalCoordination'].replace(/[^0-9.]/g, ""))
        setPosturalPoints(result['posturalPoints'].replace(/[^0-9]/g, ""))
        setPosturalStrategy(`${result['posturalPoints'].replace(/[^0-9]/g, "")/10}`)
    }
    const handleIMOOVETypeRadioChange = (e: any) => {
        setImooveType(e.target.id.split("-").pop())
    }

    const renderSelected = () => {
    }

    const addPatient = () => {
        console.log(
            "\nType: " + imooveType,
            "\nStrength: " + strength,
            "\nCode: " + code,
            "\nDuration: " + duration,
            
        )
        handleClose()
    }

    const headers = useMemo(
        () => [
            {
                Header: "",
                accessor: "type",
            },
            {
                Header: "측정치",
                accessor: "estimation",
            },
            {
                Header: "체수분",
                accessor: "body_water",
            },
            {
                Header: "근육량",
                accessor: "muscle_mass",
            },
            {
                Header: "제지방량",
                accessor: "lean_body_mass",
            },
            {
                Header: "체중",
                accessor: "weight",
            },
        ],
        []
    )

    const RowTitle = ({koTitle, enTitle, unit}: {koTitle: string, enTitle: string, unit: string}) => {
        return (
            <div className={cx("row-title")}>
                <div className={cx("row-title-ko-wrapper")}>
                    <div className={cx("row-title-ko")}>
                        {koTitle}
                    </div>
                    <div className={cx("row-title-unit")}>
                        {`(${unit})`}
                    </div>
                </div>
                <div className={cx("row-title-en")}>
                    {enTitle}
                </div>
            </div>
        )
    }

    const Entry = ({value}: {value: number}) => {
        return (
            <div className={cx("entry")}>
                <Form.Control
                    type="number"
                    value={value}
                    className="text-center"
                ></Form.Control>
            </div>
        )
    }

    const EntryWithMinMax = ({value, min, max, isHeader=false}: {value: number, min: number, max: number, isHeader?: boolean}) => {
        return (
            <div className={`${cx("entry-wrapper")} ${isHeader ? cx("entry-header") : cx("entry-contents")}`}>
                <Entry value={value}></Entry>
                <div className={cx("min-max")}>
                    <InputGroup>
                        <Form.Control
                            size="sm"
                            type="number"
                            className="text-center"
                            value={min}    
                            >
                        </Form.Control>
                        <div>~</div>
                        <Form.Control
                            size="sm"
                            type="number"
                            className="text-center"
                            value={max}    
                        >
                        </Form.Control>
                    </InputGroup>
                </div>
            </div>
        )
    }

    const weight = 66.4
    const standardMinWeight = 59.0

    const sMM = 29.0
    const standardMinSMM = 29.8

    const bFM = 14.0
    const standardMinbFM = 8.3

    const items = useMemo(
        () => 
          [
          {
            type: <RowTitle koTitle="체수분" enTitle="Total Body Water" unit="L"></RowTitle>,
            estimation: <EntryWithMinMax value={38.7} min={39.1} max={47.7} isHeader={true}></EntryWithMinMax>,
            body_water: <Entry value={38.7}></Entry>,
            muscle_mass: <EntryWithMinMax value={49.6} min={38.7} max={61.3}></EntryWithMinMax>,
            lean_body_mass: <EntryWithMinMax value={52.4} min={53.1} max={64.9}></EntryWithMinMax>,
            weight: <EntryWithMinMax value={66.4} min={38.7} max={79.8}></EntryWithMinMax>,
          },
          {
            type: <RowTitle koTitle="단백질" enTitle="Protein" unit="kg"></RowTitle>,
            estimation: <EntryWithMinMax value={10.3} min={10.4} max={12.8} isHeader={true}></EntryWithMinMax>,
          },
          {
            type: <RowTitle koTitle="무기질" enTitle="Minerals" unit="kg"></RowTitle>,
            estimation: <EntryWithMinMax value={3.43} min={3.61} max={4.41} isHeader={true}></EntryWithMinMax>,
          },
          {
            type: <RowTitle koTitle="체지방" enTitle="Body Fat Mass" unit="kg"></RowTitle>,
            estimation: <EntryWithMinMax value={14.0} min={8.3} max={16.7} isHeader={true}></EntryWithMinMax>,
          },
        ],
        []
    )
    
    const muscleFatAnalysis = [
        {
            value: [{
                "field": "몸무게",
                "value": weight,
                "percentage": getPercentage(standardMinWeight, 0.85, weight)
            }],
            range: {
                min: 55,
                max: 205,
                tickValues: [55, 70, 85, 100, 115, 130, 145, 160, 175, 190, 205],
                tickSize: calculateTickSize([55, 70, 85, 100, 115, 130, 145, 160, 175, 190, 205]),
            }
        },
        {
            value: [{
                "field": "골격근량",
                "value": sMM,
                "percentage": getPercentage(standardMinSMM, 0.9, sMM)
            }],
            range: {
                min: 70,
                max: 170,
                tickValues: [70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170],
                tickSize: calculateTickSize([70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170])
            }
        },
        {
            value: [{
                "field": "체지방량",
                "value": bFM,
                "percentage": getPercentage(standardMinbFM, 0.8, bFM)
            }],
            range: {
                min: 40,
                max: 520,
                tickValues: [40, 60, 80, 100, 160, 220, 280, 340, 400, 460, 520],
                tickSize: calculateTickSize([40, 60, 80, 100, 160, 220, 280, 340, 400, 460, 520])
            }
            
        }
    ]

    return (
        <Modal show={show} onShow={renderSelected} onHide={handleClose} size='xl'>
            <Modal.Header closeButton>
                <Modal.Title>
                    <span className={cx("title")}>
                        <strong>InBody</strong>
                    </span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className={cx("contents")}>
                    <div className={cx("page-content")}>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")}>
                                <span>파일 업로드</span>
                            </div>
                            <div className={cx("inline")}>
                                <div className={`${cx("cell")} ${cx("text-only")}`}>
                                    <strong>체성분</strong>
                                    <div className={`${cx("cell")} ${cx("smaller")}`}>
                                        <OcrParser 
                                            type={0} 
                                            isMask={true} 
                                            setOcrResult={onChangeOcrResult} 
                                            cv={cv} 
                                            smallSize={true}
                                            indicator={1}
                                            >
                                        </OcrParser>
                                    </div>
                                </div>
                                
                                <div className={`${cx("cell")} ${cx("text-only")}`}>
                                <strong>체수분</strong>
                                    <div className={`${cx("cell")} ${cx("smaller")}`}>
                                        <OcrParser 
                                            type={1} 
                                            isMask={true} 
                                            setOcrResult={onChangeOcrResult} 
                                            cv={cv} 
                                            smallSize={true}
                                            indicator={2}
                                            >
                                        </OcrParser>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")}>
                                <span>체성분 분석</span>
                            </div>
                            <div className={cx("group-content")}>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")}`}>
                                        <InBodyTable headers={headers} items={items} useSelector={false}>
                                        </InBodyTable>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")}>
                                <span>체수분 분석</span>
                            </div>
                            <div className={cx("group-content")}>
                                {muscleFatAnalysis.map((data) => (
                                    <div className={cx("inline")} style={{ height: "80px" }}>
                                        <ResponsiveBar
                                            data={data.value}
                                            keys={[
                                                'percentage'
                                            ]}
                                            indexBy="field"
                                            layout="horizontal"
                                            margin={{ top: 40, right: 50, bottom: 5, left: 60 }}
                                            padding={0.4}
                                            enableLabel={true}
                                            enableGridX={true}
                                            enableGridY={false}
                                            valueScale={{ 
                                                type: 'linear',
                                                min: data.range.min,
                                                max: data.range.max,
                                                clamp: true
                                            }}
                                            indexScale={{ type: 'band', round: true }}
                                            colors={{ scheme: 'nivo' }}
                                            axisLeft={{
                                                tickRotation: -90,
                                                tickPadding: 15,
                                                legendOffset: -20,
                                                legendPosition: 'middle',
                                            }}
                                            axisTop={{
                                                tickValues: data.range.tickValues
                                            }}
                                            axisBottom={null}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")}>
                                <span>골격근/지방 분석</span>
                            </div>
                            <div className={cx("group-content")}>
                                {muscleFatAnalysis.map((data) => (

                                    <div className={cx("inline")} style={{ height: "80px" }}>
                                        <ResponsiveBar
                                            data={data.value}
                                            keys={[
                                                'percentage'
                                            ]}
                                            indexBy="field"
                                            layout="horizontal"
                                            margin={{ top: 40, right: 50, bottom: 5, left: 60 }}
                                            padding={0.4}
                                            enableLabel={true}
                                            enableGridX={true}
                                            enableGridY={false}
                                            valueScale={{ 
                                                type: 'linear',
                                                min: data.range.min,
                                                max: data.range.max,
                                                clamp: true
                                            }}
                                            indexScale={{ type: 'band', round: true }}
                                            colors={{ scheme: 'nivo' }}
                                            axisLeft={{
                                                tickRotation: -90,
                                                tickPadding: 15,
                                                legendOffset: -20,
                                                legendPosition: 'middle',
                                            }}
                                            axisTop={{
                                                tickValues: data.range.tickValues
                                            }}
                                            axisBottom={null}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")}>
                                <span>비만 분석</span>
                            </div>
                            <div className={cx("group-content")}>
                                {muscleFatAnalysis.map((data) => (
                                    <div className={cx("inline")} style={{ height: "80px" }}>
                                        <ResponsiveBar
                                            data={data.value}
                                            keys={[
                                                'percentage'
                                            ]}
                                            indexBy="field"
                                            layout="horizontal"
                                            margin={{ top: 40, right: 50, bottom: 5, left: 60 }}
                                            padding={0.4}
                                            enableLabel={true}
                                            enableGridX={true}
                                            enableGridY={false}
                                            valueScale={{ 
                                                type: 'linear',
                                                min: data.range.min,
                                                max: data.range.max,
                                                clamp: true
                                            }}
                                            indexScale={{ type: 'band', round: true }}
                                            colors={{ scheme: 'nivo' }}
                                            axisLeft={{
                                                tickRotation: -90,
                                                tickPadding: 15,
                                                legendOffset: -20,
                                                legendPosition: 'middle',
                                            }}
                                            axisTop={{
                                                tickValues: data.range.tickValues
                                            }}
                                            axisBottom={null}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className={cx("inline-btn")}>
                    <Button variant="primary" onClick={addPatient}>
                        {isNew ? "추가": "변경"}
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                        취소
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    )
}

const getPercentage = (standardMinValue: number, standardMinRatio: number, value: number) => {
    return Math.round(value / (standardMinValue / standardMinRatio) * 10000)/100
}

const customScale = (tickValues: number[]) => {
    return (
        scaleLinear()
        .domain([0, tickValues.length - 1]) // 눈금 인덱스에 대응하는 도메인
        .range(tickValues)
    )
} // 실제 눈금 값들

//const scaledValues = Array.from({ length: tickValues.length }, (_, index) => customScale(index));

const calculateTickSize = (tickValues: number[]) => {
    let tickIntervals = tickValues.slice(1).map((value, index) => value - tickValues[index])
    let minTickGap = Math.min(...tickIntervals);
    return minTickGap * 0.8; // 적절한 계수를 조절하여 시각적으로 일정한 간격을 유지
  };

export default InBodyAddModal
