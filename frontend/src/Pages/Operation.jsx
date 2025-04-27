import React, {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";
import "./CSS/Operation.css";

export const Operation = () => {
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null);
    const [rows, setRows] = useState([]);

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
                setUserData(data);

                if (data.workerConfig) {
                    // ✅ 如果已有workerConfig，反向转换成rows
                    const initialRows = Object.entries(data.workerConfig).map(([day, config]) => ({
                        day: day.charAt(0).toUpperCase() + day.slice(1), // monday -> Monday
                        startTime: config.start,
                        endTime: config.end,
                        workers: config.workers,
                        dayOff: config.dayOff
                    }));
                    setRows(initialRows);
                } else {
                    // 默认一周7天
                    setRows([
                        {day: 'Monday', startTime: '09:00', endTime: '17:00', workers: 1, dayOff: false},
                        {day: 'Tuesday', startTime: '09:00', endTime: '17:00', workers: 1, dayOff: false},
                        {day: 'Wednesday', startTime: '09:00', endTime: '17:00', workers: 1, dayOff: false},
                        {day: 'Thursday', startTime: '09:00', endTime: '17:00', workers: 1, dayOff: false},
                        {day: 'Friday', startTime: '09:00', endTime: '17:00', workers: 1, dayOff: false},
                        {day: 'Saturday', startTime: '09:00', endTime: '17:00', workers: 1, dayOff: false},
                        {day: 'Sunday', startTime: '09:00', endTime: '17:00', workers: 1, dayOff: false}
                    ]);
                }

            } catch (err) {
                setError("Something went wrong");
                console.error("Fetch error:", err);
            }
        };

        load_user_information();
    }, []);

    // ✅ 转换 rows -> workerConfig
    const convertRowsToWorkerConfig = (rows) => {
        const config = {};
        rows.forEach(row => {
            const day = row.day.toLowerCase(); // Monday -> monday
            config[day] = {
                start: row.startTime,
                end: row.endTime,
                workers: row.workers,
                dayOff: row.dayOff
            };
        });
        return config;
    };

    const handleInputChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = field === 'dayOff' ? !updatedRows[index][field] : value;
        setRows(updatedRows);
    };

    const addNewRow = () => {
        setRows([...rows, {day: '', startTime: '09:00', endTime: '17:00', workers: 1, dayOff: false}]);
    };

    const copyRow = (index) => {
        const rowToCopy = rows[index];
        setRows([...rows, {...rowToCopy}]);
    };

    const deleteRow = (index) => {
        if (rows.length > 1) {
            const updatedRows = rows.filter((_, i) => i !== index);
            setRows(updatedRows);
        }
    };

    // ✅ 保存到数据库，存workerConfig字段
    const saveToSQL = async () => {
        try {
            const token = localStorage.getItem("auth-token");
            if (!token) {
                setError("No token found. Please login first.");
                return;
            }

            const newWorkerConfig = convertRowsToWorkerConfig(rows);

            const response = await fetch("http://localhost:5001/api/update_user", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    updates: {
                        _id: {"$oid": userData._id.$oid},
                        workerConfig: newWorkerConfig
                    },
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Update successful:", result);
            alert("Shift schedule saved successfully!");

        } catch (err) {
            console.error("Failed to save data:", err);
            setError("Failed to save data. Please try again.");
        }
    };

    // ✅ 生成时间下拉
    const generateTimeOptions = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                options.push(<option key={timeString} value={timeString}>{timeString}</option>);
            }
        }
        return options;
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

            <div>
                <div className="schedule-container">
                    <h3>Shift Schedule</h3>
                    <div className="schedule-table">
                        <div className="table-header">
                            <span>Day</span>
                            <span>Start</span>
                            <span>End</span>
                            <span>Workers</span>
                            <span>Day Off</span>
                            {/*<span>Actions</span>*/}
                        </div>

                        {rows.map((row, index) => (
                            <div className="table-row" key={index}>
      <span className="day-name">
        <select
            value={row.day}
            onChange={(e) => handleInputChange(index, 'day', e.target.value)}
            className="day-select"
        >
          <option value="Monday">Mon</option>
          <option value="Tuesday">Tue</option>
          <option value="Wednesday">Wed</option>
          <option value="Thursday">Thu</option>
          <option value="Friday">Fri</option>
          <option value="Saturday">Sat</option>
          <option value="Sunday">Sun</option>
        </select>
      </span>

                                <input
                                    type="time"
                                    value={row.startTime}
                                    onChange={(e) => handleInputChange(index, 'startTime', e.target.value)}
                                    className="time-input"
                                />

                                <input
                                    type="time"
                                    value={row.endTime}
                                    onChange={(e) => handleInputChange(index, 'endTime', e.target.value)}
                                    className="time-input"
                                />

                                <input
                                    type="number"
                                    min="1"
                                    value={row.workers}
                                    onChange={(e) => handleInputChange(index, 'workers', parseInt(e.target.value))}
                                    className="workers-input"
                                />

                                <input
                                    type="checkbox"
                                    checked={row.dayOff}
                                    onChange={() => handleInputChange(index, 'dayOff')}
                                    className="day-off-checkbox"
                                />

                                {/*<div className="action-buttons">*/}
                                {/*    <button onClick={() => copyRow(index)} className="copy-btn">*/}
                                {/*        Copy*/}
                                {/*    </button>*/}
                                {/*    <button onClick={() => deleteRow(index)} className="delete-btn">*/}
                                {/*        Delete*/}
                                {/*    </button>*/}
                                {/*</div>*/}
                            </div>
                        ))}
                    </div>

                            {/* <button onClick={addNewRow} className="add-row-btn">
                                Add New Schedule
                            </button>` */}
                </div>
            </div>
        </div>
    );
};

export default Operation;
