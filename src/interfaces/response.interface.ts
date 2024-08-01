import { numberInput } from "./inspectionType.interface"

export interface User {
    email: string,
    first_name: string,
    last_name: string,
    position: string,
    sex: numberInput,
    phone_number: string,
    department: string,
	profile_url: string
}

export interface Nok {
	relationship: string,
	first_name: string,
	last_name: string,
	sex: numberInput,
	birthday: string,
	tel: [numberInput, numberInput],
	address: string,
	address_detail: string,
	post_number: numberInput,
	social_number: string
}

export interface Patient {
	birthday: string,
	first_name: string,
	last_name: string,
	sex: numberInput,
	regDate: string,
	tel: [numberInput, numberInput],
	address: string,
	address_detail: string,
	post_number: numberInput,
	social_number: string,
	memo: string,
	noks: Nok[]
} // Patient 객체 타입

export interface PhysicalExam {
	recorded: string,
	height: numberInput,
	weight: numberInput,
	systolic_blood_pressure: numberInput,
	diastolic_blood_pressure: numberInput,
	body_temperature: numberInput
}