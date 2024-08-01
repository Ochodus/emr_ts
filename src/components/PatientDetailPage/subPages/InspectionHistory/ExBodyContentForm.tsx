import React, { useCallback, useEffect } from 'react'
import { SubAnalysis, ExbodyContent, analysis } from 'interfaces/inspectionType.interface'
import { updateDeepValue, validationCheck } from 'api/commons/utils'
import dayjs from 'dayjs'
import { Box, Divider, FormControl, FormHelperText, Input } from '@mui/joy'
import { FormAccordion, FormAccordionDetails, FormAccordionHeader, FormAccordionSummary } from './CustomTheme'
import TableMui, { HeadCell } from 'components/commons/TableMui'
import { InfoOutlined } from '@mui/icons-material'


interface ExbodyContentFormProps {
    content?: ExbodyContent, 
    ocrResults?: {[index: string]: string}[],
    submitted?: boolean,
    setContent?: React.Dispatch<React.SetStateAction<ExbodyContent>>,
    setContentValidation?: React.Dispatch<React.SetStateAction<boolean>>,
    setExDate?: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>
}

const initialExbodyContent: ExbodyContent = {
    fhp: {image: "", rear: "", front: ""} as analysis,
    trunk_lean: {image: "", rear: "", front: ""} as analysis,
    hip_extension_and_flexion: {image: "", right: {front: "", rear: ""}, left: {front: "", rear: ""}} as analysis,
    hip_rotation: {image: "", right: {inside: "", outside: ""}, left: {inside: "", outside: ""}} as analysis,
    knee_extension_and_flexion: {image: "", left: "", right: ""} as analysis,
    trunk_side_lean: {image: "", right: "", left: ""} as analysis,
    horizontal_movement_of_cog: {image: "", right: "", left: ""} as analysis,
    vertical_movement_of_cog: {image: "", up: ""} as analysis,
    pelvic_rotation: {image: "", right: "", left: ""} as analysis,
    step_width: {image: "", value: ""} as analysis,
    stride: {image: "", value: ""} as analysis,
}

interface ExbodyTable {
    id: number,
    type: string | null;
    graph: JSX.Element | null;
    values: JSX.Element | null;
}

const headCells: HeadCell<ExbodyTable>[] = [
    {
      id: 'type',
      numeric: false,
      label: '종류',
      sortable: true
    },
    {
      id: 'graph',
      numeric: false,
      label: '그래프',
      sortable: false
    },
    {
      id: 'values',
      numeric: false,
      label: '값',
      sortable: false
    }
]

const analysisTitle = {
    fhp: "FHP",
    trunk_lean: "Trunk Lean",
    hip_extension_and_flexion: "Hip Extension · Flexion",
    hip_rotation: "Hip Rotation",
    knee_extension_and_flexion: "Knee Extension · Flexion",
    trunk_side_lean: "Trunk Side Lean",
    horizontal_movement_of_cog: "Horizontal Movement of COG",
    vertical_movement_of_cog: "Vertical Movement of COG",
    pelvic_rotation: "Pelvic Rotation",
    step_width: "Step Width",
    stride: "Stride"
}

const parseOcrResult = (arr: (string | number)[]): SubAnalysis => {
    let result: SubAnalysis = {};
    let prevIndex: string | number = ""
    let curTarget: SubAnalysis = result

    arr.forEach((value) => {
        if (prevIndex !== "") {
            if (typeof value === 'string') {
                if (typeof prevIndex === 'string') {
                    result[prevIndex] = {}
                    curTarget = result[prevIndex] as SubAnalysis
                }
            }
            else {
                curTarget[prevIndex] = value
            }
        }
        else if (typeof value === 'number') {
            result['value'] = value
        }
        prevIndex = value
    })

    return result;
}

const parseStringToData = (value: string | undefined) => {
    if (!value) return {}

    const convertTable = {
        '앞': 'front',
        '뒤': 'rear',
        '우': 'right',
        '좌': 'left',
        '내': 'inside',
        '외': 'outside',
        '위': 'up',
        '아래': 'down'
    }

    const altRegex = /(앞|뒤|우|좌|내|외|위|아래|\d+)/g;

    let match
    let converted: (string | number)[] = []
    while ((match = altRegex.exec(value)) !== null) {
        if (/^\d+$/.test(match[0])) converted.push(parseInt(match[0], 10))
        else converted.push(convertTable[match[0] as (keyof typeof convertTable)])
    }

    return {...parseOcrResult(converted), image: ""} as SubAnalysis
}

