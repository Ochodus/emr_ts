import { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import styles from './SurveyAddModal.module.css'
import classNames from 'classnames/bind';

const SurveyAddModalChild = ({show, handleClose, isNew=false, cv}: { show: boolean, handleClose: () => void, isNew?: boolean, cv: any }) => {
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
    const handleIMOOVETypeRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImooveType(e.target.id.split("-").pop() ?? "")
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

    return (
        <Modal show={show} onShow={renderSelected} onHide={handleClose} size='xl'>
            <Modal.Header closeButton>
                <Modal.Title>
                    <span className={cx("title")}>
                        <strong>SurveyChild</strong>
                    </span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h1>hd</h1>
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

export default SurveyAddModalChild
