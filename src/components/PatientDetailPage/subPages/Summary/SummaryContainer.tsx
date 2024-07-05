import React, { useState } from "react";
import Card from 'react-bootstrap/Card';
import { CardAdder, SummaryCard } from '../..';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles.css';
import 'react-date-range-ts/dist/theme/default.css';
import styles from './SummaryContainer.module.css';
import classNames from 'classnames/bind';
import { Box, Divider, Sheet, Typography } from "@mui/joy";
import { Close } from "@mui/icons-material";

export interface SummaryCardType {
    type: string,
    name: string,
    path: string[]
}

const SummaryContainer = ({axiosMode}: {axiosMode: boolean}) => {

  const cx = classNames.bind(styles);

  const [cardTypes, setCardTypes] = useState<SummaryCardType[][]>([[{type: "진료 기록", name: "진료 기록", path: []}]])

  const addRowContainer = (type: string, path: string[], name: string, index?: number) => {
    if (!index) return
    let newMat = cardTypes
    newMat[index] = [...cardTypes[index], {type: type, name: name, path: path}]
    setCardTypes([...newMat])
  }

  const addColumnContainer = (type: string, path: string[], name: string) => {
    setCardTypes([...cardTypes, [{type: type, name: name, path: path}]])
  }

  const handleCardClose = (row: number, col: number) => {
    let newMat = cardTypes
    if (newMat[row].length === 1) newMat.splice(row, 1)
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
                            <Sheet
                                key={`${col_index}${row_index}`}
                                variant="outlined"
                                sx={{
                                  borderRadius: 'sm',
                                  p: 2
                                }}
                            >
                                <Box sx={{ 
                                    display: 'flex', 
                                    gap: 2,
                                    justifyContent: 'space-between',
                                    p: '0px 5px'
                                }}>
                                    <Typography fontWeight="900" fontSize="21px">{card.name}</Typography>
                                    <Close onClick={() => handleCardClose(row_index, col_index)} />
                                </Box>
                                <Divider component="div" sx={{ my: 2 }} />
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    p: '0px 5px'
                                }}>
                                    <SummaryCard axiosMode={axiosMode} cardType={card}/>
                                </Box>
                            </Sheet>
                        </div>
                    </div>
                ))}
                <div className={cx("adder-inline")}>
                    <CardAdder isVertical={true} addContainerFunction={addRowContainer} index={row_index}/>
                </div>
            </div>
        ))}
        
        <CardAdder isVertical={false} addContainerFunction={addColumnContainer} index={0}/>
    </div>
  );
};

export default SummaryContainer;
