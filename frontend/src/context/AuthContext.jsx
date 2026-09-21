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
                        Authorization: `Bearer ${token}`
                    }
                });

                // res.data is already an object, no JSON.parse needed
                const userData = res.data;
                console.log("Fetched profile data:", userData);

                setUser(userData);
            } catch (error) {
                console.error("Error fetching profile:", error.response?.data || error.message);
            }
        };

        if (token) {
            getProfile();
        }
    }, [token]);

    // Separate useEffect to monitor user state updates
    useEffect(() => {
        if (user) {
            console.log("User state updated:", user);
        }
    }, [user]);

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