import { useCallback } from "react";
import axios from 'axios';


export const useRequestAPI = () => {
    const auth = window.localStorage.getItem("persist:auth")
	const accessToken = auth ? JSON.parse(JSON.parse(auth).token) : null

	let config = {
		headers: {
			Authorization: "Bearer " + accessToken,
		},
	}

    const request = useCallback(async (url: string, type: 'get' | 'post' | 'patch' | 'delete' = 'get', data? : any, responseHandler?: Function, errorHandler?: Function) => {
        let axiosRequest = 
            type === 'post' ? axios.post :
            type === 'patch' ? axios.patch :
            type === 'delete' ? axios.delete : 
            axios.get

        try {
            let response = undefined
            if (type === 'post' || type === 'patch') response = await axiosRequest(url, data, config)
            if (type === 'get' || type === 'delete') response = await axiosRequest(url, config)

            if (responseHandler) responseHandler(response?.data)

        } catch (error) {
            if (errorHandler) errorHandler()
        }
    }, [])

    return request
}