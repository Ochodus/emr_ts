import React, { useEffect, useState } from "react";
import { CardAdder, SummaryCard } from '../..';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles.css';
import 'react-date-range-ts/dist/theme/default.css';
import { Stack } from "@mui/joy";
import { GridGraphData, SelectedGraphRange, Update } from "../ReportHistory/ReportHistoryAddModal";
import { ID } from "components/commons/TableMui";
import { updateDeepValue } from "api/commons/utils";
import { useDispatch } from "react-redux";
import { addColumnSummarySelection, addRowSummarySelection, deleteSummarySelection } from "reducers/summaryCard";

export interface SummaryCardType {
    type: string,
    name: string,
    path: string[],
    start?: string,
    end?: string,
}

interface SummaryContainerProps {
  axiosMode: boolean, 
  noInitial?: boolean, 
  adderList?: (Update & ID)[],
  rangeSelectable?: boolean,
  editable?: boolean,
  initialValue?: GridGraphData[][],
  store?: boolean,
  onChange?: (value: GridGraphData[][]) => void
}

const SummaryContainer = ({
  axiosMode, 
  noInitial=false, 
  adderList,
  rangeSelectable=false,
  editable=true,
  initialValue,
  store=false,
  onChange,
}: SummaryContainerProps) => {
  const dispatch = useDispatch()

  const [cardTypes, setCardTypes] = useState<SummaryCardType[][]>(noInitial ? [] : initialValue ? initialValue : [[{type: "진료 기록", name: "진료 기록", path: []}]])
  const [containerKey, setContainerKey] = useState(0)
  const [data, setData] = useState<(SummaryCardType & {ranges: SelectedGraphRange[]})[][]>(noInitial ? [] : initialValue ? initialValue : [[{type: "진료 기록", name: "진료 기록", path: [], ranges: [{start: -1, end: -1}]}]])

  const addRowContainer = (type: string, path: string[], name: string, index?: number, start?: string, end?: string) => {
    if (index === undefined) return

    let newCard = {type: type, name: name, path: path, start: start, end: end}
    
    if (store) dispatch(addRowSummarySelection({index: index, value: newCard}))

    updateDeepValue(setCardTypes, [index], [...cardTypes[index], newCard])
    updateDeepValue(setData, [index], [...data[index], {...newCard, ranges: [{start: -1, end: -1}]}])    
  }

  const addColumnContainer = (type: string, path: string[], name: string, index?: number, start?: string, end?: string) => {
    let newCard = {type: type, name: name, path: path, start: start, end: end}

    if (store) dispatch(addColumnSummarySelection({value: newCard}))

    setCardTypes([...cardTypes, [newCard]])
    setData([...data, [{...newCard, ranges: [{start: -1, end: -1}]}]])
  }

  const handleCardClose = (row: number, col: number) => {
    if (store) dispatch(deleteSummarySelection({x: col, y: row}))
    if (cardTypes[row].length === 1) {
      setCardTypes([...cardTypes.slice(0, row), ...cardTypes.slice(row+1)])
      setData([...data.slice(0, row), ...data.slice(row+1)])
    }
    else {
      updateDeepValue(setCardTypes, [row], [...cardTypes[row].slice(0, col), ...cardTypes[row].slice(col+1)])
      updateDeepValue(setData, [row], [...data[row].slice(0, col), ...data[row].slice(col+1)])
    }
  }

  const onRangeChange = (value: SelectedGraphRange[], col_index: number, row_index: number) => {
    updateDeepValue(setData, [row_index, col_index, 'ranges'], value)
  }

  const onTextChange = (value: string, col_index: number, row_index: number) => {
    updateDeepValue(setData, [row_index, col_index, 'memo'], value)
  }

  useEffect(() => {
    setContainerKey(prevKey => prevKey + 1)
  }, [cardTypes])

  useEffect(() => {
    if (onChange) onChange(data)
  }, [onChange, data])

  useEffect(() => {
    if (store) {
      let initialCard = window.localStorage.getItem("persist:summary")
      if (initialCard !== null) {
        let parsedCard = JSON.parse(JSON.parse(initialCard).currentSummary) as SummaryCardType[][]
        setCardTypes(parsedCard)

        let initialData: (SummaryCardType & {ranges: SelectedGraphRange[]})[][] = parsedCard.map(row => 
          row.map(item => ({
            ...item,
            ranges: [{ start: -1, end: -1 }]
          }))
        )

        setData(initialData)
      }
    }
  }, [store])

  return (
    <Stack 
        direction='column' 
        gap={2}
        className='scrollable vertical'
        sx={{ 
            ml: '1rem', 
            my: '1rem', 
            height: '100%'
        }}
    >
        {cardTypes.map((row, row_index) => (
            <Stack direction='row' gap={2} key={row_index} sx={{ width: 'calc(100% - 13px)' }}>
                {row.map((card, col_index) => {
                  console.log(card)
                  return (
                    <SummaryCard 
                      key={`${col_index}${row_index}`} 
                      axiosMode={axiosMode}
                      cardType={card}
                      rowIndex={row_index}
                      colIndex={col_index}
                      rangeSelectable={rangeSelectable}                      
                      start={(card as GridGraphData).ranges ? (card as GridGraphData).ranges[0].start : card.start}
                      end={(card as GridGraphData).ranges ? (card as GridGraphData).ranges[0].end : card.end}
                      graphContainerKey={containerKey}                      
                      useNote={rangeSelectable}
                      editable={editable}
                      cardClose={handleCardClose} 
                      onRangeChange={onRangeChange}
                      onTextChange={onTextChange}
                    />
                  )
                })}
                {editable && <CardAdder isVertical={true} addContainerFunction={addRowContainer} index={row_index} externalAdderList={adderList}/>}
            </Stack>
        ))}
        {editable && <CardAdder isVertical={false} addContainerFunction={addColumnContainer} index={0} externalAdderList={adderList}/>}
    </Stack>
  );
};

export default SummaryContainer;
