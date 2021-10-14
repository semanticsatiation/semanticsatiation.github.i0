import React from "react";

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


function SortByOptions({onClickAction, isByJoin, sortBy}) {
    return(
        <ul className="sort-by-list">{
            [
                ["calendar-alt", `by ${isByJoin ? ("joined") : ("created")} (ASC)`, "created"],
                ["sort-alpha-down", "by name (A-Z)", "name"],
                ["sort-alpha-down-alt", "by name (Z-A)", "name alt"]
            ].map((option, ind) => {
                const isSelected = sortBy === option[2];

                return (
                    <li key={ind} className={isSelected ? ("selected-sort-option") : (null)} onClick={isSelected ? (null) : (() => onClickAction(option[2]))}>
                        <button><FontAwesomeIcon icon={option[0]} /></button>
                        <span>{option[1]}</span>
                    </li>
                )
            })
        }</ul>
    )
}

export default SortByOptions;