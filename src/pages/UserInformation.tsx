import { useState, useEffect } from "react";
import { useLocalTokenValidation } from '../api/commons/auth';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import styles from './UserInformation.module.css'
import classNames from 'classnames/bind';
import { useRequestAPI } from "../api/commons/request";
import { InputLine } from "../components/commons/InputLine";
import { User } from "../interfaces";
import { createCustomSelector, createEmailInput, createUserNameInput, createPhoneNumberInput } from "../api/forms/userInputFormData";
import { useNavigate } from "react-router-dom";
import { findElement } from "../api/commons/utils";

export interface CurrentUser {
	[index: string]: string | string[] | undefined
	name?: string[],
	gender?: string,
	phoneNumber?: string[],
	email?: string[],
	selectedPosition?: string,
	selectedDepartment?: string,
	userIconUrl?: string
}

const UserInformation = ({axiosMode}: {axiosMode: boolean}) => {
	const checkAuth = useLocalTokenValidation()
	const navigate = useNavigate()
	const request = useRequestAPI()
	const cx = classNames.bind(styles)
	
	const [currentUser, setCurrentUser] = useState<CurrentUser>()

	const [file, setFile] = useState("")
	const [isTriedToEdit, setIsTriedToEdit] = useState(false) // 회원 가입 시도 여부
	const [isFormValid, setIsFormValid] = useState({
		name: false,
		phoneNumber: false,
		email: false,
	})

	const handleResponsedUserData = (data: any) => {
		console.log(data)
		setCurrentUser({
			name: [data.last_name, data.first_name],
			phoneNumber: ['010', data.phone_number.split('-')[1], data.phone_number.split('-')[2]],
			email: [...data.email.split('@'), "직접 입력"],
			gender: `${data.sex}`,
			selectedPosition: data.position,
			selectedDepartment: data.department,
			userIconUrl: data.profile_url
		})
	}

	const updateCurrentUser = (key: string, index?: number) => {
		let newUser = {...currentUser}
		let target = newUser[key]
		return (value: string) => {
			if (Array.isArray(target) && index !== undefined) {
				target[index] = value
				if (key === 'email') {
					if (index === 2 && value !== '직접 입력') {
						target[1] = value
					}
					else if (index === 2) {
						target[1] = ""
					}
				}
			}
			else {
				newUser[key] = value
			}
	
			setCurrentUser(newUser)
		}
	}
	
	const formValidationCheck = () => {
		let nameCheck = currentUser?.firstName !== "" && currentUser?.lastName !== ""
		let phoneNumberCheck = currentUser?.phoneNumber?.find((_, index) => index === 1) !== "" && currentUser?.phoneNumber?.find((_, index) => index === 2) !== ""
		let emailCheck = currentUser?.email?.find((_, index) => index === 0) !== "" && currentUser?.email?.find((_, index) => index === 1) !== ""
	
		setIsFormValid({
		  ...isFormValid,
		  name: nameCheck,
		  phoneNumber: phoneNumberCheck,
		  email: emailCheck,
		})
		
		return nameCheck && phoneNumberCheck && emailCheck
	} // 회원 가입 폼 유효성 검사

	const updateUserInformation = (data?: any) => {
		const userInformation: User = {
			first_name: `${findElement(currentUser?.name, 0) ?? ""}`,
			last_name: `${findElement(currentUser?.name, 1) ?? ""}`,
			phone_number: `-${findElement(currentUser?.phoneNumber, 1)}-${findElement(currentUser?.phoneNumber, 2)}`,
			email: `${findElement(currentUser?.email, 0)}@${findElement(currentUser?.email, 1)}`,
			sex: +(currentUser?.gender ?? ""),
			position: currentUser?.selectedPosition ?? "",
			department: currentUser?.selectedDepartment ?? "",
			profile_url: currentUser?.userIconUrl ?? "",
		}

		request(`/api/users`, 'patch', userInformation)
	}

	const handleUpdate = async () => {
		setIsTriedToEdit(true)
		if (!formValidationCheck()) {
			alert("유효하지 않은 입력 필드가 있습니다.")
			return
		}

		if (file !== "") {
			let formData = new FormData()
        	formData.append('file', file ?? "")
			request('/api/file', 'post', formData, updateUserInformation)
		}
		else updateUserInformation()
	}

	const triggerFileInput = () => {
		document.getElementById('file-input')?.click()
	}

	useEffect(() => {
		if (axiosMode) {
			checkAuth(".")
			request("/api/users/me", 'get', undefined, handleResponsedUserData)
		}
	}, [axiosMode, checkAuth, request]) // 페이지 첫 렌더링 시 localStorage의 로그인 정보 유효성 검사 수행

	return (
		<div className={cx('structure-mypage')}>
			<img id={cx('logo-mypage')} src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="doctor" />
			<div id={cx('field-mypage')}>
				<h1 id={cx('title-mypage')} style={{ textAlign: 'center' }}>마이페이지</h1>
				<div id={cx('doctor-name')}><h2>{`${currentUser?.selectedPosition ?? ""} ${findElement(currentUser?.name, 0) ?? ""}${findElement(currentUser?.name, 1) ?? ""}`}</h2></div>
				<div className={cx('img-section')}>
					<div className={cx('doctor-img')} onClick={() => {triggerFileInput()}}>
						<img
							id={cx('doctor-img')}
							alt='프로필 사진'
							src={currentUser?.userIconUrl === "" || !currentUser?.userIconUrl ? `${process.env.PUBLIC_URL}/images/userIcon.png` : currentUser?.userIconUrl}
							style={{ flex: "column", height: '150px', width: '150px'}}
						/>
						<Form.Control
							id="file-input"
							type="file" 
							onChange={(e: any) => {setFile(e.target.files[0])}}
							style={{ display: 'none' }}
                        />
					</div>
				</div>
				<Form id={cx('input-group-mypage')}>
					<div className={cx("row-group")}>
						<InputLine
							inputCells={[createUserNameInput(currentUser, updateCurrentUser, isFormValid.name || !isTriedToEdit)]}
						/>
						<InputLine
							inputCells={[createPhoneNumberInput(currentUser, updateCurrentUser, isFormValid.phoneNumber || !isTriedToEdit)]}
						/>
					</div>
					<div className={cx("row-group")}>
						<InputLine
							inputCells={[createEmailInput(currentUser, updateCurrentUser, isFormValid.email || !isTriedToEdit)]}
						/>
					</div>
					<div className={cx("row-group")}>
						<InputLine
							inputCells={[
								createCustomSelector('직위', 'selectedDepartment', currentUser, updateCurrentUser, [
									{ text: '원장' },
									{ text: '국장' },
									{ text: '간호조무사' },
									{ text: '물리치료사' }
								]),
								createCustomSelector('부서', 'selectedDepartment', currentUser, updateCurrentUser, [
									{ text: '통증' },
									{ text: '센터' }
								])
							]}
						/>
					</div>
					<div className={cx("btn-group-submit")}>
						<Button variant="secondary" className={cx('btn-mypage-exit')} size="lg" onClick={() => navigate(-1)}>
						돌아가기
						</Button>
						<Button variant="info" className={cx('btn-mypage-confirm')} size="lg" onClick={() => {handleUpdate(); navigate('../')}}>
						변경하기
						</Button>
					</div>
				</Form>
			</div>
		</div>
	);
};

