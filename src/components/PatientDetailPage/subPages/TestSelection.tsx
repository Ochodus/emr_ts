import React, { useState } from "react";
import { TestSelectCard } from "./";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles.css';
import 'react-date-range-ts/dist/theme/default.css';
import styles from './TestSelection.module.css';
import classNames from 'classnames/bind';


const SummaryContainer = () => {

  const cx = classNames.bind(styles);

  const [cardTypes, setCardTypes] = useState(["IMOOVE", "X-Ray", "InBody", "Exbody", "Lookin' Body", "혈액 검사 결과", "설문지", "족저경", "운동능력 검사"])

  return (
    <div>
        <div className={cx("cards-inline")}>
        {cardTypes.map((card, index) => (
            <div className={cx("record-table")} key={index}>
                <TestSelectCard type={card}></TestSelectCard>
            </div>
        ))}
        </div>
    </div>
  );
};

export default SummaryContainer;
