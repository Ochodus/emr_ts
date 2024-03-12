import React, { useState } from "react";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { ImooveAddModal, InBodyAddModal, XRayAddModal, ExBodyAddModal, LookinBodyAddModal }  from ".";
import cv from "opencv-ts";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles.css';
import 'react-date-range-ts/dist/theme/default.css';
import styles from './TestSelectCard.module.css';
import classNames from 'classnames/bind';
import BloodInspectionAddModal from "./BloodInspectionAddModal";
import SurveyTypeSelectModal from "./SurveyTypeSelectModal";
import SurveyAddModalAdult from "./SurveyAddModalAdult";
import SurveyAddModalChild from "./SurveyAddModalChild";
import PodoscopeAddModal from "./PodoscopeAddModal";
import PhysicalPerformanceAddModal from "./PhysicalPerformanceAddModal";
import AlignmentAddModal from "./AlignmentAddModal";
import FlatWalkingVideoAddModal from "./FlatWalkingVideoAddModal";


const TestSelectCard = ({ type, handleHistoryShow }: { type: string, handleHistoryShow: (value: string) => void }) => {
    const [show, setShow] = useState(false)
    const [showAdult, setShowAdult] = useState(false)
    const [showChild, setShowChild] = useState(false)

    const handleShow = () => {
        setShow(true)
    }

    const handleClose = () => {
        setShow(false)
        setShowAdult(false)
        setShowChild(false)
    }

    const handleShowAdult = () => {
        setShow(false)
        setShowAdult(true)
    }

    const handleShowChild = () => {
        setShow(false)
        setShowChild(true)
    }

    
    
    const cx = classNames.bind(styles);

    return (
            <Card>
                <Card.Img variant="top" src={`${process.env.PUBLIC_URL}/images/inspectionIcon/${type}.png`} alt="" style={{ width: "100%", height: "180px", objectFit: "contain" }}/>
                <Card.Body>
                <div className={cx("testName")}>{type}</div>
                <div className={cx("lastUpdate")}>마지막 검사 일자: {"미실시"}</div>
                </Card.Body>
                <Card.Footer>
                    <Button style={{ width: "45%" }} onClick={handleShow}>추가</Button>
                    <Button variant="secondary" onClick={(e) => handleHistoryShow(type)} style={{ width: "45%", float: "right" }} >기록 확인</Button>
                </Card.Footer>
                { type === "IMOOVE" && 
                    <ImooveAddModal cv={cv}
                        show={show} 
                        handleClose={handleClose} 
                    />
                }
                { type === "InBody" &&
                    <InBodyAddModal cv={cv}
                        show={show} 
                        handleClose={handleClose}
                    />
                }
                { type === "X-Ray" &&
                    <XRayAddModal
                        show={show} 
                        handleClose={handleClose} 
                    />
                }{ type === "Exbody" &&
                    <ExBodyAddModal cv={cv}
                        show={show} 
                        handleClose={handleClose} 
                    />
                }
                { type === "Lookin' Body" &&
                    <LookinBodyAddModal cv={cv}
                        show={show}
                        handleClose={handleClose}
                    />
                }
                { type === "혈액 검사 결과" &&
                    <BloodInspectionAddModal cv={cv}
                        show={show}
                        handleClose={handleClose}
                    />
                }
                { type === "설문지" && 
                    <SurveyTypeSelectModal 
                        show={show} 
                        handleShowAdult={handleShowAdult} 
                        handleShowChild={handleShowChild} 
                        handleClose={handleClose} 
                    />
                }
                { showAdult && <SurveyAddModalAdult cv={cv} show={showAdult} handleClose={handleClose}/> }

                { showChild && <SurveyAddModalChild cv={cv} show={showChild} handleClose={handleClose}/> }
                { type === "족저경" && 
                    <PodoscopeAddModal cv={cv}
                        show={show}
                        handleClose={handleClose}
                    />
                }
                { type === "운동능력 검사" && 
                    <PhysicalPerformanceAddModal cv={cv}
                        show={show}
                        handleClose={handleClose}
                    />
                }
                { type === "정렬 사진" && 
                    <AlignmentAddModal cv={cv}
                        show={show}
                        handleClose={handleClose}
                    />
                }
                { type === "평지 보행 동영상" && 
                    <FlatWalkingVideoAddModal cv={cv}
                        show={show}
                        handleClose={handleClose}
                    />
                }
            </Card>      
    );
};

export default TestSelectCard;