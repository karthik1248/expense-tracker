import { useState, useEffect } from "react";
import { toast } from "react-toastify";

function Profile({ setShowProfile, setUser, handleLogout, user, token, darkMode, toggleDarkMode, setShowLogoutModal }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");

            const res = await fetch("http://localhost:3000/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await res.json();

            setUsername(data.username);
            setEmail(data.email);
        };

        fetchUser();
    }, []);

    const handleUpdate = async () => {
        console.log("Update clicked")
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:3000/auth/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ username, email })
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.message);
            return;
        }

        setUser(data)
        toast.success("Profile updated!");
    };

    const handleFile = async (e) => {
        const file = e.target.files[0]
        const formData = new FormData()
        formData.append("profilePic", file)
        const res = await fetch("http://localhost:3000/auth/upload-profile-pic", {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        })
        const data = await res.json()
        if (!res.ok) {
            toast.error(data.message)
            return
        }
        setUser(prev => ({
            ...prev,
            profilePic: data.profilePic
        }))
        e.target.value=""
        toast.success("Profile picture uploaded")
    }

    const handleRemoveProfilePic = async () => {

        const res = await fetch("http://localhost:3000/auth/remove-profile-pic", {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json()
        console.log(data)
        setUser(prev => ({
            ...prev,
            profilePic: ""
        }))
        toast.success("Profile picture removed")
    }

    return (
        <div
            className={
                darkMode
                    ? "min-h-screen bg-gray-900 flex items-center justify-center p-4 transition"
                    : "min-h-screen bg-gray-100 flex items-center justify-center p-4 transition"
            }
        >

            <div
                className={
                    darkMode
                        ? "bg-gray-800 text-white w-full max-w-md p-6 rounded-xl shadow-lg border border-gray-700"
                        : "bg-white w-full max-w-md p-6 rounded-xl shadow-lg"
                }
            >

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Profile</h2>

                    <button
                        onClick={() => setShowProfile(false)}
                        className={
                            darkMode
                                ? "text-sm bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                                : "text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
                        }
                    >
                        ← Back
                    </button>
                </div>

                {/* {Big profile pic} */}
                <div className="flex justify-center mb-2">
                    {user.profilePic ? (
                        <img
                            src={`http://localhost:3000/${user.profilePic}`}
                            alt="profile"
                            className="w-24 h-24 rounded-full object-cover border-4 border-blue-400 shadow-md flex justify-center"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-blue-500 text-white flex items-center justify-center text-3xl font-bold border-4 border-blue-400 shadow-md">
                            {user.username?.charAt(0)?.toUpperCase()}
                        </div>
                    )}
                </div>

                {/* {Upload Button} */}

                <label className="flex justify-center mb-6 cursor-pointer">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                        Change Profile Picture
                    </div>
                    <input
                        type="file"
                        onChange={handleFile}
                        className="hidden"
                    />
                </label>

                <button
                    onClick={handleRemoveProfilePic}
                    className="bg-red-500 text-white px-2 py-2 rounded-lg hover:bg-red-600 transition text-sm mb-3 mx-auto block"
                >
                    Remove Profile Picture
                </button>

                {/* Inputs */}
                <div className="space-y-4">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className={
                            darkMode
                                ? "w-full bg-gray-700 text-white border border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
                                : "w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        }
                    />

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className={
                            darkMode
                                ? "w-full bg-gray-700 text-white border border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
                                : "w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        }
                    />
                </div>

                {/* Button */}
                <button
                    onClick={handleUpdate}
                    className="w-full mt-6 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                >
                    Update Profile
                </button>

                {/* Dark-Mode button */}
                <div className="flex justify-between items-center mt-6 mb-4">
                    <p
                        className={
                            darkMode
                                ? "font-medium text-gray-200"
                                : "font-medium text-gray-700"
                        }
                    >
                        Dark Mode
                    </p>
                    <button
                        onClick={toggleDarkMode}
                        className={
                            darkMode
                                ? "bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                                : "bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                        }
                    >
                        {darkMode ? "☀️" : "🌙"}
                    </button>
                </div>

                <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full mt-3 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                >
                    Logout
                </button>
            </div>
        </div>


    );
}

export default Profile;