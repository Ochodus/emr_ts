import 'bootstrap/dist/css/bootstrap.min.css';
import { Patient } from '../../interfaces';
import styles from './PatientDetailHeader.module.css'
import classNames from 'classnames/bind';

const HeaderMain = ({ curPatient }: { curPatient: Patient & {id: number} | undefined }) => {
    const cx = classNames.bind(styles);

    return (
        <div className={cx("header-main")}>
            <div className={cx("inline-section")}>
                {curPatient ? 
                <div className={`${cx("col-group")}`}>
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
                    <div className={`${cx("col-group")}`}>
                        <div className={cx("text-wrapper")}>
                            <span className={cx("patient-state")}>
                                체온
                            </span>
                            <span className={cx("value")}>
                                {"37.5"}
                            </span>
                        </div>
                        <div className={cx("text-wrapper")}>
                            <span className={cx("patient-state")}>
                                체중
                            </span>
                            <span className={cx("value")}>
                                {curPatient.weight}
                            </span>
                        </div>
                        <div className={cx("text-wrapper")}>
                            <span className={cx("patient-state")}>
                                신장
                            </span>
                            <span className={cx("value")}>
                                {curPatient.height}
                            </span>
                        </div>
                        <div className={cx("text-wrapper")}>
                            <span className={cx("patient-state")}>
                                {"(2020-03-01)"}
                            </span>
                        </div>
                    </div>
                : null}
                {curPatient ? 
                curPatient.noks?.map((nok) => { 
                    return (<div className={`${cx("col-group")}`}>
                                <div className={cx("text-wrapper")}>
                                    <span className={cx("patient-state")}>
                                        보호자
                                    </span>
                                </div>
                                <div className={cx("text-wrapper")}>
                                    <span className={cx("patient-state")}>
                                        {nok.type}
                                    </span>
                                    <span className={cx("value")}>
                                        {`${nok.last_name}${nok.first_name}, ${nok.sex} ${nok.birthday}세`}
                                    </span>
                                </div>
                            </div>)
                })
                : null}
            </div>
        </div>
    )
}

export default HeaderMain;

