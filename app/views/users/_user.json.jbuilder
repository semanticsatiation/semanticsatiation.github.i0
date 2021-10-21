json.extract! user, :id, :username, :biography, :theme
json.photoURL user.photo.attached? ? (url_for(user.photo)) : ("https://bug-off-public.s3.us-east-2.amazonaws.com/default_profile_picture.svg")