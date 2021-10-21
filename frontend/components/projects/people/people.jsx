import React, { useState, useRef, useEffect } from "react";
import { useDebounce } from 'use-debounce';


// util
import { endLastStackedFetch, stackedFetch } from "../../../util/bug_util";

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// components
import PageFiller from "../../shared/page_filler";
import Loading from "../../shared/loading";
import SortByOptions from "../../shared/sort_by_options";
import ExtraFetchLoad from "../../shared/extra_fetch_load";
import RefetchButton from "../../shared/refetch_button";
import Bugger from "../bugs/bugger";
import { endAllRequests } from "../../../util/shared_util";

let extraPeopleBeingFetched = false;
let allPeopleItemsFetched = false;

let newState = {
    fieldType: "username",
    showDeleteOptions: [false, null],
    name: "",
    sortBy: "created",
    peoplePage: 1,
    username: "",
    userCurrentlyInviting: undefined,
    potentialWorkers: {
        byId: {},
        allIds: [],
        totalPotentialWorkers: 0,
    },
    potentialWorkersPage: 1,
    fetchingPotentialWorkers: false,
    fetchingFailed: false,
    isUserSearchExposed: false,
    fetchingExtraPotentialWorkers: false,
    fetchingExtraPotentialWorkersFailed: false
};

let currentState = {};

