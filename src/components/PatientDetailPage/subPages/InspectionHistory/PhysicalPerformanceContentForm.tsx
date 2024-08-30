import React, { useCallback, useEffect } from 'react'
import { BallBounce, DynamicMovement, FunctionalLine, PhysicalPerformanceContent, YBalance } from '../../../../interfaces/inspectionType.interface'
import { updateDeepValue, validationCheck } from 'api/commons/utils'
import dayjs from 'dayjs'
import { FormAccordion, FormAccordionDetails, FormAccordionHeader, FormAccordionSummary } from './CustomTheme'
import { Box, Divider, FormControl, FormLabel, IconButton, Input, Stack, Typography } from '@mui/joy'
import { Add, Delete } from '@mui/icons-material'

interface PhysicalPerformanceContentFormProps {
    content?: PhysicalPerformanceContent, 
    ocrResult?: {[index: string]: string},
    submitted?: boolean,
    setContent?: React.Dispatch<React.SetStateAction<PhysicalPerformanceContent>>,
    setContentValidation?: React.Dispatch<React.SetStateAction<boolean>>,
    setExDate?: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>
}

const initialPhysicalPerformanceContent: PhysicalPerformanceContent = {
    functional_line: [],
    y_balance: [],
    ball_bounce: [],
    dynamic_movement: []
}

const initialFunctionalLine: FunctionalLine = {
    trial_number: 0, 
    rt: {
        rt: {
            rt: ["", ""], 
            lt: ["", ""]
        }, 
        lt: {
            rt: ["", ""], 
            lt: ["", ""]
        }
    }, 
    lt: {
        rt: {
            rt: ["", ""], 
            lt: ["", ""]
        }, 
        lt: {
            rt: ["", ""], 
            lt: ["", ""]
        }
    }
}

const initialYBalance: YBalance = {
    trial_number: 0, 
    rt: {
        at: ["", ""], 
        pl: ["", ""], 
        pm: ["", ""]
    }, 
    lt: {
        at: ["", ""], 
        pl: ["", ""], 
        pm: ["", ""]
    }
}

const initialBallBounce: BallBounce = {
    trial_number: 0, 
    rt: {
        step: "", 
        distance: "", 
        trials: [
            {time: 0, amount: 0}, 
            {time: 0, amount: 0}, 
            {time: 0, amount: 0}
        ], 
        note: ""
    }, 
    lt: {step: "", 
        distance: "", 
        trials: [
            {time: 0, amount: 0}, 
            {time: 0, amount: 0}, 
            {time: 0, amount: 0}
        ], 
        note: ""
    }
}

const initialDynamicMovement: DynamicMovement = {
    trial_number: 0, 
    two_leg_jump: {time: "", note: ""}, 
    side_step: {rt: "", lt: "", note: ""}, 
    side_one_step_in_out: {rt: "", lt: "", note: ""}, 
    side_two_step_in_out: {rt: "", lt: "", note: ""},
    forward_side_to_step: {rt: "", lt: "", note: ""}, 
    brasilian_step: {time: "", note: ""}, 
    diagonal_line_run: {time: "", note: ""}
}