export default UserInformation;

	//const [currentPassword, setCurrentPassword] = useState("");
	//const [newPassword, setNewPassword] = useState("");
	//const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

/* <div className={cx("row-group")}>
						<div className={cx("inline")}>
							<div className={`${cx("cell")}`}>
								<InputGroup>
								<InputGroup.Text className={cx("input-label")}>비밀번호 변경</InputGroup.Text>
								<Form.Control
									type="password"
									placeholder="현재 비밀번호"
									value={currentPassword}
									size="sm"
									onChange={(e) => setCurrentPassword(e.target.value)}
									autoComplete="new-password"
								/>
								</InputGroup>
							</div>
						</div>
						<div className={cx("inline")}>
							<div className={`${cx("cell")}`}>
								<InputGroup>
								<InputGroup.Text className={cx("input-label")}>새 비밀번호</InputGroup.Text>
								<Form.Control
									type="password"
									placeholder="새 비밀번호"
									value={newPassword}
									size="sm"
									onChange={(e) => setNewPassword(e.target.value)}
								/>
								</InputGroup>
							</div>
						</div>
						<div className={cx("inline")}>
							<div className={`${cx("cell")}`}>
								<InputGroup>
								<InputGroup.Text className={cx("input-label")}>비밀번호 확인</InputGroup.Text>
								<Form.Control
									type="password"
									placeholder="새 비밀번호 확인"
									value={newPasswordConfirm}
									size="sm"
									onChange={(e) => {
									setNewPasswordConfirm(e.target.value)
									}}
								/>
								</InputGroup>
							</div>
						</div>
						{newPassword === newPasswordConfirm || newPasswordConfirm === "" ? null : <div className={cx("form-unvalid-msg")}>* 비밀번호가 일치하지 않습니다.</div>}
					</div> */