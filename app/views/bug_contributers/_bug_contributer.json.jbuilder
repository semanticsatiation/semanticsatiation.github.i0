json.extract! bugger, :id, :username
json.photoURL bugger.photo.attached? ? (url_for(bugger.photo)) : ("https://bug-off-dev.s3.us-east-2.amazonaws.com/default-profile-picture.png")