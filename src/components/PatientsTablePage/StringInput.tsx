import React from "react";
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../reducers/index'
import { changeValue, addFilter } from '../../reducers/filter';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles.css';
import 'react-date-range-ts/dist/theme/default.css';
import styles from './TableFilter.module.css';
import classNames from 'classnames/bind';

const StringInput = () => {
  const dispatch = useDispatch();

  const { stringFilterBuffer, filters } = useSelector((state: RootState) => state.filter);

  const setValue = (value: string) => {
    dispatch(changeValue({value: value, type: "string"}))
  }

  const newFilter = () => {
    dispatch(addFilter(stringFilterBuffer));
  }

  const cx = classNames.bind(styles);

  return (
    <InputGroup id={cx("filter-string")}>
        <InputGroup.Text>찾기</InputGroup.Text>
        <Form.Control
            value={stringFilterBuffer.value}
            onChange={(e) => setValue(e.target.value)}
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
  );
};

export default StringInput;
