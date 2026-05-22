import { useState } from 'react'
import { toast } from 'react-toastify'

function Login({ setToken, darkMode }) {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLogin, setIsLogin] = useState(false)
    const [identifier, setIdentifier] = useState("")

    const handleLogin = async () => {
        if (!identifier || !password) {
            toast.error("Please fill all the fields")
            return;
        }
        const res = await fetch("http://localhost:3000/auth/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                identifier,
                password
            })
        })
        const data = await res.json()
        // console.log("Login response: ",data)
        if(!res.ok){
            toast.error(data.message)
            return
        }
        setToken(data.token)
        localStorage.setItem("token", data.token)
        toast.success("Login successful")
    }

    const handleRegister = async () => {
        if (!username || !email || !password) {
            toast.error("Please fill all the fields")
            return
        }
        const res = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        })
        const data = await res.json()
        console.log(data)
        if (!res.ok) {
            toast.error(data.message)
            return
        }
        setIsLogin(true)
        setUsername("")
        setEmail("")
        setPassword("")
        toast.success("Registration successful")
    }

    return (
        <div
            className={
                darkMode
                    ? "min-h-screen flex items-center justify-center bg-gray-900 transition"
                    : "min-h-screen flex items-center justify-center bg-gray-100 transition"
            }
        >
            <div
                className={
                    darkMode
                        ? "bg-gray-800 text-white p-6 rounded-lg shadow-md w-full max-w-sm border border-gray-700"
                        : "bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
                }
            >
                <h1
                    className={
                        darkMode
                            ? "text-2xl font-bold text-center mb-4 text-white"
                            : "text-2xl font-bold text-center mb-4"
                    }
                >
                    {isLogin ? "Login" : "Register"}
                </h1>

                {!isLogin && (
                    <input
                        type='text'
                        placeholder='Username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={
                            darkMode
                                ? "w-full bg-gray-700 text-white border border-gray-600 p-2 rounded mb-3 placeholder-gray-300"
                                : "w-full border p-2 rounded mb-3"
                        }
                    />
                )}

                <input
                    type="text"
                    placeholder={isLogin ? "Email or username" : "Email"}
                    value={isLogin ? identifier : email}
                    onChange={(e) => isLogin ? setIdentifier(e.target.value) : setEmail(e.target.value)}
                    className={
                        darkMode
                            ? "w-full bg-gray-700 text-white border border-gray-600 p-2 rounded mb-3 placeholder-gray-300"
                            : "w-full border p-2 rounded mb-3"
                    }
                />

                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={
                        darkMode
                            ? "w-full bg-gray-700 text-white border border-gray-600 p-2 rounded mb-3 placeholder-gray-300"
                            : "w-full border p-2 rounded mb-3"
                    }
                />

                <button
                    onClick={isLogin ? handleLogin : handleRegister}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                >
                    {isLogin ? "Login" : "Register"}
                </button>

                <p
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-center text-blue-500 mt-4 cursor-pointer hover:underline"
                >
                    {isLogin
                        ? "Don't have an account? Register"
                        : "Already have an account? Login"}
                </p>

            </div>
        </div>
    )
}

export default Login

