import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './InputLine.module.css'
import classNames from 'classnames/bind';
import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { CSSProperties, Fragment } from 'react';

const cx = classNames.bind(styles)

export interface InputCellProps {
    fieldName?: string,
    fieldProps: {
        type: string,
        label?: string,
        as?: React.ElementType<any> | undefined,
        rows?: number,
        idPrefix?: string,
        name?: string,
        placeholder?: string,
        value: string,
        onChange:  React.Dispatch<React.SetStateAction<any>>,
        style? : CSSProperties
        tail?: {
            component?: JSX.Element
            text?: string,
            style?: CSSProperties
        },
        options?: {
            text: string,
            value?: number
        }[]
        readOnly?: boolean
        checkedValue?: number
    }[]
    invalidMsg?: {
        text: string,
        show: boolean
    },
    style?: CSSProperties,
    tailComponent?: JSX.Element
}

export const InputCell = ({fieldName, fieldProps, invalidMsg, style, tailComponent}: InputCellProps) => {
    return (
        <div className={`${cx("cell")}`} style={{ width: style?.width }}>
            <InputGroup>
                {fieldName !== undefined && <InputGroup.Text>{fieldName}</InputGroup.Text>}
                {fieldProps.map((prop, index) => {
                    return (                        
                        <Fragment key={index}>
                            {prop.type === 'select' ?
                            <Form.Select
                                id={`${prop.idPrefix}-${prop.name ?? ""}-${index}`}
                                value={prop.value}
                                onChange={(e) => {prop.onChange(e.target.value)}}
                            >
                                {prop.options?.map((option, index) => {
                                    return (
                                        <option key={index} value={option.value}>{option.text}</option>
                                    )
                                })}
                            </Form.Select> :
                            prop.type === 'radio' || prop.type === 'checkbox' ?
                            <Form.Check
                                inline
                                type={prop.type}
                                id={`${prop.idPrefix}-${prop.name ?? ""}-${index}`}
                                label={prop.label}
                                name={`${prop.idPrefix}-${prop.name ?? ""}-${index}`}
                                value={prop.value}
                                checked={prop.type === 'radio' ? `${prop.checkedValue}` === prop.value : undefined}
                                onChange={(e) => {
                                    prop.onChange(prop.type === 'radio' ? e.target.value : e.target.checked)
                                }}
                                className={cx(`${prop.type}-cell`)}
                            /> :
                            <Form.Control
                                type={prop.type}
                                placeholder={prop.placeholder ?? ""}
                                as={prop.as}
                                rows={prop.rows}
                                value={prop.value}
                                id={`${prop.idPrefix}-${prop.name ?? ""}-${index}`}
                                style={prop.style}
                                onChange={(e) => {prop.onChange(e.target.value)}}
                                readOnly={prop.readOnly}
                            />
                            }
                            {prop.tail ?
                                prop.tail.component ?
                                prop.tail.component :
                                <InputGroup.Text style={prop.tail.style}>{prop.tail.text}</InputGroup.Text> : null
                            }                           
                        </Fragment>
                    )
                })}
            </InputGroup>
            {tailComponent}
            {(invalidMsg?.show ?? false) && 
                <div className={cx("form-unvalid-msg")}>{invalidMsg?.text}</div>
            }
        </div>
    )
}

export const InputLine = ({inputCells}: {inputCells: (InputCellProps | null)[]}) => {
    return (
        <div className={cx("inline")}>
            {inputCells.map((inputCellProp, index) => {
                if (inputCellProp) {
                    return (
                        <InputCell key={index}
                            {...inputCellProp}
                            style={{ width: `${100/inputCells.length - 2.5}%` }}
                        />
                    )
                }
                else return null
            })}
        </div>
    )
}

export default InputLine