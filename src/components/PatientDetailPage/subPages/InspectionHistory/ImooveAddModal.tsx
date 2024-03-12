import { useMemo, useState } from 'react'
import OcrParser from '../../../commons/OcrParser'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styles from './ImooveAddModal.module.css'
import classNames from 'classnames/bind';
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useDateTimeParser } from '../../../../api/commons/dateTimeParse'

export interface Imoove {
    file_url: string,
    inspected: string,
    content: {
        type: string,
        strength: number,
        code: string,
        time: number,
        sensitivity: number,
        supports: {
            stability: number,
            distribution: {
                denominator: number,
                numerator: number,
                points: number
            }
        },
        trunk: {
            stability: number,
            distribution: {
                denominator: number,
                numerator: number,
                points: number
            }
        },
        postural_coordination: {
            value: number,
            point: number
        },
        postural_strategy: number
    },
    detail: string
}

const ImooveAddModal = ({show, handleClose, isNew=true, selectedImoove=null, cv}: { show: boolean, handleClose: () => void, isNew?: boolean, selectedImoove?: Imoove & {id: number} | null, cv: any }) => {
    const cx = classNames.bind(styles);
    const dateParse = useDateTimeParser()

    const { patient_id } = useParams();
    const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `/api/patients/${patient_id}/medical/inspections/imoove`

    const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

    const [imooveType, setImooveType] = useState("")
    const [strength, setStrength] = useState("")
    const [code, setCode] = useState("")
    const [duration, setDuration] = useState("")
    const [sensitivity, setSensitivity] = useState("")
    const [exDate, setExDate] = useState(new Date())

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

    const [memo, setMemo] = useState("")

    const [file, setFile] = useState<File>()

    const onChangeOcrResult = (result: any) => {
        setStrength(result['strength'])
        setCode(result['code'])
        setDuration(result['duration'])
        setSensitivity(result['sensitivity'])
        setExDate(new Date(result['exDate']))
        
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
    const handleIMOOVETypeRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImooveType(e.target.id.split("-").pop() ?? "")
    }

    const renderSelected = () => {
        if (selectedImoove) {
            console.log(selectedImoove)
            setStrength(`${selectedImoove.content.strength}`)
            setCode(`${selectedImoove.content.code}`)
            setDuration(`${selectedImoove.content.time}`)
            setSensitivity(`${selectedImoove.content.sensitivity}`)
            setExDate(new Date(selectedImoove.inspected))
            
            setSupportStability(`${selectedImoove.content.supports.stability}`)
            setSupportDistributionL(`${selectedImoove.content.supports.distribution.denominator}`)
            setSupportDistributionR(`${selectedImoove.content.supports.distribution.numerator}`)
            setSupportPoints(`${selectedImoove.content.supports.distribution.points}`)

            setTrunkStability(`${selectedImoove.content.trunk.stability}`)
            setTrunkDistributionL(`${selectedImoove.content.trunk.distribution.denominator}`)
            setTrunkDistributionR(`${selectedImoove.content.trunk.distribution.numerator}`)
            setTrunkPoints(`${selectedImoove.content.trunk.distribution.points}`)

            setPosturalCoordination(`${selectedImoove.content.postural_coordination.value}`)
            setPosturalPoints(`${selectedImoove.content.postural_coordination.point}`)
            setPosturalStrategy(`${selectedImoove.content.postural_strategy}`)

            setMemo(`${selectedImoove.detail}`)
        }
    }

    const addNewImoove = async () => {
        let file_url = ""
        try {
            let formData = new FormData()
            formData.append('file', file ?? "")
            let response = await axios.post('/api/file', formData, config)
            file_url = response.data.file_path
            console.log(`InBody 파일 추가 성공: ${file_url}`);
        } catch (error) {
            console.error("InBody 파일 추가 중 오류 발생:", error)
            return
        }

        const newImooveRecord: Imoove = {
            file_url: file_url,
            inspected: dateParse(exDate),
            content: {
                type: imooveType,
                strength: +strength,
                code: code,
                time: +duration,
                sensitivity: +sensitivity,
                supports: {
                    stability: +supportStability,
                    distribution: {
                        denominator: +supportDistributionR,
                        numerator: +supportDistributionL,
                        points: +supportPoints
                    }
                },
                trunk: {
                    stability: +trunkStability,
                    distribution: {
                        denominator: +trunkDistributionR,
                        numerator: +trunkDistributionL,
                        points: +trunkPoints
                    }
                },
                postural_coordination: {
                    value: +posturalCoordination,
                    point: +posturalPoints
                },
                postural_strategy: +posturalStrategy
            },
            detail: memo
        }
        try {
            isNew ? await axios.post(url, newImooveRecord, config) : await axios.patch(`${url}/${selectedImoove?.id}`, newImooveRecord, config)
                console.log("Imoove 검사 기록 추가 성공")                
        } catch (error) {
                console.error("Imoove 검사 기록 추가 중 오류 발생:", error)
        }
    }

    return (
        <Modal show={show} onShow={renderSelected} onHide={handleClose} size='xl'>
            <Modal.Header closeButton>
                <Modal.Title>
                    <span className={cx("title")}>
                        <strong>IMOOVE</strong>
                    </span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className={cx("contents")}>
                    <div className={cx("page-title")}>
                        <span>1차 검사</span>
                    </div>
                    <div className={cx("page-content")}>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")}>
                                <span>파일 업로드 (OCR)</span>
                                ImooveAddModal      </div>
                            <div className={cx("inline")}>
                                <div className={`${cx("cell")} ${cx("small")}`}>
                                    <OcrParser 
                                    type={0} 
                                    isMask={false} 
                                    setOcrResult={onChangeOcrResult}
                                    setFile={setFile}
                                    smallSize={false}
                                    cv={cv}
                                    indicator={0}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")}>
                                <span>기본 정보</span>
                            </div>
                            <div className={cx("group-content")}>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>검사 유형</InputGroup.Text>
                                            <Form.Check
                                                inline
                                                type="radio"
                                                id="type-radio-S"
                                                label="S"
                                                name="type"
                                                className={cx("radio-cell")}
                                                onChange={(e) => handleIMOOVETypeRadioChange(e)}
                                            >
                                            </Form.Check>
                                            <Form.Check
                                                inline
                                                type="radio"
                                                id="type-radio-R"
                                                label="R"
                                                name="type"
                                                className={cx("radio-cell")}
                                                onChange={(e) => handleIMOOVETypeRadioChange(e)}
                                            >
                                            </Form.Check>
                                            <Form.Check
                                                inline
                                                type="radio"
                                                id="type-radio-L"
                                                label="L"
                                                name="type"
                                                className={cx("radio-cell")}
                                                onChange={(e) => handleIMOOVETypeRadioChange(e)}
                                            >
                                            </Form.Check>
                                        </InputGroup>
                                    </div>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>강도</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder=""
                                                value={strength}
                                                onChange={(e) => setStrength(e.target.value)}
                                            >
                                            </Form.Control>
                                        </InputGroup>
                                    </div>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>검사 코드</InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder=""
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                            >
                                            </Form.Control>
                                        </InputGroup>
                                    </div>
                                </div>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>검사 시간</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder=""
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                            >
                                            </Form.Control>
                                            <InputGroup.Text>분</InputGroup.Text>
                                        </InputGroup>
                                    </div>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>민감도</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder=""
                                                value={sensitivity}
                                                onChange={(e) => setSensitivity(e.target.value)}
                                            >
                                            </Form.Control>
                                        </InputGroup>
                                    </div>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>검사 일시</InputGroup.Text>
                                            <Form.Control
                                                type="date"
                                                placeholder=""
                                                value={exDate.toLocaleDateString('en-CA')}
                                                onChange={(e) => setExDate(new Date(e.target.value))}
                                            >
                                            </Form.Control>
                                        </InputGroup>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")}>
                                <span>검사 결과</span>
                            </div>
                            <div className={cx("group-content")}>
                                <div className={cx("inline-title")}>Supports</div>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>Stability</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder=""
                                                value={supportStability}
                                                onChange={(e) => setSupportStability(e.target.value)}
                                            >
                                            </Form.Control>
                                            <InputGroup.Text>%</InputGroup.Text>
                                        </InputGroup>
                                    </div>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>Distribution</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder=""
                                                value={supportDistributionL}
                                                onChange={(e) => setSupportDistributionL(e.target.value)}
                                            >
                                            </Form.Control>
                                            <InputGroup.Text>%</InputGroup.Text>
                                            <div className={cx("dash")}> / </div>
                                            <Form.Control
                                                type="number"
                                                placeholder=""
                                                value={supportDistributionR}
                                                onChange={(e) => setSupportDistributionR(e.target.value)}
                                            >
                                            </Form.Control>
                                            <InputGroup.Text>%</InputGroup.Text>
                                        </InputGroup>
                                    </div>
                                    <div className={`${cx("cell")} ${cx("smaller")}`}>
                                        <InputGroup>
                                        <InputGroup.Text>=</InputGroup.Text>
                                        <Form.Control
                                            type="number"
                                            placeholder=""
                                            value={supportPoints}
                                            onChange={(e) => setSupportPoints(e.target.value)}
                                        >
                                        </Form.Control>
                                        <InputGroup.Text>points</InputGroup.Text>
                                        </InputGroup>
                                    </div>
                                </div>
                                <div className={cx("inline-title")}>Trunk</div>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>Stability</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder=""
                                                value={trunkStability}
                                                onChange={(e) => setTrunkStability(e.target.value)}
                                            >
                                            </Form.Control>
                                            <InputGroup.Text>%</InputGroup.Text>
                                        </InputGroup>
                                    </div>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>Distribution</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder=""
                                                value={trunkDistributionL}
                                                onChange={(e) => setTrunkDistributionL(e.target.value)}
                                            >
                                            </Form.Control>
                                            <InputGroup.Text>%</InputGroup.Text>
                                            <div className={cx("dash")}> / </div>
                                            <Form.Control
                                                type="number"
                                                placeholder=""
                                                value={trunkDistributionR}
                                                onChange={(e) => setTrunkDistributionR(e.target.value)}
                                            >
                                            </Form.Control>
                                            <InputGroup.Text>%</InputGroup.Text>
                                        </InputGroup>
                                    </div>
                                    <div className={`${cx("cell")} ${cx("smaller")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>=</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder=""
                                                value={trunkPoints}
                                                onChange={(e) => setTrunkPoints(e.target.value)}
                                            >
                                            </Form.Control>
                                            <InputGroup.Text>points</InputGroup.Text>
                                        </InputGroup>
                                    </div>
                                </div>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>Postural coordination</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder=""
                                                value={posturalCoordination}
                                                onChange={(e) => setPosturalCoordination(e.target.value)}
                                            >
                                            </Form.Control>
                                            <InputGroup.Text>s</InputGroup.Text>
                                        </InputGroup>
                                    </div>   
                                    <div className={`${cx("cell")} ${cx("small")}`}></div>         
                                    <div className={`${cx("cell")} ${cx("smaller")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>=</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder=""
                                                value={posturalPoints}
                                                onChange={(e) => setPosturalPoints(e.target.value)}
                                            >
                                            </Form.Control>
                                            <InputGroup.Text>points</InputGroup.Text>
                                        </InputGroup>
                                    </div>               
                                </div>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")} ${cx("small")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>Postural Strategy</InputGroup.Text>
                                        </InputGroup>
                                    </div>
                                    <div className={`${cx("cell")} ${cx("small")}`}></div>   
                                    <div className={`${cx("cell")} ${cx("smaller")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>=</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                placeholder=""
                                                value={posturalStrategy}
                                                onChange={(e) => setPosturalStrategy(e.target.value)}
                                            >
                                            </Form.Control>
                                            <InputGroup.Text>/ 10</InputGroup.Text>
                                        </InputGroup>
                                    </div>                             
                                </div>
                            </div>
                        </div>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")}>
                                <span>비고</span>
                            </div>
                            <div className={cx("group-content")}>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")}`}>
                                        <InputGroup>
                                            <InputGroup.Text>메모</InputGroup.Text>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={memo}
                                                onChange={(e) => setMemo(e.target.value)}
                                            />
                                        </InputGroup>
                                    </div>
                                </div>
                            </div>
                        </div>    
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className={cx("inline-btn")}>
                    <Button variant="primary" onClick={addNewImoove}>
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

export default ImooveAddModal
