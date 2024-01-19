import React, { useState } from "react";
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import { ImooveAddModal, InBodyAddModal } from "../";
import cv from "opencv-ts";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles.css';
import 'react-date-range-ts/dist/theme/default.css';
import styles from './TestSelectCard.module.css';
import classNames from 'classnames/bind';



const TestSelectCard = ({ type }: { type: string }) => {
    const [show, setShow] = useState(false);

    const handleShow = () => {
        setShow(true)
    }
    const handleClose = () => setShow(false)
    
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
                {type === "IMOOVE" 
                ? <ImooveAddModal cv={cv}
                    show={show} 
                    handleClose={handleClose} 
                ></ImooveAddModal>
                : type === "InBody"
                ? <InBodyAddModal cv={cv}
                    show={show} 
                    handleClose={handleClose}
                ></InBodyAddModal>
                : null
                }
            </Card>      
    );
};

export default TestSelectCard;