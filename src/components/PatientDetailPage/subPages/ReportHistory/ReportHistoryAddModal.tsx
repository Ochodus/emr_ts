import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocalTokenValidation } from '../../../../api/commons/auth'
import { Report, ChangeInfo } from './ReportHistory'
import { TableMui } from '../../../commons'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { PhysicalExam } from '../../../../interfaces'
import { Inspection } from '../MedicalRecord/MedicalRecord'
import { BallBounce, DefaultInspection, ExbodyContent, FunctionalLine, ImooveContent, InBodyContent, LookinBodyContent, PhysicalPerformanceContent, SubAnalysis, YBalance } from '../../../../interfaces/inspectionType.interface'
import { Box, Chip, Divider, FormControl, FormLabel, IconButton, Select, Sheet, Stack, Textarea, Typography, Button, Option } from '@mui/joy'
import { Close } from '@mui/icons-material'
import { DateTimePicker, LocalizationProvider, renderTimeViewClock } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { FormAccordion, FormAccordionDetails, FormAccordionHeader, FormAccordionSummary } from '../InspectionHistory/CustomTheme'
import { HeadCell, ID } from '../../../commons/TableMui'
import { SummaryContainer } from '../Summary'
import { BASE_BACKEND_URL } from 'api/commons/request'
import { findPrimitives } from 'api/commons/utils'

