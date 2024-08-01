import React, { useState } from "react";
import { CardAdder, SummaryCard } from '../..';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles.css';
import 'react-date-range-ts/dist/theme/default.css';
import { Stack } from "@mui/joy";

export interface SummaryCardType {
    type: string,
    name: string,
    path: string[]
}

const SummaryContainer = ({axiosMode}: {axiosMode: boolean}) => {
  const [cardTypes, setCardTypes] = useState<SummaryCardType[][]>([[{type: "진료 기록", name: "진료 기록", path: []}]])

  const addRowContainer = (type: string, path: string[], name: string, index?: number) => {
    if (index === undefined) return
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
  }

  return (
    <Stack 
        direction='column' 
        gap={2} 
        sx={{ 
            ml: '1rem', 
            my: '1rem', 
            overflow: 'auto',
            '&::-webkit-scrollbar': {
                width: '10px'  
            },
            '&::-webkit-scrollbar-thumb': {
                background: 'rgba(110, 162, 213)',
                borderRadius: '10px'
            },
            '&::-webkit-scrollbar-track': {
                background: 'rgba(110, 162, 213, .1)'
            },
            height: '100%'
        }}
    >
        {cardTypes.map((row, row_index) => (
            <Stack direction='row' gap={2} key={row_index} sx={{ width: 'calc(100% - 13px)' }}>
                {row.map((card, col_index) => (
                    <SummaryCard key={`${col_index}${row_index}`} axiosMode={axiosMode} cardType={card} rowIndex={row_index} colIndex={col_index} cardClose={handleCardClose} divider={row.length}/>
                ))}
                <CardAdder isVertical={true} addContainerFunction={addRowContainer} index={row_index}/>
            </Stack>
        ))}
        <CardAdder isVertical={false} addContainerFunction={addColumnContainer} index={0}/>
    </Stack>
  );
};

export default SummaryContainer;
