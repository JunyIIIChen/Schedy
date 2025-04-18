import React, {useState} from "react";
import {Link, NavLink} from "react-router-dom";
import "./CSS/Settings.css";

export const Settings = () => {


        const saveToSQL = (index) => {

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
                        <input type="text" placeholder="John Smith"/>
                    </div>
                    <div className={'inputform-first-right'}>
                        <h3>Industry</h3>
                        <input type="text" placeholder="Retail"/>
                    </div>
                </div>
                <div className={'inputform-first'}>
                    <div className={'inputform-first-left'}>
                        <h3>Email</h3>
                        <input type="text" placeholder="John.Smith@gmail.com"/>
                    </div>
                    <div className={'inputform-first-right'}>
                        <h3>Phone (Optional)</h3>
                        <input type="text" placeholder="04xxxxxxxx"/>
                    </div>
                </div>
                <div className={'inputform-first'}>
                    <div className={'inputform-first-left'}>
                        <h3>Country</h3>
                        <input type="text" placeholder="Austrlia"/>
                    </div>
                    <div className={'inputform-first-right'}>
                        <h3>State</h3>
                        <input type="text" placeholder="VIC"/>
                    </div>
                    <div className={'inputform-first-right'}>
                        <h3>City</h3>
                        <input type="text" placeholder="Melbourne"/>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Settings;