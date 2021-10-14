import React from "react";

function SearchInput(params) {
    return (
        <div className="search-project-container">
            <input
                className="input-field"
                type="text"
                name="search-project"
                id="search-project"
                placeholder="search for a project"
                value={this.state.name}
                onChange={this.searchProjects}
            />

            <button className="exit-icon-button" type="button">
                <FontAwesomeIcon className="exit-icon" icon="times-circle" onClick={this.clearSearchField} />
            </button>
        </div>
    )
}