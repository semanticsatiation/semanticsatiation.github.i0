import React from "react";
import { withRouter } from "react-router-dom";

// components
import ProjectOptions from "./project_options";

class ProjectHeaderNav extends React.Component {
    constructor(props) {
        super(props)
        this.props = props;
    }

    componentDidMount() {
        if (this.props.inlineHeaderParentRef) {
            // lower than 460px, hide inline show lower, apply new heights to some containers (project-option-container)
            const outputsize = () => {
                const width = this.props.inlineHeaderParentRef.offsetWidth;

                if (width >= 460) {
                    // prevent constant changes to the state
                    // only apply the change once
                    if (this.props.hideInlineHeaderState) {
                        this.props.showInlineHeader();
                    }
                } else {
                    if (!this.props.hideInlineHeaderState) {
                        this.props.hideInlineHeader();
                    }
                }
            }

            this.resizeObserver = new ResizeObserver(outputsize);
            this.resizeObserver.observe(this.props.inlineHeaderParentRef);
        }

    }

    componentWillUnmount() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    render() {
        return (
            <ProjectOptions className={this.props.className} hideInlineHeaderState={this.props.hideInlineHeaderState} />
        )
    }
}

export default withRouter(ProjectHeaderNav);