const PhysicalPerformanceContentForm = ({
    content, 
    ocrResult={}, 
    submitted, 
    setContent, 
    setContentValidation, 
    setExDate
}: PhysicalPerformanceContentFormProps) => {

    
    const formValidationCheck = useCallback(() => {
        return (            
            validationCheck(content?.y_balance) &&
            validationCheck(content?.functional_line) &&
            validationCheck(content?.ball_bounce.map(bb => {
                return [bb.trial_number, bb.lt.step, bb.lt.distance, bb.lt.trials[0], bb.rt.step, bb.rt.distance, bb.rt.trials[0]]
            })) &&
            validationCheck(content?.dynamic_movement.map(dm => {
                return [
                    dm.brasilian_step.time, 
                    dm.diagonal_line_run.time, 
                    dm.forward_side_to_step.lt, 
                    dm.forward_side_to_step.rt,
                    dm.side_one_step_in_out.lt,
                    dm.side_one_step_in_out.rt,
                    dm.side_step.lt,
                    dm.side_step.rt,
                    dm.side_two_step_in_out.lt,
                    dm.side_two_step_in_out.rt,
                    dm.trial_number,
                    dm.two_leg_jump.time
                ]
            }))
        )
    }, [content?.y_balance, content?.functional_line, content?.ball_bounce, content?.dynamic_movement])

    useEffect(() => {
        if (Object.keys(ocrResult).length === 0) return

        if (setExDate) setExDate(dayjs(ocrResult['exDate']))

    }, [ocrResult, setContent, setExDate])
    
    useEffect(() => {
        if (setContent && !content) {
            setContent(initialPhysicalPerformanceContent)
        }
    }, [setContent, content])

    useEffect(() => {
        if (setContentValidation) setContentValidation(formValidationCheck())
    }, [content, setContentValidation, formValidationCheck])

    return (
        <React.Fragment>
            <FormAccordion defaultExpanded>
                <FormAccordionSummary>
                    <FormAccordionHeader>기능선 테스트</FormAccordionHeader>
                </FormAccordionSummary>
                <FormAccordionDetails sx={{ p: 0 }}>
                    <Box>
                        <img src={`${process.env.PUBLIC_URL}/images/inspectionIcon/functionalLine.png`} style={{ width: '100%', height: '500px' }} alt=''/>
                    </Box>
                    <Divider orientation='horizontal' sx={{ '--Divider-lineColor': 'gray' }}/>
                    <Box>
                        <Stack direction="row" sx={{ textAlign: 'center', width: '100%' }}>
                            <Typography sx={{ my: 'auto', width: '10%' }}>회차</Typography>
                            <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                            <Typography sx={{ my: 'auto', width: '5%' }}>손</Typography>
                            <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                            <Stack sx={{ textAlign: 'center', width: '80%' }}>
                                <Typography sx={{ my: 1 }}>디딤발</Typography>
                                <Divider orientation='horizontal' sx={{ '--Divider-lineColor': 'gray' }}/>
                                <Stack direction="row" sx={{ justifyContent: 'space-evenly' }}>
                                    <Typography sx={{ my: 1, flex: '1 0 0' }}>RT</Typography>
                                    <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                                    <Typography sx={{ my: 1, flex: '1 0 0' }}>LT</Typography>
                                </Stack> 
                            </Stack>
                            <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                            <Typography sx={{ width: '5%' }}></Typography>
                        </Stack>
                        <Divider sx={{ '--Divider-lineColor': 'gray' }}/>
                        {content?.functional_line.map((inspection, index) => {
                            return (
                                <React.Fragment key={index}>
                                    <Stack direction='row' sx={{ display: 'flex', width: '100%' }}>
                                        <FormControl size="md" error={!validationCheck(inspection.trial_number) && submitted} sx={{ width: '10%', my: 'auto', flex: '0 0 auto' }}>
                                            <Input
                                                type="number"
                                                placeholder=""
                                                value={inspection.trial_number}
                                                onChange={(e) => updateDeepValue(setContent, ['functional_line', index, 'trial_number'], e.target.value)}
                                                sx={{
                                                    backgroundColor: '#ffffff',
                                                    width: '3.5rem',
                                                    mx: 'auto',
                                                }}
                                            />
                                        </FormControl>
                                        <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                                        <Stack direction='column' sx={{ width: '5%' }}>
                                            <Typography sx={{ my: 'auto', textAlign: 'center' }}>RT</Typography>
                                            <Typography sx={{ my: 'auto', textAlign: 'center' }}>LT</Typography>
                                        </Stack>     
                                        <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>   
                                        <Stack direction='column' sx={{ width: '80%' }}>                                                                    
                                            <Box sx={{ display: 'flex' }}>
                                                <Box 
                                                    className="scrollable horizontal"
                                                    sx={{ 
                                                        display: 'flex', 
                                                        p: '15px 10px',
                                                        justifyContent: 'space-evenly',
                                                        width: '50%'
                                                    }}
                                                    gap={2}
                                                >
                                                    <Stack direction='row' gap={1}>
                                                        <FormControl size="md" error={!validationCheck(inspection.rt.rt.lt[0]) && submitted}>
                                                            <FormLabel>LT</FormLabel>
                                                            <Input
                                                                type="number"
                                                                placeholder=""
                                                                value={inspection.rt.rt.lt[0]}
                                                                onChange={(e) => updateDeepValue(setContent, ['functional_line', index, 'rt', 'rt', 'lt', 0], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormControl size="md" error={!validationCheck(inspection.rt.rt.lt[1]) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                            <Input
                                                                type="number"
                                                                placeholder=""
                                                                value={inspection.rt.rt.lt[1]}
                                                                onChange={(e) => updateDeepValue(setContent, ['functional_line', index, 'rt', 'rt', 'lt', 1], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />                                                    
                                                        </FormControl>
                                                    </Stack>
                                                    <Stack direction='row' gap={1}>
                                                        <FormControl size="md" error={!validationCheck(inspection.rt.rt.rt[0]) && submitted}>                                                    
                                                            <FormLabel>RT</FormLabel>
                                                            <Input
                                                                type="number"
                                                                placeholder=""
                                                                value={inspection.rt.rt.rt[0]}
                                                                onChange={(e) => updateDeepValue(setContent, ['functional_line', index, 'rt', 'rt', 'rt', 0], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />                                            
                                                        </FormControl>
                                                        <FormControl size="md" error={!validationCheck(inspection.rt.rt.rt[1]) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                            <Input
                                                                type="number"
                                                                placeholder=""
                                                                value={inspection.rt.rt.rt[1]}
                                                                onChange={(e) => updateDeepValue(setContent, ['functional_line', index, 'rt', 'rt', 'rt', 1], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />                                                    
                                                        </FormControl>
                                                    </Stack>
                                                </Box>
                                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                                                <Box 
                                                    className="scrollable horizontal"
                                                    sx={{ 
                                                        display: 'flex', 
                                                        p: '15px 10px',
                                                        justifyContent: 'space-evenly',
                                                        width: '50%'
                                                    }}
                                                    gap={2}
                                                >
                                                    <Stack direction='row' gap={1}>
                                                        <FormControl size="md" error={!validationCheck(inspection.rt.lt.lt[0]) && submitted}>
                                                            <FormLabel>LT</FormLabel>
                                                            <Input
                                                                type="number"
                                                                placeholder=""
                                                                value={inspection.rt.lt.lt[0]}
                                                                onChange={(e) => updateDeepValue(setContent, ['functional_line', index, 'rt', 'lt', 'lt', 0], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormControl size="md" error={!validationCheck(inspection.rt.lt.lt[1]) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                            <Input
                                                                type="number"
                                                                placeholder=""
                                                                value={inspection.rt.lt.lt[1]}
                                                                onChange={(e) => updateDeepValue(setContent, ['functional_line', index, 'rt', 'lt', 'lt', 1], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />                                                    
                                                        </FormControl>
                                                    </Stack>
                                                    <Stack direction='row' gap={1}>
                                                        <FormControl size="md" error={!validationCheck(inspection.rt.lt.rt[0]) && submitted}>                                                    
                                                            <FormLabel>RT</FormLabel>
                                                            <Input
                                                                type="number"
                                                                placeholder=""
                                                                value={inspection.rt.lt.rt[0]}
                                                                onChange={(e) => updateDeepValue(setContent, ['functional_line', index, 'rt', 'lt', 'rt', 0], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormControl size="md" error={!validationCheck(inspection.rt.lt.rt[1]) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                            <Input
                                                                type="number"
                                                                placeholder=""
                                                                value={inspection.rt.lt.rt[1]}
                                                                onChange={(e) => updateDeepValue(setContent, ['functional_line', index, 'rt', 'lt', 'rt', 1], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />                                                    
                                                        </FormControl>
                                                    </Stack>
                                                </Box>
                                            </Box>                                                  
                                            <Box sx={{ display: 'flex', flex: '1 1 auto', justifyContent: 'space-around' }}>
                                                <Box 
                                                    className='scrollable horizontal'
                                                    sx={{ 
                                                        display: 'flex', 
                                                        p: '15px 10px',
                                                        justifyContent: 'space-evenly',
                                                        width: '50%'
                                                    }}
                                                    gap={2}
                                                >
                                                    <Stack direction='row' gap={1}>
                                                        <FormControl size="md" error={!validationCheck(inspection.lt.rt.lt[0]) && submitted}>
                                                            <FormLabel>LT</FormLabel>
                                                            <Input
                                                                type="number"
                                                                placeholder=""
                                                                value={inspection.lt.rt.lt[0]}
                                                                onChange={(e) => updateDeepValue(setContent, ['functional_line', index, 'lt', 'rt', 'lt', 0], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormControl size="md" error={!validationCheck(inspection.lt.rt.lt[1]) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                            <Input
                                                                type="number"
                                                                placeholder=""
                                                                value={inspection.lt.rt.lt[1]}
                                                                onChange={(e) => updateDeepValue(setContent, ['functional_line', index, 'lt', 'rt', 'lt', 1], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />                                                    
                                                        </FormControl>
                                                    </Stack>
                                                    <Stack direction='row' gap={1}>
                                                        <FormControl size="md" error={!validationCheck(inspection.lt.rt.rt[0]) && submitted}>                                                    
                                                            <FormLabel>RT</FormLabel>
                                                            <Input
                                                                type="number"
                                                                placeholder=""
                                                                value={inspection.lt.rt.rt[0]}
                                                                onChange={(e) => updateDeepValue(setContent, ['functional_line', index, 'lt', 'rt', 'rt', 0], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormControl size="md" error={!validationCheck(inspection.lt.rt.rt[1]) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                            <Input
                                                                type="number"
                                                                placeholder=""
                                                                value={inspection.lt.rt.rt[1]}
                                                                onChange={(e) => updateDeepValue(setContent, ['functional_line', index, 'lt', 'rt', 'rt', 1], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />                                                    
                                                        </FormControl>
                                                    </Stack>
                                                </Box>
                                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                                                <Box 
                                                    className="scrollable horizontal"
                                                    sx={{ 
                                                        display: 'flex', 
                                                        p: '15px 10px',
                                                        justifyContent: 'space-evenly',
                                                        width: '50%'
                                                    }}
                                                    gap={2}
                                                >
                                                    <Stack direction='row' gap={1}>
                                                        <FormControl size="md" error={!validationCheck(inspection.lt.lt.lt[0]) && submitted}>
                                                            <FormLabel>LT</FormLabel>
                                                            <Input
                                                                type="number"
                                                                placeholder=""
                                                                value={inspection.lt.lt.lt[0]}
                                                                onChange={(e) => updateDeepValue(setContent, ['functional_line', index, 'lt', 'lt', 'lt', 0], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormControl size="md" error={!validationCheck(inspection.lt.lt.lt[1]) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                            <Input
                                                                type="number"
                                                                placeholder=""
                                                                value={inspection.lt.lt.lt[1]}
                                                                onChange={(e) => updateDeepValue(setContent, ['functional_line', index, 'lt', 'lt', 'lt', 1], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />                                                    
                                                        </FormControl>
                                                    </Stack>
                                                    <Stack direction='row' gap={1}>
                                                        <FormControl size="md" error={!validationCheck(inspection.lt.lt.rt[0]) && submitted}>                                                    
                                                            <FormLabel>RT</FormLabel>
                                                            <Input
                                                                type="number"
                                                                placeholder=""
                                                                value={inspection.lt.lt.rt[0]}
                                                                onChange={(e) => updateDeepValue(setContent, ['functional_line', index, 'lt', 'lt', 'rt', 0], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormControl size="md" error={!validationCheck(inspection.lt.lt.rt[1]) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                            <Input
                                                                type="number"
                                                                placeholder=""
                                                                value={inspection.lt.lt.rt[1]}
                                                                onChange={(e) => updateDeepValue(setContent, ['functional_line', index, 'lt', 'lt', 'rt', 1], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />                                                    
                                                        </FormControl>
                                                    </Stack>
                                                </Box>
                                            </Box>
                                        </Stack>
                                        <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                                        <IconButton
                                            sx={{ width: '5%', flex: '0 0 auto' }}
                                            onClick={() => updateDeepValue(setContent, ['functional_line'], content.functional_line.filter((_, id) => id !== index))}
                                        >
                                            <Delete/>
                                        </IconButton>
                                    </Stack>
                                    <Divider orientation='horizontal' sx={{ '--Divider-lineColor': 'gray' }}/>
                                </React.Fragment>
                            )
                        })}
                    </Box>
                    <IconButton sx={{ }} onClick={() => updateDeepValue(setContent, ['functional_line'], [...(content?.functional_line ?? []), initialFunctionalLine])}> 
                        <Add/> 
                    </IconButton>
                </FormAccordionDetails>
            </FormAccordion>
            <FormAccordion defaultExpanded>
                <FormAccordionSummary>
                    <FormAccordionHeader>Y-Balance 테스트</FormAccordionHeader>
                </FormAccordionSummary>
                <FormAccordionDetails sx={{ p: 0 }}>
                    <img src={`${process.env.PUBLIC_URL}/images/inspectionIcon/yBalance.png`} style={{ width: '100%', height: '500px' }} alt=''></img>
                    <Divider orientation='horizontal' sx={{ '--Divider-lineColor': 'gray' }}/>
                    <Box>
                        <Stack direction="row" sx={{ textAlign: 'center', width: '100%' }}>
                            <Typography sx={{ my: 'auto', width: '10%' }}>회차</Typography>
                            <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                            <Stack direction="row" sx={{ justifyContent: 'space-evenly', width: '85%' }}>
                                <Typography sx={{ my: 1, flex: '1 0 0' }}>RT</Typography>
                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                                <Typography sx={{ my: 1, flex: '1 0 0' }}>LT</Typography>
                            </Stack> 
                            <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                            <Typography sx={{ width: '5%' }}></Typography>
                        </Stack>
                        <Divider sx={{ '--Divider-lineColor': 'gray' }}/>
                        {content?.y_balance.map((inspection, index) => {
                            return (
                                <React.Fragment key={index}>
                                    <Stack direction='row' sx={{ display: 'flex', width: '100%' }}>
                                        <FormControl size="md" error={!validationCheck(inspection.trial_number) && submitted} sx={{ width: '10%', my: 'auto', flex: '0 0 auto' }}>
                                            <Input
                                                type="number"
                                                placeholder=""
                                                value={inspection.trial_number}
                                                onChange={(e) => updateDeepValue(setContent, ['y_balance', index, 'trial_number'], e.target.value)}
                                                sx={{
                                                    backgroundColor: '#ffffff',
                                                    width: '3.5rem',
                                                    mx: 'auto',
                                                }}
                                            />
                                        </FormControl>
                                        <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>                                                                  
                                        <Box sx={{ display: 'flex', width: '85%' }}>
                                            <Box 
                                                className="scrollable horizontal"
                                                sx={{ 
                                                    display: 'flex', 
                                                    p: '15px 10px',
                                                    justifyContent: 'space-evenly',
                                                    width: '50%'
                                                }}
                                                gap={2}
                                            >
                                                <Stack direction='row' gap={1}>
                                                    <FormControl size="md" error={!validationCheck(inspection.rt.at[0]) && submitted}>
                                                        <FormLabel>AT</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={inspection.rt.at[0]}
                                                            onChange={(e) => updateDeepValue(setContent, ['y_balance', index, 'rt', 'at', 0], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(inspection.rt.at[1]) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={inspection.rt.at[1]}
                                                            onChange={(e) => updateDeepValue(setContent, ['y_balance', index, 'rt', 'at', 1], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />                                                    
                                                    </FormControl>
                                                </Stack>
                                                <Stack direction='row' gap={1}>
                                                    <FormControl size="md" error={!validationCheck(inspection.rt.pl[0]) && submitted}>                                                    
                                                        <FormLabel>PL</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={inspection.rt.pl[0]}
                                                            onChange={(e) => updateDeepValue(setContent, ['y_balance', index, 'rt', 'pl', 0], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />                                          
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(inspection.rt.pl[1]) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={inspection.rt.pl[1]}
                                                            onChange={(e) => updateDeepValue(setContent, ['y_balance', index, 'rt', 'pl', 1], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />                                                    
                                                    </FormControl>
                                                </Stack>
                                                <Stack direction='row' gap={1}>
                                                    <FormControl size="md" error={!validationCheck(inspection.rt.pm[0]) && submitted}>
                                                        <FormLabel>PM</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={inspection.rt.pm[0]}
                                                            onChange={(e) => updateDeepValue(setContent, ['y_balance', index, 'rt', 'pm', 0], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(inspection.rt.pm[1]) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={inspection.rt.pm[1]}
                                                            onChange={(e) => updateDeepValue(setContent, ['y_balance', index, 'rt', 'pm', 1], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />                                                    
                                                    </FormControl>
                                                </Stack>
                                            </Box>
                                            <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                                            <Box 
                                                className="scrollable horizontal"
                                                sx={{ 
                                                    display: 'flex', 
                                                    p: '15px 10px',
                                                    justifyContent: 'space-evenly',
                                                    width: '50%'
                                                }}
                                                gap={2}
                                            >
                                                <Stack direction='row' gap={1}>
                                                    <FormControl size="md" error={!validationCheck(inspection.lt.at[0]) && submitted}>
                                                        <FormLabel>AT</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={inspection.lt.at[0]}
                                                            onChange={(e) => updateDeepValue(setContent, ['y_balance', index, 'lt', 'at', 0], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(inspection.lt.at[1]) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={inspection.lt.at[1]}
                                                            onChange={(e) => updateDeepValue(setContent, ['y_balance', index, 'lt', 'at', 1], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />                                                    
                                                    </FormControl>
                                                </Stack>
                                                <Stack direction='row' gap={1}>
                                                    <FormControl size="md" error={!validationCheck(inspection.lt.pl[0]) && submitted}>                                                    
                                                        <FormLabel>PL</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={inspection.lt.pl[0]}
                                                            onChange={(e) => updateDeepValue(setContent, ['y_balance', index, 'lt', 'pl', 0], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />                                             
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(inspection.lt.pl[1]) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={inspection.lt.pl[1]}
                                                            onChange={(e) => updateDeepValue(setContent, ['y_balance', index, 'lt', 'pl', 1], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />                                                    
                                                    </FormControl>
                                                </Stack>
                                                <Stack direction='row' gap={1}>
                                                    <FormControl size="md" error={!validationCheck(inspection.lt.pm[0]) && submitted}>
                                                        <FormLabel>PM</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={inspection.lt.pm[0]}
                                                            onChange={(e) => updateDeepValue(setContent, ['y_balance', index, 'lt', 'pm', 0], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(inspection.lt.pm[1]) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={inspection.lt.pm[1]}
                                                            onChange={(e) => updateDeepValue(setContent, ['y_balance', index, 'lt', 'pm', 1], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />                                                    
                                                    </FormControl>
                                                </Stack>
                                            </Box>
                                        </Box>                                             
                                        <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                                        <IconButton
                                            sx={{ width: '5%', flex: '0 0 auto' }}
                                            onClick={() => updateDeepValue(setContent, ['y_balance'], content.y_balance.filter((_, id) => id !== index))}
                                        >
                                            <Delete/>
                                        </IconButton>
                                    </Stack>
                                    <Divider orientation='horizontal' sx={{ '--Divider-lineColor': 'gray' }}/>
                                </React.Fragment>
                            )
                        })}
                    </Box>
                    <IconButton sx={{ }} onClick={() => updateDeepValue(setContent, ['y_balance'], [...(content?.y_balance ?? []), initialYBalance])}> 
                        <Add/> 
                    </IconButton>
                </FormAccordionDetails>
            </FormAccordion>
            <FormAccordion defaultExpanded>
                <FormAccordionSummary>
                    <FormAccordionHeader>Ball Bounce</FormAccordionHeader>
                </FormAccordionSummary>
                <FormAccordionDetails sx={{ p: 0 }}>
                    <Box>
                        <Stack direction="row" sx={{ textAlign: 'center', width: '100%' }}>
                            <Typography sx={{ my: 'auto', width: '10%' }}>회차</Typography>
                            <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                            <Stack direction="row" sx={{ justifyContent: 'space-evenly', width: '85%' }}>
                                <Typography sx={{ my: 1, flex: '1 0 0' }}>RT</Typography>
                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                                <Typography sx={{ my: 1, flex: '1 0 0' }}>LT</Typography>
                            </Stack> 
                            <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                            <Typography sx={{ width: '5%' }}></Typography>
                        </Stack>
                        <Divider sx={{ '--Divider-lineColor': 'gray' }}/>
                        {content?.ball_bounce.map((inspection, index) => {
                            return (
                                <React.Fragment key={index}>
                                    <Stack direction='row' sx={{ display: 'flex', width: '100%' }}>
                                        <FormControl size="md" error={!validationCheck(inspection.trial_number) && submitted} sx={{ width: '10%', my: 'auto', flex: '0 0 auto' }}>
                                            <Input
                                                type="number"
                                                placeholder=""
                                                value={inspection.trial_number}
                                                onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'trial_number'], e.target.value)}
                                                sx={{
                                                    backgroundColor: '#ffffff',
                                                    width: '3.5rem',
                                                    mx: 'auto',
                                                }}
                                            />
                                        </FormControl>
                                        <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>                                                                  
                                        <Box sx={{ display: 'flex', width: '85%' }}>
                                            <Stack 
                                                direction='column'
                                                sx={{  
                                                    p: '15px 10px',
                                                    justifyContent: 'space-evenly',
                                                    width: '50%'
                                                }}
                                            >
                                                <Stack direction='row' gap={1} sx={{ justifyContent: 'center', pb: 1 }}>
                                                    <FormControl size="md" error={!validationCheck(inspection.rt.step) && submitted}>
                                                        <FormLabel>단계</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={inspection.rt.step}
                                                            onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'rt', 'step'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(inspection.rt.distance) && submitted}>                                                        
                                                        <FormLabel>cm</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={inspection.rt.distance}
                                                            onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'rt', 'distance'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>
                                                </Stack>
                                                <Divider orientation='horizontal' sx={{ '--Divider-lineColor': 'lightgray' }}/>
                                                <Stack direction='row' gap={2} className='scrollable horizontal' sx={{ py: 1 }}>
                                                    <Stack direction='row' gap={1}>
                                                        <FormControl size="md" error={!validationCheck(inspection.rt.trials[0].amount) && submitted}>
                                                            <FormLabel>1회차 (초/개)</FormLabel>
                                                            <Input
                                                                type="number"
                                                                placeholder="초"
                                                                value={inspection.rt.trials[0].amount}
                                                                onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'rt', 'trials', 0, 'amount'], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormControl size="md" error={!validationCheck(inspection.rt.trials[0].time) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                            <Input
                                                                type="number"
                                                                placeholder="개"
                                                                value={inspection.rt.trials[0].time}
                                                                onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'rt', 'trials', 0, 'time'], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />                                                    
                                                        </FormControl>
                                                    </Stack>
                                                    <Stack direction='row' gap={1}>
                                                        <FormControl size="md">                                                    
                                                            <FormLabel>2회차 (초/개)</FormLabel>
                                                            <Input
                                                                type="number"
                                                                placeholder="초"
                                                                value={inspection.rt.trials[1].amount}
                                                                onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'rt', 'trials', 1, 'amount'], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormControl size="md" error={!validationCheck(inspection.rt.trials[1].time) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                            <Input
                                                                type="number"
                                                                placeholder="개"
                                                                value={inspection.rt.trials[1].time}
                                                                onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'rt', 'trials', 1, 'time'], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />                                                    
                                                        </FormControl>
                                                    </Stack>
                                                    <Stack direction='row' gap={1}>
                                                        <FormControl size="md">
                                                            <FormLabel>3회차 (초/개)</FormLabel>
                                                            <Input
                                                                type="number"
                                                                placeholder="초"
                                                                value={inspection.rt.trials[2].amount}
                                                                onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'rt', 'trials', 2, 'amount'], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormControl size="md" error={!validationCheck(inspection.rt.trials[2].time) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                            <Input
                                                                type="number"
                                                                placeholder="개"
                                                                value={inspection.rt.trials[2].time}
                                                                onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'rt', 'trials', 2, 'time'], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />                                                    
                                                        </FormControl>
                                                    </Stack>
                                                </Stack>
                                                <Divider orientation='horizontal' sx={{ '--Divider-lineColor': 'lightgray' }}/>
                                                <FormControl size="md" sx={{ pt: 1 }}>
                                                    <FormLabel>메모</FormLabel>
                                                    <Input
                                                        type="string"
                                                        placeholder="메모"
                                                        value={inspection.rt.note}
                                                        onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'rt', 'note'], e.target.value)}
                                                        sx={{
                                                            backgroundColor: '#ffffff',
                                                        }}
                                                    />
                                                </FormControl>
                                            </Stack>
                                            <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                                            <Stack 
                                                direction='column'
                                                sx={{  
                                                    p: '15px 10px',
                                                    justifyContent: 'space-evenly',
                                                    width: '50%'
                                                }}
                                            >
                                                <Stack direction='row' gap={1} sx={{ justifyContent: 'center', width: '100%', pb: 1 }}>
                                                    <FormControl size="md" error={!validationCheck(inspection.lt.step) && submitted}>
                                                        <FormLabel>단계</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={inspection.lt.step}
                                                            onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'lt', 'step'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormControl size="md" error={!validationCheck(inspection.lt.distance) && submitted}>                                                        
                                                        <FormLabel>cm</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            value={inspection.lt.distance}
                                                            onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'lt', 'distance'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>
                                                </Stack>
                                                <Divider orientation='horizontal' sx={{ '--Divider-lineColor': 'lightgray' }}/>
                                                <Stack direction='row' gap={2} className='scrollable horizontal' sx={{ py: 1 }}>
                                                    <Stack direction='row' gap={1}>
                                                        <FormControl size="md" error={!validationCheck(inspection.lt.trials[0].amount) && submitted}>
                                                            <FormLabel>1회차 (초/개)</FormLabel>
                                                            <Input
                                                                type="number"
                                                                placeholder="초"
                                                                value={inspection.lt.trials[0].amount}
                                                                onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'lt', 'trials', 0, 'amount'], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormControl size="md" error={!validationCheck(inspection.lt.trials[0].time) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                            <Input
                                                                type="number"
                                                                placeholder="개"
                                                                value={inspection.lt.trials[0].time}
                                                                onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'lt', 'trials', 0, 'time'], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />                                                    
                                                        </FormControl>
                                                    </Stack>
                                                    <Stack direction='row' gap={1}>
                                                        <FormControl size="md">                                                    
                                                            <FormLabel>2회차 (초/개)</FormLabel>
                                                            <Input
                                                                type="number"
                                                                placeholder="초"
                                                                value={inspection.lt.trials[1].amount}
                                                                onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'lt', 'trials', 1, 'amount'], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />                                         
                                                        </FormControl>
                                                        <FormControl size="md" error={!validationCheck(inspection.lt.trials[1].time) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                            <Input
                                                                type="number"
                                                                placeholder="개"
                                                                value={inspection.lt.trials[1].time}
                                                                onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'lt', 'trials', 1, 'time'], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />                                                    
                                                        </FormControl>
                                                    </Stack>
                                                    <Stack direction='row' gap={1}>
                                                        <FormControl size="md">
                                                            <FormLabel>3회차 (초/개)</FormLabel>
                                                            <Input
                                                                type="number"
                                                                placeholder="초"
                                                                value={inspection.lt.trials[2].amount}
                                                                onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'lt', 'trials', 2, 'amount'], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormControl size="md" error={!validationCheck(inspection.lt.trials[2].time) && submitted} sx={{ flexDirection: 'column-reverse' }}>
                                                            <Input
                                                                type="number"
                                                                placeholder="개"
                                                                value={inspection.lt.trials[2].time}
                                                                onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'lt', 'trials', 2, 'time'], e.target.value)}
                                                                sx={{
                                                                    backgroundColor: '#ffffff',
                                                                    width: '6.5rem'
                                                                }}
                                                            />                                                    
                                                        </FormControl>
                                                    </Stack>
                                                </Stack>
                                                <Divider orientation='horizontal' sx={{ '--Divider-lineColor': 'lightgray' }}/>
                                                <FormControl size="md" sx={{ pt: 1 }}>
                                                    <FormLabel>메모</FormLabel>
                                                    <Input
                                                        type="string"
                                                        placeholder="메모"
                                                        value={inspection.lt.note}
                                                        onChange={(e) => updateDeepValue(setContent, ['ball_bounce', index, 'lt', 'note'], e.target.value)}
                                                        sx={{
                                                            backgroundColor: '#ffffff'
                                                        }}
                                                    />
                                                </FormControl>
                                            </Stack>
                                        </Box>                                             
                                        <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                                        <IconButton
                                            sx={{ width: '5%', flex: '0 0 auto' }}
                                            onClick={() => updateDeepValue(setContent, ['ball_bounce'], content.ball_bounce.filter((_, id) => id !== index))}
                                        >
                                            <Delete/>
                                        </IconButton>
                                    </Stack>
                                    <Divider orientation='horizontal' sx={{ '--Divider-lineColor': 'gray' }}/>
                                </React.Fragment>
                            )
                        })}
                    </Box>
                    <IconButton sx={{ }} onClick={() => updateDeepValue(setContent, ['ball_bounce'], [...(content?.ball_bounce ?? []), initialBallBounce])}> 
                        <Add/> 
                    </IconButton>
                </FormAccordionDetails>
            </FormAccordion>
            <FormAccordion defaultExpanded>
                <FormAccordionSummary>
                    <FormAccordionHeader>동적 움직임 평가</FormAccordionHeader>
                </FormAccordionSummary>
                <FormAccordionDetails sx={{ p: 0 }}>
                <Box>
                        <Stack direction="row" sx={{ textAlign: 'center', width: '100%' }}>
                            <Typography sx={{ my: 'auto', width: '10%' }}>회차</Typography>
                            <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                            <Stack direction="row" sx={{ justifyContent: 'space-evenly', width: '85%' }}>
                                <Typography sx={{ my: 'auto', width: '25%' }}>검사명</Typography>
                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                                <Typography sx={{ my: 'auto', width: '30%' }}>결과</Typography>
                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                                <Typography sx={{ my: 'auto', width: '45%' }}>기타</Typography>
                            </Stack>                             
                            <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                            <Typography sx={{ width: '5%' }}></Typography>
                        </Stack>
                        <Divider sx={{ '--Divider-lineColor': 'gray' }}/>
                        {content?.dynamic_movement.map((inspection, index) => {
                            return (
                                <React.Fragment key={index}>
                                    <Stack direction='row' sx={{ display: 'flex', width: '100%' }}>
                                        <FormControl size="md" error={!validationCheck(inspection.trial_number) && submitted} sx={{ width: '10%', my: 'auto', flex: '0 0 auto' }}>
                                            <Input
                                                type="number"
                                                placeholder=""
                                                value={inspection.trial_number}
                                                onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'trial_number'], e.target.value)}
                                                sx={{
                                                    backgroundColor: '#ffffff',
                                                    width: '3.5rem',
                                                    mx: 'auto',
                                                }}
                                            />
                                        </FormControl>                                       
                                        <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>                                                                
                                        <Stack sx={{ display: 'flex', width: '85%' }}>
                                            <Stack direction='row'>
                                                <Typography sx={{ width: '25%', textAlign: 'center', margin: 'auto' }}>Two leg jump</Typography>
                                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>   
                                                <Stack direction='row' gap={1} sx={{ justifyContent: 'center', width: '30%', py: 1 }}>
                                                    <FormControl size="md" error={!validationCheck(inspection.two_leg_jump.time) && submitted}>
                                                        <FormLabel>시간 (s)</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder="s"
                                                            value={inspection.two_leg_jump.time}
                                                            onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'two_leg_jump', 'time'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>                                                    
                                                </Stack>
                                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>                      
                                                <FormControl size="md" sx={{ px: 2, py: 1, width: '45%' }}>
                                                    <FormLabel>메모</FormLabel>
                                                    <Input
                                                        type="string"
                                                        placeholder="메모"
                                                        value={inspection.two_leg_jump.note}
                                                        onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'two_leg_jump', 'note'], e.target.value)}
                                                        sx={{
                                                            backgroundColor: '#ffffff',
                                                        }}
                                                    />
                                                </FormControl>
                                            </Stack> 
                                            <Divider orientation='horizontal' sx={{ '--Divider-lineColor': 'gray' }}/>
                                            <Stack direction='row'>
                                                <Typography sx={{ width: '25%', textAlign: 'center', margin: 'auto' }}>Side Step</Typography>
                                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>   
                                                <Stack direction='row' gap={1} sx={{ justifyContent: 'center', width: '30%', py: 1 }}>
                                                    <FormControl size="md" error={!validationCheck(inspection.side_step.rt) && submitted}>
                                                        <FormLabel>RT 시간 (s)</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder="s"
                                                            value={inspection.side_step.rt}
                                                            onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'side_step', 'rt'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>    
                                                    <FormControl size="md" error={!validationCheck(inspection.side_step.lt) && submitted}>
                                                        <FormLabel>LT 시간 (s)</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder="s"
                                                            value={inspection.side_step.lt}
                                                            onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'side_step', 'lt'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>                                                   
                                                </Stack>
                                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>                      
                                                <FormControl size="md" sx={{ px: 2, py: 1, width: '45%' }}>
                                                    <FormLabel>메모</FormLabel>
                                                    <Input
                                                        type="string"
                                                        placeholder="메모"
                                                        value={inspection.side_step.note}
                                                        onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'side_step', 'note'], e.target.value)}
                                                        sx={{
                                                            backgroundColor: '#ffffff',
                                                        }}
                                                    />
                                                </FormControl>
                                            </Stack>                                             
                                            <Divider orientation='horizontal' sx={{ '--Divider-lineColor': 'gray' }}/>
                                            <Stack direction='row'>
                                                <Typography sx={{ width: '25%', textAlign: 'center', margin: 'auto' }}>Side One Step In-Out</Typography>
                                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>   
                                                <Stack direction='row' gap={1} sx={{ justifyContent: 'center', width: '30%', py: 1 }}>
                                                    <FormControl size="md" error={!validationCheck(inspection.side_one_step_in_out.rt) && submitted}>
                                                        <FormLabel>RT 시간 (s)</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder="s"
                                                            value={inspection.side_one_step_in_out.rt}
                                                            onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'side_one_step_in_out', 'rt'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>    
                                                    <FormControl size="md" error={!validationCheck(inspection.side_one_step_in_out.lt) && submitted}>
                                                        <FormLabel>LT 시간 (s)</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder="s"
                                                            value={inspection.side_one_step_in_out.lt}
                                                            onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'side_one_step_in_out', 'lt'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>                                                   
                                                </Stack>
                                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>                      
                                                <FormControl size="md" sx={{ px: 2, py: 1, width: '45%' }}>
                                                    <FormLabel>메모</FormLabel>
                                                    <Input
                                                        type="string"
                                                        placeholder="메모"
                                                        value={inspection.side_one_step_in_out.note}
                                                        onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'side_one_step_in_out', 'note'], e.target.value)}
                                                        sx={{
                                                            backgroundColor: '#ffffff',
                                                        }}
                                                    />
                                                </FormControl>
                                            </Stack>                                             
                                            <Divider orientation='horizontal' sx={{ '--Divider-lineColor': 'gray' }}/>
                                            <Stack direction='row'>
                                                <Typography sx={{ width: '25%', textAlign: 'center', margin: 'auto' }}>Side Two Step In-Out</Typography>
                                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>   
                                                <Stack direction='row' gap={1} sx={{ justifyContent: 'center', width: '30%', py: 1 }}>
                                                    <FormControl size="md" error={!validationCheck(inspection.side_two_step_in_out.rt) && submitted}>
                                                        <FormLabel>RT 시간 (s)</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder="s"
                                                            value={inspection.side_two_step_in_out.rt}
                                                            onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'side_two_step_in_out', 'rt'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>    
                                                    <FormControl size="md" error={!validationCheck(inspection.side_two_step_in_out.lt) && submitted}>
                                                        <FormLabel>LT 시간 (s)</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder="s"
                                                            value={inspection.side_two_step_in_out.lt}
                                                            onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'side_two_step_in_out', 'lt'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>                                                   
                                                </Stack>
                                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>                      
                                                <FormControl size="md" sx={{ px: 2, py: 1, width: '45%' }}>
                                                    <FormLabel>메모</FormLabel>
                                                    <Input
                                                        type="string"
                                                        placeholder="메모"
                                                        value={inspection.side_two_step_in_out.note}
                                                        onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'side_two_step_in_out', 'note'], e.target.value)}
                                                        sx={{
                                                            backgroundColor: '#ffffff',
                                                        }}
                                                    />
                                                </FormControl>
                                            </Stack>                                             
                                            <Divider orientation='horizontal' sx={{ '--Divider-lineColor': 'gray' }}/>
                                            <Stack direction='row'>
                                                <Typography sx={{ width: '25%', textAlign: 'center', margin: 'auto' }}>Forward Side Two Step</Typography>
                                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>   
                                                <Stack direction='row' gap={1} sx={{ justifyContent: 'center', width: '30%', py: 1 }}>
                                                    <FormControl size="md" error={!validationCheck(inspection.forward_side_to_step.rt) && submitted}>
                                                        <FormLabel>RT 시간 (s)</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder="s"
                                                            value={inspection.forward_side_to_step.rt}
                                                            onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'forward_side_to_step', 'rt'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>    
                                                    <FormControl size="md" error={!validationCheck(inspection.forward_side_to_step.lt) && submitted}>
                                                        <FormLabel>LT 시간 (s)</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder="s"
                                                            value={inspection.forward_side_to_step.lt}
                                                            onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'forward_side_to_step', 'lt'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>                                                   
                                                </Stack>
                                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>                      
                                                <FormControl size="md" sx={{ px: 2, py: 1, width: '45%' }}>
                                                    <FormLabel>메모</FormLabel>
                                                    <Input
                                                        type="string"
                                                        placeholder="메모"
                                                        value={inspection.forward_side_to_step.note}
                                                        onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'forward_side_to_step', 'note'], e.target.value)}
                                                        sx={{
                                                            backgroundColor: '#ffffff',
                                                        }}
                                                    />
                                                </FormControl>
                                            </Stack>                                             
                                            <Divider orientation='horizontal' sx={{ '--Divider-lineColor': 'gray' }}/>
                                            <Stack direction='row'>
                                                <Typography sx={{ width: '25%', textAlign: 'center', margin: 'auto' }}>Brasilian Step</Typography>
                                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>   
                                                <Stack direction='row' gap={1} sx={{ justifyContent: 'center', width: '30%', py: 1 }}>
                                                    <FormControl size="md" error={!validationCheck(inspection.brasilian_step.time) && submitted}>
                                                        <FormLabel>시간 (s)</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder="s"
                                                            value={inspection.brasilian_step.time}
                                                            onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'brasilian_step', 'time'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>                                                    
                                                </Stack>
                                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>                      
                                                <FormControl size="md" sx={{ px: 2, py: 1, width: '45%' }}>
                                                    <FormLabel>메모</FormLabel>
                                                    <Input
                                                        type="string"
                                                        placeholder="메모"
                                                        value={inspection.brasilian_step.note}
                                                        onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'brasilian_step', 'note'], e.target.value)}
                                                        sx={{
                                                            backgroundColor: '#ffffff',
                                                        }}
                                                    />
                                                </FormControl>
                                            </Stack> 
                                            <Divider orientation='horizontal' sx={{ '--Divider-lineColor': 'gray' }}/>
                                            <Stack direction='row'>
                                                <Typography sx={{ width: '25%', textAlign: 'center', margin: 'auto' }}>Diagonal Line Run</Typography>
                                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>   
                                                <Stack direction='row' gap={1} sx={{ justifyContent: 'center', width: '30%', py: 1 }}>
                                                    <FormControl size="md" error={!validationCheck(inspection.diagonal_line_run.time) && submitted}>
                                                        <FormLabel>시간 (s)</FormLabel>
                                                        <Input
                                                            type="number"
                                                            placeholder="s"
                                                            value={inspection.diagonal_line_run.time}
                                                            onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'diagonal_line_run', 'time'], e.target.value)}
                                                            sx={{
                                                                backgroundColor: '#ffffff',
                                                                width: '6.5rem'
                                                            }}
                                                        />
                                                    </FormControl>                                                    
                                                </Stack>
                                                <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>                      
                                                <FormControl size="md" sx={{ px: 2, py: 1, width: '45%' }}>
                                                    <FormLabel>메모</FormLabel>
                                                    <Input
                                                        type="string"
                                                        placeholder="메모"
                                                        value={inspection.diagonal_line_run.note}
                                                        onChange={(e) => updateDeepValue(setContent, ['dynamic_movement', index, 'diagonal_line_run', 'note'], e.target.value)}
                                                        sx={{
                                                            backgroundColor: '#ffffff',
                                                        }}
                                                    />
                                                </FormControl>
                                            </Stack> 
                                        </Stack>                         
                                        <Divider orientation='vertical' sx={{ '--Divider-lineColor': 'gray' }}/>
                                        <IconButton
                                            sx={{ width: '5%', flex: '0 0 auto' }}
                                            onClick={() => updateDeepValue(setContent, ['dynamic_movement'], content.dynamic_movement.filter((_, id) => id !== index))}
                                        >
                                            <Delete/>
                                        </IconButton>
                                    </Stack>
                                    <Divider orientation='horizontal' sx={{ '--Divider-lineColor': 'gray' }}/>
                                </React.Fragment>
                            )
                        })}
                    </Box>
                    <IconButton sx={{ }} onClick={() => updateDeepValue(setContent, ['dynamic_movement'], [...(content?.dynamic_movement ?? []), initialDynamicMovement])}> 
                        <Add/> 
                    </IconButton>                    
                </FormAccordionDetails>
            </FormAccordion>   
        </React.Fragment>                        
    )
}

export default PhysicalPerformanceContentForm
