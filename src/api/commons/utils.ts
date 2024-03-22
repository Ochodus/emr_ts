export const findElement = (array: Array<any> | undefined, targetIndex: number) => {
    return array?.find((_, index) => index === targetIndex)
}

export const birthToId = (birth: string | undefined) => {
    if (birth && birth.substr(2)) return birth.substr(2).replace(/-/g, "")
    else return ""
}