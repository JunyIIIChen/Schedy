import React, {useEffect, useState} from "react";
import {Link, NavLink} from "react-router-dom";
import "./CSS/Settings.css";

export const Settings = () => {
    const [link, setLink] = useState('');
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const load_user_information = async () => {
            const token = localStorage.getItem("auth-token");

            if (!token) {
                setError("No token found. Please login first.");
                return;
            }

            try {
                const res = await fetch("http://localhost:5001/api/basic", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                // console.log("User data:", data);
                setUserData(data);

            } catch (err) {
                setError("Something went wrong");
                console.error("Fetch error:", err);
            }
        };

        load_user_information();

    }, []);


    const saveToSQL = async (index) => {
        console.log(userData)

        try {
            const token = localStorage.getItem("auth-token");
            if (!token) {
                setError("No token found. Please login first.");
                return;
            }

            const response = await fetch("http://localhost:5001/api/update_user", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    updates: userData, // Send the entire userData or specific fields
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Update successful:", result);
            alert("Data saved successfully!");

        } catch (err) {
            console.error("Failed to save data:", err);
            setError("Failed to save data. Please try again.");
        }
    };

    return (
        <div className={'settingsbasic'}>
            <div className="navbar-settings">
                <div className="nav-links">
                    <NavLink
                        to="/settings"
                        className={({isActive}) =>
                            isActive ? 'quicklink active' : 'quicklink'
                        }
                    >
                        Basic Information
                    </NavLink>

                    <NavLink
                        to="/operation"
                        className={({isActive}) =>
                            isActive ? 'quicklink active' : 'quicklink'
                        }
                    >
                        Operation Information
                    </NavLink>
                </div>

                <button onClick={saveToSQL} className="save-btn">
                    Save
                </button>
            </div>
            <div className={'inputform'}>
                <div className={'inputform-first'}>
                    <div className={'inputform-first-left'}>
                        <h3>Full name</h3>
                        <input
                            type="text"
                            placeholder="John Smith"
                            value={userData?.name || ""} // If userData.name exists, use it; otherwise, empty string
                            onChange={(e) => setUserData({
                                ...userData,
                                name: e.target.value
                            })} // Optional: Allow editing
                        />
                    </div>
                    <div className={'inputform-first-right'}>
                        <h3>Industry</h3>
                        <input
                            type="text"
                            placeholder="Retail"
                            value={userData?.industry || ""} // If userData.name exists, use it; otherwise, empty string
                            onChange={(e) => setUserData({
                                ...userData,
                                industry: e.target.value
                            })} // Optional: Allow editing
                        />
                    </div>
                </div>
                <div className={'inputform-first'}>
                    <div className={'inputform-first-left'}>
                        <h3>Email</h3>
                        <input
                            type="text"
                            placeholder="John Smith"
                            value={userData?.email || ""} // If userData.name exists, use it; otherwise, empty string
                            onChange={(e) => setUserData({
                                ...userData,
                                email: e.target.value
                            })} // Optional: Allow editing
                        />
                    </div>
                    <div className={'inputform-first-right'}>
                        <h3>Phone (Optional)</h3>
                        <input
                            type="text"
                            placeholder="04xxxxxxxx"
                            value={userData?.phone || ""} // If userData.name exists, use it; otherwise, empty string
                            onChange={(e) => setUserData({
                                ...userData,
                                phone: e.target.value
                            })} // Optional: Allow editing
                        />
                    </div>
                </div>
                <div className={'inputform-first'}>
                    <div className={'inputform-first-left'}>
                        <h3>Country</h3>
                        <input
                            type="text"
                            placeholder="Australia"
                            value={userData?.country || ""} // If userData.name exists, use it; otherwise, empty string
                            onChange={(e) => setUserData({
                                ...userData,
                                country: e.target.value
                            })} // Optional: Allow editing
                        />
                    </div>
                    <div className={'inputform-first-right'}>
                        <h3>State</h3>
                        <input
                            type="text"
                            placeholder="VIC"
                            value={userData?.state || ""} // If userData.name exists, use it; otherwise, empty string
                            onChange={(e) => setUserData({
                                ...userData,
                                state: e.target.value
                            })} // Optional: Allow editing
                        />
                    </div>
                    <div className={'inputform-first-right'}>
                        <h3>City</h3>
                        <input
                            type="text"
                            placeholder="Melbourne"
                            value={userData?.city || ""} // If userData.name exists, use it; otherwise, empty string
                            onChange={(e) => setUserData({
                                ...userData,
                                city: e.target.value
                            })} // Optional: Allow editing
                        />
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Settings;