const ExbodyContentForm = ({content, ocrResults=[{}], submitted, setContent, setContentValidation, setExDate}: ExbodyContentFormProps) => {
    const Entry = <T extends object | string | number>({value, path, depth}: {value: T, path: string[], depth: number}) => {
        if (typeof value !== 'object') {
            return (
                <FormControl size="md" error={!validationCheck(value) && submitted} sx={{ maxWidth: '120px', flex: '1 1 auto', mx: 'auto' }}>
                    <Input
                        type="number"
                        placeholder="수치 입력"
                        value={value}
                        onChange={(e) => updateDeepValue(setContent, path, `${e.target.value}`)}
                        sx={{
                            backgroundColor: '#ffffff'
                        }}
                    />
                    {!validationCheck(value) && submitted && 
                        <FormHelperText>
                            <InfoOutlined />
                            필수 입력란입니다.
                        </FormHelperText>                            
                    }                           
                </FormControl>
            )
        } else {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto'}}>
                    {Object.keys(value as T).map((key, index) => {
                        if (key === 'image') return null
                        return (
                            <Box sx={{ display: 'flex' }} key={index}>
                                <Box sx={{ my: 'auto', fontWeight: '550', width: `${300/(10-depth*3)}%`}}>{key}</Box>
                                <Divider orientation="vertical"/>
                                <Entry value={value[key as (keyof T)] as T} path={path.concat(key)} depth={depth+1}/>
                            </Box>
                        )
                    })}
                </Box>
            );
        }
    }

    const items: ExbodyTable[] = Object.keys(analysisTitle).map((key, index) => {
        if (content) {
            return {
                id: index,
                type: analysisTitle[key as keyof typeof analysisTitle],
                graph: <div></div>,
                values: <Entry value={content[key as (keyof typeof analysisTitle)]} path={[key]} depth={0}></Entry>,
            }
        } 
        else {
            return {
                id: index,
                type: null,
                graph: null,
                values: null,
            }
        }
    })

    const formValidationCheck = useCallback(() => {
        return (
            true
        )
    }, [])
    
    useEffect(() => {
        if (setContent && !content) {
            setContent(initialExbodyContent)
        }
    }, [setContent, content])

    useEffect(() => {
        if (setContentValidation) setContentValidation(formValidationCheck())
    }, [content, setContentValidation, formValidationCheck])

    useEffect(() => {
        if (Object.keys(ocrResults).length === 0) return
        updateDeepValue(setContent, ['fhp'], parseStringToData(ocrResults[0].fhp)) // 뒤4도\n앞6도
        updateDeepValue(setContent, ['trunk_lean'], parseStringToData(ocrResults[0].trunkLean)) // 우1도\n좌1도
        updateDeepValue(setContent, ['hip_extension_and_flexion'], parseStringToData(ocrResults[0].hipExtensionFlexion)) // 우:앞21도\n뒤14도\n좌:앞20도\n뒤13도
        updateDeepValue(setContent, ['hip_rotation'], parseStringToData(ocrResults[0].hipRotation)) //우;내3도\n외4도\n좌:내1도\n외5도
        updateDeepValue(setContent, ['knee_extension_and_flexion'], parseStringToData(ocrResults[0].kneeExtensionFlexion)) // 좌3도\n우6도
        updateDeepValue(setContent, ['trunk_side_lean'], parseStringToData(ocrResults[0].trunkSideLean)) // 우1도\n좌1도
        updateDeepValue(setContent, ['horizontal_movement_of_cog'], parseStringToData(ocrResults[0].horizontalMovementOfCOG)) // 우2cm\n좌5cm
        updateDeepValue(setContent, ['vertical_movement_of_cog'], parseStringToData(ocrResults[0].verticalMovementOfCOG)) // 위1cm
        updateDeepValue(setContent, ['pelvic_rotation'], parseStringToData(ocrResults[0].pelvicRotation)) //우7도\n좌6도
        updateDeepValue(setContent, ['step_width'], parseStringToData(ocrResults[0].stepWidth)) // 14cm
        updateDeepValue(setContent, ['stride'], parseStringToData(ocrResults[0].stride)) // 38cm

        if (setExDate) setExDate(dayjs(ocrResults[0]['exDate']))

    }, [ocrResults, setContent, setExDate])

    return (
        <FormAccordion defaultExpanded>
            <FormAccordionSummary>
                <FormAccordionHeader>Clinical Gait Analysis Graph</FormAccordionHeader>
            </FormAccordionSummary>
            <FormAccordionDetails sx={{ p: 0 }}>
                <TableMui<ExbodyTable>
                    headCells={headCells}
                    rows={items}
                    defaultRowNumber={0}
                    selectable={false}
                />
            </FormAccordionDetails>
        </FormAccordion>
    )
}

export default ExbodyContentForm
