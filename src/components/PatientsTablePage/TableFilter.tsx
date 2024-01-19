import React, { useState } from "react";
import Select from "react-select";
import InputGroup from 'react-bootstrap/InputGroup';
import { StringInput, NumericInput, DateInput } from '.'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles.css';
import 'react-date-range-ts/dist/theme/default.css';
import { useDispatch } from 'react-redux'
import { changeCategory } from '../../reducers/filter';
import styles from './TableFilter.module.css';
import classNames from 'classnames/bind';


const typeSelections: Record<string, {label: string, value: string}[]> = {
  string: [
    {
      label: "이름",
      value: "name",
    },
    {
      label: "주민번호",
      value: "patientId",
    },
    {
      label: "휴대폰",
      value: "phoneNumber",
    },
    {
      label: "주소",
      value: "address",
    },
    {
      label: "메모",
      value: "note",
    }
  ],
  numeric: [
    {
      label: "환자번호",
      value: "id",
    }
  ],
  date: [
    {
      label: "생일",
      value: "birth",
    },
    {
      label: "마지막 진료일",
      value: "last",
    }
  ]
}

const TableFilter = ({type}: {type: string}) => {
  const dispatch = useDispatch();

  const setStringSelected = (e: any) => {
    dispatch(changeCategory({e, type}))
  }

  const cx = classNames.bind(styles);

  return (
    <div className={`${cx("selector-field")} ${cx("initial")}`}>
      <InputGroup className={cx("filter-category")}>
          <Select
              className={cx("selector-search")}
              options={typeSelections[type]}
              onChange={(e) => setStringSelected(e)}
          />
      </InputGroup>
      { type==="string" ? <StringInput></StringInput> : null }
      { type==="numeric" ? <NumericInput></NumericInput> : null }
      { type==="date" ? <DateInput></DateInput> : null }
    </div>
  );
};

export default TableFilter;
