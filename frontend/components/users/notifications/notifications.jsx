import React, { useEffect, useRef } from 'react';

// util
import { endAllRequests } from '../../../util/shared_util';

// components
import ExtraFetchLoad from '../../shared/extra_fetch_load';
import Loading from '../../shared/loading';
import PageFiller from '../../shared/page_filler';
import RefetchButton from '../../shared/refetch_button';

let extraNotificationsBeingFetched = false;
let allItemsFetched = false;

function Notifications(props) {

    extraNotificationsBeingFetched = props.extraNotificationsBeingFetched;
    allItemsFetched = props.totalSessionNotifications >= props.totalNotifications;

    const notificationListRef = useRef();

    useEffect(() => {
        fetchNotifications().then(
            () => {
                if (notificationListRef.current && !allItemsFetched) {
                    addScroll();
                }
            }
        );

        return () => {
            endAllRequests();

            if (notificationListRef.current) {
                removeScroll();
            }
        }
    }, [])

    const handleScroll = () => {
        if (!extraNotificationsBeingFetched) {
            const pageOffset = notificationListRef.current.scrollTop + notificationListRef.current.clientHeight;

            if (pageOffset >= notificationListRef.current.scrollHeight) {
                fetchExtraNotifications();
            }
        }
    }

    const addScroll = () => {
        notificationListRef.current.addEventListener("scroll", handleScroll);
    }

    const removeScroll = () => {
        notificationListRef.current.removeEventListener("scroll", handleScroll);
    }

    const fetchNotifications = () => (
        props.fetchNotifications({
            url: "/notifications"
        }).then(
            () => {
                if (notificationListRef.current && !allItemsFetched) {
                    addScroll();
                }
            },
            (errors) => errors
        )
    )

    const fetchExtraNotifications = () => (
        props.fetchExtraNotifications({
            url: `/notifications?off_set=${props.page}`
        }).then(
            () => {
                if (notificationListRef.current && allItemsFetched) {
                    removeScroll();
                }
            },
            (errors) => errors
        )
    )

    const respondToInvite = (response, notif) => {
        const projectId = notif.link.split("/")[2]

        const action = response == "yes" ? (props.acceptInvite) : (props.denyInvite);

        action({
            url: `/projects/${projectId}/project_contributers/${notif.project_contributer_id}?notification_id=${notif.id}`,
            body: {project_contributer: response === "yes" ? ({ pending: false }) : ({})}
        });
    }

    return (
        // DOES INFINTE LOAD WORK FOR THIS???
        // I NEVER TESTED THIS DID I???
        <div className="notification-container option-container notification-container">{
            props.notificationsFetchFailed ? (
                <RefetchButton refetchAction={fetchNotifications} />
            ) : (
                props.notificationsBeingFetched ? (
                    <Loading size="large-spinner" />
                ) : (
                    props.notificationsAllIds.length > 0 ? (
                        <ul className="notification-list">{
                            props.notificationsAllIds.map((notifId) => {
                                const notif = props.getNotification(notifId);

                                return(
                                    notif.action === "addPerson" ? (
                                        <li key={notifId}>{
                                            props.getNotification(notifId).context
                                        }
                                            <span>Do you accept?</span>
                                            <div className="modify-bug-buttons">
                                                <button type="button" className="form-submit-button" onClick={e => respondToInvite("yes", notif)}>yes</button>
                                                <button type="button" className="form-submit-button" onClick={e => respondToInvite("no", notif)}>no</button>
                                            </div>
                                            
                                        </li>
                                    ) : (
                                        <li key={notifId}>{props.getNotification(notifId).context}</li>
                                    )
                                )
                            })
                        }</ul>
                    ) : (
                        <PageFiller string="No notifications so far!" icon="bell-slash" />
                    )
                )
            )
        }

            <ExtraFetchLoad
                onFetchFailProperties={{ isFail: props.extraNotificationsFetchFailed, failedAction: fetchExtraNotifications }}
                isLoad={props.extraNotificationsBeingFetched}
            />
        </div>
    )
}

export default Notifications;