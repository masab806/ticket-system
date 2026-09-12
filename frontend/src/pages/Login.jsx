import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Login failed.");
                return;
            }

            // Save JWT token
            localStorage.setItem("token", data.token);

            // Login successful
            navigate("/");
        } catch (err) {
            setError("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                        Welcome back
                    </CardTitle>

                    <CardDescription>
                        Log in to your Tessera account
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-5">

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Email
                            </label>

                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Password
                            </label>

                            <Input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">
                                {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Log In"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="font-medium text-primary hover:underline"
                            >
                                Sign Up
                            </Link>
                        </p>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}