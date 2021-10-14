import React, { useEffect, useState, useRef } from "react";
import { useDebounce } from 'use-debounce';
import { Redirect, withRouter } from "react-router-dom";


// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// helpers
import { anyEmptyFields, capitalize } from "../../../util/helper_functions";

// util
import { endAllRequests } from "../../../util/shared_util";

// components
import Loading from "../../shared/loading";
import BugFormContainer from "./bug_form_container";
import DeleteForm from "../../shared/delete_form";
import RefetchButton from "../../shared/refetch_button";
import PageFiller from "../../shared/page_filler";
import ReactPaginate from 'react-paginate';
import ExtraFetchLoad from "../../shared/extra_fetch_load";
import ErrorListItem from "../../shared/error_list_item";
import SubmitButtonContainer from "../../shared/submit_button_container";


let allCommentsFetched = false;
let extraCommentsBeingFetched = false;
let parentsCommentsPage = 1;



function Bug(props) {
    const [hideContent, setHideContent] = useState({});

    const [comment, setComment] = useState({
        comment: "",
        action: "create",
        type: "parent",
    });

    const [commentValue] = useDebounce(comment, 300);

    const [expandPhoto, setExpandPhoto] = useState(undefined);

    const [toggleBugForm, setToggleBugForm] = useState(false);

    const [showDeleteForm, setshowDeleteForm] = useState(false);

    const [currentActivityPage, setCurrentActivityPage] = useState(0);

    const [showCommentForm, setShowCommentForm] = useState({
        commentFormIsFor: undefined,
        isExposed: false
    });

    const [commentsLayerFetch, setCommentsLayersFetch] = useState({
        layer: 0,
        parentId: undefined
    });

    const [hideNestedComments, setHideNestedComments] = useState({});

    const [exposeCommentDeleteForm, setExposeCommentDeleteForm] = useState({ 
        isExposed: false, 
        isFor: undefined 
    });

    const commentsListRef = useRef();
    const nestedCommentsRef = useRef();

    allCommentsFetched = props.totalSessionBugComments >= props.totalBugComments;
    extraCommentsBeingFetched = props.extraCommentsBeingFetched;
    

    useEffect(() => {
        if (showDeleteForm) {
            props.clearFormErrors();
        }
    }, [showDeleteForm])

    useEffect(() => {
        const pathName = props.location.pathname.split("/");

        if (pathName.length != 5 || !pathName.includes("bugs")) {
            props.history.push({
                pathname: `/projects/${props.currentProjectId}/activity`,
            });
        }

        parentsCommentsPage = 1;

        if (commentsListRef.current) {
            addCommentsScroll();
        }

        return () => {
            endAllRequests();

            if (commentsListRef.current) {
                removeCommentsScroll();
            }

            props.removeCurrentBug();
        }
    }, [])

    useEffect(() => {
        if (!allCommentsFetched && commentsListRef.current) {
            addCommentsScroll();
        }
    }, [props.allBugCommentsIds])

    useEffect(() => {
        fetchBug();
    }, [props.bugId])

    useEffect(() => {
        if (!toggleBugForm) {
            fetchBug();
        }
    }, [toggleBugForm])

    useEffect(() => {
        if (comment.action === "update") {
            props.updateBugComment({
                url: `projects/${props.currentProjectId}/bugs/${props.bugId}/comments/${comment.currentCommentId}?validate`,
                body: determineBody(),
                isValidate: true
            })
        } else if (comment.action === "create") {
            props.createBugComment({
                url: `projects/${props.currentProjectId}/bugs/${props.bugId}/comments?validate`,
                body: determineBody(),
                isValidate: true
            })
        }
    }, [commentValue])

    useEffect(() => {
        if (comment.action != "update") {
            setComment({
                ...comment,
                comment: ""
            });   
        }
    }, [showCommentForm.commentFormIsFor])

    const logComment = (e) => {
        setComment({
            ...comment,
            comment: e.target.value,
        });
    }

    const submitComment = (e) => {
        e.preventDefault();

        if (comment.action === "update") {
            props.updateBugComment({
                url: `/projects/${props.currentProjectId}/bugs/${props.bugId}/comments/${comment.currentCommentId}`,
                commentType: comment.type,
                body: determineBody(),
            }).then(() => eraseComment());
        } else if (comment.action === "create") {
            props.createBugComment({
                url: `/projects/${props.currentProjectId}/bugs/${props.bugId}/comments`,
                commentType: comment.type,
                body: determineBody(),
            }).then(() => eraseComment());
        }
    }

    const determineBody = () => (
        {
            comment: comment.type === "reply" && comment.action === "create" ? (
                { comment: comment.comment, parent_id: comment.parentId, reply_comment_id: comment.replyCommentId }
            ) : (
                { comment: comment.comment }
            )
        }
    )

    const fetchBug = () => {
        setToggleBugForm(false);

        props.fetchBug({ url: `/projects/${props.currentProjectId}/bugs/${props.bugId}` });
    }

    const fetchNewActivityPage = ({ selected }) => {
        if (selected === undefined) {
            selected = currentActivityPage;
        } else {
            setCurrentActivityPage(selected);
        }

        props.fetchBugActivities({
            url: `/projects/${props.currentProjectId}/bugs/${props.bugId}/activities?off_set=${selected}&bug_activity`,
        });
    }

    const fetchExtraComments = (recalibrate = false) => {
        setCommentsLayersFetch({
            layer: 0,
            parentId: undefined
        });

        props.fetchExtraBugComments({
            url: `/projects/${props.currentProjectId}/bugs/${props.bugId}/comments/?off_set=${recalibrate ? (parentsCommentsPage - 1) : (parentsCommentsPage)}&${recalibrate ? ("recalibrate") : ("")}`,
            recalibrate: recalibrate
        }).then(
            () => {
                if (!recalibrate) {
                    parentsCommentsPage += 1;

                    if (commentsListRef.current && allCommentsFetched) {
                        removeCommentsScroll();
                    }
                }
            },
            (errors) => errors
        );
    }

    const fetchNestedComments = (parentId, replyCount, recalibrate = false) => {
        setCommentsLayersFetch({
            layer: 1,
            parentId: parentId
        });

        props.fetchNestedBugComments({
            url: `/projects/${props.currentProjectId}/bugs/${props.bugId}/comments?off_set=${recalibrate ? (replyCount - 1): (replyCount)}&replies=${parentId}`,
            parentId: parentId,
            recalibrate: recalibrate
        });
    }

    const addCommentsScroll = () => {
        commentsListRef.current.addEventListener("scroll", handleParentsScroll);
    }

    const removeCommentsScroll = () => {
        commentsListRef.current.removeEventListener("scroll", handleParentsScroll);
    }

    const handleParentsScroll = () => {
        if (!extraCommentsBeingFetched) {
            const pageOffset = commentsListRef.current.scrollTop + commentsListRef.current.clientHeight;
            if (pageOffset >= commentsListRef.current.scrollHeight) {
                fetchExtraComments();
            }
        }
    }

    const eraseComment = () => {
        setComment({
            comment: "",
            action: "create"
        });

        setShowCommentForm({
            ...showCommentForm,
            isExposed: false
        });
    }

    const hideChildComments = (parentId) => {
        if (hideNestedComments.hasOwnProperty(parentId)) {
            setHideNestedComments({
                ...hideNestedComments,
                [parentId]: !hideNestedComments[parentId]
            });
        } else {
            setHideNestedComments({
                ...hideNestedComments,
                [parentId]: true
            });
        }
    }

    const renderButton = (parentComment) => (
        parentComment.totalRepliesCount > 0 && parentComment.allIds.length < parentComment.totalRepliesCount ? (
            <button className="text-link" type="button" onClick={e => fetchNestedComments(parentComment.id, parentComment.replyPage)}>{<FontAwesomeIcon icon="arrow-down" />} show {parentComment.totalRepliesCount - (parentComment.allIds.length)} more replies</button>
        ) : (null)
    )

    const commentCreateEdit = (commentOptions, commentFormOptions) => {
        setComment(commentOptions);

        setShowCommentForm(commentFormOptions);
    }

    const deleteComment = (commentId, commentType, parentId = undefined) => (
        props.deleteBugComment({
            url: `/projects/${props.currentProjectId}/bugs/${props.bugId}/comments/${commentId}`,
            commentType: commentType,
            parentId: parentId
        })
    )

    return (
        <div className="option-container bug-container">
            {
                showDeleteForm ? (
                    <DeleteForm
                        deleteAction={() => props.deleteBug({ url: `/projects/${props.currentProjectId}/bugs/${props.bugId}` })}
                        newPath={`/projects/${props.currentProjectId}/bugs`}
                        closeForm={() => setshowDeleteForm(false)}
                        confirmationText="Confirm Bug Deletion"
                    />
                ) : (null)
            }

            {
                Number.isInteger(expandPhoto) ? (
                    <div className="expand-photo-container">
                        <div>
                            <img className="bug-photo" srcSet={props.bug.photos[expandPhoto].preview} />
                        </div>
                        <button className="exit-icon-button" type="button" onClick={() => setExpandPhoto(undefined)}>
                            <FontAwesomeIcon className="exit-icon" icon="times-circle" />
                        </button>
                    </div>
                ) : (null)
            }

            {
                toggleBugForm ? (
                    <BugFormContainer 
                        isUpdate={true} 
                        currentBugId={props.bugId} 
                        bugProperties={props.bug} 
                        closeForm={() => setToggleBugForm(false)}
                    />
                ) : ( 
                    props.bugBeingFetched ? (
                        <Loading size="large-spinner" />
                    ) : (
                        props.bugFetchFailed ? (
                            <RefetchButton refetchAction={fetchBug} />
                        ) : (
                            <>
                                <div className="bug-properties">
                                    <header className="bug-properties-header">
                                        <div className="bug-properties-header-first-half">
                                            <div>
                                                <button type="button" onClick={() => setHideContent({ ...hideContent, title: !hideContent.title })}>
                                                    <h1>Title:</h1>
                                                    <FontAwesomeIcon className={`arrow ${hideContent.title ? ("rotate") : ("")}`} icon="arrow-circle-right"/>
                                                </button>
                                                <span className={`${hideContent.title ? ("hidden") : ("")}`}>
                                                    {props.bug.title}
                                                </span>
                                            </div>

                                            <div>
                                                <h1>Status:</h1>
                                                <span>
                                                    {props.bug.status}
                                                </span>
                                            </div>

                                            <div>
                                                <h1>Priority:</h1>
                                                <span>
                                                    {props.bug.priority}
                                                </span>
                                            </div>

                                            <div>
                                                <h1>Severity:</h1>
                                                <span>
                                                    {props.bug.severity}
                                                </span>
                                            </div>

                                            <div>
                                                <h1>Buggers:</h1>

                                                {
                                                    props.bug.buggers.allIds.length > 0 ? (
                                                        <ul className="buggers-list">{
                                                            props.bug.buggers.allIds.map((buggerId) => (
                                                                <li className="buggers-list-item" key={buggerId}>
                                                                    <h1 className="bugger-username">{props.bug.buggers.byId[buggerId].username}</h1>
                                                                </li>
                                                            ))
                                                        }</ul>
                                                    ) : (
                                                        <span>
                                                            No one is attending this bug!
                                                        </span>
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="bug-properties-header-second-half">
                                            <div>
                                                <h1>Submitter:</h1>
                                                <span>
                                                    {props.bug.submitter.username}
                                                </span>
                                            </div>

                                            <div>
                                                <h1>Opened:</h1>
                                                <span>
                                                    {props.bug.created_at}
                                                </span>
                                            </div>

                                            <div>
                                                <h1>Closed:</h1>
                                                <span>
                                                    {
                                                        props.bug.close_date != null ? (props.bug.close_date) : ("ongoing")
                                                    }
                                                </span>
                                            </div>

                                            <div>
                                                <h1>Updated:</h1>
                                                <span>
                                                    {props.bug.updated_at}
                                                </span>
                                            </div>

                                            <div>
                                                <h1>Dead Line:</h1>
                                                <span>
                                                    {props.bug.dead_line}
                                                </span>
                                            </div>
                                        </div>
                                    </header>

                                    <div className="bug-properties-main-content">
                                        {
                                            [
                                                "description", "steps", "expected_result",
                                                "actual_result", "testing_version", "platform",
                                                "url", "environment", "components"
                                            ].map((option, ind) => (
                                                <div key={ind}>
                                                    <button type="button" onClick={() => setHideContent({ ...hideContent, [option]: !hideContent[option] })}>
                                                        <h1>{
                                                                option.split("_").map((word) => capitalize(word)).join(" ")
                                                        }:</h1>
                                                        <FontAwesomeIcon className={`arrow ${hideContent[option] ? ("rotate") : ("")}`} icon="arrow-circle-right" />
                                                    </button>
                                                    <span className={`${hideContent[option] ? ("hidden") : ("")}`}>{
                                                        props.bug[option]
                                                    }</span>
                                                </div>
                                            ))
                                        }

                                        <div>
                                            <button type="button" onClick={() => setHideContent({ ...hideContent, "photos": !hideContent["photos"] })}>
                                                <h1>Photos:</h1>
                                                <FontAwesomeIcon className={`arrow ${hideContent["photos"] ? ("rotate") : ("")}`} icon="arrow-circle-right" />
                                            </button>

                                            <span className={`bug-photo-span ${hideContent["photos"] ? ("hidden") : ("")}`}>{
                                                props.bug.photos.length > 0 ? (
                                                    <div className="bug-photos-container">{
                                                        props.bug.photos.map((photo, ind) => (
                                                            <button className="bug-photo-button" onClick={() => setExpandPhoto(ind)} key={ind}>
                                                                <img className="bug-photo" srcSet={photo.preview} />
                                                            </button>
                                                        ))
                                                    }</div>
                                                ) : (
                                                    "No photos are currently attached!"
                                                )
                                            }</span>
                                        </div>

                                        <div className="bug-activities">
                                            <button type="button" onClick={() => setHideContent({ ...hideContent, "activity": !hideContent["activity"] })}>
                                                <h1>Activity</h1>
                                                <FontAwesomeIcon className={`arrow ${hideContent["activity"] ? ("rotate") : ("")}`} icon="arrow-circle-right" />
                                            </button>
                                            
                                            <div className={`bug-activities-container ${hideContent["activity"] ? ("hidden") : ("")}`}>{
                                                props.bugActivitiesFetchFailed ? (
                                                    <RefetchButton refetchAction={() => fetchNewActivityPage({ currentActivityPage })} />
                                                ) : (
                                                    props.bugActivitiesBeingFetched ? (
                                                        <Loading size="large-spinner" />
                                                    ) : (
                                                        props.allBugActivitiesIds.length > 0 ? (
                                                            <ul className="bug-activities-list">{
                                                                props.allBugActivitiesIds.map((activityId) => (
                                                                    <li className="bug-activities-list-item" key={activityId}>{
                                                                        props.byActivityId[activityId].activity
                                                                    }</li>
                                                                ))
                                                            }</ul>
                                                        ) : (
                                                            <PageFiller string="No activity has been recorded!" icon="history" />
                                                        )
                                                    )
                                                )}
                                                {
                                                    props.totalBugActivities <= 10 || props.allBugActivitiesIds.length >= props.totalBugActivities ? (null) : (
                                                        <ReactPaginate
                                                            containerClassName="pagination-list"
                                                            pageCount={props.totalBugActivities / 10}
                                                            pageRangeDisplayed={3}
                                                            marginPagesDisplayed={2}
                                                            previousLabel={<FontAwesomeIcon icon="arrow-left" />}
                                                            nextLabel={<FontAwesomeIcon icon="arrow-right" />}
                                                            onPageChange={fetchNewActivityPage}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="bug-comments">
                                            <button type="button" onClick={() => setHideContent({ ...hideContent, "comment": !hideContent["comment"] })}>
                                                <h1>Comments</h1>
                                                <FontAwesomeIcon className={`arrow ${hideContent["comment"] ? ("rotate") : ("")}`} icon="arrow-circle-right" />
                                            </button>

                                            <div className={`bug-comments-container ${hideContent["comment"] ? ("hidden") : ("")}`}>
                                                <div className="parent-comment-form">
                                                    {
                                                        props.canCurrentUserComment ? (
                                                                showCommentForm.isExposed && showCommentForm.commentFormIsFor === undefined ? (
                                                                    <form onSubmit={submitComment}>
                                                                        <div>
                                                                            <ErrorListItem errors={props.commentErrors} />
                                                                            <textarea
                                                                                className={`input-field ${props.commentErrors ? ("field-error-emphasization") : ("")}`} 
                                                                                name="text-area-comment" 
                                                                                id="text-area-comment" 
                                                                                cols="30" 
                                                                                rows="10" 
                                                                                value={comment.comment} 
                                                                                onChange={logComment}
                                                                                autoFocus
                                                                                placeholder="Adding to the bug discussion...">
                                                                            </textarea>
                                                                        </div>
                                                                        <span>{300 - comment.comment.length} characters left</span>

                                                                        <div className="modify-bug-buttons">
                                                                            <SubmitButtonContainer
                                                                                submitValue="submit"
                                                                                anyEmptyFields={anyEmptyFields(comment.comment) || comment.comment.length > 300}
                                                                            />
                                                                            <button className="form-submit-button" type="button" onClick={eraseComment}>cancel</button>
                                                                        </div>
                                                                    </form>
                                                                ) : (
                                                                    <button className="form-submit-button" type="button" onClick={e => commentCreateEdit(
                                                                        {
                                                                            comment: "",
                                                                            action: "create",
                                                                            type: "parent"
                                                                        }, {
                                                                            commentFormIsFor: undefined,
                                                                            isExposed: true
                                                                        }
                                                                    )}>create comment</button>
                                                                )
                                                        ) : (null)
                                                    }
                                                </div>
                                                {
                                                    props.allBugCommentsIds.length > 0 ? (
                                                        <div className="bug-parents-comments-container" ref={commentsListRef}>
                                                            <ul className="bug-parents-comments-list">{
                                                                props.allBugCommentsIds.map((parentId) => {
                                                                    const parentComment = props.byCommentsId[parentId];
                                                                    const parentUsername = parentComment.submitter.username;
                                                                    const isParentFormExposed = showCommentForm.isExposed && showCommentForm.commentFormIsFor === parentId;
                                                                    const isParentDeleteFormExposed = exposeCommentDeleteForm.isExposed && exposeCommentDeleteForm.isFor === parentId;

                                                                    return (
                                                                        <li className="bug-comments-list-item" key={parentId}>
                                                                            <div>
                                                                                <div className="user-avatar-small-container">
                                                                                    <img srcSet={parentComment.photoURL} />
                                                                                </div>
                                                                                <h1>
                                                                                    {parentUsername}
                                                                                </h1>
                                                                                <span>{parentComment.created_at} {parentComment.wasUpdated ? ("(edited)") : ("")}</span>
                                                                            </div>

                                                                            {
                                                                                isParentFormExposed && comment.action === "update" ? (
                                                                                    <form onSubmit={submitComment}>
                                                                                        <div>
                                                                                            <ErrorListItem errors={props.commentErrors} />
                                                                                            <textarea
                                                                                                className={`input-field ${props.commentErrors ? ("field-error-emphasization") : ("")}`}
                                                                                                name="text-area-comment"
                                                                                                id="text-area-comment"
                                                                                                cols="30"
                                                                                                rows="10"
                                                                                                value={comment.comment}
                                                                                                onChange={logComment}
                                                                                                autoFocus
                                                                                                placeholder={`What do you want to say to ${parentUsername}?`}>
                                                                                            </textarea>
                                                                                            <span>{
                                                                                                comment.action === "update" ? (
                                                                                                    "updating comment..."
                                                                                                ) : (
                                                                                                        `responding to ${parentUsername}...`
                                                                                                    )
                                                                                            }</span>
                                                                                        </div>
                                                                                        <span>{300 - comment.comment.length} characters left</span>

                                                                                        <div className="modify-bug-buttons">
                                                                                            <SubmitButtonContainer
                                                                                                submitValue="submit"
                                                                                                anyEmptyFields={comment.comment.trim().length <= 0}
                                                                                            />
                                                                                            <button className="form-submit-button" type="button" onClick={eraseComment}>cancel</button>
                                                                                        </div>
                                                                                    </form>
                                                                                ) : (<span className="parent-comment">{parentComment.comment}</span>)
                                                                            }

                                                                            <div className="comment-button-options">
                                                                                <div>
                                                                                    {
                                                                                        props.canCurrentUserComment ? (
                                                                                            <>
                                                                                                {
                                                                                                    props.isCommentOwner(parentComment.submitter.id) && !isParentDeleteFormExposed ? (
                                                                                                        <button className="text-link" type="button" onClick={(e) => commentCreateEdit(
                                                                                                            {
                                                                                                                comment: parentComment.comment,
                                                                                                                action: "update",
                                                                                                                type: "parent",
                                                                                                                currentCommentId: parentId,
                                                                                                                parentId: parentComment.parent_id,
                                                                                                                replyCommentId: parentComment.id
                                                                                                            }, {
                                                                                                            commentFormIsFor: parentId,
                                                                                                            isExposed: true
                                                                                                        }
                                                                                                        )}>edit</button>
                                                                                                    ) : (null)
                                                                                                }
                                                                                                {
                                                                                                    props.isProjectOrObjectOwner(parentComment.submitter.id, props.bug.submitter.id) ? (
                                                                                                        isParentDeleteFormExposed ? (
                                                                                                            <div className="comment-button-options">
                                                                                                                <div>
                                                                                                                    delete comment <button className="text-link" type="button" onClick={e => 
                                                                                                                        deleteComment(parentId, "parent").then(
                                                                                                                            () => fetchExtraComments(true),
                                                                                                                            (errors) => errors
                                                                                                                        )
                                                                                                                    }>yes</button>/
                                                                                                                    <button className="text-link" type="button" onClick={e => setExposeCommentDeleteForm({ isExposed: false, isFor: undefined })}>no</button>?
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        ) : (
                                                                                                            <button className="text-link" type="button" onClick={e => setExposeCommentDeleteForm({ isExposed: true, isFor: parentId })}>delete</button>
                                                                                                        )
                                                                                                    ) : (null)
                                                                                                }

                                                                                                {
                                                                                                    !isParentDeleteFormExposed ? (
                                                                                                        <button className="text-link" type="button" onClick={() => commentCreateEdit(
                                                                                                            {
                                                                                                                comment: "",
                                                                                                                action: "create",
                                                                                                                type: "reply",
                                                                                                                parentId: parentComment.id,
                                                                                                                replyCommentId: parentComment.id
                                                                                                            }, {
                                                                                                            commentFormIsFor: parentId,
                                                                                                            isExposed: true,
                                                                                                        }
                                                                                                        )}>reply</button>
                                                                                                    ) : (null)
                                                                                                }
                                                                                            </>
                                                                                        ) : (null)
                                                                                    }

                                                                                    {
                                                                                        parentComment.allIds.length > 0 && !isParentDeleteFormExposed ? (
                                                                                            <button
                                                                                                className="text-link"
                                                                                                onClick={e => hideChildComments(parentId)}
                                                                                            >
                                                                                                {
                                                                                                    hideNestedComments[parentId] ? (
                                                                                                        <>
                                                                                                            <FontAwesomeIcon className="comment-hide-options" icon="arrow-down" />
                                                                                                            show
                                                                                                        </>
                                                                                                    ) : (
                                                                                                        <>
                                                                                                            <FontAwesomeIcon className="comment-hide-options" icon="arrow-up" />
                                                                                                            hide
                                                                                                        </>
                                                                                                    )
                                                                                                }
                                                                                &nbsp;replies
                                                                                            </button>
                                                                                        ) : (null)
                                                                                    }
                                                                                </div>
                                                                                {
                                                                                    props.canCurrentUserComment ? (
                                                                                        isParentFormExposed && comment.action != "update" ? (
                                                                                            <form onSubmit={submitComment}>
                                                                                                <div>
                                                                                                    <ErrorListItem errors={props.commentErrors} />
                                                                                                    <textarea
                                                                                                        className={`input-field ${props.commentErrors ? ("field-error-emphasization") : ("")}`}
                                                                                                        name="text-area-comment"
                                                                                                        id="text-area-comment"
                                                                                                        cols="30"
                                                                                                        rows="10"
                                                                                                        value={comment.comment}
                                                                                                        onChange={logComment}
                                                                                                        autoFocus
                                                                                                        placeholder={`What do you want to say to ${parentUsername}?`}>
                                                                                                    </textarea>
                                                                                                    <span>{
                                                                                                        comment.action === "update" ? (
                                                                                                            "updating comment..."
                                                                                                        ) : (
                                                                                                                `responding to ${parentUsername}...`
                                                                                                            )
                                                                                                    }</span>
                                                                                                </div>
                                                                                                <span>{300 - comment.comment.length} characters left</span>

                                                                                                <div className="modify-bug-buttons">
                                                                                                    <SubmitButtonContainer
                                                                                                        submitValue="submit"
                                                                                                        anyEmptyFields={comment.comment.trim().length <= 0}
                                                                                                    />
                                                                                                    <button className="form-submit-button" type="button" onClick={eraseComment}>cancel</button>
                                                                                                </div>
                                                                                            </form>
                                                                                        ) : (null)
                                                                                    ) : (null)
                                                                                }
                                                                            </div>

                                                                            {
                                                                                parentComment.allIds.length > 0 ? (
                                                                                    <ul className={`bug-children-comments-list ${hideNestedComments[parentId] ? ("hidden") : ("")}`} ref={nestedCommentsRef}>
                                                                                        {
                                                                                            parentComment.allIds.map((nestedCommentId) => {
                                                                                                const childComment = parentComment.byId[nestedCommentId];
                                                                                                const childUsername = childComment.submitter.username;
                                                                                                const isReponseToChild = parentComment.id != childComment.reply_comment_id;
                                                                                                const isChildFormExposed = showCommentForm.isExposed && showCommentForm.commentFormIsFor === nestedCommentId;
                                                                                                const isChildDeleteFormExposed = exposeCommentDeleteForm.isExposed && exposeCommentDeleteForm.isFor === nestedCommentId;

                                                                                                return (
                                                                                                    <li className="bug-comments-list-item" key={nestedCommentId}>
                                                                                                        <div>
                                                                                                            <div className="user-avatar-small-container">
                                                                                                                <img srcSet={childComment.photoURL} />
                                                                                                            </div>
                                                                                                            <h1>
                                                                                                                {childUsername}
                                                                                                            </h1>
                                                                                                            <span>{childComment.created_at} {childComment.wasUpdated ? ("(edited)") : ("")}</span>
                                                                                                        </div>

                                                                                                        {
                                                                                                            isReponseToChild ? (
                                                                                                                <span className="response-preview">
                                                                                                                    <FontAwesomeIcon icon="angle-double-right" />&nbsp;
                                                                                                                    <span>{
                                                                                                                        parentComment.byId[childComment.reply_comment_id].comment
                                                                                                                    }</span>
                                                                                                                </span>
                                                                                                            ) : (null)
                                                                                                        }

                                                                                                        <span className="child-comment" id={`${isChildFormExposed && comment.action === "update" ? ("reset-margin-left") : (null)}`}>
                                                                                                            {
                                                                                                                isReponseToChild ? (
                                                                                                                    <b>@{parentComment.byId[childComment.reply_comment_id].submitter.username} </b>
                                                                                                                ) : (null)
                                                                                                            }

                                                                                                            {
                                                                                                                isChildFormExposed && comment.action === "update" ? (
                                                                                                                    <form onSubmit={submitComment}>
                                                                                                                        <div>
                                                                                                                            <ErrorListItem errors={props.commentErrors} />
                                                                                                                            <textarea
                                                                                                                                className={`input-field ${props.commentErrors ? ("field-error-emphasization") : ("")}`}
                                                                                                                                name="text-area-comment"
                                                                                                                                id="text-area-comment"
                                                                                                                                cols="30"
                                                                                                                                rows="10"
                                                                                                                                value={comment.comment}
                                                                                                                                onChange={logComment}
                                                                                                                                autoFocus
                                                                                                                                placeholder={`What do you want to say to ${childUsername}?`}>
                                                                                                                            </textarea>
                                                                                                                            <span>{
                                                                                                                                comment.action === "update" ? (
                                                                                                                                    "updating comment..."
                                                                                                                                ) : (`responding to ${childUsername}...`)
                                                                                                                            }</span>
                                                                                                                        </div>

                                                                                                                        <span>{300 - comment.comment.length} characters left</span>

                                                                                                                        <div className="modify-bug-buttons">
                                                                                                                            <SubmitButtonContainer
                                                                                                                                submitValue="submit"
                                                                                                                                anyEmptyFields={comment.comment.trim().length <= 0}
                                                                                                                            />
                                                                                                                            <button className="form-submit-button" type="button" onClick={eraseComment}>cancel</button>
                                                                                                                        </div>
                                                                                                                    </form>
                                                                                                                ) : (childComment.comment)
                                                                                                            }
                                                                                                        </span>

                                                                                                        <div className="comment-button-options">
                                                                                                            <div>
                                                                                                                {
                                                                                                                    props.canCurrentUserComment ? (
                                                                                                                        <>
                                                                                                                            {
                                                                                                                                props.isCommentOwner(childComment.submitter.id) && !isChildDeleteFormExposed ? (
                                                                                                                                    <button className="text-link" type="button" onClick={(e) => commentCreateEdit(
                                                                                                                                        {
                                                                                                                                            comment: childComment.comment,
                                                                                                                                            action: "update",
                                                                                                                                            type: "reply",
                                                                                                                                            currentCommentId: nestedCommentId,
                                                                                                                                            parentId: parentComment.id,
                                                                                                                                            replyCommentId: childComment.id,
                                                                                                                                        }, {
                                                                                                                                        commentFormIsFor: nestedCommentId,
                                                                                                                                        isExposed: true,
                                                                                                                                    }
                                                                                                                                    )}>edit</button>
                                                                                                                                ) : (null)
                                                                                                                            }

                                                                                                                            {
                                                                                                                                props.isProjectOrObjectOwner(childComment.submitter.id, props.bug.submitter.id) ? (
                                                                                                                                    isChildDeleteFormExposed ? (
                                                                                                                                        <div className="comment-button-options">
                                                                                                                                            <div>
                                                                                                                                                delete comment <button className="text-link" type="button" onClick={e =>
                                                                                                                                                    deleteComment(nestedCommentId, "reply", parentId).then(
                                                                                                                                                        () => fetchNestedComments(parentComment.id, parentComment.replyPage, true),
                                                                                                                                                        (errors) => errors
                                                                                                                                                    )
                                                                                                                                                }>yes</button>/
                                                                                                                                <button className="text-link" type="button" onClick={e => setExposeCommentDeleteForm({ isExposed: false, isFor: undefined })}>no</button>?
                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                    ) : (
                                                                                                                                            <button className="text-link" type="button" onClick={e => setExposeCommentDeleteForm({ isExposed: true, isFor: nestedCommentId })}>delete</button>
                                                                                                                                        )
                                                                                                                                ) : (null)
                                                                                                                            }

                                                                                                                            {
                                                                                                                                !isChildDeleteFormExposed ? (
                                                                                                                                    <button className="text-link" type="button" onClick={() => commentCreateEdit(
                                                                                                                                        {
                                                                                                                                            comment: "",
                                                                                                                                            action: "create",
                                                                                                                                            type: "reply",
                                                                                                                                            parentId: parentComment.id,
                                                                                                                                            replyCommentId: childComment.id,
                                                                                                                                        }, {
                                                                                                                                        commentFormIsFor: nestedCommentId,
                                                                                                                                        parentId: nestedCommentId,
                                                                                                                                        replyCommentId: nestedCommentId,
                                                                                                                                        isExposed: true,
                                                                                                                                    }
                                                                                                                                    )}>reply</button>
                                                                                                                                ) : (null)
                                                                                                                            }
                                                                                                                        </>
                                                                                                                    ) : (null)
                                                                                                                }
                                                                                                            </div>
                                                                                                            {
                                                                                                                props.canCurrentUserComment ? (
                                                                                                                    isChildFormExposed && comment.action != "update" ? (
                                                                                                                        <form onSubmit={submitComment}>
                                                                                                                            <div>
                                                                                                                                <ErrorListItem errors={props.commentErrors} />
                                                                                                                                <textarea
                                                                                                                                    className={`input-field ${props.commentErrors ? ("field-error-emphasization") : ("")}`}
                                                                                                                                    name="text-area-comment"
                                                                                                                                    id="text-area-comment"
                                                                                                                                    cols="30"
                                                                                                                                    rows="10"
                                                                                                                                    value={comment.comment}
                                                                                                                                    onChange={logComment}
                                                                                                                                    autoFocus
                                                                                                                                    placeholder={`What do you want to say to ${childUsername}?`}>
                                                                                                                                </textarea>
                                                                                                                                <span>{
                                                                                                                                    comment.action === "update" ? (
                                                                                                                                        "updating comment..."
                                                                                                                                    ) : (
                                                                                                                                            `responding to ${childUsername}...`
                                                                                                                                        )
                                                                                                                                }</span>
                                                                                                                            </div>

                                                                                                                            <span>{300 - comment.comment.length} characters left</span>

                                                                                                                            <div className="modify-bug-buttons">
                                                                                                                                <SubmitButtonContainer
                                                                                                                                    submitValue="submit"
                                                                                                                                    anyEmptyFields={comment.comment.trim().length <= 0}
                                                                                                                                />
                                                                                                                                <button className="form-submit-button" type="button" onClick={eraseComment}>cancel</button>
                                                                                                                            </div>
                                                                                                                        </form>
                                                                                                                    ) : (null)
                                                                                                                ) : (null)
                                                                                                            }
                                                                                                        </div>
                                                                                                    </li>
                                                                                                )
                                                                                            })
                                                                                        }
                                                                                    </ul>
                                                                                ) : (null)
                                                                            }

                                                                            {/*
                                                                                "show x more replies" should not be rendered unless 
                                                                                the nested comments are being shown and the nested comments fetch 
                                                                                did not fail or the nested comments are not currently being fetched.
                                                                                this goes for the try again button except the try again but will only show when the nested
                                                                                comments are shown and the comments fetch failed.
                                                                            */}
                                                                            {
                                                                                !hideNestedComments[parentId] ? (
                                                                                    commentsLayerFetch.parentId != parentId ? (
                                                                                        renderButton(parentComment)
                                                                                    ) : (
                                                                                        !extraCommentsBeingFetched && !props.extraCommentsFetchFailed ? (
                                                                                            renderButton(parentComment)
                                                                                        ) : (null)
                                                                                    )
                                                                                ) : (null)
                                                                            }
                                                                            {
                                                                                !hideNestedComments[parentId] ? (
                                                                                    commentsLayerFetch.layer === 1 && commentsLayerFetch.parentId === parentId ? (
                                                                                        <ExtraFetchLoad
                                                                                            onFetchFailProperties={{ isFail: props.extraCommentsFetchFailed, failedAction: () => fetchNestedComments(parentComment.id, parentComment.replyPage) }}
                                                                                            isLoad={extraCommentsBeingFetched}
                                                                                        />
                                                                                    ) : (null)
                                                                                ) : (null)
                                                                            }
                                                                        </li>
                                                                    );
                                                                })
                                                            }</ul>
                                                        </div>
                                                    ) : (
                                                        <PageFiller string="No comments have been made!" icon="comments" />
                                                    )
                                                }
                                                {
                                                    commentsLayerFetch.layer === 0 ? (
                                                        <ExtraFetchLoad
                                                            onFetchFailProperties={{ isFail: props.extraCommentsFetchFailed, failedAction: fetchExtraComments }}
                                                            isLoad={extraCommentsBeingFetched}
                                                        />
                                                    ) : (null)
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {
                                    props.isProjectOrObjectOwner(props.bug.submitter.id) && !toggleBugForm ? (
                                        <div className="modify-bug-buttons">
                                            <div className="edit-bug-button" onClick={e => setToggleBugForm(true)}>
                                                <button className="form-submit-button" type="button">
                                                    edit bug
                                                </button>
                                            </div>

                                            <div className="delete-bug-button" onClick={e => setshowDeleteForm(true)}>
                                                <button className="form-submit-button" type="button">
                                                    delete bug
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        null
                                    )
                                }
                            </>
                        )
                    )
                )
            }
        </div>
    )
}

export default withRouter(Bug);