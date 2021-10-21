json.extract! bugger, :id, :username
json.photoURL bugger.photo.attached? ? (url_for(bugger.photo)) : ("https://bug-off-public.s3.us-east-2.amazonaws.com/default_profile_picture.svg")