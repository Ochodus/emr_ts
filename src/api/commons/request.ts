import axios, { AxiosRequestConfig } from 'axios';
import { DefaultInspection, inspectionContent } from "interfaces/inspectionType.interface";

export const auth = window.localStorage.getItem("persist:auth")
export const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null
export const BASE_BACKEND_URL = ""

type Uploadables = DefaultInspection<inspectionContent> | null

export const uploadFiles = async (
    data: Uploadables,
    files: (File | null)[],
    name: string,
    config: AxiosRequestConfig<FormData> | undefined,
    filesChanged: boolean[]
) => {
    let file_urls = Array.from({length: files.length}, () => "")

    await Promise.all(files.map(async (file, index) => {
        if (data === null || filesChanged[index]) {
            try {
                let formData = new FormData()
                formData.append('file', file ?? "")
                let response = await axios.post(`${BASE_BACKEND_URL}/api/file`, formData, config)
                file_urls[index] = response.data.file_path
            } catch (error) {
                console.error(`${name} 파일 추가 중 오류 발생: `, error)
                file_urls[index] = ""
            }
        } else {
            file_urls[index] = data.file_urls[index]
        }
    }))
    
    return file_urls
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
        console.log(`${name} 검사 기록 ${isNew ? "추가" : "편집"} 성공 : \n\n${JSON.stringify(data)}`) 
        handleClose()              
    } catch (error) {
        console.error(`${name} 검사 기록 ${isNew ? "추가" : "편집"} 중 오류 발생: `, error)
    }
}

