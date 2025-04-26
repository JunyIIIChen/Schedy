import React, {useState, useEffect} from 'react';
import {Calendar, momentLocalizer} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {Modal, Button, Form, Input, Spin} from 'antd';
import {Link, useNavigate} from 'react-router-dom';
import ai_icon from "../Component/Assets/AI.png";

const localizer = momentLocalizer(moment);

const EventCalendar = () => {
        const [events, setEvents] = useState([]);
        const [loading, setLoading] = useState(false);
        const [visible, setVisible] = useState(false);
        const [selectedEvent, setSelectedEvent] = useState(null);
        const [form] = Form.useForm();
        const [userData, setUserData] = useState(null);
        const [error, setError] = useState('')


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
                    setEvents(
                        data.events.map(event => ({
                            id: event.id,
                            start: new Date(event.start), // 确保 event.start 是合法时间字符串或时间戳
                            end: new Date(event.end),     // 同上
                            employee: event.employee,
                            email: event.email,

                        }))
                    );
                    // console.log("User data:", data);

                } catch (err) {
                    setError("Something went wrong");
                    console.error("Fetch error:", err);
                }
            };

            load_user_information();

        }, []);

        const handleSelectEvent = (event) => {
            setSelectedEvent(event);
            form.setFieldsValue({
                employee: event.employee,
                email: event.email,
                start: moment(event.start).format('YYYY-MM-DDTHH:mm'),
                end: moment(event.end).format('YYYY-MM-DDTHH:mm')
            });
            setVisible(true);
        };

        const handleSubmit = () => {
            form.validateFields().then(values => {
                const newEvent = {
                    id: selectedEvent ? selectedEvent.id : Date.now(),
                    start: new Date(values.start),
                    end: new Date(values.end),
                    employee: values.employee,
                    email: values.email,
                    title: `${values.employee} (${values.email})`
                };

                if (selectedEvent) {
                    setEvents(events.map(e => e.id === selectedEvent.id ? newEvent : e));
                } else {
                    setEvents([...events, newEvent]);
                }
                setVisible(false);
            });
        };

        const eventStyleGetter = (event, start, end, isSelected) => {
            const backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Random color
            return {
                style: {
                    backgroundColor,
                    borderRadius: '4px',
                    opacity: 0.8,
                    color: 'white',
                    border: '0px',
                    display: 'block'
                }
            };
        };

        const saveToSQL = async (index) => {

            const eventsWithISOString = events.map(event => ({
                    ...event,
                    "start": new Intl.DateTimeFormat('sv-SE', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    }).format(event.start).replace(' ', 'T'),
                    "end": new Intl.DateTimeFormat('sv-SE', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    }).format(event.end).replace(' ', 'T'),
                    "id": event.id,
                    "employee": event.employee,
                    "email": event.email
                }))
            ;

            userData.events = eventsWithISOString;
            // console.log(userData.events);

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

        const new_schedule = async (index) => {
            setLoading(true);
            try {
                const res = await fetch('http://localhost:5001/api/view-calendar', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({schedule_id: "8c8580f7-856e-4343-9025-3ba7946224fc"}),
                });
                const data = await res.json();
                console.log(data)
                // Extract the events array from the response
                // The data structure shows events are in data.answer[0] to data.answer[13]
                // and then duplicated in data.answer[14], so we'll take the first set
                // const eventsData = Array.isArray(data.answer[0]) ? data.answer[0] : data.answer.slice(0, 14);

                // Transform the backend data to match the calendar's expected format
                const formattedEvents = data.calendar_json.map(event => ({
                    id: event.id,
                    start: new Date(event['start']),
                    end: new Date(event['end']),
                    employee: event['employee'],
                    email: event.email,
                }));

                setEvents(formattedEvents);
                // console.log(formattedEvents)
                setLoading(false);
            } catch (error) {
                console.error('Error fetching events:', error);
                setLoading(false);
            }
        }

        if (loading) {
            return (
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                    <Spin size="large"/>
                </div>
            );
        }

        return (
            <div style={{height: '700px', padding: '50px 180px'}}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    onSelectEvent={handleSelectEvent}
                    selectable
                    onSelectSlot={(slotInfo) => {
                        setSelectedEvent(null);
                        form.resetFields();
                        form.setFieldsValue({
                            start: slotInfo.start,
                            end: slotInfo.end,
                        });
                        setVisible(true);
                    }}
                    eventPropGetter={eventStyleGetter}
                    defaultView="week"
                    defaultDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                    components={{
                        event: ({event}) => (
                            <div>
                                <strong>{event.employee}</strong>
                                <div>{event.email}</div>
                            </div>
                        )
                    }}
                />

                <Modal
                    title={selectedEvent ? "Edit Event" : "Add New Schedule"}
                    visible={visible}
                    onOk={handleSubmit}
                    onCancel={() => setVisible(false)}
                    okText="Save"
                    cancelText="Cancel"
                >
                    <Form form={form} layout="vertical">
                        <Form.Item name="employee" label="Employee Name" rules={[{required: true}]}>
                            <Input/>
                        </Form.Item>
                        <Form.Item name="email" label="Email" rules={[{type: 'email', required: true}]}>
                            <Input/>
                        </Form.Item>
                        <Form.Item name="start" label="Start Time" rules={[{required: true}]}>
                            <Input type="datetime-local"/>
                        </Form.Item>
                        <Form.Item name="end" label="End Time" rules={[{required: true}]}>
                            <Input type="datetime-local"/>
                        </Form.Item>
                    </Form>
                </Modal>

                {/*<button*/}
                {/*    type="primary"*/}
                {/*    className="save-btn"*/}
                {/*    style={{marginTop: '20px'}}*/}
                {/*    onClick={() => {*/}
                {/*        setSelectedEvent(null);*/}
                {/*        form.resetFields();*/}
                {/*        setVisible(true);*/}
                {/*    }}*/}
                {/*>*/}
                {/*    Add New Schedule*/}
                {/*</button>*/}

                {/*<button onClick={new_schedule} className="save-btn">*/}
                {/*    Genrate New Schedule*/}
                {/*</button>*/}
                <div style={{padding: "20px", gap: "20px", display: "flex", justifyContent: "flex-end"}}>
                    <Link to="/homepage" style={{textDecoration: 'none',}}>
                        <div className="calendar-btn">
                            <img src={ai_icon} alt="" className="ai_icon"/>
                            <span>Talk with AI</span>

                        </div>
                    </Link>

                    <button onClick={saveToSQL} className="gradient-button">
                        Save
                    </button>

                </div>

            </div>
        );
    }
;

export default EventCalendar;