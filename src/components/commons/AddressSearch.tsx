import React from 'react'
import DaumPostcodeEmbed from 'react-daum-postcode'
import Button from 'react-bootstrap/Button'
import styles from './AddressSearch.module.css'
import classNames from 'classnames/bind';

interface AddressSearcherProps{
    setClosed: React.Dispatch<React.SetStateAction<boolean>>
    setAddress?: {
        setMainAddress: React.Dispatch<React.SetStateAction<string>>,
        setSubAddress: React.Dispatch<React.SetStateAction<string>>,
        setPostalCode: React.Dispatch<React.SetStateAction<string>>
    }
    setNokAddress?: (value: string | string[], index: number, field: string | string[]) => void
    nokIndex?: number
}

const AddressSearch = ({setClosed, setAddress, setNokAddress, nokIndex}: AddressSearcherProps) => {
    const cx = classNames.bind(styles)

    const handlePostCode = (data: any) => {
        let fullAddress = data.address
        let extraAddress = ''
        
        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName)
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '')
        }

        console.log(data)
        console.log(fullAddress)
        console.log(data.zonecode)
        if (setAddress !== undefined) {
            setAddress.setMainAddress(fullAddress)
            setAddress.setSubAddress("")
            setAddress.setPostalCode(data.zonecode)
        }
        console.log(nokIndex)
        if (setNokAddress !== undefined && nokIndex !== undefined) {
            setNokAddress([fullAddress, data.zonecode], nokIndex, ["address", "post_number"])
        }
        setClosed(false)
    }

    return(
        <div className={cx('search-field')}>
            <DaumPostcodeEmbed className={cx('address-searcher')} onComplete={handlePostCode} />
            <Button className={cx('close-button')} variant="secondary" onClick={() => setClosed(false)}>닫기</Button>
        </div>
    )
}

export default AddressSearch