const useTrialHandler = (trials: {[index: string]: {startTrial: object, endTrial: object}}, setUpdates: React.Dispatch<React.SetStateAction<(Update & ID)[]>>) => {
    useEffect(() => {
        let newUpdates: (Update & ID)[] = []
        for (let keys of Object.keys(trials)) {
            if (!trials[keys].startTrial || !trials[keys].endTrial) continue
            if (keys === '진료 기록') {
                let strial = trials[keys].startTrial as Inspection
                let etrial = trials[keys].endTrial as Inspection
                let insepctionChanges: {[index: string]: ChangeInfo} = {
                    symptoms: {start_value: strial.symptoms.toString(), end_value: strial.symptoms.toString(), importance: 'res', target_dir: 'res'},
                    diagnostics: {start_value: strial.diagnostics.toString(), end_value: strial.diagnostics.toString(), importance: 'res', target_dir: 'res'},
                }
                Object.keys(insepctionChanges).forEach((key) => {
                    newUpdates.push({
                        id: newUpdates.length,
                        name: '진료 기록',
                        start_date: strial.recorded,
                        end_date: etrial.recorded,
                        value_name: key,
                        value: insepctionChanges[key]
                    })
                })
            }
            else if (keys === 'IMOOVE') {
                let strial = trials[keys].startTrial as DefaultInspection<ImooveContent[]> 
                let etrial = trials[keys].endTrial as DefaultInspection<ImooveContent[]> 
                let lastIndex = strial.content.length - 1
                let imooveChanges: {[index: string]: ChangeInfo} = {
                    // strength: {start_value: strial.content[lastIndex].strength.toString(), end_value: etrial.content[lastIndex].strength.toString(), importance: 'high', target_dir: 'inc'},
                    // sensitivity: {start_value: strial.content[lastIndex].sensitivity.toString(), end_value: etrial.content[lastIndex].sensitivity.toString(), importance: 'high', target_dir: 'inc'},
                    // supports_stability: {start_value: strial.content[lastIndex].supports.stability.toString(), end_value: etrial.content[lastIndex].supports.stability.toString(), importance: 'low', target_dir: 'inc'},
                    // supports_distribution: {start_value: strial.content[lastIndex].supports.distribution.numerator.toString(), end_value: etrial.content[lastIndex].supports.distribution.numerator.toString(), importance: 'low', target_dir: 'inc'},
                    // supports_point: {start_value: strial.content[lastIndex].supports.distribution.points.toString(), end_value: etrial.content[lastIndex].supports.distribution.points.toString(), importance: 'low', target_dir: 'inc'},
                    // trunk_stability: {start_value: strial.content[lastIndex].trunk.stability.toString(), end_value: etrial.content[lastIndex].trunk.stability.toString(), importance: 'low', target_dir: 'inc'},
                    // trunk_distribution: {start_value: strial.content[lastIndex].trunk.distribution.numerator.toString(), end_value: etrial.content[lastIndex].trunk.distribution.numerator.toString(), importance: 'low', target_dir: 'inc'},
                    // trunk_points: {start_value: strial.content[lastIndex].trunk.distribution.points.toString(), end_value: etrial.content[lastIndex].trunk.distribution.points.toString(), importance: 'low', target_dir: 'inc'},
                    // postural_coordination: {start_value: strial.content[lastIndex].postural_coordination.value.toString(), end_value: etrial.content[lastIndex].postural_coordination.value.toString(), importance: 'low', target_dir: 'inc'},
                    // postural_points: {start_value: strial.content[lastIndex].postural_coordination.point.toString(), end_value: etrial.content[lastIndex].postural_coordination.point.toString(), importance: 'low', target_dir: 'inc'},
                    // postural_strategy: {start_value: strial.content[lastIndex].postural_strategy.toString(), end_value: etrial.content[lastIndex].postural_strategy.toString(), importance: 'low', target_dir: 'inc'}
                }
                Object.keys(imooveChanges).forEach((key) => {
                    newUpdates.push({
                        id: newUpdates.length,
                        name: 'IMOOVE',
                        start_date: strial.inspected,
                        end_date: etrial.inspected,
                        value_name: key,
                        value: imooveChanges[key],
                        adderCategory: "IMOOVE",
                        adderPath: imooveChanges[key].path,
                        adderLabel: imooveChanges[key].lable,
                        adderTitle: imooveChanges[key].title,
                    })
                })
            }
            else if (keys === 'Exbody') {
                let strial = trials[keys].startTrial as DefaultInspection<ExbodyContent> 
                let etrial = trials[keys].endTrial as DefaultInspection<ExbodyContent>
                let exbodyChanges: {[index: string]: ChangeInfo} = {
                    fhp_rear: {start_value: strial.content.fhp.rear.toString(), end_value: etrial.content.fhp.rear.toString(), importance: 'low', target_dir: 'res'},
                    fhp_front: {start_value: strial.content.fhp.front.toString(), end_value: etrial.content.fhp.front.toString(), importance: 'low', target_dir: 'res'},
                    hipExtensionFlexion_right_rear: {start_value: (strial.content.hip_extension_and_flexion.right as SubAnalysis).rear.toString(), end_value: (etrial.content.hip_extension_and_flexion.right as SubAnalysis).rear.toString(), importance: 'low', target_dir: 'res'},
                    hipExtensionFlexion_right_front: {start_value: (strial.content.hip_extension_and_flexion.right as SubAnalysis).front.toString(), end_value: (etrial.content.hip_extension_and_flexion.right as SubAnalysis).front.toString(), importance: 'low', target_dir: 'res'},
                    hipExtensionFlexion_left_rear: {start_value: (strial.content.hip_extension_and_flexion.left as SubAnalysis).rear.toString(), end_value: (etrial.content.hip_extension_and_flexion.left as SubAnalysis).rear.toString(), importance: 'low', target_dir: 'res'},
                    hipExtensionFlexion_left_front: {start_value: (strial.content.hip_extension_and_flexion.left as SubAnalysis).front.toString(), end_value: (etrial.content.hip_extension_and_flexion.left as SubAnalysis).front.toString(), importance: 'low', target_dir: 'res'},
                    hipRotation_right_inside: {start_value: (strial.content.hip_rotation.right as SubAnalysis).inside.toString(), end_value: (etrial.content.hip_rotation.right as SubAnalysis).inside.toString(), importance: 'low', target_dir: 'res'},
                    hipRotation_right_outside: {start_value: (strial.content.hip_rotation.right as SubAnalysis).outside.toString(), end_value: (etrial.content.hip_rotation.right as SubAnalysis).outside.toString(), importance: 'low', target_dir: 'res'},
                    hipRotation_left_inside: {start_value: (strial.content.hip_rotation.left as SubAnalysis).inside.toString(), end_value: (etrial.content.hip_rotation.left as SubAnalysis).inside.toString(), importance: 'low', target_dir: 'res'},
                    hipRotation_left_outside: {start_value: (strial.content.hip_rotation.left as SubAnalysis).outside.toString(), end_value: (etrial.content.hip_rotation.left as SubAnalysis).outside.toString(), importance: 'low', target_dir: 'res'},
                    kneeExtensionFlexion_right: {start_value: strial.content.knee_extension_and_flexion.right.toString(), end_value: etrial.content.knee_extension_and_flexion.right.toString(), importance: 'low', target_dir: 'res'},
                    kneeExtensionFlexion_left: {start_value: strial.content.knee_extension_and_flexion.left.toString(), end_value: etrial.content.knee_extension_and_flexion.left.toString(), importance: 'low', target_dir: 'res'},
                    trunkSideLean_rear: {start_value: strial.content.trunk_side_lean.rear?.toString(), end_value: etrial.content.trunk_side_lean.rear?.toString(), importance: 'low', target_dir: 'res'},
                    trunkSideLean_front: {start_value: strial.content.trunk_side_lean.front?.toString(), end_value: etrial.content.trunk_side_lean.front?.toString(), importance: 'low', target_dir: 'res'},
                    horizontalMovCog_right: {start_value: strial.content.horizontal_movement_of_cog.right?.toString(), end_value: etrial.content.horizontal_movement_of_cog.right?.toString(), importance: 'low', target_dir: 'res'},
                    horizontalMovCog_left: {start_value: strial.content.horizontal_movement_of_cog.left?.toString(), end_value: etrial.content.horizontal_movement_of_cog.left?.toString(), importance: 'low', target_dir: 'res'},
                    verticalMovCog_up: {start_value: strial.content.vertical_movement_of_cog.up?.toString(), end_value: etrial.content.vertical_movement_of_cog.up?.toString(), importance: 'low', target_dir: 'res'},
                    pelvicRotation_right: {start_value: strial.content.pelvic_rotation.right?.toString(), end_value: etrial.content.pelvic_rotation.right?.toString(), importance: 'low', target_dir: 'res'},
                    pelvicRotation_left: {start_value: strial.content.pelvic_rotation.left?.toString(), end_value: etrial.content.pelvic_rotation.left?.toString(), importance: 'low', target_dir: 'res'},
                    stepWidth: {start_value: strial.content.step_width.value?.toString(), end_value: etrial.content.step_width.value?.toString(), importance: 'low', target_dir: 'res'},
                    stride: {start_value: strial.content.stride.value?.toString(), end_value: etrial.content.stride.value?.toString(), importance: 'low', target_dir: 'res'}
                }
                Object.keys(exbodyChanges).forEach((key) => {
                    newUpdates.push({
                        id: newUpdates.length,
                        name: 'Exbody',
                        start_date: strial.inspected,
                        end_date: etrial.inspected,
                        value_name: key,
                        value: exbodyChanges[key],
                        adderCategory: "Exbody",
                        adderPath: exbodyChanges[key].path,
                        adderLabel: exbodyChanges[key].lable,
                        adderTitle: exbodyChanges[key].title,
                    })
                })
            }
            else if (keys === 'InBody') {
                let strial = trials[keys].startTrial as DefaultInspection<InBodyContent>
                let etrial = trials[keys].endTrial as DefaultInspection<InBodyContent>
                let InBodyChanges: {[index: string]: ChangeInfo} = {                    
                    hydration: {start_value: strial.content.body_water_composition.body_water.value.toString(), end_value: etrial.content.body_water_composition.body_water.value.toString(), importance: 'res', target_dir: 'res'},
                    extracellularHydration: {start_value: strial.content.body_water_composition.extracellular.value.toString(), end_value: etrial.content.body_water_composition.extracellular.value.toString(), importance: 'low', target_dir: 'res'},
                    intracellularHydration: {start_value: strial.content.body_water_composition.intracellular.toString(), end_value: etrial.content.body_water_composition.intracellular.toString(), importance: 'low', target_dir: 'res'},
                    extracellularHydrationPercentage: {start_value: strial.content.body_water_composition.extracellular_hydration_percentage.toString(), end_value: etrial.content.body_water_composition.extracellular_hydration_percentage.toString(), importance: 'low', target_dir: 'res'},
                    bodyFatMass: {start_value: strial.content.body_composition_analysis.body_fat_mass.value.toString(), end_value: etrial.content.body_composition_analysis.body_fat_mass.value.toString(), importance: 'high', target_dir: 'dec'},
                    leanBodyMass: {start_value: strial.content.body_composition_analysis.lean_body_mass.value.toString(), end_value: etrial.content.body_composition_analysis.lean_body_mass.value.toString(), importance: 'high', target_dir: 'dec'},
                    minerals: {start_value: strial.content.body_composition_analysis.minerals.value.toString(), end_value: etrial.content.body_composition_analysis.minerals.value.toString(), importance: 'low', target_dir: 'inc'},
                    osseousMineral: {start_value: strial.content.body_composition_analysis.osseous_mineral.value.toString(), end_value: etrial.content.body_composition_analysis.osseous_mineral.value.toString(), importance: 'low', target_dir: 'inc'},
                    protein: {start_value: strial.content.body_composition_analysis.protein.value.toString(), end_value: etrial.content.body_composition_analysis.protein.value.toString(), importance: 'low', target_dir: 'inc'},
                    // bodyFatMass: {start_value: strial.content.muscle_fat_analysis.body_fat_mass.value.toString(), end_value: etrial.content.muscle_fat_analysis.body_fat_mass.value.toString(), importance: 'low', target_dir: 'inc'},
                    muscleMass: {start_value: strial.content.muscle_fat_analysis.muscle_mass.value.toString(), end_value: etrial.content.muscle_fat_analysis.muscle_mass.value.toString(), importance: 'high', target_dir: 'inc'},
                    skeletalMuscleMass: {start_value: strial.content.muscle_fat_analysis.skeletal_muscles_mass.toString(), end_value: etrial.content.muscle_fat_analysis.skeletal_muscles_mass.toString(), importance: 'high', target_dir: 'inc'},
                    weight: {start_value: strial.content.muscle_fat_analysis.weight.value.toString(), end_value: etrial.content.muscle_fat_analysis.weight.value.toString(), importance: 'low', target_dir: 'inc'},
                    BMI: {start_value: strial.content.obesity_detail.BMI.value.toString(), end_value: etrial.content.obesity_detail.BMI.value.toString(), importance: 'low', target_dir: 'dec'},
                    fatPercentage: {start_value: strial.content.obesity_detail.fat_percentage.value.toString(), end_value: etrial.content.obesity_detail.fat_percentage.value.toString(), importance: 'high', target_dir: 'dec'},
                    extracellularHydrationRatio: {start_value: strial.content.obesity_detail.fat_percentage.value.toString(), end_value: etrial.content.obesity_detail.fat_percentage.value.toString(), importance: 'low', target_dir: 'res'},
                    basalMetabolicRate: {start_value: strial.content.research_parameter.basal_metabolic_rate.value.toString(), end_value: etrial.content.research_parameter.basal_metabolic_rate.value.toString(), importance: 'low', target_dir: 'inc'},
                    bodyCellMass: {start_value: strial.content.research_parameter.body_cell_mass.value.toString(), end_value: etrial.content.research_parameter.body_cell_mass.value.toString(), importance: 'low', target_dir: 'res'},
                    smi: {start_value: strial.content.research_parameter.smi.toString(), end_value: etrial.content.research_parameter.smi.toString(), importance: 'low', target_dir: 'res'},
                    tbwFfm: {start_value: strial.content.research_parameter.tbw_ffm.toString(), end_value: etrial.content.research_parameter.tbw_ffm.toString(), importance: 'low', target_dir: 'res'},
                    upperArmCircumference: {start_value: strial.content.research_parameter.upper_arm_circumference.toString(), end_value: etrial.content.research_parameter.upper_arm_circumference.toString(), importance: 'low', target_dir: 'res'},
                    upperArmMuscleCircumference: {start_value: strial.content.research_parameter.upper_arm_muscle_circumference.toString(), end_value: etrial.content.research_parameter.upper_arm_muscle_circumference.toString(), importance: 'low', target_dir: 'inc'},
                    visceralFatArea: {start_value: strial.content.research_parameter.visceral_fat_area.toString(), end_value: etrial.content.research_parameter.visceral_fat_area.toString(), importance: 'low', target_dir: 'dec'},
                    waistHipRatio: {start_value: strial.content.research_parameter.waist_hip_ratio.value.toString(), end_value: etrial.content.research_parameter.waist_hip_ratio.value.toString(), importance: 'high', target_dir: 'dec'},
                    sbwBody: {start_value: strial.content.segmental_body_water_analysis.body.value.toString(), end_value: etrial.content.segmental_body_water_analysis.body.value.toString(), importance: 'low', target_dir: 'res'},
                    sbwLeftArm: {start_value: strial.content.segmental_body_water_analysis.left_arm.value.toString(), end_value: etrial.content.segmental_body_water_analysis.left_arm.value.toString(), importance: 'low', target_dir: 'res'},
                    sbwLeftLeg: {start_value: strial.content.segmental_body_water_analysis.left_leg.value.toString(), end_value: etrial.content.segmental_body_water_analysis.left_leg.value.toString(), importance: 'low', target_dir: 'res'},
                    sbwRightArm: {start_value: strial.content.segmental_body_water_analysis.right_arm.value.toString(), end_value: etrial.content.segmental_body_water_analysis.right_arm.value.toString(), importance: 'low', target_dir: 'res'},
                    sbwRightLeg: {start_value: strial.content.segmental_body_water_analysis.right_leg.value.toString(), end_value: etrial.content.segmental_body_water_analysis.right_leg.value.toString(), importance: 'low', target_dir: 'res'},
                    slaBody: {start_value: strial.content.segmental_lean_analysis.body.toString(), end_value: etrial.content.segmental_lean_analysis.body.toString(), importance: 'low', target_dir: 'inc'},
                    slaLeftArm: {start_value: strial.content.segmental_lean_analysis.left_arm.toString(), end_value: etrial.content.segmental_lean_analysis.left_arm.toString(), importance: 'low', target_dir: 'inc'},
                    slaLeftLeg: {start_value: strial.content.segmental_lean_analysis.left_leg.toString(), end_value: etrial.content.segmental_lean_analysis.left_leg.toString(), importance: 'low', target_dir: 'inc'},
                    slaRightArm: {start_value: strial.content.segmental_lean_analysis.right_arm.toString(), end_value: etrial.content.segmental_lean_analysis.right_arm.toString(), importance: 'low', target_dir: 'inc'},
                    slaRightLeg: {start_value: strial.content.segmental_lean_analysis.right_leg.toString(), end_value: etrial.content.segmental_lean_analysis.right_leg.toString(), importance: 'low', target_dir: 'inc'},
                }
                Object.keys(InBodyChanges).forEach((key) => {
                    newUpdates.push({
                        id: newUpdates.length,
                        name: 'InBody',
                        start_date: strial.inspected,
                        end_date: etrial.inspected,
                        value_name: key,
                        value: InBodyChanges[key],
                        adderCategory: "InBody",
                        adderPath: InBodyChanges[key].path,
                        adderLabel: InBodyChanges[key].lable,
                        adderTitle: InBodyChanges[key].title
                    })
                })
            }
            else if (keys === "Lookin' body") {
                let strial = trials[keys].startTrial as DefaultInspection<LookinBodyContent>
                let etrial = trials[keys].endTrial as DefaultInspection<LookinBodyContent>
                let LookinBodyChanges: {[index: string]: ChangeInfo} = {}
                // Object.keys(strial.content).forEach((key) => {
                //     let name = key
                //     let svalue = strial.content[key]?.value ?? ""
                //     let evalue = etrial.content[key]?.value ?? ""
                //     if (name !== undefined) LookinBodyChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}
                // })
                // Object.keys(LookinBodyChanges).forEach((key) => {
                //     newUpdates.push({
                //         id: newUpdates.length,
                //         name: "Lookin' Body",
                //         start_date: strial.inspected,
                //         end_date: etrial.inspected,
                //         value_name: key,
                //         value: LookinBodyChanges[key],
                //         adderCategory: "Lookin' Body",
                //         adderPath: LookinBodyChanges[key].path,
                //         adderLabel: LookinBodyChanges[key].lable,
                //         adderTitle: LookinBodyChanges[key].title
                //     })
                // })
            }
            else if (keys === "운동능력검사") {
                let strial = trials[keys].startTrial as DefaultInspection<PhysicalPerformanceContent>
                let etrial = trials[keys].endTrial as DefaultInspection<PhysicalPerformanceContent>
                let PhysicalPerformanceChanges: {[index: string]: ChangeInfo} = {}
                Object.keys(strial.content).forEach((key) => {
                    // let name
                    // let svalue, evalue
                    // if (key === "functional_line") {
                    //     let st = strial.content[key as keyof PhysicalPerformanceContent] as FunctionalLine[]
                    //     let et = etrial.content[key as keyof PhysicalPerformanceContent] as FunctionalLine[]
                    //     for (let i = 0; i < st.length; i++) {
                    //         name = `${key}_${i}_lt_lt_lt_0`
                    //         svalue = st[i].lt.lt.lt[0]
                    //         evalue = et[i].lt.lt.lt[0]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}

                    //         name = `${key}_${i}_lt_lt_lt_1`
                    //         svalue = st[i].lt.lt.lt[1]
                    //         evalue = et[i].lt.lt.lt[1]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}

                    //         name = `${key}_${i}_lt_lt_rt_0`
                    //         svalue = st[i].lt.lt.rt[0]
                    //         evalue = et[i].lt.lt.rt[0]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}

                    //         name = `${key}_${i}_lt_lt_rt_1`
                    //         svalue = st[i].lt.lt.rt[1]
                    //         evalue = et[i].lt.lt.rt[1]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}

                    //         name = `${key}_${i}_lt_rt_lt_0`
                    //         svalue = st[i].lt.rt.lt[0]
                    //         evalue = et[i].lt.rt.lt[0]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}

                    //         name = `${key}_${i}_lt_rt_lt_1`
                    //         svalue = st[i].lt.rt.lt[1]
                    //         evalue = et[i].lt.rt.lt[1]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}

                    //         name = `${key}_${i}_lt_rt_rt_0`
                    //         svalue = st[i].lt.rt.rt[0]
                    //         evalue = et[i].lt.rt.rt[0]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}

                    //         name = `${key}_${i}_lt_rt_rt_1`
                    //         svalue = st[i].lt.rt.rt[1]
                    //         evalue = et[i].lt.rt.rt[1]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}

                    //         name = `${key}_${i}_rt_lt_lt_0`
                    //         svalue = st[i].rt.lt.lt[0]
                    //         evalue = et[i].rt.lt.lt[0]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}

                    //         name = `${key}_${i}_rt_lt_lt_1`
                    //         svalue = st[i].rt.lt.lt[1]
                    //         evalue = et[i].rt.lt.lt[1]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}
                            
                    //         name = `${key}_${i}_rt_lt_rt_0`
                    //         svalue = st[i].rt.lt.rt[0]
                    //         evalue = et[i].rt.lt.rt[0]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}
                            
                    //         name = `${key}_${i}_rt_lt_rt_1`
                    //         svalue = st[i].rt.lt.rt[1]
                    //         evalue = et[i].rt.lt.rt[1]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}

                    //         name = `${key}_${i}_rt_rt_lt_0`
                    //         svalue = st[i].rt.rt.lt[0]
                    //         evalue = et[i].rt.rt.lt[0]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}

                    //         name = `${key}_${i}_rt_rt_lt_1`
                    //         svalue = st[i].rt.rt.lt[1]
                    //         evalue = et[i].rt.rt.lt[1]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}

                    //         name = `${key}_${i}_rt_rt_rt_0`
                    //         svalue = st[i].rt.rt.rt[0]
                    //         evalue = et[i].rt.rt.rt[0]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}

                    //         name = `${key}_${i}_rt_rt_rt_1`
                    //         svalue = st[i].rt.rt.rt[1]
                    //         evalue = et[i].rt.rt.rt[1]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'high', target_dir: 'inc'}
                    //     }
                    // }
                    // if (key === "y_balance") {
                    //     let st = strial.content[key as keyof PhysicalPerformanceContent] as YBalance[]
                    //     let et = etrial.content[key as keyof PhysicalPerformanceContent] as YBalance[]
                    //     for (let i = 0; i < st.length; i++) {
                    //         name = `${key}_${i}_lt_at_0`
                    //         svalue = st[i].lt.at[0]
                    //         evalue = et[i].lt.at[0]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'low', target_dir: 'inc'}

                    //         name = `${key}_${i}_lt_at_1`
                    //         svalue = st[i].lt.at[1]
                    //         evalue = et[i].lt.at[1]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'low', target_dir: 'inc'}

                    //         name = `${key}_${i}_lt_pl_0`
                    //         svalue = st[i].lt.pl[0]
                    //         evalue = et[i].lt.pl[0]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'low', target_dir: 'inc'}

                    //         name = `${key}_${i}_lt_pl_1`
                    //         svalue = st[i].lt.pl[1]
                    //         evalue = et[i].lt.pl[1]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'low', target_dir: 'inc'}

                    //         name = `${key}_${i}_lt_pm_0`
                    //         svalue = st[i].lt.pm[0]
                    //         evalue = et[i].lt.pm[0]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'low', target_dir: 'inc'}

                    //         name = `${key}_${i}_lt_pm_1`
                    //         svalue = st[i].lt.pm[1]
                    //         evalue = et[i].lt.pm[1]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'low', target_dir: 'inc'}

                    //         name = `${key}_${i}_rt_at_0`
                    //         svalue = st[i].rt.at[0]
                    //         evalue = et[i].rt.at[0]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'low', target_dir: 'inc'}

                    //         name = `${key}_${i}_rt_at_1`
                    //         svalue = st[i].rt.at[1]
                    //         evalue = et[i].rt.at[1]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'low', target_dir: 'inc'}

                    //         name = `${key}_${i}_rt_pl_0`
                    //         svalue = st[i].rt.pl[0]
                    //         evalue = et[i].rt.pl[0]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'low', target_dir: 'inc'}

                    //         name = `${key}_${i}_rt_pl_1`
                    //         svalue = st[i].rt.pl[1]
                    //         evalue = et[i].rt.pl[1]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'low', target_dir: 'inc'}

                    //         name = `${key}_${i}_lt_pm_0`
                    //         svalue = st[i].lt.pm[0]
                    //         evalue = et[i].lt.pm[0]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'low', target_dir: 'inc'}

                    //         name = `${key}_${i}_rt_pm_1`
                    //         svalue = st[i].rt.pm[1]
                    //         evalue = et[i].rt.pm[1]

                    //         PhysicalPerformanceChanges[name] = {start_value: svalue.toString(), end_value: evalue.toString(), importance: 'low', target_dir: 'inc'}
                    //     }
                    // }
                })
                Object.keys(PhysicalPerformanceChanges).forEach((key) => {
                    newUpdates.push({
                        id: newUpdates.length,
                        name: "운동능력검사",
                        start_date: strial.inspected,
                        end_date: etrial.inspected,
                        value_name: key,
                        value: PhysicalPerformanceChanges[key],
                        adderCategory: "운동능력검사",
                        adderPath: PhysicalPerformanceChanges[key].path,
                        adderLabel: PhysicalPerformanceChanges[key].lable,
                        adderTitle: PhysicalPerformanceChanges[key].title,
                    })
                })
            }
            else if (keys === "기본 검사") {
                let strial = trials[keys].startTrial as PhysicalExam 
                let etrial = trials[keys].endTrial as PhysicalExam

                console.log(findPrimitives(strial))

                let spair = findPrimitives(strial)
                let epair = findPrimitives(etrial)

                let physicalExamChanges: {[index: string]: ChangeInfo} = {
                    height: {start_value: strial.height.toString(), end_value: etrial.height.toString(), importance: 'high', target_dir: 'inc', path: ['height'], lable: `키 (${dayjs(strial.recorded).format('YY-MM-DD')} ~ ${dayjs(etrial.recorded).format('YY-MM-DD')})`, title: '키'},
                    weight: {start_value: strial.weight.toString(), end_value: etrial.weight.toString(), importance: 'high', target_dir: 'res', path: ['weight'], lable: `몸무게 (${dayjs(strial.recorded).format('YY-MM-DD')} ~ ${dayjs(etrial.recorded).format('YY-MM-DD')})`, title: '몸무게'},
                    systolic_blood_pressure: {start_value: strial.systolic_blood_pressure.toString(), end_value: etrial.systolic_blood_pressure.toString(), importance: 'res', target_dir: 'res'},
                    diastolic_blood_pressure: {start_value: strial.diastolic_blood_pressure.toString(), end_value: etrial.diastolic_blood_pressure.toString(), importance: 'res', target_dir: 'res'},
                    body_temperature: {start_value: strial.body_temperature.toString(), end_value: etrial.body_temperature.toString(), importance: 'res', target_dir: 'res'},
                }
                Object.keys(physicalExamChanges).forEach((key) => {
                    newUpdates.push({
                        id: newUpdates.length,
                        name: '기본 검사',
                        start_date: strial.recorded,
                        end_date: etrial.recorded,
                        value_name: key,
                        value: physicalExamChanges[key],
                        adderCategory: "Physical Exam",
                        adderPath: physicalExamChanges[key].path,
                        adderLabel: physicalExamChanges[key].lable,
                        adderTitle: physicalExamChanges[key].title,
                    })
                })
            }
        }
        setUpdates([...newUpdates])
    }, [trials, setUpdates])
}

