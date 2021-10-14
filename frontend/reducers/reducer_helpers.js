export const sortObjects = (objectOne, objectTwo, sortBy) => {
    const objectNameOne = objectOne.name;
    const objectNameTwo = objectTwo.name;

    if (sortBy === "name") {
        if (objectNameOne.toLowerCase() != objectNameTwo.toLowerCase()) {
            return objectNameOne.toLowerCase() < objectNameTwo.toLowerCase();
        }

        if (objectNameOne != objectNameTwo) {
            return objectNameOne < objectNameTwo;
        }

        return objectOne.id < objectTwo.id;
    } else if (sortBy === "name alt") {
        if (objectNameOne.toLowerCase() != objectNameTwo.toLowerCase()) {
            return objectNameOne.toLowerCase() > objectNameTwo.toLowerCase();
        }

        if (objectNameOne != objectNameTwo) {
            return objectNameOne > objectNameTwo;
        }

        return objectOne.id > objectTwo.id;
    } else {
        // join date is for contributed projects since contributed projects will not be ordered by
        // project creation dates but instead ordered by the date the user joined them 
        if (objectOne.hasOwnProperty("joinDate") && objectTwo.hasOwnProperty("joinDate")) {
            if (objectOne.joinDate != objectTwo.joinDate) {
                return new Date(objectOne.joinDate) > new Date(objectTwo.joinDate);
            }
        } else {
            if (objectOne.created_at != objectTwo.created_at) {
                return new Date(objectOne.created_at) > new Date(objectTwo.created_at);
            }
        }

        return objectOne.id > objectTwo.id;
    }

}

export const recalibrateSort = (getObject, allIds, object, sortBy, toBeSorted) => {
    let index;
    let newObjectId = object.id;

    let falseSort;

    index = allIds.findIndex((currentObjectId) => {
        let result = sortObjects(object, getObject(currentObjectId), sortBy);

        if (result && toBeSorted.includes(currentObjectId)) {
            falseSort = true;
        }
            
        return result;
    });

    if (index >= 0) {
        if (falseSort) {
            toBeSorted.splice(toBeSorted.findIndex((currentObjectId) => sortObjects(object, getObject(currentObjectId), sortBy)), 0, newObjectId);
        }

        allIds.splice(index, 0, newObjectId);
    } else if (index === -1) {
        const indexTwo = toBeSorted.findIndex((currentObjectId) => sortObjects(object, getObject(currentObjectId), sortBy));

        if (indexTwo >= 0) {
            toBeSorted.splice(indexTwo, 0, newObjectId);
        } else if (indexTwo === -1) {
            toBeSorted.push(newObjectId);
        }

        allIds.push(newObjectId);
    }
}