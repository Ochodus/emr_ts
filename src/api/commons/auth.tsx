import { useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_BACKEND_URL } from "./request";


export const useLocalTokenValidation = () => {
    const navigate = useNavigate()
    interface LocalAuth {
        token: string
    }

    const checkAuthValid = useCallback(async (path: string | null = null, token: string | null = null) => {
        const local_auth_string: string | null = localStorage.getItem('persist:auth')
        const local_auth_json: LocalAuth | null = local_auth_string ? JSON.parse(local_auth_string) : null
        
        const local_auth_token: string | null = token ? token : (local_auth_json ? JSON.parse(local_auth_json.token) : null)
        if (!local_auth_token || local_auth_token === "") {navigate('/login'); return false}

        let config = {
            headers: {
                Authorization: "Bearer " + local_auth_token,
            },
        };
        try {
            await axios.get(
                `${BASE_BACKEND_URL}/api/users`,
                config
            );

            path ? navigate(path) : navigate(`.`)

            return true
        } catch (error) {
            navigate('/login')
            return false
        }
    }, [navigate])

    return checkAuthValid
}