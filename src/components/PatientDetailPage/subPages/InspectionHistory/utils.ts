import axios, { AxiosRequestConfig } from "axios"
import { Exbody, Imoove, InBody, LookinBody, PhysicalPerformance } from "./InspectionType.interface"

type Uploadables = Imoove | InBody | Exbody | LookinBody | PhysicalPerformance | null

export const uploadFiles = async (
    data: Uploadables,
    file: File | null,
    name: string,
    config: AxiosRequestConfig<FormData> | undefined
) => {
    let file_url = ""
    if (data === null) {
        try {
            let formData = new FormData()
            formData.append('file', file ?? "")
            let response = await axios.post('/api/file', formData, config)
            file_url = response.data.file_path
            console.log(`${name} 파일 추가 성공: ${file_url}`);
        } catch (error) {
            console.error(`${name} 파일 추가 중 오류 발생: `, error)
            return ""
        }
    } else {
        file_url = data.file_url
    }
    return file_url
}

export const uploadData = async (
    isNew: boolean, 
    url: string,
    data: Uploadables, 
    name: string, 
    config: AxiosRequestConfig<Uploadables> | undefined, 
    handleClose: () => void,
    id?: number
) => {
    try {
        isNew ? await axios.post(url, data, config) : await axios.patch(`${url}/${id}`, data, config)
        console.log(`${name} 검사 기록 ${isNew ? "추가" : "편집"} 성공`) 
        handleClose()              
    } catch (error) {
        console.error(`${name} 검사 기록 ${isNew ? "추가" : "편집"} 중 오류 발생: `, error)
    }
}