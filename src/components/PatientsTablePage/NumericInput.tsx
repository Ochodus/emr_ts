import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../reducers/index';
import { changeValue, addFilter } from '../../reducers/filter';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range-ts/dist/styles.css';
import 'react-date-range-ts/dist/theme/default.css';
import styles from './TableFilter.module.css';
import classNames from 'classnames/bind';


const NumericInput = () => {
  const dispatch = useDispatch();

  const { numericFilterBuffer } = useSelector((state: RootState) => state.filter);

  const setValue = (startValue: number, endValue: number) => {
    dispatch(changeValue({value: {start: startValue, end: endValue}, type: "numeric"}))
  }

  const newFilter = () => {
    dispatch(addFilter(numericFilterBuffer));
  }

  const cx = classNames.bind(styles);

  return (
    <InputGroup id={cx("filter-numeric")}>
      <InputGroup.Text id="">범위 설정</InputGroup.Text>
      <Form.Control 
        className={cx("from")}
        value={numericFilterBuffer.value.start}
        onChange={(e) => setValue(+e.target.value, numericFilterBuffer.value.end)}
      >
      </Form.Control>
      <div className={cx("from-to")}> ~ </div>
      <Form.Control 
        className={cx("to")}
        value={numericFilterBuffer.value.end}
        onChange={(e) => setValue(numericFilterBuffer.value.start, +e.target.value)}
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

export default NumericInput;
