import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './InputLine.module.css'
import classNames from 'classnames/bind';
import { Form, InputGroup } from 'react-bootstrap';
import { CSSProperties, Fragment } from 'react';

const cx = classNames.bind(styles)

export interface InputCellProps {
    fieldName: string,
    fieldProps: {
        type: string,
        placeholder?: string,
        value: string,
        onChange: (event: any) => void
        tail?: {
            text: string,
            style?: CSSProperties
        },
        options?: {
            text: string,
        }[]
    }[]
    invalidMsg?: {
        text: string,
        show: boolean
    },
    style?: CSSProperties
}

export const InputCell = ({fieldName, fieldProps, invalidMsg, style}: InputCellProps) => {
    return (
        <div className={`${cx("cell")}`} style={{ width: style?.width }}>
            <InputGroup>
                <InputGroup.Text>{fieldName}</InputGroup.Text>
                {fieldProps.map((prop, index) => {
                    return (
                        <Fragment key={index}>
                            {prop.type === 'select' ?
                                <Form.Select
                                    value={prop.value}
                                    onChange={(e) => {prop.onChange(e.target.value)}}
                                >
                                    {prop.options?.map((option, index) => {
                                        return (
                                            <option key={index}>{option.text}</option>
                                        )
                                    })}
                                </Form.Select> :
                                <Form.Control
                                    type={prop.type}
                                    placeholder={prop.placeholder ?? ""}
                                    value={prop.value}
                                    onChange={(e) => {prop.onChange(e.target.value)}}
                                />
                            }
                            {prop.tail?
                                <InputGroup.Text style={prop.tail.style}>{prop.tail.text}</InputGroup.Text> : null
                            }
                        </Fragment>
                    )
                })}
            </InputGroup>
            {(invalidMsg?.show ?? false) && 
                <div className={cx("form-unvalid-msg")}>{invalidMsg?.text}</div>
            }
        </div>
    )
}

export const InputLine = ({inputCells}: {inputCells: InputCellProps[]}) => {
    return (
        <div className={cx("inline")}>
            {inputCells.map((inputCellProp, index) => {
                return (
                    <InputCell key={index}
                        {...inputCellProp}
                        style={{ width: `${100/inputCells.length - 2.5}%` }}
                    />
                )
            })}
        </div>
    )
}

export default InputLine