json.bug bug

if bug.photos.attached?
    json.photoURLs bug.photos.map{|photo| url_for(photo)}
end