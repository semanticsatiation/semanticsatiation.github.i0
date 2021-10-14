if @filter_for_buggers
    json.byId do
        @people.with_attached_photo.each do |bugger|
            json.set! bugger.id do
                json.partial! "/bug_contributers/bug_contributer", bugger: bugger
            end
        end
    end

    # for some reason, .ids create duplicate ids like so: [1, 1, 1, 1, 1, 6, 13, 72]
    json.allIds @people.map(&:id)
else 
    json.byId do
        @people.each do |worker|
            json.set! worker.id do
                json.extract! worker, :id, :username, :pending

                json.projectContributerId worker.project_contributer_id
                # email soon
                json.photoURL worker.photo.attached? ? (url_for(worker.photo)) : ("https://bug-off-dev.s3.us-east-2.amazonaws.com/default-profile-picture.png")
            end
        end
    end

    if @recalibrate
        json.allIds(@all_current_people_ids + @people.map(&:id))
    else
        json.allIds @people.map(&:id)
    end

    json.totalPeople @all_people_count 
end