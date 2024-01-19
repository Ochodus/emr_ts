import React, { useState } from "react";
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../reducers/index';
import { changeValue, addFilter } from '../../reducers/filter';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles.css';
import 'react-date-range-ts/dist/theme/default.css';
import { DateRangePicker } from 'react-date-range-ts';
import { OnDateRangeChangeProps} from "react-date-range-ts/dist/types";
import { ko, enAU } from 'react-date-range-ts/dist/locale/index.js';
import styles from './TableFilter.module.css';
import classNames from 'classnames/bind';


const DateInput = () => {
  const dispatch = useDispatch();

  const { dateFilterBuffer } = useSelector((state: RootState) => state.filter);

  const setValue = (ranges: OnDateRangeChangeProps) => {
    if (ranges.selection.startDate && ranges.selection.endDate)
        dispatch(changeValue({value: {start: ranges.selection.startDate, end: ranges.selection.endDate}, type: "date"}))
    if (!dateRangePicked) setDateRangePicked(true);
  }

  const [dateRangePicker, setDateRangePicker] = useState(false);
  const [dateRangePicked, setDateRangePicked] = useState(false);

  const showDateRangePicker = () => {
    setDateRangePicker(!dateRangePicker);
  }

  const selectionRange = {
    startDate: dateFilterBuffer.value.start,
    endDate: dateFilterBuffer.value.end,
    key: 'selection',
  }

  const newFilter = () => {
    dispatch(addFilter(dateFilterBuffer));
  }

  const cx = classNames.bind(styles);

  return (
    <div>
      <InputGroup id={cx("filter-date")}>
        <InputGroup.Text>기간 설정</InputGroup.Text>
        <Form.Control
          type="text"
          className="from"
          value={dateRangePicked ? dateFilterBuffer.value.start.toLocaleDateString('ko') : ""}
          onClick={showDateRangePicker}
          readOnly
        >
        </Form.Control>
        <div className={cx("from-to")}> ~ </div>
        <Form.Control
          type="text"
          className={cx("to")}
          value={dateRangePicked ? dateFilterBuffer.value.end.toLocaleDateString('ko') : ""}
          onClick={showDateRangePicker}
          readOnly
        >
        </Form.Control>
        <Button 
          variant="secondary" 
          className={cx("btn-add-filter")}
          onClick={newFilter}
        >
          +
        </Button>
      </InputGroup>
      <div className={`${cx("date-picker")} ${cx((dateRangePicker ? "expanded" : ""))}`}>
        {dateRangePicker 
          ? <DateRangePicker
              locale={ko}
              months={2}
              direction='horizontal'
              ranges={[selectionRange]}
              onChange={(ranges) => setValue(ranges)}
              dateDisplayFormat="yyyy년 M월 d일"
            ></DateRangePicker>
          : null
        }
      </div>
    </div>
  );
};

export default DateInput;
