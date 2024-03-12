export const findElement = (array: Array<any> | undefined, targetIndex: number) => {
    return array?.find((_, index) => index === targetIndex)
}