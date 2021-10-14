import React from "react";

// helpers
import { capitalize } from "../../util/helper_functions";

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// components
import ErrorListItem from "./error_list_item";

function RadioButtons({radios, handleChange, getCurrentValue, errors}) {
    return(
        <div className="radio-container">{
            Object.keys(radios).map((parentName, ind) => (
                <div key={ind}>
                    <label htmlFor={parentName}>
                        {capitalize(parentName)}
                        <ErrorListItem errors={errors[ind]} />
                        {
                            radios[parentName].hasOwnProperty("information") ? (
                                <button type="button">
                                    <FontAwesomeIcon className="information-button" icon="question-circle" />
                                    <span className="text-hover">{radios[parentName].information}</span>
                                </button>
                            ) : (null)
                        }
                    </label>
                    <div className="radio-options">{
                        radios[parentName].options.map((option, ind) => (
                            <div className="radio-option" key={ind}>
                                <input type="radio" name={parentName} id={option} onChange={(e) => handleChange(e, true)} value={option} checked={option === getCurrentValue(parentName)}/>
                                <label htmlFor={option}>{option}</label>
                            </div>
                        ))
                    }</div>
                </div>
            ))
        }</div>
    )
}

export default RadioButtons;