export interface User {
    id: number,
    email: string,
    first_name: string,
    last_name: string,
    position: string,
    sex: number,
    phone_number: string,
    department: string
}

export interface Nok {
	type?: string,
	first_name: string,
	last_name: string,
	sex: string,
	birthday: string,
	tel: string,
	address: string,
	address_detail?: string,
	post_number: number
}

export interface Patient {
	birthday: string,
	first_name: string,
	last_name: string,
	sex: string,
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
	social_number: number,
	memo?: string,
	noks: Nok[]

} // Patient 객체 타입
