import React, { useState } from "react";
import Card from 'react-bootstrap/Card';
import { CardAdder, SummaryCard } from '../..';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles.css';
import 'react-date-range-ts/dist/theme/default.css';
import styles from './SummaryContainer.module.css';
import classNames from 'classnames/bind';

const SummaryContainer = ({axiosMode}: {axiosMode: boolean}) => {

  const cx = classNames.bind(styles);

  const [cardTypes, setCardTypes] = useState([["진료 기록"]])

  const addRowContainer = (type: string, index: number) => {
    let newMat = cardTypes
    newMat[index] = [...cardTypes[index], type]
    setCardTypes([...newMat])
  }

  const addColumnContainer = (type: string) => {
    setCardTypes([...cardTypes, [type]])
  }

  const handleCardClose = (row: number, col: number) => {
    let newMat = cardTypes
    if (newMat[row].length == 1) newMat.splice(row, 1)
    else newMat[row].splice(col, 1)
    setCardTypes([...newMat])
    console.log(newMat.length)
  }

  return (
    <div>
        {cardTypes.map((row, row_index) => (
            <div className={cx("inline-row")} key={row_index}>
                {row.map((card, col_index) => (
                    <div className={cx("cards-inline")} key={col_index}>
                        <div className="record-table">
                            <Card>
                                <Card.Header className={cx("header-contents")}>
                                    <div className={cx("card-title")}>
                                        <strong style={{ margin: "auto" }}>{card}</strong>
                                    </div>
                                    <div className={cx("btn-close")}>
                                        <div onClick={() => handleCardClose(row_index, col_index)}>X</div>
                                    </div>
                                </Card.Header>
                                <SummaryCard axiosMode={axiosMode} type={card}/>
                            </Card>
                        </div>
                    </div>
                ))}
                <div className={cx("adder-inline")}>
                    <CardAdder isVer={true} func={addRowContainer} index={row_index}/>
                </div>
            </div>
        ))}
        
        <CardAdder isVer={false} func={addColumnContainer} index={0}/>
    </div>
  );
};

export default SummaryContainer;
