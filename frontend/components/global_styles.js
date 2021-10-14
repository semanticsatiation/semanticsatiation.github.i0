import { createGlobalStyle } from "styled-components";

// using transition: all 0.50s linear to make sure the color transitions
// are smooth; currently used in html and app-header
export const GlobalStyles = createGlobalStyle`
    html {
        background: ${({ theme }) => theme.backgroundColor};
        transition: all 0.50s linear;
        color: ${({ theme }) => theme.fontColor};
    }

    .border-pointer-right-outer {
        border-left: 10px solid ${({ theme }) => theme.borderColor};
    }

    .border-pointer-right-inner {
        border-left: 10px solid ${({ theme }) => theme.headerBackgroundColor};
    }

    .border-pointer-left-outer {
        border-right: 10px solid ${({ theme }) => theme.borderColor};
    }

    .border-pointer-left-inner {
        border-right: 10px solid ${({ theme }) => theme.headerBackgroundColor};
    }

    hr {
        background: ${({ theme }) => theme.borderColor};
    }

    .text-link:hover {
        color: ${({ theme }) => theme.inputFocusColor};
    }

    .form-container,
    .bugs-table-head th,
    .password-visibility-icon,
    .projects-drop-down,
    .drop-down-list-item > a,
    .drop-down-list-item > button,
    .project-option-item,
    .selected:hover,
    .setting-icon,
    .home-page-container {
        color: ${({ theme }) => theme.fontColor};
    }

    .input-field {
        background: ${({ theme }) => theme.inputBackgroundColor};
        color: ${({ theme }) => theme.fontColor};
    }

    .input-field: focus {
        box-shadow: 0 0 5px 1px ${({ theme }) => theme.inputFocusColor};
    }

    .form-submit-button {
        border: 2px solid ${({ theme }) => theme.validSubmitButtonBackgroundColor};
        background: ${({ theme }) => theme.validSubmitButtonBackgroundColor};
        color: ${({ theme }) => theme.submitButtonFontColor};
    }

    .form-submit-button:hover {
        box-shadow: 0 0 5px 1px ${({ theme }) => theme.submitButtonHoverColor};
    }

    .form-submit-button:active {
        background: ${({ theme }) => theme.pressedSubmitButtonColor};
        box-shadow: 0 0 5px 1px ${({ theme }) => theme.submitButtonHoverColor};
    }

    .error-list-item {
        color: ${({ theme }) => theme.fieldErrorColor};
    }

    .field-error-emphasization {
        border: 3px solid ${({ theme }) => theme.fieldErrorColor};
    }

    .submit-error-emphasization {
        background: ${({ theme }) => theme.invalidSubmitButtonBackgroundColor};
    }

    .submit-error-emphasization:hover {
        box-shadow: none;
    }

    .password-visibility-icon:hover,
    .search-user-options > li:hover {
        color: ${({ theme }) => theme.hoverColor};
    }

    .close-form {
        .foreground-form {
            border: 1px solid ${({ theme }) => theme.borderColor};
            background: ${({ theme }) => theme.backgroundColor};
            color: ${({ theme }) => theme.fontColor};
        }
    }

    .app-header {
        transition: all 0.50s linear;
        background: ${({ theme }) => theme.headerBackgroundColor};
        border-bottom: 1px solid ${({ theme }) => theme.borderColor};
    }

    .text-hover,
    .theme-drop-down,
    .notification-list > li {
        border: 1px solid ${({ theme }) => theme.borderColor};
        background: ${({ theme }) => theme.headerBackgroundColor};
    }

    .filter-container, 
    .project-activities-list-item-month > div {
        border: 1px solid ${({ theme }) => theme.borderColor};
        background: ${({ theme }) => theme.dropDownBackgroundColor};
    }

    .project-activities-list-item-years {
        border: 3px solid ${({ theme }) => theme.borderColor};
        background: ${({ theme }) => theme.dropDownBackgroundColor};
    }

    .project-activities-list-item-month,
    .project-activities-list-item-activity {
        background: ${({ theme }) => theme.backgroundColor};
    }

    // this is needed since border-width doesd not work unless it is here
    .option-header .bugger-search-container {
        border-width: 0 1px 1px 1px;
    }

    .bugger-search-container {
        border: 1px solid ${({ theme }) => theme.borderColor};
        border-width: 1px 1px 0 1px;
        background: ${({ theme }) => theme.dropDownBackgroundColor};

        .input-field {
            background: ${({ theme }) => theme.backgroundColor};
        }
    }

    .project-option-item:hover:after {
        border-bottom: 3px solid ${({ theme }) => theme.bottomBorderColor};
    }

    .project-option-list {
        .active:after {
            border-bottom: 3px solid ${({ theme }) => theme.bottomBorderColor};
        }
    }

    .drop-down-nav-container,
    .projects-drop-down-list {
        background: ${({ theme }) => theme.dropDownBackgroundColor};
        border-left: 1px solid ${({ theme }) => theme.borderColor};
        border-bottom: 1px solid ${({ theme }) => theme.borderColor};
        border-right: 1px solid ${({ theme }) => theme.borderColor};
    }

    .projects-section,
    .bug-children-comments-list {
        border-left: 1px solid ${({ theme }) => theme.borderColor};
    }

    .projects-drop-down-list > li > footer {
        border-top: 1px solid ${({ theme }) => theme.borderColor};
    }

    .projects-drop-down-list > li > div > h1,
    .bugs-table-body td {
        border-bottom: 1px solid ${({ theme }) => theme.borderColor};
    }

    .drop-down-list-item > a:hover,
    .drop-down-list-item > button:hover,
    .organization-list-item:hover,
    .project-list-item:hover,
    .projects-drop-down:hover,
    .theme-drop-down-item:hover,
    .bugger-search-container .buggers-list-item:hover,
    .bug-photo-button:hover,
    .project-activities-list button:hover,
    .pagination-list li:hover {
        background: ${({ theme }) => theme.hoverColor};
    }

    .selected  {
        color: ${({ theme }) => theme.selectedFontColor};
        background: ${({ theme }) => theme.selectedBackgroundColor};
    }

    .user-profile-item {
        background: ${({ theme }) => theme.headerBackgroundColor};
        color: ${({ theme }) => theme.fontColor};
    }

    .project-people-list-item:hover,
    .user-profile-item:hover {
        box-shadow: 0 0 2px 1px ${({ theme }) => theme.inputFocusColor};
    }

    .delete-button {
        background: ${({ theme }) => theme.headerBackgroundColor};
        color: ${({ theme }) => theme.fontColor};
    }

    .delete-button:hover {
        box-shadow: 0 0 2px 1px ${({ theme }) => theme.deleteButtonBackgroundColor};
    }

    .delete-button:active {
        background: ${({ theme }) => theme.deleteButtonBackgroundColor};
    }

    [class*= 'user-avatar'] {
        background: ${({ theme }) => theme.fontColor};
    }

    .user-avatar-small-container:hover,
    .edit-photo-link:hover,
    .project-list > li:hover,
    .recent-projects-item:hover {
        box-shadow: 0 0 2px 3px ${({ theme }) => theme.avatarHoverColor};
    }

    .user-avatar-small-container:active {
        box-shadow: 0 0 10px 5px ${({ theme }) => theme.avatarHoverColor};
    }

    .overdue  {
        color: ${({ theme }) => theme.deleteButtonBackgroundColor};
    }

    .project-list > li,
    .project-people-list-item,
    .recent-projects-item,
    .bugs-table-head th,
    .bugs-table-body .bugs-table-row:nth-child(even),
    .bug-photo-button {
        background: ${({ theme }) => theme.headerBackgroundColor};
    }

    .bug-photo-button,
    .project-activities-list-item-month {
        border: 1px solid ${({ theme }) => theme.borderColor};
    }

    .project-list > li:first-of-type {
        .foreground-form {
            background: ${({ theme }) => theme.headerBackgroundColor};
        }

        .input-field {
            background: ${({ theme }) => theme.backgroundColor};
        }
    }

    .search-user-options {
        color: ${({ theme }) => theme.searchColor};
    }

    .selected-search-option {
        color: ${({ theme }) => theme.selectedSearchColor};
    }

    @media all and (min-width: 526px) {
        .bugs-table-head th,
        .bugs-table-body td {
            border: 1px solid ${({ theme }) => theme.borderColor};
        }
    }`