import React from "react"

export interface NameForm {
    firstName: string,
    setFirstName: React.Dispatch<React.SetStateAction<string>>,
    lastName: string,
    setLastName: React.Dispatch<React.SetStateAction<string>>
}

export interface AddressForm {
    mainAddress: string,
    setMainAddress: React.Dispatch<React.SetStateAction<string>>,
    subAddress: string,
    setSubAddress: React.Dispatch<React.SetStateAction<string>>,
    postalCode: string,
    setPostalCode: React.Dispatch<React.SetStateAction<string>>,
    isSearcherOpen: boolean,
    setIsSearcherOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export interface PhoneNumberForm {
    firstNumber: string,
    setFirstNumber: React.Dispatch<React.SetStateAction<string>>,
    middleNumber: string,
    setMiddleNumber: React.Dispatch<React.SetStateAction<string>>,
    lastNumber: string,
    setLastNumber: React.Dispatch<React.SetStateAction<string>>
}

export interface UserForm {
    email: string,
    name: NameForm,
    position: string,
    sex: number,
    phone_number: string,
    department: string,
	profile_url: string
}

export interface NokForm {
	relationship: string,
    setRelationship: React.Dispatch<React.SetStateAction<string>>,
	name: NameForm,
	gender: number,
    setGender: React.Dispatch<React.SetStateAction<number>>,
	birth: Date,
    setBirth: React.Dispatch<React.SetStateAction<Date>>,
    registrationNumber: string,
    setRegistrationNumber: React.Dispatch<React.SetStateAction<string>>,
	phoneNumber: PhoneNumberForm,
	address: AddressForm & {
        isSameWithPatient: boolean
        setIsSameWithPatient: React.Dispatch<React.SetStateAction<boolean>>
    },
}

export interface PatientForm {
    name: NameForm,
    gender: number,
    setGender: React.Dispatch<React.SetStateAction<number>>,
	birth: Date,
    setBirth: React.Dispatch<React.SetStateAction<Date>>,	
    registrationNumber: string,
    setRegistrationNumber: React.Dispatch<React.SetStateAction<string>>,
    phoneNumber: PhoneNumberForm,
    address: AddressForm,
	regDate: Date,
    setRegDate: React.Dispatch<React.SetStateAction<Date>>,
	doctor: number,
    setDoctor: React.Dispatch<React.SetStateAction<number>>,	
	note: string,
    setNote: React.Dispatch<React.SetStateAction<string>>
} // Patient 객체 타입

export interface PhysicalExamForm {
	recorded: Date,
    setRecorded: React.Dispatch<React.SetStateAction<Date>>,
	height: number,
    setHeight: React.Dispatch<React.SetStateAction<number>>,
	weight: number,
    setWeight: React.Dispatch<React.SetStateAction<number>>,
	systolicBloodPressure: number,
    setSystolicBloodPressure: React.Dispatch<React.SetStateAction<number>>,
	diastolicBloodPressure: number,
    setDiastolicBloodPressure: React.Dispatch<React.SetStateAction<number>>,
	bodyTemperature: number,
    setBodyTemperature: React.Dispatch<React.SetStateAction<number>>,
}
