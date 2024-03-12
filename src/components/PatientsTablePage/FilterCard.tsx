import Card from 'react-bootstrap/Card';
import styles from './FilterCard.module.css';
import classNames from 'classnames/bind';
import { useDispatch } from 'react-redux'
import { removeFilter } from '../../reducers/filter';

interface valueNumber {
    start: number,
    end: number
}

interface valueDate {
    start: Date,
    end: Date
}

interface FilterCardProps {
    children?: React.ReactNode;
    label: string, 
    value: string | valueNumber | valueDate, 
    keyVal: string | null
}

const FilterCard = ({label, value, keyVal}: FilterCardProps) => {
    const cx = classNames.bind(styles);

    const dispatch = useDispatch();

    const remove = () => {
        if (keyVal) dispatch(removeFilter(keyVal))
    }

    return (
        <Card className={cx('card-filter')} onClick={remove}>
            <Card.Body className={cx('filter')}>
            {label}: {
                typeof value === 'string'
                ? value
                : typeof value.start === 'number' && typeof value.end === 'number'
                ? value.start + " ~ " + value.end
                : typeof value.start === 'object' && typeof value.end === 'object'
                ? value.start.toLocaleDateString('ko') + " ~ " + value.end.toLocaleDateString('ko')
                : 'valueError'
            }
            </Card.Body>
        </Card>
    );
  };
  
  export default FilterCard;