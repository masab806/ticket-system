import api from "../api/api";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [role, setRole] = useState(localStorage.getItem("role"));
    const [user, setUser] = useState("")

    useEffect(() => {
        const getProfile = async () => {
            try {
                const res = await api.get("/auth/profile", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })

                const responseData = res.data

                console.log(responseData)

                setUser(JSON.stringify(responseData) || "")
            } catch (error) {
                console.log("Error: ", error)
            }
        }

        if (token) {
            getProfile()
            console.log("User is: ", user)
        }
    }, [token])


    const login = (newToken, newRole) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("role", newRole);

        setToken(newToken);
        setRole(newRole);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        setToken(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ token, role, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}