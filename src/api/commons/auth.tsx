import { useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


export const useLocalTokenValidation = () => {
    const navigate = useNavigate()
    interface LocalAuth {
        token: string
    }

    const checkAuthValid = useCallback(async (path: string | null = null) => {
        const local_auth_string: string | null = localStorage.getItem('persist:auth')
        const local_auth_json: LocalAuth | null = local_auth_string ? JSON.parse(local_auth_string) : null
        
        const local_auth_token: string | null = local_auth_json ? JSON.parse(local_auth_json.token) : null

        let config = {
            headers: {
                Authorization: "Bearer " + local_auth_token,
            },
        };
        try {
            const response = await axios.get(
            `/api/users`,
            config
            );

            path ? navigate(path) : navigate(`.`)

            return true
        } catch (error) {
            console.log("dd")
            navigate('/login')
            return false
        }
    }, [navigate])

    return checkAuthValid
}