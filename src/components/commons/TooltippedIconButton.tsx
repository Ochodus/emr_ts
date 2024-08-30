import { OverridableStringUnion } from '@mui/types';
import { IconButton, IconButtonPropsVariantOverrides, Tooltip, TooltipPropsVariantOverrides, VariantProp } from "@mui/joy";
import { ReactElement } from "react";

interface TooltippedIconButtonProps {
    children: ReactElement,
    tooltipString: string,
    tooltipVariant?: OverridableStringUnion<VariantProp, TooltipPropsVariantOverrides>,
    buttonVariant?: OverridableStringUnion<VariantProp, IconButtonPropsVariantOverrides>,
    disabled?: boolean,
    onClick?: React.MouseEventHandler<HTMLAnchorElement>
}

const TooltippedIconButton = ({
    children,
    tooltipString,
    tooltipVariant="solid",
    buttonVariant="plain",
    disabled=false,
    onClick
}: TooltippedIconButtonProps) => {
    return (
        <Tooltip title={tooltipString} variant={tooltipVariant}>
            <IconButton
                variant={buttonVariant}
                onClick={onClick}
                disabled={disabled}
            >{children}
            </IconButton>
        </Tooltip>
    )
}

export default TooltippedIconButton

