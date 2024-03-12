import 'bootstrap/dist/css/bootstrap.min.css';
import { Patient, PhysicalExam } from '../../interfaces';
import styles from './PatientDetailHeader.module.css';
import classNames from 'classnames/bind';

const HeaderMain = ({ curPatient, lastPhysicalExam, setSubPage }: { curPatient: Patient & {id: number} | undefined, lastPhysicalExam: PhysicalExam | undefined, setSubPage: (page: string) => void}) => {
    const cx = classNames.bind(styles)
    const maxHeaderHeight = 80

    return (
        <div className={cx("header-main")}>
            <div className={cx("inline-section")}>
                {curPatient ? 
                <div className={`${cx("col-group")}`} style={{ minWidth: '250px' }}>
                    <div className={cx("text-wrapper")}>
                        <span className={cx("patient-id")}>
                            {curPatient?.id}
                        </span>
                    </div>
                    <div className={cx("text-wrapper")}>
                        <span className={cx("patient-name")}>
                            {`${curPatient?.last_name}${curPatient?.first_name}`}
                        </span>
                    </div>
                    <div className={cx("text-wrapper")}>
                        <span className={cx("patient-detail")}>
                            {+curPatient.sex == 0 ? "남" : "여" }, {new Date().getFullYear() - new Date(curPatient.birthday).getFullYear()}세  {curPatient.birthday}
                        </span>
                    </div>
                </div>
                : null}
                <div className={`${cx("col-group")} ${cx("border")}`}></div>
                {curPatient ? 
                    <div className={`${cx("col-group")} ${cx("physical-exam")}`} style={{ minWidth: '410px' }} onClick={() => {setSubPage("physicalExam")}}>
                        <div className={cx("text-wrapper")}>
                            <span className={cx("patient-state")}>
                                체온
                            </span>
                            <span className={cx("value")}>
                                {lastPhysicalExam?.body_temperature} ℃
                            </span>
                        </div>
                        <div className={cx("text-wrapper")}>
                            <span className={cx("patient-state")}>
                                체중
                            </span>
                            <span className={cx("value")}>
                                {lastPhysicalExam?.weight} kg
                            </span>
                        </div>
                        <div className={cx("text-wrapper")}>
                            <span className={cx("patient-state")}>
                                신장
                            </span>
                            <span className={cx("value")}>
                                {lastPhysicalExam?.height} cm
                            </span>
                        </div>
                        <div className={cx("text-wrapper")}>
                            <span className={cx("patient-state")}>
                                ({lastPhysicalExam?.recorded.replaceAll('"', '').split('T')[0]})
                            </span>
                        </div>
                    </div>
                : null}
                <div className={`${cx("col-group")} ${cx("border")}`}></div>
                <div className={`${cx("col-group")}`} style={{ minWidth: '200px' }}>
                    {curPatient ? 
                        <div className={cx("text-wrapper")}>
                            <span className={cx("patient-state")}>
                                보호자
                            </span>
                        </div> : null
                    }
                    {curPatient ? 
                        curPatient.noks?.map((nok, index) => { 
                            return (
                                index < 2 ?
                                <div className={cx("text-wrapper")} key={index}>
                                    <span className={cx("patient-state")}>
                                        {nok.type}
                                    </span>
                                    <span className={cx("value")}>
                                        {`${nok.last_name}${nok.first_name}, ${nok.relationship} ${new Date().getFullYear() - new Date(nok.birthday ?? "").getFullYear()}세`}
                                    </span>
                                </div> : null
                            )
                        }) : null
                    }
                </div>
            </div>
        </div>
    )
}

export default HeaderMain;

