json.id @contributer.id

json.username @contributer.username

json.pending @contribution.pending

json.projectContributerId @contribution.id

json.photoURL @contributer.photo.attached? ? (url_for(@contributer.photo)) : ("https://bug-off-public.s3.us-east-2.amazonaws.com/default_profile_picture.svg")