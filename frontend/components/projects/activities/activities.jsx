import React, { useEffect, useState, useRef} from "react";

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// components
import PageFiller from "../../shared/page_filler";
import ExtraFetchLoad from "../../shared/extra_fetch_load";
import RefetchButton from "../../shared/refetch_button";
import Loading from "../../shared/loading";
import ReactPaginate from 'react-paginate';

// util
import { endAllRequests } from "../../../util/shared_util";

let extraYearsBeingFetched = false;
let allItemsFetched = false;

let yearsPage = 1;

let currentHideMonthsYears = {};

function Activities(props) {
    const [hideMonthsYears, setHideMonthsYears] = useState({});
    const [currentPage, setCurrentPage] = useState({ page: 0, month: "", year: "" });
    const activitiesListRef = useRef();

    extraYearsBeingFetched = props.extraYearsBeingFetched;
    allItemsFetched = props.totalSessionYears >= props.totalYears;
    currentHideMonthsYears = hideMonthsYears;


    useEffect(() => {
        fetchYears();

        // unmount only
        return () => {
            endAllRequests();

            if (activitiesListRef.current) {
                removeScroll();
            }
        }
    }, [])

    const addScroll = () => {
        activitiesListRef.current.addEventListener("scroll", handleScroll);
    }

    const removeScroll = () => {
        activitiesListRef.current.removeEventListener("scroll", handleScroll);
    }

    const handleScroll = () => {
        if (!extraYearsBeingFetched) {
            const pageOffset = activitiesListRef.current.scrollTop + activitiesListRef.current.clientHeight;
            if (pageOffset >= activitiesListRef.current.scrollHeight) {
                fetchExtraYears();
            }
        }
    }

    const fetchYears = () => (
        props.fetchYears({
            url: `/projects/${props.currentProjectId}/activities?project_activity`,
        }).then(
            (hideMonthsYears) => {
                setHideMonthsYears(hideMonthsYears);

                if (activitiesListRef.current) {
                    yearsPage = 1;

                    if (!allItemsFetched) {
                        addScroll();
                    }
                }
            },
            (errors) => errors
        )
    )

    const fetchExtraYears = () => {
        props.fetchExtraYears({
            url: `/projects/${props.currentProjectId}/activities/?off_set=${yearsPage}&project_activity`
        }).then(
            (extraHideMonthsYears) => {
                setHideMonthsYears({
                    ...currentHideMonthsYears,
                    ...extraHideMonthsYears,
                });

                if (activitiesListRef.current) {
                    yearsPage += 1;

                    if (allItemsFetched) {
                        removeScroll();
                    }
                }
            },
            (errors) => errors
        )
    }

    const toggleYear = (year) => {
        setHideMonthsYears({
            ...currentHideMonthsYears,
            [year]: {...currentHideMonthsYears[year], isHidden: !currentHideMonthsYears[year].isHidden}
        });
    }

    const toggleMonth = (year, month) => {
        setHideMonthsYears({
            ...currentHideMonthsYears,
            [year]: { ...currentHideMonthsYears[year], [month]: { ...currentHideMonthsYears[year][month], isHidden: !hideMonthsYears[year][month].isHidden} }
        });
    }

    const fetchNewPage = ({selected}, year, month) => {
        if (selected === undefined) {
            selected = currentPage.page;
        } else {
            setCurrentPage({ page: selected, month: month, year: year });
        }

        props.fetchMonthPage({
            url: `/projects/${props.currentProjectId}/activities/?month_off_set[page]=${selected}&month_off_set[year]=${year}&month_off_set[month]=${month}&project_activity`,
            monthName: month,
            year: year
        });
    }

    return (
        <div className="activities-container">{
            props.activitiesFetchFailed ? (
                <RefetchButton refetchAction={fetchYears} />
            ) : (
                props.yearsBeingFetched ? (
                    <Loading size="large-spinner" />
                ) : (
                    Object.keys(hideMonthsYears).length > 0 ? (
                        <>
                            <ul className="project-activities-list" ref={activitiesListRef}>{
                                props.allIds.map((year) => {
                                    const yearObject = props.byId[year];
                                    const yearHiddenObject = hideMonthsYears[year];
                                    const isYearHidden = yearHiddenObject != undefined ? (yearHiddenObject.isHidden) : (false);
                                    
                                    return (
                                        <li className="project-activities-list-item-years" key={year}>
                                            <button onClick={() => toggleYear(year)}>
                                                {year}
                                                <FontAwesomeIcon className={`circle-down-icon ${isYearHidden ? ("") : ("hidden")}`} icon="arrow-circle-down" />
                                            </button>
                                            <ul className={`project-activities-list-item-months ${isYearHidden ? ("hidden") : ("")}`} >{
                                                yearObject.allIds.map((monthName) => {
                                                    const monthObject = yearObject[monthName];
                                                    const isMonthHidden = monthObject != undefined && yearHiddenObject != undefined ? (yearHiddenObject[monthName].isHidden) : (false);

                                                    return (
                                                        <li className="project-activities-list-item-month" key={year + monthName}>
                                                            <div>
                                                                <button onClick={() => toggleMonth(year, monthName)}>
                                                                    {monthName}
                                                                    <FontAwesomeIcon className={`circle-down-icon ${isMonthHidden ? ("") : ("hidden")}`} icon="arrow-circle-down" />
                                                                </button>

                                                                {
                                                                    props.monthBeingFetched && currentPage.month === monthName && currentPage.year === year && !isMonthHidden ? (
                                                                        <Loading size="large-spinner" />
                                                                    ) : (
                                                                        props.monthFetchFailed && currentPage.month === monthName && currentPage.year === year ? (
                                                                            <RefetchButton refetchAction={() => fetchNewPage({ currentPage }, year, monthName)} />
                                                                        ) : (
                                                                            <ul className={`project-activities-list-item-activities ${isMonthHidden ? ("hidden") : ("")}`}>
                                                                                {
                                                                                    monthObject.allIds.map((activityId) => {
                                                                                        const activity = monthObject[activityId].activity;
                                                                                        return (
                                                                                            <li className="project-activities-list-item-activity" key={activityId}>{
                                                                                                activity.length > 125 ? (
                                                                                                    `${activity.substring(0, 125).trim()}...`
                                                                                                ) : (activity)
                                                                                            }</li>
                                                                                        )
                                                                                    })
                                                                                }
                                                                            </ul>
                                                                        )
                                                                    )
                                                                }
                                                                <ReactPaginate
                                                                    containerClassName={`pagination-list ${monthObject.totalActivities <= 8 || monthObject.allIds.length >= monthObject.totalActivities || isMonthHidden ? ("hidden") : ("")}`}
                                                                    pageCount={monthObject.totalActivities / 8}
                                                                    pageRangeDisplayed={3}
                                                                    marginPagesDisplayed={2}
                                                                    previousLabel={<FontAwesomeIcon icon="arrow-left" />}
                                                                    nextLabel={<FontAwesomeIcon icon="arrow-right" />}
                                                                    onPageChange={(page) => fetchNewPage(page, year, monthName)}
                                                                />
                                                            </div>
                                                        </li>
                                                    )
                                                })
                                            }</ul>
                                        </li>
                                    )
                                })
                            }</ul>
                        </>
                    ) : (
                        <PageFiller string="No activity has been recorded!" icon="history" />
                    )
                )
            )}
            <ExtraFetchLoad
                onFetchFailProperties={{ isFail: props.extraActivitiesFetchFailed, failedAction: () => fetchExtraYears() }}
                isLoad={props.extraYearsBeingFetched}
            />
        </div>
    )
}

export default Activities;