type numberInput = number | ""

export interface Imoove {
    file_url: string,
    inspected: string,
    content: {
        type: string,
        strength: number,
        code: string,
        time: number,
        sensitivity: number,
        supports: {
            stability: number,
            distribution: {
                denominator: number,
                numerator: number,
                points: number
            }
        },
        trunk: {
            stability: number,
            distribution: {
                denominator: number,
                numerator: number,
                points: number
            }
        },
        postural_coordination: {
            value: number,
            point: number
        },
        postural_strategy: number
    },
    detail: string
}

export interface InBody {
    file_url: string,
    inspected: string,
    content: {
        user_id: number,
        height: number,
        protein: number, // 단백질
        minerals: number, // 무기질
        muscle_mass: number, // 근육량
        lean_body_mass: number, // 제지방량
        skeletal_muscles_fat: { // 골격근 지방 분석
            weight: number, // 체중
            skeletal_muscles_mass: number, // 골격근량
            body_fat_mass: number // 체지방
        }
        obesity_detail: {
            BMI: number, // BMI
            fat_percentage: number // 체지방률
        },
        muscles_by_region: { // 부위별 근육 분석
            right_arm: number,
            left_arm: number,
            body: number,
            right_leg: number,
            left_leg: number
        },
        extracellular_hydration_percentage: number, // 세포외수분비
        hydration_detail: { // 체수분구성
            body_water: number, // 체수분
            intracellular: number, // 세포내수분
            extracellular: number // 세포외수분
        },
        hydration_by_region: { // 부위별 체수분 분석
            right_arm: number,
            left_arm: number,
            body: number,
            right_leg: number,
            left_leg: number
        },
        osseous_mineral: number, // 골무기질량
        basal_metabolic_rate: number, // 기초대사량
        visceral_fat_area: number, // 내장지방단면적
        waist_hip_ratio: number, // 복부지방률
        body_cell_mass: number, // 체세포량
        upper_arm_circumference: number, // 상완위팔둘레
        upper_arm_muscle_circumference: number, // 상완위팔근육둘레
        tbw_ffm: number, // TBW/FFM
        smi: number, // SMI
    },
    detail: string
}

export interface Exbody {
    file_url: string,
    inspected: string,
    content: {
        name: string,
        phone: string,
        age: string,
        gender: number,
        height: number,
        weight: number,
        effectived: string,
        chart_no: number,
        department: number,
        inpatient_area: number,
        bed_no: number,
        analysis: Analysis
    },
    detail: string
}

export interface Analysis {
    fhp: {image: string} | SubAnalysis,
    trunk_lean: {image: string} | SubAnalysis,
    hip_extension_and_flexion: {image: string} | SubAnalysis,
    hip_rotation: {image: string} | SubAnalysis,
    knee_extension_and_flexion: {image: string} | SubAnalysis,
    trunk_side_lean: {image: string} | SubAnalysis,
    horizontal_movement_of_cog: {image: string} | SubAnalysis,
    vertical_movement_of_cog: {image: string} | SubAnalysis,
    pelvic_rotation: {image: string} | SubAnalysis,
    step_width: {image: string} | SubAnalysis,
    stride: {image: string} | SubAnalysis,
}

export interface SubAnalysis {
    [index: string]: numberInput | SubAnalysis
}

export interface LookinBody {
    file_url: string,
    inspected: string,
    content: {
        name: string,
        age: number,
        height: number,
        gender: number,
        inspections: LookinInspection[]
    },
    detail: string
}

export interface TestLookinBody {
    file_url: string,
    inspected: string,
    content: {
        name: string,
        age: numberInput,
        height: numberInput,
        gender: numberInput,
        inspections: {
            [category: string]: {
                type: string,
                value: numberInput,
                range: [numberInput, numberInput]
            }
        }
    },
    detail: string
}

export interface LookinInspection {
    type: string,
    name: string,
    value: numberInput,
    min_value: numberInput,
    max_value: numberInput
}

export interface PhysicalPerformance {
    file_url: string,
    inspected: string,
    content: {
        name: string,
        age: number,
        height: number,
        gender: number,
        functional_line: FunctionalLine[],
        y_balance: YBalance[],
        ball_bounce: BallBounce[],
        dynamic_movement: DynamicMovement[]
    },
    detail: ""
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
