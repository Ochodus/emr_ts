import { ColorPaletteProp, Snackbar, SnackbarCloseReason, SnackbarPropsColorOverrides, SnackbarPropsVariantOverrides, VariantProp } from "@mui/joy";
import { OverridableStringUnion } from '@mui/types';

interface CustomSnackbarProps {
    open: boolean,
    snackbarMsg: string,
    autoHideDuration?: number,
    variant?: OverridableStringUnion<VariantProp, SnackbarPropsVariantOverrides>,
    color?: OverridableStringUnion<ColorPaletteProp, SnackbarPropsColorOverrides>,
    onClose?: ((event: React.SyntheticEvent<any> | Event | null, reason: SnackbarCloseReason) => void)
}

const CustomSnackbar = ({
    open,
    snackbarMsg,
    autoHideDuration=6000,
    variant='outlined',
    color='success',
    onClose
}: CustomSnackbarProps) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            variant={variant}
            color={color}
            onClose={onClose}
        >
            {snackbarMsg}
        </Snackbar>
    )
}

export default CustomSnackbar