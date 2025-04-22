import React, {useState, useEffect} from 'react';
import {Calendar, momentLocalizer} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {Modal, Button, Form, Input, Spin} from 'antd';

const localizer = momentLocalizer(moment);

const EventCalendar = () => {
        const [events, setEvents] = useState([]);
        const [loading, setLoading] = useState(true);
        const [visible, setVisible] = useState(false);
        const [selectedEvent, setSelectedEvent] = useState(null);
        const [form] = Form.useForm();
        const [userData, setUserData] = useState(null);
        const [error, setError] = useState('');

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
                setEvents(data.events);


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
                name: event.name,
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
                    name: values.name,
                    email: values.email,
                    title: `${values.name} (${values.email})`
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
            userData.events = events;
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

        const new_schedule = async (index) => {
            try {
                const response = await fetch('http://localhost:5001/ask');
                const data = await response.json();

                // Extract the events array from the response
                // The data structure shows events are in data.answer[0] to data.answer[13]
                // and then duplicated in data.answer[14], so we'll take the first set
                const eventsData = Array.isArray(data.answer[0]) ? data.answer[0] : data.answer.slice(0, 14);

                // Transform the backend data to match the calendar's expected format
                const formattedEvents = eventsData.map(event => ({
                    id: event.ID,
                    start: new Date(event['Start Time']),
                    end: new Date(event['End Time']),
                    name: event['Employee Name'],
                    email: event.Email,
                    title: `${event['Employee Name']} (${event.Email})` // Added title for better display
                }));

                setEvents(formattedEvents);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching events:', error);
                setLoading(false);
            }
        }

        // if (loading) {
        //     return (
        //         <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
        //             <Spin size="large"/>
        //         </div>
        //     );
        // }

        return (
            <div style={{height: '700px', padding: '20px'}}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    onSelectEvent={handleSelectEvent}
                    selectable
                    eventPropGetter={eventStyleGetter}
                    defaultView="week"
                    components={{
                        event: ({event}) => (
                            <div>
                                <strong>{event.name}</strong>
                                <div>{event.email}</div>
                            </div>
                        )
                    }}
                />

                <Modal
                    title={selectedEvent ? "Edit Event" : "Add New Event"}
                    visible={visible}
                    onOk={handleSubmit}
                    onCancel={() => setVisible(false)}
                    okText="Save"
                    cancelText="Cancel"
                >
                    <Form form={form} layout="vertical">
                        <Form.Item name="name" label="Employee Name" rules={[{required: true}]}>
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

                <Button
                    type="primary"
                    style={{marginTop: '20px'}}
                    onClick={() => {
                        setSelectedEvent(null);
                        form.resetFields();
                        setVisible(true);
                    }}
                >
                    Add New Schedule
                </Button>

                <button onClick={new_schedule} className="save-btn">
                    Genrate New Schedule
                </button>

                <button onClick={saveToSQL} className="save-btn">
                    Save
                </button>
            </div>
        );
    }
;

export default EventCalendar;