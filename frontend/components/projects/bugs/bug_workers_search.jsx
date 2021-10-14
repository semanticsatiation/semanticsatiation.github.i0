import React, { useEffect, useRef, useState } from "react";

// util
import { stackedFetch, endLastStackedFetch } from "../../../util/bug_util";

// components
import Bugger from "./bugger"; 
import PageFiller from "../../shared/page_filler";
import Loading from "../../shared/loading";

function BugWorkersSearch(props) {
    const [workers, setWorkers] = useState({
        byId: {},
        allIds: []
    });

    const [filterName, setFilterName] = useState("");

    const [fetchingStatus, setFetchingStatus] = useState({
        isFetching: false,
        fetchingFailed: false
    });

    const searchBuggerContainerRef = useRef();

    useEffect(() => {
        return () => {
            endLastStackedFetch();

            if (searchBuggerContainerRef.current) {
                document.removeEventListener("click", listenForOffClick);
            }
        }
    }, [])

    useEffect(() => {
        if (searchBuggerContainerRef.current) {
            document.addEventListener("click", listenForOffClick, { once: true });
        }
    }, [searchBuggerContainerRef.current])

    useEffect(() => {
        if (searchBuggerContainerRef.current) {
            fetchBuggers();
        }
    }, [filterName])

    const listenForOffClick = (event) => {
        if (searchBuggerContainerRef.current && !searchBuggerContainerRef.current.contains(event.target)) {
            props.setShowBuggerSearchForm(false);
        } else {
            document.addEventListener("click", listenForOffClick, { once: true });
        }
    }

    const fetchBuggers = () => {
        setFetchingStatus({
            isFetching: true,
            fetchingFailed: false
        });
    
        stackedFetch({
            url: `/projects/${props.projectId}/project_contributers?[filter][string]=${encodeURIComponent(filterName.trim())}&filter_for_buggers=${props.buggerAllIds.join(" ")}`
        }).then(
            (workers) => {
                setFetchingStatus({
                    isFetching: false,
                    fetchingFailed: false
                });

                setWorkers({
                    byId: workers.byId,
                    allIds: workers.allIds
                });
            },
            (error) => {
                if (!error.aborted || error.timedOut) {
                    setFetchingStatus({
                        isFetching: false,
                        fetchingFailed: true
                    });
                }
            }
        )
    }

    const addWorker = (worker) => {
        if (searchBuggerContainerRef.current) {
            if (props.addable) {
                props.addWorkerToBug(worker);
            } else {
                props.addWorkerToFilter(workers.byId[worker.id]);
            }
            
            const dupById = Object.assign({}, workers.byId);

            delete dupById[worker.id];

            setWorkers({
                byId: dupById,
                allIds: workers.allIds.filter((id) => id != worker.id)
            });
        }
    }

    return (
        <div className="bugger-search-container" ref={searchBuggerContainerRef}>
            <header className="bugger-search-header">
                <input className="input-field" type="text" name="bugger" id="bugger" value={filterName} autoFocus onChange={e => setFilterName(e.target.value)} placeholder="search user"/>
            </header>

            {
                fetchingStatus.isFetching ? (
                    null
                ) : (
                    fetchingStatus.fetchingFailed ? (null) : (
                        `${workers.allIds.length} results`
                    )
                )
            }

            {/* SERIOUS: CLICKING ON TEH LAST USER OF THE WORKERS SEARCH ALWAYS CLOSES THIS COMPONENT
            WHYYYYYY!? */}

            {/* 
                I was going to render this button based on if fetchingFailed 
                fetchingStatus.fetchingFailed ? (RIGHT HERE) : ()
                but instead I needed to make it hidden until fetchingFailed because I need the 
                button to be always existent for listenForOfClick to detect, which rendering fails to do
             */}
            <button className={`${fetchingStatus.fetchingFailed ? (""): ("hidden")}`} type="button" onClick={fetchBuggers}>
                <PageFiller string="Try Again" icon="sync" />
            </button>

            {
                fetchingStatus.isFetching ? (
                    <Loading size="small-spinner" />
                ) : (
                    fetchingStatus.fetchingFailed ? (
                        null
                    ) : (
                        workers.allIds.length > 0 ? (
                            <ul className="buggers-list">{
                                workers.allIds.map((workerId) => (
                                    <li className="buggers-list-item" onClick={e => addWorker(workers.byId[workerId])} key={workerId}>
                                        <button type="button">
                                            <Bugger bugContributer={workers.byId[workerId]} displayUsername={true} />
                                        </button>
                                    </li>
                                ))
                            }</ul>
                        ) : (
                            <PageFiller string="No one was found!" icon="users-slash" />
                        )
                    )
                )
                
            }
        </div>
    )
}

export default BugWorkersSearch;