import axios from "axios";
import React, { useState, useEffect } from "react";
import { useLocalTokenValidation } from '../api/commons/auth';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup'
import styles from './UserInformation.module.css'
import classNames from 'classnames/bind';
import { useNavigate } from "react-router-dom";

interface UserInformationProps {
	setDoctorData: React.Dispatch<React.SetStateAction<any>>,
	setFirstName: React.Dispatch<React.SetStateAction<string>>,
	setSecondName: React.Dispatch<React.SetStateAction<string>>,
	setPhoneN: React.Dispatch<React.SetStateAction<string[]>>,
	setEmail: React.Dispatch<React.SetStateAction<string>>,
	setNewPassword: React.Dispatch<React.SetStateAction<string>>,
	setSelectedPosition: React.Dispatch<React.SetStateAction<string>>,
	setSelectedDepartment: React.Dispatch<React.SetStateAction<string>>,
	config: {
		headers: {
        	Authorization: string;
    	}
	}
}

interface Doctor {
	department?: string,
	email?: string,
	first_name?: string,
	last_name?: string,
	sex?: number,
	id?: number,
	phone_number?: string,
	position?: string
	password?: string
}

const getDoctor = async ({
	setDoctorData,
	setFirstName,
	setSecondName,
	setPhoneN,
	setEmail,
	setSelectedPosition,
	setSelectedDepartment,
	config
}: UserInformationProps) => {
	try {
		const response = await axios.get(
			"/api/users",
			config
		);

		
		const doctorInfo = response.data[2]
		let phoneNumber = doctorInfo.phone_number.split('-')
		phoneNumber[0] = '010'
		setDoctorData(response.data)
		setFirstName(doctorInfo.first_name)
		setSecondName(doctorInfo.last_name)
		setPhoneN(phoneNumber)
		setEmail(doctorInfo.email)
		setSelectedPosition(doctorInfo.position)
		setSelectedDepartment(doctorInfo.department)
	} catch (error) {
		console.error("마이페이지 조회 중 오류 발생:", error)
	}
};

