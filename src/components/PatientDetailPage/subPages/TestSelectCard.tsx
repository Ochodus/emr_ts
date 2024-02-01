import React, { useState } from "react";
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import { ImooveAddModal, InBodyAddModal, SurveyAddModalAdult, SurveyAddModalChild, SurveyTypeSelectModal } from "../";
import cv from "opencv-ts";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles.css';
import 'react-date-range-ts/dist/theme/default.css';
import styles from './TestSelectCard.module.css';
import classNames from 'classnames/bind';

const TestSelectCard = ({ type }: { type: string }) => {
    const [show, setShow] = useState(false);
    const [showAdult, setShowAdult] = useState(false); // 성인용 모달 상태
    const [showChild, setShowChild] = useState(false); // 아동용 모달 상태

    const handleShow = () => {
        setShow(true);
    }

    const handleClose = () => {
        setShow(false);
        setShowAdult(false);
        setShowChild(false);
    }

    const handleShowAdult = () => {
        setShow(false);
        setShowAdult(true);
    }

    const handleShowChild = () => {
        setShow(false);
        setShowChild(true);
    }

    const cx = classNames.bind(styles);

    return (
        <Card>
            <Card.Img variant="top" src="holder/s" style={{ width: "100%", height: "180px" }}/>
            <Card.Body>
                <div className={cx("testName")}>{type}</div>
                <div className={cx("lastUpdate")}>마지막 검사 일자: {"미실시"}</div>
            </Card.Body>
            <Card.Footer>
                <Button style={{ width: "45%" }} onClick={handleShow}>추가</Button>
                <Button variant="secondary" style={{ width: "45%", float: "right" }} >기록 확인</Button>
            </Card.Footer>
            {type === "IMOOVE" && 
                <ImooveAddModal cv={cv} show={show} handleClose={handleClose} />
            }
            {type === "InBody" && 
                <InBodyAddModal cv={cv} show={show} handleClose={handleClose} />
            }
            {type === "설문지" && 
                <SurveyTypeSelectModal show={show} handleShowAdult={handleShowAdult} handleShowChild={handleShowChild} handleClose={handleClose} />
            }
            {showAdult && 
                <SurveyAddModalAdult cv={cv} show={showAdult} handleClose={handleClose} />
            }
            {showChild && 
                <SurveyAddModalChild cv={cv} show={showChild} handleClose={handleClose} />
            }
        </Card>      
    );
};

export default TestSelectCard;
