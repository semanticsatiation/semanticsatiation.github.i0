import React from "react";

export default class ThemeDropDown extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;

        this.updateTheme = this.updateTheme.bind(this);
    }

    updateTheme(event, theme) {
        event.preventDefault();

        const formData = {
            url: `/users/${this.props.currentUserId}`,
            signal: this.mySignal,
            body: { user: { theme: theme, id: this.props.currentUserId } },
        }

        this.props.updateUser(formData);
    }

    render() {
        const themes = ["Default", "Creamy", "Dark", "Blueberry", "FireFly", "Halloween"].map((theme, ind) => (
            <li 
                key={ind}
                className={theme === this.props.theme ? ("selected theme-drop-down-item") : ("theme-drop-down-item")} 
                onClick={(event) => this.updateTheme(event, theme)}
            >{theme}</li>
        ));

        return (
            <ul className={`theme-drop-down ${this.props.hideThemeMenu ? ("hidden") : ("")}`}>{
                themes
            }</ul>
        )
    }
}
