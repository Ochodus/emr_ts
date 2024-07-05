import React, { useEffect, useState } from "react";
import { TestSelectCard } from ".";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles.css';
import 'react-date-range-ts/dist/theme/default.css';
import styles from './TestSelection.module.css';
import classNames from 'classnames/bind';
import { HistoryModal } from "..";


const TestSelection = () => {

  const cx = classNames.bind(styles);

  const [cardTypes, setCardTypes] = useState(["IMOOVE", "X-Ray", "InBody", "Exbody", "Lookin' Body", "혈액 검사 결과", "설문지", "족저경", "운동능력 검사", "정렬 사진", "평지 보행 동영상"])
  const [historyShow, setHistoryShow] = useState(false)
  const [historyType, setHistoryType] = useState("")

  const handleHistoryShow = (type: string) => {
    setHistoryType(type)
    setHistoryShow(true)
  }

  const handleHistoryClose = () => {
    setHistoryShow(false)
  }

  return (
    <div style={{ backgroundColor: "white" }}>
        <div className={cx("cards-inline")}>
        {cardTypes.map((card, index) => (
            <div className={cx("record-table")} key={index}>
                <TestSelectCard type={card} handleHistoryShow={handleHistoryShow}></TestSelectCard>
            </div>
        ))}
        </div>
        <HistoryModal show={historyShow} handleClose={handleHistoryClose} type={historyType}/>
    </div>
  );
};

export default TestSelection;
