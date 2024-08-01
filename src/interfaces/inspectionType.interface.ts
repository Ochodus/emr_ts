export type numberInput = number | ""
export type rangeInput = {value: numberInput, min: numberInput, max: numberInput}
export type inspectionContent = ImooveContent | InBodyContent | ExbodyContent | LookinBodyContent | PhysicalPerformanceContent | null

export interface DefaultInspection<T extends inspectionContent> {
    file_urls: string[],
    inspected: string,
    content: T,
    detail: string
}

export interface ImooveContent {
    type: string,
    strength: numberInput,
    code: string,
    time: numberInput,
    sensitivity: numberInput,
    supports: {
        stability: numberInput,
        distribution: {
            denominator: numberInput,
            numerator: numberInput,
            points: numberInput
        }
    },
    trunk: {
        stability: numberInput,
        distribution: {
            denominator: numberInput,
            numerator: numberInput,
            points: numberInput
        }
    },
    postural_coordination: {
        value: numberInput,
        point: numberInput
    },
    postural_strategy: numberInput
}

export interface InBodyContent {
    body_water_composition: { // 체수분구성
        body_water: rangeInput, // 체수분
        intracellular: rangeInput, // 세포내수분
        extracellular: rangeInput, // 세포외수분
        extracellular_hydration_percentage: numberInput // 세포외수분비
    },
    segmental_body_water_analysis: { // 부위별 체수분 분석
        right_arm: rangeInput,
        left_arm: rangeInput,
        body: rangeInput,
        right_leg: rangeInput,
        left_leg: rangeInput
    },
    segmental_lean_analysis: { // 부위별 근육 분석
        right_arm: numberInput,
        left_arm: numberInput,
        body: numberInput,
        right_leg: numberInput,
        left_leg: numberInput
    }
    body_composition_analysis: { // 체성분 분석
        protein: rangeInput, // 단백질
        minerals: rangeInput, // 무기질
        body_fat_mass: rangeInput // 체지방량
        lean_body_mass: rangeInput, // 제지방량
        osseous_mineral: rangeInput, // 골무기질량
    }
    muscle_fat_analysis: { // 골격근 지방 분석
        weight: rangeInput, // 체중
        skeletal_muscles_mass: rangeInput, // 골격근량
        muscle_mass: rangeInput, // 근육량
        body_fat_mass: rangeInput // 체지방량
    }
    obesity_detail: { // 비만 분석
        BMI: rangeInput, // BMI
        fat_percentage: rangeInput // 체지방률
    },
    research_parameter: {
        basal_metabolic_rate: rangeInput, // 기초대사량
        visceral_fat_area: numberInput, // 내장지방단면적
        waist_hip_ratio: rangeInput, // 복부지방률
        body_cell_mass: rangeInput, // 체세포량
        upper_arm_circumference: numberInput, // 상완위팔둘레
        upper_arm_muscle_circumference: numberInput, // 상완위팔근육둘레
        tbw_ffm: numberInput, // TBW/FFM
        smi: numberInput, // SMI
    }
}

export interface ExbodyContent {
    [index: string]: analysis
}

export type analysis = SubAnalysis & {image: string}

export interface SubAnalysis {
    [index: string]: numberInput | SubAnalysis
}

export interface LookinBody {
    file_urls: string[],
    inspected: string,
    content: LookinBodyContent,
    detail: string
}

export interface LookinBodyContent {
    [category: string]: LookinInspection | null
}

export interface LookinInspection {
    type: string,
    value: numberInput,
    min_value: numberInput,
    max_value: numberInput
}

export interface PhysicalPerformanceContent {
    functional_line: FunctionalLine[],
    y_balance: YBalance[],
    ball_bounce: BallBounce[],
    dynamic_movement: DynamicMovement[]
}

export interface FunctionalLine {
    trial_number: number,
    rt: {
        rt: {
            rt: [numberInput, numberInput],
            lt: [numberInput, numberInput]
        },
        lt: {
            rt: [numberInput, numberInput],
            lt: [numberInput, numberInput]
        }
    }
    lt: {
        rt: {
            rt: [numberInput, numberInput],
            lt: [numberInput, numberInput]
        },
        lt: {
            rt: [numberInput, numberInput],
            lt: [numberInput, numberInput]
        }
    }
}

export interface YBalance {
    trial_number: number,
    rt: {
        at: [numberInput, numberInput],
        pl: [numberInput, numberInput],
        pm: [numberInput, numberInput]
    }
    lt: {
        at: [numberInput, numberInput],
        pl: [numberInput, numberInput],
        pm: [numberInput, numberInput]
    }
}

export interface BallBounce {
    trial_number: number,
    rt: {
        step: numberInput,
        distance: numberInput,
        trials: [
            {
                time: numberInput,
                amount: numberInput,
            },
            {
                time: numberInput,
                amount: numberInput
            },
            {
                time: numberInput,
                amount: numberInput
            }
        ],
        note: string
    },
    lt: {
        step: numberInput,
        distance: numberInput,
        trials: [
            {
                time: numberInput,
                amount: numberInput
            },
            {
                time: numberInput,
                amount: numberInput
            },
            {
                time: numberInput,
                amount: numberInput
            }
        ],
        note: string
    }
}

export interface DynamicMovement {
    trial_number: number,
    two_leg_jump: {
        time: numberInput,
        note: string
    },
    side_step: {
        rt: numberInput,
        lt: numberInput,
        note: string
    },
    side_one_step_in_out: {
        rt: numberInput,
        lt: numberInput,
        note: string
    },
    side_two_step_in_out: {
        rt: numberInput,
        lt: numberInput,
        note: string
    }
    forward_side_to_step: {
        rt: numberInput,
        lt: numberInput,
        note: string
    },
    brasilian_step: {
        time: numberInput,
        note: string
    },
    diagonal_line_run: {
        time: numberInput,
        note: string
    }
}
