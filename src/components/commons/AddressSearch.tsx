import ReactDom from 'react-dom'
import React from 'react'
import DaumPostcodeEmbed from 'react-daum-postcode'
import Button from 'react-bootstrap/Button'
import styles from './AddressSearch.module.css'
import classNames from 'classnames/bind';

interface AddressSearcherProps{
    setClosed: React.Dispatch<React.SetStateAction<boolean>>
    setAddress: React.Dispatch<React.SetStateAction<string[]>>
}

const AddressSearch = ({setClosed, setAddress}: AddressSearcherProps) => {
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
        setAddress([fullAddress, "", data.zonecode])
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