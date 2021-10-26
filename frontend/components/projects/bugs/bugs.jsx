import React, { useState, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { useDebounce } from 'use-debounce';

// helpers
import { capitalize } from '../../../util/helper_functions';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// util
import { endAllRequests } from '../../../util/shared_util';

// components
import BugFormContainer from "./bug_form_container";
import PageFiller from "../../shared/page_filler";
import Loading from '../../shared/loading';
import ExtraFetchLoad from "../../shared/extra_fetch_load";
import BugWorkersSearch from './bug_workers_search';
import Bugger from './bugger';
import RefetchButton from '../../shared/refetch_button';

// shared variables
import { allStatuses } from '../../shared/variables';

// this helps the functions keep track of the following variables
// while they change in real time
let extraBugsBeingFetched = false;
let allItemsFetched = false;
let newState = {
    searchColumn: "ids",
    showForm: false,
    showFilter: false,
    filter: "",
    sortBy: "opened",
    bugPage: 1
};

let currentState = {};

// i was trying to figure out why the
// props.extraBugsBeingFetched and props.totalSessionBugs >= props.totalBugs
// weren't updating in my functions
// this is how i figured out what was happening
// From stack overflow: 
//      In order to listen the changes in your state from inside the useEffect callback 
//      (when you're not following any props update), you can save your state in a 
//      variable outside your component's scope, and using it instead of the state directly.
// This is not needed in render since rednering changes on each prop/state change

function Bugs(props) {
    const defaultSortState = {
        "title": 0,
        "priority": 0,
        "severity": 0,
        "opened": 0,
        "closed": 0,
    };

    const [state, setState] = useState({...newState});

    extraBugsBeingFetched = props.extraBugsBeingFetched;
    allItemsFetched = props.totalSessionBugs >= props.totalBugs;
    currentState = state;

    const [searchBybuggers, setSearchByBuggers] = useState({
        byId: {},
        allIds: []
    });

    const [sortState, setSortState] = useState(Object.assign({}, defaultSortState));
    
    const [showBuggerSearchForm, setShowBuggerSearchForm] = useState(false);
    
    const [filterValue] = useDebounce(currentState.filter, 350);

    const tableRef = useRef();

    const filterContainerRef = useRef();

    useEffect(() => {
        // unmount only
        return () => {
            endAllRequests();
            if (tableRef.current) {
                removeScroll();
            }

            if (filterContainerRef.current) {
                document.removeEventListener("click", listenForOffClick);
            }
        }
    }, [])

    useEffect(() => {
        fetchBugs();
    }, [sortState, filterValue, searchBybuggers])

    useEffect(() => {
        if ((!state.showForm) && (tableRef.current && !allItemsFetched)) {
            addScroll();
        }
    }, [state.showForm])

    useEffect(() => {
        if (filterContainerRef.current && currentState.showFilter) {
            document.addEventListener("click", listenForOffClick, { once: true });
        }
    }, [currentState.showFilter])

    useEffect(() => {
        // make sure filters don't leak into each other's search results
        if (searchBybuggers.allIds.length > 0) {  
            setSearchByBuggers({
                byId: {},
                allIds: []
            });
        } else {
            if (currentState.filter.trim() != "") {
                setState({
                    ...currentState,
                    filter: ""
                })
            }
        }
    }, [currentState.searchColumn])

    const listenForOffClick = (event) => {
        const currentElement = event.target;
        const isClickInside = filterContainerRef.current && filterContainerRef.current.contains(currentElement);

        if (!isClickInside) {
            setState({
                ...currentState,
                showFilter: false
            })
        } else {
            document.addEventListener("click", listenForOffClick, { once: true });
        }
    }

    const clearSearchField = () => {
        if (currentState.filter != "") {
            setState({
                ...currentState,
                filter: ""
            });
        }
    }

    const addScroll = () => {
        tableRef.current.addEventListener("scroll", handleScroll);
    }

    const removeScroll = () => {
        tableRef.current.removeEventListener("scroll", handleScroll);
    }

    const handleScroll = () => {
        if (!extraBugsBeingFetched) {
            const pageOffset = tableRef.current.scrollTop + tableRef.current.clientHeight;
            if (pageOffset >= tableRef.current.scrollHeight) {
                fetchExtraBugs();
            }
        }
    }

    const fetchBugs = () => (
        props.filterBugs({
            url: `/projects/${props.currentProjectId}/bugs?[filter][filter_by]=${currentState.searchColumn}&[filter][string]=${encodeURIComponent(currentState.filter.trim())}&[sort][sort_by]=${currentState.sortBy}&[sort][sort_value]=${sortState[currentState.sortBy]}&[filter][by_people]=${searchBybuggers.allIds.join(" ")}`,
        }).then(
            () => {
                if (tableRef.current) {
                    setState({
                        ...currentState, 
                        bugPage: 1
                    });
    
                    if (!allItemsFetched) {
                        addScroll();
                    }
                }
            },
            (errors) => errors
        )
    )

    const fetchExtraBugs = () => (
        props.fetchExtraBugs({
            url: `/projects/${props.currentProjectId}/bugs/?off_set=${currentState.bugPage}&[filter][filter_by]=${currentState.searchColumn}&[filter][string]=${encodeURIComponent(currentState.filter.trim())}&[sort][sort_by]=${currentState.sortBy}&[sort][sort_value]=${sortState[currentState.sortBy]}&[filter][by_people]=${searchBybuggers.allIds.join(" ")}`
        }).then(
            () => {
                if (tableRef.current) {
                    setState({
                        ...currentState,
                        bugPage: currentState.bugPage + 1 
                    });
    
                    if (allItemsFetched) {
                        removeScroll();
                    }
                }
            },
            (errors) => errors
        )
    )

    const handleSort = (event, name, skipIncrementCycle = false) => {
        let newValue = skipIncrementCycle ? (+event.target.value) : (sortState[name]);
        // +event.target.value the plus is syntatic sugar for keeping event.target.value as an integer; pretty cool

        if (!skipIncrementCycle) {
            if (newValue < 0 || newValue >= 2) {
                newValue = 0;
            } else {
                newValue += 1;
            }
        }

        setSortState({
            ...defaultSortState,
            [name]: newValue
        });

        setState({
            ...currentState,
            sortBy: newValue === 0 ? ("opened") : (name)
        });
    }

    const handleChange = (event) => {
        if (!(props.bugsBeingFetched || props.extraBugsBeingFetched)) {
            const target = event.target;

            setState({
                ...currentState,
                [target.name]: target.value
            });  
        }
    }

    const toggleFilter = (event) => {
        setState({
            ...currentState, 
            showFilter: !currentState.showFilter
        });
    }

    const addWorkerToFilter = (worker) => {
        const dupBuggers = Object.assign({}, searchBybuggers);
        
        dupBuggers.byId[worker.id] = worker;
        dupBuggers.allIds.push(worker.id);

        setSearchByBuggers(dupBuggers);
    }

    const removeWorkerFromFilter = (workerId) => {
        const dupBuggers = Object.assign({}, searchBybuggers);

        delete dupBuggers.byId[workerId];

        dupBuggers.allIds = dupBuggers.allIds.filter((id) => id != workerId);

        setSearchByBuggers(dupBuggers);
    }

    return (
        <div className="bugs-table-container">{
            state.showForm ? (<BugFormContainer closeForm={() => setState({...state, showForm: false})}/>) : (
                <>
                    <header className="option-header">
                        <div className="search-bugs-container">
                            <select className="input-field" id="search-column" name="searchColumn" value={state.searchColumn}  onChange={handleChange}>{
                                ["ids", "title", "buggers", "status"].map((option, ind) => (
                                    <option value={option} key={ind}>{option}</option>
                                ))
                            }</select>
                            {
                                currentState.searchColumn === "buggers" ? (
                                    <div className="buggers-container">
                                        <ul className="buggers-list input-field">
                                            {
                                                showBuggerSearchForm ? (
                                                    <BugWorkersSearch
                                                        projectId={props.currentProjectId}
                                                        addWorkerToFilter={addWorkerToFilter}
                                                        setShowBuggerSearchForm={setShowBuggerSearchForm}
                                                        buggerAllIds={searchBybuggers.allIds}
                                                    />
                                                ) : (null)
                                            }
                                            <li className="buggers-list-item" onClick={e => setShowBuggerSearchForm(!showBuggerSearchForm)}>
                                                <button type="button">
                                                    <FontAwesomeIcon className="add-bugger-icon" icon="plus-circle" />
                                                </button>
                                            </li>
                                            {
                                                searchBybuggers.allIds.map((buggerId) => {
                                                    const bugger = searchBybuggers.byId[buggerId];

                                                    return (
                                                        <li className="buggers-list-item" onClick={e => removeWorkerFromFilter(buggerId)} title={bugger.username} key={buggerId}>
                                                            <button className="exit-icon-button" type="button">
                                                                <FontAwesomeIcon className="exit-icon" icon="times-circle" />
                                                            </button>
                                                            <Bugger bugContributer={bugger} />
                                                        </li>
                                                    )
                                                })
                                            }
                                        </ul>
                                    </div>
                                ) : (
                                    currentState.searchColumn === "status" ? (
                                        <select className="status-select input-field" id="search-bugs" name="filter" value={state.filter} onChange={handleChange}>{
                                            allStatuses.map((option, ind) => (
                                                <option value={option} key={ind}>{option}</option>
                                            ))
                                        }</select>
                                    ) : (
                                        <>
                                            <input className="input-field" type="text" id="search-bugs" name="filter" value={state.filter} placeholder={`search by ${state.searchColumn}`} onChange={handleChange} />
                                            <button className="exit-icon-button" type="button">
                                                <FontAwesomeIcon className="exit-icon" icon="times-circle" onClick={clearSearchField} />
                                            </button>
                                        </>
                                    )
                                )
                            }
                        </div >
                        <button className="form-submit-button" type="button" onClick={() => setState({ ...state, showForm: true })}>
                            <div>
                                <FontAwesomeIcon icon="bug" />
                            </div>

                            <FontAwesomeIcon icon="plus" />
                        </button>

                        {
                            props.bugsBeingFetched ? (null) : (
                                <button className="filter-button" type="button" onClick={toggleFilter}>
                                    <FontAwesomeIcon className="filter-icon" icon="filter" />
                                </button>
                            )
                        }

                        {
                            state.showFilter ? (
                                <div className="filter-container" ref={filterContainerRef}>
                                    {
                                        ["title", "priority", "severity", "opened", "closed"].map((option, ind) => (
                                            <ul key={ind}>
                                                <label htmlFor={option}>{capitalize(option)}</label>
                                                {["default", "ascending", "descending"].map((value, indTwo) => (
                                                    <li key={indTwo}>
                                                        {/* 
                                                            the reason for value + ind is because the id and names must be unique for all checkbox inputs.
                                                            we cant have multiple "default" checkboxes with the same id or things mess up even if they
                                                            belong to different parents ("title", "priority", etc...)
                                                        */}
                                                        <input type="checkbox" id={value + ind} name={value + ind} value={indTwo} onChange={e => handleSort(e, option, true)} checked={indTwo === sortState[option]}/>
                                                        <label htmlFor={value + ind}>{value}</label>
                                                    </li>
                                                ))}
                                            </ul>
                                        ))
                                    }

                                    <div className="border-pointer-right-outer">
                                        <div className="border-pointer-right-inner"></div>
                                    </div>
                                </div>
                            ) : (null)
                        }
                    </header>

                    {
                        props.bugsFetchFailed ? (
                            <RefetchButton refetchAction={fetchBugs} />
                        ) : (
                            props.bugsBeingFetched ? (
                                <Loading size="large-spinner" />
                            ) : (
                                props.bugsAllIds.length > 0 ? (
                                    <div className="scrollable-table" ref={tableRef}>
                                        <table className="bugs-table">
                                            <thead className="bugs-table-head">
                                                <tr className="bugs-table-row">{
                                                    ["ID", "title", "Status", "priority", "severity", "opened", "closed"].map((option, ind) => {
                                                        if (![0, 2].includes(ind)) {
                                                            return (
                                                                <th onClick={e => handleSort(e, option)} key={ind}>
                                                                    {capitalize(option)}
                                                                    <div className="table-sort-arrows">{
                                                                        <FontAwesomeIcon className={`sort-arrows ${sortState[option] === 0 ? ("shrink-default-arrow") : ("")}`} icon={["grip-lines", "sort-up", "sort-down"][sortState[option]]} />
                                                                    }</div>
                                                                </th>
                                                            )
                                                        } else {
                                                            return (
                                                                <th key={ind}>{option}</th>
                                                            );
                                                        }
                                                    })
                                                }</tr>
                                            </thead>
                                            <tbody className="bugs-table-body">{
                                                props.bugsAllIds.map((bugId) => {
                                                    const bug = props.getBug(bugId);

                                                    return (
                                                        <tr className="bugs-table-row" key={bugId} onClick={e => props.history.push(`/projects/${props.currentProjectId}/bugs/${bugId}`)}>
                                                            <td className={`${bug.isOverdue ? ("overdue") : ("")}`}>{bug.id}</td>
                                                            <td>
                                                                <div>
                                                                    {bug.title}
                                                                </div>
                                                            </td>
                                                            <td>{bug.status}</td>
                                                            <td>{bug.priority}</td>
                                                            <td>{bug.severity}</td>
                                                            <td>{bug.created_at}</td>
                                                            <td>{bug.close_date}</td>
                                                        </tr>
                                                    );
                                                })
                                            }</tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <PageFiller string="No bugs were found!" icon="file-excel" />
                                )
                            )
                        )
                    }

                    <ExtraFetchLoad 
                        onFetchFailProperties={{isFail: props.extraBugsFetchFailed, failedAction: fetchExtraBugs}} 
                        isLoad={props.extraBugsBeingFetched} 
                    />
                </>
            )
        }</div>
    )
}

export default withRouter(Bugs);