import { useCallback } from "react";


export const useDateTimeParser = () => {
    const getBinaryDigit = (value: number) => {
        return `${value < 10 ? `0${value}` : value}`
    }

    const parseDateToDateTime = useCallback((_date: Date) => {
        let year = _date.getFullYear()
        let month = _date.getMonth() + 1
        let date = _date.getDate()

        let hours = _date.getHours()
        let minutes = _date.getMinutes()
        let seconds = _date.getSeconds()

        return `${year}-${getBinaryDigit(month)}-${getBinaryDigit(date)}T${getBinaryDigit(hours)}:${getBinaryDigit(minutes)}:${getBinaryDigit(seconds)}Z`
    }, [])
    return parseDateToDateTime
}