const UserInformation = ({axiosMode}: {axiosMode: boolean}) => {
	const checkAuth = useLocalTokenValidation()
	const cx = classNames.bind(styles)
	const navigate = useNavigate()

	const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null

	let config = {
		headers: {
			Authorization: "Bearer " + accessToken,
		},
	};

	const [FirstName, setFirstName] = useState("");
	const [SecondName, setSecondName] = useState("");
	const [phoneN, setPhoneN] = useState(["010", "", ""])
	const [email, setEmail] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
	const [showPswd, setShowPswd] = useState("");
	const [selectedPosition, setSelectedPosition] = useState("의사");
	const [selectedDepartment, setSelectedDepartment] = useState("원무과");
	const [doctorData, setDoctorData] = useState<Doctor | null>(null);

	const [isTriedToEdit, setIsTriedToEdit] = useState(false) // 회원 가입 시도 여부
	const [isFormValid, setIsFormValid] = useState({
		name: false, 
		phoneN: false, 
		email: false,
		newPasswordConfirm: false
	})

	useEffect(() => {
		if (axiosMode) { 
			getDoctor({
				setDoctorData,
				setFirstName,
				setSecondName,
				setPhoneN,
				setEmail,
				setNewPassword,
				setSelectedPosition,
				setSelectedDepartment,
				config
			}) 
		}
	}, [])

	useEffect(() => {
		if (axiosMode) checkAuth(".")
	}, [checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 정보 유효성 검사 수행
	
	const formValidationCheck = () => {
		let nameCheck = FirstName !== "" && SecondName !== ""
		let phoneNCheck = phoneN[1] !== "" && phoneN[2] !== ""
		let emailCheck = email !== ""
		let newPasswordConfirmCheck = newPassword === newPasswordConfirm
	
		setIsFormValid({
		  ...isFormValid, 
		  name: nameCheck,
		  phoneN: phoneNCheck,
		  email: emailCheck,
		  newPasswordConfirm: newPasswordConfirmCheck
		})
	
		return nameCheck && phoneNCheck && emailCheck && newPasswordConfirmCheck
	  } // 회원 가입 폼 유효성 검사

	const handleClick = async () => {
		setIsTriedToEdit(true)
		if (!formValidationCheck()) {
			alert("유효하지 않은 입력 필드가 있습니다.")
			return
		}
		try {
			// 변경된 정보만을 포함
			const data: Doctor = {};
			if (FirstName !== doctorData?.first_name) {
				data.first_name = FirstName;
			}
			if (SecondName !== doctorData?.last_name) {
				data.last_name = SecondName;
			}
			if (`-${phoneN[1]}-${phoneN[2]}` !== doctorData?.phone_number) {
				data.phone_number = `-${phoneN[1]}-${phoneN[2]}`
			}
			if (email !== doctorData?.email) {
				data.email = email;
			}
			if (newPassword && newPassword !== "") {
				data.password = newPassword;
			}
			if (selectedPosition !== doctorData?.position) {
				data.position = selectedPosition;
			}
			if (selectedDepartment !== doctorData?.department) {
				data.department = selectedDepartment;
			}

			if (Object.keys(data).length > 0) {
			const response = await axios.patch(
				`/api/users`,
				data,
				config
			);
			console.log("마이페이지 정보 수정 성공:", response.data);
			} else {
			console.log("변경된 정보가 없습니다.");
			}
		} catch (error) {
			console.error("마이페이지 정보 수정 중 오류 발생:", error);
		}
	}

	return (
		<div className={cx('structure-mypage')}>
			<img id={cx('logo-mypage')} src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="doctor" />
			<div id={cx('field-mypage')}>
				<h1 id={cx('title-mypage')}>마이페이지</h1>
				<div id={cx('doctor-name')}><h2>{`${selectedPosition} ${SecondName}${FirstName}`}</h2></div>
				<div className={cx('img-section')}>
					<div className={cx('doctor-img')}>
						<img
							id={cx('doctor-img')}
							src="img/doctor.png"
							alt="doctor"
							style={{ flex: "column" }}
						/>
					</div>
				</div>
				<Form id={cx('input-group-mypage')}>
					<div className={cx("row-group")}>
						<div className={cx("inline")}>
							<div className={`${cx("cell")}`}>
								<InputGroup>
									<InputGroup.Text className={cx("input-label")}>성명</InputGroup.Text>
									<Form.Control
										type="text"
										placeholder="성"
										value={SecondName}
										size="sm"
										onChange={(e) => setSecondName(e.target.value)}
									/>
									<Form.Control
										type="text"
										placeholder="이름"
										value={FirstName}
										size="sm"
										onChange={(e) => setFirstName(e.target.value)}
									/>
								</InputGroup>
							</div>
						</div>
						{isFormValid.name || !isTriedToEdit ? null : <div className={cx("form-unvalid-msg")}>* 필수 입력란입니다.</div>}
						<div className={cx("inline")}>
							<div className={`${cx("cell")}`}>
								<InputGroup>
								<InputGroup.Text className={cx("input-label")}>전화번호</InputGroup.Text>
								<Form.Select
									value={phoneN[0]}
									onChange={(e) => setPhoneN([e.target.value, phoneN[1], phoneN[2]])}
								>
									<option>010</option>
								</Form.Select>
								<div className={cx("dash")}> - </div>
								<Form.Control
									type="number"
									className={cx("phoneNumber")}
									value={phoneN[1]}
									onChange={(e) => setPhoneN([phoneN[0], e.target.value, phoneN[2]])}
								>
								</Form.Control>
								<div className={cx("dash")}> - </div>
								<Form.Control
									type="number"
									className={cx("phoneNumber")}
									value={phoneN[2]}
									onChange={(e) => setPhoneN([phoneN[0], phoneN[1], e.target.value])}
								>
								</Form.Control>
								</InputGroup>
							</div>
						</div>
						{isFormValid.phoneN || !isTriedToEdit ? null : <div className={cx("form-unvalid-msg")}>* 필수 입력란입니다.</div>}
					</div>
					<div className={cx("row-group")}>
						<div className={cx("inline")}>
							<div className={`${cx("cell")}`}>
								<InputGroup>
									<InputGroup.Text className={cx("input-label")}>이메일</InputGroup.Text>
									<Form.Control
										type="email"
										placeholder="example@onnuri.com"
										value={email}
										size="sm"
										onChange={(e) => setEmail(e.target.value)}
									/>
								</InputGroup>
							</div>
						</div>
						{isFormValid.email || !isTriedToEdit ? null : <div className={cx("form-unvalid-msg")}>* 필수 입력란입니다.</div>}
					</div>
					<div className={cx("row-group")}>
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
					</div>
					<div className={cx("row-group")}>
						<div className={cx("inline")}>
							<div className={`${cx("cell")}`}>
								<InputGroup>
								<InputGroup.Text className={cx("input-label")}>직위</InputGroup.Text>
								<Form.Select
									value={selectedPosition}
									size="sm"
									onChange={(e) => setSelectedPosition(e.target.value)}
								>
									<option>원장</option>
									<option>국장</option>
									<option>간호조무사</option>
									<option>물리치료사</option>
								</Form.Select>
								</InputGroup>
							</div>
							<div className={`${cx("cell")} ${cx("blank")}`}></div>
							<div className={`${cx("cell")}`}>
								<InputGroup>
								<InputGroup.Text className={cx("input-label")}>부서</InputGroup.Text>
								<Form.Select
									value={selectedDepartment}
									size="sm"
									onChange={(e) => setSelectedDepartment(e.target.value)}
								>
									<option>통증</option>
									<option>센터</option>
								</Form.Select>
								</InputGroup>
							</div>
						</div>
					</div>
					<div className={cx("btn-group-submit")}>
						<Button variant="secondary" className={cx('btn-mypage-exit')} size="lg" onClick={() => navigate('/login')}>
						돌아가기
						</Button>
						<Button variant="info" className={cx('btn-mypage-confirm')} size="lg" onClick={handleClick}>
						변경하기
						</Button>
					</div>
				</Form>
			</div>
		</div>
	);
};

export default UserInformation;
