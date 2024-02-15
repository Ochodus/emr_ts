import React, { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import { InBodyTable } from '../..'
import { ResponsiveBullet, Datum } from '@nivo/bullet'
import { scaleLinear } from 'd3-scale'
import OcrParser from '../../../commons/OcrParser'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styles from './InBodyAddModal.module.css'
import classNames from 'classnames/bind';
import Input from 'react-select/dist/declarations/src/components/Input'
import { useParams } from 'react-router-dom'
import { factory } from 'typescript'
import { useDateTimeParser } from '../../../../api/commons/dateTimeParse'

interface Inspection {
    value?: number,
    minValue?: number,
    maxValue?: number,
    percentage?: number,
    range?: number[],
    title?: string,
    id?: string
}

interface InbodyOcrResult {
    [name: string]: Inspection | undefined
}

interface InbodyResultStates {
    [index: string]: [Inspection, React.Dispatch<React.SetStateAction<Inspection>>]
}

const getPercentageFromValue = (minValue: number, minRatio: number, value: number, valuePercentage?: number) => {
    if (valuePercentage) return 0
    else return Math.round(+value/(+minValue/(minRatio/100)) * 100000)/1000
}
const getValueFromPercentage = (minValue: number, minPercentage: number, value: number, ) => {
    return Math.round(((minValue/minPercentage)) * value)/100
}

const getWeightNormalRange = (height: number) => {
    let min = Math.pow(height/100, 2) * 22 * 0.85
    let max = Math.pow(height/100, 2) * 22 * 1.15
    return {min: min, max: max}
}

const InBodyAddModal = ({show, handleClose, isNew=false, cv}: {show: any, handleClose: ()=> void, isNew?: boolean, cv: any}) => {
    const cx = classNames.bind(styles);
    const dateParser = useDateTimeParser()

    const [date, setDate] = useState<Date>(new Date());

    const [bodyWater, setBodyWater] = useState<Inspection>({id: 'bodyWater', title:'체수분', range: [70, 90, 110, 170]})
    const [muscleMass, setMuscleMass] = useState<Inspection>({id: 'muscleMass', title:'근육량'})
    const [leanBodyMass, setLeanBodyMass] = useState<Inspection>({id: 'leanBodyMass', title:'제지방량'})
    const [weight, setWeight] = useState<Inspection>({id: 'weight', title:'체중', range: [55, 85, 115, 210]})
    const [protein, setProtein] = useState<Inspection>({id: 'protein', title:'단백질'})
    const [minerals, setMinerals] = useState<Inspection>({id: 'minerals', title: '무기질'})
    const [bodyFatMass, setBodyFatMass] = useState<Inspection>({id: 'bodyFatMass', title:'체지방', range: [40, 80, 160, 520]})
    const [skeletalMuscleMass, setSkeletalMuscleMass] = useState<Inspection>({id: 'skeletalMuscleMass', title:'골격근량', range: [70, 90, 110, 170]})

    const [bmi, setBmi] = useState<Inspection>({id: 'bmi', title:'BMI', range: [10.0, 18.5, 25.0, 55.0]})
    const [percentBodyFat, setPercentBodyFat] = useState<Inspection>({id: 'percentBodyFat', title:'체지방률', range: [0.1, 10.0, 20.0, 50.0]})

    const [rightArmSLA, setRightArmSLA] = useState<Inspection>({id: 'rightArmSLA', title:'오른팔', range: [55, 85, 115, 175]})
    const [leftArmSLA, setLeftArmSLA] = useState<Inspection>({id: 'leftArmSLA', title:'왼팔', range: [55, 85, 115, 175]})
    const [trunkSLA, setTrunkSLA] = useState<Inspection>({id: 'trunkSLA', title:'몸통', range: [70, 90, 110, 150]})
    const [rightLegSLA, setRightLegSLA] = useState<Inspection>({id: 'rightLegSLA', title:'오른다리', range: [70, 90, 110, 150]})
    const [leftLegSLA, setLeftLegSLA] = useState<Inspection>({id: 'leftLegSLA', title:'왼다리', range: [70, 90, 110, 150]})

    const [ecwRatio, setEcwRatio] = useState<Inspection>({id: 'ecwRatio', title:'세포외수분비', minValue: 0.360, maxValue: 0.390, range: [0.320, 0.360, 0.390, 0.450]})

    const [intracellularWater, setIntracellularWater] = useState<Inspection>({id: 'intracellularWater', title:'세포내수분', range: [70, 90, 110, 170]})
    const [extracellularWater, setExtracellularWater] = useState<Inspection>({id: 'extracellularWater', title:'세포외수분', range: [70, 90, 110, 170]})

    const [rightArmSBA, setRightArmSBA] = useState<Inspection>({id: 'rightArmSBA', title:'오른팔', range: [55, 85, 115, 205]})
    const [leftArmSBA, setLeftArmSBA] = useState<Inspection>({id: 'leftArmSBA', title:'왼팔', range: [55, 85, 115, 205]})
    const [trunkSBA, setTrunkSBA] = useState<Inspection>({id: 'trunkSBA', title:'몸통', range: [70, 90, 110, 170]})
    const [rightLegSBA, setRightLegSBA] = useState<Inspection>({id: 'rightLegSBA', title:'오른다리', range: [70, 90, 110, 170]})
    const [leftLegSBA, setLeftLegSBA] = useState<Inspection>({id: 'leftLegSBA', title:'왼다리', range: [70, 90, 110, 170]})

    const [rightArmECWR, setRightArmECWR] = useState<Inspection>({id: 'rightArmECWR', title:'오른팔', range: [0.36, 0.39, 0.40, 0.43]})
    const [leftArmECWR, setLeftArmECWR] = useState<Inspection>({id: 'leftArmECWR', title:'왼팔', range:[0.36, 0.39, 0.40, 0.43]})
    const [trunkECWR, setTrunkECWR] = useState<Inspection>({id: 'trunkECWR', title:'몸통', range: [0.36, 0.39, 0.40, 0.43]})
    const [rightLegECWR, setRightLegECWR] = useState<Inspection>({id: 'rightLegECWR', title:'오른다리', range: [0.36, 0.39, 0.40, 0.43]})
    const [leftLegECWR, setLeftLegECWR] = useState<Inspection>({id: 'leftLegECWR', title:'왼다리', range: [0.36, 0.39, 0.40, 0.43]})

    const [osseousMineral, setOsseousMineral] = useState<Inspection>({id: 'osseousMineral', title:'골무기질량'})

    const [basalMetabolicRate, setBasalMetabolicRate] = useState<Inspection>({id: 'basalMetabolicRate', title:'기초대사량'})
    const [visceralFatArea, setVisceralFatArea] = useState<Inspection>({id: 'visceralFatArea', title:'내장지방단면적'})
    const [waistHipRatio, setWaistHipRatio] = useState<Inspection>({id: 'waistHipRatio', title:'복부지방률'})
    const [bodyCellMass, setBodyCellMass] = useState<Inspection>({id: 'bodyCellMass', title:'체세포량'})
    const [upperArmCircumference, setUpperArmCircumference] = useState<Inspection>({id: 'upperArmCircumference', title:'상완위팔둘레'})
    const [upperArmMuscleCircumference, setUpperArmMuscleCircumference] = useState<Inspection>({id: 'upperArmMuscleCircumference', title:'상완위팔근육둘레'})
    const [tbwFfm, setTbwFfm] = useState<Inspection>({id: 'tbwFfm', title:'TBW/FFM'})
    const [smi, setSMI] = useState<Inspection>({id: 'smi', title:'SMI'})

    const [muscleFatAnalysis, setMuscleFatAnalysis] = useState<(Datum)[]>([])
    const [obesityAnalysis, setObesityAnalysis] = useState<(Datum)[]>([])
    const [segmentalLeanAnalysis, setSegmentalLeanAnalysis] = useState<(Datum)[]>([])
    const [ecwRatioAnalysis, setEcwRatioAnalysis] = useState<(Datum)[]>([])
    const [bodyWaterComposition, setBodyWaterComposition] = useState<(Datum)[]>([])
    const [segmentalBodyWaterAnalysis, setSegmentalBodyWaterAnalysis] = useState<(Datum)[]>([])

    const [showPercentage, setShowPercentage] = useState(true)

    const inbodyResultStates: InbodyResultStates = {
        bodyWater: [bodyWater, setBodyWater],
        muscleMass: [muscleMass, setMuscleMass],
        leanBodyMass: [leanBodyMass, setLeanBodyMass],
        weight: [weight, setWeight],
        protein: [protein, setProtein],
        minerals: [minerals, setMinerals],
        bodyFatMass: [bodyFatMass, setBodyFatMass],
        skeletalMuscleMass: [skeletalMuscleMass, setSkeletalMuscleMass],
        bmi: [bmi, setBmi],
        percentBodyFat: [percentBodyFat, setPercentBodyFat],
        rightArmSLA: [rightArmSLA, setRightArmSLA],
        leftArmSLA: [leftArmSLA, setLeftArmSLA],
        trunkSLA: [trunkSLA, setTrunkSLA],
        rightLegSLA: [rightLegSLA, setRightLegSLA],
        leftLegSLA: [leftLegSLA, setLeftLegSLA],
        ecwRatio: [ecwRatio, setEcwRatio],
        intracellularWater: [intracellularWater, setIntracellularWater],
        extracellularWater: [extracellularWater, setExtracellularWater],
        rightArmSBA: [rightArmSBA, setRightArmSBA],
        leftArmSBA: [leftArmSBA, setLeftArmSBA],
        trunkSBA: [trunkSBA, setTrunkSBA],
        rightLegSBA: [rightLegSBA, setRightLegSBA],
        leftLegSBA: [leftLegSBA, setLeftLegSBA],
        rightArmECWR: [rightArmECWR, setRightArmECWR],
        leftArmECWR: [leftArmECWR, setLeftArmECWR],
        trunkECWR: [trunkECWR, setTrunkECWR],
        rightLegECWR: [rightLegECWR, setRightLegECWR],
        leftLegECWR: [leftLegECWR, setLeftLegECWR],
        osseousMineral: [osseousMineral, setOsseousMineral],
        basalMetabolicRate: [basalMetabolicRate, setBasalMetabolicRate],
        visceralFatArea: [visceralFatArea, setVisceralFatArea],
        waistHipRatio: [waistHipRatio, setWaistHipRatio],
        bodyCellMass: [bodyCellMass, setBodyCellMass], 
        upperArmCircumference: [upperArmCircumference, setUpperArmCircumference], 
        upperArmMuscleCircumference: [upperArmMuscleCircumference, setUpperArmMuscleCircumference], 
        tbwFfm: [tbwFfm, setTbwFfm], 
        smi: [smi, setSMI]
    }

    const inbodyResultGraphGroupState = [
        {
            label: "골격근/지방 분석",
            state: muscleFatAnalysis,
            member: [weight, skeletalMuscleMass, bodyFatMass]
        },
        {
            label: "비만 분석",
            state: obesityAnalysis,
            member: [bmi, percentBodyFat]
        },
        {
            label: "부위별 근육 분석",
            state: segmentalLeanAnalysis,
            member: [rightArmSLA, leftArmSLA, trunkSLA, rightLegSLA, leftLegSLA]
        },
        {   label: "세포외수분비 분석",
            state: ecwRatioAnalysis,
            member: [ecwRatio]
        },
        {
            label: "체수분구성",
            state: bodyWaterComposition,
            member: [bodyWater, intracellularWater, extracellularWater]
        },
        {
            label: "부위별 체수분 분석",
            state: segmentalBodyWaterAnalysis,
            member: [rightArmSBA, leftArmSBA, trunkSBA, rightLegSBA, leftLegSBA]
        }
    ]
    
    const { patient_id } = useParams();
    const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
	const url = `/api/patients/${patient_id}/medical/inspections/inbody`

    const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

    const inbodyResultMiscState = { 
        member: [
            osseousMineral,
            basalMetabolicRate,
            visceralFatArea,
            waistHipRatio,
            bodyCellMass, 
            upperArmCircumference, 
            upperArmMuscleCircumference, 
            tbwFfm, 
            smi
        ],
        memberLabel: [
            'osseousMineral',
            'basalMetabolicRate',
            'visceralFatArea',
            'waistHipRatio',
            'bodyCellMass', 
            'upperArmCircumference', 
            'upperArmMuscleCircumference', 
            'tbwFfm', 
            'smi'
        ],
        memberTitle: [
            '골무기질량',
            '기초대사량',
            '내장지방단면적',
            '복부지방률',
            '체세포량',
            '상완위팔둘레',
            '상완위팔근육둘레',
            'TBW/FFM',
            'SMI'
        ]
    }

    const parseStringToData = (value: string | undefined) => {
        if (!value) return undefined
        
        let s = value.replace(/[^\d.\s]/g, ' ')
        console.log(s)
        let numbers = value.replace(/[m|cm]2/, '').replace(/[^\d.\s]/g, ' ').replace(/\s+$/, '').split(/\s+/).map(Number);
        console.log(numbers)
        
        if (numbers.length === 1) return { value: numbers[0] }
        if (numbers.length === 2) return { value: numbers[0], percentage: numbers[1] }
        if (numbers.length === 3) return { value: numbers[0], minValue: numbers[1], maxValue: numbers[2] }
        return undefined
    }

    const onChangeOcrResult = (result: any) => {
        console.log(result)

        const parsedData: InbodyOcrResult = {
            bodyWater: parseStringToData(result.bodyWater),
            muscleMass: parseStringToData(result.muscleMass),
            leanBodyMass: parseStringToData(result.leanBodyMass),
            weight: parseStringToData(result.weight),
            protein: parseStringToData(result.protein),
            minerals: parseStringToData(result.minerals),
            bodyFatMass: parseStringToData(result.bodyFatMass),
            skeletalMuscleMass: parseStringToData(result.skeletalMuscleMass),
            bmi: parseStringToData(result.bmi),
            percentBodyFat: parseStringToData(result.percentBodyFat),
            rightArmSLA: parseStringToData(result.rightArmSLA),
            leftArmSLA: parseStringToData(result.leftArmSLA),
            trunkSLA: parseStringToData(result.trunkSLA),
            rightLegSLA: parseStringToData(result.rightLegSLA),
            leftLegSLA: parseStringToData(result.rightLegSLA),
            ecwRatio: parseStringToData(result.ecwRatio),
            intracellularWater: parseStringToData(result.intracellularWater),
            extracellularWater: parseStringToData(result.extracellularWater),
            rightArmSBA: parseStringToData(result.rightArmSBA),
            leftArmSBA: parseStringToData(result.leftArmSBA),
            trunkSBA: parseStringToData(result.trunkSBA),
            rightLegSBA: parseStringToData(result.rightLegSBA),
            leftLegSBA: parseStringToData(result.leftLegSBA),
            rightArmECWR: parseStringToData(result.rightArmECWR),
            leftArmECWR: parseStringToData(result.leftArmECWR),
            trunkECWR: parseStringToData(result.trunkECWR),
            rightLegECWR: parseStringToData(result.rightLegECWR),
            leftLegECWR: parseStringToData(result.leftLegECWR),
            osseousMineral: parseStringToData(result.osseousMineral),
            basalMetabolicRate: parseStringToData(result.basalMetabolicRate),
            visceralFatArea: parseStringToData(result.visceralFatArea),
            waistHipRatio: parseStringToData(result.waistHipRatio),
            bodyCellMass: parseStringToData(result.bodyCellMass),
            upperArmCircumference: parseStringToData(result.upperArmCircumference),
            upperArmMuscleCircumference: parseStringToData(result.upperArmMuscleCircumference),
            tbwFfm: parseStringToData(result.tbwFfm),
            smi: parseStringToData(result.smi)
        }

        console.log(parsedData)

        Object.values(inbodyResultStates).map((states, index) => {
            let key = Object.keys(inbodyResultStates)[index]
            let origin = inbodyResultStates[key][0]
            let newData = parsedData[key]
            if (newData) {
                if (key === "ecwRatio") newData = {...newData, title: origin.title, id: origin.id, range: origin.range, minValue: origin.minValue, maxValue: origin.maxValue}
                else newData = {...newData, title: origin.title, id: origin.id, range: origin.range}
                states[1](newData)
            }
        })

        setDate(new Date(result.date.split(' ')[0]))
    }

    const headers = useMemo(
        () => [
            {
                Header: "",
                accessor: "type",
            },
            {
                Header: "측정치",
                accessor: "estimation",
            },
            {
                Header: "체수분",
                accessor: "body_water",
            },
            {
                Header: "근육량",
                accessor: "muscle_mass",
            },
            {
                Header: "제지방량",
                accessor: "lean_body_mass",
            },
            {
                Header: "체중",
                accessor: "weight",
            },
        ],
        []
    )

    const handleInspectionValueChange = (value: string, title: string | undefined, type: string) => {
        console.log(title)
        
        if (!title) return
        
        let origin = inbodyResultStates[title][0]
        let set = inbodyResultStates[title][1]

        if (type === "value") {
            set({...origin, value: +value})
        }
        if (origin.range) {
            if (type === "minValue") {
                set({
                    ...origin, 
                    minValue: +value, 
                    maxValue: Math.round((+value * (100 / origin.range[1])) * origin.range[2]) / 100
                })
            }
            if (type === "maxValue") {
                set({
                    ...origin, 
                    minValue: Math.round((+value * (100 / origin.range[2])) * origin.range[1]) / 100, 
                    maxValue: +value
                })
            }
        }
        if (type === "percentage") {
            set({...origin, percentage: +value})
        }
    }

    const RowTitle = ({koTitle, enTitle, unit}: {koTitle: string, enTitle: string, unit: string}) => {
        return (
            <div className={cx("row-title")}>
                <div className={cx("row-title-ko-wrapper")}>
                    <div className={cx("row-title-ko")}>
                        {koTitle}
                    </div>
                    <div className={cx("row-title-unit")}>
                        {`(${unit})`}
                    </div>
                </div>
                <div className={cx("row-title-en")}>
                    {enTitle}
                </div>
            </div>
        )
    }

    const Entry = ({value, title}: {value: Inspection, title: string}) => {
        return (
            <div className={cx("entry")}>
                <Form.Control
                    type="number"
                    value={value ? value.value ?? "" : ""}
                    onChange={(e) => handleInspectionValueChange(e.target.value, title, 'value')}
                    className="text-center"
                ></Form.Control>
            </div>
        )
    }

    const EntryWithMinMax = ({value, title, isHeader=false}: {value: Inspection, title: string, isHeader?: boolean}) => {
        return (
            <div className={`${cx("entry-wrapper")} ${isHeader ? cx("entry-header") : cx("entry-contents")}`}>
                <Entry value={value} title={title}></Entry>
                <div className={cx("min-max")}>
                    <InputGroup>
                        <Form.Control
                            size="sm"
                            type="number"
                            className="text-center"
                            value={value ? value.minValue ?? "" : ""}
                            onChange={(e) => handleInspectionValueChange(e.target.value, title, 'minValue')}
                            style={{ minWidth: '70px' }}
                        />
                        <div>~</div>
                        <Form.Control
                            size="sm"
                            type="number"
                            className="text-center"
                            value={value ? value.maxValue ?? "" : ""}    
                            onChange={(e) => handleInspectionValueChange(e.target.value, title, 'maxValue')}
                            style={{ minWidth: '70px' }}
                        />
                    </InputGroup>
                </div>
            </div>
        )
    }

    const items = [
        {
            type: <RowTitle koTitle="체수분" enTitle="Total Body Water" unit="L"></RowTitle>,
            estimation: <EntryWithMinMax value={bodyWater} title="bodyWater" isHeader={true}></EntryWithMinMax>,
            body_water: <Entry value={bodyWater} title="bodyWater"></Entry>,
            muscle_mass: <EntryWithMinMax value={muscleMass} title="muscleMass"></EntryWithMinMax>,
            lean_body_mass: <EntryWithMinMax value={leanBodyMass} title="leanBodyMass"></EntryWithMinMax>,
            weight: <EntryWithMinMax value={weight} title="weight"></EntryWithMinMax>,
        },
        {
            type: <RowTitle koTitle="단백질" enTitle="Protein" unit="kg"></RowTitle>,
            estimation: <EntryWithMinMax value={protein} title="protein" isHeader={true}></EntryWithMinMax>,
        },
        {
            type: <RowTitle koTitle="무기질" enTitle="Minerals" unit="kg"></RowTitle>,
            estimation: <EntryWithMinMax value={minerals} title="minerals" isHeader={true}></EntryWithMinMax>,
        },
        {
            type: <RowTitle koTitle="체지방" enTitle="Body Fat Mass" unit="kg"></RowTitle>,
            estimation: <EntryWithMinMax value={bodyFatMass} title="bodyFatMass" isHeader={true}></EntryWithMinMax>,
        },
    ]

    const addInBodyRecord = async () => {
        const newInBodyRecord = {
            file_url: "",
            inspected: dateParser(date ?? new Date()),
            content: {
                user_id: patient_id,
                height: 0,
                hydration: bodyWater.value,
                protein: protein.value,
                minerals: minerals.value,
                fat: bodyFatMass.maxValue,
                hydration_detail: {
                    body: bodyWater.value,
                    intracellular: intracellularWater.value,
                    extracellular: extracellularWater.value
                },
                skeletal_muscels_fat: {
                    weight: weight.value,
                    skeletal_muscles: skeletalMuscleMass.value,
                    fat: bodyFatMass.value
                },
                obesity_detail: {
                    BMI: bmi.value,
                    fat_percentage: percentBodyFat.value
                },
                muscles_by_region: {
                    right_arm: rightArmSLA.value,
                    left_arm: leftArmSLA.value,
                    body: trunkSLA.value,
                    right_leg: rightLegSLA.value,
                    left_leg: leftLegSLA.value
                },
                hydration_by_region: {
                    right_arm: rightArmSBA.value,
                    left_arm: leftArmSBA.value,
                    body: trunkSBA.value,
                    right_leg: rightLegSBA.value,
                    left_leg: leftLegSBA.value
                },
                extracellular_hydration_by_region: {
                    right_arm: rightArmECWR.value,
                    left_arm: leftArmECWR.value,
                    body: trunkECWR.value,
                    right_leg: rightLegECWR.value,
                    left_leg: leftLegECWR.value
                },
                extracellular_hydration_percentage: ecwRatio.value,
                body_changes: []
            },
            detail: ""
        }
        try {
            await axios.post(url, newInBodyRecord, config)
                console.log("InBody 검사 기록 추가 성공");
        } catch (error) {
                console.error("InBody 검사 기록 추가 중 오류 발생:", error);
        }
    }

    const renderSelected = () => {
    }

    const getGraphDatum = (id: string) => {
        let targetData = inbodyResultStates[id][0]
            let title = targetData.title
            let minValue = targetData.minValue
            let percentage = targetData.percentage
            let ranges = targetData.range
            let measures = targetData.value
            let markers = targetData.value

            if (!ranges || !measures || !markers) { return {id: id, title: title, ranges: [0, 0, 0, 0], markers: [0], measures: [0]} }

            if (minValue) measures = getPercentageFromValue(minValue, ranges[1], measures, percentage)
            else if (percentage) measures = percentage
            
            markers = measures


            return (
                {
                    id: id,
                    title: title,
                    ranges: ranges,
                    measures: [measures],
                    markers: [markers]
                }
            )
    }

    useEffect(() => {
        let ids: string[] = ["weight", "skeletalMuscleMass", "bodyFatMass"]
        setMuscleFatAnalysis(ids.map((id) => {
            return getGraphDatum(id)
        }))
    }, [weight, skeletalMuscleMass, bodyFatMass])

    useEffect(() => {
        let ids: string[] = ["bmi", "percentBodyFat"]
        setObesityAnalysis(ids.map((id) => {
            return getGraphDatum(id)
        }))
    }, [bmi, percentBodyFat])

    useEffect(() => {
        let ids: string[] = ["rightArmSLA", "leftArmSLA", "trunkSLA", "rightLegSLA", "leftLegSLA"]
        setSegmentalLeanAnalysis(ids.map((id) => {
            return getGraphDatum(id)
        }))
    }, [rightArmSLA, leftArmSLA, trunkSLA, rightLegSLA, leftLegSLA])

    useEffect(() => {
        let ids: string[] = ["ecwRatio"]
        setEcwRatioAnalysis(ids.map((id) => {
            return getGraphDatum(id)
        }))
    }, [ecwRatio])

    useEffect(() => {
        let ids: string[] = ["bodyWater", "intracellularWater", "extracellularWater"]
        setBodyWaterComposition(ids.map((id) => {
            return getGraphDatum(id)
        }))
    }, [bodyWater, intracellularWater, extracellularWater])

    useEffect(() => {
        let ids: string[] = ["rightArmSBA", "leftArmSBA", "trunkSBA", "rightLegSBA", "leftLegSBA"]
        setSegmentalBodyWaterAnalysis(ids.map((id) => {
            return getGraphDatum(id)
        }))
    }, [rightArmSBA, leftArmSBA, trunkSBA, rightLegSBA, leftLegSBA])

    return (
        <Modal show={show} onShow={renderSelected} onHide={handleClose} size='xl'>
            <Modal.Header closeButton>
                <Modal.Title>
                    <span className={cx("title")}>
                        <strong>InBody</strong>
                    </span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className={cx("contents")}>
                    <div className={cx("page-content")}>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")}>
                                <span>파일 업로드</span>
                            </div>
                            <div className={cx("inline")}>
                                <div className={`${cx("cell")} ${cx("text-only")}`}>
                                    <strong>체성분</strong>
                                    <div className={`${cx("cell")} ${cx("smaller")}`}>
                                        <OcrParser 
                                            type={0} 
                                            isMask={true} 
                                            setOcrResult={onChangeOcrResult} 
                                            cv={cv} 
                                            smallSize={true}
                                            indicator={1}
                                            >
                                        </OcrParser>
                                    </div>
                                </div>
                                <div className={`${cx("cell")} ${cx("text-only")}`}>
                                <strong>체수분</strong>
                                    <div className={`${cx("cell")} ${cx("smaller")}`}>
                                        <OcrParser 
                                            type={1} 
                                            isMask={true} 
                                            setOcrResult={onChangeOcrResult} 
                                            cv={cv} 
                                            smallSize={true}
                                            indicator={2}
                                            >
                                        </OcrParser>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")}>
                                <span>체성분 분석</span>
                            </div>
                            <div className={cx("group-content")}>
                                <div className={cx("inline")}>
                                    <div className={`${cx("cell")}`}>
                                        <InBodyTable headers={headers} items={items} useSelector={false}>
                                        </InBodyTable>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {inbodyResultGraphGroupState.map((group) => { return (
                            <div className={cx("group-field")} key={group.label}> 
                                <div className={cx("group-title")}>
                                    <span>{`${group.label}`}</span>
                                </div>                            
                                <div className={cx("group-content")}>                                
                                    <div className={`${cx("inline")} ${cx("chart")}`}>
                                        <div className={`${cx("cell")} ${cx('large')}`} style={{ height: `${30 + 80 * group.state.length}px` }}>
                                            {<ResponsiveBullet
                                                data={group.state}
                                                margin={{ top: 30, right: 10, bottom: 40, left: 40 }}
                                                minValue={'auto'}
                                                spacing={50}
                                                titleOffsetX={-23}
                                                titleOffsetY={-2}
                                                titleRotation={-90}
                                                measureSize={0.45}
                                                markerSize={0.55}
                                                rangeColors='pastel1'
                                                measureColors='seq:warm'
                                                markerColors='seq:warm'
                                                tooltip={( point ) => {
                                                    return (
                                                        <div                                                
                                                            style={{
                                                                background: 'white',
                                                                borderRadius: '2px',
                                                                boxShadow: 'rgba(0, 0, 0, 0.25) 0px 1px 2px',
                                                                padding: '5px 9px',
                                                                width: 'auto',
                                                                height: '34px',
                                                                display: 'flex',
                                                                alignContent: 'center'
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    background: point.color,
                                                                    width: '10px',
                                                                    height: '10px',
                                                                    margin: 'auto',
                                                                    marginRight: '5px',
                                                                }}
                                                                
                                                            ></div>
                                                            <strong>{point.v0}</strong>
                                                            {point.v1 ? ' ~ ' : ''}
                                                            {point.v1 ?
                                                                <strong>{point.v1}</strong> : 
                                                                ''
                                                            } {
                                                                '(%)'
                                                            }
                                                        </div>
                                                    )
                                                }}
                                            />}
                                        </div>
                                        <div className={`${cx("cell")} ${cx("small")}`} style={{ height: `${30 + 80 * group.state.length}px`, marginTop: '15px', paddingRight: '2px' }}>
                                            {group.member.map((inspection, index) => {
                                                return (
                                                    <div className={`${cx('chartInput')}`} key={index}>
                                                        <div className={`${cx('chartValueInput')}`}>
                                                            <Form.Control
                                                                type="number"
                                                                value={inspection.value ?? ""}
                                                                onChange={(e) => {handleInspectionValueChange(e.target.value, inspection.id, 'value')}}
                                                                style={{ width: '80px', height: '30px', textAlign: 'center', fontSize: '12px'}}
                                                            />
                                                        </div>
                                                        {inspection.minValue ?
                                                        <div className={`${cx('chartMinMaxInput')}`}>
                                                            <Form.Control
                                                                type="number"
                                                                value={inspection.minValue ?? ""}
                                                                onChange={(e) => {handleInspectionValueChange(e.target.value, inspection.id, 'minValue')}}
                                                                style={{ width: '80px', height: '30px', textAlign: 'center', fontSize: '12px'}}
                                                            />
                                                            <Form.Control
                                                                type="number"
                                                                value={inspection.maxValue ?? ""}
                                                                onChange={(e) => {handleInspectionValueChange(e.target.value, inspection.id, 'maxValue')}}
                                                                style={{ width: '80px', height: '30px', textAlign: 'center', fontSize: '12px'}}
                                                            />
                                                        </div> :
                                                        <div className={`${cx('chartPercentageInput')}`}>
                                                            <Form.Control
                                                                type="number"
                                                                value={inspection.percentage ?? ""}
                                                                onChange={(e) => {handleInspectionValueChange(e.target.value, inspection.id, 'percentage')}}
                                                                style={{ width: '80px', height: '30px', textAlign: 'center', fontSize: '12px'}}
                                                            />
                                                        </div>
                                                        }                     
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>) })
                        }
                        <div className={cx("group-field")}> 
                            <div className={cx("group-title")}>
                                <span>기타 항목</span>
                            </div>
                            <div className={cx("group-content")}>
                                {inbodyResultMiscState.member.map((inspection, index) => { 
                                    if (inspection) {
                                        return (
                                            <div style={{ display: 'flex', borderBottom: '1px solid grey', padding: '10px'}} key={index}>
                                                <div style={{ margin: 'auto 10px', width: '30%', fontSize: '21px', fontWeight: '550', color: 'gray' }}> {inbodyResultMiscState.memberTitle[index]}</div>
                                                <div className={`${cx('chartInput')} ${cx('misc')}`} style={{ margin: 'auto', display: 'flex', flexDirection: 'row' }}>
                                                    <div className={`${cx('chartValueInput')}`} style={{ margin: 'auto', marginRight: '10px'}}>
                                                        <Form.Control
                                                            type="number"
                                                            value={inspection.value ?? ""}
                                                            onChange={(e) => {handleInspectionValueChange(e.target.value, inbodyResultMiscState.memberLabel[index], 'value')}}
                                                            style={{ textAlign: 'center', fontSize: '15px', margin: '0'}}
                                                        />
                                                    </div>
                                                    {inspection.minValue ?
                                                    <div className={`${cx('chartMinMaxInput')}`} style={{ margin: 'auto'}}>
                                                        (<Form.Control
                                                            type="number"
                                                            value={inspection.minValue ?? ""}
                                                            onChange={(e) => {handleInspectionValueChange(e.target.value, inbodyResultMiscState.memberLabel[index], 'minValue')}}
                                                            style={{ textAlign: 'center', fontSize: '15px', margin: '0 10px' }}
                                                        />~
                                                        <Form.Control
                                                            type="number"
                                                            value={inspection.maxValue ?? ""}
                                                            onChange={(e) => {handleInspectionValueChange(e.target.value, inbodyResultMiscState.memberLabel[index], 'maxValue')}}
                                                            style={{ textAlign: 'center', fontSize: '15px',  margin: '0 10px' }}
                                                        />)
                                                    </div> : null
                                                    }                     
                                                </div>
                                            </div>
                                        )
                                    }
                                })}
                            </div>
                            <div className={cx("inline")}>
                                <div className={cx("cell")}>
                                    <InputGroup>
                                        <InputGroup.Text>검사일자</InputGroup.Text>
                                        <Form.Control
                                            type="date"
                                            value={date?.toLocaleDateString('en-CA')}
                                            onChange={(e)=> setDate(new Date(e.target.value))}
                                        >
                                        </Form.Control>
                                    </InputGroup>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className={cx("inline-btn")}>
                    <Button variant="primary" onClick={addInBodyRecord}>
                        {isNew ? "추가": "변경"}
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                        취소
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    )
}

export default InBodyAddModal
