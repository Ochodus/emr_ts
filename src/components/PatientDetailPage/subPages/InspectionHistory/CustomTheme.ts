import { Accordion, AccordionDetails, AccordionSummary, styled, Typography } from '@mui/joy'

export const FormAccordion = styled(Accordion)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&::before': {
      display: 'none',
    },
}))

export const FormAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    backgroundColor: 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    padding: '5px 0',
    '& .MuiAccordionSummary-button': {
        marginLeft: theme.spacing(1),
    }
}))

export const FormAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
}))

export const FormAccordionHeader = styled(Typography)(({ theme }) => ({
    fontSize: '16px',
    fontWeight: 550
}))