export interface Update {
    name: string, 
    start_date: string, 
    end_date: string, 
    value_name: string, 
    value: ChangeInfo,
    adderCategory?: string,
    adderPath?: string[],
    adderTitle?: string,
    adderLabel?: string
}

export interface SelectedGraphRange {
    start: number,
    end: number
}

export interface GridGraphData {
    start?: string,
    end?: string,
    memo?: string,
    name: string,
    path: string[],
    ranges: SelectedGraphRange[],
    type: string
}

interface ReportAddModalProps {
    show: boolean,
    isNew: boolean,
    selectedReport: Report | null,
    addReport: (newReport: Report, isNew: boolean) => void,
    handleClose: React.Dispatch<React.SetStateAction<boolean>>
}

const therapyList: {[index: string]: string} = {
    "진료 기록": "records",
    "IMOOVE": "inspections?inspection_type=IMOOVE",
    "Exbody": "inspections?inspection_type=EXBODY",
    "InBody": "inspections?inspection_type=INBODY",
    "Lookin' Body": "inspections?inspection_type=LOOKINBODY",
    "운동능력검사": "inspections?inspection_type=PHYSICAL_PERFORMANCE",
    "운동 치료": "kinesitherapy",
    "기본 검사": "physical_exam"
}

const ReportHistoryAddModal = ({ show, isNew, selectedReport, addReport, handleClose }: ReportAddModalProps) => {
    const checkAuth = useLocalTokenValidation() // localStorage 저장 토큰 정보 검증 함수

    const { patient_id } = useParams()
    const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null

	const config = useMemo(() => {
		return {
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		}
	}, [accessToken])

    const headCells: HeadCell<Update & ID>[] = [
		{
            id: 'name',
            numeric: false,
            label: '치료/검사 종류',
		},
		{
            id: ['start_date', 'end_date'],
            numeric: false,
            label: '기간',
            parse: (value: (Update[keyof Update] | number)[]) => { 
                if (typeof value[0] === 'string' && typeof value[1] === 'string') {
                    return `${dayjs(value[0]).format('YYYY-MM-DD')} ~ ${dayjs(value[1]).format('YYYY-MM-DD')}`
                }
                else return ''
			}
		},
		{
		  id: 'value_name',
		  numeric: false,
		  label: '측정 항목'
		},
        {
            id: 'value',
            numeric: true,
            label: '값 변화',
            parse: (value) => { 
                if (typeof value !== 'string' && typeof value !== 'number' && !Array.isArray(value)) return `${value?.start_value} > ${value?.end_value}`
                else return ''
            }
        },
		{
		  id: 'value',
		  numeric: true,
		  label: '수치 변화',
          parse: (value) => { 
            if (typeof value !== 'string' && typeof value !== 'number' && !Array.isArray(value)) {
                let svalue = value?.start_value
                let evalue = value?.end_value
                if (typeof svalue === 'number' && typeof evalue === 'number') return `${evalue - svalue > 0 ? '+' : ""}${evalue - svalue}`
                else if (svalue && evalue && !isNaN(+(svalue)) && !isNaN(+evalue)) return `${+evalue - +svalue > 0 ? '+' : ""}${+evalue - +svalue}`
                else return "-"
            }
            else return value.toString()
           }
		},
        {
            id: 'value',
            numeric: true,
            label: '개선 여부',
            parse: (value) => { 
                if (typeof value !== 'string' && typeof value !== 'number' && !Array.isArray(value)) {
                    let svalue = value?.start_value
                    let evalue = value?.end_value
                    if (svalue && evalue && !isNaN(+svalue) && !isNaN(+evalue)) {
                        if (value?.target_dir === 'inc' && +evalue > +svalue) return 'Y'
                        if (value?.target_dir === 'dec' && +svalue > +evalue) return 'Y'
                        return 'N'
                    }
                    return '-'
                }
                else return value.toString()
            }
        },
        {
            id: 'value',
            numeric: true,
            label: '중요도',
            parse: (value) => { 
                if (typeof value !== 'string' && typeof value !== 'number' && !Array.isArray(value)) {
                    return value?.importance ?? ""
                }
                else return value.toString()
            }
        }
	];
    
    const [allTherapiesHistory, setAllTherapiesHistory] = useState<{[index: string]: object[]}>({})

    const [selectedTherapies, setSelectedTherapies] = useState<string[]>([])
    const [startId, setStartId] = useState(-1)
    const [endId, setEndId] = useState(-1)
    const [trials, setTrials] = useState<{[index: string]: {startTrial: object, endTrial: object}}>({})
    const [defaultTrials, setDefaultTrials] = useState<{[index: string]: {startTrial: object, endTrial: object}}>({})
    const [updates, setUpdates] = useState<(Update & ID)[]>([])
    const [defaultUpdates, setDefaultUpdates] = useState<(Update & ID)[]>([])
    const [reportDate, setReportDate] = useState<dayjs.Dayjs>(dayjs())
    const [memo, setMemo] = useState("")
    const [therapiesHistory, setTherapiesHistory] = useState<{[index: string]: object[]}>({})
    const [defaultSelected, setDefaultSelected] = useState<number[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [graphData, setGraphData] = useState<GridGraphData[][]>([]);

    const handleAddReport = () => {
        console.log(
            isNew ? "add" : ("edit - " + selectedReport),
            "\ntherapies: " + JSON.stringify(graphData),
            "\nmemo: " + memo
        )

        const newReport: Report = {
            report_date: reportDate.format(),
            changes: graphData,
            memo: memo
        }

        console.log(newReport)

        addReport(newReport, isNew)
    }

    const handleTherapySelectionChange = (selectedList: string[]) => {
        setSelectedTherapies([...selectedList])
    }

    const getTherapyHistory = useCallback(async (type: string) => {
        let url = `${BASE_BACKEND_URL}/api/patients/${patient_id}/medical/${type}`
		try {
			const response = await axios.get(
				url,
				config
			)
		
            return response.data
		} catch (error) {
			console.error("진료 조회 중 오류 발생:", error)
            return null
		}
	}, [config, patient_id])

    const handleHistorySelectionChange = (type: 'start' | 'end', therapy: string, value: number | null) => {
        if (value === null) return
        if (type === 'start') {
            setStartId(value)
            let newTrials = trials
            newTrials[therapy] = {...newTrials[therapy], startTrial: therapiesHistory[therapy][value]}
            setTrials({...newTrials})
        }
        else if (type === 'end') {
            setEndId(value)
            let newTrials = trials
            newTrials[therapy] = {...newTrials[therapy], endTrial: therapiesHistory[therapy][value]}
            setTrials({...newTrials})
        }
    }

    useEffect(() => {
		let testMode = true
		if (process.env.NODE_ENV !== 'development' || testMode) checkAuth()
	  }, [checkAuth]) // 페이지 첫 렌더링 시 localStorage의 로그인 유효성 검사

    useEffect(() => {
        selectedTherapies.reduce(async (acc: Promise<any>, curr: string) => {
            let result = await acc
            result[curr] = await getTherapyHistory(therapyList[curr])
            return result
        }, Promise.resolve({})).then((values: {[index: string]: object[]}) => {
            setTherapiesHistory(values)
        })
        // TODO: object to custom type
    }, [selectedTherapies, getTherapyHistory])

    useEffect(() => {
        Object.keys(therapyList).reduce(async (acc: Promise<any>, curr: string) => {
            let result = await acc
            result[curr] = await getTherapyHistory(therapyList[curr])
            return result
        }, Promise.resolve({})).then((values: {[index: string]: object[]}) => {
            setAllTherapiesHistory(values)
        })
        // TODO: object to custom type
    }, [getTherapyHistory])

    // 조건 갱신 시 실행 -> 선택 회차 초기화
    useEffect(() => {
        let trials = {} as {[index: string]: {startTrial: object, endTrial: object}}
        for (let key of Object.keys(therapiesHistory)) {
            if (therapiesHistory[key]) trials[key] = {startTrial: therapiesHistory[key][0], endTrial: therapiesHistory[key][0]}
        }
        setTrials(trials)
    }, [therapiesHistory])

    // 추천을 위한 기본 실행
    useEffect(() => {
        let trials = {} as {[index: string]: {startTrial: object, endTrial: object}}
        for (let key of Object.keys(allTherapiesHistory)) {
            if (allTherapiesHistory[key]) trials[key] = {startTrial: allTherapiesHistory[key][0], endTrial: allTherapiesHistory[key].at(-1) ?? allTherapiesHistory[key][0]}
        }
        setDefaultTrials(trials)
    }, [allTherapiesHistory])

    useTrialHandler(trials, setUpdates)
    useTrialHandler(defaultTrials, setDefaultUpdates)

    const updateGraphData = (value: GridGraphData[][]) => {
        setGraphData(value)
    }

    useEffect(() => {
        if (!isNew && selectedReport) {
            setReportDate(dayjs(selectedReport.report_date))
            setGraphData(selectedReport.changes)
            setMemo(selectedReport.memo)
        }
    }, [isNew, selectedReport])

    return (
        <Sheet
            variant="outlined"
            sx={{
                position: 'relative',
                borderRadius: 'sm',
                p: 1,
                width: '100%',
                flexShrink: 0,
                left: show ? "-100%" : 0,
                transition: 'left 0.4s ease',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box sx={{ 
                    display: 'flex', 
                    gap: 2,
                    justifyContent: 'space-between',
                    p: '0px 5px'
                }}>
                    <Typography 
                        fontWeight="600" 
                        fontSize="20px"
                        sx={{
                            color: '#32383e',
                            margin: 'auto 0'
                        }}
                    >환자 치료 경과 리포트 {isNew ? "추가" : "편집"}
                    </Typography>
                    <IconButton
                        variant='plain' 
                        onClick={() => {handleClose(false)}}
                        sx={{ }}
                    ><Close />
                    </IconButton>
            </Box>
            <Divider component="div" sx={{ my: 1 }} />  
            <Box
                className="scrollable vertical"
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    p: '0 5px',
                    margin: '10px 0',
                    alignItems: 'middle',
                    flex: '1 1 0',
                }}
            >    
                <FormAccordion defaultExpanded>
                    <FormAccordionSummary>
                        <FormAccordionHeader>추천 변화 항목</FormAccordionHeader>
                    </FormAccordionSummary>
                    <FormAccordionDetails>
                        <Stack direction='column' gap={2} sx={{ 
                            justifyContent: 'space-between',
                            p: '0px 5px',
                            alignItems: 'middle'
                        }}>
                            <TableMui<Update & ID>
                                headCells={headCells} 
                                rows={defaultUpdates.filter((item) => item.value.importance === 'high' && (
                                    (item.value.end_value !== item.value.start_value)
                                ))}
                                defaultRowNumber={defaultUpdates.filter((item) => item.value.importance === 'high' && (
                                    (item.value.end_value !== item.value.start_value)
                                )).length}
                                selected={defaultSelected}
                                setSelected={setDefaultSelected}
                            />
                        </Stack>
                    </FormAccordionDetails>
                </FormAccordion>
                <FormAccordion defaultExpanded>
                    <FormAccordionSummary>
                        <FormAccordionHeader>진단 및 회차 직접 선택</FormAccordionHeader>
                    </FormAccordionSummary>
                    <FormAccordionDetails>
                        <Stack gap={2} sx={{ justifyContent: 'center' }}>
                            <FormControl size="md">
                                <FormLabel>진단</FormLabel>
                                <Select
                                    multiple
                                    size="md"
                                    placeholder="진단 선택"
                                    value={selectedTherapies}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', gap: '0.25rem' }}>
                                            {selected.map((selectedOption, index) => (
                                                <Chip variant="soft" color="primary" key={index}>
                                                    {selectedOption.label}
                                                </Chip>
                                            ))}
                                        </Box>
                                    )}
                                    slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                                    onChange={(_, value) => handleTherapySelectionChange(value)}
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                >
                                    {Object.keys(therapyList).map((therapy, index) => {
                                        return (
                                            <Option key={index} value={therapy}>{`${therapy}`}</Option>
                                        )
                                    })}
                                </Select>
                            </FormControl>
                            <Divider orientation='horizontal'></Divider>
                            {selectedTherapies.map((therapy, index) => (
                                <React.Fragment key={index}>
                                    <Stack direction='row' gap={2} sx={{ justifyContent: 'space-around'}}>
                                        <Typography fontWeight={600} sx={{ m: 'auto', flex: '0 1 auto', width: '15%', textAlign: 'center' }}>{therapy}</Typography>
                                        <Divider orientation='vertical'></Divider>
                                        <FormControl size="md" sx={{ flex: '1 1 auto' }}>
                                            <FormLabel>시작 회차</FormLabel>
                                            <Select
                                                size="md"
                                                placeholder="진단 선택"
                                                value={startId}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', gap: '0.25rem' }}>
                                                        {selected ?
                                                            <Chip variant="soft" color="primary" key={index}>
                                                                {selected.label}
                                                            </Chip>
                                                        : null}
                                                    </Box>
                                                )}
                                                slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                                                onChange={(_, value) => handleHistorySelectionChange('start', therapy, value)}
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                            >
                                                {therapiesHistory[therapy]?.map((value: any, index) => (
                                                    <Option key={index} value={index}>
                                                        {
                                                            (therapy==="진료 기록" || therapy==="기본 검사") ? value.recorded
                                                            : therapy==="운동 치료" ? value.progressed
                                                            : value.inspected
                                                        }
                                                    </Option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <FormControl size="md" sx={{ flex: '1 1 auto' }}>
                                            <FormLabel>최종 회차</FormLabel>
                                            <Select
                                                size="md"
                                                placeholder="진단 선택"
                                                value={endId}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', gap: '0.25rem' }}>
                                                        {selected ?
                                                            <Chip variant="soft" color="primary" key={index}>
                                                                {selected.label}
                                                            </Chip>
                                                        : null}
                                                    </Box>
                                                )}
                                                slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                                                onChange={(_, value) => handleHistorySelectionChange('end', therapy, value)}
                                                sx={{
                                                    backgroundColor: '#ffffff'
                                                }}
                                            >
                                                {therapiesHistory[therapy]?.map((value: any, index) => (
                                                    <Option key={index} value={index}>
                                                        {
                                                            (therapy==="진료 기록" || therapy==="기본 검사") ? value.recorded
                                                            : therapy==="운동 치료" ? value.progressed
                                                            : value.inspected
                                                        }
                                                    </Option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Stack>
                                    <Divider orientation='horizontal'/>
                                </React.Fragment>
                            ))}
                        </Stack>
                    </FormAccordionDetails>
                </FormAccordion> 
                <FormAccordion defaultExpanded>
                    <FormAccordionSummary>
                        <FormAccordionHeader>검색된 변화 항목</FormAccordionHeader>
                    </FormAccordionSummary>
                    <FormAccordionDetails>
                        <Stack direction='column' gap={2} sx={{ 
                            justifyContent: 'space-between',
                            p: '0px 5px',
                            alignItems: 'middle'
                        }}>
                            <TableMui<Update & ID>
                                headCells={headCells} 
                                rows={updates}
                                defaultRowNumber={updates.length}
                                selected={selected}
                                setSelected={setSelected}
                            />
                        </Stack>
                    </FormAccordionDetails>
                </FormAccordion>
                <FormAccordion defaultExpanded>
                    <FormAccordionSummary>
                        <FormAccordionHeader>리포트 설정</FormAccordionHeader>
                    </FormAccordionSummary>
                    <FormAccordionDetails>
                        <SummaryContainer 
                            axiosMode={true} 
                            rangeSelectable
                            adderList={selected.map((value) => {
                                return updates[value]
                            }).concat(defaultSelected.map((value) => {
                                return defaultUpdates[value]
                            }))}
                            initialValue={selectedReport?.changes ?? []}
                            onChange={updateGraphData}
                        />
                    </FormAccordionDetails>
                </FormAccordion>
                <FormAccordion defaultExpanded>
                    <FormAccordionSummary>
                        <FormAccordionHeader>기타</FormAccordionHeader>
                    </FormAccordionSummary>
                    <FormAccordionDetails>
                        <Stack direction='column' gap={2} sx={{ 
                            justifyContent: 'space-between',
                            p: '0px 5px',
                            alignItems: 'middle'
                        }}>
                        <FormControl size="md">
                            <FormLabel>진료일자</FormLabel>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                                <DateTimePicker 
                                    value={dayjs(reportDate)} 
                                    onChange={(e) => {setReportDate(dayjs(e))}}
                                    orientation="portrait"
                                    viewRenderers={{
                                        hours: renderTimeViewClock,
                                        minutes: renderTimeViewClock,
                                        seconds: renderTimeViewClock
                                    }}
                                    format="YYYY/MM/DD a hh:mm"
                                    sx={{
                                        backgroundColor: '#ffffff'
                                    }}
                                    ampm
                                />
                            </LocalizationProvider>
                        </FormControl>
                        <FormControl size="md">
                            <FormLabel>비고</FormLabel>
                            <Textarea
                                minRows={1}
                                placeholder="기타 사항"
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                                sx={{
                                    backgroundColor: '#ffffff'
                                }}
                            />
                        </FormControl>
                    </Stack>
                    </FormAccordionDetails>
                </FormAccordion>
            </Box>
            <Button variant='soft' onClick={handleAddReport} sx={{ margin: 'auto', width: '50%' }}>
                {isNew ? "추가": "변경"}
            </Button>
        </Sheet>
    )
}

export default ReportHistoryAddModal
