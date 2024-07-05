export interface User {
	[index: string]: string | number | undefined
    email: string,
    first_name: string,
    last_name: string,
    position: string,
    sex: number,
    phone_number: string,
    department: string,
	profile_url: string
}

export interface Nok {
	[index: string]: string | number | boolean | undefined,
	relationship?: string,
	first_name?: string,
	last_name?: string,
	sex?: number,
	birthday?: string,
	tel?: string,
	address?: string,
	address_detail?: string,
	post_number?: number,
	social_number?: string
}

export interface Patient {
	birthday: string,
	first_name: string,
	last_name: string,
	sex: number,
	height?: number,
	weight?: number,
	highBp?: number,
	lowBp?: number,
	last_recorded?: Date,
	regDate?: Date,
	tel: string,
	address: string,
	address_detail?: string,
	post_number: number,
	user_id: number,
	social_number: string,
	memo?: string,
	noks: Nok[]

} // Patient 객체 타입

export interface PhysicalExam {
	recorded: string,
	height: number,
	weight: number,
	systolic_blood_pressure: number,
	diastolic_blood_pressure: number,
	body_temperature: number
}