function People(props) {
    const [peopleState, setPeopleState] = useState({...newState});

    const searchPotentialWorkersRef = useRef();
    const peopleListRef = useRef();


    extraPeopleBeingFetched = props.extraPeopleBeingFetched;
    allPeopleItemsFetched = props.totalSessionPeople >= props.totalPeople;
    currentState = peopleState;

    
    const [nameValue] = useDebounce(currentState.name, 650);
    const [usernameValue] = useDebounce(currentState.username, 650);

    useEffect(() => {
        return () => {
            endAllRequests();

            if (peopleListRef.current) {
                removePeopleScroll();
            }
        }
    }, [])

    useEffect(() => {
        fetchPeople();
    }, [nameValue, currentState.sortBy])

    useEffect(() => {
        if (currentState.isUserSearchExposed) {
            fetchPotentialWorkers();
        }
    }, [currentState.isUserSearchExposed])

    useEffect(() => {
        if (currentState.isUserSearchExposed) {
            fetchPotentialWorkers(true);
        }
    }, [usernameValue])

    const fetchPotentialWorkers = (resetUser = false) => {
        setPeopleState({
            ...currentState,
            fetchingPotentialWorkers: true,
            userCurrentlyInviting: resetUser ? (undefined) : (currentState.userCurrentlyInviting),
            fetchingFailed: false
        });

        stackedFetch({
            url: `/users?[filter][string]=${encodeURIComponent(currentState.username.trim())}&project_id=${props.currentProjectId}`
        }).then(
            (successfulPotential) => {
                setPeopleState({
                    ...currentState,
                    potentialWorkers: successfulPotential,
                    potentialWorkersPage: 1,
                    fetchingPotentialWorkers: false
                });

                if (searchPotentialWorkersRef.current && !allPotentialWorkersItemsFetched()) {
                    addPotentialWorkersScroll();
                }
            },
            (errors) => {
                if (!errors.aborted || errors.timedOut) {
                    setPeopleState({
                        ...currentState,
                        fetchingFailed: true,
                        fetchingPotentialWorkers: false
                    })
                }
            }
        );
    }

    const fetchExtraPotentialWorkers = () => {
        setPeopleState({
            ...currentState,
            fetchingExtraPotentialWorkers: true
        });

        stackedFetch({
            url: `/users?off_set=${currentState.potentialWorkersPage}&[filter][string]=${encodeURIComponent(currentState.username.trim())}&project_id=${props.currentProjectId}`
        }).then(
            (successfulPotential) => {
                if (searchPotentialWorkersRef.current) {
                    setPeopleState({
                        ...currentState,
                        potentialWorkers: {
                            byId: {
                                ...currentState.potentialWorkers.byId,
                                ...successfulPotential.byId
                            },
                            allIds: [...currentState.potentialWorkers.allIds, ...successfulPotential.allIds],
                            totalPotentialWorkers: currentState.potentialWorkers.totalPotentialWorkers

                        },
                        potentialWorkersPage: currentState.potentialWorkersPage + 1
                    });

                    if (allPotentialWorkersItemsFetched()) {
                        removePotentialWorkersScroll();
                    }
                }
            },
            (errors) => {
                setPeopleState({
                    ...currentState,
                    fetchingExtraPotentialWorkersFailed: true,
                });
            }
        ).finally(
            () => {
                setPeopleState({
                    ...currentState,
                    fetchingExtraPotentialWorkers: false
                });
            }
        )
    }

    const addPotentialWorkersScroll = () => {
        searchPotentialWorkersRef.current.addEventListener("scroll", handlePotentialWorkersScroll);
    }

    const removePotentialWorkersScroll = () => {
        searchPotentialWorkersRef.current.removeEventListener("scroll", handlePotentialWorkersScroll);
    }


    const allPotentialWorkersItemsFetched = () => {
        return currentState.potentialWorkers.allIds.length >= currentState.potentialWorkers.totalPotentialWorkers;
    }

    const handlePotentialWorkersScroll = () => {
        if (!currentState.fetchingExtraPotentialWorkers) {
            const pageOffset = searchPotentialWorkersRef.current.scrollTop + searchPotentialWorkersRef.current.clientHeight;

            if (pageOffset >= searchPotentialWorkersRef.current.scrollHeight) {
                fetchExtraPotentialWorkers();
            }
        }
    }

    const showDeleteOptions = (userId) => {
        setPeopleState({
            ...currentState,
            showDeleteOptions: [true, userId]
        });
    }

    const hideDeleteOptions = () => {
        setPeopleState({
            ...currentState,
            showDeleteOptions: [false, null]
        });
    }

    const removeUser = (projectContributerId) => {
        hideDeleteOptions();

        props.removeProjectContributer({
            url: `/projects/${props.currentProjectId}/project_contributers/${projectContributerId}`,
        }).then(
            () => {
                if (!allPeopleItemsFetched) {
                    fetchExtraPeople(true);
                }
            }
        );
    }

    const searchPeople = (event) => {
        setPeopleState({
            ...currentState,
            name: event.target.value
        });
    }

    const handlePeopleScroll = () => {
        if (!extraPeopleBeingFetched) {
            const pageOffset = peopleListRef.current.scrollTop + peopleListRef.current.clientHeight;

            if (pageOffset >= peopleListRef.current.scrollHeight) {
                fetchExtraPeople();
            }
        }
    }

    const addPeopleScroll = () => {
        peopleListRef.current.addEventListener("scroll", handlePeopleScroll);
    }

    const removePeopleScroll = () => {
        peopleListRef.current.removeEventListener("scroll", handlePeopleScroll);
    }

    const fetchPeople = (options = {}) => {
        if (!options.hasOwnProperty("filter")) {
            options.filter = currentState.name;
        }

        if (!options.hasOwnProperty("sortBy")) {
            options.sortBy = currentState.sortBy;
        }

        return props.filterUsers({
            url: `/projects/${props.currentProjectId}/project_contributers?[filter][filter_by]=${currentState.fieldType}&[filter][string]=${encodeURIComponent(options.filter.trim())}&[sort][sort_by]=${options.sortBy}`,
        }).then(
            () => {
                setPeopleState({
                    ...currentState,
                    showDeleteOptions: [false, null],
                    peoplePage: 1
                });

                if (peopleListRef.current && !allPeopleItemsFetched) {
                    addPeopleScroll();
                }
            },
            (errors) => errors
        );
    }

    const fetchExtraPeople = (recalibrate = false) => {
        return props.fetchExtraPeople({
            url: `/projects/${props.currentProjectId}/project_contributers?off_set=${recalibrate ? (currentState.peoplePage - 1) : (currentState.peoplePage)}&[filter][filter_by]=${currentState.fieldType}&[filter][string]=${encodeURIComponent(currentState.name.trim())}&[sort][sort_by]=${currentState.sortBy}&${recalibrate ? ("recalibrate") : ("")}`,
            recalibrate: recalibrate
        }).then(
            () => {
                if (!recalibrate) {
                    setPeopleState({
                        ...currentState,
                        peoplePage: currentState.peoplePage + 1
                    });

                    if (allPeopleItemsFetched) {
                        removePeopleScroll();
                    }
                }
            },
            (errors) => errors
        );
    }

    const changeFieldType = (newField) => {
        setPeopleState({
            ...currentState,
            fieldType: newField
        });
    }

    const clearSearchField = () => {
        if (currentState.name != "") {
            setPeopleState({
                ...currentState,
                name: ""
            });

            fetchPeople({ filter: "" });
        }
    }

    const determineWorkerInfo = (person) => {
        if (props.projectOwnerId === person.id) {
            return <h1>ADMIN</h1>;
        } else if (props.projectOwnerId != person.id && props.projectOwnerId === props.currentUserId) {
            return currentState.showDeleteOptions[1] === person.id ? (
                <div className="delete-user-options">
                    <button type="button" onClick={e => removeUser(person.projectContributerId)}>
                        <FontAwesomeIcon icon="trash-alt" />
                    </button>
                    <button type="button" onClick={hideDeleteOptions}>
                        <FontAwesomeIcon icon="times" />
                    </button>
                </div>
            ) : (
                    <button type="button" onClick={(e) => showDeleteOptions(person.id)}>
                        <FontAwesomeIcon icon="user-minus" />
                    </button>
                )
        }
    }

    const exposePotentialWorkersSearch = () => {
        setPeopleState({
            ...currentState,
            isUserSearchExposed: true,
        });
    }

    const closePotentialWorkersSearch = async () => {
        endLastStackedFetch();

        const timeout = () => new Promise(res => setTimeout(res, 100));
        await timeout();
        // I need to delay the closure of the PotentialWorkersSearch
        // so selectInvitee works properly; not a clean solution but it'll do for now

        setPeopleState({
            ...currentState,
            isUserSearchExposed: false,
        });
    }

    const selectInvitee = (worker) => {
        setPeopleState({ 
            ...peopleState, 
            userCurrentlyInviting: worker.id, 
            username: worker.username
        });
    }

    const inviteUser = (event) => {
        event.preventDefault();

        if (!props.isSubmitting && currentState.userCurrentlyInviting != undefined) {
            props.inviteUser({
                url: `/projects/${props.currentProjectId}/project_contributers?user_id=${currentState.userCurrentlyInviting}`
            }).finally(
                () => {
                    setPeopleState({
                        ...currentState,
                        username: "",
                        userCurrentlyInviting: undefined
                    });
                    if (!allPeopleItemsFetched) {
                        fetchExtraPeople(true);
                    }
                }
            )
        }
    }

    return (
        <div className="option-container people-container">
            <header className="option-header">
                <div className="search-user-container">
                    <ul className="search-user-options">
                        {
                            // [["username", "user"], ["email", "envelope"]] this is for when emails are implemented
                            [["username", "user"]].map((options, index) => {
                                let selected;

                                if (peopleState.fieldType === options[0]) {
                                    selected = "selected-search-option"
                                }

                                return (
                                    <li onClick={() => changeFieldType(options[0])} key={index}>
                                        <button type="button">
                                            <FontAwesomeIcon className={`username-search ${selected}`} icon={options[1]} />
                                        </button>
                                    </li>
                                )
                            })
                        }
                    </ul>

                    <input
                        className="input-field"
                        type="text"
                        name="search-person"
                        id="search-person"
                        placeholder={`search user by ${peopleState.fieldType}`}
                        value={peopleState.name}
                        onChange={searchPeople}
                    />

                    <button className="exit-icon-button" type="button">
                        <FontAwesomeIcon className="exit-icon" icon="times-circle" onClick={clearSearchField} />
                    </button>
                </div>

                {
                    props.projectOwnerId === props.currentUserId ? (
                        <div className="add-person-container">
                            <form onSubmit={inviteUser}>
                                <input
                                    className="input-field"
                                    type="text"
                                    name="add-person"
                                    id="add-person"
                                    placeholder="invite user by username"
                                    value={peopleState.username}
                                    onFocus={exposePotentialWorkersSearch}
                                    onBlur={closePotentialWorkersSearch}
                                    onChange={(event) => { setPeopleState({ ...peopleState, username: event.target.value }) }}
                                />
                                <button>
                                    <FontAwesomeIcon className="add-person" icon="user-plus" />
                                </button>
                            </form>

                            {
                                peopleState.isUserSearchExposed ? (
                                    <div className="bugger-search-container">
                                        {
                                            peopleState.fetchingPotentialWorkers ? (
                                                <Loading size="small-spinner" />
                                            ) : (
                                                peopleState.fetchingFailed ? (
                                                    <PageFiller string="Something went wrong!" icon="dizzy" />
                                                ) : (
                                                    peopleState.potentialWorkers.allIds.length > 0 ? (
                                                        <>
                                                            {
                                                                `${peopleState.potentialWorkers.totalPotentialWorkers} results`
                                                            }
                                                            <ul className="buggers-list" ref={searchPotentialWorkersRef}>{
                                                                peopleState.potentialWorkers.allIds.map((workerId) => {
                                                                    const worker = peopleState.potentialWorkers.byId[workerId];
                                                                    return (
                                                                        <li className="buggers-list-item" onClick={() => selectInvitee(worker)} key={workerId}>
                                                                            <button type="button">
                                                                                <Bugger bugContributer={worker} displayUsername={true} />
                                                                            </button>
                                                                        </li>
                                                                    )
                                                                })
                                                            }</ul>
                                                        </>
                                                    ) : (
                                                        <PageFiller string="No one was found!" icon="users-slash" />
                                                    )
                                                )
                                            )
                                        }
                                    </div>
                                ) : (null)
                            }
                        </div>
                    ) : (null)
                }
            </header>

            {
                props.peopleFetchFailed ? (
                    <RefetchButton refetchAction={fetchPeople} />
                ) : (
                        props.peopleBeingFetched ? (
                            <Loading size="large-spinner" />
                        ) : (
                            props.peopleAllIds.length > 0 ? (
                                <>
                                    <SortByOptions onClickAction={(sortBy) => fetchPeople({ sortBy: sortBy }).then(() => setPeopleState({ ...peopleState, sortBy: sortBy }))} sortBy={peopleState.sortBy} isByJoin={true} />
                                    <ul ref={peopleListRef} className="project-people-list">{
                                        props.peopleAllIds.map(id => {
                                            const person = props.getPerson(id);

                                            return (
                                                <li className="project-people-list-item" key={person.id}>
                                                    <div>
                                                        <div className="user-avatar-medium-container">
                                                            <img srcSet={person.photoURL} />
                                                        </div>
                                                        {determineWorkerInfo(person)}
                                                    </div>
                                                    <span>{person.username}</span>
                                                    {
                                                        person.pending === true ? (<h1>(pending invite)</h1>) : (<h1>(worker)</h1>)
                                                    }
                                                </li>
                                            )
                                        })
                                    }</ul>
                                </>
                            ) : (
                                <PageFiller string="No one was found!" icon="users-slash" />
                            )
                        )
                    )
            }

            <ExtraFetchLoad
                onFetchFailProperties={{ isFail: props.extraPeopleFetchFailed, failedAction: () => fetchExtraPeople() }}
                isLoad={props.extraPeopleBeingFetched}
            />
        </div>
    )
}

export default People;
